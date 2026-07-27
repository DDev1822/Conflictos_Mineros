import type { Metadata } from "next";
import { MapLoader } from "@/components/map-loader";
import { loadObservatoryData } from "@/lib/content";
import { getLatestPublicMiningCut } from "@/lib/mining-classification";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import type { MiningConflictSelection, SocialConflictCase, SocialConflictSnapshot } from "@/lib/schemas";

export const metadata: Metadata = { title: "Mapa territorial" };

function buildMiningSnapshot(base: SocialConflictSnapshot, selection: MiningConflictSelection, selectedCases: SocialConflictCase[]): SocialConflictSnapshot {
  const scopeCounts = (scopeId: string) => {
    const cases = selectedCases.filter((item) => item.regionIds.includes(scopeId));
    return {
      total: cases.length,
      active: cases.filter((item) => item.status === "active").length,
      latent: cases.filter((item) => item.status === "latent").length,
    };
  };

  return {
    ...base,
    id: selection.id,
    title: selection.title,
    sourceId: selection.sourceId,
    totalRegistered: selection.totalRegistered,
    active: selection.active,
    latent: selection.latent,
    national: scopeCounts("nacional"),
    multiregional: scopeCounts("multiregional"),
    regions: base.regions.map((region) => ({ ...region, ...scopeCounts(region.id) })),
    notes: selection.notes,
  };
}

export default function MapPage() {
  const data = loadObservatoryData();
  const { snapshot, selection: miningSelection, cases: miningSocialConflictCases } = getLatestPublicMiningCut(data);
  if (!snapshot || !miningSelection) throw new Error("No existe un corte público de conflictos sociales mineros");
  const reinfoSnapshot = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const formalMiningSnapshot = [...data.formalMiningTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const explorationSnapshot = [...data.explorationTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const miningConcessionSnapshot = [...data.miningConcessionTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const miningSocialConflictSnapshot = buildMiningSnapshot(snapshot, miningSelection, miningSocialConflictCases);
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  return <MapLoader cases={publicCases} territories={data.territories} socialConflictSnapshot={miningSocialConflictSnapshot} socialConflictCases={miningSocialConflictCases} miningSocialConflictSnapshot={miningSocialConflictSnapshot} miningSocialConflictCases={miningSocialConflictCases} reinfoSnapshot={reinfoSnapshot} formalMiningSnapshot={formalMiningSnapshot} explorationSnapshot={explorationSnapshot} miningConcessionSnapshot={miningConcessionSnapshot} />;
}
