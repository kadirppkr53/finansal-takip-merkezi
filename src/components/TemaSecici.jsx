import { useEffect, useRef, useState } from "react";
import { LuPalette, LuCheck } from "react-icons/lu";
import { TEMALAR } from "../services/tema";

const GRUPLAR = [
  { baslik: "Açık temalar", temalar: TEMALAR.filter((t) => !t.koyu) },
  { baslik: "Koyu temalar", temalar: TEMALAR.filter((t) => t.koyu) },
];

/**
 * Tema seçme düğmesi ve açılır listesi.
 * Liste, en yakın `relative` kapsayıcıya göre konumlanır (bkz. Dashboard başlığı).
 */
export default function TemaSecici({ tema, onSec }) {
  const [acik, setAcik] = useState(false);
  const kokRef = useRef(null);
  const dugmeRef = useRef(null);

  // Dışarı tıklanınca ya da Escape'e basılınca kapanır.
  useEffect(() => {
    if (!acik) return;
    const disariTikla = (e) => {
      if (!kokRef.current?.contains(e.target)) setAcik(false);
    };
    const tus = (e) => {
      if (e.key !== "Escape") return;
      setAcik(false);
      dugmeRef.current?.focus();
    };
    document.addEventListener("pointerdown", disariTikla);
    document.addEventListener("keydown", tus);
    return () => {
      document.removeEventListener("pointerdown", disariTikla);
      document.removeEventListener("keydown", tus);
    };
  }, [acik]);

  return (
    <div ref={kokRef}>
      <button
        ref={dugmeRef}
        type="button"
        onClick={() => setAcik((a) => !a)}
        aria-haspopup="menu"
        aria-expanded={acik}
        aria-label="Tema seç"
        title="Tema seç"
        className="p-2 rounded-full bg-gray-50 border border-gray-100 text-gray-600 hover:text-gray-900 hover:bg-gray-100 outline-none focus-visible:ring-4 focus-visible:ring-blue-100 focus-visible:border-blue-400 transition-colors cursor-pointer"
      >
        <LuPalette size={15} />
      </button>

      {acik && (
        <div
          role="menu"
          aria-label="Temalar"
          className="absolute z-30 top-full mt-2 left-0 sm:left-auto sm:right-0 w-52 p-2 bg-white border border-gray-100 rounded-2xl shadow-xl animate-fade-up"
        >
          {GRUPLAR.map((grup) => (
            <div key={grup.baslik} className="mb-1 last:mb-0">
              <div className="px-2 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                {grup.baslik}
              </div>
              {grup.temalar.map((t) => {
                const secili = t.id === tema;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={secili}
                    onClick={() => {
                      onSec(t.id);
                      setAcik(false);
                      dugmeRef.current?.focus();
                    }}
                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl text-sm font-semibold text-left transition-colors cursor-pointer ${
                      secili
                        ? "bg-gray-100 text-gray-900"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {/* Renk örneği: temanın zemini üzerinde vurgu rengi. */}
                    <span
                      className="w-6 h-6 rounded-full shrink-0 border border-gray-200 flex items-center justify-center"
                      style={{ backgroundColor: t.onizleme.zemin }}
                      aria-hidden="true"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: t.onizleme.vurgu }}
                      />
                    </span>
                    <span className="flex-1 truncate">{t.ad}</span>
                    {secili && (
                      <LuCheck size={15} className="text-blue-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
