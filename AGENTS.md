# Conflictos Mineros — Instrucciones para agentes

## 1. Misión y Voz

Construir un observatorio académico, trazable y técnicamente verificable de conflictos socioambientales vinculados con minería en el Perú.

El producto debe separar claramente:
* Hechos documentados.
* Interpretación analítica.
* Propuestas o recomendaciones.

No presentar inferencias como hechos confirmados. El tono debe ser académico, plural, trazable y sobrio.

## 2. Roles y Autoridad

* **DD** toma las decisiones finales de producto, alcance y publicación.
* **DD y Kai** diseñan la arquitectura, las tareas y los criterios de aceptación.
* **Junie o Codex** implementan únicamente tareas previamente aprobadas.
* El repositorio Git local es el espacio de trabajo.
* **GitHub** constituye la fuente oficial, compartida y verificable del estado del proyecto y los estados publicados.

## 3. Pila Tecnológica y Estructura

* Framework: Next.js 15.
* Lenguaje: TypeScript con modo estricto.
* Estilos: CSS nativo y variables del sistema visual.
* Gestor de paquetes: npm.
* Datos canónicos: `content/data`.
* Narrativas y contenido editorial: `content/narratives`.
* Aplicación y rutas: `src/app`.
* Esquemas, validación y utilidades: `src/lib`.
* Fuentes y evidencia documental: `FUENTES`.

## 4. Flujo Operativo y Validación Visual

Después de recibir `EJECUTA`, el agente puede iniciar el servidor local y abrir una vista previa cuando la tarea requiera validación visual. Antes de `EJECUTA`, no debe ejecutar comandos ni modificar archivos.

## 5. Restricciones de Seguridad y Git

* Ningún agente realiza commit, push, merge, rebase, pull request o cambios de dependencias sin autorización expresa.
* No instalar, eliminar o actualizar dependencias.
* No modificar `package.json` o `package-lock.json`.
* No cambiar la versión de Next.js, TypeScript, Vitest o Playwright.
* No crear datos ficticios para completar vacíos reales.
* No eliminar, renombrar o reemplazar datasets.
* No alterar fuentes originales dentro de `FUENTES`.
* No modificar licencias.
* No modificar archivos ajenos a la tarea.

## 6. Datos y Trazabilidad

Todo caso minero debe conservar, cuando exista:
* Identificador estable.
* Título, descripción, región, provincia o distrito.
* Empresa o proyecto relacionado.
* Tipo de conflicto, estado, fuente, fecha de consulta y nivel de certeza.

Los resúmenes regionales deben derivarse de los registros canónicos, no mantenerse manualmente cuando puedan calcularse.

## 7. Mapas y Visualización

* Visualización basada en el "Sistema de Relaciones".
* Todo punto o región debe poder relacionarse con los casos que representa. Los conteos deben coincidir con el dataset.
* Minería formal e informal deben permanecer diferenciables.
* Los colores, leyendas y escalas deben ser consistentes.
* No exagerar precisión territorial cuando los datos solo estén disponibles a nivel regional.

### Reglas por Capas:
* **Conflictos Sociales**: Capa de calor basada en reportes de la Defensoría del Pueblo. Mostrar corte, distinguir de conflictos mineros y mantener marcadores de casos piloto separados. Escala: cyan (bajo), amber (medio), red (alto).
* **Minería Ilegal e Informal**: Categorías separadas y activables independientemente. Nunca presentarlas como equivalentes legales.
* **REINFO**: Registro agregado vigente. Indicar fuente y corte; puntos regionales son agregados, no ubicaciones de actividad.
* **Minería Formal**: Plantas de beneficio vigentes (MINEM). Indicador parcial, no incluye concesiones o pipeline en esta capa.
* **Exploración y Concesiones**: Capas separadas. Exploración usa expedientes activos (MINEM). Concesiones usa derechos titulados (INGEMMET). Usar estilos de línea concéntricos distintos para legibilidad.

## 8. Calidad, Pruebas y Definición de Terminado

* Las pruebas deben validar comportamiento real, no ser triviales. Toda corrección de bug requiere prueba de regresión.
* El repositorio permanece privado hasta que la metodología, licencias y el núcleo jurídico sean revisados.
* Ningún instrumento legal puede marcarse como vigente y verificado sin revisión especialista fechada.

### Definición de Terminado:
Una tarea está terminada únicamente cuando:
1. Cumple todos los criterios de aceptación.
2. No modifica elementos fuera de alcance.
3. Los datos conservan su trazabilidad.
4. TypeScript compila y las pruebas relevantes (vitest/playwright) pasan.
5. Las validaciones de contenido (`validate:content`, `audit:content`) pasan.
6. El build pasa cuando corresponda.
7. El diff fue revisado y no hay secretos o archivos temporales agregados.
