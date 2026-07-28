import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bank,
  BookOpenText,
  Coins,
  Database,
  FileText,
  MapTrifold,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";

export const metadata: Metadata = {
  title: "Oro sin trazabilidad",
  description:
    "Cadena de salida del oro ilegal e informal, trazabilidad comercial, controles estatales, REINFO y brechas entre producción declarada y exportación.",
};

const chainStages = [
  {
    stage: "01",
    title: "Extracción",
    body: "El primer tramo exige diferenciar extracción ilegal, actividad informal y actividad en proceso de formalización, porque cada categoría produce efectos jurídicos distintos.",
    control: "Gobiernos regionales, MINEM, Fiscalía/FEMA, PNP",
  },
  {
    stage: "02",
    title: "Acopio",
    body: "El riesgo documental aparece cuando el metal ingresa a intermediarios, plantas o compradores con origen declarado distinto del origen material.",
    control: "RECPO, declaraciones juradas, liquidaciones de compra",
  },
  {
    stage: "03",
    title: "Procesamiento",
    body: "Una vez fundido, mezclado o transformado en barras doré, la trazabilidad física se vuelve difícil sin seguimiento documental y financiero robusto.",
    control: "Plantas de beneficio, registros, fiscalización tributaria",
  },
  {
    stage: "04",
    title: "Exportación",
    body: "La salida formal se apoya en DAM, factura, documento de transporte, certificado de origen y declaraciones de no vinculación con minería ilegal.",
    control: "SUNAT/Aduanas, agentes de aduana, bancos",
  },
  {
    stage: "05",
    title: "Mercados",
    body: "El insumo de investigación advierte desplazamientos hacia destinos con distintos estándares de debida diligencia; esa hipótesis requiere verificación por fuente primaria.",
    control: "Compradores internacionales, refinerías, debida diligencia",
  },
];

const riskNodes = [
  {
    title: "Libre comercialización",
    text: "El material de investigación ubica el Art. 4 del TUO de la Ley General de Minería como nudo de análisis: compra a personas autorizadas, no reivindicación y deber de verificar origen.",
    status: "Normativa primaria en ficha documental",
  },
  {
    title: "REINFO como escudo documental",
    text: "El registro puede operar como protección documental cuando la formalización no avanza. La distinción clave es no confundir informalidad administrativa con ilegalidad penal.",
    status: "REINFO / MAPE como contraste documental",
  },
  {
    title: "Exportación y SFE",
    text: "El flujo documentado incorpora DAM, factura, transporte, RECPO y declaración jurada. El Saldo a Favor del Exportador aparece como riesgo tributario si la cadena previa fue simulada.",
    status: "Contraste SUNAT/tributario requerido",
  },
  {
    title: "Concentrados y ensayos",
    text: "La investigación cita a la OCDE sobre vulnerabilidades en concentrados: valor, ley mineral, ensayos y posible subdeclaración en comercio marítimo.",
    status: "Referencia OCDE necesaria antes de afirmar un caso peruano concreto",
  },
];

const metrics = [
  {
    value: "475,83-3.260,09 TM",
    label: "rango acumulado 2003-2023",
    source: "FCDS, según la referencia secundaria disponible",
    caveat: "Rango de estimación; no equivale a volumen probado caso por caso.",
  },
  {
    value: "104 TM",
    label: "exportación ilegal reportada para 2025",
    source: "IPE citado por el insumo",
    caveat: "Requiere fuente primaria verificable antes de operar como umbral probatorio.",
  },
  {
    value: "720 kg",
    label: "oro intervenido por SUNAT",
    source: "Nota oficial SUNAT, 2025",
    caveat: "Caso operativo específico; no permite inferir flujo nacional diario.",
  },
  {
    value: "78 %",
    label: "REINFO suspendido según insumo",
    source: "FCDS / HTML recibido",
    caveat: "Se contrasta con corte oficial REINFO antes de presentarlo como dato consolidado.",
  },
];

const gapSeries = [
  { year: "2003", exportedTm: 155, declaredTm: 148 },
  { year: "2008", exportedTm: 178, declaredTm: 156 },
  { year: "2011", exportedTm: 185, declaredTm: 132 },
  { year: "2013", exportedTm: 175, declaredTm: 31 },
  { year: "2015", exportedTm: 168, declaredTm: 24 },
  { year: "2018", exportedTm: 190, declaredTm: 25 },
  { year: "2021", exportedTm: 182, declaredTm: 28 },
  { year: "2023", exportedTm: 195, declaredTm: 26 },
] as const;

const gapChart = {
  width: 760,
  height: 330,
  left: 54,
  right: 132,
  top: 28,
  bottom: 54,
  max: 200,
};

const yTicks = [0, 50, 100, 150, 200] as const;

function gapX(index: number) {
  const innerWidth = gapChart.width - gapChart.left - gapChart.right;
  return gapChart.left + (innerWidth * index) / (gapSeries.length - 1);
}

function gapY(value: number) {
  const innerHeight = gapChart.height - gapChart.top - gapChart.bottom;
  return gapChart.height - gapChart.bottom - (innerHeight * value) / gapChart.max;
}

function linePoints(key: "exportedTm" | "declaredTm") {
  return gapSeries.map((point, index) => `${gapX(index)},${gapY(point[key])}`).join(" ");
}

const exportedLinePoints = linePoints("exportedTm");
const declaredLinePoints = linePoints("declaredTm");
const gapAreaPoints = [
  exportedLinePoints,
  [...gapSeries]
    .reverse()
    .map((point, index) => `${gapX(gapSeries.length - 1 - index)},${gapY(point.declaredTm)}`)
    .join(" "),
].join(" ");

type SourcePacket = {
  title: string;
  kind: string;
  locator: string;
  use: string;
  href?: string;
};

const sourcePackets: SourcePacket[] = [
  {
    title: "Control, Legislación y Minería Ilegal de Oro en el Perú",
    kind: "documento de análisis",
    locator: "pp. 1-15",
    use: "Marco inicial para cadena, normativa, exportación, REINFO, brechas y preguntas probatorias.",
  },
  {
    title: "Radiografía del oro ilegal: mercado de la impunidad",
    kind: "referencia visual y narrativa",
    locator: "secciones I-V",
    use: "Propuesta visual y narrativa fuerte; sus afirmaciones deben pasar por contraste documental.",
  },
  {
    title: "Radiografía del oro ilegal: cadena del oro en el Perú",
    kind: "referencia visual y narrativa",
    locator: "secciones I-V",
    use: "Base para explicar producción, transporte, acopio, exportación y mercados.",
  },
  {
    title: "SUNAT: intervención de 720 kilos de oro ilegal",
    kind: "fuente oficial",
    href: "https://www.gob.pe/institucion/sunat/noticias/1186113-sunat-intervino-720-kilos-de-oro-ilegal-valorizados-en-mas-de-174-millones-de-soles",
    locator: "nota institucional",
    use: "Ejemplo operativo con fuente estatal directa; no sustituye medición estructural.",
  },
  {
    title: "Estimaciones de minería ilegal 2025",
    kind: "sociedad civil / investigación",
    href: "https://fcds.org.pe/wp-content/uploads/2025/05/Estimaciones-mineria-ilegal-2025_final.pdf",
    locator: "rango y metodología",
    use: "Fuente base a verificar para rangos históricos y composición de estimaciones.",
  },
  {
    title: "Illicit flows of gold concentrates in the maritime space",
    kind: "organismo internacional",
    href: "https://www.oecd.org/en/publications/illicit-flows-of-gold-concentrates-in-the-maritime-space_2beb54ce-en/full-report.html",
    locator: "capítulos sobre concentrados",
    use: "Contraste sobre concentrados, comercio marítimo, ensayos y lavado comercial.",
  },
];

const scopeQuestions = [
  "¿Qué estándar documental permite distinguir informalidad administrativa de ilegalidad penal en cada tramo de la cadena?",
  "¿Qué documento basta para acreditar origen lícito del oro y qué documento solo prueba circulación comercial?",
  "¿Qué responsabilidad puede atribuirse a acopiadores, plantas o exportadores sin resolución, investigación directa o fuente primaria?",
  "¿Cómo deben tratarse las cifras estimadas cuando no provienen de registros estatales primarios?",
  "¿Qué afirmaciones sobre REINFO requieren fuente directa y fecha de corte antes de formularse sin matiz?",
];

export default function OroIlegalPage() {
  return (
    <div className="gold-page">
      <section className="gold-hero">
        <div>
          <p className="eyebrow">Oro ilegal · trazabilidad y mercado</p>
          <h1>Oro sin trazabilidad</h1>
          <p>
            El oro de origen no acreditado puede desplazarse desde extracción y acopio hacia procesamiento, exportación
            y mercados internacionales. El problema central es probar origen, no solo documentar circulación comercial.
          </p>
          <div className="gold-actions">
            <a href="#cadena" className="button primary">Ver cadena de salida <ArrowRight size={18} /></a>
            <a href="#evidencia" className="button secondary">Revisar fuentes</a>
          </div>
        </div>
        <aside aria-label="Estado de contraste">
          <WarningCircle size={30} />
          <strong>Estimaciones, intervención y registro no miden lo mismo</strong>
          <span>
            Producción declarada, exportación, oro intervenido y REINFO pertenecen a tramos distintos de la cadena; cruzarlos
            sin método puede inflar o borrar el problema.
          </span>
        </aside>
      </section>

      <section className="gold-guardrail" aria-label="Guardarraíl editorial">
        <article>
          <FileText size={25} />
          <div>
            <h2>El problema está en la cadena probatoria</h2>
            <p>
              Trazabilidad, control, formalización, acopio y exportación forman una cadena: si un tramo no acredita origen,
              el metal puede ingresar al mercado con apariencia documental.
            </p>
          </div>
        </article>
        <article>
          <BookOpenText size={25} />
          <div>
            <h2>La brecha estadística no equivale a condena</h2>
            <p>
              Una diferencia entre producción declarada y salida reportada abre preguntas sobre origen, acopio y exportación;
              no identifica por sí sola responsables penales ni volúmenes diarios de extracción ilegal.
            </p>
          </div>
        </article>
      </section>

      <section className="gold-visual-intro">
        <figure>
          <Image
            src="/multimedia/reinfo/trazabilidad-oro.webp"
            alt="Fragmentos de oro sobre malla húmeda como referencia visual de trazabilidad material."
            width="1600"
            height="900"
            sizes="(max-width: 900px) 100vw, 48vw"
          />
        </figure>
        <div>
          <p className="eyebrow">Problema probatorio</p>
          <h2>El metal puede circular como mercancía antes de que el origen quede probado.</h2>
          <p>
            La extracción, el acopio, el procesamiento, el despacho y la venta internacional producen documentos distintos.
            El riesgo aparece cuando esos documentos prueban circulación comercial, pero no origen lícito del metal.
          </p>
        </div>
      </section>

      <section id="cadena" className="gold-chain">
        <div className="section-heading">
          <p className="eyebrow">Cadena de salida</p>
          <h2>Del punto de extracción al expediente de exportación</h2>
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
          <p className="eyebrow">Nudos de control</p>
          <h2>La trazabilidad se debilita cuando origen, acopio y exportación usan estándares distintos.</h2>
        </div>
        <div className="gold-risk-grid">
          {riskNodes.map((node) => (
            <article key={node.title}>
              <h3>{node.title}</h3>
              <p>{node.text}</p>
              <span>{node.status}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="gold-metrics" aria-label="Cifras del oro en contraste">
        <div className="section-heading">
          <p className="eyebrow">Datos del oro</p>
          <h2>Exportación, intervención y REINFO muestran escalas distintas del problema.</h2>
        </div>
        <div className="gold-metric-grid">
          {metrics.map((metric) => (
            <article key={metric.label}>
              <strong>{metric.value}</strong>
              <span>{metric.label}</span>
              <p>{metric.source}</p>
              <small>{metric.caveat}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="gold-gap" aria-labelledby="oro-gap-heading">
        <div className="gold-gap-copy">
          <p className="eyebrow">Brecha de trazabilidad</p>
          <h2 id="oro-gap-heading">La salida reportada se separa de la producción declarada.</h2>
          <p>
            La serie de trabajo recibida compara toneladas exportadas con toneladas declaradas como producidas. La separación
            sostenida desde 2013 obliga a mirar origen productivo, documentos de compra, DAM, RECPO y metodología de estimación.
          </p>
          <ul>
            <li>Uso probatorio: identificar dónde pedir explicación, fuente primaria y trazabilidad de origen.</li>
            <li>Límite: la serie se mantiene como señal de contraste frente a MINEM, SUNAT/Aduanas y metodología FCDS.</li>
          </ul>
        </div>
        <figure className="gold-gap-card">
          <figcaption>
            <strong>Exportación total vs. producción declarada</strong>
            <span>Toneladas métricas · serie tomada de una fuente secundaria · contraste primario requerido</span>
          </figcaption>
          <svg
            className="gold-gap-chart"
            viewBox={`0 0 ${gapChart.width} ${gapChart.height}`}
            role="img"
            aria-label="Gráfico comparativo de exportación total y producción declarada de oro entre 2003 y 2023. La serie registra una separación amplia desde 2013."
          >
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  className="gold-gap-grid"
                  x1={gapChart.left}
                  x2={gapChart.width - gapChart.right}
                  y1={gapY(tick)}
                  y2={gapY(tick)}
                />
                <text className="gold-gap-tick" x={gapChart.left - 12} y={gapY(tick)} textAnchor="end" dominantBaseline="middle">
                  {tick}
                </text>
              </g>
            ))}
            <line
              className="gold-gap-axis"
              x1={gapChart.left}
              x2={gapChart.width - gapChart.right}
              y1={gapY(0)}
              y2={gapY(0)}
            />
            <polygon className="gold-gap-area" points={gapAreaPoints} />
            <polyline className="gold-gap-line-exported" points={exportedLinePoints} />
            <polyline className="gold-gap-line-declared" points={declaredLinePoints} />
            {gapSeries.map((point, index) => (
              <g key={point.year}>
                <circle className="gold-gap-dot-exported" cx={gapX(index)} cy={gapY(point.exportedTm)} r="4.5" />
                <circle className="gold-gap-dot-declared" cx={gapX(index)} cy={gapY(point.declaredTm)} r="4" />
                <text className="gold-gap-year" x={gapX(index)} y={gapChart.height - 20} textAnchor="middle">
                  {point.year}
                </text>
              </g>
            ))}
            <text className="gold-gap-label gold-gap-label-exported" x={gapX(gapSeries.length - 1) + 12} y={gapY(195) - 7}>
              Exportación
            </text>
            <text className="gold-gap-label gold-gap-label-declared" x={gapX(gapSeries.length - 1) + 12} y={gapY(26) + 5}>
              Declarada
            </text>
          </svg>
          <div className="gold-gap-legend" aria-hidden="true">
            <span><i className="exported" /> Salida / exportación total</span>
            <span><i className="declared" /> Producción declarada</span>
            <span><i className="gap" /> Brecha a documentar</span>
          </div>
          <p className="gold-gap-note">
            Criterio probatorio: la brecha no prueba por sí sola origen ilegal; sí justifica abrir trazabilidad, documentos de
            compra, DAM, RECPO, origen productivo y metodología de estimación.
          </p>
        </figure>
      </section>

      <section className="gold-map-strip">
        <Image
          src="/multimedia/maps/oro-ilegal-territorio.webp"
          alt="Paisaje territorial intervenido con agua y operación minera como referencia visual de riesgo territorial."
          width="1600"
          height="900"
          sizes="100vw"
        />
        <div>
          <MapTrifold size={28} />
          <p className="eyebrow">Territorio no equivale a imputación</p>
          <h2>Madre de Dios concentra presión sobre bosque, ríos, formalización y mercado aurífero.</h2>
          <p>
            Los datos regionales ubican presión territorial, no puntos exactos de extracción o acopio. La diferencia
            entre agregado regional, operativo estatal y expediente individual sigue siendo central.
          </p>
          <Link href="/madre-de-dios">Abrir análisis de Madre de Dios <ArrowRight size={16} /></Link>
        </div>
      </section>

      <section id="evidencia" className="gold-evidence">
        <div>
          <p className="eyebrow">Fuentes y contraste</p>
          <h2>La cadena exige cruzar estimaciones, intervención estatal, comercio exterior y normativa minera.</h2>
          <p>
            FCDS, SUNAT, OCDE, normativa minera, reportes periodísticos y registros administrativos observan tramos distintos.
            El cruce útil es el que diferencia origen material, circulación comercial y control estatal.
          </p>
        </div>
        <div className="gold-source-list">
          {sourcePackets.map((source) => (
            source.href ? (
              <a
                key={source.title}
                href={source.href}
                target={source.href.startsWith("http") ? "_blank" : undefined}
                rel={source.href.startsWith("http") ? "noreferrer" : undefined}
              >
                <FileText size={22} />
                <strong>{source.title}</strong>
                <span>{source.kind} · {source.locator}</span>
                <small>{source.use}</small>
              </a>
            ) : (
              <article key={source.title} className="gold-source-card">
                <FileText size={22} />
                <strong>{source.title}</strong>
                <span>{source.kind} · {source.locator}</span>
                <small>{source.use}</small>
              </article>
            )
          ))}
        </div>
      </section>

      <section className="gold-legal-questions">
        <div>
          <BookOpenText size={30} />
          <p className="eyebrow">Preguntas probatorias</p>
          <h2>El punto crítico es probar origen, no solo circulación comercial.</h2>
        </div>
        <ol>
          {scopeQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ol>
      </section>

      <section className="gold-next">
        <article>
          <Coins size={30} />
          <h2>REINFO / MAPE</h2>
          <p>La formalización, la suspensión registral, la informalidad administrativa y la ilegalidad penal producen efectos distintos sobre el origen declarado del oro.</p>
          <Link href="/reinfo">Ir a REINFO / MAPE <ArrowRight size={16} /></Link>
        </article>
        <article>
          <Database size={30} />
          <h2>Relaciones territoriales y normativas</h2>
          <p>Oro ilegal e informalidad minera forman un problema raíz distinto del conflicto social minero, pero se cruzan por territorio, control estatal y reglas de formalización.</p>
          <Link href="/explorar">Abrir relaciones <ArrowRight size={16} /></Link>
        </article>
        <article>
          <Bank size={30} />
          <h2>Fuentes críticas de contraste</h2>
          <p>FCDS, SUNAT, OCDE, Ojo Público, Convoca y normativa oficial permiten contrastar estimación, operativo, comercio marítimo y régimen minero.</p>
          <Link href="/normativa">Ver normativa <ArrowRight size={16} /></Link>
        </article>
      </section>
    </div>
  );
}
