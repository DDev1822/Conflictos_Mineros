import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapLoader } from "@/components/map-loader";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = { title: "Mapa territorial" };

export default function MapPage() {
  const data = loadObservatoryData();

  const snapshot = [...data.socialConflictSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const reinfoSnapshot = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const formalMiningSnapshot = [...data.formalMiningTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const explorationSnapshot = [...data.explorationTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const miningConcessionSnapshot = [...data.miningConcessionTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];

  if (!snapshot || !reinfoSnapshot || !formalMiningSnapshot || !explorationSnapshot || !miningConcessionSnapshot) {
    notFound();
  }

  const socialConflictCases = data.socialConflictCases.filter((item) => item.snapshotId === snapshot.id);

  return (
    <MapLoader
      cases={data.cases}
      territories={data.territories}
      socialConflictSnapshot={snapshot}
      socialConflictCases={socialConflictCases}
      reinfoSnapshot={reinfoSnapshot}
      formalMiningSnapshot={formalMiningSnapshot}
      explorationSnapshot={explorationSnapshot}
      miningConcessionSnapshot={miningConcessionSnapshot}
    />
  );
}
