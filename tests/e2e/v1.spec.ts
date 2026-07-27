import { expect, test } from "@playwright/test";

const caseSlugs = ["tambogrande", "conga", "tia-maria", "las-bambas", "espinar", "la-oroya", "cerro-quilish", "yanacocha-maxima-acuna", "toromocho-morococha", "choropampa", "fondo-social-michiquillay", "rio-blanco-majaz"];

test.describe("publicación V2 en escritorio", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("mantiene la navegación académica enfocada sin overflow horizontal", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(nav.getByRole("link")).toHaveCount(6);
    await expect(nav).not.toContainText(/Oro ilegal|Madre de Dios|REINFO/);
    for (const link of await nav.getByRole("link").all()) await expect(link).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("abre el mapa con enfoque minero sin alternar al registro social completo", async ({ page }) => {
    await page.goto("/mapa");
    await expect(page.getByLabel("Resumen del corte documental").getByText("61", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Conflictos sociales mineros en el Perú" })).toBeVisible();
    await expect(page.getByText("Todos sociales", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Ver mapa interactivo", { exact: true })).toHaveCount(0);
    expect(await page.locator(".map-layout > aside").evaluate((element) => getComputedStyle(element).overflowY)).not.toBe("auto");
  });

  test("el sistema de relaciones revela conexiones por capas progresivas", async ({ page }) => {
    await page.goto("/explorar");
    const graph = page.getByLabel("Relaciones de conocimiento");
    const graphNode = (label: string) => graph.locator(".knowledge-node").filter({ hasText: label });

    await expect(page.getByRole("combobox", { name: "Tema" })).not.toContainText(/REINFO|formalización minera|minería ilegal/i);
    await expect(page.locator("main")).not.toContainText(/Expediente territorial|Locadores|Fuente canónica|Objetivo de búsqueda|Nivel probatorio/);

    await expect(graph.locator(".knowledge-node")).toHaveCount(1);
    await expect(graphNode("Conflicto social minero")).toBeVisible();
    await expect(graphNode("Minería ilegal e informal")).toHaveCount(0);
    await expect(graphNode("Casos hito")).toHaveCount(0);

    await graphNode("Conflicto social minero").click();
    await expect(graph.locator(".knowledge-node")).toHaveCount(8);
    await expect(graphNode("Casos hito")).toBeVisible();
    await expect(graphNode("Sustento documental")).toBeVisible();
    await expect(graphNode("Conflictos en Cajamarca")).toBeVisible();
    await expect(graphNode("REINFO")).toHaveCount(0);
    await expect(graphNode("Trazabilidad del oro")).toHaveCount(0);
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

  test("metodología expone alcance y evidencia sin lenguaje de publicación interna", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Conflictos sociales mineros · evidencia trazable")).toBeVisible();

    await page.goto("/metodologia");
    const status = page.locator("#publicacion");
    await expect(status.getByRole("heading", { name: "Cómo se comprueba una afirmación" })).toBeVisible();
    await expect(status).toContainText("Cada afirmación sensible se presenta con fuente");
    await expect(status).toContainText("Evidencia disponible para contraste documental");
    await expect(status).toContainText("Alcance académico");
    await expect(status).toContainText("límites documentales declarados");
    await expect(status).not.toContainText("V1");
    await expect(status).not.toContainText(/P0|P1|matriz|locador/i);
    await expect(status).not.toContainText("Vacío");
  });

  test("portada, casos y normativa explican el contenido sin jerga interna", async ({ page }) => {
    for (const path of ["/", "/conflictos", "/conflictos/rio-blanco-majaz", "/metodologia", "/normativa"]) {
      await page.goto(path);
      await expect(page.locator("main")).not.toContainText(/locador|matriz|expediente canónico|repositorio|P0|P1/i);
    }
  });

  test("el mapa no expone capas ajenas a conflictos sociales mineros", async ({ page }) => {
    await page.goto("/mapa");
    await expect(page.getByText("Minería ilegal, informal y REINFO", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("checkbox", { name: /Minería ilegal|Minería informal|REINFO|Plantas de beneficio|Exploración minera|Concesiones mineras/ })).toHaveCount(0);
    await expect(page.getByText("Distribución regional de conflictos sociales vinculados con minería, con estado al corte y casos documentados para consulta.")).toBeVisible();
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

  test("los casos publicados muestran su cronología, documentos por hito y estado normativo", async ({ page }) => {
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
      const milestones = page.locator(".vertical-timeline > li");
      const milestoneCount = await milestones.count();
      expect(milestoneCount).toBeGreaterThanOrEqual(minimumMilestones[slug]);

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
    await expect(page.getByText("Preguntas de contraste").first()).toBeVisible();
    await expect(page.getByText(/Vacíos visibles|Vacíos bloqueantes/)).toHaveCount(0);
    await page.goto("/conflictos/tambogrande");
    await expect(page.getByText("Límite probatorio").first()).toBeVisible();
    await expect(page.getByRole("heading", { name: "Dos ciclos distintos" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ciclo histórico: TG-1 / Manhattan Minerals" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ciclo contemporáneo: El Algarrobo-TG-3 / Buenaventura" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Lo que las fuentes todavía no demuestran" })).toBeVisible();
    await expect(page.getByText(/Vacíos visibles|Vacíos bloqueantes/)).toHaveCount(0);

    await page.goto("/normativa");
    await expect(page.locator(".instrument-table article")).toHaveCount(8);
    await expect(page.locator('.review-chip[data-status="source-reviewed"]')).toHaveCount(8);
    await expect(page.locator(".review-chip").first()).toContainText("Fuente oficial y pregunta de aplicación");
  });

  test("compara compromisos sin presentar acuerdos como cumplimiento integral", async ({ page }) => {
    await page.goto("/compromisos");
    await expect(page.getByRole("heading", { name: "Compromisos: documento, seguimiento y evidencia no son lo mismo." })).toBeVisible();
    await expect(page.locator(".commitment-table tbody tr")).toHaveCount(12);
    await expect(page.getByText("Condición documentada", { exact: true })).toHaveCount(2);
    await expect(page.getByText("Seguimiento documentado", { exact: true })).toHaveCount(5);
    await expect(page.getByText("Resultado puntual documentado", { exact: true })).toBeVisible();
    await expect(page.getByText("Ejecución no localizada", { exact: true })).toHaveCount(5);
    await expect(page.getByRole("heading", { name: "La ausencia de una fila también es información." })).toBeVisible();
    await expect(page.getByText(/Conga, Tía María, La Oroya–Doe Run y Máxima Acuña–Yanacocha no presentan todavía/)).toBeVisible();
    await expect(page.getByText(/\bcumplido\b/i)).toHaveCount(0);
  });

  test("las rutas fuera del alcance público responden 404", async ({ page }) => {
    for (const path of ["/madre-de-dios", "/oro-ilegal", "/reinfo"]) {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    }
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
    await expect(nav.getByRole("link")).toHaveCount(6);
    for (const link of await nav.getByRole("link").all()) await expect(link).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator(".map-layout > aside").evaluate((element) => getComputedStyle(element).overflowY)).not.toBe("auto");
    const mapJump = page.getByRole("link", { name: "Ver mapa" });
    await expect(mapJump).toBeVisible();
    await mapJump.click();
    await expect(page.locator("#map-stage")).toBeInViewport();
  });

  test("la portada muestra la acción principal en el primer pliegue", async ({ page }) => {
    await page.goto("/");
    const primaryAction = page.getByRole("link", { name: "Explorar conflictos" });
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
    await expect(page.locator(".commitment-table td").first()).toHaveAttribute("data-label", "Caso e hito");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
