import test from "node:test";
import assert from "node:assert/strict";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import {
  generateG5AU02Canonical,
  validateG5AU02Canonical,
} from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import {
  enrichG5AU02GeneratedItemPrompt,
  validateG5AU02QuestionDisplayModel,
} from "../../src/curriculum/g5a-u02/question-display-model.js";
import { getG5AU02S107PatternIds } from "../../src/curriculum/g5a-u02/s107-candidate-symbolic-runtime.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const PATTERN_IDS = getG5AU02S107PatternIds();
const KINDS = new Map([
  ["ps_g5a_u02_divisor_candidate_selection", "candidate_circle_selection_row"],
  ["ps_g5a_u02_complete_factor_list_unknown_values", "symbolic_complete_factor_relation_table"],
  ["ps_g5a_u02_common_factor_concept_identification", "marked_common_factor_row"],
]);
const ANSWER_MODELS = new Map([
  ["ps_g5a_u02_divisor_candidate_selection", "selectionSetAnswer"],
  ["ps_g5a_u02_complete_factor_list_unknown_values", "structuredInferenceAnswer"],
  ["ps_g5a_u02_common_factor_concept_identification", "selectionSetAnswer"],
]);
const LAYOUTS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
  [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function gcd(a, b) {
  let x = a;
  let y = b;
  while (y !== 0) [x, y] = [y, x % y];
  return x;
}

function expectCode(item, mutate, code) {
  const changed = clone(item);
  mutate(changed);
  const result = validateG5AU02Canonical(changed);
  assert.equal(result.ok, false, `${code} should block`);
  assert.ok(result.errors.includes(code), `${code}: ${result.errors.join(",")}`);
}

function publicDocument(result, columns, rows, includeAnswerKey = true) {
  const question = result.worksheetDocument.questionItems[0];
  const displayModel = {
    questionNumberText: "1.",
    blankedDisplayText: question.prompt,
    patternId: question.patternSpecId,
    answerModelShape: question.answerModelId,
    responsePrompt: "答：________________",
    questionDisplayModel: question.questionDisplayModel,
  };
  const document = {
    unitId: "g5a_u02",
    questionDisplayModels: [displayModel],
    questionPages: [{
      pageNumber: 1,
      columns,
      rowsPerPage: rows,
      cells: [{ cellType: "question", questionNumber: 1, displayModel }],
    }],
    answerKeyPages: [],
  };
  if (includeAnswerKey) {
    document.answerKeyPages.push({
      pageNumber: 1,
      columns: 1,
      rowsPerPage: 1,
      cells: [{
        cellType: "answerKey",
        answerKeyItem: {
          ...result.worksheetDocument.answerKeyItems[0],
          promptText: question.prompt,
          questionDisplayModel: question.questionDisplayModel,
        },
      }],
    });
  }
  return document;
}

test("S107 scope is exactly orders 7, 12 and 15 from the accepted S105 program", () => {
  assert.deepEqual(PATTERN_IDS, [
    "ps_g5a_u02_divisor_candidate_selection",
    "ps_g5a_u02_complete_factor_list_unknown_values",
    "ps_g5a_u02_common_factor_concept_identification",
  ]);
});

test("S107 192/192 canonical scenarios preserve markable candidates, unique symbols and common-factor roles", () => {
  let inspected = 0;
  let multiSymbolCount = 0;

  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    for (let offset = 0; offset < 64; offset += 1) {
      const item = generateG5AU02Canonical(patternSpecId, {
        seed: 107000 + patternIndex * 1000 + offset,
      });
      const validation = validateG5AU02Canonical(item);
      assert.equal(validation.ok, true, validation.errors.join(","));
      assert.equal(item.canonicalRoute.answerModelId, ANSWER_MODELS.get(patternSpecId));
      assert.equal(item.p1CandidateSymbolicParity.status, "candidate_symbolic_common_factor_runtime");

      const enriched = enrichG5AU02GeneratedItemPrompt(item);
      const model = enriched.questionDisplayModel;
      assert.equal(model.kind, KINDS.get(patternSpecId));
      const displayValidation = validateG5AU02QuestionDisplayModel(item, model, enriched.prompt);
      assert.equal(displayValidation.ok, true, displayValidation.errors.join(","));
      assert.doesNotMatch(enriched.prompt, /●|☑|✓|✔/);

      if (patternSpecId === "ps_g5a_u02_divisor_candidate_selection") {
        assert.equal(item.data.selectionAffordance, "empty_circle_per_candidate");
        assert.ok(item.data.candidates.length >= 5);
        assert.deepEqual(
          item.data.canonicalSelections,
          item.data.candidates.filter((value) => item.data.target % value === 0),
        );
        assert.deepEqual(item.answer.selectedValues, item.data.canonicalSelections);
        assert.ok(item.data.candidates.every((value) => enriched.prompt.includes(String(value))));
      }

      if (patternSpecId === "ps_g5a_u02_complete_factor_list_unknown_values") {
        if (item.data.unknownKeys.length > 1) multiSymbolCount += 1;
        assert.equal(item.data.shownFactorList.at(-1), item.data.target);
        assert.equal(item.data.solutionCount, 1);
        assert.equal(model.symbols.length, item.data.unknownKeys.length);
        assert.ok(model.symbols.every((row) => /^[甲乙丙丁戊己庚辛]$/.test(row.symbol)));
        assert.ok(model.symbolEquations.every((equation) => equation.text.includes(String(item.data.target))));
        assert.equal(Object.keys(item.answer.inferredValues).length, item.data.unknownKeys.length);
        assert.equal(item.answer.targetNumber, item.data.target);
        assert.match(enriched.prompt, /代號方程：/);
        assert.match(enriched.prompt, /對稱位置相乘等於原數/);
      }

      if (patternSpecId === "ps_g5a_u02_common_factor_concept_identification") {
        assert.notEqual(item.data.a, item.data.b);
        assert.ok(gcd(item.data.a, item.data.b) >= 2);
        const intersection = item.data.candidateRow.filter((value) => (
          item.data.a % value === 0 && item.data.b % value === 0
        ));
        assert.deepEqual(item.data.commonFactors, intersection);
        assert.equal(item.data.smallestCommonFactor, intersection[0]);
        assert.equal(item.data.greatestCommonFactor, intersection.at(-1));
        assert.deepEqual(item.answer.selectedValues, intersection);
        assert.match(enriched.prompt, /最小公因數：______/);
        assert.match(enriched.prompt, /最大公因數：______/);
      }
      inspected += 1;
    }
  }

  assert.equal(inspected, 192);
  assert.ok(multiSymbolCount > 0);
});

test("S107 public worksheets retain 192 structured questions without answer-record leakage", () => {
  let inspected = 0;
  for (let index = 0; index < PATTERN_IDS.length; index += 1) {
    const patternSpecId = PATTERN_IDS[index];
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [patternSpecId],
      questionCount: 64,
      generationSeed: 207000 + index * 1000,
      includeAnswerKey: true,
      questionRowsPerPage: 4,
    });
    assert.equal(result.ok, true, result.errors?.join(","));
    assert.equal(result.worksheetDocument.questionItems.length, 64);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 64);
    for (const question of result.worksheetDocument.questionItems) {
      assert.equal(question.questionDisplayModel.kind, KINDS.get(patternSpecId));
      assert.equal(question.promptCompletenessStatus, "visible_unique_solution_data_complete");
      assert.equal(question.answerModelId, ANSWER_MODELS.get(patternSpecId));
      assert.equal("answer" in question, false);
      assert.equal("structuredAnswer" in question, false);
      assert.equal("answerText" in question, false);
      inspected += 1;
    }
  }
  assert.equal(inspected, 192);
});

test("S107 blocking validators reject candidate, symbolic and intersection mutations", () => {
  const candidate = generateG5AU02Canonical(PATTERN_IDS[0], { seed: 307001 });
  expectCode(candidate, (item) => { item.data.selectionAffordance = "plain_text"; }, "G5AU02_P1_CANDIDATE_SELECTION_AFFORDANCE_MISSING");
  expectCode(candidate, (item) => { item.data.canonicalSelections.pop(); }, "G5AU02_P1_CANDIDATE_DIVISIBILITY_CLASSIFICATION_MISMATCH");

  const symbolic = generateG5AU02Canonical(PATTERN_IDS[1], { seed: 307101 });
  expectCode(symbolic, (item) => { item.data.pairRelations[0].rightPosition -= 1; }, "G5AU02_P1_SYMBOLIC_FACTOR_RELATION_INCOMPLETE");
  expectCode(symbolic, (item) => { item.data.symbolEquations[0].target += 1; }, "G5AU02_P1_SYMBOLIC_FACTOR_EQUATION_MISMATCH");
  expectCode(symbolic, (item) => { item.data.solutionCount = 2; }, "G5AU02_P1_SYMBOLIC_SOLUTION_NOT_UNIQUE");

  const common = generateG5AU02Canonical(PATTERN_IDS[2], { seed: 307201 });
  expectCode(common, (item) => { item.data.factorSetA.pop(); }, "G5AU02_P1_COMMON_FACTOR_MARKING_INCOMPLETE");
  expectCode(common, (item) => { item.data.greatestCommonFactor = 1; }, "G5AU02_P1_COMMON_FACTOR_MIN_MAX_MISMATCH");
  expectCode(common, (item) => { item.data.commonFactors.pop(); }, "G5AU02_P1_COMMON_FACTOR_INTERSECTION_MISMATCH");
});

test("S107 renderer accepts all 54 pattern-layout projections with empty marks only", () => {
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [patternSpecId],
      questionCount: 1,
      generationSeed: 407000 + patternIndex,
      includeAnswerKey: true,
    });
    assert.equal(result.ok, true, result.errors?.join(","));
    for (const [columns, rows] of LAYOUTS) {
      const html = renderWorksheetDocumentToHtml(publicDocument(result, columns, rows, true), { stylesheetHref: "" });
      assert.match(html, /data-renderer-profile="g5a_u02_s104_p0_integrated_v1"/);
      assert.ok(html.includes(`data-semantic-kind="${KINDS.get(patternSpecId)}"`));
      assert.ok(html.includes(`data-g5a-u02-s107-kind="${KINDS.get(patternSpecId)}"`));
      assert.ok(html.includes(`data-layout-columns="${columns}" data-layout-rows="${rows}"`));
      assert.doesNotMatch(html, /g5a-u02-s107-(selected|checked)|●|☑|✓|✔/);
      if (patternSpecId !== PATTERN_IDS[1]) {
        assert.match(html, /g5a-u02-s107-empty-circle/);
      }
      inspected += 1;
    }
  }
  assert.equal(inspected, 54);
});

test("S107 answer boundary passes 18 pattern-layout-state projections", () => {
  const boundaryLayouts = [[3, 5], [2, 6], [1, 7]];
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [PATTERN_IDS[patternIndex]],
      questionCount: 1,
      generationSeed: 507000 + patternIndex,
      includeAnswerKey: true,
    });
    assert.equal(result.ok, true, result.errors?.join(","));
    for (const [columns, rows] of boundaryLayouts) {
      for (const includeAnswerKey of [false, true]) {
        const html = renderWorksheetDocumentToHtml(
          publicDocument(result, columns, rows, includeAnswerKey),
          { stylesheetHref: "" },
        );
        assert.equal(html.includes("worksheet-section--answer-key"), includeAnswerKey);
        assert.ok(html.includes(`data-layout-columns="${columns}" data-layout-rows="${rows}"`));
        inspected += 1;
      }
    }
  }
  assert.equal(inspected, 18);
});
