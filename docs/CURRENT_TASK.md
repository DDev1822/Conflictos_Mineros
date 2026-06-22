# Tarea actual

## Estado

CERRADA

Valores permitidos:

* BORRADOR
* APROBADA
* EN_EJECUCIÓN
* EN_REVISIÓN
* CERRADA

## Rama

`junie/observatorio-v1-continuation`

## Objetivo

Corregir de forma segura los textos visibles y metodológicos que presentan o pueden presentar la capa de plantas de beneficio como si representara todo el universo de minería formal.

La denominación visible principal debe ser `Plantas de beneficio vigentes`. La descripción metodológica debe dejar claro que la capa representa infraestructura de procesamiento registrada por MINEM, es un indicador parcial relacionado con la actividad minera formal, no representa todas las operaciones mineras formales, no equivale a unidades mineras en producción, no representa concesiones, proyectos ni titulares, y sus valores actuales están agregados por departamento con puntos territoriales de referencia regional.

## Nota sobre la tarea anterior

La tarea documental de Espinar permanece cerrada operativamente. Ese cierre registró la entrega del paquete de adquisición y no constituye aprobación sustantiva de fuentes pendientes ni autorización para modificar datasets, estados de verificación o conclusiones del caso.

## Archivos autorizados

Modificar únicamente, si contienen la ambigüedad identificada:

* `docs/CURRENT_TASK.md`
* `src/components/map-explorer.tsx`
* `src/app/reinfo/page.tsx`
* `docs/data-methodology.md`
* `src/lib/content.test.ts`

## Criterios de aceptación

1. Los textos visibles de la capa usan `Plantas de beneficio vigentes`, `Distribución territorial de plantas de beneficio vigentes`, `Infraestructura de beneficio registrada por MINEM` o `Indicador parcial de infraestructura minera formal`, según el contexto.
2. No se reemplazan usos correctos de “minería formal” cuando funcionan como concepto general y no como nombre de la capa.
3. La metodología indica que la capa representa plantas de beneficio registradas por MINEM y no todas las operaciones mineras formales.
4. La metodología indica que la capa no equivale a unidades mineras en producción y no representa concesiones, proyectos ni titulares.
5. La metodología indica que los conteos actuales están agregados por departamento y que los puntos son referencias regionales, no coordenadas exactas de cada planta.
6. La prueba de regresión verifica el nombre sustantivo del snapshot, los límites metodológicos, los conteos vigentes y la identidad del dataset canónico.
7. No se modifican datasets canónicos, YAML, cifras, diseño, dependencias, estados de verificación, rutas ni componentes puramente visuales.

## Restricciones particulares

* No renombrar `formalMiningTerritorialSnapshots.yaml`, schemas, tipos, props, variables internas ni claves del contrato de datos.
* No modificar YAML ni cifras.
* No modificar CSS, colores, layout ni componentes puramente visuales.
* No crear páginas ni rutas.
* No añadir fuentes.
* No cambiar estados de verificación.
* No instalar dependencias.
* No hacer commit ni push.

## Comandos de validación

Ejecutar:

1. `git diff --check`
2. `npm.cmd run typecheck`
3. `npm.cmd test`
4. `npm.cmd run validate:content`
5. `npm.cmd run audit:content`
6. `git status --short`
7. `git diff -- docs/CURRENT_TASK.md src/components/map-explorer.tsx src/app/reinfo/page.tsx docs/data-methodology.md src/lib/content.test.ts`

## Entrega esperada

Al terminar, cambiar este estado a `EN_REVISIÓN` y reportar archivos modificados, textos corregidos, prueba añadida o ajustada, comandos ejecutados y resultado, ambigüedades pendientes y confirmación de que no se modificaron datasets, cifras, diseño ni dependencias.

## Resultado de ejecución

* DD y Kai aprobaron la corrección terminológica.
* La capa visible se denomina `Plantas de beneficio vigentes`.
* Se aclaró que representa infraestructura de procesamiento registrada por MINEM.
* No representa todas las operaciones mineras formales ni equivale a unidades mineras en producción.
* No representa concesiones, proyectos ni titulares.
* Los datos permanecen agregados por departamento y sus puntos son referencias regionales.
* Los conteos canónicos permanecen en `342` códigos únicos, `340` territorializables y `2` sin departamento.
* Las 23 pruebas pasaron.
* `typecheck`, `validate:content`, `audit:content` y `git diff --check` finalizaron correctamente.
* Las ocho advertencias editoriales de `audit:content` eran preexistentes.
* No se modificaron YAML, cifras, diseño, dependencias, fuentes ni estados de verificación.
* La nomenclatura interna `formalMining...` queda pendiente para una tarea futura separada.
