import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowSquareOut, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
import type { LegalInstrument, NormativeIssue, Source } from "@/lib/schemas";

export const metadata: Metadata = { title: "Normativa y nudos" };

const issueStatusLabels: Record<NormativeIssue["status"], string> = {
  structural: "Estructural",
  "active-debate": "Debate activo",
  "implementation-gap": "Brecha de implementación",
};

const instrumentStatusLabels: Record<LegalInstrument["status"], string> = {
  documented: "documentada",
};

const evidenceLevelLabels: Record<Source["evidenceLevel"], string> = {
  primary: "primaria",
  secondary: "secundaria",
  contextual: "contextual",
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function primarySourceFor(instrument: LegalInstrument, sources: Source[]) {
  const linkedSources = instrument.sourceIds
    .map((id) => sources.find((source) => source.id === id))
    .filter((source): source is Source => Boolean(source));

  return linkedSources.find((source) => source.evidenceLevel === "primary") ?? linkedSources[0];
}

export default function NormsPage() {
  const data = loadObservatoryData();
  const latestCheck = [...data.instruments].sort((a, b) => b.lastCheckedAt.localeCompare(a.lastCheckedAt))[0]?.lastCheckedAt;
  const preparedPackets = data.legalResearchPackets.filter((packet) => packet.status === "prepared").length;
  const instrumentLocators = data.evidenceRecords.filter((record) => record.entityType === "instrument");
  const instrumentsWithLocators = new Set(instrumentLocators.map((record) => record.entityId)).size;

  return (
    <div className="content-page">
      <header className="page-intro">
        <p className="eyebrow">Marco normativo vivo</p>
        <h1>Normas, implementación y controversias</h1>
        <p>
          {data.instruments.length} instrumentos, {data.issues.length} nudos normativos y {preparedPackets} análisis documentales conectan
          autorización minera, agua, fiscalización, consulta, acuerdos y cumplimiento en conflictos sociales mineros. Cada instrumento conserva
          texto oficial, fuente y referencia documental; no emite dictámenes ni determina responsabilidades.
        </p>
      </header>

      <section className="norm-stats" aria-label="Estado del catálogo normativo">
        <article>
          <strong>{data.instruments.length}</strong>
          <span>Instrumentos</span>
          <small>{instrumentsWithLocators} con referencias documentales.</small>
        </article>
        <article>
          <strong>{data.issues.length}</strong>
          <span>Nudos</span>
          <small>Problemas recurrentes de diseño, aplicación e implementación.</small>
        </article>
        <article>
          <strong>{preparedPackets}</strong>
          <span>Con análisis documental</span>
          <small>Competencia, obligación, fuente y pregunta de aplicación.</small>
        </article>
      </section>

      <div className="legal-warning">
        <WarningCircle size={24} />
        <div>
          <strong>Último contraste documental: {formatDate(latestCheck)}</strong>
          <p>La existencia de una norma no prueba cumplimiento, legitimidad social ni responsabilidad. Cada instrumento debe leerse con autoridad competente, fecha, obligación y fuente oficial.</p>
        </div>
      </div>

      <section className="issue-index">
        <p className="eyebrow">Problemas recurrentes</p>
        <h2>{data.issues.length} nudos normativos</h2>
        {data.issues.map((issue, index) => (
          <article id={issue.id} key={issue.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{issue.name}</h3>
              <p>{issue.summary}</p>
              <small>{issue.sourceIds.length} fuente(s) · {data.instruments.filter((instrument) => instrument.issueIds.includes(issue.id)).length} instrumento(s) conectado(s)</small>
            </div>
            <em>{issueStatusLabels[issue.status]}</em>
          </article>
        ))}
      </section>

      <section className="instrument-section">
        <p className="eyebrow">Instrumentos conectados</p>
        <h2>Instrumentos y problemas de aplicación</h2>
        <div className="instrument-table">
          {data.instruments.map((instrument) => {
            const source = primarySourceFor(instrument, data.sources);
            const packet = data.legalResearchPackets.find((item) => item.instrumentId === instrument.id);
            const locators = data.evidenceRecords.filter((record) => record.entityType === "instrument" && record.entityId === instrument.id);
            return (
              <article key={instrument.id}>
                <div>
                  <strong>{instrument.number}</strong>
                  <h3>{instrument.title}</h3>
                  <p>{instrument.authority} · Publicación: {formatDate(instrument.publishedAt)} · Estado: {instrumentStatusLabels[instrument.status]}</p>
                  <small>{instrument.sourceIds.length} fuente(s) · {locators.length} referencia(s) exacta(s){packet ? " · preguntas de aplicación documentadas" : ""}</small>
                  <div className="instrument-issues">
                    {instrument.issueIds.map((issueId) => {
                      const issue = data.issues.find((item) => item.id === issueId);
                      return issue ? <Link key={issueId} href={`#${issueId}`}>{issue.name}</Link> : null;
                    })}
                  </div>
                </div>
                <span className="review-chip" data-status={instrument.documentaryStatus}>
                  Fuente oficial y pregunta de aplicación
                  <small>Comprobación documental: {formatDate(instrument.lastCheckedAt)} · uso académico, no constituye dictamen ni texto consolidado oficial</small>
                </span>
                {source && (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    Fuente oficial <ArrowSquareOut />
                    <small>{source.institution} · fuente {evidenceLevelLabels[source.evidenceLevel]}</small>
                  </a>
                )}
                {packet && <Link className="packet-link" href="/metodologia#revision">Criterios probatorios <ArrowRight /></Link>}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
