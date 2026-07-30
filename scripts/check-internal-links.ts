import fs from "node:fs";
import path from "node:path";
import { loadObservatoryData } from "../src/lib/content";

const data = loadObservatoryData();
const routes = new Set(["/", "/explorar", "/mapa", "/cronologia", "/conflictos", "/compromisos", "/normativa", "/biblioteca", "/oro-ilegal", "/pataz", "/madre-de-dios", "/reinfo", "/metodologia", ...data.cases.map((item) => `/conflictos/${item.slug}`)]);
const root = path.join(process.cwd(), "src");

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
}

const invalid: string[] = [];
for (const file of walk(root).filter((entry) => /\.(tsx|ts)$/.test(entry))) {
  const content = fs.readFileSync(file, "utf8");
  for (const match of content.matchAll(/href=["'`]([^"'`#?]+)(?:#[^"'`]*)?["'`]/g)) {
    const href = match[1];
    if (href.startsWith("/") && !href.includes("${") && !routes.has(href)) invalid.push(`${path.relative(process.cwd(), file)} -> ${href}`);
  }
}
if (invalid.length) throw new Error(`Enlaces internos sin ruta:\n${invalid.join("\n")}`);
console.log(`Enlaces internos válidos: ${routes.size} rutas conocidas.`);
