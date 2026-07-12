import {
  G4B_U04_SOURCE_ID,
  getG4BU04HiddenPatternSpecById,
  getG4BU04HiddenPatternSpecs,
} from "./source-pattern-g4b-u04-extension.js";
import {
  G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS,
  generateG4BU04ClassCQuestion,
} from "./g4b-u04-class-c-generator.js";
import {
  G4B_U04_BLOCKING_CODES,
  G4B_U04_VALIDATOR_STAGES,
  validateG4BU04ClassCQuestion,
} from "./g4b-u04-class-c-validator.js";
import {
  G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS,
  generateG4BU04ClassDQuestion,
} from "./g4b-u04-class-d-semantic-generator.js";
import {
  validateG4BU04ClassDQuestion,
} from "./g4b-u04-class-d-semantic-validator.js";

const MAX_BATCH_COUNT = 1000;
const ORDERING_MODES = Object.freeze(["groupedByPattern", "shuffleAcrossPatterns"]);
const COVERAGE_MODES = Object.freeze(["fullAuthority", "selectedPatterns"]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function sameValue(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s71")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function randomInt(seed, offset, min, max) {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) {
    throw new Error(`G4BU04_INTEGRATION_INVALID_RANGE:${min}:${max}`);
  }
  return min + (mix32(seed + Math.imul(offset + 1, 0x9e3779b1)) % (max - min + 1));
}

function deterministicShuffle(values, seed) {
  const output = [...values];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(seed, output.length - index, 0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

const authoritySpecs = [...getG4BU04HiddenPatternSpecs()].sort((left, right) => left.patternOrder - right.patternOrder);

export const G4B_U04_S71_ALL_PATTERN_SPEC_IDS = Object.freeze(
  authoritySpecs.map((spec) => spec.patternSpecId),
);

export const G4B_U04_S71_CLASS_C_PATTERN_SPEC_IDS = G4B_U04_S69_CLASS_C_PATTERN_SPEC_IDS;
export const G4B_U04_S71_CLASS_D_PATTERN_SPEC_IDS = G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS;
export const G4B_U04_S71_SHARED_BLOCKING_CODES = G4B_U04_BLOCKING_CODES;
export const G4B_U04_S71_VALIDATOR_STAGES = G4B_U04_VALIDATOR_STAGES;

export const G4B_U04_S71_INTEGRATION_CODES = Object.freeze([
  "G4BU04_INTEGRATION_BATCH_REQUIRED",
  "G4BU04_INTEGRATION_SOURCE_MISMATCH",
  "G4BU04_INTEGRATION_PATTERN_SET_INVALID",
  "G4BU04_INTEGRATION_FULL_COVERAGE_REQUIRED",
  "G4BU04_INTEGRATION_QUESTION_COUNT_MISMATCH",
  "G4BU04_INTEGRATION_PATTERN_ALLOCATION_MISMATCH",
  "G4BU04_INTEGRATION_CLASS_ALLOCATION_MISMATCH",
  "G4BU04_INTEGRATION_MODE_ALLOCATION_MISMATCH",
  "G4BU04_INTEGRATION_DUPLICATE_QUESTION_ID",
  "G4BU04_INTEGRATION_AUTHORITY_CLASS_MISMATCH",
  "G4BU04_INTEGRATION_ROUTER_MISMATCH",
  "G4BU04_INTEGRATION_LIFECYCLE_INVALID",
  "G4BU04_INTEGRATION_ORDERING_INVALID",
  "G4BU04_INTEGRATION_REPLAY_MISMATCH",
]);

export const G4B_U04_S71_CLASS_BY_PATTERN_SPEC_ID = deepFreeze(
  Object.fromEntries(authoritySpecs.map((spec) => [spec.patternSpecId, spec.implementationClass])),
);

function issue(code, path, message, stage = "integration_gate") {
  return Object.freeze({ code, severity: "error", path, message, stage });
}

function add(errors, code, path, message, stage = "integration_gate") {
  if (!errors.some((row) => row.code === code && row.path === path)) {
    errors.push(issue(code, path, message, stage));
  }
}

function normalizePatternSpecIds(patternSpecIds, coverageMode) {
  if (!Array.isArray(patternSpecIds) || patternSpecIds.length === 0) {
    throw new Error("G4BU04_INTEGRATION_PATTERN_SET_INVALID");
  }
  if (new Set(patternSpecIds).size !== patternSpecIds.length) {
    throw new Error("G4BU04_INTEGRATION_PATTERN_SET_INVALID");
  }
  const unknown = patternSpecIds.filter((id) => !G4B_U04_S71_ALL_PATTERN_SPEC_IDS.includes(id));
  if (unknown.length > 0) throw new Error(`G4BU04_INTEGRATION_PATTERN_SET_INVALID:${unknown.join(",")}`);
  const normalized = G4B_U04_S71_ALL_PATTERN_SPEC_IDS.filter((id) => patternSpecIds.includes(id));
  if (coverageMode === "fullAuthority" && normalized.length !== G4B_U04_S71_ALL_PATTERN_SPEC_IDS.length) {
    throw new Error("G4BU04_INTEGRATION_FULL_COVERAGE_REQUIRED");
  }
  return normalized;
}

function expectedAllocation(questionCount, patternSpecIds) {
  const allocation = Object.fromEntries(patternSpecIds.map((id) => [id, 0]));
  for (let index = 0; index < questionCount; index += 1) {
    allocation[patternSpecIds[index % patternSpecIds.length]] += 1;
  }
  return allocation;
}

function summarizeAllocation(patternAllocation) {
  const classAllocation = { C: 0, D: 0 };
  const modeAllocation = {
    concept: 0,
    numeric: 0,
    application: 0,
    operation_estimation: 0,
    reasoning: 0,
  };
  for (const [patternSpecId, count] of Object.entries(patternAllocation)) {
    const spec = getG4BU04HiddenPatternSpecById(patternSpecId);
    classAllocation[spec.implementationClass] += count;
    modeAllocation[spec.mode] += count;
  }
  return { classAllocation, modeAllocation };
}

function expectedGeneratorRouting(implementationClass) {
  return implementationClass === "C"
    ? "hidden_class_c_only_not_canonical"
    : "hidden_class_d_only_not_canonical";
}

export function generateG4BU04IntegratedQuestion({ patternSpecId, seed = "s71", sequence = 0 } = {}) {
  const spec = getG4BU04HiddenPatternSpecById(patternSpecId);
  if (!spec || !G4B_U04_S71_ALL_PATTERN_SPEC_IDS.includes(patternSpecId)) {
    throw new Error(`G4BU04_INTEGRATION_PATTERN_SET_INVALID:${patternSpecId}`);
  }
  if (!Number.isSafeInteger(sequence) || sequence < 0) {
    throw new Error(`G4BU04_INTEGRATION_SEQUENCE_INVALID:${sequence}`);
  }
  const routedSeed = `${seed}:integrated:${spec.implementationClass}`;
  if (spec.implementationClass === "C") {
    return generateG4BU04ClassCQuestion({ patternSpecId, seed: routedSeed, sequence });
  }
  if (spec.implementationClass === "D") {
    return generateG4BU04ClassDQuestion({ patternSpecId, seed: routedSeed, sequence });
  }
  throw new Error(`G4BU04_INTEGRATION_AUTHORITY_CLASS_UNSUPPORTED:${spec.implementationClass}`);
}

export function generateG4BU04IntegratedBatch({
  questionCount = 17,
  patternSpecIds = G4B_U04_S71_ALL_PATTERN_SPEC_IDS,
  seed = "s71-integration",
  ordering = "groupedByPattern",
  coverageMode = "fullAuthority",
} = {}) {
  if (!Number.isSafeInteger(questionCount) || questionCount < 1 || questionCount > MAX_BATCH_COUNT) {
    throw new Error(`G4BU04_INTEGRATION_QUESTION_COUNT_OUT_OF_RANGE:${questionCount}`);
  }
  if (!ORDERING_MODES.includes(ordering)) {
    throw new Error(`G4BU04_INTEGRATION_ORDERING_INVALID:${ordering}`);
  }
  if (!COVERAGE_MODES.includes(coverageMode)) {
    throw new Error(`G4BU04_INTEGRATION_COVERAGE_MODE_INVALID:${coverageMode}`);
  }
  const ids = normalizePatternSpecIds(patternSpecIds, coverageMode);
  const allocation = expectedAllocation(questionCount, ids);
  const questions = [];
  for (const patternSpecId of ids) {
    for (let sequence = 0; sequence < allocation[patternSpecId]; sequence += 1) {
      questions.push(generateG4BU04IntegratedQuestion({ patternSpecId, seed, sequence }));
    }
  }
  const orderedQuestions = ordering === "shuffleAcrossPatterns"
    ? deterministicShuffle(questions, hashSeed(`${seed}:s71:shuffle:${ids.join("|")}`))
    : questions;
  const { classAllocation, modeAllocation } = summarizeAllocation(allocation);

  return deepFreeze({
    sourceId: G4B_U04_SOURCE_ID,
    unitCode: "4B-U04",
    unitTitle: "概數",
    task: "S71_G4B_U04_ClassCAndDIntegrationGate",
    gateStatus: "hidden_integration_candidate",
    coverageMode,
    questionCount,
    ordering,
    seed,
    patternSpecIds: ids,
    patternAllocation: allocation,
    classAllocation,
    modeAllocation,
    questions: orderedQuestions,
    integration: {
      authorityPatternSpecCount: G4B_U04_S71_ALL_PATTERN_SPEC_IDS.length,
      selectedPatternSpecCount: ids.length,
      classCPatternSpecCount: G4B_U04_S71_CLASS_C_PATTERN_SPEC_IDS.length,
      classDPatternSpecCount: G4B_U04_S71_CLASS_D_PATTERN_SPEC_IDS.length,
      sharedBlockingCodeCount: G4B_U04_S71_SHARED_BLOCKING_CODES.length,
      integrationCodeCount: G4B_U04_S71_INTEGRATION_CODES.length,
      validatorStageCount: G4B_U04_S71_VALIDATOR_STAGES.length,
    },
    lifecycle: {
      selectorStatus: "hidden",
      canonicalRouting: "disabled",
      worksheetEligible: false,
      rendererConnected: false,
      productionUse: "forbidden",
      genericFallback: "forbidden",
    },
  });
}

export function validateG4BU04IntegratedQuestion(question) {
  const errors = [];
  const patternSpecId = question?.patternSpecId;
  const spec = getG4BU04HiddenPatternSpecById(patternSpecId);
  if (!spec || !G4B_U04_S71_ALL_PATTERN_SPEC_IDS.includes(patternSpecId)) {
    add(errors, "G4BU04_INTEGRATION_PATTERN_SET_INVALID", "patternSpecId", "題目 PatternSpec 不在 S71 authority。", "identity_and_schema");
    return Object.freeze({ ok: false, errors: Object.freeze(errors), warnings: Object.freeze([]), acceptedQuestion: null });
  }

  if (question.implementationClass !== spec.implementationClass) {
    add(errors, "G4BU04_INTEGRATION_AUTHORITY_CLASS_MISMATCH", "implementationClass", "題目 implementation class 與 authority 不一致。", "lifecycle_and_scope");
  }
  if (question.generatorRouting !== expectedGeneratorRouting(spec.implementationClass)) {
    add(errors, "G4BU04_INTEGRATION_ROUTER_MISMATCH", "generatorRouting", "題目不是由 authority 指定的 Class C／D hidden route 產生。", "lifecycle_and_scope");
  }

  const delegated = spec.implementationClass === "C"
    ? validateG4BU04ClassCQuestion(question)
    : validateG4BU04ClassDQuestion(question);
  for (const row of delegated.errors) errors.push(row);

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([...delegated.warnings]),
    acceptedQuestion: errors.length === 0 ? question : null,
  });
}

function validateTopLevel(batch, errors) {
  if (!batch || typeof batch !== "object" || Array.isArray(batch)) {
    add(errors, "G4BU04_INTEGRATION_BATCH_REQUIRED", "batch", "S71 integration batch 必須是物件。", "identity_and_schema");
    return false;
  }
  if (batch.sourceId !== G4B_U04_SOURCE_ID || batch.unitCode !== "4B-U04" || batch.unitTitle !== "概數") {
    add(errors, "G4BU04_INTEGRATION_SOURCE_MISMATCH", "sourceId", "Integration batch 來源或單元識別不一致。", "identity_and_schema");
  }
  if (batch.task !== "S71_G4B_U04_ClassCAndDIntegrationGate" || batch.gateStatus !== "hidden_integration_candidate") {
    add(errors, "G4BU04_INTEGRATION_LIFECYCLE_INVALID", "task", "Batch task／gate status 不符合 S71 hidden integration。", "lifecycle_and_scope");
  }
  if (!COVERAGE_MODES.includes(batch.coverageMode)) {
    add(errors, "G4BU04_INTEGRATION_PATTERN_SET_INVALID", "coverageMode", "Coverage mode 不在 S71 contract。", "identity_and_schema");
  }
  if (!ORDERING_MODES.includes(batch.ordering)) {
    add(errors, "G4BU04_INTEGRATION_ORDERING_INVALID", "ordering", "Ordering mode 不在 S71 contract。", "integration_gate");
  }
  const lifecycle = batch.lifecycle ?? {};
  if (
    lifecycle.selectorStatus !== "hidden"
    || lifecycle.canonicalRouting !== "disabled"
    || lifecycle.worksheetEligible !== false
    || lifecycle.rendererConnected !== false
    || lifecycle.productionUse !== "forbidden"
    || lifecycle.genericFallback !== "forbidden"
  ) {
    add(errors, "G4BU04_INTEGRATION_LIFECYCLE_INVALID", "lifecycle", "S71 必須保持 hidden、unrouted、非 worksheet、非 production。", "lifecycle_and_scope");
  }
  return true;
}

function validatePatternSet(batch, errors) {
  const ids = batch.patternSpecIds;
  if (!Array.isArray(ids) || ids.length === 0 || new Set(ids).size !== ids.length) {
    add(errors, "G4BU04_INTEGRATION_PATTERN_SET_INVALID", "patternSpecIds", "PatternSpec 集合缺漏、空白或重複。", "identity_and_schema");
    return [];
  }
  const expectedCanonical = G4B_U04_S71_ALL_PATTERN_SPEC_IDS.filter((id) => ids.includes(id));
  if (expectedCanonical.length !== ids.length || !sameValue(ids, expectedCanonical)) {
    add(errors, "G4BU04_INTEGRATION_PATTERN_SET_INVALID", "patternSpecIds", "PatternSpec 集合含未知 ID 或未依 authority order。", "identity_and_schema");
  }
  if (batch.coverageMode === "fullAuthority" && !sameValue(ids, G4B_U04_S71_ALL_PATTERN_SPEC_IDS)) {
    add(errors, "G4BU04_INTEGRATION_FULL_COVERAGE_REQUIRED", "patternSpecIds", "Full-authority gate 必須覆蓋全部 17 個 PatternSpec。", "integration_gate");
  }
  return expectedCanonical;
}

function validateAllocation(batch, ids, errors) {
  const questions = Array.isArray(batch.questions) ? batch.questions : [];
  if (!Number.isSafeInteger(batch.questionCount) || batch.questionCount !== questions.length) {
    add(errors, "G4BU04_INTEGRATION_QUESTION_COUNT_MISMATCH", "questionCount", "宣告題數與 questions 長度不一致。", "integration_gate");
  }
  if (ids.length === 0 || !Number.isSafeInteger(batch.questionCount) || batch.questionCount < 1) return;
  const expected = expectedAllocation(batch.questionCount, ids);
  if (!sameValue(batch.patternAllocation, expected)) {
    add(errors, "G4BU04_INTEGRATION_PATTERN_ALLOCATION_MISMATCH", "patternAllocation", "PatternSpec allocation 不是確定性均衡分配。", "integration_gate");
  }
  const actual = Object.fromEntries(ids.map((id) => [id, 0]));
  for (const question of questions) {
    if (Object.hasOwn(actual, question?.patternSpecId)) actual[question.patternSpecId] += 1;
  }
  if (!sameValue(actual, expected)) {
    add(errors, "G4BU04_INTEGRATION_PATTERN_ALLOCATION_MISMATCH", "questions", "實際題目分布與 allocation 不一致。", "integration_gate");
  }
  const summary = summarizeAllocation(expected);
  if (!sameValue(batch.classAllocation, summary.classAllocation)) {
    add(errors, "G4BU04_INTEGRATION_CLASS_ALLOCATION_MISMATCH", "classAllocation", "Class C／D allocation 不一致。", "integration_gate");
  }
  if (!sameValue(batch.modeAllocation, summary.modeAllocation)) {
    add(errors, "G4BU04_INTEGRATION_MODE_ALLOCATION_MISMATCH", "modeAllocation", "Mode allocation 不一致。", "integration_gate");
  }
}

function validateQuestionIds(batch, errors) {
  if (!Array.isArray(batch.questions)) {
    add(errors, "G4BU04_INTEGRATION_BATCH_REQUIRED", "questions", "Batch 缺少 questions。", "identity_and_schema");
    return;
  }
  const ids = batch.questions.map((question) => question?.questionId);
  if (ids.some((id) => typeof id !== "string" || id.length === 0) || new Set(ids).size !== ids.length) {
    add(errors, "G4BU04_INTEGRATION_DUPLICATE_QUESTION_ID", "questions", "Question ID 缺漏或重複。", "integration_gate");
  }
}

function validateOrdering(batch, ids, errors) {
  if (!Array.isArray(batch.questions) || !ORDERING_MODES.includes(batch.ordering)) return;
  if (batch.ordering === "groupedByPattern") {
    const orderIndex = new Map(ids.map((id, index) => [id, index]));
    let previous = -1;
    for (const question of batch.questions) {
      const current = orderIndex.get(question.patternSpecId);
      if (current === undefined || current < previous) {
        add(errors, "G4BU04_INTEGRATION_ORDERING_INVALID", "questions", "Grouped ordering 未依 authority PatternSpec order。", "integration_gate");
        break;
      }
      previous = current;
    }
  }
}

function validateReplay(batch, ids, errors) {
  if (
    ids.length === 0
    || !Number.isSafeInteger(batch.questionCount)
    || batch.questionCount < 1
    || !ORDERING_MODES.includes(batch.ordering)
    || !COVERAGE_MODES.includes(batch.coverageMode)
  ) return;
  try {
    const expected = generateG4BU04IntegratedBatch({
      questionCount: batch.questionCount,
      patternSpecIds: ids,
      seed: batch.seed,
      ordering: batch.ordering,
      coverageMode: batch.coverageMode,
    });
    if (!sameValue(batch.questions, expected.questions)) {
      add(errors, "G4BU04_INTEGRATION_REPLAY_MISMATCH", "questions", "Batch 題目不符合相同 seed 的 deterministic replay。", "integration_gate");
    }
  } catch {
    add(errors, "G4BU04_INTEGRATION_REPLAY_MISMATCH", "batch", "無法依 batch contract 重播題目。", "integration_gate");
  }
}

export function validateG4BU04IntegratedBatch(batch) {
  const errors = [];
  const topLevelValid = validateTopLevel(batch, errors);
  if (!topLevelValid) {
    return Object.freeze({ ok: false, errors: Object.freeze(errors), warnings: Object.freeze([]), acceptedQuestions: Object.freeze([]) });
  }
  const ids = validatePatternSet(batch, errors);
  validateAllocation(batch, ids, errors);
  validateQuestionIds(batch, errors);
  validateOrdering(batch, ids, errors);

  if (Array.isArray(batch.questions)) {
    for (let index = 0; index < batch.questions.length; index += 1) {
      const question = batch.questions[index];
      if (!ids.includes(question?.patternSpecId)) {
        add(errors, "G4BU04_INTEGRATION_PATTERN_SET_INVALID", `questions[${index}].patternSpecId`, "題目 PatternSpec 不在 batch 選定集合。", "identity_and_schema");
        continue;
      }
      const result = validateG4BU04IntegratedQuestion(question);
      for (const row of result.errors) {
        errors.push(Object.freeze({ ...row, path: `questions[${index}].${row.path}` }));
      }
    }
  }
  validateReplay(batch, ids, errors);

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    acceptedQuestions: errors.length === 0 ? Object.freeze([...batch.questions]) : Object.freeze([]),
    coverage: Object.freeze({
      patternSpecCount: ids.length,
      classCCount: ids.filter((id) => G4B_U04_S71_CLASS_BY_PATTERN_SPEC_ID[id] === "C").length,
      classDCount: ids.filter((id) => G4B_U04_S71_CLASS_BY_PATTERN_SPEC_ID[id] === "D").length,
    }),
  });
}
