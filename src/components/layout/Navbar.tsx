"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { boekenLink, hoofdNavigatie } from "@/shared/config/navigation";
import { siteConfig } from "@/shared/config/site";
import { cn } from "@/shared/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-3 z-50 flex justify-center px-4 sm:top-5">
      <div className="flex w-full max-w-fit flex-col items-center">
        <div className="flex items-center gap-1 rounded-full border border-border bg-background/90 py-1.5 pl-4 pr-1.5 shadow-lift backdrop-blur-xl">
          <Link
            href="/"
            className="mr-2 whitespace-nowrap font-display text-xs font-bold uppercase tracking-[0.3em] text-foreground sm:mr-4"
          >
            {siteConfig.merknaam}
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            {hoofdNavigatie.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm tracking-tight transition-colors",
                  pathname === link.href
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href={boekenLink.href}
            className="group ml-1 hidden items-center gap-1.5 rounded-full bg-foreground py-1.5 pl-4 pr-1.5 text-sm font-medium tracking-tight text-background transition-opacity hover:opacity-85 md:inline-flex"
          >
            Boeken
            <span className="flex size-6 items-center justify-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-3" />
            </span>
          </Link>

          <button
            type="button"
            aria-label={open ? "Menu sluiten" : "Menu openen"}
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-9 items-center justify-center rounded-full text-foreground md:hidden"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 w-60 origin-top overflow-hidden rounded-2xl border border-border bg-background shadow-lift md:hidden"
            >
              <div className="flex flex-col gap-1 p-2">
                {hoofdNavigatie.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded-xl px-3 py-2.5 text-sm tracking-tight transition-colors",
                      pathname === link.href
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href={boekenLink.href}
                  onClick={() => setOpen(false)}
                  className="mt-1 rounded-xl bg-foreground px-4 py-2.5 text-center text-sm font-medium text-background"
                >
                  Boeken
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
