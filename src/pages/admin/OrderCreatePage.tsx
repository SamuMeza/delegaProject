import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardPaste, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OrderDetailsFields } from "@/components/OrderDetailsFields";
import { useAuth } from "@/hooks/useAuth";
import { useConfig } from "@/hooks/useDatabase";

import { createOrder } from "@/lib/orders/service";
import { parseWhatsApp } from "@/lib/orders/parseWhatsApp";
import { defaultOrderDetails, SERVICE_TYPE_LABELS } from "@/lib/orders/ui";
import type { OrderDetails, ServiceType } from "@/lib/types";

const SERVICE_TYPES = Object.keys(SERVICE_TYPE_LABELS) as ServiceType[];

function mapParamsToDetails(
  serviceType: ServiceType,
  params: Record<string, string>,
  description: string,
): OrderDetails {
  const base = defaultOrderDetails(serviceType);

  switch (serviceType) {
    case "ensayo": {
      const paginas = params.pageRange ?? params.paginas ?? base.paginas;
      return {
        ...base,
        tema: params.topic ?? params.tema ?? description,
        paginas: paginas as OrderDetails["paginas"],
        normas: (params.citationStyle ?? params.normas ?? base.normas) as OrderDetails["normas"],
      };
    }
    case "presentacion": {
      const diapositivas = params.slideCount ?? params.diapositivas ?? base.diapositivas;
      return {
        ...base,
        tema: params.topic ?? params.tema ?? description,
        diapositivas: diapositivas as OrderDetails["diapositivas"],
        estilo: (params.audienceLevel ?? params.estilo ?? base.estilo) as OrderDetails["estilo"],
      };
    }
    case "investigacion": {
      const fuentes = params.sourceCount ?? params.fuentesMinimas ?? base.fuentesMinimas;
      return {
        ...base,
        tema: params.topic ?? params.tema ?? description,
        fuentesMinimas: fuentes as OrderDetails["fuentesMinimas"],
      };
    }
    case "formato": {
      return {
        ...base,
        norma: (params.formatType ?? params.norma ?? base.norma) as OrderDetails["norma"],
        tipoDocumento: (params.documentType ?? params.tipoDocumento ?? base.tipoDocumento) as OrderDetails["tipoDocumento"],
      };
    }
    case "diseno": {
      return {
        ...base,
        tipoDiseno: (params.designType ?? params.tipoDiseno ?? base.tipoDiseno) as OrderDetails["tipoDiseno"],
        proposito: params.purpose ?? params.proposito ?? description,
        colores: params.colorScheme ?? params.colores,
      };
    }
    case "video": {
      return {
        ...base,
        duracion: (params.duration ?? params.duracion ?? base.duracion) as OrderDetails["duracion"],
        tipoVideo: (params.style ?? params.tipoVideo ?? base.tipoVideo) as OrderDetails["tipoVideo"],
      };
    }
    default:
      return base;
  }
}

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

  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  function handleServiceChange(s: ServiceType) {
    setServiceType(s);
    setDetails(defaultOrderDetails(s));
  }

  function handleImport() {
    setImportError(null);
    setImportSuccess(false);

    const parsed = parseWhatsApp(importText);
    if (!parsed) {
      setImportError("No se pudo parsear el mensaje. Asegúrate de copiar el mensaje completo de WhatsApp.");
      return;
    }

    setClientName(parsed.clientName);
    setClientPhone(parsed.clientPhone);
    setServiceType(parsed.serviceType);
    setPrice(String(parsed.price));
    setDetails(mapParamsToDetails(parsed.serviceType, parsed.parameters, parsed.description));
    setImportSuccess(true);
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
    <div className="mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={() => navigate("/admin/ordenes")}
        className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a órdenes
      </button>

      <div>
        <h2 className="font-display text-headline-md text-primary mb-2">Nueva orden</h2>
        <p className="text-sm text-on-surface-variant">
          Asignación automática por tipo de servicio
          {config?.serviceOperatorMap
            ? ` (${SERVICE_TYPE_LABELS[serviceType]} → ${config.serviceOperatorMap[serviceType]})`
            : ""}
          .
        </p>
      </div>

      {/* WhatsApp Import */}
      <details className="bg-surface-container rounded-xl p-4">
        <summary className="cursor-pointer flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
          <ClipboardPaste className="w-4 h-4" />
          Importar mensaje de WhatsApp
        </summary>
        <div className="mt-3 space-y-3">
          <Textarea
            placeholder={"Pega aquí el mensaje completo de WhatsApp.\nEjemplo:\n👤 Cliente: María Pérez\n📞 Contacto: 584167050424\n🎓 Servicio: ensayo\n..."}
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportError(null);
              setImportSuccess(false);
            }}
            rows={6}
          />
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={handleImport}>
              Importar datos
            </Button>
            {importSuccess && (
              <span className="flex items-center gap-1 text-sm text-secondary">
                <CheckCircle className="w-4 h-4" />
                Datos importados correctamente
              </span>
            )}
            {importError && (
              <span className="text-sm text-error">{importError}</span>
            )}
          </div>
        </div>
      </details>

      <form onSubmit={handleSubmit} className="space-y-5 bg-surface-container-lowest rounded-xl shadow-ambient p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="clientName" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Nombre del cliente *</Label>
            <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="clientPhone" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Teléfono *</Label>
            <Input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} required />
          </div>
        </div>

        <div>
          <Label htmlFor="serviceType" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Tipo de servicio *</Label>
          <Select value={serviceType} onValueChange={(v) => handleServiceChange(v as ServiceType)}>
            <SelectTrigger id="serviceType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SERVICE_TYPES.map((s) => (
                <SelectItem key={s} value={s}>
                  {SERVICE_TYPE_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <fieldset className="rounded-lg border border-border-subtle p-4">
          <legend className="px-2 text-sm font-semibold text-on-surface">Detalles del servicio</legend>
          <OrderDetailsFields serviceType={serviceType} value={details} onChange={setDetails} />
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="dueDate" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Fecha límite</Label>
            <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="price" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Precio (USD) *</Label>
            <Input id="price" type="number" min="0" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} required />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="paidAmount" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Monto pagado (Pago Móvil)</Label>
            <Input id="paidAmount" type="number" min="0" step="0.5" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="paymentRef" className="text-sm font-semibold text-on-surface uppercase tracking-wider">Referencia de pago</Label>
            <Input id="paymentRef" value={paymentRef} onChange={(e) => setPaymentRef(e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-on-surface">
          <input type="checkbox" checked={urgent} onChange={(e) => setUrgent(e.target.checked)} className="rounded" />
          Marcar como urgente
        </label>

        {error && (
          <p className="rounded-lg bg-error-container/10 px-3 py-2 text-sm text-error" role="alert">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={submitting}>
            {submitting ? "Guardando..." : "Crear orden"}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate("/admin/ordenes")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
