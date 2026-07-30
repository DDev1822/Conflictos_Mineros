import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  CirclesThreePlus,
  Coins,
  FileText,
  GraduationCap,
  MapTrifold,
  ShieldWarning,
  TreeEvergreen,
} from "@phosphor-icons/react/dist/ssr";
import { CriticalSignals } from "@/components/critical-signals";
import { loadObservatoryData } from "@/lib/content";
import { getLatestPublicMiningCut } from "@/lib/mining-classification";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";
import { publicAsset } from "@/lib/public-assets";

const numberFormatter = new Intl.NumberFormat("es-PE");
const FIFA_PITCH_DIMENSIONS_URL = "https://publications.fifa.com/de/football-stadiums-guidelines/technical-guideline/stadium-guidelines/pitch-dimensions-and-surrounding-areas/";
const FIFA_REFERENCE_PITCH_HECTARES = (105 * 68) / 10_000;

export default function HomePage() {
  const data = loadObservatoryData();
  const { snapshot, selection } = getLatestPublicMiningCut(data);
  if (!snapshot || !selection) throw new Error("No existe un corte público de conflictos sociales mineros");
  const latestReinfo = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const frontSignals = data.criticalSignals.filter((signal) =>
    ["pataz-secuestro-asesinato-2025", "madre-dios-deforestacion-2026", "reinfo-formalizacion-2-4-2025"].includes(signal.id),
  );
  const conflictSource = data.sources.find((source) => source.id === snapshot.sourceId);
  const reinfoSource = data.sources.find((source) => source.id === "minem-reinfo-vigente-corte-2026-06-18");
  const reinfoPerformanceSource = data.sources.find((source) => source.id === "pcm-reinfo-formalizacion-2025");
  const forestSource = data.sources.find((source) => source.id === data.madreDiosDevastation.documentedTotal.sourceId);
  const recentForestSource = data.sources.find((source) => source.id === data.madreDiosDevastation.recentRate.sourceId);
  const footballPitchEquivalent = Math.round(
    data.madreDiosDevastation.documentedTotal.hectares / FIFA_REFERENCE_PITCH_HECTARES / 100,
  ) * 100;

  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">Observatorio de Conflictos Mineros del Perú</p>
        <h1>Conflictos mineros del Perú: análisis académico, territorial y relacional.</h1>
        <p className="hero-copy">
          El observatorio examina conflictos sociales mineros, formalización, minería ilegal, violencia, ambiente y
          capacidad estatal mediante series nacionales, casos desarrollados, investigación académica y relaciones territoriales.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/explorar">Explorar relaciones <ArrowRight size={18} /></Link>
          <Link className="button secondary" href="/mapa">Abrir mapa nacional</Link>
        </div>
        <section className="hero-stats" aria-label="Indicadores principales del observatorio">
          <article className="hero-stat-block" data-topic="conflictos">
            <p>Conflictos sociales mineros</p>
            <div className="hero-stat-values">
              <div><strong>{selection.totalRegistered}</strong><span>casos registrados</span></div>
              <div><strong>{selection.active}/{selection.latent}</strong><span>activos / latentes</span></div>
            </div>
            {conflictSource && <a href={conflictSource.url} target="_blank" rel="noreferrer">Defensoría del Pueblo · Reporte {snapshot.reportNumber}</a>}
          </article>
          <article className="hero-stat-block" data-topic="reinfo">
            <p>REINFO y formalización</p>
            <div className="hero-stat-values">
              <div><strong>{numberFormatter.format(latestReinfo.totalRegistered)}</strong><span>inscripciones vigentes</span></div>
              <div><strong>2,4%</strong><span>formalización acumulada informada sobre más de 84.000 inscripciones</span></div>
            </div>
            <div className="hero-stat-links">
              {reinfoSource && <a href={reinfoSource.url} target="_blank" rel="noreferrer">MINEM · corte vigente</a>}
              {reinfoPerformanceSource && <a href={reinfoPerformanceSource.url} target="_blank" rel="noreferrer">PCM · resultado acumulado</a>}
            </div>
          </article>
          <article className="hero-stat-block" data-topic="madre-de-dios">
            <p>Madre de Dios</p>
            <div className="hero-stat-values">
              <div>
                <strong>{numberFormatter.format(data.madreDiosDevastation.documentedTotal.hectares)} ha</strong>
                <span>pérdida regional acumulada</span>
                <a
                  className="hero-stat-equivalence"
                  href={FIFA_PITCH_DIMENSIONS_URL}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`≈ ${numberFormatter.format(footballPitchEquivalent)} canchas de fútbol; consultar dimensión de referencia de FIFA`}
                >
                  <small>≈ {numberFormatter.format(footballPitchEquivalent)} canchas de fútbol</small>
                </a>
              </div>
              <div><strong>{data.madreDiosDevastation.recentRate.hectaresPerDay.toFixed(2).replace(".", ",")} ha/día</strong><span>ritmo medio observado en el periodo reciente</span></div>
            </div>
            <div className="hero-stat-links">
              {forestSource && <a href={forestSource.url} target="_blank" rel="noreferrer">MAAP · pérdida acumulada</a>}
              {recentForestSource && <a href={recentForestSource.url} target="_blank" rel="noreferrer">MAAP · avance en Tambopata</a>}
            </div>
          </article>
        </section>
        <p className="hero-media-note">Ilustración referencial generada con IA; no representa un caso específico.</p>
      </section>

      <section className="home-critical">
        <div className="section-heading">
          <p className="eyebrow">Tres puntos críticos del panorama minero nacional</p>
          <h2>Violencia organizada, pérdida amazónica y una formalización que casi no culmina.</h2>
        </div>
        <CriticalSignals signals={frontSignals} sources={data.sources} compact />
      </section>

      <section className="home-visual-strip" aria-label="Territorios bajo presión minera">
        <figure>
          <Image src={publicAsset("/multimedia/maps/territorio-minero.webp")} alt="Vista aérea de una operación minera y su entorno territorial." width="1280" height="720" sizes="(max-width: 800px) 100vw, 33vw" />
          <figcaption><span>Conflictos sociales</span><strong>Agua, tierra, participación y acuerdos explican gran parte de las disputas persistentes.</strong></figcaption>
        </figure>
        <figure>
          <Image src={publicAsset("/multimedia/maps/oro-ilegal-territorio.webp")} alt="Paisaje amazónico intervenido por minería aurífera." width="1280" height="720" sizes="(max-width: 800px) 100vw, 33vw" />
          <figcaption><span>Madre de Dios</span><strong>El avance aurífero afecta bosque, ríos, salud y áreas naturales protegidas.</strong></figcaption>
        </figure>
        <figure>
          <Image src={publicAsset("/multimedia/reinfo/trazabilidad-oro.webp")} alt="Oro aluvial durante su procesamiento." width="1280" height="720" sizes="(max-width: 800px) 100vw, 33vw" />
          <figcaption><span>Cadena del oro</span><strong>Extracción, transporte, procesamiento y compra forman un mismo sistema económico.</strong></figcaption>
        </figure>
      </section>

      <section className="section-shell">
        <div className="section-heading">
          <p className="eyebrow">Entradas principales</p>
          <h2>Cada problema tiene datos, actores y escalas distintas.</h2>
        </div>
        <div className="entry-grid">
          <Link href="/explorar"><CirclesThreePlus size={29} /><h3>Sistema de relaciones</h3><p>Conecta casos, territorios, normas, actores, REINFO y controles estatales.</p></Link>
          <Link href="/conflictos"><BookOpenText size={29} /><h3>Casos hito</h3><p>{publicCases.length} historias desarrolladas sobre disputas que cambiaron la minería peruana.</p></Link>
          <Link href="/mapa"><MapTrifold size={29} /><h3>Mapa nacional</h3><p>Compara conflictos, minería ilegal e informal, REINFO, plantas, exploración y concesiones.</p></Link>
          <Link href="/reinfo"><FileText size={29} /><h3>REINFO</h3><p>Compara inscripciones vigentes, concentración regional, exclusiones y resultados de formalización.</p></Link>
          <Link href="/pataz"><ShieldWarning size={29} /><h3>Pataz</h3><p>Violencia, socavones, explosivos, camiones, plantas de procesamiento y respuesta estatal.</p></Link>
          <Link href="/madre-de-dios"><TreeEvergreen size={29} /><h3>Madre de Dios</h3><p>Deforestación, mercurio, salud, Tambopata y control ambiental.</p></Link>
          <Link href="/oro-ilegal"><Coins size={29} /><h3>Oro ilegal</h3><p>Cómo el mineral pasa de la extracción al transporte, procesamiento y mercado.</p></Link>
          <Link href="/biblioteca"><GraduationCap size={29} /><h3>Biblioteca académica</h3><p>Investigaciones peruanas organizadas por caso, región, tema, universidad y grado.</p></Link>
        </div>
      </section>

      <section className="home-next">
        <BookOpenText size={28} />
        <div>
          <p className="eyebrow">Profundizar</p>
          <h2>Compara la secuencia de los hechos, los compromisos asumidos y las reglas aplicables.</h2>
          <div>
            <Link href="/cronologia">Cronología <ArrowRight /></Link>
            <Link href="/compromisos">Compromisos <ArrowRight /></Link>
            <Link href="/normativa">Normas <ArrowRight /></Link>
            <Link href="/biblioteca">Biblioteca <ArrowRight /></Link>
            <Link href="/reinfo">REINFO <ArrowRight /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}
