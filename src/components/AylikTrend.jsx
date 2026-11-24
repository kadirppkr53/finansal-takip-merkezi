import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { aylikOzet, formatTL } from "../services/api";

const AY_SAYISI = 6;

// Seri renkleri hem açık hem koyu zeminde renk körlüğü ayrımı için doğrulandı.
const SERILER = [
  { anahtar: "gider", ad: "Gider", renk: "#2563eb" },
  { anahtar: "gelir", ad: "Gelir", renk: "#16a34a" },
];

const kompakt = new Intl.NumberFormat("tr-TR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

function Ipucu({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <div className="font-bold text-gray-500 mb-1">
        {payload[0].payload.etiket}
      </div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="w-3 h-0.5 rounded-full shrink-0"
            style={{ backgroundColor: p.color }}
          />
          <span className="font-bold text-gray-900 tabular-nums">
            {formatTL(p.value)}
          </span>
          <span className="text-gray-400">{p.name}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Son 6 ayın gider (ve varsa gelir) toplamları.
 * Bir aya tıklamak o ayı görüntüler; seçili ay eksende kalın yazılır.
 */
export default function AylikTrend({ kayitlar, seciliOfset, onAySec }) {
  const aylar = useMemo(() => aylikOzet(kayitlar, AY_SAYISI), [kayitlar]);
  const gelirVar = aylar.some((a) => a.gelir > 0);
  const veriVar = gelirVar || aylar.some((a) => a.gider > 0);
  const seriler = gelirVar ? SERILER : SERILER.slice(0, 1);

  if (!veriVar)
    return (
      <p className="text-center text-gray-400 text-sm py-10">
        Son {AY_SAYISI} ayda kayıt yok.
      </p>
    );

  const ayaTikla = (durum) => {
    const sira = Number(durum?.activeTooltipIndex ?? durum?.activeIndex);
    if (Number.isInteger(sira) && aylar[sira]) onAySec(aylar[sira].ofset);
  };

  const eksenEtiketi = ({ x, y, payload, index }) => {
    const secili = aylar[index]?.ofset === seciliOfset;
    return (
      <text
        x={x}
        y={y + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={secili ? 800 : 500}
        fill={secili ? "var(--color-gray-900)" : "var(--color-gray-400)"}
      >
        {payload.value}
      </text>
    );
  };

  return (
    <div>
      {/* Tek seride başlık yeterli; iki seride kimlik yalnızca renge bırakılmaz. */}
      {gelirVar && (
        <ul className="flex gap-4 mb-3 text-xs font-semibold text-gray-500">
          {seriler.map((s) => (
            <li key={s.anahtar} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-[3px]"
                style={{ backgroundColor: s.renk }}
              />
              {s.ad}
            </li>
          ))}
        </ul>
      )}

      <div className="h-56 cursor-pointer">
        <ResponsiveContainer
          width="100%"
          height="100%"
          initialDimension={{ width: 600, height: 224 }}
        >
          <BarChart
            data={aylar}
            onClick={ayaTikla}
            margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
            barGap={2}
            barCategoryGap="28%"
          >
            <CartesianGrid
              vertical={false}
              stroke="var(--color-gray-100)"
              strokeWidth={1}
            />
            <XAxis
              dataKey="kisa"
              axisLine={false}
              tickLine={false}
              tick={eksenEtiketi}
              interval={0}
            />
            <YAxis
              width={48}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => kompakt.format(v)}
              tick={{ fontSize: 11, fill: "var(--color-gray-400)" }}
            />
            <Tooltip
              content={<Ipucu />}
              cursor={{ fill: "var(--color-gray-100)", opacity: 0.6 }}
            />
            {seriler.map((s) => (
              <Bar
                key={s.anahtar}
                dataKey={s.anahtar}
                name={s.ad}
                fill={s.renk}
                maxBarSize={24}
                radius={[4, 4, 0, 0]}
                animationDuration={500}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Grafiğin tablo karşılığı: ekran okuyucular için. */}
      <table className="sr-only">
        <caption>Son {AY_SAYISI} ayın aylık toplamları</caption>
        <thead>
          <tr>
            <th scope="col">Ay</th>
            {seriler.map((s) => (
              <th key={s.anahtar} scope="col">
                {s.ad}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {aylar.map((a) => (
            <tr key={a.indeks}>
              <th scope="row">{a.etiket}</th>
              {seriler.map((s) => (
                <td key={s.anahtar}>{formatTL(a[s.anahtar])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
