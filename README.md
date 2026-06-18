# Observatorio Académico de Conflictos Mineros del Perú

Base académica navegable para conectar conflictos, territorios, actores, hechos, normas, fuentes y alternativas de política pública.

> Estado: V1 privada en construcción. Los expedientes y fichas normativas requieren revisión editorial y jurídica antes de publicación abierta.

## Sitio web

La versión estática se despliega mediante GitHub Pages en:

<https://ddev1822.github.io/Conflictos_Mineros/>

Cada actualización enviada a `main` o `codex/observatorio-v1` ejecuta validaciones y publica una nueva versión si todas finalizan correctamente.

## V1

- Seis casos piloto: Tambogrande, Conga, Tía María, Las Bambas, Espinar y Madre de Dios.
- Sistema de relaciones, catálogo de casos, mapa con capa nacional de conflictividad social, cronología y módulo REINFO/MAPE.
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
npm.cmd run check:links
npm.cmd run build
```

## Estructura

- `content/data`: colecciones YAML validadas.
- `content/data/socialConflictSnapshots.yaml`: cortes territoriales trazables para la capa de calor.
- `content/narratives`: narrativas MDX de los expedientes.
- `src/lib/schemas.ts`: contrato público de datos.
- `docs/data-methodology.md`: criterios de evidencia, precisión, mapa y revisión jurídica.
- `docs/design`: referencia visual y QA.

La [metodología de datos](docs/data-methodology.md) explica qué significa verificar una fuente o una afirmación, cómo se expresan las fechas imprecisas y cuáles son los límites del mapa.

## Contribuciones

Las correcciones y nuevos expedientes se revisan mediante pull request. Consulta [CONTRIBUTING.md](CONTRIBUTING.md).

## Licencias

- Código: [MIT](LICENSE).
- Contenido y datos propios: [CC BY 4.0](LICENSE-CONTENT.md).
- Las fuentes y materiales de terceros conservan sus licencias originales.

Este proyecto tiene fines académicos e informativos y no constituye asesoría jurídica.
