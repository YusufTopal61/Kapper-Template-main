import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test.describe("admin access", () => {
  test("a visitor without a session is sent to the login page", async ({ page }) => {
    for (const path of ["/admin", "/admin/boekingen", "/admin/diensten", "/admin/instellingen"]) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/admin\/login$/);
    }
  });

  test("the login form validates before it asks the server", async ({ page }) => {
    await page.goto("/admin/login");
    await page.getByRole("button", { name: "Inloggen" }).click();

    await expect(page.getByText("Vul een geldig e-mailadres in.")).toBeVisible();
    await expect(page.getByText("Wachtwoord moet minimaal 8 tekens zijn.")).toBeVisible();
  });

  test("wrong credentials give a vague message that does not reveal the account", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page.getByLabel("E-mailadres").fill("nobody@example.com");
    await page.getByLabel("Wachtwoord").fill("not-the-password");
    await page.getByRole("button", { name: "Inloggen" }).click();

    await expect(page.getByText("E-mailadres of wachtwoord klopt niet.")).toBeVisible();
  });

  test("an admin can sign in, reach every admin page and sign out", async ({ page }) => {
    test.skip(!adminEmail || !adminPassword, "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD are not set");

    await page.goto("/admin/login");
    await page.getByLabel("E-mailadres").fill(adminEmail ?? "");
    await page.getByLabel("Wachtwoord").fill(adminPassword ?? "");
    await page.getByRole("button", { name: "Inloggen" }).click();

    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Overzicht" })).toBeVisible();

    for (const [path, heading] of [
      ["/admin/boekingen", "Boekingen"],
      ["/admin/diensten", "Diensten"],
      ["/admin/instellingen", "Instellingen"],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    }

    await page.getByRole("button", { name: "Uitloggen" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
  });
});
