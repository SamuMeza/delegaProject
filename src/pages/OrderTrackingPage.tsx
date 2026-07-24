import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { decodeTrackingToken, type TrackingTokenPayload } from "@/lib/tracking";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  nueva: "Recibida",
  pendiente_pago: "Pendiente de pago",
  en_progreso: "En progreso",
  revision: "En revisión",
  pendiente_final: "Pendiente final",
  completada: "Completada",
  cancelada: "Cancelada",
};

const TIMELINE_ORDER = [
  "nueva",
  "pendiente_pago",
  "en_progreso",
  "revision",
  "pendiente_final",
  "completada",
];

function Timeline({ currentStatus }: { currentStatus: string }) {
  const isCancelled = currentStatus === "cancelada";
  const currentIdx = TIMELINE_ORDER.indexOf(currentStatus);

  return (
    <div
      role="progressbar"
      aria-valuenow={isCancelled ? TIMELINE_ORDER.length : currentIdx + 1}
      aria-valuemin={0}
      aria-valuemax={TIMELINE_ORDER.length}
      aria-label="Progreso de la orden"
      className="space-y-2"
    >
      {TIMELINE_ORDER.map((s, i) => {
        const idx = TIMELINE_ORDER.indexOf(currentStatus);
        const done = i <= idx && !isCancelled;
        return (
          <div key={s} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                done ? "bg-secondary text-white" : i === idx + 1 && !isCancelled
                  ? "border-2 border-secondary bg-white text-secondary"
                  : "border-2 border-border bg-white text-muted-foreground",
              )}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                done
                  ? "font-medium text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {STATUS_LABELS[s] ?? s}
            </span>
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-bold text-white">
            ✕
          </div>
          <span className="text-sm font-medium text-destructive">
            {STATUS_LABELS.cancelada} — Esta orden fue cancelada
          </span>
        </div>
      )}
    </div>
  );
}

export function OrderTrackingPage() {
  const { token } = useParams<{ token: string }>();
  const [payload, setPayload] = useState<TrackingTokenPayload | null>(null);
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setLoading(false);
        return;
      }
      const result = await decodeTrackingToken(token);
      setPayload(result.payload);
      setValid(result.valid);
      setLoading(false);
    }
    verify();
  }, [token]);

  if (loading) {
    return (
      <LandingLayout>
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Verificando enlace…</p>
        </div>
      </LandingLayout>
    );
  }

  if (!valid || !payload) {
    return (
      <LandingLayout>
        <div className="mx-auto max-w-md py-20 text-center">
          <h1 className="mb-4 text-headline-md font-bold text-destructive">
            Enlace no válido
          </h1>
          <p className="text-muted-foreground">
            Este enlace de seguimiento no es válido o ha sido alterado. Por favor,
            solicita un nuevo enlace al operador que te atendió.
          </p>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="mx-auto max-w-lg">
        <h1 className="mb-2 text-headline-md font-bold text-primary">
          Seguimiento de orden
        </h1>
        <p className="mb-8 text-muted-foreground">
          Estado actualizado de tu solicitud.
        </p>

        {/* Order details card */}
        <div className="mb-8 rounded-xl border border-border bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">ID de orden</p>
              <p className="font-medium">{payload.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cliente</p>
              <p className="font-medium">{payload.clientName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Servicio</p>
              <p className="font-medium capitalize">{payload.serviceType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Precio</p>
              <p className="font-medium">${payload.price}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estado</p>
              <p className="font-medium">
                {STATUS_LABELS[payload.status] ?? payload.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha de entrega</p>
              <p className="font-medium">
                {payload.dueDate || "Por confirmar"}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-muted-foreground">Descripción</p>
            <p className="text-sm text-muted-foreground">{payload.description}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="rounded-xl border border-border bg-white p-6">
          <h2 className="mb-4 font-semibold">Progreso</h2>
          <Timeline currentStatus={payload.status} />
        </div>
      </div>
    </LandingLayout>
  );
}