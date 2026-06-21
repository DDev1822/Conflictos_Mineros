import { describe, expect, it } from "vitest";
import { loadObservatoryData } from "./content";
import { mentionsMiningCategory } from "./mining-classification";

describe("clasificación textual de minería ilegal e informal", () => {
  it("conserva los guardarraíles del reporte 266", () => {
    const cases = loadObservatoryData().socialConflictCases;
    const illegal = cases.filter((item) => mentionsMiningCategory(item, "ilegal"));
    const informal = cases.filter((item) => mentionsMiningCategory(item, "informal"));
    const overlap = cases.filter(
      (item) => mentionsMiningCategory(item, "ilegal") && mentionsMiningCategory(item, "informal"),
    );

    expect(illegal).toHaveLength(7);
    expect(informal).toHaveLength(5);
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
