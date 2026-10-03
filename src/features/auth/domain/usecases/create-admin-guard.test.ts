import { describe, expect, it } from "vitest";
import { AuthenticationError, AuthorizationError } from "@/lib/errors";
import { createAdminGuard } from "./create-admin-guard";

describe("createAdminGuard", () => {
  it("lets an admin through", async () => {
    const guard = createAdminGuard({ getAdminStatus: async () => "admin" });

    await expect(guard()).resolves.toBeUndefined();
  });

  it("rejects a visitor who is not signed in as an authentication failure", async () => {
    const guard = createAdminGuard({ getAdminStatus: async () => "signed-out" });

    await expect(guard()).rejects.toBeInstanceOf(AuthenticationError);
  });

  it("rejects a signed-in user without admin rights as an authorization failure", async () => {
    const guard = createAdminGuard({ getAdminStatus: async () => "not-admin" });

    await expect(guard()).rejects.toBeInstanceOf(AuthorizationError);
  });
});
