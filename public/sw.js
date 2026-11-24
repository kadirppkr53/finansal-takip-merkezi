// Finansal Takip Merkezi - service worker
// Amaç: uygulama bir kez açıldıktan sonra internet olmadan da açılabilsin.
// Kullanıcı verileri zaten tarayıcıda (localStorage) durur; burada yalnızca
// uygulamanın kendi dosyaları önbelleğe alınır.
//
// Strateji:
//   Sayfa (index.html)   -> önce ağ, olmazsa önbellek (yeni sürüm hemen görünür)
//   /assets/* (özetli ad) -> önce önbellek (içerik değişince ad da değişir)
//   Diğer kendi dosyaları -> önbellekten ver, arka planda tazele
//   Google Fonts          -> önbellekten ver, arka planda tazele
//   Başka her şey (kur servisi vb.) -> dokunulmaz

const ONBELLEK = "ftm-v1";
const SAYFA = "/";
const SABIT_DOSYALAR = ["/manifest.webmanifest", "/icon.svg", "/icon-192.png"];
const FONT_SUNUCULARI = ["fonts.googleapis.com", "fonts.gstatic.com"];
// Eski sürümlerin derleme dosyaları birikmesin diye tutulacak en fazla /assets/ kaydı.
const EN_FAZLA_VARLIK = 12;
// Sunucu "Vary: Origin" gönderse bile eşleşsin: modül betikleri Origin başlığıyla
// istenir, önbelleğe alırken bu başlık yoktur; dosyanın içeriği ise aynıdır.
const ESLESME = { ignoreVary: true };

/** index.html içinde geçen /assets/... adreslerini bulur. */
const varliklariBul = (html) => [
  ...new Set([...html.matchAll(/["'](\/assets\/[^"']+)["']/g)].map((m) => m[1])),
];

self.addEventListener("install", (olay) => {
  olay.waitUntil(
    (async () => {
      const onbellek = await caches.open(ONBELLEK);
      // Sayfa ilk açıldığında derleme dosyaları service worker devreye girmeden
      // indirilmiş olur; çevrimdışı açılış için burada ayrıca önbelleğe alınır.
      const yanit = await fetch(SAYFA, { cache: "no-store" });
      if (!yanit.ok) throw new Error("Sayfa alınamadı");
      const html = await yanit.clone().text();
      await onbellek.put(SAYFA, yanit);
      await onbellek.addAll([...varliklariBul(html), ...SABIT_DOSYALAR]);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (olay) => {
  olay.waitUntil(
    (async () => {
      const adlar = await caches.keys();
      await Promise.all(
        adlar
          .filter((ad) => ad.startsWith("ftm-") && ad !== ONBELLEK)
          .map((ad) => caches.delete(ad)),
      );
      await self.clients.claim();
    })(),
  );
});

const eskiVarliklariTemizle = async (onbellek) => {
  const varliklar = (await onbellek.keys()).filter((istek) =>
    new URL(istek.url).pathname.startsWith("/assets/"),
  );
  // keys() ekleme sırasıyla döner: baştakiler en eskidir.
  const fazla = varliklar.slice(0, Math.max(0, varliklar.length - EN_FAZLA_VARLIK));
  await Promise.all(fazla.map((istek) => onbellek.delete(istek)));
};

const sayfayiGetir = async (istek) => {
  const onbellek = await caches.open(ONBELLEK);
  try {
    const yanit = await fetch(istek);
    if (yanit.ok) await onbellek.put(SAYFA, yanit.clone());
    return yanit;
  } catch {
    const kayitli = await onbellek.match(SAYFA, ESLESME);
    if (kayitli) return kayitli;
    throw new Error("Çevrimdışı ve önbellekte sayfa yok");
  }
};

const onceOnbellek = async (istek) => {
  const onbellek = await caches.open(ONBELLEK);
  const kayitli = await onbellek.match(istek, ESLESME);
  if (kayitli) return kayitli;
  const yanit = await fetch(istek);
  if (yanit.ok) {
    await onbellek.put(istek, yanit.clone());
    await eskiVarliklariTemizle(onbellek);
  }
  return yanit;
};

const onbellektenVerTazele = async (istek, olay, opakKabul = false) => {
  const onbellek = await caches.open(ONBELLEK);
  const kayitli = await onbellek.match(istek, ESLESME);
  const tazele = fetch(istek)
    .then((yanit) => {
      if (yanit.ok || (opakKabul && yanit.type === "opaque"))
        return onbellek.put(istek, yanit.clone()).then(() => yanit);
      return yanit;
    })
    .catch(() => null);

  if (kayitli) {
    olay.waitUntil(tazele);
    return kayitli;
  }
  const yanit = await tazele;
  if (yanit) return yanit;
  throw new Error("Çevrimdışı ve önbellekte yok");
};

self.addEventListener("fetch", (olay) => {
  const istek = olay.request;
  if (istek.method !== "GET") return;
  const url = new URL(istek.url);

  if (FONT_SUNUCULARI.includes(url.hostname)) {
    olay.respondWith(onbellektenVerTazele(istek, olay, true));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (istek.mode === "navigate") olay.respondWith(sayfayiGetir(istek));
  else if (url.pathname.startsWith("/assets/")) olay.respondWith(onceOnbellek(istek));
  else olay.respondWith(onbellektenVerTazele(istek, olay));
});
