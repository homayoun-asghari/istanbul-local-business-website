import type { SiteContent } from "@/lib/content/schema";
import {
  ALWAYS_OPEN,
  WEEKDAYS_9_TO_7,
  baseBusiness,
  reviewSentence,
  type BuildInput,
} from "../build";

void ALWAYS_OPEN;

/**
 * Real services a güzellik salonu offers, with descriptions that describe the process
 * rather than promise a result. No prices, no staff names, no clinical claims — the
 * owner reads this before replying, and a wrong specific is worse than a vague one.
 */
const SERVICES = [
  { name: "Cilt Bakımı", description: "Cilt tipinize göre planlanan temizlik ve bakım seansları." },
  {
    name: "Lazer Epilasyon",
    description: "Seans aralıkları cilt ve tüy yapınıza göre belirlenir.",
  },
  { name: "Ağda ve Tüy Bakımı", description: "Bölgesel ağda ve düzenli bakım." },
  { name: "Kaş ve Kirpik Tasarımı", description: "Yüz hatlarınıza göre kaş şekillendirme." },
  { name: "Kalıcı Makyaj", description: "Kaş, eyeliner ve dudak uygulamaları." },
  { name: "Manikür ve Pedikür", description: "El ve ayak bakımı, oje ve kalıcı oje." },
];

export function buildBeautySite(lead: BuildInput, preset = "atolye"): SiteContent {
  const business = baseBusiness(lead);
  const about = [
    `${business.neighborhood} Mahallesi’ndeki salonumuzda, ${business.district} ve çevresinden gelen misafirlerimizi ağırlıyoruz.`,
    reviewSentence(lead),
    "Randevu sistemiyle çalışıyoruz; böylece her misafirimize ayrılmış bir zaman diliminde ilgilenebiliyoruz.",
  ].filter((paragraph): paragraph is string => Boolean(paragraph));

  return {
    version: 1,
    slug: lead.slug,
    pack: "beauty",
    preset,
    business,
    hours: WEEKDAYS_9_TO_7,
    whatsappMessage:
      "Merhaba, web sitenizden yazıyorum. Randevu almak istiyorum, uygun saatleriniz nedir?",
    seo: {
      title: `${business.name} — ${business.neighborhood}, ${business.district}`,
      description: `${business.district} ${business.neighborhood}’de güzellik ve bakım hizmetleri. Randevu için WhatsApp’tan yazabilirsiniz.`,
    },
    sections: [
      {
        type: "hero",
        headline: `${business.district}’de kendinizi iyi hissettiren bakım`,
        subline: `${business.neighborhood}’deki salonumuzda cilt bakımından kalıcı makyaja kadar her işlemi, size ayrılmış zaman ve tek tek planlanmış randevularla yapıyoruz.`,
        image: {
          src: lead.photo!,
          alt: `${business.name}’nin ${business.neighborhood}, ${business.district}’deki salonundan bir kare`,
        },
        placeholder: true,
      },
      { type: "proof", placeholder: false },
      {
        type: "services",
        title: "Hizmetlerimiz",
        intro: "Randevunuzda hangi işlemin size uygun olduğunu birlikte belirliyoruz.",
        items: SERVICES,
        placeholder: true,
      },
      { type: "about", title: "Hakkımızda", body: about, placeholder: true },
      {
        type: "gallery",
        title: "Salondan",
        images: [{ src: lead.photo!, alt: `${business.name} iç mekan` }],
        placeholder: true,
      },
      { type: "hours", title: "Çalışma Saatleri", placeholder: false },
      { type: "contact", title: "İletişim ve Konum", placeholder: false },
    ],
  };
}
