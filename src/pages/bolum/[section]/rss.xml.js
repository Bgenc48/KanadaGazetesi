import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../../../data/site';
import { SECTIONS } from '../../../content.config';
import { sectionMap } from '../../../data/sections';

export function getStaticPaths() {
  return SECTIONS.map((section) => ({ params: { section } }));
}

export async function GET(context) {
  const { section } = context.params;
  const meta = sectionMap[section];
  const now = Date.now();
  const articles = (await getCollection('articles'))
    .filter((a) => a.data.section === section && a.data.pubDate.valueOf() <= now)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: `${site.name} — ${meta?.name ?? section}`,
    description: meta?.description ?? site.description,
    site: context.site ?? site.url,
    items: articles.map((a) => ({
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
