import tailwind from "bun-plugin-tailwind";
import { join } from "node:path";

// Servidor de desarrollo mínimo (Opción A).
// Sirve src/index.html y transpila los módulos .tsx/.ts/.css al navegador
// con Bun.build + bun-plugin-tailwind. Recarga manual en el navegador.
// No es para producción; el build de producción es build.ts (Vercel).

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/") pathname = "/index.html";

    if (pathname === "/index.html") {
      const html = await Bun.file(join(SRC, "index.html")).text();
      const out = html.replace("./frontend.tsx", "/frontend.tsx");
      return new Response(out, { headers: { "content-type": "text/html" } });
    }

    const filePath = join(SRC, pathname);
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not found", { status: 404 });
    }

    try {
      const result = await Bun.build({
        entrypoints: [filePath],
        plugins: [tailwind],
        target: "browser",
        sourcemap: "linked",
      });
      if (!result.success) {
        const msg = result.logs.map((l) => l.message).join("\n");
        return new Response(`Build error:\n${msg}`, {
          status: 500,
          headers: { "content-type": "text/plain" },
        });
      }
      const out = result.outputs[0];
      if (!out) {
        return new Response("Build produced no output", { status: 500 });
      }
      return new Response(out.stream(), {
        headers: { "content-type": out.type ?? "application/javascript" },
      });
    } catch (err) {
      return new Response(`Error: ${String(err)}`, {
        status: 500,
        headers: { "content-type": "text/plain" },
      });
    }
  },
});

console.log(`Dev server en http://localhost:${server.port}`);
