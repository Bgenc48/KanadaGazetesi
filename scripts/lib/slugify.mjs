/**
 * Türkçe karakterleri doğru çeviren URL slug üretici.
 * "İlk Kanada Kışına Hazırlık" -> "ilk-kanada-kisina-hazirlik"
 */
const MAP = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u', â: 'a', î: 'i', û: 'u',
};

export function slugify(input) {
  return String(input)
    .replace(/[çÇğĞıIİöÖşŞüÜâîû]/g, (ch) => MAP[ch] ?? ch)
    .toLocaleLowerCase('en')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // kalan aksanları temizle
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
