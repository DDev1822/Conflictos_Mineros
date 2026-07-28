# Design QA — cierre V1

- Fuente visual: `docs/design/reference-system-relations.png`
- Capturas actuales: `docs/audits/2026-06-20-v1-freeze/`
- Viewports revisados: 1440 × 1024, 1280 × 720 y 390 × 844
- Fecha base de capturas: 20 de junio de 2026
- Validación automatizada vigente: 27 de julio de 2026
- Resultado visual y funcional: controles automatizados superados para publicación `public-academic`
- Resultado de publicación: habilitado como observatorio académico e informativo, corregible y trazable

## Hallazgos vigentes

- [Alcance] El contenido no constituye asesoría jurídica, médica, ambiental o técnica.
- [Alcance] Los expedientes y normas conservan límites probatorios y preguntas de aplicación sin convertirlos en alertas de aprobación profesional.
- [Transparencia] Los límites de investigación permanecen visibles y abiertos a correcciones documentadas.

No quedan hallazgos P0/P1 abiertos en accesibilidad del diálogo, nombres de marcadores, navegación responsive, overflow horizontal o estructura de capas.

## Comparación con “Sistema de Relaciones”

La implementación conserva la anatomía de la referencia: encabezado tinta, búsqueda y filtros, índice lateral, grafo central, inspector de evidencia y cronología inferior. La densidad se redujo de forma coherente con el universo real de la V1, sin alterar la jerarquía académica ni el lenguaje visual cobre, papel y tinta.

## QA aplicado

- Navegación completa visible a 1280 px.
- Menú móvil funcional y sin overflow horizontal a 390 px.
- Mapa enfocado en los 61 conflictos sociales mineros del Reporte 268, sin acceso al registro social general.
- Sistema de relaciones inicia con dos problemas raíz y revela conexiones de forma progresiva por interacción.
- Diálogo regional modal con foco inicial, Escape y retorno al control de apertura.
- Seis marcadores con nombre accesible único.
- Panel territorial móvil sin scroll interno.
- Capas principales abiertas y comparaciones secundarias colapsadas con contador de activas.
- Expedientes estándar con al menos cinco hitos sustantivos y expedientes profundizados con al menos ocho; las publicaciones se muestran, pero no cuentan para el mínimo.
- Normativa con fuente oficial, fecha de comprobación y pregunta de aplicación, sin dictamen de vigencia consolidada.
- Densidad editorial revisada después de ampliar las cronologías y fuentes: la portada de expediente conserva jerarquía, lectura en dos columnas y ausencia de overflow; las fuentes adicionales quedan en el panel de trazabilidad.

## Diferencias no bloqueantes

- [P3] El pie institucional del sistema de relaciones queda después del primer viewport.
- [P3] Los actores aparecen como nodos conectados, sin el contenedor agrupador de la referencia.
- [P3] Los mosaicos cartográficos externos pueden cargar parcialmente en capturas headless; la capa de datos, puntos y controles se mantienen legibles.

## Evidencia

- `01-inicio-1440x1024.png`
- `02-relaciones-1440x1024.png`
- `03-mapa-1440x1024.png`
- `04-expediente-1440x1024.png`
- `05-normativa-1440x1024.png`
- `06-mapa-1280x720.png`
- `07-dialogo-puno-1280x720.png`
- `08-mapa-390x844.png`
- `09-menu-390x844.png`

Resultado: `public-academic` supera los controles técnicos y documentales automatizados.

## Actualización documental del 20 de junio de 2026

Las capturas fueron regeneradas después de incorporar 69 fuentes, seis paquetes de caso, ocho fichas normativas y cronologías ampliadas. Product Design se aplicó como control de legibilidad contra la referencia vigente, sin rediseño ni nuevas rutas. La ampliación no introdujo overflow horizontal ni cambió la identidad visual.

## Actualización de publicación del 27 de julio de 2026

El observatorio adopta el alcance `public-academic`: los bloqueos P0/P1 operativos permanecen resueltos y el gate académico pasa sin avisos de publicación. El disclaimer explicita el propósito informativo y excluye asesoría jurídica, médica, ambiental o técnica; los límites probatorios permanecen como información académica, no como requisitos de aprobación.

## Actualización de espaciado del 27 de julio de 2026

- Verdad visual recibida: `%TEMP%\codex-clipboard-03b36d5e-daea-4d66-88ed-7168408b09ad.png`.
- Implementación capturada: `%TEMP%\confmin-relationship-spacing-implementation.png`.
- Comparación conjunta: `%TEMP%\confmin-relationship-spacing-comparison.png`.
- Viewport: 1900 × 913 CSS px, densidad 1; lienzo comparado de 1175 × 725 px.
- Estado: 12 tarjetas visibles y foco en “Actores y actas”.
- Normalización: se retiraron 20 px de la captura de origen correspondientes a la barra de tareas del sistema operativo.

### Findings

- No quedan hallazgos P0, P1 o P2 en este ajuste.
- Separación mínima renderizada: 15,78 px.
- Cero tarjetas solapadas, fuera del lienzo o cubiertas por la nota metodológica.
- A 1280 px, la nota metodológica conserva 10,22 px de separación horizontal respecto de la fila comparativa.
- Colores, tipografía, contenido, jerarquía y relaciones conservados.
- No hay activos de imagen en el lienzo y no se detectaron errores de consola.

### Comparison history

1. El origen presentaba cruces visuales entre las filas centrales e inferiores.
2. La primera iteración introdujo una retícula vertical explícita, pero la nota metodológica rozaba la fila comparativa.
3. La iteración final desplazó la fila comparativa, limitó el zoom inicial expandido a 0,7 y redujo el ancho de la nota en escritorios de hasta 1280 px. La comparación completa fue suficiente; no se requirió una ampliación adicional porque las 12 tarjetas y sus separaciones son legibles.

final result: passed
