# Revisión de repo y producto — 20 de junio de 2026

## Alcance

Revisión combinada de experiencia, accesibilidad observable, trazabilidad editorial y salud técnica del prototipo local. El recorrido principal evaluado fue: entender la propuesta, explorar relaciones, comparar el mapa minero con el registro social completo, abrir el sustento regional y consultar un expediente piloto.

## Resultado ejecutivo

El producto ya tiene identidad y tesis propias. La dirección “Sistema de Relaciones” se conserva de forma reconocible y el mapa evolucionó de una colección de seis marcadores a una superficie de investigación trazable. El repo compila y supera todas sus validaciones locales.

El bloqueo principal no es técnico: el sitio de GitHub Pages está públicamente accesible mientras el propio producto se declara privado/en construcción y las ocho normas siguen con revisión jurídica pendiente. Antes de ampliar el alcance, corresponde resolver esa exposición y cerrar los riesgos de accesibilidad del mapa.

## Recorrido capturado

1. **Inicio — saludable con una fricción responsive.** La propuesta de valor es clara, sobria y consistente con la voz académica. A 1280 px la navegación horizontal pierde el final de “Metodología” sin indicar que puede desplazarse. Evidencia: `01-inicio.png`.
2. **Sistema de relaciones — saludable y fiel a la referencia.** Conserva búsqueda, filtros, índice, grafo, inspector y cronología. La carga visual se estabilizó después de la hidratación; el grafo ofrece controles de ajuste. El índice lateral funciona como alternativa accesible a la interacción visual del grafo. Evidencia: `02b-sistema-relaciones-carga-inicial.png` y `02-sistema-relaciones.png`.
3. **Mapa minero inicial — saludable.** Abre en 64 conflictos socioambientales vinculados a minería, muestra corte, activos/latentes, escala numérica y seis expedientes piloto separados. Evidencia: `03-mapa-minero.png`.
4. **Comparación social completa — saludable.** El cambio explícito a 190 conflictos actualiza conteos, leyenda, concentraciones y texto de alcance sin mezclar ambos universos. Evidencia: `04-mapa-contexto-social.png`.
5. **Registro regional de Puno — funcional, con riesgo de accesibilidad.** El panel abre los 21 casos, mantiene fuente y página, y permite buscar y filtrar. El foco permanece en el botón del mapa; no se mueve al panel, no se contiene allí y no hay cierre por Escape visible en la implementación. Evidencia: `05-registro-regional-puno.png`.
6. **Expediente Tambogrande — saludable pero editorialmente inmaduro.** La jerarquía, preguntas y trazabilidad funcionan bien; el propio contenido declara revisión jurídica pendiente y solo contiene dos hitos cronológicos. Evidencia: `06-expediente-tambogrande.png`.
7. **Responsive móvil — verificación incompleta en esta corrida.** El control de viewport del navegador local no aplicó el tamaño solicitado; se revisaron los breakpoints del código, pero no se reclama validación visual móvil actual.

## Fortalezas

- Tesis de producto clara: relacionar hechos, interpretaciones y propuestas, no solo publicar fichas.
- Lenguaje visual consistente: tinta, papel cálido, cobre, serif editorial y densidad de herramienta académica.
- Trazabilidad territorial excepcional para un V1: los puntos regionales abren su registro y cada ficha enlaza la página de la fuente.
- El mapa respeta las decisiones durables: minería por defecto; registro social como comparación; ilegal, informal, REINFO, formal, exploración y concesiones como capas separadas.
- El producto comunica sus límites con honestidad: corte documental, puntos de referencia, no causalidad, revisión jurídica y universo incompleto.

## Riesgos prioritarios

### P0 — Gobernanza y exposición

La URL documentada de GitHub Pages respondió públicamente con HTTP 200 el 20 de junio de 2026. Esto es incompatible con tratar la V1 como privada mientras metodología, licencias y núcleo jurídico siguen pendientes de revisión. El workflow publica cada push a `main` y `codex/observatorio-v1`.

### P1 — Accesibilidad del mapa

- Los seis marcadores Leaflet se anuncian como “Marker”, sin nombre del caso o territorio.
- El registro regional se implementa como `aside`, no como diálogo o región con gestión de foco.
- Al abrir el panel, el foco permanece en el botón regional del fondo; no hay trampa de foco ni cierre por Escape.
- Los puntos de calor no son una superficie accesible por sí mismos. Los botones de concentración y el selector regional mitigan el problema, pero esa equivalencia debe mantenerse explícita.

### P1 — Madurez editorial

La auditoría de contenido mantiene 14 advertencias: los seis expedientes tienen solo dos hitos y las ocho normas requieren revisión jurídica. El producto es demostrable, pero todavía no debe presentarse como archivo maduro ni base jurídica verificada.

### P2 — Responsive y densidad

- La navegación principal se desborda discretamente a 1280 px; no hay pista visual de desplazamiento horizontal.
- El mapa acumula ocho capas, métrica, leyenda, concentraciones, ámbitos, selector y expedientes en una columna de 360 px. La estructura es correcta, pero la exploración secundaria queda muy debajo del primer viewport.
- El breakpoint móvil convierte el layout en bloque, pero mantiene el panel lateral con `max-height` y scroll interno; requiere una comprobación real en 390 px para descartar doble scroll y pérdida de contexto.

### P2 — Cobertura automática

Existen 13 pruebas, concentradas en carga y consistencia de contenido. No hay pruebas de componentes, interacción del mapa, gestión de foco, navegación responsive ni una auditoría automática de accesibilidad. La lógica de detección textual de minería ilegal/informal tampoco tiene casos unitarios propios.

## Salud del repo

- Rama: `codex/observatorio-v1`, alineada con `origin/codex/observatorio-v1` antes de los cambios locales.
- Worktree: cambios locales sustantivos en mapa, datos y metodología; no está listo para freeze o commit accidental de alcance mixto.
- Dependencias: sin cambios en `package.json` ni `package-lock.json`.
- TypeScript: correcto.
- ESLint: correcto.
- Vitest: 13/13 pruebas correctas.
- Validación de contenido: 6 expedientes, 190 casos sociales, 64 mineros, 8 normas, 24 fuentes.
- Auditoría editorial: controles obligatorios superados; 14 advertencias abiertas.
- Enlaces internos: 14 rutas válidas.
- Build de producción: correcto; 17 páginas estáticas generadas.
- Consola del navegador durante el recorrido: sin errores ni advertencias.

## Recomendación

1. Congelar o restringir GitHub Pages hasta resolver la revisión jurídica, metodología y licencias.
2. Hacer una pasada corta de accesibilidad del mapa: nombres de marcadores, rol/etiqueta del panel, foco inicial, Escape y retorno de foco.
3. Separar el cambio territorial actual en una etapa revisable y añadir pruebas unitarias para selección minera y categorías ilegal/informal.
4. Revalidar 1280 px y 390 px antes del siguiente freeze visual.

## Límites de evidencia

Las conclusiones de accesibilidad se basan en estructura DOM, foco observado, capturas y lectura del código; no equivalen a conformidad WCAG completa. No se probó lector de pantalla. La verificación móvil visual quedó bloqueada por el control de viewport de esta sesión.
