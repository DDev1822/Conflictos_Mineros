"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ConflictCase, Territory } from "@/lib/schemas";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function FitMarkers({ territories }: { territories: Territory[] }) {
  const map = useMap();
  useEffect(() => { if (territories.length) map.fitBounds(territories.map((item) => item.coordinates), { padding: [45, 45], maxZoom: 6 }); }, [map, territories]);
  return null;
}

export function MapExplorer({ cases, territories }: { cases: ConflictCase[]; territories: Territory[] }) {
  const [status, setStatus] = useState("all");
  const visibleCases = cases.filter((item) => status === "all" || item.status === status);
  const visibleTerritories = useMemo(() => territories.filter((item) => visibleCases.some((entry) => entry.territoryIds.includes(item.id))), [territories, visibleCases]);
  return <div className="map-layout"><aside><p className="eyebrow">Vista territorial</p><h1>Mapa de casos piloto</h1><p>Esta vista ubica expedientes y no representa áreas de concesión ni zonas de impacto.</p><label>Estado del caso<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="active">Activos</option><option value="latent">Latentes</option><option value="historical">Históricos</option></select></label><div className="map-case-list">{visibleCases.map((item) => <Link href={`/conflictos/${item.slug}`} key={item.id}>{item.name}<small>{territories.find((territory) => item.territoryIds.includes(territory.id))?.region}</small></Link>)}</div><small className="map-disclaimer">Base cartográfica: OpenStreetMap. Coordenadas referenciales del piloto.</small></aside><section aria-label="Mapa interactivo"><MapContainer center={[-9.19, -75.02]} zoom={5} scrollWheelZoom><TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /><FitMarkers territories={visibleTerritories} />{visibleTerritories.map((territory) => { const item = cases.find((entry) => entry.territoryIds.includes(territory.id)); return <Marker key={territory.id} position={territory.coordinates} icon={markerIcon}><Popup><strong>{item?.name}</strong><br />{territory.name}<br /><Link href={`/conflictos/${item?.slug}`}>Abrir expediente</Link></Popup></Marker>; })}</MapContainer></section></div>;
}
