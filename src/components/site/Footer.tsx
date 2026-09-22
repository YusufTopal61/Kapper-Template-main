import { Link } from "@tanstack/react-router";
import { navLinks } from "./Navbar";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/"
            className="font-display text-sm font-bold uppercase tracking-[0.35em] text-foreground"
          >
            Barber
          </Link>
          <nav className="flex flex-wrap gap-x-7 gap-y-3">
            {[...navLinks, { label: "Boeken", to: "/boeken" as const }].map((item) => (
              <Link
                key={item.to}
                to={item.to}
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
          <p>© {new Date().getFullYear()} [Brand name]. Alle rechten voorbehouden.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link to="/privacybeleid" className="transition-colors hover:text-foreground">
              Privacybeleid
            </Link>
            <Link to="/algemene-voorwaarden" className="transition-colors hover:text-foreground">
              Algemene voorwaarden
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
