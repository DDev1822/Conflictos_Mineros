import type { Metadata } from "next";
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/source-serif-4";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "Observatorio de Conflictos Mineros del Perú", template: "%s · Observatorio Minero" },
  description: "Base académica navegable de conflictos, normas, actores, territorios y alternativas de política pública.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
