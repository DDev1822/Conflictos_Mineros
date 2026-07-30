import type { Metadata } from "next";
import Link from "next/link";
import { CaseCatalog } from "@/components/case-catalog";
import { loadObservatoryData } from "@/lib/content";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";

export const metadata: Metadata = { title: "Casos hito de conflictos sociales mineros" };

export default function CasesPage() {
  const data = loadObservatoryData();
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const publicCaseIds = new Set(publicCases.map((item) => item.id));
  const packets = data.caseResearchPackets.filter((packet) => publicCaseIds.has(packet.caseId));
  const timelineCount = publicCases.reduce((sum, item) => sum + item.timeline.length, 0);
  const findingCount = publicCases.reduce((sum, item) => sum + item.claims.length, 0);
  const regions = new Set(publicCases.flatMap((item) =>
    data.territories.filter((territory) => item.territoryIds.includes(territory.id)).map((territory) => territory.region),
  ));

  return (
    <div className="content-page">
      <header className="page-intro">
        <p className="eyebrow">Casos hito</p>
        <h1>Conflictos que cambiaron la relación entre minería, territorio y Estado.</h1>
        <p>
          Las fichas explican qué originó cada conflicto, cómo escaló, qué decisiones cambiaron su curso y qué problemas
          permanecen. La selección incluye crisis históricas y casos activos del corte nacional.
        </p>
      </header>

      <section className="case-stats" aria-label="Panorama de conflictos">
        <article><strong>{publicCases.length}</strong><span>casos desarrollados</span><small>Agua, salud, territorio, acuerdos y reasentamiento.</small></article>
        <article><strong>{timelineCount}</strong><span>hitos históricos</span><small>Decisiones, crisis, acuerdos y cambios operativos.</small></article>
        <article><strong>{findingCount}</strong><span>hallazgos comparables</span><small>Problemas, respuestas y resultados identificados en los casos.</small></article>
        <article><strong>{regions.size}</strong><span>regiones analizadas</span><small>Cajamarca, Junín, Cusco, Arequipa, Piura y otras.</small></article>
      </section>

      <section className="transversal-readings" aria-labelledby="transversal-readings-heading">
        <div className="section-heading">
          <p className="eyebrow">Tres patrones nacionales</p>
          <h2 id="transversal-readings-heading">Los casos cambian, pero varias fallas se repiten.</h2>
        </div>
        <div className="transversal-grid">
          <article className="transversal-card">
            <header><span>Agua y territorio</span><h3>La decisión técnica llega antes que la confianza.</h3><p>Quilish, Conga, Tía María y Río Blanco conectan certificación ambiental, distribución territorial del riesgo y legitimidad de las decisiones.</p></header>
            <div className="transversal-links"><Link href="/conflictos/conga">Conga</Link><Link href="/conflictos/cerro-quilish">Cerro Quilish</Link><Link href="/conflictos/rio-blanco-majaz">Río Blanco</Link></div>
          </article>
          <article className="transversal-card">
            <header><span>Salud y ambiente</span><h3>Medir sin actuar prolonga la crisis.</h3><p>Choropampa, Espinar y La Oroya conectan exposición, monitoreo, atención sanitaria, fiscalización y reparación.</p></header>
            <div className="transversal-links"><Link href="/conflictos/choropampa">Choropampa</Link><Link href="/conflictos/espinar">Espinar</Link><Link href="/conflictos/la-oroya">La Oroya</Link></div>
          </article>
          <article className="transversal-card">
            <header><span>Acuerdos y transformación territorial</span><h3>Firmar es apenas el comienzo.</h3><p>Las Bambas, Morococha y Michiquillay muestran compromisos repartidos entre transporte, reasentamiento, obras, beneficios y representación.</p></header>
            <div className="transversal-links"><Link href="/compromisos">Comparar compromisos</Link><Link href="/conflictos/las-bambas">Las Bambas</Link><Link href="/conflictos/toromocho-morococha">Morococha</Link></div>
          </article>
        </div>
      </section>

      <section className="case-catalog-section">
        <div className="section-heading"><p className="eyebrow">Explorar casos</p><h2>Filtra por estado, territorio o problema central.</h2></div>
        <CaseCatalog cases={publicCases} issues={data.issues} territories={data.territories} researchPackets={packets} />
      </section>
    </div>
  );
}
