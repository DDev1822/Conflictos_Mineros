import type { Metadata } from "next";
import { RelationshipExplorer } from "@/components/relationship-explorer";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Relaciones entre conflictos sociales mineros",
  description: "Explora cómo se relacionan los casos sociales mineros con territorios, actores, fuentes, acuerdos y mecanismos institucionales.",
};

export default function ExplorePage() {
  return <RelationshipExplorer data={loadObservatoryData()} />;
}
