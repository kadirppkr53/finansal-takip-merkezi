# Finansal Takip Merkezi - Proje Detayları

## 🔗 Canlı Demo
Uygulamanın güncel haline buradan ulaşabilirsiniz:
👉 [https://delicate-boba-47275e.netlify.app/](https://delicate-boba-47275e.netlify.app/)

## 💡 Projenin Amacı
Modern dünyada kişisel bütçeyi yönetmek, harcamaları anlık görebilmek ve gelecek planlaması yapmak oldukça kritiktir. Bu uygulama, kullanıcıların karmaşık finansal tablolarla uğraşmadan, saniyeler içinde harcamalarını sisteme girmelerini ve bu harcamaların bütçeleri üzerindeki etkisini görsel olarak analiz etmelerini hedefler.

## ⚙️ Teknik Mimari
Projemiz, modern bir front-end geliştirme süreciyle inşa edilmiştir:

1. **State Yönetimi:** Harcamalar, kullanıcıların tarayıcılarında bulunan `LocalStorage` üzerinde tutulur. Bu sayede sayfayı yenileseniz bile verileriniz kaybolmaz.
2. **Bileşen Tabanlı Yapı:** Arayüz, `React` bileşenlerine (components) bölünerek modüler hale getirilmiştir. Bu da bakımını ve geliştirilmesini kolaylaştırır.
3. **Dinamik Analiz:** Harcama analizleri, kullanıcının seçtiği periyoda göre (Günlük/Haftalık/Aylık) anlık olarak yeniden hesaplanır.

## 📈 Veri Akışı
Uygulamanın kalbinde basit ama etkili bir veri döngüsü bulunur:
* **Girdi:** Harcama formu aracılığıyla veriler alınır.
* **İşleme:** Form verisi `State` içine alınır ve hesaplamalar yapılır.
* **Görselleştirme:** İşlenmiş veriler grafik bileşenlerine aktarılarak bütçe durumunuzu özetler.



## 🛠 Neden Bu Teknolojiler?
* **React + Vite:** Hızlı derleme ve kullanıcı dostu geliştirme süreci için tercih edildi.
* **Tailwind CSS:** Tasarım tutarlılığını sağlamak ve modern arayüzleri hızlıca kurgulamak için seçildi.
* **Netlify:** Projeyi tek tıkla dünyanın her yerine güvenli ve hızlı bir şekilde yayınlamak için kullanıldı.

## 🤝 Katkıda Bulunma
Bu proje geliştirilmeye açıktır. Özellikle yeni grafik türleri veya dış API entegrasyonları (döviz kuru takibi gibi) projenin bir sonraki aşamasını oluşturabilir.
