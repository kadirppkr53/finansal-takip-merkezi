// Karanlık tema: <html> üzerindeki "dark" sınıfı ile açılır.
// Renk karşılıkları index.css içindeki ".dark" bloğunda tanımlıdır.
// İlk boyamada titremeyi önlemek için sınıf, index.html'deki küçük betikle
// sayfa çizilmeden önce eklenir; buradaki kod yalnızca sonraki değişiklikleri yönetir.

const ANAHTAR = "tema";
const TEMA_RENGI = { acik: "#2563eb", koyu: "#0f172a" };

export const koyuTemaAcik = () =>
  document.documentElement.classList.contains("dark");

export const temaUygula = (koyu) => {
  document.documentElement.classList.toggle("dark", koyu);
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", koyu ? TEMA_RENGI.koyu : TEMA_RENGI.acik);
  try {
    localStorage.setItem(ANAHTAR, koyu ? "koyu" : "acik");
  } catch {
    // Depolama kapalıysa seçim yalnızca bu oturumda geçerli olur.
  }
};
