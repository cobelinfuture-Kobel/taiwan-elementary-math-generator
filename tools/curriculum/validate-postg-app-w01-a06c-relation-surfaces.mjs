import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  buildW01RelationSurfaceRemediationReadback
} from '../../src/curriculum/application/w01-relation-surface-remediation-runtime.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

export function runPOSTGAPPW01A06CSurfaceValidation() {
  const first = buildW01RelationSurfaceRemediationReadback({ root: ROOT });
  const second = buildW01RelationSurfaceRemediationReadback({ root: ROOT });
  const compare = first.reviewRows.find((row) => row.knowledgePointId === 'kp_g3a_u01_4digit_compare');
  const range = first.reviewRows.find((row) => row.knowledgePointId === 'kp_g3a_u01_range_reasoning');
  const addition = first.reviewRows.find((row) => row.knowledgePointId === 'kp_g3a_u02_add_multi_carry');
  const digitArrangement = first.reviewRows.find((row) => row.knowledgePointId === 'kp_g4a_u01_digit_arrangement_max_min');
  const deterministic = JSON.stringify(first.counts) === JSON.stringify(second.counts)
    && JSON.stringify(first.reviewRows) === JSON.stringify(second.reviewRows)
    && JSON.stringify(first.issues) === JSON.stringify(second.issues);
  const consumerGate = Boolean(
    first.ok
    && first.actualEvidenceLevel === 'E3_SHADOW_RUNTIME_INTEGRATED'
    && first.productionReady === false
    && first.productionAdmissionAllowed === false
    && first.counts.reviewRowCount === 16
    && first.counts.issueCount === 0
    && first.counts.mathPreservedCount === 16
    && first.counts.numberMultisetPreservedCount === 16
    && first.counts.promptChangedCount === 16
    && first.counts.visibleTitleCount === 0
    && first.counts.humanNaturalnessGateCount === 16
    && compare?.semanticClass === 'COMPARE_TWO_GROUPS_SAME_MEASURE'
    && compare?.remediatedPrompt.includes('甲隊有5979張運動會集點卡')
    && compare?.answerUnit == null
    && range?.semanticClass === 'RANGE_MEMBERSHIP_BOUNDS_AND_CANDIDATE'
    && range?.remediatedPrompt.includes('A批有2395箱')
    && range?.remediatedPrompt.includes('B批有3276箱')
    && addition?.semanticClass === 'JOIN_RESULT_TOTAL'
    && addition?.remediatedPrompt.includes('1594個寶特瓶')
    && addition?.remediatedPrompt.includes('6個寶特瓶')
    && digitArrangement?.suitability === 'NUMERIC_ONLY'
    && digitArrangement?.remediatedPrompt === digitArrangement?.originalPrompt
  );
  return {
    ...first,
    deterministicSecondPassEqual: deterministic,
    consumerGate,
    validationStatus: first.ok && deterministic && consumerGate
      ? 'PASS_POSTG_APP_W01_A06C_RELATION_SPECIFIC_SURFACE_REMEDIATION'
      : 'FAIL_POSTG_APP_W01_A06C_RELATION_SPECIFIC_SURFACE_REMEDIATION'
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = runPOSTGAPPW01A06CSurfaceValidation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.validationStatus !== 'PASS_POSTG_APP_W01_A06C_RELATION_SPECIFIC_SURFACE_REMEDIATION') {
    process.exitCode = 1;
  }
}
