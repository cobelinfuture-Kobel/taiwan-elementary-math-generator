import fs from 'node:fs';
import path from 'node:path';

import {
  materializeW01ValidatorShadowFixtures,
  validateW01ValidatorShadowRuntime
} from './w01-validator-fixture-shadow-runtime.mjs';

const POLICY_PATH = 'data/curriculum/application/assessment/w01-worksheet-shadow-review-policy.json';
const INDEX_PATH = 'data/curriculum/application/assessment/w01-worksheet-shadow-review-index.json';

const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const uniqueSorted = (values) => [...new Set(values)].sort();
const keyOf = (sourceId, knowledgePointId) => `${sourceId}::${knowledgePointId}`;
const safeId = (value) => String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');

function readJson(root, repoPath) {
  return JSON.parse(fs.readFileSync(path.join(root, repoPath), 'utf8'));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function serializeAnswer(answerPayload) {
  return typeof answerPayload === 'string'
    ? answerPayload
    : JSON.stringify(answerPayload);
}

function buildShadowHtml(projection) {
  const questions = projection.questionItems.map((item, index) => (
    `<article class="shadow-question" data-question-id="${escapeHtml(item.questionId)}" data-binding-id="${escapeHtml(item.bindingCandidateId)}">`
      + `<span class="shadow-number">${index + 1}.</span>`
      + `<span class="shadow-prompt">${escapeHtml(item.promptZh)}</span>`
    + '</article>'
  )).join('');
  const pbl = projection.pblSections.map((section) => (
    `<section class="shadow-pbl" data-pbl-id="${escapeHtml(section.pblCandidateId)}" data-projection="${escapeHtml(section.projectionCandidate)}">`
      + section.taskIds.map((taskId, index) => `<div class="shadow-pbl-task" data-task-id="${escapeHtml(taskId)}">${index + 1}.</div>`).join('')
    + '</section>'
  )).join('');
  const answers = projection.answerKeyItems.map((item) => (
    `<li data-question-id="${escapeHtml(item.questionId)}"><strong>${escapeHtml(serializeAnswer(item.answerPayload))}</strong> ${escapeHtml(item.answerUnitCandidate)}</li>`
  )).join('');
  return `<main class="w01-shadow-worksheet" data-source-id="${escapeHtml(projection.sourceId)}"><section class="shadow-questions">${questions}</section>${pbl}<ol class="shadow-answer-key">${answers}</ol></main>`;
}

function pagePlanFor(pblSections, policy) {
  return pblSections.some((row) => row.graphType === 'PBL5_BOUNDED_DECISION')
    ? policy.pblProjectionPolicy.PBL5_BOUNDED_DECISION
    : policy.pblProjectionPolicy.PBL3_LINEAR;
}

export function materializeW01WorksheetShadowReview({ root = process.cwd() } = {}) {
  const a03 = materializeW01ValidatorShadowFixtures({ root });
  const policy = readJson(root, POLICY_PATH);
  const index = readJson(root, INDEX_PATH);
  const positiveByBinding = new Map(
    a03.fixtures
      .filter((row) => row.fixtureType === 'POSITIVE_SINGLE_APPLICATION')
      .map((row) => [row.bindingCandidateId, row])
  );
  const proofByKey = new Map(a03.a02.nPlusOneProofCandidates.map((row) => [keyOf(row.sourceId, row.knowledgePointId), row]));
  const pblBySource = new Map();
  for (const pbl of a03.a02.pblTaskSetCandidates) {
    const rows = pblBySource.get(pbl.sourceId) ?? [];
    rows.push(pbl);
    pblBySource.set(pbl.sourceId, rows);
  }
  const mappingBySource = new Map(
    a03.a02.a01.assessment.masterController.unitRegistry.goldenBaselineUnits
      .map((row) => [row.goldenUnitId, row])
  );
  const assessmentSources = uniqueSorted(a03.a02.a01.assessment.records.map((row) => row.sourceId));
  const candidatesBySource = new Map();
  for (const candidate of a03.a02.a01.candidates) {
    const rows = candidatesBySource.get(candidate.sourceId) ?? [];
    rows.push(candidate);
    candidatesBySource.set(candidate.sourceId, rows);
  }

  const projections = [];
  const excludedReadbacks = [];
  for (const sourceId of assessmentSources) {
    const candidates = candidatesBySource.get(sourceId) ?? [];
    if (candidates.length === 0) {
      excludedReadbacks.push({
        sourceId,
        status: policy.excludedStatus,
        reason: 'NO_APPLICATION_REQUIRED_OR_COMPATIBLE_KNOWLEDGE_POINT',
        projectionCount: 0,
        productionSelectable: false
      });
      continue;
    }
    const questionItems = [];
    const answerKeyItems = [];
    const nPlusOneEvidenceRefs = [];
    for (const candidate of candidates) {
      const fixture = positiveByBinding.get(candidate.bindingCandidateId);
      if (!fixture) continue;
      const questionId = `q_${safeId(candidate.bindingCandidateId)}`;
      questionItems.push({
        questionId,
        bindingCandidateId: candidate.bindingCandidateId,
        knowledgePointId: candidate.knowledgePointId,
        promptZh: candidate.promptBlueprint.textZh,
        contextMacroId: candidate.contextSelection.macroContextId,
        answerShape: candidate.answerModelCandidate.answerShape
      });
      answerKeyItems.push({
        questionId,
        answerPayload: fixture.answerPayload,
        answerRole: fixture.answerRole,
        answerUnitCandidate: fixture.answerUnitCandidate,
        interpretationStatementCandidate: candidate.answerModelCandidate.interpretationStatementCandidate
      });
      const proof = proofByKey.get(keyOf(candidate.sourceId, candidate.knowledgePointId));
      if (proof) nPlusOneEvidenceRefs.push(proof.proofCandidateId);
    }
    const pblSections = (pblBySource.get(sourceId) ?? []).map((pbl) => ({
      pblCandidateId: pbl.pblCandidateId,
      graphType: pbl.graphType,
      projectionCandidate: pbl.projectionCandidate,
      taskIds: pbl.taskBlueprints.map((row) => row.taskId),
      milestoneIds: pbl.milestoneBlueprints.map((row) => row.milestoneId),
      finalTaskId: pbl.finalProductCandidate.finalTaskId
    }));
    const projection = {
      schemaVersion: 1,
      worksheetProjectionId: `w01_ws_shadow_${safeId(sourceId)}`,
      sourceId,
      sourceNodeRefs: mappingBySource.get(sourceId)?.sourceNodeRefs ?? [sourceId],
      questionItems,
      answerKeyItems,
      nPlusOneEvidenceRefs: uniqueSorted(nPlusOneEvidenceRefs),
      pblSections,
      pagePlan: pagePlanFor(pblSections, policy),
      shadowHtml: '',
      projectionStatus: policy.projectionStatus,
      productionSelectable: false
    };
    projection.shadowHtml = buildShadowHtml(projection);
    projections.push(projection);
  }

  const unresolvedUnitCandidateCount = a03.a02.a01.candidates
    .filter((row) => row.unitFlowCandidate.resolutionStatus === 'SEMANTIC_REVIEW_REQUIRED').length;
  const reviewChecks = {
    A03_SHARED_RUNTIME_PASS: false,
    ELIGIBLE_SOURCE_PROJECTION_COMPLETE: false,
    CANDIDATE_ANSWER_KEY_PAIRING_COMPLETE: false,
    PBL_PROJECTION_INTEGRITY_COMPLETE: false,
    UNIT_FLOW_RESOLUTION_COMPLETE: unresolvedUnitCandidateCount === 0,
    EXACT_PRODUCTION_GENERATOR_EVIDENCE: false,
    PRODUCTION_RENDERER_EVIDENCE: false,
    HTML_PDF_EVIDENCE: false,
    PUBLIC_SELECTION_EVIDENCE: false,
    HUMAN_VISUAL_REVIEW_EVIDENCE: false
  };

  return {
    a03,
    policy,
    index,
    assessmentSources,
    projections,
    excludedReadbacks,
    review: {
      reviewId: 'w01_production_admission_review_v1',
      reviewChecks,
      unresolvedUnitCandidateCount,
      reviewDecision: policy.expectedReviewDecision,
      blockers: [
        ...(unresolvedUnitCandidateCount > 0 ? ['UNRESOLVED_UNIT_FLOW_CANDIDATES'] : []),
        'EXACT_PRODUCTION_GENERATOR_EVIDENCE_MISSING',
        'PRODUCTION_RENDERER_EVIDENCE_MISSING',
        'HTML_PDF_EVIDENCE_MISSING',
        'PUBLIC_SELECTION_EVIDENCE_MISSING',
        'HUMAN_VISUAL_REVIEW_EVIDENCE_MISSING'
      ],
      productionAdmissionGranted: false
    }
  };
}

function pblProjectionValid(section, policy) {
  if (section.graphType === 'PBL3_LINEAR') {
    return section.projectionCandidate === policy.pblProjectionPolicy.PBL3_LINEAR
      && section.taskIds.length === 3
      && section.milestoneIds.length >= 2
      && section.taskIds.includes(section.finalTaskId);
  }
  return section.projectionCandidate === policy.pblProjectionPolicy.PBL5_BOUNDED_DECISION
    && section.taskIds.length === 5
    && section.milestoneIds.length >= 2
    && section.taskIds.includes(section.finalTaskId);
}

export function validateW01WorksheetShadowReview(materialized) {
  const issues = [];
  const a03Validation = validateW01ValidatorShadowRuntime(materialized.a03);
  if (!a03Validation.ok) issues.push(issue('POSTG_APP_W01_A04_A03_RUNTIME_INVALID', 'a03', { a03Issues: a03Validation.issues }));

  const eligibleSources = uniqueSorted(materialized.a03.a02.a01.candidates.map((row) => row.sourceId));
  const projectedSources = uniqueSorted(materialized.projections.map((row) => row.sourceId));
  const excludedSources = uniqueSorted(materialized.excludedReadbacks.map((row) => row.sourceId));
  const expectedExcluded = materialized.assessmentSources.filter((row) => !eligibleSources.includes(row));

  if (materialized.assessmentSources.length !== 15) issues.push(issue('POSTG_APP_W01_A04_ASSESSMENT_SCOPE_INVALID', 'assessmentSources'));
  if (JSON.stringify(projectedSources) !== JSON.stringify(eligibleSources)) issues.push(issue('POSTG_APP_W01_A04_PROJECTION_SOURCE_COVERAGE_INVALID', 'projections', { expected: eligibleSources, actual: projectedSources }));
  if (JSON.stringify(excludedSources) !== JSON.stringify(expectedExcluded)) issues.push(issue('POSTG_APP_W01_A04_EXCLUDED_SOURCE_COVERAGE_INVALID', 'excludedReadbacks'));
  if (materialized.excludedReadbacks.some((row) => row.projectionCount !== 0 || row.productionSelectable !== false)) {
    issues.push(issue('POSTG_APP_W01_A04_EXCLUDED_SOURCE_PROJECTED', 'excludedReadbacks'));
  }

  const candidateCount = materialized.a03.a02.a01.candidates.length;
  const projectedQuestionCount = materialized.projections.reduce((sum, row) => sum + row.questionItems.length, 0);
  const answerKeyCount = materialized.projections.reduce((sum, row) => sum + row.answerKeyItems.length, 0);
  const pblCount = materialized.a03.a02.pblTaskSetCandidates.length;
  const projectedPBLCount = materialized.projections.reduce((sum, row) => sum + row.pblSections.length, 0);
  if (projectedQuestionCount !== candidateCount) issues.push(issue('POSTG_APP_W01_A04_CANDIDATE_PROJECTION_COUNT_INVALID', 'projections', { expected: candidateCount, actual: projectedQuestionCount }));
  if (answerKeyCount !== candidateCount) issues.push(issue('POSTG_APP_W01_A04_ANSWER_KEY_COUNT_INVALID', 'projections', { expected: candidateCount, actual: answerKeyCount }));
  if (projectedPBLCount !== pblCount) issues.push(issue('POSTG_APP_W01_A04_PBL_PROJECTION_COUNT_INVALID', 'projections', { expected: pblCount, actual: projectedPBLCount }));

  for (const projection of materialized.projections) {
    const questionIds = projection.questionItems.map((row) => row.questionId);
    const answerIds = projection.answerKeyItems.map((row) => row.questionId);
    if (new Set(questionIds).size !== questionIds.length || JSON.stringify([...questionIds].sort()) !== JSON.stringify([...answerIds].sort())) {
      issues.push(issue('POSTG_APP_W01_A04_QUESTION_ANSWER_PAIRING_INVALID', projection.worksheetProjectionId));
    }
    if (!projection.pblSections.every((row) => pblProjectionValid(row, materialized.policy))) {
      issues.push(issue('POSTG_APP_W01_A04_PBL_PROJECTION_INTEGRITY_INVALID', projection.worksheetProjectionId));
    }
    const expectedPagePlan = pagePlanFor(projection.pblSections, materialized.policy);
    if (projection.pagePlan !== expectedPagePlan) issues.push(issue('POSTG_APP_W01_A04_PAGE_PLAN_INVALID', projection.worksheetProjectionId));
    if (materialized.policy.forbiddenVisibleLabels.some((label) => projection.shadowHtml.includes(label))) {
      issues.push(issue('POSTG_APP_W01_A04_FORBIDDEN_VISIBLE_LABEL', projection.worksheetProjectionId));
    }
    if (projection.productionSelectable !== false || projection.projectionStatus !== 'SHADOW_STRUCTURAL_PROJECTION') {
      issues.push(issue('POSTG_APP_W01_A04_PRODUCTION_SELECTION_FORBIDDEN', projection.worksheetProjectionId));
    }
  }

  materialized.review.reviewChecks.A03_SHARED_RUNTIME_PASS = a03Validation.ok;
  materialized.review.reviewChecks.ELIGIBLE_SOURCE_PROJECTION_COMPLETE = JSON.stringify(projectedSources) === JSON.stringify(eligibleSources);
  materialized.review.reviewChecks.CANDIDATE_ANSWER_KEY_PAIRING_COMPLETE = projectedQuestionCount === candidateCount && answerKeyCount === candidateCount;
  materialized.review.reviewChecks.PBL_PROJECTION_INTEGRITY_COMPLETE = projectedPBLCount === pblCount && materialized.projections.every((projection) => projection.pblSections.every((row) => pblProjectionValid(row, materialized.policy)));

  const evidenceChecks = materialized.policy.productionEvidenceDefaults;
  if (Object.values(evidenceChecks).some((value) => value !== false)) issues.push(issue('POSTG_APP_W01_A04_PRODUCTION_EVIDENCE_DEFAULT_INVALID', 'policy'));
  if (materialized.review.reviewDecision !== 'DEFERRED_PENDING_PRODUCTION_EVIDENCE'
      || materialized.review.productionAdmissionGranted !== false
      || materialized.review.blockers.length === 0) {
    issues.push(issue('POSTG_APP_W01_A04_REVIEW_DECISION_INVALID', 'review'));
  }

  return {
    ok: issues.length === 0,
    issues,
    counts: {
      goldenAssessmentUnitCount: materialized.assessmentSources.length,
      eligibleProjectionUnitCount: projectedSources.length,
      excludedUnitCount: excludedSources.length,
      candidateQuestionCount: projectedQuestionCount,
      answerKeyCount,
      nPlusOneEvidenceRefCount: materialized.projections.reduce((sum, row) => sum + row.nPlusOneEvidenceRefs.length, 0),
      pblProjectionCount: projectedPBLCount,
      unresolvedUnitCandidateCount: materialized.review.unresolvedUnitCandidateCount,
      productionAdmittedUnitCount: 0
    },
    projectedSources,
    excludedSources,
    review: materialized.review,
    nextShortestStep: materialized.index.nextShortestStep,
    status: issues.length === 0
      ? 'W01_WORKSHEET_SHADOW_PROJECTION_PASS_PRODUCTION_REVIEW_DEFERRED'
      : 'W01_WORKSHEET_SHADOW_PROJECTION_OR_REVIEW_BLOCKED'
  };
}

export function buildW01WorksheetShadowReviewReadback({ root = process.cwd() } = {}) {
  const materialized = materializeW01WorksheetShadowReview({ root });
  const validation = validateW01WorksheetShadowReview(materialized);
  return {
    ...validation,
    programId: materialized.index.programId,
    taskId: materialized.index.taskId,
    sampleProjection: materialized.projections[0] ?? null,
    sampleExcludedReadback: materialized.excludedReadbacks[0] ?? null
  };
}
