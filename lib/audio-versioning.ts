import { createHash } from "crypto";
import { stat } from "fs/promises";
import path from "path";

const AUDIO_DIR =
  process.env.AUDIO_DIR || path.join(process.cwd(), "public", "audio");

const INTERNAL_AUDIO_PREFIXES = ["/api/audio/", "/audio/"];
const HASH_LENGTH = 12;
const VERSIONED_FILENAME_PATTERN = /--([0-9a-f]{12,64})(\.[^.]+)$/i;

function toAudioSlug(fileName: string) {
  const ext = path.extname(fileName);
  const baseName = path.basename(fileName, ext);

  const slug = baseName
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "audio";
}

function parseAudioUrl(url: string) {
  try {
    return new URL(url, "http://local");
  } catch {
    return null;
  }
}

function formatAudioUrl(parsed: URL, preserveOrigin: boolean) {
  const prefix = preserveOrigin ? `${parsed.protocol}//${parsed.host}` : "";
  const search = parsed.search ? parsed.search : "";
  return `${prefix}${parsed.pathname}${search}`;
}

export function createVersionedAudioFilename(
  originalName: string,
  buffer: Buffer,
) {
  const ext = path.extname(originalName).toLowerCase() || ".mp3";
  const slug = toAudioSlug(originalName);
  const hash = createHash("sha256")
    .update(buffer)
    .digest("hex")
    .slice(0, HASH_LENGTH);

  return `${slug}--${hash}${ext}`;
}

export function extractAudioFilenameFromUrl(url: string) {
  const parsed = parseAudioUrl(url);
  if (!parsed) return null;
  if (!INTERNAL_AUDIO_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix))) {
    return null;
  }

  const filename = parsed.pathname.split("/").filter(Boolean).at(-1);
  return filename ? decodeURIComponent(filename) : null;
}

export function extractVersionFromFilename(filename: string) {
  return filename.match(VERSIONED_FILENAME_PATTERN)?.[1] ?? null;
}

export function isVersionedAudioRequest(
  filename: string,
  searchParams?: URLSearchParams,
) {
  return Boolean(searchParams?.get("v") || extractVersionFromFilename(filename));
}

async function getAudioFileVersion(filename: string) {
  const fileStats = await stat(path.join(AUDIO_DIR, filename));
  return Math.floor(fileStats.mtimeMs).toString(36);
}

export async function normalizeAudioUrl(url: string) {
  const parsed = parseAudioUrl(url);
  if (!parsed) return url;
  if (!INTERNAL_AUDIO_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix))) {
    return url;
  }

  const preserveOrigin = /^https?:\/\//i.test(url);
  if (parsed.searchParams.get("v")) {
    return formatAudioUrl(parsed, preserveOrigin);
  }

  const filename = extractAudioFilenameFromUrl(url);
  if (!filename) return url;

  const hashedVersion = extractVersionFromFilename(filename);
  if (hashedVersion) {
    return formatAudioUrl(parsed, preserveOrigin);
  }

  try {
    parsed.searchParams.set("v", await getAudioFileVersion(filename));
    return formatAudioUrl(parsed, preserveOrigin);
  } catch {
    return url;
  }
}
