import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bank,
  Coins,
  Factory,
  MapTrifold,
  ShieldWarning,
  Truck,
} from "@phosphor-icons/react/dist/ssr";
import { CriticalSignals } from "@/components/critical-signals";
import { loadObservatoryData } from "@/lib/content";
import { publicAsset } from "@/lib/public-assets";

export const metadata: Metadata = {
  title: "Oro ilegal: extracción, transporte y mercado",
  description: "Cadena económica del oro ilegal, controles estatales, procesamiento, exportación y puntos críticos en el Perú.",
};

const chainStages = [
  {
    stage: "01",
    title: "Extracción",
    body: "Frentes aluviales y socavones filonianos usan equipos, combustibles y explosivos distintos. La intervención debe responder al tipo de operación y al territorio.",
    control: "Gobiernos regionales · FEMA · PNP · Fuerzas Armadas",
  },
  {
    stage: "02",
    title: "Transporte",
    body: "Camiones, rutas fluviales y pasos terrestres conectan los frentes con puntos de acopio. En Pataz, miles de vehículos circularon sin registro suficiente.",
    control: "SUTRAN · PNP · SUNAT · puestos de control",
  },
  {
    stage: "03",
    title: "Procesamiento",
    body: "Plantas de beneficio convierten mineral aurífero en concentrado o barras. Volumen, ley mineral, proveedor y pagos permiten detectar desbalances.",
    control: "MINEM · gobiernos regionales · plantas autorizadas",
  },
  {
    stage: "04",
    title: "Comercialización",
    body: "Acopiadores, procesadores y compradores mueven el oro hacia el sistema financiero. El RECPO identifica parte de estos actores, pero el control requiere operaciones reales.",
    control: "MINEM · SUNAT · UIF · bancos",
  },
  {
    stage: "05",
    title: "Exportación",
    body: "Las alertas aduaneras y financieras pueden detener oro cuando ya llegó al circuito exportador, como ocurrió con una barra destinada a India en 2026.",
    control: "SUNAT/Aduanas · Fiscalía · agentes de aduana",
  },
];

export default function OroIlegalPage() {
  const data = loadObservatoryData();
  const signals = data.criticalSignals
    .filter((signal) => signal.topic === "oro-ilegal")
    .sort((a, b) => a.date.localeCompare(b.date));
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const nationalSource = sourceById.get("pcm-operativos-mineria-ilegal-2026");
  const sunatSource = sourceById.get("sunat-oro-sin-origen-2025");
  const dlSource = sourceById.get("presidencia-dl-1695-mineria-ilegal-2026");
  const recpoSource = sourceById.get("minem-recpo-oro-2026");

  return (
    <div className="gold-page">
      <section className="gold-hero">
        <div>
          <p className="eyebrow">Minería ilegal · economía y control territorial</p>
          <h1>El oro ilegal funciona como una cadena, no como un punto aislado.</h1>
          <p>
            Extraer es solo el primer paso. La economía necesita combustible o explosivos, rutas, plantas, compradores,
            dinero y salida comercial. Si uno de esos eslabones permanece abierto, la actividad puede rearmarse después de cada operativo.
          </p>
          <div className="gold-actions">
            <a href="#cadena" className="button primary">Recorrer la cadena <ArrowRight size={18} /></a>
            <a href="#cifras" className="button secondary">Ver cifras recientes</a>
          </div>
        </div>
        <aside>
          <ShieldWarning size={35} />
          <strong>710 operativos en 24 regiones</strong>
          <span>La PCM reportó S/1.206 millones en bienes incautados o destruidos entre enero y mayo de 2026.</span>
          {nationalSource && <a href={nationalSource.url} target="_blank" rel="noreferrer">Abrir balance nacional <ArrowRight size={15} /></a>}
        </aside>
      </section>

      <section className="gold-visual-intro">
        <figure>
          <Image
            src={publicAsset("/multimedia/reinfo/trazabilidad-oro.webp")}
            alt="Fragmentos de oro durante su procesamiento."
            width="1600"
            height="900"
            sizes="(max-width: 900px) 100vw, 48vw"
          />
        </figure>
        <div>
          <p className="eyebrow">Por qué persiste</p>
          <h2>El metal cambia de forma y de manos antes de llegar al mercado.</h2>
          <p>
            El oro puede salir como mineral, concentrado o barra. Cada transformación reduce la relación visible con el
            lugar de extracción y aumenta la importancia de controlar volúmenes, proveedores, pagos y rutas.
          </p>
        </div>
      </section>

      <section id="cadena" className="gold-chain">
        <div className="section-heading">
          <p className="eyebrow">Cadena económica</p>
          <h2>Del frente minero a la exportación</h2>
        </div>
        <div className="gold-chain-grid">
          {chainStages.map((item) => (
            <article key={item.stage}>
              <span>{item.stage}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <small>{item.control}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="gold-risk-panel">
        <div>
          <p className="eyebrow">Cuatro puntos de presión</p>
          <h2>Controlar la extracción sin cerrar los demás eslabones desplaza el problema.</h2>
        </div>
        <div className="gold-risk-grid">
          <article><Truck size={26} /><h3>Rutas</h3><p>Puestos débiles permiten mover mineral hacia plantas y puntos de acopio. Pataz mostró la escala del tránsito no registrado.</p><Link href="/pataz">Abrir Pataz <ArrowRight size={14} /></Link></article>
          <article><Factory size={26} /><h3>Plantas</h3><p>El balance entre mineral recibido, ley declarada, recuperación y oro producido permite identificar operaciones atípicas.</p><Link href="/mapa?heat=0&cases=0&formal=1">Ver plantas autorizadas <ArrowRight size={14} /></Link></article>
          <article><Bank size={26} /><h3>Pagos</h3><p>Transferencias, liquidaciones de compra y beneficiarios finales conectan el mineral con la investigación financiera.</p><a href="https://www.sbs.gob.pe/prevencion-de-lavado-activos/Sistema-de-Lucha-Contra-el-LA-FT/Evaluacion-Nacional-de-Riesgos" target="_blank" rel="noreferrer">Evaluación nacional de riesgos <ArrowRight size={14} /></a></article>
          <article><Coins size={26} /><h3>Compradores</h3><p>El registro de comercializadores es útil solo si se cruza con transacciones, proveedores y capacidad real de procesamiento.</p>{recpoSource && <a href={recpoSource.url} target="_blank" rel="noreferrer">Consultar RECPO <ArrowRight size={14} /></a>}</article>
        </div>
      </section>

      <section id="cifras" className="gold-metrics">
        <div className="section-heading">
          <p className="eyebrow">Cifras recientes</p>
          <h2>Interdicción, aduanas y nueva legislación muestran dónde actúa el Estado.</h2>
        </div>
        <div className="gold-metric-grid">
          {nationalSource && <a href={nationalSource.url} target="_blank" rel="noreferrer"><strong>S/1.206 M</strong><span>bienes incautados o destruidos</span><p>710 operativos entre enero y mayo de 2026.</p><small>PCM · balance nacional</small></a>}
          {sunatSource && <a href={sunatSource.url} target="_blank" rel="noreferrer"><strong>720 kg</strong><span>oro intervenido</span><p>Valorizado por SUNAT en más de S/174 millones.</p><small>SUNAT · junio de 2025</small></a>}
          {dlSource && <a href={dlSource.url} target="_blank" rel="noreferrer"><strong>6-9 años</strong><span>pena para tráfico ilícito de mineral</span><p>Incluye traslado, acopio, comercialización y exportación.</p><small>DL 1695 · enero de 2026</small></a>}
          <Link href="/reinfo"><strong>2,4%</strong><span>formalización acumulada informada</span><p>La baja salida del régimen prolonga una frontera administrativa vulnerable.</p><small>PCM · julio de 2025</small></Link>
        </div>
      </section>

      <section className="gold-news">
        <div className="section-heading">
          <p className="eyebrow">Cambios y casos · 2026</p>
          <h2>La respuesta empieza a mirar la red completa.</h2>
        </div>
        <CriticalSignals signals={signals} sources={data.sources} />
      </section>

      <section className="gold-map-strip">
        <Image src={publicAsset("/multimedia/maps/oro-ilegal-territorio.webp")} alt="Paisaje amazónico alterado por minería aurífera." width="1600" height="900" sizes="100vw" />
        <div>
          <MapTrifold size={28} />
          <p className="eyebrow">Dos geografías</p>
          <h2>La minería aluvial amazónica y los socavones andinos exigen controles distintos.</h2>
          <p>Madre de Dios concentra dragas, combustible y daño fluvial; Pataz combina explosivos, minería subterránea, camiones y violencia organizada.</p>
          <Link href="/madre-de-dios">Madre de Dios <ArrowRight size={16} /></Link>
          <Link href="/pataz">Pataz <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section className="gold-next">
        <article><Coins size={30} /><h2>REINFO</h2><p>Distribución territorial, duración del proceso y resultados acumulados de formalización.</p><Link href="/reinfo">Abrir REINFO <ArrowRight size={16} /></Link></article>
        <article><MapTrifold size={30} /><h2>Mapa</h2><p>Compara minería ilegal, minería informal, REINFO y plantas autorizadas como capas independientes.</p><Link href="/mapa?heat=0&cases=0&illegal=1">Abrir mapa <ArrowRight size={16} /></Link></article>
        <article><Bank size={30} /><h2>Normas</h2><p>Revisa cómo cambiaron las reglas penales, ambientales y de formalización.</p><Link href="/normativa">Abrir normas <ArrowRight size={16} /></Link></article>
      </section>
    </div>
  );
}
