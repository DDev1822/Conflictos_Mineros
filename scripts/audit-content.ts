import { loadObservatoryData } from "../src/lib/content";

const data = loadObservatoryData();
const sourceById = new Map(data.sources.map((source) => [source.id, source]));
const errors: string[] = [];
const warnings: string[] = [];

function checkDatePrecision(date: string, precision: "day" | "month" | "year", owner: string) {
  if (precision === "year" && !date.endsWith("-01-01")) {
    errors.push(`${owner}: una fecha con precisión anual debe usar YYYY-01-01`);
  }
  if (precision === "month" && !date.endsWith("-01")) {
    errors.push(`${owner}: una fecha con precisión mensual debe usar YYYY-MM-01`);
  }
}

data.sources.forEach((source) => {
  checkDatePrecision(source.date, source.datePrecision, `Fuente ${source.id}`);
  if (source.evidenceLevel === "primary" && source.verificationStatus === "pending") {
    errors.push(`Fuente ${source.id}: una fuente primaria no puede quedar sin verificación mínima`);
  }
});

data.cases.forEach((item) => {
  const directSourceIds = new Set([
    ...item.timeline.flatMap((event) => event.sourceIds),
    ...item.claims.flatMap((claim) => claim.sourceIds),
  ]);
  const perspectives = new Set(
    [...directSourceIds].map((sourceId) => sourceById.get(sourceId)?.perspective).filter(Boolean),
  );

  item.timeline.forEach((event) => checkDatePrecision(event.date, event.datePrecision, `Hito ${event.id}`));

  if (directSourceIds.size < 3) {
    errors.push(`Caso ${item.id}: solo tiene ${directSourceIds.size} fuentes directas; el mínimo editorial es 3`);
  }
  if (![...perspectives].some((perspective) => perspective !== "state")) {
    errors.push(`Caso ${item.id}: no incorpora una perspectiva no estatal`);
  }
  if (item.timeline.length < 3) {
    warnings.push(`Caso ${item.id}: la cronología tiene ${item.timeline.length} hitos; ampliar antes de declarar expediente maduro`);
  }
  if (item.claims.some((claim) => claim.verificationStatus === "pending")) {
    warnings.push(`Caso ${item.id}: conserva afirmaciones pendientes de contraste editorial`);
  }
});

data.instruments.forEach((instrument) => {
  if (instrument.relatedInstrumentIds.includes(instrument.id)) {
    errors.push(`Norma ${instrument.id}: no puede relacionarse consigo misma`);
  }
  const hasPrimarySource = instrument.sourceIds.some((sourceId) => sourceById.get(sourceId)?.evidenceLevel === "primary");
  const hasLocator = data.evidenceRecords.some((record) => record.entityType === "instrument" && record.entityId === instrument.id && record.locator.trim().length >= 3);
  if (!hasPrimarySource || !hasLocator) {
    warnings.push(`Norma ${instrument.id}: falta texto primario o locador documental al ${instrument.lastCheckedAt}`);
  }
});

data.socialConflictSnapshots.forEach((snapshot) => {
  checkDatePrecision(snapshot.publishedAt, snapshot.datePrecision, `Corte territorial ${snapshot.id}`);
  if (new Set(snapshot.regions.map((region) => region.coordinates.join(","))).size !== snapshot.regions.length) {
    errors.push(`Corte territorial ${snapshot.id}: dos regiones comparten el mismo punto de referencia`);
  }
  if (snapshot.regions.some((region) => region.total !== region.active + region.latent)) {
    errors.push(`Corte territorial ${snapshot.id}: hay totales regionales que no reconcilian`);
  }
  const registry = data.socialConflictCases.filter((item) => item.snapshotId === snapshot.id);
  if (registry.length !== snapshot.totalRegistered) {
    errors.push(`Corte territorial ${snapshot.id}: el registro contiene ${registry.length} casos y el total declara ${snapshot.totalRegistered}`);
  }
  for (const region of snapshot.regions) {
    const cases = registry.filter((item) => item.regionIds.includes(region.id));
    const active = cases.filter((item) => item.status === "active").length;
    const latent = cases.filter((item) => item.status === "latent").length;
    if (cases.length !== region.total || active !== region.active || latent !== region.latent) {
      errors.push(`Corte territorial ${snapshot.id}: ${region.name} no reconcilia con su registro de casos`);
    }
  }
});

data.socialConflictCases.forEach((item) => {
  if (item.titleMethod === "editorial-summary" && !item.summary) {
    errors.push(`Caso social ${item.id}: una síntesis editorial no conserva la descripción fuente`);
  }
});

data.miningConflictSelections.forEach((selection) => {
  const selectedIds = new Set(selection.caseIds);
  const registry = data.socialConflictCases.filter((item) => selectedIds.has(item.id));
  const active = registry.filter((item) => item.status === "active").length;
  const latent = registry.filter((item) => item.status === "latent").length;
  if (registry.length !== selection.totalRegistered || active !== selection.active || latent !== selection.latent) {
    errors.push(`Selección minera ${selection.id}: el registro no reconcilia con el total, activos y latentes declarados`);
  }
  if (registry.some((item) => item.conflictType !== "Socioambiental")) {
    errors.push(`Selección minera ${selection.id}: contiene casos fuera del tipo socioambiental`);
  }
});

const sourceTypes = Object.entries(
  data.sources.reduce<Record<string, number>>((counts, source) => {
    counts[source.type] = (counts[source.type] ?? 0) + 1;
    return counts;
  }, {}),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([type, count]) => `${type}: ${count}`)
  .join(", ");

console.log(`Auditoría editorial: ${data.cases.length} expedientes piloto, ${data.socialConflictCases.length} casos del corte social, ${data.miningConflictSelections[0].totalRegistered} conflictos socioambientales mineros, ${data.sources.length} fuentes, ${data.instruments.length} normas.`);
console.log(`Cobertura por tipo de fuente: ${sourceTypes}.`);
warnings.forEach((warning) => console.warn(`ADVERTENCIA: ${warning}`));

if (errors.length) {
  errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Controles obligatorios superados; ${warnings.length} advertencias editoriales abiertas.`);
}
