import { z } from "zod";

const id = z.string().regex(/^[a-z0-9-]+$/, "Debe usar minúsculas y guiones");
const isoDate = z.string().date();
const url = z.string().url();
const datePrecision = z.enum(["day", "month", "year"]);

export const claimSchema = z.object({
  id,
  kind: z.enum(["fact", "interpretation", "proposal"]),
  text: z.string().min(20),
  sourceIds: z.array(id).min(1, "Toda afirmación debe tener al menos una fuente"),
  verificationStatus: z.enum(["verified", "partial", "pending"]),
  verifiedAt: isoDate.optional(),
}).superRefine((claim, ctx) => {
  if (claim.verificationStatus === "verified" && !claim.verifiedAt) {
    ctx.addIssue({ code: "custom", path: ["verifiedAt"], message: "Una afirmación verificada requiere fecha" });
  }
});

export const sourceSchema = z.object({
  id,
  title: z.string().min(4),
  institution: z.string().min(2),
  date: isoDate,
  datePrecision,
  url,
  type: z.enum(["official", "academic", "community", "company", "ngo", "press"]),
  perspective: z.enum(["state", "academic", "community", "company", "civil-society", "journalistic"]),
  evidenceLevel: z.enum(["primary", "secondary", "contextual"]),
  accessedAt: isoDate,
  license: z.string().min(2),
  rightsStatus: z.enum(["reusable", "link-only", "permission-required", "unknown"]).default("link-only"),
  verificationStatus: z.enum(["verified", "partial", "pending"]),
  notes: z.string().min(10),
});

export const actorSchema = z.object({
  id,
  name: z.string().min(2),
  type: z.enum(["state", "community", "company", "civil-society", "academic", "collective"]),
  description: z.string().min(10),
});

export const territorySchema = z.object({
  id,
  name: z.string().min(2),
  region: z.string().min(2),
  provinces: z.array(z.string()).min(1),
  coordinates: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]),
  coordinatePrecision: z.enum(["locality", "project-area", "regional"]),
  coordinateSourceId: id,
});

export const normativeIssueSchema = z.object({
  id,
  name: z.string().min(3),
  summary: z.string().min(30),
  status: z.enum(["structural", "active-debate", "implementation-gap"]),
  sourceIds: z.array(id).min(1),
});

export const legalInstrumentSchema = z.object({
  id,
  title: z.string().min(5),
  number: z.string().min(2),
  authority: z.string().min(2),
  publishedAt: isoDate,
  effectiveFrom: isoDate.optional(),
  status: z.literal("documented"),
  documentaryStatus: z.literal("source-reviewed"),
  relevantArticles: z.array(z.string()).default([]),
  issueIds: z.array(id).min(1),
  sourceIds: z.array(id).min(1),
  relatedInstrumentIds: z.array(id),
  lastCheckedAt: isoDate,
  verificationNotes: z.string().min(15),
});

export const timelineEventSchema = z.object({
  id,
  kind: z.enum(["event", "decision", "agreement", "evidence", "publication"]),
  date: isoDate,
  datePrecision,
  title: z.string().min(4),
  summary: z.string().min(15),
  sourceIds: z.array(id).min(1),
});

export const conflictCaseSchema = z.object({
  id,
  slug: id,
  name: z.string().min(2),
  summary: z.string().min(40),
  period: z.object({ start: z.number().int().min(1900), end: z.number().int().min(1900).nullable() }),
  status: z.enum(["active", "latent", "resolved", "historical"]),
  territoryIds: z.array(id).min(1),
  actorIds: z.array(id).min(1),
  issueIds: z.array(id).min(1),
  legalInstrumentIds: z.array(id),
  minerals: z.array(z.string()).min(1),
  timeline: z.array(timelineEventSchema).min(3),
  claims: z.array(claimSchema).min(1),
  cutoffDate: isoDate,
  updatedAt: isoDate,
  reviewStatus: z.literal("documentary"),
  reviewNotes: z.string().min(15),
});

export const evidenceRecordSchema = z.object({
  id,
  sourceId: id,
  entityType: z.enum(["timeline", "claim", "instrument", "case-status", "actor-position"]),
  entityId: id,
  locator: z.string().min(3),
  relation: z.enum(["supports", "qualifies", "contradicts"]),
  summary: z.string().min(20),
  checkedAt: isoDate,
  reviewStatus: z.enum(["reviewed", "pending"]),
});

const researchGapSchema = z.object({
  id,
  description: z.string().min(20),
  blocksRelease: z.boolean(),
});

const researchContradictionSchema = z.object({
  id,
  description: z.string().min(20),
  sourceIds: z.array(id).min(2),
  status: z.enum(["open", "resolved"]),
});

const actorPositionSchema = z.object({
  actor: z.string().min(2),
  position: z.string().min(20),
  sourceIds: z.array(id).min(1),
});

export const caseResearchPacketSchema = z.object({
  id,
  caseId: id,
  depth: z.enum(["standard", "deep"]),
  substantiveMilestoneTarget: z.number().int().min(5).max(8),
  cutoffDate: isoDate,
  currentStatusSummary: z.string().min(40),
  sourceIds: z.array(id).min(3),
  directActorSourceIds: z.array(id).min(1),
  actorPositions: z.array(actorPositionSchema).min(3),
  contradictions: z.array(researchContradictionSchema).min(1),
  scopeQuestions: z.array(z.string().min(20)).min(2),
  gaps: z.array(researchGapSchema),
  status: z.enum(["ready", "incomplete"]),
});

export const commitmentComparisonEntrySchema = z.object({
  id,
  caseId: id,
  timelineEventId: id,
  theme: z.enum([
    "water",
    "environmental-monitoring",
    "social-investment",
    "employment-capacity",
    "dialogue-governance",
    "mobility",
    "formalization",
  ]),
  title: z.string().min(8),
  commitment: z.string().min(30),
  responsibleActors: z.array(z.string().min(3)).min(1),
  territorialScope: z.string().min(5),
  documentBasis: z.enum(["contract-condition", "agreement", "convention", "work-plan", "public-record"]),
  documentaryStage: z.enum(["condition-documented", "agreement-documented", "follow-up-documented", "result-documented"]),
  implementationEvidence: z.enum(["not-located", "partial", "documented"]),
  evidenceSummary: z.string().min(25),
  limit: z.string().min(25),
  sourceIds: z.array(id).min(1),
  checkedAt: isoDate,
});

export const commitmentComparisonSchema = z.object({
  id: z.literal("mining-social-conflict-commitments"),
  cutoffDate: isoDate,
  scope: z.string().min(40),
  methodology: z.string().min(40),
  excludedCaseIds: z.array(id),
  entries: z.array(commitmentComparisonEntrySchema).min(1),
});

export const legalResearchPacketSchema = z.object({
  id,
  instrumentId: id,
  primaryTextSourceId: id,
  regulationSourceIds: z.array(id),
  amendmentSourceIds: z.array(id),
  scopeQuestions: z.array(z.string().min(20)).min(2),
  gaps: z.array(researchGapSchema),
  checkedAt: isoDate,
  status: z.enum(["prepared", "incomplete"]),
});

const matrixDocumentRefSchema = z.object({
  sourceId: id,
  status: z.enum(["canonical-source", "research-target"]),
  locator: z.string().min(3),
});

const relationshipHookSchema = z.object({
  theme: id,
  connectsTo: z.array(id).min(1),
});

export const cajamarcaSystemEntrySchema = z.object({
  id,
  caseSlug: id,
  canonicalCaseId: id.nullable(),
  hito: z.string().min(20),
  institutionType: id,
  primaryDocuments: z.array(matrixDocumentRefSchema).min(1),
  authorityOrActor: z.string().min(5),
  controversy: z.string().min(20),
  stateAtCutoff: z.string().min(30),
  editorialCaution: z.string().min(20),
  scopeQuestion: z.string().min(20),
  relationshipHooks: relationshipHookSchema,
});

export const cajamarcaSystemMatrixSchema = z.object({
  matrixId: z.literal("cajamarca-system"),
  status: z.enum(["canonicalized", "working-structured-matrix"]),
  cutoffDate: isoDate,
  canonicalStatus: z.enum(["canonical-data", "non-canonical-research"]),
  purpose: z.string().min(40),
  sourceReadings: z.array(z.string().min(3)).min(1),
  columns: z.array(z.string().min(2)).min(1),
  entries: z.array(cajamarcaSystemEntrySchema).min(1),
  publicationGates: z.array(z.string().min(20)).min(1),
});

export const institutionalMechanismEntrySchema = z.object({
  mechanismId: id,
  family: id,
  cases: z.array(id).min(1),
  primaryDocumentExamples: z.array(matrixDocumentRefSchema).min(1),
  authority: z.string().min(5),
  obligationOrDecision: z.string().min(20),
  status: z.string().min(20),
  followUpEvidence: z.string().min(20),
  editorialRisk: z.string().min(20),
  scopeQuestion: z.string().min(20),
  relationshipUse: z.string().min(20),
});

export const institutionalMechanismsMatrixSchema = z.object({
  matrixId: z.literal("institutional-mechanisms"),
  status: z.enum(["canonicalized", "working-structured-matrix"]),
  cutoffDate: isoDate,
  canonicalStatus: z.enum(["canonical-data", "non-canonical-research"]),
  purpose: z.string().min(40),
  sourceReadings: z.array(z.string().min(3)).min(1),
  columns: z.array(z.string().min(2)).min(1),
  entries: z.array(institutionalMechanismEntrySchema).min(1),
  publicationGates: z.array(z.string().min(20)).min(1),
});

export const policyAlternativeSchema = z.object({
  id,
  title: z.string().min(4),
  problem: z.string().min(20),
  mechanism: z.string().min(20),
  proponents: z.array(z.string()).min(1),
  benefits: z.array(z.string()).min(1),
  risks: z.array(z.string()).min(1),
  dependencies: z.array(z.string()),
  status: z.enum(["documented", "under-debate", "pilot"]),
  issueIds: z.array(id).min(1),
  sourceIds: z.array(id).min(1),
});

export const socialConflictRegionSchema = z.object({
  id,
  name: z.string().min(2),
  coordinates: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]),
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  latent: z.number().int().nonnegative(),
}).superRefine((region, ctx) => {
  if (region.active + region.latent !== region.total) {
    ctx.addIssue({ code: "custom", path: ["total"], message: "El total regional debe ser igual a activos más latentes" });
  }
});

export const socialConflictCaseSchema = z.object({
  id,
  snapshotId: id,
  title: z.string().min(4),
  titleMethod: z.enum(["report-denomination", "editorial-summary"]),
  status: z.enum(["active", "latent"]),
  conflictType: z.enum([
    "Socioambiental",
    "Asuntos de gobierno nacional",
    "Asuntos de gobierno regional",
    "Asuntos de gobierno local",
    "Comunal",
    "Demarcación territorial",
    "Otros asuntos",
    "Laboral",
  ]),
  regionIds: z.array(id).min(1),
  startPeriod: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  sourcePage: z.number().int().min(37).max(120),
  hasMonthlyEvents: z.boolean(),
  summary: z.string().min(20).optional(),
  location: z.string().min(5).optional(),
}).superRefine((conflict, ctx) => {
  if (conflict.titleMethod === "editorial-summary" && !conflict.summary) {
    ctx.addIssue({ code: "custom", path: ["summary"], message: "Una síntesis editorial requiere conservar la descripción fuente" });
  }
});

export const socialConflictSnapshotSchema = z.object({
  id,
  title: z.string().min(10),
  scope: z.enum(["all-social-internal", "mining-public"]),
  reportNumber: z.number().int().positive(),
  reportingPeriod: z.string().regex(/^\d{4}-\d{2}$/),
  cutoffDate: isoDate,
  publishedAt: isoDate,
  datePrecision,
  sourceId: id,
  totalRegistered: z.number().int().positive(),
  active: z.number().int().nonnegative(),
  latent: z.number().int().nonnegative(),
  national: z.object({ total: z.number().int().nonnegative(), active: z.number().int().nonnegative(), latent: z.number().int().nonnegative() }),
  multiregional: z.object({ total: z.number().int().nonnegative(), active: z.number().int().nonnegative(), latent: z.number().int().nonnegative() }),
  regions: z.array(socialConflictRegionSchema).min(1),
  coordinateMethod: z.string().min(20),
  notes: z.string().min(30),
}).superRefine((snapshot, ctx) => {
  if (snapshot.active + snapshot.latent !== snapshot.totalRegistered) {
    ctx.addIssue({ code: "custom", path: ["totalRegistered"], message: "El total nacional debe ser igual a activos más latentes" });
  }
  const regionalTotal = snapshot.regions.reduce((sum, region) => sum + region.total, 0);
  if (regionalTotal + snapshot.national.total + snapshot.multiregional.total !== snapshot.totalRegistered) {
    ctx.addIssue({ code: "custom", path: ["regions"], message: "La distribución territorial no reconcilia con el total registrado" });
  }
});

export const miningConflictSelectionSchema = z.object({
  id,
  snapshotId: id,
  title: z.string().min(10),
  sourceId: id,
  sourcePage: z.number().int().positive(),
  totalRegistered: z.number().int().positive(),
  active: z.number().int().nonnegative(),
  latent: z.number().int().nonnegative(),
  classificationMethod: z.string().min(30),
  notes: z.string().min(30),
  caseIds: z.array(id).min(1),
}).superRefine((selection, ctx) => {
  if (selection.active + selection.latent !== selection.totalRegistered) {
    ctx.addIssue({ code: "custom", path: ["totalRegistered"], message: "El total minero debe ser igual a activos más latentes" });
  }
  if (selection.caseIds.length !== selection.totalRegistered) {
    ctx.addIssue({ code: "custom", path: ["caseIds"], message: "La selección minera debe reconciliar con el total declarado" });
  }
});

export const reinfoTerritorialRegionSchema = z.object({
  id,
  name: z.string().min(2),
  coordinates: z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]),
  count: z.number().int().nonnegative(),
});

export const reinfoTerritorialSnapshotSchema = z.object({
  id,
  title: z.string().min(10),
  cutoffDate: isoDate,
  accessedAt: isoDate,
  sourceId: id,
  status: z.literal("vigente"),
  totalRegistered: z.number().int().positive(),
  regions: z.array(reinfoTerritorialRegionSchema).min(1),
  coordinateMethod: z.string().min(20),
  notes: z.string().min(30),
}).superRefine((snapshot, ctx) => {
  const regionalTotal = snapshot.regions.reduce((sum, region) => sum + region.count, 0);
  if (regionalTotal !== snapshot.totalRegistered) {
    ctx.addIssue({ code: "custom", path: ["regions"], message: "La distribución territorial del REINFO no reconcilia con el total consultado" });
  }
});

export const formalMiningTerritorialSnapshotSchema = z.object({
  id,
  title: z.string().min(10),
  cutoffDate: isoDate,
  accessedAt: isoDate,
  sourceId: id,
  cutoffBasis: z.literal("access-date"),
  unitDefinition: z.string().min(30),
  totalUnits: z.number().int().positive(),
  mappedUnits: z.number().int().positive(),
  unmappedUnits: z.number().int().nonnegative(),
  regions: z.array(reinfoTerritorialRegionSchema).min(1),
  coordinateMethod: z.string().min(20),
  notes: z.string().min(30),
}).superRefine((snapshot, ctx) => {
  const regionalTotal = snapshot.regions.reduce((sum, region) => sum + region.count, 0);
  if (regionalTotal !== snapshot.mappedUnits) {
    ctx.addIssue({ code: "custom", path: ["regions"], message: "La distribución territorial de minería formal no reconcilia con las unidades mapeadas" });
  }
  if (snapshot.mappedUnits + snapshot.unmappedUnits !== snapshot.totalUnits) {
    ctx.addIssue({ code: "custom", path: ["totalUnits"], message: "Las unidades mapeadas y no mapeadas no reconcilian con el total de la fuente" });
  }
});

export const explorationTerritorialRegionSchema = reinfoTerritorialRegionSchema.extend({
  areaHectares: z.number().nonnegative(),
});

export const explorationTerritorialSnapshotSchema = z.object({
  id,
  title: z.string().min(10),
  cutoffDate: isoDate,
  accessedAt: isoDate,
  sourceId: id,
  cutoffBasis: z.literal("access-date"),
  unitDefinition: z.string().min(30),
  totalProjects: z.number().int().positive(),
  totalAreaHectares: z.number().positive(),
  regions: z.array(explorationTerritorialRegionSchema).min(1),
  coordinateMethod: z.string().min(20),
  notes: z.string().min(30),
}).superRefine((snapshot, ctx) => {
  const regionalTotal = snapshot.regions.reduce((sum, region) => sum + region.count, 0);
  if (regionalTotal !== snapshot.totalProjects) {
    ctx.addIssue({ code: "custom", path: ["regions"], message: "La distribución territorial de exploración no reconcilia con el total de expedientes" });
  }
  const regionalArea = snapshot.regions.reduce((sum, region) => sum + region.areaHectares, 0);
  if (Math.abs(regionalArea - snapshot.totalAreaHectares) > 0.1) {
    ctx.addIssue({ code: "custom", path: ["regions"], message: "El área territorial de exploración no reconcilia con el total" });
  }
});

export const miningConcessionTerritorialSnapshotSchema = z.object({
  id,
  title: z.string().min(10),
  cutoffDate: isoDate,
  accessedAt: isoDate,
  sourceId: id,
  cutoffBasis: z.literal("daily-service-access-date"),
  status: z.literal("titulado"),
  unitDefinition: z.string().min(30),
  totalRights: z.number().int().positive(),
  mappedRights: z.number().int().positive(),
  unmappedRights: z.number().int().nonnegative(),
  regionalPresences: z.number().int().positive(),
  totalAreaHectares: z.number().positive(),
  regions: z.array(reinfoTerritorialRegionSchema).min(1),
  coordinateMethod: z.string().min(20),
  notes: z.string().min(30),
}).superRefine((snapshot, ctx) => {
  const regionalTotal = snapshot.regions.reduce((sum, region) => sum + region.count, 0);
  if (regionalTotal !== snapshot.regionalPresences) {
    ctx.addIssue({ code: "custom", path: ["regions"], message: "Las presencias departamentales de concesiones no reconcilian con la distribución territorial" });
  }
  if (snapshot.mappedRights + snapshot.unmappedRights !== snapshot.totalRights) {
    ctx.addIssue({ code: "custom", path: ["totalRights"], message: "Los derechos mapeados y no mapeados no reconcilian con el total titulado" });
  }
});

export const madreDiosDevastationSchema = z.object({
  id,
  title: z.string().min(10),
  region: z.literal("Madre de Dios"),
  cutoffDate: isoDate,
  sourceIds: z.array(id).min(2),
  documentedTotal: z.object({
    hectares: z.number().positive(),
    label: z.string().min(30),
    sourceId: id,
    locator: z.string().min(10),
  }),
  recentRate: z.object({
    scope: z.string().min(20),
    observedHectares: z.number().positive(),
    periodStart: isoDate,
    periodEnd: isoDate,
    observedDays: z.number().int().positive(),
    hectaresPerDay: z.number().positive(),
    hectaresPerHour: z.number().positive(),
    projectionStartAt: z.string().min(10),
    projectionBaseHectares: z.number().nonnegative(),
    sourceId: id,
    locator: z.string().min(10),
  }),
  projectionYears: z.array(z.object({
    years: z.number().int().positive(),
    projectedHectares: z.number().positive(),
  })).min(1),
  caveat: z.string().min(40),
}).superRefine((item, ctx) => {
  const sourceIds = new Set(item.sourceIds);
  if (!sourceIds.has(item.documentedTotal.sourceId)) {
    ctx.addIssue({ code: "custom", path: ["documentedTotal", "sourceId"], message: "La fuente del total documentado debe figurar en sourceIds" });
  }
  if (!sourceIds.has(item.recentRate.sourceId)) {
    ctx.addIssue({ code: "custom", path: ["recentRate", "sourceId"], message: "La fuente de la tasa reciente debe figurar en sourceIds" });
  }

  const projectionStart = Date.parse(item.recentRate.projectionStartAt);
  if (Number.isNaN(projectionStart)) {
    ctx.addIssue({ code: "custom", path: ["recentRate", "projectionStartAt"], message: "La fecha de inicio de proyección debe ser parseable" });
  } else {
    const observedPeriodEnd = Date.parse(item.recentRate.periodEnd);
    if (!Number.isNaN(observedPeriodEnd) && projectionStart < observedPeriodEnd) {
      ctx.addIssue({ code: "custom", path: ["recentRate", "projectionStartAt"], message: "La proyección no debe comenzar antes del fin del periodo observado" });
    }
  }

  const expectedPerDay = item.recentRate.observedHectares / item.recentRate.observedDays;
  if (Math.abs(expectedPerDay - item.recentRate.hectaresPerDay) > 0.01) {
    ctx.addIssue({ code: "custom", path: ["recentRate", "hectaresPerDay"], message: "La tasa diaria no reconcilia con hectáreas/días observados" });
  }
  if (Math.abs(item.recentRate.hectaresPerDay / 24 - item.recentRate.hectaresPerHour) > 0.001) {
    ctx.addIssue({ code: "custom", path: ["recentRate", "hectaresPerHour"], message: "La tasa horaria no reconcilia con la tasa diaria" });
  }
  const projectionYears = [...item.projectionYears].sort((a, b) => a.years - b.years);
  if (projectionYears.some((entry, index) => index > 0 && entry.years === projectionYears[index - 1].years)) {
    ctx.addIssue({ code: "custom", path: ["projectionYears"], message: "Las proyecciones no deben repetir horizontes temporales" });
  }
  item.projectionYears.forEach((entry, index) => {
    const expectedProjection = Math.round(item.recentRate.hectaresPerDay * 365 * entry.years);
    if (Math.abs(expectedProjection - entry.projectedHectares) > 1) {
      ctx.addIssue({ code: "custom", path: ["projectionYears", index, "projectedHectares"], message: "La proyección anual no reconcilia con la tasa diaria declarada" });
    }
  });
});

export const academicResearchItemSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(10),
  authors: z.array(z.string().min(3)).min(1),
  year: z.number().int().min(1900).max(2100),
  university: z.string().min(5),
  degreeLevel: z.enum(["pregrado", "maestria", "doctorado"]),
  repository: z.string().min(3),
  recordUrl: z.url(),
  resourceUrl: z.url().optional(),
  accessStatus: z.enum(["open", "metadata-only", "restricted"]),
  axis: z.enum(["conflictos-sociales-mineros", "mineria-ilegal-e-informal", "reinfo-y-formalizacion"]),
  regions: z.array(z.string().min(2)).min(1),
  caseSlugs: z.array(z.string().min(2)),
  topics: z.array(z.string().min(3)).min(1),
  editorialSummary: z.string().min(80),
  cataloguedAt: z.iso.date(),
});

export const datasetSchema = z.object({
  sources: z.array(sourceSchema),
  actors: z.array(actorSchema),
  territories: z.array(territorySchema),
  issues: z.array(normativeIssueSchema),
  instruments: z.array(legalInstrumentSchema),
  cases: z.array(conflictCaseSchema),
  evidenceRecords: z.array(evidenceRecordSchema),
  caseResearchPackets: z.array(caseResearchPacketSchema),
  commitmentComparison: commitmentComparisonSchema,
  legalResearchPackets: z.array(legalResearchPacketSchema),
  cajamarcaSystemMatrix: cajamarcaSystemMatrixSchema,
  institutionalMechanisms: institutionalMechanismsMatrixSchema,
  alternatives: z.array(policyAlternativeSchema),
  socialConflictSnapshots: z.array(socialConflictSnapshotSchema).min(1),
  socialConflictCases: z.array(socialConflictCaseSchema).min(1),
  miningConflictSelections: z.array(miningConflictSelectionSchema).min(1),
  reinfoTerritorialSnapshots: z.array(reinfoTerritorialSnapshotSchema).min(1),
  formalMiningTerritorialSnapshots: z.array(formalMiningTerritorialSnapshotSchema).min(1),
  explorationTerritorialSnapshots: z.array(explorationTerritorialSnapshotSchema).min(1),
  miningConcessionTerritorialSnapshots: z.array(miningConcessionTerritorialSnapshotSchema).min(1),
  madreDiosDevastation: madreDiosDevastationSchema,
  academicResearch: z.array(academicResearchItemSchema).min(1),
});

export type ObservatoryData = z.infer<typeof datasetSchema>;
export type ConflictCase = z.infer<typeof conflictCaseSchema>;
export type LegalInstrument = z.infer<typeof legalInstrumentSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Actor = z.infer<typeof actorSchema>;
export type Territory = z.infer<typeof territorySchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type EvidenceRecord = z.infer<typeof evidenceRecordSchema>;
export type CaseResearchPacket = z.infer<typeof caseResearchPacketSchema>;
export type CommitmentComparison = z.infer<typeof commitmentComparisonSchema>;
export type CommitmentComparisonEntry = z.infer<typeof commitmentComparisonEntrySchema>;
export type LegalResearchPacket = z.infer<typeof legalResearchPacketSchema>;
export type CajamarcaSystemMatrix = z.infer<typeof cajamarcaSystemMatrixSchema>;
export type CajamarcaSystemEntry = z.infer<typeof cajamarcaSystemEntrySchema>;
export type InstitutionalMechanismsMatrix = z.infer<typeof institutionalMechanismsMatrixSchema>;
export type InstitutionalMechanismEntry = z.infer<typeof institutionalMechanismEntrySchema>;
export type NormativeIssue = z.infer<typeof normativeIssueSchema>;
export type AcademicResearchItem = z.infer<typeof academicResearchItemSchema>;
export type PolicyAlternative = z.infer<typeof policyAlternativeSchema>;
export type SocialConflictRegion = z.infer<typeof socialConflictRegionSchema>;
export type SocialConflictSnapshot = z.infer<typeof socialConflictSnapshotSchema>;
export type SocialConflictCase = z.infer<typeof socialConflictCaseSchema>;
export type MiningConflictSelection = z.infer<typeof miningConflictSelectionSchema>;
export type ReinfoTerritorialSnapshot = z.infer<typeof reinfoTerritorialSnapshotSchema>;
export type FormalMiningTerritorialSnapshot = z.infer<typeof formalMiningTerritorialSnapshotSchema>;
export type ExplorationTerritorialSnapshot = z.infer<typeof explorationTerritorialSnapshotSchema>;
export type MiningConcessionTerritorialSnapshot = z.infer<typeof miningConcessionTerritorialSnapshotSchema>;
export type MadreDiosDevastation = z.infer<typeof madreDiosDevastationSchema>;
