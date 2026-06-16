#!/usr/bin/env node
/**
 * Lisanslı fotoğraf hattı.
 *
 * photoQuery alanı olan ve henüz gerçek fotoğrafı olmayan (veya .svg
 * illüstrasyon kullanan) yazılar için; ticari kullanıma uygun, doğru lisanslı
 * bir fotoğraf bulur, indirir, optimize eder, public/images/ altına kaydeder ve
 * yazının heroImage + heroCredit alanlarını günceller. Atıf bilgisi
 * src/data/photo-credits.json'a yazılır (/krediler sayfasında listelenir).
 *
 * Sağlayıcı sırası (config.mjs): PEXELS_API_KEY / UNSPLASH_ACCESS_KEY varsa
 * önce onlar; her zaman anahtarsız Openverse + Wikimedia Commons yedeği.
 *
 * Kullanım:
 *   node scripts/fetch-photos.mjs                 # eksik foto'su olanları doldur
 *   node scripts/fetch-photos.mjs --force         # hepsini yeniden çek
 *   node scripts/fetch-photos.mjs --slug <slug> [--query "..."] [--provider openverse]
 *   node scripts/fetch-photos.mjs --dry           # sadece ne yapılacağını göster
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFrontmatter, setFrontmatterFields } from './lib/frontmatter.mjs';
import { downloadBuffer, optimizeToJpeg } from './lib/optimize.mjs';
import { getProvider, triggerUnsplashDownload } from './lib/providers.mjs';
import { upsertCredit, shortCredit } from './lib/credits.mjs';
import { providerOrder, isLicenseAllowed } from './lib/config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ARTICLES = path.join(ROOT, 'src', 'content', 'articles');
const IMAGES = path.join(ROOT, 'public', 'images');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim(); // önce kırp: sondaki boşluklar anahtarı bozmasın
    if (/^".*"$/.test(v) || /^'.*'$/.test(v)) v = v.slice(1, -1);
    if (!(m[1] in process.env)) process.env[m[1]] = v;
  }
}

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

/** Bir adayın kabul edilebilir olup olmadığı: lisans + boyut. */
function acceptable(c, minWidth) {
  if (!c.imageUrl) return false;
  if (!(isLicenseAllowed(c.licenseCode) || isLicenseAllowed(c.license))) return false;
  if (c.width && c.width < minWidth) return false;
  return true;
}

/** Manzara (yatay) ve yeterince büyük olanları öne al. */
function rankCandidates(list, minWidth) {
  return [...list].sort((a, b) => {
    const la = a.width && a.height ? (a.width >= a.height ? 1 : 0) : 0;
    const lb = b.width && b.height ? (b.width >= b.height ? 1 : 0) : 0;
    if (la !== lb) return lb - la;
    return (b.width || 0) - (a.width || 0);
  }).filter((c) => acceptable(c, minWidth));
}

async function findPhoto(query, { order, env, limit, minWidth, log }) {
  for (const name of order) {
    const search = getProvider(name);
    if (!search) continue;
    try {
      const results = await search(query, { limit, env });
      await sleep(1200); // API'lere karşı kibar ol (özellikle anahtarsız)
      const ranked = rankCandidates(results, minWidth);
      if (ranked.length) {
        log(`    ✓ ${name}: ${ranked.length} uygun aday (lisans/boyut)`);
        return ranked[0];
      }
      log(`    · ${name}: uygun aday yok (${results.length} sonuç)`);
    } catch (err) {
      log(`    ! ${name} hata: ${err.message}`);
    }
  }
  return null;
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  const force = !!args.force;
  const dry = !!args.dry;
  const limit = Number(args.limit) || 15;
  const minWidth = Number(args['min-width']) || 1000;
  const order = args.provider ? [String(args.provider)] : providerOrder(process.env);
  const log = (...m) => console.log(...m);

  log(`\nFotoğraf hattı — sağlayıcı sırası: ${order.join(' → ')}\n`);

  const files = fs.readdirSync(ARTICLES).filter((f) => f.endsWith('.md'));
  const work = [];
  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    if (args.slug && slug !== args.slug) continue;
    const full = path.join(ARTICLES, file);
    const { fields } = readFrontmatter(full);
    const query =
      typeof args.query === 'string' && args.slug ? args.query : fields.photoQuery;
    if (!query) continue;
    const hero = fields.heroImage;
    const needs = force || !hero || /\.svg$/i.test(String(hero));
    if (!needs) continue;
    work.push({ slug, full, query, fields });
  }

  if (work.length === 0) {
    log('Yapılacak iş yok. (--force ile mevcut fotoğrafları da yenileyebilirsiniz.)\n');
    return;
  }

  let ok = 0;
  let fail = 0;
  for (const item of work) {
    log(`▶ ${item.slug}\n    sorgu: "${item.query}"`);
    const candidate = await findPhoto(item.query, { order, env: process.env, limit, minWidth, log });
    if (!candidate) {
      log(`    ✗ uygun fotoğraf bulunamadı\n`);
      fail++;
      continue;
    }
    const outFile = `/images/${item.slug}.jpg`;
    const outPath = path.join(IMAGES, `${item.slug}.jpg`);

    if (dry) {
      log(`    [dry] ${candidate.provider} · ${candidate.license} · ${candidate.author || '—'}`);
      log(`    [dry] ${candidate.imageUrl}\n    [dry] → ${outFile}\n`);
      ok++;
      continue;
    }

    try {
      const buf = await downloadBuffer(candidate.imageUrl);
      const info = await optimizeToJpeg(buf, outPath);
      if (info.width < minWidth) {
        log(`    ⚠ uyarı: kaydedilen görsel ${info.width}px (< ${minWidth}px hedef)`);
      }
      await triggerUnsplashDownload(candidate);

      const credit = shortCredit(candidate);
      const updates = { heroImage: outFile, heroCredit: credit };
      if (!item.fields.heroAlt && (candidate.title || item.fields.title)) {
        updates.heroAlt = candidate.title || item.fields.title;
      }
      setFrontmatterFields(item.full, updates);

      upsertCredit({
        file: outFile,
        slug: item.slug,
        query: item.query,
        provider: candidate.provider,
        author: candidate.author || '',
        authorUrl: candidate.authorUrl || '',
        sourceUrl: candidate.sourceUrl || '',
        license: candidate.license || '',
        licenseCode: candidate.licenseCode || '',
        licenseUrl: candidate.licenseUrl || '',
        title: candidate.title || '',
        attribution: candidate.attribution || '',
        width: info.width,
        height: info.height,
        fetchedAt: new Date().toISOString(),
      });

      log(
        `    ✓ ${candidate.provider} · ${candidate.license || '—'} · ${candidate.author || '—'}`,
      );
      log(`      → ${outFile} (${info.width}×${info.height}, ${Math.round(info.bytes / 1024)} KB)\n`);
      ok++;
    } catch (err) {
      log(`    ✗ ${err.message}\n`);
      fail++;
    }
  }

  log(`Bitti. ${ok} başarılı, ${fail} başarısız.\n`);
  if (fail > 0 && ok === 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
