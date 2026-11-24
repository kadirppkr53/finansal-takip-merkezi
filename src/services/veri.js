import { harcamaKategorisi } from "./kategoriler";

// --- YEDEKLEME (JSON) ---
const UYGULAMA = "finansal-takip-merkezi";
const YEDEK_SURUMU = 1;

export const yedekOlustur = (kullanicilar) =>
  JSON.stringify(
    {
      uygulama: UYGULAMA,
      surum: YEDEK_SURUMU,
      olusturma: new Date().toISOString(),
      kullanicilar,
    },
    null,
    2,
  );

const idGecerli = (id) =>
  (typeof id === "number" && Number.isFinite(id)) ||
  (typeof id === "string" && id.length > 0);

/** Aynı listede çakışmayan kimlik üretir; geçerli ve benzersiz olanı korur. */
const kimlikVerici = () => {
  const kullanilan = new Set();
  let sayac = Date.now();
  return (id) => {
    let sonuc = idGecerli(id) && !kullanilan.has(id) ? id : sayac++;
    while (kullanilan.has(sonuc)) sonuc = sayac++;
    kullanilan.add(sonuc);
    return sonuc;
  };
};

const temizHarcama = (h, kimlik) => {
  if (!h || typeof h !== "object") return null;
  const ad = typeof h.ad === "string" ? h.ad.trim() : "";
  const tutar = Number(h.tutar);
  if (!ad || !Number.isFinite(tutar) || tutar <= 0) return null;
  const tarih = new Date(h.tarih);
  return {
    id: kimlik(h.id),
    ad,
    tutar,
    tarih: Number.isNaN(tarih.getTime())
      ? new Date().toISOString()
      : tarih.toISOString(),
    kategoriId: typeof h.kategoriId === "string" ? h.kategoriId : null,
  };
};

const temizKullanici = (k, kimlik) => {
  if (!k || typeof k !== "object") return null;
  const ad = typeof k.ad === "string" ? k.ad.trim() : "";
  if (!ad) return null;
  const harcamaKimligi = kimlikVerici();
  const butce = Number(k.butce);
  return {
    id: kimlik(k.id),
    ad,
    butce: Number.isFinite(butce) && butce > 0 ? butce : null,
    harcamalar: (Array.isArray(k.harcamalar) ? k.harcamalar : [])
      .map((h) => temizHarcama(h, harcamaKimligi))
      .filter(Boolean),
  };
};

/**
 * Yedek dosyasının metnini doğrular ve temiz bir kullanıcı listesi döndürür.
 * Dosya güvenilmez kabul edilir: bozuk kayıtlar atılır, eksik alanlar tamamlanır.
 * Geçersiz dosyada kullanıcıya gösterilebilir bir mesajla Error fırlatır.
 */
export const yedekCoz = (metin) => {
  let veri;
  try {
    veri = JSON.parse(metin);
  } catch {
    throw new Error("Dosya okunamadı: geçerli bir JSON değil.");
  }
  const liste = Array.isArray(veri) ? veri : veri?.kullanicilar;
  if (!Array.isArray(liste))
    throw new Error("Bu dosya bir Finansal Takip yedeği değil.");

  const kimlik = kimlikVerici();
  const kullanicilar = liste
    .map((k) => temizKullanici(k, kimlik))
    .filter(Boolean);
  if (!kullanicilar.length)
    throw new Error("Yedekte geçerli bir kullanıcı bulunamadı.");
  return kullanicilar;
};

// --- DIŞA AKTARMA (CSV) ---
const csvHucresi = (deger) => {
  let metin = String(deger ?? "");
  // Excel'in hücreyi formül olarak çalıştırmasını engelle.
  if (/^[=+\-@\t\r]/.test(metin)) metin = `'${metin}`;
  return /[";\n\r]/.test(metin) ? `"${metin.replace(/"/g, '""')}"` : metin;
};

const csvTarihi = (iso) => {
  const t = new Date(iso || Date.now());
  const iki = (n) => String(n).padStart(2, "0");
  return `${iki(t.getDate())}.${iki(t.getMonth() + 1)}.${t.getFullYear()}`;
};

/** Türkçe Excel'in doğrudan açabildiği biçim: noktalı virgül ayırıcı, virgüllü ondalık. */
export const csvOlustur = (harcamalar) =>
  [
    ["Tarih", "Harcama", "Kategori", "Tutar (TL)"],
    ...harcamalar.map((h) => [
      csvTarihi(h.tarih),
      h.ad,
      harcamaKategorisi(h).label,
      (Number(h.tutar) || 0).toFixed(2).replace(".", ","),
    ]),
  ]
    .map((satir) => satir.map(csvHucresi).join(";"))
    .join("\r\n");

// --- DOSYA İNDİRME ---
const HARF_HARITASI = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u" };

/** "Ayşe Yılmaz" -> "ayse-yilmaz": dosya adında güvenle kullanılabilir parça. */
export const dosyaAdiParcasi = (metin) =>
  String(metin ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[çğıöşü]/g, (h) => HARF_HARITASI[h])
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "veri";

export const dosyaIndir = (dosyaAdi, icerik, tur) => {
  const url = URL.createObjectURL(new Blob([icerik], { type: tur }));
  const baglanti = document.createElement("a");
  baglanti.href = url;
  baglanti.download = dosyaAdi;
  document.body.appendChild(baglanti);
  baglanti.click();
  baglanti.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
