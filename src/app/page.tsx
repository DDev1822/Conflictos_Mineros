import Link from "next/link";
import { ArrowRight, BookOpenText, CirclesThreePlus, MapTrifold, Scales } from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";

export default function HomePage() {
  const data = loadObservatoryData();
  return (
    <div className="home-page">
      <section className="hero">
        <p className="eyebrow">Conocimiento · territorio · derechos · evidencia</p>
        <h1>Comprender el conflicto exige ver el sistema completo.</h1>
        <p className="hero-copy">Una base académica para seguir las relaciones entre conflictos mineros, territorios, actores, hechos, normas y alternativas de solución en el Perú.</p>
        <div className="hero-actions">
          <Link className="button primary" href="/explorar">Explorar relaciones <ArrowRight size={18} /></Link>
          <Link className="button secondary" href="/metodologia">Leer la metodología</Link>
        </div>
        <dl className="hero-stats">
          <div><dt>{data.cases.length}</dt><dd>casos piloto</dd></div>
          <div><dt>{data.issues.length}</dt><dd>nudos normativos</dd></div>
          <div><dt>{data.sources.length}</dt><dd>fuentes iniciales</dd></div>
          <div><dt>{data.alternatives.length}</dt><dd>alternativas comparadas</dd></div>
        </dl>
      </section>
      <section className="section-shell">
        <div className="section-heading"><p className="eyebrow">Cuatro formas de entrar</p><h2>Un archivo que permite relacionar, no solo leer</h2></div>
        <div className="entry-grid">
          <Link href="/explorar"><CirclesThreePlus size={29} /><h3>Sistema de relaciones</h3><p>Conecta evidencia, casos, normas y actores desde un mismo espacio de investigación.</p></Link>
          <Link href="/conflictos"><BookOpenText size={29} /><h3>Expedientes</h3><p>Recorre cronologías, controversias y preguntas abiertas de seis casos representativos.</p></Link>
          <Link href="/mapa"><MapTrifold size={29} /><h3>Territorio</h3><p>Ubica casos y reconoce cómo cambian los problemas según cuencas y regiones.</p></Link>
          <Link href="/normativa"><Scales size={29} /><h3>Nudos normativos</h3><p>Distingue normas, implementación, desacuerdos y estado de revisión jurídica.</p></Link>
        </div>
      </section>
      <section className="principles-band">
        <div><span>01</span><h3>Hechos</h3><p>Afirmaciones ligadas a documentos identificables.</p></div>
        <div><span>02</span><h3>Interpretaciones</h3><p>Lecturas atribuidas, sin presentarlas como consenso.</p></div>
        <div><span>03</span><h3>Propuestas</h3><p>Alternativas comparadas con beneficios y riesgos.</p></div>
        <div><span>04</span><h3>Revisión</h3><p>Fecha de corte y estado editorial visibles.</p></div>
      </section>
    </div>
  );
}
