import { describe, expect, it } from "vitest";
import { releaseManifestSchema } from "./release-readiness";

const academicManifest = {
  version: "v1",
  visibility: "public-academic",
  purpose: "academic-informational",
  updatedAt: "2026-07-27",
  disclaimer: "Observatorio académico e informativo; no constituye asesoría profesional ni determina responsabilidades o causalidad.",
} as const;

describe("contrato de publicación académica", () => {
  it("acepta una publicación académica con disclaimer explícito", () => {
    expect(releaseManifestSchema.parse(academicManifest)).toEqual(academicManifest);
  });

  it("rechaza estados fuera del contrato de publicación académica", () => {
    expect(() => releaseManifestSchema.parse({ ...academicManifest, visibility: "private" })).toThrow();
  });
});
