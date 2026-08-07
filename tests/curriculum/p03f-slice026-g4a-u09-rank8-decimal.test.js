import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  G4A_U09_P03F26_HIDDEN_APPLICATION_SPEC_ID,
  G4A_U09_P03F26_KP_IDS,
  G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS,
  G4A_U09_P03F26_SOURCE_ID,
  auditG4AU09P03F26SelectorProjection,
} from "../../site/modules/curriculum/registry/g4a-u09-rank8-decimal-selector-projection-p03f26.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F26PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f26-extension.js";
import { validateP03F26PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f26-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f26.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f26.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f26.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f26-extension.js";
import { validateG4AU09P03F26Question } from "../../site/modules/curriculum/batch-a/g4a-u09-rank8-decimal-runtime-p03f26.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding.js";

const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice026-g4a-u09-rank8-decimal-authority.json", import.meta.url), "utf8"));

test("P03F26 freezes exact queue/source/KP/spec/capability boundary", () => {
  assert.equal(authority.queueAuthority.queuePosition, 26);
  assert.equal(authority.queueAuthority.sliceId, "p03e_q026_r8_g4a_u09_4a09_profile_decimal_c1");
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.acceptedState, "PASS_D0_CLOSED");
  assert.equal(authority.sourceAuthority.sourceNodeId, G4A_U09_P03F26_SOURCE_ID);
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId).sort(), [...G4A_U09_P03F26_KP_IDS].sort());
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternSpecId).sort(), [...G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS].sort());
  assert.equal(authority.hiddenApplicationLineage.patternSpecId, G4A_U09_P03F26_HIDDEN_APPLICATION_SPEC_ID);
  assert.equal(authority.hiddenApplicationLineage.productionAdmissionAllowedBySlice026, false);
  assert.equal(authority.productBoundary.expectedSourceVisibleCountAfterAdmission, 6);
  assert.equal(authority.productBoundary.expectedSourceHiddenCountAfterAdmission, 2);
  assert.equal(authority.productBoundary.expectedCurrentPublicKnowledgePointCountAfterAdmission, 216);
});

test("P03F26 selector exposes four new KPs and five numeric specs without application leakage", () => {
  assert.equal(auditG4AU09P03F26SelectorProjection().ok, true);
  assert.equal(auditP03F26PublicSelectorComposition().ok, true);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4A_U09_P03F26_SOURCE_ID);
  assert.equal(availability.visibleCount, 6);
  assert.equal(availability.hiddenPendingCount, 2);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, 29);
  const sourceRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U09_P03F26_SOURCE_ID);
  assert.equal(sourceRows.length, 6);
  for (const kpId of G4A_U09_P03F26_KP_IDS) {
    const specs = resolveVisiblePatternSpecIdsForKnowledgePoint(kpId, "numeric");
    assert.ok(specs.length >= 1);
    assert.equal(specs.includes(G4A_U09_P03F26_HIDDEN_APPLICATION_SPEC_ID), false);
  }
});

test("P03F26 pattern definitions scope decimal arithmetic to missing-column reasoning only", () => {
  assert.equal(validateP03F26PatternDefinitions().ok, true);
  const arithmeticRow = authority.patternSurfaces.find((row) => row.knowledgePointId === "kp_g4a_u09_missing_digit_column_operation");
  assert.ok(arithmeticRow.requiredW3CapabilityIds.includes("cap_decimal_arithmetic"));
  for (const row of authority.patternSurfaces.filter((entry) => entry.knowledgePointId !== "kp_g4a_u09_missing_digit_column_operation")) {
    assert.equal(row.requiredW3CapabilityIds.includes("cap_decimal_arithmetic"), false);
  }
});

test("P03F26 deterministic runtime covers five specs with exact answers and bounded lineage", () => {
  const options = {
    sourceId: G4A_U09_P03F26_SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4A_U09_P03F26_KP_IDS],
    patternSpecIds: [...G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS],
    questionMode: "numeric",
    questionCount: 25,
    generationSeed: "p03f26-focused",
  };
  const plan = buildBatchABrowserPlan(options);
  assert.deepEqual([...plan.patternSpecIds].sort(), [...G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS].sort());
  assert.equal(plan.genericFallbackAllowed, false);
  const generated = generateBatchABrowserQuestions(options);
  assert.equal(generated.ok, true, JSON.stringify(generated.errors));
  assert.equal(generated.questions.length, 25);
  assert.equal(new Set(generated.questions.map((row) => row.blankedDisplayText)).size, 25);
  const counts = Object.fromEntries(G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS.map((id) => [id, generated.questions.filter((row) => row.patternSpecId === id).length]));
  assert.ok(Object.values(counts).every((count) => count === 5));
  assert.equal(validateBatchABrowserQuestions(generated.questions).ok, true);
  assert.ok(generated.questions.some((row) => row.operation === "compare" && row.comparison === "=" && row.leftDisplayScale !== row.rightDisplayScale));
  assert.ok(generated.questions.some((row) => row.operation === "missing_digit" && row.arithmeticOperation === "add"));
  assert.ok(generated.questions.some((row) => row.operation === "missing_digit" && row.arithmeticOperation === "sub"));
  assert.ok(generated.questions.filter((row) => row.operation === "missing_digit").every((row) => row.metadata.requiredCapabilityIds.includes("cap_decimal_arithmetic")));
  assert.ok(generated.questions.filter((row) => row.operation !== "missing_digit").every((row) => !row.metadata.requiredCapabilityIds.includes("cap_decimal_arithmetic")));
  assert.ok(generated.questions.every((row) => row.globalContextProduction === null && row.metadata.globalContextAuthorityPath === null));
});

test("P03F26 validator fails closed on answer or capability tampering", () => {
  const generated = generateBatchABrowserQuestions({
    sourceId: G4A_U09_P03F26_SOURCE_ID,
    selectedKnowledgePointIds: ["kp_g4a_u09_missing_digit_column_operation"],
    patternSpecIds: ["ps_g4a_u09_missing_digit_column_operation_missing_digits_numeric"],
    questionMode: "numeric",
    questionCount: 1,
    generationSeed: "p03f26-tamper",
  });
  assert.equal(generated.ok, true);
  const question = generated.questions[0];
  assert.equal(validateG4AU09P03F26Question({ ...question, answerText: "9", finalAnswer: "9" }).ok, false);
  assert.equal(validateG4AU09P03F26Question({ ...question, metadata: { ...question.metadata, requiredCapabilityIds: ["cap_decimal_domain_validator", "cap_decimal_number_system"] } }).ok, false);
});

test("P03F26 shared worksheet produces questions and answer key without application expansion", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: G4A_U09_P03F26_SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4A_U09_P03F26_KP_IDS],
    patternSpecIds: [...G4A_U09_P03F26_NUMERIC_PATTERN_SPEC_IDS],
    questionMode: "numeric",
    questionCount: 25,
    generationSeed: "p03f26-worksheet",
    includeAnswerKey: true,
    printLayout: { columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 25);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 25);
  assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 0);
  assert.equal(result.worksheetDocument.metadata.applicationExpansion, false);
  assert.equal(result.worksheetDocument.metadata.hiddenApplicationLineagePreserved, true);
});

test("P03F26 public capability resolver admits each new KP and same-unit mixed selection", () => {
  for (const kpId of G4A_U09_P03F26_KP_IDS) {
    const binding = resolvePublicUiCapabilityBinding({
      sourceId: G4A_U09_P03F26_SOURCE_ID,
      surfaceId: "classic",
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [kpId],
      requestedQuestionType: "numeric",
    });
    assert.equal(binding.blocked, false, `${kpId}:${binding.blockedReasons?.join("|")}`);
    assert.ok(binding.compatiblePatternGroups.some((group) => group.knowledgePointId === kpId));
  }
  const sourceKps = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G4A_U09_P03F26_SOURCE_ID).map((row) => row.knowledgePointId);
  const mixed = resolvePublicUiCapabilityBinding({
    sourceId: G4A_U09_P03F26_SOURCE_ID,
    surfaceId: "classic",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: sourceKps,
    requestedQuestionType: "numeric",
  });
  assert.equal(mixed.blocked, false, mixed.blockedReasons?.join("|"));
  assert.equal(mixed.selectedKnowledgePointIds.length, 6);
});
