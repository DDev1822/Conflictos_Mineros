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
  status: z.enum(["in-force", "modified", "repealed", "pending-review"]),
  legalReviewStatus: z.enum(["verified", "pending"]),
  verifiedAt: isoDate.optional(),
  relevantArticles: z.array(z.string()).default([]),
  issueIds: z.array(id).min(1),
  sourceIds: z.array(id).min(1),
  relatedInstrumentIds: z.array(id),
  lastCheckedAt: isoDate,
  verificationNotes: z.string().min(15),
}).superRefine((instrument, ctx) => {
  if (instrument.status === "in-force" && instrument.legalReviewStatus !== "verified") {
    ctx.addIssue({ code: "custom", path: ["legalReviewStatus"], message: "Una norma vigente requiere revisión jurídica verificada" });
  }
  if (instrument.legalReviewStatus === "verified" && !instrument.verifiedAt) {
    ctx.addIssue({ code: "custom", path: ["verifiedAt"], message: "La revisión jurídica verificada requiere fecha" });
  }
});

export const timelineEventSchema = z.object({
  id,
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
  timeline: z.array(timelineEventSchema).min(2),
  claims: z.array(claimSchema).min(1),
  cutoffDate: isoDate,
  updatedAt: isoDate,
  reviewStatus: z.enum(["documentary", "legal-pending", "legal-verified"]),
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
  sourcePage: z.number().int().min(37).max(75),
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

export const datasetSchema = z.object({
  sources: z.array(sourceSchema),
  actors: z.array(actorSchema),
  territories: z.array(territorySchema),
  issues: z.array(normativeIssueSchema),
  instruments: z.array(legalInstrumentSchema),
  cases: z.array(conflictCaseSchema),
  alternatives: z.array(policyAlternativeSchema),
  socialConflictSnapshots: z.array(socialConflictSnapshotSchema).min(1),
  socialConflictCases: z.array(socialConflictCaseSchema).min(1),
  reinfoTerritorialSnapshots: z.array(reinfoTerritorialSnapshotSchema).min(1),
  formalMiningTerritorialSnapshots: z.array(formalMiningTerritorialSnapshotSchema).min(1),
  explorationTerritorialSnapshots: z.array(explorationTerritorialSnapshotSchema).min(1),
  miningConcessionTerritorialSnapshots: z.array(miningConcessionTerritorialSnapshotSchema).min(1),
  miningConflictSnapshots: z.array(socialConflictSnapshotSchema).min(1),
  miningSocialConflictCases: z.array(socialConflictCaseSchema).min(1),
});

export type ObservatoryData = z.infer<typeof datasetSchema>;
export type ConflictCase = z.infer<typeof conflictCaseSchema>;
export type LegalInstrument = z.infer<typeof legalInstrumentSchema>;
export type Claim = z.infer<typeof claimSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Actor = z.infer<typeof actorSchema>;
export type Territory = z.infer<typeof territorySchema>;
export type TimelineEvent = z.infer<typeof timelineEventSchema>;
export type NormativeIssue = z.infer<typeof normativeIssueSchema>;
export type PolicyAlternative = z.infer<typeof policyAlternativeSchema>;
export type SocialConflictRegion = z.infer<typeof socialConflictRegionSchema>;
export type SocialConflictSnapshot = z.infer<typeof socialConflictSnapshotSchema>;
export type SocialConflictCase = z.infer<typeof socialConflictCaseSchema>;
export type ReinfoTerritorialSnapshot = z.infer<typeof reinfoTerritorialSnapshotSchema>;
export type FormalMiningTerritorialSnapshot = z.infer<typeof formalMiningTerritorialSnapshotSchema>;
export type ExplorationTerritorialSnapshot = z.infer<typeof explorationTerritorialSnapshotSchema>;
export type MiningConcessionTerritorialSnapshot = z.infer<typeof miningConcessionTerritorialSnapshotSchema>;
export type MiningConflictSnapshot = z.infer<typeof socialConflictSnapshotSchema>;
export type MiningSocialConflictCase = z.infer<typeof socialConflictCaseSchema>;
