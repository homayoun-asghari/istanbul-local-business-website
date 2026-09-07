import type { SectionOf, SiteContent } from "@/lib/content/schema";
import { DAY_KEYS } from "@/lib/content/schema";
import { DAY_NAMES_TR, isOpenNow, istanbulNow, openStateLabel } from "@/lib/content/hours";
import { Container, Eyebrow, SectionHeading } from "./primitives";

export function HoursSection({
  section,
  content,
  now,
}: {
  section: SectionOf<"hours">;
  content: SiteContent;
  now: Date;
}) {
  const today = istanbulNow(now).day;
  const state = isOpenNow(content.hours, now);

  return (
    <section id="saatler" className="bg-surface border-line border-y py-16 md:py-24">
      <Container>
        <div className="md:grid md:grid-cols-[0.8fr_1.2fr] md:gap-16">
          <div>
            <Eyebrow>Çalışma Saatleri</Eyebrow>
            <div className="mt-4">
              <SectionHeading>{section.title}</SectionHeading>
            </div>
            <p className="mt-6 mb-0 flex items-center gap-2.5 text-[13px]">
              <span
                aria-hidden="true"
                className={`inline-block h-2 w-2 rounded-full ${state.open ? "bg-[#2F7A4F]" : "bg-muted"}`}
              />
              <span className={state.open ? "text-ink font-medium" : "text-muted"}>
                {openStateLabel(state, today)}
              </span>
            </p>
          </div>

          <dl className="border-line mt-8 grid grid-cols-[auto_1fr] border-t md:mt-0">
            {DAY_KEYS.map((day) => {
              const slot = content.hours[day];
              const isToday = day === today;
              return (
                <div key={day} className="contents">
                  <dt
                    className={`border-line border-b py-3.5 pr-8 text-[15px] ${isToday ? "text-ink font-medium" : "text-ink-soft"}`}
                  >
                    {DAY_NAMES_TR[day]}
                    {isToday ? <span className="text-muted ml-2 text-[12px]">bugün</span> : null}
                  </dt>
                  <dd
                    className={`border-line m-0 border-b py-3.5 text-right text-[15px] tabular-nums ${
                      slot === "closed"
                        ? "text-muted"
                        : isToday
                          ? "text-ink font-medium"
                          : "text-ink-soft"
                    }`}
                  >
                    {slot === "closed" ? "Kapalı" : `${slot.open} – ${slot.close}`}
                  </dd>
                </div>
              );
            })}
            {content.hours.note ? (
              <p className="text-muted col-span-2 mt-5 mb-0 text-[13px]">{content.hours.note}</p>
            ) : null}
          </dl>
        </div>
      </Container>
    </section>
  );
}
