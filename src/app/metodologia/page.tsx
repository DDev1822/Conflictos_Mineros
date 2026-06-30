import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CheckCircle, FileText, MapTrifold, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
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
  pending: "pendientes",
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
  const claims = data.cases.flatMap((item) => item.claims);
  const events = data.cases.flatMap((item) => item.timeline);
  const sourceTypeCounts = countBy(data.sources.map((source) => source.type));
  const evidenceLevelCounts = countBy(data.sources.map((source) => source.evidenceLevel));
  const rightsCounts = countBy(data.sources.map((source) => source.rightsStatus));
  const claimCounts = countBy(claims.map((claim) => claim.verificationStatus));
  const eventKindCounts = countBy(events.map((event) => event.kind));
  const relationCounts = countBy(data.evidenceRecords.map((record) => record.relation));
  const reviewedEvidence = data.evidenceRecords.filter((record) => record.reviewStatus === "reviewed").length;
  const readyCasePackets = data.caseResearchPackets.filter((packet) => packet.status === "ready").length;
  const preparedLegalPackets = data.legalResearchPackets.filter((packet) => packet.status === "prepared").length;
  const blockingGaps = data.caseResearchPackets.flatMap((packet) => packet.gaps).filter((gap) => gap.blocksRelease).length;
  const openContradictions = data.caseResearchPackets.flatMap((packet) => packet.contradictions).filter((item) => item.status === "open").length;
  const latestCaseCutoff = [...data.caseResearchPackets].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0]?.cutoffDate;
  const latestSourceAccess = [...data.sources].sort((a, b) => b.accessedAt.localeCompare(a.accessedAt))[0]?.accessedAt;
  const latestSocialSnapshot = [...data.socialConflictSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const latestMiningSelection = [...data.miningConflictSelections].sort((a, b) => b.totalRegistered - a.totalRegistered)[0];
  const latestReinfo = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];

  const topMetrics = [
    methodRow("Fuentes", data.sources.length, `${evidenceLevelCounts.primary ?? 0} primarias · último acceso ${formatDate(latestSourceAccess)}`),
    methodRow("Evidencias", `${reviewedEvidence}/${data.evidenceRecords.length}`, "locadores internos revisados"),
    methodRow("Expedientes", `${readyCasePackets}/${data.caseResearchPackets.length}`, `corte máximo ${formatDate(latestCaseCutoff)}`),
    methodRow("Paquetes normativos", `${preparedLegalPackets}/${data.legalResearchPackets.length}`, "texto oficial, fuentes y preguntas de alcance"),
  ];

  return (
    <div className="method-page">
      <header className="page-intro">
        <p className="eyebrow">Método antes que conclusión</p>
        <h1>Cómo leer evidencia trazable</h1>
        <p>
          La metodología de la V1 explica qué puede afirmar el observatorio, qué solo puede atribuir
          y qué debe quedar pendiente. El centro no es “tener una conclusión”, sino conservar la ruta
          completa entre fuente, hito, afirmación, locador y revisión.
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
          <strong>La V1 sigue en revisión privada.</strong>
          <span>{blockingGaps} vacío(s) bloqueante(s) y {openContradictions} contradicción(es) abierta(s) permanecen visibles como límites documentales, no como errores ocultos.</span>
        </div>
      </div>

      <div className="method-layout">
        <nav aria-label="Índice de metodología">
          <a href="#principios">Principios</a>
          <a href="#fuentes">Fuentes y derechos</a>
          <a href="#locadores">Locadores</a>
          <a href="#revision">Alcance</a>
          <a href="#cartografia">Cartografía</a>
          <a href="#glosario">Glosario</a>
          <a href="#correcciones">Correcciones</a>
        </nav>

        <div className="prose long-form">
          <section id="principios">
            <h2>Principios editoriales</h2>
            <blockquote>
              Este observatorio organiza información pública, documental y académica sobre conflictos mineros en el Perú.
              No emite dictámenes legales, no reemplaza asesoría jurídica ni determina responsabilidades. Su objetivo es facilitar lectura,
              trazabilidad de fuentes y contraste ciudadano/académico de hechos documentados, posiciones de actores y controversias abiertas.
            </blockquote>
            <div className="method-contract-grid">
              <article>
                <FileText size={24} />
                <h3>Hecho, interpretación y propuesta no se mezclan</h3>
                <p>{claims.length} afirmaciones están tipadas. Una fuente oficial puede respaldar un hecho, pero no convierte automáticamente una interpretación en conclusión.</p>
              </article>
              <article>
                <CheckCircle size={24} />
                <h3>Fecha de corte antes que actualidad aparente</h3>
                <p>Cada expediente y paquete declara corte. Si un estado cambió después, debe actualizarse con fuente, locador y revisión.</p>
              </article>
              <article>
                <WarningCircle size={24} />
                <h3>Ausencia de evidencia no es resolución</h3>
                <p>Los desacuerdos y vacíos se publican como límites. No se “cierra” un conflicto por falta de documento disponible.</p>
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
              La V1 contiene {data.sources.length} fuentes con metadatos de institución, fecha, perspectiva, nivel de evidencia,
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
              Git conserva metadatos, locadores y síntesis. Las copias autorizadas permanecen en archivo privado; ningún documento externo se republica sin derechos claros.
            </blockquote>
          </section>

          <section id="locadores">
            <h2>Locadores y relaciones de evidencia</h2>
            <p>
              Un enlace general no basta. Cada registro de evidencia conecta una fuente con un hito, afirmación, instrumento, estado de caso o posición de actor,
              e identifica página, sección, tabla, artículo o locador equivalente.
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
              <div><strong>supports</strong><span>La fuente respalda directamente la formulación.</span></div>
              <div><strong>qualifies</strong><span>La fuente matiza alcance, lenguaje, fecha, actor o interpretación.</span></div>
              <div><strong>contradicts</strong><span>La fuente introduce una discrepancia que debe permanecer visible.</span></div>
            </div>
          </section>

          <section id="revision">
            <h2>Alcance documental y disclaimer académico</h2>
            <p>
              Las normas, resoluciones, actas y sentencias se exponen como documentos públicos dentro de una lectura académica.
              El observatorio no declara vigencia consolidada, responsabilidad ni solución definitiva: conserva fuente, fecha, locador,
              alcance y contradicciones para que cualquier lector pueda contrastar.
            </p>
            <div className="method-warning-card">
              <FileText size={26} />
              <div>
                <h3>Lo que la interfaz no debe hacer</h3>
                <ul>
                  <li>No presentar una norma o sentencia como conclusión total del conflicto.</li>
                  <li>No convertir inscripción REINFO en formalidad concluida.</li>
                  <li>No inferir responsabilidad ambiental, sanitaria, administrativa o judicial si el documento no la formula.</li>
                  <li>No usar una nota de prensa como prueba automática de cumplimiento de acuerdos.</li>
                </ul>
              </div>
            </div>
            <p>{preparedLegalPackets}/{data.legalResearchPackets.length} paquetes normativos están preparados con textos oficiales y preguntas de alcance; eso no determina vigencia consolidada ni aplicabilidad a casos concretos.</p>
          </section>

          <section id="cartografia">
            <h2>Cartografía y límites territoriales</h2>
            <p>
              El mapa usa puntos de referencia para navegar datos, no para delimitar áreas de influencia, concesiones, comunidades, responsabilidad o causalidad territorial.
              El corte social registra {latestSocialSnapshot.totalRegistered} conflictos; la selección minera conserva {latestMiningSelection.totalRegistered} conflictos socioambientales vinculados a minería.
              REINFO registra {latestReinfo.totalRegistered.toLocaleString("es-PE")} inscripciones vigentes al {formatDate(latestReinfo.cutoffDate)}.
            </p>
            <div className="method-warning-card">
              <MapTrifold size={26} />
              <div>
                <h3>Reglas de lectura del mapa</h3>
                <ul>
                  <li>Calor territorial expresa cantidad de casos, no gravedad ni impacto.</li>
                  <li>Minería ilegal e informal son capas separadas por mención textual del reporte.</li>
                  <li>REINFO, plantas formales, exploración y concesiones son agregados registrales comparables, no ubicaciones exactas de actividad.</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="glosario">
            <h2>Glosario mínimo</h2>
            <dl className="glossary">
              <div><dt>Conflicto social</dt><dd>Proceso con posiciones y demandas percibidas como incompatibles; no se reduce a protesta, bloqueo o violencia.</dd></div>
              <div><dt>Hito sustantivo</dt><dd>Evento, decisión, acuerdo o evidencia que cambió o documentó el curso del expediente; una publicación no rellena cronología salvo que sea el hito registrado.</dd></div>
              <div><dt>Locador</dt><dd>Página, sección, tabla, artículo o referencia exacta que permite comprobar dónde la fuente sostiene, matiza o contradice una afirmación.</dd></div>
              <div><dt>MAPE</dt><dd>Minería artesanal y de pequeña escala; requiere distinguir regímenes, formalización, informalidad e ilegalidad.</dd></div>
              <div><dt>REINFO</dt><dd>Registro Integral de Formalización Minera; permanencia registral no equivale automáticamente a formalidad concluida.</dd></div>
              <div><dt>Nudo normativo</dt><dd>Problema persistente donde diseño legal, competencias, interpretación o implementación producen controversias.</dd></div>
            </dl>
          </section>

          <section id="correcciones">
            <h2>Política de correcciones</h2>
            <p>
              Toda corrección debe identificar el dato, justificar el cambio, aportar fuente y declarar conflictos de interés.
              Si cambia una fuente o un hito, también debe actualizar locador, fecha de comprobación, estado de revisión y relación de evidencia.
            </p>
            <div className="quality-commands">
              <span>Validación mínima local</span>
              <code>npm run validate:content</code>
              <code>npm run audit:content</code>
              <code>npm run check:links</code>
              <code>npm run test:e2e</code>
            </div>
            <Link className="method-next-link" href="/cronologia">Ver cómo se aplican estas reglas en la cronología <ArrowRight /></Link>
          </section>
        </div>
      </div>
    </div>
  );
}
