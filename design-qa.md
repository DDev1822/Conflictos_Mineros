# Design QA — Sistema de Relaciones

- Source visual truth: `docs/design/reference-system-relations.png`
- Implementation screenshot: `docs/design/implementation-explorer-final.png`
- Viewport: 1440 × 1024
- State: `/explorar`, filtros por defecto, relación central REINFO / MAPE
- Full-view comparison: `docs/design/comparison-full.png`
- Focused comparison: `docs/design/comparison-focus.png` (grafo, actores, inspector y cronología)

## Findings

No quedan hallazgos accionables P0, P1 o P2.

- [P3] El pie institucional queda después del primer viewport
  - Location: cierre de `/explorar`.
  - Evidence: la referencia incluye un pie delgado dentro del encuadre; la implementación dedica ese espacio a una cronología más legible.
  - Impact: no afecta exploración, trazabilidad ni navegación.
  - Follow-up: reducir 30–40 px del área central si en una iteración futura se prioriza fidelidad estricta sobre legibilidad.

- [P3] Agrupación visual de actores simplificada
  - Location: zona inferior del grafo.
  - Evidence: la referencia encierra Estado, comunidad, empresa y academia en un contenedor; la implementación los presenta como cuatro nodos conectados directamente.
  - Impact: conserva el significado y mejora la interacción individual, aunque difiere levemente del marco visual original.
  - Follow-up: añadir agrupación visual solo si se incorpora interacción por conjuntos de actores.

## Required fidelity surfaces

- Fonts and typography: Source Serif 4 y Source Sans 3 reproducen la jerarquía editorial; tamaños, pesos y wrapping son legibles en desktop y móvil.
- Spacing and layout rhythm: se preservan encabezado oscuro, franja de búsqueda, filtros, índice lateral, grafo central, inspector y cronología; sin solapamientos ni desbordamiento horizontal a 390 px.
- Colors and tokens: fondo tinta, papel cálido, cobre, verde y dorado corresponden al lenguaje de la referencia; no se usan gradientes ni sombras decorativas.
- Image and asset fidelity: la referencia no exige fotografía; todos los iconos provienen de Phosphor Icons y las relaciones se renderizan con React Flow. No existen placeholders, SVG artesanales ni CSS art sustitutivo.
- Copy and content: el texto es específico del observatorio, distingue hechos, interpretaciones y propuestas, y muestra fecha de corte y revisión pendiente.
- Interaction and accessibility: búsqueda, filtros, reinicio, diálogo de cita, navegación a expediente, mapa, menú móvil y controles del grafo fueron comprobados; idioma, nombres accesibles y estructura de encabezados son válidos.

## Patches made during QA

- Priorizado REINFO / MAPE y sus entidades relacionadas en el índice lateral.
- Añadidos Estado, comunidades, empresa y academia al grafo.
- Ajustada la altura del área central para mantener visible la cronología.
- Corregida la carga client-only del mapa Leaflet.
- Eliminado el desbordamiento horizontal móvil y validado el menú responsive.

## Implementation checklist

- [x] Comparación completa y focal con la referencia.
- [x] Búsqueda y filtros funcionales.
- [x] Expedientes y navegación cruzada funcionales.
- [x] Responsive desktop y móvil.
- [x] Controles accesibles y foco visible.
- [x] Sin hallazgos P0/P1/P2 pendientes.

final result: passed
