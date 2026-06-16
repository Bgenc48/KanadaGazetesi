import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const CREDITS_PATH = path.resolve(__dirname, '../../src/data/photo-credits.json');

export function readCredits() {
  try {
    return JSON.parse(fs.readFileSync(CREDITS_PATH, 'utf8') || '{}');
  } catch {
    return {};
  }
}

export function writeCredits(obj) {
  const sorted = Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );
  fs.writeFileSync(CREDITS_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

/** file yolunu anahtar alarak bir kredi kaydını ekler/günceller. */
export function upsertCredit(record) {
  const all = readCredits();
  all[record.file] = record;
  writeCredits(all);
}

/** Görsel üstünde gösterilecek kısa kredi: "Ad / Kaynak (Lisans)". */
export function shortCredit(record) {
  const base = record.author ? `${record.author} / ${record.provider}` : record.provider;
  // Pexels/Unsplash tek lisanslıdır; CC lisanslarında atıf için lisansı da göster.
  if (record.license && !/^(Pexels|Unsplash)/i.test(record.license)) {
    return `${base} (${record.license})`;
  }
  return base;
}
