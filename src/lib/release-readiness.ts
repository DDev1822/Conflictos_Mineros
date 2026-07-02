import { z } from "zod";
import type { ObservatoryData } from "./schemas";
import { mentionsMiningCategory } from "./mining-classification";
import { evaluateResearchReadiness } from "./research-readiness";

const signoffSchema = z.object({
  status: z.enum(["pending", "approved"]),
  reviewedAt: z.string().date().nullable(),
  reviewedBy: z.string().min(2).nullable(),
  evidence: z.string().min(3),
});

export const releaseManifestSchema = z.object({
  version: z.literal("v1"),
  visibility: z.enum(["private-review", "public-reviewed", "public-learning"]),
  updatedAt: z.string().date(),
  signoffs: z.object({
    methodology: signoffSchema,
    licenses: signoffSchema,
    editorial: signoffSchema,
    documentary: signoffSchema,
    accessibility: signoffSchema,
  }),
});

export const releaseRisksSchema = z.array(z.object({
  id: z.string().min(2),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  status: z.enum(["open", "resolved"]),
  evidence: z.string().min(3),
  note: z.string().min(10),
}));

export type ReleaseManifest = z.infer<typeof releaseManifestSchema>;
export type ReleaseRisk = z.infer<typeof releaseRisksSchema>[number];

export function collectSignoffIssues(manifest: ReleaseManifest) {
  return Object.entries(manifest.signoffs).flatMap(([name, signoff]) => {
    if (signoff.status !== "approved") return [`Signoff ${name}: pendiente`];
    const missing = [!signoff.reviewedAt && "fecha", !signoff.reviewedBy && "responsable", !signoff.evidence && "evidencia"].filter(Boolean);
    return missing.length ? [`Signoff ${name}: faltan ${missing.join(", ")}`] : [];
  });
}

export function collectEditorialWarnings(data: ObservatoryData) {
  const warnings: string[] = [];
  for (const item of data.cases) {
    if (item.timeline.length < 3) warnings.push(`Caso ${item.id}: menos de tres hitos`);
    if (item.claims.some((claim) => claim.verificationStatus === "pending")) warnings.push(`Caso ${item.id}: afirmaciones pendientes`);
  }
  for (const instrument of data.instruments) {
    const hasPrimarySource = instrument.sourceIds.some((sourceId) => data.sources.find((source) => source.id === sourceId)?.evidenceLevel === "primary");
    const hasLocator = data.evidenceRecords.some((record) => record.entityType === "instrument" && record.entityId === instrument.id && record.locator.trim().length >= 3);
    if (!hasPrimarySource || !hasLocator) warnings.push(`Norma ${instrument.id}: falta texto primario o locador documental`);
  }
  return warnings;
}

export function evaluateReleaseReadiness(data: ObservatoryData, manifest: ReleaseManifest, risks: ReleaseRisk[]) {
  const research = evaluateResearchReadiness(data);
  const editorialWarnings = collectEditorialWarnings(data);
  const signoffNotices = collectSignoffIssues(manifest);
  const issues = [
    ...risks.filter((risk) => risk.status === "open" && (risk.priority === "P0" || risk.priority === "P1")).map((risk) => `${risk.priority} ${risk.id}: abierto`),
    ...research.issues.map((issue) => `Investigación: ${issue}`),
  ];
  const notices = [
    ...editorialWarnings.map((warning) => `Advertencia editorial: ${warning}`),
    ...signoffNotices.map((notice) => `Nota de transparencia: ${notice}`),
    ...research.notices.map((notice) => `Investigación: ${notice}`),
  ];

  const social = data.socialConflictSnapshots[0];
  const mining = data.miningConflictSelections[0];
  const illegal = data.socialConflictCases.filter((item) => mentionsMiningCategory(item, "ilegal"));
  const informal = data.socialConflictCases.filter((item) => mentionsMiningCategory(item, "informal"));
  const overlap = data.socialConflictCases.filter((item) => mentionsMiningCategory(item, "ilegal") && mentionsMiningCategory(item, "informal"));
  const expected = { mining: 64, social: 190, illegal: 7, informal: 5, overlap: 2 };
  const actual = { mining: mining.totalRegistered, social: social.totalRegistered, illegal: illegal.length, informal: informal.length, overlap: overlap.length };
  for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
    if (actual[key] !== expected[key]) issues.push(`Guardarraíl ${key}: esperado ${expected[key]}, recibido ${actual[key]}`);
  }

  return {
    ready: issues.length === 0,
    issues,
    notices,
    metrics: {
      openP0P1: risks.filter((risk) => risk.status === "open" && (risk.priority === "P0" || risk.priority === "P1")).length,
      editorialWarnings: editorialWarnings.length,
      casesWithThreeMilestones: data.cases.filter((item) => item.timeline.length >= 3).length,
      documentedCases: data.cases.filter((item) => item.timeline.length >= 3 && item.claims.every((claim) => claim.sourceIds.length > 0)).length,
      documentedInstruments: data.instruments.filter((instrument) => instrument.sourceIds.some((sourceId) => data.sources.find((source) => source.id === sourceId)?.evidenceLevel === "primary")).length,
      approvedSignoffs: Object.values(manifest.signoffs).filter((signoff) => signoff.status === "approved" && signoff.reviewedAt && signoff.reviewedBy).length,
      transparencyNotices: notices.length,
      ...research.metrics,
    },
  };
}
