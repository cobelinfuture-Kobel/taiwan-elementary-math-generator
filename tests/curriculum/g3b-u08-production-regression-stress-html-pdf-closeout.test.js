import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import {
  buildBatchABrowserWorksheetDocument as buildPreviousWorksheet
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s57f5-extension.js";
import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s58h-extension.js";
import {
  generateG3BU08CanonicalSemanticQuestions
} from "../../site/modules/curriculum/batch-a/g3b-u08-canonical-semantic-router.js";
import {
  validateBatchABrowserQuestion
} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-s58h-extension.js";
import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_PATTERN_GROUP_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U08_SEMANTIC_PROMOTION_ACTIVATION,
  validateG3BU08SemanticPromotionProjection
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  G3B_U08_PRODUCTION_PROMOTION_ACTIVATION,
  validateG3BU08ProductionPromotionProjection
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-production-promotion.js";
import {
  G3B_U08_SEMANTIC_BLOCKING_CODES,
  G3B_U08_SEMANTIC_WARNING_CODES,
  G3B_U08_SEMANTIC_VALIDATOR_VERSION
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
import {
  listG3BU08SemanticContextVariantsForPatternSpec
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-context-registry.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3b_u08_3b08";
const ARTIFACT_HTML = new URL(
  "../../docs/curriculum/output/smoke/S58J_G3B_U08_PublicSemanticWorksheet.html",
  import.meta.url
);
const ARTIFACT_PDF = new URL(
  "../../docs/curriculum/output/smoke/S58J_G3B_U08_PublicSemanticWorksheet.pdf",
  import.meta.url
);
const ARTIFACT_MANIFEST = new URL(
  "../../docs/curriculum/output/smoke/S58J_G3B_U08_PublicSemanticWorksheet.manifest.json",
  import.meta.url
);

function allSemanticOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G3B_U08_PROMOTED_PATTERN_GROUP_IDS],
    questionCount: 72,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s58j-public-production-gate",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
    ...overrides
  };
}

function singleSemanticOptions(overrides = {}) {
  return allSemanticOptions({
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS[0]],
    selectedPatternGroupIds: [G3B_U08_PROMOTED_PATTERN_GROUP_IDS[0]],
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
  return values.length === 0 ? 0 : Math.max(...values) - Math.min(...values);
}

test("S58J accepts final base and worksheet-overlay production promotion", () => {
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.status, "production_promotion_accepted");
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.requiredNextGate, null);
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.finalStressAccepted, true);
  assert.equal(G3B_U08_SEMANTIC_PROMOTION_ACTIVATION.finalHtmlPdfSmokeAccepted, true);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.status, "production_promotion_accepted");
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.requiredNextGate, null);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicSelectorAndPrintQaAccepted, true);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.finalHtmlPdfPromotionAccepted, true);
  const base = validateG3BU08SemanticPromotionProjection();
  const overlay = validateG3BU08ProductionPromotionProjection();
  assert.equal(base.ok, true, JSON.stringify(base.errors));
  assert.equal(overlay.ok, true, JSON.stringify(overlay.errors));
  assert.deepEqual(base.counts, { knowledgePoints: 6, patternGroups: 6, patternSpecs: 24 });
  assert.deepEqual(overlay.counts, { knowledgePoints: 6, patternGroups: 6, patternSpecs: 24 });
});

test("S58J public count matrix preserves exact counts and blocks requests above 200", () => {
  for (const questionCount of [1, 6, 24, 72, 200]) {
    const document = buildPublic(allSemanticOptions({
      questionCount,
      generationSeed: `s58j-count-${questionCount}`
    }));
    assert.equal(document.summary.questionCount, questionCount);
    assert.equal(document.generatedQuestions.length, questionCount);
    assert.equal(document.batchA.allocation.reduce((sum, entry) => sum + entry.questionCount, 0), questionCount);
    assert.equal(document.validationSummary.ok, true);
    assert.equal(document.productionUse, "allowed");
    assert.equal(document.visibilityStatus, "visible");
  }

  for (const overLimit of [201, 257, 600, 1000]) {
    const rejected = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: overLimit }));
    assert.equal(rejected.ok, false);
    assert.equal(rejected.worksheetDocument, null);
    assert.equal(
      rejected.errors.some((error) => error.code === "G3B_U08_PRODUCTION_QUESTION_COUNT_INVALID"),
      true
    );
  }
});

test("S58J completes aggregate 1000-question stress with 24-family and 72-context reachability", () => {
  const expectedFamilies = new Set(G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS);
  const expectedContexts = new Set(G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.flatMap((patternSpecId) => (
    listG3BU08SemanticContextVariantsForPatternSpec(patternSpecId).map((variant) => variant.contextVariantId)
  )));
  const reachedFamilies = new Set();
  const reachedContexts = new Set();
  let generatedTotal = 0;

  assert.equal(expectedContexts.size, 72);
  for (let batchIndex = 0; batchIndex < 5; batchIndex += 1) {
    const document = buildPublic(allSemanticOptions({
      questionCount: 200,
      generationSeed: `s58j-public-stress-${batchIndex + 1}`
    }));
    generatedTotal += document.generatedQuestions.length;

    const groupCounts = new Map();
    const familyCountsByGroup = new Map();
    for (const question of document.generatedQuestions) {
      assert.equal(question.kind, "g3bU08SemanticApplication");
      assert.equal(question.selectorStatus, "visible");
      assert.equal(question.productionUse, "allowed");
      assert.equal(question.representation, "horizontal_only");
      assert.equal(question.canonicalRoute.publicHiddenModeFlagUsed, false);
      assert.equal(question.semanticSnapshot.resolverDerived, true);
      assert.equal(validateBatchABrowserQuestion(question).ok, true);
      assert.doesNotMatch(question.promptText, /直式|長除法/);

      reachedFamilies.add(question.patternSpecId);
      reachedContexts.add(question.contextVariantId);
      groupCounts.set(question.resolvedPatternGroupId, (groupCounts.get(question.resolvedPatternGroupId) ?? 0) + 1);
      const familyCounts = familyCountsByGroup.get(question.resolvedPatternGroupId) ?? new Map();
      familyCounts.set(question.patternSpecId, (familyCounts.get(question.patternSpecId) ?? 0) + 1);
      familyCountsByGroup.set(question.resolvedPatternGroupId, familyCounts);
    }

    assert.equal(groupCounts.size, 6);
    assert.equal(spread([...groupCounts.values()]) <= 1, true);
    for (const familyCounts of familyCountsByGroup.values()) {
      assert.equal(spread([...familyCounts.values()]) <= 1, true);
    }
  }

  assert.equal(generatedTotal, 1000);
  assert.deepEqual(reachedFamilies, expectedFamilies);
  assert.deepEqual(reachedContexts, expectedContexts);
});

test("S58J keeps deterministic replay and shuffle membership invariants", () => {
  const groupedA = buildPublic(allSemanticOptions({
    questionCount: 72,
    generationSeed: "s58j-determinism",
    ordering: "groupedByPattern"
  }));
  const groupedB = buildPublic(allSemanticOptions({
    questionCount: 72,
    generationSeed: "s58j-determinism",
    ordering: "groupedByPattern"
  }));
  assert.deepEqual(groupedA.generatedQuestions, groupedB.generatedQuestions);

  const shuffled = buildPublic(allSemanticOptions({
    questionCount: 72,
    generationSeed: "s58j-determinism",
    ordering: "shuffleAcrossPatterns"
  }));
  const groupedIds = groupedA.generatedQuestions.map((question) => question.id);
  const shuffledIds = shuffled.generatedQuestions.map((question) => question.id);
  assert.deepEqual([...shuffledIds].sort(), [...groupedIds].sort());
  assert.notDeepEqual(shuffledIds, groupedIds);
});

test("S58J preserves all 44 blocking codes with no fallback output", () => {
  assert.equal(G3B_U08_SEMANTIC_BLOCKING_CODES.length, 44);
  const plan = buildBatchABrowserPlan(singleSemanticOptions());
  assert.equal(plan.resolverResult.ok, true, JSON.stringify(plan.resolverResult.errors));

  for (const code of G3B_U08_SEMANTIC_BLOCKING_CODES) {
    const result = generateG3BU08CanonicalSemanticQuestions(plan, {
      validator() {
        return {
          valid: false,
          blockingErrors: [{ code, severity: "error", path: "semantic", message: `blocking:${code}` }],
          warnings: [],
          validatorVersion: G3B_U08_SEMANTIC_VALIDATOR_VERSION
        };
      }
    });
    assert.equal(result.ok, false, code);
    assert.equal(result.questions.length, 0, code);
    assert.equal(result.errors.some((error) => error.code === code), true, code);
  }
});

test("S58J retains all three semantic style warnings as nonblocking output", () => {
  assert.equal(G3B_U08_SEMANTIC_WARNING_CODES.length, 3);
  const plan = buildBatchABrowserPlan(singleSemanticOptions());
  const result = generateG3BU08CanonicalSemanticQuestions(plan, {
    validator() {
      return {
        valid: true,
        blockingErrors: [],
        warnings: G3B_U08_SEMANTIC_WARNING_CODES.map((code) => ({
          code,
          severity: "warning",
          path: "promptText",
          message: code
        })),
        validatorVersion: G3B_U08_SEMANTIC_VALIDATOR_VERSION
      };
    }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 1);
  assert.deepEqual(new Set(result.warnings.map((warning) => warning.code)), new Set(G3B_U08_SEMANTIC_WARNING_CODES));
  assert.deepEqual(new Set(result.questions[0].semanticSnapshot.validationCodes), new Set(G3B_U08_SEMANTIC_WARNING_CODES));
});

test("S58J keeps every source-unit route delegated byte-for-byte to the pre-S58H worksheet path", () => {
  const sources = listBatchASourceUnits();
  assert.equal(sources.length >= 13, true);
  for (const source of sources) {
    const options = {
      sourceId: source.sourceId,
      questionCount: 3,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `s58j-source-regression:${source.sourceId}`,
      printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
    };
    const previous = buildPreviousWorksheet(options);
    const extended = buildBatchABrowserWorksheetDocument(options);
    assert.deepEqual(extended, previous, source.sourceId);
    assert.equal(extended.ok, true, `${source.sourceId}: ${JSON.stringify(extended.errors)}`);
  }
});

test("S58J committed public HTML/PDF smoke is complete, deterministic and visually rendered", () => {
  assert.equal(existsSync(ARTIFACT_HTML), true);
  assert.equal(existsSync(ARTIFACT_PDF), true);
  assert.equal(existsSync(ARTIFACT_MANIFEST), true);

  const html = readFileSync(ARTIFACT_HTML, "utf8");
  const pdf = readFileSync(ARTIFACT_PDF);
  const manifest = JSON.parse(readFileSync(ARTIFACT_MANIFEST, "utf8"));

  assert.equal(manifest.status, "public_html_pdf_smoke_pass");
  assert.equal(manifest.canonicalPublicPath, true);
  assert.equal(manifest.applicationOnly, true);
  assert.equal(manifest.horizontalOnly, true);
  assert.equal(manifest.publicHiddenModeFlagUsed, false);
  assert.equal(manifest.publicNumericModeUsed, false);
  assert.equal(manifest.representationToggleUsed, false);
  assert.equal(manifest.questionCount, 72);
  assert.equal(manifest.answerKeyItemCount, 72);
  assert.equal(manifest.questionPageCount, 9);
  assert.equal(manifest.answerKeyPageCount, 9);
  assert.equal(manifest.expectedPdfPageCount, 18);
  assert.equal(manifest.actualPdfPageCount, 18);
  assert.equal(manifest.visibleKnowledgePointCount, 6);
  assert.equal(manifest.visibleSemanticPatternGroupCount, 6);
  assert.equal(manifest.templateFamilyCount, 24);
  assert.equal(manifest.familyContextVariantCount, 72);
  assert.equal(manifest.reachedContextVariantCount, 72);
  assert.equal(manifest.semanticValidationErrorCount, 0);
  assert.equal(manifest.internalIdLeakCount, 0);
  assert.equal(manifest.unresolvedPlaceholderCount, 0);
  assert.equal(manifest.rendererProfileId, "g3b_u08_semantic_long_text_v1");
  assert.deepEqual(manifest.questionLayout, { columns: 2, rowsPerPage: 4 });
  assert.deepEqual(manifest.answerKeyLayout, { columns: 1, rowsPerPage: 8 });
  assert.equal(manifest.longTextCardPolicy, "avoidSplit");
  assert.equal(manifest.pageBreakMode, "avoidLongTextCards");
  assert.equal(manifest.renderedPageImageCount, 18);
  assert.equal(manifest.extractedEquationLabelCount, 72);
  assert.equal(manifest.extractedAnswerLabelCount, 72);
  assert.equal(manifest.visualRenderVerification, "all_pages_rendered_nonblank");

  assert.equal(sha256(Buffer.from(html, "utf8")), manifest.htmlSha256);
  assert.equal(sha256(pdf), manifest.pdfSha256);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.equal(statSync(ARTIFACT_PDF).size, manifest.pdfBytes);
  assert.equal(manifest.pdfBytes >= 20000, true);

  assert.equal(countOccurrences(html, 'class="worksheet-page worksheet-page--questions'), 9);
  assert.equal(countOccurrences(html, 'class="worksheet-page worksheet-page--answer-key'), 9);
  assert.equal(countOccurrences(html, 'class="worksheet-cell worksheet-cell--question"'), 72);
  assert.equal(countOccurrences(html, 'class="worksheet-cell worksheet-cell--answer-key"'), 72);
  assert.match(html, /data-renderer-profile="g3b_u08_semantic_long_text_v1"/);
  assert.match(html, /break-inside: avoid/);
  assert.match(html, /算式：/);
  assert.match(html, /答案：/);

  for (const forbidden of [
    "kp_g3b_u08_",
    "pg_g3b_u08_",
    "ps_g3b_u08_",
    "tpl_g3b_u08_",
    "ctx_g3b_u08_",
    "hiddenSemanticMode",
    "g3bU08Semantic",
    "直式",
    "長除法",
    "{{",
    "}}"
  ]) {
    assert.equal(html.includes(forbidden), false, forbidden);
  }
});
