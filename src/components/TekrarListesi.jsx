import { LuRepeat, LuTrash2 } from "react-icons/lu";
import { formatTL } from "../services/api";
import { harcamaKategorisi, gelirMi } from "../services/kategoriler";

/** Her ay otomatik eklenen kalemlerin listesi; kural buradan kaldırılır. */
export default function TekrarListesi({ tekrarlar, onSil }) {
  const aylikGider = tekrarlar.reduce(
    (acc, t) => (gelirMi(t) ? acc : acc + (Number(t.tutar) || 0)),
    0,
  );

  return (
    <section className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
      <div className="mb-5">
        <h3 className="flex items-center gap-2 font-bold text-gray-800">
          <LuRepeat size={16} className="text-blue-600" />
          Tekrarlayan Kalemler
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Her ay otomatik eklenir · aylık sabit gider {formatTL(aylikGider)}
        </p>
      </div>

      <ul className="space-y-2">
        {tekrarlar.map((t) => {
          const kategori = harcamaKategorisi(t);
          const gelir = gelirMi(t);
          return (
            <li
              key={t.id}
              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-2xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${kategori.renk}1a` }}
                >
                  <kategori.Icon size={18} style={{ color: kategori.renk }} />
                </div>
                <div className="min-w-0">
                  <span className="font-semibold text-sm text-gray-800 block truncate">
                    {t.ad}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {kategori.label} · her ayın {t.gun}. günü
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`font-bold text-sm tabular-nums ${
                    gelir ? "text-green-600" : "text-gray-900"
                  }`}
                >
                  {gelir ? "+" : ""}
                  {formatTL(t.tutar)}
                </span>
                <button
                  type="button"
                  onClick={() => onSil(t)}
                  className="p-2 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
                  aria-label={`${t.ad} tekrarını kaldır`}
                  title="Tekrarı kaldır"
                >
                  <LuTrash2 size={15} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
