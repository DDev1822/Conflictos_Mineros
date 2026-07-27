import { describe, expect, it } from "vitest";
import { loadObservatoryData } from "./content";
import { getLatestPublicMiningCut, mentionsMiningCategory } from "./mining-classification";

describe("clasificación textual de minería ilegal e informal", () => {
  it("conserva los guardarraíles del reporte 266", () => {
    const cases = loadObservatoryData().socialConflictCases.filter((item) => item.snapshotId === "defensoria-2026-04");
    const illegal = cases.filter((item) => mentionsMiningCategory(item, "ilegal"));
    const informal = cases.filter((item) => mentionsMiningCategory(item, "informal"));
    const overlap = cases.filter(
      (item) => mentionsMiningCategory(item, "ilegal") && mentionsMiningCategory(item, "informal"),
    );

    expect(illegal).toHaveLength(7);
    expect(informal).toHaveLength(5);
    expect(overlap).toHaveLength(2);
  });

  it("expone exclusivamente el corte minero del reporte 268", () => {
    const cut = getLatestPublicMiningCut(loadObservatoryData());
    const illegal = cut.cases.filter((item) => mentionsMiningCategory(item, "ilegal"));
    const informal = cut.cases.filter((item) => mentionsMiningCategory(item, "informal"));
    const overlap = cut.cases.filter(
      (item) => mentionsMiningCategory(item, "ilegal") && mentionsMiningCategory(item, "informal"),
    );

    expect(cut.snapshot?.id).toBe("defensoria-2026-06-mining");
    expect(cut.selection?.id).toBe("defensoria-2026-06-mining-selection");
    expect(cut.cases).toHaveLength(61);
    expect(cut.cases.filter((item) => item.status === "active")).toHaveLength(50);
    expect(cut.cases.filter((item) => item.status === "latent")).toHaveLength(11);
    expect(illegal).toHaveLength(5);
    expect(informal).toHaveLength(4);
    expect(overlap).toHaveLength(2);
  });

  it("exige proximidad explícita entre minería y la categoría", () => {
    const base = {
      id: "caso-prueba",
      snapshotId: "corte-prueba",
      title: "Actividad minera en evaluación",
      titleMethod: "report-denomination" as const,
      status: "active" as const,
      conflictType: "Socioambiental" as const,
      regionIds: ["puno"],
      sourcePage: 40,
      hasMonthlyEvents: false,
    };

    expect(mentionsMiningCategory({ ...base, summary: "Se menciona minería ilegal en el territorio." }, "ilegal")).toBe(true);
    expect(mentionsMiningCategory({ ...base, summary: "La informalidad laboral aparece en otro sector." }, "informal")).toBe(false);
  });
});
