import { describe, expect, it } from "vitest";
import { collectSignoffIssues, type ReleaseManifest } from "./release-readiness";

const approvedSignoff = { status: "approved" as const, reviewedAt: "2026-06-20", reviewedBy: "Revisión responsable", evidence: "docs/evidence.md" };

function approvedManifest(): ReleaseManifest {
  return {
    version: "v1",
    visibility: "private-review",
    updatedAt: "2026-06-20",
    signoffs: {
      methodology: { ...approvedSignoff },
      licenses: { ...approvedSignoff },
      editorial: { ...approvedSignoff },
      documentary: { ...approvedSignoff },
      accessibility: { ...approvedSignoff },
    },
  };
}

describe("notas de transparencia V1", () => {
  it("no genera avisos cuando las cinco notas están fechadas, atribuidas y con evidencia", () => {
    expect(collectSignoffIssues(approvedManifest())).toEqual([]);
  });

  it("registra un aviso no bloqueante cuando una nota queda pendiente", () => {
    const manifest = approvedManifest();
    manifest.signoffs.documentary = { status: "pending", reviewedAt: null, reviewedBy: null, evidence: "content/data" };
    expect(collectSignoffIssues(manifest)).toContain("Signoff documentary: pendiente");
  });
});
