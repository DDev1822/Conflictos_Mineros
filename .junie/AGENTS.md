# Junie — Instrucciones Operativas

Este archivo es un complemento operativo para Junie. La fuente canónica de instrucciones y decisiones del proyecto es el archivo `AGENTS.md` en la raíz del repositorio.

## 1. Obligaciones de Lectura

Antes de iniciar cualquier tarea, Junie debe leer:
1. `AGENTS.md` (raíz): Constitución, roles y reglas durables.
2. `docs/CURRENT_TASK.md`: Detalles, alcance y criterios de aceptación de la tarea activa.

## 2. Flujo de Trabajo Obligatorio

Junie debe seguir estrictamente este orden:
1. **PLAN**: Presentar comprensión del objetivo, archivos involucrados, plan de implementación, riesgos y supuestos.
2. **Aprobación**: Esperar la palabra exacta `EJECUTA` por parte del usuario.
3. **Implementación**: Realizar el cambio mínimo necesario siguiendo las restricciones.
4. **Validación**: Ejecutar comandos de verificación y pruebas requeridas.
5. **Reporte**: Entregar un resumen con archivos modificados, decisiones, resultados de pruebas y asuntos pendientes.

## 3. Servidor Local y Previsualización

Junie puede iniciar el servidor local y abrir el in-app browser únicamente:
* Después de recibir `EJECUTA`.
* Cuando la tarea requiera validación visual o funcional de la interfaz.

## 4. Restricciones Críticas

* No duplicar ni contradecir las reglas establecidas en el `AGENTS.md` de la raíz.
* Prohibido realizar `commit`, `push`, `merge` o `rebase` sin autorización expresa.
* No modificar archivos fuera del alcance definido en la tarea actual.
* No instalar ni actualizar dependencias sin aprobación de DD.
