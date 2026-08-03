import { LandingLayout } from "@/components/landing/LandingLayout";
import { useConfig } from "@/hooks/useDelegaDB";

export function ContactPage() {
  const config = useConfig();
  const faqs = config?.faqs ?? [];
  const pagoMovil = config?.pagoMovil ?? null;

  return (
    <LandingLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12">
        <h1 className="mb-2 font-display text-headline-md text-primary">Contacto</h1>
        <p className="mb-8 text-on-surface-variant">
          Resuelve tus dudas y encuentra nuestra información de pago.
        </p>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 font-display text-headline-sm text-primary font-semibold">
            Preguntas frecuentes
          </h2>
          {faqs.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              Cargando preguntas frecuentes...
            </p>
          ) : (
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="group bg-surface-container-lowest rounded-xl shadow-ambient"
                >
                  <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium text-on-surface">
                    {faq.question}
                    <span className="text-on-surface-variant transition-transform group-open:rotate-180">
                      ▼
                    </span>
                  </summary>
                  <p className="border-t border-border-subtle px-4 py-3 text-sm text-on-surface-variant">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          )}
        </section>

        {/* Pago Móvil */}
        <section className="mb-12">
          <h2 className="mb-4 font-display text-headline-sm text-primary font-semibold">
            Pago Móvil
          </h2>
          {pagoMovil ? (
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Banco</p>
                  <p className="font-medium text-on-surface">{pagoMovil.bank}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">RIF</p>
                  <p className="font-medium text-on-surface">{pagoMovil.rif}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Teléfono</p>
                  <p className="font-medium text-on-surface">{pagoMovil.phone}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Cargando datos de pago...
            </p>
          )}
          <p className="mt-4 text-sm text-on-surface-variant">
            Usa el ID de tu orden como referencia de pago
          </p>
        </section>

        {/* Disclaimers */}
        {config?.disclaimers && config.disclaimers.length > 0 && (
          <section>
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 text-sm text-on-surface-variant">
              {config.disclaimers.map((d, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>{d}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </LandingLayout>
  );
}
