import fs from 'node:fs';
import path from 'node:path';

import {
  loadPOSTGAPPMasterController,
  validatePOSTGAPPMasterController
} from './postg-app-master-controller.mjs';
import { queryAtomicTaskEpisodes } from '../context/global-context-ontology-resolver.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w01-golden15-application-capability-policy.json';
const ASSESSMENT_INDEX_PATH = 'data/curriculum/application/assessment/w01-golden15-application-assessment-index.json';
const EXISTING_ADMISSION_REGISTRY_PATH = 'data/curriculum/application/registry/application-admission-registry.json';

const unique = (values) => new Set(values).size === values.length;
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function normalizedText(parts) {
  return parts.flat(Infinity).filter(Boolean).join(' ').toLowerCase();
}

function includesAny(text, tokens) {
  return tokens.some((token) => text.includes(token.toLowerCase()));
}

function kpBindings(registry, knowledgePointId) {
  return (registry.existingQuestionBindings ?? []).filter((binding) => binding.knowledgePointId === knowledgePointId);
}

function operationCorpus(knowledgePoint) {
  return normalizedText([
    knowledgePoint.knowledgePointId,
    knowledgePoint.knowledgePointName,
    knowledgePoint.scope,
    knowledgePoint.applicationCapability,
    (knowledgePoint.operationModels ?? []).map((model) => [
      model.modelId,
      model.answerType,
      model.canonicalExpressions,
      model.equivalentForms,
      model.validationInvariants,
      Object.keys(model.operandRoles ?? {}),
      model.unknownRoles
    ])
  ]);
}

function classifyKnowledgePoint({ knowledgePoint, bindings, policy }) {
  const declared = knowledgePoint.applicationCapability ?? 'UNASSESSED';
  const existingApplicationQuestionCount = knowledgePoint.existingApplicationQuestionCount
    ?? bindings.filter((row) => row.questionType === 'application').length;
  const corpus = operationCorpus(knowledgePoint);
  const answerTypes = (knowledgePoint.operationModels ?? []).map((model) => String(model.answerType ?? '').toLowerCase());
  const pureSymbolic = includesAny(corpus, policy.pureSymbolicTokens)
    || answerTypes.some((answerType) => policy.pureSymbolicAnswerTypes.includes(answerType));

  if (declared === 'REQUIRED') {
    return {
      classification: 'APPLICATION_REQUIRED',
      classificationReason: 'DECLARED_REQUIRED_BY_KNOWLEDGE_OPERATION',
      assessmentAuthority: 'KNOWLEDGE_OPERATION_DECLARATION',
      existingApplicationQuestionCount
    };
  }
  if (existingApplicationQuestionCount > 0) {
    return {
      classification: 'APPLICATION_REQUIRED',
      classificationReason: 'EXISTING_APPLICATION_QUESTION_EVIDENCE',
      assessmentAuthority: 'EXISTING_QUESTION_BINDING',
      existingApplicationQuestionCount
    };
  }
  if (declared === 'NOT_APPLICABLE') {
    return {
      classification: 'APPLICATION_NOT_APPLICABLE',
      classificationReason: 'DECLARED_NOT_APPLICABLE_BY_KNOWLEDGE_OPERATION',
      assessmentAuthority: 'KNOWLEDGE_OPERATION_DECLARATION',
      existingApplicationQuestionCount
    };
  }
  if (pureSymbolic) {
    return {
      classification: 'APPLICATION_NOT_APPLICABLE',
      classificationReason: 'PURE_SYMBOLIC_OR_STRUCTURE_ONLY_EVIDENCE',
      assessmentAuthority: 'W01_DETERMINISTIC_BASELINE_POLICY',
      existingApplicationQuestionCount
    };
  }
  const models = knowledgePoint.operationModels ?? [];
  const quantitativeEvidence = models.length > 0 && models.every((model) => (
    Object.keys(model.operandRoles ?? {}).length >= 2
    && (model.unknownRoles ?? []).length >= 1
    && Boolean(model.answerType)
    && (model.validationInvariants ?? []).length >= 1
  ));
  if (!quantitativeEvidence) {
    return {
      classification: 'APPLICATION_NOT_APPLICABLE',
      classificationReason: 'INSUFFICIENT_QUANTITY_ROLE_EVIDENCE',
      assessmentAuthority: 'W01_DETERMINISTIC_BASELINE_POLICY',
      existingApplicationQuestionCount
    };
  }
  return {
    classification: 'APPLICATION_COMPATIBLE',
    classificationReason: includesAny(corpus, policy.applicationPositiveTokens)
      ? 'QUANTITATIVE_ROLE_AND_APPLICATION_SEMANTIC_INDICATOR'
      : 'QUANTITATIVE_ROLE_WITH_DIRECT_USE_PATH',
    assessmentAuthority: 'W01_DETERMINISTIC_BASELINE_POLICY',
    existingApplicationQuestionCount
  };
}

function deriveOperationFamilies(knowledgePoint, policy) {
  const corpus = operationCorpus(knowledgePoint);
  const families = policy.operationFamilyRules
    .filter((rule) => includesAny(corpus, rule.tokens))
    .map((rule) => rule.family);
  return families.length > 0 ? [...new Set(families)] : [policy.fallbackOperationFamily];
}

function deriveModes({ knowledgePoint, bindings, classification, policy }) {
  if (classification === 'APPLICATION_NOT_APPLICABLE') return [];
  const corpus = operationCorpus(knowledgePoint);
  const answerTypes = (knowledgePoint.operationModels ?? []).map((model) => String(model.answerType ?? '').toLowerCase());
  const modes = ['SINGLE_DIRECT'];
  if (bindings.some((row) => row.questionType === 'reasoning')) modes.push('SINGLE_DIAGNOSTIC');
  const nPlusOne = includesAny(corpus, policy.nPlusOneTokens)
    || answerTypes.some((answerType) => policy.nPlusOneAnswerTypeTokens.some((token) => answerType.includes(token)));
  const pbl = includesAny(corpus, policy.pblTokens)
    || answerTypes.some((answerType) => policy.pblAnswerTypeTokens.some((token) => answerType.includes(token)));
  if (nPlusOne || pbl) modes.push('SINGLE_N_PLUS_1');
  if (pbl) modes.push('PBL_TASK_SET');
  return [...new Set(modes)];
}

function deriveDepth(applicationModes) {
  if (applicationModes.includes('PBL_TASK_SET')) return 'PBL_CANDIDATE';
  if (applicationModes.includes('SINGLE_N_PLUS_1')) return 'N_PLUS_1_CANDIDATE';
  if (applicationModes.includes('SINGLE_DIRECT')) return 'N_DIRECT';
  return 'NOT_APPLICABLE';
}

function eligibleEpisodes(contextAuthority, operationFamilyCandidates, classification) {
  if (classification === 'APPLICATION_NOT_APPLICABLE') return [];
  const ids = operationFamilyCandidates.flatMap((operationFamily) => (
    queryAtomicTaskEpisodes(contextAuthority, { operationFamily }).map((episode) => episode.nodeId)
  ));
  return [...new Set(ids)].sort();
}

export function materializeW01Golden15ApplicationAssessment({ root = process.cwd() } = {}) {
  const masterController = loadPOSTGAPPMasterController({ root });
  const policy = readJson(root, POLICY_PATH);
  const assessmentIndex = readJson(root, ASSESSMENT_INDEX_PATH);
  const existingAdmissionRegistry = readJson(root, EXISTING_ADMISSION_REGISTRY_PATH);
  const records = [];
  const mappingByGoldenId = new Map(
    masterController.unitRegistry.goldenBaselineUnits.map((mapping) => [mapping.goldenUnitId, mapping])
  );

  for (const golden of masterController.goldenRegistries) {
    const registry = golden.registry;
    const mapping = mappingByGoldenId.get(golden.mapping.goldenUnitId);
    for (const knowledgePoint of registry.knowledgePoints ?? []) {
      const bindings = kpBindings(registry, knowledgePoint.knowledgePointId);
      const classificationResult = classifyKnowledgePoint({ knowledgePoint, bindings, policy });
      const operationFamilyCandidates = classificationResult.classification === 'APPLICATION_NOT_APPLICABLE'
        ? []
        : deriveOperationFamilies(knowledgePoint, policy);
      const applicationModes = deriveModes({
        knowledgePoint,
        bindings,
        classification: classificationResult.classification,
        policy
      });
      const eligibleAtomicEpisodeIds = eligibleEpisodes(
        masterController.contextAuthority,
        operationFamilyCandidates,
        classificationResult.classification
      );
      records.push({
        schemaVersion: 1,
        assessmentRecordId: `w01_assessment_${registry.sourceId}_${knowledgePoint.knowledgePointId}`,
        sourceId: registry.sourceId,
        sourceNodeRefs: mapping.sourceNodeRefs,
        knowledgePointId: knowledgePoint.knowledgePointId,
        knowledgePointName: knowledgePoint.knowledgePointName,
        canonicalOperationModelIds: (knowledgePoint.operationModels ?? []).map((model) => model.modelId),
        declaredApplicationCapability: knowledgePoint.applicationCapability ?? 'UNASSESSED',
        classification: classificationResult.classification,
        classificationReason: classificationResult.classificationReason,
        assessmentAuthority: classificationResult.assessmentAuthority,
        existingApplicationQuestionCount: classificationResult.existingApplicationQuestionCount,
        existingApplicationPresent: classificationResult.existingApplicationQuestionCount > 0,
        existingQuestionTypes: [...new Set(bindings.map((row) => row.questionType))].sort(),
        applicationModes,
        applicationDepth: deriveDepth(applicationModes),
        operationFamilyCandidates,
        eligibleAtomicEpisodeIds,
        backlogAdmissionDecision: classificationResult.classification === 'APPLICATION_NOT_APPLICABLE'
          ? 'EXCLUDED_FROM_APPLICATION_AUTHORING'
          : 'ADMITTED_TO_W01_DESIGN_BACKLOG',
        nextRequiredGate: classificationResult.classification === 'APPLICATION_NOT_APPLICABLE'
          ? 'NONE'
          : 'GLOBAL_CONTEXT_ATOMIC_EPISODE_BINDING_COMPLETE',
        productionAdmissionAllowed: false,
        lineage: {
          knowledgeOperationAuthorityPath: golden.registryPath,
          policyPath: POLICY_PATH,
          assessmentIndexPath: ASSESSMENT_INDEX_PATH,
          contextAuthorityPath: 'data/curriculum/context/registry/global-context-authority-index.json'
        }
      });
    }
  }

  return {
    masterController,
    policy,
    assessmentIndex,
    existingAdmissionRegistry,
    records
  };
}

export function validateW01Golden15ApplicationAssessment(materialized) {
  const issues = [];
  const masterValidation = validatePOSTGAPPMasterController(materialized.masterController);
  if (!masterValidation.ok) {
    issues.push(issue('POSTG_APP_W01_M00_CONTROLLER_INVALID', 'masterController', { controllerIssues: masterValidation.issues }));
  }
  const records = materialized.records;
  const recordKeys = records.map((row) => `${row.sourceId}::${row.knowledgePointId}`);
  const operationModelOwnerCount = records.reduce((total, row) => total + row.canonicalOperationModelIds.length, 0);
  if (materialized.masterController.goldenRegistries.length !== 15) {
    issues.push(issue('POSTG_APP_W01_GOLDEN_UNIT_COUNT_INVALID', 'goldenRegistries', { actual: materialized.masterController.goldenRegistries.length }));
  }
  if (records.length !== 156) issues.push(issue('POSTG_APP_W01_KP_COUNT_INVALID', 'records', { expected: 156, actual: records.length }));
  if (operationModelOwnerCount !== 156) {
    issues.push(issue('POSTG_APP_W01_OPERATION_MODEL_OWNER_COUNT_INVALID', 'records', { expected: 156, actual: operationModelOwnerCount }));
  }
  if (!unique(recordKeys)) issues.push(issue('POSTG_APP_W01_KP_IDENTITY_DUPLICATED', 'records'));

  const validClassifications = new Set([
    'APPLICATION_REQUIRED',
    'APPLICATION_COMPATIBLE',
    'APPLICATION_NOT_APPLICABLE'
  ]);
  for (const record of records) {
    if (!validClassifications.has(record.classification)) {
      issues.push(issue('POSTG_APP_W01_KP_UNCLASSIFIED', record.assessmentRecordId, { classification: record.classification }));
    }
    if (record.existingApplicationPresent && record.classification !== 'APPLICATION_REQUIRED') {
      issues.push(issue('POSTG_APP_W01_EXISTING_APPLICATION_DOWNGRADED', record.assessmentRecordId));
    }
    if (record.classification === 'APPLICATION_NOT_APPLICABLE') {
      if (record.applicationModes.length !== 0 || record.eligibleAtomicEpisodeIds.length !== 0) {
        issues.push(issue('POSTG_APP_W01_NOT_APPLICABLE_HAS_APPLICATION_OUTPUT', record.assessmentRecordId));
      }
      if (record.backlogAdmissionDecision !== 'EXCLUDED_FROM_APPLICATION_AUTHORING') {
        issues.push(issue('POSTG_APP_W01_NOT_APPLICABLE_BACKLOG_DECISION_INVALID', record.assessmentRecordId));
      }
    } else {
      if (!record.applicationModes.includes('SINGLE_DIRECT')) {
        issues.push(issue('POSTG_APP_W01_SUITABLE_KP_MISSING_DIRECT_MODE', record.assessmentRecordId));
      }
      if (record.eligibleAtomicEpisodeIds.length === 0) {
        issues.push(issue('POSTG_APP_W01_SUITABLE_KP_HAS_NO_CONTEXT_EPISODE', record.assessmentRecordId));
      }
      if (record.backlogAdmissionDecision !== 'ADMITTED_TO_W01_DESIGN_BACKLOG') {
        issues.push(issue('POSTG_APP_W01_SUITABLE_KP_BACKLOG_DECISION_INVALID', record.assessmentRecordId));
      }
    }
    if (record.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W01_PRODUCTION_ADMISSION_FORBIDDEN', record.assessmentRecordId));
    }
  }

  const existingPilotProductionAdmissions = materialized.existingAdmissionRegistry.admissionRecords
    .filter((row) => row.productionAdmissionAllowed === true);
  if (existingPilotProductionAdmissions.length !== 0) {
    issues.push(issue('POSTG_APP_W01_EXISTING_PILOT_PRODUCTION_ADMISSION_FORBIDDEN', 'existingAdmissionRegistry'));
  }

  const classificationCounts = records.reduce((counts, row) => {
    counts[row.classification] = (counts[row.classification] ?? 0) + 1;
    return counts;
  }, {});
  const modeCounts = records.reduce((counts, row) => {
    for (const mode of row.applicationModes) counts[mode] = (counts[mode] ?? 0) + 1;
    return counts;
  }, {});
  const unitSummaries = materialized.masterController.goldenRegistries.map((golden) => {
    const unitRecords = records.filter((row) => row.sourceId === golden.mapping.goldenUnitId);
    return {
      sourceId: golden.mapping.goldenUnitId,
      sourceNodeRefs: golden.mapping.sourceNodeRefs,
      knowledgePointCount: unitRecords.length,
      requiredCount: unitRecords.filter((row) => row.classification === 'APPLICATION_REQUIRED').length,
      compatibleCount: unitRecords.filter((row) => row.classification === 'APPLICATION_COMPATIBLE').length,
      notApplicableCount: unitRecords.filter((row) => row.classification === 'APPLICATION_NOT_APPLICABLE').length,
      existingApplicationKnowledgePointCount: unitRecords.filter((row) => row.existingApplicationPresent).length,
      designBacklogCount: unitRecords.filter((row) => row.backlogAdmissionDecision === 'ADMITTED_TO_W01_DESIGN_BACKLOG').length
    };
  });

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      goldenUnitCount: materialized.masterController.goldenRegistries.length,
      sourceNodeCoverageCount: new Set(records.flatMap((row) => row.sourceNodeRefs)).size,
      knowledgePointCount: records.length,
      operationModelOwnerCount,
      existingApplicationKnowledgePointCount: records.filter((row) => row.existingApplicationPresent).length,
      designBacklogCount: records.filter((row) => row.backlogAdmissionDecision === 'ADMITTED_TO_W01_DESIGN_BACKLOG').length,
      excludedCount: records.filter((row) => row.backlogAdmissionDecision === 'EXCLUDED_FROM_APPLICATION_AUTHORING').length,
      unclassifiedCount: records.filter((row) => !validClassifications.has(row.classification)).length,
      productionAdmittedRecordCount: records.filter((row) => row.productionAdmissionAllowed === true).length
    },
    classificationCounts,
    modeCounts,
    unitSummaries,
    nextShortestStep: materialized.assessmentIndex.nextShortestStep,
    status: issues.length === 0
      ? 'W01_GOLDEN15_APPLICATION_CAPABILITY_ASSESSMENT_READY'
      : 'W01_GOLDEN15_APPLICATION_CAPABILITY_ASSESSMENT_BLOCKED'
  };
}

export function buildW01Golden15AssessmentReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW01Golden15ApplicationAssessment({ root });
  const validation = validateW01Golden15ApplicationAssessment(materialized);
  return {
    ...validation,
    programId: materialized.assessmentIndex.programId,
    taskId: materialized.assessmentIndex.taskId,
    sampleRecords: {
      required: materialized.records.find((row) => row.classification === 'APPLICATION_REQUIRED') ?? null,
      compatible: materialized.records.find((row) => row.classification === 'APPLICATION_COMPATIBLE') ?? null,
      notApplicable: materialized.records.find((row) => row.classification === 'APPLICATION_NOT_APPLICABLE') ?? null
    }
  };
}
