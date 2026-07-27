import type { ConflictCase } from "@/lib/schemas";

const publishedSocialMiningCaseIds = new Set([
  "tambogrande",
  "conga",
  "tia-maria",
  "las-bambas",
  "espinar",
  "cerro-quilish",
  "yanacocha-maxima-acuna",
  "fondo-social-michiquillay",
  "rio-blanco-majaz",
  "la-oroya",
  "toromocho-morococha",
  "choropampa",
]);

export function isPublishedSocialMiningCase(item: Pick<ConflictCase, "id">) {
  return publishedSocialMiningCaseIds.has(item.id);
}
