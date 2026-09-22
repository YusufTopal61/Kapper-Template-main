import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { addDays, format } from "date-fns";
import { nl } from "date-fns/locale";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";
import { fetchActiveServices } from "@/api/services";
import { createBooking, fetchAvailableSlots } from "@/api/bookings";
import { fetchPublicSettings } from "@/api/settings";
import { bookingInputSchema } from "@/lib/validation";
import { dagVanDatum, formatDatum, DEFAULT_OPENINGSTIJDEN } from "@/lib/opening-hours";
import { isSupabaseConfigured } from "@/lib/env";

const STAPPEN = ["Dienst", "Datum & tijd", "Gegevens"];
const DAGEN_VOORUIT = 21;

type Velden = { klant_naam: string; klant_email: string; klant_telefoon: string };
type VeldFouten = Partial<Record<keyof Velden, string>>;

const euro = (prijs: number) =>
  new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(prijs);

export function Booking() {
  const router = useRouter();
  const [stap, setStap] = useState(0);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [datum, setDatum] = useState<string | null>(null);
  const [tijd, setTijd] = useState<string | null>(null);
  const [velden, setVelden] = useState<Velden>({
    klant_naam: "",
    klant_email: "",
    klant_telefoon: "",
  });
  const [veldFouten, setVeldFouten] = useState<VeldFouten>({});
  const [formulierFout, setFormulierFout] = useState<string | null>(null);

  const diensten = useQuery({
    queryKey: ["services", "actief"],
    queryFn: () => fetchActiveServices(),
    enabled: isSupabaseConfigured,
  });

  const instellingen = useQuery({
    queryKey: ["settings", "publiek"],
    queryFn: () => fetchPublicSettings(),
    enabled: isSupabaseConfigured,
  });

  const openingstijden = instellingen.data?.openingstijden ?? DEFAULT_OPENINGSTIJDEN;

  /** De eerstvolgende dagen waarop de zaak open is. */
  const beschikbareDagen = useMemo(() => {
    const dagen: Date[] = [];
    for (let i = 0; i < DAGEN_VOORUIT && dagen.length < 12; i++) {
      const dag = addDays(new Date(), i);
      if (openingstijden[dagVanDatum(formatDatum(dag))]?.open) dagen.push(dag);
    }
    return dagen;
  }, [openingstijden]);

  const sloten = useQuery({
    queryKey: ["sloten", datum, serviceId],
    queryFn: () => fetchAvailableSlots({ data: { datum: datum!, service_id: serviceId! } }),
    enabled: Boolean(datum && serviceId),
  });

  const boeking = useMutation({
    mutationFn: createBooking,
    onSuccess: (resultaat) => {
      if (!resultaat.ok) {
        setFormulierFout(resultaat.error);
        return;
      }
      // Eigen bedankpagina i.p.v. inline wisselen — herbruikbaar als
      // analytics-conversiedoel en werkt correct met de terug-knop.
      router.navigate({
        to: "/boeken/bevestigd",
        search: {
          dienst: resultaat.boeking.dienstNaam,
          datum: resultaat.boeking.datum,
          tijd: resultaat.boeking.tijd,
          email: resultaat.boeking.klant_email,
          mail: resultaat.emailVerzonden,
        },
      });
    },
    onError: () => setFormulierFout("Er ging iets mis bij het versturen. Probeer het zo nog eens."),
  });

  const gekozenDienst = diensten.data?.find((d) => d.id === serviceId) ?? null;

  // Een eerder gekozen tijd kan door de nieuwe dag of dienst bezet zijn geraakt.
  useEffect(() => {
    if (!tijd || !sloten.data) return;
    const slot = sloten.data.sloten.find((s) => s.tijd === tijd);
    if (!slot?.beschikbaar) setTijd(null);
  }, [sloten.data, tijd]);

  const magVerder = (stap === 0 && serviceId) || (stap === 1 && datum && tijd) || stap === 2;

  function valideerEnVerstuur() {
    setFormulierFout(null);

    const resultaat = bookingInputSchema.safeParse({
      service_id: serviceId,
      datum,
      tijd,
      ...velden,
    });

    if (!resultaat.success) {
      const fouten: VeldFouten = {};
      for (const issue of resultaat.error.issues) {
        const veld = issue.path[0];
        if (veld === "klant_naam" || veld === "klant_email" || veld === "klant_telefoon") {
          fouten[veld] ??= issue.message;
        } else {
          setFormulierFout(issue.message);
        }
      }
      setVeldFouten(fouten);
      return;
    }

    setVeldFouten({});
    boeking.mutate({ data: resultaat.data });
  }

  return (
    <section id="boeken" className="bg-ink py-24 text-ink-foreground sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <span className="text-eyebrow text-accent">Afspraak</span>
            <h2 className="mt-4 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Plan je moment in de stoel.
            </h2>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
              Kies je behandeling, pak een tijdslot en klaar. Binnen een minuut geregeld —
              bevestiging volgt direct per mail.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-background p-6 text-foreground shadow-lift sm:p-8">
              <ol className="flex items-center gap-3">
                {STAPPEN.map((label, i) => (
                  <li key={label} className="flex flex-1 items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                          i < stap
                            ? "bg-accent text-accent-foreground"
                            : i === stap
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {i < stap ? <Check className="size-3.5" /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          "hidden text-xs font-semibold uppercase tracking-widest sm:block",
                          i === stap ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    {i < STAPPEN.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
                  </li>
                ))}
              </ol>

              <div className="mt-8 min-h-[236px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={stap}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {stap === 0 ? (
                      <DienstStap
                        laden={diensten.isLoading}
                        fout={diensten.isError}
                        diensten={diensten.data ?? []}
                        gekozen={serviceId}
                        onKies={(id) => {
                          setServiceId(id);
                          setTijd(null);
                        }}
                      />
                    ) : null}

                    {stap === 1 ? (
                      <DatumStap
                        dagen={beschikbareDagen}
                        datum={datum}
                        tijd={tijd}
                        onKiesDatum={(d) => {
                          setDatum(d);
                          setTijd(null);
                        }}
                        onKiesTijd={setTijd}
                        sloten={sloten.data?.sloten ?? []}
                        slotenLaden={sloten.isFetching}
                        gesloten={sloten.data?.gesloten ?? false}
                      />
                    ) : null}

                    {stap === 2 ? (
                      <GegevensStap
                        velden={velden}
                        fouten={veldFouten}
                        onWijzig={(veld, waarde) => {
                          setVelden((v) => ({ ...v, [veld]: waarde }));
                          setVeldFouten((f) => ({ ...f, [veld]: undefined }));
                        }}
                        samenvatting={{
                          dienst: gekozenDienst?.naam ?? "Dienst",
                          datum,
                          tijd,
                        }}
                      />
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              {formulierFout ? (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  {formulierFout}
                </p>
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStap((s) => Math.max(0, s - 1))}
                  disabled={stap === 0 || boeking.isPending}
                  className="rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  Terug
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (stap === STAPPEN.length - 1) valideerEnVerstuur();
                    else setStap((s) => s + 1);
                  }}
                  disabled={!magVerder || boeking.isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-accent transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {boeking.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {stap === STAPPEN.length - 1 ? "Bevestigen" : "Volgende"}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function DienstStap({
  laden,
  fout,
  diensten,
  gekozen,
  onKies,
}: {
  laden: boolean;
  fout: boolean;
  diensten: Array<{ id: string; naam: string; prijs: number; duur_minuten: number }>;
  gekozen: string | null;
  onKies: (id: string) => void;
}) {
  if (!isSupabaseConfigured) {
    return (
      <Melding>
        Online boeken is nog niet geactiveerd. Zet de Supabase-gegevens in{" "}
        <code className="rounded bg-muted px-1">.env.local</code> om dit formulier live te zetten.
      </Melding>
    );
  }

  if (laden) return <Skelet regels={3} />;
  if (fout)
    return <Melding>De diensten konden niet geladen worden. Probeer het zo opnieuw.</Melding>;
  if (diensten.length === 0)
    return <Melding>Er zijn op dit moment geen diensten beschikbaar.</Melding>;

  return (
    <div className="grid gap-3">
      {diensten.map((dienst) => (
        <button
          key={dienst.id}
          type="button"
          onClick={() => onKies(dienst.id)}
          className={cn(
            "flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5",
            gekozen === dienst.id
              ? "border-accent bg-accent-soft"
              : "border-border bg-card hover:bg-muted",
          )}
        >
          <span>
            <span className="block font-semibold">{dienst.naam}</span>
            <span className="text-xs text-muted-foreground">{dienst.duur_minuten} min</span>
          </span>
          <span className="text-sm text-muted-foreground">{euro(dienst.prijs)}</span>
        </button>
      ))}
    </div>
  );
}

function DatumStap({
  dagen,
  datum,
  tijd,
  onKiesDatum,
  onKiesTijd,
  sloten,
  slotenLaden,
  gesloten,
}: {
  dagen: Date[];
  datum: string | null;
  tijd: string | null;
  onKiesDatum: (datum: string) => void;
  onKiesTijd: (tijd: string) => void;
  sloten: Array<{ tijd: string; beschikbaar: boolean }>;
  slotenLaden: boolean;
  gesloten: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Kies een dag
      </p>
      <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {dagen.map((dag) => {
          const waarde = formatDatum(dag);
          return (
            <button
              key={waarde}
              type="button"
              onClick={() => onKiesDatum(waarde)}
              className={cn(
                "rounded-xl border px-2 py-3 text-sm font-semibold capitalize transition-colors",
                datum === waarde
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border hover:bg-muted",
              )}
            >
              {format(dag, "EEEEEE", { locale: nl })} {format(dag, "dd")}
            </button>
          );
        })}
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Kies een tijd
      </p>

      {!datum ? (
        <p className="mt-3 text-sm text-muted-foreground">Kies eerst een dag.</p>
      ) : slotenLaden ? (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Beschikbaarheid ophalen…
        </div>
      ) : gesloten || sloten.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Op deze dag zijn geen tijden beschikbaar. Kies een andere dag.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {sloten.map((slot) => (
            <button
              key={slot.tijd}
              type="button"
              disabled={!slot.beschikbaar}
              onClick={() => onKiesTijd(slot.tijd)}
              title={slot.beschikbaar ? undefined : "Dit tijdslot is bezet"}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                tijd === slot.tijd
                  ? "border-accent bg-accent text-accent-foreground"
                  : slot.beschikbaar
                    ? "border-border hover:bg-muted"
                    : "cursor-not-allowed border-border/60 text-muted-foreground/50 line-through",
              )}
            >
              {slot.tijd}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GegevensStap({
  velden,
  fouten,
  onWijzig,
  samenvatting,
}: {
  velden: Velden;
  fouten: VeldFouten;
  onWijzig: (veld: keyof Velden, waarde: string) => void;
  samenvatting: { dienst: string; datum: string | null; tijd: string | null };
}) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Veld
          label="Naam"
          placeholder="Voor- en achternaam"
          value={velden.klant_naam}
          onChange={(v) => onWijzig("klant_naam", v)}
          {...(fouten.klant_naam ? { fout: fouten.klant_naam } : {})}
        />
        <Veld
          label="Telefoon"
          placeholder="06 12 34 56 78"
          value={velden.klant_telefoon}
          onChange={(v) => onWijzig("klant_telefoon", v)}
          {...(fouten.klant_telefoon ? { fout: fouten.klant_telefoon } : {})}
        />
      </div>
      <Veld
        label="E-mail"
        type="email"
        placeholder="naam@voorbeeld.nl"
        value={velden.klant_email}
        onChange={(v) => onWijzig("klant_email", v)}
        {...(fouten.klant_email ? { fout: fouten.klant_email } : {})}
      />
      <div className="rounded-2xl bg-muted px-5 py-4 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{samenvatting.dienst}</span> ·{" "}
        {samenvatting.datum
          ? format(new Date(samenvatting.datum), "d MMMM", { locale: nl })
          : "datum"}{" "}
        · {samenvatting.tijd ?? "tijd"}
      </div>
    </div>
  );
}

function Veld({
  label,
  placeholder,
  value,
  onChange,
  fout,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (waarde: string) => void;
  fout?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(fout)}
        className={cn(
          "mt-2 w-full rounded-xl border bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70",
          fout ? "border-destructive" : "border-input focus:border-accent",
        )}
      />
      {fout ? <span className="mt-1.5 block text-xs text-destructive">{fout}</span> : null}
    </label>
  );
}

function Melding({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-5 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

function Skelet({ regels }: { regels: number }) {
  return (
    <div className="grid gap-3">
      {Array.from({ length: regels }).map((_, i) => (
        <div key={i} className="h-[68px] animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
