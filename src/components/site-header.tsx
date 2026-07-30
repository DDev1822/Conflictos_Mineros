"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Coins, GraduationCap, Info, List, MapTrifold, Scales, ShieldWarning, X } from "@phosphor-icons/react";
import { useState } from "react";
import { publicAsset } from "@/lib/public-assets";

const navigation = [
  { href: "/mapa", label: "Mapa", icon: MapTrifold },
  { href: "/explorar", label: "Relaciones", accessibleLabel: "Sistema de relaciones", icon: Scales },
  { href: "/conflictos", label: "Casos", icon: List },
  { href: "/reinfo", label: "REINFO", accessibleLabel: "REINFO y formalización MAPE", icon: Info },
  { href: "/oro-ilegal", label: "Oro ilegal", accessibleLabel: "Minería ilegal y cadena del oro", icon: Coins },
  { href: "/pataz", label: "Pataz", accessibleLabel: "Violencia y minería ilegal en Pataz", icon: ShieldWarning },
  { href: "/madre-de-dios", label: "Madre de Dios", accessibleLabel: "Minería aurífera en Madre de Dios", icon: MapTrifold },
  { href: "/biblioteca", label: "Biblioteca", accessibleLabel: "Biblioteca académica", icon: GraduationCap },
  { href: "/normativa", label: "Normas", icon: BookOpenText },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Ir al inicio">
        <span className="brand-mark" aria-hidden="true">
          <Image
            className="brand-mark-image"
            src={publicAsset("/brand/drillstone/drillstone-mark.png")}
            alt=""
            width={4000}
            height={4000}
            priority
          />
        </span>
        <span><strong>Observatorio</strong><small>de Conflictos Mineros del Perú</small></span>
      </Link>
      <button className="menu-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Cerrar navegación" : "Abrir navegación"}>
        {open ? <X size={24} /> : <List size={24} />}
      </button>
      <nav className={open ? "site-nav is-open" : "site-nav"} aria-label="Navegación principal">
        {navigation.map(({ href, label, accessibleLabel, icon: Icon }) => (
          <Link key={href} href={href} aria-label={accessibleLabel} className={pathname.startsWith(href) ? "active" : ""} onClick={() => setOpen(false)}>
            <Icon size={17} aria-hidden />{label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
