import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

// Layer boundaries (see CLAUDE.md): imports point inward.
//
//   app  ->  feature presentation  ->  feature domain  <-  feature data
//   components/ and lib/ are shared tooling and know nothing about features
//   (the one exception is the composition root in lib/di).
//
// Every block below is a complete rule set for one group of files. They do
// not overlap, because a second `no-restricted-imports` for the same files
// replaces the first.
const serverOnlyPath = {
  name: "server-only",
  message: "Use `server-only` only in data/, lib/*.server.ts or lib/di.",
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

const layer = (message, patterns, paths = []) => ({
  "no-restricted-imports": ["error", { paths, patterns: [{ group: patterns, message }] }],
});

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "test-results/**",
      "next-env.d.ts",
      "src/lib/supabase/database.types.ts",
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

  // ---- domain: imports nothing but zod, itself, the domain of other features and lib/validations
  {
    files: ["src/features/*/domain/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: layer(
      "domain/ imports only zod, its own files, other features' domain/ and lib/validations. No framework, database or other layers.",
      [
        "**/data/**",
        "**/presentation/**",
        "@/app/**",
        "@/components/**",
        "@/hooks/**",
        "@/config/**",
        "@/features/*/data/**",
        "@/features/*/presentation/**",
        "@/lib/env",
        "@/lib/env.server",
        "@/lib/utils/**",
        "@/lib/seo/**",
        "@/lib/supabase/**",
        "@/lib/di/**",
        ...frameworks,
      ],
      [serverOnlyPath],
    ),
  },

  // ---- data: knows domain and external services, never presentation or app
  {
    files: ["src/features/*/data/**/*.ts"],
    ignores: ["**/*.test.ts"],
    rules: layer(
      "data/ imports only domain/. React, presentation/, components/ and app/ are off limits.",
      [
        "**/presentation/**",
        "@/app/**",
        "@/components/**",
        "@/features/*/presentation/**",
        "@/features/*/data/**",
        "react",
        "react-dom",
        "react-hook-form",
        "motion/*",
      ],
    ),
  },

  // ---- presentation (components and hooks): talks to actions and domain types, never to data or the container
  {
    files: ["src/features/*/presentation/**/*.{ts,tsx}"],
    ignores: ["**/*.actions.ts", "**/admin-action.ts", "**/*.test.{ts,tsx}"],
    rules: layer(
      "Components and hooks never touch data/, Supabase or the DI container. Use a server action or let the page pass the data in.",
      [
        "**/data/**",
        "@/features/*/data/**",
        "@/lib/di/**",
        "@/lib/supabase/**",
        "@/lib/**/*.server",
        "@supabase/*",
        "resend",
      ],
      [serverOnlyPath],
    ),
  },

  // ---- server actions: thin layer; may use the container, never data/ directly
  {
    files: [
      "src/features/*/presentation/**/*.actions.ts",
      "src/features/*/presentation/admin-action.ts",
    ],
    rules: layer(
      "A server action validates, rate limits and calls one use case. No data/ or Supabase; wiring belongs in lib/di/container.ts.",
      ["**/data/**", "@/features/*/data/**", "@/lib/supabase/**", "@supabase/*", "resend"],
    ),
  },

  // ---- shared components and hooks: know no feature internals
  {
    files: ["src/components/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
    rules: layer(
      "Shared components and hooks never reach into a feature's data/ or the DI container.",
      ["@/features/*/data/**", "@/lib/di/**", "@/lib/supabase/**", "@supabase/*", "resend"],
    ),
  },

  // ---- lib: infrastructure without knowledge of features, components or app (except lib/di)
  {
    files: ["src/lib/**/*.{ts,tsx}"],
    ignores: ["src/lib/di/**", "**/*.test.{ts,tsx}"],
    rules: layer(
      "lib/ is infrastructure and knows nothing about features, components or app/. Reverse the dependency.",
      ["@/features/**", "@/components/**", "@/app/**"],
    ),
  },

  // ---- plain <a> after an error: a clean page instead of client navigation
  {
    files: ["src/app/error.tsx"],
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },

  eslintPluginPrettier,
];

export default config;
