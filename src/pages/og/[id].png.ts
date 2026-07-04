import type { APIRoute } from 'astro';
import { getCollection, type CollectionEntry } from 'astro:content';
import sharp from 'sharp';
import { renderOgSvg, OG_ACCENTS } from '../../lib/og';
import { getSection } from '../../data/sections';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  return articles.map((article) => ({
    params: { id: article.id },
    props: { article },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { article } = props as { article: CollectionEntry<'articles'> };
  const meta = getSection(article.data.section);
  const svg = renderOgSvg({
    title: article.data.title,
    kicker: meta?.name ?? '',
    accent: OG_ACCENTS[article.data.section] ?? '#b41e26',
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
