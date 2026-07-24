import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";

export function HomePage() {
  return (
    <LandingLayout>
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-display-lg-mobile font-bold text-primary md:text-display-lg">
          Apoyo Escolar en Venezuela
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-body-lg text-muted-foreground">
          Ensayos, presentaciones, investigaciones y más — desde $3 por tarea.
          Envía tu solicitud por WhatsApp y recibe seguimiento sin necesidad de
          plataformas complicadas.
        </p>
        <Link
          to="/delegar"
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-secondary/90"
        >
          Delegar tarea
        </Link>
      </section>

      {/* How it works */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-headline-md font-bold text-primary">
          ¿Cómo funciona?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { step: "1", title: "Elige tu servicio", desc: "Selecciona el tipo de trabajo que necesitas (ensayo, presentación, diseño, etc.)" },
            { step: "2", title: "Completa los detalles", desc: "Llena los campos específicos para tu tarea y recibe un precio al instante" },
            { step: "3", title: "Recibe por WhatsApp", desc: "Envía la solicitud con un solo clic y da seguimiento al progreso de tu orden" },
          ].map((item) => (
            <div key={item.step} className="rounded-xl border border-border bg-white p-6 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary/10 text-lg font-bold text-secondary">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing summary */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-headline-md font-bold text-primary">
          Precios desde $3
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Tareas individuales", range: "$3 – $15", desc: "Por tarea, según el tipo y la complejidad" },
            { label: "Suscripción trimestral", range: "~$25", desc: "Hasta 4 tareas por mes durante 3 meses" },
            { label: "Sin sorpresas", range: "Precio fijo", desc: "Confirmamos el precio antes de empezar" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-secondary/20 bg-secondary/5 p-6 text-center">
              <h3 className="mb-1 font-semibold">{item.label}</h3>
              <p className="mb-1 text-2xl font-bold text-secondary">{item.range}</p>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <p className="mb-4 text-lg text-muted-foreground">
          ¿Listo para empezar? Tu primera tarea está a un clic de distancia.
        </p>
        <Link
          to="/delegar"
          className="inline-flex items-center gap-2 rounded-xl bg-secondary px-8 py-3 text-lg font-semibold text-white transition-all hover:bg-secondary/90"
        >
          Delegar ahora
        </Link>
      </section>
    </LandingLayout>
  );
}