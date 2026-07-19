import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGctxP12GlobalContextExpansionPilot,
  loadGctxP12Contract
} from "../../tools/curriculum/build-gctx-p12-g3b-u04-global-context-expansion-pilot.mjs";
import {
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS,
  buildG3BU04GlobalContextExpansionPreview,
  renderG3BU04GlobalContextExpansionQuestion,
  validateG3BU04GlobalContextExpansionQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-expansion-pilot.js";

const contract = loadGctxP12Contract();
const gate = buildGctxP12GlobalContextExpansionPilot();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

test("GCTX-P12 corrects the prior legacy-only milestone classification", () => {
  assert.equal(contract.task, "GCTX-P12_G3BU04GlobalContextExpansionPilotAndRenderedDifferenceGate");
  assert.equal(contract.contentCorrection.priorMilestoneClassification, "legacy_context_migration_and_review_infrastructure_only");
  assert.equal(contract.contentCorrection.surfaceNounSwapAloneAccepted, false);
  assert.deepEqual(contract.contentCorrection.requiredChangedAxes, [
    "event_purpose",
    "place_or_activity_scope",
    "actor_group_relationship",
    "two_cost_objects",
    "language_variant"
  ]);
  assert.equal(contract.scope.publicRouterChanged, false);
  assert.equal(contract.scope.rendererChanged, false);
});

test("GCTX-P12 builds five exact P01-valid candidate bindings", () => {
  assert.deepEqual(gate.errors, []);
  assert.equal(gate.status, "accepted_for_human_rendered_question_review");
  assert.equal(gate.summary.bindingCount, 5);
  assert.equal(gate.summary.p01ValidBindingCount, 5);
  assert.equal(gate.summary.p01BindingErrorCount, 0);
  assert.equal(gate.summary.errorCount, 0);
  assert.equal(gate.summary.readyForHumanRenderedQuestionReview, true);

  assert.equal(new Set(gate.bindings.map((binding) => binding.bindingId)).size, 5);
  assert.equal(new Set(gate.bindings.map((binding) => binding.semanticVariantId)).size, 5);
  for (const binding of gate.bindings) {
    assert.equal(binding.patternSpecId, contract.scope.patternSpecId);
    assert.equal(binding.knowledgePointId, contract.scope.knowledgePointId);
    assert.equal(binding.contextFamilyId, contract.scope.contextFamilyId);
    assert.equal(binding.operationSignature, "(a+b)/c");
    assert.equal(binding.lifecycleStatus, "candidate");
    assert.equal(binding.reviewEvidence.approvalState, "candidate");
    assert.equal(binding.reviewEvidence.approvedAt, null);
    assert.equal(binding.randomnessPolicy.mayReplaceContextFamily, false);
    assert.equal(binding.randomnessPolicy.mayMutateEventFlow, false);
    assert.equal(binding.answerUnitPolicy.allowedUnitIds[0], "twd");
  }
});

test("GCTX-P12 renders five visibly different non-legacy activity contexts", () => {
  assert.equal(gate.preview.questions.length, 5);
  assert.equal(gate.summary.uniquePromptCount, 5);
  assert.equal(gate.summary.uniqueContextDomainCount, 5);
  assert.equal(gate.summary.uniqueSemanticFingerprintCount, 5);
  assert.equal(gate.summary.legacyPromptCount, 0);

  const combined = gate.preview.questions.map((question) => question.promptText).join("\n");
  for (const phrase of [
    "班級園遊會",
    "戶外學習",
    "運動練習",
    "社區清潔活動",
    "露營活動"
  ]) {
    assert.match(combined, new RegExp(phrase));
  }
  assert.doesNotMatch(combined, /三明治費用共|筆記本費用共|門票費用共|帳篷租金共/);

  for (const question of gate.preview.questions) {
    assert.match(question.promptText, /60元/);
    assert.match(question.promptText, /90元/);
    assert.match(question.promptText, /5人/);
    assert.match(question.promptText, /每人要付多少元/);
    assert.equal(question.equationModel, "(60 + 90) ÷ 5");
    assert.equal(question.finalAnswer, 30);
    assert.equal(question.answerText, "30元");
  }
});

test("GCTX-P12 variants differ across meaningful semantic axes instead of noun-only reskins", () => {
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length, 5);
  const eventPurposes = new Set();
  const places = new Set();
  const activities = new Set();
  const actors = new Set();
  const costPairs = new Set();
  const fingerprints = new Set();

  for (const variant of G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS) {
    eventPurposes.add(variant.eventPurposeId);
    places.add(variant.placeAssetId);
    activities.add(variant.activityAssetId);
    actors.add(variant.actorAssetId);
    costPairs.add(`${variant.firstCostLabel}|${variant.secondCostLabel}`);
    fingerprints.add(variant.semanticFingerprint);
  }

  assert.equal(eventPurposes.size, 5);
  assert.equal(places.size, 5);
  assert.equal(activities.size, 5);
  assert.equal(actors.size, 5);
  assert.equal(costPairs.size, 5);
  assert.equal(fingerprints.size, 5);
});

test("GCTX-P12 deterministic preview is replayable", () => {
  const first = buildG3BU04GlobalContextExpansionPreview({ a: 60, b: 90, c: 5 });
  const second = buildG3BU04GlobalContextExpansionPreview({ a: 60, b: 90, c: 5 });
  assert.deepEqual(first, second);
  assert.equal(first.ok, true);
  assert.equal(first.summary.errorCount, 0);
});

test("GCTX-P12 validator blocks non-divisible arithmetic", () => {
  const question = renderG3BU04GlobalContextExpansionQuestion({
    variantId: G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS[0].variantId,
    a: 60,
    b: 91,
    c: 5
  });
  const validation = validateG3BU04GlobalContextExpansionQuestion(question);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === "GCTX_P12_SUM_NOT_DIVISIBLE"));
});

test("GCTX-P12 validator independently recomputes the answer", () => {
  const question = clone(gate.preview.questions[0]);
  question.finalAnswer += 1;
  question.answerText = `${question.finalAnswer}元`;
  const validation = validateG3BU04GlobalContextExpansionQuestion(question);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === "GCTX_P12_ANSWER_RECOMPUTATION_MISMATCH"));
});

test("GCTX-P12 validator blocks a legacy prompt from leaking back into the pilot", () => {
  const question = clone(gate.preview.questions[0]);
  question.promptText = gate.preview.baselinePromptText;
  const validation = validateG3BU04GlobalContextExpansionQuestion(question);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === "GCTX_P12_LEGACY_CONTEXT_LEAKED"));
});

test("GCTX-P12 validator blocks false production admission", () => {
  const question = clone(gate.preview.questions[0]);
  question.globalContextBinding.productionSelectable = true;
  question.globalContextBinding.runtimeResolvable = true;
  const validation = validateG3BU04GlobalContextExpansionQuestion(question);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === "GCTX_P12_FALSE_PRODUCTION_ADMISSION"));
});

test("GCTX-P12 creates review packets for rendered text and mathematical evidence", () => {
  assert.equal(gate.reviewPackets.length, 5);
  assert.equal(gate.summary.humanReviewPacketCount, 5);
  assert.equal(gate.summary.humanDecisionCount, 0);
  assert.equal(gate.summary.productionSelectableCount, 0);
  assert.equal(gate.summary.runtimeResolvableCount, 0);

  for (const packet of gate.reviewPackets) {
    assert.ok(packet.renderedPromptText.length > 0);
    assert.equal(packet.equationModel, "(60 + 90) ÷ 5");
    assert.equal(packet.finalAnswer, 30);
    assert.equal(packet.answerText, "30元");
    assert.equal(packet.mathematicalWitness.expected, 30);
    assert.equal(packet.mathematicalWitness.actual, 30);
    assert.equal(packet.mathematicalWitness.valid, true);
    assert.equal(packet.semanticReview.status, "pending_human_review");
    assert.equal(packet.mathematicalReview.status, "pending_human_review");
    assert.equal(packet.semanticReview.decision, null);
    assert.equal(packet.mathematicalReview.decision, null);
    assert.equal(packet.productionSelectable, false);
    assert.equal(packet.runtimeResolvable, false);
  }
});

test("GCTX-P12 exposes human review and production admission as the next step", () => {
  assert.equal(
    gate.nextShortestStep,
    "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission"
  );
});

test("GCTX-P12 readback", () => {
  console.log(`GCTX_P12_GLOBAL_CONTEXT_EXPANSION_SUMMARY=${JSON.stringify(gate.summary)}`);
  assert.equal(gate.summary.errorCount, 0);
});
