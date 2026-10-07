"use client";

import { useSyncExternalStore } from "react";
import { parseConsent, serializeConsent, type ConsentStatus } from "@/lib/utils/consent";

const STORAGE_KEY = "cookie_consent";

export type CookieConsentStatus = ConsentStatus;

const listeners = new Set<() => void>();

/** Keeps the choice for this visit when localStorage is blocked. */
let fallbackRaw: string | null = null;
let useFallback = false;

function readRaw(): string | null {
  if (useFallback) return fallbackRaw;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    // localStorage can be blocked (private browsing, restricted cookies).
    // Then we simply show the banner again instead of crashing.
    return fallbackRaw;
  }
}

function writeRaw(raw: string | null) {
  try {
    if (raw === null) window.localStorage.removeItem(STORAGE_KEY);
    else window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Could not be stored: the choice then only applies to this visit.
    useFallback = true;
    fallbackRaw = raw;
  }
  listeners.forEach((notice) => notice());
}

function subscribe(notice: () => void) {
  listeners.add(notice);
  // A change in another tab must also update the banner.
  window.addEventListener("storage", notice);
  return () => {
    listeners.delete(notice);
    window.removeEventListener("storage", notice);
  };
}

function readStatus(): CookieConsentStatus {
  return parseConsent(readRaw(), new Date());
}

const subscribeNoop = () => () => {};

/**
 * Consent status for non-essential cookies (analytics). The admin's sign-in
 * session runs on functional Supabase cookies that need no consent; only
 * tracking is gated by this. The choice is versioned and expires (see
 * `lib/utils/consent.ts`), and `reset` withdraws it so the banner asks again.
 */
export function useCookieConsent() {
  const status = useSyncExternalStore<CookieConsentStatus>(subscribe, readStatus, () => "unknown");

  /** false during server render and hydration; true once the stored choice has been read. */
  const ready = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  return {
    status,
    ready,
    accept: () => writeRaw(serializeConsent("accepted", new Date())),
    decline: () => writeRaw(serializeConsent("declined", new Date())),
    /** Withdraws the choice; the banner is shown again. */
    reset: () => writeRaw(null),
  };
}
