# Archivo: AGENTS.md

# Conflictos Mineros — Instrucciones para agentes

## 1. Misión del proyecto

Construir un observatorio académico, trazable y técnicamente verificable de conflictos socioambientales vinculados con minería en el Perú.

El producto debe separar claramente:

* hechos documentados;
* interpretación analítica;
* propuestas o recomendaciones.

No presentar inferencias como hechos confirmados.

## 2. Roles de trabajo

* DD toma las decisiones finales de producto, alcance y publicación.
* DD y Kai diseñan la arquitectura, las tareas y los criterios de aceptación.
* Junie implementa únicamente tareas previamente aprobadas.
* Git y GitHub constituyen la fuente oficial del estado del proyecto.

Cuando exista conflicto entre una solicitud y este archivo, detenerse y pedir aclaración.

## 3. Stack y estructura

* Framework: Next.js 15.
* Lenguaje: TypeScript con modo estricto.
* Estilos: CSS nativo y variables del sistema visual.
* Gestor de paquetes: npm.
* Datos canónicos: `content/data`.
* Narrativas y contenido editorial: `content/narratives`.
* Aplicación y rutas: `src/app`.
* Esquemas, validación y utilidades: `src/lib`.
* Fuentes y evidencia documental: `FUENTES`.

## 4. Flujo obligatorio por tarea

1. Leer `AGENTS.md`.
2. Leer `docs/CURRENT_TASK.md`.
3. Inspeccionar los archivos involucrados.
4. Presentar primero:

   * comprensión del objetivo;
   * archivos que podrían modificarse;
   * plan de implementación;
   * riesgos y supuestos.
5. No editar hasta recibir la palabra `EJECUTA`.
6. Implementar el cambio mínimo necesario.
7. Ejecutar las validaciones requeridas.
8. Entregar un reporte final con:

   * archivos modificados;
   * decisiones adoptadas;
   * pruebas ejecutadas y resultados;
   * supuestos;
   * asuntos pendientes.

## 5. Restricciones

No realizar sin autorización expresa:

* instalar, eliminar o actualizar dependencias;
* modificar `package.json` o `package-lock.json`;
* cambiar la versión de Next.js, TypeScript, Vitest o Playwright;
* crear datos ficticios para completar vacíos reales;
* eliminar, renombrar o reemplazar datasets;
* alterar fuentes originales dentro de `FUENTES`;
* modificar licencias;
* cambiar `AGENTS.md`;
* realizar commit, push, merge, rebase o crear pull requests;
* ejecutar comandos destructivos de Git;
* modificar archivos ajenos a la tarea;
* introducir nuevas arquitecturas o librerías;
* declarar conclusiones jurídicas no verificadas.

Comandos prohibidos salvo autorización explícita:

* `git reset --hard`
* `git clean -fd`
* `git push --force`
* `git checkout --`
* `git restore .`
* eliminación masiva de archivos o carpetas

## 6. Datos y trazabilidad

Todo caso minero debe conservar, cuando exista:

* identificador estable;
* título;
* descripción;
* región;
* provincia o distrito;
* empresa o proyecto relacionado;
* tipo de conflicto;
* estado;
* fuente;
* fecha de consulta;
* nivel de certeza.

Los resúmenes regionales deben derivarse de los registros canónicos, no mantenerse manualmente cuando puedan calcularse.

No modificar silenciosamente categorías, identificadores o criterios de clasificación.

## 7. Mapas y visualización

* Todo punto o región debe poder relacionarse con los casos que representa.
* Los conteos mostrados deben coincidir con el dataset.
* Minería formal e informal deben permanecer diferenciables.
* Los colores, leyendas y escalas deben ser consistentes.
* No exagerar precisión territorial cuando los datos solo estén disponibles a nivel regional.

## 8. Comandos permitidos para verificación

Comandos de inspección:

* `git status`
* `git diff`
* `git diff --stat`

Comandos de validación, cuando existan en `package.json`:

* `npm test`
* `npm run build`
* `npm run validate:content`
* `npm run audit:content`
* `npm run release:check`

No declarar éxito si una validación falla o no pudo ejecutarse.

## 9. Calidad de pruebas

* Las pruebas deben validar comportamiento real.
* No crear pruebas triviales únicamente para obtener un resultado verde.
* Toda corrección de bug debe incluir una prueba de regresión cuando sea razonable.
* No modificar una prueba válida solamente para hacer que una implementación incorrecta pase.
* Registrar cualquier validación que no haya podido ejecutarse.

## 10. Definición de terminado

Una tarea está terminada únicamente cuando:

* cumple todos los criterios de aceptación;
* no modifica elementos fuera de alcance;
* los datos conservan su trazabilidad;
* TypeScript compila;
* las pruebas relevantes pasan;
* las validaciones de contenido pasan;
* el build pasa cuando corresponda;
* el diff fue revisado;
* no existen secretos ni archivos temporales agregados;
* el reporte final es verificable.

# Archivo: .aiignore

# Secretos y configuración privada

.env
.env.*
!.env.example
*.pem
*.key
*.p12
*.pfx
credentials/
secrets/

# Dependencias y compilación

node_modules/
.next/
out/
dist/
coverage/

# Resultados temporales

test-results/
playwright-report/
tmp/
*.log
*.tmp
*.cache

# Configuración local del IDE

.idea/
*.iml

# Archivos del sistema

.DS_Store
Thumbs.db

# Archivo: docs/CURRENT_TASK.md

# Tarea actual

## Estado

BORRADOR

Valores permitidos:

* BORRADOR
* APROBADA
* EN_EJECUCIÓN
* EN_REVISIÓN
* CERRADA

## Rama

`junie/observatorio-v1-continuation`

## Objetivo

Describir exactamente qué resultado debe obtenerse.

## Valor para el usuario

Explicar qué problema resuelve y cómo se comprobará visual u operativamente.

## Alcance incluido

* Elemento 1.
* Elemento 2.

## Fuera de alcance

* Elemento que no debe modificarse.
* Mejora que queda para una tarea posterior.

## Archivos inicialmente relacionados

* `ruta/archivo1`
* `ruta/archivo2`

La lista es orientativa. Cualquier archivo adicional debe justificarse antes de editarlo.

## Criterios de aceptación

1. Criterio verificable.
2. Criterio verificable.
3. Criterio verificable.

## Validaciones requeridas

* `npm test`
* `npm run validate:content`
* `npm run build`

Ajustar solamente según los scripts existentes y el alcance real.

## Restricciones particulares

* No instalar dependencias.
* No cambiar esquemas fuera del objetivo.
* No modificar archivos ajenos a la tarea.

## Decisiones aprobadas

Registrar aquí únicamente decisiones confirmadas por DD.

## Resultado de ejecución

Completar después de implementar:

* archivos modificados;
* validaciones ejecutadas;
* resultados;
* riesgos pendientes;
* recomendaciones para la siguiente tarea.
