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

  it("reconcilia el corte nacional de conflictos sociales", () => {
    const data = loadObservatoryData();
    const snapshot = data.socialConflictSnapshots[0];
    const registry = data.socialConflictCases.filter((item) => item.snapshotId === snapshot.id);
    const plotted = snapshot.regions.reduce((sum, region) => sum + region.total, 0);
    expect(snapshot.active + snapshot.latent).toBe(snapshot.totalRegistered);
    expect(plotted + snapshot.national.total + snapshot.multiregional.total).toBe(snapshot.totalRegistered);
    expect(snapshot.totalRegistered).toBe(190);
    expect(registry).toHaveLength(190);
    expect(registry.filter((item) => item.status === "active")).toHaveLength(159);
    expect(registry.filter((item) => item.status === "latent")).toHaveLength(31);
  });

  it("reconcilia cada punto regional con su lista de casos", () => {
    const data = loadObservatoryData();
    const snapshot = data.socialConflictSnapshots[0];
    const registry = data.socialConflictCases.filter((item) => item.snapshotId === snapshot.id);

    for (const region of snapshot.regions) {
      const regionalCases = registry.filter((item) => item.regionIds.includes(region.id));
      expect(regionalCases, region.name).toHaveLength(region.total);
      expect(regionalCases.filter((item) => item.status === "active"), `${region.name}: activos`).toHaveLength(region.active);
      expect(regionalCases.filter((item) => item.status === "latent"), `${region.name}: latentes`).toHaveLength(region.latent);
    }

    for (const [scope, counts] of [["nacional", snapshot.national], ["multiregional", snapshot.multiregional]] as const) {
      const scopedCases = registry.filter((item) => item.regionIds.includes(scope));
      expect(scopedCases, scope).toHaveLength(counts.total);
      expect(scopedCases.filter((item) => item.status === "active"), `${scope}: activos`).toHaveLength(counts.active);
      expect(scopedCases.filter((item) => item.status === "latent"), `${scope}: latentes`).toHaveLength(counts.latent);
    }
  });

  it("mantiene trazabilidad de cada caso del registro social", () => {
    const registry = loadObservatoryData().socialConflictCases;
    expect(registry.every((item) => item.sourcePage >= 37 && item.sourcePage <= 75)).toBe(true);
    expect(registry.every((item) => item.titleMethod !== "editorial-summary" || Boolean(item.summary))).toBe(true);
    expect(new Set(registry.map((item) => item.id)).size).toBe(registry.length);
  });

  it("reconcilia el corte territorial de inscripciones REINFO vigentes", () => {
    const snapshot = loadObservatoryData().reinfoTerritorialSnapshots[0];
    expect(snapshot.regions.reduce((sum, region) => sum + region.count, 0)).toBe(snapshot.totalRegistered);
    expect(snapshot.totalRegistered).toBe(24669);
    expect(snapshot.sourceId).toBe("minem-reinfo");
    expect(snapshot.status).toBe("vigente");
  });

  it("reconcilia las plantas de beneficio vigentes territorializadas", () => {
    const snapshot = loadObservatoryData().formalMiningTerritorialSnapshots[0];
    expect(snapshot.regions.reduce((sum, region) => sum + region.count, 0)).toBe(snapshot.mappedUnits);
    expect(snapshot.mappedUnits + snapshot.unmappedUnits).toBe(snapshot.totalUnits);
    expect(snapshot.totalUnits).toBe(342);
    expect(snapshot.unmappedUnits).toBe(2);
    expect(snapshot.sourceId).toBe("minem-plantas-beneficio");
  });

  it("reconcilia los expedientes territoriales de exploración", () => {
    const snapshot = loadObservatoryData().explorationTerritorialSnapshots[0];
    expect(snapshot.regions.reduce((sum, region) => sum + region.count, 0)).toBe(snapshot.totalProjects);
    expect(snapshot.totalProjects).toBe(293);
    expect(snapshot.totalAreaHectares).toBeCloseTo(101775.4, 1);
    expect(snapshot.sourceId).toBe("minem-exploracion-actividad");
  });

  it("reconcilia derechos mineros titulados y presencias departamentales", () => {
    const snapshot = loadObservatoryData().miningConcessionTerritorialSnapshots[0];
    expect(snapshot.regions.reduce((sum, region) => sum + region.count, 0)).toBe(snapshot.regionalPresences);
    expect(snapshot.mappedRights + snapshot.unmappedRights).toBe(snapshot.totalRights);
    expect(snapshot.totalRights).toBe(41954);
    expect(snapshot.regionalPresences).toBe(43484);
    expect(snapshot.sourceId).toBe("ingemmet-catastro-minero");
  });
});
