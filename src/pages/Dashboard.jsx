import { useState, useEffect, useMemo } from "react";
import { LuCircleDollarSign, LuPencil, LuCheck } from "react-icons/lu";
import {
  getKullanicilar,
  saveKullanicilar,
  getDolarKuru,
  filtreleHarcamalar,
  periyotBasligi,
  ayBilgisi,
  enEskiAyOfseti,
  VARSAYILAN_KUR,
} from "../services/api";
import HarcamaFormu from "../components/HarcamaFormu";
import HarcamaListesi from "../components/HarcamaListesi";
import HarcamaGrafigi from "../components/HarcamaGrafigi";
import FiltreBar from "../components/FiltreBar";
import AyGezgini from "../components/AyGezgini";
import AylikTrend from "../components/AylikTrend";
import KullaniciPaneli from "../components/KullaniciPaneli";
import OzetKarti from "../components/OzetKarti";
import VeriPaneli from "../components/VeriPaneli";
import TekrarListesi from "../components/TekrarListesi";
import { gelirMi } from "../services/kategoriler";
import { tekrarOlustur, tekrarlariIsle } from "../services/tekrar";

export default function Dashboard() {
  // Açılışta günü gelmiş tekrarlayan kalemler kayda dönüştürülür.
  const [kullanicilar, setKullanicilar] = useState(() =>
    tekrarlariIsle(getKullanicilar()),
  );
  const [seciliId, setSeciliId] = useState(
    () => getKullanicilar()[0]?.id ?? null,
  );
  const [periyot, setPeriyot] = useState("aylik");
  // "aylik" periyotta görüntülenen ay: 0 = bu ay, -1 = geçen ay.
  const [ayOfseti, setAyOfseti] = useState(0);
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

  // Sekme açık kalıp gün değiştiyse, geri dönüldüğünde tekrarlar yeniden işlenir.
  useEffect(() => {
    const kontrol = () => {
      if (!document.hidden) setKullanicilar((onceki) => tekrarlariIsle(onceki));
    };
    document.addEventListener("visibilitychange", kontrol);
    return () => document.removeEventListener("visibilitychange", kontrol);
  }, []);

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
    setAyOfseti(0);
  };

  const periyotDegistir = (yeni) => {
    setPeriyot(yeni);
    setAyOfseti(0);
  };

  const ayaGit = (ofset) => {
    setPeriyot("aylik");
    setAyOfseti(Math.min(ofset, 0));
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

  const harcamaKaydet = ({ tekrarla, ...alanlar }) => {
    if (!seciliId) return;
    const id = Date.now();
    const kural = tekrarla ? tekrarOlustur(alanlar, `t${id}`) : null;

    kullaniciGuncelle(seciliId, (k) => {
      if (duzenlenen)
        return {
          ...k,
          harcamalar: k.harcamalar.map((h) =>
            h.id === duzenlenen.id ? { ...h, ...alanlar } : h,
          ),
        };
      if (!kural)
        return { ...k, harcamalar: [...k.harcamalar, { id, ...alanlar }] };

      // İlk kayıt geçmiş bir aya girildiyse aradaki aylar da hemen doldurulur.
      return tekrarlariIsle([
        {
          ...k,
          tekrarlar: [...(k.tekrarlar ?? []), kural],
          harcamalar: [...k.harcamalar, { id, ...alanlar, tekrarId: kural.id }],
        },
      ])[0];
    });
    setDuzenlenen(null);
  };

  const tekrarSil = (kural) => {
    const onay = window.confirm(
      `"${kural.ad}" artık her ay otomatik eklenmeyecek. Daha önce eklenen kayıtlar silinmez. Devam edilsin mi?`,
    );
    if (!onay) return;
    kullaniciGuncelle(seciliId, (k) => ({
      ...k,
      tekrarlar: (k.tekrarlar ?? []).filter((t) => t.id !== kural.id),
    }));
  };

  const yedekYukle = (yeniKullanicilar) => {
    setKullanicilar(tekrarlariIsle(yeniKullanicilar));
    kullaniciSec(yeniKullanicilar[0]?.id ?? null);
  };

  const butceGuncelle = (butce) => {
    if (!seciliId) return;
    kullaniciGuncelle(seciliId, (k) => ({ ...k, butce }));
  };

  const harcamaSil = (hId) => {
    kullaniciGuncelle(seciliId, (k) => ({
      ...k,
      harcamalar: k.harcamalar.filter((h) => h.id !== hId),
    }));
    if (duzenlenen?.id === hId) setDuzenlenen(null);
  };

  // Seçili periyottaki tüm kayıtlar (gelir + gider), yeniden eskiye.
  const gorunenKayitlar = useMemo(
    () =>
      filtreleHarcamalar(seciliKullanici?.harcamalar, periyot, ayOfseti)
        .slice()
        .sort((a, b) => new Date(b.tarih) - new Date(a.tarih)),
    [seciliKullanici, periyot, ayOfseti],
  );

  const gorunenGiderler = useMemo(
    () => gorunenKayitlar.filter((h) => !gelirMi(h)),
    [gorunenKayitlar],
  );

  const gelirToplam = useMemo(
    () =>
      gorunenKayitlar.reduce(
        (acc, h) => (gelirMi(h) ? acc + (Number(h.tutar) || 0) : acc),
        0,
      ),
    [gorunenKayitlar],
  );

  // Bütçe aylıktır: geçmiş bir ay görüntüleniyorsa o ayın, aksi halde bu ayın
  // giderleriyle kıyaslanır (günlük/haftalık/tümü seçiliyken de bu ay).
  const butceOfseti = periyot === "aylik" ? ayOfseti : 0;
  const butceAyToplami = useMemo(
    () =>
      filtreleHarcamalar(
        seciliKullanici?.harcamalar,
        "aylik",
        butceOfseti,
      ).reduce((acc, h) => (gelirMi(h) ? acc : acc + (Number(h.tutar) || 0)), 0),
    [seciliKullanici, butceOfseti],
  );

  const enEskiOfset = useMemo(
    () => enEskiAyOfseti(seciliKullanici?.harcamalar),
    [seciliKullanici],
  );

  const baslik = periyotBasligi(periyot, ayOfseti);

  const veriPaneli = (
    <VeriPaneli
      kullanicilar={kullanicilar}
      seciliKullanici={seciliKullanici}
      gorunenHarcamalar={gorunenKayitlar}
      periyotAdi={baslik}
      onYedekYukle={yedekYukle}
    />
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
          <div className="lg:sticky lg:top-6 space-y-6">
            <KullaniciPaneli
              kullanicilar={kullanicilar}
              seciliId={seciliId}
              onSec={kullaniciSec}
              onEkle={kullaniciEkle}
              onSil={kullaniciSil}
            />
            {/* Geniş ekranda kenar çubuğunda; dar ekranda içeriğin altında (aşağıda). */}
            <div className="hidden lg:block">{veriPaneli}</div>
          </div>
        </aside>

        <div className="lg:col-span-3 space-y-6">
          {seciliKullanici ? (
            <>
              {/* Periyot seçimi: aşağıdaki özet, liste ve analizin tamamını kapsar. */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <FiltreBar aktifPeriyot={periyot} onDegistir={periyotDegistir} />
                {periyot === "aylik" && (
                  <AyGezgini
                    ofset={ayOfseti}
                    enEskiOfset={enEskiOfset}
                    onDegistir={ayaGit}
                  />
                )}
              </div>

              <OzetKarti
                key={seciliKullanici.id}
                kullaniciAdi={seciliKullanici.ad}
                baslik={baslik}
                harcamalar={gorunenGiderler}
                gelirToplam={gelirToplam}
                kur={kur}
                butce={seciliKullanici.butce}
                butceAyToplami={butceAyToplami}
                butceAyi={butceOfseti ? ayBilgisi(butceOfseti).etiket : null}
                onButceDegistir={butceGuncelle}
              />

              {/* İşlemler (gelir + gider) */}
              <section className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between gap-4 mb-5">
                  <div>
                    <h3 className="font-bold text-gray-800">İşlemler</h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {gorunenKayitlar.length} kayıt · {baslik}
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
                  harcamalar={gorunenKayitlar}
                  onSil={harcamaSil}
                  onDuzenle={setDuzenlenen}
                  duzenlenenId={duzenlenen?.id}
                  kur={kur}
                  isReadOnly={!duzenlemeModu}
                />
              </section>

              {seciliKullanici.tekrarlar?.length > 0 && (
                <TekrarListesi
                  tekrarlar={seciliKullanici.tekrarlar}
                  onSil={tekrarSil}
                />
              )}

              {/* Analiz */}
              <section className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="mb-6">
                  <h3 className="font-bold text-gray-800">Harcama Analizi</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Kategorilere göre dağılım · {baslik}
                  </p>
                </div>
                <HarcamaGrafigi harcamalar={gorunenGiderler} />
              </section>

              {/* Aylık trend */}
              <section className="bg-white p-5 md:p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <div className="mb-5">
                  <h3 className="font-bold text-gray-800">Aylık Trend</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Son 6 ay · bir aya tıklayarak o ayı görüntüle
                  </p>
                </div>
                <AylikTrend
                  kayitlar={seciliKullanici.harcamalar}
                  seciliOfset={periyot === "aylik" ? ayOfseti : null}
                  onAySec={ayaGit}
                />
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
                Her kullanıcının gelir ve giderleri ayrı ayrı takip edilir.
              </p>
            </div>
          )}
          <div className="lg:hidden">{veriPaneli}</div>
        </div>
      </div>
    </div>
  );
}
