import { z } from "zod";
import type { ObservatoryData } from "./schemas";
import { getLatestPublicMiningCut } from "./mining-classification";
import { evaluateResearchReadiness } from "./research-readiness";

export const releaseManifestSchema = z.object({
  version: z.literal("v1"),
  visibility: z.literal("public-academic"),
  purpose: z.literal("academic-informational"),
  updatedAt: z.string().date(),
  disclaimer: z.string().min(80),
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
  const issues = [
    ...risks.filter((risk) => risk.status === "open" && (risk.priority === "P0" || risk.priority === "P1")).map((risk) => `${risk.priority} ${risk.id}: abierto`),
    ...research.issues.map((issue) => `Investigación: ${issue}`),
  ];
  const notices = [
    ...editorialWarnings.map((warning) => `Advertencia editorial: ${warning}`),
    ...research.notices.map((notice) => `Investigación: ${notice}`),
  ];

  const { snapshot: miningSnapshot, selection: miningSelection, cases: miningCases } = getLatestPublicMiningCut(data);
  if (!miningSnapshot || !miningSelection) {
    issues.push("Guardarraíl de publicación: no existe un corte público de conflictos sociales mineros");
  } else {
    const expected = { total: 61, active: 50, latent: 11 };
    const actual = {
      total: miningCases.length,
      active: miningCases.filter((item) => item.status === "active").length,
      latent: miningCases.filter((item) => item.status === "latent").length,
    };
    for (const key of Object.keys(expected) as (keyof typeof expected)[]) {
      if (actual[key] !== expected[key]) issues.push(`Guardarraíl minero ${key}: esperado ${expected[key]}, recibido ${actual[key]}`);
    }
    if (miningSelection.totalRegistered !== actual.total || miningSnapshot.totalRegistered !== actual.total) {
      issues.push("Guardarraíl minero: selección, corte y casos publicados no reconcilian");
    }
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
      transparencyNotices: notices.length,
      ...research.metrics,
    },
  };
}
