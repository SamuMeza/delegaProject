import { db } from "@/lib/db/delegaDb";

// Hooks de acceso a datos sobre Dexie. Skeleton de preparación de terreno.
// La lógica de negocio se implementa en la fase de features.

export function useDelegaDB() {
  return db;
}
