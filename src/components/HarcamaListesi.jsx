import { getIkonUrl } from "../services/api";

export default function HarcamaListesi({
  harcamalar,
  onSil,
  onDuzenle,
  kur,
  isReadOnly,
}) {
  if (!harcamalar?.length)
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl mt-6">
        <p className="text-gray-400 italic">Henüz bir harcama eklenmemiş.</p>
      </div>
    );

  return (
    <div className="space-y-4 mt-6">
      {harcamalar.map((h) => (
        <div
          key={h.id}
          className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-md hover:border-blue-200 transition-all duration-300"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center p-2.5 shrink-0">
              <img
                src={getIkonUrl(h.ad)}
                alt={h.ad}
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    "https://img.icons8.com/color/96/000000/wallet.png";
                }}
              />
            </div>
            <div>
              <span className="font-semibold text-gray-800 capitalize block">
                {h.ad}
              </span>
              {/* Tarih varsa formatla, yoksa bugünün tarihini göster */}
              <span className="text-[10px] text-gray-400 font-medium tracking-wide">
                {new Date(h.tarih || new Date()).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="font-bold text-blue-600">
                {new Intl.NumberFormat("tr-TR").format(h.tutar)} TL
              </div>
              <div className="text-[10px] text-gray-400 font-medium">
                ≈ {kur ? (h.tutar / kur).toFixed(2) : "..."} USD
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => onDuzenle(h)}
                  className="text-[10px] font-bold text-orange-400 hover:text-orange-600 bg-orange-50 px-2 py-1 rounded-lg transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => onSil(h.id)}
                  className="text-[10px] font-bold text-red-400 hover:text-red-600 bg-red-50 px-2 py-1 rounded-lg transition-colors"
                >
                  Sil
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
