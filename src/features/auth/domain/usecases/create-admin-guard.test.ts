import { describe, expect, it } from "vitest";
import { NietIngelogdError } from "../auth.gateway";
import { createAdminGuard } from "./createAdminGuard";

describe("createAdminGuard", () => {
  it("laat een beheerder door", async () => {
    await expect(createAdminGuard({ isAdmin: async () => true })()).resolves.toBeUndefined();
  });

  it("weigert iedereen die geen beheerder is", async () => {
    await expect(createAdminGuard({ isAdmin: async () => false })()).rejects.toBeInstanceOf(
      NietIngelogdError,
    );
  });
});
