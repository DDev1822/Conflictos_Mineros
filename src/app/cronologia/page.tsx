import type { Metadata } from "next";
import { TimelineExplorer } from "@/components/timeline-explorer";
import { loadObservatoryData } from "@/lib/content";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import type { TimelineEvent } from "@/lib/schemas";

export const metadata: Metadata = { title: "Cronología de conflictos mineros" };

const timelineKindLabels: Record<TimelineEvent["kind"], string> = {
  event: "eventos",
  decision: "decisiones",
  agreement: "acuerdos",
  evidence: "resultados",
  publication: "publicaciones",
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function TimelinePage() {
  const data = loadObservatoryData();
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const publicData = { ...data, cases: publicCases };
  const events = publicCases.flatMap((item) => item.timeline.map((event) => ({ ...event, caseId: item.id })));
  const kindCounts = events.reduce<Record<TimelineEvent["kind"], number>>((acc, event) => {
    acc[event.kind] += 1;
    return acc;
  }, { event: 0, decision: 0, agreement: 0, evidence: 0, publication: 0 });
  const firstDate = [...events].sort((a, b) => a.date.localeCompare(b.date))[0]?.date;
  const lastDate = [...events].sort((a, b) => b.date.localeCompare(a.date))[0]?.date;

  return (
    <div className="content-page">
      <header className="page-intro">
        <p className="eyebrow">Cambios a través del tiempo</p>
        <h1>Cronología de los conflictos mineros</h1>
        <p>
          Compara cuándo comenzaron los conflictos, qué decisiones los modificaron, en qué momento escalaron y qué acuerdos
          o resultados cambiaron su trayectoria.
        </p>
      </header>

      <section className="timeline-stats" aria-label="Cobertura de la cronología">
        <article>
          <strong>{events.length}</strong>
          <span>Hitos</span>
          <small>{formatDate(firstDate)}–{formatDate(lastDate)}</small>
        </article>
        <article><strong>{publicCases.length}</strong><span>Casos</span><small>Conflictos activos, latentes e históricos.</small></article>
        <article><strong>{new Set(publicCases.flatMap((item) => item.issueIds)).size}</strong><span>Problemas conectados</span><small>Agua, salud, acuerdos, participación y control estatal.</small></article>
        <article>
          <strong>{Object.entries(kindCounts).map(([kind, count]) => `${count} ${timelineKindLabels[kind as TimelineEvent["kind"]]}`).join(" · ")}</strong>
          <span>Tipos de hito</span>
          <small>Hechos, decisiones, acuerdos, resultados e informes.</small>
        </article>
      </section>

      <div className="catalog-note"><strong>Usa los filtros para comparar periodos.</strong><span>Selecciona un caso o tipo de hito y abre los enlaces de cada evento para ampliar la información.</span></div>

      <TimelineExplorer data={publicData} />
    </div>
  );
}
