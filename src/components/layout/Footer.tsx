import Link from "next/link";
import { boekenLink, hoofdNavigatie, juridischeLinks } from "@/shared/config/navigation";
import { siteConfig } from "@/shared/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            href="/"
            className="font-display text-sm font-bold uppercase tracking-[0.35em] text-foreground"
          >
            {siteConfig.merknaam}
          </Link>
          <nav className="flex flex-wrap gap-x-7 gap-y-3">
            {[...hoofdNavigatie, boekenLink].map((item) => (
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
            © {new Date().getFullYear()} {siteConfig.merknaam}. Alle rechten voorbehouden.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {juridischeLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
