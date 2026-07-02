"use client";

import { useEffect, useMemo, useState } from "react";
import type { MadreDiosDevastation } from "@/lib/schemas";

type Props = {
  rate: MadreDiosDevastation["recentRate"];
};

const numberFormat = new Intl.NumberFormat("es-PE", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 1,
});

function projectedHectares(rate: Props["rate"]) {
  const start = new Date(rate.projectionStartAt).getTime();
  const elapsedHours = Math.max(0, (Date.now() - start) / 3_600_000);
  return rate.projectionBaseHectares + elapsedHours * rate.hectaresPerHour;
}

export function DeforestationCounter({ rate }: Props) {
  const [value, setValue] = useState(rate.projectionBaseHectares);
  const hectaresPerSecond = useMemo(() => rate.hectaresPerHour / 3600, [rate.hectaresPerHour]);
  const projectionStartLabel = useMemo(() => new Date(rate.projectionStartAt).toLocaleDateString("es-PE"), [rate.projectionStartAt]);

  useEffect(() => {
    setValue(projectedHectares(rate));
    const interval = window.setInterval(() => setValue(projectedHectares(rate)), 1000);
    return () => window.clearInterval(interval);
  }, [rate]);

  return (
    <div className="deforestation-counter" aria-live="off">
      <span>Contador “si nada cambia”</span>
      <strong>{numberFormat.format(value)} ha</strong>
      <small>
        +{hectaresPerSecond.toFixed(6)} ha/seg · +{rate.hectaresPerHour.toFixed(4)} ha/hora · proyección lineal desde {projectionStartLabel}
      </small>
    </div>
  );
}
