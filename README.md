# Kapper — boekingsplatform voor een kapsalon

Nederlandstalige website met online afspraken maken, annuleren via een link in de mail en een beheerpaneel (agenda, diensten, instellingen). Generiek sjabloon: merknaam, teksten en openingstijden zijn instelbaar. Projectregels staan in [CLAUDE.md](./CLAUDE.md).

## Afwijkingen van de standaard opzet (met reden)

| Standaard | Hier | Reden |
| --- | --- | --- |
| `middleware.ts` | `src/proxy.ts` | In Next.js 16 heet middleware "proxy". Zelfde functie. |
| Server Actions alleen voor schrijven | `fetchAvailableSlots` is een Server Action die leest | De beschikbaarheid hangt af van een keuze die de bezoeker in de browser maakt (dag + dienst); een Server Component kan dat niet opnieuw ophalen zonder paginanavigatie. |
| `domain/` importeert niets behalve Zod | Ook `@/shared/domain/primitives` (puur Zod: e-mail, tijd, datum) en het `domain/` van andere modules | Anders staat dezelfde e-mailvalidatie in drie modules. Alleen domain-naar-domain, nooit naar data of presentation. |
| `presentation/` kent `app/` niet | `*.actions.ts` importeren `@/app/di/container`; componenten importeren `@/app/ui` | De standaard plaatst server actions in `presentation/` en de DI-container in `app/`; dat kan niet zonder die ene import. ESLint staat hem alleen toe in actions. |
| JSON-LD voor elke dienst op eigen pagina | Diensten staan gebundeld op `/diensten` | Er zijn geen pagina's per dienst; `serviceJsonLd` verwijst naar `/diensten`. |
| `sitemap.ts` uit de database | Uit `shared/config/navigation.ts` | Er zijn nog geen databasegestuurde pagina's. Komen die er (bijv. per dienst), dan worden ze hier toegevoegd. |
| Strikte CSP met nonce | CSP met `'unsafe-inline'` voor scripts | Next.js zet hydratatie-scripts inline. Nonce-gebaseerde CSP via `proxy.ts` is de volgende stap. |
| `noPropertyAccessFromIndexSignature` aan | Uit | Next.js vervangt `process.env.NEXT_PUBLIC_X` alleen bij puntnotatie. |
| Resend verplicht | Zonder `RESEND_API_KEY` worden mails gelogd | Lokaal ontwikkelen zonder account; een boeking faalt nooit op mail. |

## Structuur

```
src/
  app/                    routes, layouts, providers, design system (ui/), di/container.ts, sitemap.ts, robots.ts
  modules/<domein>/
    domain/               entities, Zod-schema's, rules, repository-interfaces, usecases/  (importeert niets van buiten)
    data/                 Supabase/Resend-implementaties + mappers                         (kent alleen domain)
    presentation/         view models, UI-modellen, server actions, componenten
  shared/
    lib/                  env (+ env.server), Supabase-clients, rate limit, klok, opmaak
    seo/                  metadata-helper en JSON-LD-builders
    config/               site en navigatie
    domain/               gedeelde Zod-bouwstenen
  proxy.ts                eerste slot voor /admin (sessie), instrumentation.ts: env-controle bij opstarten
```

Modules: `booking`, `services`, `settings`, `auth`, `admin` (alleen presentation), `site` (alleen presentation).

## Omgevingsvariabelen

Zie `.env.example`. Gevalideerd met Zod: publiek in `src/shared/lib/env.ts`, server in `env.server.ts`. In productie start de app niet met een ontbrekende variabele.

| Variabele | Waar | Verplicht |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | publiek | ja |
| `SUPABASE_SERVICE_ROLE_KEY` | alleen server | ja |
| `SITE_URL` | alleen server | in productie (canonical, sitemap, JSON-LD, links in mails) |
| `RESEND_API_KEY`, `RESEND_FROM` | alleen server | nee (zonder key: mails loggen) |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | publiek | nee (analytics alleen na cookietoestemming) |

## Ontwikkelen

```bash
npm install                  # Node 20.9+ (22 aanbevolen)
cp .env.example .env.local   # vul de waarden in
npm run dev                  # http://localhost:8080
```

Database: migraties staan in `supabase/migrations/` en draai je in volgorde in de Supabase SQL-editor. Vraag eerst akkoord voor elke migratie die data wijzigt of verwijdert. Een gratis Supabase-project pauzeert na inactiviteit; hervat het in het dashboard als de site "geen diensten" toont.

## Controles

```bash
npm run typecheck   # strict TypeScript
npm run lint        # Next-regels + laaggrenzen
npm test            # Vitest: domain/ en use cases, zonder database en browser
npm run build       # productiebuild
```

## Beveiliging

RLS op alle tabellen; annuleren uitsluitend met een token van 64 hex-tekens; rate limiting (login, boeken, token-acties; in-memory per instantie); Server Actions valideren met Zod en weigeren te grote bodies (100 KB); maximumlengtes op alle velden; beheerroutes achter `proxy.ts` én `assertAdmin` in elke use case; geheimen alleen op de server (na elke build gecontroleerd dat ze niet in de client-bundle staan); security headers in `next.config.ts`; links in mails komen uit `SITE_URL`, niet uit de Host-header.

Rooster- en openingstijdenregels rekenen in `Europe/Amsterdam` (`shared/lib/clock.ts`), ook op een server in UTC.

## Open punten

- Resend: een eigen domein verifiëren; met `onboarding@resend.dev` komt mail alleen aan bij de accounteigenaar.
- `SITE_URL` instellen op het echte domein en in Search Console indienen.
- Nog niet aanwezig: Sentry, Playwright (kritieke flows), bot-bescherming (honeypot/Turnstile), Vercel-koppeling en redirects.
- Rate limiting is in-memory: per serverinstantie, niet gedeeld (op serverless vervangen door Upstash/Supabase).
- De seed-diensten hebben prijs 0 (= nog niet ingesteld); vul ze in via `/admin/diensten`. Bij prijs 0 meldt de JSON-LD geen aanbod.
- Sleutels die ooit in een chat of ticket zijn gedeeld, horen geroteerd te worden.
