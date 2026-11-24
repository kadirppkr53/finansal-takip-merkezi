import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { ayBilgisi } from "../services/api";

/** "Aylık" periyotta geçmiş aylar arasında gezinme: ‹ Ekim 2026 › */
export default function AyGezgini({ ofset, enEskiOfset, onDegistir }) {
  const dugmeSinifi =
    "p-1.5 rounded-full text-gray-500 hover:text-gray-800 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-colors cursor-pointer";

  return (
    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-full">
      <button
        type="button"
        onClick={() => onDegistir(ofset - 1)}
        disabled={ofset <= enEskiOfset}
        className={dugmeSinifi}
        aria-label="Önceki ay"
        title="Önceki ay"
      >
        <LuChevronLeft size={16} />
      </button>
      <span
        className="min-w-[110px] text-center text-xs font-bold text-gray-700 tabular-nums"
        aria-live="polite"
      >
        {ayBilgisi(ofset).etiket}
      </span>
      <button
        type="button"
        onClick={() => onDegistir(ofset + 1)}
        disabled={ofset >= 0}
        className={dugmeSinifi}
        aria-label="Sonraki ay"
        title="Sonraki ay"
      >
        <LuChevronRight size={16} />
      </button>
    </div>
  );
}
