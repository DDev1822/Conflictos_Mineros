"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, ClockCounterClockwise, Coins, GraduationCap, Info, List, MapTrifold, Mountains, Scales, X } from "@phosphor-icons/react";
import { useState } from "react";

const navigation = [
  { href: "/mapa", label: "Mapa", icon: MapTrifold },
  { href: "/explorar", label: "Relaciones", accessibleLabel: "Sistema de relaciones", icon: Scales },
  { href: "/cronologia", label: "Cronología", icon: ClockCounterClockwise },
  { href: "/conflictos", label: "Casos", icon: List },
  { href: "/oro-ilegal", label: "Oro ilegal", accessibleLabel: "Minería ilegal y trazabilidad del oro", icon: Coins },
  { href: "/madre-de-dios", label: "Madre de Dios", accessibleLabel: "Minería aurífera en Madre de Dios", icon: MapTrifold },
  { href: "/reinfo", label: "REINFO", accessibleLabel: "REINFO y formalización MAPE", icon: Info },
  { href: "/normativa", label: "Normas", icon: BookOpenText },
  { href: "/biblioteca", label: "Biblioteca", accessibleLabel: "Biblioteca académica", icon: GraduationCap },
  { href: "/metodologia", label: "Metodología", icon: BookOpenText },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Ir al inicio">
        <Mountains aria-hidden size={31} weight="thin" />
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
