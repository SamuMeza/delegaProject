-- =============================================
-- MIGRACIÓN 002: Trabajos Escritos Unificados
-- Cambios del feature branch:
--   - Unificación ensayo/investigacion/formato → trabajos_escritos
--   - Sub-tipo de diseño (flyers_animados, paquete_fotos)
--   - Precios actualizados
--   - FAQs completas (10 preguntas)
--   - Disclaimers actualizados
-- =============================================

-- 1. Actualizar service_operator_map
UPDATE config
SET service_operator_map = '{
    "trabajos_escritos": "op_001",
    "presentacion": "op_001",
    "diseno": "op_002",
    "video": "op_002"
  }'
WHERE id = 'app';

-- 2. Actualizar price_ranges
UPDATE config
SET price_ranges = '{
    "trabajos_escritos": {"min": 2, "max": 5},
    "presentacion": {"min": 4, "max": 6},
    "diseno": {"min": 3, "max": 14},
    "video": {"min": 8, "max": 15}
  }'
WHERE id = 'app';

-- 3. Actualizar FAQs (10 preguntas completas)
UPDATE config
SET faqs = '[
    {"question": "¿Cómo funciona el servicio?", "answer": "Seleccionas el tipo de trabajo, completas los detalles, envías la solicitud por WhatsApp y un operador te contacta para confirmar y coordinar la entrega."},
    {"question": "¿Cuánto tiempo toma la entrega?", "answer": "Depende del tipo de trabajo. Trabajos escritos: 24-48h. Presentaciones: 12-24h. Diseño: 24-72h. Videos: 48-96h."},
    {"question": "¿Cómo realizo el pago?", "answer": "Aceptamos Pago Móvil (transferencia bancaria). Los datos los encuentras en la sección de pago. El tipo de cambio se aplica al momento del pago."},
    {"question": "¿Qué incluye el servicio?", "answer": "Incluye la elaboración completa del trabajo según tus especificaciones, una revisión inicial y ajustes menores. No incluye plagio ni presentación como trabajo propio."},
    {"question": "¿Puedo solicitar cambios?", "answer": "Sí, incluimos una ronda de revisión con ajustes menores sin costo adicional. Cambios mayores o adicionales pueden tener un costo extra."},
    {"question": "¿Es seguro y confidencial?", "answer": "Sí, toda tu información es tratada con absoluta confidencialidad. No compartimos datos con terceros y los archivos se eliminan después de la entrega."},
    {"question": "¿Qué métodos de pago aceptan?", "answer": "Solo aceptamos Pago Móvil (transferencia bancaria venezolana). No aceptamos efectivo, PayPal ni otras formas de pago."},
    {"question": "¿Puedo cancelar mi solicitud?", "answer": "Puedes cancelar sin costo si el trabajo no ha sido iniciado. Si ya está en progreso, se aplica un cargo parcial según el avance."},
    {"question": "¿Cómo sé el estado de mi pedido?", "answer": "Recibes un token de seguimiento con tu solicitud. Puedes usarlo en la sección de rastreo de la página para ver el estado actual."},
    {"question": "¿Los trabajos son originales?", "answer": "Sí, todos los trabajos son elaborados desde cero según tus indicaciones. Son de carácter académico y de referencia, no deben ser presentados como propios."}
  ]'
WHERE id = 'app';

-- 4. Actualizar disclaimers
UPDATE config
SET disclaimers = '[
    "Los servicios son de apoyo académico y referencia. No garantizamos calificaciones.",
    "Precios en USD. Pago vía Pago Móvil. Tipo de cambio del día."
  ]'
WHERE id = 'app';

-- 5. Actualizar servicios de operadores
UPDATE operators
SET services = ARRAY['trabajos_escritos','presentacion']
WHERE id = 'op_001';

UPDATE operators
SET services = ARRAY['diseno','video']
WHERE id = 'op_002';
