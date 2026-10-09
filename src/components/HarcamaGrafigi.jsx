import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { kategoriBul } from "../services/kategoriler";
import { formatTL } from "../services/api";

export default function HarcamaGrafigi({ harcamalar }) {
  const gruplar = useMemo(() => {
    const toplamlar = {};
    for (const h of harcamalar) {
      const k = kategoriBul(h.ad);
      toplamlar[k.id] ??= { ...k, deger: 0, adet: 0 };
      toplamlar[k.id].deger += Number(h.tutar) || 0;
      toplamlar[k.id].adet += 1;
    }
    return Object.values(toplamlar).sort((a, b) => b.deger - a.deger);
  }, [harcamalar]);

  const toplam = gruplar.reduce((acc, g) => acc + g.deger, 0);

  if (!toplam)
    return (
      <p className="text-center text-gray-400 text-sm py-10">
        Grafik için yeterli veri yok.
      </p>
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
      <div className="relative h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={gruplar}
              dataKey="deger"
              nameKey="label"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={gruplar.length > 1 ? 3 : 0}
              stroke="none"
              animationDuration={600}
            >
              {gruplar.map((g) => (
                <Cell key={g.id} fill={g.renk} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [formatTL(value), "Tutar"]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #f1f5f9",
                boxShadow: "0 8px 24px rgba(15,23,42,.08)",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
            Toplam
          </span>
          <span className="text-lg font-black text-gray-900 tabular-nums">
            {formatTL(toplam)}
          </span>
          <span className="text-[11px] text-gray-400">
            {gruplar.length} kategori
          </span>
        </div>
      </div>

      <ul className="space-y-3">
        {gruplar.map((g) => {
          const yuzde = (g.deger / toplam) * 100;
          return (
            <li key={g.id}>
              <div className="flex items-center justify-between text-sm mb-1.5 gap-2">
                <span className="flex items-center gap-2 font-semibold text-gray-700 min-w-0">
                  <g.Icon size={15} style={{ color: g.renk }} />
                  <span className="truncate">{g.label}</span>
                  <span className="text-gray-400 font-normal text-xs">
                    · {g.adet} işlem
                  </span>
                </span>
                <span className="font-bold text-gray-800 tabular-nums shrink-0">
                  {formatTL(g.deger)}{" "}
                  <span className="text-gray-400 font-medium text-xs">
                    %{yuzde.toFixed(0)}
                  </span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${yuzde}%`, backgroundColor: g.renk }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
