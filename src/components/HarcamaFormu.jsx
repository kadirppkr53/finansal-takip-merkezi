import { useState, useEffect, useRef } from "react";
import { LuPlus, LuCheck, LuX } from "react-icons/lu";
import {
  parseTutar,
  formatTL,
  formatTarih,
  tutarGirdisi,
  tarihInputDegeri,
  tarihOlustur,
} from "../services/api";
import { TUM_KATEGORILER, kategoriBul } from "../services/kategoriler";

const EN_ESKI_GUN = "2000-01-01";

export default function HarcamaFormu({ onKaydet, onIptal, duzenlenen, kur }) {
  // Not: Dashboard bu bileşeni `key={duzenlenen?.id}` ile render eder;
  // düzenlenen kayıt değişince form sıfırdan kurulur, effect içinde setState gerekmez.
  const [ad, setAd] = useState(duzenlenen?.ad ?? "");
  const [tutar, setTutar] = useState(
    duzenlenen ? tutarGirdisi(duzenlenen.tutar) : "",
  );
  // Boş değer "otomatik" demektir: kategori harcama adından tahmin edilir.
  const [kategoriId, setKategoriId] = useState(duzenlenen?.kategoriId ?? "");
  const [gun, setGun] = useState(() => tarihInputDegeri(duzenlenen?.tarih));
  const [hata, setHata] = useState("");
  const adRef = useRef(null);
  const tutarRef = useRef(null);
  const gunRef = useRef(null);

  useEffect(() => {
    if (duzenlenen) adRef.current?.focus();
  }, [duzenlenen]);

  const bugun = tarihInputDegeri();
  const gunGecerli = Boolean(gun) && gun >= EN_ESKI_GUN && gun <= bugun;
  const gecmisGun = !duzenlenen && gunGecerli && gun !== bugun;

  const { deger, dolarMi } = parseTutar(tutar);
  const notlar = [
    dolarMi && deger ? `${formatTL(deger * kur)} olarak kaydedilecek` : "",
    gecmisGun ? `Tarih: ${formatTarih(tarihOlustur(gun))}` : "",
  ].filter(Boolean);

  const handleSubmit = (e) => {
    e?.preventDefault();
    const temizAd = ad.trim();

    if (!temizAd) {
      setHata("Harcama adı boş olamaz.");
      adRef.current?.focus();
      return;
    }
    if (deger === null || deger <= 0) {
      setHata("Geçerli bir tutar girin (örn: 150 veya 1.250,50).");
      tutarRef.current?.focus();
      return;
    }
    if (!gunGecerli) {
      setHata("Geçerli bir tarih seçin (gelecek bir tarih olamaz).");
      gunRef.current?.focus();
      return;
    }

    onKaydet({
      ad: temizAd,
      tutar: dolarMi ? deger * kur : deger,
      kategoriId: kategoriId || null,
      tarih: tarihOlustur(gun, duzenlenen?.tarih),
    });
    // Tarih bilerek korunur: aynı güne ait harcamalar art arda girilebilir.
    setAd("");
    setTutar("");
    setKategoriId("");
    setHata("");
    adRef.current?.focus();
  };

  const inputSinifi =
    "p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-sm";

  return (
    <form onSubmit={handleSubmit} className="mb-6 w-full" noValidate>
      <div className="flex flex-wrap gap-2">
        <input
          ref={adRef}
          className={`flex-[2] min-w-[180px] ${inputSinifi}`}
          placeholder="Harcama adı (örn: Market, Spor, Fatura)"
          value={ad}
          onChange={(e) => setAd(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              tutarRef.current?.focus();
            }
          }}
          aria-label="Harcama adı"
        />
        <input
          ref={tutarRef}
          inputMode="decimal"
          className={`flex-1 min-w-[130px] ${inputSinifi}`}
          placeholder="Tutar (₺) · 20$ için dolar"
          value={tutar}
          onChange={(e) => setTutar(e.target.value)}
          aria-label="Tutar"
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        <select
          className={`flex-1 min-w-[150px] cursor-pointer ${inputSinifi}`}
          value={kategoriId}
          onChange={(e) => setKategoriId(e.target.value)}
          aria-label="Kategori"
        >
          <option value="">Otomatik · {kategoriBul(ad).label}</option>
          {TUM_KATEGORILER.map((k) => (
            <option key={k.id} value={k.id}>
              {k.label}
            </option>
          ))}
        </select>
        <input
          ref={gunRef}
          type="date"
          className={`flex-1 min-w-[150px] ${inputSinifi} ${
            gecmisGun ? "border-amber-300 bg-amber-50" : ""
          }`}
          value={gun}
          min={EN_ESKI_GUN}
          max={bugun}
          onChange={(e) => setGun(e.target.value)}
          aria-label="Harcama tarihi"
        />
        <button
          type="submit"
          className={`flex items-center justify-center gap-2 min-w-[120px] px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all cursor-pointer active:scale-[0.98] ${
            duzenlenen
              ? "bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200"
              : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
          }`}
        >
          {duzenlenen ? <LuCheck size={16} /> : <LuPlus size={16} />}
          {duzenlenen ? "Güncelle" : "Ekle"}
        </button>
        {duzenlenen && (
          <button
            type="button"
            onClick={onIptal}
            className="flex items-center gap-1 px-4 py-3 rounded-2xl font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
            aria-label="Düzenlemeyi iptal et"
          >
            <LuX size={16} />
            İptal
          </button>
        )}
      </div>

      <div className="min-h-5 mt-2 px-1 text-xs">
        {hata ? (
          <span className="text-red-500 font-medium">{hata}</span>
        ) : notlar.length ? (
          <span className="text-gray-400">{notlar.join(" · ")}</span>
        ) : null}
      </div>
    </form>
  );
}
