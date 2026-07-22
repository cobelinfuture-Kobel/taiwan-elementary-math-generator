import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW01SemanticClassQuantitySchemaReadback,
  materializeW01SemanticClassQuantitySchemaRuntime,
  validateW01SemanticClassQuantitySchemaRuntime
} from '../../src/curriculum/application/w01-semantic-class-quantity-schema-runtime.mjs';

const materialized = materializeW01SemanticClassQuantitySchemaRuntime();
const validation = validateW01SemanticClassQuantitySchemaRuntime(materialized);
const reviewByKnowledgePointId = new Map(
  materialized.reviewDescriptors.map((row) => [row.knowledgePointId, row])
);

function issueCodes(descriptor) {
  return new Set(descriptor.remediationIssues.map((row) => row.code));
}

test('A06B materializes a structurally valid shadow semantic runtime', () => {
  assert.equal(validation.ok, true, JSON.stringify(validation.structuralIssues, null, 2));
  assert.equal(validation.status, 'SEMANTIC_CLASS_QUANTITY_SCHEMA_SHADOW_RUNTIME_VALID');
  assert.equal(validation.productionReady, false);
  assert.equal(validation.productionAdmissionAllowed, false);
  assert.equal(materialized.a01Validation.ok, true);
  assert.equal(validation.counts.descriptorCount, materialized.a01.candidates.length);
  assert.equal(validation.counts.reviewDescriptorCount, 16);
  assert.equal(validation.counts.structuralIssueCount, 0);
  assert.equal(validation.counts.remediationIssueCount > 0, true);
});

test('every descriptor has semantic class, suitability, quantity schema and fail-closed admission', () => {
  for (const descriptor of materialized.descriptors) {
    assert.equal(materialized.policy.allowedSemanticClasses.includes(descriptor.semanticClass), true, descriptor.bindingCandidateId);
    assert.equal(materialized.policy.allowedSuitability.includes(descriptor.suitability), true, descriptor.bindingCandidateId);
    assert.equal(descriptor.quantitySchema.allOperandsHaveSchema, true, descriptor.bindingCandidateId);
    assert.equal(descriptor.quantitySchema.inputBindings.length > 0, true, descriptor.bindingCandidateId);
    for (const binding of descriptor.quantitySchema.inputBindings) {
      assert.equal(typeof binding.quantityRole, 'string');
      assert.equal(typeof binding.entityType, 'string');
      assert.equal(typeof binding.measureType, 'string');
      assert.equal(Object.hasOwn(binding, 'unitText'), true);
      assert.equal(typeof binding.valueSource, 'string');
    }
    assert.equal(typeof descriptor.answerSchema.answerShape, 'string');
    assert.equal(descriptor.contextMetadata.macroHeadingVisiblePerQuestion, false);
    assert.equal(descriptor.productionAdmissionAllowed, false);
  }
});

test('comparison and range items use relation-specific semantic classes', () => {
  const compare = reviewByKnowledgePointId.get('kp_g3a_u01_4digit_compare');
  assert.equal(compare.semanticClass, 'COMPARE_TWO_GROUPS_SAME_MEASURE');
  assert.equal(compare.suitability, 'APPLICATION_REQUIRED');
  assert.equal(compare.answerSchema.answerShape, 'RELATION_SYMBOL');
  assert.equal(compare.answerSchema.unitPolicy, 'NO_UNIT');
  assert.equal(issueCodes(compare).has('APPSEM_GENERIC_TOTAL_TARGET_FORBIDDEN'), true);
  assert.equal(issueCodes(compare).has('APPSEM_RELATION_TARGET_MISMATCH'), true);
  assert.equal(issueCodes(compare).has('APPSEM_ANSWER_UNIT_MISMATCH'), true);

  const range = reviewByKnowledgePointId.get('kp_g3a_u01_range_reasoning');
  assert.equal(range.semanticClass, 'RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE');
  assert.equal(range.suitability, 'APPLICATION_REQUIRED');
  assert.equal(range.answerSchema.answerShape, 'SELECTION_ID');
  assert.equal(range.answerSchema.unitPolicy, 'NO_UNIT');
  assert.equal(issueCodes(range).has('APPSEM_GENERIC_TOTAL_TARGET_FORBIDDEN'), true);
  assert.equal(issueCodes(range).has('APPSEM_RELATION_TARGET_MISMATCH'), true);
  assert.equal(issueCodes(range).has('APPSEM_ANSWER_UNIT_MISMATCH'), true);
});

test('bare equation wrapper and generic units are rejected for addition application item', () => {
  const addition = reviewByKnowledgePointId.get('kp_g3a_u02_add_multi_carry');
  assert.equal(addition.semanticClass, 'JOIN_RESULT_TOTAL');
  assert.equal(addition.suitability, 'APPLICATION_REQUIRED');
  const codes = issueCodes(addition);
  assert.equal(codes.has('APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN'), true);
  assert.equal(codes.has('APPSEM_EXPRESSION_WRAPPER_PROSE_FORBIDDEN'), true);
  assert.equal(codes.has('APPSEM_OPERAND_QUANTITY_BINDING_MISSING'), true);
});

test('numeric-only digit arrangement rejects forced story overlay', () => {
  const digitArrangement = reviewByKnowledgePointId.get('kp_g4a_u01_digit_arrangement_max_min');
  assert.equal(digitArrangement.semanticClass, 'NUMERIC_ONLY');
  assert.equal(digitArrangement.suitability, 'NUMERIC_ONLY');
  assert.equal(issueCodes(digitArrangement).has('APPSEM_FORCED_APPLICATION_FOR_NUMERIC_ONLY'), true);
});

test('all A05 review items are joined and retain a human naturalness gate', () => {
  assert.deepEqual(
    materialized.reviewDescriptors.map((row) => row.bindingCandidateId).sort(),
    materialized.a05ReviewData.reviewPairs.map((row) => row.bindingCandidateId).sort()
  );
  for (const descriptor of materialized.reviewDescriptors) {
    assert.equal(descriptor.reviewPair != null, true);
    assert.equal(issueCodes(descriptor).has('APPSEM_HUMAN_NATURALNESS_REVIEW_REQUIRED'), true);
    assert.equal(descriptor.remediationStatus, 'REMEDIATION_REQUIRED');
  }
  assert.equal(
    validation.counts.remediationIssueCounts.APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN,
    materialized.reviewDescriptors.length
  );
});

test('readback exposes the exact 16-item semantic remediation dossier', () => {
  const readback = buildW01SemanticClassQuantitySchemaReadback();
  assert.equal(readback.ok, true);
  assert.equal(readback.actualEvidenceLevel, 'E3_SHADOW_RUNTIME_INTEGRATED');
  assert.equal(readback.productionReady, false);
  assert.equal(readback.productionAdmissionAllowed, false);
  assert.equal(readback.reviewDescriptors.length, 16);
  assert.equal(readback.nextShortestStep, 'POSTG-APP-W01-A06C_RelationSpecificSurfaceTemplatesAndTitleSuppression');
});

test('invalid semantic state and premature admission fail closed', () => {
  const badClass = structuredClone(materialized);
  badClass.descriptors[0].semanticClass = 'INVALID_SEMANTIC_CLASS';
  assert.equal(
    validateW01SemanticClassQuantitySchemaRuntime(badClass).structuralIssues
      .some((row) => row.code === 'POSTG_APP_W01_A06B_SEMANTIC_CLASS_INVALID'),
    true
  );

  const visibleMacro = structuredClone(materialized);
  visibleMacro.descriptors[0].contextMetadata.macroHeadingVisiblePerQuestion = true;
  assert.equal(
    validateW01SemanticClassQuantitySchemaRuntime(visibleMacro).structuralIssues
      .some((row) => row.code === 'POSTG_APP_W01_A06B_MACRO_VISIBILITY_POLICY_INVALID'),
    true
  );

  const admitted = structuredClone(materialized);
  admitted.descriptors[0].productionAdmissionAllowed = true;
  assert.equal(
    validateW01SemanticClassQuantitySchemaRuntime(admitted).structuralIssues
      .some((row) => row.code === 'POSTG_APP_W01_A06B_PRODUCTION_ADMISSION_FORBIDDEN'),
    true
  );
});
