# Runbook de publicación académica

Estado objetivo: publicar el observatorio como recurso `public-academic`, informativo, trazable y corregible.

Este runbook controla integridad técnica y documental. La publicación conserva un alcance académico e informativo y no sustituye asesoría profesional, peritajes ni decisiones de autoridad.

## 1. Condiciones para merge

Antes de fusionar una rama de publicación en `codex/observatorio-v1`, deben cumplirse todas estas condiciones:

- El PR apunta a `codex/observatorio-v1`.
- El PR no está en conflicto y es mergeable.
- GitHub CI termina en `success`.
- El job remoto ejecuta `npm run release:check`.
- Localmente se verificó `npx.cmd tsc --noEmit`.
- Localmente se verificó `git diff --check`.
- Localmente se verificó `git diff --name-only -- package.json package-lock.json` sin salida.
- La descripción del PR declara validaciones reales, limitaciones y no alcance.
- No hay cambios no revisados en `package.json` ni `package-lock.json`.

Si una de estas condiciones falla, no se mergea.

## 2. Condiciones para despliegue manual

El despliegue a GitHub Pages debe ejecutarse manualmente con `workflow_dispatch` después del merge aprobado por DD. El workflow `Deploy to GitHub Pages` debe correr desde la rama que contiene el estado a publicar y volver a ejecutar `npm run release:check` antes de subir el artefacto.

No se despliega si:

- `academic_publication_ready` no es `true`.
- Existe un riesgo P0/P1 abierto en `docs/release/v1-risks.yaml`.
- El disclaimer académico no aparece en la interfaz.
- La página `/metodologia` no expone el alcance `public-academic`.
- El Sistema de Relaciones incorpora conflictos sociales no mineros, oculta el eje de minería ilegal e informal o presenta REINFO como si fuera un conflicto social.
- Las rutas `/madre-de-dios` u `/oro-ilegal` no responden 200 o pierden sus fuentes y límites de interpretación.
- La ruta `/reinfo` no responde 200, pierde su corte o deja de diferenciar inscripción vigente de formalización concluida.
- Aparecen dependencias nuevas no aprobadas.
- Existen datos o afirmaciones publicadas sin trazabilidad mínima.

## 3. Verificación posterior al despliegue

Después de desplegar, revisar manualmente:

- Home: presenta el observatorio como académico e informativo y enfocado en conflictos sociales mineros.
- Pie global: declara que el contenido no sustituye asesoría profesional ni decisiones de autoridad.
- `/metodologia`: muestra alcance académico, evidencia apta para contraste y límites documentales declarados.
- `/explorar`: presenta `Conflicto social minero`, `Minería ilegal e informal` y `REINFO` como raíces distintas; no suma el registro administrativo al conteo de conflictos.
- `/mapa`: abre en los 61 conflictos sociales mineros del Reporte 268, no ofrece el registro social general y permite activar por separado minería ilegal, minería informal, REINFO, plantas de beneficio, exploración y concesiones.
- `/conflictos`: muestra los 12 casos publicados, sus fuentes y límites de interpretación sin atribuir responsabilidades.
- `/compromisos`: compara documentos, seguimiento y resultados sin presentar acuerdos como cumplimiento integral.
- `/normativa`: presenta fuentes oficiales y preguntas de aplicación sin afirmar vigencia consolidada.
- `/reinfo`: responde 200, es indexable y muestra corte, fuente oficial, distribución regional agregada y límites de interpretación.
- `/madre-de-dios`: responde 200, es indexable y diferencia medición documentada, ritmo observado, proyección y límites territoriales.
- `/oro-ilegal`: responde 200, es indexable y explica la cadena de trazabilidad sin convertir estimaciones o brechas en imputaciones.

Registrar en el PR o en una nota de release:

- URL publicada.
- Workflow run usado para desplegar.
- Commit publicado.
- Fecha y responsable de la revisión manual.

## 4. Límites que no bloquean la publicación académica

Los vacíos de investigación, las contradicciones atribuidas y las preguntas abiertas deben permanecer visibles. No bloquean una publicación académica cuando:

- están declarados en el paquete de caso o normativo;
- no sustentan una afirmación presentada como hecho verificado;
- conservan fuente, referencia precisa y fecha de consulta cuando corresponda;
- pueden corregirse mediante un cambio trazable.

Sí bloquean la publicación las relaciones rotas, los datos inconsistentes, las afirmaciones sin fuente, los derechos desconocidos en uso y las contradicciones sustantivas sin contraste suficiente.

## 5. Mantenimiento académico

Los aportes comunitarios, académicos, documentales, territoriales o editoriales son bienvenidos como contribuciones documentadas, pero no son requisitos de publicación.

Toda corrección debe distinguir hechos, interpretación y propuestas; preservar el historial en Git; y evitar presentar inferencias como hechos confirmados.

## 6. Reversión

Si el despliegue publica un estado equivocado:

1. No editar datos canónicos a mano en producción.
2. Corregir en una rama nueva basada en `codex/observatorio-v1`.
3. Ejecutar `npm run release:check`.
4. Fusionar solo con aprobación de DD.
5. Ejecutar de nuevo `Deploy to GitHub Pages`.

Si el problema es externo a la app, pausar el workflow de Pages o revertir el último merge desde GitHub con trazabilidad.
