"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import type { CaseResearchPacket, ConflictCase, NormativeIssue, Territory } from "@/lib/schemas";
import { StatusPill } from "./status-pill";

type CaseCatalogProps = {
  cases: ConflictCase[];
  issues: NormativeIssue[];
  territories: Territory[];
  researchPackets: CaseResearchPacket[];
};

export function CaseCatalog({ cases, issues, territories, researchPackets }: CaseCatalogProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [issue, setIssue] = useState("all");
  const packetByCaseId = useMemo(() => new Map(researchPackets.map((packet) => [packet.caseId, packet])), [researchPackets]);

  const filtered = useMemo(() => cases.filter((item) => {
    const packet = packetByCaseId.get(item.id);
    const caseTerritories = territories.filter((entry) => item.territoryIds.includes(entry.id));
    const caseIssues = issues.filter((entry) => item.issueIds.includes(entry.id));
    const haystack = [item.name, item.summary, packet?.currentStatusSummary, ...caseTerritories.flatMap((territory) => [territory.name, territory.region, ...territory.provinces]), ...caseIssues.map((entry) => entry.name)].join(" ").toLowerCase();
    return (status === "all" || item.status === status) && (issue === "all" || item.issueIds.includes(issue)) && haystack.includes(query.toLowerCase());
  }), [cases, issue, issues, packetByCaseId, query, status, territories]);

  return (
    <>
      <div className="catalog-controls">
        <label className="search-box"><MagnifyingGlass /><span className="sr-only">Buscar casos</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por caso, territorio o tema" /></label>
        <label><Funnel />Estado<select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos</option><option value="active">Activos</option><option value="latent">Latentes</option><option value="historical">Históricos</option><option value="resolved">Resueltos</option></select></label>
        <label>Tema<select value={issue} onChange={(event) => setIssue(event.target.value)}><option value="all">Todos</option>{issues.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
      </div>
      <div className="case-table">
        <div className="case-table-head"><span>Caso</span><span>Territorio</span><span>Problemas centrales</span><span>Hitos</span><span>Estado</span></div>
        {filtered.map((item) => {
          const caseTerritories = territories.filter((entry) => item.territoryIds.includes(entry.id));
          const caseIssues = issues.filter((entry) => item.issueIds.includes(entry.id));
          return (
            <Link href={`/conflictos/${item.slug}`} key={item.id} className="case-table-row">
              <span className="case-main-cell"><strong>{item.name}</strong><small>{item.summary}</small></span>
              <span>{caseTerritories.map((territory) => territory.region).join(", ")}<small>{caseTerritories.map((territory) => territory.name).join(", ")}</small><small>{item.period.start}–{item.period.end ?? "actualidad"}</small></span>
              <span>{caseIssues.slice(0, 4).map((entry) => entry.name).join(" · ")}</span>
              <span><strong>{item.timeline.length}</strong><small>hechos, decisiones y acuerdos</small></span>
              <span className="case-status-cell"><StatusPill status={item.status} /></span>
              <ArrowRight />
            </Link>
          );
        })}
        {!filtered.length && <p className="empty-state">No hay casos que coincidan con esos filtros.</p>}
      </div>
    </>
  );
}
