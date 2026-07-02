import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { loadObservatoryData } from "./content";
import {
  evaluateReleaseReadiness,
  releaseManifestSchema,
  releaseRisksSchema,
  type ReleaseManifest,
  type ReleaseRisk,
} from "./release-readiness";
import type { ObservatoryData } from "./schemas";

function readYaml(file: string) {
  return YAML.parse(fs.readFileSync(path.join(process.cwd(), file), "utf8"));
}

export function loadReleaseManifest(): ReleaseManifest {
  return releaseManifestSchema.parse(readYaml("docs/release/v1-manifest.yaml"));
}

export function loadReleaseRisks(): ReleaseRisk[] {
  return releaseRisksSchema.parse(readYaml("docs/release/v1-risks.yaml"));
}

export function loadReleaseState(data: ObservatoryData = loadObservatoryData()) {
  const manifest = loadReleaseManifest();
  const risks = loadReleaseRisks();
  const readiness = evaluateReleaseReadiness(data, manifest, risks);

  return { manifest, risks, readiness };
}
