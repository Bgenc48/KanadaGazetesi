import { wrapText } from '../utils/text';

/** Bölüm kimliği → OG kartı vurgu rengi (hex). global.css tonlarıyla uyumlu. */
export const OG_ACCENTS: Record<string, string> = {
  'goc-ve-yerlesim': '#324a63', // slate
  toplum: '#2f5d4a', // ivy
  'turkiye-kanada': '#b41e26', // crimson
  yasam: '#9c6a1f', // amber
  rehber: '#8a6d3b', // brass
};

export interface OgOptions {
  title: string;
  kicker?: string;
  accent?: string;
  siteName?: string;
  domain?: string;
}

/** XML/SVG için güvenli kaçış. */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 1200×630 markalı OG paylaşım kartı SVG'si üretir. Sıcak gazete kâğıdı zemini,
 * bölüm vurgu şeridi, Didone başlık ve künye. sharp ile PNG'ye dönüştürülür.
 */
export function renderOgSvg(opts: OgOptions): string {
  const {
    title,
    kicker = '',
    accent = '#b41e26',
    siteName = 'Kanada Gazetesi',
    domain = 'kanadagazetesi.com',
  } = opts;

  const lines = wrapText(title, 24, 3);
  const lineHeight = 84;
  // Başlık bloğunu kicker (y=128) ile alt çizgi (y=520) arasında dikey ortala.
  const firstBaseline = 232 + (3 - lines.length) * 42;
  const titleTspans = lines
    .map(
      (l, i) => `<tspan x="90" y="${firstBaseline + i * lineHeight}">${esc(l)}</tspan>`,
    )
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#fbf8f1"/>
  <rect x="0" y="0" width="1200" height="14" fill="${accent}"/>
  <rect x="0" y="0" width="14" height="630" fill="${accent}"/>
  ${
    kicker
      ? `<text x="90" y="126" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing="6" fill="${accent}">${esc(
          kicker.toLocaleUpperCase('tr-TR'),
        )}</text>`
      : ''
  }
  <text font-family="Georgia, 'Times New Roman', serif" font-size="72" font-weight="700" fill="#16120d" letter-spacing="-1">${titleTspans}</text>
  <line x1="90" y1="520" x2="1110" y2="520" stroke="#d8cebc" stroke-width="2"/>
  <text x="90" y="565" font-family="Georgia, serif" font-size="38" font-weight="700" fill="#16120d">${esc(
    siteName,
  )}</text>
  <text x="1110" y="565" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="26" fill="#6f6557">${esc(
    domain,
  )}</text>
</svg>`;
}
