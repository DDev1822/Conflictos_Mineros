import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "@fontsource-variable/source-sans-3";
import "@fontsource-variable/source-serif-4";
import "./globals.css";
import { ContactBand } from "@/components/contact-band";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { publicAsset } from "@/lib/public-assets";

export const metadata: Metadata = {
  metadataBase: new URL("https://ddev1822.github.io"),
  title: { default: "Observatorio de Conflictos Mineros del Perú", template: "%s · Observatorio Minero" },
  description: "Base académica navegable de conflictos, normas, actores, territorios y alternativas de política pública.",
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://ddev1822.github.io/Conflictos_Mineros/",
    siteName: "Observatorio Académico de Conflictos Mineros del Perú",
    title: "Conflictos mineros del Perú: análisis académico, territorial y relacional",
    description: "Base académica navegable de conflictos, normas, actores, territorios y alternativas de política pública.",
    images: [
      {
        url: "/Conflictos_Mineros/opengraph-image",
        width: 1200,
        height: 627,
        alt: "Observatorio Académico de Conflictos Mineros del Perú",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Observatorio de Conflictos Mineros del Perú",
    description: "Análisis académico, territorial y relacional de los conflictos mineros del Perú.",
    images: ["/Conflictos_Mineros/opengraph-image"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const assetStyles = {
    "--asset-portada-dialogo-territorial": `url("${publicAsset("/multimedia/backgrounds/portada-dialogo-territorial.webp")}")`,
    "--asset-oro-ilegal-hero": `url("${publicAsset("/multimedia/backgrounds/oro-ilegal-hero.webp")}")`,
    "--asset-textura-mineral-territorial": `url("${publicAsset("/multimedia/backgrounds/textura-mineral-territorial.webp")}")`,
  } as CSSProperties;

  return (
    <html lang="es" data-scroll-behavior="smooth" style={assetStyles}>
      <body>
        <a className="skip-link" href="#contenido">Saltar al contenido</a>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <ContactBand />
        <SiteFooter />
      </body>
    </html>
  );
}
