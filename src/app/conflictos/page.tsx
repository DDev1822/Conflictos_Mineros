import type { Metadata } from "next";
import Link from "next/link";
import { CaseCatalog } from "@/components/case-catalog";
import { loadObservatoryData } from "@/lib/content";
import { getLatestPublicMiningCut } from "@/lib/mining-classification";
import { isPublishedSocialMiningCase } from "@/lib/public-scope";

export const metadata: Metadata = { title: "Casos hito de conflictos sociales mineros" };

const landmarkCases = [
  {
    title: "Cerro Quilish / Yanacocha",
    territory: "Cajamarca",
    axis: "Agua, ordenanza municipal y límites de la autorización minera",
    status: "Prioridad municipal, constitucional y administrativa",
    why:
      "Es un caso hito para entender cómo Cajamarca convirtió agua, microcuencas y potestad municipal en lenguaje institucional y político frente a la expansión minera.",
    next:
      "Documentos clave: Ordenanza 012-2000-CMPC, RD 361 y 427, solicitud empresarial de revocatoria y actas territoriales de 2004.",
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
    status: "Disputa territorial con vías penal, civil y constitucional",
    why:
      "Permite leer la defensa territorial, la disputa predial y las vías penal, civil y constitucional como un caso propio relacionado con Conga, sin quedar absorbido por ese proyecto.",
    next:
      "Conviene contrastar los expedientes civiles, las referencias registrales y catastrales, la implementación de medidas CIDH y los documentos de seguridad.",
    caution:
      "No fusionar la absolución penal con una decisión definitiva sobre todas las controversias de propiedad o posesión.",
    sources: [
      { label: "Abrir caso Máxima Acuña–Yanacocha", href: "/conflictos/yanacocha-maxima-acuna", internal: true },
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
    status: "Reasentamiento y cumplimiento de compromisos",
    why:
      "Es el caso que obliga a leer minería no solo como impacto ambiental sino como traslado urbano, vivienda, riesgo geológico, continuidad social y cumplimiento de compromisos.",
    next:
      "El contraste reúne EIA y MEIA, Plan de Acción, actas de mesa, seguimiento de compromisos, expediente judicial y fuentes directas de población afectada.",
    caution:
      "No tratar Nueva Morococha como solución cerrada sin revisar cada compromiso y las posiciones de población reasentada y no reasentada.",
    sources: [
      { label: "Abrir caso Toromocho–Morococha", href: "/conflictos/toromocho-morococha", internal: true },
      { label: "MINEM · EIA Toromocho / RD 411-2010-MEM-AAM", href: "https://www.gob.pe/institucion/minem/informes-publicaciones/6565035-estudio-de-impacto-ambiental-del-proyecto-de-explotacion-toromocho-presentado-por-minera-chinaico-peru-s-a-c" },
      { label: "SIGRID · INGEMMET A6760 visita técnica Morococha", href: "https://sigrid.cenepred.gob.pe/sigridv3/documento/4564" },
      { label: "MINEM · acuerdos Morococha-Chinalco, 2018", href: "https://www.gob.pe/institucion/minem/noticias/3914-energia-y-minas-logra-acuerdos-entre-la-poblacion-de-morococha-y-la-empresa-minera-chinalco" },
      { label: "Defensoría · Reporte de conflictos 267, mayo 2026", href: "https://www.defensoria.gob.pe/wp-content/uploads/2026/06/Reporte-de-Conflictos-Sociales-n-267-VF.pdf" },
    ],
  },
  {
    title: "Choropampa / derrame de mercurio",
    territory: "Cajamarca",
    axis: "Transporte peligroso, emergencia, salud y reparación",
    status: "Conflicto histórico por exposición, atención y reparación",
    why:
      "Obliga a estudiar cómo un incidente de transporte minero se convierte en conflicto social por exposición, respuesta estatal, atención, fiscalización, acuerdos, litigios y confianza.",
    next:
      "El contraste requiere series sanitarias anonimizadas, detalle de transacciones y obras, expedientes judiciales y archivo directo del Frente de Defensa.",
    caution:
      "No convertir cifras agregadas en diagnósticos individuales ni acuerdos o sentencias procesales en reparación integral.",
    sources: [
      { label: "Abrir caso Choropampa", href: "/conflictos/choropampa", internal: true },
      { label: "Defensoría · Informe 62", href: "https://www.defensoria.gob.pe/wp-content/uploads/2018/05/informe_62.pdf" },
      { label: "CAO · investigación independiente de 2000", href: "https://www.cao-ombudsman.org/sites/default/files/downloads/June2000MercurySpill_000.pdf" },
      { label: "Poder Judicial · Primer Pleno Casatorio Civil", href: "https://www.pj.gob.pe/wps/wcm/connect/09ca528047e3d59dbb60ff1f51d74444/Primer%2BPleno%2BCasatorio%2BCivil.pdf?CACHEID=09ca528047e3d59dbb60ff1f51d74444&MOD=AJPERES" },
    ],
  },
  {
    title: "Conga",
    territory: "Cajamarca",
    axis: "Agua, EIA, legitimidad y suspensión material",
    status: "Agua, certificación ambiental y suspensión del proyecto",
    why:
      "Conga conecta Quilish, Yanacocha, Máxima Acuña, cabeceras de cuenca y la controversia sobre la legitimidad de la certificación ambiental.",
    next:
      "La comparación regional incluye Quilish, Máxima Acuña/Yanacocha y Michiquillay, manteniendo cada conflicto como un caso diferenciado.",
    caution:
      "La aprobación administrativa, el peritaje y la inactividad material no resuelven por sí solos la controversia territorial.",
    sources: [
      { label: "Abrir caso Conga", href: "/conflictos/conga", internal: true },
      { label: "MINEM · EIA del proyecto Conga", href: "https://www.gob.pe/institucion/minem/informes-publicaciones/6092459-estudio-de-impacto-ambiental-del-proyecto-conga" },
    ],
  },
  {
    title: "Fondo Social Michiquillay",
    territory: "Cajamarca",
    axis: "Beneficios, promoción de inversión y gobernanza del fondo",
    status: "Conflicto latente por acuerdos, pasivos y gestión del Fondo",
    why:
      "La Defensoría registró un conflicto socioambiental por pasivos, acuerdos y ejecución del Fondo. El caso permite estudiar cómo un mecanismo de beneficios puede convertirse en una arena de representación, prioridades, control y reclamos de cumplimiento.",
    next:
      "Conviene contrastar transferencias, proyectos, auditorías, recepción de obras, resultados territoriales y voces diferenciadas de los sectores comunales.",
    caution:
      "Fondo creado, dinero transferido e informes publicados no equivalen a consenso, desempeño suficiente ni impacto probado.",
    sources: [
      { label: "Abrir caso Fondo Social Michiquillay", href: "/conflictos/fondo-social-michiquillay", internal: true },
      { label: "MINEM · colección Fondos Sociales", href: "https://www.gob.pe/institucion/minem/colecciones/26555-fondos-sociales" },
      { label: "Fondo Social Michiquillay · sobre el fondo", href: "https://fsmichiquillay.org.pe/paginas/sobre-el-fondo-social" },
      { label: "MINEM · Memoria Fondos Sociales 2018", href: "https://cdn.www.gob.pe/uploads/document/file/5238821/Memoria%20Fondos%20Sociales%202018.pdf?v=1696611607" },
      { label: "Southern Copper · Form 10-Q 31 mar. 2026", href: "https://www.sec.gov/Archives/edgar/data/1001838/000110465926052647/scco-20260331x10q.htm" },
    ],
  },
  {
    title: "Río Blanco / Majaz",
    territory: "Piura",
    axis: "Autorización comunal, consulta vecinal, páramos y rehabilitación",
    status: "Conflicto activo por territorio, participación y ambiente",
    why:
      "Permite leer cómo autorización ambiental, acceso a tierras comunales, participación local, protesta, fiscalización y rehabilitación pueden avanzar por vías distintas sin resolver automáticamente la legitimidad territorial.",
    next:
      "El contraste requiere actas y padrones comunales, expediente municipal de la consulta, procesos judiciales, verificación física de la rehabilitación y estudios actuales del rediseño.",
    caution:
      "No equiparar consulta vecinal con consulta previa o veto jurídico, ni sanción y planes de rehabilitación con cierre ambiental o social.",
    sources: [
      { label: "Abrir caso Río Blanco–Majaz", href: "/conflictos/rio-blanco-majaz", internal: true },
      { label: "Defensoría · Informe de Adjuntía 001-2006", href: "https://www.defensoria.gob.pe/modules/Downloads/informes/varios/2006/Informe-de-Adjuntia-N-001-2006-ASPMA-MA.pdf" },
      { label: "MINEM · Evaluación Ambiental Río Blanco", href: "https://www.gob.pe/institucion/minem/informes-publicaciones/6496508-evaluacion-ambiental-del-proyecto-de-exploracion-rio-blanco" },
      { label: "Defensoría · Reporte 246, agosto 2024", href: "https://www.defensoria.gob.pe/wp-content/uploads/2024/09/Reporte-Mensual-de-Conflictos-Sociales-N%C2%B0-246-Agosto_2024-1.pdf" },
      { label: "Río Blanco Copper · proyecto", href: "https://rioblanco.com.pe/proyecto-rio-blanco/" },
    ],
  },
] as const;

const transversalReadings = [
  {
    title: "Cajamarca como sistema territorial",
    eyebrow: "Sistema regional",
    summary:
      "Choropampa, Quilish, Conga, Máxima Acuña/Yanacocha y Michiquillay no son un solo caso, pero sí forman una secuencia regional: emergencia, salud, agua, autoridad local, certificación ambiental, tierra, protección y distribución de beneficios.",
    sequence: ["Choropampa", "Quilish", "Conga", "Máxima Acuña", "Michiquillay"],
    thesis:
      "La pregunta no es si Cajamarca acepta o rechaza minería, sino qué instituciones logran —o no— producir confianza territorial cuando se cruzan agua, propiedad, permisos y beneficios.",
    guardrail:
      "No fusionar los casos ni presentar el sistema Yanacocha/Cajamarca como causalidad automática.",
    next:
      "Se comparan hitos, instituciones, documentos base, controversias, obligaciones, actores afectados y preguntas probatorias.",
    links: [
      { label: "Abrir caso Choropampa", href: "/conflictos/choropampa", internal: true },
      { label: "Abrir caso Conga", href: "/conflictos/conga", internal: true },
      { label: "TC Quilish", href: "https://www.tc.gob.pe/jurisprudencia/2003/00300-2002-AA%2000301-2002-AA%2000302-2002-AA.pdf" },
      { label: "Casación Máxima Acuña", href: "https://www.pj.gob.pe/wps/wcm/connect/e005bc804101a2b39ad1dedba70825be/Caso%2BM%C3%A1xima%2BAcu%C3%B1a.pdf?CACHEID=e005bc804101a2b39ad1dedba70825be&MOD=AJPERES" },
    ],
  },
  {
    title: "Mecanismos institucionales",
    eyebrow: "Comparación institucional",
    summary:
      "Los casos repiten familias de mecanismos: EIA, PAMA, sentencias, habeas corpus, mesas, fondos sociales, reasentamiento, medidas de protección y reportes de seguimiento.",
    sequence: ["Autorizar", "Controlar", "Dialogar", "Distribuir", "Verificar"],
    thesis:
      "La comparación pregunta qué problema resuelve cada mecanismo, qué obligación produce, quién queda dentro o fuera y qué evidencia permite evaluar cumplimiento.",
    guardrail:
      "No confundir existencia documental con cumplimiento, impacto, reparación o legitimidad social.",
    next:
      "Se comparan el tipo de mecanismo, el caso, el documento primario, la autoridad, la obligación, el seguimiento y la pregunta probatoria.",
    links: [
      { label: "Corte IDH La Oroya", href: "https://www.corteidh.or.cr/docs/casos/articulos/seriec_511_esp.pdf" },
      { label: "MINEM Fondos Sociales", href: "https://www.gob.pe/institucion/minem/colecciones/26555-fondos-sociales" },
      { label: "CENEPRED Morococha", href: "https://sigrid.cenepred.gob.pe/docs/PARA%20PUBLICAR/CENEPRED/Caso%20Reubicacion%20Morococha%20-%20Informe%20tecnico%20028-2013-CENEPRED-SGI.pdf" },
    ],
  },
  {
    title: "Compromisos y evidencia",
    eyebrow: "Comparación transversal",
    summary:
      "Tambogrande, Las Bambas, Espinar, Cerro Quilish, Morococha y Choropampa permiten comparar condiciones contractuales, convenios, actas, planes y resultados puntuales sin llamar cumplimiento a la sola existencia del documento.",
    sequence: ["Condición", "Acuerdo", "Seguimiento", "Resultado"],
    thesis:
      "La pregunta útil no es cuántos compromisos se anunciaron, sino qué actor asumió cada acción, qué evidencia posterior existe y qué límites tiene la documentación disponible.",
    guardrail:
      "No localizado significa ausencia de evidencia suficiente en la documentación revisada; no demuestra incumplimiento.",
    next:
      "Se comparan cada compromiso, sus responsables, ámbito, etapa documental, evidencia de ejecución y límite probatorio.",
    links: [
      { label: "Abrir comparación de compromisos", href: "/compromisos", internal: true },
    ],
  },
] as const;

function formatDate(value?: string) {
  if (!value) return "s/f";
  return new Intl.DateTimeFormat("es-PE", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

export default function CasesPage() {
  const data = loadObservatoryData();
  const publicCases = data.cases.filter(isPublishedSocialMiningCase);
  const publicCaseIds = new Set(publicCases.map((item) => item.id));
  const publicResearchPackets = data.caseResearchPackets.filter((packet) => publicCaseIds.has(packet.caseId));
  const { selection: latestMiningSelection } = getLatestPublicMiningCut(data);
  if (!latestMiningSelection) throw new Error("No existe un corte público de conflictos sociales mineros");
  const latestCutoff = [...publicResearchPackets].sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0]?.cutoffDate;
  const sourceIds = new Set(publicResearchPackets.flatMap((packet) => packet.sourceIds));
  const timelineCount = publicCases.reduce((sum, item) => sum + item.timeline.length, 0);
  const claimCount = publicCases.reduce((sum, item) => sum + item.claims.length, 0);

  return (
    <div className="content-page">
      <header className="page-intro">
        <p className="eyebrow">Casos hito · conflictos sociales mineros</p>
        <h1>Casos hito de conflictos sociales mineros</h1>
        <p>
          Selección de {publicCases.length} casos hito con {timelineCount} hitos, {claimCount} afirmaciones,
          {sourceIds.size} fuentes de investigación y corte documental máximo {formatDate(latestCutoff)}.
          La lectura parte exclusivamente del corte de conflictos sociales mineros y prioriza procesos que movieron agua, territorio,
          institucionalidad, acuerdos y control estatal.
        </p>
      </header>

      <section className="case-stats" aria-label="Universos de la selección pública">
        <article>
          <strong>{latestMiningSelection.totalRegistered}</strong>
          <span>Conflictos del corte nacional</span>
          <small>Universo del Reporte 268 de la Defensoría; no equivale al número de fichas desarrolladas.</small>
        </article>
        <article>
          <strong>{publicCases.length}</strong>
          <span>Casos hito desarrollados</span>
          <small>Selección editorial dentro del corte nacional de conflictos sociales mineros.</small>
        </article>
        <article>
          <strong>{timelineCount}</strong>
          <span>Hitos documentados</span>
          <small>Cronología reunida exclusivamente en los {publicCases.length} casos desarrollados.</small>
        </article>
        <article>
          <strong>{sourceIds.size}</strong>
          <span>Fuentes de investigación</span>
          <small>Universo documental vinculado a esos {publicCases.length} casos, según nivel de evidencia.</small>
        </article>
      </section>

      <div className="catalog-note">
        <strong>Hechos, fuentes y posiciones atribuidas se leen por separado.</strong>
        <span>Cada caso presenta estado al corte, fuentes y preguntas de contraste; no convierte un conflicto abierto en una responsabilidad demostrada.</span>
      </div>

      <section className="transversal-readings" aria-labelledby="transversal-readings-heading">
        <div className="section-heading">
          <p className="eyebrow">Problemas transversales</p>
          <h2 id="transversal-readings-heading">Tres ventanas para leer los casos hito como sistema, no como tarjetas sueltas.</h2>
          <p>
            La primera ordena Cajamarca sin fusionar conflictos distintos. La segunda compara mecanismos
            institucionales. La tercera contrasta compromisos, seguimiento y evidencia de ejecución.
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
                <strong>Límite probatorio</strong>
                <p>{reading.guardrail}</p>
              </div>
              <div className="transversal-next">
                <strong>Qué se compara</strong>
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
          <p className="eyebrow">Casos hito en contexto</p>
          <h2 id="landmark-cases-heading">Siete conflictos que muestran problemas territoriales e institucionales distintos.</h2>
          <p>
            Cada caso explica el problema de fondo, identifica los documentos que permiten contrastarlo y declara
            qué conclusiones no pueden sostenerse todavía con la evidencia disponible.
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
                  <dt>Qué conviene contrastar</dt>
                  <dd>{item.next}</dd>
                </div>
                <div>
                  <dt>Límite probatorio</dt>
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
        cases={publicCases}
        issues={data.issues}
        territories={data.territories}
        researchPackets={publicResearchPackets}
        sources={data.sources}
        evidenceRecords={data.evidenceRecords}
      />
    </div>
  );
}
