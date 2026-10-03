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
  it("splits street, postal code and city", () => {
    expect(parseAddress("Dorpsstraat 1, 1234 AB Utrecht")).toMatchObject({
      streetAddress: "Dorpsstraat 1",
      postalCode: "1234 AB",
      addressLocality: "Utrecht",
    });
  });

  it("falls back to the whole text when the format does not fit", () => {
    expect(parseAddress("Ergens in de stad")).toMatchObject({ streetAddress: "Ergens in de stad" });
    expect(parseAddress("Ergens in de stad")).not.toHaveProperty("postalCode");
  });
});

describe("localBusinessJsonLd", () => {
  const data = localBusinessJsonLd(business, "BarberShop", "https://kapperx.nl/og.png");

  it("only includes open days, with the right English day name and times", () => {
    const days = data.openingHoursSpecification.map((d) => d.dayOfWeek);
    expect(days).toEqual(["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);
    expect(data.openingHoursSpecification.at(-1)).toMatchObject({
      opens: "09:00",
      closes: "17:00",
    });
  });

  it("uses the chosen local type and the name/address/phone from the database", () => {
    expect(data["@type"]).toBe("BarberShop");
    expect(data).toMatchObject({ name: "Kapper X", telephone: "06 12345678" });
  });

  it("omits address and phone when unknown, instead of publishing empty values", () => {
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
  it("gives the price as text with two decimals in euros", () => {
    const data = serviceJsonLd(
      { name: "Knippen", description: "", price: 25 },
      business,
      "/diensten",
    );
    expect(data.offers).toMatchObject({ price: "25.00", priceCurrency: "EUR" });
    expect(data).not.toHaveProperty("description");
  });

  it("reports no offer when the price is still 0 (not set)", () => {
    const data = serviceJsonLd(
      { name: "Knippen", description: "", price: 0 },
      business,
      "/diensten",
    );
    expect(data).not.toHaveProperty("offers");
  });
});

describe("breadcrumbJsonLd", () => {
  it("numbers the items from 1 with absolute URLs", () => {
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
  it("cannot break out of the script tag via a malicious name", () => {
    const output = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(output).not.toContain("</script>");
    expect(JSON.parse(output).name).toBe("</script><script>alert(1)</script>");
  });
});
