import assert from "node:assert/strict";
import test from "node:test";

import {
  buildBatchABrowserWorksheetDocument,
  dedupeG4BU01PublicIssues,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59j-r1-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES,
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
} from "../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js";
import {
  compactG4BU01AnswerPrompt,
  compactG4BU01QuestionPrompt,
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s59j-r1-extension.js";

const OPTIONS = Object.freeze({
  sourceId: "g4b_u01_4b01",
  selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
  selectedKnowledgePointIds: [...G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS],
  selectedPatternGroupIds: [...G4B_U01_PROMOTED_PATTERN_GROUP_IDS],
  questionCount: 120,
  ordering: "shuffleAcrossPatterns",
  includeAnswerKey: true,
  generationSeed: "s59j-r1-g4b-u01-layout-regression",
  printLayout: { columns: 3, rowsPerPage: 4, showAnswerKeyPage: true },
});

test("S59J-R1 deduplicates repeated validator warnings and localizes them to Traditional Chinese", () => {
  const warnings = dedupeG4BU01PublicIssues([
    {
      code: "G4B_U01_LOW_CARRY_COMPLEXITY_WARNING",
      severity: "warning",
      message: "The ones-place multiplication does not require carrying.",
    },
    {
      code: "G4B_U01_LOW_CARRY_COMPLEXITY_WARNING",
      severity: "warning",
      message: "The ones-place multiplication does not require carrying.",
    },
    {
      code: "G4B_U01_REPEATED_SIGNATURE_WARNING",
      severity: "warning",
      message: "The same PatternSpec/operand signature was already observed.",
    },
  ]);

  assert.deepEqual(warnings.map((warning) => warning.code), [
    "G4B_U01_LOW_CARRY_COMPLEXITY_WARNING",
    "G4B_U01_REPEATED_SIGNATURE_WARNING",
  ]);
  assert.deepEqual(warnings.map((warning) => warning.message), [
    "部分乘法題的個位計算不需要進位。",
    "部分題目組合重複；答案與題型驗證仍然通過。",
  ]);
  assert.ok(warnings.every((warning) => !/[A-Za-z]{4,}/.test(warning.message)));
});

test("S59J-R1 compacts remainder blanks and removes answer-key write-in blanks", () => {
  assert.equal(
    compactG4BU01QuestionPrompt("30300 ÷ 700 = ______……______"),
    "30300 ÷ 700 = ____……____",
  );
  assert.equal(
    compactG4BU01AnswerPrompt("30300 ÷ 700 = ______……______"),
    "30300 ÷ 700 =",
  );
  assert.equal(
    compactG4BU01AnswerPrompt("90000 ÷ 5000 = ______"),
    "90000 ÷ 5000 =",
  );
});

test("S59J-R1 builds the reported 120-question 3-column 4-row public worksheet without warning duplication", () => {
  const result = buildBatchABrowserWorksheetDocument(OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 120);
  assert.equal(result.worksheetDocument.questionPages.length, 10);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 120);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 4);
  assert.equal(result.worksheetDocument.printOptions.columns, 3);
  assert.equal(result.worksheetDocument.printOptions.rowsPerPage, 4);
  assert.equal(result.worksheetDocument.printOptions.answerKeyColumns, 3);
  assert.equal(result.worksheetDocument.printOptions.answerKeyRowsPerPage, 10);
  assert.equal(new Set(result.warnings.map((warning) => warning.code)).size, result.warnings.length);
  assert.ok(result.warnings.every((warning) => !/[A-Za-z]{4,}/.test(warning.message)));
});

test("S59J-R1 HTML applies compact question and answer-card layout without long remainder placeholders", () => {
  const result = buildBatchABrowserWorksheetDocument(OPTIONS);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, {
    title: "4B-U01 S59J-R1 layout regression",
    stylesheetHref: "",
    debugDataAttributes: false,
  });

  assert.match(html, /data-s59j-r1-layout-fullfix="true"/);
  assert.match(html, /g4b-u01-s59j-r1-layout-style/);
  assert.match(html, /grid-template-areas: "number prompt" "answer answer"/);
  assert.doesNotMatch(html, /______……______/);
  assert.doesNotMatch(html, /worksheet-cell--answer-key[^<]*>[\s\S]*?worksheet-cell__prompt">[^<]*_{2,}/);
  assert.doesNotMatch(html, /The ones-place multiplication does not require carrying/);
});
