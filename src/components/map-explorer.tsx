"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, MagnifyingGlass, X } from "@phosphor-icons/react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import type { ConflictCase, ExplorationTerritorialSnapshot, FormalMiningTerritorialSnapshot, MiningConcessionTerritorialSnapshot, ReinfoTerritorialSnapshot, SocialConflictCase, SocialConflictSnapshot, Territory } from "@/lib/schemas";
import { mentionsMiningCategory, normalizeSearchText } from "@/lib/mining-classification";

const REPORT_URL = "https://www.defensoria.gob.pe/wp-content/uploads/2026/05/Reporte-de-Conflictos-Sociales-n-266-VF.pdf";
const REINFO_URL = "https://pad.minem.gob.pe/REINFO_WEB/Index.aspx";
const FORMAL_MINING_URL = "https://mineria.minem.gob.pe/directorio_minero/plantas-de-beneficio-autorizadas/";
const EXPLORATION_URL = "https://mineria.minem.gob.pe/directorio_minero/inicio-de-actividades-de-exploracion/";
const CONCESSION_URL = "https://geocatmin.ingemmet.gob.pe/geocatmin/";
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
type HeatScope = "mining" | "all-social";
type CaseStatusFilter = "all" | "active" | "latent";
type RegistryTheme = "heat" | "illegal-mining" | "informal-mining";
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

function matchesRegistryTheme(item: SocialConflictCase, theme: RegistryTheme) {
  if (theme === "illegal-mining") return mentionsMiningCategory(item, "ilegal");
  if (theme === "informal-mining") return mentionsMiningCategory(item, "informal");
  return true;
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

function explorationRadius(count: number) {
  if (count >= 25) return 28;
  if (count >= 10) return 24;
  return 20;
}

function concessionRadius(count: number) {
  if (count >= 3000) return 44;
  if (count >= 1000) return 38;
  return 32;
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

function periodLabel(period?: string) {
  if (!period) return "Inicio no uniformado";
  const [year, month] = period.split("-");
  return `${month}/${year}`;
}

function fullDateLabel(value: string) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export function MapExplorer({ cases, territories, socialConflictSnapshot, socialConflictCases, miningSocialConflictSnapshot, miningSocialConflictCases, reinfoSnapshot, formalMiningSnapshot, explorationSnapshot, miningConcessionSnapshot }: {
  cases: ConflictCase[];
  territories: Territory[];
  socialConflictSnapshot: SocialConflictSnapshot;
  socialConflictCases: SocialConflictCase[];
  miningSocialConflictSnapshot: SocialConflictSnapshot;
  miningSocialConflictCases: SocialConflictCase[];
  reinfoSnapshot: ReinfoTerritorialSnapshot;
  formalMiningSnapshot: FormalMiningTerritorialSnapshot;
  explorationSnapshot: ExplorationTerritorialSnapshot;
  miningConcessionSnapshot: MiningConcessionTerritorialSnapshot;
}) {
  const [status, setStatus] = useState("all");
  const [showHeat, setShowHeat] = useState(true);
  const [showCases, setShowCases] = useState(true);
  const [showIllegalMining, setShowIllegalMining] = useState(false);
  const [showInformalMining, setShowInformalMining] = useState(false);
  const [showReinfo, setShowReinfo] = useState(false);
  const [showFormalMining, setShowFormalMining] = useState(false);
  const [showExploration, setShowExploration] = useState(false);
  const [showConcessions, setShowConcessions] = useState(false);
  const [heatMetric, setHeatMetric] = useState<HeatMetric>("total");
  const [heatScope, setHeatScope] = useState<HeatScope>("mining");
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [registryTheme, setRegistryTheme] = useState<RegistryTheme>("heat");
  const [caseQuery, setCaseQuery] = useState("");
  const [caseStatus, setCaseStatus] = useState<CaseStatusFilter>("all");
  const [caseType, setCaseType] = useState("all");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const visibleCases = cases.filter((item) => status === "all" || item.status === status);
  const visibleTerritories = useMemo(
    () => territories.filter((item) => visibleCases.some((entry) => entry.territoryIds.includes(item.id))),
    [territories, visibleCases],
  );
  const activeHeatSnapshot = heatScope === "mining" ? miningSocialConflictSnapshot : socialConflictSnapshot;
  const activeHeatCases = heatScope === "mining" ? miningSocialConflictCases : socialConflictCases;
  const plottedTotal = activeHeatSnapshot.regions.reduce((sum, region) => sum + region.total, 0);
  const heatMaximum = Math.max(...activeHeatSnapshot.regions.map((region) => region[heatMetric]), 1);
  const heatRanges = heatScale(heatMaximum);
  const hotspots = [...activeHeatSnapshot.regions]
    .sort((a, b) => b[heatMetric] - a[heatMetric])
    .slice(0, 5);

  const illegalMiningCases = useMemo(() => socialConflictCases.filter((item) => mentionsMiningCategory(item, "ilegal")), [socialConflictCases]);
  const informalMiningCases = useMemo(() => socialConflictCases.filter((item) => mentionsMiningCategory(item, "informal")), [socialConflictCases]);
  const overlappingMiningCases = useMemo(
    () => socialConflictCases.filter((item) => mentionsMiningCategory(item, "ilegal") && mentionsMiningCategory(item, "informal")),
    [socialConflictCases],
  );
  const illegalMiningRegions = useMemo(() => socialConflictSnapshot.regions
    .map((region) => ({
      ...region,
      count: illegalMiningCases.filter((item) => item.regionIds.includes(region.id)).length,
    }))
    .filter((region) => region.count > 0), [illegalMiningCases, socialConflictSnapshot]);
  const informalMiningRegions = useMemo(() => socialConflictSnapshot.regions
    .map((region) => ({
      ...region,
      count: informalMiningCases.filter((item) => item.regionIds.includes(region.id)).length,
    }))
    .filter((region) => region.count > 0), [informalMiningCases, socialConflictSnapshot]);
  const illegalMiningMultiregional = illegalMiningCases.filter((item) => item.regionIds.includes("multiregional")).length;
  const informalMiningMultiregional = informalMiningCases.filter((item) => item.regionIds.includes("multiregional")).length;
  const isThematicRegistry = registryTheme !== "heat";
  const baseScopeCases = useMemo(
    () => selectedScope ? (isThematicRegistry ? socialConflictCases : activeHeatCases).filter((item) => item.regionIds.includes(selectedScope)) : [],
    [activeHeatCases, isThematicRegistry, selectedScope, socialConflictCases],
  );
  const scopeCases = useMemo(
    () => baseScopeCases.filter((item) => matchesRegistryTheme(item, registryTheme)),
    [baseScopeCases, registryTheme],
  );
  const availableTypes = useMemo(
    () => [...new Set(scopeCases.map((item) => item.conflictType))].sort((a, b) => a.localeCompare(b, "es")),
    [scopeCases],
  );
  const filteredScopeCases = useMemo(() => {
    const query = normalizeSearchText(caseQuery.trim());
    return scopeCases.filter((item) => {
      const matchesQuery = !query || normalizeSearchText(`${item.title} ${item.location ?? ""} ${item.conflictType}`).includes(query);
      const matchesStatus = caseStatus === "all" || item.status === caseStatus;
      const matchesType = caseType === "all" || item.conflictType === caseType;
      return matchesQuery && matchesStatus && matchesType;
    });
  }, [caseQuery, caseStatus, caseType, scopeCases]);

  const selectedRegion = activeHeatSnapshot.regions.find((region) => region.id === selectedScope);
  const selectedScopeName = selectedRegion?.name ?? (selectedScope === "nacional" ? "Ámbito nacional" : "Ámbito multirregional");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedScope && !dialog.open) {
      dialog.showModal();
      requestAnimationFrame(() => searchInputRef.current?.focus());
    } else if (!selectedScope && dialog.open) {
      dialog.close();
    }
  }, [selectedScope]);

  function openRegistry(scopeId: string, theme: RegistryTheme = "heat", trigger?: HTMLElement | null) {
    returnFocusRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setSelectedScope(scopeId);
    setRegistryTheme(theme);
    setCaseQuery("");
    setCaseType("all");
    setCaseStatus(theme !== "heat" || heatMetric === "total" ? "all" : heatMetric);
  }

  function closeRegistry() {
    setSelectedScope(null);
  }

  function restoreRegistryFocus() {
    if (selectedScope) setSelectedScope(null);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }

  function changeHeatScope(scope: HeatScope) {
    setHeatScope(scope);
    setSelectedScope(null);
    setRegistryTheme("heat");
  }

  return (
    <div className="map-layout">
      <aside>
        <p className="eyebrow">Vista territorial</p>
        <h1>Conflictos sociales mineros en el Perú</h1>
        <p>La vista principal reúne los conflictos socioambientales vinculados a la actividad minera. El registro social completo queda disponible como contexto comparable.</p>

        <div className="map-snapshot" aria-label="Resumen del corte documental">
          <strong>{activeHeatSnapshot.totalRegistered}</strong>
          <span>{heatScope === "mining" ? "conflictos mineros" : "conflictos sociales"}</span>
          <small>{activeHeatSnapshot.active} activos · {activeHeatSnapshot.latent} latentes</small>
          <small>Corte: abril de 2026 · Reporte n.º {socialConflictSnapshot.reportNumber}</small>
        </div>

        <fieldset className="map-focus-switch">
          <legend>Enfoque del mapa de calor</legend>
          <label className={heatScope === "mining" ? "is-active" : ""}>
            <input type="radio" name="heat-scope" value="mining" checked={heatScope === "mining"} onChange={() => changeHeatScope("mining")} />
            <span><strong>Mineros</strong><small>{miningSocialConflictSnapshot.totalRegistered} casos</small></span>
          </label>
          <label className={heatScope === "all-social" ? "is-active" : ""}>
            <input type="radio" name="heat-scope" value="all-social" checked={heatScope === "all-social"} onChange={() => changeHeatScope("all-social")} />
            <span><strong>Todos sociales</strong><small>{socialConflictSnapshot.totalRegistered} casos</small></span>
          </label>
        </fieldset>

        <fieldset className="map-layers map-layer-group">
          <legend>Lectura principal</legend>
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showHeat} onChange={(event) => setShowHeat(event.target.checked)} />
            <span><strong>{heatScope === "mining" ? "Calor de conflictos mineros" : "Calor de todos los conflictos"}</strong><small>Distribución regional derivada del registro oficial</small></span>
          </label>
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showCases} onChange={(event) => setShowCases(event.target.checked)} />
            <span><strong>Expedientes piloto</strong><small>Seis casos del observatorio</small></span>
          </label>
        </fieldset>

        <details className="map-layer-details">
          <summary><span>Minería ilegal, informal y REINFO</span><small>{Number(showIllegalMining) + Number(showInformalMining) + Number(showReinfo)} activas</small></summary>
          <fieldset className="map-layers map-layer-group">
            <legend className="sr-only">Capas de minería ilegal, informal y REINFO</legend>
            <label className="map-layer-toggle" data-layer-toggle="illegal-mining">
              <input type="checkbox" checked={showIllegalMining} onChange={(event) => setShowIllegalMining(event.target.checked)} />
              <span><strong>Minería ilegal</strong><small>Menciones explícitas, separadas de minería informal</small></span>
            </label>
            <label className="map-layer-toggle" data-layer-toggle="informal-mining">
              <input type="checkbox" checked={showInformalMining} onChange={(event) => setShowInformalMining(event.target.checked)} />
              <span><strong>Minería informal</strong><small>Menciones explícitas, separadas de minería ilegal</small></span>
            </label>
            <label className="map-layer-toggle">
              <input type="checkbox" checked={showReinfo} onChange={(event) => setShowReinfo(event.target.checked)} />
              <span><strong>Inscripciones REINFO</strong><small>Registros vigentes agregados por departamento</small></span>
            </label>
          </fieldset>
        </details>

        <details className="map-layer-details">
          <summary><span>Minería formal, exploración y concesiones</span><small>{Number(showFormalMining) + Number(showExploration) + Number(showConcessions)} activas</small></summary>
          <fieldset className="map-layers map-layer-group">
            <legend className="sr-only">Capas de minería formal, exploración y concesiones</legend>
            <label className="map-layer-toggle">
              <input type="checkbox" checked={showFormalMining} onChange={(event) => setShowFormalMining(event.target.checked)} />
              <span><strong>Minería formal</strong><small>Plantas de beneficio vigentes registradas por MINEM</small></span>
            </label>
            <label className="map-layer-toggle">
              <input type="checkbox" checked={showExploration} onChange={(event) => setShowExploration(event.target.checked)} />
              <span><strong>Exploración minera</strong><small>Expedientes de exploración en actividad</small></span>
            </label>
            <label className="map-layer-toggle">
              <input type="checkbox" checked={showConcessions} onChange={(event) => setShowConcessions(event.target.checked)} />
              <span><strong>Concesiones mineras</strong><small>Derechos titulados en el Catastro Minero</small></span>
            </label>
          </fieldset>
        </details>

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
            <p>Mayor concentración · {heatScope === "mining" ? "mineros" : "todos"}</p>
            {hotspots.map((region) => (
              <button type="button" key={region.id} onClick={(event) => openRegistry(region.id, "heat", event.currentTarget)}>
                <span>{region.name}</span><strong>{region[heatMetric]}</strong><small>Ver casos</small>
              </button>
            ))}
          </div>
          <div className="map-special-scopes">
            <p>Ámbitos sin punto regional</p>
            <button type="button" onClick={(event) => openRegistry("nacional", "heat", event.currentTarget)}><span>Nacional</span><strong>{activeHeatSnapshot.national.total}</strong></button>
            <button type="button" onClick={(event) => openRegistry("multiregional", "heat", event.currentTarget)}><span>Multirregional</span><strong>{activeHeatSnapshot.multiregional.total}</strong></button>
          </div>
          <label className="map-select-label">Abrir registro por región
            <select value={selectedRegion?.id ?? ""} onChange={(event) => event.target.value && openRegistry(event.target.value, "heat", event.currentTarget)}>
              <option value="">Elegir región</option>
              {[...activeHeatSnapshot.regions].sort((a, b) => a.name.localeCompare(b.name, "es")).map((region) => (
                <option key={region.id} value={region.id}>{region.name} · {region.total}</option>
              ))}
            </select>
          </label>
        </>}

        {showIllegalMining && (
          <div className="map-layer-summary" data-layer="illegal-mining">
            <p>Menciones de minería ilegal</p>
            <strong>{illegalMiningCases.length} casos con mención explícita</strong>
            <span>{illegalMiningCases.length - illegalMiningMultiregional} regionales · {illegalMiningMultiregional} multirregionales</span>
            <small>No delimita zonas de actividad ni determina por sí sola una situación jurídica. {overlappingMiningCases.length} casos también mencionan minería informal.</small>
            {illegalMiningMultiregional > 0 && <button type="button" onClick={(event) => openRegistry("multiregional", "illegal-mining", event.currentTarget)}>Ver casos multirregionales</button>}
          </div>
        )}

        {showInformalMining && (
          <div className="map-layer-summary" data-layer="informal-mining">
            <p>Menciones de minería informal</p>
            <strong>{informalMiningCases.length} casos con mención explícita</strong>
            <span>{informalMiningCases.length - informalMiningMultiregional} regionales · {informalMiningMultiregional} multirregional</span>
            <small>No delimita zonas de actividad ni determina por sí sola una situación jurídica. {overlappingMiningCases.length} casos también mencionan minería ilegal.</small>
            {informalMiningMultiregional > 0 && <button type="button" onClick={(event) => openRegistry("multiregional", "informal-mining", event.currentTarget)}>Ver caso multirregional</button>}
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

        {showExploration && (
          <div className="map-layer-summary" data-layer="exploration">
            <p>Exploración documentada</p>
            <strong>{explorationSnapshot.totalProjects.toLocaleString("es-PE")} expedientes únicos</strong>
            <span>{explorationSnapshot.totalAreaHectares.toLocaleString("es-PE", { maximumFractionDigits: 0 })} ha informadas · consulta: {fullDateLabel(explorationSnapshot.cutoffDate)}</span>
            <div className="point-size-legend exploration-point-size-legend" aria-label="Tamaño del anillo según expedientes de exploración">
              <span><i data-size="small" aria-hidden="true" />1–9</span>
              <span><i data-size="medium" aria-hidden="true" />10–24</span>
              <span><i data-size="large" aria-hidden="true" />25 o más</span>
            </div>
            <small>Explorar no equivale a explotar ni producir. Los anillos son referencias departamentales, no áreas de intervención.</small>
            <a href={EXPLORATION_URL} target="_blank" rel="noreferrer">Consultar directorio oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
          </div>
        )}

        {showConcessions && (
          <div className="map-layer-summary" data-layer="concessions">
            <p>Catastro minero titulado</p>
            <strong>{miningConcessionSnapshot.totalRights.toLocaleString("es-PE")} derechos únicos</strong>
            <span>{miningConcessionSnapshot.regionalPresences.toLocaleString("es-PE")} presencias departamentales · servicio de actualización diaria consultado el {fullDateLabel(miningConcessionSnapshot.cutoffDate)}</span>
            <div className="point-size-legend concession-point-size-legend" aria-label="Tamaño del anillo según derechos mineros titulados">
              <span><i data-size="small" aria-hidden="true" />1–999</span>
              <span><i data-size="medium" aria-hidden="true" />1.000–2.999</span>
              <span><i data-size="large" aria-hidden="true" />3.000 o más</span>
            </div>
            <small>Una concesión no acredita actividad, propiedad superficial ni permisos operativos. {miningConcessionSnapshot.unmappedRights} derechos de ámbito marítimo quedan fuera del mapa; los derechos multidepartamentales se cuentan en cada departamento.</small>
            <a href={CONCESSION_URL} target="_blank" rel="noreferrer">Consultar GEOCATMIN oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
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
          {plottedTotal} {heatScope === "mining" ? "conflictos mineros" : "conflictos sociales"} se representan mediante puntos regionales de referencia. Los {activeHeatSnapshot.national.total + activeHeatSnapshot.multiregional.total} casos nacionales o multirregionales no se asignan a un punto para evitar doble conteo. La intensidad no representa impacto, violencia ni causalidad.
        </small>
        <a className="map-source" href={REPORT_URL} target="_blank" rel="noreferrer">Consultar reporte oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
      </aside>

      <section className="map-stage" aria-label="Mapa interactivo de conflictos sociales mineros, conflictividad social general, minería ilegal, minería informal, REINFO, minería formal, exploración, concesiones y casos piloto" aria-describedby="map-accessibility-note">
        <p id="map-accessibility-note" className="sr-only">Los botones de concentración, los botones de ámbito y el selector regional ofrecen acceso equivalente a los puntos gráficos del mapa.</p>
        <MapContainer center={[-9.19, -75.02]} zoom={5} scrollWheelZoom>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitMap showNationalLayers={showHeat || showIllegalMining || showInformalMining || showReinfo || showFormalMining || showExploration || showConcessions} territories={visibleTerritories} />
          <SocialConflictHeat snapshot={activeHeatSnapshot} metric={heatMetric} visible={showHeat} />
          {showHeat && activeHeatSnapshot.regions.filter((region) => region[heatMetric] > 0).map((region) => (
            <CircleMarker
              key={region.id}
              center={region.coordinates}
              radius={Math.min(11, 5 + Math.sqrt(region[heatMetric]))}
              pathOptions={{ color: "#fff", weight: 1.5, fillColor: HEAT_COLORS[heatBand(region[heatMetric], heatMaximum)], fillOpacity: 0.92 }}
              eventHandlers={{ click: (event) => openRegistry(region.id, "heat", event.originalEvent?.target as HTMLElement | null) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region[heatMetric]} {metricLabel(heatMetric)} · Intensidad {heatBandLabel(region[heatMetric], heatMaximum).toLowerCase()}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.total} registrados<br />{region.active} activos · {region.latent} latentes
                <button className="map-popup-action" type="button" onClick={(event) => openRegistry(region.id, "heat", event.currentTarget)}>Ver los {region.total} casos</button>
              </Popup>
            </CircleMarker>
          ))}
          {showConcessions && miningConcessionSnapshot.regions.map((region) => (
            <CircleMarker
              key={`concession-${region.id}`}
              center={region.coordinates}
              radius={concessionRadius(region.count)}
              pathOptions={{ color: "#76593a", weight: 2.5, dashArray: "2 6", fillColor: "#b69562", fillOpacity: 0.04 }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count.toLocaleString("es-PE")} presencias de derechos titulados</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.count.toLocaleString("es-PE")} presencias de derechos mineros titulados.<br />
                <small>Referencia departamental. Una concesión no prueba actividad, propiedad superficial ni permisos operativos.</small><br />
                <a href={CONCESSION_URL} target="_blank" rel="noreferrer">Consultar GEOCATMIN oficial</a>
              </Popup>
            </CircleMarker>
          ))}
          {showExploration && explorationSnapshot.regions.map((region) => (
            <CircleMarker
              key={`exploration-${region.id}`}
              center={region.coordinates}
              radius={explorationRadius(region.count)}
              pathOptions={{ color: "#216b76", weight: 2.5, dashArray: "8 5", fillColor: "#70aeb7", fillOpacity: 0.08 }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "expediente de exploración" : "expedientes de exploración"}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.count} {region.count === 1 ? "expediente" : "expedientes"} · {region.areaHectares.toLocaleString("es-PE", { maximumFractionDigits: 0 })} ha informadas.<br />
                <small>Referencia departamental; explorar no equivale a explotar ni producir.</small><br />
                <a href={EXPLORATION_URL} target="_blank" rel="noreferrer">Consultar directorio oficial</a>
              </Popup>
            </CircleMarker>
          ))}
          {showInformalMining && informalMiningRegions.map((region) => (
            <CircleMarker
              key={`informal-${region.id}`}
              center={region.coordinates}
              radius={12 + region.count * 2}
              pathOptions={{ className: "map-marker-informal", color: "#a36a16", weight: 2.4, dashArray: "6 4", fillColor: "#d99932", fillOpacity: 0.14 }}
              eventHandlers={{ click: (event) => openRegistry(region.id, "informal-mining", event.originalEvent?.target as HTMLElement | null) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "mención de minería informal" : "menciones de minería informal"}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.count} {region.count === 1 ? "caso menciona" : "casos mencionan"} minería informal.
                <button className="map-popup-action" type="button" onClick={(event) => openRegistry(region.id, "informal-mining", event.currentTarget)}>Ver sustento documental</button>
              </Popup>
            </CircleMarker>
          ))}
          {showIllegalMining && illegalMiningRegions.map((region) => (
            <CircleMarker
              key={`illegal-${region.id}`}
              center={region.coordinates}
              radius={7 + region.count * 2}
              pathOptions={{ className: "map-marker-illegal", color: "#7d2d31", weight: 2.4, fillColor: "#a52f36", fillOpacity: 0.68 }}
              eventHandlers={{ click: (event) => openRegistry(region.id, "illegal-mining", event.originalEvent?.target as HTMLElement | null) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "mención de minería ilegal" : "menciones de minería ilegal"}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.count} {region.count === 1 ? "caso menciona" : "casos mencionan"} minería ilegal.
                <button className="map-popup-action" type="button" onClick={(event) => openRegistry(region.id, "illegal-mining", event.currentTarget)}>Ver sustento documental</button>
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
            const markerName = `Abrir expediente ${item?.name} en ${territory.name}`;
            return <Marker key={territory.id} position={territory.coordinates} icon={markerIcon} title={markerName} alt={markerName}><Popup><strong>{item?.name}</strong><br />{territory.name}<br /><Link href={`/conflictos/${item?.slug}`}>Abrir expediente</Link></Popup></Marker>;
          })}
        </MapContainer>

        <dialog
          ref={dialogRef}
          className="map-case-drawer"
          aria-labelledby="map-registry-title"
          onCancel={(event) => { event.preventDefault(); closeRegistry(); }}
          onClose={restoreRegistryFocus}
        >
          {selectedScope && <>
            <header>
              <div><p className="eyebrow">{registryTheme === "illegal-mining" ? "Sustento: minería ilegal" : registryTheme === "informal-mining" ? "Sustento: minería informal" : heatScope === "mining" ? "Registro minero del corte" : "Registro social completo"}</p><h2 id="map-registry-title">{selectedScopeName}</h2></div>
              <button type="button" className="icon-button" onClick={closeRegistry} aria-label="Cerrar registro"><X size={20} aria-hidden="true" /></button>
            </header>
            <p className="map-drawer-summary">
              {scopeCases.length} {scopeCases.length === 1 ? (isThematicRegistry ? "caso con mención explícita" : "caso") : (isThematicRegistry ? "casos con mención explícita" : "casos")} · {scopeCases.filter((item) => item.status === "active").length} {scopeCases.filter((item) => item.status === "active").length === 1 ? "activo" : "activos"} · {scopeCases.filter((item) => item.status === "latent").length} {scopeCases.filter((item) => item.status === "latent").length === 1 ? "latente" : "latentes"}
            </p>

            <div className="map-case-filters">
              <label className="map-case-search"><MagnifyingGlass size={17} aria-hidden="true" /><span className="sr-only">Buscar casos</span><input ref={searchInputRef} autoFocus value={caseQuery} onChange={(event) => setCaseQuery(event.target.value)} placeholder="Buscar caso, lugar o tipo" /></label>
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
          </>}
        </dialog>
      </section>
    </div>
  );
}
