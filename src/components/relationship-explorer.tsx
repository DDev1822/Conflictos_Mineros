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
    subtitle: "Territorio, agua, acuerdos y cumplimiento documentado",
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
    subtitle: "Ilegalidad, informalidad, MAPE, fiscalización y trazabilidad",
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
    subtitle: "Cruza evidencia, gobernanza y presión institucional",
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
    subtitle: "Cronologías, actores y fuentes por caso",
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
    title: "Actores y actas",
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
    layer: "Eje documental",
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
    subtitle: "Supervisión y control documental",
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
    layer: "Evidencia",
    tone: "evidence",
    role: "node",
    icon: BookOpenText,
    position: { x: 84, y: graphRowY.evidence },
    width: 220,
    height: 100,
  },
  {
    id: "matriz-documental",
    title: "Sustento documental",
    subtitle: "Fuentes directas y referencias precisas",
    layer: "Evidencia",
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
    title: "Trazabilidad del oro",
    subtitle: "Origen y controles de cadena",
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
    kicker: "Relaciones del conflicto",
    title: "Conflicto social minero",
    summary: "Relaciona los conflictos sociales mineros con territorio, agua, acuerdos, actores y fuentes. El punto de partida cuantitativo es el corte de la Defensoría del Pueblo.",
    evidenceTitle: "Información disponible",
    evidenceItems: ["corte nacional de conflictos sociales mineros", "casos desarrollados con cronología y fuentes", "temas de agua, participación, beneficios y acuerdos"],
    disputeTitle: "Límites de interpretación",
    disputeItems: ["conflicto social no equivale a protesta aislada", "causalidad ambiental solo si una fuente técnica la formula", "desacuerdos y estados abiertos permanecen atribuidos"],
    nextStep: "Abrir cada caso y su cronología antes de formular interpretaciones; los hitos enlazan la fuente y su ubicación exacta cuando está disponible.",
    sourceIds: ["defensoria-conflictos", "defensoria-acuerdos-187", "defensoria-conflictos-hidricos"],
    caseIds: allCaseIds,
    issueIds: ["agua-cuencas", "dialogo-acuerdos", "beneficios-territoriales", "consulta-participacion"],
    routeLinks: [
      { label: "Ver catálogo de casos", href: "/conflictos", description: "Casos sociales mineros con cronología y fuentes." },
      { label: "Ver cronología comparada", href: "/cronologia", description: "Hitos documentados por caso." },
      { label: "Ver mapa territorial", href: "/mapa", description: "Capa espacial de conflictos y registros territoriales." },
    ],
  },
  "mineria-ilegal-informal": {
    kicker: "Ventana B",
    title: "Minería ilegal e informal",
    summary: "Separa menciones de minería ilegal, minería informal, MAPE, REINFO, fiscalización y trazabilidad; el solapamiento textual no se convierte en determinación individual.",
    evidenceTitle: "Cortes conectados",
    evidenceItems: ["menciones explícitas de minería ilegal e informal en el corte social minero", "REINFO vigente como registro administrativo", "controles de origen y comercialización del oro"],
    disputeTitle: "Límites probatorios",
    disputeItems: ["informalidad e ilegalidad no son equivalentes", "inscripción REINFO no acredita formalización concluida", "Madre de Dios es caso profundo, no plantilla nacional"],
    nextStep: "Contrastar REINFO/MAPE con fiscalización, trazabilidad y fuentes territoriales antes de formular una conclusión pública.",
    sourceIds: ["minem-reinfo", "minem-reinfo-vigente-corte-2026-06-18", "minem-rd-0004-2025-reinfo-exclusiones", "minem-comunicado-reinfo-2025"],
    issueIds: ["formalizacion-mape", "competencias-estado"],
    actorIds: ["mineros-mape", "minem", "gobiernos-subnacionales"],
    routeLinks: [
      { label: "Abrir REINFO / MAPE", href: "/reinfo", description: "Registro y proceso de formalización." },
      { label: "Ver Madre de Dios", href: "/madre-de-dios", description: "Análisis territorial para diferenciar deforestación minera, REINFO, ilegalidad y trazabilidad." },
      { label: "Ver cadena del oro", href: "/oro-ilegal", description: "Extracción, acopio, procesamiento, comercialización y controles." },
      { label: "Ver nudo normativo", href: "/normativa#formalizacion-mape", description: "Formalización de la MAPE y REINFO." },
    ],
  },
  "solapamiento-territorial": {
    kicker: "Puente analítico",
    title: "Solapamiento territorial",
    summary: "Relaciona territorio, información ambiental, gobernanza y capacidad estatal. La proximidad o coincidencia territorial no demuestra por sí sola una relación causal.",
    evidenceTitle: "Cruces documentados",
    evidenceItems: ["mapa y registro regional", "fuentes ambientales y de agua", "competencias estatales concurrentes"],
    disputeTitle: "Límites de interpretación",
    disputeItems: ["el cruce territorial no fusiona categorías administrativas", "la evidencia técnica requiere alcance, fecha y entidad", "los conflictos pueden permanecer abiertos"],
    nextStep: "Usar el mapa para observar la distribución territorial y luego abrir el caso o la fuente correspondiente.",
    sourceIds: ["ana-agua", "oefa-fiscalizacion", "defensoria-conflictos"],
    caseIds: ["espinar", "las-bambas"],
    issueIds: ["competencias-estado", "agua-cuencas", "fiscalizacion-ambiental"],
    routeLinks: [
      { label: "Ver mapa completo", href: "/mapa", description: "Distribución regional de conflictos sociales mineros y casos documentados." },
      { label: "Ver metodología", href: "/metodologia#principios", description: "Separación entre hecho, interpretación y propuesta." },
    ],
  },
  "casos-hito": {
    kicker: "Casos documentados",
    title: "Casos hito",
    summary: "Cada caso presenta su cronología, actores, afirmaciones documentadas, fuentes y estado a la fecha de corte.",
    evidenceTitle: "Casos enlazados",
    evidenceItems: ["casos sociales mineros desarrollados", "cronología documentada por caso", "afirmaciones diferenciadas entre hechos e interpretación"],
    disputeTitle: "Criterios de lectura",
    disputeItems: ["los hitos relevantes remiten a fuentes directas", "la página o sección exacta permite contrastar la información", "el estado al corte evita generalizaciones posteriores"],
    nextStep: "Abrir cada caso y revisar primero su cronología documentada.",
    sourceIds: ["metodologia-observatorio", "defensoria-conflictos"],
    caseIds: allCaseIds,
    routeLinks: [
      { label: "Ver todos los casos", href: "/conflictos", description: "Catálogo de conflictos sociales mineros desarrollados." },
      { label: "Ver cronología", href: "/cronologia", description: "Hitos comparados entre casos." },
    ],
  },
  "actores-acuerdos": {
    kicker: "Relación",
    title: "Actores y actas",
    summary: "Relaciona comunidades, entidades del Estado, empresas, organizaciones, actas y acuerdos por caso. Los comunicados expresan la posición de quien los emite y no demuestran por sí solos el cumplimiento.",
    evidenceTitle: "Actores y documentos",
    evidenceItems: ["actores vinculados con cada caso", "actas, acuerdos y compromisos", "posiciones directas de las partes involucradas"],
    disputeTitle: "Contradicciones abiertas",
    disputeItems: ["no homogeneizar comunidades", "no tomar comunicado corporativo como verificación", "no ocultar contradicciones abiertas"],
    nextStep: "Abrir los casos y contrastar actores con fuentes directas disponibles.",
    sourceIds: ["defensoria-acuerdos-187", "las-bambas-actas-2025"],
    caseIds: ["las-bambas", "espinar"],
    actorIds: ["comunidades-cotabambas", "comunidades-espinar", "minem"],
    routeLinks: [
      { label: "Ver Las Bambas", href: "/conflictos/las-bambas", description: "Actas, acuerdos y corredor minero." },
      { label: "Ver Espinar", href: "/conflictos/espinar", description: "Salud ambiental, acuerdos y actores." },
    ],
  },
  reinfo: {
    kicker: "Eje documental independiente",
    title: "REINFO",
    summary: "Registro administrativo del proceso de formalización MAPE. Se presenta separado de los conflictos sociales mineros y no acredita formalización concluida por sí solo.",
    evidenceTitle: "Corte registral",
    evidenceItems: ["registro vigente y fecha de corte", "exclusiones y comunicados aplicables", "diferencia entre inscripción y formalización concluida"],
    disputeTitle: "Límite documental",
    disputeItems: ["no equivale automáticamente a formalidad", "no borra categorías de ilegalidad o informalidad", "requiere fuente y alcance para afirmaciones públicas"],
    nextStep: "Abrir REINFO/MAPE y consultar la fuente oficial del registro con fecha de corte.",
    sourceIds: ["minem-reinfo", "minem-reinfo-vigente-corte-2026-06-18", "minem-rd-0004-2025-reinfo-exclusiones", "minem-comunicado-reinfo-2025"],
    issueIds: ["formalizacion-mape"],
    routeLinks: [
      { label: "Abrir REINFO / MAPE", href: "/reinfo", description: "Registro administrativo y formalización." },
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
      { label: "Ver Madre de Dios", href: "/madre-de-dios", description: "Operativos, REINFO y control territorial." },
    ],
  },
  "evidencia-ambiental": {
    kicker: "Evidencia",
    title: "Monitoreo ambiental",
    summary: "Reúne información técnica vinculada con Espinar, Conga y controversias sobre agua o fiscalización. Cada lectura conserva alcance, entidad emisora y fecha.",
    evidenceTitle: "Fuentes técnicas",
    evidenceItems: ["monitoreos e informes", "fuentes de agua y ambiente", "alcance territorial y temporal"],
    disputeTitle: "Límites de interpretación",
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
    kicker: "Sustento documental",
    title: "Cómo se sustenta la información",
    summary: "Las afirmaciones y los hitos enlazan fuentes directas y, cuando es posible, la página, sección, tabla o artículo donde aparece la información.",
    evidenceTitle: "Referencias utilizadas",
    evidenceItems: ["fuente directa", "página, sección, tabla o artículo", "indicación de si la fuente sustenta, matiza o contradice una afirmación"],
    disputeTitle: "Criterios de lectura",
    disputeItems: ["la referencia precisa facilita el contraste", "las afirmaciones relevantes requieren respaldo directo", "el uso de cada fuente respeta sus condiciones de acceso y cita"],
    nextStep: "Consultar la metodología para conocer cómo se seleccionan, contrastan y presentan las fuentes.",
    sourceIds: ["metodologia-observatorio"],
    issueIds: ["competencias-estado"],
    routeLinks: [
      { label: "Ver metodología", href: "/metodologia#fuentes", description: "Criterios de evidencia, fuentes y comprobación." },
      { label: "Ver límites probatorios", href: "/metodologia#revision", description: "Límites académicos, evidencia y contraste." },
      { label: "Ver normativa", href: "/normativa", description: "Instrumentos conectados y preguntas de aplicación." },
    ],
  },
  "cajamarca-system": {
    kicker: "Lectura territorial",
    title: "Conflictos mineros en Cajamarca",
    summary: "Lee Quilish, Conga, Máxima Acuña y Michiquillay como una red territorial: cada hito conserva documento, controversia, límite probatorio y pregunta de fondo.",
    evidenceTitle: "Hitos estructurados",
    evidenceItems: ["hitos de Cajamarca con referencias precisas", "fuentes incorporadas a cada caso", "relaciones entre agua, potestad local, propiedad, beneficios y estado del proyecto"],
    disputeTitle: "Límites de interpretación",
    disputeItems: ["no fusiona Quilish, Conga, Acuña y Michiquillay como un solo caso", "no convierte absolución penal en propiedad civil", "no trata fondo social o pago contractual como impacto territorial verificado"],
    nextStep: "Abrir cada caso y contrastar sus fuentes sin tratar los conflictos de Cajamarca como una única historia o causalidad regional.",
    sourceIds: [],
    caseIds: ["conga"],
    issueIds: ["agua-cuencas", "beneficios-territoriales", "competencias-estado"],
    routeLinks: [
      { label: "Ver casos de Cajamarca", href: "/conflictos", description: "Entrada comparada desde los casos documentados." },
      { label: "Ver Conga", href: "/conflictos/conga", description: "Caso vinculado con la lectura territorial de Cajamarca." },
    ],
  },
  "institutional-mechanisms": {
    kicker: "Comparación transversal",
    title: "Mecanismos institucionales",
    summary: "Ordena EIA, PAMA, sentencias, actas, fondos sociales, medidas de protección, reasentamiento y registros como mecanismos documentales comparables.",
    evidenceTitle: "Mecanismos y documentos",
    evidenceItems: ["familias institucionales con documentos primarios", "obligación o decisión separada de cumplimiento", "límite probatorio y pregunta de fondo por mecanismo"],
    disputeTitle: "Límites de interpretación",
    disputeItems: ["un instrumento aprobado no prueba legitimidad social", "un acuerdo firmado no prueba cumplimiento", "un registro documental no prueba por sí solo resultados en campo"],
    nextStep: "Comparar obligaciones, seguimiento y resultados documentados sin asumir que la existencia de un instrumento demuestra su cumplimiento.",
    sourceIds: [],
    caseIds: ["conga", "tia-maria", "las-bambas", "espinar", "la-oroya", "toromocho-morococha"],
    issueIds: ["dialogo-acuerdos", "fiscalizacion-ambiental", "beneficios-territoriales"],
    routeLinks: [
      { label: "Ver conflictos", href: "/conflictos", description: "Comparación por caso y mecanismo." },
      { label: "Ver normativa", href: "/normativa", description: "Instrumentos normativos, fuentes y preguntas de aplicación." },
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
    issueIds: ["formalizacion-mape", "fiscalizacion-ambiental"],
    routeLinks: [
      { label: "Ver Madre de Dios", href: "/madre-de-dios", description: "Análisis territorial de oro, REINFO y deforestación minera." },
      { label: "Abrir cadena del oro", href: "/oro-ilegal", description: "Trazabilidad, comercialización y controles de origen." },
      { label: "Ver REINFO / MAPE", href: "/reinfo", description: "Contexto del registro y formalización." },
    ],
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
    markerEnd: { type: MarkerType.ArrowClosed, color: colors[tone] },
    style: { stroke: colors[tone], strokeWidth: animated ? 2.1 : 1.45 },
    labelStyle: { fill: "#f5efe5", fontSize: 11, fontFamily: "Source Serif 4 Variable, Georgia, serif" },
    labelBgStyle: { fill: "#061d2b", fillOpacity: 0.94 },
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
  latestSocialSnapshot: ObservatoryData["socialConflictSnapshots"][number] | undefined,
  latestMiningSelection: ObservatoryData["miningConflictSelections"][number] | undefined,
  latestReinfoSnapshot: ObservatoryData["reinfoTerritorialSnapshots"][number] | undefined,
  miningMentionStats: { illegal: number; informal: number; overlap: number },
) {
  const socialMiningCases = data.cases.filter(isPublishedSocialMiningCase);
  const miningSource = latestSocialSnapshot ? `reporte ${latestSocialSnapshot.reportNumber} de la Defensoría del Pueblo, corte ${formatDate(latestSocialSnapshot.cutoffDate)}` : "corte minero no disponible";
  const miningCut = latestMiningSelection ? `${formatNumber(latestMiningSelection.totalRegistered)} conflictos sociales mineros` : "corte minero no disponible";
  const reinfoCut = latestReinfoSnapshot ? `${formatNumber(latestReinfoSnapshot.totalRegistered)} inscripciones REINFO vigentes al ${formatDate(latestReinfoSnapshot.cutoffDate)}` : "corte REINFO no disponible";

  switch (focus) {
    case "conflicto-social-minero":
      return `${miningCut} del ${miningSource}; ${socialMiningCases.length} casos desarrollados con cronología y fuentes.`;
    case "mineria-ilegal-informal":
      return `${reinfoCut}. En el corte social minero: ${miningMentionStats.illegal} casos mencionan minería ilegal, ${miningMentionStats.informal} minería informal y ${miningMentionStats.overlap} ambas categorías.`;
    case "solapamiento-territorial":
      return `Cruce entre ${formatNumber(latestMiningSelection?.totalRegistered)} conflictos sociales mineros y fuentes técnicas de agua, ambiente y fiscalización.`;
    case "casos-hito":
      return `${socialMiningCases.reduce((sum, item) => sum + item.timeline.length, 0)} hitos y ${socialMiningCases.reduce((sum, item) => sum + item.claims.length, 0)} afirmaciones documentadas en ${socialMiningCases.length} casos sociales mineros.`;
    case "actores-acuerdos":
      return `Comunidades, entidades públicas, empresas y organizaciones vinculadas con Las Bambas y Espinar para leer actas, posiciones y seguimiento sin asumir consenso.`;
    case "reinfo":
      return `${reinfoCut}; fuente oficial MINEM enlazada. El contraste distingue inscripción, permanencia registral, exclusión y formalización concluida.`;
    case "fiscalizacion":
      return `Fuentes OEFA, SERNANP y PCM conectadas; ${data.evidenceRecords.filter((record) => ["oefa-fiscalizacion", "sernanp-operativo-tambopata-2025", "pcm-operativos-mineria-ilegal-2025", "pcm-estrategia-mineria-ilegal-2025"].includes(record.sourceId)).length} registros de evidencia sostienen este foco.`;
    case "evidencia-ambiental":
      return `Conecta Espinar y Conga con fuentes de agua, ambiente y monitoreo; las referencias precisas permiten distinguir lo documentado de las interpretaciones.`;
    case "matriz-documental":
      return `${data.evidenceRecords.length} referencias documentales, ${data.cajamarcaSystemMatrix.entries.length} hitos de Cajamarca y ${data.institutionalMechanisms.entries.length} mecanismos institucionales relacionados.`;
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
      return `Madre de Dios concentra la cadena: MINEM, SUNAT, MPFN y controles estatales de origen/comercialización del oro, sin sustituir expedientes judiciales.`;
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
  const base: FocusMetric[] = [
    { label: "Fuentes", value: formatNumber(activeSources.length), note: activeSources.length ? "según filtro activo" : "el filtro no devuelve fuentes" },
    ...(activeEvidenceRecords.length ? [{ label: "Referencias precisas", value: formatNumber(activeEvidenceRecords.length), note: "página o sección cuando está disponible" }] : []),
    { label: "Conexiones", value: formatNumber(activeCases.length + activeIssues.length), note: "casos y temas relacionados" },
  ];

  if (focus === "conflicto-social-minero") {
    return [
      { label: "Corte minero", value: formatNumber(latestMiningSelection?.totalRegistered), note: `reporte ${latestSocialSnapshot?.reportNumber ?? "s/n"} · ${formatDate(latestSocialSnapshot?.cutoffDate)}` },
      { label: "Estado", value: `${formatNumber(latestMiningSelection?.active)}/${formatNumber(latestMiningSelection?.latent)}`, note: "activos / latentes" },
      { label: "Casos desarrollados", value: formatNumber(activeCases.length), note: "con cronología y fuentes" },
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
  const activeDataSummary = buildDataSummary(focus, data, latestSocialSnapshot, latestMiningSelection, latestReinfoSnapshot, miningMentionStats);
  const activeMetrics = buildFocusMetrics(focus, activeSources, activeCases, activeIssues, activeEvidenceRecords, latestSocialSnapshot, latestMiningSelection, latestReinfoSnapshot, miningMentionStats, data);
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
      subtitle: `${latestMiningSelection?.totalRegistered ?? 0} conflictos sociales mineros · casos con cronología y fuentes`,
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
      subtitle: "Deforestación minera, Tambopata, formalización y límites de la evidencia territorial",
      type: "route",
      focus: "mineria-ilegal-informal" as GraphFocus,
      href: "/madre-de-dios",
      count: data.madreDiosDevastation.sourceIds.length,
    },
    {
      id: "trazabilidad-oro",
      label: "Trazabilidad del oro",
      subtitle: "Origen, acopio, procesamiento, comercialización y controles estatales",
      type: "route",
      focus: "trazabilidad-oro" as GraphFocus,
      href: "/oro-ilegal",
      count: focusDetails["trazabilidad-oro"].sourceIds.length,
    },
    {
      id: "solapamiento-territorial",
      label: "Puentes y solapamientos",
      subtitle: "Territorio, ambiente, gobernanza y evidencia",
      type: "route",
      focus: "solapamiento-territorial" as GraphFocus,
      href: "/mapa",
      count: publicIssues.length,
    },
    {
      id: "matriz-documental",
      label: "Sustento documental",
      subtitle: "Fuentes directas, referencias precisas y criterios de lectura",
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
      subtitle: `${data.institutionalMechanisms.entries.length} mecanismos · obligaciones, seguimiento y alcance documental`,
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
  }), [data, entityType, issue, latestMiningSelection, latestReinfoSnapshot, miningMentionStats, publicActors, publicAlternatives, publicCases, publicInstruments, publicIssues, query]);

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
            <span><i className="dot warning" /> precaución de lectura <i className="dot official" /> vínculo a fuente</span>
          </div>
          <div className="graph-layers" aria-label="Leyenda de capas del sistema">
            <span><i data-tone="social" /> conflicto</span>
            <span><i data-tone="bridge" /> puente</span>
            <span><i data-tone="instrument" /> instrumento</span>
            <span><i data-tone="control" /> control</span>
            <span><i data-tone="evidence" /> evidencia</span>
          </div>
          <div className="graph-principle">
            <TreeStructure size={16} aria-hidden />
            <span>Conflictos sociales mineros, minería ilegal e informal y REINFO son ejes distintos. Las líneas indican relación documental; no prueban causalidad ni equivalencia administrativa.</span>
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
                <p>Referencias precisas</p>
                <span>{activeEvidenceRecords.length} referencia(s)</span>
              </div>
              {activeEvidenceRecords.slice(0, 4).map((record) => (
                <article key={record.id}>
                  <strong>{relationLabels[record.relation]} · {record.locator}</strong>
                  <span>{record.summary}</span>
                  <small>Consulta documental: {formatDate(record.checkedAt)}</small>
                </article>
              ))}
            </section>
          )}
          {activeMatrixDocuments.length > 0 && (
            <section className="locator-group">
              <div className="link-group-title">
                <p>Fuentes de las comparaciones</p>
                <span>{activeMatrixDocuments.length} referencia(s)</span>
              </div>
              {activeMatrixDocuments.slice(0, 6).map((record) => (
                <article key={`${record.owner}-${record.sourceId}-${record.locator}`}>
                  <strong>Referencia directa · {record.locator}</strong>
                  <span>{record.label}</span>
                  <small>{sourceById.get(record.sourceId)?.institution ?? "Fuente documental"}</small>
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
            <span>Cómo leer esta relación</span>
            <strong><BookOpenText size={16} aria-hidden /><i /> Lectura académica</strong>
            <p>{activeDetail.nextStep}</p>
          </div>
        </aside>
      </div>
      {citationOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCitationOpen(false)}><section className="citation-dialog" role="dialog" aria-modal="true" aria-labelledby="citation-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setCitationOpen(false)} aria-label="Cerrar"><X /></button><p className="eyebrow">Cita sugerida</p><h2 id="citation-title">Sistema de relaciones mineras</h2><blockquote>Observatorio de Conflictos Mineros del Perú (2026). “Sistema de relaciones: conflictos sociales mineros, minería ilegal e informal y REINFO”. Fecha de consulta: {new Date().toLocaleDateString("es-PE")}.</blockquote><p>Incluye siempre la fecha de corte porque los estados, acuerdos y registros documentales pueden cambiar.</p></section></div>}
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
