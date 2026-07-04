import { describe, it, expect } from 'vitest';
import {
  formatDateTR,
  formatDateShortTR,
  isoDate,
  readingTime,
  readingTimeLabel,
  deriveExcerpt,
  slugify,
  tableOfContents,
  rankRelated,
  wrapText,
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

describe('tableOfContents', () => {
  const headings = [
    { depth: 1, slug: 'baslik', text: 'Başlık' },
    { depth: 2, slug: 'a', text: 'A' },
    { depth: 3, slug: 'a1', text: 'A1' },
    { depth: 2, slug: 'b', text: 'B' },
    { depth: 2, slug: 'c', text: 'C' },
  ];
  it('returns only the requested depth (h2) when above the threshold', () => {
    const toc = tableOfContents(headings);
    expect(toc.map((h) => h.slug)).toEqual(['a', 'b', 'c']);
  });
  it('returns empty below the minimum count', () => {
    expect(tableOfContents(headings, 2, 4)).toEqual([]);
  });
  it('respects a custom depth', () => {
    expect(tableOfContents(headings, 3, 1).map((h) => h.slug)).toEqual(['a1']);
  });
});

describe('rankRelated', () => {
  const mk = (id: string, tags: string[], section: string, day: number) => ({
    id,
    data: { tags, section, pubDate: new Date(`2026-06-${day}T00:00:00Z`) },
  });
  const current = mk('cur', ['göç', 'vize'], 'goc-ve-yerlesim', 10);
  const candidates = [
    mk('a', ['göç', 'vize'], 'toplum', 1), // 2 shared tags
    mk('b', ['vize'], 'goc-ve-yerlesim', 2), // 1 shared + same section
    mk('c', [], 'goc-ve-yerlesim', 9), // same section only
    mk('d', [], 'yasam', 8), // nothing
    current, // must be excluded
  ];
  it('excludes the current article', () => {
    const out = rankRelated(current, candidates).map((a) => a.id);
    expect(out).not.toContain('cur');
  });
  it('ranks by shared tags, then section, then recency', () => {
    const out = rankRelated(current, candidates).map((a) => a.id);
    expect(out).toEqual(['a', 'b', 'c']);
  });
  it('respects the limit', () => {
    expect(rankRelated(current, candidates, 2)).toHaveLength(2);
  });
});

describe('wrapText', () => {
  it('keeps a short title on one line', () => {
    expect(wrapText('Kısa başlık', 24, 3)).toEqual(['Kısa başlık']);
  });
  it('wraps on word boundaries within maxChars', () => {
    const out = wrapText('Kanada Gazetesi bağımsız haber yayını', 18, 3);
    expect(out.every((l) => l.length <= 18)).toBe(true);
    expect(out.join(' ')).toBe('Kanada Gazetesi bağımsız haber yayını');
  });
  it('truncates with an ellipsis past maxLines', () => {
    const long = 'bir iki üç dört beş altı yedi sekiz dokuz on onbir oniki';
    const out = wrapText(long, 10, 2);
    expect(out).toHaveLength(2);
    expect(out[out.length - 1].endsWith('…')).toBe(true);
  });
  it('never emits empty lines', () => {
    const out = wrapText('a b c d e f g h', 3, 4);
    expect(out.every((l) => l.trim().length > 0)).toBe(true);
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
