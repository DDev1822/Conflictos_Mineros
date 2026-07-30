import Image from "next/image";
import Link from "next/link";
import { publicAsset } from "@/lib/public-assets";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-brand">
        <span className="site-footer-wordmark">
          <Image
            className="site-footer-wordmark-image"
            src={publicAsset("/brand/drillstone/drillstone-wordmark.png")}
            alt="DrillStone"
            width={4000}
            height={4000}
          />
        </span>
        <strong>Observatorio de Conflictos Mineros del Perú</strong>
        <p>Datos, análisis territorial y relaciones entre conflictos mineros del Perú.</p>
      </div>
      <nav aria-label="Enlaces de pie">
        <Link href="/cronologia">Cronología</Link>
        <Link href="/compromisos">Compromisos</Link>
        <Link href="/metodologia">Cómo se construyen los datos</Link>
        <a href="https://github.com/DDev1822/Conflictos_Mineros">GitHub</a>
      </nav>
      <p className="site-footer-license">Contenido propio: CC BY 4.0 · Código: MIT</p>
    </footer>
  );
}
