import tailwind from "bun-plugin-tailwind";
import { join } from "node:path";

// Servidor de desarrollo mínimo (Opción A).
// Sirve src/index.html y transpila los módulos .tsx/.ts/.css al navegador
// con Bun.build + bun-plugin-tailwind. Recarga manual en el navegador.
// No es para producción; el build de producción es build.ts (Vercel).

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const CSS_CACHE: Record<string, string> = {};

async function buildAndGetCSS(filePath: string): Promise<string | null> {
  if (CSS_CACHE[filePath]) return CSS_CACHE[filePath];
  try {
    const result = await Bun.build({
      entrypoints: [filePath],
      plugins: [tailwind],
      target: "browser",
      sourcemap: "linked",
    });
    for (const output of result.outputs) {
      const isCSS = output.type === "text/css" || output.path.endsWith(".css");
      if (isCSS) {
        const text = await output.text();
        CSS_CACHE[filePath] = text;
        return text;
      }
    }
  } catch (e) {
    console.error("buildAndGetCSS error:", e);
  }
  return null;
}

const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);

    if (pathname === "/") pathname = "/index.html";

    if (pathname === "/index.html") {
      const html = await Bun.file(join(SRC, "index.html")).text();
      const out = html
        .replace("./frontend.tsx", "/frontend.tsx")
        .replace(
          '<script type="module" src="/frontend.tsx" async>',
          '<script type="module" src="/frontend.tsx">',
        );

      const css = await buildAndGetCSS(join(SRC, "frontend.tsx"));
      const finalHtml = css
        ? out.replace("</head>", `<style>${css}</style>\n  </head>`)
        : out;

      return new Response(finalHtml, {
        headers: {
          "content-type": "text/html",
          "cache-control": "no-store",
        },
      });
    }

    const filePath = join(SRC, pathname);
    const file = Bun.file(filePath);
    if (!(await file.exists())) {
      return new Response("Not found", {
        status: 404,
        headers: { "cache-control": "no-store" },
      });
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
          headers: { "content-type": "text/plain", "cache-control": "no-store" },
        });
      }
      const jsOutput = result.outputs.find((o) => o.type === "application/javascript" || o.type === "text/javascript" || o.path.endsWith(".js"));
      if (!jsOutput) {
        return new Response("Build produced no output", {
          status: 500,
          headers: { "cache-control": "no-store" },
        });
      }
      return new Response(jsOutput.stream(), {
        headers: {
          "content-type": "application/javascript",
          "cache-control": "no-store",
        },
      });
    } catch (err) {
      return new Response(`Error: ${String(err)}`, {
        status: 500,
        headers: { "content-type": "text/plain", "cache-control": "no-store" },
      });
    }
  },
});

console.log(`Dev server en http://localhost:${server.port}`);
