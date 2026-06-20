import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Bölüm (section) kimlikleri. Etiketler ve açıklamalar src/data/sections.ts
 * dosyasında tutulur; burada yalnızca geçerli değerleri kısıtlıyoruz.
 */
export const SECTIONS = [
  'goc-ve-yerlesim', // Göç ve Yerleşim — Immigration & settlement
  'toplum', // Toplum — community life & culture
  'turkiye-kanada', // Türkiye–Kanada — relations & explainers
  'yasam', // Yaşam — practical living in Canada
  'rehber', // Rehber — service guides / how-to
] as const;

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    /** Manşet altı / spot (standfirst) */
    deck: z.string().optional(),
    section: z.enum(SECTIONS),
    author: z.string().default('Kanada Gazetesi'),
    authorTitle: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** /images/... altında bir yol veya tam URL */
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    heroCredit: z.string().optional(),
    /**
     * Otomatik fotoğraf hattı için arama sorgusu (İngilizce en iyi sonuç verir).
     * `node scripts/fetch-photos.mjs` bu sorguyla lisanslı bir foto bulur,
     * optimize eder ve heroImage + heroCredit alanlarını günceller.
     */
    photoQuery: z.string().optional(),
    /** Kart ve liste görünümleri için kısa özet */
    excerpt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    /** Ana sayfada en üstte yer alacak tek "günün haberi" */
    lead: z.boolean().default(false),
    lang: z.enum(['tr', 'en']).default('tr'),
    /** Resmî bilgi içeren yazılarda uyarı kutusu göstermek için */
    advisory: z.boolean().default(false),
  }),
});

const authors = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/authors' }),
  schema: z.object({
    /** Görünen ad — makale frontmatter'ındaki `author` ile birebir eşleşmeli */
    name: z.string(),
    /** Kısa rol/unvan (ör. "Göç ve yerleşim masası") */
    role: z.string().optional(),
    /** İletişim e-postası */
    email: z.string().optional(),
    /** Profil görseli (/images/... veya tam URL) */
    avatar: z.string().optional(),
    /** İlişkili bölüm (varsa) */
    section: z.enum(SECTIONS).optional(),
    social: z
      .object({
        x: z.string().optional(),
        instagram: z.string().optional(),
        website: z.string().optional(),
      })
      .optional(),
  }),
});

export const collections = { articles, authors };
