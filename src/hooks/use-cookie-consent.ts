"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cookie_consent";

export type CookieConsentStatus = "unknown" | "accepted" | "declined";

const listeners = new Set<() => void>();

/** Houdt de keuze vast voor dit bezoek als localStorage geblokkeerd is. */
let choiceInMemory: CookieConsentStatus | null = null;

function readStoredChoice(): CookieConsentStatus {
  if (choiceInMemory) return choiceInMemory;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : "unknown";
  } catch {
    // localStorage kan geblokkeerd zijn (privénavigatie, restricted cookies).
    // Dan tonen we de banner gewoon opnieuw i.p.v. te crashen.
    return "unknown";
  }
}

function subscribe(notice: () => void) {
  listeners.add(notice);
  // Ook een wijziging in een ander tabblad moet de banner laten verdwijnen.
  window.addEventListener("storage", notice);
  return () => {
    listeners.delete(notice);
    window.removeEventListener("storage", notice);
  };
}

function setChoice(choice: Exclude<CookieConsentStatus, "unknown">) {
  choiceInMemory = choice;
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // Kon niet opgeslagen worden — de keuze geldt dan alleen voor dit bezoek.
  }
  listeners.forEach((notice) => notice());
}

const subscribeNoop = () => () => {};

/**
 * Consent-status voor niet-noodzakelijke cookies (analytics). De inlog-
 * sessie van de beheerder loopt via functionele Supabase-cookies die geen
 * toestemming vereisen; alleen tracking wordt hierdoor gate-gehouden.
 */
export function useCookieConsent() {
  const status = useSyncExternalStore<CookieConsentStatus>(
    subscribe,
    readStoredChoice,
    () => "unknown",
  );
  /** false tijdens de server-render en hydratatie; true zodra de opgeslagen keuze is uitgelezen. */
  const ready = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  return {
    status,
    ready,
    accept: () => setChoice("accepted"),
    decline: () => setChoice("declined"),
  };
}
