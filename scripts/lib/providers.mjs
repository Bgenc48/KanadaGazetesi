import { USER_AGENT } from './optimize.mjs';
import { HERO_WIDTH } from './config.mjs';

/* ----------------------------- yardımcılar ----------------------------- */

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#0*60;|&lt;/g, '<')
    .replace(/&#0*62;|&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&') // &amp; en son çözülür
    .replace(/\s+/g, ' ')
    .trim();
}

function extractHref(html) {
  const m = String(html || '').match(/href="([^"]+)"/);
  if (!m) return '';
  let href = m[1];
  if (href.startsWith('//')) href = 'https:' + href;
  return href;
}

function humanLicense(code, version) {
  const c = String(code || '').toLowerCase();
  if (!c) return '';
  if (c === 'cc0') return 'CC0';
  if (c === 'pdm' || c === 'pd') return 'Public Domain';
  const v = version ? ` ${version}` : '';
  return `CC ${c.toUpperCase()}${v}`;
}

async function getJson(url, headers = {}) {
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, Accept: 'application/json', ...headers },
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/* ------------------------------ Openverse ------------------------------ */
// Anahtarsız. Ticari + değiştirilebilir lisanslarla sınırlanır.
async function openverse(query, { limit }) {
  const params = new URLSearchParams({
    q: query,
    license_type: 'commercial,modification',
    page_size: String(limit),
    mature: 'false',
  });
  const json = await getJson(`https://api.openverse.org/v1/images/?${params}`);
  return (json.results || []).map((r) => ({
    imageUrl: r.url,
    width: r.width ?? null,
    height: r.height ?? null,
    author: stripHtml(r.creator || ''),
    authorUrl: r.creator_url || '',
    sourceUrl: r.foreign_landing_url || '',
    title: r.title || '',
    license: humanLicense(r.license, r.license_version),
    licenseCode: String(r.license || '').toLowerCase(),
    licenseUrl: r.license_url || '',
    provider: 'Openverse',
    attribution: r.attribution || '',
  }));
}

/* --------------------------- Wikimedia Commons -------------------------- */
// Anahtarsız. Lisans sunucuda filtrelenemez → istemcide süzülür.
async function wikimedia(query, { limit }) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: query,
    gsrnamespace: '6',
    gsrlimit: String(limit),
    prop: 'imageinfo',
    iiprop: 'url|extmetadata|size|mime',
    iiurlwidth: String(HERO_WIDTH),
  });
  const json = await getJson(`https://commons.wikimedia.org/w/api.php?${params}`);
  const pages = json?.query?.pages || [];
  return pages
    .filter((p) => Array.isArray(p.imageinfo) && p.imageinfo[0])
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .map((p) => {
      const ii = p.imageinfo[0];
      const em = ii.extmetadata || {};
      return {
        imageUrl: ii.thumburl || ii.url,
        width: ii.thumbwidth ?? ii.width ?? null,
        height: ii.thumbheight ?? ii.height ?? null,
        author: stripHtml(em.Artist?.value || ''),
        authorUrl: extractHref(em.Artist?.value || '') || ii.descriptionurl || '',
        sourceUrl: ii.descriptionurl || '',
        title: String(p.title || '').replace(/^File:/, ''),
        license: em.LicenseShortName?.value || '',
        licenseCode: String(em.License?.value || '').toLowerCase(),
        licenseUrl: em.LicenseUrl?.value || '',
        provider: 'Wikimedia Commons',
        mime: ii.mime || '',
      };
    })
    .filter((r) => /image\/(jpe?g|png|webp)/i.test(r.mime || ''));
}

/* -------------------------------- Pexels ------------------------------- */
// Anahtar gerekli (PEXELS_API_KEY). Tek küresel lisans; atıf zorunlu değil.
async function pexels(query, { limit, env }) {
  const key = env.PEXELS_API_KEY;
  if (!key) return [];
  const params = new URLSearchParams({
    query,
    per_page: String(limit),
    orientation: 'landscape',
    size: 'large',
  });
  const json = await getJson(`https://api.pexels.com/v1/search?${params}`, {
    Authorization: key, // ham anahtar, şema yok
  });
  return (json.photos || []).map((p) => ({
    imageUrl: p.src?.large2x || p.src?.original || p.src?.large,
    width: p.width ?? null,
    height: p.height ?? null,
    author: p.photographer || '',
    authorUrl: p.photographer_url || '',
    sourceUrl: p.url || '',
    title: p.alt || '',
    license: 'Pexels License',
    licenseCode: 'pexels',
    licenseUrl: 'https://www.pexels.com/license/',
    provider: 'Pexels',
  }));
}

/* ------------------------------- Unsplash ------------------------------ */
// Anahtar gerekli (UNSPLASH_ACCESS_KEY). İndirme tetikleyici + UTM zorunlu.
async function unsplash(query, { limit, env }) {
  const key = env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];
  const params = new URLSearchParams({
    query,
    per_page: String(limit),
    orientation: 'landscape',
  });
  const json = await getJson(`https://api.unsplash.com/search/photos?${params}`, {
    Authorization: `Client-ID ${key}`,
  });
  return (json.results || []).map((p) => ({
    imageUrl: p.urls?.regular || p.urls?.full,
    width: p.width ?? null,
    height: p.height ?? null,
    author: p.user?.name || '',
    authorUrl: p.user?.links?.html
      ? `${p.user.links.html}?utm_source=KanadaGazetesi&utm_medium=referral`
      : '',
    // Unsplash kuralı: kaynak bağlantısında da UTM zorunlu.
    sourceUrl: p.links?.html
      ? `${p.links.html}?utm_source=KanadaGazetesi&utm_medium=referral`
      : '',
    title: p.alt_description || '',
    license: 'Unsplash License',
    licenseCode: 'unsplash',
    licenseUrl: 'https://unsplash.com/license',
    provider: 'Unsplash',
    downloadTrigger: p.links?.download_location || '',
    _accessKey: key,
  }));
}

/** Unsplash kuralı: kullanılan fotoğraf için indirme uç noktasına ping at. */
export async function triggerUnsplashDownload(candidate) {
  if (candidate.provider !== 'Unsplash' || !candidate.downloadTrigger) return;
  try {
    await fetch(candidate.downloadTrigger, {
      headers: {
        'User-Agent': USER_AGENT,
        Authorization: `Client-ID ${candidate._accessKey}`,
      },
    });
  } catch {
    /* ping başarısız olsa da görsel kullanılabilir; sessiz geç */
  }
}

const REGISTRY = { openverse, wikimedia, pexels, unsplash };

/** İsimle bir sağlayıcının arama fonksiyonunu döner. */
export function getProvider(name) {
  return REGISTRY[name];
}
