import { describe, expect, it } from "vitest";
import { loadObservatoryData } from "./content";

describe("contenido académico", () => {
  it("mantiene los expedientes canónicos trazados", () => {
    expect(loadObservatoryData().cases).toHaveLength(13);
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

  it("presenta normas como información pública con fuente primaria y locador", () => {
    const data = loadObservatoryData();
    const primarySourceIds = new Set(data.sources.filter((source) => source.evidenceLevel === "primary").map((source) => source.id));
    const instrumentLocators = new Set(data.evidenceRecords.filter((record) => record.entityType === "instrument" && record.locator).map((record) => record.entityId));
    expect(data.instruments.every((item) => item.sourceIds.some((sourceId) => primarySourceIds.has(sourceId)))).toBe(true);
    expect(data.instruments.every((item) => instrumentLocators.has(item.id))).toBe(true);
  });

  it("separa el ciclo histórico y el proceso contemporáneo de Tambogrande", () => {
    const data = loadObservatoryData();
    const item = data.cases.find((entry) => entry.id === "tambogrande");
    const packet = data.caseResearchPackets.find((entry) => entry.caseId === "tambogrande");

    expect(item?.status).toBe("active");
    expect(item?.period.end).toBeNull();
    expect(item?.timeline.map((event) => event.id)).toEqual(expect.arrayContaining([
      "tambogrande-consulta",
      "tambogrande-desistimiento-2005",
      "tambogrande-algarrobo-adjudicacion",
      "tambogrande-algarrobo-contrato",
      "tambogrande-algarrobo-estado-268",
    ]));
    expect(item?.claims.find((claim) => claim.id === "tambogrande-hecho-2")?.verificationStatus).toBe("verified");
    expect(packet?.depth).toBe("deep");
    expect(packet?.substantiveMilestoneTarget).toBe(8);
    expect(packet?.sourceIds).toContain("defensoria-conflictos-268");
    expect(packet?.gaps.map((gap) => gap.id)).toEqual(expect.arrayContaining([
      "tambogrande-contrato-final",
      "tambogrande-acuerdo-agua",
    ]));
  });

  it("compara compromisos sin confundir documento y ejecución", () => {
    const data = loadObservatoryData();
    const comparison = data.commitmentComparison;
    const coveredCaseIds = new Set(comparison.entries.map((entry) => entry.caseId));

    expect(comparison.entries).toHaveLength(13);
    expect([...coveredCaseIds].sort()).toEqual(["cerro-quilish", "choropampa", "espinar", "fondo-social-michiquillay", "las-bambas", "madre-de-dios", "rio-blanco-majaz", "tambogrande", "toromocho-morococha"]);
    expect(comparison.excludedCaseIds.sort()).toEqual(["conga", "la-oroya", "tia-maria", "yanacocha-maxima-acuna"]);
    expect(comparison.entries.every((entry) => entry.sourceIds.length > 0)).toBe(true);
    expect(comparison.entries.every((entry) => entry.limit.length >= 25)).toBe(true);
    expect(comparison.entries.find((entry) => entry.id === "tambogrande-agua-acuerdo-social")?.implementationEvidence).toBe("not-located");
    expect(comparison.entries.find((entry) => entry.id === "las-bambas-velille-transito-2024")?.documentaryStage).toBe("result-documented");
    expect(comparison.entries.find((entry) => entry.id === "las-bambas-velille-transito-2024")?.implementationEvidence).toBe("partial");
    expect(comparison.entries.find((entry) => entry.id === "quilish-dialogo-estudio-hidrico-2004")?.implementationEvidence).toBe("partial");
    expect(comparison.entries.find((entry) => entry.id === "choropampa-convenio-obras-2000")?.implementationEvidence).toBe("partial");
    expect(comparison.entries.find((entry) => entry.id === "michiquillay-transferencia-fondo-2009")?.documentaryStage).toBe("follow-up-documented");
    expect(comparison.entries.find((entry) => entry.id === "rio-blanco-rehabilitacion-2008")?.implementationEvidence).toBe("partial");
  });

  it("reconcilia el corte nacional de conflictos sociales", () => {
    const data = loadObservatoryData();
    const snapshot = data.socialConflictSnapshots.find((item) => item.id === "defensoria-2026-04");
    expect(snapshot).toBeDefined();
    if (!snapshot) return;
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
    for (const snapshot of data.socialConflictSnapshots) {
      const registry = data.socialConflictCases.filter((item) => item.snapshotId === snapshot.id);

      for (const region of snapshot.regions) {
        const regionalCases = registry.filter((item) => item.regionIds.includes(region.id));
        expect(regionalCases, `${snapshot.id} · ${region.name}`).toHaveLength(region.total);
        expect(regionalCases.filter((item) => item.status === "active"), `${snapshot.id} · ${region.name}: activos`).toHaveLength(region.active);
        expect(regionalCases.filter((item) => item.status === "latent"), `${snapshot.id} · ${region.name}: latentes`).toHaveLength(region.latent);
      }

      for (const [scope, counts] of [["nacional", snapshot.national], ["multiregional", snapshot.multiregional]] as const) {
        const scopedCases = registry.filter((item) => item.regionIds.includes(scope));
        expect(scopedCases, `${snapshot.id} · ${scope}`).toHaveLength(counts.total);
        expect(scopedCases.filter((item) => item.status === "active"), `${snapshot.id} · ${scope}: activos`).toHaveLength(counts.active);
        expect(scopedCases.filter((item) => item.status === "latent"), `${snapshot.id} · ${scope}: latentes`).toHaveLength(counts.latent);
      }
    }
  });

  it("clasifica hitos, derechos y relaciones de evidencia", () => {
    const data = loadObservatoryData();
    expect(data.cases.flatMap((item) => item.timeline).every((event) => event.kind)).toBe(true);
    expect(data.sources.every((source) => source.rightsStatus !== "unknown")).toBe(true);
    expect(data.evidenceRecords.every((record) => record.locator && record.relation)).toBe(true);
  });

  it("expone matrices canónicas para el Sistema de Relaciones", () => {
    const data = loadObservatoryData();
    const sourceIds = new Set(data.sources.map((source) => source.id));
    const cajamarcaDocuments = data.cajamarcaSystemMatrix.entries.flatMap((entry) => entry.primaryDocuments);
    const mechanismDocuments = data.institutionalMechanisms.entries.flatMap((entry) => entry.primaryDocumentExamples);
    const canonicalDocuments = [...cajamarcaDocuments, ...mechanismDocuments].filter((document) => document.status === "canonical-source");
    const researchTargets = [...cajamarcaDocuments, ...mechanismDocuments].filter((document) => document.status === "research-target");

    expect(data.cajamarcaSystemMatrix.entries).toHaveLength(11);
    expect(data.institutionalMechanisms.entries).toHaveLength(13);
    expect(canonicalDocuments.every((document) => sourceIds.has(document.sourceId))).toBe(true);
    expect(researchTargets.length).toBeGreaterThan(0);
  });

  it("reconcilia la selección de conflictos socioambientales mineros", () => {
    const data = loadObservatoryData();
    const selection = data.miningConflictSelections.find((item) => item.id === "defensoria-2026-06-mining-selection");
    expect(selection).toBeDefined();
    if (!selection) return;
    const selectedIds = new Set(selection.caseIds);
    const registry = data.socialConflictCases.filter((item) => selectedIds.has(item.id));

    expect(selection.totalRegistered).toBe(61);
    expect(selection.active).toBe(50);
    expect(selection.latent).toBe(11);
    expect(selection.sourcePage).toBe(45);
    expect(registry).toHaveLength(selection.totalRegistered);
    expect(registry.every((item) => item.snapshotId === selection.snapshotId)).toBe(true);
    expect(registry.every((item) => item.conflictType === "Socioambiental")).toBe(true);
    expect(registry.filter((item) => item.status === "active")).toHaveLength(selection.active);
    expect(registry.filter((item) => item.status === "latent")).toHaveLength(selection.latent);
  });

  it("mantiene trazabilidad de cada caso del registro social", () => {
    const registry = loadObservatoryData().socialConflictCases;
    expect(registry.every((item) => item.sourcePage >= 37 && item.sourcePage <= 120)).toBe(true);
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
    const methodologicalStatements = `${snapshot.unitDefinition} ${snapshot.coordinateMethod} ${snapshot.notes}`.split(". ");

    expect(snapshot.id).toBe("minem-plantas-beneficio-vigentes-2026-06-18");
    expect(snapshot.title).toContain("Plantas de beneficio vigentes");
    expect(`${snapshot.unitDefinition} ${snapshot.notes}`).toContain("no representa");
    expect(methodologicalStatements).not.toContain("Representa todo el universo de minería formal");
    expect(methodologicalStatements).not.toContain("Representa el universo completo de la minería formal");
    expect(snapshot.regions.reduce((sum, region) => sum + region.count, 0)).toBe(snapshot.mappedUnits);
    expect(snapshot.mappedUnits + snapshot.unmappedUnits).toBe(snapshot.totalUnits);
    expect(snapshot.totalUnits).toBe(342);
    expect(snapshot.mappedUnits).toBe(340);
    expect(snapshot.unmappedUnits).toBe(2);
    expect(snapshot.sourceId).toBe("minem-plantas-beneficio");
    expect(snapshot.cutoffBasis).toBe("access-date");
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

  it("mantiene seis cortes o capas territoriales con fuente primaria y coordenadas como referencia", () => {
    const data = loadObservatoryData();
    const sourceById = new Map(data.sources.map((source) => [source.id, source]));
    const layers = [
      ...data.socialConflictSnapshots,
      ...data.reinfoTerritorialSnapshots,
      ...data.formalMiningTerritorialSnapshots,
      ...data.explorationTerritorialSnapshots,
      ...data.miningConcessionTerritorialSnapshots,
    ];

    expect(layers).toHaveLength(6);
    expect(layers.every((layer) => sourceById.get(layer.sourceId)?.evidenceLevel === "primary")).toBe(true);
    expect(layers.every((layer) => /(referencia|capital|centro urbano principal|no corresponde|no corresponden|no ubica|no se reproducen)/.test(layer.coordinateMethod.toLowerCase()))).toBe(true);
  });

  it("traza y reconcilia la lectura de devastación aurífera en Madre de Dios", () => {
    const devastation = loadObservatoryData().madreDiosDevastation;
    const sourceIds = new Set(devastation.sourceIds);

    expect(devastation.documentedTotal.hectares).toBe(135939);
    expect(devastation.recentRate.observedHectares).toBe(500);
    expect(sourceIds.has(devastation.documentedTotal.sourceId)).toBe(true);
    expect(sourceIds.has(devastation.recentRate.sourceId)).toBe(true);
    expect(devastation.recentRate.hectaresPerDay).toBeCloseTo(devastation.recentRate.observedHectares / devastation.recentRate.observedDays, 2);
    expect(devastation.recentRate.hectaresPerHour).toBeCloseTo(devastation.recentRate.hectaresPerDay / 24, 3);
    for (const projection of devastation.projectionYears) {
      expect(projection.projectedHectares).toBeCloseTo(devastation.recentRate.hectaresPerDay * 365 * projection.years, 0);
    }
    expect(devastation.caveat).toContain("no afirma nueva deforestación observada después del corte");
  });

  it("mantiene la biblioteca académica separada por grado y eje temático", () => {
    const data = loadObservatoryData();
    const items = data.academicResearch;
    const caseSlugs = new Set(data.cases.map((item) => item.slug));

    expect(items).toHaveLength(33);
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    expect(new Set(items.map((item) => item.degreeLevel))).toEqual(new Set(["pregrado", "maestria", "doctorado"]));
    expect(items.filter((item) => item.axis === "conflictos-sociales-mineros")).toHaveLength(31);
    expect(items.filter((item) => item.axis === "mineria-ilegal-e-informal")).toHaveLength(1);
    expect(items.filter((item) => item.axis === "reinfo-y-formalizacion")).toHaveLength(1);
    expect(items.every((item) => {
      const host = new URL(item.recordUrl).hostname;
      return ["alicia.concytec.gob.pe", "tesis.pucp.edu.pe", "biblioteca-repositorio.clacso.edu.ar"].includes(host);
    })).toBe(true);
    expect(items.every((item) => item.editorialSummary.length >= 80)).toBe(true);
    expect(items.flatMap((item) => item.caseSlugs).every((slug) => caseSlugs.has(slug))).toBe(true);
    const coveredCases = new Set(items.flatMap((item) => item.caseSlugs));
    expect([...caseSlugs].filter((slug) => slug !== "madre-de-dios" && !coveredCases.has(slug))).toEqual([]);
  });
});
