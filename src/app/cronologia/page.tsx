import type { Metadata } from "next";
import { TimelineExplorer } from "@/components/timeline-explorer";
import { loadObservatoryData } from "@/lib/content";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import type { TimelineEvent } from "@/lib/schemas";

export const metadata: Metadata = { title: "Cronología documentada" };

const timelineKindLabels: Record<TimelineEvent["kind"], string> = {
  event: "eventos",
  decision: "decisiones",
  agreement: "acuerdos",
  evidence: "evidencias",
  publication: "publicaciones",
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function uniqueIds(values: string[]) {
  return Array.from(new Set(values));
}

export default function TimelinePage() {
  const data = loadObservatoryData();
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const publicData = { ...data, cases: publicCases };
  const events = publicCases.flatMap((item) => item.timeline.map((event) => ({ ...event, caseId: item.id })));
  const sourceIds = uniqueIds(events.flatMap((event) => event.sourceIds));
  const eventIds = new Set(events.map((event) => event.id));
  const locators = data.evidenceRecords.filter((record) => record.entityType === "timeline" && eventIds.has(record.entityId));
  const kindCounts = events.reduce<Record<TimelineEvent["kind"], number>>((acc, event) => {
    acc[event.kind] += 1;
    return acc;
  }, { event: 0, decision: 0, agreement: 0, evidence: 0, publication: 0 });
  const firstDate = [...events].sort((a, b) => a.date.localeCompare(b.date))[0]?.date;
  const lastDate = [...events].sort((a, b) => b.date.localeCompare(a.date))[0]?.date;

  return (
    <div className="content-page">
      <header className="page-intro">
        <p className="eyebrow">Hitos documentados</p>
        <h1>Cronología documentada</h1>
        <p>
          Cada hito conserva caso, tipo de evento, fuente y referencia precisa cuando está disponible.
          Las decisiones, acuerdos, evidencias y publicaciones se comparan entre casos sin forzar una narrativa única.
        </p>
      </header>

      <section className="timeline-stats" aria-label="Cobertura de la cronología">
        <article>
          <strong>{events.length}</strong>
          <span>Hitos</span>
          <small>{formatDate(firstDate)}–{formatDate(lastDate)}</small>
        </article>
        <article>
          <strong>{sourceIds.length}</strong>
          <span>Fuentes</span>
          <small>Vinculadas directamente a hitos.</small>
        </article>
        <article>
          <strong>{locators.length}</strong>
          <span>Referencias precisas</span>
          <small>Páginas, secciones o artículos vinculados con los hitos.</small>
        </article>
        <article>
          <strong>{Object.entries(kindCounts).map(([kind, count]) => `${count} ${timelineKindLabels[kind as TimelineEvent["kind"]]}`).join(" · ")}</strong>
          <span>Tipos de hito</span>
          <small>Eventos, decisiones, acuerdos, evidencia y publicaciones se mantienen diferenciados.</small>
        </article>
      </section>

      <div className="catalog-note">
        <strong>Regla de lectura:</strong>
        <span>un comunicado o publicación no reemplaza una decisión, acuerdo o evidencia técnica; solo cuenta como hito cuando documenta un cambio en el caso.</span>
      </div>

      <TimelineExplorer data={publicData} />
    </div>
  );
}
