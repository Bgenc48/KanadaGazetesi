# Kanada Gazetesi — 50-Sprint Ürün ve Mühendislik Yol Haritası

> Hedef: Kanada'daki Türk diasporası için tutkuyla kurulmuş bu statik Astro
> sitesini, **profesyonel, güvenilir ve sürdürülebilir bir dijital gazeteye**
> dönüştürmek.

- **Sprint sayısı:** 50
- **Sprint kapasitesi:** 60 story point (SP) — toplam **3.000 SP**
- **Sprint süresi (varsayım):** 2 hafta → ~100 hafta (~23 ay) takvim süresi
- **Takım varsayımı:** 1 ürün sahibi, 2–3 geliştirici, 1 editör, yarı-zamanlı
  tasarımcı. Velocity gerçek ölçümle kalibre edilmeli.
- **Tahmin ölçeği (Fibonacci):** 1, 2, 3, 5, 8, 13, 21. 21 SP üstü iş bölünür.

---

## 1. Mevcut durum değerlendirmesi (baseline)

| Alan            | Durum                                            | Boşluk                                           |
| --------------- | ------------------------------------------------ | ------------------------------------------------ |
| Çatı            | Astro 5 statik site, içerik koleksiyonları       | SSR/hibrit yok, dinamik özellik yok              |
| İçerik          | 10 makale, 5 bölüm (`src/content/articles`)      | Arşiv derinliği, taksonomi, yazar profilleri yok |
| Tasarım         | `global.css` tasarım sistemi, ~15 bileşen        | Dark mode, tasarım token'ları, Storybook yok     |
| Görsel          | Lisanslı foto hattı (`scripts/fetch-photos.mjs`) | Responsive `<img>`/CDN, sanat yönetimi sınırlı   |
| SEO             | Sitemap + RSS + temel meta                       | Yapısal veri (JSON-LD), OG otomasyonu eksik      |
| Kalite          | —                                                | Test, lint, tip-kontrol CI'ı **yok**             |
| Erişilebilirlik | —                                                | WCAG denetimi yapılmamış                         |
| Etkileşim       | —                                                | Bülten, yorum, arama, hesap yok                  |
| Gelir           | —                                                | Reklam, üyelik, bağış, sponsorluk yok            |
| Operasyon       | Netlify deploy                                   | İzleme, hata takibi, analitik yok                |
| Yasal           | —                                                | Gizlilik/PIPEDA, çerez onayı, künye eksik        |

**Mimari ilke:** Mümkün olduğunca statik/edge kal; dinamik ihtiyaçlar (arama,
hesap, yorum, ödeme) ortaya çıktıkça hibrit SSR + edge fonksiyonlarına aşamalı
geç. "Önce performans ve güven" felsefesi tüm sprintlerin üstünde durur.

---

## 2. Faz haritası

| Faz | Sprintler | Tema                                        | SP  |
| --- | --------- | ------------------------------------------- | --- |
| 1   | 1–5       | Temel & mühendislik hijyeni                 | 300 |
| 2   | 6–10      | İçerik & editöryel platform                 | 300 |
| 3   | 11–15     | Tasarım sistemi & marka                     | 300 |
| 4   | 16–20     | SEO, performans & erişilebilirlik           | 300 |
| 5   | 21–25     | Okur deneyimi & etkileşim                   | 300 |
| 6   | 26–30     | Hesaplar, üyelik & kişiselleştirme          | 300 |
| 7   | 31–35     | Gelir & ticarileşme                         | 300 |
| 8   | 36–40     | Çoklu ortam & etkileşimli gazetecilik       | 300 |
| 9   | 41–45     | Topluluk, servisler & diaspora faydası      | 300 |
| 10  | 46–50     | Ölçek, güvenilirlik, veri & haber odası ops | 300 |

Her fazın sonunda bir **sürüm (release)** çıkar ve retrospektif yapılır.

---

## 3. Çapraz kesen tanımlar

**Definition of Ready (DoR):** kabul kriterleri yazılı, tasarım/maket hazır,
bağımlılıklar net, tahmin yapılmış.

**Definition of Done (DoD):** kod gözden geçirildi, test geçti, lint+tip temiz,
Lighthouse regresyonu yok, erişilebilirlik kontrolü yapıldı, dokümante edildi,
ana dala merge edildi ve önizleme dağıtımında doğrulandı.

**Kalıcı kalite bütçesi:** her sprintte ~6 SP teknik borç/bakıma ayrılır
(aşağıdaki dökümlerde "Bakım & teknik borç" kalemi).

---

# FAZ 1 — Temel & Mühendislik Hijyeni (Sprint 1–5)

> Amaç: Profesyonelliğin ön koşulu olan otomatik kalite güvencesini kurmak.
> Hiçbir özellik, üzerinde duracağı sağlam zemin olmadan ölçeklenemez.

### Sprint 1 — Geliştirme altyapısı ve kod kalitesi temeli

- (13) ESLint + Prettier + `astro check` yapılandırması, monorepo lint script'leri
- (13) TypeScript strict mode'a geçiş; `tsconfig` sıkılaştırma; tip hatalarını giderme
- (8) EditorConfig, commit-lint, Husky pre-commit kancaları
- (13) GitHub Actions CI: kurulum + lint + tip + build matrisi (Node 20/22)
- (8) `CONTRIBUTING.md`, PR/issue şablonları, kod sahipliği (CODEOWNERS)
- (5) Bakım & teknik borç

### Sprint 2 — Test altyapısı

- (13) Vitest birim test kurulumu; `src/utils/format.ts` ve yardımcılar için testler
- (13) Playwright ile uçtan uca smoke testleri (ana sayfa, makale, bölüm, 404)
- (8) İçerik şeması doğrulama testleri (frontmatter/`content.config.ts`)
- (8) Görsel regresyon testi altyapısı (Playwright snapshot)
- (13) Test kapsamı raporu + CI eşiği (%60 başlangıç)
- (5) Bakım & teknik borç

### Sprint 3 — CI/CD ve dağıtım olgunluğu

- (13) Önizleme dağıtımları (her PR için Netlify deploy preview + yorum)
- (8) Üretim/staging ortam ayrımı, ortam değişkeni yönetimi (`.env` şeması)
- (13) Lighthouse CI bütçeleri (performans/erişilebilirlik/SEO eşikleri)
- (8) Bağımlılık güvenliği: Dependabot/Renovate + `npm audit` kapısı
- (13) Link checker + ölü bağlantı CI kontrolü (iç/dış)
- (5) Bakım & teknik borç

### Sprint 4 — Gözlemlenebilirlik ve hata yönetimi

- (13) Hata takibi entegrasyonu (Sentry/GlitchTip) — istemci + derleme
- (8) Yapısal loglama ve build telemetrisi
- (8) Uptime/sentetik izleme (kritik sayfalar)
- (13) Performans bütçesi panosu (Core Web Vitals alan verisi toplama altyapısı)
- (13) Olay müdahale runbook'u + durum sayfası taslağı
- (5) Bakım & teknik borç

### Sprint 5 — Dokümantasyon ve geliştirici deneyimi

- (13) `ARCHITECTURE.md`: içerik akışı, bileşen envanteri, karar kayıtları (ADR)
- (8) Bileşen API dokümantasyonu standardı (props/yorum konvansiyonu)
- (13) Yerel geliştirme onboarding (Dev Container / `make` hedefleri)
- (8) Otomasyon script'leri için README iyileştirmesi (`scripts/`)
- (13) Faz 1 retro + teknik borç envanteri + sürüm v0.2 notları
- (5) Bakım & teknik borç

---

# FAZ 2 — İçerik & Editöryel Platform (Sprint 6–10)

> Amaç: İçeriği ölçeklemek; yazar ve editörlerin koddan bağımsız çalışabileceği
> profesyonel bir yayın akışı kurmak.

### Sprint 6 — İçerik modeli genişletme

- (13) Şema genişletme: `readingTime`, `series`, `sources`, `corrections`, `region`
- (13) Yazar koleksiyonu (`src/content/authors`) + yazar profil sayfaları
- (8) Çoklu yazar/katkıda bulunan desteği (byline bileşeni güncellemesi)
- (13) Etiket (tag) taksonomisi + etiket arşiv sayfaları (`/etiket/[tag]`)
- (8) İlişkili içerik kuralı (aynı bölüm/etiket/seri)
- (5) Bakım & teknik borç

### Sprint 7 — Editöryel iş akışı (Git tabanlı CMS)

- (21) Görsel CMS entegrasyonu (Decap/Sveltia CMS) — Git tabanlı, anahtarsız
- (13) Editöryel durumlar: taslak/incelemede/zamanlanmış/yayında
- (13) Önizleme akışı: yayınlanmamış içeriğin güvenli önizlemesi
- (8) Medya kitaplığı yönetimi (CMS içinden görsel yükleme/atıf)
- (5) Bakım & teknik borç

### Sprint 8 — Yayın akışı ve zamanlama

- (13) Zamanlanmış yayın (gelecek tarihli `pubDate` + zamanlı yeniden derleme)
- (8) Düzeltme/güncelleme politikası ve görünür "güncellendi" damgası
- (13) İçerik gözden geçirme kontrol listesi (kaynak doğrulama, künye, hukuk)
- (13) Editöryel takvim görünümü (planlanan içerik panosu)
- (8) Otomatik özet/excerpt ve okuma süresi hesabı
- (5) Bakım & teknik borç

### Sprint 9 — Zengin içerik bileşenleri

- (13) MDX desteği + gömülebilir bileşenler (tablo, uyarı kutusu, adım listesi)
- (13) Bilgi grafiği bileşenleri (karşılaştırma tablosu, zaman çizelgesi, kontrol listesi)
- (8) Dipnot/kaynakça ve alıntı bileşeni
- (13) "Açıklayıcı" (explainer) ve "rehber" şablonları (uzun-biçim yapısı)
- (8) İçindekiler (TOC) + bölüm derin bağlantıları
- (5) Bakım & teknik borç

### Sprint 10 — İçerik üretim hızlandırma

- (13) `new-article` script'i geliştirme (interaktif sihirbaz, şablon seçimi)
- (8) İçerik stil rehberi (Türkçe yazım, terim sözlüğü TR/EN)
- (13) Toplu içüretim: 15+ temel rehber makalesinin iskeleti ve yayını
- (13) İçerik denetimi: SEO başlık/meta uzunluk + okunabilirlik linter'ı
- (8) Faz 2 retro + sürüm v0.3
- (5) Bakım & teknik borç

---

# FAZ 3 — Tasarım Sistemi & Marka (Sprint 11–15)

> Amaç: Görsel kimliği bir gazete ciddiyetine taşımak; tutarlı, ölçeklenebilir,
> erişilebilir bir tasarım sistemi.

### Sprint 11 — Tasarım token'ları ve temel

- (13) Tasarım token mimarisi (renk/tipo/aralık/gölge — CSS custom properties)
- (13) Tipografik ölçek ve dikey ritim yeniden kalibrasyonu (Fraunces/Newsreader/Archivo)
- (8) Renk kontrastı denetimi ve AA uyumlu palet ayarı
- (13) Responsive ızgara sistemi (gazete sütun düzenleri)
- (8) Font yükleme stratejisi (subset, `font-display`, preload)
- (5) Bakım & teknik borç

### Sprint 12 — Dark mode ve tema

- (13) Karanlık tema (token tabanlı, `prefers-color-scheme` + manuel geçiş)
- (8) Tema geçiş bileşeni + tercih kalıcılığı
- (13) Bölüm vurgu renkleri sisteminin temalarla uyumu
- (8) Yazdırma stil sayfası (makale yazdırma görünümü)
- (13) Yüksek kontrast / azaltılmış hareket (`prefers-reduced-motion`) modları
- (5) Bakım & teknik borç

### Sprint 13 — Bileşen kütüphanesi olgunlaştırma

- (13) Storybook/bileşen kataloğu kurulumu
- (13) Tüm bileşenlerin (Masthead, LeadStory, ArticleCard, ...) standardizasyonu
- (8) Boş/yükleniyor/hata durumları (skeleton'lar)
- (13) İkon sistemi (tutarlı SVG seti, erişilebilir etiketler)
- (8) Bileşen kullanım dokümanı + tasarım QA kontrol listesi
- (5) Bakım & teknik borç

### Sprint 14 — Ana sayfa ve bölüm sayfası tasarımı

- (13) Ana sayfa düzen yenileme (manşet hiyerarşisi, "kapak" kurgusu)
- (13) Düzenlenebilir ana sayfa blokları (editör kontrollü modüller)
- (8) Bölüm sayfası zenginleştirme (öne çıkanlar + akış + alt bölümler)
- (13) "En çok okunanlar" ve "editörün seçimi" modülleri
- (8) Sticky/akıllı navigasyon ve mega menü
- (5) Bakım & teknik borç

### Sprint 15 — Makale okuma deneyimi

- (13) Makale tipografisi ve okuma genişliği optimizasyonu
- (8) Okuma ilerleme çubuğu + tahmini süre
- (13) Sanat yönetimi: kahraman görsel düzenleri, alt yazı/atıf görünümü
- (13) Paylaşım bileşeni + alıntı vurgulama (highlight-to-share)
- (8) Faz 3 retro + tasarım sürümü v0.4
- (5) Bakım & teknik borç

---

# FAZ 4 — SEO, Performans & Erişilebilirlik (Sprint 16–20)

> Amaç: Keşfedilebilirlik, hız ve herkes için erişilebilirlik — bir haber
> sitesinin güven ve büyüme temeli.

### Sprint 16 — Yapısal veri ve teknik SEO

- (13) JSON-LD: `NewsArticle`, `Organization`, `BreadcrumbList`, `Person`
- (8) Kanonik URL'ler, hreflang hazırlığı, meta robots yönetimi
- (13) Otomatik OG/Twitter görsel üretimi (her makale için dinamik kart)
- (8) XML haritası bölümleme + Google News sitemap
- (13) Kırıntı navigasyonu (breadcrumbs) + iç bağlantı stratejisi
- (5) Bakım & teknik borç

### Sprint 17 — Arama motoru ve haber dizini entegrasyonu

- (13) Google News Publisher Center + Search Console kurulum/doğrulama
- (8) Bing Webmaster + IndexNow anlık dizinleme
- (13) Yapılandırılmış RSS/Atom genişletme (tam metin, medya enclosure)
- (8) `sitemap` öncelik/sıklık ayarı + son değişiklik damgaları
- (13) İçerik için SEO içerik denetimi ve eksik meta düzeltme
- (5) Bakım & teknik borç

### Sprint 18 — Performans optimizasyonu

- (13) Responsive görseller: Astro `<Image>`/`<Picture>`, AVIF/WebP, `srcset`
- (13) Görsel CDN/dönüştürme hattı entegrasyonu
- (8) Kritik CSS, kullanılmayan CSS temizliği, JS azaltma
- (13) Önbellek stratejisi: edge cache, immutable varlıklar, prefetch
- (8) Core Web Vitals optimizasyonu (LCP/CLS/INP) ölçüm + düzeltme
- (5) Bakım & teknik borç

### Sprint 19 — Erişilebilirlik (WCAG 2.2 AA)

- (13) Tam erişilebilirlik denetimi (axe + manuel klavye/okuyucu testi)
- (13) Klavye navigasyonu, odak yönetimi, skip-link, ARIA düzeltmeleri
- (8) Form/etkileşim erişilebilirliği (etiket, hata, canlı bölge)
- (8) Alternatif metin politikası + foto hattına alt-text alanı
- (13) Erişilebilirlik beyanı sayfası + CI'da otomatik a11y testleri
- (5) Bakım & teknik borç

### Sprint 20 — Uluslararasılaştırma temeli (TR/EN)

- (13) i18n yönlendirme mimarisi (`/en/` rotaları, dil değiştirici)
- (13) Arayüz dizesi çevirisi (UI strings sözlüğü TR/EN)
- (8) İçerik dil eşleştirme (`lang` + çeviri ilişkilendirme)
- (8) hreflang + dile özel sitemap/RSS
- (13) Faz 4 retro + sürüm v0.5 (SEO/perf/a11y temel hedefleri karşılandı)
- (5) Bakım & teknik borç

---

# FAZ 5 — Okur Deneyimi & Etkileşim (Sprint 21–25)

> Amaç: Tek seferlik ziyaretçiyi sadık okura çevirmek; arama, bülten, paylaşım
> ve kişisel araçlarla bağ kurmak.

### Sprint 21 — Site içi arama

- (21) İstemci-içi arama (Pagefind) — indeks, UI, klavye kısayolları
- (13) Arama sonuç sayfası (bölüm/etiket/tarih filtreleri)
- (8) Otomatik tamamlama ve son aramalar
- (13) "Sonuç yok" + öneri akışı, popüler aramalar
- (5) Bakım & teknik borç

### Sprint 22 — Bülten (newsletter)

- (13) E-posta sağlayıcı entegrasyonu (Buttondown/Listmonk) + onaylı kayıt
- (13) `Newsletter.astro` bileşeni iyileştirme + çift opt-in akışı
- (8) Otomatik haftalık özet bülteni (RSS→e-posta şablonu)
- (8) Bülten arşivi sayfası + abone yönetimi
- (13) KVKK/PIPEDA uyumlu izin, abonelikten çıkış, tercih merkezi
- (5) Bakım & teknik borç

### Sprint 23 — Sosyal ve paylaşım büyümesi

- (13) Zengin paylaşım kartları + kopyalanabilir alıntı görselleri
- (8) Sosyal otomasyon (yeni makale → sosyal kuyruğa, webhook)
- (13) Gömülebilir alıntı/widget (diğer sitelerin gömmesi için)
- (8) WhatsApp/Telegram paylaşım (diaspora kanalları için öncelikli)
- (13) "Bu hikayeyi takip et" ve yazar/konu takibi temeli
- (5) Bakım & teknik borç

### Sprint 24 — Okur araçları ve kişisel kayıt

- (13) Yer imleri / "sonra oku" (yerel + hesapla senkron hazırlığı)
- (8) Okuma geçmişi ve "kaldığın yerden devam et"
- (13) Yazdır/PDF dışa aktarma (rehberler için "kaydet")
- (13) Erişilebilir font boyutu/okuma modu tercihleri
- (8) Bildirim tercihleri temeli (web push hazırlığı)
- (5) Bakım & teknik borç

### Sprint 25 — Geri bildirim ve etkileşim

- (13) "Editöre mektup" / ipucu gönderme formu (spam korumalı)
- (8) Sayfa içi geri bildirim ("Bu yararlı mıydı?") + analitik
- (13) Düzeltme bildirme akışı + şeffaf düzeltme günlüğü
- (8) Anket/oylama bileşeni (hafif, gizlilik dostu)
- (13) Faz 5 retro + sürüm v0.6
- (5) Bakım & teknik borç

---

# FAZ 6 — Hesaplar, Üyelik & Kişiselleştirme (Sprint 26–30)

> Amaç: Kimlik ve kişiselleştirme katmanı — gelir ve topluluk için ön koşul.
> Bu fazda site hibrit SSR/edge mimariye geçer.

### Sprint 26 — Hibrit mimariye geçiş

- (21) SSR/edge adaptörü entegrasyonu (Netlify/Vercel adapter) + statik+dinamik karışım
- (13) Edge fonksiyon iskeleti + oturum/çerez yönetimi temeli
- (13) Veritabanı seçimi ve kurulumu (Supabase/Turso) + şema göçleri
- (8) Gizlilik-öncelikli veri modeli ve saklama politikası
- (5) Bakım & teknik borç

### Sprint 27 — Kimlik doğrulama

- (13) Kimlik doğrulama (magic link + OAuth: Google/Apple)
- (13) Hesap oluşturma, oturum, güvenli çıkış, oturum yenileme
- (8) Profil yönetimi sayfası (ad, dil, şehir, ilgi alanları)
- (8) Hesap güvenliği (rate limit, şüpheli giriş, e-posta doğrulama)
- (13) GDPR/PIPEDA: veri indirme/silme (hesap self-servis)
- (5) Bakım & teknik borç

### Sprint 28 — Kayıtlı okur değeri

- (13) Sunucu-senkron yer imleri, takipler, okuma listesi
- (13) Kişisel ana sayfa ("Senin için" — bölüm/etiket tercihine göre)
- (8) Takip edilen konular için e-posta/özet
- (13) Okuma duvarı temeli (metered: ücretsiz makale sayacı)
- (8) Hoş geldin akışı / onboarding (ilgi seçimi)
- (5) Bakım & teknik borç

### Sprint 29 — Bildirimler

- (13) Web push bildirim altyapısı (son haber/takip edilen konu)
- (8) Bildirim tercih merkezi (kanal/sıklık)
- (13) E-posta bildirim motoru (olay tetikli şablonlar)
- (8) Son dakika/uyarı yayını (editör tetikli push)
- (13) Bildirim analitiği ve teslim güvenilirliği
- (5) Bakım & teknik borç

### Sprint 30 — Öneri ve kişiselleştirme motoru

- (13) İçerik öneri motoru (etiket/bölüm/okuma geçmişi temelli)
- (13) "İlgini çekebilir" + akış sıralama
- (8) Trend algoritması (zaman ağırlıklı popülerlik)
- (8) A/B test çerçevesi (başlık/modül denemeleri)
- (13) Faz 6 retro + sürüm v0.7 (hesaplar canlı)
- (5) Bakım & teknik borç

---

# FAZ 7 — Gelir & Ticarileşme (Sprint 31–35)

> Amaç: Sürdürülebilirlik. Bağımsız gazeteciliği finanse edecek çoklu gelir
> kaynakları — okur destekli model öncelikli.

### Sprint 31 — Bağış ve okur desteği

- (13) Tek seferlik bağış akışı (Stripe) + teşekkür/makbuz
- (13) Tekrarlayan destek (aylık/yıllık üyelik planları)
- (8) Destekçi rozeti ve teşekkür sayfası
- (8) Kampanya/hedef göstergesi bileşeni
- (13) Vergi makbuzu/fatura ve ödeme webhook güvenilirliği
- (5) Bakım & teknik borç

### Sprint 32 — Üyelik ve premium

- (13) Üyelik katmanları (ücretsiz/destekçi/premium) yetkilendirme
- (13) Premium içerik kapısı + okuma duvarı entegrasyonu
- (8) Üye avantajları (reklamsız, erken erişim, özel bülten)
- (13) Abonelik yönetimi (yükselt/düşür/iptal, ödeme güncelleme)
- (8) Müşteri portalı (Stripe Billing) entegrasyonu
- (5) Bakım & teknik borç

### Sprint 33 — Reklam ve sponsorluk altyapısı

- (13) Gizlilik dostu reklam yuvaları (yerel/doğrudan satış öncelikli)
- (8) Sponsorlu içerik şablonu + şeffaf etiketleme
- (13) Reklam yönetim paneli (kampanya/yerleşim/dönem)
- (8) Reklam performans raporu (gösterim/tıklama, sunucu-taraflı)
- (13) Reklamların performans/CLS bütçesine uyumu (lazy, rezerve alan)
- (5) Bakım & teknik borç

### Sprint 34 — İş ve diaspora pazarı

- (13) Türk işletme rehberi/dizini (sponsorlu listeleme modeli)
- (13) Sınıflandırılmış ilanlar (iş, konut, hizmet) — moderasyonlu
- (8) İlan gönderme + ödeme (öne çıkarma) akışı
- (8) Dizin arama/filtre (şehir/kategori)
- (13) İşletme profili sahiplenme ve doğrulama
- (5) Bakım & teknik borç

### Sprint 35 — Gelir operasyonu ve analitik

- (13) Gelir panosu (MRR, dönüşüm, churn, LTV)
- (8) Ödeme başarısızlığı kurtarma (dunning) akışı
- (13) Dönüşüm optimizasyonu (paywall/bağış A/B testleri)
- (8) Muhasebe/raporlama dışa aktarma
- (13) Faz 7 retro + sürüm v1.0 (ticari olarak sürdürülebilir)
- (5) Bakım & teknik borç

---

# FAZ 8 — Çoklu Ortam & Etkileşimli Gazetecilik (Sprint 36–40)

> Amaç: Metnin ötesine geçmek — video, ses, veri görselleştirme ve etkileşimli
> anlatımla profesyonel haber odası kalitesi.

### Sprint 36 — Görsel ve foto gazeteciliği

- (13) Foto galeri/lightbox bileşeni (klavye + dokunma)
- (13) Foto öyküsü (photo essay) şablonu
- (8) Görsel atıf/lisans yönetimi genişletme (`photo-credits.json`)
- (8) Harita gömme (etkileşimli, gizlilik dostu)
- (13) Önce/sonra ve karşılaştırma görsel bileşenleri
- (5) Bakım & teknik borç

### Sprint 37 — Video

- (13) Video oynatıcı (lazy, gizlilik dostu gömme, altyazı)
- (8) Video makale şablonu + bölüm
- (13) Kısa video/dikey format desteği (sosyal kesitler)
- (8) Video transkript + altyazı (erişilebilirlik + SEO)
- (13) Video sitemap + yapısal veri (`VideoObject`)
- (5) Bakım & teknik borç

### Sprint 38 — Podcast / ses

- (13) Podcast altyapısı (bölüm koleksiyonu + ses oynatıcı)
- (13) Podcast RSS akışı (Apple/Spotify uyumlu)
- (8) Makale sesli okuma (TTS) seçeneği
- (8) Bölüm sayfaları + transkript
- (13) Podcast sayfası/abone akışı + `PodcastEpisode` yapısal veri
- (5) Bakım & teknik borç

### Sprint 39 — Veri gazeteciliği ve görselleştirme

- (13) Grafik/çizelge bileşen kütüphanesi (erişilebilir, statik+etkileşimli)
- (13) Veri tablosu bileşeni (sırala/filtre/dışa aktar)
- (8) Veri kaynağı şeffaflığı (kaynak/metodoloji notu)
- (13) Etkileşimli açıklayıcı (scrollytelling) şablonu
- (8) Göç/maliyet hesaplayıcıları (etkileşimli araçlar)
- (5) Bakım & teknik borç

### Sprint 40 — Canlı ve zaman duyarlı içerik

- (13) Canlı blog / gelişen olay akışı şablonu
- (8) Son dakika şeridi + uyarı sistemi
- (13) Etkinlik takvimi (diaspora etkinlikleri) + iCal dışa aktarma
- (13) Hava/saat şeridi (Kanada şehirleri — `site.cities`)
- (8) Faz 8 retro + sürüm v1.1
- (5) Bakım & teknik borç

---

# FAZ 9 — Topluluk, Servisler & Diaspora Faydası (Sprint 41–45)

> Amaç: Gazeteyi diasporanın günlük hayatında vazgeçilmez bir servis platformuna
> dönüştürmek; topluluk katılımını güvenli şekilde açmak.

### Sprint 41 — Yorum ve topluluk tartışması

- (13) Moderasyonlu yorum sistemi (hesap gerekli, eşik onayı)
- (13) Moderasyon paneli (kuyruk, yasaklı kelime, raporlama)
- (8) Yorum bildirimleri + iş parçacığı (thread) görünümü
- (8) Tepki/oylama (gizlilik dostu)
- (13) Topluluk kuralları + otomatik kötüye kullanım tespiti
- (5) Bakım & teknik borç

### Sprint 42 — Diaspora hizmet araçları

- (13) Etkileşimli kontrol listeleri (yerleşim adımları — kaydedilebilir)
- (13) Belge/randevu rehberi araçları (IRCC/CRA/konsolosluk bağlantı merkezi)
- (8) Şehir rehberi şablonu (Toronto/Montréal/... derinlik)
- (13) Maliyet/karşılaştırma hesaplayıcıları (yaşam maliyeti, kredi skoru)
- (8) Kaynak doğrulama ve "son güncelleme" güveni
- (5) Bakım & teknik borç

### Sprint 43 — Topluluk dizini ve etkinlikler

- (13) Dernek/kurum dizini (doğrulanmış profiller)
- (13) Etkinlik gönderme (topluluk kaynaklı, moderasyonlu)
- (8) Etkinlik detay + hatırlatma/takvim ekleme
- (8) Mekan/hizmet haritası entegrasyonu
- (13) Topluluk takvimi widget + bülten entegrasyonu
- (5) Bakım & teknik borç

### Sprint 44 — Katılımcı gazetecilik

- (13) Okur ipucu/haber kaynağı güvenli gönderim portalı
- (8) Anonim/güvenli iletişim (SecureDrop-benzeri hafif kanal)
- (13) Topluluk katkı akışı (vatandaş gazeteciliği — editör onaylı)
- (8) Anket/araştırma toplama aracı (gizlilik dostu)
- (13) UGC moderasyon ve atıf/onam yönetimi
- (5) Bakım & teknik borç

### Sprint 45 — Erişim ve kapsayıcılık genişletme

- (13) Tam EN içerik paritesi + çeviri iş akışı operasyonelleştirme
- (8) Düşük bant genişliği / "lite" mod
- (13) Sesli/ekran okuyucu deneyimi derin testi + iyileştirme
- (8) Offline okuma (servis worker, kaydedilen makaleler)
- (13) Faz 9 retro + sürüm v1.2
- (5) Bakım & teknik borç

---

# FAZ 10 — Ölçek, Güvenilirlik, Veri & Haber Odası Ops (Sprint 46–50)

> Amaç: Profesyonel bir yayın organı gibi çalıştırmak — güvenilir altyapı,
> veri-bilgili kararlar, editöryel standartlar ve gelecek hazırlığı.

### Sprint 46 — Analitik ve karar altyapısı

- (13) Gizlilik dostu analitik (Plausible/Umami) — kendi barındırma
- (13) Haber odası panosu (okunma, tamamlanma, kaynak, abone dönüşümü)
- (8) İçerik performans raporları (yazar/bölüm/konu)
- (8) Olay izleme şeması (gizliliğe saygılı, onaya bağlı)
- (13) Veri ambarı/dışa aktarma + haftalık otomatik rapor
- (5) Bakım & teknik borç

### Sprint 47 — Güvenlik ve uyum sertleştirme

- (13) Güvenlik denetimi (OWASP, bağımlılık, edge fonksiyon)
- (13) CSP, güvenlik başlıkları, rate limiting, bot/DDoS koruması
- (8) Sır yönetimi ve anahtar rotasyonu
- (8) Çerez onayı/izin yönetimi (PIPEDA/GDPR) + tercih kalıcılığı
- (13) Penetrasyon testi düzeltmeleri + güvenlik runbook
- (5) Bakım & teknik borç

### Sprint 48 — Güvenilirlik ve ölçeklenme

- (13) Yük testi + edge/CDN önbellek stratejisi sertleştirme
- (13) Yedekleme/geri yükleme + felaket kurtarma tatbikatı
- (8) Veritabanı performans/indeksleme + bağlantı havuzu
- (8) Görüntü/medya depolama ölçeklenmesi (R2/S3)
- (13) SLO/SLA tanımı + alarm ve nöbet (on-call) süreci
- (5) Bakım & teknik borç

### Sprint 49 — Editöryel standartlar ve güven

- (13) Künye/etik ilkeleri/standartlar sayfaları (şeffaflık)
- (8) Kaynak ve çıkar çatışması açıklama sistemi
- (13) Düzeltme/itibar politikası + halkın editörü (ombudsman) akışı
- (8) Yapısal veri güven sinyalleri (yazar uzmanlığı, atıf)
- (13) Arşiv bütünlüğü (kalıcı bağlantı, versiyon geçmişi, alıntı)
- (5) Bakım & teknik borç

### Sprint 50 — Mobil/PWA, lansman ve gelecek

- (13) PWA: yüklenebilir uygulama, offline kabuk, push birleştirme
- (13) Mobil deneyim derin cilalama + dokunma hedefleri
- (8) Tam Lighthouse/CWV/erişilebilirlik final denetimi (yeşil tahta)
- (8) v2.0 lansman: basın bülteni, açılış kampanyası, SEO son kontrol
- (13) Program retrospektifi + sonraki yıl yol haritası + devir teslim dokümanı
- (5) Bakım & teknik borç

---

## 4. Riskler ve önlemler

| Risk                                 | Etki   | Önlem                                                       |
| ------------------------------------ | ------ | ----------------------------------------------------------- |
| Statik→hibrit geçiş karmaşıklığı     | Yüksek | Faz 6'da izole, geri alınabilir adımlar; özellik bayrakları |
| Tek geliştirici darboğazı            | Orta   | Erken CI/test (Faz 1), dokümantasyon, çift inceleme         |
| İçerik üretimi velocity'ye yetişemez | Yüksek | Faz 2 CMS + Faz 2/10 editöryel ops; harici yazar ağı        |
| Gizlilik/yasal uyum (PIPEDA/GDPR)    | Yüksek | Her veri-toplayan fazda uyum kalemi gömülü                  |
| Gelir hedeflerinin gecikmesi         | Orta   | Okur-destekli model öncelik (Faz 7 erken bağış)             |
| Performans regresyonu                | Orta   | Lighthouse CI bütçeleri (Sprint 3'ten itibaren kapı)        |

## 5. Kuzey yıldızı metrikleri

- **Güven:** düzeltme oranı, kaynak şeffaflığı, erişilebilirlik skoru (AA+)
- **Erişim:** aylık tekil okur, organik trafik, Google News görünürlüğü
- **Bağlılık:** dönen okur oranı, bülten aboneleri, tamamlanma oranı
- **Sürdürülebilirlik:** destekçi/üye sayısı, MRR, gelir çeşitliliği
- **Kalite:** Core Web Vitals (yeşil), Lighthouse ≥95, sıfır kritik a11y hatası

## 6. Backlog yönetimi notu

Bu plan **yaşayan bir belgedir**. Her sprint sonunda velocity ölçülüp
kalibre edilmeli; her faz sonu retrospektifte sonraki fazın kapsamı
gerçek verilere göre yeniden önceliklendirilmelidir. Story point'ler
göreceli tahmindir, taahhüt değildir.
