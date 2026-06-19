import { loadObservatoryData } from "../src/lib/content";

const data = loadObservatoryData();
console.log(`Contenido válido: ${data.cases.length} expedientes piloto, ${data.miningSocialConflictCases.length} casos del corte minero, ${data.instruments.length} normas, ${data.sources.length} fuentes y ${data.miningConflictSnapshots.length} corte territorial.`);
