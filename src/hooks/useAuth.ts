import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import { sha256 } from "@/lib/auth/hash";
import {
  clearSession,
  loadSession,
  saveSession,
} from "@/lib/auth/session";
import type { Session } from "@/lib/types";

const DEFAULT_TIMEOUT_HOURS = 4;
const MAX_LOGIN_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

const ATTEMPT_KEY = "delega_login_attempts";
const BLOCK_KEY = "delega_login_blocked_until";

function getAttempts(): number {
  try {
    return Number(sessionStorage.getItem(ATTEMPT_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setAttempts(n: number) {
  try {
    sessionStorage.setItem(ATTEMPT_KEY, String(n));
  } catch {
    /* sessionStorage no disponible */
  }
}

function getBlockedUntil(): number {
  try {
    return Number(sessionStorage.getItem(BLOCK_KEY)) || 0;
  } catch {
    return 0;
  }
}

function setBlockedUntil(ts: number) {
  try {
    sessionStorage.setItem(BLOCK_KEY, String(ts));
  } catch {
    /* sessionStorage no disponible */
  }
}

function clearBlock() {
  try {
    sessionStorage.removeItem(ATTEMPT_KEY);
    sessionStorage.removeItem(BLOCK_KEY);
  } catch {
    /* sessionStorage no disponible */
  }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(() => loadSession());
  const [remainingAttempts, setRemainingAttempts] = useState(() => {
    const blocked = getBlockedUntil();
    if (blocked > Date.now()) return 0;
    return Math.max(0, MAX_LOGIN_ATTEMPTS - getAttempts());
  });

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      if (!username || !password) return false;

      const blocked = getBlockedUntil();
      if (blocked > Date.now()) {
        setRemainingAttempts(0);
        return false;
      }

      const { data: operator } = await supabase
        .from("operators")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (!operator) {
        const attempts = getAttempts() + 1;
        setAttempts(attempts);
        const left = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
        setRemainingAttempts(left);
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          setBlockedUntil(Date.now() + BLOCK_DURATION_MS);
          setRemainingAttempts(0);
        }
        return false;
      }

      const hash = await sha256(password);
      if (hash !== operator.password_hash) {
        const attempts = getAttempts() + 1;
        setAttempts(attempts);
        const left = Math.max(0, MAX_LOGIN_ATTEMPTS - attempts);
        setRemainingAttempts(left);
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          setBlockedUntil(Date.now() + BLOCK_DURATION_MS);
          setRemainingAttempts(0);
        }
        return false;
      }

      clearBlock();
      setRemainingAttempts(MAX_LOGIN_ATTEMPTS);

      const { data: config } = await supabase
        .from("config")
        .select("session_timeout_hours")
        .eq("id", "app")
        .maybeSingle();

      const timeoutHours = config?.session_timeout_hours ?? DEFAULT_TIMEOUT_HOURS;
      const loginAt = Date.now();
      const expiresAt = loginAt + timeoutHours * 3600 * 1000;

      const next: Session = {
        operatorId: operator.id,
        username: operator.username,
        displayName: operator.display_name,
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
    remainingAttempts,
    login,
    logout,
  };
}
