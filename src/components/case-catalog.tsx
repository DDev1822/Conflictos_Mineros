"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import type { CaseResearchPacket, ConflictCase, EvidenceRecord, NormativeIssue, Source, Territory } from "@/lib/schemas";
import { StatusPill } from "./status-pill";

type CaseCatalogProps = {
  cases: ConflictCase[];
  issues: NormativeIssue[];
  territories: Territory[];
  researchPackets: CaseResearchPacket[];
  sources: Source[];
  evidenceRecords: EvidenceRecord[];
};

const reviewLabels: Record<ConflictCase["reviewStatus"], string> = {
  documentary: "contraste documental",
};

const researchStatusLabels: Record<CaseResearchPacket["status"], string> = {
  ready: "documentación organizada",
  incomplete: "documentación en revisión",
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values));
}

function caseEntityIds(item: ConflictCase) {
  return new Set([item.id, ...item.timeline.map((event) => event.id), ...item.claims.map((claim) => claim.id)]);
}

function publicStatusSummary(value: string) {
  return value
    .replaceAll("El expediente conserva", "La documentación disponible reúne")
    .replaceAll("el expediente integra", "la documentación reúne")
    .replaceAll("queda integrado como", "se presenta como")
    .replaceAll("con locadores", "con referencias exactas");
}

export function CaseCatalog({ cases, issues, territories, researchPackets, sources, evidenceRecords }: CaseCatalogProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [issue, setIssue] = useState("all");
  const packetByCaseId = useMemo(() => new Map(researchPackets.map((packet) => [packet.caseId, packet])), [researchPackets]);

  const filtered = useMemo(() => cases.filter((item) => {
    const packet = packetByCaseId.get(item.id);
    const caseTerritories = territories.filter((entry) => item.territoryIds.includes(entry.id));
    const caseIssues = issues.filter((entry) => item.issueIds.includes(entry.id));
    const haystack = [
      item.name,
      item.summary,
      packet?.currentStatusSummary,
      ...caseTerritories.flatMap((territory) => [territory.name, territory.region, ...territory.provinces]),
      ...caseIssues.map((entry) => entry.name),
    ].join(" ").toLowerCase();
    return (status === "all" || item.status === status)
      && (issue === "all" || item.issueIds.includes(issue))
      && haystack.includes(query.toLowerCase());
  }), [cases, issue, issues, packetByCaseId, query, status, territories]);

  return (
    <>
      <div className="catalog-controls">
        <label className="search-box">
          <MagnifyingGlass />
          <span className="sr-only">Buscar casos</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por caso, territorio, actor o tema" />
        </label>
        <label>
          <Funnel />Estado
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">Todos</option>
            <option value="active">Activos</option>
            <option value="latent">Latentes</option>
            <option value="historical">Históricos</option>
            <option value="resolved">Resueltos</option>
          </select>
        </label>
        <label>
          Tema
          <select value={issue} onChange={(event) => setIssue(event.target.value)}>
            <option value="all">Todos</option>
            {issues.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
          </select>
        </label>
      </div>
      <div className="case-table">
        <div className="case-table-head">
          <span>Caso y problema central</span>
          <span>Territorio</span>
          <span>Evidencia</span>
          <span>Contraste</span>
          <span>Estado</span>
        </div>
        {filtered.map((item) => {
          const packet = packetByCaseId.get(item.id);
          const caseTerritories = territories.filter((entry) => item.territoryIds.includes(entry.id));
          const caseIssues = issues.filter((entry) => item.issueIds.includes(entry.id));
          const sourceIds = uniqueIds(packet?.sourceIds ?? [
            ...item.timeline.flatMap((event) => event.sourceIds),
            ...item.claims.flatMap((claim) => claim.sourceIds),
          ]);
          const knownSources = sourceIds.filter((sourceId) => sources.some((source) => source.id === sourceId)).length;
          const entities = caseEntityIds(item);
          const locators = evidenceRecords.filter((record) => entities.has(record.entityId));
          const reviewedLocators = locators.filter((record) => record.reviewStatus === "reviewed").length;
          const verifiedClaims = item.claims.filter((claim) => claim.verificationStatus === "verified").length;
          const scopeLimitCount = packet?.gaps.length ?? 0;
          const openContradictions = packet?.contradictions.filter((entry) => entry.status === "open").length ?? 0;

          return (
            <Link href={`/conflictos/${item.slug}`} key={item.id} className="case-table-row">
              <span className="case-main-cell">
                <strong>{item.name}</strong>
                <small>{packet ? publicStatusSummary(packet.currentStatusSummary) : item.summary}</small>
                <em>{caseIssues.slice(0, 3).map((entry) => entry.name).join(" · ")}</em>
              </span>
              <span>
                {caseTerritories.map((territory) => territory.region).join(", ")}
                <small>{caseTerritories.map((territory) => territory.name).join(", ")} · {item.period.start}–{item.period.end ?? "actualidad"}</small>
                <small>Corte: {formatDate(packet?.cutoffDate ?? item.cutoffDate)}</small>
              </span>
              <span>
                {knownSources} fuentes
                <small>{reviewedLocators}/{locators.length} referencias revisadas</small>
                <small>{item.timeline.length} hitos · {verifiedClaims}/{item.claims.length} afirmaciones verificadas</small>
              </span>
              <span>
                {packet ? researchStatusLabels[packet.status] : "documentación no sistematizada"}
                <small>{packet ? `seguimiento al ${formatDate(packet.cutoffDate)}` : reviewLabels[item.reviewStatus]}</small>
                <small>{openContradictions} contradicción(es) · {scopeLimitCount} límite(s) de alcance</small>
              </span>
              <span className="case-status-cell">
                <StatusPill status={item.status} />
                <small>{reviewLabels[item.reviewStatus]}</small>
              </span>
              <ArrowRight />
            </Link>
          );
        })}
        {!filtered.length && <p className="empty-state">Ajusta los filtros para recuperar casos del catálogo.</p>}
      </div>
    </>
  );
}
