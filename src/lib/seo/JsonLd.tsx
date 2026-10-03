import { serializeJsonLd } from "./structured-data";

/** Rendert structured data server-side, zodat Google het in de eerste HTML ziet. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // Veilig: serialiseerJsonLd escapet `<`.
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
