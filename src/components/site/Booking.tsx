import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

const steps = ["Dienst", "Datum & tijd", "Gegevens"];
const services = ["Knippen", "Knippen + Baard", "Baard"];
const days = ["Ma 01", "Di 02", "Wo 03", "Do 04", "Vr 05", "Za 06"];
const times = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"];

/** Front-end only booking shell — no backend wiring yet. */
export function Booking() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);

  const canContinue =
    (step === 0 && service) || (step === 1 && day && time) || step === 2;

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
              Kies je behandeling, pak een tijdslot en klaar. Binnen een minuut
              geregeld — bevestiging volgt direct.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-3xl bg-background p-6 text-foreground shadow-lift sm:p-8">
              <ol className="flex items-center gap-3">
                {steps.map((label, i) => (
                  <li key={label} className="flex flex-1 items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                          i < step
                            ? "bg-accent text-accent-foreground"
                            : i === step
                              ? "bg-foreground text-background"
                              : "bg-muted text-muted-foreground",
                        )}
                      >
                        {i < step ? <Check className="size-3.5" /> : i + 1}
                      </span>
                      <span
                        className={cn(
                          "hidden text-xs font-semibold uppercase tracking-widest sm:block",
                          i === step ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </div>
                    {i < steps.length - 1 ? (
                      <span className="h-px flex-1 bg-border" />
                    ) : null}
                  </li>
                ))}
              </ol>

              <div className="mt-8 min-h-[236px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {step === 0 ? (
                      <div className="grid gap-3">
                        {services.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setService(s)}
                            className={cn(
                              "flex items-center justify-between rounded-2xl border px-5 py-4 text-left transition-all duration-200 hover:-translate-y-0.5",
                              service === s
                                ? "border-accent bg-accent-soft"
                                : "border-border bg-card hover:bg-muted",
                            )}
                          >
                            <span className="font-semibold">{s}</span>
                            <span className="text-sm text-muted-foreground">€ 00</span>
                          </button>
                        ))}
                      </div>
                    ) : null}

                    {step === 1 ? (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Kies een dag
                        </p>
                        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {days.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => setDay(d)}
                              className={cn(
                                "rounded-xl border px-2 py-3 text-sm font-semibold transition-colors",
                                day === d
                                  ? "border-accent bg-accent text-accent-foreground"
                                  : "border-border hover:bg-muted",
                              )}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                        <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                          Kies een tijd
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {times.map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setTime(t)}
                              className={cn(
                                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                                time === t
                                  ? "border-accent bg-accent text-accent-foreground"
                                  : "border-border hover:bg-muted",
                              )}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {step === 2 ? (
                      <div className="grid gap-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Field label="Naam" placeholder="Voor- en achternaam" />
                          <Field label="Telefoon" placeholder="06 12 34 56 78" />
                        </div>
                        <Field label="E-mail" placeholder="naam@voorbeeld.nl" />
                        <div className="rounded-2xl bg-muted px-5 py-4 text-sm text-muted-foreground">
                          <span className="font-semibold text-foreground">
                            {service ?? "Dienst"}
                          </span>{" "}
                          · {day ?? "datum"} · {time ?? "tijd"}
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  Terug
                </button>
                <button
                  type="button"
                  onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
                  disabled={!canContinue || step === steps.length - 1}
                  className="rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-accent transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {step === steps.length - 1 ? "Bevestigen" : "Volgende"}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-accent"
      />
    </label>
  );
}
