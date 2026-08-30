import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  auditG4AU06FractionClassificationSelectorProjection,
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4a-u06-fraction-type-classification-selector-projection.js";
import {
  G4A_U06_P03F25_KP_ID,
} from "../../site/modules/curriculum/registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";
import {
  G4A_U06_P03F33_KP_IDS,
} from "../../site/modules/curriculum/registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";
import {
  auditP03F17PublicSelectorComposition,
  BATCH_A_SELECTOR_AVAILABILITY,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f17-extension.js";
import { validateP03F17PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f17-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f17.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f17.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f17.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f17-extension.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
import { getBatchASourceUnit } from "../../site/modules/curriculum/batch-a/source-units.js";

const SOURCE_ID = "g4a_u06_4a06";
const ALL_SPECS = [...G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS];
const OPTIONS = Object.freeze({
  sourceId: SOURCE_ID,
  selectedKnowledgePointIds: [G4A_U06_FRACTION_CLASSIFICATION_KP_ID],
  questionMode: "numeric",
  questionCount: 18,
  generationSeed: "p03f17-focused",
  includeAnswerKey: true,
});
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice017-fraction-type-classification-authority.json", import.meta.url), "utf8"));

test("P03F17 frozen queue and Slice016 D0 predecessor are exact", () => {
  assert.equal(authority.queueAuthority.queuePosition, 17);
  assert.equal(authority.queueAuthority.sliceId, "p03e_q017_r7_g4a_u06_4a06_profile_fraction_c1");
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.acceptedState, "PASS_D0_CLOSED");
  assert.equal(authority.sourceAuthority.sourceNodeId, SOURCE_ID);
  assert.deepEqual(authority.sourceAuthority.reviewedPages, [1]);
});

test("P03F17 introduces exactly one new public source and one KP", () => {
  assert.equal(auditG4AU06FractionClassificationSelectorProjection().ok, true);
  const audit = auditP03F17PublicSelectorComposition();
  assert.equal(audit.ok, true, audit.errors.join("\n"));
  assert.equal(audit.counts.addedSources, 1);
  assert.equal(audit.counts.addedKnowledgePoints, 1);
  const unit = getBatchASourceUnit(SOURCE_ID);
  assert.equal(unit.unitCode, "4A-U06");
  const rows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID].visibleCount, 1);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SOURCE_ID].hiddenPendingCount, 5);
  assert.equal(rows[0].knowledgePointId, G4A_U06_FRACTION_CLASSIFICATION_KP_ID);
});

test("P03F17 PatternSpecs preserve classification-only capability boundary", () => {
  const result = validateP03F17PatternDefinitions();
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.patternSpecCount, 3);
});

test("P03F17 shared plan resolves all three classification PatternSpecs", () => {
  const plan = buildBatchABrowserPlan(OPTIONS);
  assert.equal(plan.sourceId, SOURCE_ID);
  assert.equal(plan.questionMode, "numeric");
  assert.deepEqual(plan.patternSpecIds, ALL_SPECS);
  assert.equal(plan.genericFallbackAllowed, false);
  assert.equal(plan.publicControls.globalContextAuthority, "NOT_APPLICABLE_FOR_SLICE017");
});

test("P03F17 generates balanced deterministic proper/improper/mixed witnesses", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 18);
  assert.deepEqual([...new Set(result.questions.map((q) => q.patternSpecId))], ALL_SPECS);
  const typeCounts = Object.fromEntries(["proper_fraction", "improper_fraction", "mixed_number"].map((type) => [type, result.questions.filter((q) => q.fractionType === type).length]));
  assert.deepEqual(typeCounts, { proper_fraction: 6, improper_fraction: 6, mixed_number: 6 });
  for (const question of result.questions) {
    assert.equal(question.globalContextProduction, null);
    assert.equal(question.metadata.productAdmissionTask, "P03F_W3DirectProductVerticalSlice017Implementation");
    assert.equal(question.metadata.requiredCapabilityIds.includes("cap_fraction_domain_validator"), true);
    assert.equal(question.metadata.requiredCapabilityIds.includes("cap_fraction_number_system"), true);
    assert.equal(question.metadata.requiredCapabilityIds.includes("cap_fraction_arithmetic"), false);
  }
  const validation = validateBatchABrowserQuestions(result.questions);
  assert.equal(validation.ok, true, JSON.stringify(validation.errors));
});

test("P03F17 fraction type invariants are exact", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  for (const question of result.questions) {
    if (question.fractionType === "proper_fraction") {
      assert.equal(question.whole, 0);
      assert.equal(question.numerator < question.denominator, true);
      assert.equal(question.answerText, "真分數");
    } else if (question.fractionType === "improper_fraction") {
      assert.equal(question.whole, 0);
      assert.equal(question.numerator >= question.denominator, true);
      assert.equal(question.answerText, "假分數");
    } else {
      assert.equal(question.whole > 0, true);
      assert.equal(question.numerator < question.denominator, true);
      assert.equal(question.answerText, "帶分數");
    }
  }
});

test("P03F17 validator fails closed on classification, answer, and structure tampering", () => {
  const result = generateBatchABrowserQuestions(OPTIONS);
  const typeTamper = { ...result.questions[0], fractionType: "improper_fraction" };
  assert.equal(validateBatchABrowserQuestions([typeTamper]).ok, false);
  const answerTamper = { ...result.questions[1], answerText: "帶分數", finalAnswer: "帶分數" };
  assert.equal(validateBatchABrowserQuestions([answerTamper]).ok, false);
  const structureTamper = { ...result.questions[2], denominator: 0 };
  assert.equal(validateBatchABrowserQuestions([structureTamper]).ok, false);
});

test("P03F17 shared worksheet produces questions and answer key without application expansion", () => {
  const result = buildBatchABrowserWorksheetDocument(OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 18);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 18);
  assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 0);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
});

test("P03F17 historical selector remains one KP while current Pixel advances G4A-U06 through q027 to six", () => {
  const historicalRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(historicalRows.length, 1);
  assert.equal(historicalRows[0].knowledgePointId, G4A_U06_FRACTION_CLASSIFICATION_KP_ID);
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.ok(snapshot.bySourceId[SOURCE_ID]);
  assert.equal(snapshot.bySourceId[SOURCE_ID].visibleKnowledgePoints.length, 6);
  assert.equal(snapshot.bySourceId[SOURCE_ID].visibleKnowledgePoints.some((row) => row.knowledgePointId === G4A_U06_FRACTION_CLASSIFICATION_KP_ID), true);
  assert.equal(snapshot.bySourceId[SOURCE_ID].visibleKnowledgePoints.some((row) => row.knowledgePointId === G4A_U06_P03F25_KP_ID), true);
  assert.equal(G4A_U06_P03F33_KP_IDS.every((id) => snapshot.bySourceId[SOURCE_ID].visibleKnowledgePoints.some((row) => row.knowledgePointId === id)), true);
  assert.equal(snapshot.bySourceId[SOURCE_ID].visibleKnowledgePoints.some((row) => row.knowledgePointId === "kp_fraction_times_integer_quantity"), true);
});
