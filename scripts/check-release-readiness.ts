import { loadReleaseState } from "../src/lib/release-state";

const { readiness: result } = loadReleaseState();

console.log(JSON.stringify({ academic_publication_ready: result.ready, ...result.metrics }, null, 2));
result.notices.forEach((notice) => console.warn(`AVISO: ${notice}`));

if (!result.ready) {
  result.issues.forEach((issue) => console.error(`BLOQUEO: ${issue}`));
  process.exitCode = 1;
} else {
  console.log("Observatorio académico listo para publicación informativa.");
}
