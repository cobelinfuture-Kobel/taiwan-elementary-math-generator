import fs from 'node:fs';
import path from 'node:path';

import { loadPOSTGAPPMasterController } from './postg-app-master-controller.mjs';
import {
  materializeW02HiddenPatternSpecs,
  validateW02HiddenPatternSpecs
} from './w02-hidden-pattern-specs.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w02-atomic-context-binding-policy.json';
const PACK_INDEX_PATH = 'data/curriculum/application/assessment/w02-atomic-context-single-application-candidate-pack-index.json';
const M01_AUTHORITY_PATH = 'data/curriculum/context/registry/global-context-authority-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;
const countBy = (rows, selector) => rows.reduce((counts, row) => {
  const key = selector(row);
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function normalizeCorpus(parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ').toLowerCase();
}

function safeId(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeDuplicatePatternSpecId(patternSpecId) {
  return patternSpecId
    .replace(/^ps_g4a_u06_/, 'ps_duplicate_')
    .replace(/^ps_g4b_u03_/, 'ps_duplicate_');
}

function buildContextIndexes(authority) {
  const macros = new Map(authority.hierarchy.macroDomains.map((row) => [row.nodeId, row]));
  const mesos = new Map(authority.hierarchy.mesoSituationFamilies.map((row) => [row.nodeId, row]));
  const micros = new Map(authority.hierarchy.microEventScenarios.map((row) => [row.nodeId, row]));
  const episodes = new Map(authority.hierarchy.atomicTaskEpisodes.map((row) => [row.nodeId, row]));
  const generatedSurfaces = new Map(authority.surfaceRealizations.map((row) => [row.templateId, row]));
  const legacySurfaces = new Map();
  for (const family of authority.legacyRegistry.contextFamilies ?? []) {
    for (const template of family.surfaceTemplates ?? []) {
      legacySurfaces.set(template.templateId, { ...template, contextFamilyId: family.contextFamilyId });
    }
  }
  const episodeChains = new Map();
  for (const episode of episodes.values()) {
    const micro = micros.get(episode.parentNodeId);
    const meso = micro ? mesos.get(micro.parentNodeId) : null;
    const macro = meso ? macros.get(meso.parentNodeId) : null;
    episodeChains.set(episode.nodeId, { macro, meso, micro, episode });
  }
  return { macros, mesos, micros, episodes, generatedSurfaces, legacySurfaces, episodeChains };
}

function buildApplicationPatternRows({ root, hidden }) {
  const rows = [];
  for (const record of [...hidden.records].sort((left, right) => left.actual.queueOrdinal - right.actual.queueOrdinal)) {
    const registry = record.actual;
    const operationRegistry = readJson(root, registry.canonicalOperationAuthority.path);
    const operationByKp = new Map(operationRegistry.knowledgePoints.map((kp) => [kp.knowledgePointId, kp]));
    for (const kp of registry.knowledgePoints) {
      const operationKp = operationByKp.get(kp.knowledgePointId);
      const operationModel = operationKp?.operationModels?.find((model) => model.modelId === kp.operationModelId);
      for (const patternSpec of kp.patternSpecs.filter((spec) => spec.mode === 'APPLICATION')) {
        rows.push({
          sourceId: registry.sourceNodeId,
          sourceNodeRefs: [registry.sourceNodeId],
          sourceTitle: registry.sourceTitle,
          domainFamily: registry.domainFamily,
          outputPath: record.outputPath,
          canonicalOperationAuthorityPath: registry.canonicalOperationAuthority.path,
          sourceContentIdentityGroup: operationRegistry.sourceEvidence.contentIdentityGroup,
          knowledgePoint: operationKp,
          patternKnowledgePoint: kp,
          operationModel,
          patternSpec,
          classification: kp.applicationClassification
        });
      }
    }
  }
  return rows;
}

function semanticAffinityScore({ corpus, macroContextId, policy }) {
  return (policy.macroKeywordAffinity[macroContextId] ?? [])
    .reduce((score, token) => score + (corpus.includes(String(token).toLowerCase()) ? 1 : 0), 0);
}

function selectSurface(chain, contextIndexes) {
  const generated = [...contextIndexes.generatedSurfaces.values()]
    .filter((surface) => surface.atomicEpisodeId === chain.episode.nodeId)
    .sort((left, right) => left.templateId.localeCompare(right.templateId));
  if (generated.length > 0) return generated[0];
  for (const templateId of chain.episode.surfaceTemplateRefs ?? []) {
    const surface = contextIndexes.generatedSurfaces.get(templateId) ?? contextIndexes.legacySurfaces.get(templateId);
    if (surface) return surface;
  }
  return null;
}

function selectBalancedEpisode({ row, contextIndexes, policy, unitMacroUsage, globalMacroUsage }) {
  const eligible = [...contextIndexes.episodeChains.values()]
    .filter((chain) => chain?.macro && chain?.meso && chain?.micro && chain?.episode)
    .filter((chain) => Boolean(selectSurface(chain, contextIndexes)));
  const preferred = eligible.filter((chain) => chain.episode.nodeId.endsWith(policy.preferredEpisodeProfile));
  const candidatePool = preferred.length > 0 ? preferred : eligible;
  const corpus = normalizeCorpus([
    row.sourceId,
    row.sourceTitle,
    row.domainFamily,
    row.knowledgePoint?.knowledgePointName,
    row.knowledgePoint?.scope,
    row.operationModel?.operationFamilyId,
    row.operationModel?.canonicalExpressions,
    Object.values(row.operationModel?.operandRoles ?? {}),
    row.operationModel?.answerType,
    row.patternSpec.requestedUnknownRole
  ]);
  const ranked = candidatePool.map((chain) => ({
    chain,
    unitUsage: unitMacroUsage.get(chain.macro.nodeId) ?? 0,
    globalUsage: globalMacroUsage.get(chain.macro.nodeId) ?? 0,
    affinity: semanticAffinityScore({ corpus, macroContextId: chain.macro.nodeId, policy })
  })).sort((left, right) => (
    left.unitUsage - right.unitUsage
    || left.globalUsage - right.globalUsage
    || right.affinity - left.affinity
    || left.chain.episode.nodeId.localeCompare(right.chain.episode.nodeId)
  ));
  return {
    chain: ranked[0]?.chain ?? null,
    preferredProfileSatisfied: preferred.length > 0
  };
}

function inferUnitCandidate(semanticMeaning, policy) {
  const corpus = String(semanticMeaning ?? '');
  for (const rule of policy.unitInferenceRules) {
    if (rule.tokens.some((token) => corpus.includes(token))) return rule.unit;
  }
  return policy.unresolvedUnitToken;
}

function answerShape(operationModel, policy) {
  const corpus = normalizeCorpus([
    operationModel?.answerType,
    operationModel?.unknownRoles,
    operationModel?.modelId
  ]);
  for (const rule of policy.answerShapeRules) {
    if (rule.tokens.some((token) => corpus.includes(token))) return rule.answerShape;
  }
  return policy.fallbackAnswerShape;
}

function buildCandidate({ row, selection, surface, policy, duplicateProjectionPreserved }) {
  const { chain, preferredProfileSatisfied } = selection;
  const patternSpec = row.patternSpec;
  const operationModel = row.operationModel;
  const operandRoles = operationModel?.operandRoles ?? {};
  const targetRoleId = patternSpec.requestedUnknownRole;
  const givenRoleIds = patternSpec.givenRoles.filter((roleId) => roleId !== targetRoleId);
  const contextResources = chain.episode.resourceRoles?.length > 0
    ? chain.episode.resourceRoles
    : ['情境資源'];
  const roleBindingCandidates = givenRoleIds.map((mathRoleId, index) => {
    const mathSemanticMeaning = operandRoles[mathRoleId] ?? mathRoleId;
    const contextSemanticMeaning = contextResources[index % contextResources.length];
    return {
      mathRoleId,
      mathSemanticMeaning,
      contextRoleId: `context_resource_${index + 1}`,
      contextSemanticMeaning,
      unitCandidate: inferUnitCandidate(`${mathSemanticMeaning} ${contextSemanticMeaning}`, policy),
      isAnswerRole: false
    };
  });
  const targetMeaning = operandRoles[targetRoleId]
    ?? `${row.knowledgePoint?.knowledgePointName ?? row.patternKnowledgePoint.knowledgePointId}的${targetRoleId}答案`;
  const contextTargetMeaning = chain.episode.targetRoles?.[0] ?? '情境答案';
  const answerUnitCandidate = inferUnitCandidate(`${targetMeaning} ${contextTargetMeaning}`, policy);
  const unresolved = [
    ...roleBindingCandidates.map((binding) => binding.unitCandidate),
    answerUnitCandidate
  ].includes(policy.unresolvedUnitToken);
  const suffix = safeId(patternSpec.patternSpecId);
  const duplicateProjectionKey = `${row.sourceContentIdentityGroup}::${normalizeDuplicatePatternSpecId(patternSpec.patternSpecId)}`;
  const canonicalReconstruction = operationModel.canonicalExpressions.find((expression) => expression.includes(targetRoleId))
    ?? operationModel.canonicalExpressions[0];
  return {
    schemaVersion: 1,
    bindingCandidateId: `w02_bind_${suffix}`,
    itemCandidateId: `w02_item_${suffix}`,
    sourceId: row.sourceId,
    sourceNodeRefs: row.sourceNodeRefs,
    sourceContentIdentityGroup: row.sourceContentIdentityGroup,
    knowledgePointId: row.patternKnowledgePoint.knowledgePointId,
    canonicalOperationModelId: row.patternKnowledgePoint.operationModelId,
    patternSpecId: patternSpec.patternSpecId,
    requestedUnknownRole: targetRoleId,
    classification: row.classification,
    applicationMode: 'SINGLE_DIRECT',
    applicationCapabilityLevel: 'N',
    primaryTargetCount: 1,
    contextSelection: {
      macroContextId: chain.macro.nodeId,
      mesoSituationId: chain.meso.nodeId,
      microScenarioId: chain.micro.nodeId,
      atomicEpisodeId: chain.episode.nodeId,
      surfaceTemplateId: surface.templateId,
      facetRefs: chain.episode.facetRefs,
      selectionReason: duplicateProjectionPreserved
        ? 'DUPLICATE_CONTENT_PROJECTION'
        : 'BALANCED_MACRO_THEN_SEMANTIC_SCORE',
      preferredProfileSatisfied,
      duplicateProjectionPreserved
    },
    roleBindingCandidates,
    targetRoleCandidate: {
      mathRoleId: targetRoleId,
      sourceMathRoleIds: [targetRoleId],
      mathSemanticMeaning: targetMeaning,
      contextRoleId: 'context_target_1',
      contextSemanticMeaning: contextTargetMeaning,
      answerUnitCandidate,
      isAnswerRole: true
    },
    unitFlowCandidate: {
      inputRoleIds: roleBindingCandidates.map((binding) => binding.mathRoleId),
      inputUnitCandidates: roleBindingCandidates.map((binding) => binding.unitCandidate),
      answerRoleId: targetRoleId,
      answerUnitCandidate,
      canonicalRelations: operationModel.canonicalExpressions,
      resolutionStatus: unresolved ? 'SEMANTIC_REVIEW_REQUIRED' : 'CANDIDATE_RESOLVED'
    },
    promptBlueprint: {
      textZh: `${surface.textZh} 請依題目中的數量關係作答。`,
      requiredSurfaceSlots: surface.requiredSlots ?? [],
      mathFactSlots: [...new Set([...givenRoleIds, targetRoleId])],
      numberConstraints: operationModel.numberConstraints,
      fullyInstantiated: false
    },
    answerModelCandidate: {
      answerShape: answerShape(operationModel, policy),
      answerRole: targetRoleId,
      answerUnitCandidate,
      canonicalReconstruction,
      interpretationStatementCandidate: `答案代表${targetMeaning}，並須符合${chain.episode.eventGoal}的情境目標。`,
      numericAnswerInstantiated: false
    },
    validationCandidate: {
      operationInvariants: operationModel.validationInvariants,
      contextConstraints: chain.episode.constraintModel,
      requiredContextAffordances: chain.episode.requiredContextAffordances,
      providedContextAffordances: chain.episode.requiredContextAffordances,
      pendingChecks: [
        'FINAL_UNIT_FLOW_VALIDATION',
        'NUMERIC_FIXTURE_GENERATION',
        'UNIQUE_ANSWER_VALIDATION'
      ]
    },
    admissionStatus: policy.candidateStatus,
    productionAdmissionAllowed: false,
    lineage: {
      hiddenPatternSpecAuthorityPath: row.outputPath,
      canonicalOperationAuthorityPath: row.canonicalOperationAuthorityPath,
      w02A01DTaskId: 'POSTG-APP-W02-A01D_PatternSpecContractAndHiddenMaterialization',
      m01ContextAuthorityPath: M01_AUTHORITY_PATH,
      selectionPolicyPath: POLICY_PATH,
      duplicateProjectionKey
    }
  };
}

export function materializeW02AtomicContextSingleApplicationCandidatePack({ root = process.cwd() } = {}) {
  const hidden = materializeW02HiddenPatternSpecs({ root });
  const policy = readJson(root, POLICY_PATH);
  const packIndex = readJson(root, PACK_INDEX_PATH);
  const controller = loadPOSTGAPPMasterController({ root });
  const contextIndexes = buildContextIndexes(controller.contextAuthority);
  const applicationPatternRows = buildApplicationPatternRows({ root, hidden });
  const sourceIdsByContent = new Map();
  for (const row of applicationPatternRows) {
    if (!sourceIdsByContent.has(row.sourceContentIdentityGroup)) {
      sourceIdsByContent.set(row.sourceContentIdentityGroup, new Set());
    }
    sourceIdsByContent.get(row.sourceContentIdentityGroup).add(row.sourceId);
  }
  const duplicateProjectionCache = new Map();
  const globalMacroUsage = new Map();
  const unitMacroUsage = new Map();
  const candidates = [];

  for (const row of applicationPatternRows) {
    const perUnitUsage = unitMacroUsage.get(row.sourceId) ?? new Map();
    const duplicateProjectionKey = `${row.sourceContentIdentityGroup}::${normalizeDuplicatePatternSpecId(row.patternSpec.patternSpecId)}`;
    const duplicateGroup = (sourceIdsByContent.get(row.sourceContentIdentityGroup)?.size ?? 0) > 1;
    let selection = duplicateGroup ? duplicateProjectionCache.get(duplicateProjectionKey) : null;
    const reusedDuplicateProjection = Boolean(selection);
    if (!selection) {
      selection = selectBalancedEpisode({
        row,
        contextIndexes,
        policy,
        unitMacroUsage: perUnitUsage,
        globalMacroUsage
      });
      if (duplicateGroup && selection.chain) duplicateProjectionCache.set(duplicateProjectionKey, selection);
    }
    if (!selection?.chain) continue;
    const surface = selectSurface(selection.chain, contextIndexes);
    if (!surface) continue;
    const candidate = buildCandidate({
      row,
      selection,
      surface,
      policy,
      duplicateProjectionPreserved: duplicateGroup
    });
    if (reusedDuplicateProjection) candidate.contextSelection.selectionReason = 'DUPLICATE_CONTENT_PROJECTION';
    candidates.push(candidate);
    const macroId = selection.chain.macro.nodeId;
    globalMacroUsage.set(macroId, (globalMacroUsage.get(macroId) ?? 0) + 1);
    perUnitUsage.set(macroId, (perUnitUsage.get(macroId) ?? 0) + 1);
    unitMacroUsage.set(row.sourceId, perUnitUsage);
  }

  return {
    root,
    hidden,
    hiddenValidation: validateW02HiddenPatternSpecs(hidden),
    policy,
    packIndex,
    controller,
    contextIndexes,
    applicationPatternRows,
    candidates
  };
}

function duplicateProjectionParity(candidates) {
  const byContent = new Map();
  for (const candidate of candidates) {
    if (!byContent.has(candidate.sourceContentIdentityGroup)) byContent.set(candidate.sourceContentIdentityGroup, new Map());
    const bySource = byContent.get(candidate.sourceContentIdentityGroup);
    if (!bySource.has(candidate.sourceId)) bySource.set(candidate.sourceId, []);
    bySource.get(candidate.sourceId).push(candidate);
  }
  const comparisons = [];
  for (const [contentIdentityGroup, bySource] of byContent) {
    if (bySource.size < 2) continue;
    const normalized = [...bySource.entries()].map(([sourceId, rows]) => ({
      sourceId,
      projections: rows.map((row) => ({
        duplicateProjectionKey: row.lineage.duplicateProjectionKey,
        requestedUnknownRole: row.requestedUnknownRole,
        macroContextId: row.contextSelection.macroContextId,
        mesoSituationId: row.contextSelection.mesoSituationId,
        microScenarioId: row.contextSelection.microScenarioId,
        atomicEpisodeId: row.contextSelection.atomicEpisodeId,
        surfaceTemplateId: row.contextSelection.surfaceTemplateId,
        answerShape: row.answerModelCandidate.answerShape
      })).sort((left, right) => left.duplicateProjectionKey.localeCompare(right.duplicateProjectionKey))
    }));
    const expected = JSON.stringify(normalized[0].projections);
    comparisons.push({
      contentIdentityGroup,
      sourceIds: normalized.map((row) => row.sourceId).sort(),
      equal: normalized.every((row) => JSON.stringify(row.projections) === expected)
    });
  }
  return comparisons;
}

export function validateW02AtomicContextSingleApplicationCandidatePack(materialized) {
  const issues = [];
  if (!materialized.hiddenValidation.ok) {
    issues.push(issue('POSTG_APP_W02_A02_A01D_INVALID', 'hiddenPatternSpecs', {
      hiddenIssues: materialized.hiddenValidation.issues
    }));
  }
  const rows = materialized.applicationPatternRows;
  const candidates = materialized.candidates;
  const candidateKeys = candidates.map((row) => `${row.sourceId}::${row.patternSpecId}::${row.requestedUnknownRole}`);
  if (rows.length !== 61) {
    issues.push(issue('POSTG_APP_W02_A02_APPLICATION_PATTERNSPEC_COUNT_INVALID', 'applicationPatternRows', {
      expected: 61,
      actual: rows.length
    }));
  }
  if (candidates.length !== rows.length) {
    issues.push(issue('POSTG_APP_W02_A02_CANDIDATE_COUNT_MISMATCH', 'candidates', {
      expected: rows.length,
      actual: candidates.length
    }));
  }
  if (!unique(candidateKeys)
      || !unique(candidates.map((row) => row.bindingCandidateId))
      || !unique(candidates.map((row) => row.itemCandidateId))) {
    issues.push(issue('POSTG_APP_W02_A02_CANDIDATE_IDENTITY_DUPLICATED', 'candidates'));
  }

  const rowByPatternSpecId = new Map(rows.map((row) => [row.patternSpec.patternSpecId, row]));
  for (const candidate of candidates) {
    const source = rowByPatternSpecId.get(candidate.patternSpecId);
    const chain = materialized.contextIndexes.episodeChains.get(candidate.contextSelection.atomicEpisodeId);
    const surface = materialized.contextIndexes.generatedSurfaces.get(candidate.contextSelection.surfaceTemplateId)
      ?? materialized.contextIndexes.legacySurfaces.get(candidate.contextSelection.surfaceTemplateId);
    if (!source || source.patternSpec.mode !== 'APPLICATION'
        || source.patternSpec.presentationContract.contextRequired !== true
        || source.classification === 'APPLICATION_NOT_APPLICABLE') {
      issues.push(issue('POSTG_APP_W02_A02_CANDIDATE_WITHOUT_APPLICATION_PATTERNSPEC', candidate.bindingCandidateId));
      continue;
    }
    if (!source.operationModel) {
      issues.push(issue('POSTG_APP_W02_A02_OPERATION_MODEL_NOT_FOUND', candidate.bindingCandidateId));
      continue;
    }
    if (!chain
        || chain.macro.nodeId !== candidate.contextSelection.macroContextId
        || chain.meso.nodeId !== candidate.contextSelection.mesoSituationId
        || chain.micro.nodeId !== candidate.contextSelection.microScenarioId) {
      issues.push(issue('POSTG_APP_W02_A02_CONTEXT_CHAIN_INVALID', candidate.bindingCandidateId));
    }
    if (!surface || !chain?.episode.surfaceTemplateRefs.includes(candidate.contextSelection.surfaceTemplateId)) {
      issues.push(issue('POSTG_APP_W02_A02_SURFACE_NOT_OWNED_BY_EPISODE', candidate.bindingCandidateId));
    }
    const expectedRoles = Object.keys(source.operationModel.operandRoles ?? {}).sort();
    const actualRoles = [...new Set([
      ...candidate.roleBindingCandidates.map((row) => row.mathRoleId),
      ...candidate.targetRoleCandidate.sourceMathRoleIds
    ])].sort();
    if (JSON.stringify(actualRoles) !== JSON.stringify(expectedRoles)) {
      issues.push(issue('POSTG_APP_W02_A02_MATH_ROLE_COVERAGE_INCOMPLETE', candidate.bindingCandidateId, {
        expected: expectedRoles,
        actual: actualRoles
      }));
    }
    if (candidate.primaryTargetCount !== 1
        || candidate.requestedUnknownRole !== source.patternSpec.requestedUnknownRole
        || candidate.targetRoleCandidate.mathRoleId !== candidate.requestedUnknownRole
        || candidate.targetRoleCandidate.isAnswerRole !== true) {
      issues.push(issue('POSTG_APP_W02_A02_PRIMARY_TARGET_INVALID', candidate.bindingCandidateId));
    }
    if (candidate.applicationMode !== 'SINGLE_DIRECT'
        || candidate.applicationCapabilityLevel !== 'N'
        || candidate.promptBlueprint.fullyInstantiated !== false
        || candidate.answerModelCandidate.numericAnswerInstantiated !== false
        || candidate.admissionStatus !== 'CONTEXT_BOUND_CANDIDATE'
        || candidate.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W02_A02_PRODUCTION_OR_MODE_BOUNDARY_INVALID', candidate.bindingCandidateId));
    }
    const requiredAffordances = new Set(candidate.validationCandidate.requiredContextAffordances);
    const providedAffordances = new Set(candidate.validationCandidate.providedContextAffordances);
    for (const affordance of requiredAffordances) {
      if (!providedAffordances.has(affordance)) {
        issues.push(issue('POSTG_APP_W02_A02_CONTEXT_AFFORDANCE_MISSING', candidate.bindingCandidateId, { affordance }));
      }
    }
  }

  const macroCoverage = [...new Set(candidates.map((row) => row.contextSelection.macroContextId))].sort();
  if (macroCoverage.length !== materialized.policy.diversityTargets.requiredGlobalMacroDomainCount) {
    issues.push(issue('POSTG_APP_W02_A02_GLOBAL_MACRO_DIVERSITY_INSUFFICIENT', 'diversity', {
      expected: materialized.policy.diversityTargets.requiredGlobalMacroDomainCount,
      actual: macroCoverage.length,
      macroCoverage
    }));
  }
  const sourceIds = [...new Set(rows.map((row) => row.sourceId))].sort();
  const unitDiversity = sourceIds.map((sourceId) => {
    const unitCandidates = candidates.filter((row) => row.sourceId === sourceId);
    const macroDomainCount = new Set(unitCandidates.map((row) => row.contextSelection.macroContextId)).size;
    const requiredMacroDomainCount = unitCandidates.length >= 3
      ? materialized.policy.diversityTargets.minimumMacroDomainsPerUnitWhenCandidateCountAtLeastThree
      : unitCandidates.length;
    return { sourceId, candidateCount: unitCandidates.length, macroDomainCount, requiredMacroDomainCount };
  });
  for (const unit of unitDiversity) {
    if (unit.macroDomainCount < unit.requiredMacroDomainCount) {
      issues.push(issue('POSTG_APP_W02_A02_UNIT_MACRO_DIVERSITY_INSUFFICIENT', `diversity.${unit.sourceId}`, unit));
    }
  }

  const duplicateComparisons = duplicateProjectionParity(candidates);
  if (duplicateComparisons.length !== 1 || duplicateComparisons.some((row) => !row.equal)) {
    issues.push(issue('POSTG_APP_W02_A02_DUPLICATE_CONTENT_PROJECTION_INVALID', 'pdf_5ba57aff6a97', {
      duplicateComparisons
    }));
  }

  const unitResolutionCounts = countBy(candidates, (row) => row.unitFlowCandidate.resolutionStatus);
  const macroCounts = countBy(candidates, (row) => row.contextSelection.macroContextId);
  const selectionReasonCounts = countBy(candidates, (row) => row.contextSelection.selectionReason);
  const fallbackProfileCount = candidates.filter((row) => !row.contextSelection.preferredProfileSatisfied).length;

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      applicationPatternSpecCount: rows.length,
      atomicContextBindingCount: candidates.length,
      singleApplicationCandidateCount: candidates.length,
      uniqueCandidateIdentityCount: new Set(candidateKeys).size,
      globalMacroDomainCount: macroCoverage.length,
      duplicateContentProjectionGroupCount: duplicateComparisons.length,
      preferredProfileFallbackCount: fallbackProfileCount,
      productionAdmittedCandidateCount: candidates.filter((row) => row.productionAdmissionAllowed === true).length
    },
    macroCounts,
    selectionReasonCounts,
    unitResolutionCounts,
    unitDiversity,
    macroCoverage,
    duplicateComparisons,
    nextShortestStep: materialized.packIndex.nextShortestStep,
    status: issues.length === 0
      ? 'W02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK_READY'
      : 'W02_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK_BLOCKED'
  };
}

export function buildW02AtomicContextCandidatePackReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW02AtomicContextSingleApplicationCandidatePack({ root });
  const validation = validateW02AtomicContextSingleApplicationCandidatePack(materialized);
  const sample = (predicate) => materialized.candidates.find(predicate) ?? null;
  return {
    ...validation,
    programId: materialized.packIndex.programId,
    taskId: materialized.packIndex.taskId,
    sampleCandidates: {
      required: sample((row) => row.classification === 'APPLICATION_REQUIRED'),
      compatible: sample((row) => row.classification === 'APPLICATION_COMPATIBLE'),
      duplicateProjection: sample((row) => row.sourceContentIdentityGroup === 'pdf_5ba57aff6a97'),
      unresolvedUnit: sample((row) => row.unitFlowCandidate.resolutionStatus === 'SEMANTIC_REVIEW_REQUIRED')
    }
  };
}
