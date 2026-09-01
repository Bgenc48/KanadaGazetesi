#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { readFrontmatter, setFrontmatterFields } from './lib/frontmatter.mjs';
import { readCredits, writeCredits } from './lib/credits.mjs';

const sourceDir = process.argv[2];
const sourceCredits = process.argv[3];
const dryRun = process.argv.includes('--dry');
if (!sourceDir || !sourceCredits) {
  console.error('Usage: node scripts/assign-editorial-photo-bank.mjs <pexels-image-dir> <CREDITS.md>');
  process.exit(1);
}

const root = process.cwd();
const articlesDir = path.join(root, 'src', 'content', 'articles');
const destinationDir = path.join(root, 'public', 'images', 'editorial');
fs.mkdirSync(destinationDir, { recursive: true });

const creditRows = new Map();
for (const line of fs.readFileSync(sourceCredits, 'utf8').split(/\r?\n/)) {
  const cells = line.split('|').map((cell) => cell.trim()).filter(Boolean);
  if (cells.length !== 4 || !cells[0].endsWith('.jpg') || cells[0] === 'File') continue;
  creditRows.set(cells[0], { id: cells[1], description: cells[2], photographer: cells[3] });
}

const groups = [
  { match: /orman yangını|ev yangını|yangın dumanı|duman alarmı|karbonmonoksit/i, images: ['wildfire-relief.jpg'] },
  { match: /acil|911|988|211|311|811|aşırı sıcak|heat warning|çığ|heyelan|fırtına|tornado|tsunami|yıldırım|aşırı soğuk|wind chill|elektrik kesintisi|afet|tahliye|güvenlik|zehirlenme/i, images: ['wildfire-relief.jpg', 'community-hands.jpg', 'policy-document.jpg'] },
  { match: /legal aid|adli yardım|adalet|mahkeme|suç|polis|şikayet|itiraz|ayrımcılık|şiddet|mahrem|dolandırıcılık|hakları|atip/i, images: ['courthouse-justice.jpg', 'policy-document.jpg', 'community-hands.jpg', 'newspaper-press.jpg'] },
  { match: /charity|bağış makbuzu|not-for-profit/i, images: ['policy-document.jpg', 'community-hands.jpg', 'volunteer-community-service.jpg'] },
  { match: /visitor|vize|göç|ircc|statü|oturum|vatandaş|pr card|copr|express entry|pnp|biyometri|temsilci|refugee|rcip/i, images: ['passport-visa.jpg', 'policy-document.jpg', 'identity-culture.jpg', 'community-diverse.jpg'] },
  { match: /Toronto|Montréal|Montreal|Ottawa|Vancouver|Calgary|Edmonton|Halifax|Hamilton|Kelowna|London|Quebec|Regina|Saskatoon|Victoria|Winnipeg|yerleşim|yeni gelen/i, images: ['home-buying.jpg', 'community-hands.jpg', 'community-diverse.jpg', 'professional-networking.jpg'] },
  { match: /sağlık|medical|hastalık|diş|dental|engelli|disability|zehir|bakım veren|caregiver/i, images: ['hospital-doctor.jpg', 'health-insurance.jpg'] },
  { match: /çocuk|okul|eğitim|öğrenci|diploma|burs|tuition|study|pgwp/i, images: ['classroom-education.jpg', 'bilingual-classroom.jpg', 'students-campus-life.jpg', 'library-reading.jpg', 'university-campus.jpg', 'graduation-ceremony.jpg'] },
  { match: /aile|eş |sponsor|anne|baba|doğum|evlilik|boşanma|ölüm tescili/i, images: ['family-multicultural.jpg', 'bilingual-family.jpg', 'community-hands.jpg'] },
  { match: /vergi|cra|tax|rrsp|tfsa|fhsa|resp|rdsp|cpp|oas|gis|benefit|yardım|emeklilik|gelir/i, images: ['tax-documents.jpg', 'retirement-planning.jpg', 'credit-score.jpg', 'policy-document.jpg'] },
  { match: /banka|kredi|mortgage|konut|kiracı|kira|ev |iflas|bankruptcy|borç|sigorta/i, images: ['credit-score.jpg', 'home-buying.jpg', 'policy-document.jpg', 'family-multicultural.jpg'] },
  { match: /iş |çalışma|kariyer|işveren|istihdam|şirket|ticaret|ihracat|ithalat|charity|kuruluş/i, images: ['professional-networking.jpg', 'business-meeting.jpg', 'small-business.jpg', 'tech-office-workers.jpg'] },
  { match: /telefon|internet|online|dijital|e-devlet|imei|web tapu|application tracker/i, images: ['remote-work.jpg', 'silicon-valley.jpg'] },
  { match: /uçuş|seyahat|pasaport|gümrük|eşya getirme|evcil hayvan|trv|eta/i, images: ['airplane-flight.jpg', 'passport-visa.jpg', 'baby-travel.jpg'] },
  { match: /gıda|(?:^|\s)market(?:\s|$)|ramazan|helal|ürün recall|alerjen/i, images: ['turkish-food.jpg', 'community-gathering-dinner.jpg', 'iftar-table.jpg'] },
  { match: /toplum|topluluk|dernek|gönüllü|dil kursu|linc|clic|konsolosluk|Türkçe|kültür/i, images: ['community-diverse.jpg', 'community-hands.jpg', 'community-gathering-dinner.jpg', 'interfaith-calendar.jpg', 'volunteer-community-service.jpg', 'family-multicultural.jpg'] },
];

const sectionFallback = {
  'goc-ve-yerlesim': ['passport-visa.jpg', 'policy-document.jpg', 'identity-culture.jpg', 'community-diverse.jpg'],
  toplum: ['community-diverse.jpg', 'community-hands.jpg', 'community-gathering-dinner.jpg', 'interfaith-calendar.jpg', 'volunteer-community-service.jpg', 'family-multicultural.jpg'],
  'turkiye-kanada': ['airplane-flight.jpg', 'passport-visa.jpg', 'business-meeting.jpg', 'identity-culture.jpg', 'community-diverse.jpg', 'conference-hall.jpg'],
  yasam: ['family-multicultural.jpg', 'home-buying.jpg', 'community-diverse.jpg', 'remote-work.jpg', 'turkish-food.jpg', 'community-hands.jpg'],
  rehber: ['policy-document.jpg', 'remote-work.jpg', 'community-hands.jpg', 'courthouse-justice.jpg', 'newspaper-press.jpg', 'professional-networking.jpg'],
};

const replaceExisting = new Set([
  'es-aile-sponsorlugu-rehberi',
  'express-entry-crs-rehberi',
  'eyalet-aday-programi-pnp-rehberi',
  'is-teklifi-lmia-calisma-izni-rehberi',
  'kanada-acil-yardim-numaralari-rehberi',
  'kanadada-is-arama-ozgecmis-networking-rehberi',
  'kanada-turkiye-apostil-belge-rehberi',
  'kanada-vergi-sistemi-cra',
  'sin-numarasi-basvurusu',
  'ucretsiz-yeni-gelen-hizmetleri-rehberi',
  'yeni-gelen-ilk-30-gun-kontrol-listesi',
]);

function stableIndex(text, length) {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return hash % length;
}

function selectImage(title, section, slug) {
  const group = groups.find((item) => item.match.test(title));
  const choices = group?.images ?? sectionFallback[section] ?? sectionFallback.rehber;
  return choices[stableIndex(slug, choices.length)];
}

const credits = readCredits();
let assigned = 0;
let replaced = 0;
const selections = new Map();

for (const file of fs.readdirSync(articlesDir).filter((name) => name.endsWith('.md')).sort()) {
  const slug = file.replace(/\.md$/i, '');
  const full = path.join(articlesDir, file);
  const { fields } = readFrontmatter(full);
  const current = String(fields.heroImage || '');
  const currentExists = current.startsWith('/') && fs.existsSync(path.join(root, 'public', current));
  const managedEditorialImage = current.startsWith('/images/editorial/');
  if (currentExists && !managedEditorialImage && !replaceExisting.has(slug)) continue;

  const image = selectImage(String(fields.title || slug), String(fields.section || ''), slug);
  const source = path.join(sourceDir, image);
  const metadata = creditRows.get(image);
  if (!metadata || !fs.existsSync(source)) throw new Error(`Missing licensed source asset: ${image}`);
  selections.set(image, (selections.get(image) || 0) + 1);

  if (dryRun) {
    if (currentExists) replaced += 1;
    else assigned += 1;
    continue;
  }

  const destination = path.join(destinationDir, image);
  if (!fs.existsSync(destination)) fs.copyFileSync(source, destination);
  const publicPath = `/images/editorial/${image}`;
  const heroCredit = `${metadata.photographer} / Pexels`;
  setFrontmatterFields(full, {
    heroImage: publicPath,
    heroAlt: metadata.description,
    heroCredit,
  });
  credits[publicPath] = {
    file: publicPath,
    slug: 'editorial-photo-bank',
    query: 'curated editorial match',
    provider: 'Pexels',
    author: metadata.photographer,
    authorUrl: '',
    sourceUrl: `https://www.pexels.com/photo/${metadata.id}/`,
    license: 'Pexels License',
    licenseCode: 'pexels',
    licenseUrl: 'https://www.pexels.com/license/',
    title: metadata.description,
    attribution: '',
    fetchedAt: new Date().toISOString(),
  };
  if (currentExists) replaced += 1;
  else assigned += 1;
}

if (!dryRun) writeCredits(credits);
console.log(`${dryRun ? 'Would assign' : 'Assigned'} ${assigned} missing heroes; ${dryRun ? 'would replace' : 'replaced'} ${replaced} mismatched heroes.`);
console.log([...selections.entries()].sort((a, b) => b[1] - a[1]).map(([image, count]) => `${count}\t${image}`).join('\n'));
