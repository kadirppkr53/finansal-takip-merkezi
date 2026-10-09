import { PERIYOTLAR } from "../services/api";

export default function FiltreBar({ aktifPeriyot, onDegistir }) {
  return (
    <div
      role="tablist"
      aria-label="Periyot seçimi"
      className="inline-flex flex-wrap gap-1 p-1 bg-gray-100 rounded-full"
    >
      {PERIYOTLAR.map((p) => {
        const aktif = aktifPeriyot === p.id;
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={aktif}
            onClick={() => onDegistir(p.id)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
              aktif
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
