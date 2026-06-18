"use client";

import dynamic from "next/dynamic";
import type { ConflictCase, Territory } from "@/lib/schemas";

const MapExplorer = dynamic(() => import("./map-explorer").then((module) => module.MapExplorer), {
  ssr: false,
  loading: () => <div className="map-loading" role="status">Cargando vista territorial…</div>,
});

export function MapLoader(props: { cases: ConflictCase[]; territories: Territory[] }) {
  return <MapExplorer {...props} />;
}
