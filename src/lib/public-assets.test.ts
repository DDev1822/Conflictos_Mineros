import { describe, expect, it } from "vitest";
import { publicAsset } from "./public-assets";

describe("publicAsset", () => {
  it("mantiene las rutas locales sin prefijo", () => {
    expect(publicAsset("/multimedia/maps/territorio-minero.webp", "")).toBe("/multimedia/maps/territorio-minero.webp");
  });

  it("antepone el subdirectorio de GitHub Pages", () => {
    expect(publicAsset("/multimedia/maps/territorio-minero.webp", "/Conflictos_Mineros")).toBe(
      "/Conflictos_Mineros/multimedia/maps/territorio-minero.webp",
    );
  });

  it("evita duplicar un prefijo ya presente", () => {
    expect(publicAsset("/Conflictos_Mineros/multimedia/maps/territorio-minero.webp", "/Conflictos_Mineros")).toBe(
      "/Conflictos_Mineros/multimedia/maps/territorio-minero.webp",
    );
  });
});
