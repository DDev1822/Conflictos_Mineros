import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import {
  ArrowRight,
  ArrowSquareOut,
  CheckCircle,
  Gavel,
  Hourglass,
  Prohibit,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
import { getLatestPublicMiningCut, mentionsMiningCategory } from "@/lib/mining-classification";
import type { Source } from "@/lib/schemas";

export const metadata: Metadata = { title: "REINFO y formalización MAPE" };

const reinfoSourceIds = [
  "minem-reinfo",
  "minem-reinfo-vigente-corte-2026-06-18",
  "minem-rd-0004-2025-reinfo-exclusiones",
  "minem-comunicado-reinfo-2025",
  "dl-1105-formalizacion",
];

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function formatNumber(value?: number) {
  return (value ?? 0).toLocaleString("es-PE");
}

function SourceCard({ source }: { source: Source }) {
  return (
    <a href={source.url} target="_blank" rel="noreferrer">
      <strong>{source.institution}</strong>
      <span>{source.title}</span>
      <small>{formatDate(source.date)} · {source.evidenceLevel} · {source.rightsStatus}</small>
      <ArrowSquareOut size={15} aria-hidden />
    </a>
  );
}

export default function ReinfoPage() {
  if (!isPublishedSocialMiningCase({ id: "madre-de-dios" })) notFound();
  const data = loadObservatoryData();
  const { cases: publicMiningCases } = getLatestPublicMiningCut(data);
  const alternative = data.alternatives.find((item) => item.id === "expediente-unico-trazable");
  const latestReinfo = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const madreDeDiosCount = latestReinfo?.regions.find((region) => region.id === "madre-de-dios")?.count;
  const madreDeDiosCase = data.cases.find((item) => item.id === "madre-de-dios");
  const formalizationIssue = data.issues.find((item) => item.id === "formalizacion-mape");
  const formalizationInstruments = data.instruments.filter((item) => item.issueIds.includes("formalizacion-mape"));
  const reinfoSources = reinfoSourceIds
    .map((id) => data.sources.find((source) => source.id === id))
    .filter((source): source is Source => Boolean(source));
  const reinfoEvidenceRecords = data.evidenceRecords.filter((record) => reinfoSourceIds.includes(record.sourceId));
  const illegalMentions = publicMiningCases.filter((item) => mentionsMiningCategory(item, "ilegal"));
  const informalMentions = publicMiningCases.filter((item) => mentionsMiningCategory(item, "informal"));
  const overlappingMentions = publicMiningCases.filter((item) => mentionsMiningCategory(item, "ilegal") && mentionsMiningCategory(item, "informal"));

  return (
    <div className="reinfo-page">
      <section className="reinfo-hero">
        <div>
          <p className="eyebrow">Formalización MAPE · registro y origen</p>
          <h1>REINFO / MAPE</h1>
          <p>
            Corte MINEM: {formatNumber(latestReinfo?.totalRegistered)} inscripciones vigentes al {formatDate(latestReinfo?.cutoffDate)}.
            El registro acredita permanencia administrativa en un proceso; no prueba por sí solo formalización concluida,
            origen lícito del mineral ni ausencia de infracciones.
          </p>
          <div className="review-banner">
            <WarningCircle />
            <span><strong>Fuente oficial MINEM</strong> · consulta registrada {formatDate(latestReinfo?.accessedAt)} · corte nacional y regional</span>
          </div>
        </div>
        <Gavel size={116} weight="thin" aria-hidden />
      </section>

      <section className="reinfo-stats" aria-label="Indicadores REINFO y minería ilegal e informal">
        <article>
          <strong>{formatNumber(latestReinfo?.totalRegistered)}</strong>
          <span>REINFO vigente</span>
          <small>Agregado nacional del corte territorial.</small>
        </article>
        <article>
          <strong>{formatNumber(madreDeDiosCount)}</strong>
          <span>Madre de Dios</span>
          <small>Inscripciones vigentes en el caso profundo.</small>
        </article>
        <article>
          <strong>{formatNumber(illegalMentions.length)}</strong>
          <span>Minería ilegal</span>
          <small>Menciones explícitas en el corte social minero.</small>
        </article>
        <article>
          <strong>{formatNumber(informalMentions.length)}</strong>
          <span>Minería informal</span>
          <small>{formatNumber(overlappingMentions.length)} también mencionan ilegal.</small>
        </article>
      </section>

      <section className="category-grid">
        <article>
          <CheckCircle />
          <h2>Minería formal</h2>
          <p>No se infiere desde REINFO. Requiere autorizaciones, obligaciones y verificación aplicable al caso o unidad evaluada.</p>
        </article>
        <article>
          <Hourglass />
          <h2>En formalización</h2>
          <p>El REINFO registra permanencia en un proceso. La inscripción no equivale al resultado final ni a cumplimiento completo.</p>
        </article>
        <article>
          <WarningCircle />
          <h2>Minería informal</h2>
          <p>{formatNumber(informalMentions.length)} casos del corte social minero la mencionan explícitamente; se mantiene separada de minería ilegal.</p>
        </article>
        <article>
          <Prohibit />
          <h2>Minería ilegal</h2>
          <p>{formatNumber(illegalMentions.length)} casos del corte social minero la mencionan explícitamente; no sustituye calificación judicial o administrativa individual.</p>
        </article>
      </section>

      <section className="reinfo-system">
        <div>
          <p className="eyebrow">Registro, norma y territorio</p>
          <h2>Registro, norma y trazabilidad conectados</h2>
          <ul>
            <li>Fuente oficial REINFO/MINEM enlazada y corte territorial archivado con {formatNumber(latestReinfo?.regions.length)} agregados regionales.</li>
            <li>Madre de Dios aparece como expediente profundo con {formatNumber(madreDeDiosCount)} inscripciones vigentes y fuentes de trazabilidad del oro.</li>
            <li>{formatNumber(formalizationInstruments.length)} instrumento(s) normativo(s) conectados al nudo {formalizationIssue?.name ?? "Formalización MAPE"}.</li>
            <li>{formatNumber(reinfoEvidenceRecords.length)} registro(s) de evidencia enlazan fuente, entidad respaldada, locador y comprobación.</li>
            <li>Las menciones de minería ilegal e informal vienen del corte social minero y no delimitan zonas de actividad ni responsabilidad individual.</li>
          </ul>
        </div>
        <aside>
          <p>Caso y nudo conectados</p>
          <h3>{madreDeDiosCase?.name}</h3>
          <p>{madreDeDiosCase?.summary}</p>
          <Link href="/conflictos/madre-de-dios">Abrir expediente Madre de Dios <ArrowRight /></Link>
          <Link href="/normativa#formalizacion-mape">Ver nudo normativo <ArrowRight /></Link>
          <Link href="/explorar">Ver en sistema de relaciones <ArrowRight /></Link>
        </aside>
      </section>

      <section className="reinfo-evidence">
        <div>
          <p className="eyebrow">Fuentes enlazadas</p>
          <h2>Textos y registros del régimen REINFO / MAPE</h2>
        </div>
        <div className="reinfo-source-list">
          {reinfoSources.map((source) => <SourceCard key={source.id} source={source} />)}
        </div>
      </section>

      <section className="reinfo-locators">
        <p className="eyebrow">Locadores probatorios</p>
        <h2>Dónde se sostiene cada afirmación sobre REINFO</h2>
        <div>
          {reinfoEvidenceRecords.slice(0, 6).map((record) => (
            <article key={record.id}>
              <strong>{record.locator}</strong>
              <span>{record.summary}</span>
              <small>{record.relation} · {record.reviewStatus} · comprobado {formatDate(record.checkedAt)}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="source-note">
        <h2>Regla probatoria</h2>
        <p>
          La condición de una persona, actividad o territorio no se infiere desde prensa, apariencia territorial o una sola base.
          Toda clasificación debe citar fuente, fecha, criterio y alcance. Una inscripción no prueba formalidad concluida,
          una suspensión no prueba delito y una mención territorial no reemplaza expedientes oficiales ni determinaciones individuales.
        </p>
        {alternative && <p><strong>Alternativa conectada:</strong> {alternative.title}. {alternative.mechanism}</p>}
        {reinfoSources[0] && <a href={reinfoSources[0].url} target="_blank" rel="noreferrer">Consultar registro oficial <ArrowRight /></a>}
      </section>
    </div>
  );
}
