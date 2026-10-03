import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Laaggrenzen (zie CLAUDE.md): imports wijzen naar binnen.
 *
 *   app/  →  presentation/  →  domain/  ←  data/
 *
 * Elk blok hieronder is een volledige set voor één laag. Ze overlappen niet,
 * want een tweede `no-restricted-imports` voor dezelfde bestanden vervangt de eerste.
 */
const serverOnlyPad = {
  name: "server-only",
  message: "Gebruik het pakket `server-only` alleen in data/, shared/lib/*.server.ts of app/di.",
};

const frameworks = [
  "react",
  "react-dom",
  "react/*",
  "next",
  "next/*",
  "react-hook-form",
  "motion/*",
  "@supabase/*",
  "resend",
  "date-fns",
];

const laag = (melding, patterns, paths = []) => ({
  "no-restricted-imports": ["error", { paths, patterns: [{ group: patterns, message: melding }] }],
});

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "_te-verwijderen/**",
      "src/routes/**",
      "src/router.tsx",
      "src/routeTree.gen.ts",
      "src/server.ts",
      "src/start.ts",
      "src/modules/*/container.server.ts",
      "src/shared/lib/error-capture.ts",
      "src/shared/lib/error-page.ts",
      "src/shared/lib/lovable-error-reporting.ts",
      "src/shared/lib/supabase/client.ts",
      "src/**/_old-*",
      "vite.config.ts",
      "next-env.d.ts",
    ],
  },
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  // ---- domain: importeert niets behalve zod, zichzelf en het domain van andere modules
  {
    files: ["src/modules/*/domain/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: laag(
      "domain/ importeert niets behalve zod, eigen bestanden en het domain/ van andere modules. Geen framework, database of andere lagen.",
      [
        "**/data/**",
        "**/presentation/**",
        "@/app/**",
        "@/modules/*/data/**",
        "@/modules/*/presentation/**",
        "@/shared/lib/**",
        "@/shared/seo/**",
        "@/shared/config/**",
        ...frameworks,
      ],
      [serverOnlyPad],
    ),
  },

  // ---- data: kent alleen domain en externe diensten, nooit presentation of app
  {
    files: ["src/modules/*/data/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: laag(
      "data/ importeert alleen domain/. React, presentation/ en app/ zijn verboden terrein.",
      [
        "**/presentation/**",
        "@/app/**",
        "@/modules/*/presentation/**",
        "@/modules/*/data/**",
        "react",
        "react-dom",
        "react-hook-form",
        "motion/*",
      ],
    ),
  },

  // ---- presentation (componenten en hooks): praat met actions en domain-types, nooit met data of de container
  {
    files: ["src/modules/*/presentation/**/*.{ts,tsx}"],
    ignores: ["**/*.actions.ts", "**/admin-action.ts", "**/*.test.{ts,tsx}"],
    rules: laag(
      "Componenten en hooks raken data/, Supabase of de DI-container nooit aan. Gebruik een server action of laat de pagina de data meegeven.",
      [
        "**/data/**",
        "@/modules/*/data/**",
        "@/app/di/**",
        "@/shared/lib/supabase/**",
        "@/shared/lib/*.server",
        "@supabase/*",
        "resend",
      ],
      [serverOnlyPad],
    ),
  },

  // ---- server actions: dunne laag; mogen de container gebruiken, nooit data/ rechtstreeks
  {
    files: [
      "src/modules/*/presentation/**/*.actions.ts",
      "src/modules/*/presentation/admin-action.ts",
    ],
    rules: laag(
      "Een server action valideert, past rate limiting toe en roept een use case aan. Geen data/ of Supabase; bedrading hoort in app/di/container.ts.",
      ["**/data/**", "@/modules/*/data/**", "@/shared/lib/supabase/**", "@supabase/*", "resend"],
    ),
  },

  // ---- shared: gereedschap, kent geen modules of app
  {
    files: ["src/shared/**/*.{ts,tsx}"],
    ignores: ["**/*.test.{ts,tsx}"],
    rules: laag(
      "shared/ is gereedschap zonder kennis van modules of app/. Draai de afhankelijkheid om.",
      ["@/modules/**", "@/app/**"],
    ),
  },

  // ---- bewust een gewone <a> na een fout: schone pagina i.p.v. client-navigatie
  {
    files: ["src/app/error.tsx"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },

  eslintPluginPrettier,
];

export default config;
