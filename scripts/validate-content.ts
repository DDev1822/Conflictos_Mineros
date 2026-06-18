import { loadObservatoryData } from "../src/lib/content";

const data = loadObservatoryData();
console.log(`Contenido válido: ${data.cases.length} casos, ${data.instruments.length} normas, ${data.sources.length} fuentes y ${data.socialConflictSnapshots.length} corte territorial.`);
