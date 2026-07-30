import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, Drop, ShieldWarning, TreeEvergreen } from "@phosphor-icons/react/dist/ssr";
import { CriticalSignals } from "@/components/critical-signals";
import { DeforestationCounter } from "@/components/deforestation-counter";
import { loadObservatoryData } from "@/lib/content";
import { publicAsset } from "@/lib/public-assets";

export const metadata: Metadata = {
  title: "Madre de Dios: oro, mercurio y pérdida de bosque",
  description: "Deforestación minera, mercurio, salud, Tambopata y capacidad estatal en Madre de Dios.",
};

const formatter = new Intl.NumberFormat("es-PE");

export default function MadreDeDiosPage() {
  const data = loadObservatoryData();
  const devastation = data.madreDiosDevastation;
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const signals = data.criticalSignals.filter((signal) => signal.topic === "madre-de-dios");
  const localResearch = data.academicResearch
    .filter((item) => item.regions.includes("Madre de Dios"))
    .sort((a, b) => b.year - a.year);
  const totalSource = sourceById.get(devastation.documentedTotal.sourceId);
  const recentSource = sourceById.get(devastation.recentRate.sourceId);

  return (
    <div className="madre-page">
      <section className="madre-hero">
        <div>
          <p className="eyebrow">Madre de Dios · oro, bosque, ríos y salud</p>
          <h1>La minería aurífera ya transformó más de 135 mil hectáreas de bosque.</h1>
          <p>
            El daño combina pérdida de cobertura amazónica, expansión dentro de Tambopata, uso de mercurio,
            exposición humana y una fiscalización regional que llegó tarde o no llegó.
          </p>
          <div className="madre-actions">
            <a className="button primary" href="#contador">Ver ritmo de pérdida <ArrowRight size={18} /></a>
            <a className="button secondary" href="#mercurio">Mercurio y salud</a>
          </div>
        </div>
        <figure>
          <Image src={publicAsset("/multimedia/maps/oro-ilegal-territorio.webp")} alt="Paisaje amazónico intervenido por minería aurífera." width={980} height={720} priority />
          <figcaption>Madre de Dios concentra uno de los mayores frentes de minería aurífera amazónica.</figcaption>
        </figure>
      </section>

      <section className="madre-stat-grid" aria-label="Magnitud del problema">
        <a href={totalSource?.url} target="_blank" rel="noreferrer"><span>Pérdida regional acumulada</span><strong>{formatter.format(devastation.documentedTotal.hectares)} ha</strong><small>{devastation.documentedTotal.label}</small></a>
        <a href={recentSource?.url} target="_blank" rel="noreferrer"><span>Reserva Nacional Tambopata</span><strong>{formatter.format(devastation.recentRate.observedHectares)} ha</strong><small>Deforestadas entre julio de 2025 y febrero de 2026.</small></a>
        <a href={recentSource?.url} target="_blank" rel="noreferrer"><span>Ritmo reciente</span><strong>{devastation.recentRate.hectaresPerDay.toFixed(2)} ha/día</strong><small>{devastation.recentRate.scope}</small></a>
      </section>

      <section id="contador" className="madre-counter-section">
        <div>
          <p className="eyebrow">Ritmo observado en Tambopata</p>
          <h2>Cada día perdido amplía un frente minero dentro del área protegida.</h2>
          <p>
            El contador parte de {formatter.format(devastation.recentRate.observedHectares)} hectáreas detectadas por MAAP
            y extiende el ritmo medio del periodo para hacer visible la velocidad del avance.
          </p>
          {recentSource && <a href={recentSource.url} target="_blank" rel="noreferrer">Abrir análisis MAAP <ArrowRight size={14} /></a>}
        </div>
        <DeforestationCounter rate={devastation.recentRate} />
      </section>

      <section className="madre-projections">
        <p className="eyebrow">Si el ritmo reciente continúa</p>
        <h2>Hectáreas adicionales bajo una proyección lineal</h2>
        <div>
          {devastation.projectionYears.map((item) => (
            <article key={item.years}><strong>{formatter.format(item.projectedHectares)} ha</strong><span>en {item.years} año{item.years > 1 ? "s" : ""}</span></article>
          ))}
        </div>
        <p>La proyección no es un pronóstico: mantiene constante la tasa observada para dimensionar el costo de no frenar el avance.</p>
      </section>

      <section id="mercurio" className="madre-reading-grid">
        <article><Drop size={28} /><h2>Mercurio</h2><p>Contraloría encontró 119 operaciones artesanales sin fiscalización efectiva de la reducción progresiva de mercurio entre 2021 y 2023.</p></article>
        <article><ShieldWarning size={28} /><h2>Falla regional</h2><p>Sesenta y cinco operaciones recibieron instrumentos ambientales sin cronogramas de implementación; siete servidores fueron señalados por presunta responsabilidad penal.</p></article>
        <article><TreeEvergreen size={28} /><h2>Tambopata</h2><p>SERNANP reportó 99 patrullajes y 25 operativos en 2024, pero MAAP detectó después un nuevo frente de 500 hectáreas en Yarinal.</p></article>
      </section>

      <section className="madre-signal-section">
        <div className="section-heading"><p className="eyebrow">Puntos críticos · 2025-2026</p><h2>Fiscalización insuficiente, vigilancia activa y expansión persistente.</h2></div>
        <CriticalSignals signals={signals} sources={data.sources} />
      </section>

      <section className="madre-research">
        <div className="section-heading">
          <p className="eyebrow">Investigación producida en el Perú</p>
          <h2>Salud pública, ríos, mercurio y monitoreo desde universidades peruanas.</h2>
          <p>La producción nacional existe, pero permanece dispersa entre repositorios y rara vez se convierte en seguimiento público continuo.</p>
        </div>
        <div className="madre-research-grid">
          {localResearch.map((item) => (
            <a href={item.recordUrl} key={item.id} target="_blank" rel="noreferrer">
              <BookOpenText size={23} />
              <span>{item.year} · {item.university}</span>
              <h3>{item.title}</h3>
              <p>{item.editorialSummary}</p>
              <small>{item.authors.join(", ")}</small>
            </a>
          ))}
        </div>
      </section>

      <section className="madre-next">
        <Link href="/oro-ilegal">Cadena del oro <ArrowRight size={16} /></Link>
        <Link href="/reinfo">REINFO y formalización <ArrowRight size={16} /></Link>
        <Link href="/mapa">Mapa territorial <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}
