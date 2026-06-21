import { loadObservatoryData } from "../src/lib/content";

const data = loadObservatoryData();
console.log(`Contenido válido: ${data.cases.length} expedientes piloto, ${data.socialConflictCases.length} casos del corte social, ${data.miningConflictSelections[0].totalRegistered} conflictos socioambientales mineros, ${data.instruments.length} normas, ${data.sources.length} fuentes y ${data.socialConflictSnapshots.length} corte territorial.`);
