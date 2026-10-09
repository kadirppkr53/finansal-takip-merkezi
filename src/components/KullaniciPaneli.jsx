import { useState } from "react";
import { LuUserPlus, LuTrash2, LuUsers } from "react-icons/lu";
import { formatTL } from "../services/api";

const basHarf = (ad = "") => ad.trim().charAt(0).toLocaleUpperCase("tr-TR");

export default function KullaniciPaneli({
  kullanicilar,
  seciliId,
  onSec,
  onEkle,
  onSil,
}) {
  const [yeniAd, setYeniAd] = useState("");

  const ekle = (e) => {
    e.preventDefault();
    const ad = yeniAd.trim();
    if (!ad) return;
    onEkle(ad);
    setYeniAd("");
  };

  return (
    <section className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <h2 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
        <LuUsers size={14} />
        Kullanıcılar
        <span className="ml-auto text-gray-300 font-semibold">
          {kullanicilar.length}
        </span>
      </h2>

      <form onSubmit={ekle} className="relative mb-4">
        <input
          value={yeniAd}
          onChange={(e) => setYeniAd(e.target.value)}
          className="w-full p-4 pr-12 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-sm"
          placeholder="Yeni kullanıcı ekle…"
          aria-label="Yeni kullanıcı adı"
        />
        <button
          type="submit"
          disabled={!yeniAd.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          aria-label="Kullanıcı ekle"
        >
          <LuUserPlus size={16} />
        </button>
      </form>

      {kullanicilar.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-6 px-2">
          Henüz kullanıcı yok. Yukarıdan ilk kullanıcını ekle.
        </p>
      ) : (
        <ul className="space-y-2">
          {kullanicilar.map((k) => {
            const secili = seciliId === k.id;
            const toplam = k.harcamalar.reduce(
              (acc, h) => acc + (Number(h.tutar) || 0),
              0,
            );
            return (
              <li key={k.id}>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSec(k.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSec(k.id);
                    }
                  }}
                  aria-pressed={secili}
                  className={`group p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all duration-200 outline-none focus-visible:ring-4 focus-visible:ring-blue-100 ${
                    secili
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      secili
                        ? "bg-white/20 text-white"
                        : "bg-white text-blue-600 shadow-sm"
                    }`}
                  >
                    {basHarf(k.ad)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="font-bold text-sm block truncate">
                      {k.ad}
                    </span>
                    <span
                      className={`flex flex-wrap gap-x-2 text-[11px] font-medium tabular-nums ${
                        secili ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      <span>{k.harcamalar.length} işlem</span>
                      <span>{formatTL(toplam)}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSil(k.id);
                    }}
                    className={`p-2 rounded-xl shrink-0 transition-all cursor-pointer ${
                      secili
                        ? "text-white/70 hover:text-white hover:bg-white/15"
                        : "text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    }`}
                    aria-label={`${k.ad} kullanıcısını sil`}
                    title="Kullanıcıyı sil"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
