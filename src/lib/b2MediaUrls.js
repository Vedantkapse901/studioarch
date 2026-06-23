/**
 * B2 Media URL handling - Like BJNP/EYE10 pattern
 * Store: b2ref://images/123-photo.jpg
 * Display: /api/b2-upload?key=images/123-photo.jpg
 */

function normalizeKey(key) {
  const k = String(key || '')
    .trim()
    .replace(/^\/+/, '');
  if (!k || k.includes('..')) return null;
  return k;
}

/**
 * Extract B2 object key from various formats:
 * - b2ref://images/file.jpg
 * - /api/b2-upload?key=images/file.jpg
 * - Direct path: images/file.jpg
 * - Full B2 URL: https://f004.backblazeb2.com/file/BUCKET/images/file.jpg
 */
export function extractB2ObjectKey(stored) {
  const s = String(stored || '').trim();
  if (!s || s.includes('..')) return null;

  // Handle b2ref:// format
  if (s.startsWith('b2ref://')) {
    return normalizeKey(s.slice('b2ref://'.length));
  }

  // Handle proxy URL format
  if (s.startsWith('/api/b2-upload') || s.includes('/api/b2-upload?')) {
    try {
      const base = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
      const u = new URL(s, base);
      const key = u.searchParams.get('key');
      return key ? normalizeKey(decodeURIComponent(key)) : null;
    } catch {
      return null;
    }
  }

  // Handle plain path format (images/file.jpg)
  if (/^(images|videos|gallery|uploads)\//.test(s)) {
    return normalizeKey(s);
  }

  // Handle full B2 URL
  try {
    const u = new URL(s);
    if (!u.hostname.includes('backblazeb2.com')) return null;
    const marker = '/file/';
    const i = u.pathname.indexOf(marker);
    if (i === -1) return null;
    const rest = u.pathname.slice(i + marker.length);
    const parts = rest.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    // Extract everything after bucket name
    return normalizeKey(parts.slice(1).join('/'));
  } catch {
    return null;
  }
}

/**
 * Build proxy URL for displaying images (/api/b2-upload?key=...)
 */
export function buildB2DisplayUrl(stored) {
  const key = extractB2ObjectKey(stored);
  if (!key) return String(stored || '');
  return `/api/b2-upload?key=${encodeURIComponent(key)}`;
}

/**
 * Build reference format for storing in database
 */
export function toB2StorageRef(fileNameOrPath) {
  const key = extractB2ObjectKey(fileNameOrPath) || normalizeKey(fileNameOrPath);
  if (!key) return '';
  return `b2ref://${key}`;
}
