import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, MapTrifold, Rows, SlidersHorizontal } from "@phosphor-icons/react/dist/ssr";
import { loadObservatoryData } from "@/lib/content";
import { getLatestPublicMiningCut } from "@/lib/mining-classification";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";

export const metadata: Metadata = { title: "Cómo se construyen los datos" };

function formatDate(value?: string | null) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function MethodologyPage() {
  const data = loadObservatoryData();
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const { snapshot, selection } = getLatestPublicMiningCut(data);
  if (!snapshot || !selection) throw new Error("No existe un corte público de conflictos sociales mineros");
  const reinfo = [...data.reinfoTerritorialSnapshots].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const conflictSource = data.sources.find((source) => source.id === snapshot.sourceId);
  const reinfoSource = data.sources.find((source) => source.id === "minem-reinfo-vigente-corte-2026-06-18");
  const mapLayers = [
    ["Conflictos sociales mineros", `${selection.totalRegistered} casos: ${selection.active} activos y ${selection.latent} latentes`, "Defensoría del Pueblo"],
    ["REINFO", `${reinfo.totalRegistered.toLocaleString("es-PE")} inscripciones vigentes por departamento`, "MINEM"],
    ["Minería formal", "Plantas de beneficio vigentes; no incluye concesiones ni proyectos futuros", "MINEM"],
    ["Exploración", "Expedientes de inicio de actividad en curso", "MINEM"],
    ["Concesiones", "Derechos titulados agregados por departamento", "INGEMMET"],
    ["Minería ilegal e informal", "Categorías territoriales separadas", "Fuentes estatales y territoriales"],
  ];

  return (
    <div className="method-page">
      <header className="page-intro">
        <p className="eyebrow">Construcción del observatorio</p>
        <h1>Qué cuenta cada dato, cómo se calcula y cuándo se actualiza.</h1>
        <p>
          El observatorio combina cortes nacionales, series regionales y casos desarrollados. Cada indicador mantiene su
          unidad real: caso, inscripción, planta, expediente, derecho minero o hectárea.
        </p>
      </header>

      <section className="method-stats" aria-label="Universos principales">
        <article><strong>{selection.totalRegistered}</strong><span>conflictos sociales mineros</span><small>Reporte {snapshot.reportNumber} · {formatDate(snapshot.cutoffDate)}</small></article>
        <article><strong>{reinfo.totalRegistered.toLocaleString("es-PE")}</strong><span>inscripciones REINFO</span><small>Corte {formatDate(reinfo.cutoffDate)}</small></article>
        <article><strong>{publicCases.length}</strong><span>casos desarrollados</span><small>Historias de alcance nacional y territorial.</small></article>
        <article><strong>{data.academicResearch.length}</strong><span>investigaciones académicas</span><small>Tesis y estudios conectados por tema y región.</small></article>
      </section>

      <div className="method-layout">
        <nav aria-label="Índice de metodología">
          <a href="#universos">Universos</a><a href="#clasificacion">Clasificación</a><a href="#mapa">Mapa</a><a href="#calculos">Cálculos</a><a href="#actualizacion">Actualización</a>
        </nav>
        <div className="prose long-form">
          <section id="universos">
            <h2>Los universos no se suman entre sí</h2>
            <p>
              Un conflicto social es un proceso colectivo; una inscripción REINFO corresponde a una persona natural o jurídica;
              una planta es una instalación autorizada; una concesión es un derecho minero. El mapa permite compararlos, pero no los convierte en la misma unidad.
            </p>
            <div className="method-contract-grid">
              <article><Rows size={24} /><h3>Conflictos</h3><p>Se seleccionan del reporte mensual de la Defensoría los casos vinculados expresamente con actividad minera.</p>{conflictSource && <a href={conflictSource.url} target="_blank" rel="noreferrer">Abrir reporte nacional</a>}</article>
              <article><SlidersHorizontal size={24} /><h3>REINFO</h3><p>Se suman las inscripciones vigentes del corte departamental y se calcula la participación de cada región sobre el total.</p>{reinfoSource && <a href={reinfoSource.url} target="_blank" rel="noreferrer">Abrir corte REINFO</a>}</article>
              <article><MapTrifold size={24} /><h3>Territorio</h3><p>Cuando la fuente solo identifica una región, el observatorio muestra un agregado regional y evita simular coordenadas exactas.</p></article>
            </div>
          </section>

          <section id="clasificacion">
            <h2>Clasificaciones que se mantienen separadas</h2>
            <div className="method-contract-list">
              <div><strong>Activo / latente</strong><span>Estados usados por la Defensoría para conflictos sociales.</span></div>
              <div><strong>Formal / informal / ilegal</strong><span>Categorías distintas por autorización y situación dentro del proceso.</span></div>
              <div><strong>Inscrito / suspendido / excluido / formalizado</strong><span>Momentos diferentes dentro o fuera del REINFO.</span></div>
              <div><strong>Hecho / lectura / alternativa</strong><span>Separa información observable, interpretación analítica y propuesta.</span></div>
            </div>
          </section>

          <section id="mapa">
            <h2>Qué muestra cada capa territorial</h2>
            <div className="method-matrix">
              {mapLayers.map(([name, definition, origin]) => <article key={name}><h3>{name}</h3><p>{definition}</p><small>{origin}</small></article>)}
            </div>
          </section>

          <section id="calculos">
            <h2>Cálculos visibles</h2>
            <div className="method-warning-card">
              <Calculator size={26} />
              <div>
                <h3>Participación regional</h3>
                <p>inscripciones del departamento ÷ inscripciones nacionales × 100</p>
                <h3>Ritmo de deforestación</h3>
                <p>hectáreas observadas ÷ días del periodo</p>
                <h3>Proyección lineal</h3>
                <p>ritmo diario × días futuros; se presenta como escenario constante, no como pronóstico.</p>
              </div>
            </div>
          </section>

          <section id="actualizacion">
            <h2>Frecuencia de actualización</h2>
            <p>
              Conflictos sociales se actualizan con cada reporte mensual incorporado. REINFO cambia cuando MINEM publica un nuevo
              corte. Las capas administrativas y la deforestación conservan la fecha específica del último conjunto incorporado.
            </p>
            <p>Las cifras antiguas no se sobrescriben: cada corte queda disponible para comparar cambios en el tiempo.</p>
            <Link className="method-next-link" href="/mapa">Abrir mapa y comparar capas <ArrowRight /></Link>
          </section>
        </div>
      </div>
    </div>
  );
}
