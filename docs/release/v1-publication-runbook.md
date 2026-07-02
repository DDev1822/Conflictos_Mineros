# V1 publication runbook

Estado objetivo: publicar la V1 como observatorio académico `public-learning`.

Este runbook no aprueba signoffs, no reemplaza revisión especializada y no convierte la V1 en `public-reviewed`. Define el camino operativo mínimo para pasar de una rama validada a una publicación controlada, corregible y trazable.

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

El despliegue a GitHub Pages debe ejecutarse manualmente con `workflow_dispatch` después del merge aprobado. El workflow `Deploy to GitHub Pages` debe correr desde la rama que contiene el estado a publicar y volver a ejecutar `npm run release:check` antes de subir el artefacto.

No se despliega si:

- `release_ready` no es `true`.
- Existe un riesgo P0/P1 abierto en `docs/release/v1-risks.yaml`.
- La página `/metodologia` no expone el estado `public-learning`.
- El Sistema de Relaciones no inicia con los dos problemas raíz.
- Madre de Dios mezcla evidencia observada con proyección lineal.
- Aparecen dependencias nuevas no aprobadas.
- Se intenta presentar la V1 como `public-reviewed` sin signoffs aprobados.

## 3. Verificación posterior al despliegue

Después de desplegar, revisar manualmente:

- Home: muestra `Observatorio documental · V1 public-learning`.
- `/metodologia`: muestra estado V1, cinco signoffs pendientes y avisos de transparencia.
- `/explorar`: inicia con `Conflicto social minero` y `Minería ilegal e informal`; las conexiones aparecen por interacción.
- `/mapa`: abre en 64 conflictos socioambientales mineros y permite cambiar explícitamente a 190 sociales.
- `/madre-de-dios`: distingue deforestación observada, proyección lineal y fuentes MAAP.
- `/conflictos`: usa “vacíos visibles”, no “vacíos bloqueantes”.

Registrar en el PR o en una nota de release:

- URL publicada.
- Workflow run usado para desplegar.
- Commit publicado.
- Fecha y responsable de la revisión manual.

## 4. Pendientes que no bloquean `public-learning`

Estos pendientes deben permanecer visibles, pero no bloquean una publicación académica corregible:

- Signoff metodológico pendiente.
- Signoff de licencias pendiente.
- Signoff editorial pendiente.
- Signoff documental pendiente.
- Signoff de accesibilidad pendiente.
- Tres vacíos de investigación declarados como avisos de transparencia.

Si alguno de estos puntos se quiere marcar como aprobado, debe actualizarse `docs/release/v1-manifest.yaml` con estado, fecha, responsable y evidencia. No se deben aprobar por inferencia.

## 5. Criterio para `public-reviewed`

La V1 solo puede pasar a `public-reviewed` cuando:

- Los cinco signoffs del manifiesto estén en `approved`.
- Cada signoff tenga `reviewedAt`, `reviewedBy` y `evidence`.
- La revisión jurídica/documental especializada no sea atribuida a una persona ficticia.
- `npm run release:check` pase después del cambio de visibilidad.
- La interfaz deje de describir pendientes como pendientes únicamente si el manifiesto ya los aprobó.

## 6. Reversión

Si el despliegue publica un estado equivocado:

1. No editar datos canónicos a mano en producción.
2. Corregir en una rama nueva basada en `codex/observatorio-v1`.
3. Ejecutar `npm run release:check`.
4. Fusionar solo con aprobación de DD.
5. Ejecutar de nuevo `Deploy to GitHub Pages`.

Si el problema es externo a la app, pausar el workflow de Pages o revertir el último merge desde GitHub con trazabilidad.
