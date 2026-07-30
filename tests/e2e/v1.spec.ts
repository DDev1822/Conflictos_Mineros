import { expect, test } from "@playwright/test";

const caseSlugs = ["tambogrande", "conga", "tia-maria", "las-bambas", "espinar", "la-oroya", "cerro-quilish", "yanacocha-maxima-acuna", "toromocho-morococha", "choropampa", "fondo-social-michiquillay", "rio-blanco-majaz"];
const editorialPaths = ["/", "/conflictos", "/conflictos/rio-blanco-majaz", "/metodologia", "/normativa", "/biblioteca", "/reinfo", "/oro-ilegal", "/pataz", "/madre-de-dios"];

test.describe("publicación V2 en escritorio", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("mantiene la navegación académica enfocada sin overflow horizontal", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(nav.getByRole("link")).toHaveCount(9);
    await expect(nav.getByRole("link", { name: "Minería ilegal y cadena del oro" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Violencia y minería ilegal en Pataz" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Minería aurífera en Madre de Dios" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "REINFO y formalización MAPE" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Biblioteca académica" })).toBeVisible();
    for (const link of await nav.getByRole("link").all()) await expect(link).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("carga la capa visual editorial sin imágenes rotas", async ({ page }) => {
    const brokenMultimediaResponses: string[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/multimedia/") && response.status() >= 400) brokenMultimediaResponses.push(response.url());
    });

    for (const path of ["/", "/oro-ilegal", "/madre-de-dios"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const images = page.locator('img[src*="/multimedia/"]');
      expect(await images.count()).toBeGreaterThan(0);
      for (const image of await images.all()) await image.scrollIntoViewIfNeeded();
      await expect.poll(async () => images.evaluateAll((elements) => elements.every((image) => (
        image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0
      )))).toBe(true);
    }

    expect(brokenMultimediaResponses).toEqual([]);
  });

  test("integra la firma DrillStone sin publicar la variante RoadLab", async ({ page }) => {
    const brokenBrandResponses: string[] = [];
    page.on("response", (response) => {
      if (response.url().includes("/brand/drillstone/") && response.status() >= 400) brokenBrandResponses.push(response.url());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const mark = page.locator('.brand img[src*="drillstone-mark.png"]');
    const wordmark = page.locator('.site-footer img[src*="drillstone-wordmark.png"]');
    await expect(mark).toBeVisible();
    await wordmark.scrollIntoViewIfNeeded();
    await expect(wordmark).toBeVisible();
    await expect.poll(async () => mark.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
    await expect.poll(async () => wordmark.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
    const footer = await page.locator(".site-footer").boundingBox();
    const wordmarkBox = await page.locator(".site-footer-wordmark").boundingBox();
    expect(footer).not.toBeNull();
    expect(wordmarkBox).not.toBeNull();
    expect(Math.abs(((footer?.x ?? 0) + (footer?.width ?? 0) / 2) - ((wordmarkBox?.x ?? 0) + (wordmarkBox?.width ?? 0) / 2))).toBeLessThanOrEqual(2);
    expect(await page.locator('img[src*="roadlab" i]').count()).toBe(0);
    expect(brokenBrandResponses).toEqual([]);
  });

  test("organiza la portada en tres bloques de indicadores con sus fuentes", async ({ page }) => {
    await page.goto("/");
    const indicators = page.getByRole("region", { name: "Indicadores principales del observatorio" });
    await expect(indicators.locator(".hero-stat-block")).toHaveCount(3);
    await expect(indicators.locator('[data-topic="conflictos"]')).toContainText("61");
    await expect(indicators.locator('[data-topic="conflictos"]')).toContainText("50/11");
    await expect(indicators.locator('[data-topic="reinfo"]')).toContainText("24,669");
    await expect(indicators.locator('[data-topic="reinfo"]')).toContainText("2,4%");
    await expect(indicators.locator('[data-topic="madre-de-dios"]')).toContainText("135,939 ha");
    await expect(indicators.locator('[data-topic="madre-de-dios"]')).toContainText("≈ 190,400 canchas de fútbol");
    await expect(indicators.locator('[data-topic="madre-de-dios"]')).toContainText("2,06 ha/día");
    await expect(indicators.getByRole("link")).toHaveCount(6);
    await expect(indicators.getByRole("link", { name: /consultar dimensión de referencia de FIFA/ })).toHaveAttribute("href", /publications\.fifa\.com/);
    await expect(indicators.locator('[data-topic="madre-de-dios"] .hero-stat-links a')).toHaveCount(2);
    await expect(indicators.getByText("FIFA · cancha de 105 × 68 m", { exact: true })).toHaveCount(0);
    await expect(page.locator('.entry-grid a[href="/reinfo/"]')).toHaveCount(1);
    await expect(page.locator(".entry-grid > a")).toHaveCount(8);
  });

  test("mantiene visible la invitación a participar y sus tres vías de colaboración", async ({ page }) => {
    await page.goto("/");
    const participation = page.getByRole("region", { name: "¿Tienes datos, conoces un caso o quieres colaborar?" });
    await expect(participation).toBeVisible();
    await expect(participation.getByRole("heading", { name: "Compartir datos" })).toBeVisible();
    await expect(participation.getByRole("heading", { name: "Señalar un error" })).toBeVisible();
    await expect(participation.getByRole("heading", { name: "Sumarse al equipo" })).toBeVisible();
    await expect(participation.getByRole("link")).toHaveCount(3);
    await expect(participation.locator('a[href*="/issues/new"]')).toHaveCount(3);
  });

  test("abre el mapa con enfoque minero sin alternar al registro social completo", async ({ page }) => {
    await page.goto("/mapa");
    const summary = page.getByLabel("Resumen del mapa");
    await expect(summary.getByText("17", { exact: true })).toBeVisible();
    await expect(summary).toContainText("Mayor concentración: Puno · 10 casos");
    await expect(page.locator(".map-stage-context small")).toContainText("Distribución regional del corte minero");
    await expect(page.getByRole("heading", { name: "Conflictos sociales mineros en el Perú" })).toBeVisible();
    await expect(page.getByText("Todos sociales", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Ver mapa interactivo", { exact: true })).toHaveCount(0);
    expect(await page.locator(".map-layout > aside").evaluate((element) => getComputedStyle(element).overflowY)).not.toBe("auto");
  });

  test("evita repetir el corte nacional como tarjeta en relaciones y casos", async ({ page }) => {
    await page.goto("/explorar");
    const focusMetrics = page.getByRole("region", { name: "Métricas del foco activo" });
    await expect(focusMetrics).toContainText("129");
    await expect(focusMetrics).toContainText("59");
    await expect(focusMetrics).toContainText("6");
    await expect(focusMetrics.getByText("Corte minero", { exact: true })).toHaveCount(0);
    await expect(focusMetrics.getByText("Estado", { exact: true })).toHaveCount(0);

    await page.goto("/conflictos");
    const caseStats = page.getByRole("region", { name: "Panorama de conflictos" });
    await expect(caseStats).toContainText("12");
    await expect(caseStats).toContainText("129");
    await expect(caseStats).toContainText("59");
    await expect(caseStats).toContainText("6");
    await expect(caseStats.getByText("61", { exact: true })).toHaveCount(0);
    await expect(caseStats).toContainText("hallazgos comparables");
  });

  test("el zoom manual permanece activo y ofrece controles visibles", async ({ page }) => {
    await page.goto("/mapa");
    const map = page.getByRole("region", { name: "Mapa interactivo de conflictos sociales mineros y casos documentados" });
    const zoomStatus = map.getByRole("status");
    const zoomIn = map.getByRole("button", { name: "Acercar" });

    await expect(zoomIn).toBeVisible();
    await expect(map.getByRole("button", { name: "Alejar" })).toBeVisible();
    const initialZoom = Number((await zoomStatus.textContent())?.match(/\d+/)?.[0]);

    await zoomIn.click();
    await expect(zoomStatus).toHaveText(`Nivel de zoom: ${initialZoom + 1}`);
    await page.waitForTimeout(400);
    await expect(zoomStatus).toHaveText(`Nivel de zoom: ${initialZoom + 1}`);
  });

  test("el sistema de relaciones revela conexiones por capas progresivas", async ({ page }) => {
    await page.goto("/explorar");
    const graph = page.getByLabel("Relaciones de conocimiento");
    const graphNode = (id: string) => graph.locator(`.knowledge-node[data-id="${id}"]`);

    await expect(page.getByRole("combobox", { name: "Tema" })).toContainText("Formalización de la MAPE y REINFO");
    await expect(page.locator("main")).not.toContainText(/Expediente territorial|Locadores|Fuente canónica|Objetivo de búsqueda|Nivel probatorio/);

    await expect(graph.locator(".knowledge-node")).toHaveCount(3);
    await expect(graphNode("conflicto-social-minero")).toBeVisible();
    await expect(graphNode("reinfo")).toBeVisible();
    await expect(graphNode("mineria-ilegal-informal")).toBeVisible();
    await expect(graphNode("casos-hito")).toHaveCount(0);
    await expect(page.getByText("Las líneas conectan problemas, territorios, actores y controles; selecciona un nodo para explorar sus datos.")).toBeVisible();

    await graphNode("mineria-ilegal-informal").click();
    expect(await graph.locator(".knowledge-node").count()).toBeGreaterThan(3);
    await expect(graphNode("fiscalizacion")).toBeVisible();
    await expect(graphNode("trazabilidad-oro")).toBeVisible();
    await expect(page.locator(".focus-card").getByRole("heading", { name: "Minería ilegal e informal" })).toBeVisible();

    await graphNode("reinfo").click();
    await expect(page.locator(".focus-card").getByRole("heading", { name: "REINFO" })).toBeVisible();
    await expect(graphNode("conflicto-social-minero")).toBeVisible();
    await expect(graphNode("casos-hito")).toHaveCount(0);

    await graphNode("conflicto-social-minero").click();
    await expect(graphNode("casos-hito")).toBeVisible();
    await expect(graphNode("matriz-documental")).toBeVisible();
    await expect(graphNode("cajamarca-system")).toBeVisible();
    await expect(graphNode("reinfo")).toBeVisible();
    await expect(graphNode("trazabilidad-oro")).toBeVisible();
    await expect(graph.locator(".knowledge-node")).toHaveCount(12);

    await expect.poll(async () => graph.locator(".knowledge-node").evaluateAll((nodes) => {
      const paneRect = nodes[0]?.closest(".graph-pane")?.getBoundingClientRect();
      const principleRect = nodes[0]?.closest(".graph-pane")?.querySelector(".graph-principle")?.getBoundingClientRect();
      const rectangles = nodes.map((node) => {
        const rect = node.getBoundingClientRect();
        return {
          id: node.getAttribute("data-id") ?? "sin-id",
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
        };
      });
      const crowdedPairs: string[] = [];

      for (let index = 0; index < rectangles.length; index += 1) {
        for (let comparison = index + 1; comparison < rectangles.length; comparison += 1) {
          const current = rectangles[index];
          const next = rectangles[comparison];
          const horizontalGap = Math.max(current.left, next.left) - Math.min(current.right, next.right);
          const verticalGap = Math.max(current.top, next.top) - Math.min(current.bottom, next.bottom);

          if (horizontalGap < 8 && verticalGap < 8) crowdedPairs.push(`${current.id} / ${next.id}`);
        }
      }

      if (paneRect) {
        rectangles.forEach((rect) => {
          if (rect.bottom > paneRect.bottom || rect.top < paneRect.top) crowdedPairs.push(`${rect.id} / borde del lienzo`);
        });
      }

      if (principleRect) {
        rectangles.forEach((rect) => {
          const horizontalOverlap = Math.min(rect.right, principleRect.right) - Math.max(rect.left, principleRect.left);
          const verticalOverlap = Math.min(rect.bottom, principleRect.bottom) - Math.max(rect.top, principleRect.top);
          if (horizontalOverlap > 0 && verticalOverlap > 0) crowdedPairs.push(`${rect.id} / nota metodológica`);
        });
      }

      return crowdedPairs;
    })).toEqual([]);

    const graphLegibility = await graph.evaluate((pane) => {
      const rootBadgesOutside = Array.from(pane.querySelectorAll(".root-node .graph-label b")).filter((badge) => {
        const badgeRect = badge.getBoundingClientRect();
        const nodeRect = badge.closest(".root-node")?.getBoundingClientRect();
        return !nodeRect
          || badgeRect.left < nodeRect.left
          || badgeRect.right > nodeRect.right
          || badgeRect.top < nodeRect.top
          || badgeRect.bottom > nodeRect.bottom;
      }).length;
      const thinEdges = Array.from(pane.querySelectorAll(".react-flow__edge-path")).filter((path) => (
        Number.parseFloat(getComputedStyle(path).strokeWidth) < 2.4
      )).length;
      const edgeLabels = Array.from(pane.querySelectorAll(".react-flow__edge-text"));
      const edgeBackgrounds = Array.from(pane.querySelectorAll(".react-flow__edge-textbg"));
      const unprotectedLabels = edgeLabels.length !== edgeBackgrounds.length
        ? edgeLabels.length
        : edgeBackgrounds.filter((background) => {
          const style = getComputedStyle(background);
          return Number.parseFloat(style.fillOpacity) < 0.95
            || style.stroke === "none"
            || Number.parseFloat(style.strokeWidth) < 0.8;
        }).length;

      return { rootBadgesOutside, thinEdges, unprotectedLabels };
    });
    expect(graphLegibility).toEqual({ rootBadgesOutside: 0, thinEdges: 0, unprotectedLabels: 0 });
  });

  test("la cronología permite saltar por año desde el índice lateral", async ({ page }) => {
    await page.goto("/cronologia");
    const yearNav = page.getByRole("navigation", { name: "Saltar por año en la cronología" });

    await expect(yearNav.getByRole("link", { name: /1999/ })).toBeVisible();
    const lastYear = yearNav.getByRole("link", { name: /2026/ });
    await lastYear.scrollIntoViewIfNeeded();
    await expect(lastYear).toBeVisible();
    await lastYear.click();

    await expect(page).toHaveURL(/#timeline-year-2026/);
    await expect(page.locator("#timeline-year-2026")).toBeVisible();
  });

  test("metodología explica universos, clasificaciones y cálculos", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Conflictos mineros del Perú: análisis académico, territorial y relacional." })).toBeVisible();

    await page.goto("/metodologia");
    await expect(page.getByRole("heading", { name: "Qué cuenta cada dato, cómo se calcula y cuándo se actualiza." })).toBeVisible();
    await expect(page.locator("#universos")).toContainText("Los universos no se suman entre sí");
    await expect(page.locator("#clasificacion")).toContainText("Formal / informal / ilegal");
    await expect(page.locator("#calculos")).toContainText("inscripciones del departamento ÷ inscripciones nacionales × 100");
    await expect(page.locator("#actualizacion")).toContainText("Frecuencia de actualización");
    await expect(page.locator("main")).not.toContainText(/\bP[01]\b|matriz|locador|trazabilidad|aprobación/i);
  });

  for (const path of editorialPaths) {
    test(`explica el contenido sin jerga interna en ${path}`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);

      const main = page.locator("main");
      await expect(main).toBeVisible();
      await expect(main).not.toContainText(/locador|matriz|expediente canónico|\bP[01]\b|trazabilidad|aprobación|no prueba|no demuestra|límite probatorio/i);
    });
  }

  test("el mapa conserva todas las capas mineras y excluye solo el registro social no minero", async ({ page }) => {
    await page.goto("/mapa");
    await expect(page.getByText("Todos sociales", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Distribución regional de conflictos sociales vinculados con minería, con estado al corte y casos documentados para consulta.")).toBeVisible();

    const illegalGroup = page.locator("details.map-layer-details").filter({ hasText: "Minería ilegal e informal" });
    await illegalGroup.locator("summary").click();
    const illegal = page.getByRole("checkbox", { name: /Minería ilegal Menciones explícitas/ });
    const informal = page.getByRole("checkbox", { name: /Minería informal Menciones explícitas/ });
    await expect(illegal).not.toBeChecked();
    await expect(informal).not.toBeChecked();
    await illegal.check();
    await informal.check();
    await expect(page).toHaveURL(/illegal=1/);
    await expect(page).toHaveURL(/informal=1/);
    await expect(page.locator('[data-layer="illegal-mining"]')).toContainText("casos con mención explícita");
    await expect(page.locator('[data-layer="informal-mining"]')).toContainText("casos con mención explícita");

    const reinfo = page.getByRole("checkbox", { name: /Inscripciones REINFO/ });
    await expect(reinfo).not.toBeChecked();
    await reinfo.check();
    await expect(page).toHaveURL(/reinfo=1/);
    await expect(page.locator('[data-layer="reinfo"]')).toContainText("REINFO vigente");
    await expect(page.locator(".map-marker-reinfo").first()).toBeVisible();
    await expect(page.getByText("REINFO se muestra como registro administrativo agregado y no se suma al conteo de conflictos.")).toBeVisible();

    const territorialGroup = page.locator("details.map-layer-details").filter({ hasText: "Minería formal, exploración y concesiones" });
    await territorialGroup.locator("summary").click();
    const formal = page.getByRole("checkbox", { name: /Plantas de beneficio vigentes/ });
    const exploration = page.getByRole("checkbox", { name: /Exploración minera/ });
    const concessions = page.getByRole("checkbox", { name: /Concesiones mineras/ });
    await formal.check();
    await exploration.check();
    await concessions.check();
    await expect(page).toHaveURL(/formal=1/);
    await expect(page).toHaveURL(/exploration=1/);
    await expect(page).toHaveURL(/concessions=1/);
    await expect(page.locator('[data-layer="formal-mining"]')).toBeVisible();
    await expect(page.locator('[data-layer="exploration"]')).toBeVisible();
    await expect(page.locator('[data-layer="concessions"]')).toBeVisible();
  });

  test("Puno abre como diálogo, recibe foco, cierra con Escape y devuelve el foco", async ({ page }) => {
    await page.goto("/mapa");
    const regionSelect = page.getByLabel("Abrir registro por región");
    await regionSelect.selectOption("puno");
    await expect(page).toHaveURL(/region=puno/);
    const dialog = page.getByRole("dialog", { name: "Puno" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByPlaceholder("Buscar caso, lugar o tipo")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(regionSelect).toBeFocused();
    await expect(page).not.toHaveURL(/region=/);
  });

  test("las regiones disponibles abren su registro y los marcadores de casos tienen nombre único", async ({ page }) => {
    await page.goto("/mapa");
    const markerNames = await page.locator('.leaflet-marker-icon[title^="Abrir"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("title")));
    expect(markerNames.length).toBeGreaterThan(0);
    expect(new Set(markerNames).size).toBe(markerNames.length);

    const regionSelect = page.getByLabel("Abrir registro por región");
    const regionValues = await regionSelect.locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value).filter(Boolean));
    expect(regionValues).not.toContain("nacional");
    expect(regionValues).not.toContain("multiregional");
    const dialog = page.locator("dialog.map-case-drawer");
    for (const region of regionValues) {
      await regionSelect.selectOption(region);
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(regionSelect).toHaveValue("");
    }
  });

  test("los casos publicados muestran hechos, temas críticos, cronología y enlaces directos", async ({ page }) => {
    test.setTimeout(120_000);

    const minimumMilestones: Record<string, number> = {
      tambogrande: 8,
      conga: 5,
      "tia-maria": 5,
      "las-bambas": 8,
      espinar: 8,
      "la-oroya": 8,
      "cerro-quilish": 8,
      "yanacocha-maxima-acuna": 8,
      "toromocho-morococha": 8,
      choropampa: 8,
      "fondo-social-michiquillay": 8,
      "rio-blanco-majaz": 8,
    };

    for (const slug of caseSlugs) {
      await page.goto(`/conflictos/${slug}`);
      await expect(page.getByRole("heading", { name: "Hitos que modificaron el caso" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Temas críticos" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Datos, lecturas y alternativas" })).toBeVisible();
      const milestones = page.locator(".vertical-timeline > li");
      const milestoneCount = await milestones.count();
      expect(milestoneCount).toBeGreaterThanOrEqual(minimumMilestones[slug]);

      const academicSection = page.locator(".case-academic-readings");
      await expect(academicSection).toBeVisible();
      const academicCards = academicSection.locator(".case-academic-card");
      expect(await academicCards.count()).toBeGreaterThanOrEqual(2);
      const invalidAcademicLinks = await academicCards.locator("a").evaluateAll((links) => links.filter((link) => {
        const href = link.getAttribute("href");
        return !href || link.getAttribute("target") !== "_blank" || link.getAttribute("rel") !== "noreferrer";
      }).length);
      expect(invalidAcademicLinks).toBe(0);

      for (let index = 0; index < milestoneCount; index += 1) {
        const milestone = milestones.nth(index);
        const documentLinks = milestone.locator(".timeline-card-sources a");
        expect(await documentLinks.count()).toBeGreaterThan(0);
        const invalidLinks = await documentLinks.evaluateAll((links) => links.filter((link) => {
          const href = link.getAttribute("href");
          return !href || link.getAttribute("target") !== "_blank";
        }).length);
        expect(invalidLinks).toBe(0);
      }
    }
    await page.goto("/conflictos");
    await expect(page.getByRole("heading", { name: "Los casos cambian, pero varias fallas se repiten." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Filtra por estado, territorio o problema central." })).toBeVisible();
    await page.goto("/conflictos/tambogrande");
    await expect(page.getByRole("heading", { name: "Dos ciclos distintos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ciclo histórico: TG-1 / Manhattan Minerals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ciclo contemporáneo: El Algarrobo-TG-3 / Buenaventura" })).toBeVisible();
    await expect(page.locator("main")).not.toContainText(/trazabilidad|aprobación|no prueba|no demuestra|límite probatorio/i);

    await page.goto("/normativa");
    await expect(page.locator(".instrument-table article")).toHaveCount(8);
    await expect(page.getByRole("heading", { name: "Las normas cambian; los problemas de aplicación permanecen." })).toBeVisible();
    await expect(page.getByRole("link", { name: /Abrir texto oficial/ }).first()).toHaveAttribute("target", "_blank");
  });

  test("compara responsables, territorios y resultados de los compromisos", async ({ page }) => {
    await page.goto("/compromisos");
    await expect(page.getByRole("heading", { name: "Quién se comprometió, con qué territorio y qué ocurrió después." })).toBeVisible();
    await expect(page.locator(".commitment-table tbody tr")).toHaveCount(12);
    await expect(page.getByText("Avance parcial", { exact: true })).toHaveCount(7);
    await expect(page.getByText("Sin resultado público posterior", { exact: true })).toHaveCount(5);
    await expect(page.getByText("Resultado reportado", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("heading", { name: "Cuatro fallas se repiten entre casos." })).toBeVisible();
    await expect(page.getByText(/\bcumplido\b/i)).toHaveCount(0);
  });

  test("REINFO expone magnitud, concentración territorial y resultados", async ({ page }) => {
    const response = await page.goto("/reinfo");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "REINFO: un régimen transitorio que sigue abierto después de más de una década." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Inscribirse, permanecer y formalizarse son momentos distintos." })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Cinco departamentos reúnen/ })).toBeVisible();
    await expect(page.locator(".reinfo-data-stats").getByText("inscripciones vigentes", { exact: true })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(0);
  });

  test("Pataz expone la escalada de violencia y enlaza los datos oficiales", async ({ page }) => {
    const response = await page.goto("/pataz");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "El oro se convirtió en una disputa armada por territorio, mineral y rutas de salida." })).toBeVisible();
    await expect(page.getByText("13", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Abrir información del Ministerio del Interior" })).toHaveAttribute("target", "_blank");
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(0);
  });

  test("la biblioteca académica filtra tesis y conserva el enlace a la ficha original", async ({ page }) => {
    const response = await page.goto("/biblioteca");
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "Investigaciones para leer los conflictos mineros con más profundidad." })).toBeVisible();
    await expect(page.locator(".library-card")).toHaveCount(37);
    await expect(page.getByRole("status")).toHaveText("37 de 37 investigaciones");

    await page.getByLabel("Grado").selectOption("doctorado");
    await expect(page.locator(".library-card")).toHaveCount(4);
    await expect(page.getByRole("status")).toHaveText("4 de 37 investigaciones");

    await page.getByLabel("Grado").selectOption("all");
    await page.getByRole("combobox", { name: "Caso", exact: true }).selectOption("rio-blanco-majaz");
    await expect(page.locator(".library-card")).toHaveCount(2);
    await expect(page.getByRole("status")).toHaveText("2 de 37 investigaciones");
    await page.getByLabel("Disponibilidad").selectOption("restricted");
    await expect(page.locator(".library-card")).toHaveCount(1);
    await expect(page.locator(".library-card")).toContainText("Gobierno corporativo y responsabilidad social");
    await page.getByRole("button", { name: "Restablecer filtros" }).click();
    await expect(page.locator(".library-card")).toHaveCount(37);
    await expect(page.getByRole("button", { name: "Restablecer filtros" })).toHaveCount(0);

    await page.getByPlaceholder("Buscar por tema, caso, región, autor o universidad").fill("Morococha");
    const morocochaCards = page.locator(".library-card");
    await expect(morocochaCards).toHaveCount(3);
    await expect(morocochaCards.getByRole("link", { name: "Toromocho–Morococha" })).toHaveCount(3);
    const morocochaRecordLinks = morocochaCards.getByRole("link", { name: "Abrir ficha académica" });
    await expect(morocochaRecordLinks).toHaveCount(3);
    for (let index = 0; index < 3; index += 1) {
      await expect(morocochaRecordLinks.nth(index)).toHaveAttribute("target", "_blank");
    }

    await page.getByPlaceholder("Buscar por tema, caso, región, autor o universidad").fill("Quilish");
    const quilishCards = page.locator(".library-card");
    await expect(quilishCards).toHaveCount(2);
    await expect(quilishCards.getByRole("link", { name: "Cerro Quilish–Yanacocha" })).toHaveCount(2);
  });

  test("las páginas de minería ilegal y Madre de Dios son públicas e indexables", async ({ page }) => {
    const goldResponse = await page.goto("/oro-ilegal");
    expect(goldResponse?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "El oro ilegal funciona como una cadena, no como un punto aislado." })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(0);

    const madreResponse = await page.goto("/madre-de-dios");
    expect(madreResponse?.status()).toBe(200);
    await expect(page.getByRole("heading", { name: "La minería aurífera ya transformó más de 135 mil hectáreas de bosque." })).toBeVisible();
    await expect(page.locator('meta[name="robots"][content="noindex"]')).toHaveCount(0);
  });
});

test.describe("publicación V2 en tableta", () => {
  test.use({ viewport: { width: 900, height: 900 } });

  test("la ficha de caso cambia a una columna y el menú evita overflow horizontal", async ({ page }) => {
    await page.goto("/conflictos/rio-blanco-majaz");

    const menuButton = page.getByRole("button", { name: "Abrir navegación" });
    const navigation = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(menuButton).toBeVisible();
    await expect(navigation).toBeHidden();
    await expect(page.locator(".case-academic-card")).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    await menuButton.click();
    await expect(navigation).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});

test.describe("publicación V2 móvil", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("menú móvil funcional, panel sin scroll interno y sin overflow horizontal", async ({ page }) => {
    await page.goto("/mapa");
    const menuButton = page.getByRole("button", { name: "Abrir navegación" });
    await menuButton.click();
    await expect(page.getByRole("button", { name: "Cerrar navegación" })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(nav.getByRole("link")).toHaveCount(9);
    for (const link of await nav.getByRole("link").all()) await expect(link).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator(".map-layout > aside").evaluate((element) => getComputedStyle(element).overflowY)).not.toBe("auto");
    await page.getByRole("button", { name: "Cerrar navegación" }).click();
    const mapJump = page.getByRole("link", { name: "Ver mapa" });
    await expect(mapJump).toBeVisible();
    await mapJump.click();
    await expect(page.locator("#map-stage")).toBeInViewport();
  });

  test("la portada muestra la acción principal en el primer pliegue", async ({ page }) => {
    await page.goto("/");
    const primaryAction = page.getByRole("link", { name: "Explorar relaciones" });
    await expect(primaryAction).toBeVisible();
    const box = await primaryAction.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? 844) + (box?.height ?? 0)).toBeLessThanOrEqual(844);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("cronología móvil expone índice de años sin overflow horizontal", async ({ page }) => {
    await page.goto("/cronologia");
    await expect(page.getByRole("navigation", { name: "Saltar por año en la cronología" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("la comparación de compromisos se convierte en tarjetas sin overflow", async ({ page }) => {
    await page.goto("/compromisos");
    await expect(page.locator(".commitment-table tbody tr")).toHaveCount(12);
    await expect(page.locator(".commitment-table td").first()).toHaveAttribute("data-label", "Caso");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
