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
    <main className="flex min-h-screen items-center justify-center bg-surface-studio p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-6 bg-surface-container-lowest rounded-xl shadow-ambient p-8"
      >
        <div className="text-center">
          <h1 className="font-display text-headline-md text-primary font-bold mb-2">Acceso operadores</h1>
          <p className="text-sm text-on-surface-variant">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Usuario</Label>
          <Input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            disabled={isBlocked}
            placeholder="Tu usuario"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Contraseña</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isBlocked}
            placeholder="Tu contraseña"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-error bg-error-container/10 p-3 rounded-lg">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full h-11" disabled={loading || isBlocked}>
          {loading ? "Accediendo..." : "Entrar"}
        </Button>
      </form>
    </main>
  );
}
