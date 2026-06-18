import type { ConflictCase } from "@/lib/schemas";

const labels: Record<ConflictCase["status"], string> = {
  active: "Activo",
  latent: "Latente",
  resolved: "Resuelto",
  historical: "Histórico",
};

export function StatusPill({ status }: { status: ConflictCase["status"] }) {
  return <span className={`status-pill status-${status}`}>{labels[status]}</span>;
}
