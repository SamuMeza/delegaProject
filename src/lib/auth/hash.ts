// Hashing de contraseñas con Web Crypto SHA-256 (navegador, sin backend).
// No almacenamos contraseñas en texto plano; solo su hash. Ver spec §FR-4 / research.md §R2.

export async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
