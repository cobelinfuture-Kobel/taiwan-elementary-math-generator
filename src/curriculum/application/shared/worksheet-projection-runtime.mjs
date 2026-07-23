import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW02ValidatorShadowFixtures,
  validateW02ValidatorShadowRuntime
} from '../w02-validator-fixture-shadow-runtime.mjs';
import {
  loadSharedApplicationRegistries,
  resolveWaveApplicationAccess,
  validateSharedApplicationRegistries
} from './application-capability-resolver.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w02-shared-worksheet-projection-policy.json';
const INDEX_PATH = 'data/curriculum/application/assessment/w02-shared-worksheet-projection-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const safeId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
const sortedUnique = (values) => [...new Set(values)].sort();
const countBy = (rows, selector) => rows.reduce((counts, row) => {
  const key = selector(row);
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function capabilityType(candidate) {
  return candidate.classification === 'APPLICATION_REQUIRED'
    ? 'APPLICATION_REQUIRED'
    : 'APPLICATION_COMPATIBLE';
}

function applicationCapabilityEntry(candidate, fixture, policy) {
  const suffix = safeId(candidate.patternSpecId);
  return {
    schemaVersion: 1,
    applicationCapabilityEntryId: `app_cap_w02_${suffix}`,
    waveId: 'W02',
    sourceNodeId: candidate.sourceId,
    unitId: candidate.sourceId,
    knowledgePointId: candidate.knowledgePointId,
    patternSpecId: candidate.patternSpecId,
    applicationGroupId: `app_group_w02_${safeId(candidate.sourceId)}_${suffix}`,
    capabilityType: capabilityType(candidate),
    questionMode: policy.questionMode,
    admissionState: policy.applicationCapabilityAdmissionState,
    publicSelectable: false,
    generatorAdapterId: policy.generatorAdapterId,
    validatorAdapterId: fixture.fixtureAdapterId,
    worksheetProjectionAdapterId: policy.worksheetProjectionAdapterId,
    supportsPreview: false,
    supportsPrint: false,
    supportsAnswerKey: true
  };
}

function applicationQuestionRecord(candidate, proof, fixture, capabilityEntry) {
  const suffix = safeId(candidate.patternSpecId);
  return {
    schemaVersion: 1,
    applicationQuestionRecordId: `app_qr_w02_${suffix}`,
    waveId: 'W02',
    sourceNodeId: candidate.sourceId,
    unitId: candidate.sourceId,
    knowledgePointId: candidate.knowledgePointId,
    patternSpecId: candidate.patternSpecId,
    bindingCandidateId: candidate.bindingCandidateId,
    proofCandidateId: proof.proofCandidateId,
    applicationCapabilityEntryId: capabilityEntry.applicationCapabilityEntryId,
    questionMode: 'APPLICATION',
    capabilityType: capabilityEntry.capabilityType,
    promptZh: candidate.promptBlueprint.textZh,
    contextLineage: structuredClone(fixture.contextLineage),
    answerShape: fixture.answerShape,
    validatorEvidence: {
      fixtureId: fixture.fixtureId,
      fixtureAdapterId: fixture.fixtureAdapterId,
      operationFamilyId: fixture.operationFamilyId,
      validationStatus: 'PASS_SHARED_SHADOW_RUNTIME'
    },
    productionSelectable: false,
    publicSelectable: false
  };
}

function answerKeyRecord(candidate, fixture, questionRecord) {
  return {
    schemaVersion: 1,
    answerKeyRecordId: `answer_key_${questionRecord.applicationQuestionRecordId}`,
    applicationQuestionRecordId: questionRecord.applicationQuestionRecordId,
    waveId: 'W02',
    sourceNodeId: candidate.sourceId,
    answerPayload: structuredClone(fixture.answerPayload),
    answerRole: fixture.answerRole,
    answerUnitCandidate: fixture.answerUnitCandidate,
    interpretationStatementCandidate: candidate.answerModelCandidate.interpretationStatementCandidate,
    validationEvidenceRef: fixture.fixtureId,
    productionSelectable: false
  };
}

function pblTaskSetRecord(pbl) {
  return {
    schemaVersion: 1,
    pblTaskSetRecordId: `pbl_record_${safeId(pbl.pblCandidateId)}`,
    pblCandidateId: pbl.pblCandidateId,
    waveId: 'W02',
    sourceNodeId: pbl.sourceId,
    patternSpecId: pbl.patternSpecId,
    primaryKnowledgePointId: pbl.primaryKnowledgePointId,
    graphType: pbl.graphType,
    drivingProblem: structuredClone(pbl.drivingProblemCandidate),
    tasks: structuredClone(pbl.taskBlueprints),
    milestones: structuredClone(pbl.milestoneBlueprints),
    finalProduct: structuredClone(pbl.finalProductCandidate),
    pageProjectionCandidate: pbl.projectionCandidate,
    productionSelectable: false
  };
}

function pblPagePlan(records) {
  if (records.some((row) => row.graphType === 'PBL5_BOUNDED_DECISION')) {
    return 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE';
  }
  if (records.some((row) => row.graphType === 'PBL3_LINEAR')) {
    return 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE';
  }
  return 'NO_PBL_SECTION';
}

function printMetadata(records, policy) {
  return {
    schemaVersion: 1,
    questionMode: 'APPLICATION',
    layoutIntent: 'CONTENT_AWARE_SHARED_WORKSHEET',
    pblPagePlan: pblPagePlan(records),
    unapprovedPblSplitAllowed: false,
    forbiddenVisibleLabels: [...policy.forbiddenVisibleLabels],
    rendererRouteId: 'EXISTING_WORKSHEET_RENDERER_PENDING_A06',
    supportsPreview: false,
    supportsPrint: false,
    supportsAnswerKey: true,
    dataOnlyShadow: true
  };
}

function worksheetProjection(sourceNodeId, questionRecords, answerRecords, pblRecords, policy) {
  return {
    schemaVersion: 1,
    worksheetProjectionId: `shared_ws_shadow_w02_${safeId(sourceNodeId)}`,
    waveId: 'W02',
    sourceNodeId,
    unitId: sourceNodeId,
    questionMode: 'APPLICATION',
    applicationQuestionRecords: questionRecords,
    answerKeyRecords: answerRecords,
    pblTaskSetRecords: pblRecords,
    printMetadata: printMetadata(pblRecords, policy),
    modeSeparation: {
      activeQuestionMode: 'APPLICATION',
      numericPatternSpecsProjected: false,
      applicationPatternSpecsProjected: true,
      forcedStoryAuthoringAllowed: false
    },
    projectionStatus: policy.projectionStatus,
    productionSelectable: false,
    publicSelectable: false
  };
}

function duplicateProjectionParity(a04, questionRecords, pblRecords) {
  const candidateByPattern = a04.a03.candidateByPatternSpecId;
  const groups = new Map();
  for (const question of questionRecords) {
    const candidate = candidateByPattern.get(question.patternSpecId);
    if (!candidate) continue;
    if (!groups.has(candidate.sourceContentIdentityGroup)) groups.set(candidate.sourceContentIdentityGroup, new Map());
    const bySource = groups.get(candidate.sourceContentIdentityGroup);
    if (!bySource.has(question.sourceNodeId)) bySource.set(question.sourceNodeId, { questions: [], pbl: [] });
    bySource.get(question.sourceNodeId).questions.push({
      capabilityType: question.capabilityType,
      promptZh: question.promptZh,
      answerShape: question.answerShape,
      fixtureAdapterId: question.validatorEvidence.fixtureAdapterId,
      operationFamilyId: question.validatorEvidence.operationFamilyId
    });
  }
  for (const pbl of pblRecords) {
    const candidate = candidateByPattern.get(pbl.patternSpecId);
    if (!candidate || !groups.has(candidate.sourceContentIdentityGroup)) continue;
    const bySource = groups.get(candidate.sourceContentIdentityGroup);
    if (!bySource.has(pbl.sourceNodeId)) bySource.set(pbl.sourceNodeId, { questions: [], pbl: [] });
    bySource.get(pbl.sourceNodeId).pbl.push({
      graphType: pbl.graphType,
      pageProjectionCandidate: pbl.pageProjectionCandidate,
      taskCount: pbl.tasks.length,
      milestoneCount: pbl.milestones.length
    });
  }
  const comparisons = [];
  for (const [contentIdentityGroup, bySource] of groups) {
    if (bySource.size < 2) continue;
    const normalized = [...bySource.entries()].map(([sourceNodeId, value]) => ({
      sourceNodeId,
      projection: {
        questions: value.questions.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
        pbl: value.pbl.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
      }
    }));
    const expected = JSON.stringify(normalized[0].projection);
    comparisons.push({
      contentIdentityGroup,
      sourceNodeIds: normalized.map((row) => row.sourceNodeId).sort(),
      equal: normalized.every((row) => JSON.stringify(row.projection) === expected)
    });
  }
  return comparisons;
}

export function materializeSharedW02WorksheetProjection({ root = process.cwd() } = {}) {
  const a04 = materializeW02ValidatorShadowFixtures({ root });
  const policy = readJson(root, POLICY_PATH);
  const index = readJson(root, INDEX_PATH);
  const registries = loadSharedApplicationRegistries({ root });
  const registryValidation = validateSharedApplicationRegistries(registries);
  const a04Validation = validateW02ValidatorShadowRuntime(a04);
  const w02Access = resolveWaveApplicationAccess(registries, 'W02', 'SHADOW');
  const w03Access = resolveWaveApplicationAccess(registries, 'W03', 'SHADOW');

  const positiveByBinding = new Map(
    a04.fixtures
      .filter((row) => row.fixtureType === 'POSITIVE_SINGLE_APPLICATION')
      .map((row) => [row.bindingCandidateId, row])
  );
  const capabilityEntries = [];
  const applicationQuestionRecords = [];
  const answerKeyRecords = [];
  for (const candidate of a04.a03.a02.candidates) {
    const fixture = positiveByBinding.get(candidate.bindingCandidateId);
    const proof = a04.a03.proofByPatternSpecId.get(candidate.patternSpecId);
    if (!fixture || !proof) continue;
    const capabilityEntry = applicationCapabilityEntry(candidate, fixture, policy);
    const questionRecord = applicationQuestionRecord(candidate, proof, fixture, capabilityEntry);
    capabilityEntries.push(capabilityEntry);
    applicationQuestionRecords.push(questionRecord);
    answerKeyRecords.push(answerKeyRecord(candidate, fixture, questionRecord));
  }
  const pblTaskSetRecords = a04.a03.pblTaskSetCandidates.map(pblTaskSetRecord);

  const sourceNodeIds = sortedUnique(applicationQuestionRecords.map((row) => row.sourceNodeId));
  const projections = sourceNodeIds.map((sourceNodeId) => worksheetProjection(
    sourceNodeId,
    applicationQuestionRecords.filter((row) => row.sourceNodeId === sourceNodeId),
    answerKeyRecords.filter((row) => row.sourceNodeId === sourceNodeId),
    pblTaskSetRecords.filter((row) => row.sourceNodeId === sourceNodeId),
    policy
  ));

  return {
    root,
    a04,
    a04Validation,
    policy,
    index,
    registries,
    registryValidation,
    access: { w02: w02Access, w03: w03Access },
    capabilityEntries,
    applicationQuestionRecords,
    answerKeyRecords,
    pblTaskSetRecords,
    projections,
    duplicateComparisons: duplicateProjectionParity(a04, applicationQuestionRecords, pblTaskSetRecords)
  };
}

function pblRecordValid(record, policy) {
  const expectedCount = record.graphType === 'PBL5_BOUNDED_DECISION' ? 5 : 3;
  const expectedProjection = policy.pblProjectionPolicy[record.graphType];
  if (record.tasks.length !== expectedCount
      || record.milestones.length !== expectedCount
      || record.pageProjectionCandidate !== expectedProjection
      || record.productionSelectable !== false) return false;
  const taskIds = new Set(record.tasks.map((row) => row.taskId));
  const milestoneIds = new Set(record.milestones.map((row) => row.milestoneId));
  if (!taskIds.has(record.finalProduct.finalTaskId)) return false;
  if (record.finalProduct.requiredMilestoneIds.length < 2
      || record.finalProduct.requiredMilestoneIds.some((id) => !milestoneIds.has(id))) return false;
  return record.tasks.every((task, index) => (
    index === 0
      ? task.inputRefs.length === 0
      : task.inputRefs.length > 0 && task.inputRefs.every((id) => milestoneIds.has(id))
  ));
}

export function validateSharedW02WorksheetProjection(materialized) {
  const issues = [];
  const expected = materialized.index.expectedCounts;
  if (!materialized.registryValidation.ok) {
    issues.push(issue('POSTG_APP_W02_A05_SHARED_REGISTRY_INVALID', 'registries', { registryIssues: materialized.registryValidation.issues }));
  }
  if (!materialized.a04Validation.ok) {
    issues.push(issue('POSTG_APP_W02_A05_A04_RUNTIME_INVALID', 'a04', { a04Issues: materialized.a04Validation.issues }));
  }
  if (!materialized.access.w02.ok) issues.push(issue(materialized.access.w02.errorCode, 'W02'));
  if (materialized.access.w03.ok || materialized.access.w03.errorCode !== 'POSTG_APP_SHARED_WAVE_SHADOW_PROJECTION_FORBIDDEN') {
    issues.push(issue('POSTG_APP_W02_A05_FUTURE_WAVE_FAIL_CLOSED_INVALID', 'W03'));
  }

  const counts = {
    sourceNodeCount: sortedUnique(materialized.applicationQuestionRecords.map((row) => row.sourceNodeId)).length,
    applicationCapabilityEntryCount: materialized.capabilityEntries.length,
    applicationQuestionRecordCount: materialized.applicationQuestionRecords.length,
    answerKeyRecordCount: materialized.answerKeyRecords.length,
    pblTaskSetRecordCount: materialized.pblTaskSetRecords.length,
    pbl3TaskSetRecordCount: materialized.pblTaskSetRecords.filter((row) => row.graphType === 'PBL3_LINEAR').length,
    pbl5TaskSetRecordCount: materialized.pblTaskSetRecords.filter((row) => row.graphType === 'PBL5_BOUNDED_DECISION').length,
    worksheetProjectionCount: materialized.projections.length,
    futureWaveFailClosedFixtureCount: materialized.access.w03.ok ? 0 : 1,
    productionAdmittedCount: materialized.capabilityEntries.filter((row) => row.admissionState === 'PRODUCTION_ADMITTED').length,
    publicSelectableCount: materialized.capabilityEntries.filter((row) => row.publicSelectable).length,
    shadowHtmlCount: materialized.projections.filter((row) => Object.hasOwn(row, 'shadowHtml')).length
  };
  for (const [key, value] of Object.entries(expected)) {
    if (counts[key] !== value) issues.push(issue('POSTG_APP_W02_A05_COUNT_MISMATCH', `counts.${key}`, { expected: value, actual: counts[key] }));
  }
  if (counts.worksheetProjectionCount !== expected.sourceNodeCount) {
    issues.push(issue('POSTG_APP_W02_A05_PROJECTION_SOURCE_COVERAGE_INVALID', 'projections'));
  }
  if (counts.shadowHtmlCount !== 0) issues.push(issue('POSTG_APP_W02_A05_HTML_GENERATION_FORBIDDEN', 'projections'));

  const capabilityIds = materialized.capabilityEntries.map((row) => row.applicationCapabilityEntryId);
  const questionIds = materialized.applicationQuestionRecords.map((row) => row.applicationQuestionRecordId);
  const answerQuestionIds = materialized.answerKeyRecords.map((row) => row.applicationQuestionRecordId);
  if (new Set(capabilityIds).size !== capabilityIds.length || new Set(questionIds).size !== questionIds.length) {
    issues.push(issue('POSTG_APP_W02_A05_RECORD_IDENTITY_DUPLICATED', 'records'));
  }
  if (JSON.stringify([...questionIds].sort()) !== JSON.stringify([...answerQuestionIds].sort())) {
    issues.push(issue('POSTG_APP_W02_A05_QUESTION_ANSWER_PAIRING_INVALID', 'answerKeyRecords'));
  }

  const capabilityById = new Map(materialized.capabilityEntries.map((row) => [row.applicationCapabilityEntryId, row]));
  const fixtureById = new Map(materialized.a04.fixtures.map((row) => [row.fixtureId, row]));
  const proofById = new Map(materialized.a04.a03.nPlusOneProofCandidates.map((row) => [row.proofCandidateId, row]));
  for (const question of materialized.applicationQuestionRecords) {
    const capability = capabilityById.get(question.applicationCapabilityEntryId);
    const fixture = fixtureById.get(question.validatorEvidence.fixtureId);
    const proof = proofById.get(question.proofCandidateId);
    if (!capability || !fixture || !proof
        || fixture.fixtureType !== 'POSITIVE_SINGLE_APPLICATION'
        || fixture.expectedValidation.shouldPass !== true
        || fixture.bindingCandidateId !== question.bindingCandidateId
        || proof.bindingCandidateId !== question.bindingCandidateId
        || capability.patternSpecId !== question.patternSpecId) {
      issues.push(issue('POSTG_APP_W02_A05_RECORD_LINEAGE_INVALID', question.applicationQuestionRecordId));
    }
    if (materialized.policy.forbiddenVisibleLabels.some((label) => question.promptZh.includes(label))) {
      issues.push(issue('POSTG_APP_W02_A05_FORBIDDEN_VISIBLE_LABEL', question.applicationQuestionRecordId));
    }
  }

  const candidateByPattern = materialized.a04.a03.candidateByPatternSpecId;
  for (const pbl of materialized.pblTaskSetRecords) {
    const candidate = candidateByPattern.get(pbl.patternSpecId);
    if (!candidate || candidate.classification !== 'APPLICATION_REQUIRED' || !pblRecordValid(pbl, materialized.policy)) {
      issues.push(issue('POSTG_APP_W02_A05_PBL_PROJECTION_INVALID', pbl.pblTaskSetRecordId));
    }
  }

  for (const projection of materialized.projections) {
    const projectionQuestionIds = projection.applicationQuestionRecords.map((row) => row.applicationQuestionRecordId).sort();
    const projectionAnswerIds = projection.answerKeyRecords.map((row) => row.applicationQuestionRecordId).sort();
    if (JSON.stringify(projectionQuestionIds) !== JSON.stringify(projectionAnswerIds)
        || projection.questionMode !== 'APPLICATION'
        || projection.modeSeparation.numericPatternSpecsProjected !== false
        || projection.modeSeparation.applicationPatternSpecsProjected !== true
        || projection.productionSelectable !== false
        || projection.publicSelectable !== false
        || projection.printMetadata.dataOnlyShadow !== true
        || projection.printMetadata.supportsPreview !== false
        || projection.printMetadata.supportsPrint !== false) {
      issues.push(issue('POSTG_APP_W02_A05_WORKSHEET_PROJECTION_INVALID', projection.worksheetProjectionId));
    }
  }

  if (materialized.duplicateComparisons.length !== 1
      || !materialized.duplicateComparisons.every((row) => row.equal)) {
    issues.push(issue('POSTG_APP_W02_A05_DUPLICATE_PROJECTION_PARITY_INVALID', 'duplicateComparisons', { comparisons: materialized.duplicateComparisons }));
  }

  return {
    ok: issues.length === 0,
    issues,
    counts,
    classificationCounts: countBy(materialized.capabilityEntries, (row) => row.capabilityType),
    pblGraphCounts: countBy(materialized.pblTaskSetRecords, (row) => row.graphType),
    duplicateComparisons: materialized.duplicateComparisons,
    accessReadback: materialized.access,
    nextShortestStep: materialized.index.nextShortestStep,
    status: issues.length === 0
      ? 'W02_SHARED_WORKSHEET_PROJECTION_SHADOW_PASS'
      : 'W02_SHARED_WORKSHEET_PROJECTION_BLOCKED'
  };
}

export function buildSharedW02WorksheetProjectionReadback({ root = process.cwd() } = {}) {
  const materialized = materializeSharedW02WorksheetProjection({ root });
  const validation = validateSharedW02WorksheetProjection(materialized);
  return {
    ...validation,
    programId: materialized.index.programId,
    taskId: materialized.index.taskId,
    sampleCapabilityEntry: materialized.capabilityEntries[0] ?? null,
    sampleQuestionRecord: materialized.applicationQuestionRecords[0] ?? null,
    sampleAnswerKeyRecord: materialized.answerKeyRecords[0] ?? null,
    samplePBLTaskSetRecord: materialized.pblTaskSetRecords[0] ?? null,
    sampleWorksheetProjection: materialized.projections[0] ?? null
  };
}
