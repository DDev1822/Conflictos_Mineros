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
  Article,
  BookOpenText,
  Briefcase,
  Buildings,
  CirclesThreePlus,
  Gavel,
  GraduationCap,
  MapPin,
  MagnifyingGlass,
  Scales,
  ShieldCheck,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import type { ObservatoryData } from "@/lib/schemas";

type ResultItem = { id: string; label: string; subtitle: string; type: string; href?: string; count: number };

function GraphLabel({ icon: Icon, title, subtitle }: { icon: typeof Gavel; title: string; subtitle: string }) {
  return <div className="graph-label"><Icon size={24} weight="thin" aria-hidden /><span><strong>{title}</strong><small>{subtitle}</small></span></div>;
}

function makeNodes(focus: string): Node[] {
  const active = (id: string) => id === focus ? "knowledge-node is-active" : "knowledge-node";
  return [
    { id: "reinfo", position: { x: 350, y: 240 }, className: `${active("reinfo")} central-node`, data: { label: <GraphLabel icon={Article} title="REINFO / MAPE" subtitle="Registro y proceso" /> } },
    { id: "formalizacion", position: { x: 330, y: 45 }, className: active("formalizacion"), data: { label: <GraphLabel icon={ShieldCheck} title="Formalización minera" subtitle="Política pública" /> } },
    { id: "madre-de-dios", position: { x: 35, y: 190 }, className: active("madre-de-dios"), data: { label: <GraphLabel icon={MapPin} title="Madre de Dios" subtitle="Territorio" /> } },
    { id: "mape", position: { x: 650, y: 185 }, className: active("mape"), data: { label: <GraphLabel icon={UsersThree} title="Pequeña minería" subtitle="Actor colectivo" /> } },
    { id: "fiscalizacion", position: { x: 75, y: 410 }, className: active("fiscalizacion"), data: { label: <GraphLabel icon={Gavel} title="Fiscalización" subtitle="Función del Estado" /> } },
    { id: "alternativas", position: { x: 630, y: 410 }, className: active("alternativas"), data: { label: <GraphLabel icon={Scales} title="Alternativas" subtitle="Opciones comparadas" /> } },
    { id: "estado", position: { x: 105, y: 595 }, className: "actor-node", data: { label: <GraphLabel icon={Buildings} title="Estado" subtitle="Actor" /> } },
    { id: "comunidades", position: { x: 280, y: 595 }, className: "actor-node", data: { label: <GraphLabel icon={UsersThree} title="Comunidades" subtitle="Actor" /> } },
    { id: "empresa", position: { x: 455, y: 595 }, className: "actor-node", data: { label: <GraphLabel icon={Briefcase} title="Empresa" subtitle="Actor" /> } },
    { id: "academia", position: { x: 630, y: 595 }, className: "actor-node", data: { label: <GraphLabel icon={GraduationCap} title="Academia" subtitle="Actor" /> } },
  ];
}

const edges: Edge[] = [
  { id: "e1", source: "reinfo", target: "formalizacion", label: "instrumento para", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e2", source: "reinfo", target: "madre-de-dios", label: "se implementa en", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e3", source: "reinfo", target: "mape", label: "orientado a", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e4", source: "reinfo", target: "fiscalizacion", label: "condiciona", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e5", source: "reinfo", target: "alternativas", label: "puede reformarse", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e6", source: "fiscalizacion", target: "alternativas", label: "reequilibra", animated: true, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e7", source: "reinfo", target: "estado", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e8", source: "reinfo", target: "comunidades", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e9", source: "reinfo", target: "empresa", markerEnd: { type: MarkerType.ArrowClosed } },
  { id: "e10", source: "reinfo", target: "academia", markerEnd: { type: MarkerType.ArrowClosed } },
];

export function RelationshipExplorer({ data }: { data: ObservatoryData }) {
  const [query, setQuery] = useState("");
  const [entityType, setEntityType] = useState("all");
  const [issue, setIssue] = useState("all");
  const [sourceType, setSourceType] = useState("all");
  const [focus, setFocus] = useState("reinfo");
  const [citationOpen, setCitationOpen] = useState(false);

  const results = useMemo<ResultItem[]>(() => [
    { id: "reinfo", label: "REINFO / MAPE", subtitle: "Relación central del sistema", type: "issue", count: 23 },
    ...data.cases.map((item) => ({ id: item.id, label: item.name, subtitle: "Expediente territorial", type: "case", href: `/conflictos/${item.slug}`, count: item.claims.length + item.timeline.length })),
    ...data.issues.map((item) => ({ id: item.id, label: item.name, subtitle: "Nudo normativo", type: "issue", count: item.sourceIds.length })),
    ...data.instruments.map((item) => ({ id: item.id, label: item.number, subtitle: item.title, type: "instrument", count: item.sourceIds.length })),
    ...data.alternatives.map((item) => ({ id: item.id, label: item.title, subtitle: "Alternativa de política", type: "alternative", count: item.sourceIds.length })),
    ...data.actors.map((item) => ({ id: item.id, label: item.name, subtitle: "Actor relacionado", type: "actor", count: data.cases.filter((entry) => entry.actorIds.includes(item.id)).length })),
  ].filter((item) => {
    const matchesText = `${item.label} ${item.subtitle}`.toLowerCase().includes(query.toLowerCase());
    const matchesType = entityType === "all" || item.type === entityType;
    const matchesIssue = issue === "all" || item.id.includes(issue) || data.cases.find((entry) => entry.id === item.id)?.issueIds.includes(issue);
    return matchesText && matchesType && matchesIssue;
  }).sort((a, b) => {
    const priority = ["reinfo", "madre-de-dios", "formalizacion-mape", "mineros-mape", "fiscalizacion-ambiental", "expediente-unico-trazable"];
    const aRank = priority.indexOf(a.id); const bRank = priority.indexOf(b.id);
    return (aRank === -1 ? 999 : aRank) - (bRank === -1 ? 999 : bRank);
  }), [data, entityType, issue, query]);

  const graphFocus = (id: string) => ({ "formalizacion-mape": "formalizacion", "mineros-mape": "mape", "fiscalizacion-ambiental": "fiscalizacion", "expediente-unico-trazable": "alternativas" }[id] ?? id);

  const filteredSources = data.sources.filter((item) => sourceType === "all" || item.type === sourceType);
  const facts = data.cases.flatMap((item) => item.claims).filter((item) => item.kind === "fact");
  const interpretations = data.cases.flatMap((item) => item.claims).filter((item) => item.kind === "interpretation");
  const reset = () => { setQuery(""); setEntityType("all"); setIssue("all"); setSourceType("all"); };

  return (
    <div className="relationship-app">
      <section className="explorer-toolbar" aria-label="Búsqueda principal">
        <label className="search-box"><MagnifyingGlass size={22} /><span className="sr-only">Buscar</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar relaciones, casos o normas" /></label>
        <div className="toolbar-meta"><label>Fecha de corte <input type="date" value="2026-06-17" readOnly /></label><button onClick={() => setCitationOpen(true)}>Cómo citar</button></div>
      </section>
      <section className="filter-bar" aria-label="Filtros del explorador">
        <span>Filtrar por</span>
        <label><span>Tipo de entidad</span><select value={entityType} onChange={(event) => setEntityType(event.target.value)}><option value="all">Todas</option><option value="case">Casos</option><option value="issue">Nudos</option><option value="instrument">Normas</option><option value="alternative">Alternativas</option><option value="actor">Actores</option></select></label>
        <label><span>Tema</span><select value={issue} onChange={(event) => setIssue(event.target.value)}><option value="all">Todos</option>{data.issues.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label><span>Fuente</span><select value={sourceType} onChange={(event) => setSourceType(event.target.value)}><option value="all">Todas</option><option value="official">Oficial</option><option value="academic">Academia</option><option value="community">Comunidad</option><option value="company">Empresa</option></select></label>
        <button className="clear-button" onClick={reset}><X size={16} /> Limpiar</button>
      </section>
      <div className="explorer-grid">
        <aside className="results-pane" aria-label="Índice de resultados">
          <div className="pane-heading"><p>Dossier / índice</p><span>{results.length} resultados</span></div>
          <div className="result-list">
            {results.slice(0, 9).map((item) => (
              <button key={item.id} className={focus === graphFocus(item.id) ? "result-row active" : "result-row"} onClick={() => setFocus(graphFocus(item.id))}>
                <span className="result-icon">{item.type === "case" ? <MapPin /> : item.type === "instrument" ? <BookOpenText /> : item.type === "alternative" ? <Scales /> : <CirclesThreePlus />}</span>
                <span><strong>{item.label}</strong><small>{item.subtitle}</small></span><em>{item.count}<small> vínculos</small></em>
              </button>
            ))}
            {!results.length && <p className="empty-state">No hay coincidencias. Prueba retirando un filtro.</p>}
          </div>
          <div className="case-links"><p>Casos piloto</p>{data.cases.map((item) => <Link key={item.id} href={`/conflictos/${item.slug}`}><MapPin size={14} />{item.name}</Link>)}</div>
        </aside>
        <section className="graph-pane" aria-label="Relaciones de conocimiento">
          <div className="graph-title"><p>Relación central</p><h1>REINFO / MAPE</h1><span><i className="dot warning" /> vigencia por verificar <i className="dot official" /> fuente oficial</span></div>
          <ReactFlow nodes={makeNodes(focus)} edges={edges} fitView minZoom={0.55} maxZoom={1.25} nodesDraggable={false} onNodeClick={(_, node) => setFocus(node.id)} proOptions={{ hideAttribution: true }}>
            <Background color="#1b536b" gap={28} size={1} />
            <Controls showInteractive={false} />
          </ReactFlow>
        </section>
        <aside className="evidence-pane" aria-label="Inspector de evidencia">
          <div className="pane-heading"><p>Inspector de evidencia</p><strong>{focus.replaceAll("-", " ")}</strong></div>
          <EvidenceGroup number="1" title="Hechos documentados" count={facts.length} copy="Afirmaciones vinculadas a fuentes identificables." items={filteredSources.slice(0, 3).map((item) => `${item.institution} — ${item.title}`)} tone="green" />
          <EvidenceGroup number="2" title="Interpretaciones en disputa" count={interpretations.length} copy="Lecturas diferenciadas, atribuidas y abiertas a contraste." items={["Revisar síntesis y fuentes relacionadas"]} tone="copper" />
          <EvidenceGroup number="3" title="Alternativas comparadas" count={data.alternatives.length} copy="Opciones con beneficios, riesgos y dependencias explícitas." items={data.alternatives.slice(0, 2).map((item) => item.title)} tone="gold" />
          <div className="evidence-level"><span>Nivel documental inicial</span><strong><i /> Parcial</strong><p>La publicación abierta depende de revisión jurídica y editorial.</p></div>
        </aside>
      </div>
      <section className="compact-timeline" aria-label="Línea de tiempo del REINFO">
        <p>Línea de tiempo</p>
        {[1992, 2002, 2009, 2012, 2017, 2020, 2026].map((year, index) => <div key={year} className={year === 2017 ? "active" : ""}><i /><strong>{year}</strong><span>{["Ley General de Minería", "Formalización inicial", "Reformas sectoriales", "Nueva etapa MAPE", "REINFO", "Adecuaciones", "Fecha de corte"][index]}</span></div>)}
      </section>
      {citationOpen && <div className="dialog-backdrop" role="presentation" onMouseDown={() => setCitationOpen(false)}><section className="citation-dialog" role="dialog" aria-modal="true" aria-labelledby="citation-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" onClick={() => setCitationOpen(false)} aria-label="Cerrar"><X /></button><p className="eyebrow">Cita sugerida</p><h2 id="citation-title">Sistema de relaciones REINFO / MAPE</h2><blockquote>Observatorio de Conflictos Mineros del Perú (2026). “Sistema de relaciones REINFO / MAPE”. Fecha de consulta: {new Date().toLocaleDateString("es-PE")}.</blockquote><p>Incluye siempre la fecha de corte porque el estado normativo puede cambiar.</p></section></div>}
    </div>
  );
}

function EvidenceGroup({ number, title, count, copy, items, tone }: { number: string; title: string; count: number; copy: string; items: string[]; tone: string }) {
  return <section className={`evidence-group tone-${tone}`}><div className="evidence-group-title"><span>{number}</span><h2>{title}</h2><em>{count} registros</em></div><p>{copy}</p><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></section>;
}
