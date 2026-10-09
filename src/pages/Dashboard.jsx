import { useState, useEffect, useMemo } from "react";
import { LuCircleDollarSign, LuPencil, LuCheck } from "react-icons/lu";
import {
  getKullanicilar,
  saveKullanicilar,
  getDolarKuru,
  filtreleHarcamalar,
  periyotBasligi,
  VARSAYILAN_KUR,
} from "../services/api";
import HarcamaFormu from "../components/HarcamaFormu";
import HarcamaListesi from "../components/HarcamaListesi";
import HarcamaGrafigi from "../components/HarcamaGrafigi";
import FiltreBar from "../components/FiltreBar";
import KullaniciPaneli from "../components/KullaniciPaneli";
import OzetKarti from "../components/OzetKarti";

export default function Dashboard() {
  const [kullanicilar, setKullanicilar] = useState(getKullanicilar);
  const [seciliId, setSeciliId] = useState(
    () => getKullanicilar()[0]?.id ?? null,
  );
  const [periyot, setPeriyot] = useState("aylik");
  const [kur, setKur] = useState(VARSAYILAN_KUR);
  const [kurCanli, setKurCanli] = useState(false);
  const [duzenlenen, setDuzenlenen] = useState(null);
  const [duzenlemeModu, setDuzenlemeModu] = useState(false);

  // Dolar kuru tek bir yerden, bir kez çekilir.
  useEffect(() => {
    let iptal = false;
    getDolarKuru()
      .then((k) => {
        if (iptal) return;
        setKur(k);
        setKurCanli(true);
      })
      .catch(() => {
        if (!iptal) setKurCanli(false);
      });
    return () => {
      iptal = true;
    };
  }, []);

  useEffect(() => {
    saveKullanicilar(kullanicilar);
  }, [kullanicilar]);

  // Seçili kullanıcı türetilir; ayrı bir kopya tutulmaz.
  const seciliKullanici =
    kullanicilar.find((k) => k.id === seciliId) ?? null;

  const kullaniciGuncelle = (id, degistir) =>
    setKullanicilar((onceki) =>
      onceki.map((k) => (k.id === id ? degistir(k) : k)),
    );

  const kullaniciSec = (id) => {
    setSeciliId(id);
    setDuzenlenen(null);
    setDuzenlemeModu(false);
  };

  const kullaniciEkle = (ad) => {
    const yeni = { id: Date.now(), ad, harcamalar: [] };
    setKullanicilar((onceki) => [...onceki, yeni]);
    kullaniciSec(yeni.id);
  };

  const kullaniciSil = (id) => {
    const k = kullanicilar.find((u) => u.id === id);
    if (!k) return;
    const onay = window.confirm(
      `"${k.ad}" kullanıcısı ve ${k.harcamalar.length} harcaması silinecek. Emin misiniz?`,
    );
    if (!onay) return;
    setKullanicilar((onceki) => onceki.filter((u) => u.id !== id));
    if (seciliId === id) kullaniciSec(null);
  };

  const harcamaKaydet = ({ ad, tutar }) => {
    if (!seciliId) return;
    kullaniciGuncelle(seciliId, (k) => ({
      ...k,
      harcamalar: duzenlenen
        ? k.harcamalar.map((h) =>
            h.id === duzenlenen.id ? { ...h, ad, tutar } : h,
          )
        : [
            ...k.harcamalar,
            { id: Date.now(), ad, tutar, tarih: new Date().toISOString() },
          ],
    }));
    setDuzenlenen(null);
  };

  const harcamaSil = (hId) => {
    kullaniciGuncelle(seciliId, (k) => ({
      ...k,
      harcamalar: k.harcamalar.filter((h) => h.id !== hId),
    }));
    if (duzenlenen?.id === hId) setDuzenlenen(null);
  };

  const gorunenHarcamalar = useMemo(
    () =>
      filtreleHarcamalar(seciliKullanici?.harcamalar, periyot)
        .slice()
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih)),
    [seciliKullanici, periyot],
  );

  return (
    <div className="pb-10">
      {/* Üst Başlık */}
      <header className="bg-white border-b border-gray-100 mb-8">
        <div className="max-w-6xl mx-auto px-4 py-6 md:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Finansal <span className="text-blue-600">Takip</span> Merkezi
            </h1>
            <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase mt-1">
              Bütçeni kontrol altında tut.
            </p>
          </div>
          <div
            className="inline-flex items-center gap-2 self-start sm:self-auto px-3 py-2 rounded-full bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-600"
            title={
              kurCanli
                ? "Kur canlı olarak alındı"
                : "Kur servisine ulaşılamadı, varsayılan kur kullanılıyor"
            }
          >
            <LuCircleDollarSign size={14} className="text-green-500" />
            <span className="tabular-nums">
              1 $ ={" "}
              {new Intl.NumberFormat("tr-TR", {
                maximumFractionDigits: 2,
              }).format(kur)}{" "}
              ₺
            </span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                kurCanli ? "bg-green-500" : "bg-amber-400"
              }`}
            />
          </div>
        </div>
      </header>

      {/* Ana Grid */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <KullaniciPaneli
              kullanicilar={kullanicilar}
              seciliId={seciliId}
              onSec={kullaniciSec}
              onEkle={kullaniciEkle}
              onSil={kullaniciSil}
            />
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {seciliKullanici ? (
            <>
              <OzetKarti
                kullaniciAdi={seciliKullanici.ad}
                baslik={periyotBasligi(periyot)}
                harcamalar={gorunenHarcamalar}
                kur={kur}
              />

              {/* Harcamalar */}
              <section className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="font-bold text-gray-800">Harcamalar</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {gorunenHarcamalar.length} kayıt ·{" "}
                      {periyotBasligi(periyot)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDuzenlemeModu((d) => !d);
                      setDuzenlenen(null);
                    }}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      duzenlemeModu
                        ? "bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    }`}
                  >
                    {duzenlemeModu ? (
                      <LuCheck size={14} />
                    ) : (
                      <LuPencil size={14} />
                    )}
                    {duzenlemeModu ? "Tamam" : "Düzenle"}
                  </button>
                </div>

                {duzenlemeModu && (
                  <HarcamaFormu
                    key={duzenlenen?.id ?? "yeni"}
                    onKaydet={harcamaKaydet}
                    onIptal={() => setDuzenlenen(null)}
                    duzenlenen={duzenlenen}
                    kur={kur}
                  />
                )}

                <HarcamaListesi
                  harcamalar={gorunenHarcamalar}
                  onSil={harcamaSil}
                  onDuzenle={setDuzenlenen}
                  duzenlenenId={duzenlenen?.id}
                  kur={kur}
                  isReadOnly={!duzenlemeModu}
                />
              </section>

              {/* Analiz */}
              <section className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
                  <div>
                    <h3 className="font-bold text-gray-800">Harcama Analizi</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Kategorilere göre dağılım
                    </p>
                  </div>
                  <FiltreBar aktifPeriyot={periyot} onDegistir={setPeriyot} />
                </div>
                <HarcamaGrafigi harcamalar={gorunenHarcamalar} />
              </section>
            </>
          ) : (
            <div className="h-64 md:h-96 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 px-4 text-center">
              <p className="font-semibold text-gray-500">
                {kullanicilar.length
                  ? "Başlamak için soldan bir kullanıcı seçin."
                  : "Başlamak için soldan bir kullanıcı ekleyin."}
              </p>
              <p className="text-xs">
                Her kullanıcının harcamaları ayrı ayrı takip edilir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
