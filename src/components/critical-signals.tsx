import { ArrowSquareOut } from "@phosphor-icons/react/dist/ssr";
import type { CriticalSignal, Source } from "@/lib/schemas";

type Props = {
  signals: CriticalSignal[];
  sources: Source[];
  compact?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00Z`));
}

export function CriticalSignals({ signals, sources, compact = false }: Props) {
  const sourceById = new Map(sources.map((source) => [source.id, source]));

  return (
    <div className={compact ? "critical-signal-grid is-compact" : "critical-signal-grid"}>
      {signals.map((signal) => (
        <article className="critical-signal-card" key={signal.id}>
          <time dateTime={signal.date}>{formatDate(signal.date)}</time>
          <h3>{signal.title}</h3>
          {signal.metrics.length > 0 && (
            <div className="critical-signal-metrics">
              {signal.metrics.map((metric) => (
                <span key={`${signal.id}-${metric.label}`}>
                  <strong>{metric.value}</strong>
                  <small>{metric.label}</small>
                </span>
              ))}
            </div>
          )}
          <p>{signal.summary}</p>
          <p className="critical-signal-analysis">{signal.analysis}</p>
          <div className="critical-signal-sources" aria-label={`Fuentes de ${signal.title}`}>
            {signal.sourceIds.map((sourceId) => {
              const source = sourceById.get(sourceId);
              if (!source) return null;
              return (
                <a href={source.url} key={source.id} target="_blank" rel="noreferrer">
                  {source.institution}
                  <ArrowSquareOut size={13} aria-hidden />
                </a>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
