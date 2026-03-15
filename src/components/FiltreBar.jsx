export default function FiltreBar({ aktifPeriyot, onDegistir }) {
  const secenekler = [
    { id: "gunluk", label: "GÜNLÜK" },
    { id: "haftalik", label: "HAFTALIK" },
    { id: "aylik", label: "AYLIK" },
    { id: "tum", label: "TÜMÜ" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {secenekler.map((p) => (
        <button
          key={p.id}
          onClick={() => onDegistir(p.id)}
          aria-pressed={aktifPeriyot === p.id}
          className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
            aktifPeriyot === p.id
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800"
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
