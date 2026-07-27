import { existsSync, rmSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";

const workspaceRoot = resolve(process.cwd());
const outputRoot = resolve(workspaceRoot, "out");
const excludedRoutes = ["madre-de-dios", "oro-ilegal"];

if (dirname(outputRoot) !== workspaceRoot || basename(outputRoot) !== "out") {
  throw new Error(`Directorio de salida inseguro: ${outputRoot}`);
}

for (const route of excludedRoutes) {
  const target = resolve(outputRoot, route);

  if (dirname(target) !== outputRoot) {
    throw new Error(`Ruta de exclusión insegura: ${target}`);
  }

  rmSync(target, { recursive: true, force: true });

  if (existsSync(target)) {
    throw new Error(`La ruta fuera de alcance sigue presente: ${target}`);
  }

  console.log(`Ruta excluida del artefacto de Pages: /${route}/`);
}
