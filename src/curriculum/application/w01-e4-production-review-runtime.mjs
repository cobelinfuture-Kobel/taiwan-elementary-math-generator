import {
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from '../../../site/modules/core/index.js';
import {
  buildWorksheetDocumentFromPlan
} from '../../../site/assets/browser/pipeline/build-worksheet-document.js';
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
    .replace(/(?:算式|答案|答)\s*[:：]?\s*/g, '')
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
  return {
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
    const result = buildWorksheetDocumentFromPlan(options);
    const exactQuestions = result.worksheetDocument?.generatedQuestions
      ?? result.worksheetDocument?.questionItems
      ?? [];
    attempts.push({ patternGroupId: group.patternGroupId, ok: result.ok, errors: result.errors ?? [] });
    if (result.ok && exactQuestions.length === 1) {
      return {
        ok: true,
        group,
        options,
        exactWorksheetDocument: result.worksheetDocument,
        exactQuestion: exactQuestions[0],
        attempts
      };
    }
  }
  return { ok: false, group: null, options: null, exactWorksheetDocument: null, exactQuestion: null, attempts };
}

function materializeViableRows(a02, generationSeed) {
  const macroMap = new Map(a02.a01.assessment.masterController.contextAuthority.hierarchy.macroDomains.map((row) => [row.nodeId, row]));
  const proofByBindingCandidateId = new Map(
    a02.nPlusOneProofCandidates.map((row) => [row.bindingCandidateId, row])
  );
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
    rows.push({
      candidate,
      exact,
      chain,
      macro,
      proofCandidate: proofByBindingCandidateId.get(candidate.bindingCandidateId) ?? null
    });
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
  const { candidate, exact, chain, macro, proofCandidate } = row;
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
        newInterpretiveAct: proofCandidate?.newInterpretiveAct ?? 'DIRECT_APPLICATION',
        answerWitness: clone(candidate.answerModelCandidate),
        proofTrace: proofCandidate == null ? null : {
          proofCandidateId: proofCandidate.proofCandidateId,
          candidateStatus: proofCandidate.candidateStatus,
          capabilityEdge: clone(proofCandidate.capabilityEdge),
          interpretationFork: clone(proofCandidate.interpretationFork),
          interpretationWitnessBlueprint: clone(proofCandidate.interpretationWitnessBlueprint),
          counterfactualBlueprint: clone(proofCandidate.counterfactualBlueprint),
          crossContextProofCandidate: clone(proofCandidate.crossContextProofCandidate),
          validatorDeltaCandidate: clone(proofCandidate.validatorDeltaCandidate),
          pendingProofChecks: clone(proofCandidate.pendingProofChecks)
        },
        misconceptionFixtureRefs: proofCandidate?.misconceptionCandidates
          ?.map((row) => row.misconceptionId) ?? [],
        contextSelection: clone(candidate.contextSelection),
        unitFlow: clone(unitFlow)
      }
    }
  };
  const afterSnapshot = exactMathSnapshot(transformed);
  return {
    candidate,
    exactPatternGroupId: exact.group.patternGroupId,
    exactPatternSpecId: beforeSnapshot.patternSpecId,
    exactWorksheetId: exact.exactWorksheetDocument.worksheetId
      ?? exact.exactWorksheetDocument.worksheetDocumentId
      ?? null,
    transformed,
    beforeSnapshot,
    afterSnapshot,
    mathPreserved: JSON.stringify(beforeSnapshot) === JSON.stringify(afterSnapshot),
    promptChanged: prompt !== normalizeVisiblePrompt(
      original.blankedDisplayText ?? original.promptText ?? original.displayText ?? ''
    ),
    unitFlow
  };
}

function buildReviewWorksheetDocument(transformedRows) {
  const questions = transformedRows.map((row) => row.transformed);
  const questionDisplayModels = questions.map((question, index) => textDisplayModel(question, index + 1));
  const answerKeyItems = questions.map((question, index) => textAnswerKeyItem(question, questionDisplayModels[index]));
  const questionLayout = {
    paperSize: 'A4',
    columns: 1,
    rowsPerPage: 3,
    showQuestionNumbers: true,
    showAnswerKeyPage: true,
    longTextCardPolicy: 'avoidSplit'
  };
  const answerLayout = {
    ...questionLayout,
    rowsPerPage: 4
  };
  const questionPages = paginateQuestionDisplayModels(questionDisplayModels, questionLayout);
  const answerKeyPages = paginateAnswerKeyItems(answerKeyItems, answerLayout);
  return {
    schemaVersion: 'worksheet-document-v1',
    version: '1',
    worksheetId: 'postg-app-w01-a05-production-review',
    worksheetKind: 'applicationCapabilityHumanReview',
    title: 'POSTG-APP Wave 01 應用題產線人工審核卷',
    subtitle: '16 個宏觀情境／全 eligible source coverage／exact generator witness',
    locale: 'zh-Hant',
    generatedAt: null,
    visibilityStatus: 'hidden_review_only',
    productionUse: 'forbidden_pending_human_review',
    generatedQuestions: questions,
    questionDisplayModels,
    answerKeyItems,
    questionPages,
    answerKeyPages,
    printOptions: {
      paperSize: 'A4',
      columns: 1,
      rowsPerPage: 3,
      answerKeyColumns: 1,
      answerKeyRowsPerPage: 4,
      showAnswerKey: true,
      answerKeyPlacement: 'afterQuestions'
    },
    rendererProfile: {
      profileId: 'postg_app_w01_a05_human_review_long_text_v1',
      questionSheet: questionLayout,
      answerKey: answerLayout
    },
    batchA: {
      sourceId: 'postg_app_w01',
      sourceIds: uniqueSorted(questions.map((question) => question.sourceId)),
      selectionMode: 'humanReviewCohort',
      questionCount: questions.length,
      ordering: 'source_then_macro',
      includeAnswerKey: true
    },
    reviewRuntime: {
      taskId: REVIEW_TASK_ID,
      reviewMode: REVIEW_MODE,
      exactProductionGeneratorUsed: true,
      productionRendererRequired: true,
      humanReviewReady: true,
      productionSelectable: false,
      productionAdmissionGranted: false
    },
    validationSummary: {
      ok: true,
      errors: [],
      warnings: [],
      validatorVersion: 'postg-app-w01-a05-review-v1',
      validatedAt: null
    },
    generationReport: {
      requestedQuestionCount: questions.length,
      generatedQuestionCount: questions.length,
      totalAttempts: questions.length,
      exactGeneratorCount: questions.length,
      validationWarnings: [],
      generationWarnings: [],
      errors: []
    },
    summary: {
      questionCount: questions.length,
      answerKeyItemCount: answerKeyItems.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      sourceCount: uniqueSorted(questions.map((question) => question.sourceId)).length,
      macroContextCount: uniqueSorted(questions.map((question) => question.applicationReview.contextSelection.macroContextId)).length
    },
    configSnapshot: {
      schemaVersion: 'postg-app-w01-a05-review-plan-v1',
      reviewMode: REVIEW_MODE,
      productionAdmissionAllowed: false
    },
    provenance: {
      programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
      taskId: REVIEW_TASK_ID,
      sourceTaskIds: [
        'POSTG-APP-W01-A00_Golden15ApplicationCapabilityAssessmentAndAdmissionBaseline',
        'POSTG-APP-W01-A01_Golden15AtomicContextBindingAndSingleApplicationCandidatePack',
        'POSTG-APP-W01-A02_Golden15NPlusOneProofMisconceptionAndPBLCandidateContract',
        'POSTG-APP-W01-A03_Golden15ValidatorFixturesAndSharedRuntimeShadow',
        'POSTG-APP-W01-A04_Golden15WorksheetShadowProjectionAndProductionAdmissionReview'
      ],
      exactGeneratorLineageRequired: true,
      productionRendererRequired: true,
      humanReviewRequired: true,
      freeFormAIUsed: false
    }
  };
}

function buildPblReviewSections(a02, selectedSources) {
  return a02.pblTaskSetCandidates
    .filter((candidate) => selectedSources.has(candidate.sourceId))
    .map((candidate) => ({
      pblTaskSetId: candidate.pblTaskSetId,
      sourceId: candidate.sourceId,
      knowledgePointId: candidate.knowledgePointId,
      graphType: candidate.graphCandidate.graphType,
      nodes: clone(candidate.graphCandidate.nodes),
      edges: clone(candidate.graphCandidate.edges),
      finalProductCandidate: clone(candidate.graphCandidate.finalProductCandidate),
      taskBlueprints: clone(candidate.taskBlueprints),
      projectionCandidate: candidate.graphCandidate.graphType === 'PBL3_LINEAR'
        ? 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE'
        : 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE',
      unapprovedPageSplitForbidden: true,
      productionAdmissionAllowed: false
    }));
}

export function materializeW01E4ProductionReview(options = {}) {
  const generationSeed = String(options.generationSeed ?? 'postg-app-w01-a05-e4');
  const a02 = options.a02 ?? materializeW01NPlusOneAndPBLCandidatePack();
  const a02Validation = validateW01NPlusOneAndPBLCandidatePack(a02);
  if (!a02Validation.ok) throw new Error(JSON.stringify(a02Validation.issues));

  const eligibleSources = uniqueSorted(a02.a01.assessment.records
    .filter((record) => record.suitableForApplication === true)
    .map((record) => record.sourceId));
  const requiredMacros = uniqueSorted(a02.a01.assessment.masterController.contextAuthority.hierarchy.macroDomains.map((row) => row.nodeId));
  const viable = materializeViableRows(a02, generationSeed);
  const cohortRows = selectReviewCohort(viable.rows, eligibleSources, requiredMacros);
  const transformedRows = cohortRows.map((row, index) => transformReviewQuestion(row, index + 1));
  const selectedSources = new Set(transformedRows.map((row) => row.transformed.sourceId));
  const worksheetDocument = buildReviewWorksheetDocument(transformedRows);
  const pblReviewSections = buildPblReviewSections(a02, selectedSources);
  const unitFlowReviewRows = transformedRows.map((row) => clone(row.unitFlow));

  return {
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: REVIEW_TASK_ID,
    status: 'W01_E4_PRODUCTION_EQUIVALENT_REVIEW_RUNTIME_READY',
    actualEvidenceLevel: 'E3_SHADOW_RUNTIME_INTEGRATED',
    generationSeed,
    a02,
    a02Validation,
    eligibleSources,
    requiredMacros,
    exactGenerationFailures: viable.failures,
    viableCandidateCount: viable.rows.length,
    transformedRows,
    worksheetDocument,
    pblReviewSections,
    unitFlowReviewRows,
    reviewBoundary: {
      exactProductionGeneratorUsed: true,
      productionRendererRequired: true,
      htmlOutputVerified: false,
      pdfOutputVerified: false,
      humanReviewReady: true,
      humanDecisionRecorded: false,
      productionAdmissionGranted: false
    }
  };
}

export function validateW01E4ProductionReview(materialized) {
  const issues = [];
  const rows = materialized.transformedRows ?? [];
  const selectedSources = uniqueSorted(rows.map((row) => row.transformed.sourceId));
  const selectedMacros = uniqueSorted(rows.map((row) => row.transformed.applicationReview.contextSelection.macroContextId));
  const eligibleSources = uniqueSorted(materialized.eligibleSources ?? []);
  const requiredMacros = uniqueSorted(materialized.requiredMacros ?? []);
  const mathPreservedCount = rows.filter((row) => row.mathPreserved).length;
  const promptChangedCount = rows.filter((row) => row.promptChanged).length;
  const forbiddenVisibleLabelCount = rows.filter((row) => /算式|答：|_{5,}/.test(row.transformed.blankedDisplayText)).length;
  const humanReviewReady = rows.length > 0
    && rows.every((row) => row.transformed.applicationReview?.humanReviewReady === true)
    && materialized.reviewBoundary?.humanReviewReady === true;

  if (JSON.stringify(selectedSources) !== JSON.stringify(eligibleSources)) {
    issues.push(issue('POSTG_APP_W01_A05_ELIGIBLE_SOURCE_COVERAGE_INVALID', 'transformedRows', {
      expected: eligibleSources,
      actual: selectedSources
    }));
  }
  if (JSON.stringify(selectedMacros) !== JSON.stringify(requiredMacros)) {
    issues.push(issue('POSTG_APP_W01_A05_MACRO_CONTEXT_COVERAGE_INVALID', 'transformedRows', {
      expected: requiredMacros,
      actual: selectedMacros
    }));
  }
  if (rows.length < eligibleSources.length || rows.length < requiredMacros.length) {
    issues.push(issue('POSTG_APP_W01_A05_REVIEW_COHORT_TOO_SMALL', 'transformedRows', {
      reviewCohortQuestionCount: rows.length,
      eligibleSourceCount: eligibleSources.length,
      requiredMacroContextCount: requiredMacros.length
    }));
  }
  if (mathPreservedCount !== rows.length) issues.push(issue('POSTG_APP_W01_A05_MATHEMATICAL_WITNESS_DRIFT', 'transformedRows'));
  if (promptChangedCount !== rows.length) issues.push(issue('POSTG_APP_W01_A05_CONTEXT_OVERLAY_MISSING', 'transformedRows'));
  if (forbiddenVisibleLabelCount !== 0) issues.push(issue('POSTG_APP_W01_A05_FORBIDDEN_VISIBLE_LABEL', 'transformedRows', { forbiddenVisibleLabelCount }));
  if (!humanReviewReady) issues.push(issue('POSTG_APP_W01_A05_HUMAN_REVIEW_NOT_READY', 'reviewBoundary'));
  if (materialized.reviewBoundary?.productionAdmissionGranted !== false) issues.push(issue('POSTG_APP_W01_A05_PRODUCTION_ADMISSION_FORBIDDEN', 'reviewBoundary.productionAdmissionGranted'));
  for (const [index, row] of rows.entries()) {
    if (!row.exactPatternGroupId || !row.exactPatternSpecId || row.transformed.applicationReview?.exactGeneratorUsed !== true) {
      issues.push(issue('POSTG_APP_W01_A05_EXACT_GENERATOR_WITNESS_MISSING', `transformedRows[${index}]`));
    }
    if (row.transformed.productionUse !== 'forbidden_pending_human_review'
      || row.transformed.applicationReview?.productionAdmissionAllowed !== false) {
      issues.push(issue('POSTG_APP_W01_A05_PRODUCTION_ADMISSION_FORBIDDEN', `transformedRows[${index}]`));
    }
  }
  for (const [index, section] of (materialized.pblReviewSections ?? []).entries()) {
    if (section.graphType === 'PBL3_LINEAR' && (section.taskBlueprints?.length !== 3 || section.projectionCandidate !== 'APPROVED_COMPLETE_SINGLE_PAGE_CANDIDATE')) {
      issues.push(issue('POSTG_APP_W01_A05_PBL3_PROJECTION_INVALID', `pblReviewSections[${index}]`));
    }
    if (section.graphType === 'PBL5_BOUNDED_DECISION' && (section.taskBlueprints?.length !== 5 || section.projectionCandidate !== 'APPROVED_COMPLETE_TWO_PAGE_CANDIDATE')) {
      issues.push(issue('POSTG_APP_W01_A05_PBL5_PROJECTION_INVALID', `pblReviewSections[${index}]`));
    }
    if (section.productionAdmissionAllowed !== false) issues.push(issue('POSTG_APP_W01_A05_PRODUCTION_ADMISSION_FORBIDDEN', `pblReviewSections[${index}]`));
  }

  return {
    ok: issues.length === 0,
    issues,
    status: issues.length === 0 ? materialized.status : 'W01_E4_PRODUCTION_EQUIVALENT_REVIEW_RUNTIME_INVALID',
    actualEvidenceLevel: materialized.actualEvidenceLevel,
    humanReviewReady,
    productionAdmissionGranted: false,
    selectedSources,
    selectedMacros,
    counts: {
      eligibleSourceCount: eligibleSources.length,
      requiredMacroContextCount: requiredMacros.length,
      reviewCohortSourceCount: selectedSources.length,
      reviewCohortMacroContextCount: selectedMacros.length,
      reviewCohortQuestionCount: rows.length,
      exactGeneratorFailureCount: materialized.exactGenerationFailures?.length ?? 0,
      mathPreservedCount,
      promptChangedCount,
      forbiddenVisibleLabelCount,
      unresolvedUnitFlowCount: (materialized.unitFlowReviewRows ?? []).filter((row) => row.resolutionStatus === 'HUMAN_REVIEW_REQUIRED').length,
      pblReviewSectionCount: materialized.pblReviewSections?.length ?? 0
    }
  };
}
