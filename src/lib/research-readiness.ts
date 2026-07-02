import type { ObservatoryData } from "./schemas";

const substantiveKinds = new Set(["event", "decision", "agreement", "evidence"]);

export type ResearchScorecard = ReturnType<typeof evaluateResearchReadiness>;

export function evaluateResearchReadiness(data: ObservatoryData) {
  const sourceById = new Map(data.sources.map((source) => [source.id, source]));
  const recordsByEntity = new Map<string, typeof data.evidenceRecords>();
  for (const record of data.evidenceRecords) {
    const records = recordsByEntity.get(record.entityId) ?? [];
    records.push(record);
    recordsByEntity.set(record.entityId, records);
  }

  const requiredEntities = [
    ...data.cases.flatMap((item) => item.timeline.filter((event) => substantiveKinds.has(event.kind)).map((event) => ({ id: event.id, sourceIds: event.sourceIds, label: `Hito ${event.id}` }))),
    ...data.cases.flatMap((item) => item.claims.filter((claim) => claim.kind === "fact").map((claim) => ({ id: claim.id, sourceIds: claim.sourceIds, label: `Hecho ${claim.id}` }))),
    ...data.instruments.map((item) => ({ id: item.id, sourceIds: item.sourceIds, label: `Norma ${item.id}` })),
  ];

  const directEvidenceMissing = requiredEntities.flatMap((entity) => {
    const valid = (recordsByEntity.get(entity.id) ?? []).some((record) => {
      const source = sourceById.get(record.sourceId);
      return record.reviewStatus === "reviewed"
        && record.locator.trim().length >= 3
        && source?.evidenceLevel === "primary"
        && entity.sourceIds.includes(record.sourceId);
    });
    return valid ? [] : [`${entity.label}: falta evidencia primaria directa revisada con locador`];
  });

  const milestoneIssues: string[] = [];
  const packetByCase = new Map(data.caseResearchPackets.map((packet) => [packet.caseId, packet]));
  for (const item of data.cases) {
    const packet = packetByCase.get(item.id);
    const substantive = item.timeline.filter((event) => substantiveKinds.has(event.kind)).length;
    if (!packet) milestoneIssues.push(`Caso ${item.id}: falta paquete de investigación`);
    else if (substantive < packet.substantiveMilestoneTarget) milestoneIssues.push(`Caso ${item.id}: ${substantive}/${packet.substantiveMilestoneTarget} hitos sustantivos`);
  }

  const perspectiveIssues = data.caseResearchPackets.flatMap((packet) => {
    const perspectives = new Set(packet.sourceIds.map((sourceId) => sourceById.get(sourceId)?.perspective).filter(Boolean));
    const hasDirectActor = packet.directActorSourceIds.some((sourceId) => packet.sourceIds.includes(sourceId) && sourceById.has(sourceId));
    return perspectives.size >= 3 && hasDirectActor ? [] : [`Caso ${packet.caseId}: cobertura de perspectivas insuficiente`];
  });

  const contradictionIssues = data.caseResearchPackets.flatMap((packet) => packet.contradictions.length > 0
    ? packet.contradictions.flatMap((item) => item.sourceIds.length >= 2 ? [] : [`Contradicción ${item.id}: sin contraste suficiente`])
    : [`Caso ${packet.caseId}: desacuerdos no registrados`]);

  const rightsIssues = data.evidenceRecords.flatMap((record) => sourceById.get(record.sourceId)?.rightsStatus === "unknown"
    ? [`Evidencia ${record.id}: fuente con derechos desconocidos`]
    : []);

  const normativePacketIssues = data.legalResearchPackets.flatMap((packet) => {
    const primary = sourceById.get(packet.primaryTextSourceId);
    if (packet.status !== "prepared") return [`Norma ${packet.instrumentId}: paquete documental incompleto`];
    if (primary?.evidenceLevel !== "primary") return [`Norma ${packet.instrumentId}: texto oficial primario no acreditado`];
    return [];
  });

  const duplicatePacketCases = data.caseResearchPackets.filter((packet, index, all) => all.findIndex((item) => item.caseId === packet.caseId) !== index);
  const duplicatePacketInstruments = data.legalResearchPackets.filter((packet, index, all) => all.findIndex((item) => item.instrumentId === packet.instrumentId) !== index);
  const structuralIssues = [
    ...(data.caseResearchPackets.length === data.cases.length ? [] : [`Paquetes de caso: ${data.caseResearchPackets.length}/${data.cases.length}`]),
    ...(data.legalResearchPackets.length === data.instruments.length ? [] : [`Paquetes normativos: ${data.legalResearchPackets.length}/${data.instruments.length}`]),
    ...duplicatePacketCases.map((packet) => `Paquete de caso duplicado: ${packet.caseId}`),
    ...duplicatePacketInstruments.map((packet) => `Paquete normativo duplicado: ${packet.instrumentId}`),
  ];

  const contextualOnlyClaims = data.cases.flatMap((item) => item.claims).filter((claim) => claim.sourceIds.every((sourceId) => sourceById.get(sourceId)?.evidenceLevel === "contextual"));
  const caseResearchReady = data.caseResearchPackets.filter((packet) => {
    const item = data.cases.find((candidate) => candidate.id === packet.caseId);
    const substantive = item?.timeline.filter((event) => substantiveKinds.has(event.kind)).length ?? 0;
    return packet.status === "ready" && packet.actorPositions.length >= 3 && packet.contradictions.length > 0 && substantive >= packet.substantiveMilestoneTarget;
  }).length;

  const declaredGaps = data.caseResearchPackets.flatMap((packet) => packet.gaps.filter((gap) => gap.blocksRelease).map((gap) => `Vacío ${packet.caseId}/${gap.id}: visible en publicación`));

  const issues = [
    ...structuralIssues,
    ...milestoneIssues,
    ...directEvidenceMissing,
    ...perspectiveIssues,
    ...contradictionIssues,
    ...rightsIssues,
    ...normativePacketIssues,
    ...contextualOnlyClaims.map((claim) => `Afirmación ${claim.id}: depende solo de fuentes contextuales`),
  ];

  return {
    ready: issues.length === 0,
    issues,
    notices: declaredGaps,
    metrics: {
      directEvidenceCoverage: requiredEntities.length === 0 ? 0 : (requiredEntities.length - directEvidenceMissing.length) / requiredEntities.length,
      directEvidenceCovered: requiredEntities.length - directEvidenceMissing.length,
      directEvidenceRequired: requiredEntities.length,
      casesMeetingMilestoneTarget: data.cases.length - milestoneIssues.length,
      caseResearchReady,
      normativePacketReady: data.legalResearchPackets.length - normativePacketIssues.length,
      perspectiveCoverage: data.caseResearchPackets.length - perspectiveIssues.length,
      unresolvedHiddenConflicts: contradictionIssues.length,
      contextualOnlyClaims: contextualOnlyClaims.length,
      rightsUnknownInUse: rightsIssues.length,
      declaredGaps: declaredGaps.length,
    },
  };
}
