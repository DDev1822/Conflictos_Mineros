import { describe, expect, it } from "vitest";
import { loadObservatoryData } from "./content";

describe("contenido académico", () => {
  it("incluye los seis expedientes piloto", () => {
    expect(loadObservatoryData().cases).toHaveLength(6);
  });

  it("mantiene todas las afirmaciones trazables", () => {
    const claims = loadObservatoryData().cases.flatMap((item) => item.claims);
    expect(claims.every((claim) => claim.sourceIds.length > 0)).toBe(true);
    expect(claims.every((claim) => claim.verificationStatus !== "pending")).toBe(true);
  });

  it("explicita la precisión temporal de fuentes e hitos", () => {
    const data = loadObservatoryData();
    expect(data.sources.every((source) => source.datePrecision)).toBe(true);
    expect(data.cases.flatMap((item) => item.timeline).every((event) => event.datePrecision)).toBe(true);
  });

  it("incluye evidencia no estatal en cada expediente", () => {
    const data = loadObservatoryData();
    const sourceById = new Map(data.sources.map((source) => [source.id, source]));
    for (const item of data.cases) {
      const sourceIds = new Set([
        ...item.timeline.flatMap((event) => event.sourceIds),
        ...item.claims.flatMap((claim) => claim.sourceIds),
      ]);
      expect([...sourceIds].some((sourceId) => sourceById.get(sourceId)?.perspective !== "state")).toBe(true);
    }
  });

  it("no presenta normas vigentes sin revisión jurídica", () => {
    const invalid = loadObservatoryData().instruments.filter(
      (item) => item.status === "in-force" && item.legalReviewStatus !== "verified",
    );
    expect(invalid).toEqual([]);
  });
});
