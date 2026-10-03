"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cookie_consent";

export type CookieConsentStatus = "onbekend" | "geaccepteerd" | "geweigerd";

const luisteraars = new Set<() => void>();

/** Houdt de keuze vast voor dit bezoek als localStorage geblokkeerd is. */
let keuzeInGeheugen: CookieConsentStatus | null = null;

function leesOpgeslagenKeuze(): CookieConsentStatus {
  if (keuzeInGeheugen) return keuzeInGeheugen;
  try {
    const waarde = window.localStorage.getItem(STORAGE_KEY);
    return waarde === "geaccepteerd" || waarde === "geweigerd" ? waarde : "onbekend";
  } catch {
    // localStorage kan geblokkeerd zijn (privénavigatie, restricted cookies).
    // Dan tonen we de banner gewoon opnieuw i.p.v. te crashen.
    return "onbekend";
  }
}

function abonneer(melding: () => void) {
  luisteraars.add(melding);
  // Ook een wijziging in een ander tabblad moet de banner laten verdwijnen.
  window.addEventListener("storage", melding);
  return () => {
    luisteraars.delete(melding);
    window.removeEventListener("storage", melding);
  };
}

function zetKeuze(keuze: Exclude<CookieConsentStatus, "onbekend">) {
  keuzeInGeheugen = keuze;
  try {
    window.localStorage.setItem(STORAGE_KEY, keuze);
  } catch {
    // Kon niet opgeslagen worden — de keuze geldt dan alleen voor dit bezoek.
  }
  luisteraars.forEach((melding) => melding());
}

const naarClient = () => () => {};

/**
 * Consent-status voor niet-noodzakelijke cookies (analytics). De inlog-
 * sessie van de beheerder loopt via functionele Supabase-cookies die geen
 * toestemming vereisen; alleen tracking wordt hierdoor gate-gehouden.
 */
export function useCookieConsent() {
  const status = useSyncExternalStore<CookieConsentStatus>(
    abonneer,
    leesOpgeslagenKeuze,
    () => "onbekend",
  );
  /** false tijdens de server-render en hydratatie; true zodra de opgeslagen keuze is uitgelezen. */
  const klaar = useSyncExternalStore(
    naarClient,
    () => true,
    () => false,
  );

  return {
    status,
    klaar,
    accepteer: () => zetKeuze("geaccepteerd"),
    weiger: () => zetKeuze("geweigerd"),
  };
}
