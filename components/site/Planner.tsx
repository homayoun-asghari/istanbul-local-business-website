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
  const [view, setView] = useState<"front" | "schema">("front");

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
                className={`cam-view${view === "front" ? " is-on" : ""}`}
                aria-pressed={view === "front"}
                onClick={() => setView("front")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/stock/dental/arch-front.webp" alt="" aria-hidden="true" />
                <em>Önden</em>
              </button>
              <button
                type="button"
                className={`cam-view${view === "schema" ? " is-on" : ""}`}
                aria-pressed={view === "schema"}
                onClick={() => setView("schema")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/stock/dental/arch-open.webp" alt="" aria-hidden="true" />
                <em>Üstten</em>
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

   Drawn, not overlaid. Four attempts to calibrate a hit map onto the 3D render failed
   in four different ways — placed by eye it drifted, seam detection found 25 seams in a
   row of 16 teeth, the incisal-edge trace came back degenerate, and the rows were sitting
   on the gum ring rather than the crowns. A glass render's internal reflections defeat
   every one of them, and an approximate hit map on a picture of teeth is exactly what
   "the selection is not matching the exact teeth" means.

   So each tooth is a real shape here. Selection lands on it by construction, because the
   thing you click and the thing you see are the same element.

   The anatomy is the same model the schema uses: a tooth at angle θ around the arch
   lands at sin θ across the frame and is foreshortened by cos θ, so the molars at the
   edges are slivers and the incisors at the front are full width. Crown widths and
   heights are average adult dimensions in millimetres, FDI position 1 through 8.
   -------------------------------------------------------------------------- */
const UPPER_W = [8.6, 6.6, 7.6, 7.1, 6.6, 10.4, 9.8, 9.0];
const LOWER_W = [5.3, 5.9, 6.8, 7.0, 7.1, 11.0, 10.5, 9.5];
const UPPER_D = [7.1, 6.4, 8.0, 9.2, 9.2, 11.3, 11.3, 10.5];
const LOWER_D = [5.9, 6.3, 7.9, 7.9, 8.7, 10.7, 10.5, 9.8];
/** Clinical crown height — why the central incisors dominate a smile. */
const UPPER_H = [10.5, 9.0, 10.0, 8.5, 8.5, 7.6, 7.2, 6.6];
const LOWER_H = [9.0, 9.4, 10.1, 8.6, 8.0, 7.6, 7.0, 6.4];

const MM = 2.35;
const GAP = 0.9;
const ARCH = { cx: 190, rx: 128, ry: 92, upperCy: 140, lowerCy: 188 };
/**
 * Front elevation. One scale for width and height — they are both millimetres, and
 * scaling them differently is what turned a row of crowns into a barcode.
 */
const FRONT = { cx: 200, halfSpan: 180, upperGum: 40, lowerGum: 132, mm: 4.4 };

type Tooth = {
  fdi: number;
  upper: boolean;
  /** Occlusal schema, in the 380×340 viewBox. */
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  angle: number;
  /** Front elevation, in the 400×210 viewBox. */
  fx: number;
  fw: number;
  fh: number;
  side: -1 | 1;
  order: number;
};

/** How fast a point moves along the ellipse per radian — the spacing divides by it. */
function speed(theta: number) {
  return Math.hypot(ARCH.rx * Math.sin(theta), ARCH.ry * Math.cos(theta));
}

function buildArch(lower: boolean): Tooth[] {
  const widths = lower ? LOWER_W : UPPER_W;
  const depths = lower ? LOWER_D : UPPER_D;
  const heights = lower ? LOWER_H : UPPER_H;
  const cy = lower ? ARCH.lowerCy : ARCH.upperCy;
  const teeth: Tooth[] = [];

  for (const side of [-1, 1] as const) {
    // Start half a central incisor from the midline, so the two of them straddle it.
    let theta = Math.PI * 1.5 + ((side * (widths[0] * MM)) / 2 + GAP) / speed(Math.PI * 1.5);
    for (let position = 0; position < 8; position++) {
      const w = widths[position] * MM;
      const h = depths[position] * MM;
      const quadrant = lower ? (side < 0 ? 4 : 3) : side < 0 ? 1 : 2;
      const fromFront = theta - Math.PI * 1.5;
      teeth.push({
        fdi: quadrant * 10 + position + 1,
        upper: !lower,
        x: ARCH.cx + ARCH.rx * Math.cos(theta),
        y: cy + ARCH.ry * Math.sin(theta) * (lower ? -1 : 1),
        w,
        h,
        // Incisors are near-rectangular; molars are all but square.
        r: 2 + position * 0.9,
        angle: lower ? -((theta * 180) / Math.PI + 90) : (theta * 180) / Math.PI + 90,
        // Placed by layOutFront, which walks the row so the crowns touch.
        fx: 0,
        fw: widths[position] * FRONT.mm * Math.max(0.26, Math.abs(Math.cos(fromFront))),
        fh: heights[position] * FRONT.mm * (0.86 + 0.14 * Math.abs(Math.cos(fromFront))),
        side,
        order: position,
      });
      const next = widths[Math.min(position + 1, 7)] * MM;
      theta += (side * (w / 2 + next / 2 + GAP)) / speed(theta);
    }
  }
  return teeth;
}

/**
 * Place one row across the frame by walking outward from the midline and adding each
 * crown's projected width, so neighbours touch exactly. Then scale the row to the frame.
 *
 * Projecting each tooth independently onto sin θ and drawing it at its own width leaves
 * gaps between some pairs and overlaps between others — which is what "the selection is
 * a little off the teeth" looked like.
 */
function layOutFront(row: Tooth[]) {
  for (const side of [-1, 1] as const) {
    const arm = row.filter((tooth) => tooth.side === side).sort((a, b) => a.order - b.order);
    let edge = 0;
    for (const tooth of arm) {
      tooth.fx = edge + tooth.fw / 2;
      edge += tooth.fw;
    }
    const scale = FRONT.halfSpan / edge;
    for (const tooth of arm) {
      tooth.fx = FRONT.cx + side * tooth.fx * scale;
      tooth.fw *= scale;
    }
  }
}

const TEETH = [...buildArch(false), ...buildArch(true)];
layOutFront(TEETH.filter((tooth) => tooth.upper));
layOutFront(TEETH.filter((tooth) => !tooth.upper));
export const ALL_FDI = TEETH.map((tooth) => tooth.fdi);
/** Back teeth first, so the front ones draw over them the way they occlude. */
const FRONT_ORDER = [...TEETH].sort(
  (a, b) => Math.abs(b.fx - FRONT.cx) - Math.abs(a.fx - FRONT.cx),
);

/**
 * The biting edge, by tooth type. Each entry is [x across the crown, from -1 at the
 * mesial edge to 1 at the distal, how far the edge is lifted off its lowest point as a
 * fraction of crown height].
 *
 * This table is the difference between a row of teeth and a comb. An incisor is a
 * straight chisel, a canine comes to a single point, a premolar carries two cusps and a
 * molar four — draw them all as rounded rectangles and the eye reads a fence.
 */
const EDGE: [number, number][][] = [
  // central incisor — flat, with the mesial corner sharper than the distal
  [
    [-1, 0.08],
    [-0.74, 0],
    [0.7, 0.01],
    [1, 0.11],
  ],
  // lateral incisor — shorter, and rounder at both corners
  [
    [-1, 0.12],
    [-0.62, 0],
    [0.6, 0.03],
    [1, 0.16],
  ],
  // canine — one cusp, a little mesial of centre. Barely a point: pull the tip much
  // further and the arch grows fangs.
  [
    [-1, 0.2],
    [-0.52, 0.07],
    [-0.06, 0],
    [0.48, 0.09],
    [1, 0.24],
  ],
  // first premolar — buccal cusp dominant, a groove, then the palatal cusp
  [
    [-1, 0.17],
    [-0.5, 0.01],
    [0, 0.12],
    [0.5, 0.04],
    [1, 0.19],
  ],
  // second premolar
  [
    [-1, 0.17],
    [-0.48, 0.03],
    [0, 0.11],
    [0.48, 0.04],
    [1, 0.19],
  ],
  // molars — four cusps around a fissure, flattening as they go back
  [
    [-1, 0.18],
    [-0.6, 0.02],
    [-0.2, 0.15],
    [0.22, 0.03],
    [0.62, 0.14],
    [1, 0.2],
  ],
  [
    [-1, 0.18],
    [-0.58, 0.03],
    [-0.18, 0.14],
    [0.24, 0.04],
    [0.6, 0.15],
    [1, 0.2],
  ],
  [
    [-1, 0.2],
    [-0.55, 0.05],
    [-0.15, 0.14],
    [0.28, 0.06],
    [0.58, 0.16],
    [1, 0.22],
  ],
];

/** The gum line rides high over a canine and dips over a lateral incisor. */
function gumY(tooth: Tooth) {
  const zenith = tooth.order === 2 ? 1.8 : tooth.order === 1 ? -1.3 : 0;
  return tooth.upper ? FRONT.upperGum - zenith : FRONT.lowerGum + zenith;
}

/** A smooth cubic run through a list of points — Catmull-Rom, so the cusps round over. */
function through(points: [number, number][]) {
  const at = (i: number) => points[Math.max(0, Math.min(points.length - 1, i))];
  const out: string[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [ax, ay] = at(i - 1);
    const [bx, by] = at(i);
    const [cx, cy] = at(i + 1);
    const [dx, dy] = at(i + 2);
    out.push(
      `C${(bx + (cx - ax) / 6).toFixed(1)} ${(by + (cy - ay) / 6).toFixed(1)} ` +
        `${(cx - (dx - bx) / 6).toFixed(1)} ${(cy - (dy - by) / 6).toFixed(1)} ` +
        `${cx.toFixed(1)} ${cy.toFixed(1)}`,
    );
  }
  return out.join(" ");
}

/**
 * One crown: narrow at the neck, widest at the contact point a third of the way down,
 * and finished with its own biting edge.
 */
function crownPath(tooth: Tooth) {
  const hw = tooth.fw / 2;
  const neck = hw * (tooth.order < 3 ? 0.8 : 0.88);
  const gum = gumY(tooth);
  // Upper crowns grow down the frame, lower ones up it. One sign handles both.
  const dir = tooth.upper ? 1 : -1;
  const edge = gum + dir * tooth.fh;
  // Mesial is whichever side faces the midline, so the asymmetric profiles mirror.
  const flip = tooth.side === -1 ? -1 : 1;
  // A crown turned away from us hides its own cusps. Without this the back molars,
  // foreshortened to slivers, keep their full relief and the row ends in a sawtooth.
  const relief = Math.max(0.3, Math.min(1, tooth.fw / 20));
  const points = EDGE[tooth.order].map(
    ([across, lift]) =>
      [tooth.fx + across * flip * hw, edge - dir * lift * relief * tooth.fh] as [number, number],
  );
  if (flip === -1) points.reverse();
  const first = points[0];
  const bulge = (fraction: number) => (gum + dir * tooth.fh * fraction).toFixed(1);
  return [
    `M${(tooth.fx - neck).toFixed(1)} ${gum.toFixed(1)}`,
    `C${(tooth.fx - hw).toFixed(1)} ${bulge(0.28)} ${(tooth.fx - hw).toFixed(1)} ${bulge(0.6)} ${first[0].toFixed(1)} ${first[1].toFixed(1)}`,
    through(points),
    `C${(tooth.fx + hw).toFixed(1)} ${bulge(0.6)} ${(tooth.fx + hw).toFixed(1)} ${bulge(0.28)} ${(tooth.fx + neck).toFixed(1)} ${gum.toFixed(1)}`,
    "Z",
  ].join(" ");
}

function ToothPicker({
  view,
  selected,
  onToggle,
}: {
  view: "front" | "schema";
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
      <svg className="cam-arch" viewBox="44 22 292 292" role="group" aria-label="Diş şeması">
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
    <svg className="cam-arch cam-front" viewBox="0 0 400 186" role="group" aria-label="Diş modeli">
      <defs>
        {/* Enamel is densest at the neck and translucent at the biting edge, which is
            what gives a real crown its glassy tip. */}
        <linearGradient id="cam-enamel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#a9cdf0" />
          <stop offset="38%" stopColor="#e8f4ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="cam-enamel-low" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#a9cdf0" />
          <stop offset="38%" stopColor="#e8f4ff" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id="cam-gum" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(150,200,246,0.46)" />
          <stop offset="100%" stopColor="rgba(150,200,246,0.14)" />
        </linearGradient>
        {/* Darkest at the back of the mouth, where no light reaches. */}
        <radialGradient id="cam-mouth" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(7,27,56,0.8)" />
          <stop offset="72%" stopColor="rgba(7,27,56,0.72)" />
          <stop offset="100%" stopColor="rgba(7,27,56,0)" />
        </radialGradient>
        <radialGradient id="cam-bloom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(168,214,252,0.5)" />
          <stop offset="100%" stopColor="rgba(168,214,252,0)" />
        </radialGradient>
      </defs>

      <ellipse cx="200" cy="90" rx="196" ry="86" fill="url(#cam-bloom)" />

      {/* The mouth behind the rows. A soft lens, not an outline traced round the
          crowns: the teeth are drawn over it, so they cut their own silhouette into it,
          and the dark that remains is exactly the gap between the two arches — shut at
          the incisors, open at the molars. Tracing the crowns instead doubles the
          contrast on every cusp and turns the canines into fangs. */}
      <ellipse cx="200" cy="94" rx="186" ry="31" fill="url(#cam-mouth)" />

      {/* The ridges the crowns sit in. */}
      <rect x="10" y="2" width="380" height="44" rx="19" fill="url(#cam-gum)" />
      <rect x="10" y="126" width="380" height="48" rx="21" fill="url(#cam-gum)" />

      <g className="cam-crowns">
        {FRONT_ORDER.map((tooth) => (
          <g key={tooth.fdi}>
            <path
              className={`cam-crown${selected.includes(tooth.fdi) ? " is-on" : ""}`}
              d={crownPath(tooth)}
              fill={tooth.upper ? "url(#cam-enamel)" : "url(#cam-enamel-low)"}
              {...hit(tooth)}
            />
            {/* The specular running down the face of the crown. */}
            <rect
              className="cam-shine"
              x={tooth.fx - tooth.fw * 0.2}
              y={gumY(tooth) + (tooth.upper ? 5 : -tooth.fh + 4)}
              width={Math.max(1.2, tooth.fw * 0.17)}
              height={Math.max(3, tooth.fh - 12)}
              rx={Math.max(0.6, tooth.fw * 0.085)}
            />
          </g>
        ))}
      </g>
    </svg>
  );
}
