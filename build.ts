import tailwind from "bun-plugin-tailwind";
import { rm, cp, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { recursive: true, force: true });

// Inyectar BUN_PUBLIC_* del .env en el bundle del cliente via define
const define: Record<string, string> = {
  "process.env.NODE_ENV": JSON.stringify("production"),
};
for (const [key, value] of Object.entries(process.env)) {
  if (key.startsWith("BUN_PUBLIC_")) {
    define[`process.env.${key}`] = JSON.stringify(value);
  }
}

const result = await Bun.build({
  entrypoints: [path.join(process.cwd(), "src/frontend.tsx")],
  outdir,
  plugins: [tailwind],
  minify: true,
  target: "browser",
  sourcemap: "linked",
  splitting: true,
  define,
});

for (const output of result.outputs) {
  console.log(` ${path.relative(process.cwd(), output.path)}  ${(output.size / 1024).toFixed(1)} KB`);
}

// Copiar index.html y apuntar el script al bundle generado (SPA estática).
const html = await readFile(path.join(process.cwd(), "src/index.html"), "utf8");
const htmlOut = html
  .replace("./frontend.tsx", "./frontend.js")
  .replace("</head>", '    <link rel="stylesheet" href="./frontend.css" />\n  </head>');
await writeFile(path.join(outdir, "index.html"), htmlOut, "utf8");
await cp(
  path.join(process.cwd(), "styles"),
  path.join(outdir, "styles"),
  { recursive: true },
);

