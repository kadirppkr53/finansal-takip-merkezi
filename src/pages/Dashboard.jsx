import { useState, useEffect } from "react";
import {
  getKullanicilar,
  saveKullanicilar,
  getGrafikUrl,
  filtreleHarcamalar,
} from "../services/api";
import HarcamaFormu from "../components/HarcamaFormu";
import HarcamaListesi from "../components/HarcamaListesi";
import FiltreBar from "../components/FiltreBar";

export default function Dashboard() {
  const [kullanicilar, setKullanicilar] = useState(getKullanicilar());
  const [seciliKullanici, setSeciliKullanici] = useState(null);
  const [periyot, setPeriyot] = useState("aylik");
  const [kur, setKur] = useState(32.0);
  const [duzenlenenHarcama, setDuzenlenenHarcama] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    fetch("https://api.exchangerate-api.com/v4/latest/USD")
      .then((res) => res.json())
      .then((data) => setKur(data.rates.TRY))
      .catch(() => console.log("Kur verisi alınamadı."));
  }, []);

  useEffect(() => saveKullanicilar(kullanicilar), [kullanicilar]);

  const harcamaKaydet = (veri) => {
    const yeniHarcamalar = duzenlenenHarcama
      ? seciliKullanici.harcamalar.map((h) =>
          h.id === duzenlenenHarcama.id ? { ...veri, id: h.id } : h,
        )
      : [
          ...seciliKullanici.harcamalar,
          { ...veri, id: Date.now(), tarih: new Date().toISOString() },
        ];

    const guncelKullanicilar = kullanicilar.map((k) =>
      k.id === seciliKullanici.id ? { ...k, harcamalar: yeniHarcamalar } : k,
    );

    setKullanicilar(guncelKullanicilar);
    setSeciliKullanici({ ...seciliKullanici, harcamalar: yeniHarcamalar });
    setDuzenlenenHarcama(null);
  };

  const harcamaSil = (hId) => {
    const yeniHarcamalar = seciliKullanici.harcamalar.filter(
      (h) => h.id !== hId,
    );
    setKullanicilar(
      kullanicilar.map((k) =>
        k.id === seciliKullanici.id ? { ...k, harcamalar: yeniHarcamalar } : k,
      ),
    );
    setSeciliKullanici({ ...seciliKullanici, harcamalar: yeniHarcamalar });
  };

  const gorunenHarcamalar = seciliKullanici
    ? filtreleHarcamalar(seciliKullanici.harcamalar, periyot)
    : [];
  const toplamHarcamaTL = gorunenHarcamalar.reduce(
    (acc, h) => acc + h.tutar,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm mb-8">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">
            Finansal <span className="text-blue-600">Takip</span> Merkezi
          </h1>
          <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mt-4">
            Bütçeni kontrol altında tut.
          </p>
        </div>
      </header>

      {/* Ana Grid - Responsive Yapı */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SOL KOLON */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
              Kullanıcılar
            </h2>
            <input
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.target.value.trim()) {
                  setKullanicilar([
                    ...kullanicilar,
                    { id: Date.now(), ad: e.target.value, harcamalar: [] },
                  ]);
                  e.target.value = "";
                }
              }}
              className="w-full p-4 mb-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-blue-400 transition-all text-sm"
              placeholder="+ Yeni kullanıcı ekle..."
            />
            <div className="space-y-2">
              {kullanicilar.map((k) => (
                <div
                  key={k.id}
                  onClick={() => {
                    setSeciliKullanici(k);
                    setIsEditMode(false);
                  }}
                  className={`p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-300 ${
                    seciliKullanici?.id === k.id
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-bold text-sm truncate mr-2">
                    {k.ad}
                  </span>
                  <div
                    className="flex gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setSeciliKullanici(k);
                        setIsEditMode(true);
                      }}
                      className={`text-[10px] px-2 py-1 rounded-lg font-bold ${seciliKullanici?.id === k.id ? "bg-blue-500 text-white" : "bg-white text-gray-400"}`}
                    >
                      Düz.
                    </button>
                    <button
                      onClick={() => {
                        setKullanicilar(
                          kullanicilar.filter((u) => u.id !== k.id),
                        );
                        if (seciliKullanici?.id === k.id)
                          setSeciliKullanici(null);
                      }}
                      className={`text-[10px] px-2 py-1 rounded-lg font-bold ${seciliKullanici?.id === k.id ? "bg-red-500 text-white" : "bg-white text-gray-400"}`}
                    >
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SAĞ KOLON */}
        <div className="lg:col-span-3 space-y-6">
          {seciliKullanici ? (
            <>
              <div className="bg-blue-600 text-white p-6 md:p-10 rounded-[2rem] shadow-xl">
                <h2 className="text-xs md:text-sm opacity-80 font-bold uppercase tracking-widest">
                  {seciliKullanici.ad} - {periyot} Özeti
                </h2>
                <h1 className="text-3xl md:text-5xl font-black my-2 break-all">
                  {new Intl.NumberFormat("tr-TR").format(toplamHarcamaTL)} TL
                </h1>
                <p className="opacity-70 font-medium text-sm md:text-base">
                  ≈{" "}
                  {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                  }).format(toplamHarcamaTL / kur)}{" "}
                  $
                </p>
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                {isEditMode ? (
                  <>
                    <HarcamaFormu
                      onEkle={harcamaKaydet}
                      duzenlenenHarcama={duzenlenenHarcama}
                    />
                    <HarcamaListesi
                      harcamalar={gorunenHarcamalar}
                      onSil={harcamaSil}
                      onDuzenle={setDuzenlenenHarcama}
                      kur={kur}
                      isReadOnly={false}
                    />
                  </>
                ) : (
                  <div className="text-center py-6 md:py-10">
                    <p className="text-gray-400 mb-4 text-sm italic">
                      Düzenleme yapmak için "Düz." butonuna basın.
                    </p>
                    <HarcamaListesi
                      harcamalar={gorunenHarcamalar}
                      kur={kur}
                      isReadOnly={true}
                    />
                  </div>
                )}
              </div>

              {/* GRAFİK KARTI */}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <h3 className="font-bold text-gray-800">Harcama Analizi</h3>
                  <FiltreBar aktifPeriyot={periyot} onDegistir={setPeriyot} />
                </div>
                {gorunenHarcamalar.length > 0 ? (
                  <img
                    src={getGrafikUrl(gorunenHarcamalar)}
                    className="w-full max-w-sm mx-auto h-auto"
                    alt="Analiz Grafiği"
                  />
                ) : (
                  <p className="text-center text-gray-400 py-10">
                    Grafik için yeterli veri yok.
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="h-64 md:h-96 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-medium px-4 text-center">
              Başlamak için soldan bir kullanıcı seçin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
