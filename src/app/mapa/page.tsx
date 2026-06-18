import type { Metadata } from "next";
import { MapLoader } from "@/components/map-loader";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = { title: "Mapa territorial" };

export default function MapPage() { const data = loadObservatoryData(); return <MapLoader cases={data.cases} territories={data.territories} />; }
