import type { Session } from "@/lib/types";

// Gestión de la sesión del operador en localStorage (manual §3.2, research.md §R3).
// La sesión vive en el dispositivo y expira según config.sessionTimeoutHours.

const SESSION_KEY = "delega_session";

export function saveSession(session: Session): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function loadSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Session;
    if (
      typeof parsed.operatorId !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      throw new Error("formato de sesión inválido");
    }
    if (isExpired(parsed)) {
      clearSession();
      return null;
    }
    return parsed;
  } catch {
    // Sesión corrupta: la descartamos para no bloquear el acceso.
    clearSession();
    return null;
  }
}

export function isExpired(session: Session, now: number = Date.now()): boolean {
  return session.expiresAt < now;
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}
