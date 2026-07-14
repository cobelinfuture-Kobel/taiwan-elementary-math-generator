import test from "node:test";
import assert from "node:assert/strict";

import { resolveWorksheetTitle } from "../../site/assets/browser/pipeline/worksheet-output-title.js";
import { attachPublicControlOutputMetadata } from "../../site/assets/browser/pipeline/public-control-output-metadata.js";

test("S96S-R2 resolves a stable user-facing worksheet title", () => {
  assert.equal(resolveWorksheetTitle({ title: "正式標題", unitTitle: "單元標題" }), "正式標題");
  assert.equal(resolveWorksheetTitle({ unitTitle: "因數與公因數" }), "因數與公因數");
  assert.equal(resolveWorksheetTitle({ title: "undefined", unitTitle: "因數與公因數" }), "因數與公因數");
  assert.equal(resolveWorksheetTitle({}, { unitTitle: "計畫單元" }), "計畫單元");
  assert.equal(resolveWorksheetTitle({}, {}), "數學練習題");
});

test("S96S-R2 normalizes the G5A-U02 dynamic title before public preview metadata", () => {
  const result = attachPublicControlOutputMetadata({
    ok: true,
    worksheetDocument: {
      schemaName: "G5AU02PublicDynamicWorksheet",
      unitTitle: "因數與公因數",
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

  assert.equal(result.worksheetDocument.title, "因數與公因數");
  assert.equal(result.worksheetDocument.metadata.title, "因數與公因數");
  assert.equal(result.worksheetDocument.summary.questionCount, 20);
  assert.equal(Object.isFrozen(result.worksheetDocument), true);
});
