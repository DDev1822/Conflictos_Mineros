# Observatorio Académico de Conflictos Mineros del Perú

Base académica navegable para conectar conflictos, territorios, actores, hechos, normas, fuentes y alternativas de política pública.

> Estado: V1 académica abierta y en evolución. La información se publica con trazabilidad, disclaimer y corrección abierta; no constituye dictamen, acusación ni sentencia.

## Publicación

El despliegue automático desde `main` y `codex/observatorio-v1` está desactivado. GitHub Pages puede ejecutarse manualmente cuando los controles técnicos y de datos pasen. Las notas de metodología, licencias, edición, documentación y accesibilidad son metadatos de transparencia: orientan mejoras, pero no sustituyen el carácter civil y corregible del observatorio.

La URL pública se entiende como una versión académica en aprendizaje continuo, abierta a correcciones documentadas.

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

Este gate falla intencionalmente cuando hay ruptura técnica, datos inconsistentes, referencias rotas o P0/P1 operativos abiertos. Las notas editoriales, documentales, de licencias y accesibilidad se reportan como avisos de transparencia, no como candados de publicación.

## Estructura

- `content/data`: colecciones YAML validadas.
- `content/data/evidenceRecords.yaml`: locadores exactos y relaciones `supports | qualifies | contradicts`.
- `content/data/caseResearchPackets.yaml`: cobertura, posiciones, contradicciones, preguntas de alcance y vacíos de los seis casos.
- `content/data/legalResearchPackets.yaml`: ocho paquetes normativos documentales.
- `content/data/socialConflictSnapshots.yaml`: cortes territoriales trazables para la capa de calor.
- `content/data/miningConflictSelections.yaml`: selección minera reconciliada con los totales publicados por la Defensoría del Pueblo.
- `content/narratives`: narrativas MDX de los expedientes.
- `src/lib/schemas.ts`: contrato público de datos.
- `docs/data-methodology.md`: criterios de evidencia, precisión, mapa y alcance documental.
- `docs/design`: referencia visual y QA.
- `docs/release/v1-manifest.yaml`: notas de transparencia fechadas y evidencia de la V1.
- `docs/release/v1-risks.yaml`: riesgos operativos y decisiones de publicación.
- `docs/research`: memos de caso, fichas normativas y paquetes de investigación documental.

La [metodología de datos](docs/data-methodology.md) explica qué significa verificar una fuente o una afirmación, cómo se expresan las fechas imprecisas y cuáles son los límites del mapa.

## Contribuciones

Las correcciones y nuevos expedientes se revisan mediante pull request. Consulta [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencias

- Código: [MIT](LICENSE).
- Contenido y datos propios: [CC BY 4.0](LICENSE-CONTENT.md).
- Las fuentes y materiales de terceros conservan sus licencias originales.

Este proyecto tiene fines académicos e informativos y no constituye asesoría jurídica.
