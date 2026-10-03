import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  localBusinessJsonLd,
  parseAddress,
  serializeJsonLd,
  serviceJsonLd,
  type BusinessData,
} from "./structured-data";

const hours = (open: boolean) => ({ open, from: "09:00", to: "18:00" });

const business: BusinessData = {
  name: "Kapper X",
  url: "https://kapperx.nl",
  phone: "06 12345678",
  address: "Dorpsstraat 1, 1234 AB Utrecht",
  openingHours: {
    monday: hours(false),
    tuesday: hours(true),
    wednesday: hours(true),
    thursday: hours(true),
    friday: hours(true),
    saturday: { open: true, from: "09:00", to: "17:00" },
    sunday: hours(false),
  },
};

describe("parseAdres", () => {
  it("splitst straat, postcode en plaats", () => {
    expect(parseAddress("Dorpsstraat 1, 1234 AB Utrecht")).toMatchObject({
      streetAddress: "Dorpsstraat 1",
      postalCode: "1234 AB",
      addressLocality: "Utrecht",
    });
  });

  it("valt terug op de hele tekst als het formaat niet past", () => {
    expect(parseAddress("Ergens in de stad")).toMatchObject({ streetAddress: "Ergens in de stad" });
    expect(parseAddress("Ergens in de stad")).not.toHaveProperty("postalCode");
  });
});

describe("localBusinessJsonLd", () => {
  const data = localBusinessJsonLd(business, "BarberShop", "https://kapperx.nl/og.png");

  it("neemt alleen open dagen op, met de juiste Engelse dagnaam en tijden", () => {
    const days = data.openingHoursSpecification.map((d) => d.dayOfWeek);
    expect(days).toEqual(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
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
    const bare = localBusinessJsonLd(
      { ...business, address: null, phone: null },
      "BarberShop",
      "x",
    );
    expect(bare).not.toHaveProperty("address");
    expect(bare).not.toHaveProperty("telephone");
  });
});

describe("serviceJsonLd", () => {
  it("geeft de prijs als tekst met twee decimalen in euro's", () => {
    const data = serviceJsonLd(
      { name: "Knippen", description: "", price: 25 },
      business,
      "/diensten",
    );
    expect(data.offers).toMatchObject({ price: "25.00", priceCurrency: "EUR" });
    expect(data).not.toHaveProperty("description");
  });

  it("meldt geen aanbod als de prijs nog op 0 (niet ingesteld) staat", () => {
    const data = serviceJsonLd(
      { name: "Knippen", description: "", price: 0 },
      business,
      "/diensten",
    );
    expect(data).not.toHaveProperty("offers");
  });
});

describe("breadcrumbJsonLd", () => {
  it("nummert de items vanaf 1 met absolute URL's", () => {
    const data = breadcrumbJsonLd("https://kapperx.nl", [
      { name: "Home", path: "/" },
      { name: "Diensten", path: "/diensten" },
    ]);
    expect(data.itemListElement[1]).toMatchObject({
      position: 2,
      item: "https://kapperx.nl/diensten",
    });
  });
});

describe("faqJsonLd", () => {
  it("bouwt Question/Answer-paren", () => {
    const data = faqJsonLd([{ question: "Moet ik reserveren?", answer: "Dat kan online." }]);
    expect(data.mainEntity[0]).toMatchObject({ name: "Moet ik reserveren?" });
  });
});

describe("serialiseerJsonLd", () => {
  it("kan niet uit de script-tag breken via een kwaadaardige naam", () => {
    const output = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(output).not.toContain("</script>");
    expect(JSON.parse(output).name).toBe("</script><script>alert(1)</script>");
  });
});
