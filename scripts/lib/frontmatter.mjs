import fs from 'node:fs';

/** Frontmatter bloğunu (ilk ---...--- arası) ayıklar. */
export function readFrontmatter(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return { fields: {}, raw: src, hasFm: false };
  const fields = {};
  for (const line of m[1].split(/\r?\n/)) {
    const mm = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim();
    // basit değer ayrıştırma (string/bool/sayı)
    if (/^".*"$/.test(v)) v = JSON.parse(v);
    else if (v === 'true') v = true;
    else if (v === 'false') v = false;
    fields[mm[1]] = v;
  }
  return { fields, raw: src, hasFm: true };
}

/**
 * Üst-veri alanlarını günceller/ekler. Mevcut biçimi korur; var olan anahtarı
 * yerinde değiştirir, yoksa bloğun sonuna ekler. String değerler JSON ile
 * kaçışlanır. ($ gibi özel karakterler için replace fonksiyonla yapılır.)
 */
export function setFrontmatterFields(filePath, updates) {
  const src = fs.readFileSync(filePath, 'utf8');
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) throw new Error(`frontmatter yok: ${filePath}`);
  // Dosyanın baskın satır sonunu koru (Windows CRLF / Unix LF karışmasın).
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const lines = m[1].split(/\r?\n/);
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined || value === null) continue;
    const serialized = typeof value === 'string' ? JSON.stringify(value) : String(value);
    const line = `${key}: ${serialized}`;
    const idx = lines.findIndex((l) => new RegExp(`^${key}:`).test(l));
    if (idx >= 0) lines[idx] = line;
    else lines.push(line);
  }
  const block = lines.join(eol);
  const out = src.replace(
    /^---\r?\n[\s\S]*?\r?\n---/,
    () => `---${eol}${block}${eol}---`,
  );
  fs.writeFileSync(filePath, out);
}
