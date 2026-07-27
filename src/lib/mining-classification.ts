import type { ObservatoryData, SocialConflictCase } from "./schemas";

export type MiningMentionCategory = "ilegal" | "informal";

export function normalizeSearchText(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function mentionsMiningCategory(item: SocialConflictCase, category: MiningMentionCategory) {
  const text = normalizeSearchText(`${item.title} ${item.summary ?? ""} ${item.location ?? ""}`);
  const miningTerm = "(?:mineria|mineros?|actividad(?:es)?\\s+minera(?:s)?)";
  const categoryTerm = category === "ilegal" ? "ilegal(?:es)?" : "informal(?:es)?";
  return new RegExp(`\\b${miningTerm}\\b[^.;\\n]{0,60}\\b${categoryTerm}\\b|\\b${categoryTerm}\\b[^.;\\n]{0,60}\\b${miningTerm}\\b`).test(text);
}

export function getLatestPublicMiningCut(data: ObservatoryData) {
  const snapshot = data.socialConflictSnapshots
    .filter((item) => item.scope === "mining-public")
    .sort((a, b) => b.cutoffDate.localeCompare(a.cutoffDate))[0];
  const selection = snapshot
    ? data.miningConflictSelections.find((item) => item.snapshotId === snapshot.id)
    : undefined;
  const selectedIds = new Set(selection?.caseIds ?? []);
  const cases = data.socialConflictCases.filter((item) => selectedIds.has(item.id));
  return { snapshot, selection, cases };
}
