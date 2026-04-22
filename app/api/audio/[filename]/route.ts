import { NextRequest, NextResponse } from "next/server";
import { stat, open } from "fs/promises";
import path from "path";
import { isVersionedAudioRequest } from "@/lib/audio-versioning";
import {
  fetchAudioFromSupabase,
  isSupabaseAudioStorageConfigError,
} from "@/lib/audio-storage";

const AUDIO_DIR =
  process.env.AUDIO_DIR || path.join(process.cwd(), "public", "audio");

const MIME_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".flac": "audio/flac",
  ".webm": "audio/webm",
};

function getContentType(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return MIME_TYPES[ext] || "application/octet-stream";
}

function resolveAudioFilePath(filename: string) {
  const filePath = path.resolve(AUDIO_DIR, filename);
  const relativePath = path.relative(AUDIO_DIR, filePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

function createAudioHeaders(options: {
  cacheControl: string;
  contentLength?: string | null;
  contentRange?: string | null;
  contentType?: string | null;
  etag?: string | null;
  lastModified?: string | null;
}) {
  const headers = new Headers();
  headers.set("Accept-Ranges", "bytes");
  headers.set("Cache-Control", options.cacheControl);

  if (options.contentType) {
    headers.set("Content-Type", options.contentType);
  }
  if (options.contentLength) {
    headers.set("Content-Length", options.contentLength);
  }
  if (options.contentRange) {
    headers.set("Content-Range", options.contentRange);
  }
  if (options.etag) {
    headers.set("ETag", options.etag);
  }
  if (options.lastModified) {
    headers.set("Last-Modified", options.lastModified);
  }

  return headers;
}

async function serveLocalAudio(
  req: NextRequest,
  filePath: string,
  filename: string,
  cacheControl: string,
) {
  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return null;
    }

    const contentType = getContentType(filename);
    const fileSize = fileStat.size;
    const lastModified = fileStat.mtime.toUTCString();

    if (req.method === "HEAD") {
      return new NextResponse(null, {
        headers: createAudioHeaders({
          cacheControl,
          contentLength: fileSize.toString(),
          contentType,
          lastModified,
        }),
      });
    }

    const rangeHeader = req.headers.get("range");

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
      if (!match) {
        return new NextResponse(null, {
          status: 416,
          headers: createAudioHeaders({
            cacheControl,
            contentRange: `bytes */${fileSize}`,
            contentType,
            lastModified,
          }),
        });
      }

      const start = Number.parseInt(match[1], 10);
      const end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        return new NextResponse(null, {
          status: 416,
          headers: createAudioHeaders({
            cacheControl,
            contentRange: `bytes */${fileSize}`,
            contentType,
            lastModified,
          }),
        });
      }

      const chunkSize = end - start + 1;
      const fileHandle = await open(filePath, "r");
      const buffer = Buffer.alloc(chunkSize);
      await fileHandle.read(buffer, 0, chunkSize, start);
      await fileHandle.close();

      return new NextResponse(buffer, {
        status: 206,
        headers: createAudioHeaders({
          cacheControl,
          contentLength: chunkSize.toString(),
          contentRange: `bytes ${start}-${end}/${fileSize}`,
          contentType,
          lastModified,
        }),
      });
    }

    const fileHandle = await open(filePath, "r");
    const stream = fileHandle.createReadStream();
    const webStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (error) => controller.error(error));
      },
      cancel() {
        stream.destroy();
      },
    });

    return new NextResponse(webStream, {
      headers: createAudioHeaders({
        cacheControl,
        contentLength: fileSize.toString(),
        contentType,
        lastModified,
      }),
    });
  } catch {
    return null;
  }
}

async function proxySupabaseAudio(
  req: NextRequest,
  filename: string,
  cacheControl: string,
) {
  const rangeHeader = req.headers.get("range");
  const upstream = await fetchAudioFromSupabase(filename, {
    method: req.method === "HEAD" ? "HEAD" : "GET",
    range: rangeHeader,
  });

  if (upstream.status === 404) {
    return new NextResponse(null, { status: 404 });
  }

  if (!upstream.ok) {
    const body = await upstream.text().catch(() => "");
    console.error("[audio] Supabase proxy failed", {
      body,
      filename,
      method: req.method,
      status: upstream.status,
    });
    return NextResponse.json(
      { error: "Gagal memuat audio dari storage" },
      { status: upstream.status },
    );
  }

  return new NextResponse(req.method === "HEAD" ? null : upstream.body, {
    status: upstream.status,
    headers: createAudioHeaders({
      cacheControl,
      contentLength: upstream.headers.get("content-length"),
      contentRange: upstream.headers.get("content-range"),
      contentType: upstream.headers.get("content-type") || getContentType(filename),
      etag: upstream.headers.get("etag"),
      lastModified: upstream.headers.get("last-modified"),
    }),
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  const searchParams = new URL(req.url).searchParams;

  if (!/^[\w\-.]+$/.test(filename)) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const filePath = resolveAudioFilePath(filename);
  if (!filePath) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const cacheControl = isVersionedAudioRequest(filename, searchParams)
    ? "public, max-age=31536000, immutable"
    : "public, max-age=0, must-revalidate";

  const localResponse = await serveLocalAudio(
    req,
    filePath,
    filename,
    cacheControl,
  );
  if (localResponse) {
    return localResponse;
  }

  try {
    return await proxySupabaseAudio(req, filename, cacheControl);
  } catch (error) {
    if (isSupabaseAudioStorageConfigError(error)) {
      console.error("[audio] Supabase audio storage is not configured");
      return NextResponse.json(
        { error: "Audio storage belum dikonfigurasi" },
        { status: 500 },
      );
    }

    console.error("[audio] Unexpected storage error", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memuat audio" },
      { status: 500 },
    );
  }
}

export const HEAD = GET;
