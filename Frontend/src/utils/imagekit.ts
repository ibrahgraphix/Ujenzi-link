const IK_ENDPOINT =
  ((import.meta as any).env?.VITE_IMAGEKIT_URL_ENDPOINT as string) || '';

export interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
}

/**
 * Apply ImageKit URL transformation for responsive thumbnails.
 * Non-ImageKit URLs are returned unchanged.
 */
export function getImageKitUrl(url: string, options: ImageTransformOptions = {}): string {
  if (!url) return url;

  const isImageKit =
    url.includes('ik.imagekit.io') || (IK_ENDPOINT && url.startsWith(IK_ENDPOINT));

  if (!isImageKit) return url;

  const parts: string[] = [];
  if (options.width) parts.push(`w-${options.width}`);
  if (options.height) parts.push(`h-${options.height}`);
  parts.push('c-at_max');
  parts.push(`q-${options.quality ?? 80}`);
  parts.push('f-auto');

  const transform = parts.join(',');

  const match = url.match(/^(https:\/\/ik\.imagekit\.io\/[^/]+)(\/.*)$/);
  if (!match) return url;

  const [, base, path] = match;
  const cleanPath = path.replace(/^\/tr:[^/]+/, '');
  return `${base}/tr:${transform}${cleanPath}`;
}

export const IMAGE_SIZES = {
  thumbnail: { width: 300, quality: 75 },
  card: { width: 400, quality: 80 },
  detail: { width: 1200, quality: 85 },
  logo: { width: 150, quality: 80 },
  avatar: { width: 80, quality: 75 },
} as const;

export function thumbnailUrl(url: string): string {
  return getImageKitUrl(url, IMAGE_SIZES.thumbnail);
}

export function cardImageUrl(url: string): string {
  return getImageKitUrl(url, IMAGE_SIZES.card);
}

export function detailImageUrl(url: string): string {
  return getImageKitUrl(url, IMAGE_SIZES.detail);
}

export function logoImageUrl(url: string): string {
  return getImageKitUrl(url, IMAGE_SIZES.logo);
}
