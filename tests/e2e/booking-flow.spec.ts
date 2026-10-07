import { expect, test, type Page } from "@playwright/test";
import { findCancelLink, hasDatabaseAccess } from "./support/supabase-admin";

/** A unique customer per run, so tests never touch each other's bookings. */
const customerEmail = `e2e+${Date.now()}@example.com`;

/** Walks the wizard to the details step: first service, the second open day, the last free slot. */
async function chooseServiceAndSlot(page: Page) {
  await page.goto("/boeken");

  // Choice buttons carry aria-pressed. Matching the attribute (not the role) keeps the
  // mobile menu toggle, which has no such attribute, out of the selection.
  await page.locator('[aria-pressed="false"]').first().click(); // first service
  await page.getByRole("button", { name: "Volgende" }).click();

  // The second open day, not the first: the first can be today, and after closing time
  // every slot of today is disabled. Then the last time slot that is still free.
  await page.locator('[aria-pressed="false"]').nth(1).click();
  const freeSlots = page.locator("button:not([disabled])").filter({ hasText: /^\d{2}:\d{2}$/ });
  await expect(freeSlots.first()).toBeVisible();
  await freeSlots.last().click();
  await page.getByRole("button", { name: "Volgende" }).click();

  // Wait for the details step to be on screen: the step content animates in.
  await expect(page.getByPlaceholder("Voor- en achternaam")).toBeVisible();
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
    // Cancelling writes to the database and sends mail, which can be slow on a cold dev server.
    await expect(page.getByRole("heading", { name: "Afspraak geannuleerd" })).toBeVisible({
      timeout: 20_000,
    });

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
