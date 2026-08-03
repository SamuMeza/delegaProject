import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { SERVICE_TYPES } from "@/lib/config/serviceTypes";
import { AlertTriangle } from "lucide-react";

export function ServicesPage() {
  return (
    <LandingLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12">
        <h1 className="mb-2 font-display text-headline-md text-primary">
          Servicios
        </h1>
        <p className="mb-8 text-on-surface-variant">
          Todos nuestros servicios académicos y de diseño, con precios transparentes
          desde $3.
        </p>

        {/* Section header with urgency badge */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-headline-sm text-primary font-semibold">
            Servicios Individuales
          </h2>
          <span className="inline-flex items-center gap-1.5 bg-error-container text-urgency-alert rounded-full px-3 py-1.5 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Tarifa de urgencia (+50%) aplica a pedidos con menos de 48h
          </span>
        </div>

        <div className="mb-12 grid gap-4">
          {SERVICE_TYPES.map((s) => (
            <div
              key={s.id}
              className="bg-surface-container-lowest rounded-xl shadow-ambient hover:shadow-ambient-hover transition-shadow flex flex-col gap-2 p-6 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold capitalize text-primary">{s.label}</h3>
                <p className="text-sm text-on-surface-variant">{s.description}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-secondary font-display">Desde ${s.basePrice}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Quarterly plan */}
        <div className="mb-12 rounded-xl border border-border-subtle bg-surface-container-lowest p-8 text-center shadow-ambient">
          <h2 className="font-display text-headline-sm text-primary font-bold">
            Suscripción trimestral
          </h2>
          <p className="my-2 text-on-surface-variant">
            Ideal para estudiantes con carga constante de trabajos
          </p>
          <p className="text-3xl font-bold text-secondary font-display">~$25</p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Por 3 meses — hasta 4 tareas al mes
          </p>
        </div>

        <div className="text-center">
          <Link
            to="/delegar"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 text-sm font-semibold text-on-secondary transition-all hover:bg-secondary/90 shadow-ambient hover:shadow-ambient-hover"
          >
            Solicitar ahora
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
}
