import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { SERVICE_TYPES } from "@/lib/config/serviceTypes";

export function ServicesPage() {
  return (
    <LandingLayout>
      <h1 className="mb-2 text-headline-md font-bold text-primary">
        Servicios
      </h1>
      <p className="mb-8 text-muted-foreground">
        Todos nuestros servicios académicos y de diseño, con precios transparentes
        desde $3.
      </p>

      <div className="mb-12 grid gap-4">
        {SERVICE_TYPES.map((s) => (
          <div
            key={s.id}
            className="flex flex-col gap-2 rounded-xl border border-border bg-white p-6 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold capitalize">{s.label}</h2>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-secondary">Desde ${s.basePrice}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quarterly plan */}
      <div className="mb-12 rounded-xl border border-secondary/20 bg-secondary/5 p-6 text-center">
        <h2 className="text-headline-sm font-bold text-primary">
          Suscripción trimestral
        </h2>
        <p className="my-2 text-muted-foreground">
          Ideal para estudiantes con carga constante de trabajos
        </p>
        <p className="text-3xl font-bold text-secondary">~$25</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Por 3 meses — hasta 4 tareas al mes
        </p>
      </div>

      <div className="text-center">
        <Link
          to="/delegar"
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-secondary/90"
        >
          Solicitar ahora
        </Link>
      </div>
    </LandingLayout>
  );
}