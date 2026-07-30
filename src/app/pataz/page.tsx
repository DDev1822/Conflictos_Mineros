import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bomb,
  Factory,
  ShieldWarning,
  Truck,
  WarningOctagon,
} from "@phosphor-icons/react/dist/ssr";
import { CriticalSignals } from "@/components/critical-signals";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Pataz: oro, violencia y control territorial",
  description: "Datos y hechos sobre violencia, minería ilegal, transporte de mineral, explosivos y respuesta estatal en Pataz.",
};

const systemLinks = [
  {
    icon: WarningOctagon,
    title: "Socavones disputados",
    text: "Las organizaciones criminales compiten por zonas de extracción, accesos y mineral ya removido. La toma de labores convierte el control subterráneo en una fuente de violencia.",
  },
  {
    icon: Bomb,
    title: "Explosivos desviados",
    text: "La minería de socavón necesita dinamita, anfo y accesorios. El desvío desde circuitos autorizados sostiene la capacidad operativa de frentes clandestinos.",
  },
  {
    icon: Truck,
    title: "Transporte insuficientemente controlado",
    text: "El mineral sale en camiones hacia plantas de procesamiento. Si el control del trayecto es débil, la extracción clandestina puede mezclarse con flujos comerciales.",
  },
  {
    icon: Factory,
    title: "Procesamiento y compra",
    text: "Las plantas y compradores son el puente entre roca aurífera y oro vendible. Seguir volumen, proveedor, ley mineral y pagos es tan importante como intervenir bocaminas.",
  },
];

export default function PatazPage() {
  const data = loadObservatoryData();
  const signals = data.criticalSignals
    .filter((signal) => signal.topic === "pataz")
    .sort((a, b) => a.date.localeCompare(b.date));
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const investigationSource = sourceById.get("elcomercio-pataz-radiografia-2025");
  const stateBalanceSource = sourceById.get("mindef-pataz-balance-2026");

  return (
    <div className="pataz-page">
      <section className="pataz-hero">
        <div>
          <p className="eyebrow">Pataz · minería subterránea y crimen organizado</p>
          <h1>El oro se convirtió en una disputa armada por territorio, mineral y rutas de salida.</h1>
          <p>
            El asesinato de trece trabajadores en 2025 expuso una estructura que conecta socavones, explosivos,
            transporte, plantas de procesamiento y organizaciones criminales. La respuesta estatal posterior fue
            intensa; el desafío es sostener control sobre toda la cadena.
          </p>
          <div className="pataz-actions">
            <a className="button primary" href="#hechos">Ver hechos y cifras <ArrowRight size={17} /></a>
            <Link className="button secondary" href="/oro-ilegal">Seguir la cadena del oro</Link>
          </div>
        </div>
        <aside>
          <ShieldWarning size={52} weight="thin" aria-hidden />
          <strong>13 trabajadores asesinados</strong>
          <span>
            Secuestrados en abril de 2025 y encontrados muertos dentro del socavón Galindo. El caso dio lugar a
            capturas e investigaciones por crimen organizado.
          </span>
          <a
            href="https://www.gob.pe/institucion/mininter/noticias/1177728-pataz-pnp-captura-a-los-sicarios-de-cuchillo-implicados-en-asesinato-de-13-personas-en-socavon-minero"
            target="_blank"
            rel="noreferrer"
          >
            Abrir información del Ministerio del Interior <ArrowRight size={15} />
          </a>
        </aside>
      </section>

      <section className="pataz-stat-band" aria-label="Cifras críticas de Pataz">
        <a href={investigationSource?.url} target="_blank" rel="noreferrer"><strong>39</strong><span>muertes vinculadas denunciadas por Poderosa desde 2022</span></a>
        <a href={investigationSource?.url} target="_blank" rel="noreferrer"><strong>3.800</strong><span>camiones sin registro en diez meses, según investigación periodística</span></a>
        <a href={stateBalanceSource?.url} target="_blank" rel="noreferrer"><strong>2.520</strong><span>patrullajes integrados informados entre mayo de 2025 y mayo de 2026</span></a>
        <a href={stateBalanceSource?.url} target="_blank" rel="noreferrer"><strong>S/249,8 M</strong><span>afectación económica reportada por el Comando Unificado</span></a>
      </section>

      <section className="pataz-system">
        <div className="section-heading">
          <p className="eyebrow">Cómo funciona el problema</p>
          <h2>La violencia no nace en un solo socavón: depende de una red económica.</h2>
          <p>
            El control territorial pierde eficacia cuando la intervención se concentra en la extracción y deja abiertos
            el abastecimiento, el transporte, el procesamiento o la compra.
          </p>
        </div>
        <div className="pataz-system-grid">
          {systemLinks.map(({ icon: Icon, title, text }, index) => (
            <article key={title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <Icon size={29} aria-hidden />
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="hechos" className="pataz-signals">
        <div className="section-heading">
          <p className="eyebrow">Secuencia crítica · 2025-2026</p>
          <h2>Del secuestro a un despliegue estatal permanente.</h2>
        </div>
        <CriticalSignals signals={signals} sources={data.sources} />
      </section>

      <section className="pataz-state-reading">
        <div>
          <p className="eyebrow">Falla institucional visible</p>
          <h2>El Estado reaccionó después de que la violencia ya había escalado.</h2>
        </div>
        <div>
          <p>
            Antes de la masacre existían estado de emergencia, operativos y presencia policial. Aun así, trece personas
            fueron secuestradas y asesinadas. Esa secuencia obliga a evaluar la estrategia por resultados sostenidos de
            seguridad, investigación criminal y control de rutas, no solo por el valor de bienes destruidos.
          </p>
          <p>
            El balance oficial de mayo de 2026 informa miles de patrullajes y decenas de acciones militares. El siguiente
            indicador decisivo es si disminuyen las muertes, las tomas de labores, el tráfico de explosivos y la salida de
            mineral sin control.
          </p>
        </div>
      </section>

      <section className="pataz-next">
        <Link href="/oro-ilegal">Cadena del oro <ArrowRight size={15} /></Link>
        <Link href="/reinfo">REINFO y formalización <ArrowRight size={15} /></Link>
        <Link href="/mapa?heat=0&cases=0&illegal=1">Mapa de minería ilegal <ArrowRight size={15} /></Link>
      </section>
    </div>
  );
}
