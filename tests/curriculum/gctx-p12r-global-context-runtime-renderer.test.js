import assert from "node:assert/strict";
import test from "node:test";

import {
  G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
  G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME,
  buildG3BU04GlobalContextPilotPlan,
  generateG3BU04GlobalContextPilotQuestions,
  validateG3BU04GlobalContextPilotQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-runtime.js";
import {
  buildG3BU04GlobalContextPilotWorksheetDocuments
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-worksheet.js";
import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s57f5-extension.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s57f5-extension.js";

const SOURCE_ID = "g3b_u04_3b04";
const KP_ID = "kp_g3b_u04_add_then_divide";
const PATTERN_ID = "ps_g3b_u04_add_divide_joint_purchase_equal_share";
const EXPECTED_PHRASES = ["班級園遊會", "戶外學習", "運動練習", "社區清潔活動", "露營活動"];
const LEGACY_PATTERN = /三明治費用|果汁費用|筆記本費用|彩色筆費用|門票費用|帳篷租金/;

function pilotOptions(overrides = {}) {
  return {
    pilotMode: G3B_U04_GLOBAL_CONTEXT_PILOT_MODE,
    generationSeed: "gctx-p12r-test-seed",
    includeAnswerKey: true,
    ...overrides
  };
}

function applicationGroupId() {
  return getVisiblePatternGroupsForKnowledgePoint(KP_ID)
    .find((group) => group.representationTag === "application_word_problem")
    ?.patternGroupId;
}

test("GCTX-P12R declares a shadow-only canonical runtime boundary", () => {
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.status, "shadow_runtime_integrated_output_gate_pending");
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.resolver, "visiblePatternGroupResolver");
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.canonicalGeneratorUsed, true);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.productionSelectable, false);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.publicQuerySelectable, false);
  assert.equal(G3B_U04_GLOBAL_CONTEXT_PILOT_RUNTIME.publicRouterChanged, false);
});

test("GCTX-P12R rejects calls without the internal shadow pilot mode", () => {
  const result = buildG3BU04GlobalContextPilotPlan({ generationSeed: "missing-mode" });
  assert.equal(result.ok, false);
  assert.equal(result.errors.some((entry) => entry.code === "GCTX_P12R_SHADOW_MODE_REQUIRED"), true);
});

test("GCTX-P12R plan originates from the visible resolver and narrows to one exact PatternSpec", () => {
  const result = buildG3BU04GlobalContextPilotPlan(pilotOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.plan.resolverResult.ok, true);
  assert.equal(result.plan.resolverResult.provenance.resolver, "visiblePatternGroupResolver");
  assert.deepEqual(result.plan.patternSpecIds, [PATTERN_ID]);
  assert.deepEqual(result.plan.selectedKnowledgePointIds, [KP_ID]);
  assert.equal(result.plan.allocation.length, 1);
  assert.equal(result.plan.allocation[0].patternSpecId, PATTERN_ID);
  assert.equal(result.plan.allocation[0].questionCount, 5);
  assert.equal(result.plan.globalContextPilot.productionSelectable, false);
});

test("GCTX-P12R uses canonical-generated mathematics and produces five distinct non-legacy contexts", () => {
  const result = generateG3BU04GlobalContextPilotQuestions(pilotOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 5);
  assert.equal(result.baseQuestions.length, 5);
  assert.equal(new Set(result.questions.map((question) => question.promptText)).size, 5);
  assert.equal(new Set(result.questions.map((question) => question.globalContextPilot.semanticVariantId)).size, 5);

  const combined = result.questions.map((question) => question.promptText).join("\n");
  for (const phrase of EXPECTED_PHRASES) assert.match(combined, new RegExp(phrase));
  assert.doesNotMatch(combined, LEGACY_PATTERN);

  for (const [index, question] of result.questions.entries()) {
    const base = result.baseQuestions[index];
    assert.equal(question.patternSpecId, PATTERN_ID);
    assert.equal(question.knowledgePointId, KP_ID);
    assert.equal(question.equationModel, base.equationModel);
    assert.equal(question.finalAnswer, base.finalAnswer);
    assert.equal(question.answerText, base.answerText);
    assert.deepEqual(question.quantities, base.quantities);
    assert.notEqual(question.promptText, base.promptText);
    assert.equal(question.globalContextPilot.runtimeResolvable, true);
    assert.equal(question.globalContextPilot.productionSelectable, false);
    assert.equal(question.productionUse, "forbidden");
    assert.equal(question.selectorStatus, "hidden");
    assert.equal(question.canonicalRoute.resolver, "visiblePatternGroupResolver");
    assert.equal(question.canonicalRoute.publicHiddenModeFlagUsed, false);
  }
});

test("GCTX-P12R is deterministic for one seed and changes context ordering for another seed", () => {
  const first = generateG3BU04GlobalContextPilotQuestions(pilotOptions({ generationSeed: "seed-one" }));
  const replay = generateG3BU04GlobalContextPilotQuestions(pilotOptions({ generationSeed: "seed-one" }));
  const second = generateG3BU04GlobalContextPilotQuestions(pilotOptions({ generationSeed: "seed-two" }));
  assert.equal(first.ok, true);
  assert.equal(replay.ok, true);
  assert.equal(second.ok, true);
  assert.deepEqual(first.questions, replay.questions);
  assert.notDeepEqual(
    first.questions.map((question) => question.globalContextPilot.semanticVariantId),
    second.questions.map((question) => question.globalContextPilot.semanticVariantId)
  );
  assert.notDeepEqual(
    first.questions.map((question) => question.promptText),
    second.questions.map((question) => question.promptText)
  );
});

test("GCTX-P12R validator blocks mathematical drift and false production admission", () => {
  const result = generateG3BU04GlobalContextPilotQuestions(pilotOptions());
  assert.equal(result.ok, true);
  const base = result.baseQuestions[0];

  const mathDrift = structuredClone(result.questions[0]);
  mathDrift.finalAnswer += 1;
  mathDrift.answerText = `${mathDrift.finalAnswer}${mathDrift.answerUnit}`;
  const mathValidation = validateG3BU04GlobalContextPilotQuestion(mathDrift, base);
  assert.equal(mathValidation.ok, false);
  assert.equal(mathValidation.errors.some((entry) => entry.code === "GCTX_P12R_MATHEMATICAL_WITNESS_DRIFT"), true);

  const promoted = structuredClone(result.questions[0]);
  promoted.productionUse = "allowed";
  promoted.selectorStatus = "visible";
  promoted.globalContextPilot.productionSelectable = true;
  const promotionValidation = validateG3BU04GlobalContextPilotQuestion(promoted, base);
  assert.equal(promotionValidation.ok, false);
  assert.equal(promotionValidation.errors.some((entry) => entry.code === "GCTX_P12R_FALSE_PRODUCTION_ADMISSION"), true);
});

test("GCTX-P12R before and after documents use the production semantic renderer profile", () => {
  const result = buildG3BU04GlobalContextPilotWorksheetDocuments(pilotOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const before = result.beforeWorksheetDocument;
  const after = result.afterWorksheetDocument;

  for (const document of [before, after]) {
    assert.equal(document.schemaVersion, "worksheet-document-v1");
    assert.equal(document.rendererProfile.profileId, "g3b_u04_semantic_long_text_v1");
    assert.equal(document.printOptions.columns, 2);
    assert.equal(document.printOptions.rowsPerPage, 4);
    assert.equal(document.printOptions.answerKeyColumns, 1);
    assert.equal(document.printOptions.answerKeyRowsPerPage, 8);
    assert.equal(document.productionUse, "forbidden");
    assert.equal(document.visibilityStatus, "hidden");
    assert.equal(document.pilotRuntime.canonicalResolverUsed, true);
    assert.equal(document.pilotRuntime.canonicalGeneratorUsed, true);
    assert.equal(document.pilotRuntime.productionRendererUsed, true);
    assert.equal(document.pilotRuntime.productionSelectable, false);
    assert.equal(document.generatedQuestions.length, 5);
    assert.equal(document.answerKeyItems.length, 5);
  }

  assert.equal(before.generatedQuestions.some((question) => LEGACY_PATTERN.test(question.promptText)), true);
  assert.equal(after.generatedQuestions.some((question) => LEGACY_PATTERN.test(question.promptText)), false);
  assert.equal(after.summary.globalContextVariantCount, 5);
});

test("GCTX-P12R production renderer exposes visible before-after differences without internal IDs", () => {
  const result = buildG3BU04GlobalContextPilotWorksheetDocuments(pilotOptions());
  assert.equal(result.ok, true);
  const beforeHtml = renderWorksheetDocumentToHtml(result.beforeWorksheetDocument, { stylesheetHref: "", debugDataAttributes: false });
  const afterHtml = renderWorksheetDocumentToHtml(result.afterWorksheetDocument, { stylesheetHref: "", debugDataAttributes: false });

  assert.match(beforeHtml, LEGACY_PATTERN);
  assert.doesNotMatch(afterHtml, LEGACY_PATTERN);
  for (const phrase of EXPECTED_PHRASES) assert.match(afterHtml, new RegExp(phrase));
  assert.match(afterHtml, /data-renderer-profile="g3b_u04_semantic_long_text_v1"/);
  assert.match(afterHtml, /算式：/);
  assert.match(afterHtml, /答案：/);
  for (const internalPrefix of ["kp_g3b_u04_", "pg_g3b_u04_", "ps_g3b_u04_", "tpl_g3b_u04_"]) {
    assert.equal(afterHtml.includes(internalPrefix), false);
  }
});

test("GCTX-P12R leaves the existing public canonical worksheet route unchanged", () => {
  const groupId = applicationGroupId();
  assert.ok(groupId);
  const publicResult = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [KP_ID],
    selectedPatternGroupIds: [groupId],
    questionCount: 5,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "gctx-p12r-public-regression",
    printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true }
  });
  assert.equal(publicResult.ok, true, JSON.stringify(publicResult.errors));
  assert.equal(publicResult.worksheetDocument.productionUse, "allowed");
  assert.equal(publicResult.worksheetDocument.visibilityStatus, "visible");
  assert.equal(publicResult.worksheetDocument.generatedQuestions.some((question) => question.globalContextPilot), false);
  assert.equal(publicResult.worksheetDocument.generatedQuestions.some((question) => LEGACY_PATTERN.test(question.promptText)), true);
});
