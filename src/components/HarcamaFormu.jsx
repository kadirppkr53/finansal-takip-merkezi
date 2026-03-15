import { useState, useEffect, useRef } from "react";

export default function HarcamaFormu({ onEkle, duzenlenenHarcama }) {
  const [ad, setAd] = useState("");
  const [tutar, setTutar] = useState("");
  const adRef = useRef(null);
  const tutarRef = useRef(null);

  useEffect(() => {
    if (duzenlenenHarcama) {
      setAd(duzenlenenHarcama.ad);
      setTutar(duzenlenenHarcama.tutar.toString());
      adRef.current?.focus();
    } else {
      setAd("");
      setTutar("");
    }
  }, [duzenlenenHarcama]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!ad.trim() || !tutar) return;

    let finalTutar = parseFloat(tutar.toString().replace(",", "."));
    if (isNaN(finalTutar)) return;

    // Dolar çevrimi: Eğer "d" harfi varsa
    if (tutar.toString().toLowerCase().includes("d")) {
      try {
        const res = await fetch(
          "https://api.exchangerate-api.com/v4/latest/USD",
        );
        const data = await res.json();
        finalTutar = finalTutar * (data.rates.TRY || 32.0);
      } catch (error) {
        finalTutar = finalTutar * 32.0;
      }
    }

    onEkle({
      id: duzenlenenHarcama?.id || Date.now(),
      ad: ad.trim(),
      tutar: finalTutar,
      tarih: duzenlenenHarcama?.tarih || new Date().toISOString(),
    });

    setAd("");
    setTutar("");
    adRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-6 w-full">
      <input
        ref={adRef}
        className="flex-[2] min-w-[200px] p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        placeholder="Harcama Adı..."
        value={ad}
        onChange={(e) => setAd(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && (e.preventDefault(), tutarRef.current?.focus())
        }
      />
      <input
        ref={tutarRef}
        className="flex-1 min-w-[120px] p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        placeholder="Tutar (örn: 50)"
        value={tutar}
        onChange={(e) => setTutar(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && (e.preventDefault(), handleSubmit())
        }
      />
      <button
        type="submit"
        className={`flex-1 min-w-[100px] px-6 rounded-2xl font-bold transition-all ${
          duzenlenenHarcama
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {duzenlenenHarcama ? "Güncelle" : "Ekle"}
      </button>
    </form>
  );
}
