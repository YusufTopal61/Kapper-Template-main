/** Opmaak van bedragen voor de schermen. Eén plek, zodat elk scherm er hetzelfde uitziet. */
export function formatEuro(bedrag: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(bedrag);
}
