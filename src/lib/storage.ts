import { supabase } from "@/lib/supabase";

const BUCKET = "order-files";

/**
 * Sube un archivo al bucket de Supabase Storage para una orden específica.
 * @param orderId - ID de la orden (ej: "ORD-123")
 * @param file - Archivo a subir
 * @returns Objeto con path del archivo o error
 */
export async function uploadOrderFile(
  orderId: string,
  file: File,
): Promise<{ path?: string; error?: string }> {
  const filePath = `${orderId}/${file.name}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Error subiendo archivo:", error.message);
    return { error: error.message };
  }

  return { path: data.path };
}

/**
 * Obtiene la URL pública de un archivo en el bucket.
 * @param orderId - ID de la orden
 * @param fileName - Nombre del archivo
 * @returns URL pública del archivo
 */
export function getOrderFileUrl(orderId: string, fileName: string): string {
  const filePath = `${orderId}/${fileName}`;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Lista todos los archivos de una orden específica.
 * @param orderId - ID de la orden
 * @returns Array de objetos con name, id, y metadata
 */
export async function listOrderFiles(
  orderId: string,
): Promise<Array<{ name: string; id: string; metadata?: Record<string, unknown> }>> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .list(orderId, {
      limit: 100,
      offset: 0,
    });

  if (error || !data) {
    console.error("Error listando archivos:", error?.message);
    return [];
  }

  return data.map((file) => ({
    name: file.name,
    id: file.id,
    metadata: file.metadata,
  }));
}

/**
 * Elimina un archivo específico del bucket.
 * @param orderId - ID de la orden
 * @param fileName - Nombre del archivo a eliminar
 * @returns Objeto con éxito o error
 */
export async function removeOrderFile(
  orderId: string,
  fileName: string,
): Promise<{ success: boolean; error?: string }> {
  const filePath = `${orderId}/${fileName}`;

  const { error } = await supabase.storage.from(BUCKET).remove([filePath]);

  if (error) {
    console.error("Error eliminando archivo:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Elimina todos los archivos de una orden.
 * @param orderId - ID de la orden
 * @returns Objeto con éxito o error
 */
export async function removeOrderFiles(
  orderId: string,
): Promise<{ success: boolean; error?: string }> {
  const files = await listOrderFiles(orderId);

  if (files.length === 0) {
    return { success: true };
  }

  const filePaths = files.map((f) => `${orderId}/${f.name}`);

  const { error } = await supabase.storage.from(BUCKET).remove(filePaths);

  if (error) {
    console.error("Error eliminando archivos:", error.message);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sube múltiples archivos para una orden.
 * @param orderId - ID de la orden
 * @param files - Array de archivos a subir
 * @returns Objeto con URLs de los archivos o error
 */
export async function uploadOrderFiles(
  orderId: string,
  files: File[],
): Promise<{ urls: string[]; errors: string[] }> {
  const urls: string[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const result = await uploadOrderFile(orderId, file);

    if (result.error) {
      errors.push(`${file.name}: ${result.error}`);
    } else if (result.path) {
      const url = getOrderFileUrl(orderId, file.name);
      urls.push(url);
    }
  }

  return { urls, errors };
}
