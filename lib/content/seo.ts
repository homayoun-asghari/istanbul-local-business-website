/**
 * Every page this host serves is either an internal tool or an unsold demo carrying a
 * real business's name. None of it may be indexed: a demo outranking a salon for its
 * own name is a problem that ends in an awkward phone call.
 *
 * A client's own site is a different repository with a different robots policy — the
 * eject step replaces this. Shared by app/layout.tsx and the demo route so the rule
 * has exactly one definition to test.
 */
export const NOINDEX = { index: false, follow: false, nocache: true } as const;
