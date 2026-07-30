"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, MagnifyingGlass, X } from "@phosphor-icons/react";
import { CircleMarker, MapContainer, Marker, Popup, TileLayer, Tooltip, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import type { ConflictCase, ExplorationTerritorialSnapshot, FormalMiningTerritorialSnapshot, MiningConcessionTerritorialSnapshot, ReinfoTerritorialSnapshot, SocialConflictCase, SocialConflictSnapshot, Territory } from "@/lib/schemas";
import { mentionsMiningCategory, normalizeSearchText } from "@/lib/mining-classification";

const REPORT_URL = "https://www.defensoria.gob.pe/wp-content/uploads/2026/07/Reporte-de-Conflictos-Sociales-n-268.pdf";
const REINFO_URL = "https://pad.minem.gob.pe/REINFO_WEB/Index.aspx";
const FORMAL_MINING_URL = "https://mineria.minem.gob.pe/directorio_minero/plantas-de-beneficio-autorizadas/";
const EXPLORATION_URL = "https://mineria.minem.gob.pe/directorio_minero/inicio-de-actividades-de-exploracion/";
const CONCESSION_URL = "https://geocatmin.ingemmet.gob.pe/geocatmin/";
const HEAT_COLORS = { low: "#62bfd3", medium: "#d99932", high: "#a52f36" } as const;
const NATIONAL_BOUNDS = L.latLngBounds([[-18.5, -81.5], [-0.1, -68.4]]);

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
type RegistryTheme = "heat" | "illegal-mining" | "informal-mining";
type HeatBand = keyof typeof HEAT_COLORS;

function readMapParam<T extends string>(name: string, allowed: readonly T[], fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const value = new URLSearchParams(window.location.search).get(name);
  return allowed.includes(value as T) ? value as T : fallback;
}

function readMapBoolean(name: string, fallback: boolean) {
  if (typeof window === "undefined") return fallback;
  const value = new URLSearchParams(window.location.search).get(name);
  return value === null ? fallback : value !== "0";
}

function readMapRegion() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("region");
}

function FitMap({ showNationalLayers, territories }: { showNationalLayers: boolean; territories: Territory[] }) {
  const map = useMap();
  useEffect(() => {
    if (showNationalLayers) {
      map.fitBounds(NATIONAL_BOUNDS, { padding: [30, 30], maxZoom: 6 });
    } else if (territories.length) {
      map.fitBounds(territories.map((item) => item.coordinates), { padding: [45, 45], maxZoom: 6 });
    }
  }, [map, showNationalLayers, territories]);
  return null;
}

function MapViewTracker({ regions, resetToken, onChange }: {
  regions: SocialConflictSnapshot["regions"];
  resetToken: number;
  onChange: (label: string, isNational: boolean, zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const reportView = () => {
      const bounds = map.getBounds();
      const visibleRegions = regions.filter((region) => bounds.contains(region.coordinates));
      const isNational = map.getZoom() <= 5 || visibleRegions.length === regions.length;
      const label = isNational
        ? "Perú"
        : visibleRegions.length === 1
          ? visibleRegions[0].name
          : visibleRegions.length > 1 && visibleRegions.length <= 3
            ? visibleRegions.map((region) => region.name).join(", ")
            : visibleRegions.length > 3
              ? `${visibleRegions.length} regiones visibles`
              : "Vista ampliada";
      onChange(label, isNational, map.getZoom());
    };

    reportView();
    map.on("moveend zoomend", reportView);
    return () => { map.off("moveend zoomend", reportView); };
  }, [map, onChange, regions]);

  useEffect(() => {
    if (resetToken > 0) map.fitBounds(NATIONAL_BOUNDS, { padding: [30, 30], maxZoom: 6 });
  }, [map, resetToken]);

  return null;
}

function caseClusterIcon(count: number) {
  return L.divIcon({
    className: "map-case-cluster-icon",
    html: `<span aria-hidden="true">${count}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -18],
  });
}

function DevelopedCaseMarkers({ cases, territories, regions }: {
  cases: ConflictCase[];
  territories: Territory[];
  regions: SocialConflictSnapshot["regions"];
}) {
  const groups = Array.from(cases.reduce((index, item) => {
    const territory = territories.find((entry) => item.territoryIds.includes(entry.id));
    if (!territory) return index;
    const group = index.get(territory.region) ?? { region: territory.region, territory, cases: [] as ConflictCase[] };
    group.cases.push(item);
    index.set(territory.region, group);
    return index;
  }, new Map<string, { region: string; territory: Territory; cases: ConflictCase[] }>()).values());

  return <>{groups.map((group) => {
    const regionReference = regions.find((region) => region.name === group.region);
    const position = group.cases.length > 1 && regionReference ? regionReference.coordinates : group.territory.coordinates;
    const markerName = group.cases.length === 1
      ? `Abrir caso ${group.cases[0].name} en ${group.territory.name}`
      : `Abrir ${group.cases.length} casos desarrollados en ${group.region}`;

    return (
      <Marker
        key={group.region}
        position={position}
        icon={group.cases.length > 1 ? caseClusterIcon(group.cases.length) : markerIcon}
        title={markerName}
        alt={markerName}
      >
        <Popup>
          <div className="map-popup-card" data-layer="tracked-case">
            <p>{group.cases.length === 1 ? "Caso documentado" : "Casos desarrollados"}</p>
            <strong>{group.cases.length === 1 ? group.territory.name : group.region}</strong>
            <small>{group.cases.length === 1 ? group.cases[0].name : `${group.cases.length} casos hito · punto regional de referencia`}</small>
            <div className="map-popup-case-links">
              {group.cases.map((item) => <Link className="map-popup-link" href={`/conflictos/${item.slug}`} key={item.id}>{item.name}</Link>)}
            </div>
          </div>
        </Popup>
      </Marker>
    );
  })}</>;
}

function heatScale(max: number) {
  const lowMax = Math.max(1, Math.ceil(max / 3));
  const mediumMax = Math.max(lowMax + 1, Math.ceil((max * 2) / 3));
  return { lowMax, mediumMax, max };
}

function formatMonthYear(value: string) {
  return new Intl.DateTimeFormat("es-PE", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
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
  const [status, setStatus] = useState(() => readMapParam("status", ["all", "active", "latent", "historical"] as const, "all"));
  const [showHeat, setShowHeat] = useState(() => readMapBoolean("heat", true));
  const [showCases, setShowCases] = useState(() => readMapBoolean("cases", true));
  const [showIllegalMining, setShowIllegalMining] = useState(() => readMapBoolean("illegal", false));
  const [showInformalMining, setShowInformalMining] = useState(() => readMapBoolean("informal", false));
  const [showReinfo, setShowReinfo] = useState(() => readMapBoolean("reinfo", false));
  const [showFormalMining, setShowFormalMining] = useState(() => readMapBoolean("formal", false));
  const [showExploration, setShowExploration] = useState(() => readMapBoolean("exploration", false));
  const [showConcessions, setShowConcessions] = useState(() => readMapBoolean("concessions", false));
  const [heatMetric, setHeatMetric] = useState<HeatMetric>(() => readMapParam("metric", ["total", "active", "latent"] as const, "total"));
  const [selectedScope, setSelectedScope] = useState<string | null>(readMapRegion);
  const [mapViewLabel, setMapViewLabel] = useState("Perú");
  const [mapAtNationalView, setMapAtNationalView] = useState(true);
  const [mapZoom, setMapZoom] = useState(5);
  const [mapResetToken, setMapResetToken] = useState(0);
  const [registryTheme, setRegistryTheme] = useState<RegistryTheme>("heat");
  const [caseQuery, setCaseQuery] = useState("");
  const [caseStatus, setCaseStatus] = useState<CaseStatusFilter>("all");
  const [caseType, setCaseType] = useState("all");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const visibleCases = useMemo(
    () => cases.filter((item) => status === "all" || item.status === status),
    [cases, status],
  );
  const visibleTerritories = useMemo(
    () => territories.filter((item) => visibleCases.some((entry) => entry.territoryIds.includes(item.id))),
    [territories, visibleCases],
  );
  const activeHeatSnapshot = miningSocialConflictSnapshot;
  const activeHeatCases = miningSocialConflictCases;
  const heatMaximum = Math.max(...activeHeatSnapshot.regions.map((region) => region[heatMetric]), 1);
  const peakHeatRegion = [...activeHeatSnapshot.regions].sort((a, b) => b.total - a.total)[0];
  const heatRanges = heatScale(heatMaximum);
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
  const scopeActiveCount = scopeCases.filter((item) => item.status === "active").length;
  const scopeLatentCount = scopeCases.filter((item) => item.status === "latent").length;
  const registryKicker = registryTheme === "illegal-mining" ? "Sustento: minería ilegal" : registryTheme === "informal-mining" ? "Sustento: minería informal" : "Conflictos sociales mineros del corte";
  const registryDescription = registryTheme === "illegal-mining"
    ? "Casos del reporte que mencionan explícitamente minería ilegal, mostrados como referencias departamentales."
    : registryTheme === "informal-mining"
      ? "Casos del reporte que mencionan explícitamente minería informal; se mantiene separada de minería ilegal."
      : "Selección de conflictos socioambientales vinculados con minería en el corte oficial.";
  const hasRegistryFilters = Boolean(caseQuery.trim()) || caseType !== "all" || caseStatus !== defaultRegistryCaseStatus(registryTheme);
  const activeLayerLabels = [
    showHeat ? "Calor" : null,
    showCases ? "Casos desarrollados" : null,
    showIllegalMining ? "Ilegal" : null,
    showInformalMining ? "Informal" : null,
    showReinfo ? "REINFO" : null,
    showFormalMining ? "Formal" : null,
    showExploration ? "Exploración" : null,
    showConcessions ? "Concesiones" : null,
  ].filter((label): label is string => Boolean(label));
  const mapStageTitle = showHeat
    ? "Distribución regional del corte minero"
    : showReinfo
      ? `${reinfoSnapshot.totalRegistered.toLocaleString("es-PE")} inscripciones REINFO vigentes`
      : "Capas territoriales";
  const mapStageSubtitle = showHeat
    ? `${activeHeatSnapshot.regions.length} regiones con registro · ${metricLabel(heatMetric).toLowerCase()} por región`
    : showReinfo
      ? `Registro administrativo agregado por departamento · corte ${fullDateLabel(reinfoSnapshot.cutoffDate)}`
      : "Mapa base con capas seleccionadas";
  const validScopeIds = useMemo(
    () => new Set(["nacional", "multiregional", ...activeHeatSnapshot.regions.map((region) => region.id)]),
    [activeHeatSnapshot.regions],
  );
  const handleMapViewChange = useCallback((label: string, isNational: boolean, zoom: number) => {
    setMapViewLabel(label);
    setMapAtNationalView(isNational);
    setMapZoom(zoom);
  }, []);

  useEffect(() => {
    if (selectedScope && !validScopeIds.has(selectedScope)) setSelectedScope(null);
  }, [selectedScope, validScopeIds]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (status === "all") url.searchParams.delete("status"); else url.searchParams.set("status", status);
    if (heatMetric === "total") url.searchParams.delete("metric"); else url.searchParams.set("metric", heatMetric);
    if (showHeat) url.searchParams.delete("heat"); else url.searchParams.set("heat", "0");
    if (showCases) url.searchParams.delete("cases"); else url.searchParams.set("cases", "0");
    if (showIllegalMining) url.searchParams.set("illegal", "1"); else url.searchParams.delete("illegal");
    if (showInformalMining) url.searchParams.set("informal", "1"); else url.searchParams.delete("informal");
    if (showReinfo) url.searchParams.set("reinfo", "1"); else url.searchParams.delete("reinfo");
    if (showFormalMining) url.searchParams.set("formal", "1"); else url.searchParams.delete("formal");
    if (showExploration) url.searchParams.set("exploration", "1"); else url.searchParams.delete("exploration");
    if (showConcessions) url.searchParams.set("concessions", "1"); else url.searchParams.delete("concessions");
    if (selectedScope) url.searchParams.set("region", selectedScope); else url.searchParams.delete("region");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [heatMetric, selectedScope, showCases, showConcessions, showExploration, showFormalMining, showHeat, showIllegalMining, showInformalMining, showReinfo, status]);

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

  useEffect(() => {
    if (!selectedScope) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedScope]);

  function openRegistry(scopeId: string, theme: RegistryTheme = "heat", trigger?: HTMLElement | null) {
    returnFocusRef.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setSelectedScope(scopeId);
    setRegistryTheme(theme);
    setCaseQuery("");
    setCaseType("all");
    setCaseStatus(defaultRegistryCaseStatus(theme));
  }

  function closeRegistry() {
    setSelectedScope(null);
  }

  function restoreRegistryFocus() {
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }

  function defaultRegistryCaseStatus(theme: RegistryTheme): CaseStatusFilter {
    return theme !== "heat" || heatMetric === "total" ? "all" : heatMetric;
  }

  function resetRegistryFilters() {
    setCaseQuery("");
    setCaseType("all");
    setCaseStatus(defaultRegistryCaseStatus(registryTheme));
  }

  return (
    <div className="map-layout">
      <aside>
        <p className="eyebrow">Vista territorial</p>
        <h1>Conflictos sociales mineros en el Perú</h1>
        <p>Distribución regional de conflictos sociales vinculados con minería, con estado al corte y casos documentados para consulta.</p>

        <div className="map-snapshot" aria-label="Resumen del mapa">
          <strong>{activeHeatSnapshot.regions.length}</strong>
          <span>regiones con registros</span>
          {peakHeatRegion && <small>Mayor concentración: {peakHeatRegion.name} · {peakHeatRegion.total} casos</small>}
          <small>Corte: {formatMonthYear(socialConflictSnapshot.cutoffDate)} · Reporte n.º {socialConflictSnapshot.reportNumber}</small>
        </div>
        <p className="map-scope-note">{cases.length} casos hito permiten pasar de la concentración regional a la historia territorial de cada disputa.</p>
        <a className="map-jump-link" href="#map-stage">Ver mapa</a>

        <fieldset className="map-layers map-layer-group">
          <legend>Capas principales</legend>
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showHeat} onChange={(event) => setShowHeat(event.target.checked)} />
            <span><strong>Calor de conflictos sociales mineros</strong><small>Distribución regional derivada del reporte oficial</small></span>
          </label>
          <label className="map-layer-toggle">
            <input type="checkbox" checked={showCases} onChange={(event) => setShowCases(event.target.checked)} />
            <span><strong>Casos desarrollados</strong><small>{cases.length} historias territoriales</small></span>
          </label>
        </fieldset>

        <details className="map-layer-details">
          <summary><span>Minería ilegal e informal</span><small>{Number(showIllegalMining) + Number(showInformalMining)} activas</small></summary>
          <fieldset className="map-layers map-layer-group">
            <legend className="sr-only">Capas de minería ilegal e informal</legend>
            <label className="map-layer-toggle" data-layer-toggle="illegal-mining">
              <input type="checkbox" checked={showIllegalMining} onChange={(event) => setShowIllegalMining(event.target.checked)} />
              <span><strong>Minería ilegal</strong><small>Menciones explícitas en conflictos sociales mineros, agregadas por departamento</small></span>
            </label>
            <label className="map-layer-toggle" data-layer-toggle="informal-mining">
              <input type="checkbox" checked={showInformalMining} onChange={(event) => setShowInformalMining(event.target.checked)} />
              <span><strong>Minería informal</strong><small>Menciones explícitas separadas de minería ilegal</small></span>
            </label>
            <Link className="map-jump-link" href="/oro-ilegal">Abrir cadena del oro</Link>
          </fieldset>
        </details>

        <fieldset className="map-layers map-layer-group">
          <legend>Registro administrativo separado</legend>
          <label className="map-layer-toggle" data-layer-toggle="reinfo">
            <input type="checkbox" checked={showReinfo} onChange={(event) => setShowReinfo(event.target.checked)} />
            <span><strong>Inscripciones REINFO</strong><small>Registros vigentes agregados por departamento; no son conflictos sociales ni ubicaciones de actividad</small></span>
          </label>
          <Link className="map-jump-link" href="/reinfo">Abrir página REINFO / MAPE</Link>
        </fieldset>

        <details className="map-layer-details">
          <summary><span>Minería formal, exploración y concesiones</span><small>{Number(showFormalMining) + Number(showExploration) + Number(showConcessions)} activas</small></summary>
          <fieldset className="map-layers map-layer-group">
            <legend className="sr-only">Capas de plantas de beneficio vigentes, exploración y concesiones</legend>
            <label className="map-layer-toggle" data-layer-toggle="formal-mining">
              <input type="checkbox" checked={showFormalMining} onChange={(event) => setShowFormalMining(event.target.checked)} />
              <span><strong>Plantas de beneficio vigentes</strong><small>Indicador parcial de infraestructura formal registrada por MINEM</small></span>
            </label>
            <label className="map-layer-toggle" data-layer-toggle="exploration">
              <input type="checkbox" checked={showExploration} onChange={(event) => setShowExploration(event.target.checked)} />
              <span><strong>Exploración minera</strong><small>Expedientes activos para inicio de actividades de exploración</small></span>
            </label>
            <label className="map-layer-toggle" data-layer-toggle="concessions">
              <input type="checkbox" checked={showConcessions} onChange={(event) => setShowConcessions(event.target.checked)} />
              <span><strong>Concesiones mineras</strong><small>Derechos titulados agregados por departamento</small></span>
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
            <p>Leyenda de intensidad</p>
            <div>
              <span><i data-band="low" aria-hidden="true" />Baja · 1–{heatRanges.lowMax}</span>
              <span><i data-band="medium" aria-hidden="true" />Media · {heatRanges.lowMax + 1}–{heatRanges.mediumMax}</span>
              <span><i data-band="high" aria-hidden="true" />Alta · {heatRanges.mediumMax + 1}–{heatRanges.max}</span>
            </div>
            <small>La escala se recalcula según el enfoque y la métrica seleccionada.</small>
          </div>
          <label className="map-select-label">Abrir registro por región
            <select value={selectedScope ?? ""} onChange={(event) => event.target.value && openRegistry(event.target.value, "heat", event.currentTarget)}>
              <option value="">Elegir región</option>
              {activeHeatSnapshot.national.total > 0 && <option value="nacional">Ámbito nacional · {activeHeatSnapshot.national.total}</option>}
              {activeHeatSnapshot.multiregional.total > 0 && <option value="multiregional">Ámbito multirregional · {activeHeatSnapshot.multiregional.total}</option>}
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
            <div className="map-layer-key" aria-label="Símbolo de minería ilegal en el mapa">
              <span><i data-symbol="illegal" aria-hidden="true" />Punto rojo sólido</span>
            </div>
            <small>Se muestra como referencia departamental. {overlappingMiningCases.length} casos también mencionan minería informal.</small>
            {illegalMiningMultiregional > 0 && <button type="button" onClick={(event) => openRegistry("multiregional", "illegal-mining", event.currentTarget)}>Ver casos multirregionales</button>}
          </div>
        )}

        {showInformalMining && (
          <div className="map-layer-summary" data-layer="informal-mining">
            <p>Menciones de minería informal</p>
            <strong>{informalMiningCases.length} casos con mención explícita</strong>
            <span>{informalMiningCases.length - informalMiningMultiregional} regionales · {informalMiningMultiregional} multirregional</span>
            <div className="map-layer-key" aria-label="Símbolo de minería informal en el mapa">
              <span><i data-symbol="informal" aria-hidden="true" />Anillo ámbar punteado</span>
            </div>
            <small>Se muestra como referencia departamental. {overlappingMiningCases.length} casos también mencionan minería ilegal.</small>
            {informalMiningMultiregional > 0 && <button type="button" onClick={(event) => openRegistry("multiregional", "informal-mining", event.currentTarget)}>Ver caso multirregional</button>}
          </div>
        )}

        {showReinfo && (
          <div className="map-layer-summary" data-layer="reinfo">
            <p>REINFO vigente</p>
            <strong>{reinfoSnapshot.totalRegistered.toLocaleString("es-PE")} inscripciones</strong>
            <span>Corte de consulta: {fullDateLabel(reinfoSnapshot.cutoffDate)}</span>
            <p className="map-legend-caption">Tamaño en mapa</p>
            <div className="point-size-legend" aria-label="Tamaño del punto según inscripciones REINFO">
              <span><i data-size="small" aria-hidden="true" />1–499</span>
              <span><i data-size="medium" aria-hidden="true" />500–1.999</span>
              <span><i data-size="large" aria-hidden="true" />2.000 o más</span>
            </div>
            <small>El punto representa inscripciones vigentes agregadas por departamento.</small>
            <a href={REINFO_URL} target="_blank" rel="noreferrer">Consultar registro oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
          </div>
        )}

        {showFormalMining && (
          <div className="map-layer-summary" data-layer="formal-mining">
            <p>Infraestructura de beneficio registrada por MINEM</p>
            <strong>{formalMiningSnapshot.mappedUnits.toLocaleString("es-PE")} plantas territorializables</strong>
            <span>{formalMiningSnapshot.totalUnits.toLocaleString("es-PE")} códigos únicos en la fuente · consulta: {fullDateLabel(formalMiningSnapshot.cutoffDate)}</span>
            <p className="map-legend-caption">Tamaño en mapa</p>
            <div className="point-size-legend formal-point-size-legend" aria-label="Tamaño del anillo según plantas de beneficio vigentes">
              <span><i data-size="small" aria-hidden="true" />1–9</span>
              <span><i data-size="medium" aria-hidden="true" />10–29</span>
              <span><i data-size="large" aria-hidden="true" />30 o más</span>
            </div>
            <small>Es un indicador parcial de infraestructura minera formal: incluye plantas de beneficio vigentes, no unidades mineras en producción, concesiones, proyectos, titulares ni todas las operaciones formales. Los conteos están agregados por departamento y {formalMiningSnapshot.unmappedUnits} códigos no georreferenciados por departamento quedan fuera del mapa.</small>
            <a href={FORMAL_MINING_URL} target="_blank" rel="noreferrer">Consultar directorio oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
          </div>
        )}

        {showExploration && (
          <div className="map-layer-summary" data-layer="exploration">
            <p>Exploración documentada</p>
            <strong>{explorationSnapshot.totalProjects.toLocaleString("es-PE")} expedientes únicos</strong>
            <span>{explorationSnapshot.totalAreaHectares.toLocaleString("es-PE", { maximumFractionDigits: 0 })} ha informadas · consulta: {fullDateLabel(explorationSnapshot.cutoffDate)}</span>
            <p className="map-legend-caption">Tamaño en mapa</p>
            <div className="point-size-legend exploration-point-size-legend" aria-label="Tamaño del anillo según expedientes de exploración">
              <span><i data-size="small" aria-hidden="true" />1–9</span>
              <span><i data-size="medium" aria-hidden="true" />10–24</span>
              <span><i data-size="large" aria-hidden="true" />25 o más</span>
            </div>
            <small>Los anillos representan expedientes de exploración agregados por departamento.</small>
            <a href={EXPLORATION_URL} target="_blank" rel="noreferrer">Consultar directorio oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
          </div>
        )}

        {showConcessions && (
          <div className="map-layer-summary" data-layer="concessions">
            <p>Catastro minero titulado</p>
            <strong>{miningConcessionSnapshot.totalRights.toLocaleString("es-PE")} derechos únicos</strong>
            <span>{miningConcessionSnapshot.regionalPresences.toLocaleString("es-PE")} presencias departamentales · servicio de actualización diaria consultado el {fullDateLabel(miningConcessionSnapshot.cutoffDate)}</span>
            <p className="map-legend-caption">Tamaño en mapa</p>
            <div className="point-size-legend concession-point-size-legend" aria-label="Tamaño del anillo según derechos mineros titulados">
              <span><i data-size="small" aria-hidden="true" />1–999</span>
              <span><i data-size="medium" aria-hidden="true" />1.000–2.999</span>
              <span><i data-size="large" aria-hidden="true" />3.000 o más</span>
            </div>
            <small>{miningConcessionSnapshot.unmappedRights} derechos de ámbito marítimo quedan fuera del mapa; los derechos multidepartamentales se cuentan en cada departamento.</small>
            <a href={CONCESSION_URL} target="_blank" rel="noreferrer">Consultar GEOCATMIN oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
          </div>
        )}

        {showCases && (
          <details className="map-case-index">
            <summary>Consultar casos desarrollados <span>{cases.length}</span></summary>
            <label className="map-select-label">Estado del caso
              <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="latent">Latentes</option>
                <option value="historical">Históricos</option>
              </select>
            </label>
            <div className="map-case-list">
              {visibleCases.map((item) => <Link href={`/conflictos/${item.slug}`} key={item.id}>{item.name}<small>{territories.find((territory) => item.territoryIds.includes(territory.id))?.region}</small></Link>)}
            </div>
          </details>
        )}

        <small className="map-disclaimer">
          Los registros se representan mediante puntos regionales de referencia. Los casos nacionales o multirregionales no se asignan a un punto para evitar doble conteo. La intensidad no representa impacto, violencia ni causalidad.
          {showReinfo && " REINFO se muestra como registro administrativo agregado y no se suma al conteo de conflictos."}
        </small>
        <a className="map-source" href={REPORT_URL} target="_blank" rel="noreferrer">Consultar reporte oficial <ArrowSquareOut size={14} aria-hidden="true" /></a>
      </aside>

      <section id="map-stage" className="map-stage" aria-label="Mapa interactivo de conflictos sociales mineros y casos documentados" aria-describedby="map-accessibility-note">
        <p id="map-accessibility-note" className="sr-only">El selector regional abre el mismo registro de casos disponible desde los puntos del mapa. Los controles de zoom permiten ampliar o reducir la vista territorial.</p>
        <div className="map-stage-context" aria-label="Resumen visible del mapa actual">
          <span>Vista actual</span>
          <strong>{mapViewLabel}</strong>
          <span className="sr-only" role="status" aria-live="polite">Nivel de zoom: {mapZoom}</span>
          <small>{mapStageTitle} · {mapStageSubtitle}</small>
          {!mapAtNationalView && <button type="button" onClick={() => setMapResetToken((value) => value + 1)}>Volver a todo el Perú</button>}
          <div aria-label={`Capas visibles: ${activeLayerLabels.length ? activeLayerLabels.join(", ") : "ninguna"}`}>
          {(activeLayerLabels.length ? activeLayerLabels : ["Capas desactivadas"]).map((label) => <span key={label}>{label}</span>)}
          </div>
        </div>
        <MapContainer center={[-9.19, -75.02]} zoom={5} zoomControl={false} scrollWheelZoom doubleClickZoom touchZoom keyboard>
          <ZoomControl position="bottomleft" zoomInTitle="Acercar" zoomOutTitle="Alejar" />
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <FitMap showNationalLayers={showHeat || showIllegalMining || showInformalMining || showReinfo || showFormalMining || showExploration || showConcessions} territories={visibleTerritories} />
          <MapViewTracker regions={activeHeatSnapshot.regions} resetToken={mapResetToken} onChange={handleMapViewChange} />
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
                <div className="map-popup-card" data-layer="heat">
                  <p>Registro regional</p>
                  <strong>{region.name}</strong>
                  <dl>
                    <div><dt>{metricLabel(heatMetric)}</dt><dd>{region[heatMetric]}</dd></div>
                    <div><dt>Total</dt><dd>{region.total}</dd></div>
                    <div><dt>Estado</dt><dd>{region.active} activos · {region.latent} latentes</dd></div>
                  </dl>
                  <small>Intensidad {heatBandLabel(region[heatMetric], heatMaximum).toLowerCase()}. Punto regional de referencia; no representa impacto, violencia ni causalidad.</small>
                  <button className="map-popup-action" type="button" onClick={(event) => openRegistry(region.id, "heat", event.currentTarget)}>Abrir registro de casos</button>
                </div>
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
                <div className="map-popup-card" data-layer="concessions">
                  <p>Catastro minero titulado</p>
                  <strong>{region.name}</strong>
                  <dl><div><dt>Presencias</dt><dd>{region.count.toLocaleString("es-PE")}</dd></div></dl>
                  <small>Conteo departamental de derechos titulados; actividad, superficie y permisos se gestionan en capas distintas.</small>
                  <a className="map-popup-link" href={CONCESSION_URL} target="_blank" rel="noreferrer">Consultar GEOCATMIN oficial <ArrowSquareOut size={13} aria-hidden="true" /></a>
                </div>
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
                <div className="map-popup-card" data-layer="exploration">
                  <p>Exploración documentada</p>
                  <strong>{region.name}</strong>
                  <dl>
                    <div><dt>Expedientes</dt><dd>{region.count}</dd></div>
                    <div><dt>Área informada</dt><dd>{region.areaHectares.toLocaleString("es-PE", { maximumFractionDigits: 0 })} ha</dd></div>
                  </dl>
                  <small>Expedientes de exploración agregados por departamento.</small>
                  <a className="map-popup-link" href={EXPLORATION_URL} target="_blank" rel="noreferrer">Consultar directorio oficial <ArrowSquareOut size={13} aria-hidden="true" /></a>
                </div>
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
                <div className="map-popup-card" data-layer="informal-mining">
                  <p>Menciones de minería informal</p>
                  <strong>{region.name}</strong>
                  <dl><div><dt>Casos</dt><dd>{region.count}</dd></div></dl>
                  <small>Menciones explícitas del reporte agregadas por departamento.</small>
                  <button className="map-popup-action" type="button" onClick={(event) => openRegistry(region.id, "informal-mining", event.currentTarget)}>Ver información regional</button>
                </div>
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
                <div className="map-popup-card" data-layer="illegal-mining">
                  <p>Menciones de minería ilegal</p>
                  <strong>{region.name}</strong>
                  <dl><div><dt>Casos</dt><dd>{region.count}</dd></div></dl>
                  <small>Menciones explícitas del reporte agregadas por departamento.</small>
                  <button className="map-popup-action" type="button" onClick={(event) => openRegistry(region.id, "illegal-mining", event.currentTarget)}>Ver información regional</button>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {showReinfo && reinfoSnapshot.regions.filter((region) => region.count > 0).map((region) => (
            <CircleMarker
              key={`reinfo-${region.id}`}
              center={region.coordinates}
              radius={reinfoRadius(region.count)}
              pathOptions={{ className: "map-marker-reinfo", color: "#343a73", weight: 2, fillColor: "#7479c9", fillOpacity: 0.62 }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count.toLocaleString("es-PE")} inscripciones REINFO vigentes</Tooltip>
              <Popup>
                <div className="map-popup-card" data-layer="reinfo">
                  <p>REINFO vigente</p>
                  <strong>{region.name}</strong>
                  <dl><div><dt>Inscripciones</dt><dd>{region.count.toLocaleString("es-PE")}</dd></div></dl>
                  <small>Inscripciones vigentes agregadas por departamento.</small>
                  <a className="map-popup-link" href={REINFO_URL} target="_blank" rel="noreferrer">Consultar REINFO oficial <ArrowSquareOut size={13} aria-hidden="true" /></a>
                </div>
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
                <div className="map-popup-card" data-layer="formal-mining">
                  <p>Plantas de beneficio vigentes</p>
                  <strong>{region.name}</strong>
                  <dl><div><dt>Plantas</dt><dd>{region.count}</dd></div></dl>
                  <small>Referencia regional; no es la ubicación exacta de cada planta ni el universo completo de operaciones mineras formales.</small>
                  <a className="map-popup-link" href={FORMAL_MINING_URL} target="_blank" rel="noreferrer">Consultar directorio oficial <ArrowSquareOut size={13} aria-hidden="true" /></a>
                </div>
              </Popup>
            </CircleMarker>
          ))}
          {showCases && <DevelopedCaseMarkers cases={visibleCases} territories={territories} regions={activeHeatSnapshot.regions} />}
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
              <div>
                <p className="eyebrow">{registryKicker}</p>
                <h2 id="map-registry-title">{selectedScopeName}</h2>
                <p className="map-registry-note">{registryDescription}</p>
              </div>
              <button type="button" className="icon-button" onClick={closeRegistry} aria-label="Cerrar registro"><X size={20} aria-hidden="true" /></button>
            </header>

            <dl className="map-drawer-summary" aria-label="Resumen del registro seleccionado">
              <div><dt>Total</dt><dd><strong>{scopeCases.length}</strong><span>{scopeCases.length === 1 ? (isThematicRegistry ? "mención" : "caso") : (isThematicRegistry ? "menciones" : "casos")}</span></dd></div>
              <div><dt>Activos</dt><dd><strong>{scopeActiveCount}</strong><span>{scopeActiveCount === 1 ? "caso" : "casos"}</span></dd></div>
              <div><dt>Latentes</dt><dd><strong>{scopeLatentCount}</strong><span>{scopeLatentCount === 1 ? "caso" : "casos"}</span></dd></div>
            </dl>

            <div className="map-case-filter-panel">
              <div className="map-filter-heading">
                <span>Filtrar registro</span>
                <button type="button" onClick={resetRegistryFilters} disabled={!hasRegistryFilters}>Limpiar</button>
              </div>
              <div className="map-case-filters">
                <label className="map-case-search"><MagnifyingGlass size={17} aria-hidden="true" /><span className="sr-only">Buscar casos</span><input ref={searchInputRef} autoFocus value={caseQuery} onChange={(event) => setCaseQuery(event.target.value)} placeholder="Buscar caso, lugar o tipo" /></label>
                <label><span>Estado</span><select value={caseStatus} onChange={(event) => setCaseStatus(event.target.value as CaseStatusFilter)}><option value="all">Todos</option><option value="active">Activos</option><option value="latent">Latentes</option></select></label>
                <label><span>Tipo</span><select value={caseType} onChange={(event) => setCaseType(event.target.value)}><option value="all">Todos</option>{availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
              </div>
            </div>

            <div className="map-results-bar">
              <p className="map-results-count" aria-live="polite">{filteredScopeCases.length} {filteredScopeCases.length === 1 ? "resultado" : "resultados"}</p>
              {hasRegistryFilters && <span>Filtros activos</span>}
            </div>
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
              {!filteredScopeCases.length && <p className="map-empty-state">Ajusta los filtros para recuperar casos del ámbito.</p>}
            </div>
          </>}
        </dialog>
      </section>
    </div>
  );
}
