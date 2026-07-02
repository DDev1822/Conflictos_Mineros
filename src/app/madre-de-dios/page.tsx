import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, Database, FileText, MapTrifold, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { DeforestationCounter } from "@/components/deforestation-counter";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Madre de Dios: devastación aurífera",
  description: "Lectura documental sobre deforestación minera, oro ilegal, Tambopata y proyección del avance si el ritmo continúa.",
};

const formatter = new Intl.NumberFormat("es-PE");

function sourceLabel(sourceId: string) {
  return sourceId === "maap-233-gold-mining-peru-amazon" ? "MAAP #233" : "MAAP #241";
}

export default function MadreDeDiosPage() {
  const data = loadObservatoryData();
  const devastation = data.madreDiosDevastation;
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));

  return (
    <div className="madre-page">
      <section className="madre-hero">
        <div>
          <p className="eyebrow">Madre de Dios · oro, bosque y ríos</p>
          <h1>La devastación no es una metáfora: se mide en hectáreas.</h1>
          <p>
            Esta página separa tres capas: deforestación minera documentada, expansión reciente de minería ilegal en Tambopata
            y proyección lineal para entender qué significa dejar correr el reloj.
          </p>
          <div className="madre-actions">
            <a className="button primary" href="#contador">Ver contador <ArrowRight size={18} /></a>
            <Link className="button secondary" href="/oro-ilegal">Conectar con oro ilegal</Link>
          </div>
        </div>
        <figure>
          <Image
            src="/multimedia/maps/oro-ilegal-territorio.webp"
            alt="Textura territorial amazónica usada para representar la expansión de minería aurífera y deforestación."
            width={980}
            height={720}
            priority
          />
          <figcaption>Imagen editorial del observatorio. Los datos cuantitativos provienen de MAAP/ACCA.</figcaption>
        </figure>
      </section>

      <section className="madre-disclaimer">
        <WarningCircle size={24} />
        <p>
          Observatorio civil y académico: no sentencia, no acusa y no reemplaza información oficial. Expone fuentes, locadores,
          método y vacíos para que cualquier corrección documentada pueda incorporarse.
        </p>
      </section>

      <section className="madre-stat-grid" aria-label="Magnitud documentada">
        <article>
          <span>Acumulado regional</span>
          <strong>{formatter.format(devastation.documentedTotal.hectares)} ha</strong>
          <small>{devastation.documentedTotal.label}</small>
        </article>
        <article>
          <span>Reserva Nacional Tambopata</span>
          <strong>{formatter.format(devastation.recentRate.observedHectares)} ha</strong>
          <small>Deforestadas por minería ilegal en el periodo reciente analizado por MAAP.</small>
        </article>
        <article>
          <span>Ritmo reciente</span>
          <strong>{devastation.recentRate.hectaresPerDay.toFixed(2)} ha/día</strong>
          <small>{devastation.recentRate.scope}</small>
        </article>
      </section>

      <section id="contador" className="madre-counter-section">
        <div>
          <p className="eyebrow">Reloj de inacción</p>
          <h2>Si el ritmo reciente continúa, el bosque desaparece mientras miramos.</h2>
          <p>
            El contador parte de las {formatter.format(devastation.recentRate.observedHectares)} hectáreas documentadas por MAAP
            en Tambopata y proyecta el avance con una tasa constante de {devastation.recentRate.hectaresPerHour.toFixed(4)} ha/hora.
          </p>
          <small>{devastation.caveat}</small>
        </div>
        <DeforestationCounter rate={devastation.recentRate} />
      </section>

      <section className="madre-projections">
        <p className="eyebrow">Futuro a este ritmo</p>
        <h2>Proyección lineal de hectáreas adicionales</h2>
        <div>
          {devastation.projectionYears.map((item) => (
            <article key={item.years}>
              <strong>{formatter.format(item.projectedHectares)} ha</strong>
              <span>en {item.years} año{item.years > 1 ? "s" : ""}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="madre-reading-grid">
        <article>
          <MapTrifold size={28} />
          <h2>Qué conecta</h2>
          <p>
            Madre de Dios no es solo un caso regional: conecta REINFO, minería ilegal, trazabilidad del oro, áreas naturales,
            comunidades nativas, mercurio, control estatal y mercado internacional.
          </p>
        </article>
        <article>
          <Database size={28} />
          <h2>Qué mide</h2>
          <p>
            La página mide deforestación minera y ritmo reciente. No mide todo daño ecológico, contaminación por mercurio,
            violencia territorial ni economías criminales; esos ejes deben sumarse con fuentes específicas.
          </p>
        </article>
        <article>
          <BookOpenText size={28} />
          <h2>Cómo se corrige</h2>
          <p>
            Si aparece una fuente más reciente o una tasa mejor, se actualiza el YAML canónico y el contador cambia sin tocar
            la narrativa de fondo.
          </p>
        </article>
      </section>

      <section className="madre-sources">
        <div>
          <p className="eyebrow">Fuentes y locadores</p>
          <h2>La indignación tiene que estar amarrada a evidencia.</h2>
        </div>
        <div>
          {devastation.sourceIds.map((sourceId) => {
            const source = sourceById.get(sourceId);
            if (!source) return null;
            const locator = sourceId === devastation.documentedTotal.sourceId ? devastation.documentedTotal.locator : devastation.recentRate.locator;
            return (
              <a href={source.url} key={source.id} target="_blank" rel="noreferrer">
                <FileText size={22} />
                <span>
                  <strong>{sourceLabel(source.id)}</strong>
                  <small>{source.title}</small>
                  <em>{locator}</em>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      <section className="madre-next">
        <Link href="/reinfo">Leer REINFO / MAPE <ArrowRight size={16} /></Link>
        <Link href="/mapa">Abrir mapa territorial <ArrowRight size={16} /></Link>
        <Link href="/conflictos/madre-de-dios">Ver expediente Madre de Dios <ArrowRight size={16} /></Link>
      </section>
    </div>
  );
}
