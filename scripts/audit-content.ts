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
  if (instrument.legalReviewStatus === "pending") {
    warnings.push(`Norma ${instrument.id}: revisión jurídica pendiente al ${instrument.lastCheckedAt}`);
  }
});

data.miningConflictSnapshots.forEach((snapshot) => {
  checkDatePrecision(snapshot.publishedAt, snapshot.datePrecision, `Corte territorial ${snapshot.id}`);
  if (new Set(snapshot.regions.map((region) => region.coordinates.join(","))).size !== snapshot.regions.length) {
    errors.push(`Corte territorial ${snapshot.id}: dos regiones comparten el mismo punto de referencia`);
  }
  if (snapshot.regions.some((region) => region.total !== region.active + region.latent)) {
    errors.push(`Corte territorial ${snapshot.id}: hay totales regionales que no reconcilian`);
  }
  const registry = data.miningSocialConflictCases.filter((item) => item.snapshotId === snapshot.id);
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

data.miningSocialConflictCases.forEach((item) => {
  if (item.titleMethod === "editorial-summary" && !item.summary) {
    errors.push(`Caso minero ${item.id}: una síntesis editorial no conserva la descripción fuente`);
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

console.log(`Auditoría editorial: ${data.cases.length} expedientes piloto, ${data.miningSocialConflictCases.length} casos del corte minero, ${data.sources.length} fuentes, ${data.instruments.length} normas.`);
console.log(`Cobertura por tipo de fuente: ${sourceTypes}.`);
warnings.forEach((warning) => console.warn(`ADVERTENCIA: ${warning}`));

if (errors.length) {
  errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Controles obligatorios superados; ${warnings.length} advertencias editoriales abiertas.`);
}
