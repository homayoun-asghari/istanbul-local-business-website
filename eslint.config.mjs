import coreWebVitals from "eslint-config-next/core-web-vitals";
import typescript from "eslint-config-next/typescript";

const config = [
  { ignores: [".next/**", "node_modules/**", "clients/**"] },
  ...coreWebVitals,
  ...typescript,
  {
    // --- The load-bearing rule -------------------------------------------
    // components/site and packs are the render layer. They are copied verbatim
    // into a client's standalone repo by `npm run eject`, where no database and
    // no studio exist. If they import either, the ejected site cannot build —
    // and we would only find that out while a paying client waits.
    files: ["components/site/**/*.{ts,tsx}", "packs/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/db", "@/lib/db/*", "**/lib/db", "**/lib/db/*"],
              message:
                "The render layer must not touch the database. It receives a SiteContent object. See docs/ARCHITECTURE.md.",
            },
            {
              group: ["@/app/studio", "@/app/studio/*", "**/app/studio/*"],
              message: "The render layer must not import studio code — it is stripped on eject.",
            },
            {
              group: ["next/headers", "server-only"],
              message:
                "The render layer must stay renderable from a static content object, with no request context.",
            },
          ],
        },
      ],
    },
  },
];

export default config;
