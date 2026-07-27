# Metodología de datos y trazabilidad

> Última revisión documental: 27 de julio de 2026. Documento metodológico de un observatorio académico e informativo, abierto a correcciones trazables. Esta fecha registra la revisión del texto y sus reglas; no sustituye la consulta directa de fuentes oficiales.

## Propósito

El observatorio organiza evidencia pública para estudiar conflictos mineros del Perú. No sustituye una investigación de campo, una pericia técnica, una decisión administrativa o una sentencia, y no constituye asesoría jurídica, médica, ambiental o técnica. Su función es hacer explícitas las relaciones entre casos, territorios, actores, normas, controversias, hechos y alternativas de política pública.

La fecha de corte de cada expediente indica hasta cuándo se revisó su contenido. Un expediente puede conservar fuentes anteriores y posteriores a sus hitos, pero no debe presentar como actual una conclusión que no haya sido comprobada a la fecha de corte.

## Unidad de análisis

- Un `ConflictCase` representa un conflicto o proceso territorial documentado, no una declaración sobre la responsabilidad de sus actores.
- Un `TimelineEvent` registra un hito con la máxima precisión temporal que permite la fuente.
- Un `Claim` contiene una sola afirmación clasificable como hecho, interpretación o propuesta.
- Un `CommitmentComparisonEntry` enlaza un compromiso con un expediente y un hito canónico; separa base documental, etapa de seguimiento, evidencia de ejecución y límite probatorio.
- Un `Source` describe un documento o conjunto documental identificable.
- Un `LegalInstrument` registra una norma y su historial documental; el observatorio la presenta como documento público trazable, no como texto oficial consolidado ni dictamen sobre aplicabilidad.
- Un `Territory` aporta un punto de referencia para navegación. No representa por sí solo el área de influencia, una concesión, una comunidad ni un límite administrativo.

## Precisión de fechas

Toda fuente y todo hito declaran `datePrecision`:

- `day`: la evidencia permite identificar día, mes y año.
- `month`: solo se conocen mes y año; se usa el primer día del mes como valor técnico.
- `year`: solo se conoce el año; se usa el 1 de enero como valor técnico.

Los valores técnicos permiten ordenar y validar datos, pero la interfaz debe comunicar la precisión real. No se debe interpretar una fecha normalizada como una fecha histórica exacta.

## Calidad y perspectiva de fuentes

`evidenceLevel` describe el papel documental de una fuente:

- `primary`: norma, registro, resolución, acuerdo, dato o documento producido directamente por una autoridad o actor involucrado.
- `secondary`: investigación académica, informe analítico o reconstrucción basada en otras evidencias.
- `contextual`: material útil para orientación general, definición institucional o contexto.

El campo `perspective` ayuda a detectar concentración de voces. La diversidad de perspectivas no equivale a dar el mismo peso a toda afirmación: la pertinencia, el método y la evidencia siguen siendo indispensables.

El estado de una fuente indica si se comprobó su identidad, enlace y metadatos básicos. No certifica que todas las afirmaciones asociadas sean verdaderas.

## Verificación de afirmaciones

Cada afirmación tiene un estado independiente:

- `verified`: la evidencia citada respalda directamente la formulación y se registra `verifiedAt`.
- `partial`: existe evidencia relacionada, pero la formulación requiere mayor triangulación, precisión o revisión.
- `pending`: todavía no existe evidencia suficiente para publicar la afirmación como parte del expediente.

La compilación rechaza afirmaciones sin fuentes. La auditoría editorial exige, además, fuentes directas por caso y al menos una perspectiva no estatal. Estas son condiciones mínimas, no una garantía de exhaustividad.

## Registro de evidencia y paquetes de investigación

Una cita general no basta para cerrar un hecho. Cada `EvidenceRecord` enlaza una fuente con un hito, afirmación, norma, estado o posición de actor; conserva un locador verificable, la relación `supports`, `qualifies` o `contradicts`, una síntesis analítica, fecha de comprobación y estado de revisión. Una contradicción registrada no se fuerza a desaparecer: se atribuye y permanece visible.

Los hitos se clasifican como `event`, `decision`, `agreement`, `evidence` o `publication`. Las publicaciones académicas aportan contexto y contraste, pero no cuentan por sí solas para el mínimo sustantivo de una cronología.

Cada paquete de caso registra tres o más perspectivas pertinentes, al menos una fuente directa de un actor involucrado, preguntas de alcance y límites explícitos. `ready` significa que la estructura documental está lista para lectura y que los límites quedaron declarados; no significa cierre del conflicto, consenso ni certificación profesional. Los paquetes normativos `prepared` identifican texto oficial, reglamentos, modificatorias y preguntas de alcance; tampoco determinan vigencia consolidada ni aplicabilidad a casos concretos.

`npm run research:scorecard` calcula cobertura directa, mínimos sustantivos, perspectivas, paquetes normativos, conflictos no registrados y fuentes con derechos desconocidos. El comando falla ante rupturas estructurales, falta de evidencia directa revisada, derechos desconocidos en uso, contradicciones sin contraste suficiente o vacíos marcados como bloqueantes. Los límites no bloqueantes permanecen descritos en paquetes y memos, pero no frenan la publicación académica `public-academic`.

## Comparación transversal de compromisos

La comparación parte únicamente de hitos ya incorporados en los trece expedientes trazados de conflictos sociales mineros. No incorpora compromisos generales de responsabilidad social, inversión empresarial o política pública que no estén conectados con esos expedientes.

Cada entrada diferencia:

- `condition-documented`: existe una condición contractual o secuencia futura documentada;
- `agreement-documented`: existe un acuerdo, convenio, plan o registro público atribuible;
- `follow-up-documented`: existe actividad posterior de comité, acta, evaluación o seguimiento;
- `result-documented`: una fuente permite acreditar un resultado puntual, sin extenderlo a todo el compromiso.

La evidencia de ejecución se clasifica como `not-located`, `partial` o `documented`. `not-located` describe el contenido del expediente al corte y no equivale a incumplimiento. `partial` indica que existe evidencia posterior relacionada, pero no suficiente para afirmar ejecución integral por obligación. `documented` solo puede usarse cuando el resultado concreto está directamente respaldado y no autoriza inferencias sobre calidad, sostenibilidad, consenso o cierre del conflicto.

Los expedientes sin un compromiso comparable se declaran expresamente. Una decisión administrativa, un EIA, una protesta o una posición actoral no se recodifican como acuerdo para completar la matriz.

## Cartografía

Las coordenadas se almacenan con `coordinatePrecision` y una fuente cartográfica. En la V1 son puntos regionales o de localidad para ubicar casos y facilitar la navegación.

La capa pública usa exclusivamente los conflictos socioambientales que el último reporte mensual incorporado de la Defensoría del Pueblo vincula con minería. Los conteos se agregan por región y se representan mediante un punto de referencia regional; no son coordenadas de cada conflicto. El mapa muestra siempre el periodo del reporte y mantiene separados los casos hito trazados.

La vista cartográfica pública incorpora el corte de junio de 2026 del Reporte 268: 61 conflictos socioambientales relacionados con minería, 50 activos y 11 latentes, según los cuadros 15 y 17. La selección revisada conserva identificadores estables y reconcilia con esos totales publicados. El registro social general no forma parte de la publicación.

El mapa no muestra, salvo indicación expresa y fuente específica:

- polígonos de concesiones;
- áreas de influencia ambiental;
- límites comunales;
- derechos superficiales;
- zonas afectadas o causalidad territorial.

La intensidad de la capa de calor expresa cantidad de casos registrados, activos o latentes según el filtro elegido. No expresa gravedad, violencia, impacto ambiental, extensión territorial ni riesgo. Los casos nacionales y multirregionales se informan, pero no se asignan artificialmente a una región.

La escala cromática divide el máximo del filtro seleccionado en tres rangos numéricos visibles: celeste para menor cantidad, ámbar para cantidad intermedia y rojo para mayor cantidad. El sombreado y los puntos regionales comparten la misma clasificación para que el color pueda leerse contra la leyenda.

Las capas “Minería ilegal” y “Minería informal” son independientes: no delimitan operaciones ni atribuyen una condición jurídica a un territorio. Cada una selecciona únicamente los casos del mismo corte de la Defensoría que contienen la mención textual explícita correspondiente, y cada punto abre las fichas que sustentan su conteo.

Un caso que menciona ambas categorías aparece en ambas capas. Ese solapamiento conserva el lenguaje de la fuente y no implica que minería ilegal y minería informal sean equivalentes; la interfaz las distingue también mediante color, relleno y trazo.

La capa REINFO usa un corte agregado de inscripciones marcadas como vigentes en la consulta oficial del MINEM. Los conteos se agrupan por departamento y se colocan en puntos regionales de referencia, sin reproducir datos personales ni coordenadas declaradas. La inscripción vigente no equivale a formalidad concluida y el registro es dinámico, por lo que la interfaz muestra fecha de consulta y enlace a la fuente.

La capa “Plantas de beneficio vigentes” usa como indicador parcial de infraestructura minera formal el listado oficial de plantas de beneficio vigentes del MINEM. Representa infraestructura de procesamiento registrada por MINEM; no representa todas las operaciones mineras formales, no equivale a unidades mineras en producción y no representa concesiones, proyectos ni titulares. El corte del 18 de junio de 2026 deduplica las filas de la exportación por código de planta: conserva 342 códigos únicos, territorializa 340 con departamento informado y excluye del mapa dos sin departamento. El portal no publica fecha propia de actualización, por lo que la interfaz identifica expresamente la fecha como fecha de consulta.

Los conteos actuales de esta capa se agregan por departamento y se colocan en los mismos puntos regionales de referencia. Esos puntos territoriales actuales son referencias regionales, no coordenadas exactas de cada planta. Los anillos verdes permiten compararla con REINFO, las capas independientes de minería ilegal y minería informal, y los conflictos sociales sin sugerir que las capas comparten una ubicación exacta o una relación causal.

La capa “Exploración minera” usa el listado oficial de inicios de actividades de exploración en actividad del MINEM. El corte de consulta del 18 de junio de 2026 deduplica 294 filas por código de expediente y conserva 293 expedientes únicos, con 101.775,4 hectáreas informadas por la fuente. El portal no publica una fecha propia de actualización. La capa muestra conteos y extensiones registrales agregados por departamento; explorar no equivale a explotar, producir ni contar con todas las autorizaciones necesarias para una operación minera.

La capa “Concesiones mineras” consulta el servicio oficial `SERV_CATASTRO_MINERO_WGS84` de INGEMMET y selecciona únicamente los derechos clasificados como `TITULADO`. El servicio declara actualización diaria y carácter referencial. En la consulta del 18 de junio de 2026 se identificaron 41.954 códigos únicos: 41.936 con al menos un departamento y 18 de ámbito marítimo sin punto regional. Como un derecho puede abarcar más de un departamento, el mapa presenta 43.484 presencias departamentales; ese subtotal no debe interpretarse como derechos únicos.

Una concesión minera no acredita actividad sobre el terreno, propiedad del suelo superficial, aprobación ambiental, autorización de exploración, inicio de explotación ni responsabilidad por un conflicto. Los anillos departamentales no sustituyen los polígonos catastrales de GEOCATMIN y solo permiten una comparación nacional de concentración registral.

### Registro navegable minero del Reporte 268

El corte de junio de 2026 incorpora únicamente los 61 conflictos sociales mineros vinculados a los puntos regionales: 50 activos y 11 latentes. Cada entrada conserva estado, tipo, ámbito, página fuente y, cuando el reporte lo informa, periodo de inicio y ubicación. No se publican los demás conflictos sociales del reporte.

El reporte presenta fichas con hechos del mes y tablas de conflictos activos o latentes. El proceso extrae el universo del documento solo como insumo temporal, aplica una selección revisada de los casos mineros y escribe en los datos canónicos exclusivamente esos 61 casos. Las entradas conservan el texto descriptivo y distinguen si el título procede de la denominación del reporte o de una síntesis editorial identificada.

La reconstrucción detectó una duplicación visible en la página 92: “CC Mariscal Castilla - Minera Chaska II” aparece dos veces. El registro conserva una sola ocurrencia. Con esa regla y la revisión explícita de pertenencia minera, el corte publicado reconcilia en 61 casos, 50 activos y 11 latentes.

El corte social general del Reporte 266 se conserva únicamente como archivo interno de trazabilidad histórica; no alimenta vistas, métricas ni mensajes públicos.

La ausencia de un elemento en el mapa no implica su inexistencia. Tampoco debe inferirse extensión, proximidad jurídica ni responsabilidad a partir de un punto de referencia.

## Instrumentos normativos

Una ficha normativa puede registrar número, autoridad, relaciones, modificaciones y última comprobación documental. El observatorio puede mostrar que una norma existe, enlazar su texto primario y señalar su alcance documental; no emite dictámenes sobre vigencia consolidada, jerarquía, interpretación ni aplicabilidad.

El control automático detecta relaciones rotas y datos incompletos, pero no determina vigencia, jerarquía, interpretación ni aplicabilidad.

El estado `source-reviewed` indica que se comprobó la fuente oficial, su locador y los metadatos documentales mínimos. No certifica vigencia consolidada, interpretación profesional o aplicabilidad a un caso concreto.

## Controles de calidad

`npm run validate:content` comprueba el contrato de datos y las relaciones. `npm run audit:content` aplica reglas editoriales adicionales y reporta advertencias que requieren revisión humana.

La integración continua ejecuta:

1. validación del modelo y auditoría editorial;
2. TypeScript y lint;
3. pruebas automatizadas;
4. control interno de enlaces;
5. compilación estática.

## Flujo de actualización

1. Incorporar o corregir fuentes con metadatos, perspectiva, licencia, derechos y nivel de evidencia.
2. Formular afirmaciones atómicas y vincular la evidencia pertinente.
3. Registrar precisión temporal, fecha de corte y limitaciones.
4. Ejecutar validación y auditoría.
5. Incorporar, cuando aporte valor, comentarios académicos, editoriales, técnicos o comunitarios como contribuciones trazables, no como condición profesional de publicación.
6. Integrar el cambio mediante pull request, conservando la historia de revisión en Git.

Las correcciones deben preservar el registro del cambio. Git conserva metadatos, locadores y síntesis; las copias autorizadas se mantienen en un archivo privado con inventario y checksum. No se publica ni se archiva en Git un documento externo sin derechos claros.
