import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { HERO_WIDTH, HERO_QUALITY } from './config.mjs';

export const USER_AGENT =
  'KanadaGazetesi-photo-pipeline/1.0 (+https://www.kanadagazetesi.com; merhaba@kanadagazetesi.com)';

/** Bir görseli indirir ve Buffer döner. Şema ve boyut sınırı uygulanır. */
export async function downloadBuffer(url, { maxBytes = 30 * 1024 * 1024 } = {}) {
  const u = new URL(url);
  if (u.protocol !== 'https:' && u.protocol !== 'http:') {
    throw new Error(`desteklenmeyen şema: ${u.protocol} — ${url}`);
  }
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'image/*,*/*' },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`indirme başarısız ${res.status} — ${url}`);
  const declared = Number(res.headers.get('content-length') || 0);
  if (declared && declared > maxBytes) {
    throw new Error(`görsel çok büyük (${declared} bayt) — ${url}`);
  }
  const ab = await res.arrayBuffer();
  if (ab.byteLength > maxBytes) {
    throw new Error(`görsel çok büyük (${ab.byteLength} bayt) — ${url}`);
  }
  return Buffer.from(ab);
}

/**
 * Buffer'ı web için optimize edip JPEG olarak kaydeder.
 * EXIF yönüne göre döndürür, en fazla HERO_WIDTH genişliğe küçültür.
 */
export async function optimizeToJpeg(buffer, outPath, opts = {}) {
  const width = opts.width ?? HERO_WIDTH;
  const quality = opts.quality ?? HERO_QUALITY;
  const pipeline = sharp(buffer).rotate();
  const meta = await pipeline.metadata();
  const { data, info } = await pipeline
    .resize({ width, withoutEnlargement: true })
    .jpeg({ quality, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, data);
  return {
    width: info.width,
    height: info.height,
    bytes: info.size,
    srcWidth: meta.width ?? null,
    srcHeight: meta.height ?? null,
  };
}
