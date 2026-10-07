import { expect, test } from "@playwright/test";

const PUBLIC_PAGES = [
  "/",
  "/diensten",
  "/over-ons",
  "/galerij",
  "/contact",
  "/boeken",
  "/privacybeleid",
  "/algemene-voorwaarden",
];

test.describe("public pages", () => {
  for (const path of PUBLIC_PAGES) {
    test(`${path} renders with one h1, a title and a canonical URL`, async ({ page }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(/BARBER/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    });
  }

  test("an unknown page is a 404 with a way back", async ({ page }) => {
    const response = await page.goto("/bestaat-niet");

    expect(response?.status()).toBe(404);
    await expect(page.getByRole("link", { name: "Terug naar home" })).toBeVisible();
  });

  test("the homepage ships structured data for the local business", async ({ page }) => {
    await page.goto("/");
    const json = await page.locator('script[type="application/ld+json"]').allTextContents();

    expect(json.join("")).toContain('"@type":"BarberShop"');
  });

  test("robots.txt keeps the admin and cancel pages out of search engines", async ({ request }) => {
    const robots = await (await request.get("/robots.txt")).text();

    expect(robots).toContain("Disallow: /admin");
    expect(robots).toContain("Disallow: /boeking/annuleren");
  });

  test("legal pages are noindex and not in the sitemap", async ({ page, request }) => {
    for (const path of ["/privacybeleid", "/algemene-voorwaarden"]) {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    }

    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/diensten");
    expect(sitemap).not.toContain("/privacybeleid");
    expect(sitemap).not.toContain("/algemene-voorwaarden");
  });

  test("the cookie choice can be withdrawn from the footer", async ({ page }) => {
    await page.goto("/");

    const banner = page.getByRole("region", { name: "Cookiemelding" });
    await expect(banner).toBeVisible();
    await banner.getByRole("button", { name: "Weigeren" }).click();
    await expect(banner).toBeHidden();

    await page.getByRole("button", { name: "Cookie-instellingen" }).click();
    await expect(banner).toBeVisible();
  });

  test("an old or unversioned cookie choice is asked again", async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem("cookie_consent", "accepted"));
    await page.goto("/");

    await expect(page.getByRole("region", { name: "Cookiemelding" })).toBeVisible();
  });

  test("the footer credits the builder", async ({ page }) => {
    await page.goto("/");

    const credit = page.getByRole("link", { name: "YM Creations" });
    await expect(credit).toHaveAttribute("href", "https://ymcreations.com");
    await expect(credit).toHaveAttribute("rel", /noopener/);
  });

  test("responses carry the security headers", async ({ request }) => {
    const headers = (await request.get("/")).headers();

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["strict-transport-security"]).toContain("max-age=");
  });
});
