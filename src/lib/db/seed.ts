import { db } from "@/lib/db/delegaDb";
import { env } from "@/lib/config/env";
import type { Client, Config, Operator, ServiceType } from "@/lib/types";

const CONFIG_ID = "app";
const SEED_PASSWORD = "cambia_este_hash";
const DEFAULT_TIMEOUT_HOURS = 4;

function defaultConfig(): Config {
  return {
    id: CONFIG_ID,
    sessionTimeoutHours: DEFAULT_TIMEOUT_HOURS,
    orderCounter: 0,
    subscriptionCounter: 0,
    notificationEnabled: true,
    priceRanges: {
      ensayo: { min: 3, max: 15 },
      presentacion: { min: 3, max: 15 },
      investigacion: { min: 3, max: 15 },
      formato: { min: 3, max: 15 },
      diseno: { min: 3, max: 15 },
      video: { min: 3, max: 15 },
    },
    faqs: [
      { question: "¿Cómo funciona el servicio?", answer: "Seleccionas el tipo de trabajo, completas los detalles, envías la solicitud por WhatsApp y un operador te contacta." },
      { question: "¿Cuánto tiempo toma?", answer: "Depende del tipo de trabajo. Generalmente entregamos en 24-72 horas." },
      { question: "¿Cómo realizo el pago?", answer: "Aceptamos Pago Móvil. Los datos bancarios los encuentras en esta sección." },
    ],
    pagoMovil: {
      bank: "Banco de Venezuela",
      rif: "J-12345678-9",
      phone: "04141234567",
    },
    disclaimers: [
      "Los trabajos son de carácter académico y no deben ser presentados como propios.",
      "Los precios están en USD y se cancelan en BS al tipo de cambio del día.",
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function seedOperators(): Operator[] {
  const now = Date.now();
  const make = (
    id: string,
    user: string | undefined,
    hash: string | undefined,
    name: string,
    services: ServiceType[],
    color: string,
  ): Operator => ({
    id,
    username: user ?? id,
    displayName: name,
    passwordHash: hash && hash !== "hash_sha256_aqui" ? hash : SEED_PASSWORD,
    role: "operator",
    services,
    color,
    active: true,
    createdAt: now,
  });
  return [
    make("op_001", env.operator1User, env.operator1PassHash, env.operator1Name, ["ensayo", "presentacion", "investigacion", "formato"], "#3b82f6"),
    make("op_002", env.operator2User, env.operator2PassHash, env.operator2Name, ["diseno", "video"], "#10b981"),
  ];
}

// Puebla config y operators en el primer arranque (o si faltan datos).
// Idempotente: no duplica si ya existen. Ver spec §FR-2 / data-model.md §Seeding.
export async function seedDatabase(): Promise<void> {
  const configCount = await db.config.count();
  if (configCount === 0) {
    await db.config.add(defaultConfig());
  }

  const operatorCount = await db.operators.count();
  if (operatorCount === 0) {
    await db.operators.bulkAdd(seedOperators());
  }

  const clientCount = await db.clients.count();
  if (clientCount === 0) {
    await seedClients();
  }
}

function seedClients(): Promise<unknown> {
  const now = new Date().toISOString().split("T")[0];
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 3);
  const endStr = endDate.toISOString().split("T")[0];
  const key = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;

  const clients: Client[] = [
    {
      phone: "0412-1234567",
      name: "María Pérez",
      email: "maria@ejemplo.com",
      notes: "Estudiante universitaria, referida por amiga",
      totalOrders: 3,
      totalSpent: 27,
      subscription: {
        type: "pro",
        startDate: now,
        endDate: endStr,
        price: 25,
        status: "activa",
        monthlyQuota: 5,
        usedPerMonth: { [key]: 2 },
      },
      history: [],
    },
    {
      phone: "0414-7654321",
      name: "Carlos López",
      email: "carlos@ejemplo.com",
      totalOrders: 1,
      totalSpent: 10,
      subscription: null,
      history: [],
    },
  ];

  return db.clients.bulkAdd(clients);
}
