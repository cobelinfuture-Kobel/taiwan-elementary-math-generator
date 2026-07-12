import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G4B_U04_S71_ALL_PATTERN_SPEC_IDS,
  G4B_U04_S71_CLASS_BY_PATTERN_SPEC_ID,
  G4B_U04_S71_CLASS_C_PATTERN_SPEC_IDS,
  G4B_U04_S71_CLASS_D_PATTERN_SPEC_IDS,
  G4B_U04_S71_INTEGRATION_CODES,
  G4B_U04_S71_SHARED_BLOCKING_CODES,
  G4B_U04_S71_VALIDATOR_STAGES,
  generateG4BU04IntegratedBatch,
  generateG4BU04IntegratedQuestion,
  validateG4BU04IntegratedBatch,
  validateG4BU04IntegratedQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-class-c-d-integration-gate.js";
import {
  getG4BU04HiddenPatternSpecById,
  getG4BU04HiddenPatternSpecs,
} from "../../site/modules/curriculum/batch-b/source-pattern-g4b-u04-extension.js";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/runtime/S71_G4B_U04_ClassCAndDIntegrationGate.json",
  import.meta.url,
);

const clone = (value) => structuredClone(value);
const codes = (result) => new Set(result.errors.map((row) => row.code));

function patternCounts(questions) {
  const output = {};
  for (const question of questions) output[question.patternSpecId] = (output[question.patternSpecId] ?? 0) + 1;
  return output;
}

test("S71 partitions the exact 17-pattern authority into disjoint C=9 and D=8 routes", () => {
  const authority = [...getG4BU04HiddenPatternSpecs()].sort((a, b) => a.patternOrder - b.patternOrder);
  assert.deepEqual(G4B_U04_S71_ALL_PATTERN_SPEC_IDS, authority.map((row) => row.patternSpecId));
  assert.equal(G4B_U04_S71_ALL_PATTERN_SPEC_IDS.length, 17);
  assert.equal(G4B_U04_S71_CLASS_C_PATTERN_SPEC_IDS.length, 9);
  assert.equal(G4B_U04_S71_CLASS_D_PATTERN_SPEC_IDS.length, 8);
  assert.equal(new Set([...G4B_U04_S71_CLASS_C_PATTERN_SPEC_IDS, ...G4B_U04_S71_CLASS_D_PATTERN_SPEC_IDS]).size, 17);
  assert.equal(G4B_U04_S71_CLASS_C_PATTERN_SPEC_IDS.some((id) => G4B_U04_S71_CLASS_D_PATTERN_SPEC_IDS.includes(id)), false);
  for (const spec of authority) assert.equal(G4B_U04_S71_CLASS_BY_PATTERN_SPEC_ID[spec.patternSpecId], spec.implementationClass);
  assert.equal(new Set(authority.map((row) => row.knowledgePointId)).size, 12);
  assert.equal(new Set(authority.map((row) => row.patternGroupId)).size, 12);
  assert.deepEqual(
    authority.reduce((acc, row) => ({ ...acc, [row.mode]: (acc[row.mode] ?? 0) + 1 }), {}),
    { concept: 4, numeric: 3, application: 4, operation_estimation: 4, reasoning: 2 },
  );
});

test("S71 routes and validates all PatternSpecs through the authority-selected class runtime", () => {
  const answerModels = new Set();
  for (const [sequence, patternSpecId] of G4B_U04_S71_ALL_PATTERN_SPEC_IDS.entries()) {
    const spec = getG4BU04HiddenPatternSpecById(patternSpecId);
    const question = generateG4BU04IntegratedQuestion({ patternSpecId, seed: "s71-all", sequence });
    const result = validateG4BU04IntegratedQuestion(question);
    assert.equal(result.ok, true, `${patternSpecId}: ${JSON.stringify(result.errors)}`);
    assert.equal(question.implementationClass, spec.implementationClass);
    assert.equal(question.generatorRouting, spec.implementationClass === "C"
      ? "hidden_class_c_only_not_canonical"
      : "hidden_class_d_only_not_canonical");
    assert.equal(question.selectorStatus, "hidden");
    assert.equal(question.canonicalRouting, "disabled");
    assert.equal(question.productionUse, "forbidden");
    answerModels.add(question.answerModelShape);
  }
  assert.deepEqual([...answerModels].sort(), [
    "banknoteCountAnswer", "classificationAnswer", "digitSetAnswer", "methodChoiceAnswer",
    "methodComparisonAnswer", "moneyAmountAnswer", "numericAnswer", "possibleValuesAnswer",
    "symbolReadingAnswer",
  ]);
});

test("S71 full-authority count-17 smoke covers every PatternSpec once", () => {
  const batch = generateG4BU04IntegratedBatch({ questionCount: 17, seed: "s71-full-17" });
  const result = validateG4BU04IntegratedBatch(batch);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(batch.patternSpecIds, [...G4B_U04_S71_ALL_PATTERN_SPEC_IDS]);
  assert.deepEqual(Object.values(batch.patternAllocation), Array(17).fill(1));
  assert.deepEqual(batch.classAllocation, { C: 9, D: 8 });
  assert.deepEqual(batch.modeAllocation, {
    concept: 4, numeric: 3, application: 4, operation_estimation: 4, reasoning: 2,
  });
  assert.deepEqual(result.coverage, { patternSpecCount: 17, classCCount: 9, classDCount: 8 });
  assert.equal(result.acceptedQuestions.length, 17);
});

test("S71 selected-pattern mode supports a hidden mixed C/D subset", () => {
  const selected = [
    "ps_g4b_u04_round_half_up",
    "ps_g4b_u04_floor_complete_groups",
    "ps_g4b_u04_payment_amount_ceiling",
    "ps_g4b_u04_round_then_divide",
    "ps_g4b_u04_inverse_digit_set",
  ];
  const batch = generateG4BU04IntegratedBatch({
    questionCount: 55,
    patternSpecIds: selected,
    coverageMode: "selectedPatterns",
    seed: "s71-selected",
    ordering: "shuffleAcrossPatterns",
  });
  const result = validateG4BU04IntegratedBatch(batch);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(batch.patternSpecIds, G4B_U04_S71_ALL_PATTERN_SPEC_IDS.filter((id) => selected.includes(id)));
  assert.equal(batch.classAllocation.C > 0, true);
  assert.equal(batch.classAllocation.D > 0, true);
  assert.deepEqual(batch.lifecycle, {
    selectorStatus: "hidden",
    canonicalRouting: "disabled",
    worksheetEligible: false,
    rendererConnected: false,
    productionUse: "forbidden",
    genericFallback: "forbidden",
  });
});

test("S71 deterministic balanced 1000-question grouped and shuffled stress passes", () => {
  const groupedA = generateG4BU04IntegratedBatch({ questionCount: 1000, seed: "s71-stress" });
  const groupedB = generateG4BU04IntegratedBatch({ questionCount: 1000, seed: "s71-stress" });
  assert.deepEqual(groupedA, groupedB);
  assert.equal(validateG4BU04IntegratedBatch(groupedA).ok, true);
  const allocation = Object.values(groupedA.patternAllocation);
  assert.equal(Math.max(...allocation) - Math.min(...allocation) <= 1, true);
  assert.equal(groupedA.classAllocation.C + groupedA.classAllocation.D, 1000);
  assert.equal(Object.values(groupedA.modeAllocation).reduce((sum, count) => sum + count, 0), 1000);

  const shuffledA = generateG4BU04IntegratedBatch({ questionCount: 1000, seed: "s71-stress", ordering: "shuffleAcrossPatterns" });
  const shuffledB = generateG4BU04IntegratedBatch({ questionCount: 1000, seed: "s71-stress", ordering: "shuffleAcrossPatterns" });
  assert.deepEqual(shuffledA, shuffledB);
  assert.equal(validateG4BU04IntegratedBatch(shuffledA).ok, true);
  assert.deepEqual(patternCounts(shuffledA.questions), patternCounts(groupedA.questions));
  assert.notDeepEqual(shuffledA.questions.map((row) => row.questionId), groupedA.questions.map((row) => row.questionId));
});

test("S71 rejects cross-class routing and authority-class drift", () => {
  const classC = clone(generateG4BU04IntegratedQuestion({ patternSpecId: "ps_g4b_u04_round_half_up", seed: "s71-cross" }));
  classC.implementationClass = "D";
  classC.generatorRouting = "hidden_class_d_only_not_canonical";
  const cResult = validateG4BU04IntegratedQuestion(classC);
  assert.equal(cResult.ok, false);
  assert.equal(codes(cResult).has("G4BU04_INTEGRATION_AUTHORITY_CLASS_MISMATCH"), true);

  const classD = clone(generateG4BU04IntegratedQuestion({ patternSpecId: "ps_g4b_u04_floor_complete_groups", seed: "s71-cross" }));
  classD.generatorRouting = "hidden_class_c_only_not_canonical";
  const dResult = validateG4BU04IntegratedQuestion(classD);
  assert.equal(dResult.ok, false);
  assert.equal(codes(dResult).has("G4BU04_INTEGRATION_ROUTER_MISMATCH"), true);
});

test("S71 preserves delegated C/D blocking errors and returns zero accepted questions", () => {
  const batch = clone(generateG4BU04IntegratedBatch({ questionCount: 34, seed: "s71-delegated" }));
  const cIndex = batch.questions.findIndex((row) => row.patternSpecId === "ps_g4b_u04_round_half_up");
  const dIndex = batch.questions.findIndex((row) => row.patternSpecId === "ps_g4b_u04_payment_amount_ceiling");
  batch.questions[cIndex].finalAnswer += batch.questions[cIndex].input.targetUnit;
  batch.questions[cIndex].structuredAnswer.value = batch.questions[cIndex].finalAnswer;
  batch.questions[dIndex].structuredAnswer.amount = batch.questions[dIndex].input.price - 1;
  batch.questions[dIndex].finalAnswer = batch.questions[dIndex].structuredAnswer.amount;
  const result = validateG4BU04IntegratedBatch(batch);
  assert.equal(result.ok, false);
  assert.deepEqual(result.acceptedQuestions, []);
  assert.equal(codes(result).has("G4BU04_FORMULA_MISMATCH"), true);
  assert.equal(codes(result).has("G4BU04_PAYMENT_INSUFFICIENT"), true);
  assert.equal(codes(result).has("G4BU04_INTEGRATION_REPLAY_MISMATCH"), true);
});

test("S71 rejects count, allocation, duplicate-ID and grouped-order mutations", () => {
  const mutations = [];
  const count = clone(generateG4BU04IntegratedBatch({ questionCount: 34, seed: "s71-count" }));
  count.questionCount = 33;
  mutations.push([count, "G4BU04_INTEGRATION_QUESTION_COUNT_MISMATCH"]);

  const pattern = clone(generateG4BU04IntegratedBatch({ questionCount: 34, seed: "s71-pattern" }));
  pattern.patternAllocation[pattern.patternSpecIds[0]] += 1;
  mutations.push([pattern, "G4BU04_INTEGRATION_PATTERN_ALLOCATION_MISMATCH"]);

  const classAllocation = clone(generateG4BU04IntegratedBatch({ questionCount: 34, seed: "s71-class" }));
  classAllocation.classAllocation.C += 1;
  mutations.push([classAllocation, "G4BU04_INTEGRATION_CLASS_ALLOCATION_MISMATCH"]);

  const mode = clone(generateG4BU04IntegratedBatch({ questionCount: 34, seed: "s71-mode" }));
  mode.modeAllocation.numeric += 1;
  mutations.push([mode, "G4BU04_INTEGRATION_MODE_ALLOCATION_MISMATCH"]);

  const duplicate = clone(generateG4BU04IntegratedBatch({ questionCount: 34, seed: "s71-id" }));
  duplicate.questions[1].questionId = duplicate.questions[0].questionId;
  mutations.push([duplicate, "G4BU04_INTEGRATION_DUPLICATE_QUESTION_ID"]);

  const ordering = clone(generateG4BU04IntegratedBatch({ questionCount: 34, seed: "s71-order" }));
  const lastIndex = ordering.questions.length - 1;
  const first = ordering.questions[0];
  ordering.questions[0] = ordering.questions[lastIndex];
  ordering.questions[lastIndex] = first;
  mutations.push([ordering, "G4BU04_INTEGRATION_ORDERING_INVALID"]);

  for (const [batch, expectedCode] of mutations) {
    const result = validateG4BU04IntegratedBatch(batch);
    assert.equal(result.ok, false, expectedCode);
    assert.equal(codes(result).has(expectedCode), true, `${expectedCode}: ${JSON.stringify(result.errors)}`);
    assert.deepEqual(result.acceptedQuestions, []);
  }
});

test("S71 full-authority gate rejects missing, duplicate and unknown PatternSpecs", () => {
  assert.throws(() => generateG4BU04IntegratedBatch({
    patternSpecIds: G4B_U04_S71_ALL_PATTERN_SPEC_IDS.slice(0, -1),
    coverageMode: "fullAuthority",
  }), /G4BU04_INTEGRATION_FULL_COVERAGE_REQUIRED/);
  assert.throws(() => generateG4BU04IntegratedBatch({
    patternSpecIds: [G4B_U04_S71_ALL_PATTERN_SPEC_IDS[0], G4B_U04_S71_ALL_PATTERN_SPEC_IDS[0]],
    coverageMode: "selectedPatterns",
  }), /G4BU04_INTEGRATION_PATTERN_SET_INVALID/);
  assert.throws(() => generateG4BU04IntegratedQuestion({ patternSpecId: "ps_g4b_u04_unknown" }), /G4BU04_INTEGRATION_PATTERN_SET_INVALID/);

  const batch = clone(generateG4BU04IntegratedBatch({ questionCount: 17, seed: "s71-missing" }));
  batch.patternSpecIds.pop();
  const result = validateG4BU04IntegratedBatch(batch);
  assert.equal(result.ok, false);
  assert.equal(codes(result).has("G4BU04_INTEGRATION_FULL_COVERAGE_REQUIRED"), true);
});

test("S71 keeps selector, resolver, worksheet, renderer and production disabled", () => {
  const batch = clone(generateG4BU04IntegratedBatch({ questionCount: 17, seed: "s71-lifecycle" }));
  batch.lifecycle.selectorStatus = "public";
  batch.lifecycle.canonicalRouting = "enabled";
  batch.lifecycle.worksheetEligible = true;
  batch.lifecycle.rendererConnected = true;
  batch.lifecycle.productionUse = "allowed";
  const result = validateG4BU04IntegratedBatch(batch);
  assert.equal(result.ok, false);
  assert.equal(codes(result).has("G4BU04_INTEGRATION_LIFECYCLE_INVALID"), true);
  assert.deepEqual(result.acceptedQuestions, []);
});

test("S71 exposes 44 shared and 14 integration-only blocking codes", () => {
  assert.equal(G4B_U04_S71_SHARED_BLOCKING_CODES.length, 44);
  assert.equal(new Set(G4B_U04_S71_SHARED_BLOCKING_CODES).size, 44);
  assert.equal(G4B_U04_S71_VALIDATOR_STAGES.length, 8);
  assert.equal(G4B_U04_S71_VALIDATOR_STAGES.reduce((sum, row) => sum + row.codeCount, 0), 44);
  assert.equal(G4B_U04_S71_INTEGRATION_CODES.length, 14);
  assert.equal(new Set(G4B_U04_S71_INTEGRATION_CODES).size, 14);
  assert.equal(G4B_U04_S71_INTEGRATION_CODES.some((code) => G4B_U04_S71_SHARED_BLOCKING_CODES.includes(code)), false);
});

test("S71 contract supports pending and final status without weakening scope", () => {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
  assert.equal(["implemented_pending_ci", "pass_ci_synced_and_merged"].includes(contract.status), true);
  assert.equal(contract.coverage.patternSpecCount, 17);
  assert.equal(contract.coverage.classCPatternSpecCount, 9);
  assert.equal(contract.coverage.classDPatternSpecCount, 8);
  assert.equal(contract.coverage.knowledgePointCount, 12);
  assert.equal(contract.coverage.patternGroupCount, 12);
  assert.equal(contract.scopeBoundary.publicSelectorEnabled, false);
  assert.equal(contract.scopeBoundary.canonicalResolverConnected, false);
  assert.equal(contract.scopeBoundary.worksheetPathConnected, false);
  assert.equal(contract.scopeBoundary.rendererConnected, false);
  assert.equal(contract.scopeBoundary.productionUse, "forbidden");
  if (contract.status === "pass_ci_synced_and_merged") {
    assert.equal(contract.ciEvidence.tests, contract.ciEvidence.pass);
    assert.equal(contract.ciEvidence.fail, 0);
    assert.equal(contract.ciEvidence.workingTree, "clean");
  }
});
