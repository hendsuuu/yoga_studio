import "server-only";

const DEFAULT_AUDIO_PATH_PREFIX = "audio";
const SUPABASE_AUDIO_CONFIG_ERROR =
  "Supabase audio storage is not configured";

type SupabaseAudioStorageConfig = {
  bucket: string;
  objectPrefix: string;
  serviceRoleKey: string;
  url: string;
};

function readEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function getAudioPathPrefix() {
  const rawPrefix = process.env.SUPABASE_AUDIO_PATH_PREFIX;
  if (rawPrefix === undefined) {
    return DEFAULT_AUDIO_PATH_PREFIX;
  }

  return rawPrefix.trim().replace(/^\/+|\/+$/g, "");
}

function encodePathSegments(value: string) {
  return value
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function getSupabaseAudioStorageConfig(): SupabaseAudioStorageConfig {
  const url = readEnv("SUPABASE_URL") ?? readEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey =
    readEnv("SUPABASE_SERVICE_ROLE_KEY") ?? readEnv("SUPABASE_SERVICE_KEY");
  const bucket =
    readEnv("SUPABASE_AUDIO_BUCKET") ?? readEnv("SUPABASE_STORAGE_BUCKET");

  if (!url || !serviceRoleKey || !bucket) {
    throw new Error(SUPABASE_AUDIO_CONFIG_ERROR);
  }

  return {
    url: url.replace(/\/+$/, ""),
    serviceRoleKey,
    bucket,
    objectPrefix: getAudioPathPrefix(),
  };
}

function buildStorageUrl(baseUrl: string, pathname: string) {
  return new URL(pathname, `${baseUrl}/storage/v1/`).toString();
}

function getAuthHeaders(serviceRoleKey: string, extra?: HeadersInit) {
  const headers = new Headers(extra);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  headers.set("apikey", serviceRoleKey);
  return headers;
}

export function buildManagedAudioUrl(filename: string) {
  return `/api/audio/${encodeURIComponent(filename)}`;
}

export function getManagedAudioObjectPath(filename: string) {
  const { objectPrefix } = getSupabaseAudioStorageConfig();
  return objectPrefix ? `${objectPrefix}/${filename}` : filename;
}

export function isSupabaseAudioStorageConfigError(error: unknown) {
  return (
    error instanceof Error && error.message === SUPABASE_AUDIO_CONFIG_ERROR
  );
}

export async function uploadAudioToSupabase(options: {
  buffer: Buffer;
  contentType: string;
  filename: string;
}) {
  const { url, serviceRoleKey, bucket } = getSupabaseAudioStorageConfig();
  const objectPath = getManagedAudioObjectPath(options.filename);

  const response = await fetch(
    buildStorageUrl(
      url,
      `object/${encodeURIComponent(bucket)}/${encodePathSegments(objectPath)}`,
    ),
    {
      method: "POST",
      headers: getAuthHeaders(serviceRoleKey, {
        "Content-Type": options.contentType || "application/octet-stream",
        "x-upsert": "true",
      }),
      body: new Uint8Array(options.buffer),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Gagal mengupload audio ke Supabase");
  }

  return { objectPath };
}

export async function deleteAudioFromSupabase(filename: string) {
  const { url, serviceRoleKey, bucket } = getSupabaseAudioStorageConfig();
  const objectPath = getManagedAudioObjectPath(filename);

  const response = await fetch(
    buildStorageUrl(
      url,
      `object/${encodeURIComponent(bucket)}/${encodePathSegments(objectPath)}`,
    ),
    {
      method: "DELETE",
      headers: getAuthHeaders(serviceRoleKey),
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return false;
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(body || "Gagal menghapus audio dari Supabase");
  }

  return true;
}

export async function fetchAudioFromSupabase(
  filename: string,
  options?: {
    method?: "GET" | "HEAD";
    range?: string | null;
  },
) {
  const { url, serviceRoleKey, bucket } = getSupabaseAudioStorageConfig();
  const objectPath = getManagedAudioObjectPath(filename);
  const endpoint =
    options?.method === "HEAD" ? "object/info" : "object/authenticated";
  const extraHeaders =
    options?.method === "GET" && options.range
      ? { Range: options.range }
      : undefined;

  const response = await fetch(
    buildStorageUrl(
      url,
      `${endpoint}/${encodeURIComponent(bucket)}/${encodePathSegments(objectPath)}`,
    ),
    {
      method: options?.method ?? "GET",
      headers: getAuthHeaders(serviceRoleKey, extraHeaders),
      cache: "no-store",
      redirect: "follow",
    },
  );

  return response;
}
