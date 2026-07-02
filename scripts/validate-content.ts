import { loadObservatoryData } from "../src/lib/content";

const data = loadObservatoryData();
const territorialLayers =
  data.socialConflictSnapshots.length +
  data.reinfoTerritorialSnapshots.length +
  data.formalMiningTerritorialSnapshots.length +
  data.explorationTerritorialSnapshots.length +
  data.miningConcessionTerritorialSnapshots.length;

console.log(`Contenido válido: ${data.cases.length} expedientes piloto, ${data.socialConflictCases.length} casos del corte social, ${data.miningConflictSelections[0].totalRegistered} conflictos socioambientales mineros, ${data.instruments.length} normas, ${data.sources.length} fuentes, ${territorialLayers} capas territoriales y 1 lectura de devastación en Madre de Dios.`);
