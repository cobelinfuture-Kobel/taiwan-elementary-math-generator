import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW01SemanticClassQuantitySchemaReadback
} from '../../src/curriculum/application/w01-semantic-class-quantity-schema-runtime.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

const REQUIRED_REMEDIATION_CODES = Object.freeze([
  'APPSEM_VISIBLE_MACRO_LABEL_FORBIDDEN',
  'APPSEM_EXPRESSION_WRAPPER_PROSE_FORBIDDEN',
  'APPSEM_OPERAND_QUANTITY_BINDING_MISSING',
  'APPSEM_RELATION_TARGET_MISMATCH',
  'APPSEM_GENERIC_TOTAL_TARGET_FORBIDDEN',
  'APPSEM_FORCED_APPLICATION_FOR_NUMERIC_ONLY',
  'APPSEM_ANSWER_UNIT_MISMATCH',
  'APPSEM_HUMAN_NATURALNESS_REVIEW_REQUIRED'
]);

export function runPOSTGAPPW01A06BSemanticRuntimeValidation() {
  const first = buildW01SemanticClassQuantitySchemaReadback({ root: ROOT });
  const second = buildW01SemanticClassQuantitySchemaReadback({ root: ROOT });
  const remediationCodeSet = new Set(first.remediationIssues.map((row) => row.code));
  const compare = first.reviewDescriptors.find((row) => row.knowledgePointId === 'kp_g3a_u01_4digit_compare');
  const range = first.reviewDescriptors.find((row) => row.knowledgePointId === 'kp_g3a_u01_range_reasoning');
  const addition = first.reviewDescriptors.find((row) => row.knowledgePointId === 'kp_g3a_u02_add_multi_carry');
  const numericOnly = first.reviewDescriptors.find((row) => row.knowledgePointId === 'kp_g4a_u01_digit_arrangement_max_min');
  const deterministic = JSON.stringify(first.counts) === JSON.stringify(second.counts)
    && JSON.stringify(first.reviewDescriptors) === JSON.stringify(second.reviewDescriptors)
    && JSON.stringify(first.remediationIssues) === JSON.stringify(second.remediationIssues);
  const consumerGate = Boolean(
    first.ok
    && first.actualEvidenceLevel === 'E3_SHADOW_RUNTIME_INTEGRATED'
    && first.productionReady === false
    && first.productionAdmissionAllowed === false
    && first.counts.reviewDescriptorCount === 16
    && first.counts.structuralIssueCount === 0
    && first.counts.remediationIssueCount > 0
    && REQUIRED_REMEDIATION_CODES.every((code) => remediationCodeSet.has(code))
    && compare?.semanticClass === 'COMPARE_TWO_GROUPS_SAME_MEASURE'
    && compare?.answerSchema?.unitPolicy === 'NO_UNIT'
    && range?.semanticClass === 'RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE'
    && range?.answerSchema?.unitPolicy === 'NO_UNIT'
    && addition?.semanticClass === 'JOIN_RESULT_TOTAL'
    && numericOnly?.semanticClass === 'NUMERIC_ONLY'
    && numericOnly?.suitability === 'NUMERIC_ONLY'
  );
  return {
    ...first,
    deterministicSecondPassEqual: deterministic,
    consumerGate,
    requiredRemediationCodes: REQUIRED_REMEDIATION_CODES,
    validationStatus: first.ok && deterministic && consumerGate
      ? 'PASS_POSTG_APP_W01_A06B_SEMANTIC_CLASS_QUANTITY_SCHEMA_RUNTIME'
      : 'FAIL_POSTG_APP_W01_A06B_SEMANTIC_CLASS_QUANTITY_SCHEMA_RUNTIME'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW01A06BSemanticRuntimeValidation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W01_A06B_SEMANTIC_CLASS_QUANTITY_SCHEMA_RUNTIME') {
    process.exitCode = 1;
  }
}
