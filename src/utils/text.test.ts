import { describe, it, expect } from 'vitest';
import {
  formatDateTR,
  formatDateShortTR,
  isoDate,
  readingTime,
  readingTimeLabel,
  deriveExcerpt,
  slugify,
} from './text';

describe('formatDateTR', () => {
  const d = new Date('2026-06-13T12:00:00Z');
  it('formats a long Turkish date', () => {
    expect(formatDateTR(d)).toBe('13 Haziran 2026');
  });
  it('includes the weekday when asked', () => {
    expect(formatDateTR(d, { weekday: true })).toContain('Cumartesi');
  });
});

describe('formatDateShortTR', () => {
  it('formats a short Turkish date', () => {
    expect(formatDateShortTR(new Date('2026-06-13T12:00:00Z'))).toBe('13 Haz 2026');
  });
});

describe('isoDate', () => {
  it('returns an ISO 8601 string', () => {
    expect(isoDate(new Date('2026-06-13T12:00:00Z'))).toBe('2026-06-13T12:00:00.000Z');
  });
});

describe('readingTime', () => {
  it('returns at least 1 minute for short text', () => {
    expect(readingTime('Kısa bir yazı.')).toBe(1);
  });
  it('scales with word count (~190 wpm)', () => {
    const words = Array.from({ length: 570 }, () => 'kelime').join(' ');
    expect(readingTime(words)).toBe(3);
  });
  it('ignores fenced code blocks and markdown syntax', () => {
    const md = '# Başlık\n\n```js\nconst x = 1;\n```\n\nNormal metin.';
    expect(readingTime(md)).toBe(1);
  });
  it('produces a Turkish label', () => {
    expect(readingTimeLabel('Kısa metin.')).toBe('1 dk okuma');
  });
});

describe('deriveExcerpt', () => {
  it('prefers an explicit excerpt', () => {
    expect(deriveExcerpt({ data: { excerpt: 'Özet.' }, body: 'gövde' })).toBe('Özet.');
  });
  it('falls back to the deck', () => {
    expect(deriveExcerpt({ data: { deck: 'Spot.' }, body: 'gövde' })).toBe('Spot.');
  });
  it('derives from the body and truncates with an ellipsis', () => {
    const body = Array.from({ length: 60 }, () => 'kelime').join(' ');
    const out = deriveExcerpt({ data: {}, body }, 50);
    expect(out.length).toBeLessThanOrEqual(51);
    expect(out.endsWith('…')).toBe(true);
  });
  it('strips markdown image and link syntax', () => {
    const body = 'Bak ![alt](/x.png) ve [bağlantı](https://e.com) burada.';
    expect(deriveExcerpt({ data: {}, body })).toBe('Bak ve bağlantı burada.');
  });
  it('handles missing body gracefully', () => {
    expect(deriveExcerpt({ data: {} })).toBe('');
  });
});

describe('slugify', () => {
  it('transliterates Turkish characters', () => {
    expect(slugify('Göç ve Yerleşim')).toBe('goc-ve-yerlesim');
  });
  it('handles the dotted/undotted i and ş', () => {
    expect(slugify('İş Kurmak Şart')).toBe('is-kurmak-sart');
  });
  it('collapses separators and trims edges', () => {
    expect(slugify('  Merhaba,  Dünya!  ')).toBe('merhaba-dunya');
  });
});
