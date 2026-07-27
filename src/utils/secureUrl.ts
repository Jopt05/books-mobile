/**
 * Ensures a URL uses HTTPS.
 * Android blocks cleartext (HTTP) traffic in production builds by default.
 * Google Books image URLs often come as http:// but also work over https://.
 */
export function secureUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  return url.replace('http://', 'https://');
}
