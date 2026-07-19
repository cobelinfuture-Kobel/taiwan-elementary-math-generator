import assert from "node:assert/strict";
import test from "node:test";

import {
  buildG3BU04GlobalContextPilotWorksheet,
  createG3BU04GlobalContextPilotOptions,
  G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-worksheet.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
  G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME,
  validateG3BU04GlobalContextPilotOptions,
  validateG3BU04GlobalContextPilotRuntimeQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-runtime.js";
import {
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s57f5-extension.js";

const EXPECTED_CONTEXT_PHRASES = [
  "班級園遊會",
  "戶外學習",
  "運動練習",
  "社區清潔活動",
  "露營活動"
];

function targetQuestions(document) {
  return document.generatedQuestions.filter((question) => (
    question.patternSpecId === G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID
  ));
}

test("GCTX-P12R uses visible resolver-derived canonical worksheet options", () => {
  const options = createG3BU04GlobalContextPilotOptions();
  assert.equal(options.sourceId, "g3b_u04_3b04");
  assert.equal(options.selectionMode, "singleKnowledgePoint");
  assert.deepEqual(options.selectedKnowledgePointIds, ["kp_g3b_u04_add_then_divide"]);
  assert.deepEqual(options.selectedPatternGroupIds, ["pg_g3b_u04_add_then_divide"]);
  assert.equal(options.questionCount, 20);
  assert.equal(options.globalContextPilot.enabled, true);
  assert.equal(options.globalContextPilot.publicSelectable, false);
  assert.equal(validateG3BU04GlobalContextPilotOptions(options).ok, true);
});

test("GCTX-P12R builds baseline and pilot worksheets through the canonical pipeline", () => {
  const result = buildG3BU04GlobalContextPilotWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.errors.length, 0);
  assert.equal(result.baselineWorksheetDocument.generatedQuestions.length, 20);
  assert.equal(result.pilotWorksheetDocument.generatedQuestions.length, 20);
  assert.equal(result.targetQuestionIndexes.length, 5);
  assert.equal(result.variantIds.length, 5);

  const baselineTargets = targetQuestions(result.baselineWorksheetDocument);
  const pilotTargets = targetQuestions(result.pilotWorksheetDocument);
  assert.equal(baselineTargets.length, 5);
  assert.equal(pilotTargets.length, 5);
  assert.equal(baselineTargets.every((question) => !question.globalContextPilot), true);
  assert.equal(pilotTargets.every((question) => question.globalContextPilot?.runtimeResolvable === true), true);
  assert.equal(pilotTargets.every((question) => question.globalContextPilot?.visibleResolverDerived === true), true);
  assert.equal(pilotTargets.every((question) => question.globalContextPilot?.canonicalGeneratorUsed === true), true);
});

test("GCTX-P12R creates five learner-visible context changes, not metadata-only changes", () => {
  const result = buildG3BU04GlobalContextPilotWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const before = targetQuestions(result.baselineWorksheetDocument).map((question) => question.promptText);
  const after = targetQuestions(result.pilotWorksheetDocument).map((question) => question.promptText);
  assert.equal(new Set(before).size > 0, true);
  assert.equal(new Set(after).size, 5);
  assert.notDeepEqual(after, before);

  const combined = after.join("\n");
  for (const phrase of EXPECTED_CONTEXT_PHRASES) assert.match(combined, new RegExp(phrase));
  assert.doesNotMatch(combined, /三明治費用共|筆記本費用共|人的門票費用共|帳篷租金共/);
});

test("GCTX-P12R preserves canonical arithmetic, answer units, and answer-key parity", () => {
  const result = buildG3BU04GlobalContextPilotWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.pilotWorksheetDocument;
  const targets = targetQuestions(document);

  for (const question of targets) {
    const expected = (question.quantities.a + question.quantities.b) / question.quantities.c;
    assert.equal(Number.isInteger(expected), true);
    assert.equal(question.finalAnswer, expected);
    assert.equal(question.answerText, `${expected}元`);
    assert.equal(question.equationModel, `(${question.quantities.a} + ${question.quantities.b}) ÷ ${question.quantities.c}`);
    assert.equal(validateG3BU04GlobalContextPilotRuntimeQuestion(question).ok, true);

    const answerItem = document.answerKeyItems.find((item) => item.questionId === question.id);
    assert.ok(answerItem);
    assert.equal(answerItem.promptText, question.promptText);
    assert.equal(answerItem.equationText, question.equationModel);
    assert.equal(answerItem.answerText, question.answerText);
  }
});

test("GCTX-P12R uses the existing S57F5 production renderer for both before and after", () => {
  const result = buildG3BU04GlobalContextPilotWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const baselineHtml = renderWorksheetDocumentToHtml(result.baselineWorksheetDocument, {
    title: "GCTX-P12R Before",
    stylesheetHref: "",
    debugDataAttributes: false
  });
  const pilotHtml = renderWorksheetDocumentToHtml(result.pilotWorksheetDocument, {
    title: "GCTX-P12R After",
    stylesheetHref: "",
    debugDataAttributes: false
  });

  for (const html of [baselineHtml, pilotHtml]) {
    assert.match(html, /worksheet-renderer--g3b-u04-semantic/);
    assert.match(html, /data-renderer-profile="g3b_u04_semantic_long_text_v1"/);
    assert.match(html, /break-inside: avoid/);
    assert.match(html, /答案卷/);
    assert.match(html, /算式：/);
  }
  assert.notEqual(pilotHtml, baselineHtml);
  for (const phrase of EXPECTED_CONTEXT_PHRASES) assert.match(pilotHtml, new RegExp(phrase));
  assert.doesNotMatch(pilotHtml, /三明治費用共|筆記本費用共|人的門票費用共|帳篷租金共/);
});

test("GCTX-P12R is deterministic for the same seed", () => {
  const first = buildG3BU04GlobalContextPilotWorksheet({ generationSeed: "gctx-p12r-replay" });
  const second = buildG3BU04GlobalContextPilotWorksheet({ generationSeed: "gctx-p12r-replay" });
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.equal(second.ok, true, JSON.stringify(second.errors));
  assert.deepEqual(first.pilotWorksheetDocument.generatedQuestions, second.pilotWorksheetDocument.generatedQuestions);
  assert.deepEqual(first.pilotWorksheetDocument.questionPages, second.pilotWorksheetDocument.questionPages);
  assert.deepEqual(first.pilotWorksheetDocument.answerKeyPages, second.pilotWorksheetDocument.answerKeyPages);
});

test("GCTX-P12R blocks unregistered variants and public selection", () => {
  const unregistered = validateG3BU04GlobalContextPilotOptions({
    globalContextPilot: { enabled: true, variantIds: ["gctx_unknown"] }
  });
  assert.equal(unregistered.ok, false);
  assert.ok(unregistered.errors.some((entry) => entry.code === "GCTX_P12R_VARIANT_UNREGISTERED"));

  const publicSelection = validateG3BU04GlobalContextPilotOptions({
    globalContextPilot: {
      enabled: true,
      publicSelectable: true,
      variantIds: createG3BU04GlobalContextPilotOptions().globalContextPilot.variantIds
    }
  });
  assert.equal(publicSelection.ok, false);
  assert.ok(publicSelection.errors.some((entry) => entry.code === "GCTX_P12R_PUBLIC_SELECTION_FORBIDDEN"));
});

test("GCTX-P12R validator blocks prompt and arithmetic mutations", () => {
  const result = buildG3BU04GlobalContextPilotWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const question = structuredClone(targetQuestions(result.pilotWorksheetDocument)[0]);
  question.promptText = "錯誤情境？";
  question.blankedDisplayText = question.promptText;
  question.finalAnswer += 1;
  question.answerText = `${question.finalAnswer}元`;
  const validation = validateG3BU04GlobalContextPilotRuntimeQuestion(question);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((entry) => entry.code === "GCTX_P12R_RENDERED_CONTEXT_MISMATCH"));
  assert.ok(validation.errors.some((entry) => entry.code === "GCTX_P12R_MATHEMATICAL_WITNESS_MISMATCH"));
});

test("GCTX-P12R keeps public production admission false at E4 pilot scope", () => {
  const result = buildG3BU04GlobalContextPilotWorksheet();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.pilotWorksheetDocument;
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.productionSelectable, false);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PILOT_WORKSHEET.productionSelectable, false);
  assert.equal(document.productionUse, "pilot_only_not_admitted");
  assert.equal(document.visibilityStatus, "isolated_production_equivalent_pilot");
  assert.equal(document.globalContextPilot.publicSelectorExposed, false);
  assert.equal(document.globalContextPilot.productionSelectable, false);
  assert.equal(document.globalContextPilot.humanReviewReady, false);
});

test("GCTX-P12R readback", () => {
  const result = buildG3BU04GlobalContextPilotWorksheet();
  console.log(`GCTX_P12R_RUNTIME_RENDERER_SUMMARY=${JSON.stringify({
    ok: result.ok,
    baselineQuestions: result.baselineWorksheetDocument?.summary.questionCount,
    pilotQuestions: result.pilotWorksheetDocument?.summary.questionCount,
    changedContexts: result.pilotWorksheetDocument?.summary.globalContextPilotQuestionCount,
    questionPages: result.pilotWorksheetDocument?.questionPages.length,
    answerPages: result.pilotWorksheetDocument?.answerKeyPages.length,
    errorCount: result.errors.length
  })}`);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
});
