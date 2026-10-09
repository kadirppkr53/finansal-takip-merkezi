import { LuHash, LuTrendingUp, LuArrowUpRight } from "react-icons/lu";
import { formatTL, formatUSD } from "../services/api";

function MiniIstatistik({ ikon, etiket, deger }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4">
      <div className="flex items-center gap-1.5 text-[10px] md:text-[11px] uppercase tracking-wider font-bold text-blue-100">
        {ikon}
        {etiket}
      </div>
      <div className="mt-1 font-bold text-sm md:text-base tabular-nums truncate">
        {deger}
      </div>
    </div>
  );
}

export default function OzetKarti({ kullaniciAdi, baslik, harcamalar, kur }) {
  const toplam = harcamalar.reduce((acc, h) => acc + (Number(h.tutar) || 0), 0);
  const adet = harcamalar.length;
  const ortalama = adet ? toplam / adet : 0;
  const enYuksek = harcamalar.reduce(
    (max, h) => (h.tutar > (max?.tutar ?? -1) ? h : max),
    null,
  );

  return (
    <section className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-600 to-indigo-700 text-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-blue-200">
      {/* Dekoratif daireler */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 w-48 h-48 rounded-full bg-white/5" />

      <div className="relative">
        <h2 className="text-[11px] md:text-xs text-blue-100 font-bold uppercase tracking-widest">
          {kullaniciAdi} · {baslik}
        </h2>
        <p className="text-3xl md:text-5xl font-black mt-2 tabular-nums break-all">
          {formatTL(toplam)}
        </p>
        <p className="text-blue-100 font-medium text-sm md:text-base mt-1 tabular-nums">
          ≈ {formatUSD(toplam / kur)}
        </p>

        <div className="grid grid-cols-3 gap-2 md:gap-3 mt-6">
          <MiniIstatistik
            ikon={<LuHash size={12} />}
            etiket="İşlem"
            deger={adet}
          />
          <MiniIstatistik
            ikon={<LuTrendingUp size={12} />}
            etiket="Ortalama"
            deger={formatTL(ortalama)}
          />
          <MiniIstatistik
            ikon={<LuArrowUpRight size={12} />}
            etiket="En yüksek"
            deger={enYuksek ? formatTL(enYuksek.tutar) : "—"}
          />
        </div>
      </div>
    </section>
  );
}
