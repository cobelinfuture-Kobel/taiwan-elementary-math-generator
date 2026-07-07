import test from "node:test";
import assert from "node:assert/strict";

import { buildBatchABrowserWorksheetDocument } from "../../../site/modules/curriculum/batch-a/batch-a-browser-worksheet.js";
import { BATCH_A_RESOLVER_SELECTION_MODES } from "../../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";

const SOURCE_ID = "g3b_u01_3b01";

function worksheet(kpId, groupId, questionCount) {
  return buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.SINGLE_KNOWLEDGE_POINT,
    selectedKnowledgePointIds: [kpId],
    selectedPatternGroupIds: [groupId],
    questionCount,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `s43e5-r3-unique-${kpId}`,
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  });
}

test("G3B U01 quotient-zero KP can generate a 40-question printable worksheet", () => {
  const result = worksheet("kp_g3b_u01_quotient_zero_cases", "pg_g3b_u01_quotient_zero_cases", 40);
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 40);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 40);
  assert.equal(new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId)).size, 3);
});

test("G3B U01 five-KP mixed worksheet can generate 40 questions without pool exhaustion", () => {
  const result = buildBatchABrowserWorksheetDocument({
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [
      "kp_g3b_u01_2digit_division_place_value_cases",
      "kp_g3b_u01_3digit_by_1digit_regroup_hundreds",
      "kp_g3b_u01_3digit_division_place_value_cases",
      "kp_g3b_u01_quotient_zero_cases",
      "kp_g3b_u01_division_with_remainder"
    ],
    selectedPatternGroupIds: [
      "pg_g3b_u01_2digit_division_place_value_cases",
      "pg_g3b_u01_3digit_by_1digit_regroup_hundreds",
      "pg_g3b_u01_3digit_division_place_value_cases",
      "pg_g3b_u01_quotient_zero_cases",
      "pg_g3b_u01_division_with_remainder"
    ],
    questionCount: 40,
    ordering: "shuffleAcrossPatterns",
    includeAnswerKey: true,
    generationSeed: "s43e5-r3-five-kp-unique",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true, JSON.stringify(result.errors, null, 2));
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 40);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 40);
});
