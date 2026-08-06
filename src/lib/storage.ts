import { supabase } from "@/lib/supabase";

/**
 * Sube un archivo al bucket público 'order-files' en Supabase Storage.
 * @param file El objeto File/Blob a subir.
 * @param path La ruta destino dentro del bucket (ej: 'attachments/uuid-nombre.png').
 */
export async function uploadFile(file: File | Blob, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from("order-files").upload(path, file, {
    cacheControl: "3600",
    upsert: true,
  });

  if (error) {
    throw new Error(`Error subiendo archivo a Storage: ${error.message}`);
  }

  return data.path;
}

/**
 * Obtiene la URL pública de un archivo en el bucket 'order-files'.
 * @param path La ruta del archivo en el bucket.
 */
export function getFileUrl(path: string): string {
  const { data } = supabase.storage.from("order-files").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Elimina un archivo del bucket 'order-files'.
 * @param path La ruta del archivo a eliminar.
 */
export async function deleteFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from("order-files").remove([path]);
  if (error) {
    throw new Error(`Error eliminando archivo de Storage: ${error.message}`);
  }
}
