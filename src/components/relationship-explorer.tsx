"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowSquareOut,
  Article,
  BookOpenText,
  Briefcase,
  Buildings,
  CirclesThreePlus,
  Gavel,
  MapPin,
  MagnifyingGlass,
  Network,
  Scales,
  ShieldCheck,
  TreeStructure,
  UsersThree,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import type { Actor, ConflictCase, EvidenceRecord, NormativeIssue, ObservatoryData, Source } from "@/lib/schemas";
import { getLatestPublicMiningCut, mentionsMiningCategory } from "@/lib/mining-classification";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";

type ResultItem = {
  id: string;
  label: string;
  subtitle: string;
  type: string;
  focus: GraphFocus;
  href?: string;
  count: number;
};

type GraphFocus =
  | "conflicto-social-minero"
  | "mineria-ilegal-informal"
  | "solapamiento-territorial"
  | "casos-hito"
  | "actores-acuerdos"
  | "reinfo"
  | "fiscalizacion"
  | "evidencia-ambiental"
  | "matriz-documental"
  | "cajamarca-system"
  | "institutional-mechanisms"
  | "trazabilidad-oro";

type NodeTone = "social" | "illegal" | "bridge" | "instrument" | "control" | "evidence";

type GraphNodeDefinition = {
  id: GraphFocus;
  title: string;
  subtitle: string;
  layer: string;
  tone: NodeTone;
  role: "root" | "bridge" | "node";
  icon: typeof Gavel;
  position: { x: number; y: number };
  width: number;
  height: number;
};

type FocusLink = {
  label: string;
  href: string;
  description: string;
  external?: boolean;
};

type FocusDetail = {
  kicker: string;
  title: string;
  summary: string;
  evidenceTitle: string;
  evidenceItems: string[];
  disputeTitle: string;
  disputeItems: string[];
  nextStep: string;
  sourceIds: string[];
  caseIds?: string[];
  issueIds?: string[];
  actorIds?: string[];
  routeLinks: FocusLink[];
};

const publicGraphFocuses = new Set<GraphFocus>([
  "conflicto-social-minero",
  "mineria-ilegal-informal",
  "reinfo",
  "solapamiento-territorial",
  "casos-hito",
  "actores-acuerdos",
  "fiscalizacion",
  "evidencia-ambiental",
  "matriz-documental",
  "cajamarca-system",
  "institutional-mechanisms",
  "trazabilidad-oro",
]);
const rootGraphFocuses: GraphFocus[] = ["conflicto-social-minero", "mineria-ilegal-informal", "reinfo"];
const allCaseIds = [
  "tambogrande",
  "conga",
  "tia-maria",
  "las-bambas",
  "espinar",
  "cerro-quilish",
  "yanacocha-maxima-acuna",
  "fondo-social-michiquillay",
  "rio-blanco-majaz",
  "la-oroya",
  "toromocho-morococha",
  "choropampa",
];

const graphRowY = {
  roots: 124,
  bridge: 318,
  relations: 478,
  evidence: 642,
  comparisons: 802,
} as const;

const graphNodes: GraphNodeDefinition[] = [
  {
    id: "conflicto-social-minero",
    title: "Conflicto social minero",
    subtitle: "Territorio, agua, acuerdos y capacidad estatal",
    layer: "Problema público",
    tone: "social",
    role: "root",
    icon: MapPin,
    position: { x: 42, y: graphRowY.roots },
    width: 280,
    height: 142,
  },
  {
    id: "mineria-ilegal-informal",
    title: "Minería ilegal e informal",
    subtitle: "Ilegalidad, informalidad, MAPE y fiscalización",
    layer: "Problema público",
    tone: "illegal",
    role: "root",
    icon: WarningCircle,
    position: { x: 362, y: graphRowY.roots },
    width: 280,
    height: 142,
  },
  {
    id: "solapamiento-territorial",
    title: "Solapamiento territorial",
    subtitle: "Cruza territorio, gobernanza y presión institucional",
    layer: "Puente analítico",
    tone: "bridge",
    role: "bridge",
    icon: Network,
    position: { x: 382, y: graphRowY.bridge },
    width: 250,
    height: 92,
  },
  {
    id: "casos-hito",
    title: "Casos hito",
    subtitle: "Historias, actores y problemas por caso",
    layer: "Casos",
    tone: "social",
    role: "node",
    icon: Article,
    position: { x: 78, y: graphRowY.relations },
    width: 190,
    height: 98,
  },
  {
    id: "actores-acuerdos",
    title: "Actores y acuerdos",
    subtitle: "Comunidades, Estado, empresa y acuerdos",
    layer: "Relación",
    tone: "social",
    role: "node",
    icon: UsersThree,
    position: { x: 300, y: graphRowY.relations },
    width: 200,
    height: 98,
  },
  {
    id: "reinfo",
    title: "REINFO",
    subtitle: "Registro administrativo agregado; no es conflicto social",
    layer: "Formalización",
    tone: "instrument",
    role: "root",
    icon: ShieldCheck,
    position: { x: 682, y: graphRowY.roots },
    width: 280,
    height: 142,
  },
  {
    id: "fiscalizacion",
    title: "Fiscalización",
    subtitle: "Supervisión, operativos y sanciones",
    layer: "Control",
    tone: "control",
    role: "node",
    icon: Gavel,
    position: { x: 744, y: graphRowY.relations },
    width: 188,
    height: 98,
  },
  {
    id: "evidencia-ambiental",
    title: "Monitoreo ambiental",
    subtitle: "Dato técnico sin causalidad inferida",
    layer: "Ambiente",
    tone: "evidence",
    role: "node",
    icon: BookOpenText,
    position: { x: 84, y: graphRowY.evidence },
    width: 220,
    height: 100,
  },
  {
    id: "matriz-documental",
    title: "Construcción de datos",
    subtitle: "Unidades, cálculos y actualizaciones",
    layer: "Método",
    tone: "bridge",
    role: "node",
    icon: TreeStructure,
    position: { x: 340, y: graphRowY.evidence },
    width: 240,
    height: 100,
  },
  {
    id: "cajamarca-system",
    title: "Conflictos en Cajamarca",
    subtitle: "Quilish, Conga, Acuña y Michiquillay",
    layer: "Lectura territorial",
    tone: "bridge",
    role: "node",
    icon: TreeStructure,
    position: { x: 400, y: graphRowY.comparisons },
    width: 320,
    height: 104,
  },
  {
    id: "institutional-mechanisms",
    title: "Mecanismos institucionales",
    subtitle: "EIA, PAMA, sentencias, actas, fondos y registros",
    layer: "Comparación",
    tone: "control",
    role: "node",
    icon: Gavel,
    position: { x: 754, y: graphRowY.comparisons },
    width: 340,
    height: 104,
  },
  {
    id: "trazabilidad-oro",
    title: "Cadena del oro",
    subtitle: "Extracción, transporte y mercado",
    layer: "Cadena",
    tone: "illegal",
    role: "node",
    icon: Briefcase,
    position: { x: 616, y: graphRowY.evidence },
    width: 230,
    height: 100,
  },
];

const focusRelations: Record<GraphFocus, GraphFocus[]> = {
  "conflicto-social-minero": ["solapamiento-territorial", "casos-hito", "actores-acuerdos", "evidencia-ambiental", "matriz-documental", "cajamarca-system", "institutional-mechanisms"],
  "mineria-ilegal-informal": ["solapamiento-territorial", "reinfo", "fiscalizacion", "trazabilidad-oro", "matriz-documental", "institutional-mechanisms"],
  "solapamiento-territorial": ["conflicto-social-minero", "mineria-ilegal-informal", "evidencia-ambiental", "matriz-documental", "cajamarca-system", "institutional-mechanisms"],
  "casos-hito": ["conflicto-social-minero", "actores-acuerdos", "evidencia-ambiental", "matriz-documental", "cajamarca-system"],
  "actores-acuerdos": ["conflicto-social-minero", "casos-hito", "reinfo", "matriz-documental", "institutional-mechanisms"],
  reinfo: ["mineria-ilegal-informal", "actores-acuerdos", "fiscalizacion", "trazabilidad-oro", "matriz-documental", "institutional-mechanisms"],
  fiscalizacion: ["mineria-ilegal-informal", "reinfo", "trazabilidad-oro", "evidencia-ambiental", "matriz-documental", "institutional-mechanisms"],
  "evidencia-ambiental": ["conflicto-social-minero", "solapamiento-territorial", "fiscalizacion", "matriz-documental", "cajamarca-system", "institutional-mechanisms"],
  "matriz-documental": ["conflicto-social-minero", "mineria-ilegal-informal", "solapamiento-territorial", "reinfo", "evidencia-ambiental", "cajamarca-system", "institutional-mechanisms"],
  "cajamarca-system": ["conflicto-social-minero", "casos-hito", "evidencia-ambiental", "matriz-documental", "institutional-mechanisms"],
  "institutional-mechanisms": ["conflicto-social-minero", "mineria-ilegal-informal", "actores-acuerdos", "fiscalizacion", "matriz-documental", "cajamarca-system"],
  "trazabilidad-oro": ["mineria-ilegal-informal", "reinfo", "fiscalizacion", "matriz-documental", "institutional-mechanisms"],
};

const focusDetails: Record<GraphFocus, FocusDetail> = {
  "conflicto-social-minero": {
    kicker: "Conflictos y territorio", title: "Conflicto social minero",
    summary: "Conecta agua, tierra, participación, acuerdos y capacidad estatal en el corte nacional de la Defensoría del Pueblo.",
    evidenceTitle: "Componentes", evidenceItems: ["casos hito con secuencia histórica", "contrastes territoriales entre regiones", "agua, participación, beneficios y acuerdos"],
    disputeTitle: "Puntos de presión", disputeItems: ["escalamiento de protestas", "decisiones ambientales discutidas", "acuerdos con resultados desiguales"],
    nextStep: "Abre un caso para ver su historia, actores, hallazgos y enlaces.",
    sourceIds: ["defensoria-conflictos", "defensoria-acuerdos-187", "defensoria-conflictos-hidricos"], caseIds: allCaseIds,
    issueIds: ["agua-cuencas", "dialogo-acuerdos", "beneficios-territoriales", "consulta-participacion"],
    routeLinks: [
      { label: "Ver casos", href: "/conflictos", description: "Historias, actores y problemas centrales." },
      { label: "Ver cronología", href: "/cronologia", description: "Hitos comparados entre casos." },
      { label: "Ver mapa", href: "/mapa", description: "Distribución territorial y capas mineras." },
    ],
  },
  "mineria-ilegal-informal": {
    kicker: "Economía y territorio", title: "Minería ilegal e informal",
    summary: "Separa minería ilegal, actividad informal, MAPE y REINFO para mostrar sus relaciones con extracción, transporte, procesamiento y control estatal.",
    evidenceTitle: "Componentes", evidenceItems: ["frentes aluviales y filonianos", "REINFO y proceso de formalización", "rutas, plantas y comercialización"],
    disputeTitle: "Puntos críticos", disputeItems: ["violencia organizada en Pataz", "deforestación y mercurio en Madre de Dios", "baja salida hacia la formalidad"],
    nextStep: "Compara REINFO, Pataz, Madre de Dios y la cadena económica del oro.",
    sourceIds: ["minem-reinfo", "minem-reinfo-vigente-corte-2026-06-18", "pcm-operativos-mineria-ilegal-2026"],
    issueIds: ["formalizacion-mape", "competencias-estado"], actorIds: ["mineros-mape", "minem", "gobiernos-subnacionales"],
    routeLinks: [
      { label: "Abrir REINFO", href: "/reinfo", description: "Resultados y distribución regional." },
      { label: "Ver Madre de Dios", href: "/madre-de-dios", description: "Bosque, mercurio, salud y Tambopata." },
      { label: "Ver Pataz", href: "/pataz", description: "Violencia, socavones, camiones y plantas." },
      { label: "Ver cadena del oro", href: "/oro-ilegal", description: "Extracción, transporte, procesamiento y mercado." },
    ],
  },
  "solapamiento-territorial": {
    kicker: "Cruce territorial", title: "Solapamiento territorial",
    summary: "Compara dónde coinciden conflictos, operaciones, REINFO, plantas, exploración y concesiones para identificar presión institucional.",
    evidenceTitle: "Capas", evidenceItems: ["conflictos por región", "agua y ambiente", "competencias concurrentes"],
    disputeTitle: "Lecturas útiles", disputeItems: ["concentración regional", "presión sobre cuencas", "superposición de autoridades"],
    nextStep: "Usa el mapa para comparar capas y abre la página temática correspondiente.",
    sourceIds: ["ana-agua", "oefa-fiscalizacion", "defensoria-conflictos"], caseIds: ["espinar", "las-bambas"],
    issueIds: ["competencias-estado", "agua-cuencas", "fiscalizacion-ambiental"],
    routeLinks: [{ label: "Ver mapa completo", href: "/mapa", description: "Capas territoriales activables." }],
  },
  "casos-hito": {
    kicker: "Historias clave", title: "Casos hito",
    summary: "Reúne conflictos que cambiaron las reglas, la política o la relación territorial de la minería peruana.",
    evidenceTitle: "Contenido", evidenceItems: ["secuencia del conflicto", "actores y problemas centrales", "estudios académicos relacionados"],
    disputeTitle: "Patrones", disputeItems: ["agua y confianza", "salud y reparación", "reasentamiento y acuerdos"],
    nextStep: "Filtra los casos por estado, territorio o tema.",
    sourceIds: ["defensoria-conflictos"], caseIds: allCaseIds,
    routeLinks: [{ label: "Ver todos los casos", href: "/conflictos", description: "Catálogo temático e interactivo." }, { label: "Ver cronología", href: "/cronologia", description: "Cambios a través del tiempo." }],
  },
  "actores-acuerdos": {
    kicker: "Gobernanza", title: "Actores y acuerdos",
    summary: "Relaciona comunidades, Estado, empresas y organizaciones con compromisos sobre agua, inversión, empleo, transporte y diálogo.",
    evidenceTitle: "Quién participa", evidenceItems: ["comunidades y organizaciones", "entidades públicas", "empresas y operadores"],
    disputeTitle: "Dónde se atasca", disputeItems: ["responsable difuso", "plazos móviles", "resultados parciales"],
    nextStep: "Compara compromisos por responsable, territorio y situación.",
    sourceIds: ["defensoria-acuerdos-187", "las-bambas-actas-2025"], caseIds: ["las-bambas", "espinar"],
    actorIds: ["comunidades-cotabambas", "comunidades-espinar", "minem"],
    routeLinks: [{ label: "Comparar compromisos", href: "/compromisos", description: "Responsables, situación y resultados." }, { label: "Ver Las Bambas", href: "/conflictos/las-bambas", description: "Corredor, comunidades y acuerdos." }],
  },
  reinfo: {
    kicker: "Formalización minera", title: "REINFO",
    summary: "Muestra cuántas inscripciones siguen vigentes, dónde se concentran y cuántas personas culminaron la formalización.",
    evidenceTitle: "Indicadores", evidenceItems: ["inscripciones vigentes por departamento", "exclusiones de 2025", "formalizaciones acumuladas"],
    disputeTitle: "Problemas centrales", disputeItems: ["2,4% de formalización acumulada informada", "prórrogas sucesivas", "ubicación real pendiente de sinceramiento"],
    nextStep: "Explora los departamentos y compara la permanencia registral con los resultados.",
    sourceIds: ["minem-reinfo", "minem-reinfo-vigente-corte-2026-06-18", "pcm-reinfo-formalizacion-2025", "bcrp-memoria-2025-reinfo"],
    issueIds: ["formalizacion-mape"],
    routeLinks: [{ label: "Abrir REINFO", href: "/reinfo", description: "Cifras, explorador regional e historia reciente." }],
  },
  fiscalizacion: {
    kicker: "Capacidad estatal", title: "Fiscalización",
    summary: "Conecta supervisión ambiental, control de insumos, operativos y sanciones con los resultados observados en territorio.",
    evidenceTitle: "Áreas de control", evidenceItems: ["ambiente y salud", "combustible y explosivos", "transporte y comercialización"],
    disputeTitle: "Fallas visibles", disputeItems: ["autoridades fragmentadas", "respuesta posterior al escalamiento", "seguimiento insuficiente"],
    nextStep: "Compara operativos con resultados sostenidos sobre bosque, violencia y rutas.",
    sourceIds: ["oefa-fiscalizacion", "sernanp-tambopata-balance-2025", "pcm-operativos-mineria-ilegal-2026"],
    caseIds: ["madre-de-dios", "espinar"], issueIds: ["fiscalizacion-ambiental", "competencias-estado"],
    routeLinks: [{ label: "Ver normas", href: "/normativa#fiscalizacion-ambiental", description: "Competencias y fallas de aplicación." }, { label: "Ver Madre de Dios", href: "/madre-de-dios", description: "Mercurio, operativos y Tambopata." }],
  },
  "evidencia-ambiental": {
    kicker: "Ambiente y salud", title: "Monitoreo ambiental",
    summary: "Relaciona mediciones de agua, aire, metales y bosque con decisiones de fiscalización y respuesta sanitaria.",
    evidenceTitle: "Qué se mide", evidenceItems: ["calidad de agua y aire", "metales y exposición", "deforestación y cambio territorial"],
    disputeTitle: "Problemas operativos", disputeItems: ["series discontinuas", "métodos no comparables", "respuesta tardía"],
    nextStep: "Abre Espinar, La Oroya, Conga o Madre de Dios según el indicador.",
    sourceIds: ["oefa-fiscalizacion", "ana-agua", "espinar-sociospatial-2025", "conga-millones-2016"],
    caseIds: ["espinar", "conga"], issueIds: ["fiscalizacion-ambiental", "agua-cuencas", "certificacion-ambiental"],
    routeLinks: [{ label: "Ver Espinar", href: "/conflictos/espinar", description: "Salud, monitoreo y medidas correctivas." }, { label: "Ver Madre de Dios", href: "/madre-de-dios", description: "Mercurio y pérdida de bosque." }],
  },
  "matriz-documental": {
    kicker: "Construcción de datos", title: "Cómo se construyen los indicadores",
    summary: "Explica las unidades, clasificaciones, cálculos y fechas de actualización del observatorio.",
    evidenceTitle: "Unidades", evidenceItems: ["casos e inscripciones", "plantas y expedientes", "derechos mineros y hectáreas"],
    disputeTitle: "Cálculos", disputeItems: ["participación regional", "ritmo de deforestación", "proyección lineal"],
    nextStep: "Consulta cómo se calcula cada indicador y qué representa cada capa.",
    sourceIds: ["metodologia-observatorio"], issueIds: ["competencias-estado"],
    routeLinks: [{ label: "Ver metodología", href: "/metodologia", description: "Universos, clasificaciones y cálculos." }, { label: "Ver mapa", href: "/mapa", description: "Capas activables por unidad." }],
  },
  "cajamarca-system": {
    kicker: "Lectura territorial", title: "Conflictos mineros en Cajamarca",
    summary: "Relaciona Choropampa, Quilish, Conga, Máxima Acuña y Michiquillay a través de agua, salud, tierra, autoridad local y beneficios.",
    evidenceTitle: "Secuencia regional", evidenceItems: ["emergencia por mercurio", "defensa de cuencas", "disputas prediales y beneficios"],
    disputeTitle: "Problemas compartidos", disputeItems: ["confianza institucional", "agua y territorio", "continuidad de compromisos"],
    nextStep: "Abre cada caso para comparar cómo cambia el problema entre periodos y actores.",
    sourceIds: [], caseIds: ["conga"], issueIds: ["agua-cuencas", "beneficios-territoriales", "competencias-estado"],
    routeLinks: [{ label: "Ver casos de Cajamarca", href: "/conflictos", description: "Conflictos regionales diferenciados." }, { label: "Ver Conga", href: "/conflictos/conga", description: "Agua, crisis y suspensión material." }],
  },
  "institutional-mechanisms": {
    kicker: "Respuesta pública", title: "Mecanismos institucionales",
    summary: "Compara evaluación ambiental, PAMA, mesas, fondos sociales, reasentamiento, sentencias y medidas de protección por el problema que intentan resolver.",
    evidenceTitle: "Mecanismos", evidenceItems: ["control ambiental", "diálogo y acuerdos", "protección, reparación y reasentamiento"],
    disputeTitle: "Resultados", disputeItems: ["obligaciones abiertas", "ejecución parcial", "cambios de operador o autoridad"],
    nextStep: "Compara qué mecanismo produjo resultados y cuál prolongó la disputa.",
    sourceIds: [], caseIds: ["conga", "tia-maria", "las-bambas", "espinar", "la-oroya", "toromocho-morococha"],
    issueIds: ["dialogo-acuerdos", "fiscalizacion-ambiental", "beneficios-territoriales"],
    routeLinks: [{ label: "Ver conflictos", href: "/conflictos", description: "Casos y mecanismos aplicados." }, { label: "Ver normas", href: "/normativa", description: "Reglas y fallas de implementación." }],
  },
  "trazabilidad-oro": {
    kicker: "Cadena económica", title: "Cadena del oro",
    summary: "Conecta extracción, transporte, procesamiento, compra y exportación con los controles estatales de cada tramo.",
    evidenceTitle: "Eslabones", evidenceItems: ["frente minero", "rutas y plantas", "compradores y exportación"],
    disputeTitle: "Puntos críticos", disputeItems: ["camiones no registrados", "plantas y acopio", "alertas aduaneras y financieras"],
    nextStep: "Compara la cadena nacional con Pataz y Madre de Dios.",
    sourceIds: ["sunat-oro-sin-origen-2025", "minem-recpo-oro-2026", "mpfn-oro-puno-india-2026", "pcm-operativos-mineria-ilegal-2026"],
    issueIds: ["formalizacion-mape", "fiscalizacion-ambiental"],
    routeLinks: [{ label: "Ver cadena del oro", href: "/oro-ilegal", description: "Extracción, transporte, procesamiento y mercado." }, { label: "Ver Pataz", href: "/pataz", description: "Violencia y minería subterránea." }, { label: "Ver Madre de Dios", href: "/madre-de-dios", description: "Bosque, mercurio y minería aluvial." }],
  },
};

const focusAliases: Record<string, GraphFocus> = {
  tambogrande: "casos-hito",
  conga: "casos-hito",
  "cerro-quilish": "cajamarca-system",
  "yanacocha-maxima-acuna": "cajamarca-system",
  "fondo-social-michiquillay": "cajamarca-system",
  "rio-blanco-majaz": "casos-hito",
  "la-oroya": "institutional-mechanisms",
  "toromocho-morococha": "institutional-mechanisms",
  choropampa: "cajamarca-system",
  "cajamarca-system": "cajamarca-system",
  "institutional-mechanisms": "institutional-mechanisms",
  "tia-maria": "casos-hito",
  "las-bambas": "actores-acuerdos",
  espinar: "evidencia-ambiental",
  "madre-de-dios": "mineria-ilegal-informal",
  "formalizacion-mape": "reinfo",
  "mineros-mape": "reinfo",
  "fiscalizacion-ambiental": "fiscalizacion",
  "agua-cuencas": "evidencia-ambiental",
  "dialogo-acuerdos": "actores-acuerdos",
  "competencias-estado": "solapamiento-territorial",
  "expediente-unico-trazable": "matriz-documental",
  "monitoreo-participativo-cuenca": "evidencia-ambiental",
  "registro-acuerdos-publico": "actores-acuerdos",
  "ds-018-2017-em": "reinfo",
};

function getGraphFocus(id: string): GraphFocus {
  return focusAliases[id] ?? "matriz-documental";
}

function RelationshipNode({ icon: Icon, title, subtitle, layer, tone, role }: Omit<GraphNodeDefinition, "id" | "position" | "width" | "height">) {
  return (
    <div className="graph-label">
      <Icon size={role === "root" ? 26 : 22} weight="thin" aria-hidden />
      <span>
        <em>{layer}</em>
        <strong>{title}</strong>
        <small>{subtitle}</small>
      </span>
      {role === "root" ? <b>Raíz</b> : <i aria-hidden data-tone={tone} />}
    </div>
  );
}

function makeNodes(focus: GraphFocus, revealed: Set<GraphFocus>): Node[] {
  const related = new Set(focusRelations[focus]);
  return graphNodes.filter((item) => revealed.has(item.id)).map((item) => ({
    id: item.id,
    position: item.position,
    className: [
      "knowledge-node",
      `node-tone-${item.tone}`,
      item.role === "root" ? "root-node" : "",
      item.role === "bridge" ? "bridge-node" : "",
      item.id === "reinfo" ? "instrument-node" : "",
      item.id === focus ? "is-active" : "",
      item.id !== focus && related.has(item.id) ? "is-related" : "",
      item.id !== focus && !related.has(item.id) ? "is-muted" : "",
    ].filter(Boolean).join(" "),
    style: { width: item.width, minHeight: item.height },
    data: {
      label: (
        <RelationshipNode
          icon={item.icon}
          title={item.title}
          subtitle={item.subtitle}
          layer={item.layer}
          tone={item.tone}
          role={item.role}
        />
      ),
    },
  }));
}

function makeEdges(revealed: Set<GraphFocus>, expanded: Set<GraphFocus>): Edge[] {
  return edges.filter((item) => {
    const source = item.source as GraphFocus;
    const target = item.target as GraphFocus;
    return revealed.has(source) && revealed.has(target) && (expanded.has(source) || expanded.has(target));
  });
}

function edge(id: string, source: GraphFocus, target: GraphFocus, label: string, tone: NodeTone, animated = false): Edge {
  const colors: Record<NodeTone, string> = {
    social: "#38bdf8",
    illegal: "#fb923c",
    bridge: "#cbd5e1",
    instrument: "#facc15",
    control: "#6f9276",
    evidence: "#b8cbd2",
  };
  return {
    id,
    source,
    target,
    label,
    animated,
    className: `relation-edge relation-${tone}`,
    markerEnd: { type: MarkerType.ArrowClosed, color: colors[tone], width: 18, height: 18 },
    style: {
      stroke: colors[tone],
      strokeWidth: animated ? 3.2 : 2.4,
      filter: `drop-shadow(0 0 2px ${colors[tone]}66)`,
    },
    labelStyle: {
      fill: "#f8f4eb",
      fontSize: 12,
      fontWeight: 700,
      fontFamily: "Source Serif 4 Variable, Georgia, serif",
    },
    labelBgStyle: { fill: "#061d2b", fillOpacity: 0.98, stroke: "#315160", strokeWidth: 0.8 },
    labelBgPadding: [6, 4],
    labelBgBorderRadius: 4,
  };
}

const edges: Edge[] = [
  edge("conflicto-solapamiento", "conflicto-social-minero", "solapamiento-territorial", "comparte territorio", "social", true),
  edge("ilegal-solapamiento", "mineria-ilegal-informal", "solapamiento-territorial", "comparte evidencia", "illegal", true),
  edge("conflicto-casos", "conflicto-social-minero", "casos-hito", "casos hito", "social"),
  edge("conflicto-actores", "conflicto-social-minero", "actores-acuerdos", "actores", "social"),
  edge("conflicto-ambiental", "conflicto-social-minero", "evidencia-ambiental", "sustenta", "evidence"),
  edge("ilegal-reinfo", "mineria-ilegal-informal", "reinfo", "registro", "instrument"),
  edge("ilegal-fiscalizacion", "mineria-ilegal-informal", "fiscalizacion", "control", "control"),
  edge("ilegal-trazabilidad", "mineria-ilegal-informal", "trazabilidad-oro", "cadena", "illegal"),
  edge("actores-reinfo", "actores-acuerdos", "reinfo", "diferencia", "bridge"),
  edge("fiscalizacion-trazabilidad", "trazabilidad-oro", "fiscalizacion", "alerta", "control"),
  edge("ambiental-matriz", "evidencia-ambiental", "matriz-documental", "referencia", "evidence"),
  edge("solapamiento-matriz", "solapamiento-territorial", "matriz-documental", "verifica", "bridge"),
  edge("matriz-cajamarca", "matriz-documental", "cajamarca-system", "hitos", "bridge"),
  edge("matriz-mecanismos", "matriz-documental", "institutional-mechanisms", "mecanismos", "control"),
  edge("cajamarca-mecanismos", "cajamarca-system", "institutional-mechanisms", "contrasta", "bridge"),
];

const sourceTypeLabels: Record<Source["type"], string> = {
  official: "Oficial",
  academic: "Academia",
  community: "Comunidad",
  company: "Empresa",
  ngo: "Sociedad civil",
  press: "Prensa",
};

const caseStatusLabels: Record<ConflictCase["status"], string> = {
  active: "activo",
  latent: "latente",
  resolved: "resuelto",
  historical: "histórico",
};

const issueStatusLabels: Record<NormativeIssue["status"], string> = {
  structural: "estructural",
  "active-debate": "debate activo",
  "implementation-gap": "brecha de implementación",
};

const actorTypeLabels: Record<Actor["type"], string> = {
  state: "Estado",
  community: "Comunidad",
  company: "Empresa",
  "civil-society": "Sociedad civil",
  academic: "Academia",
  collective: "Colectivo",
};

const relationLabels: Record<EvidenceRecord["relation"], string> = {
  supports: "Sostiene",
  qualifies: "Matiza",
  contradicts: "Contradice",
};

type FocusMetric = {
  label: string;
  value: string;
  note: string;
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("es-PE");
}

function describeCase(item: ConflictCase) {
  return `${item.timeline.length} hitos · ${item.claims.length} afirmaciones documentadas · ${caseStatusLabels[item.status]} · corte ${formatDate(item.cutoffDate)}.`;
}

function describeIssue(item: NormativeIssue) {
  return `${issueStatusLabels[item.status]} · ${item.sourceIds.length} fuente(s) enlazada(s).`;
}

function describeActor(item: Actor, data: ObservatoryData) {
  const caseCount = data.cases.filter((entry) => isPublishedSocialMiningCase(entry) && entry.actorIds.includes(item.id)).length;
  return `${actorTypeLabels[item.type]} · presente en ${caseCount} caso(s) documentado(s).`;
}

type MatrixReference = {
  sourceId: string;
  status: "canonical-source" | "research-target";
  locator: string;
  owner: string;
  label: string;
};

function uniqueValues(values: string[]) {
  return [...new Set(values)];
}

function humanizeId(value: string) {
  return value
    .replace(/^mechanism-/, "")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getMatrixReferences(focus: GraphFocus, data: ObservatoryData): MatrixReference[] {
  const cajamarcaReferences = data.cajamarcaSystemMatrix.entries.flatMap((entry) =>
    entry.primaryDocuments.map((document) => ({
      ...document,
      owner: entry.id,
      label: entry.hito,
    })),
  );
  const mechanismReferences = data.institutionalMechanisms.entries.flatMap((entry) =>
    entry.primaryDocumentExamples.map((document) => ({
      ...document,
      owner: entry.mechanismId,
      label: humanizeId(entry.mechanismId),
    })),
  );

  const publishedCajamarcaReferences = cajamarcaReferences.filter((item) => item.status === "canonical-source");
  const publishedMechanismReferences = mechanismReferences.filter((item) => item.status === "canonical-source");

  if (focus === "cajamarca-system") return publishedCajamarcaReferences;
  if (focus === "institutional-mechanisms") return publishedMechanismReferences;
  if (focus === "matriz-documental") return [...publishedCajamarcaReferences, ...publishedMechanismReferences];
  return [];
}

function matrixStats(references: MatrixReference[]) {
  const canonical = references.filter((item) => item.status === "canonical-source").length;
  return {
    canonical,
    targets: references.length - canonical,
    sourceIds: uniqueValues(references.filter((item) => item.status === "canonical-source").map((item) => item.sourceId)),
  };
}

function buildDataSummary(
  focus: GraphFocus,
  data: ObservatoryData,
  latestMiningSelection: ObservatoryData["miningConflictSelections"][number] | undefined,
  latestReinfoSnapshot: ObservatoryData["reinfoTerritorialSnapshots"][number] | undefined,
  miningMentionStats: { illegal: number; informal: number; overlap: number },
) {
  const socialMiningCases = data.cases.filter(isPublishedSocialMiningCase);
  const reinfoCut = latestReinfoSnapshot ? `${formatNumber(latestReinfoSnapshot.totalRegistered)} inscripciones REINFO vigentes al ${formatDate(latestReinfoSnapshot.cutoffDate)}` : "corte REINFO no disponible";

  switch (focus) {
    case "conflicto-social-minero":
      return `${socialMiningCases.length} casos desarrollados reúnen ${socialMiningCases.reduce((sum, item) => sum + item.timeline.length, 0)} hitos en ${new Set(socialMiningCases.flatMap((item) => data.territories.filter((territory) => item.territoryIds.includes(territory.id)).map((territory) => territory.region))).size} regiones analizadas.`;
    case "mineria-ilegal-informal":
      return `${reinfoCut}. En el corte social minero: ${miningMentionStats.illegal} casos mencionan minería ilegal, ${miningMentionStats.informal} minería informal y ${miningMentionStats.overlap} ambas categorías.`;
    case "solapamiento-territorial":
      return `Cruce entre ${formatNumber(latestMiningSelection?.totalRegistered)} conflictos sociales mineros y fuentes técnicas de agua, ambiente y fiscalización.`;
    case "casos-hito":
      return `${socialMiningCases.reduce((sum, item) => sum + item.timeline.length, 0)} hitos y ${socialMiningCases.reduce((sum, item) => sum + item.claims.length, 0)} hallazgos en ${socialMiningCases.length} casos sociales mineros.`;
    case "actores-acuerdos":
      return `Comunidades, entidades públicas, empresas y organizaciones vinculadas con Las Bambas y Espinar para leer actas, posiciones y seguimiento sin asumir consenso.`;
    case "reinfo":
      return `${reinfoCut}; compara inscripción, permanencia, exclusión y formalización concluida.`;
    case "fiscalizacion":
      return `OEFA, SERNANP y PCM conectan monitoreo, operativos, sanciones y control territorial.`;
    case "evidencia-ambiental":
      return `Conecta Espinar y Conga con agua, ambiente, salud y monitoreo.`;
    case "matriz-documental":
      return `Explica unidades, clasificaciones y cálculos usados en el mapa y las páginas temáticas.`;
    case "cajamarca-system": {
      const stats = matrixStats(getMatrixReferences(focus, data));
      return `${data.cajamarcaSystemMatrix.entries.length} hitos territoriales y ${stats.canonical} referencias incorporadas al corte ${formatDate(data.cajamarcaSystemMatrix.cutoffDate)}.`;
    }
    case "institutional-mechanisms": {
      const stats = matrixStats(getMatrixReferences(focus, data));
      const families = uniqueValues(data.institutionalMechanisms.entries.map((entry) => entry.family)).length;
      return `${data.institutionalMechanisms.entries.length} mecanismos en ${families} familias y ${stats.canonical} referencias incorporadas al corte ${formatDate(data.institutionalMechanisms.cutoffDate)}.`;
    }
    case "trazabilidad-oro":
      return `Extracción, transporte, procesamiento, compra y exportación conectan Pataz, Madre de Dios y los controles nacionales.`;
  }
}

function buildFocusMetrics(
  focus: GraphFocus,
  activeSources: Source[],
  activeCases: ConflictCase[],
  activeIssues: NormativeIssue[],
  activeEvidenceRecords: EvidenceRecord[],
  latestReinfoSnapshot: ObservatoryData["reinfoTerritorialSnapshots"][number] | undefined,
  miningMentionStats: { illegal: number; informal: number; overlap: number },
  data: ObservatoryData,
) {
  const base: FocusMetric[] = [
    { label: "Fuentes", value: formatNumber(activeSources.length), note: activeSources.length ? "según filtro activo" : "el filtro no devuelve fuentes" },
    ...(activeEvidenceRecords.length ? [{ label: "Referencias precisas", value: formatNumber(activeEvidenceRecords.length), note: "página o sección cuando está disponible" }] : []),
    { label: "Conexiones", value: formatNumber(activeCases.length + activeIssues.length), note: "casos y temas relacionados" },
  ];

  if (focus === "conflicto-social-minero") {
    const timelineCount = activeCases.reduce((sum, item) => sum + item.timeline.length, 0);
    const findingCount = activeCases.reduce((sum, item) => sum + item.claims.length, 0);
    const regionCount = new Set(activeCases.flatMap((item) =>
      data.territories.filter((territory) => item.territoryIds.includes(territory.id)).map((territory) => territory.region),
    )).size;
    return [
      { label: "Hitos históricos", value: formatNumber(timelineCount), note: "decisiones, crisis y cambios comparables" },
      { label: "Hallazgos", value: formatNumber(findingCount), note: "problemas, respuestas y resultados" },
      { label: "Regiones analizadas", value: formatNumber(regionCount), note: "territorios de los casos desarrollados" },
      ...base,
    ];
  }

  if (focus === "mineria-ilegal-informal") {
    return [
      { label: "REINFO vigente", value: formatNumber(latestReinfoSnapshot?.totalRegistered), note: `corte ${formatDate(latestReinfoSnapshot?.cutoffDate)}` },
      { label: "Mención ilegal", value: formatNumber(miningMentionStats.illegal), note: "casos del corte social minero" },
      { label: "Mención informal", value: formatNumber(miningMentionStats.informal), note: `${formatNumber(miningMentionStats.overlap)} también mencionan ilegal` },
      ...base,
    ];
  }

  if (focus === "reinfo") {
    return [
      { label: "REINFO vigente", value: formatNumber(latestReinfoSnapshot?.totalRegistered), note: `consulta ${formatDate(latestReinfoSnapshot?.accessedAt)}` },
      { label: "Regiones", value: formatNumber(latestReinfoSnapshot?.regions.length), note: "agregación territorial, no ubicación exacta" },
      { label: "Fuente oficial", value: formatNumber(activeSources.filter((source) => source.type === "official").length), note: "MINEM y documentos vinculados" },
      ...base,
    ];
  }

  if (focus === "cajamarca-system") {
    const stats = matrixStats(getMatrixReferences(focus, data));
    return [
      { label: "Hitos", value: formatNumber(data.cajamarcaSystemMatrix.entries.length), note: "lectura territorial de Cajamarca" },
      { label: "Fuentes", value: formatNumber(stats.sourceIds.length), note: `${formatNumber(stats.canonical)} referencias incorporadas` },
      ...base,
    ];
  }

  if (focus === "institutional-mechanisms") {
    const stats = matrixStats(getMatrixReferences(focus, data));
    return [
      { label: "Mecanismos", value: formatNumber(data.institutionalMechanisms.entries.length), note: "comparación entre casos" },
      { label: "Familias", value: formatNumber(uniqueValues(data.institutionalMechanisms.entries.map((entry) => entry.family)).length), note: "tipos de mecanismo" },
      { label: "Fuentes", value: formatNumber(stats.sourceIds.length), note: `${formatNumber(stats.canonical)} referencias incorporadas` },
      ...base,
    ];
  }

  if (focus === "matriz-documental") {
    const stats = matrixStats(getMatrixReferences(focus, data));
    return [
      { label: "Referencias", value: formatNumber(data.evidenceRecords.length), note: "fuentes vinculadas con afirmaciones" },
      { label: "Lecturas comparadas", value: "2", note: "Cajamarca y mecanismos institucionales" },
      { label: "Fuentes incorporadas", value: formatNumber(stats.sourceIds.length), note: `${formatNumber(stats.canonical)} referencias precisas` },
      ...base,
    ];
  }

  return base;
}

export function RelationshipExplorer({ data }: { data: ObservatoryData }) {
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [issue, setIssue] = useState("all");
  const [sourceType, setSourceType] = useState("all");
  const [focus, setFocus] = useState<GraphFocus>("conflicto-social-minero");
  const [revealed, setRevealed] = useState<Set<GraphFocus>>(() => new Set(rootGraphFocuses));
  const [expanded, setExpanded] = useState<Set<GraphFocus>>(() => new Set());
  const [citationOpen, setCitationOpen] = useState(false);

  const sourceById = useMemo(() => new Map(data.sources.map((source) => [source.id, source])), [data.sources]);
  const caseById = useMemo(() => new Map(data.cases.map((item) => [item.id, item])), [data.cases]);
  const publicCases = useMemo(() => data.cases.filter(isPublishedSocialMiningCase), [data.cases]);
  const publicIssueIds = useMemo(() => new Set([
    ...publicCases.flatMap((item) => item.issueIds),
    "formalizacion-mape",
    "competencias-estado",
    "fiscalizacion-ambiental",
  ]), [publicCases]);
  const publicIssues = useMemo(() => data.issues.filter((item) => publicIssueIds.has(item.id)), [data.issues, publicIssueIds]);
  const publicActorIds = useMemo(() => new Set([
    ...publicCases.flatMap((item) => item.actorIds),
    "mineros-mape",
    "minem",
    "gobiernos-subnacionales",
  ]), [publicCases]);
  const publicActors = useMemo(() => data.actors.filter((item) => publicActorIds.has(item.id)), [data.actors, publicActorIds]);
  const publicInstruments = useMemo(() => data.instruments.filter((item) => item.issueIds.some((id) => publicIssueIds.has(id))), [data.instruments, publicIssueIds]);
  const publicAlternatives = useMemo(() => data.alternatives.filter((item) => item.issueIds.some((id) => publicIssueIds.has(id))), [data.alternatives, publicIssueIds]);
  const issueById = useMemo(() => new Map(data.issues.map((item) => [item.id, item])), [data.issues]);
  const actorById = useMemo(() => new Map(data.actors.map((item) => [item.id, item])), [data.actors]);
  const latestMiningCut = useMemo(() => getLatestPublicMiningCut(data), [data]);
  const latestSocialSnapshot = latestMiningCut.snapshot;
  const latestReinfoSnapshot = useMemo(() => [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0], [data.reinfoTerritorialSnapshots]);
  const latestMiningSelection = latestMiningCut.selection;
  const miningMentionStats = useMemo(() => {
    const illegal = latestMiningCut.cases.filter((item) => mentionsMiningCategory(item, "ilegal"));
    const informal = latestMiningCut.cases.filter((item) => mentionsMiningCategory(item, "informal"));
    const overlap = latestMiningCut.cases.filter((item) => mentionsMiningCategory(item, "ilegal") && mentionsMiningCategory(item, "informal"));
    return { illegal: illegal.length, informal: informal.length, overlap: overlap.length };
  }, [latestMiningCut.cases]);

  const activeDetail = focusDetails[focus];
  const activeMatrixDocuments = useMemo(() => getMatrixReferences(focus, data), [data, focus]);
  const activeSourceIds = uniqueValues([
    ...activeDetail.sourceIds,
    ...activeMatrixDocuments.filter((item) => item.status === "canonical-source").map((item) => item.sourceId),
  ]);
  const activeSources = activeSourceIds
    .map((id) => sourceById.get(id))
    .filter((item): item is Source => Boolean(item))
    .filter((item) => sourceType === "all" || item.type === sourceType);
  const activeCases = (activeDetail.caseIds ?? []).map((id) => caseById.get(id)).filter((item): item is ConflictCase => Boolean(item));
  const activeIssues = (activeDetail.issueIds ?? []).map((id) => issueById.get(id)).filter((item): item is NormativeIssue => Boolean(item));
  const activeActors = (activeDetail.actorIds ?? []).map((id) => actorById.get(id)).filter((item): item is Actor => Boolean(item));
  const activeEvidenceRecords = data.evidenceRecords.filter((record) => activeSourceIds.includes(record.sourceId));
  const activeDataSummary = buildDataSummary(focus, data, latestMiningSelection, latestReinfoSnapshot, miningMentionStats);
  const activeMetrics = buildFocusMetrics(focus, activeSources, activeCases, activeIssues, activeEvidenceRecords, latestReinfoSnapshot, miningMentionStats, data);
  const activeEvidenceCopy = activeEvidenceRecords.length
    ? `${activeEvidenceRecords.length} referencia(s) con página, sección o descripción precisa dentro de la fuente.`
    : `${activeSources.length} fuente(s) directa(s) enlazada(s) con este tema.`;
  const activeDisputeCopy = activeActors.length
    ? `${activeActors.length} actor(es) conectado(s): ${activeActors.map((actor) => actor.name).join(", ")}.`
    : "Pautas para distinguir hechos documentados, posiciones de actores e interpretación académica.";
  const visibleGraphNodes = useMemo(() => makeNodes(focus, revealed), [focus, revealed]);
  const visibleGraphEdges = useMemo(() => makeEdges(revealed, expanded), [expanded, revealed]);
  const isRootOnlyGraph = visibleGraphNodes.length <= rootGraphFocuses.length;
  const guidedFocuses = useMemo(() => graphNodes.filter((node) => publicGraphFocuses.has(node.id) && revealed.has(node.id)), [revealed]);

  const revealFocus = (nextFocus: GraphFocus) => {
    if (!publicGraphFocuses.has(nextFocus)) return;
    setFocus(nextFocus);
    setRevealed((current) => {
      const next = new Set(current);
      next.add(nextFocus);
      focusRelations[nextFocus].filter((related) => publicGraphFocuses.has(related)).forEach((related) => next.add(related));
      return next;
    });
    setExpanded((current) => {
      const next = new Set(current);
      next.add(nextFocus);
      return next;
    });
  };

  const results = useMemo<ResultItem[]>(() => [
    {
      id: "conflicto-social-minero",
      label: "Conflicto social minero",
      subtitle: `${publicCases.length} casos desarrollados · ${publicCases.reduce((sum, item) => sum + item.timeline.length, 0)} hitos comparables`,
      type: "route",
      focus: "conflicto-social-minero" as GraphFocus,
      href: "/conflictos",
      count: publicCases.length,
    },
    {
      id: "mineria-ilegal-informal",
      label: "Minería ilegal e informal",
      subtitle: `${miningMentionStats.illegal} casos mencionan minería ilegal · ${miningMentionStats.informal} mencionan minería informal · categorías separadas`,
      type: "route",
      focus: "mineria-ilegal-informal" as GraphFocus,
      href: "/oro-ilegal",
      count: miningMentionStats.illegal + miningMentionStats.informal - miningMentionStats.overlap,
    },
    {
      id: "reinfo",
      label: "REINFO",
      subtitle: `${latestReinfoSnapshot?.totalRegistered.toLocaleString("es-PE") ?? "s/d"} inscripciones vigentes · registro separado de los conflictos`,
      type: "route",
      focus: "reinfo" as GraphFocus,
      href: "/reinfo",
      count: latestReinfoSnapshot?.totalRegistered ?? 0,
    },
    {
      id: "madre-de-dios",
      label: "Madre de Dios: minería aurífera",
      subtitle: "Deforestación, mercurio, Tambopata y formalización",
      type: "route",
      focus: "mineria-ilegal-informal" as GraphFocus,
      href: "/madre-de-dios",
      count: data.madreDiosDevastation.sourceIds.length,
    },
    {
      id: "trazabilidad-oro",
      label: "Cadena del oro",
      subtitle: "Origen, acopio, procesamiento, comercialización y controles estatales",
      type: "route",
      focus: "trazabilidad-oro" as GraphFocus,
      href: "/oro-ilegal",
      count: focusDetails["trazabilidad-oro"].sourceIds.length,
    },
    {
      id: "solapamiento-territorial",
      label: "Puentes y solapamientos",
      subtitle: "Territorio, ambiente y gobernanza",
      type: "route",
      focus: "solapamiento-territorial" as GraphFocus,
      href: "/mapa",
      count: publicIssues.length,
    },
    {
      id: "matriz-documental",
      label: "Construcción de datos",
      subtitle: "Unidades, clasificaciones, cálculos y actualizaciones",
      type: "route",
      focus: "matriz-documental" as GraphFocus,
      href: "/metodologia#fuentes",
      count: data.evidenceRecords.length,
    },
    {
      id: "cajamarca-system",
      label: "Conflictos en Cajamarca",
      subtitle: `${data.cajamarcaSystemMatrix.entries.length} hitos · lectura territorial comparada`,
      type: "matrix",
      focus: "cajamarca-system" as GraphFocus,
      href: "/conflictos",
      count: data.cajamarcaSystemMatrix.entries.length,
    },
    {
      id: "institutional-mechanisms",
      label: "Mecanismos institucionales",
      subtitle: `${data.institutionalMechanisms.entries.length} mecanismos · obligaciones, seguimiento y resultados`,
      type: "matrix",
      focus: "institutional-mechanisms" as GraphFocus,
      href: "/conflictos",
      count: data.institutionalMechanisms.entries.length,
    },
    ...data.cajamarcaSystemMatrix.entries.map((item) => ({
      id: item.id,
      label: item.hito,
      subtitle: `Conflictos en Cajamarca · ${item.primaryDocuments.filter((document) => document.status === "canonical-source").length} fuente(s) incorporada(s)`,
      type: "matrix",
      focus: "cajamarca-system" as GraphFocus,
      href: "/conflictos",
      count: item.primaryDocuments.length,
    })),
    ...data.institutionalMechanisms.entries.map((item) => ({
      id: item.mechanismId,
      label: humanizeId(item.mechanismId),
      subtitle: `Mecanismo institucional · ${item.family.replaceAll("-", " ")}`,
      type: "matrix",
      focus: "institutional-mechanisms" as GraphFocus,
      href: "/conflictos",
      count: item.primaryDocumentExamples.length,
    })),
    ...publicCases.map((item) => ({
      id: item.id,
      label: item.name,
      subtitle: "Caso social minero",
      type: "case",
      focus: getGraphFocus(item.id),
      href: `/conflictos/${item.slug}`,
      count: item.claims.length + item.timeline.length,
    })),
    ...publicIssues.map((item) => ({
      id: item.id,
      label: item.name,
      subtitle: "Tema normativo",
      type: "issue",
      focus: getGraphFocus(item.id),
      href: `/normativa#${item.id}`,
      count: item.sourceIds.length,
    })),
    ...publicInstruments.map((item) => ({
      id: item.id,
      label: item.number,
      subtitle: item.title,
      type: "instrument",
      focus: getGraphFocus(item.id),
      href: "/normativa",
      count: item.sourceIds.length,
    })),
    ...publicAlternatives.map((item) => ({
      id: item.id,
      label: item.title,
      subtitle: "Propuesta documentada",
      type: "alternative",
      focus: getGraphFocus(item.id),
      href: "/metodologia#principios",
      count: item.sourceIds.length,
    })),
    ...publicActors.map((item) => ({
      id: item.id,
      label: item.name,
      subtitle: "Actor relacionado",
      type: "actor",
      focus: getGraphFocus(item.id),
      count: publicCases.filter((entry) => entry.actorIds.includes(item.id)).length,
    })),
  ].filter((item) => {
    if (!publicGraphFocuses.has(item.focus)) return false;
    const matchesText = `${item.label} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = entityType === "all" || item.type === entityType;
    const matchesIssue = issue === "all" || item.id.includes(issue) || data.cases.find((entry) => entry.id === item.id)?.issueIds.includes(issue);
    return matchesText && matchesType && matchesIssue;
  }).sort((a, b) => {
    const priority = ["conflicto-social-minero", "mineria-ilegal-informal", "reinfo", "madre-de-dios", "trazabilidad-oro", "solapamiento-territorial", "matriz-documental", "cajamarca-system", "institutional-mechanisms"];
    const aRank = priority.indexOf(a.id);
    const bRank = priority.indexOf(b.id);
    return (aRank === -1 ? 999 : aRank) - (bRank === -1 ? 999 : bRank);
  }), [data, entityType, issue, latestReinfoSnapshot, miningMentionStats, publicActors, publicAlternatives, publicCases, publicInstruments, publicIssues, query]);

  const reset = () => {
    setQuery("");
    setEntityType("all");
    setIssue("all");
    setSourceType("all");
    setFocus("conflicto-social-minero");
    setRevealed(new Set(rootGraphFocuses));
    setExpanded(new Set());
  };

  return (
    <div className="relationship-app">
      <section className="explorer-toolbar" aria-label="Búsqueda principal">
        <label className="search-box">
          <MagnifyingGlass size={22} />
          <span className="sr-only">Buscar</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar relaciones, casos, normas o actores" />
        </label>
        <div className="toolbar-meta">
          <label>Fecha de corte <input type="date" value={latestSocialSnapshot?.cutoffDate ?? "2026-06-17"} readOnly /></label>
          <button onClick={() => setCitationOpen(true)}>Cómo citar</button>
        </div>
      </section>
      <section className="filter-bar" aria-label="Filtros del explorador">
        <span>Filtrar por</span>
        <label>
          <span>Tipo de entidad</span>
          <select value={entityType} onChange={(event) => setEntityType(event.target.value)}>
            <option value="all">Todas</option>
            <option value="route">Rutas</option>
            <option value="matrix">Comparaciones</option>
            <option value="case">Casos</option>
            <option value="issue">Temas</option>
            <option value="instrument">Normas</option>
            <option value="alternative">Propuestas documentadas</option>
            <option value="actor">Actores</option>
          </select>
        </label>
        <label>
          <span>Tema</span>
          <select value={issue} onChange={(event) => setIssue(event.target.value)}>
            <option value="all">Todos</option>
            {publicIssues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          <span>Fuente</span>
          <select value={sourceType} onChange={(event) => setSourceType(event.target.value)}>
            <option value="all">Todas</option>
            <option value="official">Oficial</option>
            <option value="academic">Academia</option>
            <option value="community">Comunidad</option>
            <option value="company">Empresa</option>
            <option value="ngo">Sociedad civil</option>
            <option value="press">Prensa</option>
          </select>
        </label>
        <button className="clear-button" onClick={reset}><X size={16} /> Limpiar</button>
      </section>
      <div className="explorer-grid">
        <aside className="results-pane" aria-label="Índice de resultados">
          <div className="pane-heading"><p>Índice de relaciones</p><span>{results.length} resultados</span></div>
          <div className="guided-reading" aria-label="Conexiones sugeridas">
            <p>Conexiones progresivas</p>
            {guidedFocuses.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.id} className={focus === item.id ? "active" : ""} onClick={() => revealFocus(item.id)}>
                  <Icon size={15} /> {item.title}
                </button>
              );
            })}
          </div>
          <div className="result-list">
            {results.slice(0, 10).map((item) => (
              <div key={item.id} className={focus === item.focus ? "result-row active" : "result-row"}>
                <button className="result-row-main" onClick={() => revealFocus(item.focus)}>
                  <span className="result-icon">{item.type === "case" ? <MapPin /> : item.type === "instrument" ? <BookOpenText /> : item.type === "alternative" ? <Scales /> : item.type === "actor" ? <Buildings /> : item.type === "matrix" ? <TreeStructure /> : <CirclesThreePlus />}</span>
                  <span><strong>{item.label}</strong><small>{item.subtitle}</small></span>
                  <em>{item.count.toLocaleString("es-PE")}<small> vínculos</small></em>
                </button>
                {item.href && <InlineLink href={item.href} label="Abrir" />}
              </div>
            ))}
            {!results.length && <p className="empty-state">Ajusta los filtros para recuperar relaciones.</p>}
          </div>
          <div className="case-links">
            <p>Casos hito</p>
            {publicCases.map((item) => <Link key={item.id} href={`/conflictos/${item.slug}`}><MapPin size={14} />{item.name}</Link>)}
          </div>
        </aside>
        <section className={`graph-pane ${isRootOnlyGraph ? "is-root-only" : "is-expanded"}`} aria-label="Relaciones de conocimiento">
          <div className="graph-title">
            <p>{activeDetail.kicker}</p>
            <h1>{activeDetail.title}</h1>
            <span><i className="dot warning" /> punto crítico <i className="dot official" /> enlace directo</span>
          </div>
          <div className="graph-layers" aria-label="Leyenda de capas del sistema">
            <span><i data-tone="social" /> conflicto</span>
            <span><i data-tone="bridge" /> puente</span>
            <span><i data-tone="instrument" /> instrumento</span>
            <span><i data-tone="control" /> control</span>
            <span><i data-tone="evidence" /> ambiente</span>
          </div>
          <div className="graph-principle">
            <TreeStructure size={16} aria-hidden />
            <span>Las líneas conectan problemas, territorios, actores y controles; selecciona un nodo para explorar sus datos.</span>
          </div>
          <ReactFlow key={`${visibleGraphNodes.length}-${visibleGraphEdges.length}`} nodes={visibleGraphNodes} edges={visibleGraphEdges} fitView fitViewOptions={{ padding: 0.05, maxZoom: isRootOnlyGraph ? 1 : 0.7 }} minZoom={0.45} maxZoom={1.2} nodesDraggable={false} onNodeClick={(_, node) => revealFocus(node.id as GraphFocus)} proOptions={{ hideAttribution: true }}>
            <Background color="#1b536b" gap={30} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </section>
        <aside className="evidence-pane" aria-label="Información relacionada">
          <div className="pane-heading"><p>Información relacionada</p><strong>{activeDetail.title}</strong></div>
          <section className="focus-card">
            <p>{activeDetail.kicker}</p>
            <h2>{activeDetail.title}</h2>
            <span>{activeDataSummary}</span>
            <small>{activeDetail.summary}</small>
          </section>
          <section className="focus-metrics" aria-label="Métricas del foco activo">
            {activeMetrics.map((metric) => (
              <article key={`${metric.label}-${metric.value}`}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
                <small>{metric.note}</small>
              </article>
            ))}
          </section>
          <section className="link-group">
            <div className="link-group-title">
              <p>Enlaces conectados</p>
              <span>{activeDetail.routeLinks.length + activeCases.length + activeIssues.length} conexiones</span>
            </div>
            <div className="linked-list">
              {activeDetail.routeLinks.map((item) => <LinkedCard key={item.href} item={item} />)}
              {activeCases.slice(0, 4).map((item) => <LinkedCard key={item.id} item={{ label: item.name, href: `/conflictos/${item.slug}`, description: describeCase(item) }} />)}
              {activeIssues.slice(0, 3).map((item) => <LinkedCard key={item.id} item={{ label: item.name, href: `/normativa#${item.id}`, description: describeIssue(item) }} />)}
            </div>
          </section>
          <EvidenceGroup number="1" title={activeDetail.evidenceTitle} count={activeEvidenceRecords.length || activeSourceIds.length} copy={activeEvidenceCopy} items={activeDetail.evidenceItems} tone="green" />
          <EvidenceGroup number="2" title={activeDetail.disputeTitle} count={activeActors.length || activeDetail.disputeItems.length} copy={activeDisputeCopy} items={[...activeDetail.disputeItems, ...activeActors.slice(0, 3).map((actor) => `${actor.name}: ${describeActor(actor, data)}`)]} tone="copper" />
          {activeEvidenceRecords.length > 0 && (
            <section className="locator-group">
              <div className="link-group-title">
                <p>Datos relacionados</p>
                <span>{activeEvidenceRecords.length} registro(s)</span>
              </div>
              {activeEvidenceRecords.slice(0, 4).map((record) => (
                <article key={record.id}>
                  <strong>{relationLabels[record.relation]} · {record.locator}</strong>
                  <span>{record.summary}</span>
                  <small>Actualizado: {formatDate(record.checkedAt)}</small>
                </article>
              ))}
            </section>
          )}
          {activeMatrixDocuments.length > 0 && (
            <section className="locator-group">
              <div className="link-group-title">
                <p>Enlaces de las comparaciones</p>
                <span>{activeMatrixDocuments.length} enlace(s)</span>
              </div>
              {activeMatrixDocuments.slice(0, 6).map((record) => (
                <article key={`${record.owner}-${record.sourceId}-${record.locator}`}>
                  <strong>{record.locator}</strong>
                  <span>{record.label}</span>
                  <small>{sourceById.get(record.sourceId)?.institution ?? "Institución"}</small>
                </article>
              ))}
            </section>
          )}
          <section className="source-links">
            <div className="link-group-title">
              <p>Fuentes directas</p>
              <span>{activeSources.length} fuente(s)</span>
            </div>
            {activeSources.length ? activeSources.slice(0, 4).map((source) => (
              <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                <strong>{source.institution}</strong>
                <span>{source.title}</span>
                <small>{sourceTypeLabels[source.type]} · {formatDate(source.date)}</small>
                <ArrowSquareOut size={14} aria-hidden />
              </a>
            )) : <p className="empty-state">El filtro de tipo de fuente no devuelve fuentes para este foco. Retira el filtro o abre otro nodo.</p>}
          </section>
          <div className="evidence-level">
            <span>Qué explorar ahora</span>
            <strong><BookOpenText size={16} aria-hidden /><i /> Lectura académica</strong>
            <p>{activeDetail.nextStep}</p>
          </div>
        </aside>
      </div>
      {citationOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCitationOpen(false)}><section className="citation-dialog" role="dialog" aria-modal="true" aria-labelledby="citation-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setCitationOpen(false)} aria-label="Cerrar"><X /></button><p className="eyebrow">Cita sugerida</p><h2 id="citation-title">Sistema de relaciones mineras</h2><blockquote>Observatorio de Conflictos Mineros del Perú (2026). “Sistema de relaciones: conflictos sociales mineros, minería ilegal e informal y REINFO”. Fecha de consulta: {new Date().toLocaleDateString("es-PE")}.</blockquote></section></div>}
    </div>
  );
}

function InlineLink({ href, label }: { href: string; label: string }) {
  if (href.startsWith("http")) return <a className="result-open" href={href} target="_blank" rel="noreferrer">{label}<ArrowSquareOut size={12} aria-hidden /></a>;
  return <Link className="result-open" href={href}>{label}</Link>;
}

function LinkedCard({ item }: { item: FocusLink }) {
  const className = "linked-card";
  const content = (
    <>
      <strong>{item.label}</strong>
      <span>{item.description}</span>
      {item.external && <ArrowSquareOut size={14} aria-hidden />}
    </>
  );
  if (item.external || item.href.startsWith("http")) return <a className={className} href={item.href} target="_blank" rel="noreferrer">{content}</a>;
  return <Link className={className} href={item.href}>{content}</Link>;
}

function EvidenceGroup({ number, title, count, copy, items, tone }: { number: string; title: string; count: number; copy: string; items: string[]; tone: string }) {
  return <section className={`evidence-group tone-${tone}`}><div className="evidence-group-title"><span>{number}</span><h2>{title}</h2><em>{count.toLocaleString("es-PE")} registros</em></div><p>{copy}</p><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
