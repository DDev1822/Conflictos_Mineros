import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpenText,
  ClockCounterClockwise,
  CirclesThreePlus,
  Database,
  FileText,
  Gavel,
  MapTrifold,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
import { getLatestPublicMiningCut } from "@/lib/mining-classification";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import type { Source } from "@/lib/schemas";

const sourceTypeLabels: Record<Source["type"], string> = {
  official: "estatales",
  academic: "académicas",
  community: "comunitarias",
  company: "empresariales",
  ngo: "sociedad civil",
  press: "periodísticas",
};

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function countSourcesByType(sources: Source[]) {
  return sources.reduce<Record<Source["type"], number>>((acc, source) => {
    acc[source.type] = (acc[source.type] ?? 0) + 1;
    return acc;
  }, {} as Record<Source["type"], number>);
}

export default function HomePage() {
  const data = loadObservatoryData();
  const { snapshot: latestMiningSnapshot, selection: latestMiningSelection } = getLatestPublicMiningCut(data);
  if (!latestMiningSnapshot || !latestMiningSelection) throw new Error("No existe un corte público de conflictos sociales mineros");
  const sourceTypeCounts = countSourcesByType(data.sources);
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const timelineCount = publicCases.reduce((sum, item) => sum + item.timeline.length, 0);
  const claimCount = publicCases.reduce((sum, item) => sum + item.claims.length, 0);

  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">Conflictos sociales mineros · evidencia trazable</p>
        <h1>Conflictos sociales mineros del Perú, explicados desde fuentes contrastables.</h1>
        <p className="hero-copy">
          El observatorio reúne {latestMiningSelection.totalRegistered} conflictos sociales mineros y desarrolla {publicCases.length} casos hito
          sobre agua, territorio, consulta, acuerdos, salud ambiental y control estatal. Hechos, posiciones e interpretaciones se presentan
          por separado y con fuentes.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/conflictos">Explorar conflictos <ArrowRight size={18} /></Link>
          <Link className="button secondary" href="/metodologia">Ver criterios de evidencia</Link>
        </div>
        <dl className="hero-stats">
          <div><dt>{latestMiningSelection.totalRegistered}</dt><dd>conflictos en el Reporte {latestMiningSnapshot.reportNumber}</dd></div>
          <div><dt>{latestMiningSelection.active}/{latestMiningSelection.latent}</dt><dd>activos / latentes del mismo corte</dd></div>
          <div><dt>{publicCases.length}</dt><dd>casos hito desarrollados</dd></div>
          <div><dt>{timelineCount}</dt><dd>hitos en esos {publicCases.length} casos</dd></div>
        </dl>
      </section>

      <section className="home-status" aria-label="Problemas de fondo y cortes documentales">
        <article>
          <WarningCircle size={26} />
          <div>
            <p className="eyebrow">Qué está en juego</p>
            <h2>Agua, territorio, acuerdos y control estatal bajo evidencia trazable</h2>
            <p>
              La disputa minera no se reduce a protesta o inversión: combina derechos territoriales, certificación ambiental,
              cumplimiento de acuerdos, participación y capacidad estatal para fiscalizar.
            </p>
          </div>
        </article>
        <article>
          <Database size={26} />
          <div>
            <p className="eyebrow">Cortes incorporados</p>
            <h2>{latestMiningSelection.totalRegistered} conflictos sociales mineros</h2>
            <p>
              Corte minero del Reporte {latestMiningSnapshot.reportNumber}, {formatDate(latestMiningSnapshot.cutoffDate)}.
              Los puntos del mapa son referencias agregadas, no áreas de influencia ni prueba de causalidad.
            </p>
          </div>
        </article>
      </section>

      <section className="home-visual-strip" aria-label="Evidencia visual documental">
        <figure>
          <Image
            src="/multimedia/documents/evidencia-documental.webp"
            alt="Mesa de trabajo académica con documentos y fuentes de evidencia."
            width="1280"
            height="720"
            sizes="(max-width: 800px) 100vw, 33vw"
            loading="lazy"
          />
          <figcaption>
            <span>Fuente y referencia exacta</span>
            <strong>La ubicación precisa permite comprobar el dato en el documento original.</strong>
          </figcaption>
        </figure>
        <figure>
          <Image
            src="/multimedia/maps/territorio-minero.webp"
            alt="Vista aérea de una operación minera usada como referencia territorial."
            width="1280"
            height="720"
            sizes="(max-width: 800px) 100vw, 33vw"
            loading="lazy"
          />
          <figcaption>
            <span>Territorio y escala</span>
            <strong>Los cortes agregados no sustituyen ubicación precisa ni causalidad.</strong>
          </figcaption>
        </figure>
        <figure>
          <Image
            src="/multimedia/normativa/archivo-normativo.webp"
            alt="Detalle de texto legislativo como referencia visual normativa."
            width="1280"
            height="720"
            sizes="(max-width: 800px) 100vw, 33vw"
            loading="lazy"
          />
          <figcaption>
            <span>Norma y competencia</span>
            <strong>El problema normativo aparece cuando autorización, fiscalización y cumplimiento no resuelven el conflicto.</strong>
          </figcaption>
        </figure>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <p className="eyebrow">Problemas principales</p>
          <h2>Agua, territorio, acuerdos, normas y evidencia</h2>
        </div>
        <div className="entry-grid">
          <Link href="/explorar">
            <CirclesThreePlus size={29} />
            <h3>Sistema de relaciones</h3>
            <p>Conflictos sociales mineros conectados con casos, actores, acuerdos, evidencia ambiental y fuentes documentales.</p>
          </Link>
          <Link href="/conflictos">
            <BookOpenText size={29} />
            <h3>Casos hito</h3>
            <p>Casos hito desarrollados cruzan territorio, actores, obligaciones, contradicciones y fuentes directas.</p>
          </Link>
          <Link href="/cronologia">
            <ClockCounterClockwise size={29} />
            <h3>Cronología</h3>
            <p>{timelineCount} hitos ordenan decisiones, acuerdos, evidencias y publicaciones sin convertir una nota pública en hecho sustantivo.</p>
          </Link>
          <Link href="/mapa">
            <MapTrifold size={29} />
            <h3>Territorio</h3>
            <p>Mapa de conflictos sociales mineros y casos documentados, con distribución regional al corte.</p>
          </Link>
        </div>
      </section>

      <section className="home-evidence">
        <div>
          <p className="eyebrow">Cobertura de evidencia</p>
          <h2>Fuentes diversas, pesos distintos</h2>
          <p>
            La diversidad de perspectivas no significa equivalencia probatoria. Una fuente comunitaria, empresarial, estatal o académica puede sostener posiciones distintas;
            cada registro conserva tipo de fuente, nivel de evidencia y ubicación exacta dentro del documento.
          </p>
        </div>
        <div className="home-source-grid">
          {Object.entries(sourceTypeLabels).map(([type, label]) => (
            <article key={type}>
              <strong>{sourceTypeCounts[type as Source["type"]] ?? 0}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="principles-band">
        <div><span>01</span><h3>Hechos</h3><p>{claimCount} afirmaciones separadas por hecho, interpretación o propuesta.</p></div>
        <div><span>02</span><h3>Referencias exactas</h3><p>Folio, sección, tabla o artículo para comprobar qué sostiene, matiza o contradice una fuente.</p></div>
        <div><span>03</span><h3>Normativa</h3><p>{data.instruments.length} instrumentos conectan competencias, autorizaciones, fiscalización y cumplimiento.</p></div>
        <div><span>04</span><h3>Corrección documentada</h3><p>Todo ajuste identifica el dato, la fuente, su ubicación precisa y la razón del cambio.</p></div>
      </section>

      <section className="home-next">
        <FileText size={28} />
        <div>
          <p className="eyebrow">Cruces críticos</p>
          <h2>Para entender el conflicto, cruza casos, cronologías, compromisos, normas y territorio.</h2>
          <div>
            <Link href="/compromisos">Compromisos <ArrowRight /></Link>
            <Link href="/metodologia">Metodología <ArrowRight /></Link>
            <Link href="/normativa">Normativa <Gavel size={15} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
