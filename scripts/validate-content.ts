import { loadObservatoryData } from "../src/lib/content";
import { getLatestPublicMiningCut } from "../src/lib/mining-classification";

const data = loadObservatoryData();
const { selection: publicMiningSelection, cases: publicMiningCases } = getLatestPublicMiningCut(data);
if (!publicMiningSelection) throw new Error("No existe un corte público de conflictos sociales mineros");
const territorialLayers =
  data.socialConflictSnapshots.length +
  data.reinfoTerritorialSnapshots.length +
  data.formalMiningTerritorialSnapshots.length +
  data.explorationTerritorialSnapshots.length +
  data.miningConcessionTerritorialSnapshots.length;

console.log(`Contenido válido: ${data.cases.length} expedientes trazados, ${publicMiningCases.length} conflictos sociales mineros del corte público, ${publicMiningSelection.active} activos, ${publicMiningSelection.latent} latentes, ${data.commitmentComparison.entries.length} compromisos comparados, ${data.instruments.length} normas, ${data.sources.length} fuentes, ${territorialLayers} capas territoriales y 1 lectura de devastación en Madre de Dios.`);
