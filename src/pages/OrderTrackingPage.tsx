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
                done ? "bg-secondary text-on-secondary" : i === idx + 1 && !isCancelled
                  ? "border-2 border-secondary bg-surface-container-lowest text-secondary"
                  : "border-2 border-border-subtle bg-surface-container-lowest text-on-surface-variant",
              )}
            >
              {done ? "✓" : i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                done
                  ? "font-medium text-on-surface"
                  : "text-on-surface-variant",
              )}
            >
              {STATUS_LABELS[s] ?? s}
            </span>
          </div>
        );
      })}
      {isCancelled && (
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-error text-xs font-bold text-on-error">
            ✕
          </div>
          <span className="text-sm font-medium text-error">
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
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-20">
          <div className="flex items-center justify-center">
            <p className="text-on-surface-variant">Verificando enlace...</p>
          </div>
        </div>
      </LandingLayout>
    );
  }

  if (!valid || !payload) {
    return (
      <LandingLayout>
        <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-20">
          <div className="mx-auto max-w-md text-center">
            <h1 className="mb-4 font-display text-headline-md text-error">
              Enlace no válido
            </h1>
            <p className="text-on-surface-variant">
              Este enlace de seguimiento no es válido o ha sido alterado. Por favor,
              solicita un nuevo enlace al operador que te atendió.
            </p>
          </div>
        </div>
      </LandingLayout>
    );
  }

  return (
    <LandingLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12">
        <div className="mx-auto max-w-lg">
          <h1 className="mb-2 font-display text-headline-md text-primary">
            Seguimiento de orden
          </h1>
          <p className="mb-8 text-on-surface-variant">
            Estado actualizado de tu solicitud.
          </p>

          {/* Order details card */}
          <div className="mb-8 bg-surface-container-lowest rounded-xl shadow-ambient p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">ID de orden</p>
                <p className="font-medium text-on-surface">{payload.id}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Cliente</p>
                <p className="font-medium text-on-surface">{payload.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Servicio</p>
                <p className="font-medium capitalize text-on-surface">{payload.serviceType}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Precio</p>
                <p className="font-medium text-on-surface">${payload.price}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Estado</p>
                <p className="font-medium text-on-surface">
                  {STATUS_LABELS[payload.status] ?? payload.status}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Fecha de entrega</p>
                <p className="font-medium text-on-surface">
                  {payload.dueDate || "Por confirmar"}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Descripción</p>
              <p className="text-sm text-on-surface-variant">{payload.description}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6">
            <h2 className="mb-4 font-semibold text-primary">Progreso</h2>
            <Timeline currentStatus={payload.status} />
          </div>
        </div>
      </div>
    </LandingLayout>
  );
}
