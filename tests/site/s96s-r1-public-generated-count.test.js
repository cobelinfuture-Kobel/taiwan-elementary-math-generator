import test from "node:test";
import assert from "node:assert/strict";

import { resolveWorksheetQuestionCount } from "../../site/assets/browser/pipeline/worksheet-output-count.js";
import { attachPublicControlOutputMetadata } from "../../site/assets/browser/pipeline/public-control-output-metadata.js";

test("S96S-R1 resolves the canonical dynamic worksheet questionCount", () => {
  assert.equal(resolveWorksheetQuestionCount({ questionCount: 20, questionItems: Array(20) }), 20);
  assert.equal(resolveWorksheetQuestionCount({ summary: { questionCount: 12 } }), 12);
  assert.equal(resolveWorksheetQuestionCount({ generatedQuestions: Array(8) }), 8);
  assert.equal(resolveWorksheetQuestionCount({ questionItems: Array(6) }), 6);
  assert.equal(resolveWorksheetQuestionCount({}), 0);
});

test("S96S-R1 normalizes G5A-U02 output summary for the public status panel", () => {
  const result = attachPublicControlOutputMetadata({
    ok: true,
    worksheetDocument: {
      schemaName: "G5AU02PublicDynamicWorksheet",
      questionCount: 20,
      questionItems: Array.from({ length: 20 }, (_, index) => ({ index })),
      dynamicHtml: "<!doctype html><html><body></body></html>",
    },
  }, {
    sourceId: "g5a_u02_5a02",
    questionMode: "reasoning",
    depthMode: "extended",
    contextMode: "abstract_math",
  });

  assert.equal(result.worksheetDocument.summary.questionCount, 20);
  assert.equal(result.worksheetDocument.metadata.questionCount, 20);
  assert.equal(Object.isFrozen(result.worksheetDocument.summary), true);
  assert.equal(Object.isFrozen(result.worksheetDocument.metadata), true);
});
