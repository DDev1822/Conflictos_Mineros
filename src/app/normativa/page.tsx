import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut, Gavel, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
import type { LegalInstrument, NormativeIssue, Source } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Normas y problemas de aplicación",
  description: "Reglas que ordenan formalización, agua, fiscalización, participación y obligaciones mineras.",
};

const issueStatusLabels: Record<NormativeIssue["status"], string> = {
  structural: "Problema estructural",
  "active-debate": "Debate activo",
  "implementation-gap": "Falla de implementación",
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function primarySourceFor(instrument: LegalInstrument, sources: Source[]) {
  const linked = instrument.sourceIds.map((id) => sources.find((source) => source.id === id)).filter((source): source is Source => Boolean(source));
  return linked.find((source) => source.evidenceLevel === "primary") ?? linked[0];
}

export default function NormsPage() {
  const data = loadObservatoryData();
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));

  return (
    <div className="content-page">
      <header className="page-intro">
        <p className="eyebrow">Reglas y capacidad estatal</p>
        <h1>Las normas cambian; los problemas de aplicación permanecen.</h1>
        <p>
          Formalización, agua, consulta, fiscalización y compromisos reparten funciones entre sectores y niveles de gobierno.
          La debilidad aparece cuando nadie coordina la decisión completa o cuando la obligación carece de presupuesto, plazo y responsable operativo.
        </p>
      </header>

      <section className="norm-stats" aria-label="Problemas normativos">
        <article><strong>{data.issues.length}</strong><span>problemas recurrentes</span><small>Diseño, competencias y aplicación.</small></article>
        <article><strong>{data.instruments.length}</strong><span>reglas principales</span><small>Con acceso al texto oficial.</small></article>
        <article><strong>3</strong><span>niveles decisivos</span><small>Gobierno nacional, gobiernos regionales y gobiernos locales.</small></article>
      </section>

      <section className="issue-index">
        <p className="eyebrow">Dónde fallan las reglas</p>
        <h2>{data.issues.length} nudos que reaparecen en distintos conflictos</h2>
        {data.issues.map((issue, index) => (
          <article id={issue.id} key={issue.id}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h3>{issue.name}</h3><p>{issue.summary}</p>
              <div className="issue-source-links">
                {issue.sourceIds.map((sourceId) => {
                  const source = sourceById.get(sourceId);
                  return source ? <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.institution}<ArrowSquareOut size={12} /></a> : null;
                })}
              </div>
            </div>
            <em>{issueStatusLabels[issue.status]}</em>
          </article>
        ))}
      </section>

      <section className="instrument-section">
        <p className="eyebrow">Reglas principales</p>
        <h2>Qué ordena cada instrumento y a qué problema responde</h2>
        <div className="instrument-table">
          {data.instruments.map((instrument) => {
            const source = primarySourceFor(instrument, data.sources);
            return (
              <article key={instrument.id}>
                <div>
                  <Gavel size={23} />
                  <strong>{instrument.number}</strong>
                  <h3>{instrument.title}</h3>
                  <p>{instrument.authority} · {formatDate(instrument.publishedAt)}</p>
                  <div className="instrument-issues">
                    {instrument.issueIds.map((issueId) => {
                      const issue = data.issues.find((item) => item.id === issueId);
                      return issue ? <Link key={issueId} href={`#${issueId}`}>{issue.name}</Link> : null;
                    })}
                  </div>
                </div>
                {source && <a href={source.url} target="_blank" rel="noreferrer">Abrir texto oficial <ArrowSquareOut /><small>{source.institution}</small></a>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="legal-warning">
        <WarningCircle size={24} />
        <div><strong>El problema central es la implementación.</strong><p>Una regla efectiva necesita autoridad competente, presupuesto, información compartida, fiscalización y consecuencias cuando la obligación no se cumple.</p></div>
      </section>
    </div>
  );
}
