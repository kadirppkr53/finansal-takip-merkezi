import { LuSearch, LuX, LuFilterX } from "react-icons/lu";

/** İşlem listesi için ada göre arama ve kategori süzgeci. */
export default function ListeFiltresi({
  arama,
  onAramaDegistir,
  kategoriId,
  onKategoriDegistir,
  kategoriler,
}) {
  const aktif = Boolean(arama.trim()) || Boolean(kategoriId);
  const alanSinifi =
    "bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-sm";

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <div className="relative flex-[2] min-w-[180px]">
        <LuSearch
          size={15}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          type="search"
          value={arama}
          onChange={(e) => onAramaDegistir(e.target.value)}
          placeholder="Kayıtlarda ara…"
          aria-label="Kayıtlarda ara"
          className={`w-full py-3 pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden ${alanSinifi}`}
        />
        {arama && (
          <button
            type="button"
            onClick={() => onAramaDegistir("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Aramayı temizle"
            title="Aramayı temizle"
          >
            <LuX size={14} />
          </button>
        )}
      </div>

      <select
        value={kategoriId}
        onChange={(e) => onKategoriDegistir(e.target.value)}
        aria-label="Kategoriye göre süz"
        className={`flex-1 min-w-[150px] py-3 px-4 cursor-pointer ${alanSinifi}`}
      >
        <option value="">Tüm kategoriler</option>
        {kategoriler.map((k) => (
          <option key={k.id} value={k.id}>
            {k.label}
          </option>
        ))}
      </select>

      {aktif && (
        <button
          type="button"
          onClick={() => {
            onAramaDegistir("");
            onKategoriDegistir("");
          }}
          className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <LuFilterX size={14} />
          Temizle
        </button>
      )}
    </div>
  );
}
