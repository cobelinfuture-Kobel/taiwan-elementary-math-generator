import assert from "node:assert/strict";
import test from "node:test";

import {
  buildGctxP12GlobalContextExpansionPilot,
  loadGctxP12Contract
} from "../../tools/curriculum/build-gctx-p12-g3b-u04-global-context-expansion-pilot.mjs";
import {
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT,
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS,
  buildG3BU04GlobalContextExpansionPreview,
  renderG3BU04GlobalContextExpansionQuestion,
  validateG3BU04GlobalContextExpansionQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-expansion-pilot.js";

const contract = loadGctxP12Contract();
const gate = buildGctxP12GlobalContextExpansionPilot();
const clone = (value) => JSON.parse(JSON.stringify(value));

test("GCTX-P12 is downgraded to E2 candidate content", () => {
  assert.equal(contract.status, "candidate_content_merged_runtime_output_not_integrated");
  assert.equal(contract.actualEvidenceLevel, "E2_CONTENT_AUTHORED");
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT.actualEvidenceLevel, "E2_CONTENT_AUTHORED");
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT.lifecycleStatus, "candidate_content_authored");
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT.runtimeResolvable, false);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT.productionRendererUsed, false);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT.pdfOutputVerified, false);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT.visibleOutputChanged, false);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT.humanReviewReady, false);
});

test("GCTX-P12 retains five mathematically valid candidate contexts", () => {
  assert.deepEqual(gate.errors, []);
  assert.equal(gate.status, "candidate_content_authored_runtime_output_not_integrated");
  assert.equal(gate.summary.bindingCount, 5);
  assert.equal(gate.summary.renderedCandidateQuestionCount, 5);
  assert.equal(gate.summary.uniquePromptCount, 5);
  assert.equal(gate.summary.uniqueContextDomainCount, 5);
  assert.equal(gate.summary.uniqueSemanticFingerprintCount, 5);
  assert.equal(gate.summary.candidateMathErrorCount, 0);

  const combined = gate.preview.questions.map((question) => question.promptText).join("\n");
  for (const phrase of ["班級園遊會", "戶外學習", "運動練習", "社區清潔活動", "露營活動"]) {
    assert.match(combined, new RegExp(phrase));
  }
  assert.doesNotMatch(combined, /三明治費用共|筆記本費用共|門票費用共|帳篷租金共/);

  for (const question of gate.preview.questions) {
    assert.equal(question.equationModel, "(60 + 90) ÷ 5");
    assert.equal(question.finalAnswer, 30);
    assert.equal(question.answerText, "30元");
    assert.equal(question.globalContextBinding.runtimeResolvable, false);
    assert.equal(question.globalContextBinding.humanReviewReady, false);
  }
});

test("GCTX-P12 candidate variants differ across fixed semantic axes", () => {
  assert.equal(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length, 5);
  const axes = [
    new Set(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((row) => row.eventPurposeId)),
    new Set(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((row) => row.placeAssetId)),
    new Set(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((row) => row.activityAssetId)),
    new Set(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((row) => row.actorAssetId)),
    new Set(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((row) => `${row.firstCostLabel}|${row.secondCostLabel}`)),
    new Set(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((row) => row.semanticFingerprint))
  ];
  for (const axis of axes) assert.equal(axis.size, 5);
});

test("GCTX-P12 standalone preview is deterministic but not production evidence", () => {
  const first = buildG3BU04GlobalContextExpansionPreview({ a: 60, b: 90, c: 5 });
  const second = buildG3BU04GlobalContextExpansionPreview({ a: 60, b: 90, c: 5 });
  assert.deepEqual(first, second);
  assert.equal(first.ok, true);
  assert.equal(first.artifactClass, "standalone_candidate_preview_not_production_evidence");
  assert.equal(first.summary.humanReviewReadyCount, 0);
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

test("GCTX-P12 validator blocks legacy prompt leakage", () => {
  const question = clone(gate.preview.questions[0]);
  question.promptText = gate.preview.baselinePromptText;
  const validation = validateG3BU04GlobalContextExpansionQuestion(question);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === "GCTX_P12_LEGACY_CONTEXT_LEAKED"));
});

test("GCTX-P12 validator blocks false runtime or human-review admission", () => {
  const question = clone(gate.preview.questions[0]);
  question.globalContextBinding.runtimeResolvable = true;
  question.globalContextBinding.humanReviewReady = true;
  const validation = validateG3BU04GlobalContextExpansionQuestion(question);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === "GCTX_P12_FALSE_PIPELINE_ADMISSION"));
});

test("GCTX-P12 exposes non-review packets until E4 evidence exists", () => {
  assert.equal(gate.reviewPackets.length, 5);
  for (const packet of gate.reviewPackets) {
    assert.equal(packet.artifactClass, "standalone_candidate_preview_not_production_evidence");
    assert.equal(packet.reviewStatus, "not_ready_missing_e4_artifact");
    assert.equal(packet.reviewType, "none");
    assert.equal(packet.humanReviewReady, false);
    assert.equal(packet.decision, null);
  }
  assert.deepEqual(gate.scopeBoundary, {
    formalApprovedRegistryChanged: false,
    publicRouterChanged: false,
    productionSelectable: false,
    runtimeResolvable: false,
    productionEquivalentGeneratorUsed: false,
    productionRendererUsed: false,
    htmlOutputVerified: false,
    pdfOutputVerified: false,
    visibleOutputChanged: false,
    humanReviewReady: false
  });
});

test("GCTX-P12 next step is runtime-renderer-PDF integration, not human review", () => {
  assert.equal(gate.nextShortestStep, "GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix");
});

test("GCTX-P12 corrected readback", () => {
  console.log(`GCTX_P12_CORRECTED_SUMMARY=${JSON.stringify(gate.summary)}`);
  assert.equal(gate.summary.errorCount, 0);
  assert.equal(gate.summary.humanReviewReadyCount, 0);
});
