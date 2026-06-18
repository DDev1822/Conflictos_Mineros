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

const sourceTypes = Object.entries(
  data.sources.reduce<Record<string, number>>((counts, source) => {
    counts[source.type] = (counts[source.type] ?? 0) + 1;
    return counts;
  }, {}),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([type, count]) => `${type}: ${count}`)
  .join(", ");

console.log(`Auditoría editorial: ${data.cases.length} casos, ${data.sources.length} fuentes, ${data.instruments.length} normas.`);
console.log(`Cobertura por tipo de fuente: ${sourceTypes}.`);
warnings.forEach((warning) => console.warn(`ADVERTENCIA: ${warning}`));

if (errors.length) {
  errors.forEach((error) => console.error(`ERROR: ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Controles obligatorios superados; ${warnings.length} advertencias editoriales abiertas.`);
}
