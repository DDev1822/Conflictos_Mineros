import type { Metadata } from "next";
import { RelationshipExplorer } from "@/components/relationship-explorer";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Relaciones: conflictos sociales mineros y REINFO",
  description: "Explora por separado los conflictos sociales mineros y el registro REINFO, junto con sus fuentes, actores y mecanismos relacionados.",
};

export default function ExplorePage() {
  return <RelationshipExplorer data={loadObservatoryData()} />;
}
