"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SectionOf, SiteContent } from "@/lib/content/schema";
import {
  FDI_ALL,
  durationFraction,
  formatRange,
  planFor,
  plannerMessage,
  toothLabel,
} from "@/lib/content/planner";
import { FRONT_TEETH, OPEN_TEETH } from "./planner-teeth";

/**
 * The treatment planner — what this pack has instead of a price list.
 *
 * A dental site in Turkey may not publish prices, discounts or campaigns (m.5/1-l,
 * m.5/1-m), which removes the single section that answers the question every visitor
 * actually arrived with. This answers the next-best one: what would happen to me, how
 * many times would I come in, and over how long. Then it hands them a WhatsApp message
 * with their own answers already in it.
 *
 * The layout is the reference's, measured off its frame: three columns 408 / 694 / 550
 * wide with 21 between them, all three starting and ending on the same line; a left
 * column of three boxes 284 / 160 / 195 tall; a result panel of white cards in rows of
 * two, one and two. Every size in the stylesheet is written in those reference pixels
 * against a unit that scales with the grid, so the proportions hold at any width.
 *
 * Two of the reference's boxes cannot exist here. Its "Loyalty program" is a member
 * discount, so the third box asks whether this is a first visit instead — same shape, and
 * useful to the clinic. Its "Estimated cost range" is a price, so that card sends the
 * plan on WhatsApp instead.
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
  const [firstVisit, setFirstVisit] = useState(true);
  const [teeth, setTeeth] = useState<number[]>([]);
  const [view, setView] = useState<"front" | "open">("front");

  const goal = section.goals.find((candidate) => candidate.id === goalId) ?? section.goals[0];
  const plan = useMemo(
    () => planFor(section, { goalId, methodId, teeth }),
    [section, goalId, methodId, teeth],
  );

  const specialists = useMemo(() => {
    // Everyone on the team whose branch treats this goal, the chosen method's first.
    const wanted = [plan?.method.specialist, ...goal.methods.map((m) => m.specialist)];
    const team = content.sections.flatMap((s) => (s.type === "team" ? s.members : []));
    const picked: typeof team = [];
    for (const role of wanted) {
      for (const member of team) {
        if (member.role === role && !picked.includes(member)) picked.push(member);
      }
    }
    return picked.slice(0, 2);
  }, [content.sections, goal.methods, plan?.method.specialist]);

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
    ? `${content.business.whatsapp}?text=${encodeURIComponent(plannerMessage(content, plan, { firstVisit }))}`
    : content.business.whatsapp;

  return (
    <section id="plan" className="cam-planner">
      <div className="cam-plan">
        <div className="cam-plan-head">
          <p className="cam-plan-eyebrow">Tedavi planlayıcı</p>
          <h2 className="cam-plan-title">{section.title}</h2>
          {section.intro ? <p className="cam-plan-intro">{section.intro}</p> : null}
        </div>

        <div className="cam-plan-grid">
          <div className="cam-plan-col">
            <div className="cam-panel cam-p-goal" role="radiogroup" aria-labelledby="cam-goal">
              <p className="cam-panel-title" id="cam-goal">
                01. Hedefiniz
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

            <div className="cam-panel cam-p-method" role="group" aria-labelledby="cam-method">
              <p className="cam-panel-title" id="cam-method">
                02. Yöntem
              </p>
              <Chips key={goal.id} options={goal.methods} value={methodId} onChange={setMethodId} />
            </div>

            <div className="cam-panel cam-p-visit" role="radiogroup" aria-labelledby="cam-visit">
              <p className="cam-panel-title" id="cam-visit">
                03. İlk ziyaretiniz mi?
              </p>
              <label className="cam-radio">
                <input
                  type="radio"
                  name="cam-visit"
                  checked={firstVisit}
                  onChange={() => setFirstVisit(true)}
                />
                <span>Evet, ilk kez geleceğim</span>
              </label>
              <label className="cam-radio">
                <input
                  type="radio"
                  name="cam-visit"
                  checked={!firstVisit}
                  onChange={() => setFirstVisit(false)}
                />
                <span>Hayır, hastanızım</span>
              </label>
            </div>
          </div>

          <div className="cam-panel cam-p-teeth">
            <div className="cam-panel-head">
              <p className="cam-panel-title">04. Diş seçin</p>
              <label className="cam-all">
                <input
                  type="checkbox"
                  checked={teeth.length === FDI_ALL.length}
                  onChange={(event) => setTeeth(event.target.checked ? [...FDI_ALL] : [])}
                />
                <span>Hepsi</span>
              </label>
            </div>

            <div className="cam-stage">
              <svg className="cam-orbit" viewBox="0 0 694 110" aria-hidden="true">
                <path d="M102 3 A362 362 0 0 0 591 3" />
                <circle cx="102" cy="3" r="2.6" />
                <circle cx="591" cy="3" r="2.6" />
              </svg>
              <span className="cam-orbit-label">{view === "front" ? "Önden" : "Yandan"}</span>

              <Model view={view} selected={teeth} onToggle={toggleTooth} />
            </div>

            <div className="cam-views" role="group" aria-label="Görünüm">
              {(
                [
                  ["front", "/stock/dental/arch-front-glass-thumb.webp", "Önden görünüm"],
                  ["open", "/stock/dental/arch-open-glass-thumb.webp", "Yandan görünüm"],
                ] as const
              ).map(([id, src, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`cam-view${view === id ? " is-on" : ""}`}
                  aria-pressed={view === id}
                  aria-label={label}
                  onClick={() => setView(id)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className="cam-panel cam-p-result">
            <Network />
            <p className="cam-panel-title">Planınız</p>

            {plan ? (
              <div className="cam-cards">
                <div className="cam-card cam-c-time">
                  <h4>Tedavi süresi</h4>
                  <Gauge fraction={durationFraction(plan.method.weeks)} />
                  <div className="cam-pill">
                    <span className="cam-pill-ends" aria-hidden="true">
                      <i>1 hf</i>
                      <i>2 yıl</i>
                    </span>
                    <b>{formatRange(plan.method.weeks, "hafta")}</b>
                    <small>Muayeneye göre değişir</small>
                  </div>
                </div>

                <div className="cam-card cam-c-visits">
                  <h4>Seans sayısı</h4>
                  <div className="cam-segments" aria-hidden="true">
                    {Array.from({ length: 12 }, (_, index) => (
                      <i key={index} className={index < plan.method.visits[1] ? "is-on" : ""} />
                    ))}
                  </div>
                  <div className="cam-pill">
                    <b>{formatRange(plan.method.visits, "seans")}</b>
                    <small>
                      {plan.manyTeeth ? "Diş başına · muayenede netleşir" : "Muayenede netleşir"}
                    </small>
                  </div>
                </div>

                <div className="cam-card cam-c-people">
                  <h4>Önerilen hekimler</h4>
                  <ul>
                    {specialists.map((member) => (
                      <li key={member.name}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={member.image.src} alt="" aria-hidden="true" />
                        <span>
                          <b>{member.name}</b>
                          <small>{member.role}</small>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="cam-card cam-c-steps">
                  <h4>Nasıl ilerler</h4>
                  <ul>
                    {plan.method.steps.slice(0, 4).map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ul>
                </div>

                <div className="cam-card cam-c-send">
                  <h4>Planı gönderin</h4>
                  <p className="cam-send-sum">
                    {plan.method.label} ·{" "}
                    {teeth.length === 0 ? "diş seçilmedi" : `${teeth.length} diş`}
                  </p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-cta="whatsapp"
                    className="cam-send"
                  >
                    WhatsApp’tan gönder
                  </a>
                  <small className="cam-send-note">{section.note}</small>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * The method chips: one row of equal widths, as the reference lays them out. When a
 * label does not fit its share, the row sizes the chips to their labels instead, rather
 * than wrap onto a second row and change the height of the whole planner.
 */
function Chips({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  const row = useRef<HTMLDivElement>(null);
  const [tight, setTight] = useState(false);

  useEffect(() => {
    const element = row.current;
    if (!element) return;
    const measure = () => {
      element.classList.remove("is-tight");
      const overflows = [...element.children].some(
        (chip) => chip.scrollWidth > chip.clientWidth + 1,
      );
      element.classList.toggle("is-tight", overflows);
      setTight(overflows);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [options]);

  return (
    <div ref={row} className={`cam-chips${tight ? " is-tight" : ""}`}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`cam-chip${option.id === value ? " is-on" : ""}`}
          aria-pressed={option.id === value}
          onClick={() => onChange(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/**
 * The 3D model, and the teeth on it.
 *
 * The render is the picture, with its flat blue background taken out: the colours were
 * first remapped so that background lands on the panel's blue, then each pixel's alpha set
 * from its distance to that blue and un-premultiplied. Over the panel it composites back
 * to the render within a level or two; anything behind it — the orbit arc — shows through
 * the glass, and there is no box round the model.
 *
 * Each tooth is its traced outline laid over it in the
 * render's own pixel space, so an outline sits on its tooth at any size. Choosing a tooth
 * fades that outline to white, which is what the reference does — no badge, no box, no
 * ring. A click leaves the path focused, and a browser draws its focus ring round a path's
 * bounding box; that ring is what read as a "0" after every click, so it is switched off
 * for pointer focus and replaced by a stroke on the tooth itself for keyboard focus.
 */
function Model({
  view,
  selected,
  onToggle,
}: {
  view: "front" | "open";
  selected: number[];
  onToggle: (fdi: number) => void;
}) {
  const outlines = view === "front" ? FRONT_TEETH : OPEN_TEETH;
  return (
    <div className="cam-model">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          view === "front"
            ? "/stock/dental/arch-front-glass.webp"
            : "/stock/dental/arch-open-glass.webp"
        }
        alt="Üst ve alt çene modeli"
        draggable={false}
      />
      <svg className="cam-teeth" viewBox="0 0 760 760" role="group" aria-label="Dişler">
        {Object.entries(outlines).map(([key, d]) => {
          const fdi = Number(key);
          const on = selected.includes(fdi);
          return (
            <path
              key={key}
              d={d}
              className={`cam-t${on ? " is-on" : ""}`}
              role="checkbox"
              aria-checked={on}
              aria-label={`${fdi} — ${toothLabel(fdi)}`}
              tabIndex={0}
              onClick={() => onToggle(fdi)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onToggle(fdi);
                }
              }}
            />
          );
        })}
      </svg>
    </div>
  );
}

/**
 * The duration gauge: a half ring, the chosen share of it in the brand gradient and the
 * rest in deep navy, as the reference draws it. One path, dashed to the fraction, so the
 * drawing and the number underneath can never disagree.
 */
function Gauge({ fraction }: { fraction: number }) {
  const R = 67;
  const LENGTH = Math.PI * R;
  const shown = Math.min(1, Math.max(0, fraction));
  const d = `M 9 76 A ${R} ${R} 0 0 1 143 76`;
  return (
    <svg className="cam-gauge" viewBox="0 0 152 84" aria-hidden="true">
      <defs>
        <linearGradient id="cam-gauge-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8fd0fb" />
          <stop offset="100%" stopColor="#1d7ce0" />
        </linearGradient>
      </defs>
      <path d={d} className="cam-gauge-rest" />
      <path
        d={d}
        className="cam-gauge-fill"
        strokeDasharray={LENGTH}
        strokeDashoffset={LENGTH * (1 - shown)}
      />
    </svg>
  );
}

/** The faint molecule pattern in the corner of the reference's result panel. */
function Network() {
  return (
    <svg className="cam-network" viewBox="0 0 200 520" aria-hidden="true">
      <path d="M40 60 L150 20 L190 130 L120 250 L196 360 L140 470" />
      <circle cx="40" cy="60" r="9" />
      <circle cx="150" cy="20" r="6" />
      <circle cx="190" cy="130" r="8" />
      <circle cx="120" cy="250" r="7" />
      <circle cx="196" cy="360" r="9" />
      <circle cx="140" cy="470" r="6" />
    </svg>
  );
}
