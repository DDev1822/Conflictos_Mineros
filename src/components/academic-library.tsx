"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowSquareOut, Funnel, MagnifyingGlass } from "@phosphor-icons/react";
import type { AcademicResearchItem } from "@/lib/schemas";

type AcademicLibraryProps = {
  items: AcademicResearchItem[];
  cases: Array<{ slug: string; name: string }>;
};

const degreeLabels: Record<AcademicResearchItem["degreeLevel"], string> = {
  pregrado: "Título / pregrado",
  maestria: "Maestría",
  doctorado: "Doctorado",
};

const axisLabels: Record<AcademicResearchItem["axis"], string> = {
  "conflictos-sociales-mineros": "Conflictos sociales mineros",
  "mineria-ilegal-e-informal": "Minería ilegal e informal",
  "reinfo-y-formalizacion": "REINFO y formalización",
};

const accessLabels: Record<AcademicResearchItem["accessStatus"], string> = {
  open: "Texto abierto",
  "metadata-only": "Ficha disponible",
  restricted: "Acceso restringido",
};

export function AcademicLibrary({ items, cases }: AcademicLibraryProps) {
  const [query, setQuery] = useState("");
  const [degree, setDegree] = useState("all");
  const [axis, setAxis] = useState("all");
  const [university, setUniversity] = useState("all");

  const universities = useMemo(
    () => Array.from(new Set(items.map((item) => item.university))).sort((a, b) => a.localeCompare(b, "es")),
    [items],
  );
  const caseNames = useMemo(() => new Map(cases.map((item) => [item.slug, item.name])), [cases]);
  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("es");
    return items.filter((item) => {
      const haystack = [
        item.title,
        ...item.authors,
        item.university,
        ...item.regions,
        ...item.topics,
        ...item.caseSlugs.map((slug) => caseNames.get(slug) ?? slug),
        item.editorialSummary,
      ].join(" ").toLocaleLowerCase("es");
      return (degree === "all" || item.degreeLevel === degree)
        && (axis === "all" || item.axis === axis)
        && (university === "all" || item.university === university)
        && (!normalizedQuery || haystack.includes(normalizedQuery));
    });
  }, [axis, caseNames, degree, items, query, university]);

  return (
    <>
      <div className="library-controls" aria-label="Filtros de la biblioteca académica">
        <label className="library-search">
          <MagnifyingGlass aria-hidden />
          <span className="sr-only">Buscar investigaciones</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por tema, caso, región, autor o universidad"
          />
        </label>
        <label><Funnel aria-hidden />Grado
          <select value={degree} onChange={(event) => setDegree(event.target.value)}>
            <option value="all">Todos</option>
            {Object.entries(degreeLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <label>Eje
          <select value={axis} onChange={(event) => setAxis(event.target.value)}>
            <option value="all">Todos</option>
            {Object.entries(axisLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
        </label>
        <label>Universidad
          <select value={university} onChange={(event) => setUniversity(event.target.value)}>
            <option value="all">Todas</option>
            {universities.map((item) => <option value={item} key={item}>{item}</option>)}
          </select>
        </label>
      </div>

      <p className="library-result-count" role="status">{filtered.length} de {items.length} investigaciones</p>

      <div className="library-grid">
        {filtered.map((item) => (
          <article className="library-card" key={item.id} data-axis={item.axis}>
            <div className="library-card-meta">
              <span>{degreeLabels[item.degreeLevel]}</span>
              <span>{item.year}</span>
              <span>{accessLabels[item.accessStatus]}</span>
            </div>
            <p className="library-axis">{axisLabels[item.axis]}</p>
            <h2>{item.title}</h2>
            <p className="library-byline">{item.authors.join(" · ")}</p>
            <p className="library-institution">{item.university} · {item.repository}</p>
            <p className="library-summary">{item.editorialSummary}</p>
            <div className="library-tags" aria-label="Temas">
              {item.topics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
            {item.caseSlugs.length > 0 && (
              <div className="library-cases">
                <strong>Casos relacionados</strong>
                {item.caseSlugs.map((slug) => (
                  <Link href={`/conflictos/${slug}`} key={slug}>{caseNames.get(slug) ?? slug}</Link>
                ))}
              </div>
            )}
            <a className="library-record-link" href={item.recordUrl} target="_blank" rel="noreferrer">
              Abrir ficha académica <ArrowSquareOut aria-hidden />
            </a>
          </article>
        ))}
        {!filtered.length && (
          <p className="library-empty">No hay investigaciones que coincidan. Prueba otro término o restablece los filtros.</p>
        )}
      </div>
    </>
  );
}
