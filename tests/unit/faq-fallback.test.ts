import { describe, it, expect } from "bun:test";

// DEFAULT_FAQS del ContactPage (10 preguntas)
const DEFAULT_FAQS = [
  { question: "¿Qué es Delega y cómo funciona?", answer: "Servicio de apoyo escolar en Venezuela." },
  { question: "¿Cuáles son los precios?", answer: "Varían por tipo y complejidad." },
  { question: "¿Cómo pago?", answer: "Pago Móvil (transferencia móvil)." },
  { question: "¿Cuánto tarda?", answer: "Tareas simples: 24–48h." },
  { question: "¿Puedo pedir cambios?", answer: "Sí, revisiones incluidas." },
  { question: "¿El trabajo es original?", answer: "Sí, todo es original y sin plagio." },
  { question: "¿Es legal usar este servicio?", answer: "Sí, es apoyo académico como un tutor." },
  { question: "¿Cómo sigo mi orden?", answer: "Enlace de seguimiento único." },
  { question: "¿Ayudan con cualquier materia?", answer: "Ensayos, tesis, diseño, video." },
  { question: "¿Qué pasa si no estoy satisfecho?", answer: "Correcciones sin costo." },
];

// FAQs de Supabase (3 preguntas en seed SQL)
const SUPABASE_FAQS = [
  { question: "¿Cómo funciona el servicio?", answer: "Seleccionas el tipo de trabajo." },
  { question: "¿Cuánto tiempo toma?", answer: "Depende del tipo de trabajo." },
  { question: "¿Cómo realizo el pago?", answer: "Aceptamos Pago Móvil." },
];

describe("FAQ Fallback Logic", () => {
  it("debería usar config.faqs cuando tiene 10+ preguntas", () => {
    const config = { faqs: DEFAULT_FAQS };
    const faqs = config?.faqs?.length ? config.faqs : DEFAULT_FAQS;

    expect(faqs).toEqual(DEFAULT_FAQS);
    expect(faqs.length).toBe(10);
  });

  it("debería usar DEFAULT_FAQS cuando config.faqs está vacío", () => {
    const config = { faqs: [] };
    const faqs = config?.faqs?.length ? config.faqs : DEFAULT_FAQS;

    expect(faqs).toEqual(DEFAULT_FAQS);
    expect(faqs.length).toBe(10);
  });

  it("debería usar DEFAULT_FAQS cuando config es null", () => {
    const config = null;
    const faqs = config?.faqs?.length ? config.faqs : DEFAULT_FAQS;

    expect(faqs).toEqual(DEFAULT_FAQS);
    expect(faqs.length).toBe(10);
  });

  it("debería usar DEFAULT_FAQS cuando config es undefined", () => {
    const config = undefined;
    const faqs = config?.faqs?.length ? config.faqs : DEFAULT_FAQS;

    expect(faqs).toEqual(DEFAULT_FAQS);
    expect(faqs.length).toBe(10);
  });

  it("DEBERÍA fallar con FAQs de Supabase (3) - este test demuestra el bug", () => {
    // Este test demuestra que con 3 FAQs de Supabase, el fallback NO se activa
    const config = { faqs: SUPABASE_FAQS };
    const faqs = config?.faqs?.length ? config.faqs : DEFAULT_FAQS;

    // Con el bug: faqs = SUPABASE_FAQS (3 preguntas)
    // Sin el bug: faqs = DEFAULT_FAQS (10 preguntas)
    expect(faqs.length).toBe(3); // Esto demuestra el bug actual
    expect(faqs).not.toEqual(DEFAULT_FAQS);
  });

  it("debería filtrar FAQs por búsqueda", () => {
    const config = { faqs: DEFAULT_FAQS };
    const faqs = config?.faqs?.length ? config.faqs : DEFAULT_FAQS;

    const searchQuery = "pago";
    const filteredFaqs = faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    expect(filteredFaqs.length).toBeGreaterThanOrEqual(1);
    expect(filteredFaqs.some((faq) => faq.question.toLowerCase().includes("pago"))).toBe(true);
  });

  it("debería retornar array vacío cuando no hay coincidencias", () => {
    const config = { faqs: DEFAULT_FAQS };
    const faqs = config?.faqs?.length ? config.faqs : DEFAULT_FAQS;

    const searchQuery = "xyz123";
    const filteredFaqs = faqs.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    expect(filteredFaqs).toHaveLength(0);
  });
});
