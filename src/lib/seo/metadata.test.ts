import { describe, expect, it } from "vitest";
import { buildMetadata } from "./metadata";

describe("maakMetadata", () => {
  it("zet canonical, Open Graph en Twitter op dezelfde pagina", () => {
    const metadata = buildMetadata({
      title: "Diensten",
      description: "Beschrijving",
      path: "/diensten",
    });

    expect(metadata.alternates?.canonical).toBe("/diensten");
    expect(metadata.openGraph).toMatchObject({ url: "/diensten", title: "Diensten — BARBER" });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Diensten — BARBER",
    });
  });

  it("plakt de merknaam niet dubbel achter een titel die hem al bevat", () => {
    const metadata = buildMetadata({
      title: "BARBER — Premium barbershop",
      description: "x",
      path: "/",
      withBrandName: false,
    });

    expect(metadata.openGraph).toMatchObject({ title: "BARBER — Premium barbershop" });
  });

  it("houdt pagina's die niet in Google horen uit de index", () => {
    expect(
      buildMetadata({ title: "x", description: "x", path: "/x", noIndex: true }).robots,
    ).toEqual({
      index: false,
      follow: false,
    });
    expect(buildMetadata({ title: "x", description: "x", path: "/x" }).robots).toBeUndefined();
  });
});
