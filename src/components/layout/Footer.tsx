import Link from "next/link";
import { bookingLink, mainNavigation, legalLinks } from "@/config/navigation";
import { builder, siteConfig } from "@/config/site";
import { CookieSettingsButton } from "./CookieSettingsButton";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background pb-28 pt-12 sm:pb-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-display text-sm font-bold uppercase tracking-[0.35em] text-foreground"
          >
            {siteConfig.brandName}
          </Link>
          <nav className="flex flex-wrap gap-x-7 gap-y-3">
            {[...mainNavigation, bookingLink].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm tracking-tight text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex gap-2">
            {["IG", "FB", "TT"].map((s) => (
              <span
                key={s}
                className="inline-flex size-8 items-center justify-center rounded-md border border-border text-[11px] font-semibold text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.brandName}. Alle rechten voorbehouden.{" "}
            <span className="whitespace-nowrap">
              Website door{" "}
              <a
                href={builder.url}
                target="_blank"
                rel="noopener"
                className="font-medium text-foreground underline underline-offset-2"
              >
                {builder.name}
              </a>
            </span>
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <CookieSettingsButton />
          </div>
        </div>
      </div>
    </footer>
  );
}
