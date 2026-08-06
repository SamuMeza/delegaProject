import { supabase } from "./src/lib/supabase";

async function testConnection() {
  console.log("Intentando conectar a Supabase...");
  
  const rawUrl = process.env.BUN_SUPABASE_URL || "";
  const rawKey = process.env.BUN_SUPABASE_PUBLISHABLE_KEY || "";
  const url = rawUrl.replace(/^"(.*)"$/, '$1');
  const key = rawKey.replace(/^"(.*)"$/, '$1');

  try {
    // Al acceder a una tabla en OpenAPI con la publishable/anon key, la autenticación sí es válida.
    // Intentemos realizar una consulta GET directa a una de las tablas del sistema como /rest/v1/operators
    const res = await fetch(`${url}/rest/v1/operators?select=count`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });

    console.log("Status de respuesta de tabla (se espera 200, o 404 si la tabla aún no existe, pero NO 401):", res.status);
    if (res.status === 200 || res.status === 404) {
      console.log("¡Conexión de red y api-key validadas con éxito! El api_key es aceptado.");
    } else {
      const txt = await res.text();
      console.log("Respuesta inesperada del API:", txt);
    }
  } catch (err) {
    console.error("Excepción en la conexión:", err);
  }
}

testConnection();
