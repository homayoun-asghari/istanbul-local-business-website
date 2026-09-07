import type { ReactNode } from "react";

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-6 sm:px-8 ${className}`}>{children}</div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow m-0">{children}</p>;
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-display text-ink m-0 text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] font-normal tracking-[-0.01em]">
      {children}
    </h2>
  );
}

/** Hairline rule. Used instead of card borders — the atölye preset has no cards. */
export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`border-line m-0 border-0 border-t ${className}`} />;
}
