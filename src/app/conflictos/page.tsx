import type { Metadata } from "next";
import { CaseCatalog } from "@/components/case-catalog";
import { loadObservatoryData } from "@/lib/content";

export const metadata: Metadata = { title: "Expedientes de conflictos" };

export default function CasesPage() {
  const data = loadObservatoryData();
  return <div className="content-page"><header className="page-intro"><p className="eyebrow">Archivo académico</p><h1>Expedientes de conflictos</h1><p>Seis casos piloto para probar una metodología comparativa, histórica y trazable. La selección no pretende representar todavía todo el universo nacional.</p></header><CaseCatalog cases={data.cases} issues={data.issues} territories={data.territories} /></div>;
}
