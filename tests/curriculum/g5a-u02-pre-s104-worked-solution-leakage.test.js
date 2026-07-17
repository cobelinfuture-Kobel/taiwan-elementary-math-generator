import test from "node:test";
import assert from "node:assert/strict";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const SOURCE_ID = "g5a_u02_5a02";
const FACTOR_RELATION = "ps_g5a_u02_factor_relation_equivalence";
const TRIAL_DIVISION = "ps_g5a_u02_factor_enumeration_trial_division";

function chunk(values, size) {
  const rows = [];
  for (let index = 0; index < values.length; index += size) rows.push(values.slice(index, index + size));
  return rows;
}

function build(patternSpecIds, questionCount, generationSeed) {
  const dynamic = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds,
    questionCount,
    generationSeed,
    includeAnswerKey: true,
    questionRowsPerPage: 6,
    answerRowsPerPage: 6,
  });
  assert.equal(dynamic?.ok, true, dynamic?.errors?.join(","));
  return dynamic.worksheetDocument;
}

function render(document) {
  const projected = projectG5AU02DynamicDocumentForGlobalLayout({ ok: true, errors: [], worksheetDocument: document });
  assert.equal(projected?.ok, true, projected?.errors?.join(","));
  const projectedDocument = projected.worksheetDocument;
  const printable = {
    ...projectedDocument,
    questionPages: chunk(projectedDocument.questionDisplayModels, 6).map((records, pageIndex) => ({
      pageNumber: pageIndex + 1,
      columns: 2,
      cells: records.map((displayModel) => ({
        cellType: "question",
        questionNumber: displayModel.questionNumber,
        displayModel,
      })),
    })),
    answerKeyPages: chunk(projectedDocument.answerKeyItems, 6).map((records, pageIndex) => ({
      pageNumber: pageIndex + 1,
      columns: 1,
      cells: records.map((answerKeyItem) => ({ cellType: "answerKey", answerKeyItem })),
    })),
  };
  return renderWorksheetDocumentToHtml(printable, { stylesheetHref: "" });
}

test("factor-relation questions retain blank method scaffolds without solved multiplication or division", () => {
  const document = build([FACTOR_RELATION], 64, 104201);
  for (const item of document.questionItems) {
    const model = item.questionDisplayModel;
    const multiply = model.multiplicationWitness;
    const divide = model.divisionWitness;
    assert.match(item.prompt, /乘法：_+/);
    assert.match(item.prompt, /除法：_+/);
    assert.match(item.prompt, /判斷：_+/);
    assert.equal(item.prompt.includes(`${multiply.factorA}×${multiply.factorB}=${multiply.product}`), false);
    assert.equal(item.prompt.includes(`${divide.dividend}÷${divide.divisor}=${divide.quotient}`), false);
  }
});

test("trial-division questions prefill only divisors and leave quotient remainder and judgement blank", () => {
  const document = build([TRIAL_DIVISION], 64, 104301);
  for (const item of document.questionItems) {
    const model = item.questionDisplayModel;
    for (const row of model.rows) {
      assert.match(item.prompt, new RegExp(`除數 ${row.divisor}：商 _+，餘數 _+，是否整除 _+`));
      assert.equal(item.prompt.includes(`${row.divisor}/${row.quotient}/${row.remainder}`), false);
    }
    assert.equal(item.prompt.includes("✓整除"), false);
    assert.equal(item.prompt.includes("×"), false);
    assert.match(item.prompt, /因數：_+/);
  }
});

test("rendered student section contains no S100 worked-solution strings while answer section remains separate", () => {
  const document = build([FACTOR_RELATION, TRIAL_DIVISION], 12, 104401);
  const html = render(document);
  const [questionSection, answerSection = ""] = html.split("worksheet-section--answer-key");
  assert.match(questionSection, /乘法：_+/);
  assert.match(questionSection, /除法：_+/);
  assert.match(questionSection, /是否整除 _+/);
  for (const item of document.questionItems) {
    const model = item.questionDisplayModel;
    if (model.kind === "factor_relation_dual_witness") {
      const multiply = model.multiplicationWitness;
      const divide = model.divisionWitness;
      assert.equal(questionSection.includes(`${multiply.factorA}×${multiply.factorB}=${multiply.product}`), false);
      assert.equal(questionSection.includes(`${divide.dividend}÷${divide.divisor}=${divide.quotient}`), false);
    }
    if (model.kind === "trial_division_table") {
      for (const row of model.rows) {
        assert.equal(questionSection.includes(`${row.divisor}/${row.quotient}/${row.remainder}`), false);
      }
    }
  }
  assert.ok(answerSection.length > 0);
});
