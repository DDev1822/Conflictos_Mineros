import type { Metadata } from "next";
import { MapLoader } from "@/components/map-loader";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = { title: "Mapa territorial" };

export default function MapPage() {
  const data = loadObservatoryData();
  const snapshot = [...data.socialConflictSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  return <MapLoader cases={data.cases} territories={data.territories} socialConflictSnapshot={snapshot} />;
}
