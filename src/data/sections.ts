import { SECTIONS } from '../content.config';

export interface SectionMeta {
  id: (typeof SECTIONS)[number];
  /** Menüde ve etikette görünen ad */
  name: string;
  /** Kısa üst-etiket (kicker) sürümü */
  kicker: string;
  /** Bölüm açıklaması (bölüm sayfası başlığı altında) */
  description: string;
  /** İngilizce karşılığı — ikinci kuşak okur ve SEO için */
  english: string;
  /** Bölüme özel vurgu rengi (CSS değişkeni adı) */
  accent: string;
}

export const sections: SectionMeta[] = [
  {
    id: 'goc-ve-yerlesim',
    name: 'Göç ve Yerleşim',
    kicker: 'Göç',
    english: 'Immigration & Settlement',
    description:
      'Vize, oturum, çalışma izni, vatandaşlık, denklik ve vergi — Kanada’ya ' +
      'gelmenin ve burada kalıcı olmanın resmî yol haritası.',
    accent: '--accent-goc',
  },
  {
    id: 'toplum',
    name: 'Toplum',
    kicker: 'Toplum',
    english: 'Community & Culture',
    description:
      'Dernekler, etkinlikler, mekânlar, portreler ve şehir rehberleri — ' +
      'Kanada’daki Türk topluluğunun nabzı.',
    accent: '--accent-toplum',
  },
  {
    id: 'turkiye-kanada',
    name: 'Türkiye–Kanada',
    kicker: 'Türkiye–Kanada',
    english: 'Türkiye & Canada',
    description:
      'İki ülke arasındaki ilişkiler, ekonomi, ticaret ve diasporayı ' +
      'doğrudan ilgilendiren gelişmelerin derinlikli analizi.',
    accent: '--accent-tk',
  },
  {
    id: 'yasam',
    name: 'Yaşam',
    kicker: 'Yaşam',
    english: 'Living in Canada',
    description:
      'Sağlık, konut, bankacılık, çocukların eğitimi ve Kanada kışı — ' +
      'burada gerçekten nasıl yaşanır?',
    accent: '--accent-yasam',
  },
  {
    id: 'rehber',
    name: 'Rehber',
    kicker: 'Rehber',
    english: 'Guides',
    description:
      'Adım adım, kullanışlı kılavuzlar. Bir kez yazılır, yıllarca işe yarar.',
    accent: '--accent-rehber',
  },
];

export const sectionMap: Record<string, SectionMeta> = Object.fromEntries(
  sections.map((s) => [s.id, s]),
);

export function getSection(id: string): SectionMeta | undefined {
  return sectionMap[id];
}
