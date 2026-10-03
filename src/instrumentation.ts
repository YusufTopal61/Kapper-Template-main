/**
 * Draait één keer bij het opstarten van de server. In productie start de app
 * niet met een ontbrekende of ongeldige omgevingsvariabele; in development
 * waarschuwen we alleen, zodat de setup-melding in de browser zichtbaar blijft.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { validateEnv } = await import("@/lib/env.server");
  validateEnv();
}
