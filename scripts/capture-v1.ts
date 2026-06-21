import fs from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";

const baseUrl = process.env.PREVIEW_URL ?? "http://127.0.0.1:3000";
const outputDir = path.join(process.cwd(), "docs", "audits", "2026-06-20-v1-freeze");

async function capture(page: Page, route: string, name: string) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
  const readySelector = route === "/mapa/" ? ".map-layout"
    : route === "/explorar/" ? ".relationship-app"
      : route.startsWith("/conflictos/") ? ".dossier-page"
        : route === "/normativa/" ? ".content-page"
          : ".hero";
  await page.locator(readySelector).waitFor({ state: "visible", timeout: 30_000 });
  if (route === "/explorar/") await page.locator(".react-flow__node").first().waitFor({ state: "visible", timeout: 30_000 });
  if (route === "/mapa/") await page.locator(".leaflet-marker-icon").first().waitFor({ state: "visible", timeout: 30_000 });
  await page.screenshot({ path: path.join(outputDir, name), animations: "disabled" });
}

async function main() {
  await fs.mkdir(outputDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 1 });

  await capture(page, "/", "01-inicio-1440x1024.png");
  await capture(page, "/explorar/", "02-relaciones-1440x1024.png");
  await capture(page, "/mapa/", "03-mapa-1440x1024.png");
  await capture(page, "/conflictos/tambogrande/", "04-expediente-1440x1024.png");
  await capture(page, "/normativa/", "05-normativa-1440x1024.png");

  await page.setViewportSize({ width: 1280, height: 720 });
  await capture(page, "/mapa/", "06-mapa-1280x720.png");
  await page.getByLabel("Abrir registro por región").selectOption("puno");
  await page.getByRole("dialog", { name: "Puno" }).waitFor({ state: "visible" });
  await page.screenshot({ path: path.join(outputDir, "07-dialogo-puno-1280x720.png"), animations: "disabled" });

  await page.setViewportSize({ width: 390, height: 844 });
  await capture(page, "/mapa/", "08-mapa-390x844.png");
  await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.screenshot({ path: path.join(outputDir, "09-menu-390x844.png"), animations: "disabled" });

  await browser.close();
  console.log(`Capturas V1 guardadas en ${outputDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
