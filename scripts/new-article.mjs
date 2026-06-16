#!/usr/bin/env node
/**
 * Yeni bir yazı taslağı oluşturur.
 *
 * Kullanım:
 *   node scripts/new-article.mjs --title "Başlık" --section yasam \
 *        --deck "Spot cümle" --tags "etiket1,etiket2" --photo "english photo query" \
 *        --author "Yaşam Masası" [--lead] [--featured] [--advisory]
 *
 * Bölümler: goc-ve-yerlesim | toplum | turkiye-kanada | yasam | rehber
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { slugify } from './lib/slugify.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTICLES = path.join(ROOT, 'src', 'content', 'articles');

const VALID_SECTIONS = ['goc-ve-yerlesim', 'toplum', 'turkiye-kanada', 'yasam', 'rehber'];

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) {
        out[key] = true; // bayrak
      } else {
        out[key] = next;
        i++;
      }
    } else {
      out._.push(a);
    }
  }
  return out;
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));

const title = args.title || args._.join(' ');
if (!title) fail('Bir başlık verin: --title "..."');

const section = args.section || 'rehber';
if (!VALID_SECTIONS.includes(section)) {
  fail(`Geçersiz bölüm: ${section}\nGeçerli: ${VALID_SECTIONS.join(', ')}`);
}

const slug = args.slug ? slugify(args.slug) : slugify(title);
const file = path.join(ARTICLES, `${slug}.md`);
if (fs.existsSync(file) && !args.force) {
  fail(`Bu slug zaten var: ${slug}.md (üzerine yazmak için --force)`);
}

const today = new Date().toISOString().slice(0, 10);
const tags = (args.tags ? String(args.tags).split(',') : [])
  .map((t) => t.trim())
  .filter(Boolean);

const fm = [
  '---',
  `title: ${JSON.stringify(title)}`,
  `deck: ${JSON.stringify(args.deck || '')}`,
  `section: ${JSON.stringify(section)}`,
  `author: ${JSON.stringify(args.author || 'Kanada Gazetesi')}`,
  ...(args.authorTitle ? [`authorTitle: ${JSON.stringify(args.authorTitle)}`] : []),
  `pubDate: ${today}`,
  ...(typeof args.photo === 'string' ? [`photoQuery: ${JSON.stringify(args.photo)}`] : []),
  `excerpt: ${JSON.stringify(args.excerpt || args.deck || '')}`,
  `tags: ${JSON.stringify(tags)}`,
  `featured: ${args.featured ? 'true' : 'false'}`,
  `lead: ${args.lead ? 'true' : 'false'}`,
  ...(args.advisory ? ['advisory: true'] : []),
  '---',
  '',
  '> Taslak: bu yazıyı yazın. İlk paragraf, okuru ilk cümlede içeri çeksin.',
  '',
  '## Ara başlık',
  '',
  'Metin…',
  '',
].join('\n');

fs.mkdirSync(ARTICLES, { recursive: true });
fs.writeFileSync(file, fm, 'utf8');

console.log(`\n✓ Taslak oluşturuldu: src/content/articles/${slug}.md`);
if (args.photo) {
  console.log(`  Fotoğraf için:  node scripts/fetch-photos.mjs --slug ${slug}`);
}
console.log(`  Önizleme:       npm run dev  →  /makale/${slug}\n`);
