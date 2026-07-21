import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { OrderDetailsFields } from "@/components/OrderDetailsFields";
import { useAuth } from "@/hooks/useAuth";
import { useConfig } from "@/hooks/useDelegaDB";
import { createOrder } from "@/lib/orders/service";
import { defaultOrderDetails, SERVICE_TYPE_LABELS } from "@/lib/orders/ui";
import type { OrderDetails, ServiceType } from "@/lib/types";

const SERVICE_TYPES = Object.keys(SERVICE_TYPE_LABELS) as ServiceType[];

export function OrderCreatePage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const config = useConfig();

  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType>("ensayo");
  const [details, setDetails] = useState<OrderDetails>(defaultOrderDetails("ensayo"));
  const [dueDate, setDueDate] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [price, setPrice] = useState("3");
  const [paidAmount, setPaidAmount] = useState("0");
  const [paymentRef, setPaymentRef] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleServiceChange(s: ServiceType) {
    setServiceType(s);
    setDetails(defaultOrderDetails(s));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Nombre y teléfono del cliente son obligatorios.");
      return;
    }
    if (!session) {
      setError("Sesión no activa.");
      return;
    }
    setSubmitting(true);
    try {
      const id = await createOrder(
        {
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          serviceType,
          details,
          dueDate: dueDate || null,
          urgent,
          price: Number(price) || 0,
          paidAmount: Number(paidAmount) || 0,
          paymentRef: paymentRef.trim(),
        },
        session.operatorId,
      );
      navigate(`/admin/ordenes/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la orden.");
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-8">
      <button
        type="button"
        onClick={() => navigate("/admin/ordenes")}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a órdenes
      </button>

      <h1 className="text-2xl font-semibold">Nueva orden</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Asignación automática por tipo de servicio
        {config?.serviceOperatorMap
          ? ` (${SERVICE_TYPE_LABELS[serviceType]} → ${config.serviceOperatorMap[serviceType]})`
          : ""}
        .
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="clientName">Nombre del cliente *</Label>
            <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="clientPhone">Teléfono *</Label>
            <Input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required />
          </div>
        </div>

        <div>
          <Label htmlFor="serviceType">Tipo de servicio *</Label>
          <Select id="serviceType" value={serviceType} onValueChange={(v) => handleServiceChange(v as ServiceType)}>
            {SERVICE_TYPES.map((s) => (
              <option key={s} value={s}>
                {SERVICE_TYPE_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>

        <fieldset className="rounded-lg border p-4">
          <legend className="px-2 text-sm font-medium">Detalles del servicio</legend>
          <OrderDetailsFields serviceType={serviceType} value={details} onChange={setDetails} />
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dueDate">Fecha límite</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="price">Precio (USD) *</Label>
            <Input id="price" type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="paidAmount">Monto pagado (Pago Móvil)</Label>
            <Input id="paidAmount" type="number" min="0" step="0.5" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="paymentRef">Referencia de pago</Label>
            <Input id="paymentRef" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} />
          Marcar como urgente
        </label>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando…" : "Crear orden"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/ordenes")}>
            Cancelar
          </Button>
        </div>
      </form>
    </main>
  );
}
