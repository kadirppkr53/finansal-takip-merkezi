import { useRef, useState } from "react";
import {
  LuDatabase,
  LuDownload,
  LuUpload,
  LuFileSpreadsheet,
} from "react-icons/lu";
import { tarihInputDegeri } from "../services/api";
import {
  yedekOlustur,
  yedekCoz,
  csvOlustur,
  dosyaAdiParcasi,
  dosyaIndir,
} from "../services/veri";

const EN_BUYUK_YEDEK = 5 * 1024 * 1024;
// Excel'in Türkçe karakterleri doğru okuması için dosyanın başına eklenir.
const BOM = String.fromCharCode(0xfeff);

export default function VeriPaneli({
  kullanicilar,
  seciliKullanici,
  gorunenHarcamalar,
  periyotAdi,
  onYedekYukle,
}) {
  const dosyaRef = useRef(null);
  const [durum, setDurum] = useState(null); // { tur: "ok" | "hata", mesaj }

  const kayitSayisi = (liste) =>
    liste.reduce((acc, k) => acc + k.harcamalar.length, 0);

  const yedekIndir = () => {
    dosyaIndir(
      `finansal-takip-yedek-${tarihInputDegeri()}.json`,
      yedekOlustur(kullanicilar),
      "application/json",
    );
    setDurum({
      tur: "ok",
      mesaj: `Yedek indirildi: ${kullanicilar.length} kullanıcı, ${kayitSayisi(kullanicilar)} kayıt.`,
    });
  };

  const csvIndir = () => {
    const ad = [
      "harcamalar",
      dosyaAdiParcasi(seciliKullanici.ad),
      dosyaAdiParcasi(periyotAdi),
      tarihInputDegeri(),
    ].join("-");
    dosyaIndir(
      `${ad}.csv`,
      BOM + csvOlustur(gorunenHarcamalar),
      "text/csv;charset=utf-8",
    );
    setDurum({
      tur: "ok",
      mesaj: `${gorunenHarcamalar.length} kayıt dışa aktarıldı.`,
    });
  };

  const dosyaSecildi = async (e) => {
    const dosya = e.target.files?.[0];
    e.target.value = ""; // aynı dosya yeniden seçilebilsin
    if (!dosya) return;

    try {
      if (dosya.size > EN_BUYUK_YEDEK)
        throw new Error("Dosya çok büyük (en fazla 5 MB).");
      const yeni = yedekCoz(await dosya.text());

      const onay =
        kullanicilar.length === 0 ||
        window.confirm(
          `Yedekte ${yeni.length} kullanıcı ve ${kayitSayisi(yeni)} kayıt var.\n\n` +
            `Şu anki veriler (${kullanicilar.length} kullanıcı, ${kayitSayisi(kullanicilar)} kayıt) silinip yerine bu yedek yüklenecek. Devam edilsin mi?`,
        );
      if (!onay) return;

      onYedekYukle(yeni);
      setDurum({
        tur: "ok",
        mesaj: `Yedek yüklendi: ${yeni.length} kullanıcı, ${kayitSayisi(yeni)} kayıt.`,
      });
    } catch (hata) {
      setDurum({ tur: "hata", mesaj: hata.message || "Yedek yüklenemedi." });
    }
  };

  const dugmeSinifi =
    "w-full flex items-center gap-3 p-3 rounded-2xl bg-gray-50 text-left text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-50 transition-colors cursor-pointer";

  return (
    <section className="bg-white p-5 md:p-6 rounded-[2rem] shadow-sm border border-gray-100">
      <h2 className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-1">
        <LuDatabase size={14} />
        Veriler
      </h2>

      <div className="space-y-2">
        <button
          type="button"
          onClick={yedekIndir}
          disabled={!kullanicilar.length}
          className={dugmeSinifi}
        >
          <LuDownload size={16} className="text-blue-600 shrink-0" />
          Yedek indir
        </button>

        <button
          type="button"
          onClick={() => dosyaRef.current?.click()}
          className={dugmeSinifi}
        >
          <LuUpload size={16} className="text-blue-600 shrink-0" />
          Yedekten yükle
        </button>
        <input
          ref={dosyaRef}
          type="file"
          accept="application/json,.json"
          onChange={dosyaSecildi}
          className="hidden"
          aria-label="Yedek dosyası seç"
        />

        <button
          type="button"
          onClick={csvIndir}
          disabled={!seciliKullanici || !gorunenHarcamalar.length}
          className={dugmeSinifi}
        >
          <LuFileSpreadsheet size={16} className="text-green-600 shrink-0" />
          <span className="min-w-0">
            <span className="block">Excel'e aktar (CSV)</span>
            {seciliKullanici && (
              <span className="block text-[11px] font-medium text-gray-400 truncate">
                {seciliKullanici.ad} · {periyotAdi} ·{" "}
                {gorunenHarcamalar.length} kayıt
              </span>
            )}
          </span>
        </button>
      </div>

      <p
        role="status"
        className={`mt-3 px-1 text-xs font-medium min-h-4 ${
          durum?.tur === "hata" ? "text-red-500" : "text-gray-400"
        }`}
      >
        {durum?.mesaj ?? "Yedek, tüm kullanıcıları ve kayıtları içerir."}
      </p>
    </section>
  );
}
