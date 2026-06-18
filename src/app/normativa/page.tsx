import type { Metadata } from "next";
import { ArrowSquareOut, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = { title: "Normativa y nudos" };

export default function NormsPage() {
  const data = loadObservatoryData();
  return <div className="content-page"><header className="page-intro"><p className="eyebrow">Marco normativo vivo</p><h1>Normas, implementación y controversias</h1><p>El catálogo distingue la existencia de una norma de su interpretación, aplicación y revisión jurídica. Ninguna ficha pendiente se presenta como asesoría legal.</p></header><div className="legal-warning"><WarningCircle size={24} /><div><strong>Fecha de corte: 17 de junio de 2026</strong><p>Las fichas iniciales requieren revisión jurídica especializada antes de la apertura pública.</p></div></div><section className="issue-index"><p className="eyebrow">Taxonomía transversal</p><h2>Diez nudos normativos</h2>{data.issues.map((issue, index) => <article id={issue.id} key={issue.id}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{issue.name}</h3><p>{issue.summary}</p></div><em>{issue.status === "structural" ? "Estructural" : issue.status === "active-debate" ? "Debate activo" : "Brecha de implementación"}</em></article>)}</section><section className="instrument-section"><p className="eyebrow">Instrumentos conectados</p><h2>Catálogo normativo inicial</h2><div className="instrument-table">{data.instruments.map((instrument) => <article key={instrument.id}><div><strong>{instrument.number}</strong><h3>{instrument.title}</h3><p>{instrument.authority} · Publicación: {instrument.publishedAt}</p></div><span className="review-chip">Revisión jurídica pendiente</span><a href={data.sources.find((source) => instrument.sourceIds.includes(source.id))?.url}>Fuente oficial <ArrowSquareOut /></a></article>)}</div></section></div>;
}
