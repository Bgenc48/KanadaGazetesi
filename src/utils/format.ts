import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

/** Türkçe uzun tarih: "13 Haziran 2026, Cumartesi" */
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
    .replace(/[#>*_`~\-\]\[()]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 190));
}

/** Frontmatter'da excerpt yoksa gövdeden ilk cümleleri çıkar */
export function deriveExcerpt(entry: Article, max = 180): string {
  if (entry.data.excerpt) return entry.data.excerpt;
  if (entry.data.deck) return entry.data.deck;
  const text = entry.body
    ?.replace(/^---[\s\S]*?---/, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#>*_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim() ?? '';
  return text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}

/** Tüm yayımlanmış yazılar, tarihe göre yeniden eskiye */
export async function getPublishedArticles(): Promise<Article[]> {
  const all = await getCollection('articles');
  return all.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

/** Belirli bir bölümün yazıları */
export async function getArticlesBySection(section: string): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all.filter((a) => a.data.section === section);
}

/** Ana sayfa "günün haberi" — lead işaretli en yeni; yoksa en yeni yazı */
export async function getLeadArticle(articles: Article[]): Promise<Article | undefined> {
  return articles.find((a) => a.data.lead) ?? articles[0];
}
