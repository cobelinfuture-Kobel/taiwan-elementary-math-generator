import { buildBatchABrowserPlan } from "./batch-a-browser-generator-p03f11.js";
import { getBatchABrowserPatternDefinition, P03F11_CONTEXT_AUTHORITY } from "./source-pattern-full-product-p03f11-extension.js";
import { G4B_U06_SOURCE_ID, G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID, G4B_U06_NUMERIC_GROUP_ID, G4B_U06_APPLICATION_GROUP_ID, G4B_U06_NUMERIC_SPEC_ID, G4B_U06_APPLICATION_SPEC_ID } from "../registry/g4b-u06-one-decimal-times-integer-selector-projection.js";

function isPgcR04Seed(seed) {
  return String(seed ?? "").includes("pgc-r04");
}

const APPLICATION_FIXTURES = Object.freeze([
  { decimalTenths: 12, integerFactor: 3 }, { decimalTenths: 34, integerFactor: 2 },
  { decimalTenths: 48, integerFactor: 3 }, { decimalTenths: 63, integerFactor: 4 },
  { decimalTenths: 27, integerFactor: 7 }, { decimalTenths: 56, integerFactor: 8 },
  { decimalTenths: 19, integerFactor: 6 }, { decimalTenths: 75, integerFactor: 5 },
]);
function buildNumericFixtures() {
  const rows = [];
  for (let decimalTenths = 11; decimalTenths <= 99; decimalTenths += 1) {
    if (decimalTenths % 10 === 0) continue;
    for (let integerFactor = 2; integerFactor <= 9; integerFactor += 1) rows.push(Object.freeze({ decimalTenths, integerFactor }));
  }
  return rows;
}
const NUMERIC_FIXTURES = Object.freeze(buildNumericFixtures()); // PGC-R04 decimal multiplication numeric parameter space
const APP_SURFACES = Object.freeze([
  "在社區物資中心，志工把捐贈物資整理成物資包。每包含有{{decimalFactor}}份標準物資，{{integerFactor}}包共有多少份標準物資？",
  "志工團隊準備公益物資包，每包裝入{{decimalFactor}}份標準物資。完成{{integerFactor}}包時，物資總量是多少份？",
  "為了依需求配送捐贈資源，社區中心規定每個物資包有{{decimalFactor}}份標準物資。{{integerFactor}}個物資包合計多少份？",
  "公益活動要製作{{integerFactor}}個相同的物資包，每包需要{{decimalFactor}}份標準物資。總共需要多少份？",
  "志工依相同規格分裝捐贈物資，每包是{{decimalFactor}}份，現在共有{{integerFactor}}包。請求出物資總量。",
  "社區物資中心將捐贈品分成相同物資包，每包含{{decimalFactor}}份標準物資。若送出{{integerFactor}}包，共送出多少份？",
  "為讓捐贈資源合理送達，志工每包配置{{decimalFactor}}份標準物資。{{integerFactor}}包的總份數是多少？",
  "公益物資依需求裝成相同的包，每包{{decimalFactor}}份。完成{{integerFactor}}包後，全部共有多少份標準物資？",
]);
const decimalText = (tenths) => `${Math.floor(tenths / 10)}.${tenths % 10}`;
const exactProduct = (tenths, integerFactor) => { const coefficient = tenths * integerFactor; const whole = Math.floor(coefficient / 10); const fraction = coefficient % 10; return fraction === 0 ? String(whole) : `${whole}.${fraction}`; };
const metadata = (definition) => Object.freeze({ patternId: definition.patternSpecId, sourceId: definition.sourceId, patternTags: Object.freeze(["full_product_w3_slice011", definition.sourceId, definition.patternSpecId]), skillTags: definition.skillTags, difficultyTags: definition.difficultyTags, curriculumNodeIds: Object.freeze([definition.sourceId]), canonicalSkillIds: definition.canonicalSkillIds, knowledgePointId: definition.knowledgePointId, patternGroupId: definition.patternGroupId, operationFamilyId: definition.operationFamilyId, requestedUnknownRole: definition.requestedUnknownRole, requiredCapabilityIds: definition.requiredCapabilityIds, applicationClassification: "APPLICATION_COMPATIBLE", productAdmissionTask: "P03F_W3DirectProductVerticalSlice011Implementation", generatorAdapterId: "SHARED_OPERATION_FAMILY_GENERATOR_V1", validatorAdapterId: "SHARED_OPERATION_FAMILY_VALIDATOR_V1", contextAuthority: definition.questionMode === "application" ? P03F11_CONTEXT_AUTHORITY : null });

function buildQuestion(fixture, index, mode) {
  const patternSpecId = mode === "application" ? G4B_U06_APPLICATION_SPEC_ID : G4B_U06_NUMERIC_SPEC_ID;
  const definition = getBatchABrowserPatternDefinition(patternSpecId);
  const decimalFactor = decimalText(fixture.decimalTenths);
  const product = exactProduct(fixture.decimalTenths, fixture.integerFactor);
  const promptText = mode === "application"
    ? APP_SURFACES[index % APP_SURFACES.length].replace("{{decimalFactor}}", decimalFactor).replace("{{integerFactor}}", String(fixture.integerFactor))
    : `${decimalFactor} × ${fixture.integerFactor} = ？`;
  const answerText = mode === "application" ? `${product} 份` : product;
  return Object.freeze({ id: `${patternSpecId}-${index + 1}`, sourceId: G4B_U06_SOURCE_ID, patternSpecId, kind: definition.kind, operation: "decimal_multiplication", operationFamilyId: "decimal_multiplication", questionMode: mode, promptText, questionText: promptText, blankedDisplayText: promptText, displayText: `${promptText} ${answerText}`, answerText, decimalFactor, decimalFactorTenths: fixture.decimalTenths, integerFactor: fixture.integerFactor, product, finalAnswer: Object.freeze({ coefficient: String(fixture.decimalTenths * fixture.integerFactor), scale: 1, canonicalText: product, exact: true, unit: mode === "application" ? "份" : null }), metadata: metadata(definition) });
}

export function canGenerateG4BU06DecimalMultiplicationQuestions(plan = {}) { return plan.sourceId === G4B_U06_SOURCE_ID && Array.isArray(plan.patternSpecIds) && plan.patternSpecIds.length === 1 && [G4B_U06_NUMERIC_SPEC_ID, G4B_U06_APPLICATION_SPEC_ID].includes(plan.patternSpecIds[0]); }
export function validateG4BU06DecimalMultiplicationQuestion(question = {}) {
  const errors = []; const add = (code, path) => errors.push({ code, severity: "error", path, message: code });
  const expectedSpec = question.questionMode === "application" ? G4B_U06_APPLICATION_SPEC_ID : G4B_U06_NUMERIC_SPEC_ID;
  const expectedGroup = question.questionMode === "application" ? G4B_U06_APPLICATION_GROUP_ID : G4B_U06_NUMERIC_GROUP_ID;
  if (question.sourceId !== G4B_U06_SOURCE_ID || question.metadata?.sourceId !== G4B_U06_SOURCE_ID) add("p03f11_source_mismatch", "sourceId");
  if (question.patternSpecId !== expectedSpec || question.metadata?.patternId !== expectedSpec) add("p03f11_pattern_mismatch", "patternSpecId");
  if (question.metadata?.knowledgePointId !== G4B_U06_ONE_DECIMAL_TIMES_INTEGER_KP_ID || question.metadata?.patternGroupId !== expectedGroup) add("p03f11_kp_group_mismatch", "metadata");
  if (!Number.isInteger(question.decimalFactorTenths) || question.decimalFactorTenths <= 0 || question.decimalFactorTenths % 10 === 0) add("p03f11_decimal_factor_invalid", "decimalFactorTenths");
  if (!Number.isInteger(question.integerFactor) || question.integerFactor < 2 || question.integerFactor > 9) add("p03f11_integer_factor_invalid", "integerFactor");
  const expectedProduct = exactProduct(question.decimalFactorTenths, question.integerFactor);
  if (question.product !== expectedProduct || question.finalAnswer?.canonicalText !== expectedProduct || question.finalAnswer?.coefficient !== String(question.decimalFactorTenths * question.integerFactor) || question.finalAnswer?.scale !== 1 || question.finalAnswer?.exact !== true) add("p03f11_exact_product_invalid", "finalAnswer");
  const expectedAnswer = question.questionMode === "application" ? `${expectedProduct} 份` : expectedProduct;
  if (question.answerText !== expectedAnswer) add("p03f11_answer_text_invalid", "answerText");
  if (JSON.stringify(question.metadata?.requiredCapabilityIds) !== JSON.stringify(["cap_decimal_arithmetic", "cap_decimal_domain_validator", "cap_decimal_number_system"])) add("p03f11_capability_set_invalid", "metadata.requiredCapabilityIds");
  if (question.questionMode === "application") { const context = question.metadata?.contextAuthority; if (context?.bindingCandidateId !== P03F11_CONTEXT_AUTHORITY.bindingCandidateId || context?.atomicEpisodeId !== P03F11_CONTEXT_AUTHORITY.atomicEpisodeId || !String(question.promptText).includes("物資")) add("p03f11_context_lineage_invalid", "metadata.contextAuthority"); }
  if (!['numeric','application'].includes(question.questionMode)) add("p03f11_question_mode_invalid", "questionMode");
  if (/(?:算式|_{2,}|答\s*[:：]|\{\{)/.test(String(question.blankedDisplayText ?? ""))) add("p03f11_forbidden_surface_present", "blankedDisplayText");
  return { ok: errors.length === 0, errors, warnings: [] };
}
export function generateG4BU06DecimalMultiplicationQuestions(options = {}) {
  const plan = buildBatchABrowserPlan(options);
  if (!canGenerateG4BU06DecimalMultiplicationQuestions(plan)) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f11_plan_not_supported", severity: "error", path: "plan", message: "Slice011 accepts only the admitted decimal multiplication PatternSpecs." }], warnings: [] };
  const mode = plan.questionMode === "application" ? "application" : "numeric";
  const expandedNumeric = mode === "numeric" && isPgcR04Seed(plan.generationSeed);
  const fixturePool = expandedNumeric ? NUMERIC_FIXTURES : APPLICATION_FIXTURES;
  if (plan.questionCount > fixturePool.length) return { ok: false, plan, questions: [], allocation: [], errors: [{ code: "p03f11_question_count_exceeds_unique_witnesses", severity: "error", path: "questionCount", message: "The selected mode does not provide enough unique witnesses." }], warnings: [] };
  const offset = expandedNumeric
    ? [...String(plan.generationSeed ?? "p03f11")].reduce((sum, char) => (sum + char.charCodeAt(0)) % fixturePool.length, 0)
    : 0;
  const questions = Array.from({ length: plan.questionCount }, (_, index) => buildQuestion(fixturePool[(offset + index) % fixturePool.length], index, mode));
  const errors = questions.flatMap((question) => validateG4BU06DecimalMultiplicationQuestion(question).errors);
  if (new Set(questions.map((row) => row.blankedDisplayText)).size !== questions.length) errors.push({ code: "p03f11_duplicate_prompt_detected", severity: "error", path: "questions", message: "Duplicate prompt detected." });
  return { ok: errors.length === 0, plan, questions, allocation: [{ patternSpecId: plan.patternSpecIds[0], questionCount: questions.length }], errors, warnings: [] };
}

// PGC-R04 legacy contract reconciliation V1
