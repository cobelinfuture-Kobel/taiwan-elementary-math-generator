import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f7.js";
import { getBatchABrowserPatternDefinition } from "./source-pattern-full-product-p03f7-extension.js";
import { G3B_U07_SOURCE_ID } from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import {
  G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID, G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_NUMERIC_SPEC_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_NUMERIC_SPEC_ID, G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_APPLICATION_SPEC_ID,
  G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_APPLICATION_SPEC_ID, G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS,
  G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS, G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS,
} from "../registry/g3b-u07-fraction-unit-conversion-selector-projection.js";
const IDS = new Set(G3B_U07_FRACTION_UNIT_CONVERSION_PATTERN_SPEC_IDS);
function isPgcR05Seed(seed) {
  return String(seed ?? "").includes("pgc-r05");
}
const APPLICATION_FIXTURES = Object.freeze([
  Object.freeze({ role: "itemCount", itemsPerWhole: 12, wholeUnits: 1, numerator: 1, denominator: 3, itemLabel: "彩色筆", unitLabel: "盒" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 12, itemCount: 18, itemLabel: "圖卡", unitLabel: "盒" }),
  Object.freeze({ role: "itemCount", itemsPerWhole: 8, wholeUnits: 2, numerator: 1, denominator: 2, itemLabel: "積木", unitLabel: "盒" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 10, itemCount: 25, itemLabel: "貼紙", unitLabel: "包" }),
  Object.freeze({ role: "itemCount", itemsPerWhole: 10, wholeUnits: 0, numerator: 3, denominator: 5, itemLabel: "色紙", unitLabel: "包" }),
  Object.freeze({ role: "fractionalUnits", itemsPerWhole: 8, itemCount: 6, itemLabel: "獎勵卡", unitLabel: "盒" }),
]);
const PGC_R05_APPLICATION_LABELS = Object.freeze([
  Object.freeze({ itemLabel: "彩色筆", unitLabel: "盒" }),
  Object.freeze({ itemLabel: "圖卡", unitLabel: "盒" }),
  Object.freeze({ itemLabel: "積木", unitLabel: "盒" }),
  Object.freeze({ itemLabel: "貼紙", unitLabel: "包" }),
  Object.freeze({ itemLabel: "色紙", unitLabel: "包" }),
  Object.freeze({ itemLabel: "獎勵卡", unitLabel: "盒" }),
]);
function buildPgcR05ApplicationFixtures() {
  const itemCountRows = [];
  const fractionalUnitRows = [];
  for (let itemsPerWhole = 4; itemsPerWhole <= 24; itemsPerWhole += 1) {
    for (let denominator = 2; denominator <= Math.min(10, itemsPerWhole); denominator += 1) {
      if (itemsPerWhole % denominator !== 0) continue;
      for (let numerator = 1; numerator < denominator; numerator += 1) {
        const label = PGC_R05_APPLICATION_LABELS[itemCountRows.length % PGC_R05_APPLICATION_LABELS.length];
        itemCountRows.push(Object.freeze({
          role: "itemCount",
          itemsPerWhole,
          wholeUnits: (itemsPerWhole + numerator + denominator) % 3,
          numerator,
          denominator,
          ...label,
        }));
      }
    }
    for (let itemCount = 1; itemCount <= itemsPerWhole * 3; itemCount += 1) {
      const label = PGC_R05_APPLICATION_LABELS[fractionalUnitRows.length % PGC_R05_APPLICATION_LABELS.length];
      fractionalUnitRows.push(Object.freeze({ role: "fractionalUnits", itemsPerWhole, itemCount, ...label }));
    }
  }
  if (itemCountRows.length === 0 || fractionalUnitRows.length === 0) {
    throw new Error("PGC_R05_G3B_U07_ROLE_POOL_EMPTY");
  }
  const rows = [];
  const cycleLength = Math.max(itemCountRows.length, fractionalUnitRows.length);
  for (let index = 0; index < cycleLength; index += 1) {
    rows.push(itemCountRows[index % itemCountRows.length]);
    rows.push(fractionalUnitRows[index % fractionalUnitRows.length]);
  }
  return rows;
}
const PGC_R05_APPLICATION_FIXTURES = Object.freeze(buildPgcR05ApplicationFixtures());
function buildNumericFixtures() {
  const itemCountRows = [];
  const fractionalUnitRows = [];
  for (let itemsPerWhole = 4; itemsPerWhole <= 24; itemsPerWhole += 1) {
    for (let denominator = 2; denominator <= Math.min(12, itemsPerWhole); denominator += 1) {
      if (itemsPerWhole % denominator !== 0) continue;
      for (let numerator = 1; numerator < denominator; numerator += 1) {
        for (let wholeUnits = 0; wholeUnits <= 3; wholeUnits += 1) itemCountRows.push(Object.freeze({ role: "itemCount", itemsPerWhole, wholeUnits, numerator, denominator, itemLabel: "個", unitLabel: "大單位" }));
      }
    }
    for (let itemCount = 1; itemCount <= itemsPerWhole * 3; itemCount += 1) fractionalUnitRows.push(Object.freeze({ role: "fractionalUnits", itemsPerWhole, itemCount, itemLabel: "個", unitLabel: "大單位" }));
  }
  const rows = [];
  const cycleLength = Math.max(itemCountRows.length, fractionalUnitRows.length);
  for (let index = 0; index < cycleLength; index += 1) {
    rows.push(itemCountRows[index % itemCountRows.length]);
    rows.push(fractionalUnitRows[index % fractionalUnitRows.length]);
  }
  return rows;
}
const NUMERIC_FIXTURES = Object.freeze(buildNumericFixtures()); // PGC-R04 discrete conversion numeric parameter space
const gcd = (a, b) => { let x = Math.abs(a), y = Math.abs(b); while (y) [x, y] = [y, x % y]; return x || 1; };
const fraction = (n, d) => { const g = gcd(n, d); return Object.freeze({ numerator: n / g, denominator: d / g }); };
const fractionText = (v) => v.denominator === 1 ? String(v.numerator) : `${v.numerator}/${v.denominator}`;
const mixedText = (whole, numerator, denominator) => whole > 0 && numerator > 0 ? `${whole} 又 ${numerator}/${denominator}` : whole > 0 ? String(whole) : `${numerator}/${denominator}`;
const seedOffset = (seed, size) => [...String(seed ?? "p03f7")].reduce((sum, c) => (sum + c.charCodeAt(0)) % size, 0);
export const P03F7_APPLICATION_AUTHORITIES = Object.freeze({
  itemCount: Object.freeze({
    applicationQuestionRecordId: "app_qr_w02_ps_g3b_u07_fraction_unit_conversion_item_count_application",
    bindingCandidateId: "w02_bind_ps_g3b_u07_fraction_unit_conversion_item_count_application",
    proofCandidateId: "w02_n1proof_ps_g3b_u07_fraction_unit_conversion_item_count_application",
    fixtureId: "w02_fixture_ps_g3b_u07_fraction_unit_conversion_item_count_application_single_positive",
  }),
  fractionalUnits: Object.freeze({
    applicationQuestionRecordId: "app_qr_w02_ps_g3b_u07_fraction_unit_conversion_fractional_units_application",
    bindingCandidateId: "w02_bind_ps_g3b_u07_fraction_unit_conversion_fractional_units_application",
    proofCandidateId: "w02_n1proof_ps_g3b_u07_fraction_unit_conversion_fractional_units_application",
    fixtureId: "w02_fixture_ps_g3b_u07_fraction_unit_conversion_fractional_units_application_single_positive",
  }),
  contextLineage: Object.freeze({ macroContextId: "gctx_macro_school_learning", mesoSituationId: "gctx_meso_classroom_activity", microScenarioId: "gctx_micro_classroom_shared_resources", atomicEpisodeId: "gctx_episode_classroom_shared_resources_direct_quantity", surfaceTemplateId: "tpl_fusion_classroom_activity_direct_01" }),
  capabilityType: "APPLICATION_REQUIRED", operationFamilyId: "discrete_fraction_conversion",
});
function resolveFixture(raw) {
  if (raw.role === "itemCount") {
    const totalNumerator = raw.wholeUnits * raw.denominator + raw.numerator;
    const itemCount = totalNumerator * raw.itemsPerWhole / raw.denominator;
    return Object.freeze({ ...raw, itemCount, fractionalUnits: fraction(totalNumerator, raw.denominator) });
  }
  const fractionalUnits = fraction(raw.itemCount, raw.itemsPerWhole);
  const wholeUnits = Math.floor(raw.itemCount / raw.itemsPerWhole);
  const remainder = raw.itemCount % raw.itemsPerWhole;
  const partial = fraction(remainder, raw.itemsPerWhole);
  return Object.freeze({ ...raw, wholeUnits, numerator: partial.numerator, denominator: partial.denominator, fractionalUnits });
}
function specId(mode, role) {
  if (mode === "application") return role === "itemCount" ? G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_APPLICATION_SPEC_ID : G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_APPLICATION_SPEC_ID;
  return role === "itemCount" ? G3B_U07_FRACTION_UNIT_CONVERSION_ITEM_COUNT_NUMERIC_SPEC_ID : G3B_U07_FRACTION_UNIT_CONVERSION_FRACTIONAL_UNITS_NUMERIC_SPEC_ID;
}
function metadata(definition, authority) {
  return Object.freeze({
    patternId: definition.patternSpecId, sourceId: G3B_U07_SOURCE_ID,
    patternTags: Object.freeze(["full_product_w3_slice007", definition.patternSpecId]), skillTags: definition.skillTags, difficultyTags: definition.difficultyTags,
    curriculumNodeIds: Object.freeze([G3B_U07_SOURCE_ID]), canonicalSkillIds: definition.canonicalSkillIds,
    knowledgePointId: definition.knowledgePointId, patternGroupId: definition.patternGroupId, operationFamilyId: definition.operationFamilyId,
    operationModelId: definition.operationModelId, requestedUnknownRole: definition.requestedUnknownRole, requiredCapabilityIds: definition.requiredCapabilityIds,
    applicationClassification: definition.applicationClassification, productAdmissionTask: "P03F_W3DirectProductVerticalSlice007Implementation",
    generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1",
    unitRolePolicy: "ITEMS_PER_WHOLE_AND_FRACTIONAL_UNIT_ROLES_PRESERVED",
    globalContextAuthorityPath: authority ? "data/curriculum/context/registry/global-context-authority-index.json" : null,
    applicationQuestionRecordId: authority?.applicationQuestionRecordId ?? null, bindingCandidateId: authority?.bindingCandidateId ?? null,
    proofCandidateId: authority?.proofCandidateId ?? null, fixtureId: authority?.fixtureId ?? null,
    contextLineage: authority ? P03F7_APPLICATION_AUTHORITIES.contextLineage : null,
  });
}
function buildQuestion(mode, fixture, ordinal) {
  const patternSpecId = specId(mode, fixture.role); const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const authority = mode === "application" ? P03F7_APPLICATION_AUTHORITIES[fixture.role] : null;
  const quantityText = mixedText(fixture.wholeUnits, fixture.numerator, fixture.denominator);
  const answerText = fixture.role === "itemCount" ? String(fixture.itemCount) : fractionText(fixture.fractionalUnits);
  const promptText = mode === "application"
    ? fixture.role === "itemCount"
      ? `每${fixture.unitLabel}有 ${fixture.itemsPerWhole} 個${fixture.itemLabel}。老師準備了 ${quantityText} ${fixture.unitLabel}，共有多少個${fixture.itemLabel}？`
      : `每${fixture.unitLabel}有 ${fixture.itemsPerWhole} 個${fixture.itemLabel}。共有 ${fixture.itemCount} 個${fixture.itemLabel}，相當於多少${fixture.unitLabel}？`
    : fixture.role === "itemCount"
      ? `每 1 大單位含 ${fixture.itemsPerWhole} 個。${quantityText} 大單位共有多少個？`
      : `每 1 大單位含 ${fixture.itemsPerWhole} 個。${fixture.itemCount} 個相當於多少大單位？`;
  return Object.freeze({
    id: `${patternSpecId}-${ordinal + 1}`, sourceId: G3B_U07_SOURCE_ID, patternSpecId, kind: definition.kind,
    operation: definition.operation, operationFamilyId: definition.operationFamilyId, questionMode: mode, mode: definition.mode,
    promptText, questionText: promptText, blankedDisplayText: promptText, displayText: `${promptText} ${answerText}`,
    answerText, finalAnswer: fixture.role === "itemCount" ? fixture.itemCount : fixture.fractionalUnits,
    requestedUnknownRole: fixture.role, itemsPerWhole: fixture.itemsPerWhole, wholeUnits: fixture.wholeUnits,
    numerator: fixture.numerator, denominator: fixture.denominator, itemCount: fixture.itemCount,
    fractionalUnits: fixture.fractionalUnits, itemLabel: fixture.itemLabel, unitLabel: fixture.unitLabel,
    metadata: metadata(definition, authority),
    globalContextProduction: authority ? Object.freeze({ status: "GLOBAL_CONTEXT_BOUND", ...authority, contextLineage: P03F7_APPLICATION_AUTHORITIES.contextLineage }) : null,
  });
}
export function canGenerateG3BU07FractionUnitConversionQuestions(plan = {}) {
  const expected = plan.questionMode === "application" ? G3B_U07_FRACTION_UNIT_CONVERSION_APPLICATION_SPEC_IDS : G3B_U07_FRACTION_UNIT_CONVERSION_NUMERIC_SPEC_IDS;
  return plan.sourceId === G3B_U07_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length === 2 && expected.every((id) => plan.patternSpecIds.includes(id)) && plan.patternSpecIds.every((id) => IDS.has(id));
}
export function validateG3BU07FractionUnitConversionQuestion(question = {}) {
  const errors = []; const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const id = question.patternSpecId ?? question.metadata?.patternId; const d = getBatchABrowserPatternDefinition(id);
  if (!IDS.has(id) || !d) add("p03f7_pattern_invalid", "patternSpecId");
  if (question.sourceId !== G3B_U07_SOURCE_ID || question.metadata?.sourceId !== G3B_U07_SOURCE_ID) add("p03f7_source_mismatch", "sourceId");
  if (question.metadata?.knowledgePointId !== G3B_U07_FRACTION_UNIT_CONVERSION_KP_ID || question.metadata?.patternGroupId !== d?.patternGroupId) add("p03f7_lineage_mismatch", "metadata");
  if (![question.itemsPerWhole, question.wholeUnits, question.numerator, question.denominator, question.itemCount].every(Number.isSafeInteger)) add("p03f7_quantity_value_invalid", "quantity");
  if (question.itemsPerWhole <= 0 || question.denominator <= 0 || question.wholeUnits < 0 || question.numerator < 0 || question.numerator >= question.denominator || question.itemCount < 0) add("p03f7_quantity_domain_invalid", "quantity");
  const totalNumerator = question.wholeUnits * question.denominator + question.numerator;
  if (totalNumerator * question.itemsPerWhole % question.denominator !== 0) add("p03f7_integer_count_divisibility_invalid", "numerator");
  const expectedCount = totalNumerator * question.itemsPerWhole / question.denominator;
  const expectedFraction = fraction(question.itemCount, question.itemsPerWhole);
  if (expectedCount !== question.itemCount) add("p03f7_quantity_preservation_invalid", "itemCount");
  if (question.fractionalUnits?.numerator !== expectedFraction.numerator || question.fractionalUnits?.denominator !== expectedFraction.denominator) add("p03f7_fractional_units_invalid", "fractionalUnits");
  const expectedAnswer = d?.requestedUnknownRole === "itemCount" ? String(expectedCount) : fractionText(expectedFraction);
  if (question.answerText !== expectedAnswer) add("p03f7_answer_invalid", "answerText");
  if (question.requestedUnknownRole !== d?.requestedUnknownRole || question.metadata?.requestedUnknownRole !== d?.requestedUnknownRole) add("p03f7_unknown_role_invalid", "requestedUnknownRole");
  if (d?.mode === "APPLICATION") {
    const authority = P03F7_APPLICATION_AUTHORITIES[d.requestedUnknownRole];
    if (question.metadata?.bindingCandidateId !== authority?.bindingCandidateId || JSON.stringify(question.metadata?.contextLineage) !== JSON.stringify(P03F7_APPLICATION_AUTHORITIES.contextLineage)) add("p03f7_global_context_lineage_invalid", "metadata.contextLineage");
    if (question.globalContextProduction?.status !== "GLOBAL_CONTEXT_BOUND") add("p03f7_global_context_binding_missing", "globalContextProduction");
    if (!String(question.blankedDisplayText).includes(`每${question.unitLabel}有 ${question.itemsPerWhole} 個`)) add("p03f7_application_unit_role_missing", "blankedDisplayText");
  } else if (question.metadata?.contextLineage != null || question.globalContextProduction != null) add("p03f7_numeric_context_leak", "metadata.contextLineage");
  if (/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(question.blankedDisplayText ?? "")) add("p03f7_forbidden_surface_label", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG3BU07FractionUnitConversionQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG3BU07FractionUnitConversionQuestions(plan)) return { ok: false, errors: [{ code: "p03f7_plan_not_supported", severity: "error", path: "patternSpecIds", message: "p03f7_plan_not_supported" }], warnings: [], questions: [], allocation: [], plan };
  const count = Number.isInteger(plan.questionCount) ? plan.questionCount : 6;
  const fixturePool = plan.questionMode === "application" ? PGC_R05_APPLICATION_FIXTURES : NUMERIC_FIXTURES;
  const offset = seedOffset(plan.generationSeed, fixturePool.length);
  const questions = Array.from({ length: count }, (_, index) => buildQuestion(plan.questionMode, resolveFixture(fixturePool[(index + offset) % fixturePool.length]), index));
  const errors = questions.flatMap((q, i) => validateG3BU07FractionUnitConversionQuestion(q).errors.map((e) => ({ ...e, path: `questions[${i}].${e.path}` })));
  const allocation = plan.patternSpecIds.map((id) => Object.freeze({ patternSpecId: id, questionCount: questions.filter((q) => q.patternSpecId === id).length }));
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]), questions: Object.freeze(questions), allocation: Object.freeze(allocation), plan: Object.freeze(plan) });
}

// PGC-R04 legacy contract reconciliation V1

// PGC-R05 G3B-U07 fraction-unit application diversity FullFix V2