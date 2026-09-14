import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { whatsappHref } from "@/lib/content/schema";
import { presetFor } from "@/packs/registry";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";
import { ChevronMark, VetIcon } from "./VetIcons";

type Skin = "gunes" | "nabiz";

/**
 * Services, drawn two ways.
 *
 * Güneş is VetCare's "best services" block: the services split into two columns that face
 * each other across a dog sitting in a sunflower blob, icons on the inner edge.
 *
 * Nabız is Pampaw's notched composition: a blue photo panel locked into a second blue
 * panel by inverted corners, a navy card in the gap they leave, and a light card sitting
 * on the lower panel. The rest of the services follow as a plain row of cards.
 */
export function VetServices({
  section,
  content,
  skin,
}: {
  section: SectionOf<"services">;
  content: SiteContent;
  skin: Skin;
}) {
  return skin === "nabiz" ? (
    <NabizServices section={section} content={content} />
  ) : (
    <GunesServices section={section} content={content} />
  );
}

function GunesServices({
  section,
  content,
}: {
  section: SectionOf<"services">;
  content: SiteContent;
}) {
  const pet = presetFor(content).stock?.extras?.servicesPet;
  const half = Math.ceil(section.items.length / 2);
  const columns = [section.items.slice(0, half), section.items.slice(half)];

  return (
    <section id="hizmetler" className="gn-services">
      <Container>
        <Reveal className="gn-head">
          <p className="gn-kicker">Dostunuz için</p>
          <h2 className="gn-title">{section.title}</h2>
          {section.intro ? <p className="gn-intro">{section.intro}</p> : null}
        </Reveal>

        <div className="gn-svc">
          {columns.map((items, column) => (
            <ul key={column} className={`gn-svc-col ${column === 0 ? "is-left" : "is-right"}`}>
              {items.map((item, index) => (
                <Reveal as="li" key={item.name} delay={index * 90} className="gn-svc-item">
                  <span className="gn-svc-icon">
                    <VetIcon name={item.icon ?? "muayene"} />
                  </span>
                  <span className="gn-svc-text">
                    <b>{item.name}</b>
                    {item.description ? <span>{item.description}</span> : null}
                  </span>
                </Reveal>
              ))}
            </ul>
          ))}

          <div className="gn-svc-center" aria-hidden="true">
            <svg viewBox="0 0 400 400">
              <path d="M205 22c78 4 150 52 168 132 17 76-14 160-80 202-68 44-170 40-232-12C2 296-12 206 26 136 62 70 132 18 205 22Z" />
            </svg>
            {pet ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={pet} alt="" loading="lazy" decoding="async" />
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

function NabizServices({
  section,
  content,
}: {
  section: SectionOf<"services">;
  content: SiteContent;
}) {
  const [first, second, third, ...rest] = section.items;
  const book = whatsappHref(content);

  return (
    <section id="hizmetler" className="nb-services">
      <Container>
        <Reveal className="nb-head">
          <span className="nb-pill">Hizmetlerimiz</span>
          <h2 className="nb-title">Dostunuz için muayeneden cerrahiye</h2>
          {section.intro ? <p className="nb-intro">{section.intro}</p> : null}
        </Reveal>

        <div className="nb-notch">
          <svg
            className="nb-notch-shape"
            viewBox="0 0 1140 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="nb-notch-fill" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#8FD7EE" />
                <stop offset="0.45" stopColor="#3AA8D6" />
                <stop offset="1" stopColor="#1C86C1" />
              </linearGradient>
            </defs>
            <path
              fill="url(#nb-notch-fill)"
              d="M30 0H632a30 30 0 0 1 30 30V398a32 32 0 0 0 32 32H1110a30 30 0 0 1 30 30V870a30 30 0 0 1-30 30H630a30 30 0 0 1-30-30V462a32 32 0 0 0-32-32H30A30 30 0 0 1 0 400V30A30 30 0 0 1 30 0Z"
            />
          </svg>

          {first ? (
            <>
              <Reveal className="nb-n-photo">
                <span className="nb-n-tile">
                  <VetIcon name={first.icon ?? "muayene"} />
                </span>
                {first.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={first.image.src} alt={first.image.alt} loading="lazy" />
                ) : null}
              </Reveal>
              <Reveal delay={120} className="nb-n-copy">
                <h3>{first.name}</h3>
                {first.description ? <p>{first.description}</p> : null}
                <a
                  href={book}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta="whatsapp"
                  className="nb-btn"
                >
                  Randevu al
                  <i>
                    <ChevronMark />
                  </i>
                </a>
              </Reveal>
            </>
          ) : null}

          {second ? (
            <Reveal className="nb-n-dark">
              <h3>{second.name}</h3>
              {second.description ? <p>{second.description}</p> : null}
              <a
                href={book}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="whatsapp"
                className="nb-n-link"
              >
                Randevu al
                <i>
                  <ChevronMark />
                </i>
              </a>
              {second.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={second.image.src} alt={second.image.alt} loading="lazy" />
              ) : null}
            </Reveal>
          ) : null}

          {third ? (
            <Reveal delay={140} className="nb-n-light">
              <span className="nb-tag">Randevuyla</span>
              <span className="nb-n-light-icon">
                <VetIcon name={third.icon ?? "laboratuvar"} />
              </span>
              <h3>{third.name}</h3>
              <div className="nb-n-light-foot">
                {third.description ? <p>{third.description}</p> : null}
                <a
                  href={book}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cta="whatsapp"
                  className="nb-btn nb-btn-orange"
                >
                  Yazın
                  <i>
                    <ChevronMark />
                  </i>
                </a>
              </div>
            </Reveal>
          ) : null}
        </div>

        {rest.length > 0 ? (
          <ul className="nb-svc-row">
            {rest.map((item, index) => (
              <Reveal as="li" key={item.name} delay={index * 90} className="nb-svc-card">
                <span className="nb-svc-icon">
                  <VetIcon name={item.icon ?? "kontrol"} />
                </span>
                <b>{item.name}</b>
                {item.description ? <span>{item.description}</span> : null}
              </Reveal>
            ))}
          </ul>
        ) : null}
      </Container>
    </section>
  );
}
