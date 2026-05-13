export function getAvatarUrl(
  name: string,
  photo?: string | null,
  size = 64,
): string {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name,
  )}&background=C08497&color=fff&size=${size}&format=png`;

  if (!photo) return fallback;

  try {
    const url = new URL(photo);
    if (url.hostname === "ui-avatars.com") {
      url.searchParams.set("format", "png");
      if (!url.searchParams.has("size")) {
        url.searchParams.set("size", String(size));
      }
      return url.toString();
    }
  } catch {
    return fallback;
  }

  return photo;
}
