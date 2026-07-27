import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, FileText, MapTrifold, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
import { getLatestPublicMiningCut } from "@/lib/mining-classification";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import type { Claim, EvidenceRecord, Source, TimelineEvent } from "@/lib/schemas";

export const metadata: Metadata = { title: "Metodología" };

const sourceTypeLabels: Record<Source["type"], string> = {
  official: "estatales",
  academic: "académicas",
  community: "comunitarias",
  company: "empresariales",
  ngo: "sociedad civil",
  press: "periodísticas",
};

const evidenceLevelLabels: Record<Source["evidenceLevel"], string> = {
  primary: "primarias",
  secondary: "secundarias",
  contextual: "contextuales",
};

const rightsLabels: Record<Source["rightsStatus"], string> = {
  reusable: "reutilizables",
  "link-only": "solo enlace",
  "permission-required": "requieren permiso",
  unknown: "derechos desconocidos",
};

const claimLabels: Record<Claim["verificationStatus"], string> = {
  verified: "verificadas",
  partial: "parciales",
  pending: "en contraste",
};

const timelineKindLabels: Record<TimelineEvent["kind"], string> = {
  event: "eventos",
  decision: "decisiones",
  agreement: "acuerdos",
  evidence: "evidencias",
  publication: "publicaciones",
};

const relationLabels: Record<EvidenceRecord["relation"], string> = {
  supports: "sostienen",
  qualifies: "matizan",
  contradicts: "contradicen",
};

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {} as Record<T, number>);
}

function formatDate(value?: string | null) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function methodRow(label: string, value: string | number, note: string) {
  return { label, value: typeof value === "number" ? value.toLocaleString("es-PE") : value, note };
}

export default function MethodologyPage() {
  const data = loadObservatoryData();
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const publicCaseIds = new Set(publicCases.map((item) => item.id));
  const publicCasePackets = data.caseResearchPackets.filter((packet) => publicCaseIds.has(packet.caseId));
  const claims = publicCases.flatMap((item) => item.claims);
  const events = publicCases.flatMap((item) => item.timeline);
  const sourceTypeCounts = countBy(data.sources.map((source) => source.type));
  const evidenceLevelCounts = countBy(data.sources.map((source) => source.evidenceLevel));
  const rightsCounts = countBy(data.sources.map((source) => source.rightsStatus));
  const claimCounts = countBy(claims.map((claim) => claim.verificationStatus));
  const eventKindCounts = countBy(events.map((event) => event.kind));
  const relationCounts = countBy(data.evidenceRecords.map((record) => record.relation));
  const reviewedEvidence = data.evidenceRecords.filter((record) => record.reviewStatus === "reviewed").length;
  const readyCasePackets = publicCasePackets.filter((packet) => packet.status === "ready").length;
  const preparedLegalPackets = data.legalResearchPackets.filter((packet) => packet.status === "prepared").length;
  const openContradictions = publicCasePackets.flatMap((packet) => packet.contradictions).filter((item) => item.status === "open").length;
  const scopeLimitCount = publicCasePackets.reduce((sum, packet) => sum + packet.gaps.length, 0);
  const latestCaseCutoff = [...publicCasePackets].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0]?.cutoffDate;
  const latestSourceAccess = [...data.sources].sort((a, b) => b.accessedAt.localeCompare(a.accessedAt))[0]?.accessedAt;
  const { snapshot: latestMiningSnapshot, selection: latestMiningSelection } = getLatestPublicMiningCut(data);
  if (!latestMiningSnapshot || !latestMiningSelection) throw new Error("No existe un corte público de conflictos sociales mineros");

  const topMetrics = [
    methodRow("Fuentes", data.sources.length, `${evidenceLevelCounts.primary ?? 0} primarias · último acceso ${formatDate(latestSourceAccess)}`),
    methodRow("Evidencias", `${reviewedEvidence}/${data.evidenceRecords.length}`, "referencias exactas revisadas"),
    methodRow("Casos", `${readyCasePackets}/${publicCasePackets.length}`, `último corte ${formatDate(latestCaseCutoff)}`),
    methodRow("Trazabilidad", "Documentada", "fuentes y ubicaciones precisas disponibles para contraste"),
  ];

  return (
    <div className="method-page">
      <header className="page-intro">
        <p className="eyebrow">Método antes que conclusión</p>
        <h1>Cómo leer evidencia trazable</h1>
        <p>
          El método separa hechos documentados, posiciones atribuidas, interpretación y propuesta. El centro no es “tener
          una conclusión”, sino mostrar la ruta completa entre fuente, hito, afirmación, ubicación exacta y comprobación.
        </p>
      </header>

      <section className="method-stats" aria-label="Cobertura metodológica actual">
        {topMetrics.map((metric) => (
          <article key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <div className="method-alert">
        <WarningCircle size={22} />
        <div>
          <strong>Fuentes, referencias exactas y límites probatorios visibles.</strong>
          <span>El contenido es corregible, conserva {openContradictions} contradicción(es) atribuida(s) y diferencia hechos documentados de interpretación.</span>
        </div>
      </div>

      <div className="method-layout">
        <nav aria-label="Índice de metodología">
          <a href="#publicacion">Evidencia</a>
          <a href="#principios">Principios</a>
          <a href="#fuentes">Fuentes y derechos</a>
          <a href="#referencias">Referencias exactas</a>
          <a href="#revision">Límites</a>
          <a href="#cartografia">Cartografía</a>
          <a href="#glosario">Glosario</a>
          <a href="#correcciones">Correcciones</a>
        </nav>

        <div className="prose long-form">
          <section id="publicacion">
            <h2>Cómo se comprueba una afirmación</h2>
            <p>
              Cada afirmación sensible se presenta con fuente, ubicación precisa, fecha de corte y límite probatorio.
              Estos elementos permiten contrastar lo publicado, pero no sustituyen conclusiones jurídicas ni determinaciones de responsabilidad.
            </p>

            <div className="publication-status-grid">
              <article>
                <CheckCircle size={24} />
                <strong>Evidencia disponible para contraste documental</strong>
                <span>{reviewedEvidence}/{data.evidenceRecords.length} referencias revisadas</span>
              </article>
              <article>
                <WarningCircle size={24} />
                <strong>{scopeLimitCount} límites documentales declarados</strong>
                <span>{openContradictions} contradicción(es) atribuida(s) · cada límite señala qué falta comprobar</span>
              </article>
              <article>
                <FileText size={24} />
                <strong>{evidenceLevelCounts.primary ?? 0} fuentes primarias</strong>
                <span>Documentos directos para comprobar hitos, hechos y normas.</span>
              </article>
            </div>

            <div className="publication-review-columns">
              <article>
                <h3>Alcance académico</h3>
                <ul className="publication-checklist">
                  <li><strong>Finalidad informativa</strong><span>Organiza evidencia pública para consulta, docencia e investigación.</span></li>
                  <li><strong>Alcance académico</strong><span>Organiza información para consulta y no sustituye asesoría profesional, peritajes ni decisiones de autoridad.</span></li>
                  <li><strong>Sin determinación de responsabilidad</strong><span>No atribuye causalidad, culpabilidad ni vigencia normativa consolidada.</span></li>
                  <li><strong>Corrección abierta</strong><span>Todo cambio debe conservar fuente, ubicación exacta, fecha y justificación.</span></li>
                </ul>
              </article>
              <article>
                <h3>Límites documentales</h3>
                <ul className="publication-notices">
                  <li>{scopeLimitCount} límites de investigación permanecen visibles en las fichas de caso.</li>
                  <li>{openContradictions} contradicciones permanecen atribuidas a sus fuentes.</li>
                  <li>Un límite probatorio indica qué no puede afirmarse con la documentación disponible.</li>
                </ul>
              </article>
            </div>
          </section>

          <section id="principios">
            <h2>Principios editoriales</h2>
            <blockquote>
              El observatorio reúne información pública y académica sobre conflictos sociales mineros en el Perú. Su función es
              ordenar hechos documentados, posiciones de actores y controversias abiertas; no resolverlas ni determinar responsabilidades.
            </blockquote>
            <div className="method-contract-grid">
              <article>
                <FileText size={24} />
                <h3>Hecho, interpretación y propuesta no se mezclan</h3>
                <p>{claims.length} afirmaciones se clasifican como hechos, interpretaciones o propuestas. Una fuente oficial puede respaldar un hecho, pero no convierte automáticamente una interpretación en conclusión.</p>
              </article>
              <article>
                <CheckCircle size={24} />
                <h3>Fecha de corte antes que actualidad aparente</h3>
                <p>Cada caso declara una fecha de corte. Si un estado cambió después, debe actualizarse con fuente, ubicación exacta y comprobación.</p>
              </article>
              <article>
                <WarningCircle size={24} />
                <h3>Límite probatorio no es resolución</h3>
                <p>Los desacuerdos y límites probatorios impiden cerrar un conflicto solo por ausencia de documento disponible.</p>
              </article>
            </div>

            <div className="method-state-list">
              {Object.entries(claimLabels).map(([status, label]) => (
                <div key={status}>
                  <strong>{claimCounts[status as Claim["verificationStatus"]] ?? 0}</strong>
                  <span>Afirmaciones {label}</span>
                </div>
              ))}
            </div>
            <div className="method-state-list">
              {Object.entries(timelineKindLabels).map(([kind, label]) => (
                <div key={kind}>
                  <strong>{eventKindCounts[kind as TimelineEvent["kind"]] ?? 0}</strong>
                  <span>Hitos: {label}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="fuentes">
            <h2>Fuentes, perspectivas y derechos</h2>
            <p>
              La documentación reúne {data.sources.length} fuentes con información sobre institución, fecha, perspectiva, nivel de evidencia,
              estado de derechos, licencia y verificación. Una fuente contextual ayuda a orientar; no sustituye el texto primario cuando el hecho exige documento directo.
            </p>

            <div className="method-matrix">
              <article>
                <h3>Tipo de fuente</h3>
                {Object.entries(sourceTypeLabels).map(([type, label]) => <p key={type}><strong>{sourceTypeCounts[type as Source["type"]] ?? 0}</strong> {label}</p>)}
              </article>
              <article>
                <h3>Nivel de evidencia</h3>
                {Object.entries(evidenceLevelLabels).map(([level, label]) => <p key={level}><strong>{evidenceLevelCounts[level as Source["evidenceLevel"]] ?? 0}</strong> {label}</p>)}
              </article>
              <article>
                <h3>Derechos</h3>
                {Object.entries(rightsLabels).map(([status, label]) => <p key={status}><strong>{rightsCounts[status as Source["rightsStatus"]] ?? 0}</strong> {label}</p>)}
              </article>
            </div>

            <blockquote>
              Cada fuente conserva institución, fecha, nivel de evidencia, derechos y una síntesis. Las copias autorizadas permanecen en archivo privado; la republicación de documentos externos exige derechos claros.
            </blockquote>
          </section>

          <section id="referencias">
            <h2>Referencias exactas y relaciones de evidencia</h2>
            <p>
              Un enlace general no basta. Cada referencia documentada conecta una fuente con un hito, afirmación, instrumento, estado de caso o posición de actor,
              e identifica el folio, sección, tabla, artículo u otra ubicación precisa donde aparece la información.
            </p>

            <div className="method-relation-strip">
              {Object.entries(relationLabels).map(([relation, label]) => (
                <article key={relation}>
                  <strong>{relationCounts[relation as EvidenceRecord["relation"]] ?? 0}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>

            <div className="method-contract-list">
              <div><strong>Sostiene</strong><span>La fuente respalda directamente la formulación.</span></div>
              <div><strong>Matiza</strong><span>La fuente precisa el alcance, lenguaje, fecha, actor o interpretación.</span></div>
              <div><strong>Contradice</strong><span>La fuente introduce una discrepancia que debe permanecer visible.</span></div>
            </div>
          </section>

          <section id="revision">
            <h2>Límites probatorios y disclaimer académico</h2>
            <p>
              Las normas, resoluciones, actas y sentencias se exponen como documentos públicos dentro de un análisis académico.
              El análisis documental no declara vigencia consolidada, responsabilidad ni solución definitiva: conserva fuente, fecha, ubicación exacta,
              alcance y contradicciones para que cualquier lector pueda contrastar.
            </p>
            <div className="method-warning-card">
              <FileText size={26} />
              <div>
                <h3>Reglas para no convertir documentos en conclusiones</h3>
                <ul>
                  <li>No presentar una norma o sentencia como conclusión total del conflicto.</li>
                  <li>No convertir un registro administrativo en una conclusión total sobre el caso.</li>
                  <li>No inferir responsabilidad o causalidad si la fuente no la formula.</li>
                  <li>No usar una nota de prensa como prueba automática de cumplimiento de acuerdos.</li>
                </ul>
              </div>
            </div>
            <p>{preparedLegalPackets}/{data.legalResearchPackets.length} instrumentos cuentan con texto oficial y preguntas de aplicación; eso no determina vigencia consolidada ni aplicabilidad a casos concretos.</p>
          </section>

          <section id="cartografia">
            <h2>Cartografía y límites territoriales</h2>
            <p>
              Los puntos territoriales son referencias agregadas, no delimitan áreas de influencia, concesiones, comunidades, responsabilidad o causalidad territorial.
              El corte público registra exclusivamente {latestMiningSelection.totalRegistered} conflictos sociales vinculados a minería:
              {" "}{latestMiningSelection.active} activos y {latestMiningSelection.latent} latentes, según el Reporte {latestMiningSnapshot.reportNumber}.
            </p>
            <div className="method-warning-card">
              <MapTrifold size={26} />
              <div>
                <h3>Reglas probatorias del mapa</h3>
                <ul>
                  <li>Calor territorial expresa cantidad de casos, no gravedad ni impacto.</li>
                  <li>Los marcadores de casos señalan referencias territoriales para consulta, no áreas afectadas.</li>
                  <li>La coincidencia espacial entre casos no prueba relación causal ni responsabilidad compartida.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="glosario">
            <h2>Glosario mínimo</h2>
            <dl className="glossary">
              <div><dt>Conflicto social</dt><dd>Proceso con posiciones y demandas percibidas como incompatibles; no se reduce a protesta, bloqueo o violencia.</dd></div>
              <div><dt>Hito sustantivo</dt><dd>Evento, decisión, acuerdo o evidencia que cambió o documentó el curso del caso; una publicación solo integra la cronología cuando registra ese cambio.</dd></div>
              <div><dt>Referencia exacta</dt><dd>Folio, sección, tabla, artículo u otra ubicación que permite comprobar dónde la fuente sostiene, matiza o contradice una afirmación.</dd></div>
              <div><dt>Fecha de corte</dt><dd>Última fecha hasta la cual se revisó la documentación de un caso; no garantiza que su situación siga igual después.</dd></div>
              <div><dt>Nudo normativo</dt><dd>Problema persistente donde diseño legal, competencias, interpretación o implementación producen controversias.</dd></div>
            </dl>
          </section>

          <section id="correcciones">
            <h2>Política de correcciones</h2>
            <p>
              Toda corrección debe identificar el dato, justificar el cambio, aportar fuente y declarar conflictos de interés.
              Si cambia una fuente o un hito, también debe actualizar su ubicación exacta, fecha de comprobación, estado de contraste y relación de evidencia.
            </p>
            <div className="quality-commands">
              <span>Comprobaciones de consistencia</span>
              <code>fuente primaria</code>
              <code>referencia exacta</code>
              <code>fecha de corte</code>
              <code>relación de evidencia</code>
            </div>
            <Link className="method-next-link" href="/cronologia">Abrir cronología documentada <ArrowRight /></Link>
          </section>
        </div>
      </div>
    </div>
  );
}
