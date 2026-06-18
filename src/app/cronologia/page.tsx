import type { Metadata } from "next";
import Link from "next/link";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = { title: "Cronología comparada" };

export default function TimelinePage() {
  const data = loadObservatoryData();
  const events = data.cases.flatMap((item) => item.timeline.map((event) => ({ ...event, case: item }))).sort((a, b) => a.date.localeCompare(b.date));
  return <div className="content-page"><header className="page-intro"><p className="eyebrow">Historia comparada</p><h1>Cronología de los casos piloto</h1><p>Los hitos permiten observar recurrencias: evaluación ambiental, escalamiento, diálogo, reformas y nuevas controversias.</p></header><div className="chronology">{events.map((event) => <article key={event.id}><time>{event.date}</time><div><Link href={`/conflictos/${event.case.slug}`}>{event.case.name}</Link><h2>{event.title}</h2><p>{event.summary}</p><small>{event.sourceIds.length} fuente(s) vinculada(s)</small></div></article>)}</div></div>;
}
