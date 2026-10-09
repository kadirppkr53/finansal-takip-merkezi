import {
  LuUtensils,
  LuShoppingCart,
  LuCar,
  LuReceipt,
  LuHouse,
  LuStethoscope,
  LuDumbbell,
  LuClapperboard,
  LuShirt,
  LuGraduationCap,
  LuSmartphone,
  LuPlane,
  LuGift,
  LuBriefcase,
  LuWallet,
} from "react-icons/lu";

/**
 * Harcama adından kategori tahmini için anahtar kelime haritası.
 * Sıra önemlidir: ilk eşleşen kategori kazanır.
 */
export const KATEGORILER = [
  {
    id: "yemek",
    label: "Yemek",
    Icon: LuUtensils,
    renk: "#f97316",
    anahtarlar: [
      "yemek",
      "restoran",
      "cafe",
      "kafe",
      "kahve",
      "döner",
      "pizza",
      "burger",
      "yemeksepeti",
      "getir",
      "öğle",
      "akşam",
    ],
  },
  {
    id: "market",
    label: "Market",
    Icon: LuShoppingCart,
    renk: "#22c55e",
    anahtarlar: [
      "market",
      "pazar",
      "migros",
      "bim",
      "a101",
      "şok",
      "carrefour",
      "alışveriş",
    ],
  },
  {
    id: "ulasim",
    label: "Ulaşım",
    Icon: LuCar,
    renk: "#3b82f6",
    anahtarlar: [
      "ulaşım",
      "ulasim",
      "yol",
      "benzin",
      "yakıt",
      "otobüs",
      "metro",
      "taksi",
      "uber",
      "akbil",
      "bilet",
      "otopark",
    ],
  },
  {
    id: "fatura",
    label: "Fatura",
    Icon: LuReceipt,
    renk: "#eab308",
    anahtarlar: [
      "fatura",
      "elektrik",
      "doğalgaz",
      "dogalgaz",
      "internet",
      "telefon",
      "aidat",
      "abonelik",
    ],
  },
  {
    id: "kira",
    label: "Kira & Ev",
    Icon: LuHouse,
    renk: "#8b5cf6",
    anahtarlar: ["kira", "ev ", "mobilya", "tamir", "temizlik"],
  },
  {
    id: "saglik",
    label: "Sağlık",
    Icon: LuStethoscope,
    renk: "#ef4444",
    anahtarlar: [
      "sağlık",
      "saglik",
      "doktor",
      "eczane",
      "ilaç",
      "hastane",
      "diş",
    ],
  },
  {
    id: "spor",
    label: "Spor",
    Icon: LuDumbbell,
    renk: "#14b8a6",
    anahtarlar: ["spor", "fitness", "gym", "yüzme", "antrenman"],
  },
  {
    id: "eglence",
    label: "Eğlence",
    Icon: LuClapperboard,
    renk: "#ec4899",
    anahtarlar: [
      "eğlence",
      "eglence",
      "sinema",
      "oyun",
      "netflix",
      "spotify",
      "konser",
      "tiyatro",
    ],
  },
  {
    id: "giyim",
    label: "Giyim",
    Icon: LuShirt,
    renk: "#06b6d4",
    anahtarlar: [
      "giyim",
      "kıyafet",
      "ayakkabı",
      "elbise",
      "pantolon",
      "mont",
      "tişört",
    ],
  },
  {
    id: "egitim",
    label: "Eğitim",
    Icon: LuGraduationCap,
    renk: "#6366f1",
    anahtarlar: ["eğitim", "kurs", "kitap", "okul", "üniversite", "udemy"],
  },
  {
    id: "teknoloji",
    label: "Teknoloji",
    Icon: LuSmartphone,
    renk: "#64748b",
    anahtarlar: ["teknoloji", "bilgisayar", "laptop", "kulaklık", "şarj"],
  },
  {
    id: "seyahat",
    label: "Seyahat",
    Icon: LuPlane,
    renk: "#0ea5e9",
    anahtarlar: ["seyahat", "tatil", "otel", "uçak", "ucak", "gezi"],
  },
  {
    id: "hediye",
    label: "Hediye",
    Icon: LuGift,
    renk: "#f43f5e",
    anahtarlar: ["hediye", "doğum günü", "çiçek"],
  },
  {
    id: "is",
    label: "İş",
    Icon: LuBriefcase,
    renk: "#78716c",
    anahtarlar: ["maaş", "ofis", "toplantı", "kırtasiye"],
  },
];

export const DIGER_KATEGORI = {
  id: "diger",
  label: "Diğer",
  Icon: LuWallet,
  renk: "#94a3b8",
  anahtarlar: [],
};

export const kategoriBul = (ad = "") => {
  const kucuk = String(ad).toLocaleLowerCase("tr-TR");
  return (
    KATEGORILER.find((k) => k.anahtarlar.some((a) => kucuk.includes(a))) ||
    DIGER_KATEGORI
  );
};
