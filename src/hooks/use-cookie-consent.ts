"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "cookie_consent";

export type CookieConsentStatus = "unknown" | "accepted" | "declined";

const listeners = new Set<() => void>();

/** Keeps the choice for this visit when localStorage is blocked. */
let choiceInMemory: CookieConsentStatus | null = null;

function readStoredChoice(): CookieConsentStatus {
  if (choiceInMemory) return choiceInMemory;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === "accepted" || value === "declined" ? value : "unknown";
  } catch {
    // localStorage can be blocked (private browsing, restricted cookies).
    // Then we simply show the banner again instead of crashing.
    return "unknown";
  }
}

function subscribe(notice: () => void) {
  listeners.add(notice);
  // A change in another tab must also make the banner disappear.
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
 * Consent status for non-essential cookies (analytics). The admin's sign-in
 * session runs on functional Supabase cookies that need no consent; only
 * tracking is gated by this.
 */
export function useCookieConsent() {
  const status = useSyncExternalStore<CookieConsentStatus>(
    subscribe,
    readStoredChoice,
    () => "unknown",
  );
  /** false during server render and hydration; true once the stored choice has been read. */
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
