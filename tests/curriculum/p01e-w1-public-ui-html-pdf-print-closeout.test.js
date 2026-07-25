import test from "node:test";
import assert from "node:assert/strict";

import {
  listBatchASourceUnits,
  listFullProductPublicSourceUnits,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  auditP01EPublicSelectorComposition,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  W1_FULL_PRODUCT_PUBLIC_APPLICATION_GROUPS,
  auditW1FullProductPublicApplicationGroups,
  listW1FullProductPublicApplicationGroupsForSource,
} from "../../site/modules/curriculum/registry/w1-full-product-public-application-groups.js";
import {
  W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS,
  auditFullProductPublicControlProfiles,
  getFullProductPublicControlProfile,
} from "../../site/modules/curriculum/registry/full-product-public-control-profiles.js";
import {
  getPixelRegistrySnapshot,
  listPixelSourceOptions,
} from "../../site/pixel/pixel-registry-bridge.js";

const W1_SOURCE_IDS = Object.freeze([...W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS]);

function numericPlan(sourceId, questionCount = 12) {
  return {
    sourceId,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    questionMode: "numeric",
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p01e-numeric-${sourceId}`,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
  };
}

function applicationPlan(sourceId, overrides = {}) {
  const groups = listW1FullProductPublicApplicationGroupsForSource(sourceId);
  const selectedKnowledgePointIds = groups.map((row) => row.primaryKnowledgePointId);
  const selectedPatternGroupIds = groups.map((row) => row.basePatternGroupId);
  return {
    sourceId,
    selectionMode: selectedKnowledgePointIds.length > 1
      ? "mixedKnowledgePointsSameUnit"
      : "singleKnowledgePoint",
    selectedKnowledgePointIds,
    selectedPatternGroupIds,
    questionMode: "application",
    questionCount: groups.length * 2,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p01e-application-${sourceId}`,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
    ...overrides,
  };
}

function assertPrintDocument(document, expectedCount) {
  assert.equal(document.generatedQuestions.length, expectedCount);
  assert.equal(document.answerKeyItems.length, expectedCount);
  assert.ok(document.questionPages.length > 0);
  assert.ok(document.answerKeyPages.length > 0);
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /<!doctype html>/);
  assert.match(html, /worksheet-page--questions/);
  assert.match(html, /worksheet-page--answer-key/);
  assert.doesNotMatch(html, /\{[A-Za-z_][^}]*\}/);
  return html;
}

test("P01E publishes nineteen sources while preserving the thirteen-unit protected baseline", () => {
  const baseline = listBatchASourceUnits({ includePublicCandidates: false });
  const publicFleet = listFullProductPublicSourceUnits();
  assert.equal(baseline.length, 13);
  assert.equal(publicFleet.length, 19);
  for (const sourceId of W1_SOURCE_IDS) {
    const source = publicFleet.find((row) => row.sourceId === sourceId);
    assert.ok(source, sourceId);
    assert.equal(source.lifecycle, "public_full_product_w1_release");
  }
});

test("P01E exposes twenty-one numeric KPs, thirteen eligible application KPs and eight numeric-only KPs", () => {
  const selectorAudit = auditP01EPublicSelectorComposition();
  const applicationAudit = auditW1FullProductPublicApplicationGroups();
  assert.equal(selectorAudit.ok, true, JSON.stringify(selectorAudit.errors));
  assert.equal(applicationAudit.ok, true, JSON.stringify(applicationAudit.errors));
  assert.deepEqual(selectorAudit.counts, {
    w1KnowledgePoints: 21,
    applicationEligibleKnowledgePoints: 13,
    applicationIneligibleKnowledgePoints: 8,
    publicSources: 19,
  });
  const w1Rows = listVisibleBatchAKnowledgePoints()
    .filter((row) => W1_SOURCE_IDS.includes(row.sourceId));
  assert.equal(w1Rows.length, 21);
  let eligible = 0;
  for (const row of w1Rows) {
    const groups = getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId);
    const numericGroups = groups.filter((group) => (
      group.publicQuestionMode === "numeric" || group.mode === "numeric"
    ));
    const applicationGroups = groups.filter((group) => (
      group.publicQuestionMode === "application" || group.mode === "application"
    ));
    assert.equal(numericGroups.length, 1, row.knowledgePointId);
    assert.ok(applicationGroups.length <= 1, row.knowledgePointId);
    if (applicationGroups.length === 1) eligible += 1;
  }
  assert.equal(eligible, 13);
});

test("P01E provides numeric/application controls for all four W1 sources without adding PBL", () => {
  const audit = auditFullProductPublicControlProfiles();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.equal(audit.profileCount, 19);
  assert.equal(audit.w1ProfileCount, 4);
  for (const sourceId of W1_SOURCE_IDS) {
    const profile = getFullProductPublicControlProfile(sourceId);
    const modes = profile.questionTypeControl.options.map((row) => row.value);
    assert.deepEqual(modes, ["numeric", "application"]);
    assert.equal(modes.includes("pbl"), false);
    assert.equal(profile.genericFallback, false);
    assert.equal(profile.freeFormAI, false);
  }
});

test("P01E aligns Pixel registry snapshot with the nineteen-source public authority", () => {
  const sources = listPixelSourceOptions();
  const snapshot = getPixelRegistrySnapshot();
  assert.equal(sources.length, 19);
  assert.equal(snapshot.sourceCount, 19);
  for (const sourceId of W1_SOURCE_IDS) {
    const source = sources.find((row) => row.sourceId === sourceId);
    assert.ok(source, sourceId);
    assert.ok(source.visibleKnowledgePointCount > 0, sourceId);
    assert.ok(snapshot.bySourceId[sourceId], sourceId);
  }
});

test("P01E generates numeric worksheets, answer keys and HTML for all four public W1 sources", () => {
  for (const sourceId of W1_SOURCE_IDS) {
    const plan = numericPlan(sourceId);
    const first = buildWorksheetDocumentFromPlan(plan);
    const second = buildWorksheetDocumentFromPlan(plan);
    assert.equal(first.ok, true, `${sourceId}: ${JSON.stringify(first.errors)}`);
    assert.equal(second.ok, true, `${sourceId}: ${JSON.stringify(second.errors)}`);
    assert.deepEqual(
      first.worksheetDocument.generatedQuestions,
      second.worksheetDocument.generatedQuestions,
    );
    assert.equal(first.worksheetDocument.batchA.sourceId, sourceId);
    assert.equal(
      first.worksheetDocument.generatedQuestions.every(
        (question) => question.questionMode !== "application",
      ),
      true,
    );
    assertPrintDocument(first.worksheetDocument, plan.questionCount);
  }
});

test("P01E application projection preserves PatternSpecs, deterministic answers and finalAnswer for all thirteen eligible KPs", () => {
  let totalQuestions = 0;
  for (const sourceId of W1_SOURCE_IDS) {
    const plan = applicationPlan(sourceId);
    const numeric = buildBatchABrowserWorksheetDocument({
      ...plan,
      questionMode: "numeric",
    });
    const application = buildWorksheetDocumentFromPlan(plan);
    assert.equal(numeric.ok, true, `${sourceId}: ${JSON.stringify(numeric.errors)}`);
    assert.equal(application.ok, true, `${sourceId}: ${JSON.stringify(application.errors)}`);
    const numericQuestions = numeric.worksheetDocument.generatedQuestions;
    const applicationQuestions = application.worksheetDocument.generatedQuestions;
    assert.equal(applicationQuestions.length, plan.questionCount);
    assert.equal(application.p01eApplicationAdmission.projectedQuestionCount, plan.questionCount);
    assert.equal(
      application.p01eApplicationAdmission.globalContextBoundQuestionCount,
      plan.questionCount,
    );
    for (let index = 0; index < applicationQuestions.length; index += 1) {
      const original = numericQuestions[index];
      const projected = applicationQuestions[index];
      assert.equal(projected.patternSpecId, original.patternSpecId);
      assert.equal(projected.answerText, original.answerText);
      assert.deepEqual(projected.finalAnswer, original.finalAnswer);
      assert.equal(projected.applicationText, true);
      assert.equal(projected.questionMode, "application");
      assert.equal(projected.globalContextProduction.runtimeResolvable, true);
      assert.equal(projected.p01eApplicationAdmission.productionSelectable, true);
      assert.doesNotMatch(projected.promptText, /(?:算式|_{2,}|答\s*[:：])/);
    }
    assertPrintDocument(application.worksheetDocument, plan.questionCount);
    totalQuestions += applicationQuestions.length;
  }
  assert.equal(totalQuestions, W1_FULL_PRODUCT_PUBLIC_APPLICATION_GROUPS.length * 2);
});

test("P01E exposes application representation only for explicitly eligible KnowledgePoints", () => {
  const eligibleIds = new Set(
    W1_FULL_PRODUCT_PUBLIC_APPLICATION_GROUPS.map((row) => row.primaryKnowledgePointId),
  );
  const w1Rows = listVisibleBatchAKnowledgePoints()
    .filter((row) => W1_SOURCE_IDS.includes(row.sourceId));
  for (const row of w1Rows) {
    const groups = getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId);
    const applicationGroups = groups.filter((group) => group.mode === "application");
    assert.equal(
      applicationGroups.length,
      eligibleIds.has(row.knowledgePointId) ? 1 : 0,
      row.knowledgePointId,
    );
  }
});
