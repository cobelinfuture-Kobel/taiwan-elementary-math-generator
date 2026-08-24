import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  G6B_U01_P03F32_DECIMAL_SPEC_ID,
  G6B_U01_P03F32_FRACTION_SPEC_ID,
  G6B_U01_P03F32_GROUP_ID,
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
  G6B_U01_P03F32_SPEC_IDS,
  P03F32_HIDDEN_SIBLING_KP_IDS,
  P03F32_REQUIRED_CAPABILITY_IDS,
  auditG6BU01P03F32SelectorProjection,
} from "../../site/modules/curriculum/registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F32PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f32-extension.js";
import {
  generateG6BU01P03F32Questions,
  validateG6BU01P03F32Question,
} from "../../site/modules/curriculum/batch-a/g6b-u01-rank8-decimal-fraction-conversion-runtime-p03f32.js";
import {
  exactDecimalToFraction,
  exactFractionToDecimal,
} from "../../site/modules/curriculum/public/shared-mixed-domain-normalizer-p03f32.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  PUBLIC_UI_SURFACES,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f32.js";
import {
  getCurrentPixelRegistrySnapshot,
  listCurrentPixelSourceOptions,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";
import { CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import { buildPublicGenerationCapabilityMatrixV6 } from "../../tools/curriculum/materialize-pgc-r01-public-capability-matrix-v6.mjs";
import { buildPgcR02UiCapabilityBindingContractR05 } from "../../tools/curriculum/materialize-pgc-r02-ui-capability-binding-r05.mjs";

const predecessor = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/final-milestone-claims/p03f-w3-slice031-e6-d0-v1.json", import.meta.url), "utf8"));
const plan = (overrides = {}) => ({
  sourceId:G6B_U01_P03F32_SOURCE_ID,
  selectionMode:"sourceUnit",
  selectedKnowledgePointIds:[G6B_U01_P03F32_KP_ID],
  selectedPatternGroupIds:[G6B_U01_P03F32_GROUP_ID],
  patternSpecIds:[...G6B_U01_P03F32_SPEC_IDS],
  questionMode:"numeric",
  questionCount:24,
  generationSeed:"p03f32-product-acceptance",
  includeAnswerKey:true,
  ordering:"groupedByPattern",
  printLayout:{ paperSize:"A4", columns:2, rowsPerPage:4, showQuestionNumbers:true, showAnswerKeyPage:true },
  ...overrides,
});

test("P03F32 consumes queue position 32 only after Slice031 D0", () => {
  assert.equal(predecessor.status, "PASS_D0_CLOSED");
  assert.equal(predecessor.goalDistance, "D0");
  assert.equal(predecessor.progression.nextResumeTask, "P03F_W3DirectProductVerticalSlice032Implementation");
});

test("P03F32 selector admits one KP, one group and exactly two numeric conversion specs", () => {
  const audit = auditG6BU01P03F32SelectorProjection();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.deepEqual(audit.counts, { knowledgePoints:1, hiddenSiblings:4, patternGroups:1, patternSpecs:2, numeric:2, application:0 });
  assert.equal(auditP03F32PublicSelectorComposition().ok, true);
  assert.deepEqual(P03F32_REQUIRED_CAPABILITY_IDS, [
    "cap_decimal_domain_validator",
    "cap_decimal_number_system",
    "cap_fraction_domain_validator",
    "cap_fraction_number_system",
    "cap_mixed_number_domain_normalization",
  ]);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G6B_U01_P03F32_SOURCE_ID);
  assert.deepEqual([availability.visibleCount, availability.hiddenPendingCount, availability.notSelectableCount], [1,4,4]);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, 32);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 226);
  const rows = listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===G6B_U01_P03F32_SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, G6B_U01_P03F32_KP_ID);
  assert.deepEqual(rows[0].patternSpecIds, G6B_U01_P03F32_SPEC_IDS);
});

test("P03F32 current Classic and Pixel inventories advance monotonically through Slice053 to 34 sources / 259 KPs", () => {
  assert.equal(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 34);
  assert.equal(listCurrentPixelSourceOptions().length, 34);
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 34);
  assert.equal(snapshot.visibleKnowledgePointCount, 259);
  const rows = listPixelKnowledgePointsForSource(G6B_U01_P03F32_SOURCE_ID);
  assert.equal(rows.length, 3);
  assert.deepEqual(
    new Set(rows.map((row) => row.knowledgePointId)),
    new Set([G6B_U01_P03F32_KP_ID, "kp_g6b_u01_mixed_number_domain_order", "kp_g6b_u01_mixed_decimal_fraction_add_sub"]),
  );
});

test("P03F32 generator deterministically emits 24 unique balanced exact conversions", () => {
  const first = generateG6BU01P03F32Questions(plan());
  const second = generateG6BU01P03F32Questions(plan());
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 24);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 24);
  assert.deepEqual(first.allocation.map((row)=>row.questionCount), [12,12]);
  assert.deepEqual(new Set(first.questions.map((row)=>row.patternSpecId)), new Set(G6B_U01_P03F32_SPEC_IDS));
  assert.deepEqual(new Set(first.questions.map((row)=>row.action)), new Set(["TO_FRACTION","TO_DECIMAL"]));
  for (const question of first.questions) {
    assert.equal(validateG6BU01P03F32Question(question).ok, true);
    assert.equal(question.metadata.sourceAuthorityMode, "R02_CANONICAL_PREREQUISITE_PROJECTION");
    assert.equal(question.metadata.directSourcePromptVerbatim, false);
    assert.equal(question.metadata.mixedDomainNormalizerId, "shared-mixed-domain-normalizer-p03f32-v2");
    assert.deepEqual(question.metadata.requiredCapabilityIds, P03F32_REQUIRED_CAPABILITY_IDS);
    assert.equal(question.metadata.contextAuthority, null);
    assert.equal(question.metadata.globalContextProduction, null);
    if (question.action === "TO_FRACTION") {
      const expected = exactDecimalToFraction(question.decimal);
      assert.equal(question.answerText, `${expected.canonicalValue.numerator}/${expected.canonicalValue.denominator}`);
      assert.equal(question.patternSpecId, G6B_U01_P03F32_FRACTION_SPEC_ID);
    } else {
      const expected = exactFractionToDecimal({ numerator:question.numerator, denominator:question.denominator });
      assert.equal(question.answerText, expected.canonicalValue.canonicalText);
      assert.equal(question.patternSpecId, G6B_U01_P03F32_DECIMAL_SPEC_ID);
    }
  }
});

test("P03F32 validator fails closed on answer, domain, application and provenance tampering", () => {
  const original = generateG6BU01P03F32Questions(plan({ questionCount:2 })).questions[0];
  assert.equal(validateG6BU01P03F32Question({ ...original, answerText:"999" }).ok, false);
  assert.equal(validateG6BU01P03F32Question({ ...original, denominator:3 }).ok, false);
  assert.equal(validateG6BU01P03F32Question({ ...original, questionMode:"application" }).ok, false);
  assert.equal(validateG6BU01P03F32Question({ ...original, metadata:{ ...original.metadata, directSourcePromptVerbatim:true } }).ok, false);
});

test("P03F32 public resolver exposes conversion numeric only on every public surface", () => {
  for (const surfaceId of Object.values(PUBLIC_UI_SURFACES)) {
    const binding = resolvePublicUiCapabilityBinding({
      sourceId:G6B_U01_P03F32_SOURCE_ID,
      surfaceId,
      selectionMode:"singleKnowledgePoint",
      selectedKnowledgePointIds:[G6B_U01_P03F32_KP_ID],
    });
    assert.equal(binding.blocked, false, `${surfaceId}:${binding.blockedReasons?.join("|")}`);
    assert.deepEqual(binding.availableQuestionTypeOptions.map((row)=>row.value), ["numeric"]);
    assert.deepEqual(binding.compatiblePatternGroupIds, [G6B_U01_P03F32_GROUP_ID]);
    assert.deepEqual(binding.depthOptions, []);
    assert.deepEqual(binding.contextOptions, []);
    assert.equal(binding.availableSelectionModes.find((row)=>row.value==="mixedKnowledgePointsSameUnit")?.enabled, false);
  }
});

test("P03F32 shared worksheet emits 24 questions + 24 answers on 3 + 3 pages", () => {
  const result = buildBatchABrowserWorksheetDocument(plan());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 24);
  assert.equal(document.answerKeyItems.length, 24);
  assert.equal(document.questionPages.length, 3);
  assert.equal(document.answerKeyPages.length, 3);
  assert.equal(document.metadata.applicationExpansion, false);
  assert.equal(document.metadata.worksheetAdapter.sharedPagination, true);
  assert.equal(document.metadata.worksheetAdapter.sharedRenderer, true);
  assert.equal(document.metadata.worksheetAdapter.parallelPipeline, false);
  document.answerKeyItems.forEach((answer,index)=>{
    const question = document.generatedQuestions[index];
    assert.equal(answer.questionId, question.id);
    assert.equal(answer.patternId, question.patternSpecId);
    assert.equal(answer.knowledgePointId, G6B_U01_P03F32_KP_ID);
    assert.equal(answer.answerText, question.answerText);
  });
});

test("P03F32 R01 V6 accounts 32 sources / 226 KPs with six exact conversion capability rows", () => {
  const matrix = buildPublicGenerationCapabilityMatrixV6();
  assert.equal(matrix.matrixVersion, "pgc-r01-public-capability-matrix-v6");
  assert.equal(matrix.summary.publicSourceCount, 32);
  assert.equal(matrix.summary.publicVisibleKnowledgePointCount, 226);
  assert.equal(matrix.summary.blockingGapCount, 0, JSON.stringify(matrix.gaps.filter((gap)=>gap.severity==="blocking_r01")));
  const rows = matrix.capabilities.filter((row)=>row.sourceId===G6B_U01_P03F32_SOURCE_ID);
  assert.equal(rows.length, 6);
  assert.deepEqual(new Set(rows.map((row)=>row.patternSpecId)), new Set(G6B_U01_P03F32_SPEC_IDS));
  assert.deepEqual(new Set(rows.map((row)=>row.surfaceId)), new Set(Object.values(PUBLIC_UI_SURFACES)));
});

test("P03F32 R02 R05 accounts exactly six numeric bindings with zero gaps", () => {
  const contract = buildPgcR02UiCapabilityBindingContractR05();
  assert.equal(contract.bindingRevision, "pgc-r02-r05-p03f32");
  assert.equal(contract.status, "PASS", JSON.stringify(contract.gaps));
  assert.equal(contract.summary.publicSourceCount, 32);
  assert.equal(contract.summary.visibleKnowledgePointCount, 226);
  assert.equal(contract.summary.gapCount, 0);
  const rows = contract.bindings.filter((row)=>row.sourceId===G6B_U01_P03F32_SOURCE_ID);
  assert.equal(rows.length, 6);
  assert.ok(rows.every((row)=>row.questionType==="numeric" && row.compatiblePatternSpecIds.length===2));
});

test("P03F32 does not expose hidden sibling, compare, arithmetic or application capability surfaces", () => {
  const matrix = buildPublicGenerationCapabilityMatrixV6();
  const corpus = JSON.stringify({
    selector:listVisibleBatchAKnowledgePoints().filter((row)=>row.sourceId===G6B_U01_P03F32_SOURCE_ID),
    capabilities:matrix.capabilities.filter((row)=>row.sourceId===G6B_U01_P03F32_SOURCE_ID),
  });
  for (const hiddenId of P03F32_HIDDEN_SIBLING_KP_IDS) assert.doesNotMatch(corpus, new RegExp(hiddenId));
  assert.doesNotMatch(corpus, /mixed_number_domain_order/);
  assert.doesNotMatch(corpus, /mixed_decimal_fraction_add_sub/);
  assert.doesNotMatch(corpus, /mixed_decimal_fraction_mul_div/);
  assert.doesNotMatch(corpus, /questionType\":\"APPLICATION\"/);
});