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

function project(document) {
  const projected = projectG5AU02DynamicDocumentForGlobalLayout({ ok: true, errors: [], worksheetDocument: document });
  assert.equal(projected?.ok, true, projected?.errors?.join(","));
  return projected.worksheetDocument;
}

function render(document) {
  const projectedDocument = project(document);
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
  return {
    projectedDocument,
    html: renderWorksheetDocumentToHtml(printable, { stylesheetHref: "" }),
  };
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

test("self-contained method scaffolds suppress the redundant generic answer label", () => {
  const document = build([FACTOR_RELATION, TRIAL_DIVISION], 64, 104451);
  const projected = project(document);
  assert.ok(projected.questionDisplayModels.every((item) => item.responsePrompt === ""));
});

test("public answer projection keeps complete factor-relation methods only in the answer key", () => {
  const document = build([FACTOR_RELATION], 64, 104501);
  const projected = project(document);
  for (const answer of projected.answerKeyItems) {
    assert.doesNotMatch(answer.promptText, /乘法：_+|除法：_+|判斷：_+/);
    assert.match(answer.answerText, /乘法：/);
    assert.match(answer.answerText, /除法：/);
    assert.match(answer.answerText, /判斷：/);
    assert.match(answer.answerText, /×/);
    assert.match(answer.answerText, /÷/);
  }
});

test("public answer projection keeps completed trial records only in the answer key", () => {
  const document = build([TRIAL_DIVISION], 64, 104601);
  const projected = project(document);
  for (let index = 0; index < projected.answerKeyItems.length; index += 1) {
    const answer = projected.answerKeyItems[index];
    const model = document.questionItems[index].questionDisplayModel;
    assert.doesNotMatch(answer.promptText, /商 _+|餘數 _+|是否整除 _+/);
    assert.match(answer.answerText, /^試除：/);
    assert.match(answer.answerText, /；因數：/);
    for (const row of model.rows) {
      assert.ok(answer.answerText.includes(`除數 ${row.divisor}：商 ${row.quotient}，餘數 ${row.remainder}`));
      assert.ok(answer.answerText.includes(row.isExact ? "整除" : "不整除"));
    }
  }
});

test("rendered student section contains no S100 worked solutions and answer section contains the methods", () => {
  const document = build([FACTOR_RELATION, TRIAL_DIVISION], 12, 104401);
  const { html } = render(document);
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
  assert.match(answerSection, /乘法：/);
  assert.match(answerSection, /除法：/);
  assert.match(answerSection, /判斷：/);
  assert.match(answerSection, /試除：/);
  assert.match(answerSection, /因數：/);
});
