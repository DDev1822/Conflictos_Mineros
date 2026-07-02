import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import matter from "gray-matter";
import { datasetSchema, type ObservatoryData } from "./schemas";

const CONTENT_ROOT = path.join(process.cwd(), "content", "data");
const files = ["sources", "actors", "territories", "issues", "instruments", "cases", "evidenceRecords", "caseResearchPackets", "legalResearchPackets", "cajamarcaSystemMatrix", "institutionalMechanisms", "alternatives", "socialConflictSnapshots", "socialConflictCases", "miningConflictSelections", "reinfoTerritorialSnapshots", "formalMiningTerritorialSnapshots", "explorationTerritorialSnapshots", "miningConcessionTerritorialSnapshots", "madreDiosDevastation"] as const;

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
  const checkCanonicalMatrixDocuments = (
    values: Array<{ sourceId: string; status: "canonical-source" | "research-target" }>,
    owner: string,
  ) => {
    const missing = values
      .filter((item) => item.status === "canonical-source" && !ids.sources.has(item.sourceId))
      .map((item) => item.sourceId);
    if (missing.length) throw new Error(`${owner} referencia fuentes canónicas inexistentes: ${missing.join(", ")}`);
  };

  data.issues.forEach((item) => check(item.sourceIds, "sources", `Nudo ${item.id}`));
  data.territories.forEach((item) => check([item.coordinateSourceId], "sources", `Territorio ${item.id}`));
  data.instruments.forEach((item) => {
    check(item.issueIds, "issues", `Norma ${item.id}`);
    check(item.sourceIds, "sources", `Norma ${item.id}`);
    check(item.relatedInstrumentIds, "instruments", `Norma ${item.id}`);
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
  data.socialConflictSnapshots.forEach((snapshot) => {
    check([snapshot.sourceId], "sources", `Corte territorial ${snapshot.id}`);
  });
  const caseIds = new Set(data.cases.map((item) => item.id));
  const caseEntityIds = new Set(data.cases.flatMap((item) => [item.id, ...item.timeline.map((event) => event.id), ...item.claims.map((claim) => claim.id)]));
  data.evidenceRecords.forEach((record) => {
    check([record.sourceId], "sources", `Evidencia ${record.id}`);
    if (record.entityType === "instrument" && !ids.instruments.has(record.entityId)) throw new Error(`Evidencia ${record.id} referencia norma inexistente: ${record.entityId}`);
    if (record.entityType !== "instrument" && !caseEntityIds.has(record.entityId)) throw new Error(`Evidencia ${record.id} referencia entidad de caso inexistente: ${record.entityId}`);
  });
  data.caseResearchPackets.forEach((packet) => {
    if (!caseIds.has(packet.caseId)) throw new Error(`Paquete ${packet.id} referencia caso inexistente: ${packet.caseId}`);
    check([...packet.sourceIds, ...packet.directActorSourceIds, ...packet.actorPositions.flatMap((position) => position.sourceIds), ...packet.contradictions.flatMap((item) => item.sourceIds)], "sources", `Paquete ${packet.id}`);
  });
  data.legalResearchPackets.forEach((packet) => {
    if (!ids.instruments.has(packet.instrumentId)) throw new Error(`Paquete ${packet.id} referencia norma inexistente: ${packet.instrumentId}`);
    check([packet.primaryTextSourceId, ...packet.regulationSourceIds, ...packet.amendmentSourceIds], "sources", `Paquete ${packet.id}`);
  });
  const cajamarcaMatrixEntryIds = new Set(data.cajamarcaSystemMatrix.entries.map((entry) => entry.id));
  data.cajamarcaSystemMatrix.entries.forEach((entry) => {
    if (entry.canonicalCaseId && !caseIds.has(entry.canonicalCaseId)) throw new Error(`Matriz Cajamarca ${entry.id} referencia caso canónico inexistente: ${entry.canonicalCaseId}`);
    checkCanonicalMatrixDocuments(entry.primaryDocuments, `Matriz Cajamarca ${entry.id}`);
    const missingConnections = entry.relationshipHooks.connectsTo.filter((entryId) => !cajamarcaMatrixEntryIds.has(entryId));
    if (missingConnections.length) throw new Error(`Matriz Cajamarca ${entry.id} conecta hitos inexistentes: ${missingConnections.join(", ")}`);
  });
  data.institutionalMechanisms.entries.forEach((entry) => {
    checkCanonicalMatrixDocuments(entry.primaryDocumentExamples, `Matriz mecanismos ${entry.mechanismId}`);
  });
  data.miningConflictSelections.forEach((selection) => {
    check([selection.sourceId], "sources", `Selección minera ${selection.id}`);
  });
  data.reinfoTerritorialSnapshots.forEach((snapshot) => {
    check([snapshot.sourceId], "sources", `Corte territorial REINFO ${snapshot.id}`);
  });
  data.formalMiningTerritorialSnapshots.forEach((snapshot) => {
    check([snapshot.sourceId], "sources", `Corte territorial de minería formal ${snapshot.id}`);
  });
  data.explorationTerritorialSnapshots.forEach((snapshot) => {
    check([snapshot.sourceId], "sources", `Corte territorial de exploración ${snapshot.id}`);
  });
  data.miningConcessionTerritorialSnapshots.forEach((snapshot) => {
    check([snapshot.sourceId], "sources", `Corte territorial de concesiones ${snapshot.id}`);
  });
  check([...data.madreDiosDevastation.sourceIds, data.madreDiosDevastation.documentedTotal.sourceId, data.madreDiosDevastation.recentRate.sourceId], "sources", `Devastación Madre de Dios ${data.madreDiosDevastation.id}`);
  const snapshotById = new Map(data.socialConflictSnapshots.map((snapshot) => [snapshot.id, snapshot]));
  data.socialConflictCases.forEach((conflict) => {
    const snapshot = snapshotById.get(conflict.snapshotId);
    if (!snapshot) throw new Error(`Caso social ${conflict.id} referencia un corte inexistente: ${conflict.snapshotId}`);
    const allowedRegions = new Set([...snapshot.regions.map((region) => region.id), "nacional", "multiregional"]);
    const missing = conflict.regionIds.filter((regionId) => !allowedRegions.has(regionId));
    if (missing.length) throw new Error(`Caso social ${conflict.id} referencia ámbitos inexistentes: ${missing.join(", ")}`);
  });

  const socialCaseById = new Map(data.socialConflictCases.map((conflict) => [conflict.id, conflict]));
  data.miningConflictSelections.forEach((selection) => {
    const snapshot = snapshotById.get(selection.snapshotId);
    if (!snapshot) throw new Error(`Selección minera ${selection.id} referencia un corte inexistente: ${selection.snapshotId}`);
    const selectedCases = selection.caseIds.map((caseId) => socialCaseById.get(caseId));
    const missing = selection.caseIds.filter((caseId) => !socialCaseById.has(caseId));
    if (missing.length) throw new Error(`Selección minera ${selection.id} referencia casos inexistentes: ${missing.join(", ")}`);
    if (selectedCases.some((conflict) => conflict?.snapshotId !== selection.snapshotId)) {
      throw new Error(`Selección minera ${selection.id} mezcla casos de otro corte documental`);
    }
    if (selectedCases.some((conflict) => conflict?.conflictType !== "Socioambiental")) {
      throw new Error(`Selección minera ${selection.id} incluye casos no clasificados como socioambientales`);
    }
    const active = selectedCases.filter((conflict) => conflict?.status === "active").length;
    const latent = selectedCases.filter((conflict) => conflict?.status === "latent").length;
    if (active !== selection.active || latent !== selection.latent) {
      throw new Error(`Selección minera ${selection.id} no reconcilia activos y latentes con su registro`);
    }
  });
}

let cached: ObservatoryData | undefined;

export function loadObservatoryData(): ObservatoryData {
  if (cached) return cached;
  const raw = Object.fromEntries(files.map((file) => [file, readYaml(file)]));
  const parsed = datasetSchema.parse(raw);
  files.forEach((key) => {
    const collection = parsed[key];
    if (Array.isArray(collection)) assertUnique(collection.map((item) => item.id), key);
  });
  assertUnique(parsed.cajamarcaSystemMatrix.entries.map((entry) => entry.id), "hitos de matriz Cajamarca");
  assertUnique(parsed.institutionalMechanisms.entries.map((entry) => entry.mechanismId), "mecanismos institucionales");
  parsed.socialConflictSnapshots.forEach((snapshot) => assertUnique(snapshot.regions.map((region) => region.id), `regiones de ${snapshot.id}`));
  parsed.miningConflictSelections.forEach((selection) => assertUnique(selection.caseIds, `casos de ${selection.id}`));
  parsed.reinfoTerritorialSnapshots.forEach((snapshot) => assertUnique(snapshot.regions.map((region) => region.id), `regiones de ${snapshot.id}`));
  parsed.formalMiningTerritorialSnapshots.forEach((snapshot) => assertUnique(snapshot.regions.map((region) => region.id), `regiones de ${snapshot.id}`));
  parsed.explorationTerritorialSnapshots.forEach((snapshot) => assertUnique(snapshot.regions.map((region) => region.id), `regiones de ${snapshot.id}`));
  parsed.miningConcessionTerritorialSnapshots.forEach((snapshot) => assertUnique(snapshot.regions.map((region) => region.id), `regiones de ${snapshot.id}`));
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
