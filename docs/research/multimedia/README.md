# Multimedia del observatorio

Inventario interno para imágenes, recursos visuales y archivos fuente recibidos durante la revisión.

Regla clave: todo lo que esté dentro de `public/` queda disponible como archivo estático de Next.js si se conoce la URL. Por eso los archivos crudos, páginas HTML de trabajo, PDFs de investigación, exports originales de Canva o imágenes sin licencia cerrada deben vivir aquí, no en `public/multimedia`.

Ruta pública en Next.js:

```txt
/multimedia/nombre-del-archivo.webp
```

## Estructura

- `incoming/`: archivos originales recién subidos, aún sin revisar ni optimizar.
- `licenses/`: notas de licencia, créditos, origen y restricciones de uso.
- `public/multimedia/backgrounds/`: fondos editoriales optimizados para interfaz pública.
- `public/multimedia/cases/`: imágenes asociadas a expedientes territoriales.
- `public/multimedia/documents/`: material documental visual optimizado.
- `public/multimedia/maps/`: mapas exportados, recortes cartográficos o composiciones territoriales optimizadas.
- `public/multimedia/normativa/`: imágenes jurídicas optimizadas.
- `public/multimedia/reinfo/`: imágenes vinculadas a MAPE, REINFO, formalización o trazabilidad.

## Regla editorial

Solo deben pasar a `public/multimedia` los derivados optimizados que puedan mostrarse en el sitio. Si una imagen viene de Canva Pro, stock o una fuente externa, registrar crédito y restricción en `licenses/credits.md` antes de usarla en una página pública.

Preferencias visuales:

- tono documental, jurídico-minero y sobrio;
- evitar ilustraciones genéricas o decorativas;
- usar formatos web: `.webp`, `.jpg`, `.png` o `.avif`;
- nombres en minúsculas y guiones: `madre-de-dios-trazabilidad-hero.webp`.
