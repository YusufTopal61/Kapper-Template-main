import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  parseAdres,
  serialiseerJsonLd,
  serviceJsonLd,
  type BedrijfsGegevens,
} from "./structured-data";

const tijden = (open: boolean) => ({ open, van: "09:00", tot: "18:00" });

const bedrijf: BedrijfsGegevens = {
  naam: "Kapper X",
  url: "https://kapperx.nl",
  telefoon: "06 12345678",
  adres: "Dorpsstraat 1, 1234 AB Utrecht",
  openingstijden: {
    maandag: tijden(false),
    dinsdag: tijden(true),
    woensdag: tijden(true),
    donderdag: tijden(true),
    vrijdag: tijden(true),
    zaterdag: { open: true, van: "09:00", tot: "17:00" },
    zondag: tijden(false),
  },
};

describe("parseAdres", () => {
  it("splitst straat, postcode en plaats", () => {
    expect(parseAdres("Dorpsstraat 1, 1234 AB Utrecht")).toMatchObject({
      streetAddress: "Dorpsstraat 1",
      postalCode: "1234 AB",
      addressLocality: "Utrecht",
    });
  });

  it("valt terug op de hele tekst als het formaat niet past", () => {
    expect(parseAdres("Ergens in de stad")).toMatchObject({ streetAddress: "Ergens in de stad" });
    expect(parseAdres("Ergens in de stad")).not.toHaveProperty("postalCode");
  });
});

describe("localBusinessJsonLd", () => {
  const data = localBusinessJsonLd(bedrijf, "BarberShop", "https://kapperx.nl/og.png");

  it("neemt alleen open dagen op, met de juiste Engelse dagnaam en tijden", () => {
    const dagen = data.openingHoursSpecification.map((d) => d.dayOfWeek);
    expect(dagen).toEqual(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    expect(data.openingHoursSpecification.at(-1)).toMatchObject({
      opens: "09:00",
      closes: "17:00",
    });
  });

  it("gebruikt het gekozen lokale type en het NAW uit de database", () => {
    expect(data["@type"]).toBe("BarberShop");
    expect(data).toMatchObject({ name: "Kapper X", telephone: "06 12345678" });
  });

  it("laat adres en telefoon weg als ze niet bekend zijn, in plaats van leeg te publiceren", () => {
    const kaal = localBusinessJsonLd(
      { ...bedrijf, adres: null, telefoon: null },
      "BarberShop",
      "x",
    );
    expect(kaal).not.toHaveProperty("address");
    expect(kaal).not.toHaveProperty("telephone");
  });
});

describe("serviceJsonLd", () => {
  it("geeft de prijs als tekst met twee decimalen in euro's", () => {
    const data = serviceJsonLd(
      { naam: "Knippen", beschrijving: "", prijs: 25 },
      bedrijf,
      "/diensten",
    );
    expect(data.offers).toMatchObject({ price: "25.00", priceCurrency: "EUR" });
    expect(data).not.toHaveProperty("description");
  });

  it("meldt geen aanbod als de prijs nog op 0 (niet ingesteld) staat", () => {
    const data = serviceJsonLd(
      { naam: "Knippen", beschrijving: "", prijs: 0 },
      bedrijf,
      "/diensten",
    );
    expect(data).not.toHaveProperty("offers");
  });
});

describe("breadcrumbJsonLd", () => {
  it("nummert de items vanaf 1 met absolute URL's", () => {
    const data = breadcrumbJsonLd("https://kapperx.nl", [
      { naam: "Home", pad: "/" },
      { naam: "Diensten", pad: "/diensten" },
    ]);
    expect(data.itemListElement[1]).toMatchObject({
      position: 2,
      item: "https://kapperx.nl/diensten",
    });
  });
});

describe("faqJsonLd", () => {
  it("bouwt Question/Answer-paren", () => {
    const data = faqJsonLd([{ vraag: "Moet ik reserveren?", antwoord: "Dat kan online." }]);
    expect(data.mainEntity[0]).toMatchObject({ name: "Moet ik reserveren?" });
  });
});

describe("serialiseerJsonLd", () => {
  it("kan niet uit de script-tag breken via een kwaadaardige naam", () => {
    const uitvoer = serialiseerJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(uitvoer).not.toContain("</script>");
    expect(JSON.parse(uitvoer).name).toBe("</script><script>alert(1)</script>");
  });
});
