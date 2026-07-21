import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW01Golden15ApplicationAssessment,
  validateW01Golden15ApplicationAssessment
} from './w01-golden15-application-assessment.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w01-atomic-context-binding-policy.json';
const PACK_INDEX_PATH = 'data/curriculum/application/assessment/w01-atomic-context-single-application-candidate-pack-index.json';
const EXISTING_BINDINGS_PATH = 'data/curriculum/application/registry/application-context-bindings.json';
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
  const legacyMappings = new Map(
    authority.legacyMappingRegistry.mappings.map((row) => [row.legacyContextFamilyId, row])
  );
  const episodeChains = new Map();
  for (const episode of episodes.values()) {
    const micro = micros.get(episode.parentNodeId);
    const meso = micro ? mesos.get(micro.parentNodeId) : null;
    const macro = meso ? macros.get(meso.parentNodeId) : null;
    episodeChains.set(episode.nodeId, { macro, meso, micro, episode });
  }
  return { macros, mesos, micros, episodes, generatedSurfaces, legacySurfaces, legacyMappings, episodeChains };
}

function buildOperationIndexes(materializedAssessment) {
  const knowledgePoints = new Map();
  const operationModels = new Map();
  const authorityPaths = new Map();
  for (const golden of materializedAssessment.masterController.goldenRegistries) {
    for (const knowledgePoint of golden.registry.knowledgePoints ?? []) {
      knowledgePoints.set(`${golden.registry.sourceId}::${knowledgePoint.knowledgePointId}`, knowledgePoint);
      authorityPaths.set(`${golden.registry.sourceId}::${knowledgePoint.knowledgePointId}`, golden.registryPath);
      for (const model of knowledgePoint.operationModels ?? []) {
        operationModels.set(`${golden.registry.sourceId}::${knowledgePoint.knowledgePointId}::${model.modelId}`, model);
      }
    }
  }
  return { knowledgePoints, operationModels, authorityPaths };
}

function chooseApplicationMode(assessmentRecord) {
  return assessmentRecord.applicationModes.includes('SINGLE_N_PLUS_1')
    ? 'SINGLE_N_PLUS_1'
    : 'SINGLE_DIRECT';
}

function preferredSuffix(applicationMode, policy) {
  return policy.preferredEpisodeProfile[applicationMode];
}

function semanticAffinityScore({ corpus, macroContextId, policy }) {
  return (policy.macroKeywordAffinity[macroContextId] ?? [])
    .reduce((score, token) => score + (corpus.includes(String(token).toLowerCase()) ? 1 : 0), 0);
}

function resolveExistingPilotSelection({
  assessmentRecord,
  applicationMode,
  existingBindings,
  contextIndexes,
  eligibleEpisodeIds,
  preferredProfile
}) {
  const matchingBindings = existingBindings.bindings.filter((binding) => (
    binding.sourceId === assessmentRecord.sourceId
    && binding.knowledgePointId === assessmentRecord.knowledgePointId
    && assessmentRecord.canonicalOperationModelIds.includes(binding.canonicalOperationModelId)
    && binding.applicationModes.includes(applicationMode)
  ));
  for (const binding of matchingBindings) {
    const mapping = contextIndexes.legacyMappings.get(binding.contextFamilyId);
    if (!mapping) continue;
    const candidates = mapping.atomicEpisodeIds
      .filter((episodeId) => eligibleEpisodeIds.includes(episodeId))
      .sort((left, right) => {
        const leftPreferred = left.endsWith(preferredProfile) ? 0 : 1;
        const rightPreferred = right.endsWith(preferredProfile) ? 0 : 1;
        return leftPreferred - rightPreferred || left.localeCompare(right);
      });
    if (candidates.length === 0) continue;
    return { binding, episodeId: candidates[0] };
  }
  return null;
}

function selectBalancedEpisode({
  assessmentRecord,
  knowledgePoint,
  operationModel,
  applicationMode,
  contextIndexes,
  policy,
  unitMacroUsage,
  globalMacroUsage
}) {
  const eligible = assessmentRecord.eligibleAtomicEpisodeIds
    .map((episodeId) => contextIndexes.episodeChains.get(episodeId))
    .filter((chain) => chain?.macro && chain?.meso && chain?.micro && chain?.episode);
  const preferredProfile = preferredSuffix(applicationMode, policy);
  const preferred = eligible.filter((chain) => chain.episode.nodeId.endsWith(preferredProfile));
  const candidatePool = preferred.length > 0 ? preferred : eligible;
  const corpus = normalizeCorpus([
    assessmentRecord.knowledgePointId,
    assessmentRecord.knowledgePointName,
    assessmentRecord.operationFamilyCandidates,
    knowledgePoint?.scope,
    operationModel?.canonicalExpressions,
    Object.values(operationModel?.operandRoles ?? {}),
    operationModel?.answerType,
    operationModel?.validationInvariants
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

function deriveTargetRoles(operationModel) {
  const operandRoleIds = Object.keys(operationModel.operandRoles ?? {});
  const declaredUnknown = (operationModel.unknownRoles ?? []).filter(Boolean);
  if (declaredUnknown.length > 0) {
    return {
      targetRoleId: declaredUnknown.length === 1 ? declaredUnknown[0] : declaredUnknown.join('_and_'),
      sourceMathRoleIds: declaredUnknown
    };
  }
  const fallback = operandRoleIds.at(-1) ?? 'answer';
  return { targetRoleId: fallback, sourceMathRoleIds: [fallback] };
}

function targetSemanticMeaning({ targetRoleId, sourceMathRoleIds, operationModel, knowledgePoint }) {
  const meanings = sourceMathRoleIds
    .map((roleId) => operationModel.operandRoles?.[roleId])
    .filter(Boolean);
  return meanings.length > 0 ? meanings.join('與') : `${knowledgePoint.knowledgePointName}的${targetRoleId}答案`;
}

function selectSurface({ chain, existingBinding, contextIndexes }) {
  const admitted = existingBinding?.admittedSurfaceTemplateIds ?? [];
  for (const templateId of admitted) {
    if (chain.episode.surfaceTemplateRefs.includes(templateId)
        && (contextIndexes.generatedSurfaces.has(templateId) || contextIndexes.legacySurfaces.has(templateId))) {
      return contextIndexes.generatedSurfaces.get(templateId) ?? contextIndexes.legacySurfaces.get(templateId);
    }
  }
  const generated = [...contextIndexes.generatedSurfaces.values()]
    .filter((surface) => surface.atomicEpisodeId === chain.episode.nodeId)
    .sort((left, right) => left.templateId.localeCompare(right.templateId));
  if (generated.length > 0) return generated[0];
  for (const templateId of chain.episode.surfaceTemplateRefs) {
    const surface = contextIndexes.legacySurfaces.get(templateId);
    if (surface) return surface;
  }
  return null;
}

function answerShape(operationModel, applicationMode, policy) {
  const corpus = normalizeCorpus([operationModel.answerType, operationModel.unknownRoles, operationModel.modelId]);
  for (const rule of policy.answerShapeRules) {
    if (rule.tokens.some((token) => corpus.includes(token))) return rule.answerShape;
  }
  return applicationMode === 'SINGLE_N_PLUS_1' ? 'DECISION_WITH_REASON' : policy.fallbackAnswerShape;
}

function buildCandidate({
  assessmentRecord,
  knowledgePoint,
  operationModel,
  authorityPath,
  applicationMode,
  selection,
  existingPilot,
  surface,
  policy
}) {
  const { chain, preferredProfileSatisfied } = selection;
  const target = deriveTargetRoles(operationModel);
  const operandRoleEntries = Object.entries(operationModel.operandRoles ?? {});
  const targetSourceSet = new Set(target.sourceMathRoleIds.filter((roleId) => roleId in (operationModel.operandRoles ?? {})));
  const givenEntries = operandRoleEntries.filter(([roleId]) => !targetSourceSet.has(roleId));
  const contextResources = chain.episode.resourceRoles.length > 0 ? chain.episode.resourceRoles : ['情境資源'];
  const roleBindingCandidates = givenEntries.map(([mathRoleId, mathSemanticMeaning], index) => {
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
  if (roleBindingCandidates.length === 0 && operandRoleEntries.length > 0) {
    const [mathRoleId, mathSemanticMeaning] = operandRoleEntries[0];
    roleBindingCandidates.push({
      mathRoleId,
      mathSemanticMeaning,
      contextRoleId: 'context_resource_1',
      contextSemanticMeaning: contextResources[0],
      unitCandidate: inferUnitCandidate(`${mathSemanticMeaning} ${contextResources[0]}`, policy),
      isAnswerRole: false
    });
  }
  const targetMeaning = targetSemanticMeaning({
    targetRoleId: target.targetRoleId,
    sourceMathRoleIds: target.sourceMathRoleIds,
    operationModel,
    knowledgePoint
  });
  const contextTargetMeaning = chain.episode.targetRoles[0] ?? '情境答案';
  const answerUnitCandidate = inferUnitCandidate(`${targetMeaning} ${contextTargetMeaning}`, policy);
  const unresolved = [
    ...roleBindingCandidates.map((row) => row.unitCandidate),
    answerUnitCandidate
  ].includes(policy.unresolvedUnitToken);
  const suffix = `${safeId(assessmentRecord.sourceId)}_${safeId(assessmentRecord.knowledgePointId)}_${safeId(operationModel.modelId)}`;
  const requiredSurfaceSlots = surface.requiredSlots ?? [];
  return {
    schemaVersion: 1,
    bindingCandidateId: `w01_bind_${suffix}`,
    itemCandidateId: `w01_item_${suffix}`,
    sourceId: assessmentRecord.sourceId,
    sourceNodeRefs: assessmentRecord.sourceNodeRefs,
    knowledgePointId: assessmentRecord.knowledgePointId,
    canonicalOperationModelId: operationModel.modelId,
    classification: assessmentRecord.classification,
    applicationMode,
    applicationCapabilityLevel: applicationMode === 'SINGLE_N_PLUS_1' ? 'N_PLUS_1' : 'N',
    primaryTargetCount: 1,
    contextSelection: {
      macroContextId: chain.macro.nodeId,
      mesoSituationId: chain.meso.nodeId,
      microScenarioId: chain.micro.nodeId,
      atomicEpisodeId: chain.episode.nodeId,
      surfaceTemplateId: surface.templateId,
      facetRefs: chain.episode.facetRefs,
      selectionReason: existingPilot ? 'EXISTING_PILOT_LEGACY_MAPPING' : 'BALANCED_MACRO_THEN_SEMANTIC_SCORE',
      preferredProfileSatisfied,
      legacyLineagePreserved: Boolean(existingPilot)
    },
    roleBindingCandidates,
    targetRoleCandidate: {
      mathRoleId: target.targetRoleId,
      sourceMathRoleIds: target.sourceMathRoleIds,
      mathSemanticMeaning: targetMeaning,
      contextRoleId: 'context_target_1',
      contextSemanticMeaning: contextTargetMeaning,
      answerUnitCandidate,
      isAnswerRole: true
    },
    unitFlowCandidate: {
      inputRoleIds: roleBindingCandidates.map((row) => row.mathRoleId),
      inputUnitCandidates: roleBindingCandidates.map((row) => row.unitCandidate),
      answerRoleId: target.targetRoleId,
      answerUnitCandidate,
      canonicalRelations: operationModel.canonicalExpressions,
      resolutionStatus: unresolved ? 'SEMANTIC_REVIEW_REQUIRED' : 'CANDIDATE_RESOLVED'
    },
    promptBlueprint: {
      textZh: surface.textZh,
      requiredSurfaceSlots,
      mathFactSlots: [...roleBindingCandidates.map((row) => row.mathRoleId), target.targetRoleId],
      numberConstraints: operationModel.numberConstraints?.length > 0
        ? operationModel.numberConstraints
        : ['依 Canonical Operation Model 生成有效數值'],
      fullyInstantiated: false
    },
    answerModelCandidate: {
      answerShape: answerShape(operationModel, applicationMode, policy),
      answerRole: target.targetRoleId,
      answerUnitCandidate,
      canonicalReconstruction: operationModel.canonicalExpressions[0],
      interpretationStatementCandidate: `答案代表${targetMeaning}，必須符合${chain.episode.eventGoal}的情境目標。`,
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
        'UNIQUE_ANSWER_VALIDATION',
        ...(applicationMode === 'SINGLE_N_PLUS_1' ? ['N_PLUS_1_PROOF_AND_MISCONCEPTION_VALIDATION'] : [])
      ]
    },
    admissionStatus: policy.candidateStatus,
    productionAdmissionAllowed: false,
    lineage: {
      knowledgeOperationAuthorityPath: authorityPath,
      w01AssessmentTaskId: 'POSTG-APP-W01-A00_Golden15ApplicationCapabilityAssessmentAndAdmissionBaseline',
      m01ContextAuthorityPath: M01_AUTHORITY_PATH,
      selectionPolicyPath: POLICY_PATH,
      ...(existingPilot ? { existingPilotBindingId: existingPilot.bindingId } : {})
    }
  };
}

export function materializeW01AtomicContextSingleApplicationCandidatePack({ root = process.cwd() } = {}) {
  const assessment = materializeW01Golden15ApplicationAssessment({ root });
  const policy = readJson(root, POLICY_PATH);
  const packIndex = readJson(root, PACK_INDEX_PATH);
  const existingBindings = readJson(root, EXISTING_BINDINGS_PATH);
  const contextIndexes = buildContextIndexes(assessment.masterController.contextAuthority);
  const operationIndexes = buildOperationIndexes(assessment);
  const suitable = assessment.records.filter((record) => record.classification !== 'APPLICATION_NOT_APPLICABLE');
  const candidates = [];
  const globalMacroUsage = new Map();
  const unitMacroUsage = new Map();

  for (const assessmentRecord of suitable) {
    const kpKey = `${assessmentRecord.sourceId}::${assessmentRecord.knowledgePointId}`;
    const knowledgePoint = operationIndexes.knowledgePoints.get(kpKey);
    const operationModelId = assessmentRecord.canonicalOperationModelIds[0];
    const operationModel = operationIndexes.operationModels.get(`${kpKey}::${operationModelId}`);
    const applicationMode = chooseApplicationMode(assessmentRecord);
    const preferredProfile = preferredSuffix(applicationMode, policy);
    const perUnitUsage = unitMacroUsage.get(assessmentRecord.sourceId) ?? new Map();
    const existingPilot = resolveExistingPilotSelection({
      assessmentRecord,
      applicationMode,
      existingBindings,
      contextIndexes,
      eligibleEpisodeIds: assessmentRecord.eligibleAtomicEpisodeIds,
      preferredProfile
    });
    let selection;
    if (existingPilot) {
      selection = {
        chain: contextIndexes.episodeChains.get(existingPilot.episodeId),
        preferredProfileSatisfied: existingPilot.episodeId.endsWith(preferredProfile)
      };
    } else {
      selection = selectBalancedEpisode({
        assessmentRecord,
        knowledgePoint,
        operationModel,
        applicationMode,
        contextIndexes,
        policy,
        unitMacroUsage: perUnitUsage,
        globalMacroUsage
      });
    }
    if (!selection.chain) continue;
    const surface = selectSurface({
      chain: selection.chain,
      existingBinding: existingPilot?.binding,
      contextIndexes
    });
    if (!surface) continue;
    const candidate = buildCandidate({
      assessmentRecord,
      knowledgePoint,
      operationModel,
      authorityPath: operationIndexes.authorityPaths.get(kpKey),
      applicationMode,
      selection,
      existingPilot: existingPilot?.binding ?? null,
      surface,
      policy
    });
    candidates.push(candidate);
    const macroId = selection.chain.macro.nodeId;
    globalMacroUsage.set(macroId, (globalMacroUsage.get(macroId) ?? 0) + 1);
    perUnitUsage.set(macroId, (perUnitUsage.get(macroId) ?? 0) + 1);
    unitMacroUsage.set(assessmentRecord.sourceId, perUnitUsage);
  }

  return {
    assessment,
    policy,
    packIndex,
    existingBindings,
    contextIndexes,
    operationIndexes,
    candidates
  };
}

export function validateW01AtomicContextSingleApplicationCandidatePack(materialized) {
  const issues = [];
  const assessmentValidation = validateW01Golden15ApplicationAssessment(materialized.assessment);
  if (!assessmentValidation.ok) {
    issues.push(issue('POSTG_APP_W01_A01_ASSESSMENT_INVALID', 'assessment', {
      assessmentIssues: assessmentValidation.issues
    }));
  }
  const suitableRecords = materialized.assessment.records
    .filter((record) => record.classification !== 'APPLICATION_NOT_APPLICABLE');
  const excludedRecords = materialized.assessment.records
    .filter((record) => record.classification === 'APPLICATION_NOT_APPLICABLE');
  const candidates = materialized.candidates;
  const candidateKeys = candidates.map((row) => `${row.sourceId}::${row.knowledgePointId}::${row.canonicalOperationModelId}`);
  if (candidates.length !== suitableRecords.length) {
    issues.push(issue('POSTG_APP_W01_A01_CANDIDATE_COUNT_MISMATCH', 'candidates', {
      expected: suitableRecords.length,
      actual: candidates.length
    }));
  }
  if (!unique(candidateKeys)
      || !unique(candidates.map((row) => row.bindingCandidateId))
      || !unique(candidates.map((row) => row.itemCandidateId))) {
    issues.push(issue('POSTG_APP_W01_A01_CANDIDATE_IDENTITY_DUPLICATED', 'candidates'));
  }

  const assessmentByKey = new Map(materialized.assessment.records.map((row) => [
    `${row.sourceId}::${row.knowledgePointId}`,
    row
  ]));
  for (const candidate of candidates) {
    const recordKey = `${candidate.sourceId}::${candidate.knowledgePointId}`;
    const assessmentRecord = assessmentByKey.get(recordKey);
    const operationModel = materialized.operationIndexes.operationModels.get(
      `${recordKey}::${candidate.canonicalOperationModelId}`
    );
    const chain = materialized.contextIndexes.episodeChains.get(candidate.contextSelection.atomicEpisodeId);
    const generatedSurface = materialized.contextIndexes.generatedSurfaces.get(candidate.contextSelection.surfaceTemplateId);
    const legacySurface = materialized.contextIndexes.legacySurfaces.get(candidate.contextSelection.surfaceTemplateId);
    if (!assessmentRecord || assessmentRecord.classification === 'APPLICATION_NOT_APPLICABLE') {
      issues.push(issue('POSTG_APP_W01_A01_CANDIDATE_WITHOUT_SUITABLE_ASSESSMENT', candidate.bindingCandidateId));
      continue;
    }
    if (!assessmentRecord.eligibleAtomicEpisodeIds.includes(candidate.contextSelection.atomicEpisodeId)) {
      issues.push(issue('POSTG_APP_W01_A01_ATOMIC_EPISODE_NOT_ELIGIBLE', candidate.bindingCandidateId));
    }
    if (!operationModel) {
      issues.push(issue('POSTG_APP_W01_A01_OPERATION_MODEL_NOT_FOUND', candidate.bindingCandidateId));
      continue;
    }
    if (!chain
        || chain.macro.nodeId !== candidate.contextSelection.macroContextId
        || chain.meso.nodeId !== candidate.contextSelection.mesoSituationId
        || chain.micro.nodeId !== candidate.contextSelection.microScenarioId) {
      issues.push(issue('POSTG_APP_W01_A01_CONTEXT_CHAIN_INVALID', candidate.bindingCandidateId));
    }
    if (!generatedSurface && !legacySurface) {
      issues.push(issue('POSTG_APP_W01_A01_SURFACE_NOT_FOUND', candidate.bindingCandidateId));
    }
    if (!chain?.episode.surfaceTemplateRefs.includes(candidate.contextSelection.surfaceTemplateId)) {
      issues.push(issue('POSTG_APP_W01_A01_SURFACE_NOT_OWNED_BY_EPISODE', candidate.bindingCandidateId));
    }
    const operandRoles = Object.keys(operationModel.operandRoles ?? {}).sort();
    const coveredRoles = [
      ...candidate.roleBindingCandidates.map((row) => row.mathRoleId),
      ...candidate.targetRoleCandidate.sourceMathRoleIds.filter((roleId) => roleId in (operationModel.operandRoles ?? {}))
    ].sort();
    if (JSON.stringify([...new Set(coveredRoles)].sort()) !== JSON.stringify(operandRoles)) {
      issues.push(issue('POSTG_APP_W01_A01_MATH_ROLE_COVERAGE_INCOMPLETE', candidate.bindingCandidateId, {
        expected: operandRoles,
        actual: [...new Set(coveredRoles)].sort()
      }));
    }
    if (candidate.primaryTargetCount !== 1 || candidate.targetRoleCandidate.isAnswerRole !== true) {
      issues.push(issue('POSTG_APP_W01_A01_PRIMARY_TARGET_INVALID', candidate.bindingCandidateId));
    }
    const requiredAffordances = new Set(candidate.validationCandidate.requiredContextAffordances);
    const providedAffordances = new Set(candidate.validationCandidate.providedContextAffordances);
    for (const affordance of requiredAffordances) {
      if (!providedAffordances.has(affordance)) {
        issues.push(issue('POSTG_APP_W01_A01_CONTEXT_AFFORDANCE_MISSING', candidate.bindingCandidateId, { affordance }));
      }
    }
    if (candidate.applicationMode === 'SINGLE_N_PLUS_1'
        && candidate.applicationCapabilityLevel !== 'N_PLUS_1') {
      issues.push(issue('POSTG_APP_W01_A01_N_PLUS_ONE_LEVEL_INVALID', candidate.bindingCandidateId));
    }
    if (candidate.applicationMode === 'SINGLE_DIRECT'
        && candidate.applicationCapabilityLevel !== 'N') {
      issues.push(issue('POSTG_APP_W01_A01_DIRECT_LEVEL_INVALID', candidate.bindingCandidateId));
    }
    if (candidate.admissionStatus !== 'CONTEXT_BOUND_CANDIDATE'
        || candidate.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W01_A01_PRODUCTION_ADMISSION_FORBIDDEN', candidate.bindingCandidateId));
    }
  }

  const excludedKeys = new Set(excludedRecords.map((row) => `${row.sourceId}::${row.knowledgePointId}`));
  if (candidates.some((row) => excludedKeys.has(`${row.sourceId}::${row.knowledgePointId}`))) {
    issues.push(issue('POSTG_APP_W01_A01_EXCLUDED_KP_HAS_CANDIDATE', 'candidates'));
  }

  const macroCoverage = [...new Set(candidates.map((row) => row.contextSelection.macroContextId))].sort();
  if (macroCoverage.length !== materialized.policy.diversityTargets.requiredGlobalMacroDomainCount) {
    issues.push(issue('POSTG_APP_W01_A01_GLOBAL_MACRO_DIVERSITY_INSUFFICIENT', 'diversity', {
      expected: materialized.policy.diversityTargets.requiredGlobalMacroDomainCount,
      actual: macroCoverage.length,
      macroCoverage
    }));
  }
  const unitDiversity = assessmentValidation.unitSummaries.map((unit) => {
    const unitCandidates = candidates.filter((row) => row.sourceId === unit.sourceId);
    const macroCount = new Set(unitCandidates.map((row) => row.contextSelection.macroContextId)).size;
    return {
      sourceId: unit.sourceId,
      candidateCount: unitCandidates.length,
      macroDomainCount: macroCount,
      requiredMacroDomainCount: unitCandidates.length >= 3
        ? materialized.policy.diversityTargets.minimumMacroDomainsPerUnitWhenSuitableCountAtLeastThree
        : unitCandidates.length
    };
  });
  for (const unit of unitDiversity) {
    if (unit.macroDomainCount < unit.requiredMacroDomainCount) {
      issues.push(issue('POSTG_APP_W01_A01_UNIT_MACRO_DIVERSITY_INSUFFICIENT', `diversity.${unit.sourceId}`, unit));
    }
  }

  const existingPilotCandidates = candidates.filter((row) => row.lineage.existingPilotBindingId);
  for (const candidate of existingPilotCandidates) {
    const binding = materialized.existingBindings.bindings.find(
      (row) => row.bindingId === candidate.lineage.existingPilotBindingId
    );
    const mapping = binding
      ? materialized.contextIndexes.legacyMappings.get(binding.contextFamilyId)
      : null;
    if (!binding || !mapping || !mapping.atomicEpisodeIds.includes(candidate.contextSelection.atomicEpisodeId)) {
      issues.push(issue('POSTG_APP_W01_A01_EXISTING_PILOT_LINEAGE_INVALID', candidate.bindingCandidateId));
    }
  }

  const unitResolutionCounts = countBy(candidates, (row) => row.unitFlowCandidate.resolutionStatus);
  const modeCounts = countBy(candidates, (row) => row.applicationMode);
  const macroCounts = countBy(candidates, (row) => row.contextSelection.macroContextId);
  const selectionReasonCounts = countBy(candidates, (row) => row.contextSelection.selectionReason);
  const fallbackProfileCount = candidates.filter((row) => !row.contextSelection.preferredProfileSatisfied).length;

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      suitableKnowledgePointCount: suitableRecords.length,
      excludedKnowledgePointCount: excludedRecords.length,
      candidateCount: candidates.length,
      uniqueCandidateIdentityCount: new Set(candidateKeys).size,
      globalMacroDomainCount: macroCoverage.length,
      existingPilotLineageCandidateCount: existingPilotCandidates.length,
      preferredProfileFallbackCount: fallbackProfileCount,
      productionAdmittedCandidateCount: candidates.filter((row) => row.productionAdmissionAllowed === true).length
    },
    modeCounts,
    macroCounts,
    selectionReasonCounts,
    unitResolutionCounts,
    unitDiversity,
    macroCoverage,
    nextShortestStep: materialized.packIndex.nextShortestStep,
    status: issues.length === 0
      ? 'W01_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK_READY'
      : 'W01_ATOMIC_CONTEXT_SINGLE_APPLICATION_CANDIDATE_PACK_BLOCKED'
  };
}

export function buildW01AtomicContextCandidatePackReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW01AtomicContextSingleApplicationCandidatePack({ root });
  const validation = validateW01AtomicContextSingleApplicationCandidatePack(materialized);
  const sample = (predicate) => materialized.candidates.find(predicate) ?? null;
  return {
    ...validation,
    programId: materialized.packIndex.programId,
    taskId: materialized.packIndex.taskId,
    sampleCandidates: {
      existingPilot: sample((row) => Boolean(row.lineage.existingPilotBindingId)),
      direct: sample((row) => row.applicationMode === 'SINGLE_DIRECT' && !row.lineage.existingPilotBindingId),
      nPlusOne: sample((row) => row.applicationMode === 'SINGLE_N_PLUS_1' && !row.lineage.existingPilotBindingId),
      unresolvedUnit: sample((row) => row.unitFlowCandidate.resolutionStatus === 'SEMANTIC_REVIEW_REQUIRED')
    }
  };
}
