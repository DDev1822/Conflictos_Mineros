import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowSquareOut, CalendarBlank, MapPin, Scales } from "@phosphor-icons/react/dist/ssr";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getCaseBySlug, loadNarrative, loadObservatoryData } from "@/lib/content";
import { StatusPill } from "@/components/status-pill";

export function generateStaticParams() { return loadObservatoryData().cases.map((item) => ({ slug: item.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const item = getCaseBySlug(slug); return { title: item?.name ?? "Expediente" };
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getCaseBySlug(slug); if (!item) notFound();
  const data = loadObservatoryData();
  const territories = data.territories.filter((entry) => item.territoryIds.includes(entry.id));
  const actors = data.actors.filter((entry) => item.actorIds.includes(entry.id));
  const issues = data.issues.filter((entry) => item.issueIds.includes(entry.id));
  const sources = data.sources.filter((entry) => [...item.claims.flatMap((claim) => claim.sourceIds), ...item.timeline.flatMap((event) => event.sourceIds)].includes(entry.id));
  const reviewLabel = item.reviewStatus === "legal-verified" ? `Jurídica verificada · ${item.legalReviewedAt} · ${item.legalReviewedBy}` : item.reviewStatus === "legal-pending" ? "Jurídica pendiente" : "Revisión documental";
  return <article className="dossier-page"><div className="dossier-hero"><Link className="back-link" href="/conflictos"><ArrowLeft />Todos los casos</Link><div className="dossier-title"><div><p className="eyebrow">Expediente territorial</p><h1>{item.name}</h1><p>{item.summary}</p></div><StatusPill status={item.status} /></div><dl className="dossier-meta"><div><MapPin /><dt>Territorio</dt><dd>{territories.map((entry) => entry.name).join(", ")}</dd></div><div><CalendarBlank /><dt>Periodo</dt><dd>{item.period.start}–{item.period.end ?? "actualidad"}</dd></div><div><Scales /><dt>Revisión</dt><dd>{reviewLabel}</dd></div></dl></div><div className="dossier-layout"><div className="dossier-main"><section className="prose"><MDXRemote source={loadNarrative(slug)} /></section><section><p className="eyebrow">Cronología documentada</p><h2>Hitos del expediente</h2><ol className="vertical-timeline">{item.timeline.map((event) => <li key={event.id}><time>{event.date}</time><div><h3>{event.title}</h3><p>{event.summary}</p></div></li>)}</ol></section><section><p className="eyebrow">Trazabilidad</p><h2>Afirmaciones centrales</h2><div className="claim-list">{item.claims.map((claim) => <div key={claim.id}><span className={`claim-kind ${claim.kind}`}>{claim.kind === "fact" ? "Hecho" : claim.kind === "interpretation" ? "Interpretación" : "Propuesta"}</span><p>{claim.text}</p><small>{claim.sourceIds.length} fuente(s) vinculada(s)</small></div>)}</div></section></div><aside className="dossier-aside"><section><h2>Nudos relacionados</h2>{issues.map((issue) => <Link href={`/normativa#${issue.id}`} key={issue.id}>{issue.name}</Link>)}</section><section><h2>Actores identificados</h2>{actors.map((actor) => <div key={actor.id}><strong>{actor.name}</strong><small>{actor.type}</small></div>)}</section><section><h2>Fuentes iniciales</h2>{sources.map((source) => <a href={source.url} key={source.id} target="_blank" rel="noreferrer">{source.institution}<ArrowSquareOut /></a>)}</section><p className="review-note">Actualizado: {item.updatedAt}. {reviewLabel}. {item.legalReviewNotes}</p></aside></div></article>;
}
