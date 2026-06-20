# Katkı Rehberi — Kanada Gazetesi

Teşekkürler! Bu rehber, koda ve içeriğe katkıyı kolaylaştırır.

## Geliştirme ortamı

Gereksinim: **Node 20+**.

```bash
npm install      # bağımlılıklar
npm run dev      # geliştirme sunucusu → http://localhost:4321
```

## Kalite kapıları

Bir PR açmadan önce yereldeki tüm kontrollerin geçtiğinden emin olun:

```bash
npm run format       # Prettier ile biçimlendir
npm run lint         # ESLint
npm run typecheck    # astro check (TypeScript)
npm test             # Vitest birim testleri
npm run build        # üretim derlemesi (+ Pagefind arama indeksi)
```

Kestirme: `npm run check` (lint + typecheck + test).

Bunların hepsi CI'da (Node 20 ve 22) ayrıca çalışır; kırmızı CI merge edilmez.

## Yeni yazı eklemek

`src/content/articles/` altına `yazi-adi.md` ekleyin (dosya adı URL slug'ı olur).
Frontmatter şablonu için `README.md`'ye bakın. İçerik Markdown dosyaları
bilerek Prettier biçimlendirmesinin dışında tutulur (editöryel metne
dokunulmaz).

## Kod tarzı

- TypeScript `strict` modda; `any` yerine somut tipler tercih edin.
- Bileşenler `src/components/`, sayfalar `src/pages/`, saf yardımcılar
  `src/utils/text.ts` (test edilebilir) içinde tutulur.
- Saf mantık eklediğinizde `src/utils/*.test.ts` altına birim testi ekleyin.

## Commit ve PR

- Açıklayıcı, kapsam belirten commit başlıkları kullanın (`feat:`, `fix:`,
  `docs:`, `build:` …).
- PR açıklamasında ne/neden ve test adımlarını belirtin.

## Editöryel ilkeler

Habercilik standartları için `/yayin-ilkeleri` sayfasına bakın. Resmî bilgi
içeren yazılarda kaynak gösterin ve `advisory: true` kullanın.
