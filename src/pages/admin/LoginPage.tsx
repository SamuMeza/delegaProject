import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginPage() {
  const { login, remainingAttempts } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isBlocked = remainingAttempts === 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const ok = await login(username.trim(), password);
    setLoading(false);
    if (ok) {
      navigate("/admin", { replace: true });
    } else {
      if (remainingAttempts === 0) {
        const blocked = (() => {
          try {
            return Number(sessionStorage.getItem("delega_login_blocked_until")) || 0;
          } catch {
            return 0;
          }
        })();
        const remainingMin = blocked > 0 ? Math.ceil((blocked - Date.now()) / 60000) : 15;
        setError(`Demasiados intentos. Intenta de nuevo en ${remainingMin} minuto(s).`);
      } else {
        setError(`Credenciales incorrectas. Quedan ${remainingAttempts} intento(s).`);
      }
      setPassword("");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-card p-6 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Acceso operadores</h1>

        <div className="space-y-2">
          <Label htmlFor="username">Usuario</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isBlocked}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isBlocked}
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full" disabled={loading || isBlocked}>
          {loading ? "Accediendo…" : "Entrar"}
        </Button>
      </form>
    </main>
  );
}
