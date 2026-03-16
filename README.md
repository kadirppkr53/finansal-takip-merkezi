# Finansal Takip Merkezi 💰

![Finansal Takip Merkezi Ana Ekran](images/finans_proje.png)

### 🎯 Hızlı Bakış
**Finansal Takip Merkezi**, karmaşık finansal tablolardan kurtulmanı sağlayan; harcamalarını saniyeler içinde kaydedip, görsel grafiklerle bütçe disiplinini korumana yardımcı olan modern bir kişisel finans yönetim arayüzüdür.

## 🔗 Canlı Demo
Uygulamanın güncel haline buradan ulaşabilirsiniz:
👉 [https://delicate-boba-47275e.netlify.app/](https://delicate-boba-47275e.netlify.app/)

## 💡 Projenin Amacı
Modern dünyada kişisel bütçeyi yönetmek, harcamaları anlık görebilmek ve gelecek planlaması yapmak oldukça kritiktir. Bu uygulama, kullanıcıların karmaşık finansal tablolarla uğraşmadan, harcamalarını sisteme girmelerini ve bu harcamaların bütçeleri üzerindeki etkisini görsel olarak analiz etmelerini hedefler.

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

## 🚀 Gelecek Vizyonu ve Katkı
Bu proje, kişisel finans yönetimini herkes için erişilebilir kılma yolculuğunda sadece bir başlangıç noktasıdır. Uygulamanın sınırlarını genişletmek ve daha akıllı bir deneyim sunmak için şu fikirler üzerinde çalışılabilir:

* **Finansal Zeka (AI):** Harcama alışkanlıklarını analiz eden ve proaktif önerilerde bulunan bir yapay zeka entegrasyonu.
* **Global Entegrasyon:** Döviz kuru API’leri ile çoklu para birimi desteği.
* **Gelişmiş Raporlama:** Verilerin PDF veya Excel formatında dışa aktarılması.
* **Sosyal Hedefler:** Aile üyeleri veya arkadaşlarla ortak bütçe havuzları.

---

### 💡 Nasıl Katkıda Bulunabilirsin?
Senin de bu projenin bir parçası olmanı çok isterim! Eğer bir fikrin varsa veya bir hata keşfettiysen:
1. **Fork** yap, 
2. Bir **Branch** oluştur,
3. Değişikliklerini **Commit** et ve bir **Pull Request** gönder.
