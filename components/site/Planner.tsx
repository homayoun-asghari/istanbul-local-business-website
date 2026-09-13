"use client";

import { useMemo, useState } from "react";
import type { SectionOf, SiteContent } from "@/lib/content/schema";
import {
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
            <div className="cam-panel" role="radiogroup" aria-labelledby="cam-goal-label">
              <p className="cam-panel-title" id="cam-goal-label">
                <span className="cam-step">01.</span> Ne yaptırmak istiyorsunuz?
              </p>
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
            </div>

            <div className="cam-panel" role="group" aria-labelledby="cam-method-label">
              <p className="cam-panel-title" id="cam-method-label">
                <span className="cam-step">02.</span> Yöntem
              </p>
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
            </div>
          </div>

          <div className="cam-panel cam-chart">
            <div className="cam-panel-title">
              <span className="cam-step">03.</span> Hangi bölge?
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
                <span className="cam-step">04.</span> Planınız
              </p>

              {plan ? (
                <>
                  <div className="cam-result-row">
                    <div className="cam-card-sm">
                      <h4>Tedavi süresi</h4>
                      <Gauge
                        fraction={durationFraction(plan.method.weeks)}
                        label={formatRange(plan.method.weeks, "hafta")}
                      />
                      <p className="cam-card-note">Muayeneye göre değişir</p>
                    </div>
                    <div className="cam-card-sm">
                      <h4>Seans sayısı</h4>
                      <div className="cam-blocks" aria-hidden="true">
                        {Array.from({ length: 8 }, (_, index) => (
                          <i key={index} className={index < plan.method.visits[1] ? "is-on" : ""} />
                        ))}
                      </div>
                      <p className="cam-card-big">{formatRange(plan.method.visits, "seans")}</p>
                    </div>
                  </div>

                  {specialist ? (
                    <div className="cam-card-sm">
                      <h4>Önerilen hekim</h4>
                      <div className="cam-suggest">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={specialist.image.src} alt="" aria-hidden="true" />
                        <div>
                          <b>{specialist.name}</b>
                          <span>{specialist.role}</span>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="cam-card-sm">
                    <h4>Nasıl ilerler</h4>
                    <ol className="cam-steps-list">
                      {plan.method.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </div>

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

/**
 * A semicircular gauge. One path, stroke-dashed to the fraction, so what is drawn and
 * what is written can never disagree.
 */
function Gauge({ fraction, label }: { fraction: number; label: string }) {
  const R = 54;
  const LENGTH = Math.PI * R;
  return (
    <svg className="cam-gauge" viewBox="0 0 140 84" role="img" aria-label={label}>
      <defs>
        <linearGradient id="cam-gauge-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8cc2f5" />
          <stop offset="100%" stopColor="#1c62c8" />
        </linearGradient>
      </defs>
      <path
        className="cam-gauge-track"
        d={`M 16 70 A ${R} ${R} 0 0 1 124 70`}
        fill="none"
        strokeWidth="11"
        strokeLinecap="round"
      />
      <path
        className="cam-gauge-fill"
        d={`M 16 70 A ${R} ${R} 0 0 1 124 70`}
        fill="none"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={LENGTH}
        strokeDashoffset={LENGTH * (1 - Math.min(1, Math.max(0, fraction)))}
      />
      <text className="cam-gauge-value" x="70" y="64" textAnchor="middle">
        {label}
      </text>
    </svg>
  );
}

/* --------------------------------------------------------------------------
   The chart.

   Two arches, each walked outward from the midline one tooth at a time, with the
   angular step taken from that tooth's own width divided by the local speed of the
   ellipse. Spacing teeth at a uniform angle is what made the first version crowd and
   overlap at the back, where the arch curves hardest and the molars are widest.

   The widths and depths below are average adult mesiodistal and bucco-lingual crown
   dimensions in millimetres, FDI position 1 (central incisor) through 8 (third molar).
   Using the real numbers is why the shape reads as a jaw: narrow flat incisors at the
   front, a canine, then premolars and square molars fanning out behind.
   -------------------------------------------------------------------------- */
const UPPER_W = [8.6, 6.6, 7.6, 7.1, 6.6, 10.4, 9.8, 9.0];
const LOWER_W = [5.3, 5.9, 6.8, 7.0, 7.1, 11.0, 10.5, 9.5];
const UPPER_D = [7.1, 6.4, 8.0, 9.2, 9.2, 11.3, 11.3, 10.5];
const LOWER_D = [5.9, 6.3, 7.9, 7.9, 8.7, 10.7, 10.5, 9.8];

const MM = 2.35;
const GAP = 0.9;
const ARCH = { cx: 190, rx: 128, ry: 92, upperCy: 140, lowerCy: 200 };

type Tooth = { fdi: number; x: number; y: number; w: number; h: number; r: number; angle: number };

/** How fast a point moves along the ellipse per radian — the spacing has to divide by it. */
function speed(theta: number) {
  return Math.hypot(ARCH.rx * Math.sin(theta), ARCH.ry * Math.cos(theta));
}

function buildArch(lower: boolean): Tooth[] {
  const widths = lower ? LOWER_W : UPPER_W;
  const depths = lower ? LOWER_D : UPPER_D;
  const cy = lower ? ARCH.lowerCy : ARCH.upperCy;
  const teeth: Tooth[] = [];

  for (const side of [-1, 1] as const) {
    // Start half a central incisor from the midline, so the two of them straddle it.
    let theta = Math.PI * 1.5 + ((side * (widths[0] * MM)) / 2 + GAP) / speed(Math.PI * 1.5);
    for (let position = 0; position < 8; position++) {
      const w = widths[position] * MM;
      const h = depths[position] * MM;
      const quadrant = lower ? (side < 0 ? 4 : 3) : side < 0 ? 1 : 2;
      const x = ARCH.cx + ARCH.rx * Math.cos(theta);
      const y = cy + ARCH.ry * Math.sin(theta) * (lower ? -1 : 1);
      const degrees = (theta * 180) / Math.PI + 90;
      teeth.push({
        fdi: quadrant * 10 + position + 1,
        x,
        y,
        w,
        h,
        // Incisors are near-rectangular; molars are all but square.
        r: 2 + position * 0.9,
        angle: lower ? -degrees : degrees,
      });
      // Step on by half this tooth and half the next, so neighbours touch and no more.
      const next = widths[Math.min(position + 1, 7)] * MM;
      theta += (side * (w / 2 + next / 2 + GAP)) / speed(theta);
    }
  }
  return teeth;
}

const TEETH = [...buildArch(false), ...buildArch(true)];

function ToothChart({
  selected,
  onToggle,
}: {
  selected: number[];
  onToggle: (fdi: number) => void;
}) {
  return (
    <svg className="cam-arch" viewBox="44 8 292 326" role="group" aria-label="Diş şeması">
      {TEETH.map((tooth) => {
        const on = selected.includes(tooth.fdi);
        return (
          <g
            key={tooth.fdi}
            transform={`translate(${tooth.x.toFixed(1)} ${tooth.y.toFixed(1)}) rotate(${tooth.angle.toFixed(1)})`}
          >
            <rect
              className={`cam-tooth${on ? " is-on" : ""}`}
              x={-tooth.w / 2}
              y={-tooth.h / 2}
              width={tooth.w}
              height={tooth.h}
              rx={tooth.r}
              tabIndex={0}
              role="checkbox"
              aria-checked={on}
              aria-label={`${tooth.fdi} — ${toothLabel(tooth.fdi)}`}
              onClick={() => onToggle(tooth.fdi)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggle(tooth.fdi);
                }
              }}
            />
          </g>
        );
      })}
      <text className="cam-arch-label" x="190" y="26" textAnchor="middle">
        ÜST
      </text>
      <text className="cam-arch-label" x="190" y="322" textAnchor="middle">
        ALT
      </text>
    </svg>
  );
}
