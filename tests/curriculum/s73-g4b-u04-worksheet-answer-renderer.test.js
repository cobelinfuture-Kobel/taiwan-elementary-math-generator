import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  buildBatchABrowserWorksheetDocument,
  isS73G4BU04WorksheetOptions,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s73-extension.js";
import {
  buildBatchABrowserPlan,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import {
  normalizeG4BU04ResolverPlan,
} from "../../site/modules/curriculum/batch-b/g4b-u04-canonical-router.js";
import {
  validateG4BU04WorksheetEligibility,
} from "../../site/modules/curriculum/batch-b/g4b-u04-worksheet-eligibility.js";
import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G4B_U04_RENDERER_PROFILES,
  G4B_U04_WORKSHEET_ANSWER_SHAPES,
  G4B_U04_WORKSHEET_LIFECYCLE,
  getG4BU04WorksheetPromotionProjection,
  validateG4BU04WorksheetPromotionProjection,
} from "../../site/modules/curriculum/registry/g4b-u04-worksheet-promotion.js";
import {
  G4B_U04_RENDERER_INTEGRATION,
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s73-extension.js";

const CONTRACT_PATH = new URL(
  "../../data/curriculum/registry/promotions/S73_G4B_U04_WorksheetRendererPromotionRegistry.json",
  import.meta.url,
);

function baseOptions(overrides = {}) {
  return {
    sourceId: "g4b_u04_4b04",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [],
    questionMode: "mixed",
    questionCount: 17,
    ordering: "groupedByPattern",
    generationSeed: "s73-worksheet-test",
    includeAnswerKey: true,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 6,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
    ...overrides,
  };
}

function sorted(values) {
  return [...values].sort();
}

test("S73 worksheet promotion covers all 12 KPs, 12 groups, 17 specs and 9 answer shapes", () => {
  const checked = validateG4BU04WorksheetPromotionProjection();
  assert.equal(checked.ok, true, checked.errors.join(","));
  assert.deepEqual(checked.counts, {
    knowledgePoints: 12,
    patternGroups: 12,
    patternSpecs: 17,
    answerShapes: 9,
    rendererProfiles: 3,
  });
  const projection = getG4BU04WorksheetPromotionProjection();
  assert.equal(projection.lifecycle.worksheetStatus, "worksheet_eligible");
  assert.equal(projection.lifecycle.answerKeyStatus, "answer_key_integrated");
  assert.equal(projection.lifecycle.rendererStatus, "worksheet_renderer_integrated");
  assert.equal(projection.lifecycle.productionUse, "preview_only_pending_s75");
  assert.equal(projection.activation.requiredNextGate, "S74_G4B_U04_PublicUIPrintAndQueryStateQA");
});

test("S73 canonical G4B-U04 plans are worksheet eligible through 1000 questions", () => {
  const plan = normalizeG4BU04ResolverPlan(buildBatchABrowserPlan(baseOptions({ questionCount: 1000 })));
  const eligibility = validateG4BU04WorksheetEligibility(plan);
  assert.equal(eligibility.ok, true, JSON.stringify(eligibility.errors));
  assert.equal(eligibility.plan.questionCount, 1000);
  assert.equal(isS73G4BU04WorksheetOptions(baseOptions()), true);
});

test("S73 builds an exact-count mixed worksheet with all answer shapes and all five modes", () => {
  const result = buildBatchABrowserWorksheetDocument(baseOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 17);
  assert.equal(document.questionDisplayModels.length, 17);
  assert.equal(document.answerKeyItems.length, 17);
  assert.equal(document.summary.questionCount, 17);
  assert.equal(document.productionUse, "preview_only_pending_s75");
  assert.equal(document.rendererProfile.profileId, G4B_U04_RENDERER_PROFILES.inverseLong.profileId);
  assert.deepEqual(sorted(document.g4bU04Summary.answerModelShapes), sorted(G4B_U04_WORKSHEET_ANSWER_SHAPES));
  assert.deepEqual(document.g4bU04Summary.modeCounts, {
    concept: 4,
    numeric: 3,
    application: 4,
    operation_estimation: 4,
    reasoning: 2,
  });
  assert.equal(document.g4bU04Summary.classCQuestionCount, 9);
  assert.equal(document.g4bU04Summary.classDQuestionCount, 8);
  assert.equal(document.generatedQuestions.every((row) => row.phase === "S73"), true);
  assert.equal(document.generatedQuestions.every((row) => row.productionUse === "preview_only_pending_s75"), true);
});

test("S73 uses the compact profile for direct numeric rounding", () => {
  const result = buildBatchABrowserWorksheetDocument(baseOptions({
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_round_half_up_place_value"],
    selectedPatternGroupIds: ["pg_g4b_u04_round_half_up"],
    questionMode: "numeric",
    questionCount: 12,
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.rendererProfile.profileId, G4B_U04_RENDERER_PROFILES.compact.profileId);
  assert.equal(result.worksheetDocument.printOptions.columns, 2);
  assert.equal(result.worksheetDocument.printOptions.rowsPerPage, 6);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
});

test("S73 uses the contextual profile for application and operation-estimation questions", () => {
  const application = buildBatchABrowserWorksheetDocument(baseOptions({
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_payment_denomination_ceiling"],
    selectedPatternGroupIds: ["pg_g4b_u04_payment_ceiling"],
    questionMode: "application",
    questionCount: 8,
  }));
  assert.equal(application.ok, true, JSON.stringify(application.errors));
  assert.equal(application.worksheetDocument.rendererProfile.profileId, G4B_U04_RENDERER_PROFILES.contextual.profileId);
  assert.equal(application.worksheetDocument.questionPages.length, 1);

  const estimation = buildBatchABrowserWorksheetDocument(baseOptions({
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_round_then_add_subtract"],
    selectedPatternGroupIds: ["pg_g4b_u04_estimate_add_subtract"],
    questionMode: "operation_estimation",
    questionCount: 8,
  }));
  assert.equal(estimation.ok, true, JSON.stringify(estimation.errors));
  assert.equal(estimation.worksheetDocument.rendererProfile.profileId, G4B_U04_RENDERER_PROFILES.contextual.profileId);
});

test("S73 uses the inverse-long profile for possible-original-value reasoning", () => {
  const result = buildBatchABrowserWorksheetDocument(baseOptions({
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_inverse_rounding_possible_original"],
    selectedPatternGroupIds: ["pg_g4b_u04_inverse_original_values"],
    questionMode: "reasoning",
    questionCount: 4,
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.rendererProfile.profileId, G4B_U04_RENDERER_PROFILES.inverseLong.profileId);
  assert.equal(result.worksheetDocument.printOptions.columns, 1);
  assert.equal(result.worksheetDocument.printOptions.rowsPerPage, 4);
});

test("S73 suppresses every answer record and answer page when answer key is disabled", () => {
  const result = buildBatchABrowserWorksheetDocument(baseOptions({
    includeAnswerKey: false,
    printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: false },
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.deepEqual(result.worksheetDocument.answerKeyItems, []);
  assert.deepEqual(result.worksheetDocument.answerKeyPages, []);
  assert.equal(result.worksheetDocument.printOptions.showAnswerKey, false);
  assert.equal(result.worksheetDocument.printOptions.answerKeyPlacement, "none");
});

test("S73 renderer emits Traditional Chinese worksheet and answer pages for all nine answer shapes", () => {
  const result = buildBatchABrowserWorksheetDocument(baseOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.match(html, /worksheet-renderer--g4b-u04/);
  assert.match(html, /概數判讀、取概數、生活應用、估算與逆推/);
  assert.match(html, /答案頁/);
  for (const shape of G4B_U04_WORKSHEET_ANSWER_SHAPES) {
    assert.match(html, new RegExp(`data-answer-shape="${shape}"`));
  }
  assert.doesNotMatch(html, /\b(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_[a-z0-9_]+\b/i);
  assert.equal(G4B_U04_RENDERER_INTEGRATION.internalIdVisible, false);
});

test("S73 renderer delegates unchanged for non-G4B-U04 documents", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: "g3a_u02_3a02",
    selectionMode: "sourceUnit",
    questionCount: 6,
    ordering: "groupedByPattern",
    generationSeed: "s73-delegation",
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.rendererProfile?.profileId?.startsWith("g4b_u04_"), false);
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, { stylesheetHref: "" });
  assert.doesNotMatch(html, /worksheet-renderer--g4b-u04/);
});

test("S73 invalid G4B-U04 public selection produces no WorksheetDocument", () => {
  const result = buildBatchABrowserWorksheetDocument(baseOptions({
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g4b_u04_round_half_up_place_value"],
    selectedPatternGroupIds: ["pg_g4b_u04_payment_ceiling"],
    questionMode: "numeric",
    questionCount: 6,
  }));
  assert.equal(result.ok, false);
  assert.equal(result.worksheetDocument, null);
  assert.equal((result.errors ?? []).length > 0, true);
});

test("S73 contract preserves preview-only lifecycle and stops before HTML/PDF smoke", () => {
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));
  assert.equal(["implemented_pending_ci", "pass_ci_synced_and_merged"].includes(contract.status), true);
  assert.equal(contract.lifecycle.worksheetStatus, "worksheet_eligible");
  assert.equal(contract.lifecycle.answerKeyStatus, "answer_key_integrated");
  assert.equal(contract.lifecycle.rendererStatus, "worksheet_renderer_integrated");
  assert.equal(contract.lifecycle.productionUse, "preview_only_pending_s75");
  assert.equal(contract.activation.htmlPdfSmokeAdded, false);
  assert.equal(contract.activation.requiredNextGate, "S74_G4B_U04_PublicUIPrintAndQueryStateQA");
  assert.equal(G4B_U04_WORKSHEET_LIFECYCLE.productionUse, "preview_only_pending_s75");
});
