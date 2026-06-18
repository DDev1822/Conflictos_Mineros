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

El mapa no muestra, salvo indicación expresa y fuente específica:

- polígonos de concesiones;
- áreas de influencia ambiental;
- límites comunales;
- derechos superficiales;
- zonas afectadas o causalidad territorial.

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
