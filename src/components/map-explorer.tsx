"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, MagnifyingGlass, X } from "@phosphor-icons/react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import type { ConflictCase, FormalMiningTerritorialSnapshot, ReinfoTerritorialSnapshot, SocialConflictCase, SocialConflictSnapshot, Territory } from "@/lib/schemas";

const REPORT_URL = "https://www.defensoria.gob.pe/wp-content/uploads/2026/05/Reporte-de-Conflictos-Sociales-n-266-VF.pdf";
const REINFO_URL = "https://pad.minem.gob.pe/REINFO_WEB/Index.aspx";
const FORMAL_MINING_URL = "https://mineria.minem.gob.pe/directorio_minero/plantas-de-beneficio-autorizadas/";
const HEAT_COLORS = { low: "#62bfd3", medium: "#d99932", high: "#a52f36" } as const;

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
type RegistryTheme = "all" | "informal-illegal";
type HeatBand = keyof typeof HEAT_COLORS;

function FitMap({ showNationalLayers, territories }: { showNationalLayers: boolean; territories: Territory[] }) {
  const map = useMap();
  useEffect(() => {
    if (showNationalLayers) {
      map.fitBounds([[-18.5, -81.5], [-0.1, -68.4]], { padding: [30, 30], maxZoom: 6 });
    } else if (territories.length) {
      map.fitBounds(territories.map((item) => item.coordinates), { padding: [45, 45], maxZoom: 6 });
    }
  }, [map, showNationalLayers, territories]);
  return null;
}

function heatScale(max: number) {
  const lowMax = Math.max(1, Math.ceil(max / 3));
  const mediumMax = Math.max(lowMax + 1, Math.ceil((max * 2) / 3));
  return { lowMax, mediumMax, max };
}

function heatBand(value: number, max: number): HeatBand {
  const scale = heatScale(max);
  if (value <= scale.lowMax) return "low";
  if (value <= scale.mediumMax) return "medium";
  return "high";
}

function heatBandLabel(value: number, max: number) {
  const band = heatBand(value, max);
  return band === "low" ? "Baja" : band === "medium" ? "Media" : "Alta";
}

function isInformalIllegalCase(item: SocialConflictCase) {
  const text = normalize(`${item.title} ${item.summary ?? ""} ${item.location ?? ""}`);
  return /\b(?:mineria|mineros?|actividad minera|actividades mineras)\s+(?:informal(?:es)?|ilegal(?:es)?)(?:\s+(?:e|o|y)\s+(?:informal(?:es)?|ilegal(?:es)?))?\b/.test(text);
}

function reinfoRadius(count: number) {
  if (count >= 2000) return 14;
  if (count >= 500) return 10;
  return 7;
}

function formalMiningRadius(count: number) {
  if (count >= 30) return 16;
  if (count >= 10) return 12;
  return 8;
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
      minOpacity: 0.3,
      gradient: { 0.12: HEAT_COLORS.low, 0.42: HEAT_COLORS.medium, 0.7: HEAT_COLORS.high, 1: "#7d1825" },
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

function fullDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function MapExplorer({ cases, territories, socialConflictSnapshot, socialConflictCases, reinfoSnapshot, formalMiningSnapshot }: {
  cases: ConflictCase[];
  territories: Territory[];
  socialConflictSnapshot: SocialConflictSnapshot;
  socialConflictCases: SocialConflictCase[];
  reinfoSnapshot: ReinfoTerritorialSnapshot;
  formalMiningSnapshot: FormalMiningTerritorialSnapshot;
}) {
  const [status, setStatus] = useState("all");
  const [showHeat, setShowHeat] = useState(true);
  const [showCases, setShowCases] = useState(true);
  const [showInformalIllegal, setShowInformalIllegal] = useState(false);
  const [showReinfo, setShowReinfo] = useState(false);
  const [showFormalMining, setShowFormalMining] = useState(false);
  const [heatMetric, setHeatMetric] = useState<HeatMetric>("total");
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [registryTheme, setRegistryTheme] = useState<RegistryTheme>("all");
  const [caseQuery, setCaseQuery] = useState("");
  const [caseStatus, setCaseStatus] = useState<CaseStatusFilter>("all");
  const [caseType, setCaseType] = useState("all");

  const visibleCases = cases.filter((item) => status === "all" || item.status === status);
  const visibleTerritories = useMemo(
    () => territories.filter((item) => visibleCases.some((entry) => entry.territoryIds.includes(item.id))),
    [territories, visibleCases],
  );
  const plottedTotal = socialConflictSnapshot.regions.reduce((sum, region) => sum + region.total, 0);
  const heatMaximum = Math.max(...socialConflictSnapshot.regions.map((region) => region[heatMetric]), 1);
  const heatRanges = heatScale(heatMaximum);
  const hotspots = [...socialConflictSnapshot.regions]
    .sort((a, b) => b[heatMetric] - a[heatMetric])
    .slice(0, 5);

  const informalIllegalCases = useMemo(() => socialConflictCases.filter(isInformalIllegalCase), [socialConflictCases]);
  const informalIllegalRegions = useMemo(() => socialConflictSnapshot.regions
    .map((region) => ({
      ...region,
      count: informalIllegalCases.filter((item) => item.regionIds.includes(region.id)).length,
    }))
    .filter((region) => region.count > 0), [informalIllegalCases, socialConflictSnapshot]);
  const informalIllegalMultiregional = informalIllegalCases.filter((item) => item.regionIds.includes("multiregional")).length;
  const baseScopeCases = useMemo(
    () => selectedScope ? socialConflictCases.filter((item) => item.regionIds.includes(selectedScope)) : [],
    [selectedScope, socialConflictCases],
  );
  const scopeCases = useMemo(
    () => registryTheme === "informal-illegal" ? baseScopeCases.filter(isInformalIllegalCase) : baseScopeCases,
    [baseScopeCases, registryTheme],
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

  function openRegistry(scopeId: string, theme: RegistryTheme = "all") {
    setSelectedScope(scopeId);
    setRegistryTheme(theme);
    setCaseQuery("");
    setCaseType("all");
    setCaseStatus(theme === "informal-illegal" || heatMetric === "total" ? "all" : heatMetric);
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
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showInformalIllegal} onChange={(event) => setShowInformalIllegal(event.target.checked)} />
            <span><strong>Minería ilegal e informal</strong><small>Menciones explícitas en el corte de la Defensoría</small></span>
          </label>
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showReinfo} onChange={(event) => setShowReinfo(event.target.checked)} />
            <span><strong>Inscripciones REINFO</strong><small>Registros vigentes agregados por departamento</small></span>
          </label>
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showFormalMining} onChange={(event) => setShowFormalMining(event.target.checked)} />
            <span><strong>Minería formal</strong><small>Plantas de beneficio vigentes registradas por MINEM</small></span>
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
          <div className="heat-legend" aria-label="Leyenda del número de casos por intensidad">
            <p>Número de casos</p>
            <div>
              <span><i data-band="low" aria-hidden="true" />Baja · 1–{heatRanges.lowMax}</span>
              <span><i data-band="medium" aria-hidden="true" />Media · {heatRanges.lowMax + 1}–{heatRanges.mediumMax}</span>
              <span><i data-band="high" aria-hidden="true" />Alta · {heatRanges.mediumMax + 1}–{heatRanges.max}</span>
            </div>
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

        {showInformalIllegal && (
          <div className="map-layer-summary" data-layer="informal-illegal">
            <p>Lectura de la capa</p>
            <strong>{informalIllegalCases.length} casos con mención explícita</strong>
            <span>{informalIllegalCases.length - informalIllegalMultiregional} regionales · {informalIllegalMultiregional} multirregional</span>
            <small>No delimita zonas de actividad ni determina ilegalidad. Cada punto abre los casos que sustentan el conteo.</small>
            {informalIllegalMultiregional > 0 && <button type="button" onClick={() => openRegistry("multiregional", "informal-illegal")}>Ver caso multirregional</button>}
          </div>
        )}

        {showReinfo && (
          <div className="map-layer-summary" data-layer="reinfo">
            <p>REINFO vigente</p>
            <strong>{reinfoSnapshot.totalRegistered.toLocaleString("es-PE")} inscripciones</strong>
            <span>Corte de consulta: {fullDateLabel(reinfoSnapshot.cutoffDate)}</span>
            <div className="point-size-legend" aria-label="Tamaño del punto según inscripciones REINFO">
              <span><i data-size="small" aria-hidden="true" />1–499</span>
              <span><i data-size="medium" aria-hidden="true" />500–1.999</span>
              <span><i data-size="large" aria-hidden="true" />2.000 o más</span>
            </div>
            <small>El punto es una referencia departamental. Estar inscrito no equivale a formalidad concluida.</small>
            <a href={REINFO_URL} target="_blank" rel="noreferrer">Consultar registro oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
          </div>
        )}

        {showFormalMining && (
          <div className="map-layer-summary" data-layer="formal-mining">
            <p>Operación formal documentada</p>
            <strong>{formalMiningSnapshot.mappedUnits.toLocaleString("es-PE")} plantas territorializables</strong>
            <span>{formalMiningSnapshot.totalUnits.toLocaleString("es-PE")} códigos únicos en la fuente · consulta: {fullDateLabel(formalMiningSnapshot.cutoffDate)}</span>
            <div className="point-size-legend formal-point-size-legend" aria-label="Tamaño del anillo según plantas de beneficio vigentes">
              <span><i data-size="small" aria-hidden="true" />1–9</span>
              <span><i data-size="medium" aria-hidden="true" />10–29</span>
              <span><i data-size="large" aria-hidden="true" />30 o más</span>
            </div>
            <small>Es una capa parcial de minería formal: incluye plantas de beneficio vigentes, no concesiones, proyectos ni todas las operaciones. {formalMiningSnapshot.unmappedUnits} códigos sin departamento quedan fuera del mapa.</small>
            <a href={FORMAL_MINING_URL} target="_blank" rel="noreferrer">Consultar directorio oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
          </div>
        )}

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

      <section className="map-stage" aria-label="Mapa interactivo de conflictividad social, minería ilegal e informal, REINFO, minería formal documentada y casos piloto">
        <MapContainer center={[-9.19, -75.02]} zoom={5} scrollWheelZoom>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitMap showNationalLayers={showHeat || showInformalIllegal || showReinfo || showFormalMining} territories={visibleTerritories} />
          <SocialConflictHeat snapshot={socialConflictSnapshot} metric={heatMetric} visible={showHeat} />
          {showHeat && socialConflictSnapshot.regions.filter((region) => region[heatMetric] > 0).map((region) => (
            <CircleMarker
              key={region.id}
              center={region.coordinates}
              radius={Math.min(11, 5 + Math.sqrt(region[heatMetric]))}
              pathOptions={{ color: "#fff", weight: 1.5, fillColor: HEAT_COLORS[heatBand(region[heatMetric], heatMaximum)], fillOpacity: 0.92 }}
              eventHandlers={{ click: () => openRegistry(region.id) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region[heatMetric]} {metricLabel(heatMetric)} · Intensidad {heatBandLabel(region[heatMetric], heatMaximum).toLowerCase()}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.total} registrados<br />{region.active} activos · {region.latent} latentes
                <button className="map-popup-action" type="button" onClick={() => openRegistry(region.id)}>Ver los {region.total} casos</button>
              </Popup>
            </CircleMarker>
          ))}
          {showInformalIllegal && informalIllegalRegions.map((region) => (
            <CircleMarker
              key={`informal-${region.id}`}
              center={region.coordinates}
              radius={8 + region.count * 2}
              pathOptions={{ color: "#512746", weight: 2, dashArray: "4 3", fillColor: "#f0a252", fillOpacity: 0.78 }}
              eventHandlers={{ click: () => openRegistry(region.id, "informal-illegal") }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "caso con mención" : "casos con mención"}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.count} {region.count === 1 ? "caso menciona" : "casos mencionan"} minería ilegal o informal.
                <button className="map-popup-action" type="button" onClick={() => openRegistry(region.id, "informal-illegal")}>Ver sustento documental</button>
              </Popup>
            </CircleMarker>
          ))}
          {showReinfo && reinfoSnapshot.regions.filter((region) => region.count > 0).map((region) => (
            <CircleMarker
              key={`reinfo-${region.id}`}
              center={region.coordinates}
              radius={reinfoRadius(region.count)}
              pathOptions={{ color: "#343a73", weight: 2, fillColor: "#7479c9", fillOpacity: 0.62 }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count.toLocaleString("es-PE")} inscripciones REINFO vigentes</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.count.toLocaleString("es-PE")} inscripciones vigentes en el corte.<br />
                <small>Referencia departamental; no es una ubicación de actividad.</small><br />
                <a href={REINFO_URL} target="_blank" rel="noreferrer">Consultar REINFO oficial</a>
              </Popup>
            </CircleMarker>
          ))}
          {showFormalMining && formalMiningSnapshot.regions.map((region) => (
            <CircleMarker
              key={`formal-mining-${region.id}`}
              center={region.coordinates}
              radius={formalMiningRadius(region.count)}
              pathOptions={{ color: "#314a32", weight: 3, fillColor: "#78905a", fillOpacity: 0.2 }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "planta de beneficio vigente" : "plantas de beneficio vigentes"}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.count} {region.count === 1 ? "planta de beneficio vigente" : "plantas de beneficio vigentes"} en el directorio.<br />
                <small>Referencia departamental; no es la ubicación de la planta ni el universo completo de minería formal.</small><br />
                <a href={FORMAL_MINING_URL} target="_blank" rel="noreferrer">Consultar directorio oficial</a>
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
              <div><p className="eyebrow">{registryTheme === "informal-illegal" ? "Sustento de la capa temática" : "Registro del corte"}</p><h2>{selectedScopeName}</h2></div>
              <button type="button" className="icon-button" onClick={() => setSelectedScope(null)} aria-label="Cerrar registro"><X size={20} aria-hidden="true" /></button>
            </header>
            <p className="map-drawer-summary">
              {scopeCases.length} {scopeCases.length === 1 ? (registryTheme === "informal-illegal" ? "caso con mención explícita" : "caso") : (registryTheme === "informal-illegal" ? "casos con mención explícita" : "casos")} · {scopeCases.filter((item) => item.status === "active").length} {scopeCases.filter((item) => item.status === "active").length === 1 ? "activo" : "activos"} · {scopeCases.filter((item) => item.status === "latent").length} {scopeCases.filter((item) => item.status === "latent").length === 1 ? "latente" : "latentes"}
            </p>

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
