"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, MagnifyingGlass, X } from "@phosphor-icons/react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import type { ConflictCase, SocialConflictCase, SocialConflictSnapshot, Territory } from "@/lib/schemas";

const REPORT_URL = "https://www.defensoria.gob.pe/wp-content/uploads/2026/05/Reporte-de-Conflictos-Sociales-n-266-VF.pdf";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type HeatMetric = "total" | "active" | "latent";
type CaseStatusFilter = "all" | "active" | "latent";

function FitMap({ showHeat, territories }: { showHeat: boolean; territories: Territory[] }) {
  const map = useMap();
  useEffect(() => {
    if (showHeat) {
      map.fitBounds([[-18.5, -81.5], [-0.1, -68.4]], { padding: [30, 30], maxZoom: 6 });
    } else if (territories.length) {
      map.fitBounds(territories.map((item) => item.coordinates), { padding: [45, 45], maxZoom: 6 });
    }
  }, [map, showHeat, territories]);
  return null;
}

function SocialConflictHeat({ snapshot, metric, visible }: { snapshot: SocialConflictSnapshot; metric: HeatMetric; visible: boolean }) {
  const map = useMap();
  const points = useMemo<L.HeatLatLngTuple[]>(() => {
    const max = Math.max(...snapshot.regions.map((region) => region[metric]), 1);
    return snapshot.regions
      .filter((region) => region[metric] > 0)
      .map((region) => [region.coordinates[0], region.coordinates[1], region[metric] / max]);
  }, [snapshot, metric]);

  useEffect(() => {
    if (!visible) return;
    const layer = L.heatLayer(points, {
      radius: 42,
      blur: 30,
      maxZoom: 7,
      minOpacity: 0.34,
      gradient: { 0.15: "#1e665c", 0.42: "#e0b15b", 0.68: "#d87545", 1: "#9d2f32" },
    }).addTo(map);
    return () => { map.removeLayer(layer); };
  }, [map, points, visible]);

  return null;
}

function metricLabel(metric: HeatMetric) {
  if (metric === "active") return "activos";
  if (metric === "latent") return "latentes";
  return "registrados";
}

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function periodLabel(period?: string) {
  if (!period) return "Inicio no uniformado";
  const [year, month] = period.split("-");
  return `${month}/${year}`;
}

export function MapExplorer({ cases, territories, socialConflictSnapshot, socialConflictCases }: {
  cases: ConflictCase[];
  territories: Territory[];
  socialConflictSnapshot: SocialConflictSnapshot;
  socialConflictCases: SocialConflictCase[];
}) {
  const [status, setStatus] = useState("all");
  const [showHeat, setShowHeat] = useState(true);
  const [showCases, setShowCases] = useState(true);
  const [heatMetric, setHeatMetric] = useState<HeatMetric>("total");
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [caseQuery, setCaseQuery] = useState("");
  const [caseStatus, setCaseStatus] = useState<CaseStatusFilter>("all");
  const [caseType, setCaseType] = useState("all");

  const visibleCases = cases.filter((item) => status === "all" || item.status === status);
  const visibleTerritories = useMemo(
    () => territories.filter((item) => visibleCases.some((entry) => entry.territoryIds.includes(item.id))),
    [territories, visibleCases],
  );
  const plottedTotal = socialConflictSnapshot.regions.reduce((sum, region) => sum + region.total, 0);
  const hotspots = [...socialConflictSnapshot.regions]
    .sort((a, b) => b[heatMetric] - a[heatMetric])
    .slice(0, 5);

  const scopeCases = useMemo(
    () => selectedScope ? socialConflictCases.filter((item) => item.regionIds.includes(selectedScope)) : [],
    [selectedScope, socialConflictCases],
  );
  const availableTypes = useMemo(
    () => [...new Set(scopeCases.map((item) => item.conflictType))].sort((a, b) => a.localeCompare(b, "es")),
    [scopeCases],
  );
  const filteredScopeCases = useMemo(() => {
    const query = normalize(caseQuery.trim());
    return scopeCases.filter((item) => {
      const matchesQuery = !query || normalize(`${item.title} ${item.location ?? ""} ${item.conflictType}`).includes(query);
      const matchesStatus = caseStatus === "all" || item.status === caseStatus;
      const matchesType = caseType === "all" || item.conflictType === caseType;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [caseQuery, caseStatus, caseType, scopeCases]);

  const selectedRegion = socialConflictSnapshot.regions.find((region) => region.id === selectedScope);
  const selectedScopeName = selectedRegion?.name ?? (selectedScope === "nacional" ? "Ámbito nacional" : "Ámbito multirregional");

  function openRegistry(scopeId: string) {
    setSelectedScope(scopeId);
    setCaseQuery("");
    setCaseType("all");
    setCaseStatus(heatMetric === "total" ? "all" : heatMetric);
  }

  return (
    <div className="map-layout">
      <aside>
        <p className="eyebrow">Vista territorial</p>
        <h1>Conflictividad social en el Perú</h1>
        <p>La capa de calor reúne todos los conflictos sociales registrados por la Defensoría del Pueblo; no todos corresponden a minería.</p>

        <div className="map-snapshot" aria-label="Resumen del corte documental">
          <strong>{socialConflictSnapshot.totalRegistered}</strong>
          <span>conflictos registrados</span>
          <small>{socialConflictSnapshot.active} activos · {socialConflictSnapshot.latent} latentes</small>
          <small>Corte: abril de 2026 · Reporte n.º {socialConflictSnapshot.reportNumber}</small>
        </div>

        <fieldset className="map-layers">
          <legend>Capas visibles</legend>
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showHeat} onChange={(event) => setShowHeat(event.target.checked)} />
            <span><strong>Calor de conflictos sociales</strong><small>Distribución regional oficial</small></span>
          </label>
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showCases} onChange={(event) => setShowCases(event.target.checked)} />
            <span><strong>Expedientes piloto</strong><small>Seis casos del observatorio</small></span>
          </label>
        </fieldset>

        {showHeat && <>
          <label className="map-select-label">Intensidad
            <select value={heatMetric} onChange={(event) => setHeatMetric(event.target.value as HeatMetric)}>
              <option value="total">Casos registrados</option>
              <option value="active">Solo activos</option>
              <option value="latent">Solo latentes</option>
            </select>
          </label>
          <div className="heat-legend" aria-label="Leyenda de intensidad: de menor a mayor concentración">
            <span>Menor</span><i aria-hidden="true" /><span>Mayor</span>
          </div>
          <div className="hotspot-list" aria-label={`Regiones con más conflictos ${metricLabel(heatMetric)}`}>
            <p>Mayor concentración</p>
            {hotspots.map((region) => (
              <button type="button" key={region.id} onClick={() => openRegistry(region.id)}>
                <span>{region.name}</span><strong>{region[heatMetric]}</strong><small>Ver casos</small>
              </button>
            ))}
          </div>
          <div className="map-special-scopes">
            <p>Ámbitos sin punto regional</p>
            <button type="button" onClick={() => openRegistry("nacional")}><span>Nacional</span><strong>{socialConflictSnapshot.national.total}</strong></button>
            <button type="button" onClick={() => openRegistry("multiregional")}><span>Multirregional</span><strong>{socialConflictSnapshot.multiregional.total}</strong></button>
          </div>
          <label className="map-select-label">Abrir registro por región
            <select value={selectedRegion?.id ?? ""} onChange={(event) => event.target.value && openRegistry(event.target.value)}>
              <option value="">Elegir región</option>
              {[...socialConflictSnapshot.regions].sort((a, b) => a.name.localeCompare(b.name, "es")).map((region) => (
                <option key={region.id} value={region.id}>{region.name} · {region.total}</option>
              ))}
            </select>
          </label>
        </>}

        {showCases && <>
          <label className="map-select-label">Estado del expediente
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">Todos</option>
              <option value="active">Activos</option>
              <option value="latent">Latentes</option>
              <option value="historical">Históricos</option>
            </select>
          </label>
          <div className="map-case-list">
            {visibleCases.map((item) => <Link href={`/conflictos/${item.slug}`} key={item.id}>{item.name}<small>{territories.find((territory) => item.territoryIds.includes(territory.id))?.region}</small></Link>)}
          </div>
        </>}

        <small className="map-disclaimer">
          {plottedTotal} casos se representan mediante puntos regionales de referencia. Los {socialConflictSnapshot.national.total + socialConflictSnapshot.multiregional.total} casos nacionales o multirregionales no se asignan a un punto para evitar doble conteo. La intensidad no representa impacto, violencia ni causalidad.
        </small>
        <a className="map-source" href={REPORT_URL} target="_blank" rel="noreferrer">Consultar reporte oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
      </aside>

      <section className="map-stage" aria-label="Mapa interactivo de conflictividad social y casos piloto">
        <MapContainer center={[-9.19, -75.02]} zoom={5} scrollWheelZoom>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitMap showHeat={showHeat} territories={visibleTerritories} />
          <SocialConflictHeat snapshot={socialConflictSnapshot} metric={heatMetric} visible={showHeat} />
          {showHeat && socialConflictSnapshot.regions.filter((region) => region[heatMetric] > 0).map((region) => (
            <CircleMarker
              key={region.id}
              center={region.coordinates}
              radius={6}
              pathOptions={{ color: "#fff", weight: 1.5, fillColor: "#8e3432", fillOpacity: 0.9 }}
              eventHandlers={{ click: () => openRegistry(region.id) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region[heatMetric]} {metricLabel(heatMetric)}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.total} registrados<br />{region.active} activos · {region.latent} latentes
                <button className="map-popup-action" type="button" onClick={() => openRegistry(region.id)}>Ver los {region.total} casos</button>
              </Popup>
            </CircleMarker>
          ))}
          {showCases && visibleTerritories.map((territory) => {
            const item = cases.find((entry) => entry.territoryIds.includes(territory.id));
            return <Marker key={territory.id} position={territory.coordinates} icon={markerIcon}><Popup><strong>{item?.name}</strong><br />{territory.name}<br /><Link href={`/conflictos/${item?.slug}`}>Abrir expediente</Link></Popup></Marker>;
          })}
        </MapContainer>

        {selectedScope && (
          <aside className="map-case-drawer" aria-label={`Casos de ${selectedScopeName}`}>
            <header>
              <div><p className="eyebrow">Registro del corte</p><h2>{selectedScopeName}</h2></div>
              <button type="button" className="icon-button" onClick={() => setSelectedScope(null)} aria-label="Cerrar registro"><X size={20} aria-hidden="true" /></button>
            </header>
            <p className="map-drawer-summary">{scopeCases.length} casos · {scopeCases.filter((item) => item.status === "active").length} activos · {scopeCases.filter((item) => item.status === "latent").length} latentes</p>

            <div className="map-case-filters">
              <label className="map-case-search"><MagnifyingGlass size={17} aria-hidden="true" /><span className="sr-only">Buscar casos</span><input value={caseQuery} onChange={(event) => setCaseQuery(event.target.value)} placeholder="Buscar caso, lugar o tipo" /></label>
              <label><span>Estado</span><select value={caseStatus} onChange={(event) => setCaseStatus(event.target.value as CaseStatusFilter)}><option value="all">Todos</option><option value="active">Activos</option><option value="latent">Latentes</option></select></label>
              <label><span>Tipo</span><select value={caseType} onChange={(event) => setCaseType(event.target.value)}><option value="all">Todos</option>{availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            </div>

            <p className="map-results-count" aria-live="polite">{filteredScopeCases.length} {filteredScopeCases.length === 1 ? "resultado" : "resultados"}</p>
            <div className="map-social-case-list">
              {filteredScopeCases.map((item) => (
                <article key={item.id}>
                  <div className="map-case-meta"><span data-status={item.status}>{item.status === "active" ? "Activo" : "Latente"}</span><span>{item.conflictType}</span></div>
                  <h3>{item.title}</h3>
                  {item.location && <p>{item.location}</p>}
                  <footer>
                    <small>{periodLabel(item.startPeriod)} · {item.titleMethod === "report-denomination" ? "Denominación del reporte" : "Síntesis de la ficha"}</small>
                    <a href={`${REPORT_URL}#page=${item.sourcePage}`} target="_blank" rel="noreferrer">Fuente, p. {item.sourcePage} <ArrowSquareOut size={13} aria-hidden="true" /></a>
                  </footer>
                </article>
              ))}
              {!filteredScopeCases.length && <p className="map-empty-state">No hay casos que coincidan con estos filtros.</p>}
            </div>
          </aside>
        )}
      </section>
    </div>
  );
}
