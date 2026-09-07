import type { SiteContent } from "@/lib/content/schema";
import {
  ALWAYS_OPEN,
  WEEKDAYS_9_TO_7,
  baseBusiness,
  reviewSentence,
  type BuildInput,
} from "../build";

/**
 * Veteriner services. Deliberately no treatment promises and no drug names — a clinic
 * owner reading an invented clinical claim about their own practice stops replying.
 */
const SERVICES = [
  { name: "Muayene ve Kontrol", description: "Genel sağlık kontrolü ve rutin takip." },
  { name: "Aşı ve Parazit Koruması", description: "Aşı takvimi ve düzenli koruma programı." },
  { name: "Laboratuvar ve Görüntüleme", description: "Klinik içinde tahlil ve görüntüleme." },
  { name: "Cerrahi Girişimler", description: "Randevu ile planlanan operasyonlar." },
  { name: "Diş Sağlığı", description: "Ağız ve diş bakımı, tartar temizliği." },
  { name: "Pet Kuaför ve Bakım", description: "Tıraş, tırnak ve kulak bakımı." },
];

/** "7/24" in the name is how the operator's own sheet marks a clinic that never closes. */
export function isAlwaysOpen(businessName: string): boolean {
  return /7\s*[/.]?\s*24/.test(businessName);
}

export function buildVetSite(lead: BuildInput, preset = "klinik"): SiteContent {
  const business = baseBusiness(lead);
  const alwaysOpen = isAlwaysOpen(lead.business);

  const about = [
    `${business.neighborhood} Mahallesi’ndeki kliniğimizde, ${business.district} ve çevresindeki dostlarımıza bakıyoruz.`,
    reviewSentence(lead),
    alwaysOpen
      ? "Acil durumlar için gece gündüz açığız; gelmeden önce arayarak bilgi verebilirsiniz."
      : "Muayene randevu ile yapılır; acil durumlarda önce telefonla ulaşmanızı rica ederiz.",
  ].filter((paragraph): paragraph is string => Boolean(paragraph));

  const emergency: SiteContent["sections"] = alwaysOpen
    ? [
        {
          type: "emergency",
          title: "7/24 Acil Veteriner",
          note: "Gece gündüz açığız. Yola çıkmadan önce arayın, sizi bekliyor olalım.",
          placeholder: false,
        },
      ]
    : [];

  return {
    version: 1,
    slug: lead.slug,
    pack: "vet",
    preset,
    business,
    hours: alwaysOpen ? ALWAYS_OPEN : WEEKDAYS_9_TO_7,
    whatsappMessage:
      "Merhaba, web sitenizden yazıyorum. Dostum için randevu almak istiyorum, uygun musunuz?",
    seo: {
      title: `${business.name} — ${business.neighborhood}, ${business.district}`,
      description: `${business.district} ${business.neighborhood}’de veteriner kliniği.${
        alwaysOpen ? " 7/24 acil hizmet." : ""
      } Randevu için WhatsApp’tan yazabilirsiniz.`,
    },
    sections: [
      {
        type: "hero",
        headline: alwaysOpen
          ? `${business.district}’de gece gündüz açık veteriner kliniği`
          : `${business.district}’de dostunuzun yanında`,
        subline: `${business.neighborhood}’deki kliniğimizde muayeneden aşı takvimine, laboratuvardan cerrahiye kadar bakımını tek yerde sürdürüyoruz.`,
        image: {
          src: lead.photo!,
          alt: `${business.name}’nin ${business.neighborhood}, ${business.district}’deki kliniği`,
        },
        placeholder: true,
      },
      ...emergency,
      { type: "proof", placeholder: false },
      {
        type: "services",
        title: "Hizmetlerimiz",
        intro: "Dostunuzun ihtiyacını muayenede birlikte belirliyoruz.",
        items: SERVICES,
        placeholder: true,
      },
      { type: "about", title: "Kliniğimiz", body: about, placeholder: true },
      { type: "hours", title: "Çalışma Saatleri", placeholder: false },
      { type: "contact", title: "İletişim ve Konum", placeholder: false },
    ],
  };
}
