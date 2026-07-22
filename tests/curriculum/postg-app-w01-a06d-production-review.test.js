import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW01A06DProductionReviewReadback,
  materializeW01A06DProductionReview,
  validateW01A06DProductionReview
} from '../../src/curriculum/application/w01-a06d-production-review-runtime.mjs';

const materialized = materializeW01A06DProductionReview();
const validation = validateW01A06DProductionReview(materialized);
const pairByKnowledgePointId = new Map(
  materialized.reviewPairs.map((row) => [row.knowledgePointId, row])
);

test('A06D builds a valid regenerated production review document', () => {
  assert.equal(validation.ok, true, JSON.stringify(validation.issues, null, 2));
  assert.equal(validation.status, 'REGENERATED_PRODUCTION_REVIEW_DOCUMENT_VALID');
  assert.equal(validation.reviewDocumentReady, true);
  assert.equal(validation.productionAdmissionAllowed, false);
  assert.equal(validation.counts.reviewCohortQuestionCount, 16);
  assert.equal(validation.counts.reviewCohortSourceCount, 12);
  assert.equal(validation.counts.reviewCohortMacroContextCount, 16);
  assert.equal(validation.counts.mathPreservedCount, 16);
  assert.equal(validation.counts.numberFactsPreservedCount, 16);
  assert.equal(validation.counts.promptChangedCount, 16);
  assert.equal(validation.counts.visibleTitleCount, 0);
  assert.equal(validation.counts.forbiddenMacroPrefixCount, 0);
  assert.equal(validation.counts.genericVisibleUnitCount, 0);
  assert.equal(validation.counts.questionPageCount > 0, true);
  assert.equal(validation.counts.answerKeyPageCount > 0, true);
});

test('worksheet question-answer pairing and production boundary are exact', () => {
  const document = materialized.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 16);
  assert.equal(document.questionDisplayModels.length, 16);
  assert.equal(document.answerKeyItems.length, 16);
  assert.deepEqual(
    document.questionDisplayModels.map((row) => row.questionId),
    document.answerKeyItems.map((row) => row.questionId)
  );
  assert.equal(document.reviewRuntime.exactProductionGeneratorUsed, true);
  assert.equal(document.reviewRuntime.productionRendererRequired, true);
  assert.equal(document.reviewRuntime.questionLevelMacroTitleVisible, false);
  assert.equal(document.reviewRuntime.humanReviewReady, true);
  assert.equal(document.reviewRuntime.productionSelectable, false);
  assert.equal(document.reviewRuntime.productionAdmissionGranted, false);
  assert.equal(document.visibilityStatus, 'hidden_review_only');
  assert.equal(document.productionUse, 'forbidden_pending_second_human_review');
});

test('remediated prompts answer the operator findings', () => {
  const compare = pairByKnowledgePointId.get('kp_g3a_u01_4digit_compare');
  assert.match(compare.remediatedPrompt, /甲隊有5979張運動會集點卡/);
  assert.match(compare.remediatedPrompt, /乙隊有2172張運動會集點卡/);
  assert.match(compare.remediatedPrompt, />、< 或 =/);
  assert.equal(compare.answerUnit, null);
  assert.equal(compare.questionLevelMacroTitleVisible, false);

  const range = pairByKnowledgePointId.get('kp_g3a_u01_range_reasoning');
  assert.match(range.remediatedPrompt, /超過2478箱/);
  assert.match(range.remediatedPrompt, /少於3437箱/);
  assert.match(range.remediatedPrompt, /A批有2395箱/);
  assert.match(range.remediatedPrompt, /B批有3276箱/);
  assert.equal(range.answerUnit, null);

  const addition = pairByKnowledgePointId.get('kp_g3a_u02_add_multi_carry');
  assert.match(addition.remediatedPrompt, /1594個寶特瓶/);
  assert.match(addition.remediatedPrompt, /6個寶特瓶/);
  assert.equal(addition.remediatedPrompt.includes('1594 + 6'), false);
  assert.equal(addition.answerUnit, '個');
});

test('review dossier preserves rejected and remediated wording for all 16 rows', () => {
  for (const pair of materialized.reviewPairs) {
    assert.equal(typeof pair.originalPrompt, 'string');
    assert.equal(pair.originalPrompt.length > 0, true);
    assert.equal(typeof pair.rejectedA05Prompt, 'string');
    assert.equal(pair.rejectedA05Prompt.length > 0, true);
    assert.equal(typeof pair.remediatedPrompt, 'string');
    assert.equal(pair.remediatedPrompt.length > 0, true);
    assert.notEqual(pair.remediatedPrompt, pair.rejectedA05Prompt);
    assert.equal(pair.mathPreserved, true);
    assert.equal(pair.numberFactsPreserved, true);
    assert.equal(pair.questionLevelMacroTitleVisible, false);
    assert.equal(pair.humanNaturalnessReviewRequired, true);
  }
});

test('numeric-only and optional items remain numeric in the regenerated review', () => {
  const digitArrangement = pairByKnowledgePointId.get('kp_g4a_u01_digit_arrangement_max_min');
  assert.equal(digitArrangement.suitability, 'NUMERIC_ONLY');
  assert.equal(digitArrangement.surfaceMode, 'NUMERIC_PRESERVED');
  assert.equal(digitArrangement.remediatedPrompt, digitArrangement.originalPrompt);

  const placeValue = pairByKnowledgePointId.get('kp_g3a_u01_place_value_composition');
  assert.equal(placeValue.suitability, 'APPLICATION_OPTIONAL');
  assert.equal(placeValue.surfaceMode, 'NUMERIC_PRESERVED_PENDING_SURFACE_ADMISSION');
  assert.equal(placeValue.remediatedPrompt, placeValue.originalPrompt);
});

test('readback exposes renderer input and second Human Review boundary', () => {
  const readback = buildW01A06DProductionReviewReadback();
  assert.equal(readback.ok, true, JSON.stringify(readback.issues));
  assert.equal(readback.actualEvidenceLevel, 'E3_SHADOW_RUNTIME_INTEGRATED');
  assert.equal(readback.reviewDocumentReady, true);
  assert.equal(readback.humanReviewReady, false);
  assert.equal(readback.productionAdmissionGranted, false);
  assert.equal(readback.productionSelectable, false);
  assert.equal(readback.publicRouteChanged, false);
  assert.equal(readback.reviewPairs.length, 16);
  assert.equal(readback.worksheetDocument.generatedQuestions.length, 16);
  assert.equal(readback.unitReviewRows.length, 16);
});

test('math drift, visible titles, generic units and admission fail closed', () => {
  const mathDrift = structuredClone(materialized);
  mathDrift.rows[0].mathPreserved = false;
  assert.equal(
    validateW01A06DProductionReview(mathDrift).issues.some((row) => row.code === 'APPSEM_MATHEMATICAL_WITNESS_DRIFT'),
    true
  );

  const visibleTitle = structuredClone(materialized);
  visibleTitle.rows[0].visibleTitle = '健康、運動與競賽';
  assert.equal(
    validateW01A06DProductionReview(visibleTitle).issues.some((row) => row.code === 'APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN'),
    true
  );

  const genericUnit = structuredClone(materialized);
  genericUnit.rows.find((row) => row.surface.quantityFacts.length > 0).surface.quantityFacts[0].unit = '份';
  assert.equal(
    validateW01A06DProductionReview(genericUnit).issues.some((row) => row.code === 'APPSEM_GENERIC_VISIBLE_UNIT_FORBIDDEN'),
    true
  );

  const admitted = structuredClone(materialized);
  admitted.productionAdmissionAllowed = true;
  assert.equal(
    validateW01A06DProductionReview(admitted).issues.some((row) => row.code === 'POSTG_APP_W01_A06D_PRODUCTION_BOUNDARY_INVALID'),
    true
  );
});
