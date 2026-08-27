import { buildBatchABrowserPlan } from "./batch-a-browser-generator.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f2-extension.js";
import { G3A_U08_SOURCE_ID } from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID,
  G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID,
  G3A_U08_SLICE002_PATTERN_SPEC_IDS,
} from "../registry/g3a-u08-slice002-selector-projection.js";

const Q2_IDS = new Set(G3A_U08_SLICE002_PATTERN_SPEC_IDS);
const UNIT_FRACTION_FIXTURES = Object.freeze(
  Array.from({ length: 11 }, (_, index) => index + 2)
    .flatMap((denominator) => Array.from(
      { length: denominator - 1 },
      (_, numeratorIndex) => Object.freeze({
        numerator: numeratorIndex + 1,
        denominator,
      }),
    )),
);
const ITEMS_PER_WHOLE_OPTIONS = Object.freeze([6, 8, 10, 12, 15, 16, 18, 20, 24, 30]);
const DISCRETE_FIXTURES = Object.freeze(
  ITEMS_PER_WHOLE_OPTIONS.flatMap((itemsPerWhole) => (
    Array.from({ length: 11 }, (_, index) => index + 2)
      .filter((denominator) => itemsPerWhole % denominator === 0)
      .flatMap((denominator) => Array.from(
        { length: (denominator - 1) * 3 },
        (_, fixtureIndex) => Object.freeze({
          itemsPerWhole,
          denominator,
          numerator: fixtureIndex % (denominator - 1) + 1,
          wholeUnits: Math.floor(fixtureIndex / (denominator - 1)),
        }),
      ))
  )),
);
const UNIT_FRACTION_APPLICATION_SURFACES = Object.freeze([
  "運動會補給站把一份水果平均分成 {{denominator}} 小份。小安取得 {{count}} 小份，共是一份水果的幾分之幾？",
  "校園健康活動把一份點心平均分成 {{denominator}} 小份。參與者拿到 {{count}} 小份，占整份的幾分之幾？",
  "社區運動日將一份補給平均分成 {{denominator}} 份，其中 {{count}} 份合起來是整份的幾分之幾？",
  "體育課把一組運動貼紙平均分成 {{denominator}} 份。小安得到 {{count}} 份，得到全組的幾分之幾？",
  "健康闖關活動將一份水果盤平均分成 {{denominator}} 份，取出 {{count}} 份後，取出的部分占幾分之幾？",
  "運動社團把一份能量補給平均分成 {{denominator}} 小包。使用 {{count}} 小包，占原來一份的幾分之幾？",
  "校慶接力活動把一份飲水補給平均分成 {{denominator}} 份。分出 {{count}} 份，占全部的幾分之幾？",
  "戶外活動把一份補給品平均切成 {{denominator}} 份。隊員拿走 {{count}} 份，拿走全份的幾分之幾？",
]);
const gcd = (a, b) => { let x = Math.abs(a); let y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
const fraction = (n, d) => { const g = gcd(n, d); return Object.freeze({ numerator: n / g, denominator: d / g }); };
const fractionText = (value) => `${value.numerator}/${value.denominator}`;
const hashSeed = (value) => {
  let acc = 2166136261;
  for (const char of String(value ?? "p03f2")) { acc ^= char.charCodeAt(0); acc = Math.imul(acc, 16777619) >>> 0; }
  return acc || 1;
};
const state = (seed, index, channel) => {
  let value = (hashSeed(`${seed}:${channel}`) + Math.imul(index + 1, 0x9e3779b1)) >>> 0;
  value ^= value >>> 16; value = Math.imul(value, 0x7feb352d) >>> 0; value ^= value >>> 15; value = Math.imul(value, 0x846ca68b) >>> 0;
  return (value ^ (value >>> 16)) >>> 0;
};

export const P03F2_APPLICATION_AUTHORITIES = Object.freeze({
  [G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID]: Object.freeze({
    applicationQuestionRecordId: "app_qr_w02_ps_g3a_u08_unit_fraction_accumulation_fraction_application",
    bindingCandidateId: "w02_bind_ps_g3a_u08_unit_fraction_accumulation_fraction_application",
    proofCandidateId: "w02_n1proof_ps_g3a_u08_unit_fraction_accumulation_fraction_application",
    promptBlueprint: "在{{place}}，{{actor}}為了讓參與者取得足夠且合理的活動補給，依照{{quantityFacts}}求出{{targetQuantity}}。 請依題目中的數量關係作答。",
    contextLineage: Object.freeze({ macroContextId: "gctx_macro_health_sports", mesoSituationId: "gctx_meso_nutrition_distribution", microScenarioId: "gctx_micro_activity_supply_distribution", atomicEpisodeId: "gctx_episode_activity_supply_distribution_direct_quantity", surfaceTemplateId: "tpl_fusion_nutrition_distribution_direct_01" }),
    fixtureId: "w02_fixture_ps_g3a_u08_unit_fraction_accumulation_fraction_application_single_positive",
    capabilityType: "APPLICATION_COMPATIBLE", operationFamilyId: "fraction_accumulation",
  }),
  [G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID]: Object.freeze({
    applicationQuestionRecordId: "app_qr_w02_ps_g3a_u08_discrete_set_fraction_item_count_application",
    bindingCandidateId: "w02_bind_ps_g3a_u08_discrete_set_fraction_item_count_application",
    proofCandidateId: "w02_n1proof_ps_g3a_u08_discrete_set_fraction_item_count_application",
    promptBlueprint: "在{{place}}，{{actor}}為了依古代交易機制計算或比較交換結果，依照{{quantityFacts}}求出{{targetQuantity}}。 請依題目中的數量關係作答。",
    contextLineage: Object.freeze({ macroContextId: "gctx_macro_culture_history", mesoSituationId: "gctx_meso_ancient_trade", microScenarioId: "gctx_micro_ancient_market_exchange", atomicEpisodeId: "gctx_episode_ancient_market_exchange_direct_quantity", surfaceTemplateId: "tpl_fusion_ancient_trade_direct_01" }),
    fixtureId: "w02_fixture_ps_g3a_u08_discrete_set_fraction_item_count_application_single_positive",
    capabilityType: "APPLICATION_REQUIRED", operationFamilyId: "discrete_fraction_conversion",
  }),
  [G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID]: Object.freeze({
    applicationQuestionRecordId: "app_qr_w02_ps_g3a_u08_discrete_set_fraction_fractional_units_application",
    bindingCandidateId: "w02_bind_ps_g3a_u08_discrete_set_fraction_fractional_units_application",
    proofCandidateId: "w02_n1proof_ps_g3a_u08_discrete_set_fraction_fractional_units_application",
    promptBlueprint: "在{{place}}，{{actor}}為了在可用時間內公平完成家務，依照{{quantityFacts}}求出{{targetQuantity}}。 請依題目中的數量關係作答。",
    contextLineage: Object.freeze({ macroContextId: "gctx_macro_household_family", mesoSituationId: "gctx_meso_shared_chores", microScenarioId: "gctx_micro_chore_schedule", atomicEpisodeId: "gctx_episode_chore_schedule_direct_quantity", surfaceTemplateId: "tpl_fusion_shared_chores_direct_01" }),
    fixtureId: "w02_fixture_ps_g3a_u08_discrete_set_fraction_fractional_units_application_single_positive",
    capabilityType: "APPLICATION_REQUIRED", operationFamilyId: "discrete_fraction_conversion",
  }),
});

function metadata(definition, authority = null) {
  return Object.freeze({
    patternId: definition.patternSpecId, sourceId: G3A_U08_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice002", definition.patternSpecId]),
    skillTags: definition.skillTags, difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G3A_U08_SOURCE_ID]), canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId, patternGroupId: definition.patternGroupId,
    operationFamilyId: definition.operationFamilyId, requestedUnknownRole: definition.requestedUnknownRole,
    requiredCapabilityIds: definition.requiredCapabilityIds, applicationClassification: definition.applicationClassification,
    productAdmissionTask: "P03F_W3DirectProductVerticalSlice002Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    globalContextAuthorityPath: authority ? "data/curriculum/context/registry/global-context-authority-index.json" : null,
    applicationQuestionRecordId: authority?.applicationQuestionRecordId ?? null,
    bindingCandidateId: authority?.bindingCandidateId ?? null, proofCandidateId: authority?.proofCandidateId ?? null,
    contextLineage: authority?.contextLineage ?? null, fixtureId: authority?.fixtureId ?? null,
  });
}
function mixedText(wholeUnits, numerator, denominator) { return wholeUnits > 0 ? `${wholeUnits}又${numerator}/${denominator}` : `${numerator}/${denominator}`; }
function coprimeStep(size) {
  for (const candidate of [97, 89, 83, 79, 73, 71, 67, 61]) {
    if (gcd(candidate, size) === 1) return candidate;
  }
  return 1;
}
function fixtureAt(fixtures, ordinal, seed, channel) {
  const offset = state(seed, 0, `${channel}:offset`) % fixtures.length;
  const index = (offset + ordinal * coprimeStep(fixtures.length)) % fixtures.length;
  return fixtures[index];
}
function buildQuestion(patternSpecId, ordinal, seed, variantOffset = 0) {
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const sampleIndex = ordinal + variantOffset;
  const isUnitFraction = [
    G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID,
    G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID,
  ].includes(patternSpecId);
  const fixture = fixtureAt(
    isUnitFraction ? UNIT_FRACTION_FIXTURES : DISCRETE_FIXTURES,
    sampleIndex,
    seed,
    patternSpecId,
  );
  const { denominator, numerator } = fixture;
  const unitFractionCount = numerator;
  const wholeUnits = fixture.wholeUnits ?? 0;
  const itemsPerWhole = fixture.itemsPerWhole ?? 12;
  const partialItemCount = numerator * itemsPerWhole / denominator;
  const itemCount = wholeUnits * itemsPerWhole + partialItemCount;
  const fractionalUnits = fraction(itemCount, itemsPerWhole);
  const authority = P03F2_APPLICATION_AUTHORITIES[patternSpecId] ?? null;
  let promptText;
  let answerText;
  let finalAnswer;
  if (patternSpecId === G3A_U08_UNIT_FRACTION_NUMERIC_SPEC_ID) {
    const surfaceVariant = state(seed, sampleIndex, patternSpecId + ":surface") % 4;
    promptText = surfaceVariant === 0
      ? unitFractionCount + " 個 1/" + denominator + " 合起來是多少？"
      : surfaceVariant === 1
        ? "把 " + unitFractionCount + " 個單位分數 1/" + denominator + " 相加，結果是多少？"
        : surfaceVariant === 2
          ? "1/" + denominator + " 連續累加 " + unitFractionCount + " 次，得到哪個分數？"
          : "用乘法表示 " + unitFractionCount + " × 1/" + denominator + "，乘積是多少？";
    finalAnswer = fraction(unitFractionCount, denominator); answerText = fractionText(finalAnswer);
  } else if (patternSpecId === G3A_U08_UNIT_FRACTION_APPLICATION_SPEC_ID) {
    const surface = UNIT_FRACTION_APPLICATION_SURFACES[
      state(seed, sampleIndex, patternSpecId + ":application-surface") % UNIT_FRACTION_APPLICATION_SURFACES.length
    ];
    promptText = surface
      .replace("{{denominator}}", String(denominator))
      .replace("{{count}}", String(unitFractionCount));
    finalAnswer = fraction(unitFractionCount, denominator); answerText = fractionText(finalAnswer);
  } else if ([G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID, G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID].includes(patternSpecId)) {
    promptText = patternSpecId === G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID
      ? `古代市集每盒交易籌碼有 ${itemsPerWhole} 枚。商人準備 ${mixedText(wholeUnits, numerator, denominator)} 盒，共有幾枚？`
      : `每個大單位有 ${itemsPerWhole} 個，${mixedText(wholeUnits, numerator, denominator)} 個大單位共有幾個？`;
    finalAnswer = itemCount; answerText = `${itemCount}`;
  } else {
    promptText = patternSpecId === G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID
      ? `家中每完成 ${itemsPerWhole} 張家務卡算 1 組。完成 ${itemCount} 張相當於幾組？`
      : `每 ${itemsPerWhole} 個為 1 個大單位，${itemCount} 個相當於多少個大單位？`;
    finalAnswer = fractionalUnits; answerText = fractionText(fractionalUnits);
  }
  return Object.freeze({
    id: `${patternSpecId}-${ordinal}`, sourceId: G3A_U08_SOURCE_ID, patternSpecId,
    kind: definition.kind, operation: definition.operation, operationFamilyId: definition.operationFamilyId,
    questionMode: definition.questionMode, mode: definition.mode,
    promptText, questionText: promptText, blankedDisplayText: promptText, displayText: `${promptText} ${answerText}`,
    answerText, finalAnswer, numerator, denominator, unitFractionCount, wholeUnits,
    itemsPerWhole, itemCount, fractionalUnits,
    metadata: metadata(definition, authority),
    globalContextProduction: authority ? Object.freeze({ status: "GLOBAL_CONTEXT_BOUND", ...authority }) : null,
  });
}
function allocate(patternSpecIds, questionCount) {
  const base = Math.floor(questionCount / patternSpecIds.length);
  const remainder = questionCount % patternSpecIds.length;
  return patternSpecIds.map((patternSpecId, index) => ({ patternSpecId, questionCount: base + (index < remainder ? 1 : 0) })).filter((row) => row.questionCount > 0);
}
export function canGenerateG3AU08Slice002Questions(plan = {}) {
  return plan.sourceId === G3A_U08_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length > 0 && plan.patternSpecIds.every((id) => Q2_IDS.has(id));
}
export function validateG3AU08Slice002Question(question = {}) {
  const errors = [];
  const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId;
  const definition = getBatchABrowserPatternDefinition(id);
  if (!Q2_IDS.has(id) || !definition) add("p03f2_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G3A_U08_SOURCE_ID || question.metadata?.sourceId !== G3A_U08_SOURCE_ID) add("p03f2_source_mismatch", "sourceId");
  if (question.metadata?.knowledgePointId !== definition?.knowledgePointId || question.metadata?.patternGroupId !== definition?.patternGroupId) add("p03f2_lineage_mismatch", "metadata");
  if (!Number.isSafeInteger(question.denominator) || question.denominator < 2 || question.denominator > 12) add("p03f2_denominator_invalid", "denominator");
  if (!Number.isSafeInteger(question.numerator) || question.numerator <= 0 || question.numerator >= question.denominator) add("p03f2_numerator_invalid", "numerator");
  if (definition?.operationFamilyId === "fraction_accumulation") {
    const expected = fraction(question.unitFractionCount, question.denominator);
    if (question.finalAnswer?.numerator !== expected.numerator || question.finalAnswer?.denominator !== expected.denominator || question.answerText !== fractionText(expected)) add("p03f2_fraction_accumulation_answer_invalid", "finalAnswer");
  }
  if (definition?.operationFamilyId === "discrete_fraction_conversion") {
    if (!Number.isSafeInteger(question.itemsPerWhole) || question.itemsPerWhole <= 0 || (question.numerator * question.itemsPerWhole) % question.denominator !== 0) add("p03f2_discrete_divisibility_invalid", "itemsPerWhole");
    const expectedCount = question.wholeUnits * question.itemsPerWhole + question.numerator * question.itemsPerWhole / question.denominator;
    if (question.itemCount !== expectedCount) add("p03f2_total_quantity_not_preserved", "itemCount");
    if (definition.requestedUnknownRole === "itemCount") {
      if (question.finalAnswer !== expectedCount || question.answerText !== String(expectedCount)) add("p03f2_item_count_answer_invalid", "finalAnswer");
    } else {
      const expected = fraction(question.itemCount, question.itemsPerWhole);
      if (question.finalAnswer?.numerator !== expected.numerator || question.finalAnswer?.denominator !== expected.denominator || question.answerText !== fractionText(expected)) add("p03f2_fractional_units_answer_invalid", "finalAnswer");
    }
  }
  if (definition?.mode === "APPLICATION") {
    const authority = P03F2_APPLICATION_AUTHORITIES[id];
    if (!authority || question.metadata?.applicationQuestionRecordId !== authority.applicationQuestionRecordId || question.metadata?.bindingCandidateId !== authority.bindingCandidateId || JSON.stringify(question.metadata?.contextLineage) !== JSON.stringify(authority.contextLineage)) add("p03f2_global_context_lineage_invalid", "metadata.contextLineage");
    if (question.globalContextProduction?.status !== "GLOBAL_CONTEXT_BOUND") add("p03f2_global_context_binding_missing", "globalContextProduction");
  } else if (question.metadata?.contextLineage != null) add("p03f2_numeric_context_leakage", "metadata.contextLineage");
  if (String(question.blankedDisplayText ?? "").match(/(?:算式|_{2,}|答\s*[:：]|\{\{)/)) add("p03f2_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG3AU08Slice002QuestionsFromPlan(plan = {}) {
  if (!canGenerateG3AU08Slice002Questions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f2_plan_not_supported", severity: "error", path: "plan", message: "Slice002 requires only its six admitted PatternSpecs." }], warnings: [] };
  const allocation = allocate(plan.patternSpecIds, plan.questionCount);
  const questions = [];
  const promptSet = new Set();
  const errors = [];
  let ordinal = 1;
  for (const row of allocation) {
    for (let index = 0; index < row.questionCount; index += 1) {
      let accepted = null;
      for (let attempt = 0; attempt < 32; attempt += 1) {
        const candidate = buildQuestion(row.patternSpecId, ordinal, plan.generationSeed, attempt);
        if (!promptSet.has(candidate.blankedDisplayText)) { accepted = candidate; break; }
      }
      if (!accepted) {
        errors.push({ code: "p03f2_unique_prompt_sampling_exhausted", severity: "error", path: `questions[${ordinal - 1}]`, message: "Could not produce a unique prompt within the bounded deterministic retry budget." });
      } else {
        questions.push(accepted);
        promptSet.add(accepted.blankedDisplayText);
      }
      ordinal += 1;
    }
  }
  if (promptSet.size !== questions.length) errors.push({ code: "p03f2_duplicate_prompt_detected", severity: "error", path: "questions", message: "The worksheet contains duplicate prompts." });
  errors.push(...questions.flatMap((question) => validateG3AU08Slice002Question(question).errors));
  return { ok: errors.length === 0 && questions.length === plan.questionCount, plan, questions, allocation, errors, warnings: [] };
}
export function generateG3AU08Slice002Questions(options = {}) { return generateG3AU08Slice002QuestionsFromPlan(buildBatchABrowserPlan(options)); }

// PGC-R04 final unit-fraction accumulation surface expansion

// PGC-R05 bounded application capacity FullFix V1
