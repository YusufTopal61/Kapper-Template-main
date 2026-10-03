/** Pill badge: small bold label + light description. */
export function Badge({ label, text }: { label: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 text-xs tracking-tight">
      <span className="rounded-full bg-foreground px-2 py-0.5 text-[11px] font-semibold text-background">
        {label}
      </span>
      <span className="text-muted-foreground">{text}</span>
    </span>
  );
}
