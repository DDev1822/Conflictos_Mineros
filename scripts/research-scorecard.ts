import { loadObservatoryData } from "../src/lib/content";
import { evaluateResearchReadiness } from "../src/lib/research-readiness";

const result = evaluateResearchReadiness(loadObservatoryData());

console.log(JSON.stringify({ research_ready: result.ready, ...result.metrics }, null, 2));
if (!result.ready) {
  result.issues.forEach((issue) => console.error(`VACÍO: ${issue}`));
  process.exitCode = 1;
}
