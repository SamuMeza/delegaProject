import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";

export function IntegridadPage() {
  return (
    <LandingLayout>
      <div className="w-full max-w-[800px] mx-auto px-4 md:px-16 py-12">
        <h1 className="mb-2 font-display text-headline-lg font-bold text-primary">
          Aviso de Integridad Académica
        </h1>
        <p className="mb-8 text-sm text-on-surface-variant">
          Última actualización: 19 de agosto de 2026
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-on-surface">
          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">Propósito</h2>
            <p className="text-sm leading-relaxed">
              Todos los servicios ofrecidos por Delega son de <strong>apoyo académico y referencia</strong>.
              Los materiales que entregamos — ensayos, tesis, monografías, informes, artículos, diseño gráfico
              y video — funcionan como modelos, guías y material de estudio. No sustituyen el trabajo
              académico original del estudiante.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">Responsabilidad del estudiante</h2>
            <p className="text-sm leading-relaxed">
              El estudiante es el único responsable de:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Cumplir con las políticas de integridad académica de su institución educativa.</li>
              <li>Revisar, comprender y adaptar los materiales recibidos antes de presentarlos.</li>
              <li>Citar adecuadamente las fuentes y referencias utilizadas.</li>
              <li>Asegurarse de que el uso de los materiales sea ético y permitted por su institución.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">No garantía de calificación</h2>
            <p className="text-sm leading-relaxed">
              Delega <strong>no garantiza</strong> calificaciones, notas, admisiones, aprobaciones ni resultados
              académicos específicos. Los servicios son de apoyo y no tienen influencia directa sobre las
              decisiones de evaluación de las instituciones educativas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">Compromiso de originalidad</h2>
            <p className="text-sm leading-relaxed">
              Todo material entregado por Delega es elaborado de forma original y sin plagio. Utilizamos
              herramientas de verificación para asegurar la originalidad de nuestros trabajos escritos.
              Sin embargo, el estudiante debe realizar su propia verificación según los estándares de su institución.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">Usos prohibidos</h2>
            <p className="text-sm leading-relaxed">
              Los materiales entregados por Delega <strong>no deben</strong> ser utilizados para:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Presentarlos como trabajo propio sin haberlos revisado ni comprendido.</li>
              <li>Incurrir en deshonestidad académica o plagio.</li>
              <li>Violación de las políticas de integridad de la institución educativa.</li>
              <li>Cualquier fin que no sea de aprendizaje y referencia.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">Marco ético</h2>
            <p className="text-sm leading-relaxed">
              Delega opera bajo el principio de que el apoyo académico debe <strong>mejorar el aprendizaje</strong>,
              no reemplazarlo. Nuestro objetivo es facilitar el proceso educativo proporcionando herramientas
              de referencia que ayuden al estudiante a comprender mejor los temas y mejorar sus habilidades
              de redacción, análisis y síntesis.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">Disclaimers</h2>
            <div className="bg-surface-container rounded-xl p-4 space-y-2">
              <p className="text-sm">
                "Los servicios son de apoyo académico y referencia. No garantizamos calificaciones."
              </p>
              <p className="text-sm">
                "Precios en USD. Pago vía Pago Móvil. Tipo de cambio del día."
              </p>
              <p className="text-sm">
                "Delega se reserva el derecho de modificar o suspender servicios sin previo aviso."
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">Contacto</h2>
            <p className="text-sm leading-relaxed">
              Si tiene preguntas sobre esta política de integridad académica, contáctenos por WhatsApp al
              <a href="https://wa.me/584167050424" target="_blank" rel="noreferrer" className="text-secondary hover:underline"> +58 416-705-0424</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border-subtle">
          <Link to="/" className="text-sm text-secondary hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
}
