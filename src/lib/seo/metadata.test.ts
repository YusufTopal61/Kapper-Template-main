import { describe, expect, it } from "vitest";
import { buildMetadata } from "./metadata";

describe("maakMetadata", () => {
  it("sets canonical, Open Graph and Twitter for the same page", () => {
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

  it("does not append the brand name twice to a title that already contains it", () => {
    const metadata = buildMetadata({
      title: "BARBER — Premium barbershop",
      description: "x",
      path: "/",
      withBrandName: false,
    });

    expect(metadata.openGraph).toMatchObject({ title: "BARBER — Premium barbershop" });
  });

  it("keeps pages that do not belong in Google out of the index", () => {
    expect(
      buildMetadata({ title: "x", description: "x", path: "/x", noIndex: true }).robots,
    ).toEqual({
      index: false,
      follow: false,
    });
    expect(buildMetadata({ title: "x", description: "x", path: "/x" }).robots).toBeUndefined();
  });
});
