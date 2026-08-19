-- =============================================
-- SEED: Datos iniciales para Delega
-- Ejecutar en SQL Editor de Supabase
-- =============================================

-- 1. CONFIG (configuración de la app)
INSERT INTO config (id, session_timeout_hours, order_counter, subscription_counter, notification_enabled, service_operator_map, price_ranges, faqs, pago_movil, disclaimers, created_at, updated_at)
VALUES (
  'app',
  8,
  0,
  0,
  true,
  '{
    "ensayo": "op_001",
    "presentacion": "op_001",
    "investigacion": "op_001",
    "formato": "op_001",
    "diseno": "op_002",
    "video": "op_002"
  }',
  '{
    "ensayo": {"min": 3, "max": 15},
    "presentacion": {"min": 3, "max": 15},
    "investigacion": {"min": 3, "max": 15},
    "formato": {"min": 3, "max": 15},
    "diseno": {"min": 3, "max": 15},
    "video": {"min": 3, "max": 15}
  }',
  '[
    {"question": "¿Cómo funciona el servicio?", "answer": "Seleccionas el tipo de trabajo, completas los detalles, envías la solicitud por WhatsApp y un operador te contacta."},
    {"question": "¿Cuánto tiempo toma?", "answer": "Depende del tipo de trabajo. Generalmente entregamos en 24-72 horas."},
    {"question": "¿Cómo realizo el pago?", "answer": "Aceptamos Pago Móvil. Los datos bancarios los encuentras en esta sección."}
  ]',
  '{
    "bank": "Banco de Venezuela",
    "rif": "J-12345678-9",
    "phone": "04141234567"
  }',
  '[
    "Los trabajos son de carácter académico y no deben ser presentados como propios.",
    "Los precios están en USD y se cancelan en BS al tipo de cambio del día."
  ]',
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- 2. OPERATORS (operadores)
-- Contraseña para ambos: "password" (SHA-256: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8)
INSERT INTO operators (id, username, display_name, password_hash, role, services, color, active, created_at)
VALUES
  ('op_001', 'op_001', 'Operador 1', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'operator', ARRAY['ensayo','presentacion','investigacion','formato'], '#3b82f6', true, now()),
  ('op_002', 'op_002', 'Operador 2', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'operator', ARRAY['diseno','video'], '#10b981', true, now())
ON CONFLICT (id) DO NOTHING;

-- 3. CLIENTS (clientes de ejemplo — opcional)
INSERT INTO clients (phone, name, email, notes, total_orders, total_spent, subscription, history)
VALUES
  ('0412-1234567', 'María Pérez', 'maria@ejemplo.com', 'Estudiante universitaria, referida por amiga', 3, 27, '{"type":"pro","startDate":"2026-08-01","endDate":"2026-11-01","price":25,"status":"activa","monthlyQuota":5,"usedPerMonth":{"2026-08":2}}', '{}'),
  ('0414-7654321', 'Carlos López', 'carlos@ejemplo.com', NULL, 1, 10, NULL, '{}')
ON CONFLICT (phone) DO NOTHING;
