
import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f6.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f6-extension.js";
import { G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID,
  G3A_U08_SAME_DENOMINATOR_NUMERIC_SPEC_ID,
  G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID,
  G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS,
} from "../registry/g3a-u08-same-denominator-compare-selector-projection.js";

const IDS = new Set(G3A_U08_SAME_DENOMINATOR_PATTERN_SPEC_IDS);
function isPgcR04Seed(seed) {
  return String(seed ?? "").includes("pgc-r04");
}
function isPgcR05Seed(seed) {
  return String(seed ?? "").includes("pgc-r05");
}
const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ leftNumerator: 2, denominator: 5, rightNumerator: 4, target: "pair", relation: "<" }),
  Object.freeze({ leftNumerator: 3, denominator: 6, rightNumerator: 3, target: "pair", relation: "=" }),
  Object.freeze({ leftNumerator: 5, denominator: 8, rightNumerator: 2, target: "pair", relation: ">" }),
  Object.freeze({ leftNumerator: 4, denominator: 7, rightNumerator: 7, target: "one", relation: "<" }),
  Object.freeze({ leftNumerator: 5, denominator: 5, rightNumerator: 5, target: "one", relation: "=" }),
  Object.freeze({ leftNumerator: 8, denominator: 6, rightNumerator: 6, target: "one", relation: ">" }),
]);
function buildPgcR05ApplicationFixtures() {
  const rows = [];
  for (let denominator = 2; denominator <= 20; denominator += 1) {
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator, target: "pair", relation: "<" }));
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator - 1, target: "pair", relation: "=" }));
    rows.push(Object.freeze({ leftNumerator: denominator + 1, denominator, rightNumerator: denominator - 1, target: "pair", relation: ">" }));
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator, target: "one", relation: "<" }));
    rows.push(Object.freeze({ leftNumerator: denominator, denominator, rightNumerator: denominator, target: "one", relation: "=" }));
    rows.push(Object.freeze({ leftNumerator: denominator + 1, denominator, rightNumerator: denominator, target: "one", relation: ">" }));
  }
  return rows;
}
const PGC_R05_APPLICATION_FIXTURES = Object.freeze(buildPgcR05ApplicationFixtures());
function buildNumericFixtures() {
  const rows = [];
  for (let denominator = 2; denominator <= 20; denominator += 1) {
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator, target: "pair", relation: "<" }));
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator - 1, target: "pair", relation: "=" }));
    rows.push(Object.freeze({ leftNumerator: denominator + 1, denominator, rightNumerator: denominator - 1, target: "pair", relation: ">" }));
    rows.push(Object.freeze({ leftNumerator: denominator - 1, denominator, rightNumerator: denominator, target: "one", relation: "<" }));
    rows.push(Object.freeze({ leftNumerator: denominator, denominator, rightNumerator: denominator, target: "one", relation: "=" }));
    rows.push(Object.freeze({ leftNumerator: denominator + 1, denominator, rightNumerator: denominator, target: "one", relation: ">" }));
  }
  return rows;
}
const NUMERIC_FIXTURES = Object.freeze(buildNumericFixtures()); // PGC-R04 same denominator numeric parameter space
export const P03F6_APPLICATION_AUTHORITY = Object.freeze({
  applicationQuestionRecordId: "app_qr_w02_ps_g3a_u08_same_denominator_compare_comparison_application",
  bindingCandidateId: "w02_bind_ps_g3a_u08_same_denominator_compare_comparison_application",
  proofCandidateId: "w02_n1proof_ps_g3a_u08_same_denominator_compare_comparison_application",
  fixtureId: "w02_fixture_ps_g3a_u08_same_denominator_compare_comparison_application_single_positive",
  promptBlueprint: "在{{place}}，{{actor}}為了完成班級活動所需的資源安排，依照{{quantityFacts}}求出{{targetQuantity}}。 請依題目中的數量關係作答。",
  contextLineage: Object.freeze({ macroContextId: "gctx_macro_school_learning", mesoSituationId: "gctx_meso_classroom_activity", microScenarioId: "gctx_micro_classroom_shared_resources", atomicEpisodeId: "gctx_episode_classroom_shared_resources_direct_quantity", surfaceTemplateId: "tpl_fusion_classroom_activity_direct_01" }),
  capabilityType: "APPLICATION_COMPATIBLE", operationFamilyId: "fraction_compare",
});
const compare = (leftN, leftD, rightN, rightD) => leftN * rightD < rightN * leftD ? "<" : leftN * rightD > rightN * leftD ? ">" : "=";
const seedOffset = (seed, size) => [...String(seed ?? "p03f6")].reduce((sum, char) => (sum + char.charCodeAt(0)) % size, 0);
function metadata(definition, authority) {
  return Object.freeze({
    patternId: definition.patternSpecId, sourceId: G3A_U08_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice006", definition.patternSpecId]), skillTags: definition.skillTags, difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G3A_U08_SOURCE_ID]), canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId, patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId, requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds, applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice006Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: authority ? "data/curriculum/context/registry/global-context-authority-index.json" : null,
    applicationQuestionRecordId: authority?.applicationQuestionRecordId ?? null, bindingCandidateId: authority?.bindingCandidateId ?? null,
    proofCandidateId: authority?.proofCandidateId ?? null, contextLineage: authority?.contextLineage ?? null, fixtureId: authority?.fixtureId ?? null,
  });
}
function buildQuestion(patternSpecId, ordinal, seed) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const authority = patternSpecId === G3A_U08_SAME_DENOMINATOR_APPLICATION_SPEC_ID ? P03F6_APPLICATION_AUTHORITY : null;
  const fixtures = authority
    ? PGC_R05_APPLICATION_FIXTURES
    : NUMERIC_FIXTURES;
  const fixture = fixtures[(ordinal + seedOffset(seed, fixtures.length)) % fixtures.length];
  const leftDenominator = fixture.denominator;
  const rightDenominator = fixture.denominator;
  const comparison = compare(fixture.leftNumerator, leftDenominator, fixture.rightNumerator, rightDenominator);
  // PGC-R04 duplicate authority declaration removed
  const leftText = `${fixture.leftNumerator}/${leftDenominator}`;
  const rightText = fixture.target === "one" ? "1" : `${fixture.rightNumerator}/${rightDenominator}`;
  const promptText = authority
    ? fixture.target === "one"
      ? `班級活動把每盒材料平均分成 ${leftDenominator} 份。甲組使用 ${fixture.leftNumerator}/${leftDenominator} 盒，與完整 1 盒相比，請填入 <、= 或 >。`
      : `班級活動把每盒材料平均分成 ${leftDenominator} 份。甲組使用 ${fixture.leftNumerator}/${leftDenominator} 盒，乙組使用 ${fixture.rightNumerator}/${rightDenominator} 盒，請填入 <、= 或 >。`
    : `${leftText} ○ ${rightText}，請填入 <、= 或 >。`;
  return Object.freeze({
    id: `${patternSpecId}-${ordinal + 1}`, sourceId: G3A_U08_SOURCE_ID, patternSpecId,
    kind: definition.kind, operation: definition.operation, operationFamilyId: definition.operationFamilyId,
    questionMode: definition.questionMode, mode: definition.mode, promptText, questionText: promptText,
    blankedDisplayText: promptText, displayText: `${promptText} ${comparison}`, answerText: comparison, finalAnswer: comparison,
    leftNumerator: fixture.leftNumerator, leftDenominator, rightNumerator: fixture.rightNumerator, rightDenominator,
    comparison, comparisonTarget: fixture.target, expectedRelation: fixture.relation,
    metadata: metadata(definition, authority),
    globalContextProduction: authority ? Object.freeze({ status: "GLOBAL_CONTEXT_BOUND", ...authority }) : null,
  });
}
export function canGenerateG3AU08SameDenominatorCompareQuestions(plan = {}) {
  return plan.sourceId === G3A_U08_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length === 1 && plan.patternSpecIds.every((id) => IDS.has(id));
}
export function validateG3AU08SameDenominatorCompareQuestion(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!IDS.has(id) || !definition) add("p03f6_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G3A_U08_SOURCE_ID || question.metadata?.sourceId !== G3A_U08_SOURCE_ID) add("p03f6_source_mismatch", "sourceId");
  if (question.metadata?.knowledgePointId !== G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID || question.metadata?.patternGroupId !== definition?.patternGroupId) add("p03f6_lineage_mismatch", "metadata");
  if (![question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator].every(Number.isSafeInteger)) add("p03f6_fraction_value_invalid", "fractions");
  if (question.leftDenominator <= 0 || question.rightDenominator <= 0 || question.leftDenominator !== question.rightDenominator) add("p03f6_same_positive_denominator_required", "denominator");
  const expected = compare(question.leftNumerator, question.leftDenominator, question.rightNumerator, question.rightDenominator);
  if (question.comparison !== expected || question.answerText !== expected || question.finalAnswer !== expected) add("p03f6_relation_invalid", "answerText");
  if (question.comparisonTarget === "one" && question.rightNumerator !== question.rightDenominator) add("p03f6_compare_one_identity_invalid", "rightNumerator");
  if (!['pair', 'one'].includes(question.comparisonTarget)) add("p03f6_comparison_target_invalid", "comparisonTarget");
  if (definition?.mode === "APPLICATION") {
    const authority = P03F6_APPLICATION_AUTHORITY;
    if (question.metadata?.bindingCandidateId !== authority.bindingCandidateId || JSON.stringify(question.metadata?.contextLineage) !== JSON.stringify(authority.contextLineage)) add("p03f6_global_context_lineage_invalid", "metadata.contextLineage");
    if (question.globalContextProduction?.status !== "GLOBAL_CONTEXT_BOUND") add("p03f6_global_context_binding_missing", "globalContextProduction");
  } else if (question.metadata?.contextLineage != null || question.globalContextProduction != null) add("p03f6_numeric_context_leak", "metadata.contextLineage");
  if (/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(question.blankedDisplayText ?? "")) add("p03f6_forbidden_surface_label", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG3AU08SameDenominatorCompareQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3AU08SameDenominatorCompareQuestions(plan)) return { ok: false, errors: [{ code: "p03f6_plan_not_supported", severity: "error", path: "patternSpecIds", message: "p03f6_plan_not_supported" }], warnings: [], questions: [], plan };
  const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 6;
  const patternSpecId = plan.patternSpecIds[0];
  const questions = Array.from({ length: count }, (_, index) => buildQuestion(patternSpecId, index, plan.generationSeed));
  const validationErrors = questions.flatMap((question, index) => validateG3AU08SameDenominatorCompareQuestion(question).errors.map((error) => ({ ...error, path: `questions[${index}].${error.path}` })));
  return Object.freeze({ ok: validationErrors.length === 0, errors: Object.freeze(validationErrors), warnings: Object.freeze([]), questions: Object.freeze(questions), plan: Object.freeze(plan), allocation: Object.freeze([{ patternSpecId, questionCount: count }]) });
}

// PGC-R04 legacy contract reconciliation V1

// PGC-R05 G3A-U08 same-denominator application diversity FullFix V1
