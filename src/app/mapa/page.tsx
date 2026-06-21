import type { Metadata } from "next";
import { MapLoader } from "@/components/map-loader";
import { loadObservatoryData } from "@/lib/content";
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
  const snapshot = [...data.socialConflictSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const reinfoSnapshot = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const formalMiningSnapshot = [...data.formalMiningTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const explorationSnapshot = [...data.explorationTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const miningConcessionSnapshot = [...data.miningConcessionTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const socialConflictCases = data.socialConflictCases.filter((item) => item.snapshotId === snapshot.id);
  const miningSelection = data.miningConflictSelections.find((item) => item.snapshotId === snapshot.id);
  if (!miningSelection) throw new Error(`No existe una selección de conflictos mineros para ${snapshot.id}`);
  const miningCaseIds = new Set(miningSelection.caseIds);
  const miningSocialConflictCases = socialConflictCases.filter((item) => miningCaseIds.has(item.id));
  const miningSocialConflictSnapshot = buildMiningSnapshot(snapshot, miningSelection, miningSocialConflictCases);
  return <MapLoader cases={data.cases} territories={data.territories} socialConflictSnapshot={snapshot} socialConflictCases={socialConflictCases} miningSocialConflictSnapshot={miningSocialConflictSnapshot} miningSocialConflictCases={miningSocialConflictCases} reinfoSnapshot={reinfoSnapshot} formalMiningSnapshot={formalMiningSnapshot} explorationSnapshot={explorationSnapshot} miningConcessionSnapshot={miningConcessionSnapshot} />;
}
