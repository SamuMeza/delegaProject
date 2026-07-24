import { LandingLayout } from "@/components/landing/LandingLayout";
import { useConfig } from "@/hooks/useDelegaDB";

export function ContactPage() {
  const config = useConfig();
  const faqs = config?.faqs ?? [];
  const pagoMovil = config?.pagoMovil ?? null;

  return (
    <LandingLayout>
      <h1 className="mb-2 text-headline-md font-bold text-primary">Contacto</h1>
      <p className="mb-8 text-muted-foreground">
        Resuelve tus dudas y encuentra nuestra información de pago.
      </p>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="mb-4 text-headline-sm font-semibold text-primary">
          Preguntas frecuentes
        </h2>
        {faqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Cargando preguntas frecuentes…
          </p>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-xl border border-border bg-white"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium">
                  {faq.question}
                  <span className="text-muted-foreground transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        )}
      </section>

      {/* Pago Móvil */}
      <section className="mb-12">
        <h2 className="mb-4 text-headline-sm font-semibold text-primary">
          Pago Móvil
        </h2>
        {pagoMovil ? (
          <div className="rounded-xl border border-border bg-white p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Banco</p>
                <p className="font-medium">{pagoMovil.bank}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">RIF</p>
                <p className="font-medium">{pagoMovil.rif}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Teléfono</p>
                <p className="font-medium">{pagoMovil.phone}</p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Cargando datos de pago…
          </p>
        )}
      </section>

      {/* Disclaimers */}
      {config?.disclaimers && config.disclaimers.length > 0 && (
        <section>
          <div className="rounded-xl border border-border bg-white p-6 text-sm text-muted-foreground">
            {config.disclaimers.map((d, i) => (
              <p key={i} className={i > 0 ? "mt-2" : ""}>{d}</p>
            ))}
          </div>
        </section>
      )}
    </LandingLayout>
  );
}