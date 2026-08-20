import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";

export function HomePage() {
  return (
    <LandingLayout>
      {/* Hero Section */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-16 pt-24 pb-32">
        {/* Banner informativo de suscripciones */}
        <div className="mb-10 p-4 rounded-xl border border-secondary/20 bg-secondary/5 text-center text-sm font-semibold text-secondary">
          📢 ¡Próximamente! Estaremos incluyendo planes de suscripciones trimestrales para brindarte mayor comodidad en tu periodo académico.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-display-lg-mobile md:text-display-lg text-primary text-balance">
              Tu apoyo académico de confianza. Delegar es el primer paso al éxito.
            </h1>
            <p className="text-body-lg text-on-surface-variant max-w-lg">
              Trabajos escritos, diseño gráfico, video y más — desde $2 por tarea.
              Envía tu solicitud por WhatsApp y recibe seguimiento sin necesidad de
              plataformas complicadas.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                to="/delegar"
                className="px-8 py-3 bg-secondary text-on-secondary text-sm font-semibold rounded-lg shadow-ambient hover:shadow-ambient-hover transition-all hover:-translate-y-0.5"
              >
                Empezar Ahora
              </Link>
              <Link
                to="/servicios"
                className="px-8 py-3 bg-transparent border-2 border-border-subtle text-primary text-sm font-semibold rounded-lg hover:border-outline transition-colors"
              >
                Ver Servicios
              </Link>
            </div>
          </div>
          <div className="relative h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-ambient-hover bg-surface-container">
            <img
              src="/hero.jpg"
              alt="Delega - Apoyo académico de confianza"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-secondary-container rounded-full opacity-50 blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-16 mb-16">
        <h2 className="mb-8 text-center font-display text-headline-md text-primary">
          ¿Cómo funciona?
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { step: "1", title: "Elige tu servicio", desc: "Selecciona el tipo de trabajo que necesitas (trabajos escritos, diseño, video, etc.)" },
            { step: "2", title: "Completa los detalles", desc: "Llena los campos específicos para tu tarea y recibe un precio al instante" },
            { step: "3", title: "Recibe por WhatsApp", desc: "Envía la solicitud con un solo clic y da seguimiento al progreso de tu orden" },
          ].map((item) => (
            <div key={item.step} className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 text-center hover:shadow-ambient-hover transition-shadow">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-secondary-container text-lg font-bold text-on-secondary-container">
                {item.step}
              </div>
              <h3 className="mb-2 font-semibold text-primary">{item.title}</h3>
              <p className="text-sm text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing summary */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-16 mb-16">
        <h2 className="mb-8 text-center font-display text-headline-md text-primary">
          Precios desde $2
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Tareas individuales", range: "$2 – $15", desc: "Por tarea, según el tipo y la complejidad" },
            { label: "Suscripción trimestral", range: "proximamente", desc: "" }, //range: $25, desc: "Hasta 4 tareas por mes durante 3 meses"
            { label: "Sin sorpresas", range: "Precio fijo", desc: "Confirmamos el precio antes de empezar" },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border-2 border-secondary/20 bg-secondary/5 p-6 text-center">
              <h3 className="mb-1 font-semibold text-primary">{item.label}</h3>
              <p className="mb-1 text-2xl font-bold text-secondary font-display">{item.range}</p>
              <p className="text-sm text-on-surface-variant">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="w-full max-w-[1280px] mx-auto px-4 md:px-16 text-center">
        <p className="mb-4 text-lg text-on-surface-variant">
          ¿Listo para empezar? Tu primera tarea está a un clic de distancia.
        </p>
        <Link
          to="/delegar"
          className="inline-flex items-center gap-2 rounded-lg bg-secondary px-8 py-3 text-lg font-semibold text-on-secondary transition-all hover:bg-secondary/90 shadow-ambient hover:shadow-ambient-hover"
        >
          Delegar ahora
        </Link>
      </section>
    </LandingLayout>
  );
}
