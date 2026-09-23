import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW01AtomicContextSingleApplicationCandidatePack,
  validateW01AtomicContextSingleApplicationCandidatePack
} from './w01-atomic-context-single-application-candidate-pack.mjs';

const POLICY_PATH = 'data/curriculum/application/contracts/w01-application-semantic-remediation-policy.json';
const REVIEW_DECISION_PATH = 'data/curriculum/application/reviews/POSTG-APP-W01-A06_HumanReviewDecisionAndSemanticRemediation.json';
const A05_REVIEW_DATA_PATH = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW_DATA.json';
const TASK_ID = 'POSTG-APP-W01-A06B_SemanticClassQuantitySchemaAndValidatorRuntime';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const uniqueSorted = (values) => [...new Set(values)].sort();

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function normalizeCorpus(parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ').toLowerCase();
}

function safeToken(value, fallback) {
  const token = String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/gu, '_')
    .replace(/^_+|_+$/g, '');
  return token || fallback;
}

function operationModelFor(materializedA01, candidate) {
  return materializedA01.operationIndexes.operationModels.get(
    `${candidate.sourceId}::${candidate.knowledgePointId}::${candidate.canonicalOperationModelId}`
  ) ?? null;
}

function classifySemanticClass({ candidate, reviewPair, operationModel, policy }) {
  const corpus = normalizeCorpus([
    candidate.sourceId,
    candidate.knowledgePointId,
    candidate.canonicalOperationModelId,
    operationModel?.modelId,
    operationModel?.canonicalExpressions,
    Object.values(operationModel?.operandRoles ?? {}),
    operationModel?.unknownRoles,
    operationModel?.answerType,
    reviewPair?.exactPatternSpecId,
    reviewPair?.exactPatternGroupId,
    reviewPair?.originalPrompt
  ]);
  for (const rule of policy.semanticClassRules) {
    if (rule.tokens.some((token) => corpus.includes(String(token).toLowerCase()))) {
      return {
        semanticClass: rule.semanticClass,
        classificationRuleId: rule.ruleId,
        classificationCorpus: corpus
      };
    }
  }
  return {
    semanticClass: policy.fallbackSemanticClass,
    classificationRuleId: 'SEM_FALLBACK_NUMERIC_ONLY',
    classificationCorpus: corpus
  };
}

function measureTypeForUnit(unitText, policy) {
  if (unitText == null || unitText === '') return 'no_unit';
  return policy.measureByUnit[unitText] ?? 'unclassified_measure';
}

function buildInputQuantityBinding(row, index, policy) {
  const unitText = row.unitCandidate ?? 'UNBOUND_UNIT_CANDIDATE';
  const entityType = safeToken(row.contextSemanticMeaning, 'UNBOUND_ENTITY_CANDIDATE');
  const measureType = measureTypeForUnit(unitText, policy);
  const genericUnit = policy.genericFallbackUnits.includes(unitText);
  return {
    quantityRole: row.mathRoleId,
    entityType,
    contextRoleId: row.contextRoleId,
    contextSemanticMeaning: row.contextSemanticMeaning,
    mathSemanticMeaning: row.mathSemanticMeaning,
    measureType,
    unitText,
    valueSource: `exactGeneratorRole:${row.mathRoleId}`,
    ordinal: index,
    bindingStatus: genericUnit || entityType === 'UNBOUND_ENTITY_CANDIDATE'
      ? 'REMEDIATION_REQUIRED'
      : 'CANDIDATE_BOUND'
  };
}

function buildTargetQuantityBinding(candidate, semanticClass, policy) {
  const answerSchema = policy.answerSchemaBySemanticClass[semanticClass];
  const noUnit = answerSchema?.unitPolicy === 'NO_UNIT'
    || answerSchema?.unitPolicy === 'NO_PHYSICAL_UNIT'
    || answerSchema?.unitPolicy === 'NO_FORCED_CONTEXT_UNIT';
  const inheritedUnit = candidate.targetRoleCandidate.answerUnitCandidate;
  const unitText = noUnit ? null : inheritedUnit;
  return {
    quantityRole: candidate.targetRoleCandidate.mathRoleId,
    entityType: safeToken(candidate.targetRoleCandidate.contextSemanticMeaning, 'UNBOUND_TARGET_ENTITY_CANDIDATE'),
    contextRoleId: candidate.targetRoleCandidate.contextRoleId,
    contextSemanticMeaning: candidate.targetRoleCandidate.contextSemanticMeaning,
    mathSemanticMeaning: candidate.targetRoleCandidate.mathSemanticMeaning,
    measureType: noUnit ? 'no_unit' : measureTypeForUnit(unitText, policy),
    unitText,
    valueSource: `exactGeneratorTarget:${candidate.targetRoleCandidate.mathRoleId}`,
    answerShape: answerSchema?.answerShape ?? 'INHERIT_EXACT_PATTERN',
    unitPolicy: answerSchema?.unitPolicy ?? 'INHERIT_EXACT_PATTERN',
    bindingStatus: noUnit
      ? 'CANDIDATE_BOUND'
      : policy.genericFallbackUnits.includes(unitText)
        ? 'REMEDIATION_REQUIRED'
        : 'CANDIDATE_BOUND'
  };
}

function visibleMacroLabel(reviewPrompt, policy) {
  return policy.visibleMacroLabels.find((label) => reviewPrompt.startsWith(`在${label}`)) ?? null;
}

function containsExpressionWrapper(reviewPair) {
  const prompt = String(reviewPair?.reviewPrompt ?? '');
  const original = String(reviewPair?.originalPrompt ?? '');
  if (!prompt.includes('依照') && !prompt.includes('根據')) return false;
  if (original && prompt.includes(original)) return true;
  return /(?:依照|根據)[^。！？]{0,260}(?:[+\-×÷=]|□|○)[^。！？]{0,260}(?:求出|判斷)/u.test(prompt);
}

function containsGenericTarget(reviewPrompt) {
  return /(求出|判斷)[^。！？]{0,24}(總量|需求|結論|安排)/u.test(String(reviewPrompt ?? ''));
}

function sameMeasureRequirementApplies(semanticClass) {
  return new Set([
    'COMPARE_TWO_GROUPS_SAME_MEASURE',
    'RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE',
    'JOIN_RESULT_TOTAL',
    'SEPARATE_REMAINDER_OR_DIFFERENCE'
  ]).has(semanticClass);
}

function remediationIssuesForDescriptor(descriptor, policy) {
  const issues = [];
  const reviewPair = descriptor.reviewPair;
  const pathValue = descriptor.bindingCandidateId;
  const inputBindings = descriptor.quantitySchema.inputBindings;
  const targetBinding = descriptor.quantitySchema.targetBinding;

  if (reviewPair) {
    const macroLabel = visibleMacroLabel(reviewPair.reviewPrompt, policy);
    if (macroLabel) {
      issues.push(issue('APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN', pathValue, { macroLabel }));
    }
    if (containsExpressionWrapper(reviewPair)) {
      issues.push(issue('APPSEM_EXPRESSION_WRAPPER_PROSE_FORBIDDEN', pathValue));
    }
  }

  const unresolvedBindings = inputBindings.filter((binding) => binding.bindingStatus !== 'CANDIDATE_BOUND');
  if (descriptor.suitability !== 'NUMERIC_ONLY' && unresolvedBindings.length > 0) {
    issues.push(issue('APPSEM_OPERAND_QUANTITY_BINDING_MISSING', pathValue, {
      unresolvedRoles: unresolvedBindings.map((binding) => binding.quantityRole),
      units: unresolvedBindings.map((binding) => binding.unitText)
    }));
  }

  if (sameMeasureRequirementApplies(descriptor.semanticClass)) {
    const meaningfulMeasures = uniqueSorted(inputBindings
      .map((binding) => binding.measureType)
      .filter((measure) => !['unbound', 'generic_count_fallback', 'unclassified_measure'].includes(measure)));
    if (meaningfulMeasures.length > 1) {
      issues.push(issue('APPSEM_OPERAND_UNIT_INCONSISTENT', pathValue, { measures: meaningfulMeasures }));
    }
  }

  if (descriptor.semanticClass === 'COMPARE_TWO_GROUPS_SAME_MEASURE' && inputBindings.length < 2) {
    issues.push(issue('APPSEM_COMPARE_GROUP_SCHEMA_REQUIRED', pathValue, {
      actualInputBindingCount: inputBindings.length,
      requiredInputBindingCount: 2
    }));
  }

  if (descriptor.semanticClass === 'RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE' && inputBindings.length < 3) {
    issues.push(issue('APPSEM_RANGE_BOUND_SCHEMA_REQUIRED', pathValue, {
      actualInputBindingCount: inputBindings.length,
      requiredInputBindingCount: 3
    }));
  }

  if (reviewPair && containsGenericTarget(reviewPair.reviewPrompt)
      && policy.relationClassesThatForbidGenericTotal.includes(descriptor.semanticClass)) {
    issues.push(issue('APPSEM_GENERIC_TOTAL_TARGET_FORBIDDEN', pathValue, {
      semanticClass: descriptor.semanticClass
    }));
    issues.push(issue('APPSEM_RELATION_TARGET_MISMATCH', pathValue, {
      semanticClass: descriptor.semanticClass
    }));
  }

  if (reviewPair && descriptor.suitability === 'NUMERIC_ONLY'
      && reviewPair.reviewPrompt !== reviewPair.originalPrompt) {
    issues.push(issue('APPSEM_FORCED_APPLICATION_FOR_NUMERIC_ONLY', pathValue));
  }

  if (reviewPair && targetBinding.unitPolicy === 'NO_UNIT' && reviewPair.answerUnit) {
    issues.push(issue('APPSEM_ANSWER_UNIT_MISMATCH', pathValue, {
      answerShape: targetBinding.answerShape,
      actualAnswerUnit: reviewPair.answerUnit
    }));
  }

  if (reviewPair) {
    issues.push(issue('APPSEM_HUMAN_NATURALNESS_REVIEW_REQUIRED', pathValue, {
      severity: 'HUMAN_REVIEW_GATE'
    }));
  }

  return issues;
}

function buildDescriptor({ candidate, reviewPair, operationModel, policy }) {
  const classification = classifySemanticClass({ candidate, reviewPair, operationModel, policy });
  const suitability = policy.suitabilityBySemanticClass[classification.semanticClass];
  const inputBindings = candidate.roleBindingCandidates.map((row, index) => (
    buildInputQuantityBinding(row, index + 1, policy)
  ));
  const targetBinding = buildTargetQuantityBinding(candidate, classification.semanticClass, policy);
  const descriptor = {
    schemaVersion: 1,
    descriptorId: `a06b_sem_${candidate.bindingCandidateId}`,
    bindingCandidateId: candidate.bindingCandidateId,
    itemCandidateId: candidate.itemCandidateId,
    sourceId: candidate.sourceId,
    knowledgePointId: candidate.knowledgePointId,
    canonicalOperationModelId: candidate.canonicalOperationModelId,
    exactPatternSpecId: reviewPair?.exactPatternSpecId ?? null,
    exactPatternGroupId: reviewPair?.exactPatternGroupId ?? null,
    semanticClass: classification.semanticClass,
    classificationRuleId: classification.classificationRuleId,
    suitability,
    contextMetadata: {
      macroContextId: candidate.contextSelection.macroContextId,
      macroHeadingVisiblePerQuestion: false,
      atomicEpisodeId: candidate.contextSelection.atomicEpisodeId,
      surfaceTemplateId: candidate.contextSelection.surfaceTemplateId
    },
    quantitySchema: {
      inputBindings,
      targetBinding,
      allOperandsHaveSchema: inputBindings.every((binding) => (
        typeof binding.quantityRole === 'string'
        && typeof binding.entityType === 'string'
        && typeof binding.measureType === 'string'
        && Object.hasOwn(binding, 'unitText')
        && typeof binding.valueSource === 'string'
      ))
    },
    answerSchema: clone(policy.answerSchemaBySemanticClass[classification.semanticClass]),
    reviewPair: reviewPair ? clone(reviewPair) : null,
    productionAdmissionAllowed: false,
    lineage: {
      a01BindingCandidateId: candidate.bindingCandidateId,
      a01SelectionPolicyPath: candidate.lineage.selectionPolicyPath,
      semanticPolicyPath: POLICY_PATH,
      humanReviewDecisionPath: REVIEW_DECISION_PATH,
      a05ReviewDataPath: A05_REVIEW_DATA_PATH
    }
  };
  descriptor.remediationIssues = remediationIssuesForDescriptor(descriptor, policy);
  descriptor.remediationStatus = descriptor.remediationIssues.length === 0
    ? 'SEMANTIC_SCHEMA_READY'
    : 'REMEDIATION_REQUIRED';
  return descriptor;
}

export function materializeW01SemanticClassQuantitySchemaRuntime({ root = process.cwd() } = {}) {
  const a01 = materializeW01AtomicContextSingleApplicationCandidatePack({ root });
  const a01Validation = validateW01AtomicContextSingleApplicationCandidatePack(a01);
  const policy = readJson(root, POLICY_PATH);
  const humanReviewDecision = readJson(root, REVIEW_DECISION_PATH);
  const a05ReviewData = readJson(root, A05_REVIEW_DATA_PATH);
  const reviewByBindingCandidateId = new Map(
    a05ReviewData.reviewPairs.map((row) => [row.bindingCandidateId, row])
  );
  const descriptors = a01.candidates.map((candidate) => buildDescriptor({
    candidate,
    reviewPair: reviewByBindingCandidateId.get(candidate.bindingCandidateId) ?? null,
    operationModel: operationModelFor(a01, candidate),
    policy
  }));
  const reviewDescriptors = descriptors.filter((descriptor) => descriptor.reviewPair != null);
  return {
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: TASK_ID,
    status: 'SEMANTIC_CLASS_QUANTITY_SCHEMA_SHADOW_RUNTIME_READY',
    actualEvidenceLevel: 'E3_SHADOW_RUNTIME_INTEGRATED',
    productionAdmissionAllowed: false,
    a01,
    a01Validation,
    policy,
    humanReviewDecision,
    a05ReviewData,
    descriptors,
    reviewDescriptors
  };
}

export function validateW01SemanticClassQuantitySchemaRuntime(materialized) {
  const structuralIssues = [];
  const descriptors = materialized.descriptors ?? [];
  const reviewDescriptors = materialized.reviewDescriptors ?? [];
  const policy = materialized.policy;

  if (!materialized.a01Validation?.ok) {
    structuralIssues.push(issue('POSTG_APP_W01_A06B_A01_INVALID', 'a01', {
      issues: materialized.a01Validation?.issues ?? []
    }));
  }
  if (descriptors.length !== materialized.a01?.candidates?.length) {
    structuralIssues.push(issue('POSTG_APP_W01_A06B_DESCRIPTOR_COUNT_MISMATCH', 'descriptors', {
      expected: materialized.a01?.candidates?.length ?? 0,
      actual: descriptors.length
    }));
  }
  if (reviewDescriptors.length !== materialized.a05ReviewData?.reviewPairs?.length) {
    structuralIssues.push(issue('POSTG_APP_W01_A06B_REVIEW_JOIN_INCOMPLETE', 'reviewDescriptors', {
      expected: materialized.a05ReviewData?.reviewPairs?.length ?? 0,
      actual: reviewDescriptors.length
    }));
  }

  for (const descriptor of descriptors) {
    if (!policy.allowedSemanticClasses.includes(descriptor.semanticClass)) {
      structuralIssues.push(issue('POSTG_APP_W01_A06B_SEMANTIC_CLASS_INVALID', descriptor.bindingCandidateId, {
        semanticClass: descriptor.semanticClass
      }));
    }
    if (!policy.allowedSuitability.includes(descriptor.suitability)) {
      structuralIssues.push(issue('POSTG_APP_W01_A06B_SUITABILITY_INVALID', descriptor.bindingCandidateId, {
        suitability: descriptor.suitability
      }));
    }
    if (!descriptor.quantitySchema?.allOperandsHaveSchema) {
      structuralIssues.push(issue('POSTG_APP_W01_A06B_QUANTITY_SCHEMA_INCOMPLETE', descriptor.bindingCandidateId));
    }
    if (!descriptor.answerSchema || typeof descriptor.answerSchema.answerShape !== 'string') {
      structuralIssues.push(issue('POSTG_APP_W01_A06B_ANSWER_SCHEMA_MISSING', descriptor.bindingCandidateId));
    }
    if (descriptor.contextMetadata?.macroHeadingVisiblePerQuestion !== false) {
      structuralIssues.push(issue('POSTG_APP_W01_A06B_MACRO_VISIBILITY_POLICY_INVALID', descriptor.bindingCandidateId));
    }
    if (descriptor.productionAdmissionAllowed !== false) {
      structuralIssues.push(issue('POSTG_APP_W01_A06B_PRODUCTION_ADMISSION_FORBIDDEN', descriptor.bindingCandidateId));
    }
  }

  const remediationIssues = reviewDescriptors.flatMap((descriptor) => descriptor.remediationIssues.map((row) => ({
    ...row,
    bindingCandidateId: descriptor.bindingCandidateId,
    semanticClass: descriptor.semanticClass,
    suitability: descriptor.suitability
  })));
  const issueCounts = remediationIssues.reduce((counts, row) => {
    counts[row.code] = (counts[row.code] ?? 0) + 1;
    return counts;
  }, {});
  const semanticClassCounts = descriptors.reduce((counts, row) => {
    counts[row.semanticClass] = (counts[row.semanticClass] ?? 0) + 1;
    return counts;
  }, {});
  const suitabilityCounts = descriptors.reduce((counts, row) => {
    counts[row.suitability] = (counts[row.suitability] ?? 0) + 1;
    return counts;
  }, {});

  return {
    ok: structuralIssues.length === 0,
    structuralIssues,
    remediationIssues,
    productionReady: false,
    productionAdmissionAllowed: false,
    status: structuralIssues.length === 0
      ? 'SEMANTIC_CLASS_QUANTITY_SCHEMA_SHADOW_RUNTIME_VALID'
      : 'SEMANTIC_CLASS_QUANTITY_SCHEMA_SHADOW_RUNTIME_INVALID',
    counts: {
      descriptorCount: descriptors.length,
      reviewDescriptorCount: reviewDescriptors.length,
      structuralIssueCount: structuralIssues.length,
      remediationIssueCount: remediationIssues.length,
      semanticClassCounts,
      suitabilityCounts,
      remediationIssueCounts: issueCounts
    }
  };
}

export function buildW01SemanticClassQuantitySchemaReadback(options = {}) {
  const materialized = materializeW01SemanticClassQuantitySchemaRuntime(options);
  const validation = validateW01SemanticClassQuantitySchemaRuntime(materialized);
  return {
    taskId: materialized.taskId,
    status: validation.status,
    actualEvidenceLevel: materialized.actualEvidenceLevel,
    ok: validation.ok,
    productionReady: false,
    productionAdmissionAllowed: false,
    counts: clone(validation.counts),
    structuralIssues: clone(validation.structuralIssues),
    remediationIssues: clone(validation.remediationIssues),
    reviewDescriptors: clone(materialized.reviewDescriptors.map((descriptor) => ({
      bindingCandidateId: descriptor.bindingCandidateId,
      sourceId: descriptor.sourceId,
      knowledgePointId: descriptor.knowledgePointId,
      exactPatternSpecId: descriptor.exactPatternSpecId,
      semanticClass: descriptor.semanticClass,
      suitability: descriptor.suitability,
      quantitySchema: descriptor.quantitySchema,
      answerSchema: descriptor.answerSchema,
      remediationStatus: descriptor.remediationStatus,
      remediationIssueCodes: descriptor.remediationIssues.map((row) => row.code)
    }))),
    nextShortestStep: 'POSTG-APP-W01-A06C_RelationSpecificSurfaceTemplatesAndTitleSuppression'
  };
}
