"use client";

import { useMemo, useState } from "react";
import type { SectionOf, SiteContent } from "@/lib/content/schema";
import {
  FDI_LOWER,
  FDI_UPPER,
  durationFraction,
  formatRange,
  planFor,
  plannerMessage,
  toothLabel,
} from "@/lib/content/planner";
import { Container } from "./primitives";

/**
 * The treatment planner — what this pack has instead of a price list.
 *
 * A dental site in Turkey may not publish prices, discounts or campaigns (m.5/1-l,
 * m.5/1-m), which removes the single section that answers the question every visitor
 * actually arrived with. This answers the next-best one: what would happen to me, how
 * many times would I come in, and over how long. Then it hands them a WhatsApp message
 * with their own answers already in it.
 *
 * The chart is FDI notation, the same two digits a Turkish dentist writes on a card.
 * Drawing it from an ellipse rather than from hand-authored path data means the arch
 * stays correct if the tooth count or the proportions ever change.
 */
export function Planner({
  section,
  content,
}: {
  section: SectionOf<"planner">;
  content: SiteContent;
}) {
  const [goalId, setGoalId] = useState(section.goals[0].id);
  const [methodId, setMethodId] = useState(section.goals[0].methods[0].id);
  const [teeth, setTeeth] = useState<number[]>([]);

  const goal = section.goals.find((candidate) => candidate.id === goalId) ?? section.goals[0];
  const plan = useMemo(
    () => planFor(section, { goalId, methodId, teeth }),
    [section, goalId, methodId, teeth],
  );

  const specialist = content.sections.flatMap((s) =>
    s.type === "team" ? s.members.filter((m) => m.role === plan?.method.specialist) : [],
  )[0];

  const chooseGoal = (id: string) => {
    const next = section.goals.find((candidate) => candidate.id === id);
    if (!next) return;
    setGoalId(id);
    // A method belongs to its goal, so switching goal has to move the method with it.
    setMethodId(next.methods[0].id);
  };

  const toggleTooth = (fdi: number) =>
    setTeeth((current) =>
      current.includes(fdi) ? current.filter((t) => t !== fdi) : [...current, fdi],
    );

  const href = plan
    ? `${content.business.whatsapp}?text=${encodeURIComponent(plannerMessage(content, plan))}`
    : content.business.whatsapp;

  return (
    <section id="plan" className="cam-planner">
      <Container>
        <div className="cam-centred">
          <p className="cam-eyebrow">Tedavi planlayıcı</p>
          <h2 className="cam-title">{section.title}</h2>
          {section.intro ? <p className="cam-intro">{section.intro}</p> : null}
        </div>

        <div className="cam-plan-grid">
          <div className="cam-plan-col">
            <fieldset className="cam-panel">
              <legend className="cam-panel-title">
                <span className="cam-step">01</span> Ne yaptırmak istiyorsunuz?
              </legend>
              {section.goals.map((option) => (
                <label key={option.id} className="cam-radio">
                  <input
                    type="radio"
                    name="cam-goal"
                    value={option.id}
                    checked={option.id === goalId}
                    onChange={() => chooseGoal(option.id)}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </fieldset>

            <fieldset className="cam-panel">
              <legend className="cam-panel-title">
                <span className="cam-step">02</span> Yöntem
              </legend>
              <div className="cam-chips">
                {goal.methods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    className={`cam-chip${method.id === methodId ? " is-on" : ""}`}
                    aria-pressed={method.id === methodId}
                    onClick={() => setMethodId(method.id)}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="cam-panel cam-chart">
            <div className="cam-panel-title">
              <span className="cam-step">03</span> Hangi bölge?
              <button type="button" className="cam-clear" onClick={() => setTeeth([])}>
                Temizle
              </button>
            </div>
            <ToothChart selected={teeth} onToggle={toggleTooth} />
            <p className="cam-chart-note">
              {teeth.length === 0
                ? "Diş seçmek isteğe bağlıdır."
                : teeth
                    .slice()
                    .sort((a, b) => a - b)
                    .map((fdi) => `${fdi} · ${toothLabel(fdi)}`)
                    .join(" · ")}
            </p>
          </div>

          <div className="cam-plan-col">
            <div className="cam-panel cam-result">
              <p className="cam-panel-title">
                <span className="cam-step">04</span> Planınız
              </p>

              {plan ? (
                <>
                  <div className="cam-metric">
                    <span className="cam-metric-label">Seans</span>
                    <span className="cam-metric-value">
                      {formatRange(plan.method.visits, "seans")}
                    </span>
                    <span className="cam-dots" aria-hidden="true">
                      {Array.from({ length: 8 }, (_, index) => (
                        <i key={index} className={index < plan.method.visits[1] ? "is-on" : ""} />
                      ))}
                    </span>
                  </div>

                  <div className="cam-metric">
                    <span className="cam-metric-label">Süre</span>
                    <span className="cam-metric-value">
                      {formatRange(plan.method.weeks, "hafta")}
                    </span>
                    <span className="cam-bar" aria-hidden="true">
                      <i style={{ width: `${durationFraction(plan.method.weeks) * 100}%` }} />
                    </span>
                  </div>

                  <div className="cam-steps">
                    <span className="cam-metric-label">Nasıl ilerler</span>
                    <ol>
                      {plan.method.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>

                  {specialist ? (
                    <div className="cam-suggest">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={specialist.image.src} alt="" aria-hidden="true" />
                      <div>
                        <b>{specialist.name}</b>
                        <span>{specialist.role}</span>
                      </div>
                    </div>
                  ) : null}

                  {plan.manyTeeth ? (
                    <p className="cam-many">
                      Birden fazla diş seçtiniz — bu yöntemde her diş ayrı planlanır, seans sayısı
                      muayenede netleşir.
                    </p>
                  ) : null}

                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cta="whatsapp"
                    className="cam-cta cam-plan-cta"
                  >
                    Planı WhatsApp’tan gönder
                  </a>
                </>
              ) : null}

              <p className="cam-note">{section.note}</p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* --------------------------------------------------------------------------
   The chart.

   Both arches are the same ellipse sampled at sixteen points; the lower one is the
   upper one flipped. Tooth width grows towards the back because molars are wider than
   incisors, and each tooth is rotated to face out of the arch, which is what stops the
   row reading as beads on a string.
   -------------------------------------------------------------------------- */
const CHART = { cx: 190, cy: 150, rx: 150, ry: 104, from: 198, to: 342 };

function toothGeometry(index: number, count: number, lower: boolean) {
  const t = count === 1 ? 0.5 : index / (count - 1);
  const degrees = CHART.from + (CHART.to - CHART.from) * t;
  const radians = (degrees * Math.PI) / 180;
  const x = CHART.cx + CHART.rx * Math.cos(radians);
  const y = CHART.cy + CHART.ry * Math.sin(radians) * (lower ? -1 : 1);
  // Distance from the midline, 0 at the central incisors and 7 at the wisdom teeth.
  const fromMidline = Math.abs(t - 0.5) * 2;
  return {
    x,
    y: lower ? y + 150 : y,
    width: 13 + fromMidline * 9,
    height: 17 + fromMidline * 5,
    angle: degrees + 90 + (lower ? 180 : 0),
  };
}

function ToothChart({
  selected,
  onToggle,
}: {
  selected: number[];
  onToggle: (fdi: number) => void;
}) {
  const rows: { teeth: readonly number[]; lower: boolean }[] = [
    { teeth: FDI_UPPER, lower: false },
    { teeth: FDI_LOWER, lower: true },
  ];

  return (
    <svg className="cam-arch" viewBox="0 0 380 320" role="group" aria-label="Diş şeması">
      {rows.map(({ teeth, lower }) =>
        teeth.map((fdi, index) => {
          const geometry = toothGeometry(index, teeth.length, lower);
          const on = selected.includes(fdi);
          return (
            <g
              key={fdi}
              transform={`translate(${geometry.x.toFixed(1)} ${geometry.y.toFixed(1)}) rotate(${geometry.angle.toFixed(1)})`}
            >
              <rect
                className={`cam-tooth${on ? " is-on" : ""}`}
                x={-geometry.width / 2}
                y={-geometry.height / 2}
                width={geometry.width}
                height={geometry.height}
                rx={geometry.width * 0.36}
                tabIndex={0}
                role="checkbox"
                aria-checked={on}
                aria-label={`${fdi} — ${toothLabel(fdi)}`}
                onClick={() => onToggle(fdi)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggle(fdi);
                  }
                }}
              />
            </g>
          );
        }),
      )}
      <text className="cam-arch-label" x="190" y="14" textAnchor="middle">
        ÜST
      </text>
      <text className="cam-arch-label" x="190" y="312" textAnchor="middle">
        ALT
      </text>
    </svg>
  );
}
