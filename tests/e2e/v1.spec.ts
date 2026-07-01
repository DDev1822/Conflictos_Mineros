import { expect, test } from "@playwright/test";

const caseSlugs = ["tambogrande", "conga", "tia-maria", "las-bambas", "espinar", "madre-de-dios"];

test.describe("cierre V1 en escritorio", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("mantiene la navegación completa sin overflow horizontal", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(nav.getByRole("link")).toHaveCount(8);
    for (const link of await nav.getByRole("link").all()) await expect(link).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("abre en 64 conflictos mineros y cambia explícitamente a 190 sociales", async ({ page }) => {
    await page.goto("/mapa");
    await expect(page.getByLabel("Resumen del corte documental").getByText("64", { exact: true })).toBeVisible();
    await page.getByText("Todos sociales", { exact: true }).click();
    await expect(page.getByLabel("Resumen del corte documental").getByText("190", { exact: true })).toBeVisible();
  });

  test("mantiene minería ilegal e informal separadas con solapamiento declarado", async ({ page }) => {
    await page.goto("/mapa");
    await page.getByText("Minería ilegal, informal y REINFO", { exact: true }).click();
    await page.getByRole("checkbox", { name: /Minería ilegal/ }).check();
    await page.getByRole("checkbox", { name: /Minería informal/ }).check();
    await expect(page.locator('[data-layer="illegal-mining"]')).toContainText("7 casos con mención explícita");
    await expect(page.locator('[data-layer="informal-mining"]')).toContainText("5 casos con mención explícita");
    await expect(page.locator('[data-layer="illegal-mining"]')).toContainText("2 casos también mencionan minería informal");
  });

  test("Puno abre como diálogo, recibe foco, cierra con Escape y devuelve el foco", async ({ page }) => {
    await page.goto("/mapa");
    const regionSelect = page.getByLabel("Abrir registro por región");
    await regionSelect.selectOption("puno");
    const dialog = page.getByRole("dialog", { name: "Puno" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByPlaceholder("Buscar caso, lugar o tipo")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(regionSelect).toBeFocused();
  });

  test("todos los ámbitos abren registro y los seis marcadores tienen nombre único", async ({ page }) => {
    await page.goto("/mapa");
    const markerNames = await page.locator('.leaflet-marker-icon[alt^="Abrir expediente"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("alt")));
    expect(markerNames).toHaveLength(6);
    expect(new Set(markerNames).size).toBe(6);

    const regionSelect = page.getByLabel("Abrir registro por región");
    const regionValues = await regionSelect.locator("option").evaluateAll((options) => options.map((option) => (option as HTMLOptionElement).value).filter(Boolean));
    const dialog = page.locator("dialog.map-case-drawer");
    for (const region of regionValues) {
      await regionSelect.selectOption(region);
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(regionSelect).toHaveValue("");
    }
    for (const scope of ["Nacional", "Multirregional"]) {
      await page.getByRole("button", { name: new RegExp(`^${scope}`) }).click();
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
    }
  });

  test("los seis expedientes renderizan su cronología ampliada y la normativa expone estado real", async ({ page }) => {
    const minimumMilestones: Record<string, number> = {
      tambogrande: 5,
      conga: 5,
      "tia-maria": 5,
      "las-bambas": 8,
      espinar: 8,
      "madre-de-dios": 8,
    };
    for (const slug of caseSlugs) {
      await page.goto(`/conflictos/${slug}`);
      expect(await page.locator(".vertical-timeline > li").count()).toBeGreaterThanOrEqual(minimumMilestones[slug]);
    }
    await page.goto("/normativa");
    await expect(page.locator(".instrument-table article")).toHaveCount(8);
    await expect(page.locator('.review-chip[data-status="pending"]')).toHaveCount(8);
    await expect(page.locator(".review-chip").first()).toContainText("Texto oficial y alcance documental");
  });
});

test.describe("cierre V1 móvil", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("menú móvil funcional, panel sin scroll interno y sin overflow horizontal", async ({ page }) => {
    await page.goto("/mapa");
    await page.getByRole("button", { name: "Abrir navegación" }).click();
    const nav = page.getByRole("navigation", { name: "Navegación principal" });
    await expect(nav.getByRole("link")).toHaveCount(8);
    for (const link of await nav.getByRole("link").all()) await expect(link).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    expect(await page.locator(".map-layout > aside").evaluate((element) => getComputedStyle(element).overflowY)).not.toBe("auto");
  });
});
