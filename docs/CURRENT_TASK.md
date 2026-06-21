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

Preparar el paquete documental de adquisición y evaluación de fuentes primarias para el caso Espinar, sin modificar todavía los datasets canónicos ni los estados de verificación.

## Valor para el usuario

Permite investigar los vacíos críticos de trazabilidad de Espinar con criterios explícitos para aceptar, rechazar o contextualizar evidencia primaria antes de cualquier cambio en `content/data`.

## Alcance incluido

* Crear una matriz operativa para cinco ejes: expediente de amparo `00082-2025-0`, monitoreo ambiental, evaluaciones sanitarias, Convenio Marco Provincial de Espinar y evidencias de implementación o cumplimiento de acuerdos.
* Actualizar brevemente el memo de Espinar para referenciar la matriz y registrar que la fase de adquisición documental está iniciada.
* Mantener la advertencia metodológica de no causalidad y el estado de investigación incompleta.

## Fuera de alcance

* Buscar, registrar o añadir fuentes nuevas.
* Modificar `content/data`, estados de verificación, código, pruebas, dependencias, configuración, licencias o workflows.
* Presentar vacíos como cerrados o inferir estado judicial, cumplimiento de acuerdos o causalidad ambiental o sanitaria sin evidencia primaria verificada.
* Hacer commit, push, merge, rebase o pull request.

## Archivos autorizados

Se puede modificar únicamente:

* `docs/CURRENT_TASK.md`
* `docs/research/cases/espinar.md`

Se puede crear únicamente:

* `docs/research/cases/espinar-source-matrix.md`

## Criterios de aceptación

1. `docs/research/cases/espinar-source-matrix.md` contiene los cinco ejes obligatorios y los 17 campos mínimos solicitados para cada eje.
2. La matriz distingue fuentes primarias, fuentes contextuales y perspectivas actorales sin reemplazar automáticamente `cooperaccion-espinar-2025`.
3. El expediente judicial se desagrega en escrito de demanda, anexos, auto admisorio o resolución equivalente, resoluciones posteriores, consulta oficial de estado procesal y sentencia solo si existiera y fuera verificada.
4. Monitoreo ambiental y sanitario separan anuncio, protocolo, ejecución, resultados, informe final, interpretación institucional y conclusión causal.
5. Convenio Marco y acuerdos clasifican la evidencia como acuerdo anunciado, acta suscrita, compromiso registrado, implementación reportada, cumplimiento verificado, incumplimiento alegado o estado no comprobado.
6. `docs/research/cases/espinar.md` mantiene investigación incompleta, no causalidad, adquisición documental iniciada y referencia relativa a `espinar-source-matrix.md`.
7. No se modifican datasets canónicos ni estados de verificación.

## Validaciones documentales requeridas

Ejecutar únicamente:

1. `git diff --check`
2. `git status --short`
3. `git diff -- docs/CURRENT_TASK.md docs/research/cases/espinar.md docs/research/cases/espinar-source-matrix.md`

## Restricciones particulares

* No buscar ni añadir todavía fuentes nuevas.
* No inventar URLs, expedientes, títulos o documentos.
* No modificar `content/data/`.
* No cambiar estados de verificación.
* No modificar código, pruebas, dependencias o configuración.
* No hacer commit ni push.

## Decisiones aprobadas

* DD autorizó ejecutar el plan de matriz de adquisición para Espinar con alcance documental restringido.
* `cooperaccion-espinar-2025` no debe eliminarse ni reemplazarse automáticamente; puede conservarse como perspectiva atribuida o fuente contextual si no sustituye el expediente judicial.
* Notas de prensa no equivalen a actas, expedientes, informes técnicos finales ni pruebas de cumplimiento.
* No se permite inferir causalidad ambiental o sanitaria ni estado procesal judicial sin evidencia primaria verificable.

## Resultado de ejecución

* Archivos modificados: `docs/CURRENT_TASK.md` y `docs/research/cases/espinar.md`.
* Archivo creado: `docs/research/cases/espinar-source-matrix.md`.
* Se generó la matriz de adquisición de evidencia primaria de Espinar.
* La matriz contiene los cinco ejes requeridos y los 17 campos mínimos por eje.
* No se modificaron datasets canónicos ni estados de verificación.
* No se añadieron fuentes nuevas ni URLs no verificadas.
* `git diff --check` terminó correctamente.
* La tarea queda pendiente de revisión y aprobación de DD y Kai.
