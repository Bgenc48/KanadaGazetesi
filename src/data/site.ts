/** Site geneli sabitler ve künye bilgileri. */
const useCustomDomain = process.env.KANADA_CUSTOM_DOMAIN === 'true';
const deploymentBase = useCustomDomain ? '' : '/KanadaGazetesi';
const deploymentOrigin = useCustomDomain
  ? 'https://www.kanadagazetesi.com'
  : 'https://bgenc48.github.io';

export const site = {
  name: 'Kanada Gazetesi',
  shortName: 'KG',
  domain: 'kanadagazetesi.com',
  url: `${deploymentOrigin}${deploymentBase}`,
  base: deploymentBase,
  tagline: "Kanada'daki Türk diasporasının bağımsız gazetesi",
  description:
    "Kanada'da yaşayan, çalışan ve yeni bir hayat kuran Türkler için göç, yerleşim, " +
    'toplum ve günlük yaşam rehberi. Güvenilir bilgi, derinlikli haber.',
  locale: 'tr_CA',
  lang: 'tr',
  founded: 2026,
  // Sosyal ve iletişim — yayına geçerken güncellenecek.
  email: 'merhaba@kanadagazetesi.com',
  social: {
    instagram: 'https://instagram.com/kanadagazetesi',
    x: 'https://x.com/kanadagazetesi',
    youtube: 'https://youtube.com/@kanadagazetesi',
  },
  // Kanada'nın belli başlı şehirleri (hava/saat şeridi ve şehir rehberleri için)
  cities: ['Toronto', 'Montréal', 'Ottawa', 'Vancouver', 'Calgary', 'Edmonton'],
};

/** Prefix a root-relative path for the active Pages/custom-domain deployment. */
export function withBase(path = '/') {
  const cleanPath = path === '/' ? '/' : `/${path.replace(/^\/+/, '')}`;
  if (deploymentBase && (cleanPath === deploymentBase || cleanPath.startsWith(`${deploymentBase}/`))) {
    return cleanPath;
  }
  return `${deploymentBase}${cleanPath}` || '/';
}

/** Build a canonical absolute URL without dropping the GitHub Pages base path. */
export function absoluteUrl(path = '/') {
  return new URL(withBase(path), `${deploymentOrigin}/`).href;
}

export type SiteConfig = typeof site;
