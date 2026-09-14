"use client";

import { useMemo, useState } from "react";
import type { SectionOf, SiteContent } from "@/lib/content/schema";
import {
  MONTHS_TR,
  birthDate,
  datedSteps,
  formatDate,
  vaccineMessage,
} from "@/lib/content/vaccines";
import { Container } from "./primitives";
import { Reveal } from "./Reveal";
import { VetIcon, WhatsAppGlyph } from "./VetIcons";

type Skin = "gunes" | "nabiz";

const STATE_LABEL = { past: "Geçti", next: "Sıradaki", later: "" } as const;

/**
 * The vaccine and care timeline — Petcute's numbered dotted stepper, made to do something.
 *
 * Pick kedi or köpek and the month the animal was born, and each step of the clinic's
 * schedule comes back with a date: what has passed, what is next, what comes later. It
 * ends in a WhatsApp message carrying the species, the month and the next step.
 *
 * The first render is computed from the `today` the server passes down, and so is the
 * client's initial state, so hydration always matches. The default birth month is two
 * months back, which is when owners of a new puppy or kitten actually go looking.
 */
export function Vaccines({
  section,
  content,
  skin,
  today,
}: {
  section: SectionOf<"vaccines">;
  content: SiteContent;
  skin: Skin;
  today: string;
}) {
  const now = useMemo(() => new Date(today), [today]);
  const defaults = useMemo(() => {
    const month = now.getUTCMonth() - 2;
    return {
      year: month < 0 ? now.getUTCFullYear() - 1 : now.getUTCFullYear(),
      month: (month + 12) % 12,
    };
  }, [now]);

  const [speciesId, setSpeciesId] = useState(section.species[0].id);
  const [year, setYear] = useState(defaults.year);
  const [month, setMonth] = useState(defaults.month);

  const species = section.species.find((s) => s.id === speciesId) ?? section.species[0];
  const birth = birthDate(year, month);
  const steps = datedSteps(species, birth, now);
  const years = [0, 1, 2, 3].map((back) => now.getUTCFullYear() - back);
  const href = `${content.business.whatsapp}?text=${encodeURIComponent(
    vaccineMessage(content, species, birth, steps),
  )}`;

  return (
    <section id="asi-takvimi" className={`vx vx-${skin}`}>
      <Container>
        <Reveal className="vx-head">
          <p className="vx-kicker">
            <VetIcon name="asi" />
            Aşı takvimi
          </p>
          <h2 className="vx-title">{section.title}</h2>
          {section.intro ? <p className="vx-intro">{section.intro}</p> : null}
        </Reveal>

        <div className="vx-controls">
          <div className="vx-species" role="radiogroup" aria-label="Dostunuz">
            {section.species.map((option) => (
              <label key={option.id} className="vx-seg">
                <input
                  type="radio"
                  name="vx-species"
                  value={option.id}
                  checked={option.id === speciesId}
                  onChange={() => setSpeciesId(option.id)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
          <label className="vx-select">
            <span>Doğduğu ay</span>
            <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {MONTHS_TR.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <label className="vx-select">
            <span>Yıl</span>
            <select value={year} onChange={(event) => setYear(Number(event.target.value))}>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <Reveal className="vx-track">
          <ol className="vx-steps" style={{ ["--n" as string]: steps.length }}>
            {steps.map((step, index) => (
              <li
                key={`${species.id}-${step.label}`}
                className={`vx-step is-${step.state}`}
                style={{ ["--i" as string]: index }}
              >
                <span className="vx-dot" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="vx-tile">
                  <span className="vx-icon">
                    <VetIcon name={step.icon ?? "kontrol"} />
                  </span>
                  <b className="vx-label">{step.label}</b>
                  <span className="vx-date">{formatDate(step.date)}</span>
                  {STATE_LABEL[step.state] ? (
                    <span className="vx-state">{STATE_LABEL[step.state]}</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Reveal>

        <div className="vx-foot">
          <p className="vx-note">{section.note}</p>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            data-cta="whatsapp"
            className="vx-send"
          >
            <WhatsAppGlyph />
            Takvimi WhatsApp’tan gönder
          </a>
        </div>
      </Container>
    </section>
  );
}
