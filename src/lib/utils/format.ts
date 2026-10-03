/** Formatting of amounts for the screens. One place, so every screen looks the same. */
export function formatEuro(amount: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(amount);
}
