import type { ReactNode } from "react";
import { Footer } from "@/modules/site/presentation/Footer";
import { Navbar } from "@/modules/site/presentation/Navbar";

/** Het kader van alle publieke pagina's. Elke pagina levert zelf haar <main>. */
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
