import type { Metadata } from "next";
import { BookOpenText, GraduationCap, MagnifyingGlass, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { AcademicLibrary } from "@/components/academic-library";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = {
  title: "Biblioteca académica",
  description: "Tesis universitarias sobre conflictos sociales mineros, formalización y minería ilegal en el Perú.",
};

const degreeLabels = {
  pregrado: "Título / pregrado",
  maestria: "Maestría",
  doctorado: "Doctorado",
} as const;

export default function AcademicLibraryPage() {
  const data = loadObservatoryData();
  const items = [...data.academicResearch].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title, "es"));
  const universityCount = new Set(items.map((item) => item.university)).size;
  const caseCount = new Set(items.flatMap((item) => item.caseSlugs)).size;
  const latestCatalogDate = [...items].sort((a, b) => b.cataloguedAt.localeCompare(a.cataloguedAt))[0]?.cataloguedAt;

  return (
    <div className="content-page library-page">
      <header className="library-hero">
        <div>
          <p className="eyebrow">Biblioteca académica · tesis universitarias</p>
          <h1>Investigaciones para leer los conflictos mineros con más profundidad.</h1>
          <p>
            Selección curada de tesis de título, maestría y doctorado sobre conflictos sociales mineros en el Perú.
            REINFO, formalización y minería ilegal aparecen como ejes complementarios claramente separados.
          </p>
        </div>
        <BookOpenText size={72} weight="thin" aria-hidden />
      </header>

      <section className="library-stats" aria-label="Cobertura de la biblioteca">
        <article><strong>{items.length}</strong><span>Investigaciones</span><small>Con ficha y enlace al registro académico.</small></article>
        <article><strong>{universityCount}</strong><span>Universidades</span><small>Registros de ALICIA y archivos académicos.</small></article>
        <article><strong>{caseCount}</strong><span>Casos conectados</span><small>Las relaciones no sustituyen la evidencia primaria.</small></article>
        <article><strong>3</strong><span>Niveles de grado</span><small>{Object.values(degreeLabels).join(" · ")}.</small></article>
      </section>

      <section className="library-reading-note">
        <WarningCircle size={26} aria-hidden />
        <div>
          <h2>Cómo leer esta biblioteca</h2>
          <p>
            Las síntesis son editoriales y describen el objeto de estudio declarado por cada investigación. Una tesis aporta interpretación,
            método y contexto; no prueba por sí sola un hecho actual, una responsabilidad jurídica ni la vigencia de una cifra.
          </p>
        </div>
      </section>

      <section className="library-catalog-section">
        <div className="library-section-heading">
          <div>
            <p className="eyebrow">Explorar el corpus</p>
            <h2>Busca por caso, tema, región, autor o universidad</h2>
          </div>
          <span><MagnifyingGlass aria-hidden /> Corte de catalogación: {latestCatalogDate}</span>
        </div>
        <AcademicLibrary items={items} cases={data.cases.map(({ slug, name }) => ({ slug, name }))} />
      </section>

      <section className="library-method">
        <GraduationCap size={32} aria-hidden />
        <div>
          <p className="eyebrow">Criterio de inclusión</p>
          <h2>Qué entra y qué queda fuera</h2>
          <p>
            Se incluyen tesis universitarias con metadatos identificables, relación directa con minería en el Perú y ficha verificable en ALICIA
            o en el archivo académico institucional de la universidad.
            Se priorizan estudios sobre los casos desarrollados por el observatorio. No se reproducen resúmenes completos ni se convierten
            conclusiones académicas en afirmaciones propias.
          </p>
        </div>
      </section>
    </div>
  );
}
