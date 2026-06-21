import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { loadObservatoryData } from "../src/lib/content";
import { evaluateReleaseReadiness, releaseManifestSchema, releaseRisksSchema } from "../src/lib/release-readiness";

function readYaml(file: string) {
  return YAML.parse(fs.readFileSync(path.join(process.cwd(), file), "utf8"));
}

const manifest = releaseManifestSchema.parse(readYaml("docs/release/v1-manifest.yaml"));
const risks = releaseRisksSchema.parse(readYaml("docs/release/v1-risks.yaml"));
const result = evaluateReleaseReadiness(loadObservatoryData(), manifest, risks);

console.log(JSON.stringify({ release_ready: result.ready, ...result.metrics }, null, 2));

if (!result.ready) {
  result.issues.forEach((issue) => console.error(`BLOQUEO: ${issue}`));
  process.exitCode = 1;
} else {
  console.log("V1 lista para publicación controlada.");
}
