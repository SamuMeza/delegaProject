import { Link } from "react-router-dom";
import { LandingLayout } from "@/components/landing/LandingLayout";

export function PrivacidadPage() {
  return (
    <LandingLayout>
      <div className="w-full max-w-[800px] mx-auto px-4 md:px-16 py-12">
        <h1 className="mb-2 font-display text-headline-lg font-bold text-primary">
          Política de Privacidad
        </h1>
        <p className="mb-8 text-sm text-on-surface-variant">
          Última actualización: 19 de agosto de 2026
        </p>

        <div className="prose prose-sm max-w-none space-y-6 text-on-surface">
          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">1. Responsable de los datos</h2>
            <p className="text-sm leading-relaxed">
              El responsable del tratamiento de sus datos personales es Delega, servicio de apoyo académico
              operado en la República Bolivariana de Venezuela.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">2. Datos que recopilamos</h2>
            <p className="text-sm leading-relaxed">
              Recopilamos la siguiente información cuando utiliza nuestros servicios:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li><strong>Nombre completo</strong> — para identificarle y personalizar el servicio.</li>
              <li><strong>Número de WhatsApp</strong> — para comunicación y entrega de materiales.</li>
              <li><strong>Correo electrónico</strong> — opcional, para comunicaciones secundarias.</li>
              <li><strong>Datos académicos</strong> — tema, tipo de trabajo, requerimientos específicos.</li>
              <li><strong>Referencias de pago</strong> — para confirmar transacciones.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">3. Finalidad del tratamiento</h2>
            <p className="text-sm leading-relaxed">
              Sus datos son utilizados exclusivamente para:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li>Procesar y gestionar sus solicitudes de servicio.</li>
              <li>Comunicar el estado de sus órdenes.</li>
              <li>Entregar los materiales solicitados.</li>
              <li>Mejorar la calidad de nuestros servicios.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">4. Base legal</h2>
            <p className="text-sm leading-relaxed">
              El tratamiento de sus datos se basa en:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li><strong>Consentimiento expreso</strong> — al proporcionar sus datos, usted acepta su tratamiento.</li>
              <li><strong>Necesidad contractual</strong> — los datos son necesarios para prestar el servicio contratado.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">5. Compartición de datos</h2>
            <p className="text-sm leading-relaxed">
              Delega <strong>no vende ni comparte</strong> sus datos personales con terceros para fines comerciales.
              Los datos se almacenan en nuestra base de datos con altos estándares de seguridad
              Solo el equipo de Delega tiene acceso a sus datos para prestar el servicio.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">6. Seguridad</h2>
            <p className="text-sm leading-relaxed">
              Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos:
              cifrado en tránsito (TLS), acceso restringido a los operadores autorizados, y autenticación
              segura en el panel de administración.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">7. Retención de datos</h2>
            <p className="text-sm leading-relaxed">
              Los datos de sus órdenes se mantienen durante la prestación del servicio y un período
              razonable posterior para fines de auditoría y soporte. Puede solicitar la eliminación
              de sus datos en cualquier momento.
            </p>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">8. Sus derechos</h2>
            <p className="text-sm leading-relaxed">
              De conformidad con la Ley de Protección de Datos Personales de Venezuela (aprobada en abril de 2025),
              usted tiene derecho a:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mt-2">
              <li><strong>Acceso</strong> — conocer qué datos tenemos sobre usted.</li>
              <li><strong>Rectificación</strong> — corregir datos inexactos.</li>
              <li><strong>Eliminación</strong> — solicitar la eliminación de sus datos.</li>
              <li><strong>Retiro de consentimiento</strong> — dejar de recibir comunicaciones.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-headline-sm font-bold text-primary mb-2">9. Contacto</h2>
            <p className="text-sm leading-relaxed">
              Para ejercer sus derechos o realizar preguntas sobre esta política, contáctenos por WhatsApp al
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
