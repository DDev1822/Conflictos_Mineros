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
import { mentionsMiningCategory } from "@/lib/mining-classification";

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
  | "casos-piloto"
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

const allCaseIds = ["tambogrande", "conga", "tia-maria", "las-bambas", "espinar", "madre-de-dios"];

const graphNodes: GraphNodeDefinition[] = [
  {
    id: "conflicto-social-minero",
    title: "Conflicto social minero",
    subtitle: "Territorio, agua, acuerdos y cumplimiento documentado",
    layer: "Problema público",
    tone: "social",
    role: "root",
    icon: MapPin,
    position: { x: 54, y: 170 },
    width: 270,
    height: 150,
  },
  {
    id: "mineria-ilegal-informal",
    title: "Minería ilegal e informal",
    subtitle: "Ilegalidad, informalidad, MAPE, fiscalización y trazabilidad",
    layer: "Problema público",
    tone: "illegal",
    role: "root",
    icon: WarningCircle,
    position: { x: 374, y: 170 },
    width: 270,
    height: 150,
  },
  {
    id: "solapamiento-territorial",
    title: "Solapamiento territorial",
    subtitle: "Cruza evidencia, gobernanza y presión institucional",
    layer: "Puente analítico",
    tone: "bridge",
    role: "bridge",
    icon: Network,
    position: { x: 252, y: 350 },
    width: 220,
    height: 88,
  },
  {
    id: "casos-piloto",
    title: "Casos piloto",
    subtitle: "Seis expedientes con cronología y estado",
    layer: "Expedientes",
    tone: "social",
    role: "node",
    icon: Article,
    position: { x: 50, y: 462 },
    width: 158,
    height: 104,
  },
  {
    id: "actores-acuerdos",
    title: "Actores y actas",
    subtitle: "Comunidades, Estado, empresa y acuerdos",
    layer: "Relación",
    tone: "social",
    role: "node",
    icon: UsersThree,
    position: { x: 222, y: 462 },
    width: 160,
    height: 104,
  },
  {
    id: "reinfo",
    title: "REINFO",
    subtitle: "Registro puente; no centro narrativo",
    layer: "Instrumento",
    tone: "instrument",
    role: "node",
    icon: ShieldCheck,
    position: { x: 396, y: 462 },
    width: 150,
    height: 104,
  },
  {
    id: "fiscalizacion",
    title: "Fiscalización",
    subtitle: "Supervisión y control documental",
    layer: "Control",
    tone: "control",
    role: "node",
    icon: Gavel,
    position: { x: 560, y: 462 },
    width: 150,
    height: 104,
  },
  {
    id: "evidencia-ambiental",
    title: "Monitoreo ambiental",
    subtitle: "Dato técnico sin causalidad inferida",
    layer: "Evidencia",
    tone: "evidence",
    role: "node",
    icon: BookOpenText,
    position: { x: 54, y: 600 },
    width: 190,
    height: 104,
  },
  {
    id: "matriz-documental",
    title: "Matriz de evidencia",
    subtitle: "Fuente directa, locador y revisión",
    layer: "Gate V1",
    tone: "bridge",
    role: "node",
    icon: TreeStructure,
    position: { x: 266, y: 600 },
    width: 210,
    height: 104,
  },
  {
    id: "cajamarca-system",
    title: "Sistema Cajamarca",
    subtitle: "Quilish, Conga, Acuña y Michiquillay",
    layer: "Matriz territorial",
    tone: "bridge",
    role: "node",
    icon: TreeStructure,
    position: { x: 48, y: 738 },
    width: 300,
    height: 112,
  },
  {
    id: "institutional-mechanisms",
    title: "Mecanismos institucionales",
    subtitle: "EIA, PAMA, sentencias, actas, fondos y registros",
    layer: "Matriz comparada",
    tone: "control",
    role: "node",
    icon: Gavel,
    position: { x: 384, y: 738 },
    width: 310,
    height: 112,
  },
  {
    id: "trazabilidad-oro",
    title: "Trazabilidad del oro",
    subtitle: "Origen y controles de cadena",
    layer: "Cadena",
    tone: "illegal",
    role: "node",
    icon: Briefcase,
    position: { x: 500, y: 600 },
    width: 190,
    height: 104,
  },
];

const focusRelations: Record<GraphFocus, GraphFocus[]> = {
  "conflicto-social-minero": ["solapamiento-territorial", "casos-piloto", "actores-acuerdos", "evidencia-ambiental", "matriz-documental", "cajamarca-system", "institutional-mechanisms"],
  "mineria-ilegal-informal": ["solapamiento-territorial", "reinfo", "fiscalizacion", "trazabilidad-oro", "matriz-documental", "institutional-mechanisms"],
  "solapamiento-territorial": ["conflicto-social-minero", "mineria-ilegal-informal", "evidencia-ambiental", "matriz-documental", "cajamarca-system", "institutional-mechanisms"],
  "casos-piloto": ["conflicto-social-minero", "actores-acuerdos", "evidencia-ambiental", "matriz-documental", "cajamarca-system"],
  "actores-acuerdos": ["conflicto-social-minero", "casos-piloto", "reinfo", "matriz-documental", "institutional-mechanisms"],
  reinfo: ["mineria-ilegal-informal", "actores-acuerdos", "fiscalizacion", "trazabilidad-oro", "matriz-documental", "institutional-mechanisms"],
  fiscalizacion: ["mineria-ilegal-informal", "reinfo", "trazabilidad-oro", "evidencia-ambiental", "matriz-documental", "institutional-mechanisms"],
  "evidencia-ambiental": ["conflicto-social-minero", "solapamiento-territorial", "fiscalizacion", "matriz-documental", "cajamarca-system", "institutional-mechanisms"],
  "matriz-documental": ["conflicto-social-minero", "mineria-ilegal-informal", "solapamiento-territorial", "reinfo", "evidencia-ambiental", "cajamarca-system", "institutional-mechanisms"],
  "cajamarca-system": ["conflicto-social-minero", "casos-piloto", "evidencia-ambiental", "matriz-documental", "institutional-mechanisms"],
  "institutional-mechanisms": ["conflicto-social-minero", "mineria-ilegal-informal", "actores-acuerdos", "fiscalizacion", "matriz-documental", "cajamarca-system"],
  "trazabilidad-oro": ["mineria-ilegal-informal", "reinfo", "fiscalizacion", "matriz-documental", "institutional-mechanisms"],
};

const focusDetails: Record<GraphFocus, FocusDetail> = {
  "conflicto-social-minero": {
    kicker: "Ventana A",
    title: "Conflicto social minero",
    summary: "Lee los seis expedientes piloto desde cronología, actores, fuentes y estado al corte; el punto de partida cuantitativo es el corte Defensoría y la selección minera documentada.",
    evidenceTitle: "Base documental",
    evidenceItems: ["6 expedientes piloto enlazados", "selección minera derivada del corte Defensoría", "nudos de agua, participación, beneficios y acuerdos"],
    disputeTitle: "Límites visibles",
    disputeItems: ["conflicto social no equivale a protesta aislada", "causalidad ambiental solo si una fuente técnica la formula", "desacuerdos y estados abiertos permanecen atribuidos"],
    nextStep: "Abrir expedientes y cronología antes de leer interpretaciones; cada hito debe conservar fuente directa y locador.",
    sourceIds: ["defensoria-conflictos", "defensoria-acuerdos-187", "defensoria-conflictos-hidricos"],
    caseIds: allCaseIds,
    issueIds: ["agua-cuencas", "dialogo-acuerdos", "beneficios-territoriales", "consulta-participacion"],
    routeLinks: [
      { label: "Ver catálogo de casos", href: "/conflictos", description: "Seis expedientes piloto con cronología y fuentes." },
      { label: "Ver cronología comparada", href: "/cronologia", description: "Hitos documentados por caso." },
      { label: "Ver mapa territorial", href: "/mapa", description: "Capa espacial de conflictos y registros territoriales." },
    ],
  },
  "mineria-ilegal-informal": {
    kicker: "Ventana B",
    title: "Minería ilegal e informal",
    summary: "Separa menciones de minería ilegal, minería informal, MAPE, REINFO, fiscalización y trazabilidad; la interfaz conserva el solapamiento textual sin convertirlo en determinación individual.",
    evidenceTitle: "Cortes conectados",
    evidenceItems: ["menciones explícitas de minería ilegal e informal en el corte social", "REINFO vigente como registro administrativo", "controles de origen y comercialización del oro"],
    disputeTitle: "Límites de lectura",
    disputeItems: ["informalidad e ilegalidad no son equivalentes", "inscripción REINFO no acredita formalización concluida", "Madre de Dios es caso profundo, no plantilla nacional"],
    nextStep: "Contrastar REINFO/MAPE con fiscalización, trazabilidad y fuentes territoriales antes de formular una conclusión pública.",
    sourceIds: ["minem-reinfo", "minem-reinfo-vigente-corte-2026-06-18", "minem-rd-0004-2025-reinfo-exclusiones", "minem-comunicado-reinfo-2025"],
    caseIds: ["madre-de-dios"],
    issueIds: ["formalizacion-mape", "competencias-estado"],
    actorIds: ["mineros-mape", "minem", "gobiernos-subnacionales"],
    routeLinks: [
      { label: "Abrir REINFO / MAPE", href: "/reinfo", description: "Página conceptual del registro y proceso de formalización." },
      { label: "Ver Madre de Dios", href: "/conflictos/madre-de-dios", description: "Caso profundo para diferenciar REINFO, ilegalidad y trazabilidad." },
      { label: "Ver nudo normativo", href: "/normativa#formalizacion-mape", description: "Formalización de la MAPE y REINFO." },
    ],
  },
  "solapamiento-territorial": {
    kicker: "Puente analítico",
    title: "Solapamiento territorial",
    summary: "Cruza territorio, evidencia ambiental, gobernanza y capacidad estatal; el vínculo es documental y exige abrir expediente o fuente antes de inferir causalidad.",
    evidenceTitle: "Cruces documentados",
    evidenceItems: ["mapa y registro regional", "fuentes ambientales y de agua", "competencias estatales concurrentes"],
    disputeTitle: "Regla de lectura",
    disputeItems: ["el cruce territorial no fusiona categorías administrativas", "la evidencia técnica requiere alcance, fecha y entidad", "los conflictos pueden permanecer abiertos"],
    nextStep: "Usar el mapa para ver proximidad territorial y luego abrir el expediente o fuente exacta.",
    sourceIds: ["ana-agua", "oefa-fiscalizacion", "defensoria-conflictos"],
    caseIds: ["madre-de-dios", "espinar", "las-bambas"],
    issueIds: ["competencias-estado", "agua-cuencas", "fiscalizacion-ambiental"],
    routeLinks: [
      { label: "Ver mapa completo", href: "/mapa", description: "Capas de conflictos, REINFO, formal, exploración y concesiones." },
      { label: "Ver metodología", href: "/metodologia#principios", description: "Separación entre hecho, interpretación y propuesta." },
    ],
  },
  "casos-piloto": {
    kicker: "Expedientes",
    title: "Casos piloto",
    summary: "Entrada territorial de la V1: cada expediente conserva cronología, afirmaciones, actores, fuentes, estado al corte y límites documentales.",
    evidenceTitle: "Casos enlazados",
    evidenceItems: ["Tambogrande, Conga, Tía María, Las Bambas, Espinar y Madre de Dios", "mínimo tres hitos por expediente", "afirmaciones separadas por tipo"],
    disputeTitle: "Gate V1",
    disputeItems: ["sin fuente directa no hay hito sustantivo", "sin locador no hay hecho documentado", "sin estado al corte no hay cierre editorial"],
    nextStep: "Abrir cada expediente y revisar primero la cronología documentada.",
    sourceIds: ["metodologia-observatorio", "defensoria-conflictos"],
    caseIds: allCaseIds,
    routeLinks: [
      { label: "Ver todos los casos", href: "/conflictos", description: "Tabla general de expedientes piloto." },
      { label: "Ver cronología", href: "/cronologia", description: "Hitos comparados entre expedientes." },
    ],
  },
  "actores-acuerdos": {
    kicker: "Relación",
    title: "Actores y actas",
    summary: "Agrupa comunidades, Estado, empresas, organizaciones, actas y acuerdos por expediente; los comunicados son posición de actor, no verificación independiente de cumplimiento.",
    evidenceTitle: "Actores y documentos",
    evidenceItems: ["actores por expediente", "actas, acuerdos y compromisos", "posiciones directas de afectados o involucrados"],
    disputeTitle: "Contradicciones abiertas",
    disputeItems: ["no homogeneizar comunidades", "no tomar comunicado corporativo como verificación", "no ocultar contradicciones abiertas"],
    nextStep: "Abrir los casos y contrastar actores con fuentes directas disponibles.",
    sourceIds: ["defensoria-acuerdos-187", "madre-dios-mesa-2025", "las-bambas-actas-2025"],
    caseIds: ["las-bambas", "espinar", "madre-de-dios"],
    actorIds: ["comunidades-cotabambas", "comunidades-espinar", "federaciones-madre-dios", "minem"],
    routeLinks: [
      { label: "Ver Las Bambas", href: "/conflictos/las-bambas", description: "Actas, acuerdos y corredor minero." },
      { label: "Ver Espinar", href: "/conflictos/espinar", description: "Salud ambiental, acuerdos y actores." },
      { label: "Ver Madre de Dios", href: "/conflictos/madre-de-dios", description: "Actores indígenas, gremiales y estatales." },
    ],
  },
  reinfo: {
    kicker: "Instrumento",
    title: "REINFO",
    summary: "Registro administrativo dentro del eje minería ilegal/informal: muestra permanencia registral y corte, pero no acredita por sí solo formalización concluida.",
    evidenceTitle: "Corte registral",
    evidenceItems: ["registro vigente y fecha de corte", "exclusiones y comunicados aplicables", "diferencia entre inscripción y formalización concluida"],
    disputeTitle: "Límite documental",
    disputeItems: ["no equivale automáticamente a formalidad", "no borra categorías de ilegalidad o informalidad", "requiere fuente y alcance para afirmaciones públicas"],
    nextStep: "Abrir REINFO/MAPE y consultar la fuente oficial del registro con fecha de corte.",
    sourceIds: ["minem-reinfo", "minem-reinfo-vigente-corte-2026-06-18", "minem-rd-0004-2025-reinfo-exclusiones", "minem-comunicado-reinfo-2025"],
    caseIds: ["madre-de-dios"],
    issueIds: ["formalizacion-mape"],
    routeLinks: [
      { label: "Abrir página REINFO / MAPE", href: "/reinfo", description: "Explicación del registro como instrumento." },
      { label: "Ver norma vinculada", href: "/normativa#formalizacion-mape", description: "Nudo normativo de formalización." },
    ],
  },
  fiscalizacion: {
    kicker: "Control",
    title: "Fiscalización",
    summary: "Conecta informes técnicos, competencia estatal, control ambiental y operativos contra minería ilegal; un hallazgo o operativo no cierra responsabilidad ni conflicto territorial.",
    evidenceTitle: "Documentos de control",
    evidenceItems: ["informes técnicos", "operativos y actuaciones de control", "competencia de la autoridad que emite el documento"],
    disputeTitle: "Precaución",
    disputeItems: ["hallazgo no equivale a responsabilidad final", "medición no equivale a causalidad cerrada", "operativo no resuelve conflicto territorial"],
    nextStep: "Abrir nudos de fiscalización y verificar fuente, fecha, alcance y entidad emisora.",
    sourceIds: ["oefa-fiscalizacion", "sernanp-operativo-tambopata-2025", "pcm-operativos-mineria-ilegal-2025", "pcm-estrategia-mineria-ilegal-2025"],
    caseIds: ["madre-de-dios", "espinar"],
    issueIds: ["fiscalizacion-ambiental", "competencias-estado"],
    routeLinks: [
      { label: "Ver nudo de fiscalización", href: "/normativa#fiscalizacion-ambiental", description: "Fiscalización ambiental y cumplimiento." },
      { label: "Ver Madre de Dios", href: "/conflictos/madre-de-dios", description: "Operativos, REINFO y control territorial." },
    ],
  },
  "evidencia-ambiental": {
    kicker: "Evidencia",
    title: "Monitoreo ambiental",
    summary: "Dato técnico trazable para Espinar, Conga y nudos de agua/fiscalización; cada lectura debe conservar alcance, entidad emisora, fecha y límite causal.",
    evidenceTitle: "Fuentes técnicas",
    evidenceItems: ["monitoreos e informes", "fuentes de agua y ambiente", "alcance territorial y temporal"],
    disputeTitle: "Regla editorial",
    disputeItems: ["no inferir causalidad no respaldada", "no omitir contradicciones", "no mezclar evidencia técnica con conclusión política"],
    nextStep: "Abrir los casos de Espinar y Conga o los nudos de agua/fiscalización para leer el alcance de cada fuente.",
    sourceIds: ["oefa-fiscalizacion", "ana-agua", "espinar-sociospatial-2025", "conga-millones-2016"],
    caseIds: ["espinar", "conga"],
    issueIds: ["fiscalizacion-ambiental", "agua-cuencas", "certificacion-ambiental"],
    routeLinks: [
      { label: "Ver Espinar", href: "/conflictos/espinar", description: "Salud ambiental, monitoreo y controversia." },
      { label: "Ver Conga", href: "/conflictos/conga", description: "Agua, EIA y estado documentado." },
      { label: "Ver nudo de agua", href: "/normativa#agua-cuencas", description: "Agua, cuencas y prioridades de uso." },
    ],
  },
  "matriz-documental": {
    kicker: "Gate V1",
    title: "Matriz de evidencia",
    summary: "Controla que cada afirmación, hito o instrumento tenga fuente directa, locador exacto, relación de evidencia y estado de revisión antes de pasar gates.",
    evidenceTitle: "Contrato de evidencia",
    evidenceItems: ["fuente directa", "página, sección, tabla o artículo", "relación supports, qualifies o contradicts"],
    disputeTitle: "Bloqueos",
    disputeItems: ["sin locador no hay verificación", "sin evidencia no hay afirmación fuerte", "sin derechos claros no se republica documento externo"],
    nextStep: "Revisar metodología y gates antes de declarar la V1 como pública revisada.",
    sourceIds: ["metodologia-observatorio"],
    issueIds: ["competencias-estado"],
    routeLinks: [
      { label: "Ver metodología", href: "/metodologia#fuentes", description: "Criterios de evidencia, fuentes y revisión." },
      { label: "Ver alcance documental", href: "/metodologia#revision", description: "Disclaimer académico, evidencia y límites." },
      { label: "Ver normativa", href: "/normativa", description: "Instrumentos conectados y estado de revisión." },
    ],
  },
  "cajamarca-system": {
    kicker: "Matriz territorial",
    title: "Sistema Cajamarca",
    summary: "Lee Quilish, Conga, Máxima Acuña y Michiquillay como una red territorial: cada hito conserva documento, controversia, cautela editorial y pregunta de alcance.",
    evidenceTitle: "Hitos estructurados",
    evidenceItems: ["hitos Cajamarca con locador documental", "documentos separados entre fuente canónica y objetivo de búsqueda", "conexiones explícitas entre agua, potestad local, propiedad, beneficios y estado del proyecto"],
    disputeTitle: "Cautelas",
    disputeItems: ["no fusiona Quilish, Conga, Acuña y Michiquillay como un solo caso", "no convierte absolución penal en propiedad civil", "no trata fondo social o pago contractual como impacto territorial verificado"],
    nextStep: "Usar la matriz para abrir cada hito, cerrar objetivos de búsqueda y pasar la lectura documental sin inferencias regionales indebidas.",
    sourceIds: [],
    caseIds: ["conga"],
    issueIds: ["agua-cuencas", "beneficios-territoriales", "competencias-estado"],
    routeLinks: [
      { label: "Ver lectura Cajamarca", href: "/conflictos", description: "Entrada transversal desde la página de conflictos." },
      { label: "Ver Conga", href: "/conflictos/conga", description: "Expediente canónico conectado a la matriz territorial." },
    ],
  },
  "institutional-mechanisms": {
    kicker: "Matriz comparada",
    title: "Mecanismos institucionales",
    summary: "Ordena EIA, PAMA, sentencias, actas, fondos sociales, medidas de protección, reasentamiento y registros como mecanismos documentales comparables.",
    evidenceTitle: "Mecanismos y documentos",
    evidenceItems: ["familias institucionales con documentos primarios", "obligación o decisión separada de cumplimiento", "riesgo editorial y pregunta de alcance por mecanismo"],
    disputeTitle: "Cautelas",
    disputeItems: ["un instrumento aprobado no prueba legitimidad social", "un acuerdo firmado no prueba cumplimiento", "un registro agregado no prueba actividad real en campo"],
    nextStep: "Usar la matriz para leer obligaciones, seguimiento y valor probatorio antes de convertir mecanismos en afirmaciones del observatorio.",
    sourceIds: [],
    caseIds: ["conga", "tia-maria", "las-bambas", "espinar", "madre-de-dios"],
    issueIds: ["dialogo-acuerdos", "fiscalizacion-ambiental", "formalizacion-mape", "beneficios-territoriales"],
    routeLinks: [
      { label: "Ver conflictos", href: "/conflictos", description: "Puerta de lectura por caso y comparativa." },
      { label: "Ver normativa", href: "/normativa", description: "Instrumentos normativos, fuentes y alcance documental." },
    ],
  },
  "trazabilidad-oro": {
    kicker: "Cadena",
    title: "Trazabilidad del oro",
    summary: "Conecta origen declarado, comercialización, controles estatales y fiscalización en Madre de Dios; no sustituye expediente administrativo, fiscal o judicial.",
    evidenceTitle: "Controles de cadena",
    evidenceItems: ["origen y comercialización", "controles estatales", "alertas o posiciones de actores"],
    disputeTitle: "Límite",
    disputeItems: ["no prueba por sí sola actividad ilegal", "no reemplaza expediente judicial", "no generaliza fuera del corte documentado"],
    nextStep: "Leer Madre de Dios y abrir fuentes directas de control/comercialización.",
    sourceIds: ["madre-dios-trazabilidad-minem-2023", "sunat-oro-sin-origen-2025", "minem-recpo-oro-2026", "mpfn-oro-reinfo-recpo-2026"],
    caseIds: ["madre-de-dios"],
    issueIds: ["formalizacion-mape", "fiscalizacion-ambiental"],
    routeLinks: [
      { label: "Ver Madre de Dios", href: "/conflictos/madre-de-dios", description: "Caso profundo de oro, REINFO y trazabilidad." },
      { label: "Ver REINFO / MAPE", href: "/reinfo", description: "Contexto del registro y formalización." },
    ],
  },
};

const focusAliases: Record<string, GraphFocus> = {
  tambogrande: "casos-piloto",
  conga: "casos-piloto",
  "cerro-quilish": "cajamarca-system",
  "yanacocha-maxima-acuna": "cajamarca-system",
  "fondo-social-michiquillay": "cajamarca-system",
  "la-oroya": "institutional-mechanisms",
  "toromocho-morococha": "institutional-mechanisms",
  "cajamarca-system": "cajamarca-system",
  "institutional-mechanisms": "institutional-mechanisms",
  "tia-maria": "casos-piloto",
  "las-bambas": "actores-acuerdos",
  espinar: "evidencia-ambiental",
  "madre-de-dios": "mineria-ilegal-informal",
  "formalizacion-mape": "mineria-ilegal-informal",
  "mineros-mape": "mineria-ilegal-informal",
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

function makeNodes(focus: GraphFocus): Node[] {
  const related = new Set(focusRelations[focus]);
  return graphNodes.map((item) => ({
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
    markerEnd: { type: MarkerType.ArrowClosed, color: colors[tone] },
    style: { stroke: colors[tone], strokeWidth: animated ? 2.1 : 1.45 },
    labelStyle: { fill: "#f5efe5", fontSize: 11, fontFamily: "Source Serif 4 Variable, Georgia, serif" },
    labelBgStyle: { fill: "#061d2b", fillOpacity: 0.94 },
  };
}

const edges: Edge[] = [
  edge("conflicto-solapamiento", "conflicto-social-minero", "solapamiento-territorial", "comparte territorio", "social", true),
  edge("ilegal-solapamiento", "mineria-ilegal-informal", "solapamiento-territorial", "comparte evidencia", "illegal", true),
  edge("conflicto-casos", "conflicto-social-minero", "casos-piloto", "expedientes", "social"),
  edge("conflicto-actores", "conflicto-social-minero", "actores-acuerdos", "actores", "social"),
  edge("conflicto-ambiental", "conflicto-social-minero", "evidencia-ambiental", "sustenta", "evidence"),
  edge("ilegal-reinfo", "mineria-ilegal-informal", "reinfo", "registro", "instrument"),
  edge("ilegal-fiscalizacion", "mineria-ilegal-informal", "fiscalizacion", "control", "control"),
  edge("ilegal-trazabilidad", "mineria-ilegal-informal", "trazabilidad-oro", "cadena", "illegal"),
  edge("actores-reinfo", "actores-acuerdos", "reinfo", "diferencia", "bridge"),
  edge("fiscalizacion-trazabilidad", "trazabilidad-oro", "fiscalizacion", "alerta", "control"),
  edge("ambiental-matriz", "evidencia-ambiental", "matriz-documental", "locador", "evidence"),
  edge("solapamiento-matriz", "solapamiento-territorial", "matriz-documental", "gate", "bridge"),
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

const sourceRightsLabels: Record<Source["rightsStatus"], string> = {
  reusable: "reutilizable",
  "link-only": "solo enlace",
  "permission-required": "requiere permiso",
  unknown: "derechos por confirmar",
};

const sourceEvidenceLabels: Record<Source["evidenceLevel"], string> = {
  primary: "primaria",
  secondary: "secundaria",
  contextual: "contextual",
};

const caseReviewLabels: Record<ConflictCase["reviewStatus"], string> = {
  documentary: "revisión documental",
  "legal-pending": "contraste documental",
  "legal-verified": "contraste documentado",
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

const reviewStatusLabels: Record<EvidenceRecord["reviewStatus"], string> = {
  reviewed: "revisado",
  pending: "pendiente",
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
  const verifiedClaims = item.claims.filter((claim) => claim.verificationStatus === "verified").length;
  return `${item.timeline.length} hitos · ${verifiedClaims}/${item.claims.length} afirmaciones verificadas · ${caseStatusLabels[item.status]} · corte ${formatDate(item.cutoffDate)} · ${caseReviewLabels[item.reviewStatus]}.`;
}

function describeIssue(item: NormativeIssue) {
  return `${issueStatusLabels[item.status]} · ${item.sourceIds.length} fuente(s) enlazada(s).`;
}

function describeActor(item: Actor, data: ObservatoryData) {
  const caseCount = data.cases.filter((entry) => entry.actorIds.includes(item.id)).length;
  return `${actorTypeLabels[item.type]} · presente en ${caseCount} expediente(s) piloto.`;
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

  if (focus === "cajamarca-system") return cajamarcaReferences;
  if (focus === "institutional-mechanisms") return mechanismReferences;
  if (focus === "matriz-documental") return [...cajamarcaReferences, ...mechanismReferences];
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
  latestSocialSnapshot: ObservatoryData["socialConflictSnapshots"][number] | undefined,
  latestMiningSelection: ObservatoryData["miningConflictSelections"][number] | undefined,
  latestReinfoSnapshot: ObservatoryData["reinfoTerritorialSnapshots"][number] | undefined,
  miningMentionStats: { illegal: number; informal: number; overlap: number },
) {
  const socialCut = latestSocialSnapshot ? `Defensoría reporte ${latestSocialSnapshot.reportNumber}, corte ${formatDate(latestSocialSnapshot.cutoffDate)}` : "corte social no disponible";
  const miningCut = latestMiningSelection ? `${formatNumber(latestMiningSelection.totalRegistered)} conflictos mineros seleccionados` : "selección minera no disponible";
  const reinfoCut = latestReinfoSnapshot ? `${formatNumber(latestReinfoSnapshot.totalRegistered)} inscripciones REINFO vigentes al ${formatDate(latestReinfoSnapshot.cutoffDate)}` : "corte REINFO no disponible";

  switch (focus) {
    case "conflicto-social-minero":
      return `${data.cases.length} expedientes piloto enlazados; ${miningCut} dentro de ${formatNumber(latestSocialSnapshot?.totalRegistered)} conflictos sociales del ${socialCut}.`;
    case "mineria-ilegal-informal":
      return `${reinfoCut}. En el mismo corte social: ${miningMentionStats.illegal} casos mencionan minería ilegal, ${miningMentionStats.informal} minería informal y ${miningMentionStats.overlap} ambas categorías.`;
    case "solapamiento-territorial":
      return `Cruce entre ${formatNumber(latestSocialSnapshot?.totalRegistered)} conflictos sociales, ${formatNumber(latestMiningSelection?.totalRegistered)} conflictos mineros, ${reinfoCut} y fuentes técnicas de agua/fiscalización.`;
    case "casos-piloto":
      return `${data.cases.length}/6 expedientes renderizados; ${data.cases.reduce((sum, item) => sum + item.timeline.length, 0)} hitos y ${data.cases.reduce((sum, item) => sum + item.claims.length, 0)} afirmaciones documentadas en datos canónicos.`;
    case "actores-acuerdos":
      return `${data.actors.length} actores canónicos; el foco enlaza Las Bambas, Espinar y Madre de Dios para leer actas, posiciones y cumplimiento sin asumir consenso.`;
    case "reinfo":
      return `${reinfoCut}; fuente oficial MINEM enlazada. La lectura distingue inscripción, permanencia registral, exclusión y formalización concluida.`;
    case "fiscalizacion":
      return `Fuentes OEFA, SERNANP y PCM conectadas; ${data.evidenceRecords.filter((record) => ["oefa-fiscalizacion", "sernanp-operativo-tambopata-2025", "pcm-operativos-mineria-ilegal-2025", "pcm-estrategia-mineria-ilegal-2025"].includes(record.sourceId)).length} registros de evidencia sostienen este foco.`;
    case "evidencia-ambiental":
      return `Conecta Espinar y Conga con fuentes de agua, ambiente y monitoreo; el panel muestra locadores para evitar inferencias causales no formuladas por la fuente.`;
    case "matriz-documental":
      return `${data.evidenceRecords.length} registros de evidencia internos, ${data.cajamarcaSystemMatrix.entries.length} hitos Cajamarca y ${data.institutionalMechanisms.entries.length} mecanismos institucionales en datos canónicos.`;
    case "cajamarca-system": {
      const stats = matrixStats(getMatrixReferences(focus, data));
      return `${data.cajamarcaSystemMatrix.entries.length} hitos territoriales; ${stats.canonical} referencias canónicas y ${stats.targets} objetivos de búsqueda visibles al corte ${formatDate(data.cajamarcaSystemMatrix.cutoffDate)}.`;
    }
    case "institutional-mechanisms": {
      const stats = matrixStats(getMatrixReferences(focus, data));
      const families = uniqueValues(data.institutionalMechanisms.entries.map((entry) => entry.family)).length;
      return `${data.institutionalMechanisms.entries.length} mecanismos en ${families} familias; ${stats.canonical} referencias canónicas y ${stats.targets} objetivos de búsqueda visibles al corte ${formatDate(data.institutionalMechanisms.cutoffDate)}.`;
    }
    case "trazabilidad-oro":
      return `Madre de Dios concentra la lectura de cadena: MINEM, SUNAT, MPFN y controles estatales de origen/comercialización del oro, sin sustituir expedientes judiciales.`;
  }
}

function buildFocusMetrics(
  focus: GraphFocus,
  activeSources: Source[],
  activeCases: ConflictCase[],
  activeIssues: NormativeIssue[],
  activeEvidenceRecords: EvidenceRecord[],
  latestSocialSnapshot: ObservatoryData["socialConflictSnapshots"][number] | undefined,
  latestMiningSelection: ObservatoryData["miningConflictSelections"][number] | undefined,
  latestReinfoSnapshot: ObservatoryData["reinfoTerritorialSnapshots"][number] | undefined,
  miningMentionStats: { illegal: number; informal: number; overlap: number },
  data: ObservatoryData,
) {
  const reviewedEvidence = activeEvidenceRecords.filter((record) => record.reviewStatus === "reviewed").length;
  const base: FocusMetric[] = [
    { label: "Fuentes", value: formatNumber(activeSources.length), note: activeSources.length ? "según filtro activo" : "sin fuentes tras filtro" },
    { label: "Locadores", value: `${formatNumber(reviewedEvidence)}/${formatNumber(activeEvidenceRecords.length)}`, note: "evidencias internas revisadas" },
    { label: "Rutas", value: formatNumber(activeCases.length + activeIssues.length), note: "casos y nudos conectados" },
  ];

  if (focus === "conflicto-social-minero") {
    return [
      { label: "Corte social", value: formatNumber(latestSocialSnapshot?.totalRegistered), note: `reporte ${latestSocialSnapshot?.reportNumber ?? "s/n"} · ${formatDate(latestSocialSnapshot?.cutoffDate)}` },
      { label: "Selección minera", value: formatNumber(latestMiningSelection?.totalRegistered), note: `${formatNumber(latestMiningSelection?.active)} activos · ${formatNumber(latestMiningSelection?.latent)} latentes` },
      { label: "Pilotos V1", value: formatNumber(activeCases.length), note: "expedientes enlazados al foco" },
      ...base,
    ];
  }

  if (focus === "mineria-ilegal-informal") {
    return [
      { label: "REINFO vigente", value: formatNumber(latestReinfoSnapshot?.totalRegistered), note: `corte ${formatDate(latestReinfoSnapshot?.cutoffDate)}` },
      { label: "Mención ilegal", value: formatNumber(miningMentionStats.illegal), note: "casos del corte social" },
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
      { label: "Hitos", value: formatNumber(data.cajamarcaSystemMatrix.entries.length), note: "matriz territorial canónica" },
      { label: "Fuentes canónicas", value: formatNumber(stats.sourceIds.length), note: `${formatNumber(stats.canonical)} referencias con fuente` },
      { label: "Objetivos", value: formatNumber(stats.targets), note: "documentos por cerrar" },
      ...base,
    ];
  }

  if (focus === "institutional-mechanisms") {
    const stats = matrixStats(getMatrixReferences(focus, data));
    return [
      { label: "Mecanismos", value: formatNumber(data.institutionalMechanisms.entries.length), note: "matriz institucional canónica" },
      { label: "Familias", value: formatNumber(uniqueValues(data.institutionalMechanisms.entries.map((entry) => entry.family)).length), note: "tipos de mecanismo" },
      { label: "Objetivos", value: formatNumber(stats.targets), note: `${formatNumber(stats.sourceIds.length)} fuentes canónicas únicas` },
      ...base,
    ];
  }

  if (focus === "matriz-documental") {
    const stats = matrixStats(getMatrixReferences(focus, data));
    return [
      { label: "Evidencia interna", value: formatNumber(data.evidenceRecords.length), note: "registros EvidenceRecord" },
      { label: "Matrices", value: "2", note: "Cajamarca y mecanismos" },
      { label: "Objetivos", value: formatNumber(stats.targets), note: "sin tratarlos como verificados" },
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
  const [citationOpen, setCitationOpen] = useState(false);

  const sourceById = useMemo(() => new Map(data.sources.map((source) => [source.id, source])), [data.sources]);
  const caseById = useMemo(() => new Map(data.cases.map((item) => [item.id, item])), [data.cases]);
  const issueById = useMemo(() => new Map(data.issues.map((item) => [item.id, item])), [data.issues]);
  const actorById = useMemo(() => new Map(data.actors.map((item) => [item.id, item])), [data.actors]);
  const latestSocialSnapshot = useMemo(() => [...data.socialConflictSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0], [data.socialConflictSnapshots]);
  const latestReinfoSnapshot = useMemo(() => [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0], [data.reinfoTerritorialSnapshots]);
  const latestMiningSelection = useMemo(() => [...data.miningConflictSelections].sort((a, b) => b.title.localeCompare(a.title))[0], [data.miningConflictSelections]);
  const miningMentionStats = useMemo(() => {
    const illegal = data.socialConflictCases.filter((item) => mentionsMiningCategory(item, "ilegal"));
    const informal = data.socialConflictCases.filter((item) => mentionsMiningCategory(item, "informal"));
    const overlap = data.socialConflictCases.filter((item) => mentionsMiningCategory(item, "ilegal") && mentionsMiningCategory(item, "informal"));
    return { illegal: illegal.length, informal: informal.length, overlap: overlap.length };
  }, [data.socialConflictCases]);

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
  const activeDataSummary = buildDataSummary(focus, data, latestSocialSnapshot, latestMiningSelection, latestReinfoSnapshot, miningMentionStats);
  const activeMetrics = buildFocusMetrics(focus, activeSources, activeCases, activeIssues, activeEvidenceRecords, latestSocialSnapshot, latestMiningSelection, latestReinfoSnapshot, miningMentionStats, data);
  const activeEvidenceCopy = activeEvidenceRecords.length
    ? `${activeEvidenceRecords.filter((record) => record.reviewStatus === "reviewed").length}/${activeEvidenceRecords.length} registros de evidencia revisados; se muestran locadores debajo.`
    : `${activeSources.length} fuente(s) enlazada(s); sin registros de evidencia internos para este foco.`;
  const activeDisputeCopy = activeActors.length
    ? `${activeActors.length} actor(es) conectado(s): ${activeActors.map((actor) => actor.name).join(", ")}.`
    : "Límites de lectura que deben quedar visibles antes de cerrar una afirmación.";

  const results = useMemo<ResultItem[]>(() => [
    {
      id: "conflicto-social-minero",
      label: "Conflicto social minero",
      subtitle: `${data.cases.length} expedientes piloto · ${latestMiningSelection?.totalRegistered ?? 0} conflictos mineros registrados`,
      type: "route",
      focus: "conflicto-social-minero" as GraphFocus,
      href: "/conflictos",
      count: data.cases.length,
    },
    {
      id: "mineria-ilegal-informal",
      label: "Minería ilegal e informal",
      subtitle: `REINFO / MAPE · ${latestReinfoSnapshot?.totalRegistered.toLocaleString("es-PE") ?? "s/d"} registros vigentes`,
      type: "route",
      focus: "mineria-ilegal-informal" as GraphFocus,
      href: "/reinfo",
      count: latestReinfoSnapshot?.totalRegistered ?? 0,
    },
    {
      id: "solapamiento-territorial",
      label: "Puentes y solapamientos",
      subtitle: "Territorio, ambiente, gobernanza y evidencia",
      type: "route",
      focus: "solapamiento-territorial" as GraphFocus,
      href: "/mapa",
      count: data.issues.length,
    },
    {
      id: "matriz-documental",
      label: "Evidencia y revisión",
      subtitle: "Fuentes directas, locadores y gates V1",
      type: "route",
      focus: "matriz-documental" as GraphFocus,
      href: "/metodologia#fuentes",
      count: data.evidenceRecords.length,
    },
    {
      id: "cajamarca-system",
      label: "Sistema Cajamarca",
      subtitle: `${data.cajamarcaSystemMatrix.entries.length} hitos · lectura territorial estructurada`,
      type: "matrix",
      focus: "cajamarca-system" as GraphFocus,
      href: "/conflictos",
      count: data.cajamarcaSystemMatrix.entries.length,
    },
    {
      id: "institutional-mechanisms",
      label: "Mecanismos institucionales",
      subtitle: `${data.institutionalMechanisms.entries.length} mecanismos · obligaciones, seguimiento y cautelas`,
      type: "matrix",
      focus: "institutional-mechanisms" as GraphFocus,
      href: "/conflictos",
      count: data.institutionalMechanisms.entries.length,
    },
    ...data.cajamarcaSystemMatrix.entries.map((item) => ({
      id: item.id,
      label: item.hito,
      subtitle: `Sistema Cajamarca · ${item.primaryDocuments.length} documento(s)`,
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
    ...data.cases.map((item) => ({
      id: item.id,
      label: item.name,
      subtitle: "Expediente territorial",
      type: "case",
      focus: getGraphFocus(item.id),
      href: `/conflictos/${item.slug}`,
      count: item.claims.length + item.timeline.length,
    })),
    ...data.issues.map((item) => ({
      id: item.id,
      label: item.name,
      subtitle: "Nudo normativo",
      type: "issue",
      focus: getGraphFocus(item.id),
      href: `/normativa#${item.id}`,
      count: item.sourceIds.length,
    })),
    ...data.instruments.map((item) => ({
      id: item.id,
      label: item.number,
      subtitle: item.title,
      type: "instrument",
      focus: getGraphFocus(item.id),
      href: "/normativa",
      count: item.sourceIds.length,
    })),
    ...data.alternatives.map((item) => ({
      id: item.id,
      label: item.title,
      subtitle: "Alternativa de política",
      type: "alternative",
      focus: getGraphFocus(item.id),
      href: "/metodologia#principios",
      count: item.sourceIds.length,
    })),
    ...data.actors.map((item) => ({
      id: item.id,
      label: item.name,
      subtitle: "Actor relacionado",
      type: "actor",
      focus: getGraphFocus(item.id),
      count: data.cases.filter((entry) => entry.actorIds.includes(item.id)).length,
    })),
  ].filter((item) => {
    const matchesText = `${item.label} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = entityType === "all" || item.type === entityType;
    const matchesIssue = issue === "all" || item.id.includes(issue) || data.cases.find((entry) => entry.id === item.id)?.issueIds.includes(issue);
    return matchesText && matchesType && matchesIssue;
  }).sort((a, b) => {
    const priority = ["conflicto-social-minero", "mineria-ilegal-informal", "solapamiento-territorial", "matriz-documental", "cajamarca-system", "institutional-mechanisms", "madre-de-dios", "formalizacion-mape"];
    const aRank = priority.indexOf(a.id);
    const bRank = priority.indexOf(b.id);
    return (aRank === -1 ? 999 : aRank) - (bRank === -1 ? 999 : bRank);
  }), [data, entityType, issue, latestMiningSelection, latestReinfoSnapshot, query]);

  const reset = () => {
    setQuery("");
    setEntityType("all");
    setIssue("all");
    setSourceType("all");
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
            <option value="matrix">Matrices</option>
            <option value="case">Casos</option>
            <option value="issue">Nudos</option>
            <option value="instrument">Normas</option>
            <option value="alternative">Alternativas</option>
            <option value="actor">Actores</option>
          </select>
        </label>
        <label>
          <span>Tema</span>
          <select value={issue} onChange={(event) => setIssue(event.target.value)}>
            <option value="all">Todos</option>
            {data.issues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
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
          <div className="pane-heading"><p>Dossier / índice</p><span>{results.length} resultados</span></div>
          <div className="guided-reading" aria-label="Rutas de lectura sugeridas">
            <p>Rutas de lectura</p>
            <button className={focus === "conflicto-social-minero" ? "active" : ""} onClick={() => setFocus("conflicto-social-minero")}><MapPin size={15} /> Conflicto social minero</button>
            <button className={focus === "mineria-ilegal-informal" ? "active" : ""} onClick={() => setFocus("mineria-ilegal-informal")}><WarningCircle size={15} /> Minería ilegal e informal</button>
            <button className={focus === "solapamiento-territorial" ? "active" : ""} onClick={() => setFocus("solapamiento-territorial")}><Network size={15} /> Puentes y solapamientos</button>
            <button className={focus === "matriz-documental" ? "active" : ""} onClick={() => setFocus("matriz-documental")}><TreeStructure size={15} /> Evidencia y revisión</button>
            <button className={focus === "cajamarca-system" ? "active" : ""} onClick={() => setFocus("cajamarca-system")}><TreeStructure size={15} /> Sistema Cajamarca</button>
            <button className={focus === "institutional-mechanisms" ? "active" : ""} onClick={() => setFocus("institutional-mechanisms")}><Gavel size={15} /> Mecanismos</button>
          </div>
          <div className="result-list">
            {results.slice(0, 10).map((item) => (
              <div key={item.id} className={focus === item.focus ? "result-row active" : "result-row"}>
                <button className="result-row-main" onClick={() => setFocus(item.focus)}>
                  <span className="result-icon">{item.type === "case" ? <MapPin /> : item.type === "instrument" ? <BookOpenText /> : item.type === "alternative" ? <Scales /> : item.type === "actor" ? <Buildings /> : item.type === "matrix" ? <TreeStructure /> : <CirclesThreePlus />}</span>
                  <span><strong>{item.label}</strong><small>{item.subtitle}</small></span>
                  <em>{item.count.toLocaleString("es-PE")}<small> vínculos</small></em>
                </button>
                {item.href && <InlineLink href={item.href} label="Abrir" />}
              </div>
            ))}
            {!results.length && <p className="empty-state">No hay coincidencias. Prueba retirando un filtro.</p>}
          </div>
          <div className="case-links">
            <p>Casos piloto</p>
            {data.cases.map((item) => <Link key={item.id} href={`/conflictos/${item.slug}`}><MapPin size={14} />{item.name}</Link>)}
          </div>
        </aside>
        <section className="graph-pane" aria-label="Relaciones de conocimiento">
          <div className="graph-title">
            <p>{activeDetail.kicker}</p>
            <h1>{activeDetail.title}</h1>
            <span><i className="dot warning" /> alcance documental <i className="dot official" /> vínculo a fuente</span>
          </div>
          <div className="graph-layers" aria-label="Leyenda de capas del sistema">
            <span><i data-tone="social" /> conflicto</span>
            <span><i data-tone="illegal" /> ilegal / informal</span>
            <span><i data-tone="bridge" /> puente</span>
            <span><i data-tone="instrument" /> instrumento</span>
            <span><i data-tone="control" /> control</span>
            <span><i data-tone="evidence" /> evidencia</span>
          </div>
          <div className="graph-principle">
            <TreeStructure size={16} aria-hidden />
            <span>Las líneas muestran relación documental; no prueban causalidad automática ni equivalencia administrativa.</span>
          </div>
          <ReactFlow nodes={makeNodes(focus)} edges={edges} fitView fitViewOptions={{ padding: 0.08 }} minZoom={0.36} maxZoom={1.18} nodesDraggable={false} onNodeClick={(_, node) => setFocus(node.id as GraphFocus)} proOptions={{ hideAttribution: true }}>
            <Background color="#1b536b" gap={30} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </section>
        <aside className="evidence-pane" aria-label="Inspector de evidencia">
          <div className="pane-heading"><p>Inspector de evidencia</p><strong>{activeDetail.title}</strong></div>
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
              <span>{activeDetail.routeLinks.length + activeCases.length + activeIssues.length} rutas</span>
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
                <p>Locadores de evidencia</p>
                <span>{activeEvidenceRecords.length} registro(s)</span>
              </div>
              {activeEvidenceRecords.slice(0, 4).map((record) => (
                <article key={record.id}>
                  <strong>{relationLabels[record.relation]} · {record.locator}</strong>
                  <span>{record.summary}</span>
                  <small>{reviewStatusLabels[record.reviewStatus]} · comprobado {formatDate(record.checkedAt)}</small>
                </article>
              ))}
            </section>
          )}
          {activeMatrixDocuments.length > 0 && (
            <section className="locator-group">
              <div className="link-group-title">
                <p>Locadores de matriz canónica</p>
                <span>{activeMatrixDocuments.length} referencia(s)</span>
              </div>
              {activeMatrixDocuments.slice(0, 6).map((record) => (
                <article key={`${record.owner}-${record.sourceId}-${record.locator}`}>
                  <strong>{record.status === "canonical-source" ? "Fuente canónica" : "Objetivo de búsqueda"} · {record.locator}</strong>
                  <span>{record.label}</span>
                  <small>{record.owner} · {record.sourceId}</small>
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
                <small>{sourceTypeLabels[source.type]} · evidencia {sourceEvidenceLabels[source.evidenceLevel]} · {formatDate(source.date)} · {sourceRightsLabels[source.rightsStatus]}</small>
                <ArrowSquareOut size={14} aria-hidden />
              </a>
            )) : <p className="empty-state">El filtro de tipo de fuente no devuelve fuentes para este foco. Retira el filtro o abre otro nodo.</p>}
          </section>
          <div className="evidence-level">
            <span>Estado de revisión del foco</span>
            <strong><WarningCircle size={16} aria-hidden /><i /> Parcial</strong>
            <p>{activeDetail.nextStep}</p>
          </div>
        </aside>
      </div>
      <section className="compact-timeline" aria-label="Línea de tiempo del REINFO">
        <p>Línea de tiempo REINFO</p>
        {[1992, 2002, 2009, 2012, 2017, 2020, 2026].map((year, index) => <div key={year} className={year === 2017 ? "active" : ""}><i /><strong>{year}</strong><span>{["Ley minería", "Formalización", "Reformas", "Nueva etapa", "REINFO", "Adecuaciones", "Corte"][index]}</span></div>)}
      </section>
      {citationOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCitationOpen(false)}><section className="citation-dialog" role="dialog" aria-modal="true" aria-labelledby="citation-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setCitationOpen(false)} aria-label="Cerrar"><X /></button><p className="eyebrow">Cita sugerida</p><h2 id="citation-title">Sistema de relaciones: conflictos mineros, minería ilegal e informal</h2><blockquote>Observatorio de Conflictos Mineros del Perú (2026). “Sistema de relaciones: dos problemas raíz”. Fecha de consulta: {new Date().toLocaleDateString("es-PE")}.</blockquote><p>Incluye siempre la fecha de corte porque los estados administrativos, normativos y territoriales pueden cambiar.</p></section></div>}
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
