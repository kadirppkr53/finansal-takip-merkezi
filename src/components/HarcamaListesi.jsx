import { LuPencil, LuTrash2 } from "react-icons/lu";
import { formatTL, formatUSD, formatTarih } from "../services/api";
import { kategoriBul } from "../services/kategoriler";

export default function HarcamaListesi({
  harcamalar,
  onSil,
  onDuzenle,
  kur,
  isReadOnly,
  duzenlenenId,
}) {
  if (!harcamalar?.length)
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
        <p className="text-gray-400 text-sm">
          Bu periyotta henüz bir harcama yok.
        </p>
      </div>
    );

  return (
    <ul className="space-y-3">
      {harcamalar.map((h, i) => {
        const kategori = kategoriBul(h.ad);
        const seciliMi = duzenlenenId === h.id;
        return (
          <li
            key={h.id}
            style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
            className={`animate-fade-up flex justify-between items-center gap-3 p-4 bg-white border rounded-2xl transition-all duration-200 ${
              seciliMi
                ? "border-orange-300 ring-4 ring-orange-50"
                : "border-gray-100 hover:shadow-md hover:border-blue-200"
            }`}
          >
            <div className="flex items-center gap-4 min-w-0">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${kategori.renk}1a` }}
                title={kategori.label}
              >
                <kategori.Icon size={22} style={{ color: kategori.renk }} />
              </div>
              <div className="min-w-0">
                <span className="font-semibold text-gray-800 block truncate">
                  {h.ad}
                </span>
                <span className="text-[11px] text-gray-400 font-medium">
                  {kategori.label} · {formatTarih(h.tarih)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <div className="font-bold text-gray-900 tabular-nums">
                  {formatTL(h.tutar)}
                </div>
                <div className="text-[11px] text-gray-400 font-medium tabular-nums">
                  ≈ {kur ? formatUSD(h.tutar / kur) : "…"}
                </div>
              </div>

              {!isReadOnly && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onDuzenle(h)}
                    className="p-2 rounded-xl text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
                    aria-label={`${h.ad} harcamasını düzenle`}
                    title="Düzenle"
                  >
                    <LuPencil size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSil(h.id)}
                    className="p-2 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                    aria-label={`${h.ad} harcamasını sil`}
                    title="Sil"
                  >
                    <LuTrash2 size={15} />
                  </button>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
