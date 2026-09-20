/**
 * Eenvoudige sliding-window rate limiter in het geheugen.
 *
 * Let op: de teller leeft per server-instantie. Op één server (of tijdens
 * development) is dat precies genoeg om spam en geautomatiseerd misbruik van
 * het publieke boekingsformulier tegen te houden. Draai je straks op meerdere
 * instanties of op serverless, vervang de opslag dan door iets gedeelds
 * (Upstash Redis, of een tabel in Supabase) — de aanroep hieronder blijft gelijk.
 */

type Venster = { tijden: number[] };

const vensters = new Map<string, Venster>();

/** Ruimt vensters op die niemand meer raadpleegt, zodat de Map niet groeit. */
function opruimen(nu: number, maxLeeftijdMs: number) {
  for (const [sleutel, venster] of vensters) {
    const recent = venster.tijden.filter((t) => nu - t < maxLeeftijdMs);
    if (recent.length === 0) {
      vensters.delete(sleutel);
    } else {
      venster.tijden = recent;
    }
  }
}

let laatsteOpruiming = 0;

export type RateLimitResultaat =
  | { toegestaan: true; resterend: number }
  | { toegestaan: false; opnieuwProberenOverSeconden: number };

export function rateLimit(
  sleutel: string,
  opties: { max: number; vensterMs: number },
): RateLimitResultaat {
  const nu = Date.now();

  // Hooguit één keer per minuut grootschalig opruimen.
  if (nu - laatsteOpruiming > 60_000) {
    opruimen(nu, opties.vensterMs);
    laatsteOpruiming = nu;
  }

  const venster = vensters.get(sleutel) ?? { tijden: [] };
  const recent = venster.tijden.filter((t) => nu - t < opties.vensterMs);

  if (recent.length >= opties.max) {
    const oudste = Math.min(...recent);
    const wachtMs = opties.vensterMs - (nu - oudste);
    vensters.set(sleutel, { tijden: recent });
    return {
      toegestaan: false,
      opnieuwProberenOverSeconden: Math.max(1, Math.ceil(wachtMs / 1000)),
    };
  }

  recent.push(nu);
  vensters.set(sleutel, { tijden: recent });
  return { toegestaan: true, resterend: opties.max - recent.length };
}
