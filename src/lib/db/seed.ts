import { db } from "@/lib/db/delegaDb";
import { env } from "@/lib/config/env";
import type { Config, Operator } from "@/lib/types";

const CONFIG_ID = "app";
const SEED_PASSWORD = "cambia_este_hash";
const DEFAULT_TIMEOUT_HOURS = 4;

function defaultConfig(): Config {
  return {
    id: CONFIG_ID,
    sessionTimeoutHours: DEFAULT_TIMEOUT_HOURS,
    orderCounter: 0,
    subscriptionCounter: 0,
    priceRanges: {
      ensayo: { min: 3, max: 15 },
      presentacion: { min: 3, max: 15 },
      investigacion: { min: 3, max: 15 },
      formato: { min: 3, max: 15 },
      diseno: { min: 3, max: 15 },
      video: { min: 3, max: 15 },
    },
    serviceOperatorMap: {
      ensayo: "op_001",
      presentacion: "op_001",
      investigacion: "op_001",
      formato: "op_002",
      diseno: "op_002",
      video: "op_002",
    },
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
  ): Operator => ({
    id,
    username: user ?? id,
    displayName: name,
    passwordHash: hash && hash !== "hash_sha256_aqui" ? hash : SEED_PASSWORD,
    role: "operator",
    createdAt: now,
  });
  return [
    make("op_001", env.operator1User, env.operator1PassHash, env.operator1Name),
    make("op_002", env.operator2User, env.operator2PassHash, env.operator2Name),
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
}
