/** Cryptografisch veilig token voor geheime links (64 hex-tekens). */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateId(): string {
  return crypto.randomUUID();
}
