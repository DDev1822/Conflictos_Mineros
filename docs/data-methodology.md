# Metodología de datos y trazabilidad

## Propósito

El observatorio organiza evidencia para estudiar conflictos mineros del Perú. No sustituye una investigación de campo, una pericia técnica ni una opinión jurídica. Su función es hacer explícitas las relaciones entre casos, territorios, actores, normas, controversias, hechos y alternativas de política pública.

La fecha de corte de cada expediente indica hasta cuándo se revisó su contenido. Un expediente puede conservar fuentes anteriores y posteriores a sus hitos, pero no debe presentar como actual una conclusión que no haya sido comprobada a la fecha de corte.

## Unidad de análisis

- Un `ConflictCase` representa un conflicto o proceso territorial documentado, no una declaración sobre la responsabilidad de sus actores.
- Un `TimelineEvent` registra un hito con la máxima precisión temporal que permite la fuente.
- Un `Claim` contiene una sola afirmación clasificable como hecho, interpretación o propuesta.
- Un `Source` describe un documento o conjunto documental identificable.
- Un `LegalInstrument` registra una norma y su historial documental; su vigencia jurídica requiere revisión especializada fechada.
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

## Cartografía

Las coordenadas se almacenan con `coordinatePrecision` y una fuente cartográfica. En la V1 son puntos regionales o de localidad para ubicar casos y facilitar la navegación.

La capa nacional de conflictividad social usa el último reporte mensual de la Defensoría del Pueblo incorporado y revisado en Git. Los conteos se agregan por región y se representan mediante un punto de referencia regional; no son coordenadas de cada conflicto. El mapa debe mostrar siempre el periodo del reporte y separar esta capa general de los expedientes mineros piloto.

El mapa no muestra, salvo indicación expresa y fuente específica:

- polígonos de concesiones;
- áreas de influencia ambiental;
- límites comunales;
- derechos superficiales;
- zonas afectadas o causalidad territorial.

La intensidad de la capa de calor expresa cantidad de casos registrados, activos o latentes según el filtro elegido. No expresa gravedad, violencia, impacto ambiental, extensión territorial ni riesgo. Los casos nacionales y multirregionales se informan, pero no se asignan artificialmente a una región.

La escala cromática divide el máximo del filtro seleccionado en tres rangos numéricos visibles: celeste para menor cantidad, ámbar para cantidad intermedia y rojo para mayor cantidad. El sombreado y los puntos regionales comparten la misma clasificación para que el color pueda leerse contra la leyenda.

La capa “Minería ilegal e informal” no delimita operaciones ni atribuye una condición jurídica a un territorio. Selecciona únicamente casos del mismo corte de la Defensoría que contienen una mención textual explícita a minería ilegal o informal; cada punto abre las fichas que sustentan el conteo.

La capa REINFO usa un corte agregado de inscripciones marcadas como vigentes en la consulta oficial del MINEM. Los conteos se agrupan por departamento y se colocan en puntos regionales de referencia, sin reproducir datos personales ni coordenadas declaradas. La inscripción vigente no equivale a formalidad concluida y el registro es dinámico, por lo que la interfaz muestra fecha de consulta y enlace a la fuente.

La capa “Minería formal” usa como indicador parcial el listado oficial de plantas de beneficio vigentes del MINEM. No representa concesiones, proyectos en cartera ni el universo completo de operaciones mineras formales. El corte del 18 de junio de 2026 deduplica las filas de la exportación por código de planta: conserva 342 códigos únicos, territorializa 340 con departamento informado y excluye del mapa dos sin departamento. El portal no publica fecha propia de actualización, por lo que la interfaz identifica expresamente la fecha como fecha de consulta.

Los conteos de esta capa se agregan por departamento y se colocan en los mismos puntos regionales de referencia. Los anillos verdes permiten compararla con REINFO, menciones de minería ilegal o informal y conflictos sociales sin sugerir que las capas comparten una ubicación exacta o una relación causal.

La capa “Exploración minera” usa el listado oficial de inicios de actividades de exploración en actividad del MINEM. El corte de consulta del 18 de junio de 2026 deduplica 294 filas por código de expediente y conserva 293 expedientes únicos, con 101.775,4 hectáreas informadas por la fuente. El portal no publica una fecha propia de actualización. La capa muestra conteos y extensiones registrales agregados por departamento; explorar no equivale a explotar, producir ni contar con todas las autorizaciones necesarias para una operación minera.

La capa “Concesiones mineras” consulta el servicio oficial `SERV_CATASTRO_MINERO_WGS84` de INGEMMET y selecciona únicamente los derechos clasificados como `TITULADO`. El servicio declara actualización diaria y carácter referencial. En la consulta del 18 de junio de 2026 se identificaron 41.954 códigos únicos: 41.936 con al menos un departamento y 18 de ámbito marítimo sin punto regional. Como un derecho puede abarcar más de un departamento, el mapa presenta 43.484 presencias departamentales; ese subtotal no debe interpretarse como derechos únicos.

Una concesión minera no acredita actividad sobre el terreno, propiedad del suelo superficial, aprobación ambiental, autorización de exploración, inicio de explotación ni responsabilidad por un conflicto. Los anillos departamentales no sustituyen los polígonos catastrales de GEOCATMIN y solo permiten una comparación nacional de concentración registral.

### Registro navegable del reporte 266

El corte de abril de 2026 incorpora un registro de 190 casos vinculado a los puntos regionales: 159 activos y 31 latentes. Cada entrada conserva estado, tipo, ámbito, página fuente y, cuando el reporte lo informa, periodo de inicio y ubicación. Los puntos regionales abren estas listas; los dos casos nacionales y los nueve multirregionales se consultan desde accesos separados para no duplicarlos sobre el mapa.

El reporte presenta dos formatos. Las tablas de las páginas 72 a 75 incluyen una denominación breve; esas 129 entradas usan `titleMethod: report-denomination`. Las fichas activas de las páginas 37 a 71 no tienen un campo uniforme de denominación: sus 61 títulos son una síntesis editorial tomada de la primera oración del campo `Caso`, conservan la descripción extraída y se identifican como `titleMethod: editorial-summary`.

La reconstrucción detectó una inconsistencia interna: “Cinco cuencas - Lote 8 y 192” aparece en la tabla de activos sin hechos y también en las fichas con hechos del mes. Contarla dos veces produce 191 casos y 24 en Loreto, en contradicción con los totales oficiales de 190 y 23. El registro conserva la ficha detallada una sola vez y excluye la fila repetida. Con esa regla, los conteos por estado y por cada ámbito territorial reconcilian con el cuadro agregado.

El valor de inicio `10/20205` visible en una tabla se normaliza como `2020-10`, tratándolo como error tipográfico evidente. El mapa oficial enlazado por la Defensoría correspondía a enero de 2026 al momento de esta revisión; se usó solo como contraste auxiliar y no para atribuir estado actual. Los tipos agregados del reporte contienen otras discrepancias aritméticas internas, por lo que la interfaz permite filtrar la clasificación caso por caso, pero no presenta esos subtotales como una reconciliación oficial cerrada.

La ausencia de un elemento en el mapa no implica su inexistencia. Tampoco debe inferirse extensión, proximidad jurídica ni responsabilidad a partir de un punto de referencia.

## Instrumentos jurídicos

Una ficha normativa puede registrar número, autoridad, relaciones, modificaciones y última comprobación documental. Solo puede presentarse simultáneamente como vigente y verificada cuando exista una revisión jurídica especializada, fechada y explícita.

El control automático detecta relaciones rotas y datos incompletos, pero no determina vigencia, jerarquía, interpretación ni aplicabilidad jurídica.

## Controles de calidad

`npm run validate:content` comprueba el contrato de datos y las relaciones. `npm run audit:content` aplica reglas editoriales adicionales y reporta advertencias que requieren revisión humana.

La integración continua ejecuta:

1. validación del modelo y auditoría editorial;
2. TypeScript y lint;
3. pruebas automatizadas;
4. control interno de enlaces;
5. compilación estática.

## Flujo de actualización

1. Incorporar o corregir fuentes con metadatos, perspectiva, licencia y nivel de evidencia.
2. Formular afirmaciones atómicas y vincular la evidencia pertinente.
3. Registrar precisión temporal, fecha de corte y limitaciones.
4. Ejecutar validación y auditoría.
5. Solicitar revisión académica, editorial o jurídica según corresponda.
6. Integrar el cambio mediante pull request, conservando la historia de revisión en Git.

Las correcciones deben preservar el registro del cambio. No se archivan documentos externos sin autorización de su licencia.
