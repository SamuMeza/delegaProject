import { useCallback, useState } from "react";

// Sesión en localStorage (manual §3.2).
export interface Session {
  operatorId: "op_001" | "op_002";
  operatorName: string;
  loginAt: string;
  expiresAt: string;
}

const SESSION_KEY = "delega_session";

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as Session;
      if (new Date(parsed.expiresAt).getTime() < Date.now()) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const hash = await sha256(password);
      const u1 = Bun.env.BUN_PUBLIC_OPERATOR_1_USER;
      const p1 = Bun.env.BUN_PUBLIC_OPERATOR_1_PASS_HASH;
      const u2 = Bun.env.BUN_PUBLIC_OPERATOR_2_USER;
      const p2 = Bun.env.BUN_PUBLIC_OPERATOR_2_PASS_HASH;
      let operatorId: Session["operatorId"] | null = null;
      let operatorName = "";
      if (username === u1 && hash === p1) {
        operatorId = "op_001";
        operatorName = Bun.env.BUN_PUBLIC_OPERATOR_1_NAME ?? "Operador 1";
      } else if (username === u2 && hash === p2) {
        operatorId = "op_002";
        operatorName = Bun.env.BUN_PUBLIC_OPERATOR_2_NAME ?? "Operador 2";
      }
      if (!operatorId) return false;
      const loginAt = new Date().toISOString();
      const timeoutHours = 4;
      const expiresAt = new Date(
        Date.now() + timeoutHours * 3600 * 1000,
      ).toISOString();
      const next: Session = {
        operatorId,
        operatorName,
        loginAt,
        expiresAt,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return { session, login, logout, isAuthenticated: session !== null };
}
