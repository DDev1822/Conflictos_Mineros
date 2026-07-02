import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpenText,
  ClockCounterClockwise,
  CirclesThreePlus,
  Coins,
  Database,
  FileText,
  Gavel,
  MapTrifold,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
import { loadReleaseState } from "@/lib/release-state";
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
  const { manifest, readiness } = loadReleaseState(data);
  const latestSocialSnapshot = [...data.socialConflictSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const latestMiningSelection = [...data.miningConflictSelections].sort((a, b) => b.totalRegistered - a.totalRegistered)[0];
  const latestReinfo = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const readyCasePackets = data.caseResearchPackets.filter((packet) => packet.status === "ready").length;
  const preparedLegalPackets = data.legalResearchPackets.filter((packet) => packet.status === "prepared").length;
  const reviewedEvidence = data.evidenceRecords.filter((record) => record.reviewStatus === "reviewed").length;
  const blockingGaps = data.caseResearchPackets.flatMap((packet) => packet.gaps).filter((gap) => gap.blocksRelease).length;
  const openContradictions = data.caseResearchPackets.flatMap((packet) => packet.contradictions).filter((item) => item.status === "open").length;
  const pendingSignoffs = Object.values(manifest.signoffs).filter((signoff) => signoff.status === "pending").length;
  const sourceTypeCounts = countSourcesByType(data.sources);
  const timelineCount = data.cases.reduce((sum, item) => sum + item.timeline.length, 0);
  const claimCount = data.cases.reduce((sum, item) => sum + item.claims.length, 0);

  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">Observatorio documental · V1 {manifest.visibility}</p>
        <h1>Conflictos mineros del Perú, leídos desde evidencia trazable.</h1>
        <p className="hero-copy">
          Seis expedientes piloto conectan territorio, cronología, actores, fuentes, normas y límites de revisión.
          La V1 no emite dictámenes ni reemplaza asesoría: muestra hechos documentados, posiciones atribuidas y vacíos visibles.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/explorar">Entrar al sistema de relaciones <ArrowRight size={18} /></Link>
          <Link className="button secondary" href="/metodologia">Leer metodología y alcance</Link>
        </div>
        <dl className="hero-stats">
          <div><dt>{data.cases.length}</dt><dd>expedientes piloto</dd></div>
          <div><dt>{latestMiningSelection.totalRegistered}</dt><dd>conflictos mineros del corte</dd></div>
          <div><dt>{data.sources.length}</dt><dd>fuentes documentales</dd></div>
          <div><dt>{reviewedEvidence}/{data.evidenceRecords.length}</dt><dd>locadores revisados</dd></div>
        </dl>
      </section>

      <section className="home-status" aria-label="Estado de cierre V1">
        <article>
          <WarningCircle size={26} />
          <div>
            <p className="eyebrow">Estado de publicación</p>
            <h2>{readiness.ready ? "V1 lista para publicación controlada" : "V1 bloqueada para publicación"}</h2>
            <p>
              El observatorio organiza información pública para lectura académica y ciudadana. Conserva {readiness.metrics.transparencyNotices} aviso(s)
              de transparencia, {pendingSignoffs} signoff(s) pendiente(s), {blockingGaps} vacío(s) documentales visibles y {openContradictions} contradicción(es)
              abierta(s); no se presentan como errores ocultos ni como conclusiones cerradas.
            </p>
          </div>
        </article>
        <article>
          <Database size={26} />
          <div>
            <p className="eyebrow">Cortes incorporados</p>
            <h2>{latestSocialSnapshot.totalRegistered} sociales · {latestMiningSelection.totalRegistered} mineros · {latestReinfo.totalRegistered.toLocaleString("es-PE")} REINFO</h2>
            <p>
              Corte social {formatDate(latestSocialSnapshot.cutoffDate)}; REINFO vigente al {formatDate(latestReinfo.cutoffDate)}.
              Los puntos del mapa son referencias agregadas, no áreas de influencia ni prueba de causalidad.
            </p>
          </div>
        </article>
      </section>

      <section className="home-visual-strip" aria-label="Lectura visual del observatorio">
        <figure>
          <Image
            src="/multimedia/documents/evidencia-documental.webp"
            alt="Revisión documental sobre mesa de trabajo académica."
            width="1280"
            height="720"
            sizes="(max-width: 800px) 100vw, 33vw"
            loading="lazy"
          />
          <figcaption>
            <span>Archivo y locador</span>
            <strong>La evidencia se cita por página, sección, tabla o artículo.</strong>
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
            <span>Norma y revisión</span>
            <strong>Las normas se muestran como documentos públicos, con fuente y alcance.</strong>
          </figcaption>
        </figure>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <p className="eyebrow">Rutas principales</p>
          <h2>Entrar por problema, caso, territorio, tiempo o norma</h2>
        </div>
        <div className="entry-grid">
          <Link href="/explorar">
            <CirclesThreePlus size={29} />
            <h3>Sistema de relaciones</h3>
            <p>Dos problemas raíz —conflicto social minero y minería ilegal/informal— conectados con evidencia, REINFO, fiscalización y casos.</p>
          </Link>
          <Link href="/conflictos">
            <BookOpenText size={29} />
            <h3>Expedientes</h3>
            <p>{readyCasePackets}/{data.caseResearchPackets.length} paquetes listos con estado al corte, fuentes, locadores, contradicciones y preguntas abiertas.</p>
          </Link>
          <Link href="/cronologia">
            <ClockCounterClockwise size={29} />
            <h3>Cronología</h3>
            <p>{timelineCount} hitos filtrables por caso, tipo de evento, fuente y locador; publicaciones no rellenan cronologías artificialmente.</p>
          </Link>
          <Link href="/mapa">
            <MapTrifold size={29} />
            <h3>Territorio</h3>
            <p>Mapa con conflicto social, selección minera, minería ilegal/informal, REINFO, formal, exploración y concesiones como capas separadas.</p>
          </Link>
        </div>
      </section>

      <section className="home-evidence">
        <div>
          <p className="eyebrow">Cobertura de evidencia</p>
          <h2>Fuentes diversas, pesos distintos</h2>
          <p>
            La diversidad de perspectivas no significa equivalencia probatoria. Una fuente comunitaria, empresarial, estatal o académica puede sostener posiciones distintas;
            el observatorio conserva el tipo de fuente, el nivel de evidencia y el locador exacto.
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
        <div><span>02</span><h3>Locadores</h3><p>Página, sección, tabla o artículo para sostener, matizar o contradecir.</p></div>
        <div><span>03</span><h3>Normativa</h3><p>{preparedLegalPackets}/{data.legalResearchPackets.length} paquetes normativos con texto oficial, fuentes y preguntas de alcance.</p></div>
        <div><span>04</span><h3>Corrección abierta</h3><p>La V1 publica información trazable y conserva avisos de mejora sin convertirlos en candados.</p></div>
      </section>

      <section className="home-next">
        <FileText size={28} />
        <div>
          <p className="eyebrow">Lectura recomendada</p>
          <h2>Empieza por metodología si vas a citar; por relaciones si vas a explorar.</h2>
          <div>
            <Link href="/metodologia">Metodología <ArrowRight /></Link>
            <Link href="/normativa">Normativa <Gavel size={15} /></Link>
            <Link href="/oro-ilegal">Oro sin trazabilidad <Coins size={15} /></Link>
            <Link href="/madre-de-dios">Madre de Dios <ArrowRight /></Link>
            <Link href="/reinfo">REINFO / MAPE <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
