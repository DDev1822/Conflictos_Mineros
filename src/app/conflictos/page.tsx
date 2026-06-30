import type { Metadata } from "next";
import Link from "next/link";
import { CaseCatalog } from "@/components/case-catalog";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = { title: "Expedientes de conflictos" };

const landmarkCases = [
  {
    title: "La Oroya / Doe Run",
    territory: "Junín",
    axis: "PAMA, aire, salud y responsabilidad estatal",
    status: "Paquete iniciado · jurisprudencial e interamericano",
    why:
      "Debe leerse como hito de salud ambiental, obligaciones estatales, prórrogas del PAMA y reparación. Es fuerte, pero exige separar responsabilidad internacional del Estado, obligaciones empresariales y estado de cumplimiento.",
    next:
      "Armar matriz PAMA: obligación, prórroga, autoridad, fecha, cumplimiento alegado y medida ordenada por la Corte IDH.",
    caution:
      "No atribuir automáticamente responsabilidad penal o empresarial desde la sentencia interamericana sin expediente específico.",
    sources: [
      { label: "Corte IDH · Sentencia La Oroya, 27 nov. 2023", href: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_511_esp.pdf" },
      { label: "Corte IDH · Supervisión de cumplimiento, 3 feb. 2025", href: "https://www.corteidh.or.cr/docs/supervisiones/habitantes_laoroya_03_02_25.pdf" },
    ],
  },
  {
    title: "Cerro Quilish / Yanacocha",
    territory: "Cajamarca",
    axis: "Agua, ordenanza municipal y límites de la autorización minera",
    status: "Paquete iniciado · municipal, constitucional y administrativo",
    why:
      "Es un caso hito para entender cómo Cajamarca convirtió agua, microcuencas y potestad municipal en lenguaje institucional y político frente a la expansión minera.",
    next:
      "Cerrar la Ordenanza 012-2000-CMPC, las RD 361 y 427 completas, la solicitud empresarial de revocatoria y las actas territoriales de 2004.",
    caution:
      "No presentar Quilish como precedente general de veto municipal sin revisar el alcance exacto de las sentencias y actos administrativos.",
    sources: [
      { label: "TC · Sentencia acumulada Quilish, 7 abr. 2003", href: "https://www.tc.gob.pe/jurisprudencia/2003/00300-2002-AA%2000301-2002-AA%2000302-2002-AA.pdf" },
      { label: "SPIJ · RM 467-2004-MEM/DM, revocatoria RD 361", href: "https://spij.minjus.gob.pe/Normas/textos/061104T.pdf" },
      { label: "SINIA/MINAM · Indicadores Ambientales Cajamarca", href: "https://sinia.minam.gob.pe/sites/default/files/sinia/archivos/public/docs/86.pdf" },
    ],
  },
  {
    title: "Yanacocha: Máxima Acuña y comuneros",
    territory: "Cajamarca",
    axis: "Posesión, tierra, defensa de derechos y criminalización",
    status: "Paquete iniciado · predial, penal y derechos humanos",
    why:
      "Funciona como subcaso de Yanacocha/Conga para leer el conflicto desde la defensa de predios, la disputa de propiedad y el uso de procesos penales o civiles alrededor del territorio.",
    next:
      "Cerrar expedientes civiles, locadores registrales/catastrales, medidas cautelares CIDH y documentos de seguridad/hostigamiento.",
    caution:
      "No fusionar la absolución penal con una decisión definitiva sobre todas las controversias de propiedad o posesión.",
    sources: [
      { label: "Poder Judicial · Casación 458-2015 Cajamarca", href: "https://www.pj.gob.pe/wps/wcm/connect/e005bc804101a2b39ad1dedba70825be/Caso%2BM%C3%A1xima%2BAcu%C3%B1a.pdf?CACHEID=e005bc804101a2b39ad1dedba70825be&MOD=AJPERES" },
      { label: "TC · Habeas corpus Máxima Acuña/Yanacocha, 30 jul. 2020", href: "https://tc.gob.pe/jurisprudencia/2020/03882-2016-HC.pdf" },
      { label: "Defensoría · pedido de garantías para Máxima Acuña y familia", href: "https://www.defensoria.gob.pe/defensor-del-pueblo-pidio-a-ministro-del-interior-garantizar-la-integridad-de-maxima-acuna-de-chaupe-y-su-familia/" },
      { label: "Newmont · archivo Chaupe Family Land Dispute", href: "https://www.newmont.com/Chaupe-Family-Land-Dispute/" },
    ],
  },
  {
    title: "Toromocho / Morococha",
    territory: "Junín",
    axis: "Reasentamiento, ciudad minera y compensaciones",
    status: "Paquete iniciado · reasentamiento y práctica empresarial-estatal",
    why:
      "Es el caso que obliga a leer minería no solo como impacto ambiental sino como traslado urbano, vivienda, riesgo geológico, continuidad social y cumplimiento de compromisos.",
    next:
      "Cerrar EIA/MEIA, plan de reasentamiento, actas de mesa, matriz de cumplimiento, expediente judicial de desalojos y fuentes directas de población afectada.",
    caution:
      "No tratar Nueva Morococha como solución cerrada sin matriz de cumplimiento y posiciones de población reasentada/no reasentada.",
    sources: [
      { label: "MINEM · EIA Toromocho / RD 411-2010-MEM-AAM", href: "https://www.gob.pe/institucion/minem/informes-publicaciones/6565035-estudio-de-impacto-ambiental-del-proyecto-de-explotacion-toromocho-presentado-por-minera-chinaico-peru-s-a-c" },
      { label: "SIGRID · INGEMMET A6760 visita técnica Morococha", href: "https://sigrid.cenepred.gob.pe/sigridv3/documento/4564" },
      { label: "MINEM · acuerdos Morococha-Chinalco, 2018", href: "https://www.gob.pe/institucion/minem/noticias/3914-energia-y-minas-logra-acuerdos-entre-la-poblacion-de-morococha-y-la-empresa-minera-chinalco" },
      { label: "Defensoría · Reporte de conflictos 267, mayo 2026", href: "https://www.defensoria.gob.pe/wp-content/uploads/2026/06/Reporte-de-Conflictos-Sociales-n-267-VF.pdf" },
    ],
  },
  {
    title: "Conga",
    territory: "Cajamarca",
    axis: "Agua, EIA, legitimidad y suspensión material",
    status: "Ya integrado · conectado a lectura Cajamarca",
    why:
      "Conga ya está en los seis expedientes, pero debe operar como bisagra: conecta Quilish, Yanacocha, Máxima Acuña, cabeceras de cuenca y la pregunta por legitimidad de la certificación ambiental.",
    next:
      "Cerrar la matriz Cajamarca con Quilish, Máxima Acuña/Yanacocha y Michiquillay, sin convertirlos en un único caso.",
    caution:
      "La aprobación administrativa, el peritaje y la inactividad material no resuelven por sí solos la controversia territorial.",
    sources: [
      { label: "Abrir expediente Conga", href: "/conflictos/conga", internal: true },
      { label: "MINEM · EIA del proyecto Conga", href: "https://www.gob.pe/institucion/minem/informes-publicaciones/6092459-estudio-de-impacto-ambiental-del-proyecto-conga" },
    ],
  },
  {
    title: "Fondo Social Michiquillay",
    territory: "Cajamarca",
    axis: "Beneficios, promoción de inversión y gobernanza del fondo",
    status: "Paquete iniciado · institucional-contractual",
    why:
      "No es un conflicto clásico de protesta; es clave para estudiar la promesa institucional de distribuir beneficios mineros mediante fondos sociales, y sus tensiones de representación, ejecución y control.",
    next:
      "Cerrar contrato y adendas, estatuto vigente, informes de auditoría, reportes cuatrimestrales, matriz de proyectos y fuentes directas de comunidades beneficiarias y críticas.",
    caution:
      "No presentar el fondo como consenso social ni como cumplimiento probado sin informes de gestión, auditoría y participación revisados.",
    sources: [
      { label: "MINEM · colección Fondos Sociales", href: "https://www.gob.pe/institucion/minem/colecciones/26555-fondos-sociales" },
      { label: "Fondo Social Michiquillay · sobre el fondo", href: "https://fsmichiquillay.org.pe/paginas/sobre-el-fondo-social" },
      { label: "MINEM · Memoria Fondos Sociales 2018", href: "https://cdn.www.gob.pe/uploads/document/file/5238821/Memoria%20Fondos%20Sociales%202018.pdf?v=1696611607" },
      { label: "Southern Copper · Form 10-Q 31 mar. 2026", href: "https://www.sec.gov/Archives/edgar/data/1001838/000110465926052647/scco-20260331x10q.htm" },
    ],
  },
] as const;

const transversalReadings = [
  {
    title: "Cajamarca como sistema territorial",
    eyebrow: "Lectura regional",
    summary:
      "Quilish, Conga, Máxima Acuña/Yanacocha y Michiquillay no son un solo caso, pero sí forman una secuencia regional: agua, autoridad local, certificación ambiental, tierra, protección y distribución de beneficios.",
    sequence: ["Quilish", "Conga", "Máxima Acuña", "Michiquillay"],
    thesis:
      "La pregunta no es si Cajamarca acepta o rechaza minería, sino qué instituciones logran —o no— producir confianza territorial cuando se cruzan agua, propiedad, permisos y beneficios.",
    guardrail:
      "No fusionar los casos ni presentar el sistema Yanacocha/Cajamarca como causalidad automática.",
    next:
      "Matriz inicial creada: hito, institución, documento base, controversia, estado al corte, cautela y pregunta de alcance; pendiente pasar a datos canónicos.",
    links: [
      { label: "Abrir expediente Conga", href: "/conflictos/conga", internal: true },
      { label: "TC Quilish", href: "https://www.tc.gob.pe/jurisprudencia/2003/00300-2002-AA%2000301-2002-AA%2000302-2002-AA.pdf" },
      { label: "Casación Máxima Acuña", href: "https://www.pj.gob.pe/wps/wcm/connect/e005bc804101a2b39ad1dedba70825be/Caso%2BM%C3%A1xima%2BAcu%C3%B1a.pdf?CACHEID=e005bc804101a2b39ad1dedba70825be&MOD=AJPERES" },
    ],
  },
  {
    title: "Mecanismos institucionales",
    eyebrow: "Lectura comparativa",
    summary:
      "Los paquetes muestran familias repetidas de mecanismos: EIA, PAMA, sentencias, habeas corpus, mesas, fondos sociales, reasentamiento, medidas de protección y reportes de seguimiento.",
    sequence: ["Autorizar", "Controlar", "Dialogar", "Distribuir", "Verificar"],
    thesis:
      "El observatorio debe preguntar qué problema resuelve cada mecanismo, qué obligación produce, quién queda dentro o fuera y qué evidencia permite evaluar cumplimiento.",
    guardrail:
      "No confundir existencia documental con cumplimiento, impacto, reparación o legitimidad social.",
    next:
      "Matriz mechanismId canónica: familia, caso, documento primario, autoridad, obligación, seguimiento, riesgo editorial y pregunta de alcance.",
    links: [
      { label: "Corte IDH La Oroya", href: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_511_esp.pdf" },
      { label: "MINEM Fondos Sociales", href: "https://www.gob.pe/institucion/minem/colecciones/26555-fondos-sociales" },
      { label: "CENEPRED Morococha", href: "https://sigrid.cenepred.gob.pe/docs/PARA%20PUBLICAR/CENEPRED/Caso%20Reubicacion%20Morococha%20-%20Informe%20tecnico%20028-2013-CENEPRED-SGI.pdf" },
    ],
  },
] as const;

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function CasesPage() {
  const data = loadObservatoryData();
  const latestCutoff = [...data.caseResearchPackets].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0]?.cutoffDate;
  const deepCases = data.caseResearchPackets.filter((packet) => packet.depth === "deep").length;
  const readyPackets = data.caseResearchPackets.filter((packet) => packet.status === "ready").length;
  const sourceIds = new Set(data.caseResearchPackets.flatMap((packet) => packet.sourceIds));
  const directActorSourceIds = new Set(data.caseResearchPackets.flatMap((packet) => packet.directActorSourceIds));
  const blockingGaps = data.caseResearchPackets.flatMap((packet) => packet.gaps).filter((gap) => gap.blocksRelease).length;
  const openContradictions = data.caseResearchPackets.flatMap((packet) => packet.contradictions).filter((item) => item.status === "open").length;
  const timelineCount = data.cases.reduce((sum, item) => sum + item.timeline.length, 0);
  const claimCount = data.cases.reduce((sum, item) => sum + item.claims.length, 0);

  return (
    <div className="content-page">
      <header className="page-intro">
        <p className="eyebrow">Archivo documental V1</p>
        <h1>Expedientes de conflictos</h1>
        <p>
          Índice de seis casos piloto con {timelineCount} hitos, {claimCount} afirmaciones,
          {sourceIds.size} fuentes de investigación y corte documental máximo {formatDate(latestCutoff)}.
          La selección es deliberada: profundidad trazable antes que cobertura nacional completa.
        </p>
      </header>

      <section className="case-stats" aria-label="Estado documental de expedientes">
        <article>
          <strong>{data.cases.length}</strong>
          <span>Expedientes piloto</span>
          <small>{deepCases} profundizados · {data.cases.length - deepCases} estándar.</small>
        </article>
        <article>
          <strong>{readyPackets}/{data.caseResearchPackets.length}</strong>
          <span>Paquetes listos</span>
          <small>Investigación estructurada para lectura documental.</small>
        </article>
        <article>
          <strong>{directActorSourceIds.size}</strong>
          <span>Fuentes actorales</span>
          <small>Posiciones directas de actores afectados o involucrados.</small>
        </article>
        <article>
          <strong>{blockingGaps}</strong>
          <span>Vacíos bloqueantes</span>
          <small>{openContradictions} contradicciones abiertas visibles.</small>
        </article>
      </section>

      <div className="catalog-note">
        <strong>Observatorio académico-documental: hechos, fuentes y posiciones atribuidas.</strong>
        <span>El catálogo muestra estado al corte, vacíos y preguntas abiertas; no presenta conclusiones finales ni determina responsabilidades.</span>
      </div>

      <section className="transversal-readings" aria-labelledby="transversal-readings-heading">
        <div className="section-heading">
          <p className="eyebrow">Lecturas transversales</p>
          <h2 id="transversal-readings-heading">Dos ventanas para leer los casos hito como sistema, no como tarjetas sueltas.</h2>
          <p>
            La primera ordena Cajamarca sin fusionar conflictos distintos. La segunda compara mecanismos
            institucionales para distinguir permiso, control, diálogo, beneficio, cumplimiento y desacuerdo.
          </p>
        </div>
        <div className="transversal-grid">
          {transversalReadings.map((reading) => (
            <article className="transversal-card" key={reading.title}>
              <header>
                <span>{reading.eyebrow}</span>
                <h3>{reading.title}</h3>
                <p>{reading.summary}</p>
              </header>
              <ol className="transversal-sequence" aria-label={`Secuencia de ${reading.title}`}>
                {reading.sequence.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
              <div className="transversal-thesis">
                <strong>Tesis</strong>
                <p>{reading.thesis}</p>
              </div>
              <div className="transversal-guardrail">
                <strong>Guardarraíl</strong>
                <p>{reading.guardrail}</p>
              </div>
              <div className="transversal-next">
                <strong>Siguiente matriz</strong>
                <p>{reading.next}</p>
              </div>
              <div className="transversal-links">
                {reading.links.map((link) => (
                  "internal" in link && link.internal ? (
                    <Link key={link.href} href={link.href}>{link.label}</Link>
                  ) : (
                    <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>
                  )
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landmark-cases" aria-labelledby="landmark-cases-heading">
        <div className="section-heading">
          <p className="eyebrow">Ampliación documental</p>
          <h2 id="landmark-cases-heading">Casos hito que explican el sistema, pero aún no son expedientes cerrados.</h2>
          <p>
            Esta cola evita dos errores: dejar fuera conflictos estructurales y, al mismo tiempo,
            inflar el observatorio con expedientes sin evidencia suficiente. Cada caso entra con pregunta,
            fuente objetivo y advertencia.
          </p>
        </div>
        <div className="landmark-grid">
          {landmarkCases.map((item) => (
            <article className="landmark-card" key={item.title}>
              <div className="landmark-card-header">
                <span>{item.territory}</span>
                <strong>{item.status}</strong>
              </div>
              <h3>{item.title}</h3>
              <p className="landmark-axis">{item.axis}</p>
              <p>{item.why}</p>
              <dl>
                <div>
                  <dt>Siguiente paquete</dt>
                  <dd>{item.next}</dd>
                </div>
                <div>
                  <dt>Cautela</dt>
                  <dd>{item.caution}</dd>
                </div>
              </dl>
              <div className="landmark-sources">
                {item.sources.map((source) => (
                  "internal" in source && source.internal ? (
                    <Link key={source.href} href={source.href}>{source.label}</Link>
                  ) : (
                    <a key={source.href} href={source.href} target="_blank" rel="noreferrer">{source.label}</a>
                  )
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <CaseCatalog
        cases={data.cases}
        issues={data.issues}
        territories={data.territories}
        researchPackets={data.caseResearchPackets}
        sources={data.sources}
        evidenceRecords={data.evidenceRecords}
      />
    </div>
  );
}
