import { describe, expect, it } from "vitest";
import { loadObservatoryData } from "./content";
import { evaluateResearchReadiness } from "./research-readiness";
import { conflictCaseSchema, legalInstrumentSchema } from "./schemas";

function cloneData() {
  return structuredClone(loadObservatoryData());
}

describe("gates de investigación documental V1", () => {
  it("calcula cobertura, hitos, perspectivas y ocho paquetes normativos", () => {
    const result = evaluateResearchReadiness(cloneData());
    expect(result.metrics.casesMeetingMilestoneTarget).toBe(6);
    expect(result.metrics.caseResearchReady).toBe(6);
    expect(result.metrics.normativePacketReady).toBe(8);
    expect(result.metrics.perspectiveCoverage).toBe(6);
    expect(result.metrics.unresolvedHiddenConflicts).toBe(0);
    expect(result.metrics.contextualOnlyClaims).toBe(0);
    expect(result.metrics.directEvidenceCoverage).toBe(1);
    expect(result.metrics.directEvidenceCovered).toBe(result.metrics.directEvidenceRequired);
    expect(result.ready).toBe(true);
    expect(result.metrics.declaredGaps).toBe(3);
    expect(result.notices).toContain("Vacío tambogrande/tambogrande-expediente-completo: visible en publicación");
  });

  it("falla deliberadamente al retirar un locador de evidencia directa", () => {
    const data = cloneData();
    const record = data.evidenceRecords.find((item) => item.id === "ev-law-27446");
    if (!record) throw new Error("Fixture de evidencia ausente");
    record.locator = "";
    const result = evaluateResearchReadiness(data);
    expect(result.issues).toContain("Norma ley-27446: falta evidencia primaria directa revisada con locador");
  });

  it("falla deliberadamente al retirar diversidad de perspectivas", () => {
    const data = cloneData();
    const packet = data.caseResearchPackets.find((item) => item.caseId === "conga");
    if (!packet) throw new Error("Fixture de paquete ausente");
    packet.sourceIds = ["conga-exploracion-2004", "conga-eia-semidetallado-2008", "conga-its-2013"];
    packet.directActorSourceIds = ["conga-exploracion-2004"];
    const result = evaluateResearchReadiness(data);
    expect(result.issues).toContain("Caso conga: cobertura de perspectivas insuficiente");
  });

  it("impide marcar una norma como revisada sin evidencia atribuida", () => {
    const instrument = cloneData().instruments[0];
    const result = legalInstrumentSchema.safeParse({
      ...instrument,
      legalReviewStatus: "verified",
      verifiedAt: "2026-06-20",
      legalReviewedBy: "Responsable documental",
    });
    expect(result.success).toBe(false);
  });

  it("impide marcar un expediente como revisado sin evidencia atribuida", () => {
    const item = cloneData().cases[0];
    const result = conflictCaseSchema.safeParse({
      ...item,
      reviewStatus: "legal-verified",
      legalReviewedAt: "2026-06-20",
      legalReviewedBy: "Responsable documental",
    });
    expect(result.success).toBe(false);
  });
});
