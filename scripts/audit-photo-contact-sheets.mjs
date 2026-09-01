#!/usr/bin/env node
import { readFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import sharp from 'sharp';

const root = resolve(process.cwd());
const outDir = resolve(
  process.argv[2] || join(root, '..', '..', 'audit', 'canada-photo-sheets'),
);
const articlesDir = join(root, 'src', 'content', 'articles');
const publicDir = join(root, 'public');
mkdirSync(outDir, { recursive: true });

function value(frontmatter, key) {
  return (
    frontmatter.match(new RegExp(`^${key}:\\s*["']?([^"'\\r\\n]+)`, 'm'))?.[1]?.trim() ||
    ''
  );
}

function escapeXml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

const byImage = new Map();
for (const file of readdirSync(articlesDir).filter((name) => name.endsWith('.md'))) {
  const raw = readFileSync(join(articlesDir, file), 'utf8');
  const fm = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] || '';
  const image = value(fm, 'heroImage');
  const title = value(fm, 'title');
  if (!image || !existsSync(join(publicDir, image.replace(/^\//, '')))) continue;
  if (!byImage.has(image)) byImage.set(image, []);
  byImage.get(image).push(title);
}

const entries = [...byImage.entries()].sort(([a], [b]) => a.localeCompare(b));
const cols = 4;
const rows = 4;
const tileW = 400;
const tileH = 300;
const photoH = 220;
const pageSize = cols * rows;

for (let page = 0; page < Math.ceil(entries.length / pageSize); page += 1) {
  const chunk = entries.slice(page * pageSize, (page + 1) * pageSize);
  const composites = [];

  for (let index = 0; index < chunk.length; index += 1) {
    const [image, titles] = chunk[index];
    const x = (index % cols) * tileW;
    const y = Math.floor(index / cols) * tileH;
    const imagePath = join(publicDir, image.replace(/^\//, ''));
    const photo = await sharp(imagePath)
      .rotate()
      .resize(tileW, photoH, { fit: 'cover', position: 'attention' })
      .jpeg({ quality: 86 })
      .toBuffer();
    composites.push({ input: photo, left: x, top: y });

    const fileLabel = basename(image);
    const titleLabel = titles.slice(0, 2).join(' | ');
    const reuse = titles.length > 2 ? ` (+${titles.length - 2})` : '';
    const label = Buffer.from(
      `<svg width="${tileW}" height="${tileH - photoH}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#111827"/>
        <text x="12" y="23" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#f9fafb">${escapeXml(fileLabel)}${reuse}</text>
        <text x="12" y="48" font-family="Arial, sans-serif" font-size="13" fill="#d1d5db">${escapeXml(titleLabel.slice(0, 52))}</text>
        <text x="12" y="66" font-family="Arial, sans-serif" font-size="13" fill="#d1d5db">${escapeXml(titleLabel.slice(52, 104))}</text>
      </svg>`,
    );
    composites.push({ input: label, left: x, top: y + photoH });
  }

  const output = join(outDir, `canada-photos-${String(page + 1).padStart(2, '0')}.jpg`);
  await sharp({
    create: {
      width: cols * tileW,
      height: rows * tileH,
      channels: 3,
      background: '#030712',
    },
  })
    .composite(composites)
    .jpeg({ quality: 88 })
    .toFile(output);
  console.log(output);
}

console.log(
  `Audited set: ${entries.length} unique hero images across ${[...byImage.values()].reduce((sum, titles) => sum + titles.length, 0)} articles.`,
);
