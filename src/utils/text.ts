/**
 * Saf (dependency-free) metin ve tarih yardımcıları.
 *
 * Bu modül bilerek `astro:content` gibi çalışma-zamanı bağımlılıkları
 * içermez; böylece birim testlerinde (Vitest) doğrudan kullanılabilir.
 */

/** Excerpt türetmek için gereken en küçük makale şekli. */
export interface ExcerptSource {
  data: { excerpt?: string; deck?: string };
  body?: string;
}

/** Türkçe uzun tarih: "13 Haziran 2026" (opsiyonel gün adı ile). */
export function formatDateTR(date: Date, opts: { weekday?: boolean } = {}): string {
  const f = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(opts.weekday ? { weekday: 'long' } : {}),
  });
  return f.format(date);
}

/** Kısa tarih: "13 Haz 2026" */
export function formatDateShortTR(date: Date): string {
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/** Makine-okur ISO tarih (datetime attribute için) */
export function isoDate(date: Date): string {
  return date.toISOString();
}

/** Okuma süresi tahmini — dakika (Türkçe için ~190 kelime/dk) */
export function readingTime(markdown: string): number {
  const words = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\][()-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 190));
}

/** Türkçe okuma süresi etiketi: "5 dk okuma" */
export function readingTimeLabel(markdown: string): string {
  return `${readingTime(markdown)} dk okuma`;
}

/** Frontmatter'da excerpt yoksa gövdeden ilk cümleleri çıkar */
export function deriveExcerpt(entry: ExcerptSource, max = 180): string {
  if (entry.data.excerpt) return entry.data.excerpt;
  if (entry.data.deck) return entry.data.deck;
  const text =
    entry.body
      ?.replace(/^---[\s\S]*?---/, '')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
      .replace(/[#>*_`~]/g, '')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/\s+/g, ' ')
      .trim() ?? '';
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}

export interface TocHeading {
  depth: number;
  slug: string;
  text: string;
}

/**
 * Makale başlıklarından içindekiler listesi üretir. Belirli bir derinlikteki
 * (varsayılan h2) başlıkları döndürür; eşik (`min`) altındaysa boş döner —
 * böylece kısa yazılarda gereksiz TOC gösterilmez.
 */
export function tableOfContents(
  headings: TocHeading[],
  depth = 2,
  min = 3,
): TocHeading[] {
  const items = headings.filter((h) => h.depth === depth);
  return items.length >= min ? items : [];
}

/** URL/slug üretimi — Türkçe karakterleri çevirir, güvenli slug verir. */
export function slugify(input: string): string {
  const map: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    İ: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    Ç: 'c',
    Ğ: 'g',
    Ö: 'o',
    Ş: 's',
    Ü: 'u',
  };
  return input
    .trim()
    .replace(/[çğıİöşüÇĞÖŞÜ]/g, (ch) => map[ch] ?? ch)
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export interface RelatableArticle {
  id: string;
  data: { tags: string[]; section: string; pubDate: Date };
}

/**
 * İlgili yazıları puanlar: paylaşılan etiket sayısı (ağırlıklı), sonra aynı
 * bölüm, sonra tazelik. Kendisi hariç tutulur. Saf ve test edilebilir.
 */
export function rankRelated<T extends RelatableArticle>(
  current: T,
  candidates: T[],
  limit = 3,
): T[] {
  const curTags = new Set(current.data.tags);
  return candidates
    .filter((a) => a.id !== current.id)
    .map((a) => {
      const shared = a.data.tags.filter((t) => curTags.has(t)).length;
      const sameSection = a.data.section === current.data.section ? 1 : 0;
      return { a, score: shared * 10 + sameSection };
    })
    .sort(
      (x, y) =>
        y.score - x.score || y.a.data.pubDate.valueOf() - x.a.data.pubDate.valueOf(),
    )
    .slice(0, limit)
    .map((x) => x.a);
}
