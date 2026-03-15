// --- 1. VERİ İŞLEMLERİ ---
export const getKullanicilar = () => {
  return JSON.parse(localStorage.getItem("kullanicilar")) || [];
};

export const saveKullanicilar = (kullanicilar) => {
  localStorage.setItem("kullanicilar", JSON.stringify(kullanicilar));
};

// --- 2. DİNAMİK İKON YÖNETİMİ ---
export const getIkonUrl = (ad) => {
  if (!ad) return "https://img.icons8.com/color/96/000000/wallet.png";

  const kucukAd = ad.toLowerCase();

  // İkon setinden en garantili karşılıklar
  let kategori = "bill"; // Varsayılan

  if (
    kucukAd.includes("yemek") ||
    kucukAd.includes("restoran") ||
    kucukAd.includes("cafe")
  )
    kategori = "restaurant";
  else if (
    kucukAd.includes("spor") ||
    kucukAd.includes("fitness") ||
    kucukAd.includes("gym")
  )
    kategori = "dumbbell";
  else if (
    kucukAd.includes("fatura") ||
    kucukAd.includes("elektrik") ||
    kucukAd.includes("su")
  )
    kategori = "invoice";
  else if (
    kucukAd.includes("ulaşım") ||
    kucukAd.includes("yol") ||
    kucukAd.includes("benzin")
  )
    kategori = "taxi";
  else if (
    kucukAd.includes("eğlence") ||
    kucukAd.includes("sinema") ||
    kucukAd.includes("oyun")
  )
    kategori = "popcorn";
  else if (kucukAd.includes("iş") || kucukAd.includes("maaş"))
    kategori = "briefcase";
  else if (kucukAd.includes("market") || kucukAd.includes("pazar"))
    kategori = "shopping-cart";
  else if (kucukAd.includes("sağlık") || kucukAd.includes("doktor"))
    kategori = "clinic";
  else if (kucukAd.includes("giyim") || kucukAd.includes("kıyafet"))
    kategori = "t-shirt";
  else if (kucukAd.includes("market")) kategori = "shopping-basket";

  return `https://img.icons8.com/color/96/000000/${kategori}.png`;
};

// --- 3. DÖVİZ VE ANALİZ ---
export const getDolarKarsiligi = async (tlTutar) => {
  try {
    const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
    const data = await res.json();
    return (tlTutar / data.rates.TRY).toFixed(2);
  } catch (err) {
    return (tlTutar / 32.0).toFixed(2);
  }
};

// --- 4. GRAFİK VE FİLTRELEME ---
export const getGrafikUrl = (harcamalar) => {
  if (!harcamalar?.length) return "";
  const etiketler = harcamalar
    .map((h) => `'${h.ad.replace(/'/g, "")}'`)
    .join(",");
  const veriler = harcamalar.map((h) => h.tutar).join(",");
  const renkler = harcamalar
    .map(() => `'#${Math.floor(Math.random() * 16777215).toString(16)}'`)
    .join(",");

  return `https://quickchart.io/chart?c=${encodeURIComponent(`{type:'pie',data:{labels:[${etiketler}],datasets:[{backgroundColor:[${renkler}],data:[${veriler}]}]}}`)}`;
};

export const filtreleHarcamalar = (harcamalar, periyot) => {
  if (!harcamalar) return [];
  if (periyot === "tum") return harcamalar;
  const simdi = new Date();
  return harcamalar.filter((h) => {
    const hTarih = new Date(h.tarih || new Date());
    if (periyot === "gunluk")
      return hTarih.toDateString() === simdi.toDateString();
    if (periyot === "haftalik")
      return hTarih >= new Date(simdi.setDate(simdi.getDate() - 7));
    if (periyot === "aylik")
      return (
        hTarih.getMonth() === simdi.getMonth() &&
        hTarih.getFullYear() === simdi.getFullYear()
      );
    return true;
  });
};
