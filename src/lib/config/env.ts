// Acceso centralizado a variables de entorno públicas (prefijo BUN_PUBLIC_*).
// En dev, Bun inyecta estas vars vía process.env en el servidor; en el bundle
// del cliente se resuelven a undefined (el seed usa fallbacks correctos).
// Ver seed.ts para los valores por defecto.

export const env = {
  operator1User: typeof process !== "undefined" ? process.env?.BUN_PUBLIC_OPERATOR_1_USER : undefined,
  operator1PassHash: typeof process !== "undefined" ? process.env?.BUN_PUBLIC_OPERATOR_1_PASS_HASH : undefined,
  operator1Name: typeof process !== "undefined" ? process.env?.BUN_PUBLIC_OPERATOR_1_NAME : undefined,
  operator2User: typeof process !== "undefined" ? process.env?.BUN_PUBLIC_OPERATOR_2_USER : undefined,
  operator2PassHash: typeof process !== "undefined" ? process.env?.BUN_PUBLIC_OPERATOR_2_PASS_HASH : undefined,
  operator2Name: typeof process !== "undefined" ? process.env?.BUN_PUBLIC_OPERATOR_2_NAME : undefined,
  whatsappNumber: typeof process !== "undefined" ? process.env?.BUN_PUBLIC_WHATSAPP_NUMBER ?? "584121234567" : "584121234567",
  trackingSalt: typeof process !== "undefined" ? process.env?.BUN_PUBLIC_TRACKING_SALT ?? "delega-default-salt" : "delega-default-salt",
  sessionTimeoutHours: Number(typeof process !== "undefined" ? process.env?.BUN_PUBLIC_SESSION_TIMEOUT_HOURS ?? "8" : "8"),
};
