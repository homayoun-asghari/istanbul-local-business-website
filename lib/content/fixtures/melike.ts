import type { SiteContent } from "../schema";

/**
 * Melike Adıgüzel Güzellik Salonu — Osmaniye, Bakırköy.
 *
 * Verified from the leads sheet and checkable by the owner in ten seconds: name,
 * neighbourhood, district, phone, WhatsApp, Google rating, review count, five-star
 * share, coordinates, Maps listing, and the salon's own Maps photo.
 *
 * Marked `placeholder: true`: services, about copy and gallery captions. These come from
 * the beauty pack. They name real services a güzellik salonu offers and assert no price,
 * no staff member and no clinical claim, because the owner reads this before replying.
 */
const MAPS_PHOTO =
  "https://lh3.googleusercontent.com/gps-cs-s/AHRPTWm7ZQGYV0SgFibR7fZ9sbYb9fr2cnsH_05jInmVEuqdWPlwh6yolpVMW4Rw-KtwpwH-OZvSWFxttdDlO7N-6PNMkl1vijAu9Wi7CE_aO80GosqZJve7NPcTF0JN1nIMZlkVbAYn=w1200-h900-k-no";

export const melike: SiteContent = {
  version: 1,
  slug: "melike-adiguzel-guzellik",
  pack: "beauty",
  preset: "atolye",
  business: {
    name: "Melike Adıgüzel Güzellik Salonu",
    district: "Bakırköy",
    neighborhood: "Osmaniye",
    phone: "+905515330919",
    whatsapp: "https://wa.me/905515330919",
    rating: 4.7,
    reviewCount: 1273,
    fiveStarPct: 92,
    lat: 40.9952757,
    lng: 28.8810021,
    mapsUrl: "https://www.google.com/maps/place/?q=place_id:ChIJD-jkExq7yhQRxL-Ssrd2wlY",
  },
  hours: {
    mon: { open: "09:00", close: "19:00" },
    tue: { open: "09:00", close: "19:00" },
    wed: { open: "09:00", close: "19:00" },
    thu: { open: "09:00", close: "19:00" },
    fri: { open: "09:00", close: "19:00" },
    sat: { open: "09:00", close: "19:00" },
    sun: "closed",
    note: "Randevu ile çalışılmaktadır.",
  },
  whatsappMessage:
    "Merhaba, web sitenizden yazıyorum. Randevu almak istiyorum, uygun saatleriniz nedir?",
  seo: {
    title: "Melike Adıgüzel Güzellik Salonu — Osmaniye, Bakırköy",
    description:
      "Bakırköy Osmaniye'de güzellik ve bakım hizmetleri. Google'da 1.273 değerlendirme ile 4,7 puan. Randevu için WhatsApp’tan yazabilirsiniz.",
  },
  sections: [
    {
      type: "hero",
      headline: "Bakırköy'de kendinizi iyi hissettiren bakım",
      subline:
        "Osmaniye’deki salonumuzda cilt bakımından kalıcı makyaja kadar her işlemi, size ayrılmış zaman ve tek tek planlanmış randevularla yapıyoruz.",
      image: {
        src: MAPS_PHOTO,
        alt: "Melike Adıgüzel Güzellik Salonu'nun Osmaniye, Bakırköy'deki salonundan bir kare",
        width: 1200,
        height: 900,
      },
      placeholder: true,
    },
    { type: "proof", placeholder: false },
    {
      type: "services",
      title: "Hizmetlerimiz",
      intro: "Randevunuzda hangi işlemin size uygun olduğunu birlikte belirliyoruz.",
      items: [
        {
          name: "Cilt Bakımı",
          description: "Cilt tipinize göre planlanan temizlik ve bakım seansları.",
        },
        {
          name: "Lazer Epilasyon",
          description: "Seans aralıkları cilt ve tüy yapınıza göre belirlenir.",
        },
        { name: "Ağda ve Tüy Bakımı", description: "Bölgesel ağda ve düzenli bakım." },
        { name: "Kaş ve Kirpik Tasarımı", description: "Yüz hatlarınıza göre kaş şekillendirme." },
        { name: "Kalıcı Makyaj", description: "Kaş, eyeliner ve dudak uygulamaları." },
        { name: "Manikür ve Pedikür", description: "El ve ayak bakımı, oje ve kalıcı oje." },
      ],
      placeholder: true,
    },
    {
      type: "about",
      title: "Hakkımızda",
      body: [
        "Osmaniye Mahallesi’ndeki salonumuzda, Bakırköy ve çevresinden gelen misafirlerimizi ağırlıyoruz.",
        "Google üzerinde 1.273 değerlendirme aldık ve ortalamamız 4,7. Değerlendirmelerin %92’si beş yıldız. Bizi tercih eden herkese ayrı ayrı teşekkür ederiz.",
        "Randevu sistemiyle çalışıyoruz; böylece her misafirimize ayrılmış bir zaman diliminde ilgilenebiliyoruz.",
      ],
      placeholder: true,
    },
    {
      type: "gallery",
      title: "Salondan",
      images: [
        {
          src: MAPS_PHOTO,
          alt: "Melike Adıgüzel Güzellik Salonu iç mekan",
          width: 1200,
          height: 900,
        },
      ],
      placeholder: true,
    },
    { type: "hours", title: "Çalışma Saatleri", placeholder: false },
    { type: "contact", title: "İletişim ve Konum", placeholder: false },
  ],
};
