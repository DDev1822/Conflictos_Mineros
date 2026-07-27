"use client";

import { Fragment, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import type { EvidenceRecord, ObservatoryData, Source, TimelineEvent } from "@/lib/schemas";

type TimelineKind = TimelineEvent["kind"];
type SourceTypeFilter = Source["type"] | "all";

type TimelineItem = TimelineEvent & {
  caseId: string;
  caseName: string;
  caseSlug: string;
  caseStatus: string;
  sources: Source[];
  locators: EvidenceRecord[];
};

const timelineKindLabels: Record<TimelineKind, string> = {
  event: "Evento",
  decision: "Decisión",
  agreement: "Acuerdo",
  evidence: "Evidencia",
  publication: "Publicación",
};

const sourceTypeLabels: Record<Source["type"], string> = {
  official: "Oficial",
  academic: "Academia",
  community: "Comunidad",
  company: "Empresa",
  ngo: "Sociedad civil",
  press: "Prensa",
};

const relationLabels: Record<EvidenceRecord["relation"], string> = {
  supports: "sostiene",
  qualifies: "matiza",
  contradicts: "contradice",
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

function eventYear(value: string) {
  return value.slice(0, 4);
}

function buildTimeline(data: ObservatoryData): TimelineItem[] {
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));

  return data.cases
    .flatMap((item) => item.timeline.map((event) => {
      const eventSources = event.sourceIds
        .map((sourceId) => sourceById.get(sourceId))
        .filter((source): source is Source => Boolean(source));
      const directLocators = data.evidenceRecords.filter((record) => record.entityType === "timeline" && record.entityId === event.id);
      const relatedLocators = directLocators.length
        ? directLocators
        : data.evidenceRecords.filter((record) => event.sourceIds.includes(record.sourceId)).slice(0, 2);

      return {
        ...event,
        caseId: item.id,
        caseName: item.name,
        caseSlug: item.slug,
        caseStatus: item.status,
        sources: eventSources,
        locators: relatedLocators,
      };
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function TimelineExplorer({ data }: { data: ObservatoryData }) {
  const [query, setQuery] = useState("");
  const [caseId, setCaseId] = useState("all");
  const [kind, setKind] = useState<TimelineKind | "all">("all");
  const [sourceType, setSourceType] = useState<SourceTypeFilter>("all");

  const timeline = useMemo(() => buildTimeline(data), [data]);
  const kindCounts = useMemo(() => timeline.reduce<Record<TimelineKind, number>>((acc, event) => {
    acc[event.kind] += 1;
    return acc;
  }, { event: 0, decision: 0, agreement: 0, evidence: 0, publication: 0 }), [timeline]);

  const filtered = useMemo(() => timeline.filter((event) => {
    const text = [
      event.caseName,
      event.title,
      event.summary,
      timelineKindLabels[event.kind],
      ...event.sources.flatMap((source) => [source.title, source.institution]),
      ...event.locators.flatMap((record) => [record.locator, record.summary]),
    ].join(" ").toLowerCase();

    return (caseId === "all" || event.caseId === caseId)
      && (kind === "all" || event.kind === kind)
      && (sourceType === "all" || event.sources.some((source) => source.type === sourceType))
      && text.includes(query.toLowerCase());
  }), [caseId, kind, query, sourceType, timeline]);
  const yearIndex = useMemo(() => {
    const counts = new Map<string, number>();
    filtered.forEach((event) => {
      const year = eventYear(event.date);
      counts.set(year, (counts.get(year) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([year, count]) => ({
      year,
      count,
      href: `#timeline-year-${year}`,
    }));
  }, [filtered]);

  const reset = () => {
    setQuery("");
    setCaseId("all");
    setKind("all");
    setSourceType("all");
  };

  return (
    <section className="timeline-tool" aria-label="Explorador cronológico de hitos documentados">
      <div className="timeline-controls">
        <label className="search-box">
          <MagnifyingGlass />
          <span className="sr-only">Buscar hitos</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar hito, caso, fuente o referencia" />
        </label>
        <label>
          <Funnel />Caso
          <select value={caseId} onChange={(event) => setCaseId(event.target.value)}>
            <option value="all">Todos</option>
            {data.cases.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </label>
        <label>
          Tipo de hito
          <select value={kind} onChange={(event) => setKind(event.target.value as TimelineKind | "all")}>
            <option value="all">Todos</option>
            {Object.entries(timelineKindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label>
          Fuente
          <select value={sourceType} onChange={(event) => setSourceType(event.target.value as SourceTypeFilter)}>
            <option value="all">Todas</option>
            {Object.entries(sourceTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <button type="button" onClick={reset}>Limpiar</button>
      </div>

      <div className="timeline-kind-strip" aria-label="Resumen por tipo de hito">
        {Object.entries(timelineKindLabels).map(([value, label]) => (
          <button key={value} type="button" className={kind === value ? "active" : ""} onClick={() => setKind(kind === value ? "all" : value as TimelineKind)}>
            <strong>{kindCounts[value as TimelineKind]}</strong>
            <span>{label}</span>
          </button>
        ))}
      </div>

      <div className="timeline-reader-layout">
        <div className="timeline-reader-main">
          <div className="timeline-count">
            <strong>{filtered.length}</strong>
            <span>hito(s) visibles de {timeline.length}; ordenados de más antiguo a más reciente.</span>
          </div>

          <div className="chronology-reader">
            {filtered.map((event, index) => {
              const year = eventYear(event.date);
              const startsYear = index === 0 || eventYear(filtered[index - 1].date) !== year;
              const sourceInstitutions = unique(event.sources.map((source) => source.institution)).slice(0, 3);
              return (
                <Fragment key={`${event.caseId}-${event.id}`}>
                  <article id={startsYear ? `timeline-year-${year}` : undefined} data-kind={event.kind}>
                    <time dateTime={event.date}>{formatDate(event.date)}</time>
                    <div>
                      <div className="timeline-card-meta">
                        <span>{timelineKindLabels[event.kind]}</span>
                        <Link href={`/conflictos/${event.caseSlug}`}>{event.caseName}</Link>
                      </div>
                      <h2>{event.title}</h2>
                      <p>{event.summary}</p>
                      <div className="timeline-card-evidence">
                        <span>{event.sources.length} fuente(s): {sourceInstitutions.join(", ") || "fuente en contraste"}</span>
                        <span>{event.locators.length} referencia(s) exacta(s)</span>
                      </div>
                      <div className="timeline-card-sources">
                        {event.sources.slice(0, 3).map((source) => (
                          <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                            <strong>{source.institution}</strong>
                            <small>{sourceTypeLabels[source.type]} · {formatDate(source.date)}</small>
                            <ArrowSquareOut size={13} aria-hidden />
                          </a>
                        ))}
                      </div>
                      {event.locators.length > 0 && (
                        <div className="timeline-locators">
                          {event.locators.slice(0, 2).map((record) => (
                            <section key={record.id}>
                              <strong>{relationLabels[record.relation]} · {record.locator}</strong>
                              <small>{record.summary}</small>
                            </section>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                </Fragment>
              );
            })}
            {!filtered.length && <p className="empty-state">Ajusta los filtros para recuperar hitos de la cronología.</p>}
          </div>
        </div>

        {yearIndex.length > 0 && (
          <nav className="timeline-year-nav" aria-label="Saltar por año en la cronología">
            <strong>Años</strong>
            <span>Índice filtrado</span>
            <ol>
              {yearIndex.map((item) => (
                <li key={item.year}>
                  <a href={item.href}>
                    <span>{item.year}</span>
                    <small>{item.count}</small>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
    </section>
  );
}
