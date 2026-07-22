import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW01RelationSurfaceRemediationReadback,
  materializeW01RelationSurfaceRemediationRuntime,
  validateW01RelationSurfaceRemediationRuntime
} from '../../src/curriculum/application/w01-relation-surface-remediation-runtime.mjs';

const materialized = materializeW01RelationSurfaceRemediationRuntime();
const validation = validateW01RelationSurfaceRemediationRuntime(materialized);
const rowByKnowledgePointId = new Map(
  materialized.rows.map((row) => [row.knowledgePointId, row])
);

const MACRO_LABELS = materialized.policy.visibleMacroLabels ?? [
  '公益、合作與資源共享',
  '商業、交易與預算',
  '社區、公民與公共服務',
  '文化、歷史與地方記憶',
  '資料、統計與公共資訊',
  '防災、應變與韌性',
  '環境保護與生態保育',
  '食物、農業與生產',
  '未來生活與永續設計',
  '健康、運動與競賽',
  '家庭與日常生活',
  '學校與學習',
  '科學、科技與觀察',
  '交通、移動與行程',
  '水資源與能源',
  '工作流程、物流與配送'
];

test('A06C builds a valid 16-item relation-specific shadow surface cohort', () => {
  assert.equal(validation.ok, true, JSON.stringify(validation.issues, null, 2));
  assert.equal(validation.status, 'RELATION_SPECIFIC_SURFACE_SHADOW_RUNTIME_VALID');
  assert.equal(validation.productionReady, false);
  assert.equal(validation.productionAdmissionAllowed, false);
  assert.equal(validation.counts.reviewRowCount, 16);
  assert.equal(validation.counts.issueCount, 0);
  assert.equal(validation.counts.mathPreservedCount, 16);
  assert.equal(validation.counts.numberMultisetPreservedCount, 16);
  assert.equal(validation.counts.promptChangedCount, 16);
  assert.equal(validation.counts.visibleTitleCount, 0);
  assert.equal(validation.counts.humanNaturalnessGateCount, 16);
  assert.equal(validation.counts.applicationSurfaceCount > 0, true);
  assert.equal(validation.counts.numericPreservedCount > 0, true);
});

test('question-level Macro Context headings and fixed prefixes are absent', () => {
  for (const row of materialized.rows) {
    assert.equal(row.visibleTitle, null, row.bindingCandidateId);
    assert.equal(row.transformed.applicationReview.visibleTitle, null, row.bindingCandidateId);
    assert.equal(row.transformed.metadata.contextMacroVisibleTitle, false, row.bindingCandidateId);
    for (const label of MACRO_LABELS) {
      assert.equal(row.remediatedPrompt.startsWith(`在${label}`), false, row.bindingCandidateId);
    }
    assert.equal(/(?:依照|根據)[^。！？]{0,260}(?:[+\-×÷=]|□|○)[^。！？]{0,260}(?:求出|判斷)/u.test(row.remediatedPrompt), false, row.bindingCandidateId);
    assert.equal(/(?:求出|判斷)[^。！？]{0,24}(?:總量|需求|結論|安排)/u.test(row.remediatedPrompt), false, row.bindingCandidateId);
  }
});

test('comparison is expressed as two same-measure groups instead of a total', () => {
  const row = rowByKnowledgePointId.get('kp_g3a_u01_4digit_compare');
  assert.equal(row.semanticClass, 'COMPARE_TWO_GROUPS_SAME_MEASURE');
  assert.equal(row.surface.templateFamilyId, 'REL_COMPARE_TWO_GROUPS_V1');
  assert.match(row.remediatedPrompt, /甲隊有5979張運動會集點卡/);
  assert.match(row.remediatedPrompt, /乙隊有2172張運動會集點卡/);
  assert.match(row.remediatedPrompt, />、< 或 =/);
  assert.equal(row.remediatedPrompt.includes('總量'), false);
  assert.equal(row.surface.answerUnit, null);
  assert.equal(row.surface.relationEvidence.target, 'RELATION_SYMBOL');
});

test('range reasoning exposes bounds and candidate groups with one unit', () => {
  const row = rowByKnowledgePointId.get('kp_g3a_u01_range_reasoning');
  assert.equal(row.semanticClass, 'RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE');
  assert.equal(row.surface.templateFamilyId, 'REL_RANGE_MEMBERSHIP_V1');
  assert.match(row.remediatedPrompt, /超過2478箱/);
  assert.match(row.remediatedPrompt, /少於3437箱/);
  assert.match(row.remediatedPrompt, /A批有2395箱/);
  assert.match(row.remediatedPrompt, /B批有3276箱/);
  assert.equal(row.remediatedPrompt.includes('貨物總量'), false);
  assert.equal(row.surface.answerUnit, null);
  assert.equal(row.surface.relationEvidence.target, 'SELECTION_ID');
});

test('addition uses a natural joined-quantity event with explicit units', () => {
  const row = rowByKnowledgePointId.get('kp_g3a_u02_add_multi_carry');
  assert.equal(row.semanticClass, 'JOIN_RESULT_TOTAL');
  assert.match(row.remediatedPrompt, /1594個寶特瓶/);
  assert.match(row.remediatedPrompt, /又發現6個寶特瓶/);
  assert.match(row.remediatedPrompt, /一共記錄多少個寶特瓶/);
  assert.equal(row.remediatedPrompt.includes('1594 + 6'), false);
  assert.equal(row.surface.answerUnit, '個');
});

test('division and floor relations expose total, groups and target roles', () => {
  const water = rowByKnowledgePointId.get('kp_g3a_u06_exact_division_check');
  assert.equal(water.semanticClass, 'EQUAL_SHARE_PER_GROUP');
  assert.match(water.remediatedPrompt, /77公升飲用水/);
  assert.match(water.remediatedPrompt, /平均分給7個水桶/);
  assert.match(water.remediatedPrompt, /每個水桶分到多少公升飲用水/);
  assert.equal(water.surface.answerUnit, '公升');

  const floor = rowByKnowledgePointId.get('kp_g4b_u04_context_floor_ceiling_selection');
  assert.equal(floor.semanticClass, 'COMPLETE_GROUP_COUNT_FLOOR');
  assert.match(floor.remediatedPrompt, /5886顆橘子/);
  assert.match(floor.remediatedPrompt, /每盒裝10顆/);
  assert.match(floor.remediatedPrompt, /最多可以裝滿幾盒/);
  assert.equal(floor.surface.answerUnit, '盒');
  assert.equal(floor.surface.relationEvidence.remainderPolicy, 'REMAINDER_NOT_COUNTED_AS_COMPLETE_GROUP');
});

test('existing authentic application items are preserved without the A05 wrapper', () => {
  const saving = rowByKnowledgePointId.get('kp_g3b_u08_total_from_groups');
  assert.equal(saving.surface.surfaceMode, 'RELATION_APPLICATION_PRESERVED');
  assert.equal(saving.remediatedPrompt, saving.originalPrompt);
  assert.notEqual(saving.remediatedPrompt, saving.oldReviewPrompt);
  assert.equal(saving.surface.answerUnit, '元');

  const ribbon = rowByKnowledgePointId.get('kp_g5a_u02_equal_partition_factor_application');
  assert.equal(ribbon.surface.surfaceMode, 'RELATION_APPLICATION_PRESERVED');
  assert.equal(ribbon.remediatedPrompt, ribbon.originalPrompt);
  assert.equal(ribbon.surface.answerUnit, null);
});

test('numeric-only and non-admitted optional Patterns remain numeric', () => {
  const digitArrangement = rowByKnowledgePointId.get('kp_g4a_u01_digit_arrangement_max_min');
  assert.equal(digitArrangement.suitability, 'NUMERIC_ONLY');
  assert.equal(digitArrangement.surface.surfaceMode, 'NUMERIC_PRESERVED');
  assert.equal(digitArrangement.remediatedPrompt, digitArrangement.originalPrompt);
  assert.equal(digitArrangement.remediatedPrompt.includes('社區'), false);

  const placeValue = rowByKnowledgePointId.get('kp_g3a_u01_place_value_composition');
  assert.equal(placeValue.suitability, 'APPLICATION_OPTIONAL');
  assert.equal(placeValue.surface.surfaceMode, 'NUMERIC_PRESERVED_PENDING_SURFACE_ADMISSION');
  assert.equal(placeValue.remediatedPrompt, placeValue.originalPrompt);
});

test('all application quantities use concrete non-generic visible units', () => {
  for (const row of materialized.rows.filter((candidate) => candidate.surface.surfaceMode.startsWith('RELATION_APPLICATION'))) {
    for (const fact of row.surface.quantityFacts) {
      assert.equal(['份', 'UNBOUND_UNIT_CANDIDATE'].includes(fact.unit), false, row.bindingCandidateId);
      assert.equal(row.remediatedPrompt.includes(`${fact.value}${fact.unit}`), true, `${row.bindingCandidateId}:${fact.value}${fact.unit}`);
    }
  }
});

test('readback preserves exact math lineage and defers naturalness approval', () => {
  const readback = buildW01RelationSurfaceRemediationReadback();
  assert.equal(readback.ok, true, JSON.stringify(readback.issues));
  assert.equal(readback.actualEvidenceLevel, 'E3_SHADOW_RUNTIME_INTEGRATED');
  assert.equal(readback.productionReady, false);
  assert.equal(readback.productionAdmissionAllowed, false);
  assert.equal(readback.reviewRows.length, 16);
  assert.equal(readback.reviewRows.every((row) => row.mathPreserved), true);
  assert.equal(readback.reviewRows.every((row) => row.numberMultisetPreserved), true);
  assert.equal(readback.reviewRows.every((row) => row.humanNaturalnessReviewRequired), true);
  assert.equal(readback.nextShortestStep, 'POSTG-APP-W01-A06D_RegeneratedHTMLPDFHumanReviewPackage');
});

test('numeric drift, visible titles and premature admission fail closed', () => {
  const numericDrift = structuredClone(materialized);
  numericDrift.rows[0].remediatedPrompt += '另外有1個。';
  numericDrift.rows[0].numberMultisetPreserved = false;
  assert.equal(
    validateW01RelationSurfaceRemediationRuntime(numericDrift).issues.some((row) => row.code === 'APPSEM_NUMERIC_FACT_DRIFT'),
    true
  );

  const visibleTitle = structuredClone(materialized);
  visibleTitle.rows[0].visibleTitle = '健康、運動與競賽';
  assert.equal(
    validateW01RelationSurfaceRemediationRuntime(visibleTitle).issues.some((row) => row.code === 'APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN'),
    true
  );

  const admitted = structuredClone(materialized);
  admitted.rows[0].productionAdmissionAllowed = true;
  assert.equal(
    validateW01RelationSurfaceRemediationRuntime(admitted).issues.some((row) => row.code === 'POSTG_APP_W01_A06C_PRODUCTION_ADMISSION_FORBIDDEN'),
    true
  );
});
