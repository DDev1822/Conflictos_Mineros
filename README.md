# Observatorio Académico de Conflictos Mineros del Perú

Base académica navegable para conectar conflictos, territorios, actores, hechos, normas, fuentes y alternativas de política pública.

> Estado: V1 privada en revisión. GitHub Pages debe permanecer sin contenido público hasta que `npm run release:check` retorne 0 y exista aprobación manual del entorno.

## Publicación

El despliegue automático desde `main` y `codex/observatorio-v1` está desactivado. GitHub Pages solo puede ejecutarse manualmente, después de superar los gates técnicos, editoriales, jurídicos y de accesibilidad y de recibir la aprobación del entorno `github-pages` por `DDev1822`.

La URL histórica de Pages no se considera una versión autorizada de la V1 mientras el manifiesto permanezca en `private-review`.

## V1

- Seis casos piloto: Tambogrande, Conga, Tía María, Las Bambas, Espinar y Madre de Dios.
- Sistema de relaciones, catálogo de casos, mapa enfocado en conflictos socioambientales mineros con comparación del registro social completo, cronología y módulo REINFO/MAPE.
- Contenido estructurado en YAML, narrativas en MDX y validación con Zod.
- Afirmaciones clasificadas como hechos, interpretaciones o propuestas.
- Compilación bloqueada ante relaciones rotas, IDs duplicados o afirmaciones sin fuente.

## Desarrollo

```powershell
npm.cmd install
npm.cmd run dev
```

Validación completa:

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run validate:content
npm.cmd run audit:content
npm.cmd run research:scorecard
npm.cmd run check:links
npm.cmd run test:e2e
npm.cmd run build
```

Gate de publicación:

```powershell
npm.cmd run release:check
```

Este gate falla intencionalmente mientras exista un P0/P1 abierto, una advertencia editorial, una revisión jurídica o un signoff pendiente.

## Estructura

- `content/data`: colecciones YAML validadas.
- `content/data/evidenceRecords.yaml`: locadores exactos y relaciones `supports | qualifies | contradicts`.
- `content/data/caseResearchPackets.yaml`: cobertura, posiciones, contradicciones, preguntas jurídicas y vacíos de los seis casos.
- `content/data/legalResearchPackets.yaml`: ocho paquetes documentales para revisión especialista.
- `content/data/socialConflictSnapshots.yaml`: cortes territoriales trazables para la capa de calor.
- `content/data/miningConflictSelections.yaml`: selección minera reconciliada con los totales publicados por la Defensoría del Pueblo.
- `content/narratives`: narrativas MDX de los expedientes.
- `src/lib/schemas.ts`: contrato público de datos.
- `docs/data-methodology.md`: criterios de evidencia, precisión, mapa y revisión jurídica.
- `docs/design`: referencia visual y QA.
- `docs/release/v1-manifest.yaml`: signoffs fechados y evidencia de la V1.
- `docs/release/v1-risks.yaml`: riesgos P0/P1 que bloquean publicación.
- `docs/research`: seis memos de caso y ocho fichas normativas de entrega.

La [metodología de datos](docs/data-methodology.md) explica qué significa verificar una fuente o una afirmación, cómo se expresan las fechas imprecisas y cuáles son los límites del mapa.

## Contribuciones

Las correcciones y nuevos expedientes se revisan mediante pull request. Consulta [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencias

- Código: [MIT](LICENSE).
- Contenido y datos propios: [CC BY 4.0](LICENSE-CONTENT.md).
- Las fuentes y materiales de terceros conservan sus licencias originales.

Este proyecto tiene fines académicos e informativos y no constituye asesoría jurídica.
