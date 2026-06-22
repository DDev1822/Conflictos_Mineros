"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowSquareOut,
  CaretDown,
  CaretRight,
  Layers,
  MagnifyingGlass,
  X,
} from "@phosphor-icons/react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";
import styles from "./map-explorer.module.css";
import type {
  ConflictCase,
  ExplorationTerritorialSnapshot,
  FormalMiningTerritorialSnapshot,
  MiningConcessionTerritorialSnapshot,
  ReinfoTerritorialSnapshot,
  SocialConflictCase,
  SocialConflictSnapshot,
  Territory,
} from "@/lib/schemas";

const REPORT_URL = "https://www.defensoria.gob.pe/wp-content/uploads/2026/05/Reporte-de-Conflictos-Sociales-n-266-VF.pdf";
const REINFO_URL = "https://pad.minem.gob.pe/REINFO_WEB/Index.aspx";
const FORMAL_MINING_URL = "https://mineria.minem.gob.pe/directorio_minero/plantas-de-beneficio-autorizadas/";
const EXPLORATION_URL = "https://mineria.minem.gob.pe/directorio_minero/inicio-de-actividades-de-exploracion/";
const CONCESSION_URL = "https://geocatmin.ingemmet.gob.pe/geocatmin/";

const HEAT_COLORS = { low: "#42d5a2", medium: "#ffc857", high: "#ff625d" } as const;
const LAYER_COLORS = {
  heat: "#ff625d",
  cases: "#d1834b",
  informal: "#f09b4f",
  reinfo: "#29ccd4",
  formal: "#3fd99d",
  exploration: "#678cff",
  concessions: "#a98cff",
} as const;

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
type MapMode = "individual" | "overlay" | "convergence";
type LayerKey = "heat" | "cases" | "informal" | "reinfo" | "formal" | "exploration" | "concessions";
type LayerGroup = "conflict" | "formalization" | "operations" | "rights";

type RegionDescriptor = {
  id: string;
  name: string;
  coordinates: [number, number];
};

type LayerDefinition = {
  key: LayerKey;
  group: LayerGroup;
  label: string;
  shortLabel: string;
  description: string;
  color: string;
};

const LAYERS: LayerDefinition[] = [
  { key: "heat", group: "conflict", label: "Calor de conflictos sociales", shortLabel: "Conflictos", description: "Distribución regional oficial", color: LAYER_COLORS.heat },
  { key: "cases", group: "conflict", label: "Expedientes piloto", shortLabel: "Casos piloto", description: "Seis casos del observatorio", color: LAYER_COLORS.cases },
  { key: "informal", group: "conflict", label: "Minería ilegal e informal", shortLabel: "Menciones ilegal/informal", description: "Menciones explícitas en el corte", color: LAYER_COLORS.informal },
  { key: "reinfo", group: "formalization", label: "Inscripciones REINFO", shortLabel: "REINFO", description: "Registro vigente agregado", color: LAYER_COLORS.reinfo },
  { key: "formal", group: "operations", label: "Plantas de beneficio vigentes", shortLabel: "Plantas vigentes", description: "Capa parcial de minería formal", color: LAYER_COLORS.formal },
  { key: "exploration", group: "operations", label: "Exploración minera", shortLabel: "Exploración", description: "Expedientes en actividad", color: LAYER_COLORS.exploration },
  { key: "concessions", group: "rights", label: "Derechos mineros titulados", shortLabel: "Derechos titulados", description: "Catastro de INGEMMET", color: LAYER_COLORS.concessions },
];

const GROUPS: { key: LayerGroup; label: string }[] = [
  { key: "conflict", label: "Conflictividad" },
  { key: "formalization", label: "Formalización" },
  { key: "operations", label: "Operaciones mineras" },
  { key: "rights", label: "Infraestructura y derechos" },
];

const CONVERGENCE_LAYER_KEYS: LayerKey[] = ["heat", "reinfo", "formal", "exploration", "concessions"];

function modePreset(mode: MapMode): Record<LayerKey, boolean> {
  if (mode === "overlay") {
    return { heat: true, cases: false, informal: false, reinfo: true, formal: false, exploration: false, concessions: true };
  }
  if (mode === "convergence") {
    return { heat: true, cases: false, informal: false, reinfo: true, formal: true, exploration: true, concessions: true };
  }
  return { heat: true, cases: false, informal: false, reinfo: false, formal: false, exploration: false, concessions: false };
}

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
      minOpacity: 0.26,
      gradient: { 0.12: HEAT_COLORS.low, 0.42: HEAT_COLORS.medium, 0.7: HEAT_COLORS.high, 1: "#b7253b" },
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

function formatCount(value: number) {
  return value.toLocaleString("es-PE");
}

export function MapExplorer({ cases, territories, socialConflictSnapshot, socialConflictCases, reinfoSnapshot, formalMiningSnapshot, explorationSnapshot, miningConcessionSnapshot }: {
  cases: ConflictCase[];
  territories: Territory[];
  socialConflictSnapshot: SocialConflictSnapshot;
  socialConflictCases: SocialConflictCase[];
  reinfoSnapshot: ReinfoTerritorialSnapshot;
  formalMiningSnapshot: FormalMiningTerritorialSnapshot;
  explorationSnapshot: ExplorationTerritorialSnapshot;
  miningConcessionSnapshot: MiningConcessionTerritorialSnapshot;
}) {
  const [mode, setMode] = useState<MapMode>("individual");
  const [layers, setLayers] = useState<Record<LayerKey, boolean>>(() => modePreset("individual"));
  const [panelOpen, setPanelOpen] = useState(true);
  const [openGroups, setOpenGroups] = useState<Record<LayerGroup, boolean>>({ conflict: true, formalization: true, operations: false, rights: false });
  const [layerLimitMessage, setLayerLimitMessage] = useState(false);
  const [status, setStatus] = useState("all");
  const [heatMetric, setHeatMetric] = useState<HeatMetric>("total");
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(() => socialConflictSnapshot.regions[0]?.id ?? null);
  const [selectedScope, setSelectedScope] = useState<string | null>(null);
  const [registryTheme, setRegistryTheme] = useState<RegistryTheme>("all");
  const [caseQuery, setCaseQuery] = useState("");
  const [caseStatus, setCaseStatus] = useState<CaseStatusFilter>("all");
  const [caseType, setCaseType] = useState("all");

  const activeLayerKeys = useMemo(() => LAYERS.filter((layer) => layers[layer.key]).map((layer) => layer.key), [layers]);
  const activeLayers = useMemo(() => LAYERS.filter((layer) => layers[layer.key]), [layers]);
  const visibleCases = cases.filter((item) => status === "all" || item.status === status);
  const visibleTerritories = useMemo(
    () => territories.filter((item) => visibleCases.some((entry) => entry.territoryIds.includes(item.id))),
    [territories, visibleCases],
  );

  const plottedTotal = socialConflictSnapshot.regions.reduce((sum, region) => sum + region.total, 0);
  const heatMaximum = Math.max(...socialConflictSnapshot.regions.map((region) => region[heatMetric]), 1);
  const heatRanges = heatScale(heatMaximum);
  const hotspots = [...socialConflictSnapshot.regions].sort((a, b) => b[heatMetric] - a[heatMetric]).slice(0, 5);

  const informalIllegalCases = useMemo(() => socialConflictCases.filter(isInformalIllegalCase), [socialConflictCases]);
  const informalIllegalRegions = useMemo(() => socialConflictSnapshot.regions
    .map((region) => ({
      ...region,
      count: informalIllegalCases.filter((item) => item.regionIds.includes(region.id)).length,
    }))
    .filter((region) => region.count > 0), [informalIllegalCases, socialConflictSnapshot]);
  const informalIllegalMultiregional = informalIllegalCases.filter((item) => item.regionIds.includes("multiregional")).length;

  const regionIndex = useMemo(() => {
    const index = new Map<string, RegionDescriptor>();
    const register = (regions: { id: string; name: string; coordinates: [number, number] }[]) => {
      regions.forEach((region) => {
        if (!index.has(region.id)) index.set(region.id, { id: region.id, name: region.name, coordinates: region.coordinates });
      });
    };
    register(socialConflictSnapshot.regions);
    register(reinfoSnapshot.regions);
    register(formalMiningSnapshot.regions);
    register(explorationSnapshot.regions);
    register(miningConcessionSnapshot.regions);
    return index;
  }, [socialConflictSnapshot, reinfoSnapshot, formalMiningSnapshot, explorationSnapshot, miningConcessionSnapshot]);

  const layerValueMaps = useMemo(() => ({
    heat: new Map(socialConflictSnapshot.regions.map((region) => [region.id, region[heatMetric]])),
    informal: new Map(informalIllegalRegions.map((region) => [region.id, region.count])),
    reinfo: new Map(reinfoSnapshot.regions.map((region) => [region.id, region.count])),
    formal: new Map(formalMiningSnapshot.regions.map((region) => [region.id, region.count])),
    exploration: new Map(explorationSnapshot.regions.map((region) => [region.id, region.count])),
    concessions: new Map(miningConcessionSnapshot.regions.map((region) => [region.id, region.count])),
  }), [socialConflictSnapshot, heatMetric, informalIllegalRegions, reinfoSnapshot, formalMiningSnapshot, explorationSnapshot, miningConcessionSnapshot]);

  const convergenceLayerKeys = activeLayerKeys.filter((key) => CONVERGENCE_LAYER_KEYS.includes(key));
  const convergenceRegions = useMemo(() => [...regionIndex.values()].map((region) => {
    const values = convergenceLayerKeys.map((key) => {
      if (key === "cases") return 0;
      return layerValueMaps[key]?.get(region.id) ?? 0;
    });
    return { ...region, presence: values.filter((value) => value > 0).length };
  }).filter((region) => region.presence > 0), [regionIndex, convergenceLayerKeys, layerValueMaps]);

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

  const selectedTerritory = selectedTerritoryId ? regionIndex.get(selectedTerritoryId) : undefined;
  const selectedRegion = socialConflictSnapshot.regions.find((region) => region.id === selectedScope);
  const selectedScopeName = selectedRegion?.name ?? (selectedScope === "nacional" ? "Ámbito nacional" : "Ámbito multirregional");

  const selectedTerritoryEntries = useMemo(() => {
    if (!selectedTerritory) return [];
    return activeLayers.map((layer) => {
      let value = 0;
      if (layer.key === "cases") {
        value = cases.filter((item) => item.territoryIds.some((territoryId) => {
          const territory = territories.find((entry) => entry.id === territoryId);
          return territory ? normalize(territory.region) === normalize(selectedTerritory.name) : false;
        })).length;
      } else {
        value = layerValueMaps[layer.key]?.get(selectedTerritory.id) ?? 0;
      }
      const suffix: Record<LayerKey, string> = {
        heat: `conflictos ${metricLabel(heatMetric)}`,
        cases: "expedientes piloto",
        informal: "casos con mención explícita",
        reinfo: "inscripciones REINFO vigentes",
        formal: "plantas de beneficio vigentes",
        exploration: "expedientes de exploración",
        concessions: "derechos titulados",
      };
      return { ...layer, value, suffix: suffix[layer.key] };
    });
  }, [activeLayers, cases, heatMetric, layerValueMaps, selectedTerritory, territories]);

  const selectedTerritoryCaseCount = selectedTerritoryId
    ? socialConflictCases.filter((item) => item.regionIds.includes(selectedTerritoryId)).length
    : 0;

  function applyMode(nextMode: MapMode) {
    setMode(nextMode);
    setLayers(modePreset(nextMode));
    setLayerLimitMessage(false);
    setOpenGroups(nextMode === "convergence"
      ? { conflict: true, formalization: true, operations: true, rights: true }
      : { conflict: true, formalization: true, operations: false, rights: false });
    const fallback = nextMode === "individual" ? hotspots[0]?.id : regionIndex.has("cajamarca") ? "cajamarca" : hotspots[0]?.id;
    setSelectedTerritoryId(fallback ?? null);
  }

  function toggleLayer(key: LayerKey) {
    if (mode === "convergence" && !CONVERGENCE_LAYER_KEYS.includes(key)) return;
    setLayerLimitMessage(false);
    setLayers((current) => {
      if (mode === "individual") {
        return Object.fromEntries(LAYERS.map((layer) => [layer.key, layer.key === key])) as Record<LayerKey, boolean>;
      }
      const activeCount = Object.values(current).filter(Boolean).length;
      if (mode === "overlay" && !current[key] && activeCount >= 3) {
        setLayerLimitMessage(true);
        return current;
      }
      return { ...current, [key]: !current[key] };
    });
  }

  function selectTerritory(scopeId: string) {
    setSelectedTerritoryId(scopeId);
  }

  function openRegistry(scopeId: string, theme: RegistryTheme = "all") {
    setSelectedTerritoryId(scopeId);
    setSelectedScope(scopeId);
    setRegistryTheme(theme);
    setCaseQuery("");
    setCaseType("all");
    setCaseStatus(theme === "informal-illegal" || heatMetric === "total" ? "all" : heatMetric);
  }

  const modeTitle = mode === "individual"
    ? "Mapa individual"
    : mode === "overlay"
      ? "Coincidencia territorial"
      : "Convergencia territorial descriptiva";
  const modeDescription = mode === "individual"
    ? "Lectura detallada de una capa activa"
    : mode === "overlay"
      ? "Hasta tres capas independientes en un mismo territorio"
      : "Número de capas con registros en cada punto departamental";

  const showNationalLayers = mode === "convergence" || activeLayerKeys.some((key) => key !== "cases");
  const showStandardLayers = mode !== "convergence";

  return (
    <div className={styles.root}>
      <section className={styles.stage} aria-label="Mapa interactivo de conflictividad social y capas territoriales mineras">
        <MapContainer className={styles.leaflet} center={[-9.19, -75.02]} zoom={5} scrollWheelZoom zoomControl={false}>
          <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ZoomControl position="bottomright" />
          <FitMap showNationalLayers={showNationalLayers} territories={visibleTerritories} />
          <SocialConflictHeat snapshot={socialConflictSnapshot} metric={heatMetric} visible={showStandardLayers && layers.heat && mode === "individual"} />

          {showStandardLayers && layers.heat && socialConflictSnapshot.regions.filter((region) => region[heatMetric] > 0).map((region) => (
            <CircleMarker
              key={`heat-${region.id}`}
              center={region.coordinates}
              radius={Math.min(12, 5 + Math.sqrt(region[heatMetric]))}
              pathOptions={{ color: "#ffffff", weight: 1.4, fillColor: HEAT_COLORS[heatBand(region[heatMetric], heatMaximum)], fillOpacity: 0.94 }}
              eventHandlers={{ click: () => selectTerritory(region.id) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region[heatMetric]} {metricLabel(heatMetric)} · Intensidad {heatBandLabel(region[heatMetric], heatMaximum).toLowerCase()}</Tooltip>
              <Popup>
                <strong>{region.name}</strong><br />
                {region.total} registrados<br />{region.active} activos · {region.latent} latentes
                <button className={styles.popupAction} type="button" onClick={() => openRegistry(region.id)}>Ver los {region.total} casos</button>
              </Popup>
            </CircleMarker>
          ))}

          {showStandardLayers && layers.concessions && miningConcessionSnapshot.regions.map((region) => (
            <CircleMarker
              key={`concession-${region.id}`}
              center={region.coordinates}
              radius={concessionRadius(region.count)}
              pathOptions={{ color: LAYER_COLORS.concessions, weight: 2.5, dashArray: "2 6", fillColor: LAYER_COLORS.concessions, fillOpacity: 0.035 }}
              eventHandlers={{ click: () => selectTerritory(region.id) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{formatCount(region.count)} presencias de derechos titulados</Tooltip>
              <Popup><strong>{region.name}</strong><br />{formatCount(region.count)} presencias de derechos mineros titulados.<br /><small>Una concesión no prueba actividad, propiedad superficial ni permisos operativos.</small><br /><a href={CONCESSION_URL} target="_blank" rel="noreferrer">Consultar GEOCATMIN oficial</a></Popup>
            </CircleMarker>
          ))}

          {showStandardLayers && layers.exploration && explorationSnapshot.regions.map((region) => (
            <CircleMarker
              key={`exploration-${region.id}`}
              center={region.coordinates}
              radius={explorationRadius(region.count)}
              pathOptions={{ color: LAYER_COLORS.exploration, weight: 2.5, dashArray: "8 5", fillColor: LAYER_COLORS.exploration, fillOpacity: 0.07 }}
              eventHandlers={{ click: () => selectTerritory(region.id) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "expediente de exploración" : "expedientes de exploración"}</Tooltip>
              <Popup><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "expediente" : "expedientes"} · {formatCount(Math.round(region.areaHectares))} ha informadas.<br /><small>Explorar no equivale a explotar ni producir.</small><br /><a href={EXPLORATION_URL} target="_blank" rel="noreferrer">Consultar directorio oficial</a></Popup>
            </CircleMarker>
          ))}

          {showStandardLayers && layers.informal && informalIllegalRegions.map((region) => (
            <CircleMarker
              key={`informal-${region.id}`}
              center={region.coordinates}
              radius={8 + region.count * 2}
              pathOptions={{ color: "#5d294c", weight: 2, dashArray: "4 3", fillColor: LAYER_COLORS.informal, fillOpacity: 0.8 }}
              eventHandlers={{ click: () => selectTerritory(region.id) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "caso con mención" : "casos con mención"}</Tooltip>
              <Popup><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "caso menciona" : "casos mencionan"} minería ilegal o informal.<button className={styles.popupAction} type="button" onClick={() => openRegistry(region.id, "informal-illegal")}>Ver sustento documental</button></Popup>
            </CircleMarker>
          ))}

          {showStandardLayers && layers.reinfo && reinfoSnapshot.regions.filter((region) => region.count > 0).map((region) => (
            <CircleMarker
              key={`reinfo-${region.id}`}
              center={region.coordinates}
              radius={reinfoRadius(region.count)}
              pathOptions={{ color: LAYER_COLORS.reinfo, weight: 2.2, fillColor: LAYER_COLORS.reinfo, fillOpacity: 0.42 }}
              eventHandlers={{ click: () => selectTerritory(region.id) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{formatCount(region.count)} inscripciones REINFO vigentes</Tooltip>
              <Popup><strong>{region.name}</strong><br />{formatCount(region.count)} inscripciones vigentes en el corte.<br /><small>Referencia departamental; no es una ubicación de actividad ni formalización concluida.</small><br /><a href={REINFO_URL} target="_blank" rel="noreferrer">Consultar REINFO oficial</a></Popup>
            </CircleMarker>
          ))}

          {showStandardLayers && layers.formal && formalMiningSnapshot.regions.map((region) => (
            <CircleMarker
              key={`formal-mining-${region.id}`}
              center={region.coordinates}
              radius={formalMiningRadius(region.count)}
              pathOptions={{ color: LAYER_COLORS.formal, weight: 3, fillColor: LAYER_COLORS.formal, fillOpacity: 0.16 }}
              eventHandlers={{ click: () => selectTerritory(region.id) }}
            >
              <Tooltip direction="top"><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "planta de beneficio vigente" : "plantas de beneficio vigentes"}</Tooltip>
              <Popup><strong>{region.name}</strong><br />{region.count} {region.count === 1 ? "planta de beneficio vigente" : "plantas de beneficio vigentes"}.<br /><small>La capa no representa todo el universo de minería formal.</small><br /><a href={FORMAL_MINING_URL} target="_blank" rel="noreferrer">Consultar directorio oficial</a></Popup>
            </CircleMarker>
          ))}

          {showStandardLayers && layers.cases && visibleTerritories.map((territory) => {
            const item = cases.find((entry) => entry.territoryIds.includes(territory.id));
            return <Marker key={territory.id} position={territory.coordinates} icon={markerIcon}><Popup><strong>{item?.name}</strong><br />{territory.name}<br /><Link href={`/conflictos/${item?.slug}`}>Abrir expediente</Link></Popup></Marker>;
          })}

          {mode === "convergence" && convergenceRegions.map((region) => {
            const band = region.presence <= 2 ? "low" : region.presence === 3 ? "medium" : "high";
            const color = HEAT_COLORS[band];
            return (
              <CircleMarker
                key={`convergence-${region.id}`}
                center={region.coordinates}
                radius={8 + region.presence * 3}
                pathOptions={{ color, weight: 2.5, fillColor: color, fillOpacity: 0.42 }}
                eventHandlers={{ click: () => selectTerritory(region.id) }}
              >
                <Tooltip direction="top"><strong>{region.name}</strong><br />{region.presence} de {convergenceLayerKeys.length} capas con registros</Tooltip>
                <Popup><strong>{region.name}</strong><br />{region.presence} de {convergenceLayerKeys.length} capas seleccionadas tienen registros.<br /><small>Presencia simultánea sin ponderación ni interpretación causal.</small>{socialConflictCases.some((item) => item.regionIds.includes(region.id)) && <button className={styles.popupAction} type="button" onClick={() => openRegistry(region.id)}>Abrir registro territorial</button>}</Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>

        <header className={styles.mapHeader}>
          <div>
            <p className={styles.kicker}>Vista territorial</p>
            <h1>{modeTitle}</h1>
            <p>{modeDescription}</p>
          </div>
          <nav className={styles.modeSwitcher} aria-label="Modo de lectura del mapa">
            <button type="button" aria-pressed={mode === "individual"} onClick={() => applyMode("individual")}>Individual</button>
            <button type="button" aria-pressed={mode === "overlay"} onClick={() => applyMode("overlay")}>Superposición</button>
            <button type="button" aria-pressed={mode === "convergence"} onClick={() => applyMode("convergence")}>Convergencia</button>
          </nav>
        </header>

        <div className={styles.activeChips} aria-label="Capas activas">
          {activeLayers.map((layer) => (
            <button key={layer.key} type="button" onClick={() => toggleLayer(layer.key)} style={{ borderColor: layer.color }}>
              <span style={{ backgroundColor: layer.color }} aria-hidden="true" />{layer.shortLabel}
            </button>
          ))}
        </div>

        {panelOpen ? (
          <aside className={styles.layerPanel} aria-label="Capas e indicadores">
            <div className={styles.panelHeading}>
              <div><h2>Capas e indicadores</h2><p>{mode === "individual" ? "Una capa analítica a la vez" : mode === "overlay" ? "Combine hasta tres capas" : "Síntesis descriptiva de presencia"}</p></div>
              <div className={styles.panelActions}><span>{activeLayers.length} {activeLayers.length === 1 ? "activa" : "activas"}</span><button type="button" onClick={() => setPanelOpen(false)} aria-label="Contraer panel de capas">«</button></div>
            </div>

            <div className={styles.mobileHandle} aria-hidden="true" />
            <div className={styles.layerGroups}>
              {GROUPS.map((group) => {
                const open = openGroups[group.key];
                return (
                  <section className={styles.layerGroup} key={group.key}>
                    <button className={styles.groupButton} type="button" onClick={() => setOpenGroups((current) => ({ ...current, [group.key]: !current[group.key] }))} aria-expanded={open}>
                      <span>{group.label}</span>{open ? <CaretDown size={15} aria-hidden="true" /> : <CaretRight size={15} aria-hidden="true" />}
                    </button>
                    {open && <div className={styles.layerList}>
                      {LAYERS.filter((layer) => layer.group === group.key).map((layer) => {
                        const active = layers[layer.key];
                        const disabled = mode === "convergence" && !CONVERGENCE_LAYER_KEYS.includes(layer.key);
                        return (
                          <button
                            key={layer.key}
                            className={active ? styles.layerActive : styles.layerButton}
                            type="button"
                            aria-pressed={active}
                            disabled={disabled}
                            onClick={() => toggleLayer(layer.key)}
                            style={{ borderColor: active ? layer.color : undefined }}
                          >
                            <span className={styles.layerDot} style={{ backgroundColor: disabled ? "#637573" : layer.color }} aria-hidden="true" />
                            <span><strong>{layer.label}</strong><small>{disabled ? "No participa en la síntesis v2.1" : layer.description}</small></span>
                            <em>{disabled ? "—" : active ? "ON" : "OFF"}</em>
                          </button>
                        );
                      })}
                    </div>}
                  </section>
                );
              })}
            </div>

            {layers.heat && mode !== "convergence" && (
              <label className={styles.metricSelect}>Intensidad
                <select value={heatMetric} onChange={(event) => setHeatMetric(event.target.value as HeatMetric)}>
                  <option value="total">Casos registrados</option>
                  <option value="active">Solo activos</option>
                  <option value="latent">Solo latentes</option>
                </select>
              </label>
            )}

            {layers.cases && mode !== "convergence" && (
              <label className={styles.metricSelect}>Estado del expediente piloto
                <select value={status} onChange={(event) => setStatus(event.target.value)}>
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="latent">Latentes</option>
                  <option value="historical">Históricos</option>
                </select>
              </label>
            )}

            <div className={styles.futureNote}><strong>Capas futuras no integradas</strong><span>Minería artesanal formal y pequeña minería formal.</span></div>
            <div className={styles.panelSources}>
              <a href={REPORT_URL} target="_blank" rel="noreferrer">Defensoría <ArrowSquareOut size={12} /></a>
              {layers.reinfo && <a href={REINFO_URL} target="_blank" rel="noreferrer">REINFO <ArrowSquareOut size={12} /></a>}
              {(layers.formal || layers.exploration) && <a href={FORMAL_MINING_URL} target="_blank" rel="noreferrer">MINEM <ArrowSquareOut size={12} /></a>}
              {layers.concessions && <a href={CONCESSION_URL} target="_blank" rel="noreferrer">INGEMMET <ArrowSquareOut size={12} /></a>}
            </div>
          </aside>
        ) : (
          <button className={styles.compactPanel} type="button" onClick={() => setPanelOpen(true)} aria-label="Abrir panel de capas"><Layers size={20} /><span>{activeLayers.length}</span></button>
        )}

        {selectedTerritory && (
          <aside className={styles.territoryCard} aria-label={`Resumen territorial de ${selectedTerritory.name}`}>
            <span className={styles.dataBadge}>Datos del repositorio</span>
            <button className={styles.cardClose} type="button" onClick={() => setSelectedTerritoryId(null)} aria-label="Cerrar resumen territorial"><X size={16} /></button>
            <h2>{selectedTerritory.name}</h2>
            <p className={styles.cardCaption}>{mode === "convergence" ? `${selectedTerritoryEntries.filter((entry) => entry.value > 0 && CONVERGENCE_LAYER_KEYS.includes(entry.key)).length} de ${convergenceLayerKeys.length} capas con registros` : "Lectura territorial de las capas activas"}</p>
            <div className={styles.territoryValues}>
              {selectedTerritoryEntries.map((entry) => (
                <div key={entry.key}><span style={{ backgroundColor: entry.color }} aria-hidden="true" /><strong>{formatCount(entry.value)}</strong><p>{entry.suffix}</p></div>
              ))}
            </div>
            <small>Los valores corresponden a cortes documentales distintos y no expresan causalidad.</small>
            {selectedTerritoryCaseCount > 0 && <button className={styles.openRegistry} type="button" onClick={() => openRegistry(selectedTerritory.id)}>Abrir registro territorial →</button>}
          </aside>
        )}

        <div className={styles.sourceStrip}>
          <strong>Fuentes y cortes</strong>
          <span>Defensoría: {fullDateLabel(socialConflictSnapshot.cutoffDate)} · MINEM e INGEMMET: consulta {fullDateLabel(reinfoSnapshot.cutoffDate)}</span>
        </div>

        <div className={styles.legend} aria-label="Leyenda dinámica">
          <strong>{mode === "individual" && layers.heat ? "Conflictos sociales · número de casos" : mode === "overlay" ? "Símbolos por capa" : mode === "convergence" ? "Convergencia descriptiva · capas con registros" : "Capas activas"}</strong>
          <div>
            {mode === "individual" && layers.heat ? (
              <>
                <span><i style={{ backgroundColor: HEAT_COLORS.low }} />Baja · 1–{heatRanges.lowMax}</span>
                <span><i style={{ backgroundColor: HEAT_COLORS.medium }} />Media · {heatRanges.lowMax + 1}–{heatRanges.mediumMax}</span>
                <span><i style={{ backgroundColor: HEAT_COLORS.high }} />Alta · {heatRanges.mediumMax + 1}–{heatRanges.max}</span>
              </>
            ) : mode === "convergence" ? (
              <>
                <span><i style={{ backgroundColor: HEAT_COLORS.low }} />1–2 capas</span>
                <span><i style={{ backgroundColor: HEAT_COLORS.medium }} />3 capas</span>
                <span><i style={{ backgroundColor: HEAT_COLORS.high }} />4–5 capas</span>
              </>
            ) : activeLayers.length ? activeLayers.map((layer) => <span key={layer.key}><i style={{ backgroundColor: layer.color }} />{layer.shortLabel}</span>) : <span>Sin capas activas</span>}
          </div>
        </div>

        <div className={styles.methodNotice}>
          <span aria-hidden="true" />
          <div><strong>Coincidencia no implica causalidad</strong><p>Las capas comparten puntos territoriales de referencia. Los patrones sirven para investigar, no para concluir relaciones causales.</p></div>
        </div>

        {layerLimitMessage && <div className={styles.toast} role="status">Máximo de tres capas en superposición. Desactive una capa antes de añadir otra.</div>}

        {selectedScope && (
          <aside className={styles.drawer} aria-label={`Casos de ${selectedScopeName}`}>
            <header>
              <div><p>{registryTheme === "informal-illegal" ? "Sustento de la capa temática" : "Registro del corte"}</p><h2>{selectedScopeName}</h2></div>
              <button type="button" onClick={() => setSelectedScope(null)} aria-label="Cerrar registro"><X size={20} aria-hidden="true" /></button>
            </header>
            <p className={styles.drawerSummary}>{scopeCases.length} {scopeCases.length === 1 ? "caso" : "casos"} · {scopeCases.filter((item) => item.status === "active").length} activos · {scopeCases.filter((item) => item.status === "latent").length} latentes</p>
            <div className={styles.drawerFilters}>
              <label className={styles.drawerSearch}><MagnifyingGlass size={17} aria-hidden="true" /><span className="sr-only">Buscar casos</span><input value={caseQuery} onChange={(event) => setCaseQuery(event.target.value)} placeholder="Buscar caso, lugar o tipo" /></label>
              <label><span>Estado</span><select value={caseStatus} onChange={(event) => setCaseStatus(event.target.value as CaseStatusFilter)}><option value="all">Todos</option><option value="active">Activos</option><option value="latent">Latentes</option></select></label>
              <label><span>Tipo</span><select value={caseType} onChange={(event) => setCaseType(event.target.value)}><option value="all">Todos</option>{availableTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            </div>
            <p className={styles.resultsCount} aria-live="polite">{filteredScopeCases.length} {filteredScopeCases.length === 1 ? "resultado" : "resultados"}</p>
            <div className={styles.caseList}>
              {filteredScopeCases.map((item) => (
                <article key={item.id}>
                  <div className={styles.caseMeta}><span data-status={item.status}>{item.status === "active" ? "Activo" : "Latente"}</span><span>{item.conflictType}</span></div>
                  <h3>{item.title}</h3>
                  {item.location && <p>{item.location}</p>}
                  <footer><small>{periodLabel(item.startPeriod)} · {item.titleMethod === "report-denomination" ? "Denominación del reporte" : "Síntesis de la ficha"}</small><a href={`${REPORT_URL}#page=${item.sourcePage}`} target="_blank" rel="noreferrer">Fuente, p. {item.sourcePage} <ArrowSquareOut size={13} /></a></footer>
                </article>
              ))}
              {!filteredScopeCases.length && <p className={styles.emptyState}>No hay casos que coincidan con estos filtros.</p>}
            </div>
            <small className={styles.drawerMethod}>El registro reproduce el corte documental. No todos los conflictos sociales corresponden a minería.</small>
          </aside>
        )}
      </section>
    </div>
  );
}
