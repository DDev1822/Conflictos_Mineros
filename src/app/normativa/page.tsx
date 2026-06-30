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
  "in-force": "vigente",
  modified: "modificada",
  repealed: "derogada",
  "pending-review": "pendiente de revisión",
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
          Catálogo V1 con {data.instruments.length} instrumentos, {data.issues.length} nudos normativos y {preparedPackets} paquetes normativos preparados.
          La página organiza textos oficiales, fuentes, locadores y preguntas abiertas; no emite dictámenes ni determina responsabilidades.
        </p>
      </header>

      <section className="norm-stats" aria-label="Estado del catálogo normativo">
        <article>
          <strong>{data.instruments.length}</strong>
          <span>Instrumentos</span>
          <small>{instrumentsWithLocators} con locadores documentales.</small>
        </article>
        <article>
          <strong>{data.issues.length}</strong>
          <span>Nudos</span>
          <small>Taxonomía transversal del observatorio.</small>
        </article>
        <article>
          <strong>{preparedPackets}</strong>
          <span>Paquetes normativos</span>
          <small>Preparados para lectura documental.</small>
        </article>
      </section>

      <div className="legal-warning">
        <WarningCircle size={24} />
        <div>
          <strong>Último contraste documental: {formatDate(latestCheck)}</strong>
          <p>Este catálogo expone información pública y trazable. No sustituye asesoría jurídica, sentencia, dictamen ni texto consolidado oficial.</p>
        </div>
      </div>

      <section className="issue-index">
        <p className="eyebrow">Taxonomía transversal</p>
        <h2>Diez nudos normativos</h2>
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
        <h2>Catálogo normativo inicial</h2>
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
                  <small>{instrument.sourceIds.length} fuente(s) · {locators.length} locador(es) · paquete normativo {packet?.status ?? "no registrado"}</small>
                  <div className="instrument-issues">
                    {instrument.issueIds.map((issueId) => {
                      const issue = data.issues.find((item) => item.id === issueId);
                      return issue ? <Link key={issueId} href={`#${issueId}`}>{issue.name}</Link> : null;
                    })}
                  </div>
                </div>
                <span className="review-chip" data-status={instrument.legalReviewStatus}>
                  Texto oficial y alcance documental
                  <small>Contraste documental: {formatDate(instrument.lastCheckedAt)} · no constituye dictamen ni texto consolidado oficial</small>
                </span>
                {source && (
                  <a href={source.url} target="_blank" rel="noreferrer">
                    Fuente oficial <ArrowSquareOut />
                    <small>{source.institution} · {source.evidenceLevel}</small>
                  </a>
                )}
                {packet && <Link className="packet-link" href="/metodologia#revision">Alcance y metodología <ArrowRight /></Link>}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
