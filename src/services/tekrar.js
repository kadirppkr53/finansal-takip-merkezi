// Tekrarlayan kalemler: her ay aynı gün otomatik eklenen gelir/gider kuralları.
//
// Kural: { id, tur, ad, tutar, kategoriId, gun, sonAy }
//   gun   -> ayın kaçıncı günü (1-31); kısa aylarda ayın son gününe çekilir
//   sonAy -> kaydı en son üretilen ay (yıl * 12 + ay)

const ayIndeksi = (t) => t.getFullYear() * 12 + t.getMonth();

// Uygulama uzun süre açılmadıysa geriye dönük en fazla bu kadar ay doldurulur.
const EN_FAZLA_AY = 24;

/** İlk kaydı elle girilmiş bir kalemden kural üretir; o ay "işlenmiş" sayılır. */
export const tekrarOlustur = ({ tur, ad, tutar, kategoriId, tarih }, id) => {
  const t = new Date(tarih);
  return {
    id,
    tur,
    ad,
    tutar,
    kategoriId: kategoriId ?? null,
    gun: t.getDate(),
    sonAy: ayIndeksi(t),
  };
};

/**
 * Günü gelmiş tekrarları kayda dönüştürür (bu ayın günü henüz gelmediyse bekler).
 * Saf fonksiyondur; hiçbir şey değişmediyse aynı diziyi geri verir.
 */
export const tekrarlariIsle = (kullanicilar, simdi = new Date()) => {
  const buAy = ayIndeksi(simdi);
  let degisti = false;

  const sonuc = kullanicilar.map((k) => {
    if (!k.tekrarlar?.length) return k;
    const yeniKayitlar = [];

    const tekrarlar = k.tekrarlar.map((kural) => {
      let sonAy = kural.sonAy;
      const ilkAy = Math.max(sonAy + 1, buAy - EN_FAZLA_AY + 1);

      for (let ay = ilkAy; ay <= buAy; ay++) {
        const yil = Math.floor(ay / 12);
        const ayNo = ay % 12;
        const aydakiGun = new Date(yil, ayNo + 1, 0).getDate();
        const gun = Math.min(kural.gun, aydakiGun);
        if (ay === buAy && gun > simdi.getDate()) break;

        yeniKayitlar.push({
          id: `${kural.id}-${ay}`,
          tur: kural.tur,
          ad: kural.ad,
          tutar: kural.tutar,
          kategoriId: kural.kategoriId ?? null,
          tarih: new Date(yil, ayNo, gun, 12).toISOString(),
          tekrarId: kural.id,
        });
        sonAy = ay;
      }
      return sonAy === kural.sonAy ? kural : { ...kural, sonAy };
    });

    if (!yeniKayitlar.length) return k;
    degisti = true;
    return {
      ...k,
      tekrarlar,
      harcamalar: [...k.harcamalar, ...yeniKayitlar],
    };
  });

  return degisti ? sonuc : kullanicilar;
};
