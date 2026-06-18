"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import type { ConflictCase, NormativeIssue, Territory } from "@/lib/schemas";
import { StatusPill } from "./status-pill";

export function CaseCatalog({ cases, issues, territories }: { cases: ConflictCase[]; issues: NormativeIssue[]; territories: Territory[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [issue, setIssue] = useState("all");
  const filtered = useMemo(() => cases.filter((item) => {
    const territory = territories.find((entry) => item.territoryIds.includes(entry.id));
    return (status === "all" || item.status === status) && (issue === "all" || item.issueIds.includes(issue)) && `${item.name} ${item.summary} ${territory?.region}`.toLowerCase().includes(query.toLowerCase());
  }), [cases, issue, query, status, territories]);
  return <>
    <div className="catalog-controls"><label className="search-box"><MagnifyingGlass /><span className="sr-only">Buscar casos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por caso, territorio o tema" /></label><label><Funnel />Estado<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="active">Activos</option><option value="latent">Latentes</option><option value="historical">Históricos</option></select></label><label>Tema<select value={issue} onChange={(event) => setIssue(event.target.value)}><option value="all">Todos</option>{issues.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label></div>
    <div className="case-table"><div className="case-table-head"><span>Expediente</span><span>Territorio</span><span>Periodo</span><span>Estado</span><span /></div>{filtered.map((item) => { const territory = territories.find((entry) => item.territoryIds.includes(entry.id)); return <Link href={`/conflictos/${item.slug}`} key={item.id} className="case-table-row"><span><strong>{item.name}</strong><small>{item.summary}</small></span><span>{territory?.region}<small>{territory?.name}</small></span><span>{item.period.start}–{item.period.end ?? "actualidad"}</span><span><StatusPill status={item.status} /></span><ArrowRight /></Link>; })}</div>
  </>;
}
