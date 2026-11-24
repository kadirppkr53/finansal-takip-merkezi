// --- 1. KALICI VERİ (LocalStorage) ---
const STORAGE_KEY = "kullanicilar";

export const getKullanicilar = () => {
  try {
    const veri = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(veri) ? veri : [];
  } catch {
    return [];
  }
};

export const saveKullanicilar = (kullanicilar) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kullanicilar));
};

// --- 2. DÖVİZ KURU ---
// Yalnızca hiç kur alınamamışsa kullanılır (Kasım 2026 itibarıyla yaklaşık değer).
export const VARSAYILAN_KUR = 50;

const KUR_ANAHTARI = "sonKur";

/** En son başarıyla alınan kur: { kur, zaman } ya da null. */
export const getKayitliKur = () => {
  try {
    const veri = JSON.parse(localStorage.getItem(KUR_ANAHTARI));
    const kur = Number(veri?.kur);
    if (!Number.isFinite(kur) || kur <= 0) return null;
    return { kur, zaman: typeof veri.zaman === "string" ? veri.zaman : null };
  } catch {
    return null;
  }
};

/** Canlı kuru çeker; başarılıysa servis kesildiğinde kullanılmak üzere saklar. */
export const getDolarKuru = async () => {
  const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
  if (!res.ok) throw new Error("Kur servisi yanıt vermedi.");
  const data = await res.json();
  const kur = Number(data?.rates?.TRY);
  if (!Number.isFinite(kur) || kur <= 0) throw new Error("Geçersiz kur.");
  try {
    localStorage.setItem(
      KUR_ANAHTARI,
      JSON.stringify({ kur, zaman: new Date().toISOString() }),
    );
  } catch {
    // Depolama doluysa ya da kapalıysa kur yine de kullanılır.
  }
  return kur;
};

// --- 3. PERİYOT VE FİLTRELEME ---
export const PERIYOTLAR = [
  { id: "gunluk", label: "Günlük", baslik: "Bugün" },
  { id: "haftalik", label: "Haftalık", baslik: "Son 7 Gün" },
  { id: "aylik", label: "Aylık", baslik: "Bu Ay" },
  { id: "tum", label: "Tümü", baslik: "Tüm Zamanlar" },
];

/** Ayları tek bir sayıyla kıyaslamak için: yıl * 12 + ay. */
const ayIndeksi = (t) => t.getFullYear() * 12 + t.getMonth();

/** Bu aya göre `ofset` ay ötedeki ayın etiketleri (0 = bu ay, -1 = geçen ay). */
export const ayBilgisi = (ofset = 0) => {
  const simdi = new Date();
  const t = new Date(simdi.getFullYear(), simdi.getMonth() + ofset, 1);
  return {
    ofset,
    indeks: ayIndeksi(t),
    etiket: t.toLocaleDateString("tr-TR", { month: "long", year: "numeric" }),
    kisa: t.toLocaleDateString("tr-TR", { month: "short" }),
  };
};

export const periyotBasligi = (id, ayOfseti = 0) =>
  id === "aylik" && ayOfseti !== 0
    ? ayBilgisi(ayOfseti).etiket
    : (PERIYOTLAR.find((p) => p.id === id)?.baslik ?? "");

/** En eski kaydın bulunduğu ayın ofseti (kayıt yoksa 0). */
export const enEskiAyOfseti = (kayitlar) => {
  const buAy = ayIndeksi(new Date());
  let enEski = 0;
  for (const k of kayitlar ?? []) {
    const t = new Date(k.tarih || Date.now());
    if (Number.isNaN(t.getTime())) continue;
    enEski = Math.min(enEski, ayIndeksi(t) - buAy);
  }
  return enEski;
};

/** Son `adet` ayın gider ve gelir toplamları, eskiden yeniye. */
export const aylikOzet = (kayitlar, adet = 6) => {
  const aylar = Array.from({ length: adet }, (_, i) => ({
    ...ayBilgisi(i - adet + 1),
    gider: 0,
    gelir: 0,
  }));
  const ilk = aylar[0].indeks;
  for (const k of kayitlar ?? []) {
    const sira = ayIndeksi(new Date(k.tarih || Date.now())) - ilk;
    if (!(sira >= 0 && sira < adet)) continue;
    aylar[sira][k.tur === "gelir" ? "gelir" : "gider"] += Number(k.tutar) || 0;
  }
  return aylar;
};

/** "aylik" periyodunda `ayOfseti` ile geçmiş bir ay seçilebilir. */
export const filtreleHarcamalar = (harcamalar, periyot, ayOfseti = 0) => {
  if (!harcamalar?.length) return [];
  if (periyot === "tum") return harcamalar;

  const simdi = new Date();
  const hedefAy = ayIndeksi(simdi) + ayOfseti;
  // Not: "simdi" asla mutasyona uğratılmaz; her kıyas için ayrı kopya kullanılır.
  const yediGunOnce = new Date(simdi);
  yediGunOnce.setDate(simdi.getDate() - 7);
  yediGunOnce.setHours(0, 0, 0, 0);

  return harcamalar.filter((h) => {
    const tarih = new Date(h.tarih || Date.now());
    switch (periyot) {
      case "gunluk":
        return tarih.toDateString() === simdi.toDateString();
      case "haftalik":
        return tarih >= yediGunOnce;
      case "aylik":
        return ayIndeksi(tarih) === hedefAy;
      default:
        return true;
    }
  });
};

// --- 4. BİÇİMLENDİRME ---
const tlFormat = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 2,
});
const usdFormat = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const formatTL = (n) => tlFormat.format(Number(n) || 0);
export const formatUSD = (n) => usdFormat.format(Number(n) || 0);

export const formatTarih = (iso) =>
  new Date(iso || Date.now()).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/**
 * "1.250,50", "1250.5", "50d", "20$" gibi girdileri çözümler.
 * Dönüş: { deger: number | null, dolarMi: boolean }
 */
export const parseTutar = (ham) => {
  const metin = String(ham ?? "")
    .trim()
    .toLowerCase();
  const dolarMi = /\$|usd|d$/.test(metin);
  let sayiMetni = metin.replace(/[^\d.,-]/g, "");

  if (sayiMetni.includes(",") && sayiMetni.includes(".")) {
    // Türkçe biçim: binlik ayırıcı nokta, ondalık virgül
    sayiMetni = sayiMetni.replace(/\./g, "").replace(",", ".");
  } else if (sayiMetni.includes(",")) {
    sayiMetni = sayiMetni.replace(",", ".");
  } else if (/^-?\d{1,3}(\.\d{3})+$/.test(sayiMetni)) {
    // Yalnızca binlik ayırıcı: "10.000" on bindir, on değil.
    sayiMetni = sayiMetni.replace(/\./g, "");
  }

  const deger = parseFloat(sayiMetni);
  return { deger: Number.isFinite(deger) ? deger : null, dolarMi };
};

/** Kayıtlı bir tutarı, parseTutar'ın geri okuyabileceği biçimde giriş alanına yazar. */
export const tutarGirdisi = (n) =>
  String(Math.round((Number(n) || 0) * 100) / 100).replace(".", ",");

// --- 5. TARİH GİRİŞİ ---
const ikiHane = (n) => String(n).padStart(2, "0");

/** ISO tarihini <input type="date"> değerine (yerel gün, YYYY-AA-GG) çevirir. */
export const tarihInputDegeri = (iso) => {
  const aday = iso ? new Date(iso) : new Date();
  const t = Number.isNaN(aday.getTime()) ? new Date() : aday;
  return `${t.getFullYear()}-${ikiHane(t.getMonth() + 1)}-${ikiHane(t.getDate())}`;
};

/**
 * Seçilen günü (YYYY-AA-GG) kayıt için ISO tarihine çevirir.
 * Gün değişmediyse eski saat korunur; bugünse şu anki saat, geçmiş günse öğlen kullanılır.
 */
export const tarihOlustur = (gun, eskiIso) => {
  if (eskiIso && tarihInputDegeri(eskiIso) === gun) return eskiIso;
  if (gun === tarihInputDegeri()) return new Date().toISOString();
  const [yil, ay, gunNo] = gun.split("-").map(Number);
  return new Date(yil, ay - 1, gunNo, 12).toISOString();
};

/** Bugün dahil, ay sonuna kadar kalan gün sayısı. */
export const aydaKalanGun = () => {
  const simdi = new Date();
  const sonGun = new Date(
    simdi.getFullYear(),
    simdi.getMonth() + 1,
    0,
  ).getDate();
  return sonGun - simdi.getDate() + 1;
};
