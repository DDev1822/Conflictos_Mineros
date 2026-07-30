import type { Metadata } from "next";
import Link from "next/link";
import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import type { CommitmentComparisonEntry } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Compromisos en conflictos mineros",
  description: "Quién asumió cada compromiso, para qué territorio y qué resultado se reportó.",
};

const themeLabels: Record<CommitmentComparisonEntry["theme"], string> = {
  water: "Agua",
  "environmental-monitoring": "Monitoreo ambiental",
  "social-investment": "Inversión social",
  "employment-capacity": "Empleo y capacidades",
  "dialogue-governance": "Diálogo y gobernanza",
  mobility: "Movilidad",
  formalization: "Formalización",
};

const progressLabels: Record<CommitmentComparisonEntry["implementationEvidence"], string> = {
  "not-located": "Sin resultado público posterior",
  partial: "Avance parcial",
  documented: "Resultado reportado",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function CommitmentsPage() {
  const data = loadObservatoryData();
  const publicCaseIds = new Set(data.cases.filter(isPublishedSocialMiningCase).map((item) => item.id));
  const entries = data.commitmentComparison.entries.filter((entry) => publicCaseIds.has(entry.caseId));
  const caseById = new Map(data.cases.map((item) => [item.id, item]));
  const sourceById = new Map(data.sources.map((item) => [item.id, item]));
  const timelineById = new Map(data.cases.flatMap((item) => item.timeline.map((event) => [event.id, event] as const)));
  const resultCount = entries.filter((entry) => entry.implementationEvidence === "documented").length;
  const partialCount = entries.filter((entry) => entry.implementationEvidence === "partial").length;
  const openCount = entries.filter((entry) => entry.implementationEvidence === "not-located").length;

  return (
    <div className="content-page commitments-page">
      <header className="page-intro commitments-intro">
        <p className="eyebrow">Acuerdos y resultados</p>
        <h1>Quién se comprometió, con qué territorio y qué ocurrió después.</h1>
        <p>
          Los compromisos son una de las zonas más frágiles de los conflictos mineros: cambian autoridades y empresas,
          se multiplican mesas y cada obligación puede quedar repartida entre varias instituciones.
        </p>
      </header>

      <section className="commitment-stats" aria-label="Situación de los compromisos">
        <article><strong>{entries.length}</strong><span>compromisos comparados</span><small>Agua, ambiente, inversión, empleo, diálogo, movilidad y formalización.</small></article>
        <article><strong>{resultCount}</strong><span>con resultado reportado</span><small>Existe una acción o producto posterior asociado.</small></article>
        <article><strong>{partialCount}</strong><span>con avance parcial</span><small>La ejecución cubre solo parte de la obligación.</small></article>
        <article><strong>{openCount}</strong><span>sin resultado público posterior</span><small>Requieren respuesta del actor responsable.</small></article>
      </section>

      <section className="commitment-method" aria-labelledby="commitment-method-heading">
        <div>
          <p className="eyebrow">Dónde se atascan</p>
          <h2 id="commitment-method-heading">Cuatro fallas se repiten entre casos.</h2>
        </div>
        <ol>
          <li><span>01</span><strong>Responsable difuso</strong><small>La obligación depende de varios niveles de gobierno.</small></li>
          <li><span>02</span><strong>Plazo móvil</strong><small>Las mesas reprograman acciones sin resolver el problema.</small></li>
          <li><span>03</span><strong>Cambio de actor</strong><small>Gobiernos, operadores o representantes rotan antes del cierre.</small></li>
          <li><span>04</span><strong>Resultado incompleto</strong><small>Se ejecuta una actividad, pero el servicio o impacto esperado no llega.</small></li>
        </ol>
      </section>

      <section className="commitment-matrix-section" aria-labelledby="commitment-matrix-heading">
        <div className="section-heading">
          <p className="eyebrow">Comparación por obligación</p>
          <h2 id="commitment-matrix-heading">{entries.length} compromisos, sus responsables y su situación.</h2>
        </div>
        <div className="commitment-table-wrap">
          <table className="commitment-table">
            <caption className="sr-only">Compromisos en conflictos mineros y resultados reportados</caption>
            <thead><tr><th>Caso</th><th>Compromiso</th><th>Responsables y territorio</th><th>Situación</th><th>Qué ocurrió</th><th>Enlaces</th></tr></thead>
            <tbody>
              {entries.map((entry) => {
                const item = caseById.get(entry.caseId);
                const event = timelineById.get(entry.timelineEventId);
                if (!item || !event) return null;
                return (
                  <tr key={entry.id}>
                    <td data-label="Caso"><Link className="commitment-case-link" href={`/conflictos/${item.slug}`}>{item.name}</Link><small>{formatDate(event.date)} · {themeLabels[entry.theme]}</small></td>
                    <td data-label="Compromiso"><strong>{entry.title}</strong><p>{entry.commitment}</p></td>
                    <td data-label="Responsables y territorio"><ul>{entry.responsibleActors.map((actor) => <li key={actor}>{actor}</li>)}</ul><small>{entry.territorialScope}</small></td>
                    <td data-label="Situación"><span className="commitment-evidence" data-evidence={entry.implementationEvidence}>{progressLabels[entry.implementationEvidence]}</span></td>
                    <td data-label="Qué ocurrió"><p>{entry.evidenceSummary}</p></td>
                    <td data-label="Enlaces">
                      <div className="commitment-sources">
                        {entry.sourceIds.map((sourceId) => {
                          const source = sourceById.get(sourceId);
                          return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">{source.institution}<ArrowSquareOut size={12} /></a> : null;
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
