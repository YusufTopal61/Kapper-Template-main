"use client";

import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Reveal } from "@/components/ui/reveal";
import type { ServiceUIModel } from "@/features/services/presentation/service.ui-model";
import type { OpeningHours } from "@/features/settings/domain/settings.entity";
import { DateStep, ServiceStep, DetailsStep } from "./BookingWizardSteps";
import { useBookingWizard } from "./use-booking-wizard";

type BookingWizardProps = {
  services: ServiceUIModel[];
  openingHours: OpeningHours;
  /** Is Supabase ingesteld? Zo niet, dan leggen we uit wat er nog mist in plaats van een leeg formulier te tonen. */
  configured: boolean;
  /** Op de eigen boekingspagina is dit de h1; op de homepage (waar de hero de h1 heeft) een h2. */
  heading?: "h1" | "h2";
};

export function BookingWizard({
  services,
  openingHours,
  configured,
  heading: Heading = "h2",
}: BookingWizardProps) {
  const {
    step,
    steps,
    serviceId,
    date,
    time,
    selectedService,
    bookableDays,
    slotsState,
    customerForm,
    formError,
    isPending,
    canProceed,
    selectService,
    selectDate,
    selectTime,
    back,
    next,
    isLastStep,
  } = useBookingWizard({ services, openingHours });

  return (
    <section id="booking" className="bg-ink py-24 text-ink-foreground sm:py-32">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <Reveal>
            <span className="text-eyebrow text-accent">Afspraak</span>
            <Heading className="mt-4 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">
              Plan je moment in de stoel.
            </Heading>
            <p className="mt-6 max-w-md text-base leading-relaxed text-ink-muted">
              Kies je behandeling, pak een tijdslot en klaar. Binnen een minuut geregeld —
              bevestiging volgt direct per mail.
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
                    {i < steps.length - 1 ? <span className="h-px flex-1 bg-border" /> : null}
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
                      <ServiceStep
                        configured={configured}
                        services={services}
                        selected={serviceId}
                        onSelect={selectService}
                      />
                    ) : null}

                    {step === 1 ? (
                      <DateStep
                        days={bookableDays}
                        date={date}
                        time={time}
                        onSelectDate={selectDate}
                        onSelectTime={selectTime}
                        slots={slotsState.slots}
                        slotsLoading={slotsState.loading}
                        slotsError={slotsState.error}
                        closed={slotsState.closed}
                      />
                    ) : null}

                    {step === 2 ? (
                      <DetailsStep
                        form={customerForm}
                        summary={{
                          service: selectedService?.name ?? "Dienst",
                          date,
                          time,
                        }}
                      />
                    ) : null}
                  </motion.div>
                </AnimatePresence>
              </div>

              {formError ? (
                <p className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  {formError}
                </p>
              ) : null}

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={back}
                  disabled={step === 0 || isPending}
                  className="rounded-full px-5 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
                >
                  Terug
                </button>
                <button
                  type="button"
                  onClick={next}
                  disabled={!canProceed || isPending}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-accent-foreground shadow-accent transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
                >
                  {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {isLastStep ? "Bevestigen" : "Volgende"}
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
