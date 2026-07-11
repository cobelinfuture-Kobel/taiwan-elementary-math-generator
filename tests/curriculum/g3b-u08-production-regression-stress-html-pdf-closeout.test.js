import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import {
  buildBatchABrowserWorksheetDocument as buildPreviousWorksheetDocument
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
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  G3B_U08_PRODUCTION_PROMOTION_ACTIVATION,
  validateG3BU08ProductionPromotionProjection
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-production-promotion.js";
import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  G3B_U08_SEMANTIC_BLOCKING_CODES,
  G3B_U08_SEMANTIC_WARNING_CODES
} from "../../site/modules/curriculum/batch-a/g3b-u08-semantic-validator.js";
import {
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";
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

function semanticGroupIdsForKnowledgePoints(knowledgePointIds) {
  return knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.representationTag === "application_word_problem")
      .map((group) => group.patternGroupId)
  ));
}

const ALL_SEMANTIC_GROUP_IDS = semanticGroupIdsForKnowledgePoints(
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS
);

function allSemanticOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds: ALL_SEMANTIC_GROUP_IDS,
    questionCount: 48,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s58j-public-production-gate",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
    ...overrides
  };
}

function singleSemanticOptions(overrides = {}) {
  const knowledgePointId = G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS[0];
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

test("S58J accepts final G3B-U08 production promotion without mutating hidden semantic authority", () => {
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.status, "production_promotion_accepted");
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.acceptedByTask, "S58J_G3B_U08_ProductionRegressionStressHTMLPDFPromotionCloseout");
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.requiredNextGate, null);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicSelectorAndPrintQaAccepted, true);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.finalStressAccepted, true);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.finalHtmlPdfSmokeAccepted, true);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.finalHtmlPdfPromotionAccepted, true);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicNumericModeAdded, false);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.representationToggleAdded, false);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.publicHiddenModeFlagAdded, false);
  assert.equal(G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.crossUnitSelectorAdded, false);
  const projection = validateG3BU08ProductionPromotionProjection();
  assert.equal(projection.ok, true, JSON.stringify(projection.errors));
  assert.deepEqual(projection.counts, { knowledgePoints: 6, patternGroups: 6, patternSpecs: 24 });
  for (const definition of listG3BU08SemanticPatternDefinitions()) {
    assert.equal(definition.selectorStatus, "hidden");
    assert.equal(definition.productionUse, "forbidden");
  }
});

test("S58J public count matrix preserves exact requested counts and rejects requests above 200", () => {
  for (const questionCount of [1, 6, 24, 48, 200]) {
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
    assert.equal(document.summary.numericQuestionCount, 0);
  }

  for (const overLimit of [201, 257, 480, 1000]) {
    const rejected = buildBatchABrowserWorksheetDocument(allSemanticOptions({ questionCount: overLimit }));
    assert.equal(rejected.ok, false);
    assert.equal(rejected.worksheetDocument, null);
    assert.equal(
      rejected.errors.some((error) => error.code === "G3B_U08_PRODUCTION_QUESTION_COUNT_INVALID"),
      true
    );
  }
});

test("S58J completes aggregate 1000-question public stress with 24-family and 56 family-context reachability", () => {
  const definitions = listG3BU08SemanticPatternDefinitions();
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
      generationSeed: `s58j-public-stress-${batchIndex + 1}`
    }));
    generatedTotal += document.generatedQuestions.length;

    const groupCounts = new Map();
    const familyCountsByGroup = new Map();
    for (const question of document.generatedQuestions) {
      assert.equal(question.kind, "g3bU08SemanticApplication");
      assert.equal(question.phase, "S58H");
      assert.equal(question.selectorStatus, "visible");
      assert.equal(question.productionUse, "allowed");
      assert.equal(question.representation, "horizontal_only");
      assert.equal(question.canonicalRoute.publicHiddenModeFlagUsed, false);
      assert.equal(question.semanticSnapshot.resolverDerived, true);
      assert.equal(validateBatchABrowserQuestion(question).ok, true);

      reachedFamilies.add(question.patternSpecId);
      reachedFamilyContexts.add(`${question.patternSpecId}::${question.contextDomain}`);
      const groupId = question.resolvedPatternGroupId;
      groupCounts.set(groupId, (groupCounts.get(groupId) ?? 0) + 1);
      const familyCounts = familyCountsByGroup.get(groupId) ?? new Map();
      familyCounts.set(question.patternSpecId, (familyCounts.get(question.patternSpecId) ?? 0) + 1);
      familyCountsByGroup.set(groupId, familyCounts);
    }

    assert.equal(groupCounts.size, 6);
    assert.equal(spread([...groupCounts.values()]) <= 1, true);
    for (const familyCounts of familyCountsByGroup.values()) {
      assert.equal(spread([...familyCounts.values()]) <= 1, true);
    }
  }

  assert.equal(generatedTotal, 1000);
  assert.deepEqual(reachedFamilies, expectedFamilies);
  assert.deepEqual(reachedFamilies, new Set(G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS));
  assert.equal(expectedFamilyContexts.size, 56);
  assert.deepEqual(reachedFamilyContexts, expectedFamilyContexts);
});

test("S58J keeps deterministic replay and shuffle membership invariants", () => {
  const groupedA = buildPublic(allSemanticOptions({
    questionCount: 48,
    generationSeed: "s58j-determinism",
    ordering: "groupedByPattern"
  }));
  const groupedB = buildPublic(allSemanticOptions({
    questionCount: 48,
    generationSeed: "s58j-determinism",
    ordering: "groupedByPattern"
  }));
  assert.deepEqual(groupedA.generatedQuestions, groupedB.generatedQuestions);

  const shuffled = buildPublic(allSemanticOptions({
    questionCount: 48,
    generationSeed: "s58j-determinism",
    ordering: "shuffleAcrossPatterns"
  }));
  const groupedIds = groupedA.generatedQuestions.map((question) => question.id);
  const shuffledIds = shuffled.generatedQuestions.map((question) => question.id);
  assert.deepEqual([...shuffledIds].sort(), [...groupedIds].sort());
  assert.notDeepEqual(shuffledIds, groupedIds);
});

test("S58J preserves all 45 semantic blocking codes through the canonical router with no fallback output", () => {
  assert.equal(G3B_U08_SEMANTIC_BLOCKING_CODES.length, 45);
  const plan = buildBatchABrowserPlan(singleSemanticOptions());
  assert.equal(plan.resolverResult.ok, true, JSON.stringify(plan.resolverResult.errors));

  for (const code of G3B_U08_SEMANTIC_BLOCKING_CODES) {
    const result = generateG3BU08CanonicalSemanticQuestions(plan, {
      validator() {
        return {
          valid: false,
          blockingErrors: [{ code, severity: "error", path: "semantic", message: `blocking:${code}` }],
          warnings: [],
          stageResults: [],
          validatorVersion: "s58j-blocking-code-fixture"
        };
      }
    });
    assert.equal(result.ok, false, code);
    assert.equal(result.questions.length, 0, code);
    assert.equal(result.errors.some((error) => error.code === code), true, code);
  }
});

test("S58J retains all three style warnings as nonblocking canonical output", () => {
  assert.equal(G3B_U08_SEMANTIC_WARNING_CODES.length, 3);
  const plan = buildBatchABrowserPlan(singleSemanticOptions());
  const result = generateG3BU08CanonicalSemanticQuestions(plan, {
    validator(question) {
      return {
        valid: true,
        blockingErrors: [],
        warnings: G3B_U08_SEMANTIC_WARNING_CODES.map((code) => ({
          code,
          severity: "warning",
          path: "promptText",
          message: code
        })),
        stageResults: [],
        semanticErrorsAreBlocking: true,
        styleWarningsAreBlocking: false,
        validatorVersion: "s58j-warning-fixture",
        question
      };
    }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 1);
  assert.deepEqual(new Set(result.warnings.map((warning) => warning.code)), new Set(G3B_U08_SEMANTIC_WARNING_CODES));
  assert.deepEqual(new Set(result.questions[0].semanticSnapshot.validationCodes), new Set(G3B_U08_SEMANTIC_WARNING_CODES));
});

test("S58J keeps every Batch A source-unit route delegated byte-for-byte to the pre-G3B-U08 worksheet path", () => {
  const sources = listBatchASourceUnits();
  assert.equal(sources.length, 13);
  for (const source of sources) {
    const options = {
      sourceId: source.sourceId,
      questionCount: 3,
      ordering: "groupedByPattern",
      includeAnswerKey: true,
      generationSeed: `s58j-source-regression:${source.sourceId}`,
      printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
    };
    const previous = buildPreviousWorksheetDocument(options);
    const latest = buildBatchABrowserWorksheetDocument(options);
    assert.deepEqual(latest, previous, source.sourceId);
    assert.equal(latest.ok, true, `${source.sourceId}: ${JSON.stringify(latest.errors)}`);
  }
});

test("S58J committed public HTML/PDF smoke is complete, deterministic, and free of public internal-ID leakage", () => {
  assert.equal(existsSync(ARTIFACT_HTML), true);
  assert.equal(existsSync(ARTIFACT_PDF), true);
  assert.equal(existsSync(ARTIFACT_MANIFEST), true);

  const html = readFileSync(ARTIFACT_HTML, "utf8");
  const pdf = readFileSync(ARTIFACT_PDF);
  const manifest = JSON.parse(readFileSync(ARTIFACT_MANIFEST, "utf8"));

  assert.equal(manifest.status, "public_html_pdf_smoke_pass");
  assert.equal(manifest.promotionActivationStatus, "production_promotion_accepted");
  assert.equal(manifest.canonicalPublicPath, true);
  assert.equal(manifest.publicHiddenModeFlagUsed, false);
  assert.equal(manifest.publicNumericModeUsed, false);
  assert.equal(manifest.representationToggleUsed, false);
  assert.equal(manifest.questionCount, 48);
  assert.equal(manifest.answerKeyItemCount, 48);
  assert.equal(manifest.questionPageCount, 6);
  assert.equal(manifest.answerKeyPageCount, 6);
  assert.equal(manifest.expectedPdfPageCount, 12);
  assert.equal(manifest.actualPdfPageCount, 12);
  assert.equal(manifest.visibleKnowledgePointCount, 6);
  assert.equal(manifest.visibleSemanticPatternGroupCount, 6);
  assert.equal(manifest.templateFamilyCount, 24);
  assert.equal(manifest.familyContextVariantCount, 56);
  assert.equal(manifest.semanticValidationErrorCount, 0);
  assert.equal(manifest.internalIdLeakCount, 0);
  assert.equal(manifest.unresolvedPlaceholderCount, 0);
  assert.equal(manifest.rendererProfileId, "g3b_u08_semantic_long_text_v1");
  assert.deepEqual(manifest.questionLayout, { columns: 2, rowsPerPage: 4 });
  assert.deepEqual(manifest.answerKeyLayout, { columns: 1, rowsPerPage: 8 });
  assert.equal(manifest.longTextCardPolicy, "avoidSplit");
  assert.equal(manifest.pageBreakMode, "avoidLongTextCards");
  assert.equal(manifest.renderedPageImageCount, 12);
  assert.equal(manifest.extractedEquationLabelCount, 48);
  assert.equal(manifest.extractedAnswerLabelCount, 48);
  assert.deepEqual(manifest.verificationErrors, []);

  assert.equal(sha256(Buffer.from(html, "utf8")), manifest.htmlSha256);
  assert.equal(sha256(pdf), manifest.pdfSha256);
  assert.equal(pdf.subarray(0, 5).toString("ascii"), "%PDF-");
  assert.equal(statSync(ARTIFACT_PDF).size, manifest.pdfBytes);
  assert.equal(manifest.pdfBytes >= 20000, true);

  assert.equal(countOccurrences(html, 'class="worksheet-page worksheet-page--questions'), 6);
  assert.equal(countOccurrences(html, 'class="worksheet-page worksheet-page--answer-key'), 6);
  assert.equal(countOccurrences(html, 'class="worksheet-cell worksheet-cell--question"'), 48);
  assert.equal(countOccurrences(html, 'class="worksheet-cell worksheet-cell--answer-key"'), 48);
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
    "numericMode",
    "representationMode",
    "g3b_u08_hidden_semantic",
    "{{",
    "}}"
  ]) {
    assert.equal(html.includes(forbidden), false, forbidden);
  }
});
