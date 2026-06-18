import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Observatorio de Conflictos Mineros del Perú</p>
      <p>Contenido propio: CC BY 4.0 · Código: MIT</p>
      <nav aria-label="Enlaces de pie">
        <Link href="/metodologia#fuentes">Sobre las fuentes</Link>
        <Link href="/metodologia#correcciones">Correcciones</Link>
        <a href="https://github.com/DDev1822/Conflictos_Mineros">GitHub</a>
      </nav>
    </footer>
  );
}
