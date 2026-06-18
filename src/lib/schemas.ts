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

export const datasetSchema = z.object({
  sources: z.array(sourceSchema),
  actors: z.array(actorSchema),
  territories: z.array(territorySchema),
  issues: z.array(normativeIssueSchema),
  instruments: z.array(legalInstrumentSchema),
  cases: z.array(conflictCaseSchema),
  alternatives: z.array(policyAlternativeSchema),
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
