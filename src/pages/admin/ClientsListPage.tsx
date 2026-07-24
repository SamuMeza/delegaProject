import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useClients, useSubscriptions } from "@/hooks/useDelegaDB";
import { db } from "@/lib/db/delegaDb";
import type { Client } from "@/lib/types";

function daysUntilEnd(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function ordersThisMonth(sub: Client["subscription"]): number {
  if (!sub) return 0;
  const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  return sub.usedPerMonth[key] ?? 0;
}

export function ClientsListPage() {
  const clients = useClients();
  const subscriptions = useSubscriptions();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  async function handleCreate() {
    if (!name.trim() || !phone.trim()) return;
    await db.clients.put({
      phone: phone.trim(),
      name: name.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
      totalOrders: 0,
      totalSpent: 0,
      subscription: null,
      history: [],
    });
    await db.activity_log.add({
      id: `LOG-${Date.now()}`,
      operatorId: "operator",
      action: "create_client",
      targetId: phone.trim(),
      details: `Cliente ${name.trim()} creado`,
      timestamp: new Date().toISOString(),
    });
    setName("");
    setPhone("");
    setEmail("");
    setNotes("");
    setShowCreate(false);
  }

  const activeSubs = subscriptions?.filter((s) => s.status === "activa") ?? [];

  const allOrders = useLiveQuery(() => db.orders.toArray(), []) ?? [];
  const lastContactMap = new Map<string, string>();
  for (const order of allOrders) {
    const existing = lastContactMap.get(order.clientPhone);
    if (!existing || order.createdAt > existing) {
      lastContactMap.set(order.clientPhone, order.createdAt);
    }
  }

  function getClientAlert(client: Client): { show: boolean; days: number } {
    const sub = activeSubs.find((s) => s.clientPhone === client.phone);
    if (!sub) return { show: false, days: 0 };
    const days = daysUntilEnd(sub.endDate);
    return { show: days <= 15, days };
  }

  return (
    <main className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Nuevo cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="c-name">Nombre</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-phone">Teléfono</Label>
              <Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0412-1234567" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-email">Email (opcional)</Label>
              <Input id="c-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-notes">Notas (opcional)</Label>
              <Input id="c-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Referencia..." />
            </div>
            <Button onClick={handleCreate} disabled={!name.trim() || !phone.trim()}>
              Guardar cliente
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de clientes</CardTitle>
        </CardHeader>
        <CardContent>
          {!clients || clients.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay clientes registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 font-medium">Nombre</th>
                    <th className="pb-2 font-medium">Teléfono</th>
                    <th className="pb-2 font-medium">Último contacto</th>
                    <th className="pb-2 font-medium">Suscripción activa</th>
                    <th className="pb-2 font-medium">Órdenes del mes</th>
                    <th className="pb-2 font-medium">Alerta</th>
                  </tr>
                </thead>
                <tbody>
                  {clients
                    .filter((c) => !c.name.startsWith("[desactivado]"))
                    .map((client) => {
                      const alert = getClientAlert(client);
                      const sub = client.subscription;
                      const monthly = ordersThisMonth(client.subscription);
                      return (
                        <tr key={client.phone} className="border-b hover:bg-muted/50">
                          <td className="py-2">
                            <Link to={`/admin/clientes/${client.phone}`} className="text-primary hover:underline">
                              {client.name}
                            </Link>
                          </td>
                          <td className="py-2">{client.phone}</td>
                          <td className="py-2">
                            {lastContactMap.has(client.phone)
                              ? new Date(lastContactMap.get(client.phone)!).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-2">{sub ? `${sub.type} (${sub.monthlyQuota}/mes)` : "—"}</td>
                          <td className="py-2">{monthly}</td>
                          <td className="py-2">
                            {alert.show && (
                              <span className="inline-flex items-center gap-1 text-xs text-amber-600">
                                <AlertTriangle className="h-3 w-3" />
                                {alert.days} día{alert.days !== 1 ? "s" : ""}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}