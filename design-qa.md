# Design QA — cierre V1

- Fuente visual: `docs/design/reference-system-relations.png`
- Capturas actuales: `docs/audits/2026-06-20-v1-freeze/`
- Viewports revisados: 1440 × 1024, 1280 × 720 y 390 × 844
- Fecha base de capturas: 20 de junio de 2026
- Validación automatizada vigente: 27 de julio de 2026
- Resultado visual y funcional: controles automatizados superados para publicación `public-academic`
- Resultado de publicación: habilitado como observatorio académico e informativo, corregible y trazable

## Hallazgos vigentes

- [Alcance] El contenido no constituye asesoría jurídica, médica, ambiental o técnica.
- [Alcance] Los expedientes y normas conservan límites probatorios y preguntas de aplicación sin convertirlos en alertas de aprobación profesional.
- [Transparencia] Los límites de investigación permanecen visibles y abiertos a correcciones documentadas.

No quedan hallazgos P0/P1 abiertos en accesibilidad del diálogo, nombres de marcadores, navegación responsive, overflow horizontal o estructura de capas.

## Comparación con “Sistema de Relaciones”

La implementación conserva la anatomía de la referencia: encabezado tinta, búsqueda y filtros, índice lateral, grafo central, inspector de evidencia y cronología inferior. La densidad se redujo de forma coherente con el universo real de la V1, sin alterar la jerarquía académica ni el lenguaje visual cobre, papel y tinta.

## QA aplicado

- Navegación completa visible a 1280 px.
- Menú móvil funcional y sin overflow horizontal a 390 px.
- Mapa enfocado en los 61 conflictos sociales mineros del Reporte 268, sin acceso al registro social general.
- Sistema de relaciones inicia con dos problemas raíz y revela conexiones de forma progresiva por interacción.
- Diálogo regional modal con foco inicial, Escape y retorno al control de apertura.
- Seis marcadores con nombre accesible único.
- Panel territorial móvil sin scroll interno.
- Capas principales abiertas y comparaciones secundarias colapsadas con contador de activas.
- Expedientes estándar con al menos cinco hitos sustantivos y expedientes profundizados con al menos ocho; las publicaciones se muestran, pero no cuentan para el mínimo.
- Normativa con fuente oficial, fecha de comprobación y pregunta de aplicación, sin dictamen de vigencia consolidada.
- Densidad editorial revisada después de ampliar las cronologías y fuentes: la portada de expediente conserva jerarquía, lectura en dos columnas y ausencia de overflow; las fuentes adicionales quedan en el panel de trazabilidad.

## Diferencias no bloqueantes

- [P3] El pie institucional del sistema de relaciones queda después del primer viewport.
- [P3] Los actores aparecen como nodos conectados, sin el contenedor agrupador de la referencia.
- [P3] Los mosaicos cartográficos externos pueden cargar parcialmente en capturas headless; la capa de datos, puntos y controles se mantienen legibles.

## Evidencia

- `01-inicio-1440x1024.png`
- `02-relaciones-1440x1024.png`
- `03-mapa-1440x1024.png`
- `04-expediente-1440x1024.png`
- `05-normativa-1440x1024.png`
- `06-mapa-1280x720.png`
- `07-dialogo-puno-1280x720.png`
- `08-mapa-390x844.png`
- `09-menu-390x844.png`

Resultado: `public-academic` supera los controles técnicos y documentales automatizados.

## Actualización documental del 20 de junio de 2026

Las capturas fueron regeneradas después de incorporar 69 fuentes, seis paquetes de caso, ocho fichas normativas y cronologías ampliadas. Product Design se aplicó como control de legibilidad contra la referencia vigente, sin rediseño ni nuevas rutas. La ampliación no introdujo overflow horizontal ni cambió la identidad visual.

## Actualización de publicación del 27 de julio de 2026

El observatorio adopta el alcance `public-academic`: los bloqueos P0/P1 operativos permanecen resueltos y el gate académico pasa sin avisos de publicación. El disclaimer explicita el propósito informativo y excluye asesoría jurídica, médica, ambiental o técnica; los límites probatorios permanecen como información académica, no como requisitos de aprobación.

## Actualización de espaciado del 27 de julio de 2026

- Verdad visual recibida: `%TEMP%\codex-clipboard-03b36d5e-daea-4d66-88ed-7168408b09ad.png`.
- Implementación capturada: `%TEMP%\confmin-relationship-spacing-implementation.png`.
- Comparación conjunta: `%TEMP%\confmin-relationship-spacing-comparison.png`.
- Viewport: 1900 × 913 CSS px, densidad 1; lienzo comparado de 1175 × 725 px.
- Estado: 12 tarjetas visibles y foco en “Actores y actas”.
- Normalización: se retiraron 20 px de la captura de origen correspondientes a la barra de tareas del sistema operativo.

### Findings

- No quedan hallazgos P0, P1 o P2 en este ajuste.
- Separación mínima renderizada: 15,78 px.
- Cero tarjetas solapadas, fuera del lienzo o cubiertas por la nota metodológica.
- A 1280 px, la nota metodológica conserva 10,22 px de separación horizontal respecto de la fila comparativa.
- Colores, tipografía, contenido, jerarquía y relaciones conservados.
- No hay activos de imagen en el lienzo y no se detectaron errores de consola.

### Comparison history

1. El origen presentaba cruces visuales entre las filas centrales e inferiores.
2. La primera iteración introdujo una retícula vertical explícita, pero la nota metodológica rozaba la fila comparativa.
3. La iteración final desplazó la fila comparativa, limitó el zoom inicial expandido a 0,7 y redujo el ancho de la nota en escritorios de hasta 1280 px. La comparación completa fue suficiente; no se requirió una ampliación adicional porque las 12 tarjetas y sus separaciones son legibles.

final result: passed

## Integración de identidad DrillStone del 29 de julio de 2026

- Verdad visual recibida:
  - `C:\Users\DeeDee\Downloads\L1.png` — símbolo DrillStone, 4000 × 4000 px, RGBA, contenido visible en `(1416, 1404)–(2563, 2593)`.
  - `C:\Users\DeeDee\Downloads\L3.png` — firma DrillStone, 4000 × 4000 px, RGBA, contenido visible en `(1147, 1807)–(3271, 2263)`.
  - `C:\Users\DeeDee\Downloads\L2.png` — DrillStone RoadLab, archivado en Notion y excluido del producto por decisión de alcance.
- Implementaciones capturadas:
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\drillstone-header-1440x120-final.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\drillstone-footer-1440x900-final.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\drillstone-header-mobile-390x110.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\drillstone-footer-mobile-390x844-final.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\drillstone-header-tablet-900x110.png`.
- Comparaciones conjuntas normalizadas:
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\drillstone-header-comparison.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\drillstone-footer-comparison.png`.
- Viewports: 1440 × 900, 900 × 800 y 390 × 844 CSS px; `devicePixelRatio: 1`.
- Estados: portada en posición inicial; pie visible después de recorrer la portada.
- Normalización: los originales se recortaron solo para la comparación visual usando su canal alfa; los PNG publicados permanecen byte a byte iguales a L1 y L3. Las capturas de implementación se recortaron a la cabecera y el pie correspondientes.

### Findings

- No quedan hallazgos P0, P1 o P2.
- Tipografía: la marca no altera familias, pesos, jerarquía ni envoltura del nombre del observatorio.
- Espaciado y ritmo: el símbolo ocupa 31 × 31 px en escritorio y móvil, 24 × 24 px en tableta; la firma ocupa 110 × 26 px en escritorio y 128 × 30 px en móvil. No hay overflow horizontal a 900 ni 390 px.
- Color y tokens: una placa marfil separa los trazos oscuros de DrillStone del fondo tinta y conserva el cobre y el verde originales sin recolorear el activo.
- Calidad y fidelidad: L1 y L3 conservan transparencia, proporción y píxeles originales. No se recrearon con SVG, CSS, texto ni sustitutos. L2/RoadLab no aparece en el DOM ni en los activos públicos.
- Copia: el observatorio conserva su nombre y su disclaimer académico; no se añadió una atribución que implique patrocinio, autoría o respaldo no documentado.
- Interacciones comprobadas: navegación superior, menú responsive y recorrido hasta el pie.
- Errores de consola: 0.

### Comparison history

1. La primera inserción usó el símbolo directamente sobre fondo tinta; el contorno azul oscuro se perdía y solo destacaban los segmentos naranjas.
2. La iteración final incorporó una placa marfil, redujo ligeramente la escala interna del símbolo y aplicó el mismo tratamiento a la firma del pie.
3. Las comparaciones conjuntas confirman que el dibujo, las proporciones y los colores del original son reconocibles; escritorio, tableta y móvil permanecen sin solapamientos ni desborde.

### Follow-up polish

- [P3] Si DrillStone entrega exportaciones oficiales ya recortadas o vectoriales, podrán reducirse los 4000 × 4000 px de los PNG sin alterar la identidad. La versión actual prioriza fidelidad byte a byte a los archivos recibidos.

final result: passed

## Actualización de legibilidad de conexiones del 28 de julio de 2026

- Verdad visual recibida: `C:\Users\DeeDee\AppData\Local\Temp\codex-clipboard-08441f5b-b2d8-4a98-a889-7ec836c52147.png`.
- Implementación capturada: `C:\Users\DeeDee\.codex\visualizations\2026\07\27\019fa2c4-5891-7c21-be52-0294834e34ae\relations-after-qa-aligned-1920.png`.
- Comparación conjunta normalizada: `C:\Users\DeeDee\.codex\visualizations\2026\07\27\019fa2c4-5891-7c21-be52-0294834e34ae\relations-qa-comparison-final.png`.
- Viewport de implementación: 1920 × 911 CSS px, `devicePixelRatio: 1`.
- Región comparada: lienzo de Relaciones de 1195 × 723 px en ambos lados.
- Estado: 12 nodos visibles y foco activo en REINFO.
- Normalización: se retiró el cromo del navegador y se recortó exclusivamente el lienzo del grafo en origen e implementación.

### Findings

- No quedan hallazgos P0, P1 o P2 en la ubicación de “Raíz”, protección de etiquetas o visibilidad de líneas.
- Las tres etiquetas “Raíz” conservan 14,7 px de separación respecto del borde superior y derecho de su nodo.
- Las nueve conexiones visibles renderizan entre 2,4 y 3,2 px, con terminación redondeada, flecha y halo de contraste.
- Las nueve etiquetas de conexión tienen nueve fondos opacos correspondientes, borde visible y separación interna.
- Tipografía, colores, iconos, contenido y posiciones de los nodos se conservaron; no se agregaron activos de imagen.
- Interacciones comprobadas: revelado progresivo de minería ilegal e informal, REINFO y conflicto social minero; selección final de REINFO.
- Errores de consola: 0.

### Comparison history

1. La captura de origen mostraba las tres insignias “Raíz” fuera del borde derecho, trazos secundarios demasiado finos y texto de relación atravesado visualmente por las líneas.
2. La implementación ubicó las insignias dentro de cada nodo, elevó el grosor de las conexiones sin alterar su color semántico y añadió fondos individuales a las etiquetas.
3. La comparación final de 1195 × 723 px confirmó que no quedan textos recortados, líneas imperceptibles ni etiquetas sin protección. No fue necesario un recorte adicional: el lienzo completo permite comprobar las tres superficies señaladas.

final result: passed

## Recuperación de la capa visual del 29 de julio de 2026

- Verdades visuales recibidas:
  - `C:\Users\DeeDee\AppData\Local\Temp\codex-clipboard-71a7bc61-a3df-4318-855e-1a91ebc4ce08.png`.
  - `C:\Users\DeeDee\AppData\Local\Temp\codex-clipboard-c78fa502-57ea-430a-969f-44f8d59399e1.png`.
  - `C:\Users\DeeDee\AppData\Local\Temp\codex-clipboard-df35bcd2-b22d-4cf8-952e-53883cf1b6c6.png`.
  - `C:\Users\DeeDee\AppData\Local\Temp\codex-clipboard-0172ab0d-f733-498c-a380-231512b01269.png`.
- Implementaciones capturadas:
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\visual-layer-home-fixed.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\visual-layer-gold-intro-fixed-aligned.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\visual-layer-madre-fixed.png`.
- Comparaciones conjuntas:
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\visual-layer-home-comparison.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\visual-layer-gold-comparison.png`.
  - `C:\Users\DeeDee\.codex\visualizations\2026\07\29\019fac2b-044d-76f1-8dbb-aac3789a2768\visual-layer-madre-comparison.png`.
- Viewport de implementación: 1920 × 911 CSS px, densidad 1.
- Dimensiones de origen: 1920 × 1032 px con 121 px de cromo del navegador; región normalizada a 1920 × 911 px.
- Dimensiones de implementación: 1920 × 911 px; comparaciones reducidas a dos paneles de 960 × 456 px.
- Estados: portada inicial; Oro ilegal desplazado hasta la introducción probatoria; cabecera inicial de Madre de Dios.

### Findings

- No quedan hallazgos P0, P1 o P2 en la carga, el recorte o la integración de la capa visual.
- Tipografía y copia permanecen sin cambios; la reparación recupera imágenes y fondos sin alterar la jerarquía editorial.
- El espaciado, la grilla, los colores y los overlays conservan la composición previa.
- Calidad de activos: los archivos WebP originales se renderizan en sus dimensiones naturales de 1280 × 720 o 1600 × 900, sin sustitutos ni marcadores de posición.
- Las tres imágenes de la portada cargan con `naturalWidth: 1280`; las imágenes de Oro ilegal y Madre de Dios cargan con `naturalWidth: 1600`.
- Los fondos de portada, Oro ilegal y textura territorial resuelven a recursos multimedia reales.
- Interacciones comprobadas: navegación directa entre las tres rutas y carga diferida de la imagen territorial al entrar en viewport.
- Errores de consola: 0.

### Comparison history

1. Las capturas de producción mostraban textos alternativos y superficies vacías porque las referencias apuntaban a `/multimedia/...`, fuera del subdirectorio público de GitHub Pages.
2. La implementación centralizó la resolución de activos y antepuso `/Conflictos_Mineros` únicamente en el build de GitHub Pages, conservando las rutas locales sin prefijo.
3. Las comparaciones conjuntas confirman la recuperación de la portada fotográfica, la introducción probatoria de Oro ilegal y la imagen territorial de Madre de Dios. El build estático contiene cero referencias multimedia sin prefijo.

final result: passed

## Cierre QA — identidad DrillStone

La integración detallada en “Integración de identidad DrillStone del 29 de julio de 2026” es la revisión visual más reciente. Las comparaciones de cabecera y pie, los viewports 1440, 900 y 390 px, la carga de L1/L3, la exclusión de RoadLab, el control de overflow y la consola sin errores permanecen conformes. No quedan hallazgos P0, P1 o P2.

final result: passed

## Actualización de portada del 29 de julio de 2026

- Fuente visual: `C:/Users/DeeDee/AppData/Local/Temp/codex-clipboard-8e13c946-54d3-4f9c-9681-60cd61f4a3c4.png`
- Implementación: `http://127.0.0.1:3110/`
- Captura escritorio: `C:/Users/DeeDee/AppData/Local/Temp/portada-dialogo-desktop.png`
- Captura móvil: `C:/Users/DeeDee/AppData/Local/Temp/portada-dialogo-mobile.png`
- Viewports: 1920 × 1080 y 390 × 844 CSS px, densidad 1×.
- Estado: portada cargada, navegación cerrada y sin interacción activa.

### Comparación visual

La fuente mostraba una composición jurídica y una toma aérea genérica. La implementación conserva la estructura, tipografía, espaciado, colores y contenido de la portada, pero sustituye el fondo por una sola escena centrada en diálogo territorial entre comunidad, empresa y autoridades. El degradado mantiene el contraste del titular y deja visibles los actores en el lado derecho.

No fue necesario un recorte focal adicional: el titular, los botones, las métricas, la imagen y la nota editorial se leen con claridad en la comparación completa. En móvil, el recorte mantiene contexto minero y presencia humana sin desbordamiento horizontal.

### Superficies de fidelidad

- Tipografía: familias, jerarquía, pesos, interlineado y quiebres conservados; sin truncamientos.
- Espaciado y ritmo: estructura original sin desplazamientos; métricas y acciones permanecen alineadas.
- Color: paleta y tokens existentes conservados; degradado reforzado solo para legibilidad sobre la nueva imagen.
- Imagen: derivado WebP 1920 × 1080, 232 KB, sin estiramiento ni pixelación visible.
- Contenido: sin cambios editoriales; se añadió la aclaración de que la imagen es referencial y generada con IA.

### Hallazgos

No quedan hallazgos P0, P1 o P2. Sin desbordamiento horizontal ni errores o advertencias en consola.

### Historial de comparación

- Primera comparación: la nueva imagen mejora la correspondencia temática y no introdujo diferencias P0/P1/P2, por lo que no fue necesaria una iteración correctiva.

### Pruebas de interacción

Los dos llamados principales permanecen presentes y accesibles; la validación DOM confirmó los enlaces a conflictos y metodología.

final result: passed
