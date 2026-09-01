#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const articleDir = path.join(process.cwd(), 'src', 'content', 'articles');
const linksBySlug = {
  'cifte-vatandaslik-pasaport-askerlik': [
    [
      'Çifte vatandaşlıkta seyahat ve pasaport',
      'kanada-cifte-vatandas-seyahat-pasaport-rehberi',
    ],
    [
      'Kanada’dan Türk pasaportu yenileme',
      'kanadada-turk-pasaportu-basvuru-yenileme-rehberi',
    ],
  ],
  'cocuklara-turkceyi-korumak': [
    ['Yeni gelen çocuklar için okul kaydı', 'kanada-yeni-gelen-cocuk-okul-kayit-rehberi'],
    ['Ücretsiz LINC ve CLIC dil kursları', 'kanada-linc-clic-ucretsiz-dil-kursu-rehberi'],
  ],
  'diploma-denkligi-eca-rehberi': [
    ['Express Entry ve CRS', 'express-entry-crs-rehberi'],
    ['Kanada’da iş arama ve networking', 'kanadada-is-arama-ozgecmis-networking-rehberi'],
  ],
  'es-aile-sponsorlugu-rehberi': [
    ['Super visa başvurusu', 'kanada-super-visa-anne-baba-rehberi'],
    ['Ziyaretçi vizesi dosyası hazırlama', 'kanada-ziyaretci-vizesi-trv-dosya-rehberi'],
  ],
  'ilk-kanada-kisina-hazirlik': [
    [
      'Kış fırtınası ve blizzard güvenliği',
      'kanada-kis-firtinasi-blizzard-guvenlik-rehberi',
    ],
    ['Wind chill, donma ve hipotermi', 'kanada-wind-chill-donma-hipotermi-rehberi'],
  ],
  'is-teklifi-lmia-calisma-izni-rehberi': [
    [
      'İşveren değiştirirken çalışma izni',
      'kanada-isveren-degistirme-calisma-izni-rehberi',
    ],
    [
      'Francophone Mobility çalışma izni',
      'kanada-francophone-mobility-calisma-izni-rehberi',
    ],
  ],
  'kanada-bankacilik-kredi-skoru': [
    [
      'Kredi raporu hatası ve dolandırıcılık',
      'kanada-kredi-raporu-hata-dolandiricilik-rehberi',
    ],
    [
      'Yeni gelenler için TFSA katkı hakkı',
      'kanada-yeni-gelenler-tfsa-katki-hakki-rehberi',
    ],
  ],
  'kanada-egitim-izni-pgwp-rehberi': [
    [
      'Study permit uzatma ve DLI değişikliği',
      'kanada-study-permit-uzatma-dli-degisikligi-rehberi',
    ],
    ['Öğrenci kredisi RAP geri ödeme', 'kanada-student-loan-rap-geri-odeme-rehberi'],
  ],
  'kanada-ehliyet-degisimi': [
    [
      'İkinci el araçta lien ve recall kontrolü',
      'kanada-ikinci-el-arac-alma-lien-recall-kontrolu',
    ],
    ['Araç sigortası ve kaza hasarı', 'kanada-arac-sigortasi-kaza-hasar-rehberi'],
  ],
  'kanada-saglik-sistemi-kart': [
    ['Yeni gelenlerin ilk üç aylık sağlık planı', 'kanada-saglik-sistemi-yeni-gelenler'],
    ['Kanada Diş Bakım Planı', 'kanada-cdcp-dis-bakim-plani-rehberi'],
  ],
  'kanada-saglik-sistemi-yeni-gelenler': [
    ['Eyalet sağlık kartı ve aile hekimi', 'kanada-saglik-sistemi-kart'],
    [
      'Yurt dışı seyahat sağlık sigortası',
      'kanada-yurtdisi-seyahat-saglik-sigortasi-rehberi',
    ],
  ],
  'kanada-turk-konsolosluk-rehberi': [
    ['Mavi Kart başvurusu ve hakları', 'kanada-mavi-kart-basvuru-haklar-rehberi'],
    [
      'Kanada’dan Türk pasaportu yenileme',
      'kanadada-turk-pasaportu-basvuru-yenileme-rehberi',
    ],
  ],
  'kanada-vergi-sistemi-cra': [
    ['CRA Notice of Objection hazırlama', 'kanada-cra-notice-of-objection-rehberi'],
    ['Kanada-Türkiye vergi mukimliği', 'kanada-turkiye-vergi-mukimligi-anlasma-rehberi'],
  ],
  'kanadaya-yerlesim-yol-haritasi-2026': [
    ['Express Entry ve CRS', 'express-entry-crs-rehberi'],
    ['Yeni gelenin ilk 30 günü', 'yeni-gelen-ilk-30-gun-kontrol-listesi'],
  ],
  'sin-numarasi-basvurusu': [
    [
      'SIN kimlik hırsızlığı ve veri ihlali',
      'kanada-sin-kimlik-hirsizligi-veri-ihlali-rehberi',
    ],
    ['Yeni gelenin ilk 30 günü', 'yeni-gelen-ilk-30-gun-kontrol-listesi'],
  ],
  'toronto-turk-toplulugu-rehberi': [
    ['Toronto’da Türk toplumuna bağlanma', 'torontoda-turk-hayati-rehberi'],
    ['Topluluk etkinliği düzenleme', 'kanadada-topluluk-etkinligi-duzenleme-rehberi'],
  ],
  'torontoda-turk-hayati-rehberi': [
    ['Toronto Türk topluluğu rehberi', 'toronto-turk-toplulugu-rehberi'],
    ['Topluluk etkinliği düzenleme', 'kanadada-topluluk-etkinligi-duzenleme-rehberi'],
  ],
  'turkiye-kanada-seyahat-gumruk-rehberi': [
    ['eTA ve pasaport eşleştirme', 'kanada-eta-basvuru-pasaport-eslestirme-rehberi'],
    [
      'Çifte vatandaşlıkta seyahat ve pasaport',
      'kanada-cifte-vatandas-seyahat-pasaport-rehberi',
    ],
  ],
  'turkiye-kanada-ticaret-rehberi': [
    [
      'Kanada-Türkiye serbest ticaret müzakereleri',
      'kanada-turkiye-serbest-ticaret-anlasmasi-muzakereleri-2026',
    ],
    [
      'Kanada’dan Türkiye’ye para transferi',
      'kanadadan-turkiyeye-para-transferi-rehberi',
    ],
  ],
  'yeni-gelen-ilk-30-gun-kontrol-listesi': [
    ['SIN numarası başvurusu', 'sin-numarasi-basvurusu'],
    ['Eyalet sağlık kartı ve aile hekimi', 'kanada-saglik-sistemi-kart'],
    ['Kanada’da bankacılık ve kredi skoru', 'kanada-bankacilik-kredi-skoru'],
  ],
};

let changed = 0;
for (const [slug, links] of Object.entries(linksBySlug)) {
  const file = path.join(articleDir, `${slug}.md`);
  if (!fs.existsSync(file)) throw new Error(`Missing source article: ${slug}`);
  for (const [, target] of links) {
    if (!fs.existsSync(path.join(articleDir, `${target}.md`)))
      throw new Error(`Broken target ${target} for ${slug}`);
  }
  const original = fs.readFileSync(file, 'utf8');
  if (original.includes('## İlgili Kanada Gazetesi rehberleri')) continue;
  const block = `\n\n## İlgili Kanada Gazetesi rehberleri\n\n${links.map(([label, target]) => `- [${label}](/makale/${target})`).join('\n')}\n`;
  fs.writeFileSync(file, `${original.trimEnd()}${block}`, 'utf8');
  changed += 1;
}

console.log(`Added contextual internal links to ${changed} articles.`);
