// Temalar: <html> üzerindeki `data-tema` niteliği ile seçilir; koyu zeminli
// temalarda ayrıca "dark" sınıfı bulunur. Renk karşılıkları index.css içindeki
// "TEMALAR" bölümünde tanımlıdır.
//
// İlk boyamada titremeyi önlemek için tema, index.html'deki küçük betikle sayfa
// çizilmeden önce uygulanır; buradaki kod sonraki değişiklikleri yönetir.
// Yeni tema eklerken üç yer güncellenir: bu liste, index.css ve index.html'deki betik.

const ANAHTAR = "tema";

/**
 * `tarayiciRengi` mobil tarayıcının adres çubuğu rengidir.
 * `onizleme` yalnızca tema seçicideki küçük renk örneği içindir.
 */
export const TEMALAR = [
  {
    id: "acik",
    ad: "Açık",
    koyu: false,
    tarayiciRengi: "#2563eb",
    onizleme: { zemin: "#f9fafb", vurgu: "#2563eb" },
  },
  {
    id: "okyanus",
    ad: "Okyanus",
    koyu: false,
    tarayiciRengi: "#0f766e",
    onizleme: { zemin: "#eef6f7", vurgu: "#0f766e" },
  },
  {
    id: "kahve",
    ad: "Kahve",
    koyu: false,
    tarayiciRengi: "#8b5a34",
    onizleme: { zemin: "#f8f2e9", vurgu: "#8b5a34" },
  },
  {
    id: "koyu",
    ad: "Koyu",
    koyu: true,
    tarayiciRengi: "#0f172a",
    onizleme: { zemin: "#0f172a", vurgu: "#3b82f6" },
  },
  {
    id: "gece",
    ad: "Gece Yarısı",
    koyu: true,
    tarayiciRengi: "#000000",
    onizleme: { zemin: "#000000", vurgu: "#3b82f6" },
  },
  {
    id: "ametist",
    ad: "Ametist",
    koyu: true,
    tarayiciRengi: "#130f1f",
    onizleme: { zemin: "#130f1f", vurgu: "#8b5cf6" },
  },
];

const temaBul = (id) => TEMALAR.find((t) => t.id === id);

/** Şu an uygulanmış temanın kimliği. */
export const etkinTema = () =>
  temaBul(document.documentElement.dataset.tema)?.id ?? "acik";

export const temaUygula = (id) => {
  const tema = temaBul(id) ?? TEMALAR[0];
  const kok = document.documentElement;
  kok.dataset.tema = tema.id;
  kok.classList.toggle("dark", tema.koyu);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", tema.tarayiciRengi);
  try {
    localStorage.setItem(ANAHTAR, tema.id);
  } catch {
    // Depolama kapalıysa seçim yalnızca bu oturumda geçerli olur.
  }
  return tema.id;
};
