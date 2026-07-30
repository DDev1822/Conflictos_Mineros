"use client";

import { useMemo, useState } from "react";
import type { ReinfoTerritorialSnapshot } from "@/lib/schemas";

type Region = ReinfoTerritorialSnapshot["regions"][number];

type Props = {
  regions: Region[];
  total: number;
};

const numberFormatter = new Intl.NumberFormat("es-PE");
const percentFormatter = new Intl.NumberFormat("es-PE", {
  style: "percent",
  maximumFractionDigits: 1,
});

export function ReinfoRegionalExplorer({ regions, total }: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"count" | "name">("count");
  const [showAll, setShowAll] = useState(false);

  const visibleRegions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("es");
    const filtered = regions.filter((region) => region.count > 0 && region.name.toLocaleLowerCase("es").includes(normalized));
    const sorted = [...filtered].sort((a, b) => (
      sort === "count"
        ? b.count - a.count || a.name.localeCompare(b.name, "es")
        : a.name.localeCompare(b.name, "es")
    ));
    return showAll || normalized ? sorted : sorted.slice(0, 10);
  }, [query, regions, showAll, sort]);

  const maximum = Math.max(...regions.map((region) => region.count), 1);

  return (
    <section className="reinfo-regional-explorer" aria-labelledby="reinfo-regional-heading">
      <div className="section-heading">
        <p className="eyebrow">Distribución departamental</p>
        <h2 id="reinfo-regional-heading">Dónde se concentra el REINFO vigente</h2>
        <p>
          Busca un departamento, ordena la lista o abre el conjunto completo. La barra compara inscripciones vigentes
          dentro del corte nacional.
        </p>
      </div>

      <div className="reinfo-explorer-controls">
        <label>
          Buscar departamento
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Ej. Puno, Arequipa o Madre de Dios"
          />
        </label>
        <label>
          Ordenar
          <select value={sort} onChange={(event) => setSort(event.target.value as "count" | "name")}>
            <option value="count">Mayor número</option>
            <option value="name">Nombre</option>
          </select>
        </label>
      </div>

      <ol className="reinfo-region-bars">
        {visibleRegions.map((region) => (
          <li key={region.id}>
            <div>
              <strong>{region.name}</strong>
              <span>{numberFormatter.format(region.count)}</span>
              <small>{percentFormatter.format(region.count / total)} del total</small>
            </div>
            <span className="reinfo-bar-track" aria-hidden>
              <i style={{ width: `${(region.count / maximum) * 100}%` }} />
            </span>
          </li>
        ))}
      </ol>

      {!query && regions.filter((region) => region.count > 0).length > 10 && (
        <button type="button" onClick={() => setShowAll((value) => !value)}>
          {showAll ? "Mostrar los diez principales" : "Mostrar todos los departamentos"}
        </button>
      )}
    </section>
  );
}
