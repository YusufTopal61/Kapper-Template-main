# CLAUDE.md — standaard projectopzet

Ik bouw professionele websites voor lokale bedrijven. Behandel dit als een site die klanten moet opleveren, niet als een hobbyproject. Productiecode: foutafhandeling, types, randgevallen. Geen demo-code, geen `any`.

## Stack (niet van afwijken zonder reden)

Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Framer Motion (`motion`), Supabase (Postgres + RLS) voor data en auth, Zod, React Hook Form, Resend, GitHub + Vercel, Hostinger voor DNS.

## Architectuur — vier lagen

Per domein een map `src/modules/<domein>/`:

| Map | Bevat | Mag nooit |
| --- | --- | --- |
| `presentation/` | view models (`use*.ts`), UI-modellen (`*.uimodel.ts`), server actions (`*.actions.ts`), React-componenten | Supabase of `data/` aanroepen |
| `domain/` | entities, Zod-schema's, bedrijfsregels (`*.rules.ts`), use cases (`usecases/`), repository-interfaces | iets importeren behalve zod, eigen bestanden en het `domain/` van andere modules |
| `data/` | repository-implementaties (`*.supabase.ts`), externe diensten (`*.resend.ts`), mappers (`*.mapper.ts`) | React of `presentation/` aanraken |

Daarboven `src/app/`: routes, layouts, `providers.tsx`, design system (`ui/`) en `di/container.ts`, die implementaties aan interfaces koppelt. `app/` is de enige plek die alle lagen kent. Gedeeld gereedschap (`lib`, `seo`, `config`) in `src/shared/`.

Een aanroep loopt app → presentation → domain → data en het resultaat komt dezelfde weg terug. Imports wijzen naar binnen. Een laag overslaan mag niet. ESLint dwingt dit af (`eslint.config.js`).

Data lezen via Server Components (de pagina roept de use case aan via de container), schrijven via Server Actions. Een server action valideert met Zod, past rate limiting toe en roept één use case aan: geen bedrijfslogica.

Drie controles: kan ik Supabase vervangen en raak ik alleen `data/`? Kan ik `domain/` testen zonder database en browser? Staat er een bedrijfsregel in een `.tsx`? Dan hoort die in `domain/*.rules.ts`.

## Standaard meenemen, zonder dat ik erom vraag

- **SEO:** `generateMetadata`/`maakMetadata` per route (canonical, Open Graph, Twitter), JSON-LD uit `shared/seo/`, `sitemap.ts` en `robots.ts` gegenereerd, semantische HTML, één `h1` per pagina, server-rendered content.
- **Security:** RLS op elke tabel, server-side validatie met hetzelfde Zod-schema als het formulier, service-role-sleutel alleen server-side, rate limiting op publieke formulieren, admin achter `proxy.ts` én een check in de use case (`assertAdmin`), security headers in `next.config.ts`, `process.env` één keer gevalideerd met Zod.
- **Performance:** LCP < 2,5 s, CLS < 0,1, mobile first (375 px), `'use client'` zo diep mogelijk in de boom.

## Werkwijze

Domain eerst, dan data, dan presentation, dan app. Geen herbouw als een refactor volstaat. Werk op een branch, nooit direct op `main`. Zeg niet dat iets werkt zonder dat het gecontroleerd is (`npm run typecheck`, `npm run lint`, `npm test`, `npm run build`).

Bij code: volledig pad, hele bestanden, zeg in welke laag iets hoort voordat je het schrijft. Waarschuw als iets de laagscheiding doorbreekt, ook als ik er zelf om vraag. Leg kort uit waarom iets zo moet. Afwijkingen per project staan bovenaan `README.md`, met reden.
