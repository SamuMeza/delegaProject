import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";

export function TerminosPage() {
  return (
    <LandingLayout>
      <div className="w-full max-w-[800px] mx-auto px-4 md:px-16 py-12">
        <h1 className="mb-2 font-display text-headline-lg font-bold text-primary">
          Términos de Servicio
        </h1>
        <p className="mb-8 text-sm text-on-surface-variant">
          Última actualización: 19 de agosto de 2026
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-on-surface">
          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">1. Aceptación de los términos</h2>
            <p className="text-sm leading-relaxed">
              Al acceder y utilizar los servicios de Delega, usted acepta estar sujeto a estos Términos de Servicio.
              Si no está de acuerdo con alguno de los términos, no utilice nuestros servicios.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">2. Descripción de servicios</h2>
            <p className="text-sm leading-relaxed">
              Delega ofrece servicios de apoyo académico que incluyen, pero no se limitan a: trabajos escritos
              (ensayos, tesis, monografías, informes, artículos), diseño gráfico, presentaciones y edición de video.
              Todos los servicios son de carácter <strong>académico y de referencia</strong>. Los materiales entregados
              son guías que el estudiante debe revisar, comprender y adaptar según las políticas de integridad
              académica de su institución.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">3. Proceso de solicitud</h2>
            <p className="text-sm leading-relaxed">
              El proceso de solicitud sigue el siguiente flujo:
            </p>
            <ol className="list-decimal list-inside text-sm space-y-1 mt-2">
              <li>El estudiante selecciona el tipo de servicio en la plataforma web.</li>
              <li>Completa los detalles específicos del trabajo.</li>
              <li>Envía la solicitud por WhatsApp con la información prellenada.</li>
              <li>Un operador confirma los detalles y proporciona una cotización.</li>
              <li>El estudiante realiza el pago correspondiente.</li>
              <li>Nuestro equipo trabaja en el servicio y entrega el resultado por WhatsApp.</li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">4. Precios y pago</h2>
            <p className="text-sm leading-relaxed">
              Todos los precios están expresados en dólares estadounidenses (USD). Los precios individuales varían
              entre $2 y $15 según el tipo de servicio y la complejidad. El pago se realiza vía Pago Móvil
              (transferencia bancaria móvil) en la moneda local al tipo de cambio del día. Los datos bancarios
              se proporcionan después de confirmar la cotización.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">5. Entrega y revisiones</h2>
            <p className="text-sm leading-relaxed">
              Los tiempos de entrega son estimados y varían según el tipo de servicio:
              tareas simples se entregan en 24–48 horas; trabajos complejos como tesis pueden tomar de 3 a 7 días.
              El tiempo estimado se indica en la cotización. Las revisiones están incluidas en el precio;
              los ajustes sin costo adicional se realizan tras la entrega.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">6. Obligaciones del usuario</h2>
            <p className="text-sm leading-relaxed">
              El usuario se compromete a:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Proporcionar información veraz y completa al realizar una solicitud.</li>
              <li>Utilizar los materiales entregados de forma ética y responsable.</li>
              <li>Cumplir con las políticas de integridad académica de su institución.</li>
              <li>Realizar los pagos en los plazos acordados.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">7. Propiedad intelectual</h2>
            <p className="text-sm leading-relaxed">
              Una vez completado el pago, el cliente recibe una licencia de uso personal sobre los materiales
              entregados. Delega no reclama la propiedad intelectual de los trabajos entregados tras el pago
              completo. El cliente es responsable del uso que dé a los materiales.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">8. Limitación de responsabilidad</h2>
            <p className="text-sm leading-relaxed">
              Delega no garantiza calificaciones, notas, admisiones ni aprobaciones. Los servicios son de apoyo
              académico y referencia. La máxima responsabilidad de Delega se limita al monto pagado por el
              servicio específico. No nos hacemos responsables por el uso indebido de los materiales entregados.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">9. Cancelaciones</h2>
            <p className="text-sm leading-relaxed">
              Se aceptan cancelaciones con reembolso total antes de que se inicie el trabajo. Después de iniciado,
              se ofrece un reembolso parcial según el estado del trabajo. Una vez aceptada la entrega final,
              no se ofrece reembolso.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">10. Ley aplicable</h2>
            <p className="text-sm leading-relaxed">
              Estos términos se rigen por las leyes de la República Bolivariana de Venezuela. Cualquier
              disputa será resuelta en los tribunales competentes de la ciudad de Caracas, Venezuela.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">11. Contacto</h2>
            <p className="text-sm leading-relaxed">
              Para cualquier pregunta sobre estos términos, contáctanos por WhatsApp al
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
