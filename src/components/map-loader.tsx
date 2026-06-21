"use client";

import dynamic from "next/dynamic";
import type { ConflictCase, ExplorationTerritorialSnapshot, FormalMiningTerritorialSnapshot, MiningConcessionTerritorialSnapshot, ReinfoTerritorialSnapshot, SocialConflictCase, SocialConflictSnapshot, Territory } from "@/lib/schemas";

const MapExplorer = dynamic(() => import("./map-explorer").then((module) => module.MapExplorer), {
  ssr: false,
  loading: () => <div className="map-loading" role="status">Cargando vista territorial…</div>,
});

export function MapLoader(props: { cases: ConflictCase[]; territories: Territory[]; socialConflictSnapshot: SocialConflictSnapshot; socialConflictCases: SocialConflictCase[]; miningSocialConflictSnapshot: SocialConflictSnapshot; miningSocialConflictCases: SocialConflictCase[]; reinfoSnapshot: ReinfoTerritorialSnapshot; formalMiningSnapshot: FormalMiningTerritorialSnapshot; explorationSnapshot: ExplorationTerritorialSnapshot; miningConcessionSnapshot: MiningConcessionTerritorialSnapshot }) {
  return <MapExplorer {...props} />;
}
