import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowSquareOut,
  ClockCounterClockwise,
  MapPin,
  TrendDown,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import { CriticalSignals } from "@/components/critical-signals";
import { ReinfoRegionalExplorer } from "@/components/reinfo-regional-explorer";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = {
  title: "REINFO: cifras y resultados de la formalización minera",
  description: "Evolución, resultados, distribución territorial y puntos críticos del REINFO y del proceso de formalización MAPE.",
};

const numberFormatter = new Intl.NumberFormat("es-PE");
const percentFormatter = new Intl.NumberFormat("es-PE", {
  style: "percent",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export default function ReinfoPage() {
  const data = loadObservatoryData();
  const latest = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const regions = [...latest.regions].filter((region) => region.count > 0).sort((a, b) => b.count - a.count);
  const topFive = regions.slice(0, 5);
  const topFiveTotal = topFive.reduce((sum, region) => sum + region.count, 0);
  const madreDeDios = regions.find((region) => region.id === "madre-de-dios");
  const reinfoSignals = data.criticalSignals
    .filter((signal) => signal.topic === "reinfo")
    .sort((a, b) => a.date.localeCompare(b.date));
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const registrySource = sourceById.get("minem-reinfo");
  const exclusionSource = sourceById.get("minem-rd-0004-2025-reinfo-exclusiones");
  const extensionSource = sourceById.get("minem-ley-32537-reinfo-2026");
  const performanceSource = sourceById.get("pcm-reinfo-formalizacion-2025");

  return (
    <div className="reinfo-page reinfo-data-page">
      <section className="reinfo-data-hero">
        <div>
          <p className="eyebrow">Formalización de pequeña minería y minería artesanal</p>
          <h1>REINFO: un régimen transitorio que sigue abierto después de más de una década.</h1>
          <p>
            El corte oficial reunido por el observatorio registra {numberFormatter.format(latest.totalRegistered)} inscripciones
            vigentes al {formatDate(latest.cutoffDate)}. La pregunta central ya no es cuántos ingresaron, sino cuántos culminan
            la formalización, cuánto tiempo permanecen y dónde se concentra el proceso.
          </p>
          <div className="reinfo-data-actions">
            <a className="button primary" href="#regiones">Explorar departamentos <ArrowRight size={17} /></a>
            {registrySource && (
              <a className="button secondary" href={registrySource.url} target="_blank" rel="noreferrer">
                Consultar REINFO <ArrowSquareOut size={15} />
              </a>
            )}
          </div>
        </div>
        <aside>
          <ClockCounterClockwise size={48} weight="thin" aria-hidden />
          <strong>Hasta el 31 de diciembre de 2026</strong>
          <span>
            La Ley 32537 volvió a ampliar el proceso e incorporó censo nacional, sinceramiento de ubicación y nuevas
            obligaciones laborales y administrativas.
          </span>
          {extensionSource && <a href={extensionSource.url} target="_blank" rel="noreferrer">Abrir la ampliación de 2026 <ArrowRight size={15} /></a>}
        </aside>
      </section>

      <section className="reinfo-data-stats" aria-label="Indicadores principales del REINFO">
        {registrySource && (
          <a href={registrySource.url} target="_blank" rel="noreferrer">
            <strong>{numberFormatter.format(latest.totalRegistered)}</strong>
            <span>inscripciones vigentes</span>
            <small>Corte departamental del {formatDate(latest.cutoffDate)}</small>
          </a>
        )}
        <a href="#regiones">
          <strong>{percentFormatter.format(topFiveTotal / latest.totalRegistered)}</strong>
          <span>concentrado en cinco departamentos</span>
          <small>{topFive.map((region) => region.name).join(", ")}</small>
        </a>
        {exclusionSource && (
          <a href={exclusionSource.url} target="_blank" rel="noreferrer">
            <strong>50.565</strong>
            <span>registros excluidos en 2025</span>
            <small>Inscripciones suspendidas por más de un año</small>
          </a>
        )}
        {performanceSource && (
          <a href={performanceSource.url} target="_blank" rel="noreferrer">
            <strong>2,4%</strong>
            <span>formalización acumulada informada</span>
            <small>Declaración de la PCM sobre más de 84.000 inscripciones</small>
          </a>
        )}
      </section>

      <section className="reinfo-explainer">
        <div className="section-heading">
          <p className="eyebrow">Qué representa cada estado</p>
          <h2>Inscribirse, permanecer y formalizarse son momentos distintos.</h2>
        </div>
        <div className="reinfo-explainer-grid">
          <article>
            <span>01</span>
            <h3>Inscripción</h3>
            <p>Incorpora a una persona natural o jurídica al proceso y vincula actividad, derecho minero y ubicación declarada.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Vigencia</h3>
            <p>Permite continuar dentro del proceso mientras se cumplen requisitos ambientales, técnicos, tributarios y contractuales.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Suspensión o exclusión</h3>
            <p>La falta de requisitos o el tiempo prolongado en suspensión puede cerrar la permanencia en el proceso.</p>
          </article>
          <article>
            <span>04</span>
            <h3>Formalización concluida</h3>
            <p>Es la salida esperada del régimen transitorio y exige completar las condiciones aplicables a la operación.</p>
          </article>
        </div>
      </section>

      <div id="regiones">
        <ReinfoRegionalExplorer regions={latest.regions} total={latest.totalRegistered} />
      </div>

      <section className="reinfo-concentration">
        <div>
          <MapPin size={31} aria-hidden />
          <p className="eyebrow">Concentración territorial</p>
          <h2>Cinco departamentos reúnen {numberFormatter.format(topFiveTotal)} inscripciones vigentes.</h2>
        </div>
        <ol>
          {topFive.map((region, index) => (
            <li key={region.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{region.name}</strong>
              <em>{numberFormatter.format(region.count)}</em>
              <small>{percentFormatter.format(region.count / latest.totalRegistered)} del total</small>
            </li>
          ))}
        </ol>
        {madreDeDios && (
          <p>
            Madre de Dios ocupa el tercer lugar con {numberFormatter.format(madreDeDios.count)} inscripciones. Esa escala
            conecta formalización, expansión aurífera, mercurio y presión sobre áreas naturales.
            <Link href="/madre-de-dios"> Abrir análisis regional <ArrowRight size={14} /></Link>
          </p>
        )}
      </section>

      <section className="reinfo-history">
        <div className="section-heading">
          <p className="eyebrow">Cambios decisivos · 2025-2026</p>
          <h2>Depuración, bajo resultado y una nueva ampliación.</h2>
        </div>
        <CriticalSignals signals={reinfoSignals} sources={data.sources} />
      </section>

      <section className="reinfo-critical-points">
        <div className="section-heading">
          <p className="eyebrow">Puntos críticos</p>
          <h2>El tamaño del registro oculta cuatro problemas de política pública.</h2>
        </div>
        <div>
          <article>
            <TrendDown size={27} aria-hidden />
            <h3>Salida demasiado lenta</h3>
            <p>El balance oficial de 2,4% muestra que la permanencia en el proceso creció mucho más rápido que la formalización concluida.</p>
          </article>
          <article>
            <ClockCounterClockwise size={27} aria-hidden />
            <h3>Prórrogas sucesivas</h3>
            <p>Cada ampliación desplaza el cierre del régimen y obliga a redefinir quién continúa, bajo qué requisitos y durante cuánto tiempo.</p>
          </article>
          <article>
            <MapPin size={27} aria-hidden />
            <h3>Ubicación declarada incompleta</h3>
            <p>La Ley 32537 exige sincerar la ubicación real de las operaciones, una condición básica para fiscalización ambiental y laboral.</p>
          </article>
          <article>
            <UsersThree size={27} aria-hidden />
            <h3>Responsabilidades fragmentadas</h3>
            <p>MINEM conduce el proceso, pero gobiernos regionales, autoridades ambientales y fiscalizadores intervienen en requisitos distintos.</p>
          </article>
        </div>
      </section>

      <section className="reinfo-next">
        <Link href="/mapa?heat=0&cases=0&reinfo=1">Ver distribución en el mapa <ArrowRight size={15} /></Link>
        <Link href="/pataz">REINFO y violencia en Pataz <ArrowRight size={15} /></Link>
        <Link href="/normativa#formalizacion-mape">Reglas del proceso MAPE <ArrowRight size={15} /></Link>
      </section>
    </div>
  );
}
