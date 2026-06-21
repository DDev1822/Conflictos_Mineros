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
      legal: { ...approvedSignoff },
      accessibility: { ...approvedSignoff },
    },
  };
}

describe("signoffs de publicación V1", () => {
  it("acepta cinco aprobaciones fechadas, atribuidas y con evidencia", () => {
    expect(collectSignoffIssues(approvedManifest())).toEqual([]);
  });

  it("bloquea deliberadamente un signoff pendiente", () => {
    const manifest = approvedManifest();
    manifest.signoffs.legal = { status: "pending", reviewedAt: null, reviewedBy: null, evidence: "content/data/instruments.yaml" };
    expect(collectSignoffIssues(manifest)).toContain("Signoff legal: pendiente");
  });
});
