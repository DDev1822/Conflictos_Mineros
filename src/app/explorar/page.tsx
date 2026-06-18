import type { Metadata } from "next";
import { RelationshipExplorer } from "@/components/relationship-explorer";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = { title: "Sistema de relaciones" };

export default function ExplorePage() {
  return <RelationshipExplorer data={loadObservatoryData()} />;
}
