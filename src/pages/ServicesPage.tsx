import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { SERVICE_TYPES } from "@/lib/config/serviceTypes";
import { AlertTriangle, Check } from "lucide-react";

const SERVICE_UNITS: Record<string, string> = {
  ensayo: "por página",
  presentacion: "por diapositiva",
  investigacion: "tarifa base",
  formato: "por página",
  diseno: "por hora",
  video: "por minuto",
};

const SERVICE_RANGES: Record<string, string> = {
  ensayo: "$3–$5",
  presentacion: "$4–$6",
  investigacion: "$5",
  formato: "$2–$3",
  diseno: "$3–$5",
  video: "$8–$15",
};

const QUARTERLY_PLANS = [
  {
    name: "Básico",
    description: "Soporte esencial para tareas de escritura.",
    price: "Custom",
    features: [
      "Hasta 20 páginas de escritura",
      "Formato estándar",
      "2 rondas de correcciones",
    ],
    popular: false,
  },
  {
    name: "Pro",
    description: "Soporte equilibrado para trabajos estándar.",
    price: "Custom",
    features: [
      "Hasta 40 páginas de escritura",
      "5 presentaciones (diapositivas)",
      "Investigación prioritaria",
      "Correcciones ilimitadas",
    ],
    popular: true,
  },
  {
    name: "Creativo",
    description: "Enfocado en tareas multimedia y de diseño.",
    price: "Custom",
    features: [
      "15 horas de diseño gráfico",
      "30 mins de edición de video",
      "Plantillas premium de presentaciones",
    ],
    popular: false,
  },
  {
    name: "Full",
    description: "Cobertura integral para todas tus necesidades académicas.",
    price: "Custom",
    features: [
      "Páginas de escritura ilimitadas",
      "Presentaciones ilimitadas",
      "Gestor de cuenta dedicado",
      "Exención de tarifa de urgencia (1/mes)",
    ],
    popular: false,
  },
];

export function ServicesPage() {
  return (
    <LandingLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12">
        {/* Hero */}
        <h1 className="mb-2 font-display text-headline-lg font-bold text-primary leading-tight">
          Precios Transparentes para Tu Tranquilidad
        </h1>
        <p className="mb-12 max-w-2xl text-on-surface-variant text-base">
          Tarifas simples y predecibles para apoyo académico de calidad. Elige
          servicios individuales o un plan trimestral completo para reducir tu
          carga de trabajo.
        </p>

        {/* Individual Services */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-headline-sm text-primary font-semibold">
            Servicios Individuales
          </h2>
          <span className="inline-flex items-center gap-1.5 bg-error-container text-urgency-alert rounded-full px-3 py-1.5 text-sm font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Tarifa de urgencia (+50%) en pedidos con menos de 48h
          </span>
        </div>

        <div className="mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICE_TYPES.map((s) => (
            <div
              key={s.id}
              className="bg-surface-container-lowest rounded-xl border border-border-subtle p-6 flex flex-col gap-3 hover:shadow-ambient-hover transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-secondary-container flex items-center justify-center">
                  <s.icon className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary font-display">
                    {SERVICE_RANGES[s.id]}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {SERVICE_UNITS[s.id]}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-semibold text-primary">{s.label}</p>
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quarterly Plans */}
        <h2 className="font-display text-headline-sm text-primary font-semibold mb-2">
          Planes Trimestrales
        </h2>
        <h3>Proximamente</h3>
        {/* <p className="mb-8 text-on-surface-variant">
          Combina servicios y ahorra durante el periodo académico.
        </p> */}

        {/* <div className="mb-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {QUARTERLY_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-surface-container-lowest rounded-xl p-6 flex flex-col ${
                plan.popular
                  ? "border-2 border-secondary shadow-ambient"
                  : "border border-border-subtle"
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-secondary text-on-secondary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Más popular
                </span>
              )}
              <h3 className="font-display text-lg font-bold text-primary">
                {plan.name}
              </h3>
              <p className="text-sm text-on-surface-variant mt-1 mb-4 min-h-[40px]">
                {plan.description}
              </p>
              <p className="font-display text-2xl font-bold text-primary">
                {plan.price}
              </p>
              <p className="text-xs text-on-surface-variant uppercase tracking-wider mb-4">
                Facturado trimestralmente
              </p>
              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-primary">
                    <Check className="w-4 h-4 text-secondary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/delegar"
                className={`inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-semibold transition-all shadow-ambient hover:shadow-ambient-hover ${
                  plan.popular
                    ? "bg-secondary text-on-secondary hover:bg-secondary/90"
                    : "bg-transparent border-2 border-secondary text-secondary hover:bg-secondary-container"
                }`}
              >
                Seleccionar {plan.name}
              </Link>
            </div>
          ))}
        </div> */}

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/delegar"
            className="inline-flex items-center gap-2 rounded-lg bg-secondary px-8 py-3 text-sm font-semibold text-on-secondary transition-all hover:bg-secondary/90 shadow-ambient hover:shadow-ambient-hover"
          >
            Solicitar ahora
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
}
