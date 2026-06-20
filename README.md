# Kanada Gazetesi

**Kanada'daki Türk diasporasının bağımsız gazetesi** — göç, yerleşim, toplum ve
günlük yaşam üzerine güvenilir, derinlikli ve kalıcı içerik.

> Independent newspaper for the Turkish diaspora in Canada. Built with Astro as a
> fast, SEO-friendly static site.

---

## Hızlı başlangıç

```bash
npm install      # bağımlılıkları kur
npm run dev      # geliştirme sunucusu → http://localhost:4321
npm run build    # üretim derlemesi → dist/
npm run preview  # derlemeyi yerelde önizle
```

Gereksinim: **Node 20+**.

## Proje yapısı

```
src/
  content.config.ts      # makale şeması (içerik koleksiyonu)
  content/articles/*.md   # tüm yazılar (Markdown + frontmatter)
  data/
    site.ts               # site künyesi, sosyal, şehirler
    sections.ts           # 5 bölüm: ad, açıklama, vurgu rengi
  styles/global.css       # tasarım sistemi (renk, tipografi, ızgara)
  layouts/                # BaseLayout, ArticleLayout
  components/             # Masthead, SiteNav, LeadStory, ArticleCard, ...
  pages/
    index.astro           # ana sayfa
    bolum/[section].astro # bölüm liste sayfaları
    makale/[...id].astro  # makale sayfaları
    hakkimizda.astro      # künye / hakkımızda
    rss.xml.js            # RSS akışı
public/images/            # kahraman görseller (SVG) + OG/favicon
```

## Yeni yazı eklemek

`src/content/articles/` altına `yazi-adi.md` oluşturun. Dosya adı, URL slug'ı olur
(`/makale/yazi-adi`). Frontmatter şablonu:

```yaml
---
title: 'Başlık'
deck: 'Manşet altı / spot cümle'
section: 'goc-ve-yerlesim' # goc-ve-yerlesim | toplum | turkiye-kanada | yasam | rehber
author: 'Göç Masası'
pubDate: 2026-06-13
heroImage: '/images/ornek.svg' # opsiyonel — yoksa zarif renkli alan gösterilir
heroAlt: 'Görsel açıklaması'
excerpt: 'Kart ve liste için kısa özet'
tags: ['etiket1', 'etiket2']
featured: true # bölüm akışında öne çıkar
lead: false # ana sayfa manşeti (tek yazıda true olmalı)
advisory: true # resmî bilgi içeren yazılarda uyarı kutusu gösterir
---
```

## Görseller (lisanslı fotoğraf hattı)

Kahraman görseller, **lisanslı fotoğraf hattıyla** otomatik gelir. Her yazının
frontmatter'ındaki `photoQuery` sorgusuna göre ticari kullanıma uygun, doğru
lisanslı bir foto bulunur, optimize edilir ve atfı kaydedilir.

```bash
npm run photos          # eksik foto'su olan yazıları doldur
npm run photos:force    # hepsini yeniden çek
npm run publish         # foto'ları çek + derle
```

Varsayılan kaynaklar **anahtarsızdır** (Openverse + Wikimedia Commons). Daha
geniş seçim için `.env`'e `PEXELS_API_KEY` / `UNSPLASH_ACCESS_KEY` ekleyin.
Atıflar `/krediler` sayfasında listelenir. Ayrıntı: [`docs/automation.md`](docs/automation.md).

## Dağıtım

Statik site; herhangi bir statik barındırıcıda çalışır.

- **Netlify:** `netlify.toml` hazır (build: `npm run build`, publish: `dist`).
- **Vercel:** Astro otomatik algılanır; ek yapılandırma gerekmez.
- **Cloudflare Pages / GitHub Pages:** publish dizini `dist`.

Yayına geçmeden önce `astro.config.mjs` içindeki `SITE` ve `src/data/site.ts`
içindeki alan adı/iletişim bilgilerini gerçek değerlerle güncelleyin.

## Tasarım sistemi

- **Renk:** sıcak fildişi kâğıt (`#f7f4ec`), mürekkep (`#1b1714`) ve marka kızılı
  (`#c1121f` — Türk ve Kanada bayraklarının ortak rengi).
- **Tipografi:** Fraunces (manşet), Newsreader (gövde), Archivo (etiket/nav).
- Her bölümün kendi vurgu rengi vardır (`src/data/sections.ts`).

## Notlar

- `npm install` sırasında bildirilen güvenlik uyarıları, derleme zinciri
  (Vite/esbuild) kaynaklı geliştirme bağımlılıklarıdır; üretilen statik site
  çalışma zamanında bunları içermez.
- İçerikteki göç/vergi/hukuk bilgileri genel bilgilendirme amaçlıdır; resmî
  kaynaklarla (IRCC, CRA, eyalet makamları) doğrulanmalıdır.
