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
  const [view, setView] = useState<"render" | "schema">("render");

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
            <p className="cam-panel-title">
              <span className="cam-step">03.</span> Hangi bölge?
              <label className="cam-all">
                <input
                  type="checkbox"
                  checked={teeth.length === ALL_FDI.length}
                  onChange={(event) => setTeeth(event.target.checked ? [...ALL_FDI] : [])}
                />
                <span>Hepsi</span>
              </label>
            </p>

            <ToothPicker view={view} selected={teeth} onToggle={toggleTooth} />

            <div className="cam-arc" aria-hidden="true">
              <svg viewBox="0 0 260 34" preserveAspectRatio="none">
                <path d="M4 4 C 70 34, 190 34, 256 4" fill="none" strokeWidth="1" />
              </svg>
              <span>{ALL_FDI.length} DİŞ</span>
            </div>

            <div className="cam-views" role="group" aria-label="Görünüm">
              <button
                type="button"
                className={`cam-view${view === "render" ? " is-on" : ""}`}
                aria-pressed={view === "render"}
                onClick={() => setView("render")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/stock/dental/arch-front.webp" alt="" aria-hidden="true" />
                <em>Model</em>
              </button>
              <button
                type="button"
                className={`cam-view${view === "schema" ? " is-on" : ""}`}
                aria-pressed={view === "schema"}
                onClick={() => setView("schema")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/stock/dental/arch-open.webp" alt="" aria-hidden="true" />
                <em>Şema</em>
              </button>
            </div>

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
   The picker.

   The reference does not draw a diagram: it shows a 3D model of both arches with a
   360° arc under it and two thumbnails that switch the view. So this shows the render,
   and the selectable teeth are a hit map laid over it.

   The map is not placed by eye. It is the same arch model as the schema below, drawn in
   front projection: a tooth at angle θ around the arch lands at cos θ across the frame,
   and its crown is foreshortened by |sin θ| — which is why the molars at the edges are
   slivers and the incisors at the front are full width, exactly as they are in the
   render. One anatomy, two projections.

   Widths and depths are average adult crown dimensions in millimetres, FDI position 1
   (central incisor) through 8 (third molar). Using the real numbers is why the schema
   reads as a jaw rather than as beads on a string.
   -------------------------------------------------------------------------- */
const UPPER_W = [8.6, 6.6, 7.6, 7.1, 6.6, 10.4, 9.8, 9.0];
const LOWER_W = [5.3, 5.9, 6.8, 7.0, 7.1, 11.0, 10.5, 9.5];
const UPPER_D = [7.1, 6.4, 8.0, 9.2, 9.2, 11.3, 11.3, 10.5];
const LOWER_D = [5.9, 6.3, 7.9, 7.9, 8.7, 10.7, 10.5, 9.8];

const MM = 2.35;
const GAP = 0.9;
const ARCH = { cx: 190, rx: 128, ry: 92, upperCy: 140, lowerCy: 200 };

type Tooth = {
  fdi: number;
  /** Occlusal schema, in the 380×340 viewBox. */
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  angle: number;
  /** Front projection, as fractions of the render's box. */
  fx: number;
  fw: number;
  upper: boolean;
};

/** How fast a point moves along the ellipse per radian — the spacing divides by it. */
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
      // Angle measured from the midline, which is what the front view projects.
      const fromFront = theta - Math.PI * 1.5;
      teeth.push({
        fdi: quadrant * 10 + position + 1,
        x: ARCH.cx + ARCH.rx * Math.cos(theta),
        y: cy + ARCH.ry * Math.sin(theta) * (lower ? -1 : 1),
        w,
        h,
        // Incisors are near-rectangular; molars are all but square.
        r: 2 + position * 0.9,
        angle: lower ? -((theta * 180) / Math.PI + 90) : (theta * 180) / Math.PI + 90,
        fx: fromFront,
        fw: 0,
        upper: !lower,
      });
      const next = widths[Math.min(position + 1, 7)] * MM;
      theta += (side * (w / 2 + next / 2 + GAP)) / speed(theta);
    }
  }
  return teeth;
}

const TEETH = [...buildArch(false), ...buildArch(true)];
export const ALL_FDI = TEETH.map((tooth) => tooth.fdi);

/**
 * Where the crowns actually are in the render, measured off it rather than guessed:
 * the silhouette of the tooth mass spans 0.043–0.954 across, the upper crowns run
 * 0.289–0.429 down and the lower 0.431–0.515 at the midline, where the uppers overlap
 * them. Every number below came from sampling the image.
 */
const ROW = {
  left: 0.045,
  right: 0.952,
  upperY: 0.359,
  upperH: 0.132,
  lowerY: 0.497,
  lowerH: 0.104,
};

/**
 * Project one row of sixteen teeth onto the front view and tile it.
 *
 * A tooth at angle θ around the arch lands at sin θ across the frame. Rather than draw
 * each crown at its own width — which leaves gaps a click can fall into, and which was
 * landing a few pixels off anyway — the slices meet at the midpoints between
 * neighbours, so the row is covered end to end and the nearest tooth always wins.
 */
function projectRow(row: Tooth[]): { fdi: number; x0: number; x1: number }[] {
  const withX = row
    .map((tooth) => ({ fdi: tooth.fdi, sin: Math.sin(tooth.fx) }))
    .sort((a, b) => a.sin - b.sin);
  const reach = Math.max(...withX.map((t) => Math.abs(t.sin)));
  const half = (ROW.right - ROW.left) / 2;
  const centre = (ROW.right + ROW.left) / 2;
  const xs = withX.map((t) => centre + (t.sin / reach) * half);
  return withX.map((t, i) => ({
    fdi: t.fdi,
    x0: i === 0 ? ROW.left : (xs[i - 1] + xs[i]) / 2,
    x1: i === xs.length - 1 ? ROW.right : (xs[i] + xs[i + 1]) / 2,
  }));
}

const FRONT = [
  ...projectRow(TEETH.filter((t) => t.upper)).map((s) => ({ ...s, upper: true })),
  ...projectRow(TEETH.filter((t) => !t.upper)).map((s) => ({ ...s, upper: false })),
];

function ToothPicker({
  view,
  selected,
  onToggle,
}: {
  view: "render" | "schema";
  selected: number[];
  onToggle: (fdi: number) => void;
}) {
  const hit = (tooth: Tooth) => ({
    onClick: () => onToggle(tooth.fdi),
    onKeyDown: (event: React.KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onToggle(tooth.fdi);
      }
    },
    tabIndex: 0,
    role: "checkbox" as const,
    "aria-checked": selected.includes(tooth.fdi),
    "aria-label": `${tooth.fdi} — ${toothLabel(tooth.fdi)}`,
  });

  if (view === "schema") {
    return (
      <svg className="cam-arch" viewBox="44 8 292 326" role="group" aria-label="Diş şeması">
        {TEETH.map((tooth) => (
          <g
            key={tooth.fdi}
            transform={`translate(${tooth.x.toFixed(1)} ${tooth.y.toFixed(1)}) rotate(${tooth.angle.toFixed(1)})`}
          >
            <rect
              className={`cam-tooth${selected.includes(tooth.fdi) ? " is-on" : ""}`}
              x={-tooth.w / 2}
              y={-tooth.h / 2}
              width={tooth.w}
              height={tooth.h}
              rx={tooth.r}
              {...hit(tooth)}
            />
          </g>
        ))}
        <text className="cam-arch-label" x="190" y="26" textAnchor="middle">
          ÜST
        </text>
        <text className="cam-arch-label" x="190" y="322" textAnchor="middle">
          ALT
        </text>
      </svg>
    );
  }

  return (
    <div className="cam-model">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/stock/dental/arch-front.webp" alt="Üst ve alt çene modeli" />
      <svg className="cam-hitmap" viewBox="0 0 100 100" preserveAspectRatio="none">
        {FRONT.map((slice) => {
          const tooth = TEETH.find((candidate) => candidate.fdi === slice.fdi)!;
          const y = slice.upper ? ROW.upperY : ROW.lowerY;
          const h = (slice.upper ? ROW.upperH : ROW.lowerH) * 100;
          const w = (slice.x1 - slice.x0) * 100;
          return (
            <rect
              key={slice.fdi}
              className={`cam-hit${selected.includes(slice.fdi) ? " is-on" : ""}`}
              x={slice.x0 * 100}
              y={y * 100 - h / 2}
              width={w}
              height={h}
              rx={Math.min(w * 0.3, 2.2)}
              {...hit(tooth)}
            />
          );
        })}
      </svg>
    </div>
  );
}
