import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../data/site';

export async function GET(context) {
  const articles = await getCollection('articles');
  const sorted = articles.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  return rss({
    title: site.name,
    description: site.description,
    site: context.site ?? site.url,
    items: sorted.map((a) => ({
      title: a.data.title,
      pubDate: a.data.pubDate,
      description: a.data.excerpt ?? a.data.deck ?? '',
      link: `/makale/${a.id}/`,
      categories: a.data.tags,
      author: a.data.author,
    })),
    customData: `<language>tr-CA</language>`,
  });
}
