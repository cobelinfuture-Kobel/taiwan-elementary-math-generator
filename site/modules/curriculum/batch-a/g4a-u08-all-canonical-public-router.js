import {
  G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS,
  isS76QPublicG4AU08PatternGroupId,
} from "../registry/batch-a-selector-g4a-u08-all-canonical.js";
import {
  sampleG4AU08NumericCanonicalPatternSpec,
} from "./g4a-u08-numeric-canonical-hidden.js";
import {
  adaptG4AU08NumericSample,
  validateG4AU08NumericCanonicalItem,
} from "../../../../src/curriculum/g4a-u08/numeric-canonical-adapter-validator.js";
import {
  generateG4AU08ApplicationQuestions,
} from "./g4a-u08-application-generator.js";
import {
  generateG4AU08AppCostOverlayHidden,
} from "./g4a-u08-app-cost-overlay-hidden.js";
import {
  validateG4AU08AppCostOverlayItem,
} from "../../../../src/curriculum/g4a-u08/app-cost-overlay-validator.js";
import {
  G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS,
} from "../registry/g4a-u08-phase2b-promotion.js";
import {
  generateG4AU08CanonicalQuestions,
} from "./g4a-u08-canonical-router.js";

const SOURCE_ID = "g4a_u08_4a08";
const PROMOTION_ID = "s76q_g4a_u08_all_canonical_groups_public";
const PHASE2B_GROUP_SET = new Set(G4A_U08_PHASE2B_PROMOTED_PATTERN_GROUP_IDS);
const GROUP_BY_ID = new Map(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.map((row) => [row.patternGroupId, row]));
const NUMERIC_GROUP_SET = new Set(G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.filter((row) => row.mode === "numeric").map((row) => row.patternGroupId));
const COST_OVERLAY_GROUP_ID = "pg_g4a_u08_app_cost_overlay";

function clone(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s76q")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function allocateGroups(groups, questionCount) {
  const base = Math.floor(questionCount / groups.length);
  let remainder = questionCount % groups.length;
  return groups.map((group) => {
    const count = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
    return {
      patternGroupId: group.patternGroupId,
      knowledgePointId: group.primaryKnowledgePointId,
      patternSpecIds: [...group.patternSpecIds],
      questionCount: count,
      mode: group.mode,
      runtimeKind: NUMERIC_GROUP_SET.has(group.patternGroupId)
        ? "numeric_canonical"
        : PHASE2B_GROUP_SET.has(group.patternGroupId)
          ? "phase2b_application"
          : group.patternGroupId === COST_OVERLAY_GROUP_ID
            ? "app_cost_overlay"
            : "phase2a_application",
    };
  }).filter((entry) => entry.questionCount > 0);
}

export function requestsG4AU08AllCanonicalPublicRoute(plan = {}) {
  return plan.sourceId === SOURCE_ID
    && Array.isArray(plan.requestedPatternGroupIds)
    && plan.requestedPatternGroupIds.some(isS76QPublicG4AU08PatternGroupId);
}

export function normalizeG4AU08AllCanonicalPublicPlan(plan = {}) {
  if (plan.sourceId !== SOURCE_ID) return clone(plan);
  const requestedGroups = Array.isArray(plan.requestedPatternGroupIds) && plan.requestedPatternGroupIds.length > 0
    ? plan.requestedPatternGroupIds
    : Array.isArray(plan.selectedPatternGroupIds) ? plan.selectedPatternGroupIds : [];
  const requestedKnowledgePoints = new Set(plan.requestedKnowledgePointIds ?? plan.selectedKnowledgePointIds ?? []);
  const groups = requestedGroups.length > 0
    ? requestedGroups.map((id) => GROUP_BY_ID.get(id)).filter(Boolean)
    : G4A_U08_ALL_CANONICAL_PUBLIC_GROUPS.filter((group) => requestedKnowledgePoints.has(group.primaryKnowledgePointId));
  const uniqueGroups = [...new Map(groups.map((group) => [group.patternGroupId, group])).values()];
  const allocation = allocateGroups(uniqueGroups, plan.questionCount);
  return {
    ...clone(plan),
    selectedKnowledgePointIds: [...new Set(uniqueGroups.map((group) => group.primaryKnowledgePointId))],
    selectedPatternGroupIds: uniqueGroups.map((group) => group.patternGroupId),
    patternSpecIds: [...new Set(uniqueGroups.flatMap((group) => group.patternSpecIds))],
    allocation,
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
    resolverResult: {
      ok: uniqueGroups.length > 0 && allocation.length > 0,
      knowledgePointIds: [...new Set(uniqueGroups.map((group) => group.primaryKnowledgePointId))],
      patternGroupIds: uniqueGroups.map((group) => group.patternGroupId),
      patternSpecIds: [...new Set(uniqueGroups.flatMap((group) => group.patternSpecIds))],
      allocation: clone(allocation),
      errors: [],
      warnings: [],
      provenance: {
        resolver: "s76qAllCanonicalVisiblePatternGroupResolver",
        sourceId: SOURCE_ID,
        allocationStrategy: "balanced_by_pattern_group_then_pattern_spec",
        publicPatternSpecInjectionUsed: false,
        genericFallbackAllowed: false,
      },
    },
  };
}

export function validateG4AU08AllCanonicalPublicPlan(plan = {}) {
  const normalized = normalizeG4AU08AllCanonicalPublicPlan(plan);
  const errors = [];
  if (normalized.sourceId !== SOURCE_ID) errors.push(issue("G4A_U08_S76Q_SOURCE_INVALID", "sourceId", "來源必須是 G4A-U08。"));
  if (!["singleKnowledgePoint", "mixedKnowledgePointsSameUnit"].includes(normalized.selectionMode)) errors.push(issue("G4A_U08_S76Q_SELECTION_MODE_INVALID", "selectionMode", "只允許單一或同單元混合 KnowledgePoint。"));
  if (!Number.isInteger(normalized.questionCount) || normalized.questionCount < 1 || normalized.questionCount > 1000) errors.push(issue("G4A_U08_S76Q_COUNT_INVALID", "questionCount", "題數必須介於 1 到 1000。"));
  if (normalized.selectedPatternGroupIds.length === 0 || normalized.selectedPatternGroupIds.some((id) => !isS76QPublicG4AU08PatternGroupId(id))) errors.push(issue("G4A_U08_S76Q_GROUP_INVALID", "selectedPatternGroupIds", "包含未公開 canonical PatternGroup。"));
  if (normalized.publicPatternSpecInjectionUsed !== false || normalized.genericFallbackAllowed !== false) errors.push(issue("G4A_U08_S76Q_INJECTION_FORBIDDEN", "publicControls", "禁止 PatternSpec 注入與 generic fallback。"));
  const allocated = normalized.allocation.reduce((sum, entry) => sum + entry.questionCount, 0);
  if (allocated !== normalized.questionCount) errors.push(issue("G4A_U08_S76Q_ALLOCATION_MISMATCH", "allocation", "配置題數不一致。", { expected: normalized.questionCount, actual: allocated }));
  return { ok: errors.length === 0, errors, warnings: [], plan: normalized };
}

function publicNumericQuestion(item, entry, sequenceNumber) {
  return {
    id: `${item.patternSpecId}-${sequenceNumber}`,
    sourceId: item.sourceId,
    unitCode: item.unitCode,
    knowledgePointId: item.knowledgePointId,
    patternGroupId: item.patternGroupId,
    resolvedPatternGroupId: entry.patternGroupId,
    patternSpecId: item.patternSpecId,
    legacyPatternSpecId: item.legacyPatternSpecId,
    mode: "numeric",
    kind: "g4aU08CanonicalNumericExpression",
    promptText: item.prompt,
    displayText: `${item.expression} = ${item.answerModel.value}`,
    blankedDisplayText: `${item.expression} = ______`,
    answerText: String(item.answerModel.value),
    finalAnswer: item.answerModel.value,
    answerModelShape: "numericAnswer",
    expression: item.expression,
    expressionTokens: clone(item.expressionTokens),
    operationOrderTrace: clone(item.operations),
    canonicalEvidence: clone(item.canonicalEvidence),
    reasoningRole: item.reasoningRole,
    selectorStatus: "visible",
    visibilityStatus: "visible",
    canonicalRouting: "enabled",
    worksheetReachability: "enabled",
    productionUse: "preview_only_pending_s76r",
    generatorRouting: "s76q_canonical_resolver_allocation",
    promotionRegistryId: PROMOTION_ID,
    validationStatus: "accepted",
  };
}

function publicCostOverlayQuestion(item, entry, sequenceNumber) {
  return {
    id: `${item.patternSpecId}-${sequenceNumber}`,
    sourceId: item.sourceId,
    unitCode: item.unitCode,
    knowledgePointId: item.knowledgePointId,
    patternGroupId: item.patternGroupId,
    resolvedPatternGroupId: entry.patternGroupId,
    patternSpecId: item.patternSpecId,
    legacyTemplateId: item.templateFamilyId,
    mode: "application",
    applicationText: true,
    promptText: item.prompt,
    displayText: item.prompt,
    blankedDisplayText: item.prompt,
    answerText: `${item.answerModel.value}${item.answerModel.unit}`,
    finalAnswer: item.answerModel.value,
    answerModelShape: "numericAnswer",
    canonicalExpression: item.expression,
    expressionTokens: clone(item.expressionTokens),
    structuredAnswer: { expression: item.expression, value: item.answerModel.value, unit: item.answerModel.unit, intermediateValues: clone(item.intermediateValues) },
    reasoningRole: item.reasoningRole,
    semanticRelations: clone(item.semanticRelations),
    context: clone(item.context),
    selectorStatus: "visible",
    visibilityStatus: "visible",
    canonicalRouting: "enabled",
    worksheetReachability: "enabled",
    productionUse: "preview_only_pending_s76r",
    generatorRouting: "s76q_canonical_resolver_allocation",
    promotionRegistryId: PROMOTION_ID,
    validationStatus: "accepted",
  };
}

function promoteLegacyApplication(question, entry, sequenceNumber) {
  return {
    ...clone(question),
    id: `${question.patternSpecId}-${sequenceNumber}`,
    knowledgePointId: entry.knowledgePointId,
    patternGroupId: entry.patternGroupId,
    resolvedPatternGroupId: entry.patternGroupId,
    selectorStatus: "visible",
    visibilityStatus: "visible",
    canonicalRouting: "enabled",
    worksheetReachability: "enabled",
    productionUse: "preview_only_pending_s76r",
    generatorRouting: "s76q_canonical_resolver_allocation",
    promotionRegistryId: PROMOTION_ID,
    validationStatus: "accepted",
  };
}

export function generateG4AU08AllCanonicalPublicQuestions(plan = {}) {
  const checked = validateG4AU08AllCanonicalPublicPlan(plan);
  const normalized = checked.plan;
  if (!checked.ok) return { ok: false, plan: normalized, questions: [], allocation: clone(normalized.allocation ?? []), errors: checked.errors, warnings: [] };
  const questions = [];
  const errors = [];
  let sequenceNumber = 0;
  for (const entry of normalized.allocation) {
    if (entry.runtimeKind === "numeric_canonical") {
      for (let index = 0; index < entry.questionCount; index += 1) {
        const specId = entry.patternSpecIds[index % entry.patternSpecIds.length];
        const sample = sampleG4AU08NumericCanonicalPatternSpec(specId, { seed: `${normalized.generationSeed}:${entry.patternGroupId}:${index}` });
        const item = adaptG4AU08NumericSample(sample);
        const validation = validateG4AU08NumericCanonicalItem(item);
        if (!validation.valid) { errors.push(issue("G4A_U08_S76Q_NUMERIC_VALIDATION_FAILED", "validation", "Numeric blocking validator rejected item.", { validationErrors: validation.errors })); continue; }
        sequenceNumber += 1;
        questions.push(publicNumericQuestion(item, entry, sequenceNumber));
      }
      continue;
    }
    if (entry.runtimeKind === "app_cost_overlay") {
      for (let index = 0; index < entry.questionCount; index += 1) {
        const item = generateG4AU08AppCostOverlayHidden({ seed: `${normalized.generationSeed}:${entry.patternGroupId}:${index}` });
        const validation = validateG4AU08AppCostOverlayItem(item);
        if (!validation.valid) { errors.push(issue("G4A_U08_S76Q_COST_OVERLAY_VALIDATION_FAILED", "validation", "Cost-overlay validator rejected item.", { validationErrors: validation.errors })); continue; }
        sequenceNumber += 1;
        questions.push(publicCostOverlayQuestion(item, entry, sequenceNumber));
      }
      continue;
    }
    if (entry.runtimeKind === "phase2b_application") {
      const result = generateG4AU08CanonicalQuestions({
        ...clone(normalized),
        selectedKnowledgePointIds: [entry.knowledgePointId],
        selectedPatternGroupIds: [entry.patternGroupId],
        requestedPatternGroupIds: [entry.patternGroupId],
        questionCount: entry.questionCount,
      });
      if (!result.ok) { errors.push(...result.errors); continue; }
      for (const question of result.questions) {
        sequenceNumber += 1;
        questions.push({ ...question, id: `${question.patternSpecId}-${sequenceNumber}`, productionUse: "preview_only_pending_s76r", promotionRegistryId: PROMOTION_ID, worksheetReachability: "enabled" });
      }
      continue;
    }
    const result = generateG4AU08ApplicationQuestions({
      sourceId: SOURCE_ID,
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [entry.knowledgePointId],
      selectedPatternGroupIds: [entry.patternGroupId],
      questionCount: entry.questionCount,
      ordering: "groupedByPattern",
      generationSeed: `${normalized.generationSeed}:${entry.patternGroupId}`,
    });
    if (!result.ok) { errors.push(...result.errors); continue; }
    for (const question of result.questions) {
      sequenceNumber += 1;
      questions.push(promoteLegacyApplication(question, entry, sequenceNumber));
    }
  }
  if (questions.length !== normalized.questionCount) errors.push(issue("G4A_U08_S76Q_OUTPUT_COUNT_MISMATCH", "questions", "輸出題數不一致。", { expected: normalized.questionCount, actual: questions.length }));
  if (errors.length > 0) return { ok: false, plan: normalized, questions: [], allocation: clone(normalized.allocation), errors, warnings: [] };
  return { ok: true, plan: { ...normalized, routeKind: "g4a_u08_all_canonical_public" }, questions, allocation: clone(normalized.allocation), errors: [], warnings: [] };
}

export function validateG4AU08AllCanonicalPublicQuestion(question) {
  const errors = [];
  if (question.sourceId !== SOURCE_ID) errors.push(issue("G4A_U08_S76Q_QUESTION_SOURCE_INVALID", "sourceId", "題目來源錯誤。"));
  if (!isS76QPublicG4AU08PatternGroupId(question.resolvedPatternGroupId ?? question.patternGroupId)) errors.push(issue("G4A_U08_S76Q_QUESTION_GROUP_INVALID", "patternGroupId", "PatternGroup 未公開。"));
  if (!Number.isInteger(question.finalAnswer)) errors.push(issue("G4A_U08_S76Q_QUESTION_ANSWER_INVALID", "finalAnswer", "答案必須是整數。"));
  if (question.selectorStatus !== "visible" || question.canonicalRouting !== "enabled" || question.worksheetReachability !== "enabled" || question.productionUse !== "preview_only_pending_s76r") errors.push(issue("G4A_U08_S76Q_QUESTION_LIFECYCLE_INVALID", "lifecycle", "S76Q lifecycle 不一致。"));
  return { ok: errors.length === 0, errors, warnings: [] };
}
