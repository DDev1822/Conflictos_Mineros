import type { Metadata } from "next";
import Link from "next/link";
import { loadObservatoryData } from "@/lib/content";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import type { CommitmentComparisonEntry } from "@/lib/schemas";

export const metadata: Metadata = {
  title: "Comparación transversal de compromisos",
  description: "Comparación académica de acuerdos documentados, seguimiento y evidencia de ejecución en conflictos sociales mineros.",
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

const basisLabels: Record<CommitmentComparisonEntry["documentBasis"], string> = {
  "contract-condition": "Condición contractual",
  agreement: "Acuerdo",
  convention: "Convenio",
  "work-plan": "Plan de trabajo",
  "public-record": "Registro público",
};

const stageLabels: Record<CommitmentComparisonEntry["documentaryStage"], string> = {
  "condition-documented": "Condición documentada",
  "agreement-documented": "Acuerdo documentado",
  "follow-up-documented": "Seguimiento documentado",
  "result-documented": "Resultado puntual documentado",
};

const implementationLabels: Record<CommitmentComparisonEntry["implementationEvidence"], string> = {
  "not-located": "Ejecución no localizada",
  partial: "Evidencia parcial",
  documented: "Ejecución documentada",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export default function CommitmentsPage() {
  const data = loadObservatoryData();
  const comparison = data.commitmentComparison;
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const publicCaseIds = new Set(publicCases.map((item) => item.id));
  const entries = comparison.entries.filter((entry) => publicCaseIds.has(entry.caseId));
  const caseById = new Map(data.cases.map((item) => [item.id, item]));
  const sourceById = new Map(data.sources.map((item) => [item.id, item]));
  const timelineById = new Map(data.cases.flatMap((item) => item.timeline.map((event) => [event.id, event] as const)));
  const coveredCaseIds = new Set(entries.map((entry) => entry.caseId));
  const themeCount = new Set(entries.map((entry) => entry.theme)).size;
  const partialOrDocumented = entries.filter((entry) => entry.implementationEvidence !== "not-located").length;
  const excludedCaseNames = comparison.excludedCaseIds.filter((caseId) => publicCaseIds.has(caseId)).map((caseId) => caseById.get(caseId)?.name).filter((name): name is string => Boolean(name));
  const excludedCasesLabel = new Intl.ListFormat("es-PE", { style: "long", type: "conjunction" }).format(excludedCaseNames);

  return (
    <div className="content-page commitments-page">
      <header className="page-intro commitments-intro">
        <p className="eyebrow">Lectura transversal · conflictos sociales mineros</p>
        <h1>Compromisos: documento, seguimiento y evidencia no son lo mismo.</h1>
        <p>
          Esta comparación reúne compromisos públicos vinculados con los casos documentados. No califica buena fe,
          consenso ni cumplimiento integral: muestra qué documento existe, qué seguimiento fue localizado
          y qué permanece sin demostrar al corte {formatDate(comparison.cutoffDate)}.
        </p>
      </header>

      <section className="commitment-stats" aria-label="Cobertura de la comparación">
        <article><strong>{entries.length}</strong><span>Unidades comparadas</span><small>Compromisos seleccionados con fuente trazable.</small></article>
        <article><strong>{coveredCaseIds.size}/{publicCases.length}</strong><span>Casos cubiertos</span><small>Sin forzar equivalencias donde no existe un registro comparable.</small></article>
        <article><strong>{themeCount}</strong><span>Temas</span><small>Agua, ambiente, inversión, empleo, diálogo, movilidad y formalización.</small></article>
        <article><strong>{partialOrDocumented}</strong><span>Con evidencia posterior</span><small>Parcial o puntual; nunca equivale automáticamente a cumplimiento integral.</small></article>
      </section>

      <section className="commitment-method" aria-labelledby="commitment-method-heading">
        <div>
          <p className="eyebrow">Regla de lectura</p>
          <h2 id="commitment-method-heading">Cuatro escalones documentales</h2>
          <p>{comparison.methodology}</p>
        </div>
        <ol>
          <li><span>01</span><strong>Condición</strong><small>El documento fija un paso previo o futuro.</small></li>
          <li><span>02</span><strong>Acuerdo</strong><small>Existe una decisión o compromiso registrado.</small></li>
          <li><span>03</span><strong>Seguimiento</strong><small>Hay comité, acta posterior o actividad de control.</small></li>
          <li><span>04</span><strong>Resultado</strong><small>Solo acredita el resultado puntual expresamente documentado.</small></li>
        </ol>
      </section>

      <section className="commitment-matrix-section" aria-labelledby="commitment-matrix-heading">
        <div className="section-heading">
          <p className="eyebrow">Comparación documental</p>
          <h2 id="commitment-matrix-heading">{entries.length} compromisos, con su evidencia y su límite a la vista.</h2>
          <p>
            La comparación preserva el lenguaje de las fuentes. “No localizado” significa que las fuentes reunidas para el caso
            no muestran evidencia posterior; no demuestra incumplimiento.
          </p>
        </div>

        <div className="commitment-table-wrap">
          <table className="commitment-table">
            <caption className="sr-only">Comparación transversal de compromisos documentados en conflictos sociales mineros</caption>
            <thead>
              <tr>
                <th scope="col">Caso e hito</th>
                <th scope="col">Compromiso</th>
                <th scope="col">Responsables y ámbito</th>
                <th scope="col">Etapa documental</th>
                <th scope="col">Evidencia de ejecución</th>
                <th scope="col">Límite y fuentes</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => {
                const item = caseById.get(entry.caseId);
                const event = timelineById.get(entry.timelineEventId);
                if (!item || !event) return null;
                return (
                  <tr key={entry.id}>
                    <td data-label="Caso e hito">
                      <Link className="commitment-case-link" href={`/conflictos/${item.slug}`}>{item.name}</Link>
                      <strong>{entry.title}</strong>
                      <small>{formatDate(event.date)} · {themeLabels[entry.theme]}</small>
                    </td>
                    <td data-label="Compromiso">
                      <p>{entry.commitment}</p>
                      <span className="commitment-basis">{basisLabels[entry.documentBasis]}</span>
                    </td>
                    <td data-label="Responsables y ámbito">
                      <ul>{entry.responsibleActors.map((actor) => <li key={actor}>{actor}</li>)}</ul>
                      <small>{entry.territorialScope}</small>
                    </td>
                    <td data-label="Etapa documental">
                      <span className="commitment-stage" data-stage={entry.documentaryStage}>
                        {stageLabels[entry.documentaryStage]}
                      </span>
                    </td>
                    <td data-label="Evidencia de ejecución">
                      <span className="commitment-evidence" data-evidence={entry.implementationEvidence}>
                        {implementationLabels[entry.implementationEvidence]}
                      </span>
                      <p>{entry.evidenceSummary}</p>
                    </td>
                    <td data-label="Límite y fuentes">
                      <p>{entry.limit}</p>
                      <div className="commitment-sources">
                        {entry.sourceIds.map((sourceId) => {
                          const source = sourceById.get(sourceId);
                          return source ? <a key={sourceId} href={source.url} target="_blank" rel="noreferrer">{source.institution}</a> : null;
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

      <section className="commitment-coverage" aria-labelledby="commitment-coverage-heading">
        <div>
          <p className="eyebrow">Cobertura declarada</p>
          <h2 id="commitment-coverage-heading">La ausencia de una fila también es información.</h2>
        </div>
        <div>
          <p>
            {excludedCasesLabel} no
            presentan todavía un hito de compromiso comparable en sus cronologías publicadas. Sus decisiones,
            evaluaciones o controversias no se recodifican como acuerdos para completar la tabla.
          </p>
          <p className="commitment-disclaimer">
            Alcance académico e informativo. Esta comparación no sustituye las actas completas, auditorías,
            supervisiones ni decisiones de las autoridades responsables.
          </p>
        </div>
      </section>
    </div>
  );
}
