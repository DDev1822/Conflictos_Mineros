import { describe, expect, it } from "vitest";
import { loadObservatoryData } from "./content";

describe("contenido académico", () => {
  it("incluye los seis expedientes piloto", () => {
    expect(loadObservatoryData().cases).toHaveLength(6);
  });

  it("mantiene todas las afirmaciones trazables", () => {
    const claims = loadObservatoryData().cases.flatMap((item) => item.claims);
    expect(claims.every((claim) => claim.sourceIds.length > 0)).toBe(true);
  });

  it("no presenta normas vigentes sin revisión jurídica", () => {
    const invalid = loadObservatoryData().instruments.filter(
      (item) => item.status === "in-force" && item.legalReviewStatus !== "verified",
    );
    expect(invalid).toEqual([]);
  });
});
