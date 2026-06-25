import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;
export type Author = CollectionEntry<'authors'>;

// Saf metin/tarih yardımcıları text.ts'te tutulur (test edilebilirlik için)
// ve buradan yeniden dışa aktarılır; mevcut importlar bozulmaz.
export {
  formatDateTR,
  formatDateShortTR,
  isoDate,
  readingTime,
  readingTimeLabel,
  deriveExcerpt,
  slugify,
  tableOfContents,
  rankRelated,
  type TocHeading,
} from './text';

/** Tüm yayımlanmış yazılar, tarihe göre yeniden eskiye (gelecek tarihliler hariç) */
export async function getPublishedArticles(): Promise<Article[]> {
  const now = Date.now();
  const all = await getCollection('articles');
  return all
    .filter((a) => a.data.pubDate.valueOf() <= now)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
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

/** Slug-güvenli benzersiz etiket listesi (sayımlarıyla), çoktan aza sıralı. */
export async function getAllTags(): Promise<{ tag: string; count: number }[]> {
  const all = await getPublishedArticles();
  const counts = new Map<string, number>();
  for (const a of all) {
    for (const t of a.data.tags) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'tr'));
}

/** Belirli bir etikete sahip yazılar. */
export async function getArticlesByTag(tag: string): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all.filter((a) => a.data.tags.includes(tag));
}

/** Benzersiz yazar listesi (sayımlarıyla). */
export async function getAllAuthors(): Promise<{ author: string; count: number }[]> {
  const all = await getPublishedArticles();
  const counts = new Map<string, number>();
  for (const a of all) {
    counts.set(a.data.author, (counts.get(a.data.author) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([author, count]) => ({ author, count }))
    .sort((a, b) => b.count - a.count || a.author.localeCompare(b.author, 'tr'));
}

/** Belirli bir yazarın yazıları. */
export async function getArticlesByAuthor(author: string): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all.filter((a) => a.data.author === author);
}

/** Tüm yazar profillerini ada göre eşleyen bir harita döndürür. */
export async function getAuthorMap(): Promise<Map<string, Author>> {
  const authors = await getCollection('authors');
  return new Map(authors.map((a) => [a.data.name, a]));
}

/** Bir yazar adına karşılık gelen profil (varsa). */
export async function getAuthorProfile(name: string): Promise<Author | undefined> {
  return (await getAuthorMap()).get(name);
}

/** Bir dizinin yazıları — seriesOrder, sonra tarih (eskiden yeniye) sıralı. */
export async function getArticlesBySeries(series: string): Promise<Article[]> {
  const all = await getPublishedArticles();
  return all
    .filter((a) => a.data.series === series)
    .sort((a, b) => {
      const ao = a.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      const bo = b.data.seriesOrder ?? Number.MAX_SAFE_INTEGER;
      if (ao !== bo) return ao - bo;
      return a.data.pubDate.valueOf() - b.data.pubDate.valueOf();
    });
}

/** Tüm diziler (sayımlarıyla), çoktan aza. */
export async function getAllSeries(): Promise<{ series: string; count: number }[]> {
  const all = await getPublishedArticles();
  const counts = new Map<string, number>();
  for (const a of all) {
    if (a.data.series) counts.set(a.data.series, (counts.get(a.data.series) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([series, count]) => ({ series, count }))
    .sort((a, b) => b.count - a.count || a.series.localeCompare(b.series, 'tr'));
}
