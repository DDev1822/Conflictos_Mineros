import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import matter from "gray-matter";
import { datasetSchema, type ObservatoryData } from "./schemas";

const CONTENT_ROOT = path.join(process.cwd(), "content", "data");
const files = ["sources", "actors", "territories", "issues", "instruments", "cases", "alternatives"] as const;

function readYaml<T>(name: string): T {
  const file = path.join(CONTENT_ROOT, `${name}.yaml`);
  return YAML.parse(fs.readFileSync(file, "utf8")) as T;
}

function assertUnique(values: string[], collection: string) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  if (duplicates.length) throw new Error(`IDs duplicados en ${collection}: ${[...new Set(duplicates)].join(", ")}`);
}

function assertReferences(data: ObservatoryData) {
  const ids = {
    sources: new Set(data.sources.map((item) => item.id)),
    actors: new Set(data.actors.map((item) => item.id)),
    territories: new Set(data.territories.map((item) => item.id)),
    issues: new Set(data.issues.map((item) => item.id)),
    instruments: new Set(data.instruments.map((item) => item.id)),
  };
  const check = (values: string[], target: keyof typeof ids, owner: string) => {
    const missing = values.filter((value) => !ids[target].has(value));
    if (missing.length) throw new Error(`${owner} referencia ${target} inexistentes: ${missing.join(", ")}`);
  };

  data.issues.forEach((item) => check(item.sourceIds, "sources", `Nudo ${item.id}`));
  data.instruments.forEach((item) => {
    check(item.issueIds, "issues", `Norma ${item.id}`);
    check(item.sourceIds, "sources", `Norma ${item.id}`);
  });
  data.cases.forEach((item) => {
    check(item.territoryIds, "territories", `Caso ${item.id}`);
    check(item.actorIds, "actors", `Caso ${item.id}`);
    check(item.issueIds, "issues", `Caso ${item.id}`);
    check(item.legalInstrumentIds, "instruments", `Caso ${item.id}`);
    item.timeline.forEach((event) => check(event.sourceIds, "sources", `Hito ${event.id}`));
    item.claims.forEach((claim) => check(claim.sourceIds, "sources", `Afirmación ${claim.id}`));
  });
  data.alternatives.forEach((item) => {
    check(item.issueIds, "issues", `Alternativa ${item.id}`);
    check(item.sourceIds, "sources", `Alternativa ${item.id}`);
  });
}

let cached: ObservatoryData | undefined;

export function loadObservatoryData(): ObservatoryData {
  if (cached) return cached;
  const raw = Object.fromEntries(files.map((file) => [file, readYaml(file)]));
  const parsed = datasetSchema.parse(raw);
  files.forEach((key) => assertUnique(parsed[key].map((item) => item.id), key));
  assertUnique(parsed.cases.map((item) => item.slug), "slugs de casos");
  assertReferences(parsed);
  cached = parsed;
  return parsed;
}

export function getCaseBySlug(slug: string) {
  return loadObservatoryData().cases.find((item) => item.slug === slug);
}

export function loadNarrative(slug: string) {
  const raw = fs.readFileSync(path.join(process.cwd(), "content", "narratives", `${slug}.mdx`), "utf8");
  return matter(raw).content;
}

export function resetContentCache() {
  cached = undefined;
}
