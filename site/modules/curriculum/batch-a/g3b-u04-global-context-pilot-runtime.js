import {
  createAnswerKeyItem,
  paginateAnswerKeyItems,
  paginateQuestionDisplayModels
} from "../../core/index.js";
import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import {
  G3B_U04_CANONICAL_ROUTE_KINDS,
  generateG3BU04CanonicalSemanticQuestions
} from "./g3b-u04-canonical-semantic-router.js";
import {
  G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE
} from "./batch-a-browser-worksheet-s57f5-extension.js";
import {
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS,
  renderG3BU04GlobalContextExpansionQuestion
} from "./g3b-u04-global-context-expansion-pilot.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../registry/batch-a-selector-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "./visible-pattern-group-resolver.js";

export const G3B_U04_GLOBAL_CONTEXT_PILOT_SOURCE_ID = "g3b_u04_3b04";
export const G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID = "kp_g3b_u04_add_then_divide";
export const G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID = "ps_g3b_u04_add_divide_joint_purchase_equal_share";
export const G3B_U04_GLOBAL_CONTEXT_PILOT_MODE = "gctx_p12r_shadow";

export const G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME = Object.freeze({
  task: "GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix",
  status: "shadow_runtime_integrated_output_gate_pending",
  sourceId: G3B_U04_GLOBAL_CONTEXT_PILOT_SOURCE_ID,
  knowledgePointId: G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID,
  patternSpecId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
  pilotMode: G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
  resolver: "visiblePatternGroupResolver",
  canonicalGeneratorUsed: true,
  productionRendererProfileId: G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.profileId,
  productionSelectable: false,
  publicQuerySelectable: false,
  publicRouterChanged: false
});

function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  }
  return value;
}

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "gctx-p12r")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function pilotApplicationGroupId() {
  const group = getVisiblePatternGroupsForKnowledgePoint(G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID)
    .find((row) => row.representationTag === "application_word_problem");
  return group?.patternGroupId ?? "pg_g3b_u04_add_then_divide";
}

function normalizedPilotOptions(options = {}) {
  return {
    sourceId: G3B_U04_GLOBAL_CONTEXT_PILOT_SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
    selectedPatternGroupIds: [pilotApplicationGroupId()],
    questionCount: G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length,
    ordering: "groupedByPattern",
    includeAnswerKey: options.includeAnswerKey !== false,
    generationSeed: options.generationSeed ?? "gctx-p12r-shadow-runtime",
    printLayout: {
      columns: 2,
      rowsPerPage: 4,
      showAnswerKeyPage: options.includeAnswerKey !== false
    }
  };
}

export function buildG3BU04GlobalContextPilotPlan(options = {}) {
  const baseOptions = normalizedPilotOptions(options);
  const basePlan = buildBatchABrowserPlan(baseOptions);
  const patternGroupId = baseOptions.selectedPatternGroupIds[0];
  const errors = [];

  if (options.pilotMode !== G3B_U04_GLOBAL_CONTEXT_PILOT_MODE) {
    errors.push(issue("GCTX_P12R_SHADOW_MODE_REQUIRED", "pilotMode", "P12R runtime requires the internal shadow pilot mode."));
  }
  if (basePlan.resolverResult?.ok !== true || basePlan.resolverResult?.provenance?.resolver !== "visiblePatternGroupResolver") {
    errors.push(issue("GCTX_P12R_CANONICAL_RESOLVER_REQUIRED", "resolverResult", "P12R must originate from the visible PatternGroup resolver."));
  }
  if (!(basePlan.resolverResult?.patternSpecIds ?? []).includes(G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID)) {
    errors.push(issue("GCTX_P12R_PATTERN_NOT_RESOLVED", "resolverResult.patternSpecIds", "The pilot PatternSpec was not resolved by the canonical resolver."));
  }

  const plan = {
    ...cloneValue(basePlan),
    questionCount: G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length,
    allocation: [{
      knowledgePointId: G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID,
      patternGroupId,
      patternSpecId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
      questionCount: G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length
    }],
    patternSpecIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
    selectedKnowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
    selectedPatternGroupIds: [patternGroupId],
    routeKind: G3B_U04_CANONICAL_ROUTE_KINDS.PURE_SEMANTIC,
    globalContextPilot: {
      mode: G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
      productionSelectable: false,
      publicQuerySelectable: false
    }
  };

  return { ok: errors.length === 0, plan, baseOptions, errors, warnings: [] };
}

function variantForQuestion(seed, index) {
  const start = hashSeed(seed) % G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length;
  return G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS[(start + index) % G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length];
}

function transformCanonicalQuestion(baseQuestion, variant, sequenceNumber) {
  const { a, b, c } = baseQuestion.quantities ?? {};
  const rendered = renderG3BU04GlobalContextExpansionQuestion({
    variantId: variant.variantId,
    a,
    b,
    c
  });
  if (!rendered) return null;

  const originalPromptText = baseQuestion.promptText;
  const globalContextPilot = {
    task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
    mode: G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
    runtimeResolvable: true,
    productionSelectable: false,
    publicQuerySelectable: false,
    contextFamilyId: rendered.contextFamilyId,
    semanticVariantId: rendered.semanticVariantId,
    languageVariantId: rendered.languageVariantId,
    contextDomainId: rendered.contextDomainId,
    semanticFingerprint: rendered.semanticFingerprint,
    originalPromptText
  };

  return {
    ...cloneValue(baseQuestion),
    id: `${G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID}-gctx-${sequenceNumber}`,
    phase: "GCTX-P12R",
    promptText: rendered.promptText,
    blankedDisplayText: rendered.promptText,
    displayText: `${rendered.promptText} 答案：${baseQuestion.answerText}`,
    contextDomain: rendered.contextDomainId,
    scenarioId: `gctx_shadow_${rendered.semanticVariantId}`,
    selectorStatus: "hidden",
    visibilityStatus: "hidden",
    productionUse: "forbidden",
    generatorRouting: "canonical_resolver_then_global_context_shadow_binding",
    globalContextPilot,
    semanticSnapshot: {
      ...cloneValue(baseQuestion.semanticSnapshot ?? {}),
      contextDomain: rendered.contextDomainId,
      globalContextPilot: cloneValue(globalContextPilot),
      runtimeStatus: "shadow_routed",
      productionSelectable: false
    },
    metadata: {
      ...cloneValue(baseQuestion.metadata ?? {}),
      globalContextPilot: cloneValue(globalContextPilot),
      patternTags: [...new Set([...(baseQuestion.metadata?.patternTags ?? []), "gctx_p12r_shadow_runtime"])],
      difficultyTags: [...new Set([...(baseQuestion.metadata?.difficultyTags ?? []), "gctx_global_context_visible_difference"])]
    },
    canonicalRoute: {
      ...cloneValue(baseQuestion.canonicalRoute ?? {}),
      shadowPilot: true,
      publicHiddenModeFlagUsed: false
    }
  };
}

export function validateG3BU04GlobalContextPilotQuestion(question = {}, baseQuestion = {}) {
  const errors = [];
  const pilot = question.globalContextPilot ?? {};
  const rerendered = renderG3BU04GlobalContextExpansionQuestion({
    variantId: pilot.semanticVariantId,
    a: question.quantities?.a,
    b: question.quantities?.b,
    c: question.quantities?.c
  });

  if (question.patternSpecId !== G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID) {
    errors.push(issue("GCTX_P12R_PATTERN_SPEC_MISMATCH", "patternSpecId", "Pilot question changed the mathematical PatternSpec."));
  }
  if (question.knowledgePointId !== G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID) {
    errors.push(issue("GCTX_P12R_KNOWLEDGE_POINT_MISMATCH", "knowledgePointId", "Pilot question changed the KnowledgePoint."));
  }
  if (!rerendered || question.promptText !== rerendered.promptText) {
    errors.push(issue("GCTX_P12R_PROMPT_BINDING_MISMATCH", "promptText", "Pilot prompt does not match the selected global context binding."));
  }
  if (question.equationModel !== baseQuestion.equationModel
    || question.finalAnswer !== baseQuestion.finalAnswer
    || question.answerText !== baseQuestion.answerText
    || JSON.stringify(question.quantities) !== JSON.stringify(baseQuestion.quantities)) {
    errors.push(issue("GCTX_P12R_MATHEMATICAL_WITNESS_DRIFT", "mathematicalWitness", "Global context projection changed quantities, equation or answer."));
  }
  if (/三明治費用|果汁費用|筆記本費用|彩色筆費用|門票費用|帳篷租金/.test(question.promptText ?? "")) {
    errors.push(issue("GCTX_P12R_LEGACY_PROMPT_REMAINS", "promptText", "Pilot output still contains a legacy context prompt."));
  }
  if (pilot.mode !== G3B_U04_GLOBAL_CONTEXT_PILOT_MODE || pilot.runtimeResolvable !== true) {
    errors.push(issue("GCTX_P12R_SHADOW_RUNTIME_METADATA_MISSING", "globalContextPilot", "Pilot runtime provenance is missing."));
  }
  if (pilot.productionSelectable !== false || question.productionUse !== "forbidden" || question.selectorStatus !== "hidden") {
    errors.push(issue("GCTX_P12R_FALSE_PRODUCTION_ADMISSION", "productionUse", "Shadow pilot escaped into production selection."));
  }
  if (question.canonicalRoute?.resolver !== "visiblePatternGroupResolver" || question.canonicalRoute?.publicHiddenModeFlagUsed !== false) {
    errors.push(issue("GCTX_P12R_CANONICAL_RESOLVER_PROVENANCE_INVALID", "canonicalRoute", "Pilot question lacks canonical resolver provenance."));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function generateG3BU04GlobalContextPilotQuestions(options = {}) {
  const planned = buildG3BU04GlobalContextPilotPlan(options);
  if (!planned.ok) return { ok: false, plan: planned.plan, questions: [], baseQuestions: [], errors: planned.errors, warnings: [] };

  const canonical = generateG3BU04CanonicalSemanticQuestions(planned.plan);
  if (!canonical.ok) return { ...canonical, baseQuestions: [] };

  const transformed = canonical.questions.map((baseQuestion, index) => transformCanonicalQuestion(
    baseQuestion,
    variantForQuestion(planned.plan.generationSeed, index),
    index + 1
  ));
  const errors = [];
  const seenVariants = new Set();
  const seenPrompts = new Set();
  for (const [index, question] of transformed.entries()) {
    if (!question) {
      errors.push(issue("GCTX_P12R_TRANSFORM_FAILED", `questions[${index}]`, "Global context question transformation failed."));
      continue;
    }
    const validation = validateG3BU04GlobalContextPilotQuestion(question, canonical.questions[index]);
    errors.push(...validation.errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
    seenVariants.add(question.globalContextPilot.semanticVariantId);
    seenPrompts.add(question.promptText);
  }
  if (seenVariants.size !== G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length) {
    errors.push(issue("GCTX_P12R_VARIANT_COVERAGE_INCOMPLETE", "questions", "The shadow runtime did not cover all five global context variants."));
  }
  if (seenPrompts.size !== G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length) {
    errors.push(issue("GCTX_P12R_VISIBLE_PROMPT_DIFFERENCE_INCOMPLETE", "questions", "The shadow runtime did not produce five unique visible prompts."));
  }

  return {
    ok: errors.length === 0,
    plan: planned.plan,
    questions: errors.length === 0 ? transformed : [],
    baseQuestions: canonical.questions,
    allocation: cloneValue(planned.plan.allocation),
    validation: { ok: errors.length === 0, errors, warnings: [] },
    errors,
    warnings: []
  };
}

function questionDisplayModel(question, questionNumber, showQuestionNumbers) {
  return {
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    templateFamilyId: question.templateFamilyId,
    questionNumberText: showQuestionNumbers ? `${questionNumber}.` : null,
    promptText: question.promptText,
    displayText: question.displayText,
    blankedDisplayText: question.blankedDisplayText,
    equationModel: question.equationModel,
    answerUnit: question.answerUnit,
    answerText: question.answerText,
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(question.blankedDisplayText ?? "").length,
      hasGrouping: true,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem",
      longTextCardPolicy: "avoidSplit"
    }
  };
}

function answerKeyItem(question, questionNumber, displayModel) {
  return {
    ...createAnswerKeyItem(question, displayModel),
    questionId: question.id,
    questionNumber,
    patternId: question.patternSpecId,
    knowledgePointId: question.knowledgePointId,
    patternGroupId: question.resolvedPatternGroupId ?? question.patternGroupId,
    templateFamilyId: question.templateFamilyId,
    promptText: question.blankedDisplayText,
    equationText: question.equationModel,
    answerText: question.answerText,
    answerUnit: question.answerUnit,
    eventSequence: cloneValue(question.eventSequence),
    metadataSnapshot: cloneValue(question.metadata),
    semanticSnapshot: cloneValue(question.semanticSnapshot),
    layoutHints: {
      estimatedTextLength: String(`${question.blankedDisplayText ?? ""}${question.equationModel ?? ""}${question.answerText ?? ""}`).length,
      avoidPageBreakInside: true,
      representation: "semantic_word_problem_answer",
      longTextCardPolicy: "avoidSplit"
    }
  };
}

function assemblePilotWorksheet(generated, options = {}, mode = "after") {
  const questions = mode === "before" ? generated.baseQuestions.map((question) => ({
    ...cloneValue(question),
    selectorStatus: "hidden",
    visibilityStatus: "hidden",
    productionUse: "forbidden",
    generatorRouting: "canonical_resolver_shadow_baseline",
    globalContextPilot: {
      task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
      mode: "gctx_p12r_before_baseline",
      runtimeResolvable: true,
      productionSelectable: false
    }
  })) : generated.questions;
  const questionLayout = {
    ...G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.questionSheet,
    showQuestionNumbers: true,
    showAnswerKeyPage: options.includeAnswerKey !== false
  };
  const answerLayout = {
    ...G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.answerKey,
    showQuestionNumbers: true,
    showAnswerKeyPage: options.includeAnswerKey !== false
  };
  const displayModels = questions.map((question, index) => questionDisplayModel(question, index + 1, true));
  const answerItems = options.includeAnswerKey === false
    ? []
    : questions.map((question, index) => answerKeyItem(question, index + 1, displayModels[index]));
  const questionPages = paginateQuestionDisplayModels(displayModels, questionLayout);
  const answerKeyPages = options.includeAnswerKey === false ? [] : paginateAnswerKeyItems(answerItems, answerLayout);
  const variantIds = questions.map((question) => question.globalContextPilot?.semanticVariantId).filter(Boolean);

  return {
    schemaVersion: "worksheet-document-v1",
    version: "1",
    worksheetId: `gctx-p12r-${mode}-${generated.plan.generationSeed}`,
    worksheetKind: "batchAWorksheet",
    title: mode === "before" ? "3B-U04 全域情境接入前" : "3B-U04 全域情境 Shadow Pilot",
    subtitle: mode === "before" ? "Canonical legacy context baseline" : "Canonical resolver + global context shadow runtime",
    locale: "zh-Hant",
    generatedAt: null,
    visibilityStatus: "hidden",
    productionUse: "forbidden",
    rendererProfile: cloneValue(G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE),
    pilotRuntime: {
      task: G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task,
      mode,
      canonicalResolverUsed: true,
      canonicalGeneratorUsed: true,
      productionRendererUsed: true,
      productionSelectable: false,
      publicRouteChanged: false
    },
    curriculumInfo: {
      publisher: "Batch A",
      grade: 3,
      semester: "B",
      unitNumber: "3B-U04",
      unitTitle: "兩步驟計算",
      curriculumNodeIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_SOURCE_ID],
      canonicalSkillIds: ["integer_mixed_operations"]
    },
    studentFields: {
      showName: true,
      showDate: true,
      showClass: false,
      showScore: false,
      labels: { name: "姓名", date: "日期", className: "班級", score: "分數" }
    },
    printOptions: {
      paperSize: "A4",
      orientation: "portrait",
      columns: questionLayout.columns,
      rowsPerPage: questionLayout.rowsPerPage,
      answerKeyColumns: answerLayout.columns,
      answerKeyRowsPerPage: answerLayout.rowsPerPage,
      fontSizeMode: "normal",
      showQuestionNumbers: true,
      showAnswerKey: options.includeAnswerKey !== false,
      answerKeyPlacement: options.includeAnswerKey === false ? "none" : "afterQuestions",
      pageBreakMode: "avoidLongTextCards",
      marginMode: "default",
      debugDataAttributes: false
    },
    validationSummary: cloneValue(generated.validation),
    batchA: {
      sourceId: generated.plan.sourceId,
      selectionMode: generated.plan.selectionMode,
      routeKind: "g3b_u04_global_context_shadow_pilot",
      knowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
      patternGroupIds: cloneValue(generated.plan.selectedPatternGroupIds),
      patternSpecIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
      allocation: cloneValue(generated.allocation)
    },
    semanticSummary: {
      semanticQuestionCount: questions.length,
      numericQuestionCount: 0,
      knowledgePointCount: 1,
      templateFamilyCount: 1,
      globalContextVariantCount: new Set(variantIds).size,
      knowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
      templateFamilyIds: ["tpl_g3b_u04_add_divide_joint_purchase_equal_share"]
    },
    provenance: {
      sourceType: "gctx_shadow_runtime",
      sourceTaskIds: [
        "S57F4_G3B_U04_CanonicalRouterAndHybridIntegration",
        "S57F5_G3B_U04_CanonicalValidatorWorksheetAndRendererIntegration",
        G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.task
      ],
      patternSpecIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
      curriculumNodeIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_SOURCE_ID],
      knowledgePointIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_KNOWLEDGE_POINT_ID],
      patternGroupIds: cloneValue(generated.plan.selectedPatternGroupIds),
      productionStorageCategory: "none",
      notes: ["Shadow-only evidence. No public selector or production admission."]
    },
    sections: [{
      sectionId: `section-${mode}`,
      title: mode === "before" ? "接入前題目" : "全域情境題目",
      description: null,
      patternIds: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
      questionIds: questions.map((question) => question.id),
      orderingIndex: 0
    }],
    configSnapshot: {
      schemaVersion: "gctx-p12r-shadow-pilot-v1",
      sourceId: generated.plan.sourceId,
      questionCount: questions.length,
      ordering: "groupedByPattern",
      includeAnswerKey: options.includeAnswerKey !== false,
      generationSeed: generated.plan.generationSeed,
      pilotMode: G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
      rendererProfileId: G3B_U04_SEMANTIC_LONG_TEXT_LAYOUT_PROFILE.profileId
    },
    generationContext: {
      questionKind: "batchAWorksheet",
      generationMode: "gctxGlobalContextShadowPilot",
      questionCount: questions.length,
      generationSeed: generated.plan.generationSeed,
      orderingSeed: generated.plan.generationSeed,
      resolvedOrderingSeed: generated.plan.generationSeed,
      orderingMode: "groupedByPattern",
      patternIdsInRenderOrder: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID]
    },
    allocationResult: cloneValue(generated.allocation),
    generatedQuestions: cloneValue(questions),
    orderedQuestionIds: questions.map((question) => question.id),
    questionDisplayModels: displayModels,
    answerKeyItems: answerItems,
    questionPages,
    answerKeyPages,
    summary: {
      questionCount: questions.length,
      questionPageCount: questionPages.length,
      answerKeyPageCount: answerKeyPages.length,
      orderingMode: "groupedByPattern",
      patternIdsInRenderOrder: [G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID],
      semanticQuestionCount: questions.length,
      numericQuestionCount: 0,
      globalContextVariantCount: new Set(variantIds).size
    },
    generationReport: {
      requestedQuestionCount: questions.length,
      generatedQuestionCount: questions.length,
      totalAttempts: questions.length,
      duplicateRejectCount: 0,
      constraintRejectCount: 0,
      patternReports: [{
        patternId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
        requestedQuestionCount: questions.length,
        generatedQuestionCount: questions.length,
        failureCount: 0,
        warnings: []
      }],
      validationWarnings: [],
      generationWarnings: [],
      errors: []
    }
  };
}

export function buildG3BU04GlobalContextPilotWorksheetDocuments(options = {}) {
  const generated = generateG3BU04GlobalContextPilotQuestions(options);
  if (!generated.ok) {
    return { ok: false, beforeWorksheetDocument: null, afterWorksheetDocument: null, generation: generated, errors: generated.errors, warnings: generated.warnings };
  }
  return {
    ok: true,
    beforeWorksheetDocument: assemblePilotWorksheet(generated, options, "before"),
    afterWorksheetDocument: assemblePilotWorksheet(generated, options, "after"),
    generation: generated,
    errors: [],
    warnings: []
  };
}
