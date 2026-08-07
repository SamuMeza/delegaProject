import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useClient, useClientSubscriptions } from "@/hooks/useDatabase";
import { useAuth } from "@/hooks/useAuth";
import { logActivity } from "@/lib/db/activity";
import { supabase } from "@/lib/supabase";
import { generateSubscriptionId } from "@/lib/id-gen";
import type { SubscriptionType } from "@/lib/types";

export function ClientDetailPage() {
  const { phone } = useParams<{ phone: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const { data: client, refetch: refetchClient } = useClient(phone);
  const { data: subscriptions, refetch: refetchSubs } = useClientSubscriptions(phone);
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
    try {
      const { error } = await supabase
        .from("clients")
        .update({
          name: name.trim(),
          email: email.trim() || null,
          notes: notes.trim() || null,
        })
        .eq("phone", client.phone);
      if (error) {
        console.error("Error updating client:", error);
        return;
      }
      await logActivity({
        operatorId: session.operatorId,
        action: "update_client",
        targetId: client.phone,
        details: `Cliente ${name.trim()} actualizado`,
      });
      setEditing(false);
      refetchClient();
    } catch (e) {
      console.error("Error en handleSave:", e);
    }
  }

  async function handleDeactivate() {
    if (activeSub) {
      window.alert("No se puede desactivar un cliente con una suscripción activa. Cancela la suscripción primero.");
      return;
    }
    const confirmed = window.confirm("¿Desactivar este cliente? No se eliminarán sus órdenes ni suscripciones.");
    if (!confirmed) return;
    await supabase
      .from("clients")
      .update({ name: `[desactivado] ${client.name}` })
      .eq("phone", client.phone);
    navigate("/admin/clientes");
  }

  async function handleCancelSubscription(subId: string) {
    const confirmed = window.confirm("¿Cancelar esta suscripción?");
    if (!confirmed) return;
    await supabase
      .from("subscriptions")
      .update({ status: "cancelada" })
      .eq("id", subId);
    if (client.subscription) {
      await supabase
        .from("clients")
        .update({ subscription: null })
        .eq("phone", client.phone);
    }
    await logActivity({
      operatorId: session.operatorId,
      action: "cancel_subscription",
      targetId: subId,
      details: `Suscripción ${subId} cancelada`,
    });
    refetchSubs();
    refetchClient();
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

    const { data: config } = await supabase
      .from("config")
      .select("subscription_counter")
      .eq("id", "app")
      .maybeSingle();

    const nextCounter = (config?.subscription_counter ?? 0) + 1;
    const newId = `SUB-${String(nextCounter).padStart(3, "0")}`;

    await supabase
      .from("subscriptions")
      .update({ status: "reemplazada" })
      .eq("id", subId);

    await supabase.from("subscriptions").insert({
      id: newId,
      client_phone: client.phone,
      type: sub.type,
      start_date: startDate,
      end_date: endStr,
      price: sub.price,
      status: "activa",
      monthly_quota: sub.monthlyQuota,
      used_per_month: {},
    });

    await supabase
      .from("clients")
      .update({
        subscription: {
          type: sub.type,
          startDate,
          endDate: endStr,
          price: sub.price,
          status: "activa",
          monthlyQuota: sub.monthlyQuota,
          usedPerMonth: {},
        },
      })
      .eq("phone", client.phone);

    await supabase
      .from("config")
      .update({ subscription_counter: nextCounter })
      .eq("id", "app");

    await logActivity({
      operatorId: session.operatorId,
      action: "renew_subscription",
      targetId: newId,
      details: `Suscripción ${newId} renovada hasta ${endStr}`,
    });
    refetchSubs();
    refetchClient();
  }

  async function handleCreateSubscription() {
    const startDate = subStartDate;
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 3);
    const endStr = endDate.toISOString().split("T")[0];

    const newId = await generateSubscriptionId();

    const existingActive = subscriptions?.find((s) => s.status === "activa");
    if (existingActive) {
      await supabase
        .from("subscriptions")
        .update({ status: "reemplazada" })
        .eq("id", existingActive.id);
    }

    await supabase.from("subscriptions").insert({
      id: newId,
      client_phone: client.phone,
      type: subType,
      start_date: startDate,
      end_date: endStr,
      price: subPrice,
      status: "activa",
      monthly_quota: subQuota,
      used_per_month: {},
    });

    await supabase
      .from("clients")
      .update({
        subscription: {
          type: subType,
          startDate,
          endDate: endStr,
          price: subPrice,
          status: "activa",
          monthlyQuota: subQuota,
          usedPerMonth: {},
        },
      })
      .eq("phone", client.phone);

    await logActivity({
      operatorId: session.operatorId,
      action: "create_subscription",
      targetId: newId,
      details: `Suscripción ${newId} creada para ${client.name}`,
    });
    setShowCreateSub(false);
    setSubStartDate(new Date().toISOString().split("T")[0]);
    refetchSubs();
    refetchClient();
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
  const [orders, setOrders] = useState<Array<{ id: string; service_type: string; status: string; price: number; created_at: string }>>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase
      .from("orders")
      .select("id, service_type, status, price, created_at")
      .eq("client_phone", clientPhone)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoaded(true);
      });
  }, [clientPhone]);

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
              <td className="py-1.5">{o.service_type}</td>
              <td className="py-1.5">{o.status}</td>
              <td className="py-1.5">${o.price.toFixed(2)}</td>
              <td className="py-1.5">{new Date(o.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
