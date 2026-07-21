import {
  createAnswerKeyItem,
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from '../../../site/modules/core/index.js';
import {
  buildBatchABrowserWorksheetDocument
} from '../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js';
import {
  getVisiblePatternGroupsForKnowledgePoint
} from '../../../site/modules/curriculum/registry/batch-a-selector-extension.js';
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from '../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js';
import {
  resolvePostGoldenSourceUnitAdapterDescriptor
} from '../../../site/modules/curriculum/batch-a/global-public-source-unit-adapter-registry.js';
import {
  materializeW01NPlusOneAndPBLCandidatePack,
  validateW01NPlusOneAndPBLCandidatePack
} from './w01-nplusone-pbl-candidate-pack.mjs';

const REVIEW_TASK_ID = 'POSTG-APP-W01-A05_UnitFlowExactGeneratorRendererAndHumanReviewRemediation';
const REVIEW_MODE = 'postg_app_w01_a05_e4_human_review';
const UNBOUND_UNIT = 'UNBOUND_UNIT_CANDIDATE';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const keyOf = (sourceId, knowledgePointId) => `${sourceId}::${knowledgePointId}`;
const uniqueSorted = (values) => [...new Set(values)].sort();
const issue = (code, path, details = {}) => ({ code, path, ...details });

function safeId(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeVisiblePrompt(value) {
  return String(value ?? '')
    .replaceAll('答案：', '')
    .replace(/_{2,}/g, '□')
    .replace(/\s+/g, ' ')
    .trim();
}

function exactMathSnapshot(question = {}) {
  return {
    expression: clone(question.expression ?? null),
    finalAnswer: clone(question.finalAnswer ?? null),
    answerText: question.answerText ?? null,
    left: question.left ?? null,
    right: question.right ?? null,
    result: question.result ?? null,
    quantities: clone(question.quantities ?? null),
    equationModel: question.equationModel ?? null,
    operatorsUsed: clone(question.operatorsUsed ?? null),
    intermediateResults: clone(question.intermediateResults ?? null),
    patternSpecId: question.patternSpecId ?? question.metadata?.patternId ?? null,
    sourceId: question.sourceId ?? null
  };
}

function replaceSurfaceSlots(template, slots) {
  let output = String(template ?? '');
  for (const [slot, value] of Object.entries(slots)) {
    output = output.replaceAll(`{{${slot}}}`, String(value));
  }
  return normalizeVisiblePrompt(output);
}

function unitFromExactQuestion(question = {}) {
  const candidates = [
    question.answerUnit,
    question.unit,
    question.metadata?.answerUnit,
    question.semanticSnapshot?.answerUnit
  ].filter((value) => typeof value === 'string' && value.trim().length > 0);
  return candidates[0] ?? null;
}

function inferUnitFromSemantic(candidate, chain) {
  const corpus = [
    candidate.targetRoleCandidate.mathSemanticMeaning,
    candidate.targetRoleCandidate.contextSemanticMeaning,
    ...(chain?.episode?.resourceRoles ?? []),
    ...(chain?.episode?.targetRoles ?? [])
  ].join(' ');
  const rules = [
    [/費用|金額|價格|預算|找零|付款/, '元'],
    [/人數|學生|居民|隊員|參與者|乘客/, '人'],
    [/車輛|車數|接駁車/, '輛'],
    [/箱數|書箱|容器|箱/, '箱'],
    [/組數|小組|完整組/, '組'],
    [/本數|書籍/, '本'],
    [/公升|水量|容量/, '公升'],
    [/公斤|重量|質量/, '公斤'],
    [/公尺|距離|長度/, '公尺'],
    [/分鐘|時間|時長/, '分鐘'],
    [/份數|數量|資源總量|材料/, '份']
  ];
  return rules.find(([pattern]) => pattern.test(corpus))?.[1] ?? null;
}

function resolveUnitFlow(candidate, exactQuestion, chain) {
  const original = candidate.targetRoleCandidate.answerUnitCandidate;
  const exact = unitFromExactQuestion(exactQuestion);
  const inferred = inferUnitFromSemantic(candidate, chain);
  const resolved = original !== UNBOUND_UNIT ? original : exact ?? inferred;
  return {
    bindingCandidateId: candidate.bindingCandidateId,
    sourceId: candidate.sourceId,
    knowledgePointId: candidate.knowledgePointId,
    originalAnswerUnitCandidate: original,
    exactGeneratorAnswerUnit: exact,
    semanticInferenceUnit: inferred,
    resolvedAnswerUnitCandidate: resolved ?? UNBOUND_UNIT,
    resolutionStatus: resolved ? 'REVIEW_CANDIDATE_RESOLVED' : 'HUMAN_REVIEW_REQUIRED',
    productionAdmissionAllowed: false
  };
}

function candidateSurfacePrompt(candidate, exactQuestion, chain, macro) {
  const quantityFacts = normalizeVisiblePrompt(
    exactQuestion.blankedDisplayText
      ?? exactQuestion.promptText
      ?? exactQuestion.displayText
      ?? '依題目中的數量資料'
  );
  const slots = {
    place: macro?.labelZh ?? '生活情境中',
    actor: (chain?.episode?.actorRoles ?? ['參與者']).join('與'),
    quantityFacts,
    targetQuantity: candidate.targetRoleCandidate.contextSemanticMeaning,
    constraint: chain?.episode?.constraintModel?.[0] ?? '題目中的限制',
    targetDecision: candidate.targetRoleCandidate.contextSemanticMeaning
  };
  const filled = replaceSurfaceSlots(candidate.promptBlueprint.textZh, slots);
  return filled.includes('{{')
    ? `${slots.place}，${slots.actor}為了${chain?.episode?.eventGoal ?? '完成任務'}，根據${quantityFacts}求出${slots.targetQuantity}。`
    : filled;
}

function textDisplayModel(question, questionNumber) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId ?? question.metadata?.patternId,
    knowledgePointId: question.knowledgePointId,
    questionNumberText: `${questionNumber}.`,
    promptText: question.promptText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    answerText: question.answerText,
    metadataSnapshot: clone(question.metadata),
    semanticSnapshot: clone(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(question.blankedDisplayText ?? '').length,
      hasGrouping: true,
      avoidPageBreakInside: true,
      representation: 'application_review_candidate',
      longTextCardPolicy: 'avoidSplit'
    }
  };
}

function textAnswerKeyItem(question, displayModel) {
  const base = createAnswerKeyItem(question, displayModel);
  return {
    ...base,
    questionId: question.id,
    questionNumber: displayModel.questionNumber,
    patternId: question.patternSpecId ?? question.metadata?.patternId,
    knowledgePointId: question.knowledgePointId,
    promptText: question.blankedDisplayText,
    answerText: question.answerText,
    answerUnit: question.answerUnit,
    interpretationStatement: question.applicationReview?.interpretationStatement,
    metadataSnapshot: clone(question.metadata),
    semanticSnapshot: clone(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(`${question.blankedDisplayText ?? ''}${question.answerText ?? ''}`).length,
      avoidPageBreakInside: true,
      representation: 'application_review_answer'
    }
  };
}

function exactGenerationForCandidate(candidate, generationSeed) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(candidate.knowledgePointId)
    .filter((group) => group.sourceId == null || group.sourceId === candidate.sourceId)
    .sort((left, right) => String(left.patternGroupId).localeCompare(String(right.patternGroupId)));
  const descriptor = resolvePostGoldenSourceUnitAdapterDescriptor(candidate.sourceId);
  const attempts = [];
  for (const group of groups) {
    const options = {
      sourceId: candidate.sourceId,
      selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
      selectedKnowledgePointIds: [candidate.knowledgePointId],
      selectedPatternGroupIds: [group.patternGroupId],
      questionCount: 1,
      ordering: 'groupedByPattern',
      includeAnswerKey: true,
      generationSeed: `${generationSeed}:${candidate.bindingCandidateId}:${group.patternGroupId}`,
      title: `W01 A05 ${candidate.sourceId} review candidate`,
      printLayout: { columns: 1, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
      ...(descriptor?.taskId ? { postGoldenMigrationTaskId: descriptor.taskId } : {})
    };
    const result = buildBatchABrowserWorksheetDocument(options);
    attempts.push({ patternGroupId: group.patternGroupId, ok: result.ok, errors: result.errors ?? [] });
    if (result.ok && result.worksheetDocument?.generatedQuestions?.length === 1) {
      return {
        ok: true,
        group,
        options,
        exactWorksheetDocument: result.worksheetDocument,
        exactQuestion: result.worksheetDocument.generatedQuestions[0],
        attempts
      };
    }
  }
  return { ok: false, group: null, options: null, exactWorksheetDocument: null, exactQuestion: null, attempts };
}

function materializeViableRows(a02, generationSeed) {
  const macroMap = new Map(a02.a01.assessment.masterController.contextAuthority.hierarchy.macroDomains.map((row) => [row.nodeId, row]));
  const rows = [];
  const failures = [];
  for (const candidate of a02.a01.candidates) {
    const exact = exactGenerationForCandidate(candidate, generationSeed);
    if (!exact.ok) {
      failures.push({
        bindingCandidateId: candidate.bindingCandidateId,
        sourceId: candidate.sourceId,
        knowledgePointId: candidate.knowledgePointId,
        errorCode: 'EXACT_PRODUCTION_GENERATOR_ROUTE_NOT_AVAILABLE',
        attempts: exact.attempts
      });
      continue;
    }
    const chain = a02.a01.contextIndexes.episodeChains.get(candidate.contextSelection.atomicEpisodeId);
    const macro = macroMap.get(candidate.contextSelection.macroContextId);
    rows.push({ candidate, exact, chain, macro });
  }
  return { rows, failures };
}

function selectReviewCohort(viableRows, eligibleSources, requiredMacros) {
  const selected = [];
  const selectedIds = new Set();
  const usedMacros = new Set();
  const add = (row) => {
    if (!row || selectedIds.has(row.candidate.bindingCandidateId)) return;
    selected.push(row);
    selectedIds.add(row.candidate.bindingCandidateId);
    usedMacros.add(row.candidate.contextSelection.macroContextId);
  };

  for (const sourceId of eligibleSources) {
    const rows = viableRows.filter((row) => row.candidate.sourceId === sourceId);
    const preferred = rows.find((row) => !usedMacros.has(row.candidate.contextSelection.macroContextId)) ?? rows[0];
    add(preferred);
  }
  for (const macroId of requiredMacros) {
    if (usedMacros.has(macroId)) continue;
    add(viableRows.find((row) => row.candidate.contextSelection.macroContextId === macroId));
  }
  return selected;
}

function transformReviewQuestion(row, sequenceNumber) {
  const { candidate, exact, chain, macro } = row;
  const original = exact.exactQuestion;
  const beforeSnapshot = exactMathSnapshot(original);
  const unitFlow = resolveUnitFlow(candidate, original, chain);
  const prompt = candidateSurfacePrompt(candidate, original, chain, macro);
  const transformed = {
    ...clone(original),
    id: `postg-app-w01-a05-${sequenceNumber}-${safeId(candidate.bindingCandidateId)}`,
    promptText: prompt,
    blankedDisplayText: prompt,
    displayText: `${prompt} ${original.answerText ?? ''}`.trim(),
    answerUnit: unitFlow.resolvedAnswerUnitCandidate,
    knowledgePointId: candidate.knowledgePointId,
    resolvedPatternGroupId: exact.group.patternGroupId,
    productionUse: 'forbidden_pending_human_review',
    selectorStatus: 'hidden',
    visibilityStatus: 'hidden',
    applicationReview: {
      taskId: REVIEW_TASK_ID,
      reviewMode: REVIEW_MODE,
      bindingCandidateId: candidate.bindingCandidateId,
      contextSelection: clone(candidate.contextSelection),
      unitFlow: clone(unitFlow),
      interpretationStatement: candidate.answerModelCandidate.interpretationStatementCandidate,
      exactGeneratorUsed: true,
      productionRendererRequired: true,
      humanReviewReady: true,
      productionAdmissionAllowed: false
    },
    metadata: {
      ...(clone(original.metadata) ?? {}),
      sourceId: candidate.sourceId,
      knowledgePointId: candidate.knowledgePointId,
      applicationReviewTaskId: REVIEW_TASK_ID,
      contextMacroId: candidate.contextSelection.macroContextId,
      contextAtomicEpisodeId: candidate.contextSelection.atomicEpisodeId,
      bindingCandidateId: candidate.bindingCandidateId,
      exactProductionPatternGroupId: exact.group.patternGroupId
    },
    semanticSnapshot: {
      ...(clone(original.semanticSnapshot) ?? {}),
      applicationReview: {
        newInterpretiveAct: candidate.applicationMode === 'SINGLE_N_PLUS_1' ? 'N_PLUS_1_REVIEW_REQUIRED' : 'DIRECT_APPLICATION',
        answerRole: candidate.targetRoleCandidate.mathRoleId,
        answerUnitCandidate: unitFlow.resolvedAnswerUnitCandidate,
        macroContextId: candidate.contextSelection.macroContextId,
        atomicEpisodeId: candidate.contextSelection.atomicEpisodeId
      }
    }
  };
  const afterSnapshot = exactMathSnapshot(transformed);
  return {
    transformed,
    unitFlow,
    exactPatternGroupId: exact.group.patternGroupId,
    exactPatternSpecId: beforeSnapshot.patternSpecId,
    mathPreserved: JSON.stringify(beforeSnapshot) === JSON.stringify(afterSnapshot),
    promptChanged: normalizeVisiblePrompt(original.blankedDisplayText ?? original.promptText) !== prompt,
    originalPrompt: normalizeVisiblePrompt(original.blankedDisplayText ?? original.promptText),
    reviewPrompt: prompt
  };
}

function buildPBLReviewSections(a02, cohortSourceIds) {
  return a02.pblTaskSetCandidates
    .filter((row) => cohortSourceIds.has(row.sourceId))
    .map((pbl) => ({
      pblCandidateId: pbl.pblCandidateId,
      sourceId: pbl.sourceId,
      knowledgePointId: pbl.primaryKnowledgePointId,
      macroContextId: pbl.macroContextId,
      graphType: pbl.graphType,
      projectionCandidate: pbl.projectionCandidate,
      drivingProblemCandidate: clone(pbl.drivingProblemCandidate),
      taskBlueprints: clone(pbl.taskBlueprints),
      milestoneBlueprints: clone(pbl.milestoneBlueprints),
      finalProductCandidate: clone(pbl.finalProductCandidate),
      humanReviewCriteria: [
        'driving problem is authentic and mathematically necessary',
        'every non-first task consumes a prior milestone or shared constraint',
        'final task consumes at least two milestones',
        'projection candidate keeps the complete task chain'
      ],
      productionAdmissionAllowed: false
    }));
}

function buildWorksheetDocument(transformedRows, generationSeed) {
  const questions = transformedRows.map((row) => row.transformed);
  const questionLayout = {
    paperSize: 'A4',
    columns: 1,
    rowsPerPage: 4,
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
    longTextCardPolicy: 'avoidSplit'
  };
  const answerLayout = { ...questionLayout, rowsPerPage: 3 };
  const displayModels = questions.map((question, index) => textDisplayModel(question, index + 1));
  const answerItems = questions.map((question, index) => textAnswerKeyItem(question, displayModels[index]));
  const questionPages = paginateQuestionDisplayModels(displayModels, questionLayout);
  const answerKeyPages = paginateAnswerKeyItems(answerItems, answerLayout);
  const sourceIds = uniqueSorted(questions.map((row) => row.sourceId));
  const macroIds = uniqueSorted(questions.map((row) => row.applicationReview.contextSelection.macroContextId));
  return {
    schemaVersion: 'worksheet-document-v1',
    version: '1',
    worksheetId: `postg-app-w01-a05-e4-${generationSeed}`,
    worksheetKind: 'batchAWorksheet',
    title: 'Wave 01 應用題 Production-equivalent Human Review',
    subtitle: 'Exact production generator + M01 context binding + shared production renderer',
    locale: 'zh-Hant',
    generatedAt: null,
    visibilityStatus: 'hidden',
    productionUse: 'forbidden_pending_human_review',
    curriculumInfo: {
      publisher: 'Wave 01 Golden 15',
      grade: null,
      semester: null,
      unitNumber: 'W01-A05',
      unitTitle: 'Application capability review cohort',
      curriculumNodeIds: sourceIds,
      canonicalSkillIds: []
    },
    studentFields: { showName: true, showDate: true, showClass: false, showScore: false, labels: { name: '姓名', date: '日期', className: '班級', score: '分數' } },
    printOptions: {
      paperSize: 'A4', orientation: 'portrait', columns: 1, rowsPerPage: 4,
      answerKeyColumns: 1, answerKeyRowsPerPage: 3, fontSizeMode: 'normal',
      showQuestionNumbers: true, showAnswerKey: true, answerKeyPlacement: 'afterQuestions',
      pageBreakMode: 'avoidLongTextCards', marginMode: 'default', debugDataAttributes: false
    },
    validationSummary: { ok: true, errors: [], warnings: [], infos: [], validatorVersion: 'postg-app-w01-a05-e4-review-v1', validatedAt: null },
    batchA: {
      sourceIds,
      selectionMode: 'reviewCohort',
      knowledgePointIds: questions.map((row) => row.knowledgePointId),
      patternGroupIds: questions.map((row) => row.resolvedPatternGroupId),
      patternSpecIds: questions.map((row) => row.patternSpecId ?? row.metadata?.patternId),
      allocation: questions.map((row) => ({ knowledgePointId: row.knowledgePointId, patternGroupId: row.resolvedPatternGroupId, patternSpecId: row.patternSpecId ?? row.metadata?.patternId, questionCount: 1 }))
    },
    provenance: {
      sourceType: 'postg_app_w01_a05_production_equivalent_review',
      sourceTaskIds: [
        'POSTG-APP-W01-A01_Golden15AtomicContextBindingAndSingleApplicationCandidatePack',
        'POSTG-APP-W01-A02_Golden15NPlusOneProofMisconceptionAndPBLCandidateContract',
        'POSTG-APP-W01-A03_Golden15ValidatorFixturesAndSharedRuntimeShadow',
        REVIEW_TASK_ID
      ],
      patternSpecIds: questions.map((row) => row.patternSpecId ?? row.metadata?.patternId),
      curriculumNodeIds: sourceIds,
      knowledgePointIds: questions.map((row) => row.knowledgePointId),
      patternGroupIds: questions.map((row) => row.resolvedPatternGroupId),
      productionStorageCategory: 'human_review_evidence',
      notes: ['Hidden E4 review artifact. No public selector or production admission.']
    },
    sections: [{
      sectionId: 'postg-app-w01-a05-review',
      title: '應用題情境與單位審查',
      description: null,
      patternIds: questions.map((row) => row.patternSpecId ?? row.metadata?.patternId),
      questionIds: questions.map((row) => row.id),
      orderingIndex: 0
    }],
    configSnapshot: {
      schemaVersion: 'postg-app-w01-a05-e4-review-v1',
      generationSeed,
      questionCount: questions.length,
      reviewMode: REVIEW_MODE,
      productionSelectable: false
    },
    generationContext: {
      questionKind: 'batchAWorksheet',
      generationMode: REVIEW_MODE,
      questionCount: questions.length,
      generationSeed,
      orderingSeed: generationSeed,
      resolvedOrderingSeed: generationSeed,
      orderingMode: 'macroContextCoverageThenSourceCoverage',
      patternIdsInRenderOrder: questions.map((row) => row.patternSpecId ?? row.metadata?.patternId)
    },
    allocationResult: questions.map((row) => ({ patternSpecId: row.patternSpecId ?? row.metadata?.patternId, questionCount: 1 })),
    generatedQuestions: clone(questions),
    orderedQuestionIds: questions.map((row) => row.id),
    questionDisplayModels: displayModels,
    answerKeyItems: answerItems,
    questionPages,
    answerKeyPages,
    summary: {
      questionCount: questions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      orderingMode: 'macroContextCoverageThenSourceCoverage',
      patternIdsInRenderOrder: questions.map((row) => row.patternSpecId ?? row.metadata?.patternId),
      sourceUnitCount: sourceIds.length,
      macroContextCount: macroIds.length
    },
    generationReport: {
      requestedQuestionCount: questions.length,
      generatedQuestionCount: questions.length,
      totalAttempts: questions.length,
      duplicateRejectCount: 0,
      constraintRejectCount: 0,
      patternReports: questions.map((row) => ({ patternId: row.patternSpecId ?? row.metadata?.patternId, requestedQuestionCount: 1, generatedQuestionCount: 1, failureCount: 0, warnings: [] })),
      validationWarnings: [], generationWarnings: [], errors: []
    },
    reviewRuntime: {
      taskId: REVIEW_TASK_ID,
      exactProductionGeneratorUsed: true,
      productionRendererRequired: true,
      productionSelectable: false,
      publicRouteChanged: false,
      humanReviewReady: true,
      macroContextIds: macroIds,
      sourceIds
    }
  };
}

export function materializeW01E4ProductionReview({ root = process.cwd(), generationSeed = 'postg-app-w01-a05-e4-review' } = {}) {
  const a02 = materializeW01NPlusOneAndPBLCandidatePack({ root });
  const upstreamValidation = validateW01NPlusOneAndPBLCandidatePack(a02);
  const eligibleSources = uniqueSorted(a02.a01.candidates.map((row) => row.sourceId));
  const requiredMacros = uniqueSorted(a02.a01.candidates.map((row) => row.contextSelection.macroContextId));
  const viable = materializeViableRows(a02, generationSeed);
  const cohortRows = selectReviewCohort(viable.rows, eligibleSources, requiredMacros);
  const transformedRows = cohortRows.map((row, index) => transformReviewQuestion(row, index + 1));
  const cohortSourceIds = new Set(transformedRows.map((row) => row.transformed.sourceId));
  const worksheetDocument = buildWorksheetDocument(transformedRows, generationSeed);
  const unitFlowReviewRows = transformedRows.map((row) => row.unitFlow);
  const pblReviewSections = buildPBLReviewSections(a02, cohortSourceIds);
  return {
    a02,
    upstreamValidation,
    generationSeed,
    eligibleSources,
    requiredMacros,
    viableRows: viable.rows,
    exactGenerationFailures: viable.failures,
    cohortRows,
    transformedRows,
    worksheetDocument,
    unitFlowReviewRows,
    pblReviewSections
  };
}

export function validateW01E4ProductionReview(materialized) {
  const issues = [];
  if (!materialized.upstreamValidation.ok) issues.push(issue('POSTG_APP_W01_A05_UPSTREAM_INVALID', 'a02'));
  const selectedSources = uniqueSorted(materialized.transformedRows.map((row) => row.transformed.sourceId));
  const selectedMacros = uniqueSorted(materialized.transformedRows.map((row) => row.transformed.applicationReview.contextSelection.macroContextId));
  if (JSON.stringify(selectedSources) !== JSON.stringify(materialized.eligibleSources)) {
    issues.push(issue('POSTG_APP_W01_A05_ELIGIBLE_SOURCE_COVERAGE_INVALID', 'cohort', { expected: materialized.eligibleSources, actual: selectedSources }));
  }
  if (JSON.stringify(selectedMacros) !== JSON.stringify(materialized.requiredMacros)) {
    issues.push(issue('POSTG_APP_W01_A05_MACRO_CONTEXT_COVERAGE_INVALID', 'cohort', { expected: materialized.requiredMacros, actual: selectedMacros }));
  }
  if (materialized.transformedRows.some((row) => !row.mathPreserved)) issues.push(issue('POSTG_APP_W01_A05_MATHEMATICAL_WITNESS_DRIFT', 'cohort'));
  if (materialized.transformedRows.some((row) => !row.promptChanged)) issues.push(issue('POSTG_APP_W01_A05_VISIBLE_CONTEXT_NOT_CHANGED', 'cohort'));
  if (materialized.transformedRows.some((row) => row.reviewPrompt.includes('{{'))) issues.push(issue('POSTG_APP_W01_A05_UNRESOLVED_SURFACE_SLOT', 'cohort'));
  if (materialized.transformedRows.some((row) => /算式|答：|_{5,}/.test(row.reviewPrompt))) issues.push(issue('POSTG_APP_W01_A05_FORBIDDEN_VISIBLE_LABEL', 'cohort'));
  if (materialized.worksheetDocument.generatedQuestions.length !== materialized.transformedRows.length
      || materialized.worksheetDocument.answerKeyItems.length !== materialized.transformedRows.length) {
    issues.push(issue('POSTG_APP_W01_A05_QUESTION_ANSWER_PAIRING_INVALID', 'worksheetDocument'));
  }
  if (materialized.worksheetDocument.reviewRuntime.exactProductionGeneratorUsed !== true
      || materialized.worksheetDocument.reviewRuntime.productionRendererRequired !== true
      || materialized.worksheetDocument.reviewRuntime.productionSelectable !== false) {
    issues.push(issue('POSTG_APP_W01_A05_REVIEW_RUNTIME_BOUNDARY_INVALID', 'worksheetDocument.reviewRuntime'));
  }
  const pblIds = uniqueSorted(materialized.pblReviewSections.map((row) => row.pblCandidateId));
  const expectedPblIds = uniqueSorted(materialized.a02.pblTaskSetCandidates
    .filter((row) => selectedSources.includes(row.sourceId))
    .map((row) => row.pblCandidateId));
  if (JSON.stringify(pblIds) !== JSON.stringify(expectedPblIds)) issues.push(issue('POSTG_APP_W01_A05_PBL_REVIEW_COVERAGE_INVALID', 'pblReviewSections'));
  if (materialized.pblReviewSections.some((row) => (
    (row.graphType === 'PBL3_LINEAR' && row.projectionCandidate !== 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE')
    || (row.graphType === 'PBL5_BOUNDED_DECISION' && row.projectionCandidate !== 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE')
  ))) issues.push(issue('POSTG_APP_W01_A05_PBL_PROJECTION_INVALID', 'pblReviewSections'));
  if (materialized.transformedRows.some((row) => row.transformed.applicationReview.productionAdmissionAllowed !== false)) {
    issues.push(issue('POSTG_APP_W01_A05_PRODUCTION_ADMISSION_FORBIDDEN', 'cohort'));
  }
  const unresolvedUnitCount = materialized.unitFlowReviewRows.filter((row) => row.resolutionStatus === 'HUMAN_REVIEW_REQUIRED').length;
  return {
    ok: issues.length === 0,
    issues,
    counts: {
      eligibleSourceCount: materialized.eligibleSources.length,
      requiredMacroContextCount: materialized.requiredMacros.length,
      viableExactCandidateCount: materialized.viableRows.length,
      exactGenerationFailureCount: materialized.exactGenerationFailures.length,
      reviewCohortQuestionCount: materialized.transformedRows.length,
      reviewCohortSourceCount: selectedSources.length,
      reviewCohortMacroContextCount: selectedMacros.length,
      mathPreservedCount: materialized.transformedRows.filter((row) => row.mathPreserved).length,
      promptChangedCount: materialized.transformedRows.filter((row) => row.promptChanged).length,
      questionPageCount: materialized.worksheetDocument.questionPages.length,
      answerKeyPageCount: materialized.worksheetDocument.answerKeyPages.length,
      pblReviewSectionCount: materialized.pblReviewSections.length,
      unitFlowReviewCount: materialized.unitFlowReviewRows.length,
      unresolvedUnitReviewCount: unresolvedUnitCount,
      productionAdmittedCount: 0
    },
    selectedSources,
    selectedMacros,
    humanReviewReady: issues.length === 0,
    productionAdmissionGranted: false,
    nextShortestStep: 'POSTG-APP-W01-A06_HumanReviewDecisionAndProductionAdmissionRemediation',
    status: issues.length === 0
      ? 'W01_E4_PRODUCTION_EQUIVALENT_REVIEW_RUNTIME_READY'
      : 'W01_E4_PRODUCTION_EQUIVALENT_REVIEW_RUNTIME_BLOCKED'
  };
}

export function buildW01E4ProductionReviewReadback(options = {}) {
  const materialized = materializeW01E4ProductionReview(options);
  const validation = validateW01E4ProductionReview(materialized);
  return {
    ...validation,
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: REVIEW_TASK_ID,
    reviewMode: REVIEW_MODE,
    unitFlowReviewRows: materialized.unitFlowReviewRows,
    pblReviewSections: materialized.pblReviewSections,
    exactGenerationFailures: materialized.exactGenerationFailures,
    reviewPairs: materialized.transformedRows.map((row) => ({
      bindingCandidateId: row.transformed.applicationReview.bindingCandidateId,
      sourceId: row.transformed.sourceId,
      knowledgePointId: row.transformed.knowledgePointId,
      macroContextId: row.transformed.applicationReview.contextSelection.macroContextId,
      exactPatternGroupId: row.exactPatternGroupId,
      exactPatternSpecId: row.exactPatternSpecId,
      originalPrompt: row.originalPrompt,
      reviewPrompt: row.reviewPrompt,
      answerText: row.transformed.answerText,
      answerUnit: row.transformed.answerUnit,
      mathPreserved: row.mathPreserved,
      promptChanged: row.promptChanged
    })),
    worksheetDocument: materialized.worksheetDocument
  };
}
