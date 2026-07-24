import { useLiveQuery } from "dexie-react-hooks";
import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConfig } from "@/hooks/useDelegaDB";
import { db } from "@/lib/db/delegaDb";

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export function DashboardPage() {
  const config = useConfig();
  const renewals = useLiveQuery(
    () =>
      db.transaction("r", db.subscriptions, db.clients, async () => {
        const subs = await db.subscriptions
          .where("status")
          .equals("activa")
          .toArray();
        const nearEnd = subs
          .filter((s) => {
            const d = daysUntil(s.endDate);
            return d >= 0 && d <= 15;
          })
          .sort((a, b) => daysUntil(a.endDate) - daysUntil(b.endDate));
        const phones = [...new Set(nearEnd.map((s) => s.clientPhone))];
        const clients = await db.clients.bulkGet(phones);
        const nameMap = new Map<string, string>();
        for (const c of clients) {
          if (c) nameMap.set(c.phone, c.name);
        }
        return nearEnd.map((s) => ({
          ...s,
          clientName: nameMap.get(s.clientPhone) ?? s.clientPhone,
        }));
      }),
    [],
    [],
  );

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {renewals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Suscripciones próximas a vencer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {renewals.map((sub) => {
                const d = daysUntil(sub.endDate);
                return (
                  <li key={sub.id} className="flex items-center justify-between text-sm">
                    <Link to={`/admin/clientes/${sub.clientPhone}`} className="text-primary hover:underline">
                      {sub.clientName}
                    </Link>
                    <span className="text-muted-foreground">
                      Vence en {d} día{d !== 1 ? "s" : ""} ({sub.endDate})
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground">
        Sesión expira tras {config?.sessionTimeoutHours ?? "—"} hora(s) de inactividad.
      </p>
    </main>
  );
}