import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Mail, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { fetchAdminSettings, fetchEmailStatus, saveAdminSettings } from "@/api/settings";
import { settingsInputSchema } from "@/lib/validation";
import { DAGEN, DEFAULT_OPENINGSTIJDEN } from "@/lib/opening-hours";
import type { Openingstijden } from "@/lib/supabase/types";

type FormulierStaat = {
  bedrijfsnaam: string;
  admin_email: string;
  telefoonnummer: string;
  adres: string;
  openingstijden: Openingstijden;
};

export function SettingsForm() {
  const queryClient = useQueryClient();
  const [formulier, setFormulier] = useState<FormulierStaat | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [opgeslagen, setOpgeslagen] = useState(false);

  const instellingen = useQuery({
    queryKey: ["settings", "admin"],
    queryFn: () => fetchAdminSettings(),
  });

  const emailStatus = useQuery({
    queryKey: ["settings", "email-status"],
    queryFn: () => fetchEmailStatus(),
  });

  // Serverdata één keer in het formulier zetten; daarna is het formulier leidend.
  useEffect(() => {
    if (!instellingen.data || formulier) return;
    setFormulier({
      bedrijfsnaam: instellingen.data.bedrijfsnaam,
      admin_email: instellingen.data.admin_email ?? "",
      telefoonnummer: instellingen.data.telefoonnummer ?? "",
      adres: instellingen.data.adres ?? "",
      openingstijden: instellingen.data.openingstijden ?? DEFAULT_OPENINGSTIJDEN,
    });
  }, [instellingen.data, formulier]);

  const opslaan = useMutation({
    mutationFn: saveAdminSettings,
    onSuccess: async () => {
      setOpgeslagen(true);
      await queryClient.invalidateQueries({ queryKey: ["settings"] });
      setTimeout(() => setOpgeslagen(false), 3000);
    },
    onError: () => setFout("Opslaan mislukte. Probeer het zo nog eens."),
  });

  if (instellingen.isLoading || !formulier) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Instellingen laden…
      </div>
    );
  }

  if (instellingen.isError) {
    return (
      <Foutmelding>De instellingen konden niet geladen worden. Ververs de pagina.</Foutmelding>
    );
  }

  function wijzig<K extends keyof FormulierStaat>(veld: K, waarde: FormulierStaat[K]) {
    setFormulier((f) => (f ? { ...f, [veld]: waarde } : f));
    setFout(null);
  }

  function verstuur(e: React.FormEvent) {
    e.preventDefault();
    if (!formulier) return;
    setFout(null);

    const resultaat = settingsInputSchema.safeParse(formulier);
    if (!resultaat.success) {
      setFout(resultaat.error.issues[0]?.message ?? "Controleer de ingevulde gegevens.");
      return;
    }

    opslaan.mutate({ data: resultaat.data });
  }

  const emailOntbreekt = !formulier.admin_email.trim();

  return (
    <form onSubmit={verstuur} className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Instellingen
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bedrijfsgegevens en openingstijden. Deze gegevens sturen de boekingsflow en de e-mails
          aan.
        </p>
      </div>

      {emailOntbreekt ? (
        <div className="flex items-start gap-3 border border-foreground bg-foreground/5 px-4 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-foreground" />
          <p className="text-sm text-foreground">
            <span className="font-semibold">Vul je e-mailadres in.</span> Zonder notificatie-adres
            ontvang je geen melding wanneer er een nieuwe afspraak binnenkomt.
          </p>
        </div>
      ) : null}

      {emailStatus.data?.sandboxModus ? (
        <div className="flex items-start gap-3 border border-destructive/40 bg-destructive/10 px-4 py-3">
          <Mail className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="text-sm text-foreground">
            <p>
              <span className="font-semibold">E-mail staat in testmodus.</span>{" "}
              {emailStatus.data.geconfigureerd ? (
                <>
                  Klanten krijgen <span className="font-semibold">geen</span> bevestigings- of
                  annuleringsmail — Resend levert vanaf{" "}
                  <code className="rounded bg-muted px-1">{emailStatus.data.vanAdres}</code> alleen
                  af bij het adres van je eigen Resend-account. Alleen jij als beheerder ontvangt
                  wel mail.
                </>
              ) : (
                <>
                  Er is nog geen RESEND_API_KEY ingesteld — mails worden nu nergens naartoe
                  gestuurd.
                </>
              )}
            </p>
            <p className="mt-2">
              Verifieer een domein op{" "}
              <a
                href="https://resend.com/domains"
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-2"
              >
                resend.com/domains
              </a>{" "}
              en zet <code className="rounded bg-muted px-1">RESEND_FROM</code> op een adres van dat
              domein om klanten écht te bereiken.
            </p>
          </div>
        </div>
      ) : null}

      <section className="border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
          Bedrijfsgegevens
        </h2>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label htmlFor="bedrijfsnaam">Bedrijfsnaam</Label>
            <Input
              id="bedrijfsnaam"
              className="rounded-none"
              value={formulier.bedrijfsnaam}
              onChange={(e) => wijzig("bedrijfsnaam", e.target.value)}
              placeholder="Barber"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="admin_email">
              E-mailadres voor notificaties
              {emailOntbreekt ? <span className="ml-1 text-destructive">*</span> : null}
            </Label>
            <Input
              id="admin_email"
              type="email"
              className="rounded-none"
              value={formulier.admin_email}
              onChange={(e) => wijzig("admin_email", e.target.value)}
              placeholder="jij@jouwzaak.nl"
            />
            <p className="text-xs text-muted-foreground">
              Hier komen nieuwe boekingen en annuleringen binnen.
            </p>
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="telefoonnummer">Telefoonnummer</Label>
            <Input
              id="telefoonnummer"
              className="rounded-none"
              value={formulier.telefoonnummer}
              onChange={(e) => wijzig("telefoonnummer", e.target.value)}
              placeholder="06 00 00 00 00"
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="adres">Adres</Label>
            <Input
              id="adres"
              className="rounded-none"
              value={formulier.adres}
              onChange={(e) => wijzig("adres", e.target.value)}
              placeholder="Straatnaam 00, 0000 AA Plaatsnaam"
            />
          </div>
        </div>
      </section>

      <section className="border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold tracking-tight text-foreground">
          Openingstijden
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Buiten deze tijden kan niemand een afspraak boeken.
        </p>

        <div className="mt-5 flex flex-col divide-y divide-border border-y border-border">
          {DAGEN.map((dag) => {
            const tijden = formulier.openingstijden[dag];
            return (
              <div
                key={dag}
                className="flex flex-wrap items-center gap-x-4 gap-y-3 py-3 sm:flex-nowrap"
              >
                <span className="w-28 text-sm font-semibold capitalize text-foreground">{dag}</span>

                <div className="flex items-center gap-2">
                  <Switch
                    id={`open-${dag}`}
                    checked={tijden.open}
                    onCheckedChange={(open) =>
                      wijzig("openingstijden", {
                        ...formulier.openingstijden,
                        [dag]: { ...tijden, open },
                      })
                    }
                  />
                  <Label htmlFor={`open-${dag}`} className="text-xs text-muted-foreground">
                    {tijden.open ? "Open" : "Gesloten"}
                  </Label>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  <Input
                    type="time"
                    aria-label={`Openingstijd ${dag}`}
                    disabled={!tijden.open}
                    className="w-[7.5rem] rounded-none"
                    value={tijden.van}
                    onChange={(e) =>
                      wijzig("openingstijden", {
                        ...formulier.openingstijden,
                        [dag]: { ...tijden, van: e.target.value },
                      })
                    }
                  />
                  <span className="text-xs text-muted-foreground">tot</span>
                  <Input
                    type="time"
                    aria-label={`Sluitingstijd ${dag}`}
                    disabled={!tijden.open}
                    className="w-[7.5rem] rounded-none"
                    value={tijden.tot}
                    onChange={(e) =>
                      wijzig("openingstijden", {
                        ...formulier.openingstijden,
                        [dag]: { ...tijden, tot: e.target.value },
                      })
                    }
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {fout ? <Foutmelding>{fout}</Foutmelding> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={opslaan.isPending} className="gap-2 rounded-none">
          {opslaan.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Opslaan
        </Button>
        {opgeslagen ? (
          <span className="flex items-center gap-1.5 text-sm text-foreground">
            <Check className="size-4" />
            Opgeslagen
          </span>
        ) : null}
      </div>
    </form>
  );
}

function Foutmelding({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
      <TriangleAlert className="mt-0.5 size-4 shrink-0" />
      {children}
    </p>
  );
}
