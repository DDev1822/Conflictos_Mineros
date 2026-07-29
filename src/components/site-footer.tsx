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
        <span>Observatorio de Conflictos Mineros del Perú</span>
      </div>
      <p>Uso académico e informativo · no sustituye asesoría profesional ni decisiones de autoridad.</p>
      <p>Contenido propio: CC BY 4.0 · Código: MIT</p>
      <nav aria-label="Enlaces de pie">
        <Link href="/compromisos">Comparar compromisos</Link>
        <Link href="/metodologia#fuentes">Sobre las fuentes</Link>
        <Link href="/metodologia#correcciones">Correcciones</Link>
        <a href="https://github.com/DDev1822/Conflictos_Mineros">GitHub</a>
      </nav>
    </footer>
  );
}
