import { useConfig } from "@/hooks/useDelegaDB";

export function DashboardPage() {
  const config = useConfig();
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Sesión expira tras {config?.sessionTimeoutHours ?? "—"} hora(s) de
        inactividad.
      </p>
    </main>
  );
}
