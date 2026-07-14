import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS,
  G4B_U04_S70_CONTROLLED_TEMPLATES,
  G4B_U04_S70_TEMPLATE_IDS,
  generateG4BU04ClassDBatch,
  generateG4BU04ClassDQuestion,
  g4bU04MethodLabel,
  g4bU04RoundByMethod,
  g4bU04TargetPlaceLabel,
  renderG4BU04ControlledTemplate,
} from "../../site/modules/curriculum/batch-b/g4b-u04-class-d-semantic-generator.js";
import {
  G4B_U04_S70_BLOCKING_CODES,
  G4B_U04_S70_VALIDATOR_STAGES,
  validateG4BU04ClassDBatch,
  validateG4BU04ClassDQuestion,
} from "../../site/modules/curriculum/batch-b/g4b-u04-class-d-semantic-validator.js";
import {
  getG4BU04HiddenPatternSpecById,
} from "../../site/modules/curriculum/batch-b/source-pattern-g4b-u04-extension.js";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/runtime/S70_G4B_U04_ClassDSemanticRuntimeContract.json",
  import.meta.url,
);

function clone(value) {
  return structuredClone(value);
}

function codes(result) {
  return new Set(result.errors.map((row) => row.code));
}

function generate(id, sequence = 0) {
  return generateG4BU04ClassDQuestion({ patternSpecId: id, seed: "s70-test", sequence });
}

test("S70 historical eight-spec and nine-template contract remains the prefix of the R2C effective runtime", () => {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
  assert.ok(["implemented_pending_ci", "pass_ci_synced_and_merged"].includes(contract.status));
  assert.equal(contract.patternSpecIds.length, 8);
  assert.equal(contract.templateFamilyIds.length, 9);
  assert.equal(G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS.length, 10);
  assert.equal(G4B_U04_S70_TEMPLATE_IDS.length, 11);
  assert.equal(Object.keys(G4B_U04_S70_CONTROLLED_TEMPLATES).length, 11);
  assert.deepEqual(contract.patternSpecIds, G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS.slice(0, contract.patternSpecIds.length));
  assert.deepEqual(contract.templateFamilyIds, G4B_U04_S70_TEMPLATE_IDS.slice(0, contract.templateFamilyIds.length));
  assert.deepEqual(G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS.slice(-2), [
    "ps_g4b_u04_discount_payment_amount_round_down",
    "ps_g4b_u04_discount_banknote_count_round_down",
  ]);
  assert.deepEqual(G4B_U04_S70_TEMPLATE_IDS.slice(-2), [
    "tpl_g4b_u04_discount_amount_round_down",
    "tpl_g4b_u04_discount_banknote_count_round_down",
  ]);
  for (const id of G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS) {
    const spec = getG4BU04HiddenPatternSpecById(id);
    assert.ok(spec, `${id} must exist in effective authority`);
    assert.equal(spec.implementationClass, "D");
    assert.equal(spec.selectorStatus, "hidden");
    assert.equal(spec.canonicalRouting, "disabled");
    assert.equal(spec.productionUse, "forbidden");
  }
  if (contract.status === "pass_ci_synced_and_merged") {
    assert.equal(contract.ciEvidence.tests, contract.ciEvidence.pass);
    assert.equal(contract.ciEvidence.fail, 0);
    assert.equal(contract.ciEvidence.workingTree, "clean");
  }
});

test("S70 generates and validates all ten effective Class D PatternSpecs and eleven template routes", () => {
  const templates = new Set();
  const answerShapes = new Set();
  for (const id of G4B_U04_S70_CLASS_D_PATTERN_SPEC_IDS) {
    for (let sequence = 0; sequence < 80; sequence += 1) {
      const question = generate(id, sequence);
      const result = validateG4BU04ClassDQuestion(question);
      assert.equal(result.ok, true, `${id}: ${JSON.stringify(result.errors)}`);
      assert.equal(question.applicationText, true);
      assert.equal(question.implementationClass, "D");
      assert.equal(question.depth, "S");
      assert.equal(Object.isFrozen(question), true);
      assert.equal(Object.isFrozen(question.templateRoles), true);
      assert.equal(question.promptText, renderG4BU04ControlledTemplate(question.semanticTemplateId, question.templateRoles));
      templates.add(question.semanticTemplateId);
      answerShapes.add(question.answerModelShape);
    }
  }
  assert.deepEqual([...templates].sort(), [...G4B_U04_S70_TEMPLATE_IDS].sort());
  assert.deepEqual([...answerShapes].sort(), ["banknoteCountAnswer", "moneyAmountAnswer", "numericAnswer"]);
});

test("S70 preserves source formulas and representative textbook values", () => {
  assert.equal(Math.floor(8427 / 10), 842);
  assert.equal(Math.ceil(8427 / 10), 843);
  assert.equal(Math.ceil(7699 / 1000) * 1000, 8000);
  assert.equal(Math.ceil(7699 / 1000), 8);
  assert.equal(Math.floor(7699 / 1000) * 1000, 7000);
  assert.equal(Math.floor(7699 / 1000), 7);
  assert.equal(Math.ceil(7699 / 100) * 100, 7700);
  assert.equal(Math.ceil(7699 / 100), 77);
  assert.equal(g4bU04RoundByMethod(57389, "halfUp", 10000) * 6, 360000);
  assert.equal(g4bU04RoundByMethod(695400, "halfUp", 100000), 700000);
  assert.equal(700000 / 5, 140000);
});

test("S70 operation-estimation prompts expose original values, methods and target places", () => {
  const ids = [
    "ps_g4b_u04_round_then_add",
    "ps_g4b_u04_round_then_subtract",
    "ps_g4b_u04_round_then_multiply",
    "ps_g4b_u04_round_then_divide",
  ];
  for (const id of ids) {
    const question = generate(id, 3);
    if (Object.hasOwn(question.input, "operandA")) {
      assert.ok(question.promptText.includes(g4bU04MethodLabel(question.input.methodA)));
      assert.ok(question.promptText.includes(g4bU04MethodLabel(question.input.methodB)));
      assert.ok(question.promptText.includes(g4bU04TargetPlaceLabel(question.input.targetUnitA)));
      assert.ok(question.promptText.includes(g4bU04TargetPlaceLabel(question.input.targetUnitB)));
    } else {
      assert.ok(question.promptText.includes(g4bU04MethodLabel(question.input.method)));
      assert.ok(question.promptText.includes(g4bU04TargetPlaceLabel(question.input.targetUnit)));
    }
    assert.doesNotMatch(question.promptText, /roundedA|roundedB|largerRounded|smallerRounded|roundedValue/);
    assert.equal(validateG4BU04ClassDQuestion(question).ok, true);
  }
});

test("S70 controlled-template role bindings exactly match the effective overlay", () => {
  for (const templateId of G4B_U04_S70_TEMPLATE_IDS) {
    const template = G4B_U04_S70_CONTROLLED_TEMPLATES[templateId];
    assert.deepEqual(Object.keys(template.roleBindings).sort(), [...template.requiredRoles].sort());
    assert.ok(template.answerUnitRole.length > 0);
    assert.match(template.mappingCandidateId, /^fmc_g4b_u04_/);
  }
});

test("S70 batch generation is deterministic, exact and balanced through 1000 questions", () => {
  const first = generateG4BU04ClassDBatch({ questionCount: 1000, seed: "s70-stress", ordering: "groupedByPattern" });
  const second = generateG4BU04ClassDBatch({ questionCount: 1000, seed: "s70-stress", ordering: "groupedByPattern" });
  assert.deepEqual(first, second);
  assert.equal(first.questions.length, 1000);
  assert.equal(validateG4BU04ClassDBatch(first).ok, true);
  const counts = Object.values(first.allocation);
  assert.equal(Math.max(...counts) - Math.min(...counts) <= 1, true);
  assert.equal(Object.keys(first.allocation).length, 10);

  const shuffledA = generateG4BU04ClassDBatch({ questionCount: 1000, seed: "s70-stress", ordering: "shuffleAcrossPatterns" });
  const shuffledB = generateG4BU04ClassDBatch({ questionCount: 1000, seed: "s70-stress", ordering: "shuffleAcrossPatterns" });
  assert.deepEqual(shuffledA, shuffledB);
  assert.notDeepEqual(
    shuffledA.questions.map((row) => row.patternSpecId),
    first.questions.map((row) => row.patternSpecId),
  );
  assert.equal(validateG4BU04ClassDBatch(shuffledA).ok, true);
});

test("S70 preserves the exact S67 44-code and eight-stage blocking registry", () => {
  assert.equal(G4B_U04_S70_BLOCKING_CODES.length, 44);
  assert.equal(new Set(G4B_U04_S70_BLOCKING_CODES).size, 44);
  assert.equal(G4B_U04_S70_VALIDATOR_STAGES.length, 8);
  assert.equal(G4B_U04_S70_VALIDATOR_STAGES.reduce((sum, row) => sum + row.codeCount, 0), 44);
  assert.deepEqual(G4B_U04_S70_VALIDATOR_STAGES.map((row) => row.codeCount), [8, 3, 7, 14, 2, 3, 5, 2]);
});

test("S70 rejects template, formula, payment, estimation and surface mutations", () => {
  const mutations = [];

  const source = clone(generate("ps_g4b_u04_floor_complete_groups"));
  source.sourceId = "g4b_u04_wrong";
  mutations.push([source, "G4BU04_SOURCE_ID_MISMATCH"]);

  const classC = clone(generate("ps_g4b_u04_floor_complete_groups"));
  classC.patternSpecId = "ps_g4b_u04_round_half_up";
  mutations.push([classC, "G4BU04_PATTERN_SPEC_NOT_LOCKED"]);

  const groupSize = clone(generate("ps_g4b_u04_floor_complete_groups"));
  groupSize.input.groupSize = 25;
  mutations.push([groupSize, "G4BU04_GROUP_SIZE_NOT_ALLOWED"]);

  const template = clone(generate("ps_g4b_u04_floor_complete_groups"));
  template.semanticTemplateId = "tpl_g4b_u04_payment_amount";
  mutations.push([template, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED"]);

  const roles = clone(generate("ps_g4b_u04_floor_complete_groups"));
  delete roles.templateRoles.itemUnit;
  mutations.push([roles, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED"]);

  const prompt = clone(generate("ps_g4b_u04_ceiling_minimum_required"));
  prompt.promptText = "這是一個未受控的情境題。";
  mutations.push([prompt, "G4BU04_SEMANTIC_TEMPLATE_NOT_ALLOWLISTED"]);

  const floor = clone(generate("ps_g4b_u04_floor_complete_groups"));
  floor.finalAnswer += 1;
  floor.structuredAnswer.value = floor.finalAnswer;
  mutations.push([floor, "G4BU04_FLOOR_REMAINDER_COUNTED"]);

  const ceiling = clone(generate("ps_g4b_u04_ceiling_minimum_required"));
  ceiling.finalAnswer -= 1;
  ceiling.structuredAnswer.value = ceiling.finalAnswer;
  mutations.push([ceiling, "G4BU04_CEILING_REMAINDER_DISCARDED"]);

  const denomination = clone(generate("ps_g4b_u04_payment_amount_ceiling"));
  denomination.input.denomination = 50;
  mutations.push([denomination, "G4BU04_PAYMENT_DENOMINATION_NOT_ALLOWED"]);

  const payment = clone(generate("ps_g4b_u04_payment_amount_ceiling"));
  payment.structuredAnswer.amount -= payment.input.denomination;
  payment.finalAnswer = payment.structuredAnswer.amount;
  mutations.push([payment, "G4BU04_PAYMENT_INSUFFICIENT"]);

  const notes = clone(generate("ps_g4b_u04_payment_banknote_count"));
  notes.structuredAnswer.count -= 1;
  notes.finalAnswer = notes.structuredAnswer.count;
  mutations.push([notes, "G4BU04_BANKNOTE_COUNT_NOT_MINIMUM"]);

  const rounded = clone(generate("ps_g4b_u04_round_then_add"));
  rounded.derived.roundedA += rounded.input.targetUnitA;
  mutations.push([rounded, "G4BU04_ROUNDED_OPERAND_MISMATCH"]);

  const estimate = clone(generate("ps_g4b_u04_round_then_multiply"));
  estimate.finalAnswer += 1;
  estimate.structuredAnswer.value = estimate.finalAnswer;
  mutations.push([estimate, "G4BU04_ESTIMATED_OPERATION_MISMATCH"]);

  const trivial = clone(generate("ps_g4b_u04_round_then_subtract"));
  trivial.input.operandB = trivial.input.operandA;
  trivial.input.methodB = trivial.input.methodA;
  trivial.input.targetUnitB = trivial.input.targetUnitA;
  mutations.push([trivial, "G4BU04_SUBTRACTION_NEGATIVE_OR_ZERO_TRIVIAL"]);

  const division = clone(generate("ps_g4b_u04_round_then_divide"));
  const roundedValue = g4bU04RoundByMethod(division.input.value, division.input.method, division.input.targetUnit);
  division.input.divisor = [2, 3, 4, 5, 6, 7, 8, 9].find((candidate) => roundedValue % candidate !== 0);
  mutations.push([division, "G4BU04_DIVISION_NONINTEGER"]);

  const unit = clone(generate("ps_g4b_u04_round_then_multiply"));
  unit.structuredAnswer.unitLabel = "人";
  mutations.push([unit, "G4BU04_ANSWER_MODEL_MISMATCH"]);

  const placeholder = clone(generate("ps_g4b_u04_floor_complete_groups"));
  placeholder.promptText += " {{total}}";
  mutations.push([placeholder, "G4BU04_UNRESOLVED_PLACEHOLDER"]);

  const internalId = clone(generate("ps_g4b_u04_floor_complete_groups"));
  internalId.promptText += " tpl_g4b_u04_floor_complete_pack";
  mutations.push([internalId, "G4BU04_INTERNAL_ID_LEAKAGE"]);

  const fallback = clone(generate("ps_g4b_u04_floor_complete_groups"));
  fallback.fallbackUsed = true;
  mutations.push([fallback, "G4BU04_GENERIC_FALLBACK_FORBIDDEN"]);

  for (const [question, expectedCode] of mutations) {
    const result = validateG4BU04ClassDQuestion(question);
    assert.equal(result.ok, false, expectedCode);
    assert.equal(codes(result).has(expectedCode), true, `${expectedCode}: ${JSON.stringify(result.errors)}`);
  }
});

test("S70 batch gate returns zero accepted questions on any blocking error", () => {
  const batch = generateG4BU04ClassDBatch({ questionCount: 24, seed: "s70-zero-output" });
  const mutated = clone(batch);
  mutated.questions[9].promptText += " {{price}}";
  const result = validateG4BU04ClassDBatch(mutated);
  assert.equal(result.ok, false);
  assert.deepEqual(result.acceptedQuestions, []);
  assert.ok(result.errors.length > 0);
});

test("S70 keeps Class C, selector, resolver, worksheet and production outside scope", () => {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
  assert.equal(contract.scopeBoundary.classCModified, false);
  assert.equal(contract.scopeBoundary.publicSelectorEnabled, false);
  assert.equal(contract.scopeBoundary.canonicalResolverConnected, false);
  assert.equal(contract.scopeBoundary.worksheetPathConnected, false);
  assert.equal(contract.scopeBoundary.productionUse, "forbidden");
  assert.throws(
    () => generateG4BU04ClassDQuestion({ patternSpecId: "ps_g4b_u04_round_half_up" }),
    /G4BU04_D_GEN_PATTERN_SPEC_UNSUPPORTED/,
  );
});
