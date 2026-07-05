import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, CalendarBlank, MapPin, Scales } from "@phosphor-icons/react/dist/ssr";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCaseBySlug, loadNarrative, loadObservatoryData } from "@/lib/content";
import { StatusPill } from "@/components/status-pill";
import type { CaseResearchPacket, Claim, ConflictCase, EvidenceRecord, Source, TimelineEvent } from "@/lib/schemas";

export function generateStaticParams() {
  return loadObservatoryData().cases.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getCaseBySlug(slug);
  return { title: item?.name ?? "Expediente" };
}

const caseReviewLabels: Record<ConflictCase["reviewStatus"], string> = {
  documentary: "Revisión documental",
  "legal-pending": "Contraste documental",
  "legal-verified": "Contraste documentado",
};

const claimLabels: Record<Claim["kind"], string> = {
  fact: "Hecho",
  interpretation: "Interpretación",
  proposal: "Propuesta",
};

const verificationLabels: Record<Claim["verificationStatus"], string> = {
  verified: "verificada",
  partial: "parcial",
  pending: "pendiente",
};

const timelineKindLabels: Record<TimelineEvent["kind"], string> = {
  event: "evento",
  decision: "decisión",
  agreement: "acuerdo",
  evidence: "evidencia",
  publication: "publicación",
};

const sourceTypeLabels: Record<Source["type"], string> = {
  official: "Oficial",
  academic: "Academia",
  community: "Comunidad",
  company: "Empresa",
  ngo: "Sociedad civil",
  press: "Prensa",
};

const evidenceRelationLabels: Record<EvidenceRecord["relation"], string> = {
  supports: "sostiene",
  qualifies: "matiza",
  contradicts: "contradice",
};

const actorTypeLabels = {
  state: "Estado",
  community: "Comunidad",
  company: "Empresa",
  "civil-society": "Sociedad civil",
  academic: "Academia",
  collective: "Colectivo",
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values));
}

function reviewLabel(item: ConflictCase) {
  if (item.reviewStatus === "legal-verified") return `Contraste documentado · ${formatDate(item.legalReviewedAt)} · ${item.legalReviewedBy}`;
  if (item.reviewStatus === "legal-pending") return "Contraste documental";
  return "Revisión documental";
}

function publicReviewNote(note: string) {
  return note
    .replaceAll("responsabilidades legales no verificadas", "responsabilidades no documentadas por la fuente");
}

function sourceMeta(source: Source) {
  return `${source.institution} · ${source.evidenceLevel} · ${formatDate(source.date)}`;
}

function linkedSources(item: ConflictCase, packet: CaseResearchPacket | undefined, sources: Source[]) {
  const sourceIds = uniqueIds([
    ...(packet?.sourceIds ?? []),
    ...item.claims.flatMap((claim) => claim.sourceIds),
    ...item.timeline.flatMap((event) => event.sourceIds),
  ]);

  return sourceIds
    .map((sourceId) => sources.find((source) => source.id === sourceId))
    .filter((source): source is Source => Boolean(source));
}

function linkedEvidenceRecords(item: ConflictCase, packet: CaseResearchPacket | undefined, records: EvidenceRecord[]) {
  const entityIds = new Set([item.id, ...item.timeline.map((event) => event.id), ...item.claims.map((claim) => claim.id)]);
  const packetSourceIds = new Set(packet?.sourceIds ?? []);
  const seen = new Set<string>();

  return records.filter((record) => {
    const matches = entityIds.has(record.entityId) || packetSourceIds.has(record.sourceId);
    if (!matches || seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCaseBySlug(slug);
  if (!item) notFound();

  const data = loadObservatoryData();
  const packet = data.caseResearchPackets.find((entry) => entry.caseId === item.id);
  const territories = data.territories.filter((entry) => item.territoryIds.includes(entry.id));
  const actors = data.actors.filter((entry) => item.actorIds.includes(entry.id));
  const issues = data.issues.filter((entry) => item.issueIds.includes(entry.id));
  const sources = linkedSources(item, packet, data.sources);
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const evidenceRecords = linkedEvidenceRecords(item, packet, data.evidenceRecords);
  const verifiedClaims = item.claims.filter((claim) => claim.verificationStatus === "verified").length;
  const directActorSources = packet?.directActorSourceIds.length ?? 0;
  const openContradictions = packet?.contradictions.filter((entry) => entry.status === "open").length ?? 0;
  const blockingGaps = packet?.gaps.filter((gap) => gap.blocksRelease).length ?? 0;

  return (
    <article className="dossier-page">
      <div className="dossier-hero">
        <Link className="back-link" href="/conflictos"><ArrowLeft />Todos los casos</Link>
        <div className="dossier-title">
          <div>
            <p className="eyebrow">Expediente territorial</p>
            <h1>{item.name}</h1>
            <p>{item.summary}</p>
          </div>
          <StatusPill status={item.status} />
        </div>
        <dl className="dossier-meta">
          <div><MapPin /><dt>Territorio</dt><dd>{territories.map((entry) => entry.name).join(", ")}</dd></div>
          <div><CalendarBlank /><dt>Corte documental</dt><dd>{formatDate(packet?.cutoffDate ?? item.cutoffDate)}</dd></div>
          <div><Scales /><dt>Revisión</dt><dd>{reviewLabel(item)}</dd></div>
        </dl>
      </div>

      <div className="dossier-layout">
        <div className="dossier-main">
          <section className="prose">
            <MDXRemote source={loadNarrative(slug)} />
          </section>

          {packet && (
            <section className="case-status-summary">
              <p className="eyebrow">Estado documentado al corte</p>
              <h2>Lectura actual del expediente</h2>
              <p>{packet.currentStatusSummary}</p>
              <div className="case-status-grid">
                <article><strong>{sources.length}</strong><span>Fuentes</span><small>{directActorSources} actorales directas.</small></article>
                <article><strong>{evidenceRecords.length}</strong><span>Locadores</span><small>{evidenceRecords.filter((record) => record.reviewStatus === "reviewed").length} revisados.</small></article>
                <article><strong>{openContradictions}</strong><span>Contradicciones</span><small>Abiertas y atribuidas.</small></article>
                <article><strong>{blockingGaps}</strong><span>Vacíos bloqueantes</span><small>No se ocultan en la V1.</small></article>
              </div>
            </section>
          )}

          <section>
            <p className="eyebrow">Cronología documentada</p>
            <h2>Hitos del expediente</h2>
            <ol className="vertical-timeline">
              {item.timeline.map((event) => {
                const eventSources = event.sourceIds
                  .map((sourceId) => sourceById.get(sourceId))
                  .filter((source): source is Source => Boolean(source));
                const directLocators = data.evidenceRecords.filter(
                  (record) => record.entityType === "timeline" && record.entityId === event.id,
                );
                const eventLocators = directLocators.length
                  ? directLocators
                  : data.evidenceRecords.filter((record) => event.sourceIds.includes(record.sourceId)).slice(0, 2);

                return (
                  <li key={event.id} id={event.id}>
                    <time dateTime={event.date}>{formatDate(event.date)}</time>
                    <div>
                      <span className="timeline-kind">{timelineKindLabels[event.kind]} · {event.sourceIds.length} fuente(s)</span>
                      <h3>{event.title}</h3>
                      <p>{event.summary}</p>

                      <div className="timeline-card-evidence" aria-label={`Trazabilidad documental de ${event.title}`}>
                        <span>{eventSources.length} documento(s) disponible(s)</span>
                        <span>{eventLocators.length} locador(es) de evidencia</span>
                      </div>

                      <div className="timeline-card-sources" aria-label={`Documentos vinculados al hito ${event.title}`}>
                        {eventSources.map((source) => (
                          <a
                            key={source.id}
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            title={source.title}
                            aria-label={`Abrir documento: ${source.title}. ${source.institution}`}
                          >
                            <strong>{source.title}</strong>
                            <small>{source.institution} · {sourceTypeLabels[source.type]} · {formatDate(source.date)}</small>
                            <ArrowSquareOut size={13} aria-hidden />
                          </a>
                        ))}
                      </div>

                      {eventLocators.length > 0 && (
                        <div className="timeline-locators" aria-label={`Locadores de evidencia de ${event.title}`}>
                          {eventLocators.map((record) => (
                            <section key={record.id}>
                              <strong>{evidenceRelationLabels[record.relation]} · {record.locator}</strong>
                              <small>{record.summary}</small>
                            </section>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          <section>
            <p className="eyebrow">Trazabilidad</p>
            <h2>Afirmaciones centrales</h2>
            <div className="claim-list">
              {item.claims.map((claim) => (
                <div key={claim.id}>
                  <span className={`claim-kind ${claim.kind}`}>{claimLabels[claim.kind]}</span>
                  <p>{claim.text}</p>
                  <small>{claim.sourceIds.length} fuente(s) · verificación {verificationLabels[claim.verificationStatus]}{claim.verifiedAt ? ` · ${formatDate(claim.verifiedAt)}` : ""}</small>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="dossier-aside">
          <section>
            <h2>Nudos relacionados</h2>
            {issues.map((issue) => <Link href={`/normativa#${issue.id}`} key={issue.id}>{issue.name}</Link>)}
          </section>
          <section>
            <h2>Actores identificados</h2>
            {actors.map((actor) => <div key={actor.id}><strong>{actor.name}</strong><small>{actorTypeLabels[actor.type]}</small></div>)}
          </section>
          <section>
            <h2>Fuentes documentales</h2>
            <div className="source-stack">
              {sources.slice(0, 8).map((source) => (
                <a href={source.url} key={source.id} target="_blank" rel="noreferrer">
                  <span><strong>{source.institution}</strong><small>{source.title}</small><em>{sourceMeta(source)}</em></span>
                  <ArrowSquareOut />
                </a>
              ))}
            </div>
          </section>
          <section>
            <h2>Locadores de evidencia</h2>
            <div className="locator-stack">
              {evidenceRecords.slice(0, 6).map((record) => (
                <article key={record.id}>
                  <strong>{evidenceRelationLabels[record.relation]} · {record.locator}</strong>
                  <small>{record.summary}</small>
                </article>
              ))}
            </div>
          </section>
          {packet && (
            <section>
              <h2>Preguntas de alcance</h2>
              <ul className="question-list">
                {packet.scopeQuestions.slice(0, 4).map((question) => <li key={question}>{question}</li>)}
              </ul>
            </section>
          )}
          <p className="review-note">
            Actualizado: {formatDate(item.updatedAt)}. {caseReviewLabels[item.reviewStatus]}. {verifiedClaims}/{item.claims.length} afirmaciones verificadas. {publicReviewNote(item.legalReviewNotes)}
          </p>
        </aside>
      </div>
    </article>
  );
}
