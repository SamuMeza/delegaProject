import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useClient, useClientSubscriptions } from "@/hooks/useDatabase";

import { db } from "@/lib/db/delegaDb";
import { generateSubscriptionId } from "@/lib/id-gen";
import type { SubscriptionType } from "@/lib/types";

export function ClientDetailPage() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const client = useClient(phone);
  const subscriptions = useClientSubscriptions(phone);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showCreateSub, setShowCreateSub] = useState(false);
  const [subType, setSubType] = useState<SubscriptionType>("basico");
  const [subStartDate, setSubStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [subQuota, setSubQuota] = useState(5);
  const [subPrice, setSubPrice] = useState(25);

  if (!client) {
    return (
      <main className="p-8">
        <p className="text-sm text-on-surface-variant">Cargando cliente…</p>
      </main>
    );
  }

  if (!editing && name === "" && email === "" && notes === "") {
    setName(client.name);
    setEmail(client.email ?? "");
    setNotes(client.notes ?? "");
  }

  async function handleSave() {
    if (!name.trim()) return;
    await db.clients.put({
      ...client,
      name: name.trim(),
      email: email.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    await db.activity_log.add({
      id: `LOG-${Date.now()}`,
      operatorId: "operator",
      action: "update_client",
      targetId: client.phone,
      details: `Cliente ${name.trim()} actualizado`,
      timestamp: new Date().toISOString(),
    });
    setEditing(false);
  }

  async function handleDeactivate() {
    if (activeSub) {
      window.alert("No se puede desactivar un cliente con una suscripción activa. Cancela la suscripción primero.");
      return;
    }
    const confirmed = window.confirm("¿Desactivar este cliente? No se eliminarán sus órdenes ni suscripciones.");
    if (!confirmed) return;
    await db.clients.update(client.phone, { name: `[desactivado] ${client.name}` });
    navigate("/admin/clientes");
  }

  async function handleCancelSubscription(subId: string) {
    const confirmed = window.confirm("¿Cancelar esta suscripción?");
    if (!confirmed) return;
    await db.subscriptions.update(subId, { status: "cancelada" });
    if (client.subscription) {
      await db.clients.update(client.phone, { subscription: null });
    }
    await db.activity_log.add({
      id: `LOG-${Date.now()}`,
      operatorId: "operator",
      action: "cancel_subscription",
      targetId: subId,
      details: `Suscripción ${subId} cancelada`,
      timestamp: new Date().toISOString(),
    });
  }

  const activeSub = subscriptions?.find((s) => s.status === "activa");
  const sortedSubs = subscriptions
    ? [...subscriptions].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    : [];

  async function handleRenew(subId: string) {
    const sub = subscriptions?.find((s) => s.id === subId);
    if (!sub) return;
    const now = new Date();
    const currentEnd = new Date(sub.endDate);
    const startDate = currentEnd > now
      ? new Date(currentEnd.getTime() + 86400000).toISOString().split("T")[0]
      : now.toISOString().split("T")[0];
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);
    const endStr = endDate.toISOString().split("T")[0];

    const config = await db.config.get("app");
    const nextCounter = (config?.subscriptionCounter ?? 0) + 1;
    const newId = `SUB-${String(nextCounter).padStart(3, "0")}`;

    await db.transaction("rw", db.subscriptions, db.clients, db.config, async () => {
      await db.subscriptions.update(subId, { status: "reemplazada" });
      await db.subscriptions.add({
        id: newId,
        clientPhone: client.phone,
        type: sub.type,
        startDate,
        endDate: endStr,
        price: sub.price,
        status: "activa",
        monthlyQuota: sub.monthlyQuota,
        usedPerMonth: {},
      });
      await db.clients.update(client.phone, {
        subscription: {
          type: sub.type,
          startDate,
          endDate: endStr,
          price: sub.price,
          status: "activa",
          monthlyQuota: sub.monthlyQuota,
          usedPerMonth: {},
        },
      });
      await db.config.update("app", { subscriptionCounter: nextCounter });
    });
    await db.activity_log.add({
      id: `LOG-${Date.now()}`,
      operatorId: "operator",
      action: "renew_subscription",
      targetId: newId,
      details: `Suscripción ${newId} renovada hasta ${endStr}`,
      timestamp: new Date().toISOString(),
    });
  }

  async function handleCreateSubscription() {
    const startDate = subStartDate;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);
    const endStr = endDate.toISOString().split("T")[0];

    const newId = await generateSubscriptionId();

    await db.transaction("rw", db.subscriptions, db.clients, db.config, async () => {
      const existingActive = subscriptions?.find((s) => s.status === "activa");
      if (existingActive) {
        await db.subscriptions.update(existingActive.id, { status: "reemplazada" });
      }
      await db.subscriptions.add({
        id: newId,
        clientPhone: client.phone,
        type: subType,
        startDate,
        endDate: endStr,
        price: subPrice,
        status: "activa",
        monthlyQuota: subQuota,
        usedPerMonth: {},
      });
      await db.clients.update(client.phone, {
        subscription: {
          type: subType,
          startDate,
          endDate: endStr,
          price: subPrice,
          status: "activa",
          monthlyQuota: subQuota,
          usedPerMonth: {},
        },
      });
    });
    await db.activity_log.add({
      id: `LOG-${Date.now()}`,
      operatorId: "operator",
      action: "create_subscription",
      targetId: newId,
      details: `Suscripción ${newId} creada para ${client.name}`,
      timestamp: new Date().toISOString(),
    });
    setShowCreateSub(false);
    setSubStartDate(new Date().toISOString().split("T")[0]);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/clientes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="font-display text-headline-md text-primary">{client.name}</h2>
      </div>

      <Card className="p-6">
        <CardHeader className="px-0 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-headline-sm text-primary font-display">Datos del cliente</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                <Pencil className="h-4 w-4" />
                {editing ? "Cancelar" : "Editar"}
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeactivate}>
                <Trash2 className="h-4 w-4" />
                Desactivar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <div className="grid gap-1">
            <span className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Teléfono</span>
            <span className="text-sm text-on-surface">{client.phone}</span>
          </div>
          {editing ? (
            <>
              <div className="grid gap-2">
                <Label htmlFor="e-name">Nombre</Label>
                <Input id="e-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="e-email">Email (opcional)</Label>
                <Input id="e-email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="e-notes">Notas (opcional)</Label>
                <Input id="e-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button onClick={handleSave} disabled={!name.trim()}>Guardar cambios</Button>
            </>
          ) : (
            <>
              <div className="grid gap-1">
                <span className="text-xs text-on-surface-variant">Nombre</span>
                <span className="text-sm">{client.name}</span>
              </div>
              {client.email && (
                <div className="grid gap-1">
                  <span className="text-xs text-on-surface-variant">Email</span>
                  <span className="text-sm">{client.email}</span>
                </div>
              )}
              {client.notes && (
                <div className="grid gap-1">
                  <span className="text-xs text-on-surface-variant">Notas</span>
                  <span className="text-sm">{client.notes}</span>
                </div>
              )}
              <div className="grid gap-1">
                <span className="text-xs text-on-surface-variant">Total órdenes</span>
                <span className="text-sm">{client.totalOrders}</span>
              </div>
              <div className="grid gap-1">
                <span className="text-xs text-on-surface-variant">Total gastado</span>
                <span className="text-sm">${client.totalSpent.toFixed(2)}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Suscripciones</CardTitle>
              <CardDescription>
                {activeSub
                  ? `Suscripción activa: ${activeSub.type} — ${activeSub.monthlyQuota} órdenes/mes — vence ${activeSub.endDate}`
                  : "Sin suscripción activa"}
              </CardDescription>
            </div>
            {!showCreateSub && (
              <Button variant="outline" size="sm" onClick={() => setShowCreateSub(true)}>
                <Plus className="h-4 w-4" />
                Crear suscripción
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showCreateSub && (
            <Card>
              <CardHeader>
                <CardTitle>Nueva suscripción trimestral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="sub-type">Tipo</Label>
                  <Select value={subType} onValueChange={(v) => setSubType(v as SubscriptionType)}>
                    <SelectTrigger id="sub-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="creativo">Creativo</SelectItem>
                      <SelectItem value="full">Full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sub-start">Fecha de inicio</Label>
                  <Input id="sub-start" type="date" value={subStartDate} onChange={(e) => setSubStartDate(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sub-quota">Cupo mensual</Label>
                  <Input id="sub-quota" type="number" min={1} value={subQuota} onChange={(e) => setSubQuota(Number(e.target.value))} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sub-price">Precio ($)</Label>
                  <Input id="sub-price" type="number" min={0} value={subPrice} onChange={(e) => setSubPrice(Number(e.target.value))} />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateSubscription}>Guardar suscripción</Button>
                  <Button variant="ghost" onClick={() => setShowCreateSub(false)}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}
          {sortedSubs.length === 0 && !showCreateSub ? (
            <p className="text-sm text-on-surface-variant">Sin suscripciones registradas.</p>
          ) : (
            <div className="space-y-3">
              {sortedSubs.map((sub) => {
                const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
                const used = sub.usedPerMonth[key] ?? 0;
                return (
                  <div key={sub.id} className="rounded-md border p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{sub.id}</span>
                        <span className={`ml-2 text-xs font-medium ${sub.status === "activa" ? "text-brand-operator-2" : sub.status === "vencida" ? "text-error" : "text-on-surface-variant"}`}>
                          {sub.status === "activa" ? "Activa" : sub.status === "vencida" ? "Vencida" : sub.status === "cancelada" ? "Cancelada" : "Reemplazada"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {sub.status === "activa" && (() => {
                          const left = Math.ceil((new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return left <= 30;
                        })() && (
                          <Button variant="outline" size="sm" onClick={() => handleRenew(sub.id)}>
                            Renovar
                          </Button>
                        )}
                        {(sub.status === "activa" || sub.status === "vencida") && (
                          <Button variant="destructive" size="sm" onClick={() => handleCancelSubscription(sub.id)}>
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                      <span>Tipo: {sub.type}</span>
                      <span>Cupo: {used}/{sub.monthlyQuota} usados este mes</span>
                      <span>Inicio: {new Date(sub.startDate).toLocaleDateString()}</span>
                      <span>Vence: {new Date(sub.endDate).toLocaleDateString()}</span>
                      <span>Precio: ${sub.price.toFixed(2)}</span>
                      <span>Próxima renovación: {new Date(sub.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de órdenes</CardTitle>
        </CardHeader>
        <CardContent>
          <OrderHistory clientPhone={client.phone} />
        </CardContent>
      </Card>
    </div>
  );
}

function OrderHistory({ clientPhone }: { clientPhone: string }) {
  const [orders, setOrders] = useState<Array<{ id: string; serviceType: string; status: string; price: number; createdAt: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  useState(() => {
    db.orders
      .where("clientPhone")
      .equals(clientPhone)
      .toArray()
      .then((result) => {
        setOrders(
          result
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((o) => ({ id: o.id, serviceType: o.serviceType, status: o.status, price: o.price, createdAt: o.createdAt })),
        );
        setLoaded(true);
      });
  });

  if (!loaded) return <p className="text-sm text-on-surface-variant">Cargando…</p>;

  if (orders.length === 0) {
    return <p className="text-sm text-on-surface-variant">Sin órdenes registradas.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-on-surface-variant">
            <th className="pb-2 font-medium">ID</th>
            <th className="pb-2 font-medium">Servicio</th>
            <th className="pb-2 font-medium">Estado</th>
            <th className="pb-2 font-medium">Precio</th>
            <th className="pb-2 font-medium">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-b">
              <td className="py-1.5">{o.id}</td>
              <td className="py-1.5">{o.serviceType}</td>
              <td className="py-1.5">{o.status}</td>
              <td className="py-1.5">${o.price.toFixed(2)}</td>
              <td className="py-1.5">{new Date(o.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}