import { useCallback, useState } from "react";
import { db } from "@/lib/db/delegaDb";
import { sha256 } from "@/lib/auth/hash";
import {
  clearSession,
  loadSession,
  saveSession,
} from "@/lib/auth/session";
import type { Session } from "@/lib/types";

// Autenticación de operadores (spec §FR-4, contracts §C1, research.md §R2).
// Login compara SHA-256(password) contra operator.passwordHash en Dexie.
// La sesión vive en localStorage con expiresAt derivado de config.

const DEFAULT_TIMEOUT_HOURS = 4;

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => loadSession());

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (!username || !password) return false;

      const operator = await db.operators
        .where("username")
        .equals(username)
        .first();
      if (!operator) return false;

      const hash = await sha256(password);
      if (hash !== operator.passwordHash) return false;

      const config = await db.config.get("app");
      const timeoutHours = config?.sessionTimeoutHours ?? DEFAULT_TIMEOUT_HOURS;
      const loginAt = Date.now();
      const expiresAt = loginAt + timeoutHours * 3600 * 1000;

      const next: Session = {
        operatorId: operator.id,
        username: operator.username,
        displayName: operator.displayName,
        loginAt,
        expiresAt,
      };
      saveSession(next);
      setSession(next);
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  const isExpired = useCallback((): boolean => {
    if (!session) return true;
    return session.expiresAt < Date.now();
  }, [session]);

  return {
    session,
    isAuthenticated: session !== null && !isExpired(),
    isExpired,
    login,
    logout,
  };
}
