import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, BookOpenText, CalendarBlank, MapPin, Scales } from "@phosphor-icons/react/dist/ssr";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCaseBySlug, loadNarrative, loadObservatoryData } from "@/lib/content";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import { StatusPill } from "@/components/status-pill";
import type { Claim, Source, TimelineEvent } from "@/lib/schemas";

export function generateStaticParams() {
  return loadObservatoryData().cases.filter(isPublishedSocialMiningCase).map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCaseBySlug(slug);
  return { title: item?.name ?? "Caso" };
}

const claimLabels: Record<Claim["kind"], string> = {
  fact: "Dato",
  interpretation: "Lectura",
  proposal: "Alternativa",
};

const timelineKindLabels: Record<TimelineEvent["kind"], string> = {
  event: "hecho",
  decision: "decisión",
  agreement: "acuerdo",
  evidence: "resultado",
  publication: "informe",
};

const actorTypeLabels = {
  state: "Estado",
  community: "Comunidad",
  company: "Empresa",
  "civil-society": "Sociedad civil",
  academic: "Academia",
  collective: "Colectivo",
};

const degreeLabels = {
  pregrado: "Pregrado",
  maestria: "Maestría",
  doctorado: "Doctorado",
} as const;

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCaseBySlug(slug);
  if (!item || !isPublishedSocialMiningCase(item)) notFound();

  const data = loadObservatoryData();
  const packet = data.caseResearchPackets.find((entry) => entry.caseId === item.id);
  const territories = data.territories.filter((entry) => item.territoryIds.includes(entry.id));
  const actors = data.actors.filter((entry) => item.actorIds.includes(entry.id));
  const issues = data.issues.filter((entry) => item.issueIds.includes(entry.id));
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const academicReadings = data.academicResearch
    .filter((entry) => entry.caseSlugs.includes(slug))
    .sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, "es"));

  return (
    <article className="dossier-page">
      <div className="dossier-hero">
        <Link className="back-link" href="/conflictos"><ArrowLeft />Todos los casos</Link>
        <div className="dossier-title">
          <div><p className="eyebrow">Caso social minero</p><h1>{item.name}</h1><p>{item.summary}</p></div>
          <StatusPill status={item.status} />
        </div>
        <dl className="dossier-meta">
          <div><MapPin /><dt>Territorio</dt><dd>{territories.map((entry) => entry.name).join(", ")}</dd></div>
          <div><CalendarBlank /><dt>Periodo analizado</dt><dd>hasta {formatDate(packet?.cutoffDate ?? item.cutoffDate)}</dd></div>
          <div><Scales /><dt>Temas centrales</dt><dd>{issues.map((issue) => issue.name).join(" · ")}</dd></div>
        </dl>
      </div>

      <div className="dossier-layout">
        <div className="dossier-main">
          <section className="prose"><MDXRemote source={loadNarrative(slug)} /></section>

          {packet && (
            <section className="case-status-summary">
              <p className="eyebrow">Situación actual</p>
              <h2>Qué cambió y qué permanece abierto</h2>
              <p>{packet.currentStatusSummary}</p>
              <div className="case-status-grid">
                <article><strong>{item.timeline.length}</strong><span>hitos</span><small>Decisiones, acuerdos y cambios del caso.</small></article>
                <article><strong>{actors.length}</strong><span>actores</span><small>Estado, comunidades, empresas y organizaciones.</small></article>
                <article><strong>{issues.length}</strong><span>problemas centrales</span><small>Agua, territorio, salud, acuerdos o control público.</small></article>
                <article><strong>{academicReadings.length}</strong><span>investigaciones</span><small>Lecturas universitarias vinculadas.</small></article>
              </div>
            </section>
          )}

          <section>
            <p className="eyebrow">Secuencia del conflicto</p>
            <h2>Hitos que modificaron el caso</h2>
            <ol className="vertical-timeline">
              {item.timeline.map((event) => {
                const eventSources = event.sourceIds.map((sourceId) => sourceById.get(sourceId)).filter((source): source is Source => Boolean(source) && source?.id !== "metodologia-observatorio");
                return (
                  <li key={event.id} id={event.id}>
                    <time dateTime={event.date}>{formatDate(event.date)}</time>
                    <div>
                      <span className="timeline-kind">{timelineKindLabels[event.kind]}</span>
                      <h3>{event.title}</h3>
                      <p>{event.summary}</p>
                      <div className="timeline-card-sources" aria-label={`Enlaces relacionados con ${event.title}`}>
                        {eventSources.map((source) => (
                          <a key={source.id} href={source.url} target="_blank" rel="noreferrer">
                            <strong>{source.institution}</strong><small>{source.title}</small><ArrowSquareOut size={13} aria-hidden />
                          </a>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <p className="eyebrow">Hallazgos centrales</p>
            <h2>Datos, lecturas y alternativas</h2>
            <div className="claim-list">
              {item.claims.map((claim) => (
                <div key={claim.id}>
                  <span className={`claim-kind ${claim.kind}`}>{claimLabels[claim.kind]}</span>
                  <p>{claim.text}</p>
                  <div className="claim-source-links">
                    {claim.sourceIds.map((sourceId) => {
                      const source = sourceById.get(sourceId);
                      return source && source.id !== "metodologia-observatorio" ? <a key={source.id} href={source.url} target="_blank" rel="noreferrer">{source.institution} <ArrowSquareOut size={12} /></a> : null;
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {academicReadings.length > 0 && (
            <section className="case-academic-readings" aria-labelledby="case-academic-title">
              <header>
                <div><p className="eyebrow">Investigación académica</p><h2 id="case-academic-title">{academicReadings.length} estudios relacionados</h2><p>Perspectivas sobre impactos, instituciones, actores y evolución del conflicto.</p></div>
                <Link href="/biblioteca"><BookOpenText aria-hidden /> Explorar biblioteca</Link>
              </header>
              <div className="case-academic-grid">
                {academicReadings.map((reading) => (
                  <article className="case-academic-card" key={reading.id}>
                    <div><span>{degreeLabels[reading.degreeLevel]}</span><span>{reading.year}</span></div>
                    <h3>{reading.title}</h3>
                    <p className="case-academic-byline">{reading.authors.join(" · ")}</p>
                    <p className="case-academic-institution">{reading.university}</p>
                    <p>{reading.editorialSummary}</p>
                    <a href={reading.recordUrl} target="_blank" rel="noreferrer">Abrir estudio <ArrowSquareOut aria-hidden /></a>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="dossier-aside">
          <section><h2>Temas críticos</h2>{issues.map((issue) => <Link href={`/normativa#${issue.id}`} key={issue.id}>{issue.name}</Link>)}</section>
          <section><h2>Actores</h2>{actors.map((actor) => <div key={actor.id}><strong>{actor.name}</strong><small>{actorTypeLabels[actor.type]}</small></div>)}</section>
          <p className="review-note">Última actualización del caso: {formatDate(item.updatedAt)}.</p>
        </aside>
      </div>
    </article>
  );
}
