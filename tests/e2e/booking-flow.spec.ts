import { expect, test, type Page } from "@playwright/test";
import { findCancelLink, hasDatabaseAccess } from "./support/supabase-admin";

/** A unique customer per run, so tests never touch each other's bookings. */
const customerEmail = `e2e+${Date.now()}@example.com`;

/** Walks the wizard to the details step: first service, the next open day, the last free slot. */
async function chooseServiceAndSlot(page: Page) {
  await page.goto("/boeken");

  await page.getByRole("button", { pressed: false }).first().click(); // first service
  await page.getByRole("button", { name: "Volgende" }).click();

  // The next open day, then the last time slot that is still free.
  await page.getByRole("button", { pressed: false }).first().click();
  const freeSlots = page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ });
  await expect(freeSlots.first()).toBeVisible();
  await freeSlots.last().click();
  await page.getByRole("button", { name: "Volgende" }).click();
}

async function fillDetails(page: Page, email: string) {
  await page.getByPlaceholder("Voor- en achternaam").fill("E2E Test");
  await page.getByPlaceholder("06 12 34 56 78").fill("0612345678");
  await page.getByPlaceholder("naam@voorbeeld.nl").fill(email);
}

test.describe("booking flow", () => {
  test.skip(!hasDatabaseAccess, "Supabase env is not configured for E2E tests");

  test("details are validated before anything is sent", async ({ page }) => {
    await chooseServiceAndSlot(page);
    await page.getByRole("button", { name: "Bevestigen" }).click();

    await expect(page.getByText("Vul je naam in.")).toBeVisible();
    await expect(page.getByText("Vul een geldig e-mailadres in.")).toBeVisible();
  });

  test("a customer can book, sees a confirmation without personal data in the URL, and can cancel", async ({
    page,
  }) => {
    await chooseServiceAndSlot(page);
    await fillDetails(page, customerEmail);
    await page.getByRole("button", { name: "Bevestigen" }).click();

    await expect(page).toHaveURL(/\/boeken\/bevestigd\?/);
    await expect(page.getByRole("heading", { name: "Je afspraak staat genoteerd" })).toBeVisible();
    expect(page.url()).not.toContain(encodeURIComponent(customerEmail));
    expect(page.url()).not.toContain("example.com");

    // The cancel link only exists in the confirmation mail, so the test reads it from the database.
    const cancelLink = await findCancelLink(customerEmail);

    await page.goto(cancelLink);
    await expect(page.getByRole("heading", { name: "Afspraak annuleren" })).toBeVisible();
    await page.getByRole("button", { name: "Annuleer afspraak" }).click();
    await expect(page.getByRole("heading", { name: "Afspraak geannuleerd" })).toBeVisible();

    // Cancelling again shows that it is already done instead of failing.
    await page.goto(cancelLink);
    await expect(page.getByRole("heading", { name: "Al geannuleerd" })).toBeVisible();
  });

  test("a wrong cancel token reveals nothing", async ({ page }) => {
    await page.goto(
      `/boeking/annuleren/00000000-0000-4000-8000-000000000000?token=${"0".repeat(64)}`,
    );

    await expect(page.getByRole("heading", { name: "Link niet geldig" })).toBeVisible();
  });
});
