import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f13.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f13-extension.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_QUOTIENT_CONTEXT_KP_ID,
  G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID,
  G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID,
  G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS,
} from "../registry/g5a-u04-expand-reduce-simplest-selector-projection.js";

const IDS = new Set(G5A_U04_QUOTIENT_CONTEXT_PATTERN_SPEC_IDS);
const REQUIRED_CAPABILITY_IDS = Object.freeze([
  "cap_fraction_arithmetic",
  "cap_fraction_domain_validator",
  "cap_fraction_number_system",
]);
const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ totalQuantity: 6, recipientCount: 4 }), Object.freeze({ totalQuantity: 5, recipientCount: 2 }),
  Object.freeze({ totalQuantity: 7, recipientCount: 3 }), Object.freeze({ totalQuantity: 8, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 9, recipientCount: 4 }), Object.freeze({ totalQuantity: 10, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 11, recipientCount: 2 }), Object.freeze({ totalQuantity: 11, recipientCount: 3 }),
  Object.freeze({ totalQuantity: 12, recipientCount: 5 }), Object.freeze({ totalQuantity: 13, recipientCount: 4 }),
  Object.freeze({ totalQuantity: 14, recipientCount: 3 }), Object.freeze({ totalQuantity: 15, recipientCount: 4 }),
  Object.freeze({ totalQuantity: 16, recipientCount: 3 }), Object.freeze({ totalQuantity: 17, recipientCount: 5 }),
  Object.freeze({ totalQuantity: 18, recipientCount: 7 }), Object.freeze({ totalQuantity: 19, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 20, recipientCount: 3 }), Object.freeze({ totalQuantity: 21, recipientCount: 8 }),
  Object.freeze({ totalQuantity: 22, recipientCount: 7 }), Object.freeze({ totalQuantity: 23, recipientCount: 4 }),
  Object.freeze({ totalQuantity: 24, recipientCount: 5 }), Object.freeze({ totalQuantity: 25, recipientCount: 6 }),
  Object.freeze({ totalQuantity: 26, recipientCount: 9 }), Object.freeze({ totalQuantity: 27, recipientCount: 8 }),
]);
function buildNumericFixtures() {
  const rows = [];
  for (let totalQuantity = 1; totalQuantity <= 30; totalQuantity += 1) {
    for (let recipientCount = 2; recipientCount <= 15; recipientCount += 1) rows.push(Object.freeze({ totalQuantity, recipientCount }));
  }
  return rows;
}
const NUMERIC_FIXTURES = Object.freeze(buildNumericFixtures()); // PGC-R04 quotient numeric parameter space
const APPLICATION_SURFACES = Object.freeze([
  "農園將 {{total}} 份同量的育苗資源平均分配給 {{count}} 個栽培區，每個栽培區分得多少份資源？",
  "農業生產小組把 {{total}} 份批次資源平均安排到 {{count}} 個種植區，每區可分得多少份？",
  "為了完成可追溯的生產批次，農園把 {{total}} 份相同資源平均配置給 {{count}} 組，每組分得多少份？",
  "農園有 {{total}} 份同規格的栽培資源，要平均供應 {{count}} 個區域。每個區域可取得多少份？",
  "生產小組將 {{total}} 份資源平均分成 {{count}} 個批次，每一批次是多少份？",
  "農業活動把 {{total}} 份相同物資平均分配到 {{count}} 個工作區，每區分得多少份？",
]);

export const P03F13_QUOTIENT_APPLICATION_AUTHORITY = Object.freeze({
  applicationQuestionRecordId: "app_qr_w02_ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application",
  bindingCandidateId: "w02_bind_ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application",
  proofCandidateId: "w02_n1proof_ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application",
  fixtureId: "w02_fixture_ps_g5a_u04_quotient_as_fraction_context_share_per_recipient_application_single_positive",
  contextLineage: Object.freeze({
    macroContextId: "gctx_macro_food_agriculture",
    mesoSituationId: "gctx_meso_agriculture_production",
    microScenarioId: "gctx_micro_crop_batch_plan",
    atomicEpisodeId: "gctx_episode_crop_batch_plan_direct_quantity",
    surfaceTemplateId: "tpl_fusion_agriculture_production_direct_01",
  }),
  capabilityType: "APPLICATION_REQUIRED",
  operationFamilyId: "quotient_fraction_context",
});

function gcd(a, b) {
  let x = Math.abs(a); let y = Math.abs(b);
  while (y !== 0) [x, y] = [y, x % y];
  return x || 1;
}
function reduced(totalQuantity, recipientCount) {
  const divisor = gcd(totalQuantity, recipientCount);
  return Object.freeze({ numerator: totalQuantity / divisor, denominator: recipientCount / divisor });
}
function fractionText(value) { return value.denominator === 1 ? String(value.numerator) : `${value.numerator}/${value.denominator}`; }
function seedOffset(seed, size) {
  return [...String(seed ?? "p03f13-quotient")].reduce((sum, char) => (sum + char.charCodeAt(0)) % size, 0);
}
function metadata(definition, authority) {
  return Object.freeze({
    patternId: definition.patternSpecId,
    sourceId: G5A_U04_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice013", definition.patternSpecId]),
    skillTags: definition.skillTags,
    difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G5A_U04_SOURCE_ID]),
    canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId,
    patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId,
    requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice013Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1",
    validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: authority ? "data/curriculum/context/registry/global-context-authority-index.json" : null,
    applicationQuestionRecordId: authority?.applicationQuestionRecordId ?? null,
    bindingCandidateId: authority?.bindingCandidateId ?? null,
    proofCandidateId: authority?.proofCandidateId ?? null,
    fixtureId: authority?.fixtureId ?? null,
    contextLineage: authority?.contextLineage ?? null,
  });
}
function buildQuestion(patternSpecId, fixture, index, mode) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const value = reduced(fixture.totalQuantity, fixture.recipientCount);
  const canonicalText = fractionText(value);
  const authority = mode === "application" ? P03F13_QUOTIENT_APPLICATION_AUTHORITY : null;
  const promptText = mode === "application"
    ? APPLICATION_SURFACES[index % APPLICATION_SURFACES.length]
      .replace("{{total}}", String(fixture.totalQuantity))
      .replace("{{count}}", String(fixture.recipientCount))
    : `${fixture.totalQuantity} ÷ ${fixture.recipientCount} 的商用最簡分數表示是多少？`;
  const answerText = mode === "application" ? `${canonicalText} 份` : canonicalText;
  return Object.freeze({
    id: `${patternSpecId}-${index + 1}`,
    sourceId: G5A_U04_SOURCE_ID,
    patternSpecId,
    kind: "g5aU04QuotientAsFractionContext",
    operation: "quotient_fraction_context",
    operationFamilyId: "quotient_fraction_context",
    questionMode: mode,
    mode: mode === "application" ? "APPLICATION" : "NUMERIC",
    promptText,
    questionText: promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    totalQuantity: fixture.totalQuantity,
    recipientCount: fixture.recipientCount,
    sharePerRecipient: Object.freeze({ ...value }),
    finalAnswer: Object.freeze({ ...value, canonicalText, answerType: "reduced_fraction", exact: true, unit: mode === "application" ? "份" : null }),
    metadata: metadata(definition, authority),
    globalContextProduction: authority ? Object.freeze({ status: "GLOBAL_CONTEXT_BOUND", ...authority }) : null,
  });
}

export function canGenerateG5AU04QuotientFractionQuestions(plan = {}) {
  return plan.sourceId === G5A_U04_SOURCE_ID
    && Array.isArray(plan.patternSpecIds)
    && plan.patternSpecIds.length === 1
    && IDS.has(plan.patternSpecIds[0]);
}
export function validateG5AU04QuotientFractionQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!IDS.has(id) || !definition) add("p03f13_quotient_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G5A_U04_SOURCE_ID || question.metadata?.sourceId !== G5A_U04_SOURCE_ID) add("p03f13_quotient_source_mismatch", "sourceId");
  if (question.metadata?.knowledgePointId !== G5A_U04_QUOTIENT_CONTEXT_KP_ID || question.metadata?.patternGroupId !== definition?.patternGroupId) add("p03f13_quotient_lineage_mismatch", "metadata");
  if (!Number.isSafeInteger(question.totalQuantity) || question.totalQuantity <= 0 || !Number.isSafeInteger(question.recipientCount) || question.recipientCount <= 1) add("p03f13_quotient_operands_invalid", "totalQuantity");
  const expected = reduced(question.totalQuantity, question.recipientCount);
  const expectedText = fractionText(expected);
  if (question.sharePerRecipient?.numerator !== expected.numerator || question.sharePerRecipient?.denominator !== expected.denominator
    || question.finalAnswer?.numerator !== expected.numerator || question.finalAnswer?.denominator !== expected.denominator
    || question.finalAnswer?.canonicalText !== expectedText || question.finalAnswer?.exact !== true) {
    add("p03f13_quotient_answer_invalid", "finalAnswer");
  }
  const expectedAnswerText = question.questionMode === "application" ? `${expectedText} 份` : expectedText;
  if (question.answerText !== expectedAnswerText) add("p03f13_quotient_answer_text_invalid", "answerText");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(REQUIRED_CAPABILITY_IDS)) add("p03f13_quotient_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.questionMode === "application") {
    const authority = P03F13_QUOTIENT_APPLICATION_AUTHORITY;
    if (id !== G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID
      || question.metadata?.bindingCandidateId !== authority.bindingCandidateId
      || JSON.stringify(question.metadata?.contextLineage) !== JSON.stringify(authority.contextLineage)
      || question.globalContextProduction?.status !== "GLOBAL_CONTEXT_BOUND") {
      add("p03f13_quotient_context_lineage_invalid", "metadata.contextLineage");
    }
  } else if (id !== G5A_U04_QUOTIENT_CONTEXT_NUMERIC_SPEC_ID || question.metadata?.contextLineage != null || question.globalContextProduction != null) {
    add("p03f13_quotient_numeric_context_leak", "metadata.contextLineage");
  }
  if (/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(question.blankedDisplayText ?? ""))) add("p03f13_quotient_forbidden_surface", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG5AU04QuotientFractionQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG5AU04QuotientFractionQuestions(plan)) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f13_quotient_plan_not_supported", severity: "error", path: "plan", message: "Slice013 quotient runtime accepts one admitted numeric or application PatternSpec." }], warnings: [] };
  }
  const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 6;
  const patternSpecId = plan.patternSpecIds[0];
  const mode = patternSpecId === G5A_U04_QUOTIENT_CONTEXT_APPLICATION_SPEC_ID ? "application" : "numeric";
  const fixturePool = mode === "application" ? APPLICATION_FIXTURES : NUMERIC_FIXTURES;
  if (count <= 0 || count > fixturePool.length) {
    return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f13_quotient_question_count_invalid", severity: "error", path: "questionCount", message: "The selected quotient mode does not provide enough unique witnesses." }], warnings: [] };
  }
  const offset = seedOffset(plan.generationSeed, fixturePool.length);
  const selected = Array.from({ length: count }, (_, index) => fixturePool[(offset + index) % fixturePool.length]);
  const questions = selected.map((fixture, index) => buildQuestion(patternSpecId, fixture, index, mode));
  const errors = questions.flatMap((question, index) => validateG5AU04QuotientFractionQuestion(question).errors.map((entry) => ({ ...entry, path: `questions[${index}].${entry.path}` })));
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f13_quotient_duplicate_prompt", severity: "error", path: "questions", message: "Duplicate prompt detected." });
  return Object.freeze({ ok: errors.length === 0, plan: Object.freeze(plan), questions: Object.freeze(questions), allocation: Object.freeze([{ patternSpecId, questionCount: questions.length }]), errors: Object.freeze(errors), warnings: Object.freeze([]) });
}

// PGC-R05 bounded application capacity FullFix V1
