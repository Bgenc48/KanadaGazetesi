# Otomasyon: Fotoğraf Hattı ve Site Güncelleme

Bu belge iki otomasyonu açıklar: **(1) lisanslı fotoğraf hattı** ve **(2) siteyi
otomatik derleyip yayınlayan zamanlanmış iş akışları**.

---

## 1. Lisanslı Fotoğraf Hattı

Her yazı, frontmatter'ında bir `photoQuery` (İngilizce arama sorgusu) taşır.
`fetch-photos.mjs`, bu sorguyla **ticari kullanıma uygun, doğru lisanslı** bir
fotoğraf bulur, indirir, optimize eder ve yazının `heroImage` + `heroCredit`
alanlarını günceller. Atıf bilgisi `src/data/photo-credits.json`'a yazılır ve
`/krediler` sayfasında topluca listelenir.

### Kaynaklar (sağlayıcılar)

Sıra `scripts/lib/config.mjs` içindeki `providerOrder()` ile belirlenir:

| Sağlayıcı             | Anahtar               | Lisans                                              | Not                                     |
| --------------------- | --------------------- | --------------------------------------------------- | --------------------------------------- |
| **Pexels**            | `PEXELS_API_KEY`      | Pexels License (atıf zorunlu değil)                 | Varsa ilk tercih                        |
| **Unsplash**          | `UNSPLASH_ACCESS_KEY` | Unsplash License                                    | İndirme tetikleyici + UTM atıf otomatik |
| **Openverse**         | yok                   | yalnız `commercial,modification` (CC0/PDM/BY/BY-SA) | **Varsayılan, anahtarsız**              |
| **Wikimedia Commons** | yok                   | istemcide süzülür (NC/ND reddedilir)                | Simge yapılar için ideal                |

> Varsayılan olarak **anahtarsız** Openverse + Wikimedia kullanılır — hiçbir
> kurulum gerekmez. Pexels/Unsplash anahtarı eklerseniz onlar öncelik kazanır.

### Kullanım

```bash
npm run photos            # photoQuery'si olup foto'su eksik yazıları doldur
npm run photos:force      # hepsini yeniden çek (mevcut foto'ların üstüne)
node scripts/fetch-photos.mjs --slug <slug>            # tek yazı
node scripts/fetch-photos.mjs --slug <slug> --query "english query"
node scripts/fetch-photos.mjs --provider wikimedia     # belirli sağlayıcı
node scripts/fetch-photos.mjs --dry                    # sadece önizleme
```

Bir yazının `.svg` illüstrasyonu varsa, hat onu otomatik olarak gerçek fotoğrafla
**yükseltir** (heroImage `.svg` ise yenisi çekilir). Gerçek `.jpg` varsa `--force`
olmadan dokunmaz.

### Anahtar ekleme (isteğe bağlı kalite yükseltmesi)

Proje köküne `.env`:

```
PEXELS_API_KEY=...
UNSPLASH_ACCESS_KEY=...
```

(`.env` `.gitignore`'dadır; CI'da bunlar **GitHub repo secrets** olarak verilir.)

### Lisans uyumu

- `config.mjs` → `isLicenseAllowed()` NC (gayri-ticari) ve ND (türev yasak)
  lisansları **reddeder**.
- CC-BY / CC-BY-SA fotoğraflarında atıf zorunludur; bunu hem **görsel altındaki
  kredi satırında** (`heroCredit`: "Ad / Kaynak (Lisans)") hem de **`/krediler`**
  sayfasında (yazar, kaynak ve lisans bağlantılarıyla) gösteriyoruz.
- Tüm atıf üstverisi `src/data/photo-credits.json`'da saklanır.

---

## 2. Siteyi Otomatik Güncelleme (GitHub Actions)

Statik site **GitHub Pages**'e iki iş akışıyla yayınlanır:

### `.github/workflows/deploy.yml`

- Tetikleyici: `main`'e push, elle (`workflow_dispatch`) ve **"Refresh Photos"
  tamamlanınca** (`workflow_run`).
- `withastro/action@v6` ile derler, `actions/deploy-pages@v5` ile yayınlar.

### `.github/workflows/refresh-photos.yml`

- Tetikleyici: her **Pazartesi 06:00 UTC** (cron) + elle.
- Anahtarsız olarak `node scripts/fetch-photos.mjs` çalıştırır, değişen
  dosyaları (`public/images`, `src/content`, `src/data`) commit'leyip push'lar.

> **Neden iki ayrı akış?** GitHub'ın yerleşik `GITHUB_TOKEN`'ı ile yapılan push,
> `on: push` iş akışlarını **tetiklemez** (sonsuz döngü koruması). Bu yüzden
> deploy akışı, refresh akışının tamamlanmasına `workflow_run` ile bağlanır.

### İlk kurulum

1. Depoyu GitHub'a gönderin (aşağıya bakın).
2. **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
3. Alan adı: `public/CNAME` `www.kanadagazetesi.com` içerir. DNS'te `www`
   kaydını GitHub Pages'e yönlendirin ve sertifika çıkınca "Enforce HTTPS"i açın.
   (Apex `kanadagazetesi.com` isterseniz `public/CNAME` ve `astro.config.mjs`
   içindeki `site`'ı buna göre güncelleyin.)
4. (İsteğe bağlı) Pexels/Unsplash için **Settings → Secrets → Actions** altına
   `PEXELS_API_KEY` / `UNSPLASH_ACCESS_KEY` ekleyin.

### Git'i başlatıp göndermek

```bash
git init
git add -A
git commit -m "Kanada Gazetesi: ilk sürüm"
git branch -M main
git remote add origin git@github.com:<kullanici>/kanada-gazetesi.git
git push -u origin main
```

### Netlify / Cloudflare alternatifi

`netlify.toml` hazır (build: `npm run build`, publish: `dist`). Netlify push'ta
otomatik derler; bu durumda deploy.yml gerekmez — refresh akışının commit'i
Netlify derlemesini tetikler. Alan adını Netlify panelinden ayarlayın.

---

## 3. (İsteğe bağlı) Yapay zekâ ile içerik taslağı

Fotoğraf ve dağıtım otomatiktir; **yeni yazı yazmak editöryeldir**. Yeni taslak
için:

```bash
npm run new -- --title "Başlık" --section yasam --deck "Spot" \
  --photo "english photo query" --tags "etiket1,etiket2"
```

Haftalık olarak Claude'un **taslak** üretmesini (yayını değil) isterseniz, bir
zamanlanmış Claude ajanı kurulabilir: belirlenen konularda evergreen rehber
taslakları açar, siz onaylayıp yayınlarsınız. Otomatik **yayın** önermiyoruz —
haber doğruluğu insan denetimi gerektirir.
