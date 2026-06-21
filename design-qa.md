# Design QA — cierre V1

- Fuente visual: `docs/design/reference-system-relations.png`
- Capturas actuales: `docs/audits/2026-06-20-v1-freeze/`
- Viewports revisados: 1440 × 1024, 1280 × 720 y 390 × 844
- Fecha: 20 de junio de 2026
- Resultado visual y funcional: aprobado para freeze privado
- Resultado de publicación: bloqueado

## Hallazgos vigentes

- [P0] GitHub Pages continúa respondiendo HTTP 200. La publicación automática quedó eliminada del workflow, pero la despublicación requiere un ajuste externo de Pages que no está disponible desde este entorno.
- [P1] Permanecen pendientes las revisiones jurídicas atribuidas de 6 expedientes y 8 instrumentos.
- [P1] Permanecen pendientes los cinco signoffs del manifiesto V1.

No quedan hallazgos P0/P1 abiertos en accesibilidad del diálogo, nombres de marcadores, navegación responsive, overflow horizontal o estructura de capas.

## Comparación con “Sistema de Relaciones”

La implementación conserva la anatomía de la referencia: encabezado tinta, búsqueda y filtros, índice lateral, grafo central, inspector de evidencia y cronología inferior. La densidad se redujo de forma coherente con el universo real de la V1, sin alterar la jerarquía académica ni el lenguaje visual cobre, papel y tinta.

## QA aplicado

- Navegación completa visible a 1280 px.
- Menú móvil funcional y sin overflow horizontal a 390 px.
- Mapa por defecto en 64 conflictos mineros y cambio explícito a 190 sociales.
- Diálogo regional modal con foco inicial, Escape y retorno al control de apertura.
- Seis marcadores con nombre accesible único.
- Panel territorial móvil sin scroll interno.
- Capas principales abiertas y comparaciones secundarias colapsadas con contador de activas.
- Expedientes estándar con al menos cinco hitos sustantivos y expedientes profundizados con al menos ocho; las publicaciones se muestran, pero no cuentan para el mínimo.
- Normativa con estado, fecha de contraste y atribución real o ausencia de atribución explícita.
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

Final result: private freeze passed; public release blocked.

## Actualización documental del 20 de junio de 2026

Las capturas fueron regeneradas después de incorporar 69 fuentes, seis paquetes de caso, ocho fichas normativas y cronologías ampliadas. Product Design se aplicó como control de legibilidad contra la referencia vigente, sin rediseño ni nuevas rutas. La ampliación no introdujo overflow horizontal ni cambió la identidad visual; la publicación continúa bloqueada por evidencia directa incompleta, revisión jurídica y signoffs.
