# Tarea actual

## Estado

EN_REVISIÓN

Valores permitidos:

* BORRADOR
* APROBADA
* EN_EJECUCIÓN
* EN_REVISIÓN
* CERRADA

## Rama

`junie/observatorio-v1-continuation`

## Objetivo

Convertir el diagnóstico preliminar del barrido nacional en una metodología documental operativa para identificar y seleccionar casos emblemáticos que hayan transformado o acompañado transformaciones del sistema minero peruano.

Esta fase no investiga expedientes completos, no añade casos canónicos y no modifica datasets canónicos.

## Alcance

* Registrar un universo preliminar de 25 a 40 casos candidatos de conflictividad minera peruana.
* Definir reglas de unidad y límites del caso para evitar duplicidades entre caso puntual, proceso territorial, operación minera y sistema regional.
* Definir puertas obligatorias de selección y niveles preliminares `A`, `B`, `C` y `D`.
* Crear una matriz maestra para evaluar transformaciones alegadas sin presumir causalidad.
* Preparar los bloques futuros `1A`, `1B` y `1C` sin ejecutar adquisición documental ni búsqueda de fuentes nuevas.

## Archivos autorizados

Modificar únicamente:

* `docs/CURRENT_TASK.md`

Crear únicamente:

* `docs/research/national-case-scan.md`
* `docs/research/case-selection-criteria.md`
* `docs/research/case-impact-matrix.md`

## Criterios de aceptación

1. El universo preliminar contiene entre 25 y 40 candidatos e incluye como mínimo los 32 casos ya identificados.
2. Los seis casos actuales se identifican como expedientes piloto, no como canon definitivo ni exhaustivo.
3. La metodología diferencia caso puntual, proceso territorial, operación minera y sistema regional.
4. Existen puertas obligatorias de selección: identidad, fuente primaria, transformación alegada, vínculo y valor del caso.
5. Existen niveles `A — transformative-verified`, `B — documented-influence`, `C — relevant-candidate` y `D — observation-hypothesis`.
6. Se distinguen transformaciones legislativas, reglamentarias, jurisprudenciales, interamericanas o internacionales, institucionales, administrativas, procedimentales, contractuales, económicas, empresariales, de fiscalización, reasentamiento, cierre, pasivos, remediación, formalización, seguridad territorial y transformación territorial sin cambio jurídico confirmado.
7. La matriz maestra incluye contraevidencia, explicación alternativa, riesgo de duplicidad y riesgo de causalidad indebida.
8. La causalidad no se presume y no se declara que un caso transformó una norma sin documento de vínculo.
9. No se modifican datasets canónicos ni código.
10. Los bloques futuros `1A`, `1B` y `1C` quedan preparados, pero no ejecutados.

## Restricciones particulares

* No modificar `content/data`.
* No añadir casos canónicos.
* No crear páginas.
* No modificar código, pruebas, CSS, schemas ni dependencias.
* No cambiar estados de verificación.
* No añadir URLs inventadas.
* No afirmar causalidad.
* No declarar que un caso transformó una norma sin documento de vínculo.
* No instalar dependencias.
* No hacer commit ni push.
* No modificar archivos fuera de los cuatro autorizados.

## Validaciones documentales

Ejecutar únicamente:

1. `git diff --check`
2. `git status --short`
3. `git diff --stat`
4. `git diff -- docs/CURRENT_TASK.md docs/research/national-case-scan.md docs/research/case-selection-criteria.md docs/research/case-impact-matrix.md`

## Resultado esperado

Al terminar, cambiar este estado a `EN_REVISIÓN`, informar archivos creados y modificados, confirmar que no se añadieron fuentes ni casos canónicos, no hacer commit ni push, y esperar aprobación de DD y Kai.
