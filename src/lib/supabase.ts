import { createClient } from "@supabase/supabase-js";

// Usamos las variables de entorno de Supabase definidas en .env
const supabaseUrl = process.env.BUN_SUPABASE_URL || "";
const supabaseKey = process.env.BUN_SUPABASE_PUBLISHABLE_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase URL o Key no definidas en las variables de entorno.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
