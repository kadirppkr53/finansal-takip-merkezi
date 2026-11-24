import { useState } from "react";
import { LuTarget, LuPencil, LuX } from "react-icons/lu";
import {
  formatTL,
  parseTutar,
  tutarGirdisi,
  aydaKalanGun,
} from "../services/api";

/**
 * Aylık bütçe limiti: her zaman içinde bulunulan ayın harcamasıyla kıyaslanır,
 * seçili periyottan bağımsızdır.
 */
export default function ButceDurumu({ butce, harcanan, kur, onDegistir }) {
  const [duzenleniyor, setDuzenleniyor] = useState(false);
  const [girdi, setGirdi] = useState("");
  const [hata, setHata] = useState("");

  const duzenlemeyiAc = () => {
    setGirdi(butce ? tutarGirdisi(butce) : "");
    setHata("");
    setDuzenleniyor(true);
  };

  const kaydet = (e) => {
    e.preventDefault();
    const { deger, dolarMi } = parseTutar(girdi);
    if (deger === null || deger <= 0) {
      setHata("Geçerli bir limit girin (örn: 15.000).");
      return;
    }
    onDegistir(dolarMi ? deger * kur : deger);
    setDuzenleniyor(false);
  };

  const kaldir = () => {
    onDegistir(null);
    setDuzenleniyor(false);
  };

  const kutuSinifi = "mt-3 bg-white/10 backdrop-blur-sm rounded-2xl p-4";

  if (duzenleniyor)
    return (
      <form onSubmit={kaydet} className={kutuSinifi} noValidate>
        <label
          htmlFor="butce-girdisi"
          className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-blue-100"
        >
          <LuTarget size={12} />
          Aylık bütçe limiti
        </label>
        <div className="flex flex-wrap gap-2 mt-2">
          <input
            id="butce-girdisi"
            autoFocus
            inputMode="decimal"
            value={girdi}
            onChange={(e) => setGirdi(e.target.value)}
            placeholder="örn: 15.000"
            className="flex-1 min-w-[140px] px-4 py-2.5 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-blue-200 outline-none focus:bg-white/20 focus:border-white/60 text-sm tabular-nums"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors cursor-pointer"
          >
            Kaydet
          </button>
          {butce ? (
            <button
              type="button"
              onClick={kaldir}
              className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition-colors cursor-pointer"
            >
              Kaldır
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setDuzenleniyor(false)}
            className="p-2.5 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Vazgeç"
            title="Vazgeç"
          >
            <LuX size={16} />
          </button>
        </div>
        {hata && (
          <p className="mt-2 text-xs font-medium text-red-200">{hata}</p>
        )}
      </form>
    );

  if (!butce)
    return (
      <button
        type="button"
        onClick={duzenlemeyiAc}
        className="mt-3 w-full flex items-center justify-center gap-2 p-3 rounded-2xl border border-dashed border-white/40 text-blue-50 text-sm font-semibold hover:bg-white/10 transition-colors cursor-pointer"
      >
        <LuTarget size={15} />
        Aylık bütçe limiti belirle
      </button>
    );

  const oran = harcanan / butce;
  const yuzde = Math.round(oran * 100);
  const asildi = harcanan > butce;
  const yakin = !asildi && oran >= 0.8;
  const kalan = butce - harcanan;
  const gun = aydaKalanGun();

  const cubukRengi = asildi ? "bg-red-400" : yakin ? "bg-amber-300" : "bg-white";
  const vurguRengi = asildi
    ? "text-red-200"
    : yakin
      ? "text-amber-200"
      : "text-blue-100";

  return (
    <div className={kutuSinifi}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-blue-100">
          <LuTarget size={12} />
          Aylık bütçe
        </span>
        <button
          type="button"
          onClick={duzenlemeyiAc}
          className="p-1.5 rounded-lg text-blue-100 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
          aria-label="Bütçe limitini düzenle"
          title="Bütçe limitini düzenle"
        >
          <LuPencil size={13} />
        </button>
      </div>

      <div className="flex items-baseline justify-between gap-3 mt-1">
        <span className="font-bold text-sm md:text-base tabular-nums">
          {formatTL(harcanan)}{" "}
          <span className="text-blue-100 font-medium">
            / {formatTL(butce)}
          </span>
        </span>
        <span className={`font-black text-sm tabular-nums ${vurguRengi}`}>
          %{yuzde}
        </span>
      </div>

      <div
        className="mt-2 h-2 rounded-full bg-white/20 overflow-hidden"
        role="progressbar"
        aria-label="Bu ay harcanan bütçe"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(yuzde, 100)}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ${cubukRengi}`}
          style={{ width: `${Math.min(oran * 100, 100)}%` }}
        />
      </div>

      <p className={`mt-2 text-xs font-medium tabular-nums ${vurguRengi}`}>
        {asildi
          ? `Bu ay limit ${formatTL(-kalan)} aşıldı.`
          : `Bu ay kalan ${formatTL(kalan)} · ${gun} gün için günde ≈ ${formatTL(kalan / gun)}`}
      </p>
    </div>
  );
}
