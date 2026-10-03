import { describe, expect, it } from "vitest";
import { maakMetadata } from "./metadata";

describe("maakMetadata", () => {
  it("zet canonical, Open Graph en Twitter op dezelfde pagina", () => {
    const metadata = maakMetadata({
      titel: "Diensten",
      beschrijving: "Beschrijving",
      pad: "/diensten",
    });

    expect(metadata.alternates?.canonical).toBe("/diensten");
    expect(metadata.openGraph).toMatchObject({ url: "/diensten", title: "Diensten — BARBER" });
    expect(metadata.twitter).toMatchObject({
      card: "summary_large_image",
      title: "Diensten — BARBER",
    });
  });

  it("plakt de merknaam niet dubbel achter een titel die hem al bevat", () => {
    const metadata = maakMetadata({
      titel: "BARBER — Premium barbershop",
      beschrijving: "x",
      pad: "/",
      metMerknaam: false,
    });

    expect(metadata.openGraph).toMatchObject({ title: "BARBER — Premium barbershop" });
  });

  it("houdt pagina's die niet in Google horen uit de index", () => {
    expect(
      maakMetadata({ titel: "x", beschrijving: "x", pad: "/x", nietIndexeren: true }).robots,
    ).toEqual({
      index: false,
      follow: false,
    });
    expect(maakMetadata({ titel: "x", beschrijving: "x", pad: "/x" }).robots).toBeUndefined();
  });
});
