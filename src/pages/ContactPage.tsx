import { useState } from "react";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { useConfig } from "@/hooks/useDatabase";
import { Search, MessageCircle, Check, ChevronDown } from "lucide-react";
import { env } from "@/lib/config/env";

const DEFAULT_FAQS = [
  {
    question: "¿Qué es Delega y cómo funciona?",
    answer: "Servicio de apoyo escolar en Venezuela. Envías tu tarea por WhatsApp, te damos cotización, confirmas pago, nuestro equipo trabaja. Sigues el estado desde la plataforma.",
  },
  {
    question: "¿Cuáles son los precios?",
    answer: "Varían por tipo y complejidad. Servicios individuales $2–$15. Suscripciones trimestrales ~$25. Cotización personalizada por WhatsApp.",
  },
  {
    question: "¿Cómo pago?",
    answer: "Pago Móvil (transferencia móvil). Te damos los datos tras aceptar cotización. Orden comienza al confirmar pago.",
  },
  {
    question: "¿Cuánto tarda?",
    answer: "Tareas simples: 24–48h. Complejas (tesis): 3–7 días. Tiempo estimado en la cotización.",
  },
  {
    question: "¿Puedo pedir cambios?",
    answer: "Sí, revisiones incluidas. Ajustes sin costo adicional tras la entrega.",
  },
  {
    question: "¿El trabajo es original?",
    answer: "Sí, todo es original y sin plagio. Recomendamos usar como referencia y citar adecuadamente.",
  },
  {
    question: "¿Es legal usar este servicio?",
    answer: "Sí, es apoyo académico como un tutor. El uso es responsabilidad del estudiante.",
  },
  {
    question: "¿Cómo sigo mi orden?",
    answer: "Enlace de seguimiento único con estado en tiempo real. También por WhatsApp.",
  },
  {
    question: "¿Ayudan con cualquier materia?",
    answer: "Ensayos, tesis, diseño, video. Para necesidades específicas, preguntar por WhatsApp.",
  },
  {
    question: "¿Qué pasa si no estoy satisfecho?",
    answer: "Correcciones sin costo. En casos excepcionales, reembolso según circunstancias.",
  }
];

const HOW_IT_WORKS = [
  { step: "1", title: "Selecciona tu servicio", desc: "Elige el tipo de trabajo que necesitas en nuestra plataforma." },
  { step: "2", title: "Envía tu solicitud por WhatsApp", desc: "Completa los detalles y envía la solicitud con un solo clic." },
  { step: "3", title: "Recibe tu trabajo", desc: "Nuestro equipo trabaja en tu solicitud y te entrega el resultado." },
];

export function ContactPage() {
  const config = useConfig();
  const faqs = config?.faqs?.length ? config.faqs : DEFAULT_FAQS;
  const [searchQuery, setSearchQuery] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [sent, setSent] = useState(false);

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!contactName.trim() || !contactMessage.trim()) return;
    const encoded = encodeURIComponent(`Hola, soy ${contactName.trim()}.\n\n${contactMessage.trim()}`);
    window.open(`https://wa.me/${env.whatsappNumber}?text=${encoded}`, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <LandingLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-16 py-12" id="faq">
        <h1 className="mb-2 font-display text-headline-lg font-bold text-primary">
          Contacto
        </h1>
        <p className="mb-12 text-on-surface-variant max-w-2xl">
          Resuelve tus dudas y encuentra información sobre nuestros servicios.
        </p>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="mb-8 font-display text-headline-md text-primary">
            ¿Cómo funciona?
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => (
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

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="mb-4 font-display text-headline-md text-primary">
            Preguntas frecuentes
          </h2>
          <p className="mb-6 text-on-surface-variant text-sm">
            {filteredFaqs.length} {filteredFaqs.length === 1 ? "pregunta" : "preguntas"}
          </p>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar en preguntas frecuentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border-subtle bg-surface-studio pl-10 pr-4 py-3 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
            />
          </div>

          {/* FAQ list */}
          <div className="space-y-3">
            {filteredFaqs.map((faq, i) => (
              <details
                key={i}
                className="group bg-surface-container-lowest rounded-xl shadow-ambient"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 font-medium text-on-surface list-none">
                  {faq.question}
                  <ChevronDown className="w-4 h-4 text-on-surface-variant transition-transform group-open:rotate-180 shrink-0 ml-2" />
                </summary>
                <p className="border-t border-border-subtle px-4 py-3 text-sm text-on-surface-variant">
                  {faq.answer}
                </p>
              </details>
            ))}
            {filteredFaqs.length === 0 && (
              <p className="text-sm text-on-surface-variant py-4 text-center">
                No se encontraron preguntas que coincidan con tu búsqueda.
              </p>
            )}
          </div>

          <div className="mt-6 text-center">
            <a
              href={`https://wa.me/${env.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              ¿No encontraste tu respuesta? Escríbenos por WhatsApp
            </a>
          </div>
        </section>

        {/* Contact form */}
        <section className="mb-16">
          <h2 className="mb-4 font-display text-headline-md text-primary">
            Envíanos un mensaje
          </h2>
          <p className="mb-6 text-on-surface-variant text-sm">
            Completa el formulario y te redirigiremos a WhatsApp con tu mensaje listo para enviar.
          </p>
          <form onSubmit={handleContactSubmit} className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 max-w-lg space-y-4">
            <div>
              <label htmlFor="contact-name" className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">
                Tu nombre
              </label>
              <input
                id="contact-name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="h-12 w-full rounded-lg border border-border-subtle bg-surface-studio px-4 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2"
                placeholder="Ej: María Pérez"
                required
              />
            </div>
            <div>
              <label htmlFor="contact-message" className="mb-1 block text-sm font-semibold text-on-surface uppercase tracking-wider">
                Mensaje
              </label>
              <textarea
                id="contact-message"
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-studio px-4 py-3 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-secondary focus-visible:outline-offset-2 resize-none"
                rows={4}
                placeholder="Cuéntanos en qué necesitas ayuda..."
                required
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#25D366] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#1DA851] shadow-ambient hover:shadow-ambient-hover"
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4" />
                  ¡Mensaje preparado!
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4" />
                  Enviar por WhatsApp
                </>
              )}
            </button>
          </form>
        </section>

        {/* Disclaimers */}
        {/* {config?.disclaimers && config.disclaimers.length > 0 && (
          <section>
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient p-6 text-sm text-on-surface-variant">
              {config.disclaimers.map((d, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>{d}</p>
              ))}
            </div>
          </section>
        )} */}
      </div>
    </LandingLayout>
  );
}
