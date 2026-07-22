import fs from 'node:fs';
import path from 'node:path';

import {
  loadPOSTGAPPMasterController,
  resolvePOSTGAPPWave,
  validatePOSTGAPPMasterController
} from './postg-app-master-controller.mjs';

const BASELINE_PATH = 'data/curriculum/application/assessment/w02-source13-source-authority-baseline.json';
const POLICY_PATH = 'data/curriculum/application/assessment/w02-source13-application-capability-policy.json';
const INDEX_PATH = 'data/curriculum/application/assessment/w02-source13-application-assessment-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const unique = (values) => new Set(values).size === values.length;

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function materializeRecord(root, baseline, policy, record) {
  const knowledgeOperationExists = fs.existsSync(path.join(root, record.knowledgeOperationExpectedPath));
  const readinessDecision = knowledgeOperationExists
    ? policy.knowledgeOperationRules.presentState
    : policy.knowledgeOperationRules.missingState;
  return {
    schemaVersion: 1,
    assessmentRecordId: `w02_source_assessment_${record.sourceNodeId}`,
    queueOrdinal: record.queueOrdinal,
    sourceNodeId: record.sourceNodeId,
    sourceCode: record.sourceCode,
    sourceTitle: record.sourceTitle,
    domainFamily: record.domainFamily,
    sourceMetadata: {
      state: baseline.recordDefaults.sourceMetadataState,
      driveFileId: record.sourceMetadataDriveFileId,
      url: record.sourceMetadataUrl
    },
    knowledgeOperation: {
      expectedPath: record.knowledgeOperationExpectedPath,
      exists: knowledgeOperationExists,
      readinessDecision,
      state: knowledgeOperationExists
        ? 'PRESENT_IN_GITHUB'
        : baseline.recordDefaults.knowledgeOperationStateAtBaseline
    },
    sourceLevelApplicationPotential: baseline.recordDefaults.sourceLevelApplicationPotential,
    kpApplicationClassificationState: policy.applicationAssessmentRules.kpClassificationStateBeforeKnowledgeOperation,
    kpApplicationClassificationComplete: false,
    inferredKnowledgePointCount: 0,
    inferredCanonicalOperationModelCount: 0,
    forcedStoryAuthoringAllowed: baseline.recordDefaults.forcedStoryAuthoringAllowed,
    productionAdmissionAllowed: baseline.recordDefaults.productionAdmissionAllowed,
    nextRequiredGate: policy.nextGateByReadiness[readinessDecision],
    lineage: {
      sourceAuthorityBaselinePath: BASELINE_PATH,
      policyPath: POLICY_PATH,
      assessmentIndexPath: INDEX_PATH,
      sourceMetadataDriveFileId: record.sourceMetadataDriveFileId,
      sourceMetadataUrl: record.sourceMetadataUrl,
      knowledgeOperationExpectedPath: record.knowledgeOperationExpectedPath
    }
  };
}

export function materializeW02Source13ApplicationAssessment({ root = process.cwd() } = {}) {
  const masterController = loadPOSTGAPPMasterController({ root });
  const baseline = readJson(root, BASELINE_PATH);
  const policy = readJson(root, POLICY_PATH);
  const assessmentIndex = readJson(root, INDEX_PATH);
  const wave = resolvePOSTGAPPWave(masterController, 'W02');
  const records = baseline.records.map((record) => materializeRecord(root, baseline, policy, record));
  return {
    root,
    masterController,
    baseline,
    policy,
    assessmentIndex,
    wave,
    records
  };
}

export function validateW02Source13ApplicationAssessment(materialized) {
  const issues = [];
  const { root, masterController, baseline, policy, assessmentIndex, wave, records } = materialized;
  const masterValidation = validatePOSTGAPPMasterController(masterController);
  if (!masterValidation.ok) {
    issues.push(issue('POSTG_APP_W02_A00_CONTROLLER_INVALID', 'masterController', {
      controllerIssues: masterValidation.issues
    }));
  }

  if (!wave || wave.waveId !== 'W02' || wave.sourceNodes.length !== 13) {
    issues.push(issue('POSTG_APP_W02_A00_WAVE_INVALID', 'wave', {
      waveId: wave?.waveId ?? null,
      sourceNodeCount: wave?.sourceNodes?.length ?? null
    }));
  }

  if (records.length !== 13 || baseline.records.length !== 13 || assessmentIndex.materializedAuthority.recordCount !== 13) {
    issues.push(issue('POSTG_APP_W02_A00_SOURCE_COUNT_INVALID', 'records', {
      expected: 13,
      actual: records.length,
      baseline: baseline.records.length,
      index: assessmentIndex.materializedAuthority.recordCount
    }));
  }

  const recordIds = records.map((row) => row.sourceNodeId);
  const expectedIds = wave?.sourceNodeIds ?? [];
  if (!unique(recordIds)) issues.push(issue('POSTG_APP_W02_A00_SOURCE_IDENTITY_DUPLICATED', 'records'));
  if (JSON.stringify(recordIds) !== JSON.stringify(expectedIds)
      || !records.every((row, index) => row.queueOrdinal === index + 1)) {
    issues.push(issue('POSTG_APP_W02_A00_SOURCE_ORDER_INVALID', 'records', {
      expectedIds,
      actualIds: recordIds
    }));
  }

  const metadataIds = records.map((row) => row.sourceMetadata.driveFileId);
  if (!unique(metadataIds)) issues.push(issue('POSTG_APP_W02_A00_SOURCE_METADATA_ID_DUPLICATED', 'records'));

  const validReadiness = new Set(policy.readinessDecisions);
  for (const row of records) {
    const recordPath = `records.${row.sourceNodeId}`;
    if (!row.sourceCode
        || !row.sourceTitle
        || row.sourceMetadata.state !== 'VERIFIED_AVAILABLE'
        || !/^[A-Za-z0-9_-]+$/.test(row.sourceMetadata.driveFileId)
        || !row.sourceMetadata.url.startsWith('https://drive.google.com/file/d/')) {
      issues.push(issue('POSTG_APP_W02_A00_SOURCE_METADATA_INVALID', recordPath));
    }
    if (!row.domainFamily) issues.push(issue('POSTG_APP_W02_A00_DOMAIN_FAMILY_MISSING', recordPath));

    const expectedPath = `data/curriculum/knowledge/units/${row.sourceNodeId}.knowledge-operation.json`;
    if (row.knowledgeOperation.expectedPath !== expectedPath
        || row.lineage.knowledgeOperationExpectedPath !== expectedPath) {
      issues.push(issue('POSTG_APP_W02_A00_KNOWLEDGE_OPERATION_PATH_INVALID', recordPath, {
        expected: expectedPath,
        actual: row.knowledgeOperation.expectedPath
      }));
    }

    const actualExists = fs.existsSync(path.join(root, expectedPath));
    const expectedReadiness = actualExists
      ? policy.knowledgeOperationRules.presentState
      : policy.knowledgeOperationRules.missingState;
    if (row.knowledgeOperation.exists !== actualExists
        || row.knowledgeOperation.readinessDecision !== expectedReadiness
        || !validReadiness.has(row.knowledgeOperation.readinessDecision)) {
      issues.push(issue('POSTG_APP_W02_A00_KNOWLEDGE_OPERATION_STATE_MISMATCH', recordPath, {
        actualExists,
        declaredExists: row.knowledgeOperation.exists,
        expectedReadiness,
        actualReadiness: row.knowledgeOperation.readinessDecision
      }));
    }

    if (row.kpApplicationClassificationState !== 'NOT_PERMITTED_AT_SOURCE_BASELINE'
        || row.kpApplicationClassificationComplete !== false
        || row.inferredKnowledgePointCount !== 0
        || row.inferredCanonicalOperationModelCount !== 0) {
      issues.push(issue('POSTG_APP_W02_A00_PREMATURE_KP_CLASSIFICATION', recordPath));
    }
    if (row.sourceLevelApplicationPotential !== 'MIXED_KP_SPLIT_REQUIRED') {
      issues.push(issue('POSTG_APP_W02_A00_SOURCE_APPLICATION_POTENTIAL_INVALID', recordPath));
    }
    if (row.forcedStoryAuthoringAllowed !== false) {
      issues.push(issue('POSTG_APP_W02_A00_FORCED_STORY_AUTHORIZATION_INVALID', recordPath));
    }
    if (row.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W02_A00_PRODUCTION_ADMISSION_INVALID', recordPath));
    }
  }

  const knowledgeOperationPresentCount = records.filter((row) => row.knowledgeOperation.exists).length;
  const knowledgeOperationMissingCount = records.length - knowledgeOperationPresentCount;
  const metadataAvailableCount = records.filter((row) => row.sourceMetadata.state === 'VERIFIED_AVAILABLE').length;
  const kpClassificationCompleteCount = records.filter((row) => row.kpApplicationClassificationComplete).length;
  const productionAdmissionCount = records.filter((row) => row.productionAdmissionAllowed).length;

  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0
      ? 'PASS_POSTG_APP_W02_A00_SOURCE13_ASSESSMENT_BASELINE'
      : 'FAIL_POSTG_APP_W02_A00_SOURCE13_ASSESSMENT_BASELINE',
    counts: {
      sourceNodeCount: records.length,
      metadataAvailableCount,
      knowledgeOperationPresentCount,
      knowledgeOperationMissingCount,
      kpClassificationCompleteCount,
      productionAdmissionCount
    },
    currentWaveId: 'W02',
    sourceLevelApplicationPotential: 'MIXED_KP_SPLIT_REQUIRED',
    nextShortestStep: assessmentIndex.nextShortestStep
  };
}

export function buildW02Source13ApplicationAssessmentReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW02Source13ApplicationAssessment({ root });
  return validateW02Source13ApplicationAssessment(materialized);
}
