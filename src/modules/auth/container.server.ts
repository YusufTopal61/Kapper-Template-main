import { createAdminGuard } from "./business/admin-guard";
import { createSupabaseAuthGateway } from "./data/auth.gateway.server";

/**
 * Composition root van de auth-module: het enige bestand dat data/ en
 * business/ aan elkaar knoopt. Per request opnieuw aanroepen — de gateway
 * leest de sessie uit de cookies van het huidige request.
 */
export function getAuthGateway() {
  return createSupabaseAuthGateway();
}

export function getAdminGuard() {
  return createAdminGuard(createSupabaseAuthGateway());
}
