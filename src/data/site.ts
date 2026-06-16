/** Site geneli sabitler ve künye bilgileri. */
export const site = {
  name: 'Kanada Gazetesi',
  shortName: 'KG',
  domain: 'kanadagazetesi.com',
  url: 'https://www.kanadagazetesi.com',
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

export type SiteConfig = typeof site;
