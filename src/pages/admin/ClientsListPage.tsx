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

function getCurrentMonthKey(): string {
  return `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
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
    const days = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return { show: days <= 15, days };
  }

  const currentMonth = getCurrentMonthKey();
  const ordersThisMonthByPhone = new Map<string, number>();
  for (const order of allOrders) {
    if (order.createdAt.startsWith(currentMonth)) {
      ordersThisMonthByPhone.set(order.clientPhone, (ordersThisMonthByPhone.get(order.clientPhone) ?? 0) + 1);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-headline-md text-primary mb-2">Clientes</h2>
          <p className="text-sm text-on-surface-variant">Gestión de clientes y contactos.</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      {showCreate && (
        <Card className="p-6">
          <CardHeader className="px-0 pb-4">
            <CardTitle className="text-headline-sm text-primary font-display">Nuevo cliente</CardTitle>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="c-name" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Nombre</Label>
              <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-phone" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Teléfono</Label>
              <Input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0412-1234567" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-email" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Email (opcional)</Label>
              <Input id="c-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c-notes" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Notas (opcional)</Label>
              <Input id="c-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Referencia..." />
            </div>
            <Button onClick={handleCreate} disabled={!name.trim() || !phone.trim()}>
              Guardar cliente
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="p-6">
        <CardHeader className="px-0 pb-4">
          <CardTitle className="text-headline-sm text-primary font-display">Lista de clientes</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          {!clients || clients.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No hay clientes registrados.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-low border-b border-border-subtle text-left text-on-surface-variant">
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Nombre</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Teléfono</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Último contacto</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Suscripción</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Órdenes mes</th>
                    <th className="py-4 px-6 font-semibold uppercase tracking-wider text-xs">Alerta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {clients
                    .filter((c) => !c.name.startsWith("[desactivado]"))
                    .map((client) => {
                      const alert = getClientAlert(client);
                      const sub = client.subscription;
                      const monthly = ordersThisMonthByPhone.get(client.phone) ?? 0;
                      return (
                        <tr key={client.phone} className="hover:bg-surface-container-low transition-colors">
                          <td className="py-4 px-6">
                            <Link to={`/admin/clientes/${client.phone}`} className="text-primary font-medium hover:underline">
                              {client.name}
                            </Link>
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant">{client.phone}</td>
                          <td className="py-4 px-6 text-on-surface-variant">
                            {lastContactMap.has(client.phone)
                              ? new Date(lastContactMap.get(client.phone)!).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="py-4 px-6 text-on-surface-variant">{sub ? `${sub.type} (${sub.monthlyQuota}/mes)` : "—"}</td>
                          <td className="py-4 px-6 text-on-surface-variant">{monthly}</td>
                          <td className="py-4 px-6">
                            {alert.show && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-urgency-alert">
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
    </div>
  );
}
