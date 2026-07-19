// Acceso centralizado a variables de entorno públicas (prefijo BUN_PUBLIC_*).
// Bun.build inyecta estas vars en el bundle del cliente como process.env.BUN_PUBLIC_*.
// No usar Bun.env en runtime del navegador (no existe). Ver AGENTS.md y .env.example.

function get(name: string): string | undefined {
  const v = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.[name];
  return v;
}

export const env = {
  operator1User: get("BUN_PUBLIC_OPERATOR_1_USER"),
  operator1PassHash: get("BUN_PUBLIC_OPERATOR_1_PASS_HASH"),
  operator1Name: get("BUN_PUBLIC_OPERATOR_1_NAME") ?? "Operador 1",
  operator2User: get("BUN_PUBLIC_OPERATOR_2_USER"),
  operator2PassHash: get("BUN_PUBLIC_OPERATOR_2_PASS_HASH"),
  operator2Name: get("BUN_PUBLIC_OPERATOR_2_NAME") ?? "Operador 2",
};
