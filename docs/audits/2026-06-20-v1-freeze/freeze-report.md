# Informe de freeze privado V1

Fecha: 20 de junio de 2026.

## Decisión

La V1 alcanza freeze privado técnico y visual. No está autorizada para publicación: `release_ready` permanece en `false` por exposición de Pages, revisiones jurídicas y signoffs pendientes.

## Scorecard

| Gate | Resultado |
| --- | ---: |
| P0/P1 abiertos | 2 |
| Advertencias editoriales | 8 |
| Expedientes con ≥3 hitos | 6/6 |
| Revisiones jurídicas de expedientes | 0/6 |
| Revisiones jurídicas de instrumentos | 0/8 |
| Signoffs aprobados | 0/5 |
| Marcadores piloto nombrados | 6/6 |
| Guardarraíl reporte 266 | 64 / 190 / 7 / 5 / 2 |

## Contención

- El workflow de Pages acepta únicamente `workflow_dispatch`.
- El despliegue manual ejecuta `release:check` antes de crear el artefacto.
- README y manifiesto declaran `private-review`.
- La URL pública histórica continuó respondiendo HTTP 200 durante esta revisión; la despublicación y la regla de aprobación de `github-pages` requieren configuración externa.

## Producto

- Registro regional convertido en `<dialog>` modal nativo.
- Foco inicial en búsqueda, Escape y retorno de foco verificados.
- Navegación compactada entre 801 y 1280 px; menú móvil bajo 800 px.
- Capas agrupadas en lectura principal y dos bloques comparativos colapsables.
- Minería ilegal e informal permanecen separadas y declaran dos solapamientos.
- Seis expedientes ampliados a tres hitos documentados sin simular revisión legal.
- Normativa y expedientes muestran metadatos de revisión derivados de datos, no textos pendientes hardcodeados.

## Automatización

- Vitest cubre clasificación textual y bloqueo deliberado de signoffs.
- Playwright cubre navegación, mapa, diálogo, foco, marcadores, registros regionales, expedientes, normativa y responsive.
- `release:check` encadena tipos, lint, unitarias, contenido, auditoría, enlaces, E2E, build y readiness.

## Limitaciones

- No se atribuyó ninguna revisión jurídica a una persona inexistente.
- No se aprobaron metodología, licencias, editorial, legal ni accesibilidad sin evidencia humana.
- No se añadió backend, endpoint, capa territorial, ruta de producto ni funcionalidad V2.

Recomendación: mantener la V1 privada hasta completar despublicación y evidencia especialista.
