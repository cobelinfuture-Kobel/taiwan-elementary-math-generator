import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { buildBatchABrowserWorksheetDocument as buildBaseWorksheet } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s57f5-extension.js";
import {
  generateG3BU04CanonicalSemanticQuestions
} from "../../site/modules/curriculum/batch-a/g3b-u04-canonical-semantic-router.js";
import {
  validateBatchABrowserQuestion
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-s57f5-extension.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U04_SEMANTIC_PROMOTION_ACTIVATION,
  validateG3BU04SemanticPromotionProjection
} from "../../site/modules/curriculum/registry/g3b-u04-semantic-promotion.js";
import {
  G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES,
  G3B_U04_SEMANTIC_WARNING_CODES
} from "../../site/modules/curriculum/batch-a/g3b-u04-semantic-validator.js";
import {
  listG3BU04SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u04-semantic-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3b_u04_3b04";
const ARTIFACT_HTML = new URL(
  "../../docs/curriculum/output/smoke/S57F7_G3B_U04_PublicSemanticWorksheet.html",
  import.meta.url
);
const ARTIFACT_PDF = new URL(
  "../../docs/curriculum/output/smoke/S57F7_G3B_U04_PublicSemanticWorksheet.pdf",
  import.meta.url
);
const ARTIFACT_MANIFEST = new URL(
  "../../docs/curriculum/output/smoke/S57F7_G3B_U04_PublicSemanticWorksheet.manifest.json",
  import.meta.url
);

function semanticGroupIdsForKnowledgePoints(knowledgePointIds) {
  return knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.representationTag === "application_word_problem")
      .map((group) => group.patternGroupId)
  ));
}

const ALL_SEMANTIC_GROUP_IDS = semanticGroupIdsForKnowledgePoints(G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS);

function allSemanticOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: ALL_SEMANTIC_GROUP_IDS,
    questionCount: 64,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s57f7-public-production-gate",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
    ...overrides
  };
}

function singleSemanticOptions(overrides = {}) {
  const knowledgePointId = G3B_U04_PROMOTED_KNOWLEDGE_POINT_IDS[0];
  return allSemanticOptions({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: semanticGroupIdsForKnowledgePoints([knowledgePointId]),
    questionCount: 1,
    ...overrides
  });
}

function buildPublic(options) {
  const result = buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.ok(result.worksheetDocument);
  return result.worksheetDocument;
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

function countOccurrences(text, token) {
  return text.split(token).length - 1;
}

function spread(values) {
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

test("S57F7 accepts the final promotion boundary without mutating semantic authority", () => {
  assert.equal(G3B_U04_SEMANTIC_PROMOTION_ACTIVATION.status, "production_promotion_accepted");
  assert.equal(G3B_U04_SEMANTIC_PROMOTION_ACTIVATION.requiredNextGate, null);
  assert.equal(G3B_U04_SEMANTIC_PROMOTION_ACTIVATION.finalStressAccepted, true);
  assert.equal(G3B_U04_SEMANTIC_PROMOTION_ACTIVATION.finalHtmlPdfSmokeAccepted, true);
  const projection = validateG3BU04SemanticPromotionProjection();
  assert.equal(projection.ok, true, JSON.stringify(projection.errors));
  assert.deepEqual(projection.counts, { knowledgePoints: 9, patternGroups: 9, patternSpecs: 32 });
});

test("S57F7 public count matrix preserves exact requested counts through the canonical worksheet path", () => {
  for (const questionCount of [1, 9, 32, 64, 200]) {
    const document = buildPublic(allSemanticOptions({
      questionCount,
      generationSeed: `s57f7-count-${questionCount}`
    }));
    assert.equal(document.summary.questionCount, questionCount);
    assert.equal(document.generatedQuestions.length, questionCount);
    assert.equal(document.batchA.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), questionCount);
    assert.equal(document.validationSummary.ok, true);
    assert.equal(document.productionUse, "allowed");
    assert.equal(document.visibilityStatus, "visible");
  }

  for (const overLimit of [201, 257, 640, 1000]) {
    const rejected = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: overLimit }));
    assert.equal(rejected.ok, false);
    assert.equal(rejected.worksheetDocument, null);
    assert.equal(
      rejected.errors.some((error) => error.code === "G3B_U04_PRODUCTION_QUESTION_COUNT_INVALID"),
      true
    );
  }
});

test("S57F7 completes an aggregate 1000-question public stress with 32-family and 117 family-context reachability", () => {
  const definitions = listG3BU04SemanticPatternDefinitions();
  const expectedFamilies = new Set(definitions.map((definition) => definition.patternSpecId));
  const expectedFamilyContexts = new Set(definitions.flatMap((definition) => (
    definition.contextDomains.map((contextDomain) => `${definition.patternSpecId}::${contextDomain}`)
  )));
  const reachedFamilies = new Set();
  const reachedFamilyContexts = new Set();
  let generatedTotal = 0;

  for (let batchIndex = 0; batchIndex < 5; batchIndex += 1) {
    const document = buildPublic(allSemanticOptions({
      questionCount: 200,
      generationSeed: `s57f7-public-stress-${batchIndex + 1}`
    }));
    generatedTotal += document.generatedQuestions.length;

    const groupCounts = new Map();
    const familyCountsByGroup = new Map();
    for (const question of document.generatedQuestions) {
      assert.equal(question.kind, "g3bU04SemanticWordProblem");
      assert.equal(question.selectorStatus, "visible");
      assert.equal(question.productionUse, "allowed");
      assert.equal(question.canonicalRoute.publicHiddenModeFlagUsed, false);
      assert.equal(question.semanticSnapshot.resolverDerived, true);
      assert.equal(validateBatchABrowserQuestion(question).ok, true);

      reachedFamilies.add(question.patternSpecId);
      reachedFamilyContexts.add(`${question.patternSpecId}::${question.contextDomain}`);
      groupCounts.set(question.resolvedPatternGroupId, (groupCounts.get(question.resolvedPatternGroupId) ?? 0) + 1);
      const familyCounts = familyCountsByGroup.get(question.resolvedPatternGroupId) ?? new Map();
      familyCounts.set(question.patternSpecId, (familyCounts.get(question.patternSpecId) ?? 0) + 1);
      familyCountsByGroup.set(question.resolvedPatternGroupId, familyCounts);
    }

    assert.equal(groupCounts.size, 9);
    assert.equal(spread([...groupCounts.values()]) <= 1, true);
    for (const familyCounts of familyCountsByGroup.values()) {
      assert.equal(spread([...familyCounts.values()]) <= 1, true);
    }
  }

  assert.equal(generatedTotal, 1000);
  assert.deepEqual(reachedFamilies, expectedFamilies);
  assert.deepEqual(reachedFamilies, new Set(G3B_U04_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS));
  assert.equal(expectedFamilyContexts.size, 117);
  assert.deepEqual(reachedFamilyContexts, expectedFamilyContexts);
});

test("S57F7 keeps deterministic replay and shuffle membership invariants", () => {
  const groupedA = buildPublic(allSemanticOptions({
    questionCount: 64,
    generationSeed: "s57f7-determinism",
    ordering: "groupedByPattern"
  }));
  const groupedB = buildPublic(allSemanticOptions({
    questionCount: 64,
    generationSeed: "s57f7-determinism",
    ordering: "groupedByPattern"
  }));
  assert.deepEqual(groupedA.generatedQuestions, groupedB.generatedQuestions);

  const shuffled = buildPublic(allSemanticOptions({
    questionCount: 64,
    generationSeed: "s57f7-determinism",
    ordering: "shuffleAcrossPatterns"
  }));
  const groupedIds = groupedA.generatedQuestions.map((question) => question.id);
  const shuffledIds = shuffled.generatedQuestions.map((question) => question.id);
  assert.deepEqual([...shuffledIds].sort(), [...groupedIds].sort());
  assert.notDeepEqual(shuffledIds, groupedIds);
});

test("S57F7 preserves all 25 semantic blocking codes through the canonical router with no fallback output", () => {
  assert.equal(G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES.length, 25);
  const plan = buildBatchABrowserPlan(singleSemanticOptions());
  assert.equal(plan.resolverResult.ok, true, JSON.stringify(plan.resolverResult.errors));

  for (const code of G3B_U04_SEMANTIC_BLOCKING_ERROR_CODES) {
    const result = generateG3BU04CanonicalSemanticQuestions(plan, {
      validator() {
        return {
          ok: false,
          errors: [{ code, severity: "error", path: "semantic", message: `blocking:${code}` }],
          warnings: []
        };
      }
    });
    assert.equal(result.ok, false, code);
    assert.equal(result.questions.length, 0, code);
    assert.equal(result.errors.some((error) => error.code === code), true, code);
  }
});

test("S57F7 retains all three style warnings as nonblocking canonical output", () => {
  assert.equal(G3B_U04_SEMANTIC_WARNING_CODES.length, 3);
  const plan = buildBatchABrowserPlan(singleSemanticOptions());
  const result = generateG3BU04CanonicalSemanticQuestions(plan, {
    validator(question) {
      return {
        ok: true,
        errors: [],
        warnings: G3B_U04_SEMANTIC_WARNING_CODES.map((code) => ({
          code,
          severity: "warning",
          path: "promptText",
          message: code
        })),
        stages: [],
        semanticErrorsAreBlocking: true,
        styleWarningsAreBlocking: false,
        validatorVersion: "s57e5-g3b-u04-semantic-validator-v1",
        question
      };
    }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 1);
  assert.deepEqual(new Set(result.warnings.map((warning) => warning.code)), new Set(G3B_U04_SEMANTIC_WARNING_CODES));
  assert.deepEqual(new Set(result.questions[0].semanticSnapshot.validationCodes), new Set(G3B_U04_SEMANTIC_WARNING_CODES));
});

test("S57F7 keeps every source-unit route delegated byte-for-byte to the pre-semantic worksheet path", () => {
  const sources = listBatchASourceUnits();
  assert.equal(sources.length, 13);
  for (const source of sources) {
    const options = {
      sourceId: source.sourceId,
      questionCount: 3,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `s57f7-source-regression:${source.sourceId}`,
      printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
    };
    const base = buildBaseWorksheet(options);
    const extended = buildBatchABrowserWorksheetDocument(options);
    assert.deepEqual(extended, base, source.sourceId);
    assert.equal(extended.ok, true, `${source.sourceId}: ${JSON.stringify(extended.errors)}`);
  }
});

test("S57F7 committed public HTML/PDF smoke is complete, deterministic, and free of public internal-ID leakage", () => {
  assert.equal(existsSync(ARTIFACT_HTML), true);
  assert.equal(existsSync(ARTIFACT_PDF), true);
  assert.equal(existsSync(ARTIFACT_MANIFEST), true);

  const html = readFileSync(ARTIFACT_HTML, "utf8");
  const pdf = readFileSync(ARTIFACT_PDF);
  const manifest = JSON.parse(readFileSync(ARTIFACT_MANIFEST, "utf8"));

  assert.equal(manifest.status, "public_html_pdf_smoke_pass");
  assert.equal(manifest.canonicalPublicPath, true);
  assert.equal(manifest.publicHiddenModeFlagUsed, false);
  assert.equal(manifest.questionCount, 64);
  assert.equal(manifest.answerKeyItemCount, 64);
  assert.equal(manifest.questionPageCount, 8);
  assert.equal(manifest.answerKeyPageCount, 8);
  assert.equal(manifest.expectedPdfPageCount, 16);
  assert.equal(manifest.actualPdfPageCount, 16);
  assert.equal(manifest.visibleKnowledgePointCount, 9);
  assert.equal(manifest.visibleSemanticPatternGroupCount, 9);
  assert.equal(manifest.templateFamilyCount, 32);
  assert.equal(manifest.familyContextVariantCount, 117);
  assert.equal(manifest.semanticValidationErrorCount, 0);
  assert.equal(manifest.internalIdLeakCount, 0);
  assert.equal(manifest.unresolvedPlaceholderCount, 0);
  assert.equal(manifest.rendererProfileId, "g3b_u04_semantic_long_text_v1");
  assert.deepEqual(manifest.questionLayout, { columns: 2, rowsPerPage: 4 });
  assert.deepEqual(manifest.answerKeyLayout, { columns: 1, rowsPerPage: 8 });
  assert.equal(manifest.longTextCardPolicy, "avoidSplit");
  assert.equal(manifest.pageBreakMode, "avoidLongTextCards");
  assert.equal(manifest.renderedPageImageCount, 16);
  assert.equal(manifest.extractedEquationLabelCount, 64);
  assert.equal(manifest.extractedAnswerLabelCount, 64);

  assert.equal(sha256(Buffer.from(html, "utf8")), manifest.htmlSha256);
  assert.equal(sha256(pdf), manifest.pdfSha256);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.equal(statSync(ARTIFACT_PDF).size, manifest.pdfBytes);
  assert.equal(manifest.pdfBytes >= 20000, true);

  assert.equal(countOccurrences(html, 'class="worksheet-page worksheet-page--questions'), 8);
  assert.equal(countOccurrences(html, 'class="worksheet-page worksheet-page--answer-key'), 8);
  assert.equal(countOccurrences(html, 'class="worksheet-cell worksheet-cell--question"'), 64);
  assert.equal(countOccurrences(html, 'class="worksheet-cell worksheet-cell--answer-key"'), 64);
  assert.match(html, /data-renderer-profile="g3b_u04_semantic_long_text_v1"/);
  assert.match(html, /break-inside: avoid/);
  assert.match(html, /算式：/);
  assert.match(html, /答案：/);

  for (const forbidden of [
    "kp_g3b_u04_",
    "pg_g3b_u04_",
    "ps_g3b_u04_",
    "tpl_g3b_u04_",
    "hiddenSemanticMode",
    "g3b_u04_hidden_semantic",
    "{{",
    "}}"
  ]) {
    assert.equal(html.includes(forbidden), false, forbidden);
  }
});
