/** Fotoğraf hattı yapılandırması. */

/** Kahraman görsel hedef genişliği (px) ve JPEG kalitesi. */
export const HERO_WIDTH = 1600;
export const HERO_QUALITY = 82;

/**
 * Ticari kullanıma uygun, atıfla kullanılabilir lisanslar.
 * NC (gayri-ticari) ve ND (türev yasak) lisansları KABUL ETMEYİZ.
 */
export const ALLOWED_LICENSES = new Set([
  'cc0', 'pdm', 'pd', 'public domain',
  'by', 'cc-by', 'cc by',
  'by-sa', 'cc-by-sa', 'cc by-sa',
  'pexels', 'unsplash',
]);

/** Sağlayıcı sırası: anahtarsız olanlar önce; anahtar varsa eklenir. */
export function providerOrder(env = process.env) {
  if (env.PHOTO_PROVIDERS) {
    return env.PHOTO_PROVIDERS.split(',').map((s) => s.trim()).filter(Boolean);
  }
  const order = [];
  if (env.PEXELS_API_KEY) order.push('pexels');
  if (env.UNSPLASH_ACCESS_KEY) order.push('unsplash');
  // Anahtarsız, lisans-bilinçli kaynaklar her zaman yedek:
  order.push('openverse', 'wikimedia');
  return order;
}

/** Bir lisans kodunun izinli olup olmadığını gevşek biçimde kontrol eder. */
export function isLicenseAllowed(license) {
  if (!license) return false;
  const l = String(license).toLowerCase();
  if (l.includes('nc') || l.includes('noncommercial') || l.includes('nd') || l.includes('noderiv')) {
    return false;
  }
  for (const ok of ALLOWED_LICENSES) {
    if (l.includes(ok)) return true;
  }
  return false;
}
