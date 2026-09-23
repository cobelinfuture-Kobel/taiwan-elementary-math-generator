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
import { getG5AU02S106PatternIds } from "../../src/curriculum/g5a-u02/s106-factor-structure-runtime.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const PATTERN_IDS = getG5AU02S106PatternIds();
const KINDS = new Map([
  ["ps_g5a_u02_factor_pair_enumeration", "factor_pair_search_stop_boundary"],
  ["ps_g5a_u02_factor_order_and_symmetry", "u_shaped_factor_symmetry_record"],
  ["ps_g5a_u02_missing_factor_reconstruction", "masked_factor_table_with_pair_cues"],
]);
const ANSWER_MODELS = new Map([
  ["ps_g5a_u02_factor_pair_enumeration", "factorPairListAnswer"],
  ["ps_g5a_u02_factor_order_and_symmetry", "orderedFactorRelationAnswer"],
  ["ps_g5a_u02_missing_factor_reconstruction", "missingValueMapAnswer"],
]);
const LAYOUTS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
  [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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

test("S106 scope is exactly orders 3, 5 and 6 from the accepted S105 program", () => {
  assert.deepEqual(PATTERN_IDS, [
    "ps_g5a_u02_factor_pair_enumeration",
    "ps_g5a_u02_factor_order_and_symmetry",
    "ps_g5a_u02_missing_factor_reconstruction",
  ]);
});

test("S106 192/192 canonical scenarios preserve search boundary, symmetry and unique masked completion", () => {
  let inspected = 0;
  let squareCount = 0;
  let nonsquareCount = 0;

  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    for (let offset = 0; offset < 64; offset += 1) {
      const item = generateG5AU02Canonical(patternSpecId, {
        seed: 106000 + patternIndex * 1000 + offset,
      });
      const validation = validateG5AU02Canonical(item);
      assert.equal(validation.ok, true, validation.errors.join(","));
      assert.equal(item.canonicalRoute.answerModelId, ANSWER_MODELS.get(patternSpecId));
      assert.equal(item.p1FactorStructureParity.status, "factor_search_symmetry_masked_table_runtime");

      const enriched = enrichG5AU02GeneratedItemPrompt(item);
      assert.equal(enriched.questionDisplayModel.kind, KINDS.get(patternSpecId));
      const displayValidation = validateG5AU02QuestionDisplayModel(
        item,
        enriched.questionDisplayModel,
        enriched.prompt,
      );
      assert.equal(displayValidation.ok, true, displayValidation.errors.join(","));

      if (patternSpecId === "ps_g5a_u02_factor_pair_enumeration") {
        assert.equal(item.data.searchEnd, Math.floor(Math.sqrt(item.data.target)));
        assert.equal(item.data.crossingBoundary, item.data.searchEnd + 1);
        assert.equal(item.data.searchRows.length, item.data.crossingBoundary);
        assert.equal(item.data.searchRows.at(-1).searchStatus, "crossed_boundary");
        assert.ok(item.data.searchRows.slice(0, -1).every((row) => row.searchStatus === "within_boundary"));
        assert.deepEqual(item.answer.pairs, item.data.factorPairs);
        for (const [left, right] of item.answer.pairs) {
          assert.equal(left * right, item.data.target);
          assert.equal(enriched.prompt.includes(`${left} × ${right}`), false);
          assert.equal(enriched.prompt.includes(`${left}×${right}`), false);
        }
      }

      if (patternSpecId === "ps_g5a_u02_factor_order_and_symmetry") {
        const square = Number.isInteger(Math.sqrt(item.data.target));
        if (square) squareCount += 1;
        else nonsquareCount += 1;
        assert.equal(
          item.data.midpointPolicy,
          square ? "single_square_root_center" : "none",
        );
        assert.deepEqual(item.answer.factorList, item.data.orderedFactors);
        assert.deepEqual(item.answer.symmetricPairs, item.data.symmetricPairs);
        assert.equal(item.data.outerToInnerLinks.length, item.data.symmetricPairs.length);
        assert.ok(item.data.outerToInnerLinks.every((link) => link.product === item.data.target));
      }

      if (patternSpecId === "ps_g5a_u02_missing_factor_reconstruction") {
        const nullPositions = item.data.visibleValues
          .map((value, index) => value === null ? index : null)
          .filter((value) => value !== null);
        assert.deepEqual(nullPositions, item.data.hiddenPositions);
        assert.equal(item.data.solutionCount, 1);
        assert.equal(Object.keys(item.answer.valuesByPosition).length, item.data.hiddenPositions.length);
        assert.ok(item.data.pairLinks.length >= 1);
        assert.match(enriched.prompt, /配對提示：/);
        assert.match(enriched.prompt, /□/);
      }
      inspected += 1;
    }
  }

  assert.equal(inspected, 192);
  assert.ok(squareCount > 0);
  assert.ok(nonsquareCount > 0);
});

test("S106 public worksheets retain 192 structured questions without answer-record leakage", () => {
  let inspected = 0;
  for (let index = 0; index < PATTERN_IDS.length; index += 1) {
    const patternSpecId = PATTERN_IDS[index];
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [patternSpecId],
      questionCount: 64,
      generationSeed: 206000 + index * 1000,
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

test("S106 blocking validators reject factor-structure mutations", () => {
  const search = generateG5AU02Canonical(PATTERN_IDS[0], { seed: 306001 });
  expectCode(search, (item) => { item.data.searchRows.pop(); }, "G5AU02_P1_FACTOR_PAIR_SEARCH_ROWS_INCOMPLETE");
  expectCode(search, (item) => { item.data.crossingBoundary += 1; }, "G5AU02_P1_FACTOR_PAIR_STOP_BOUNDARY_INVALID");
  expectCode(search, (item) => { item.data.factorPairs[0][1] += 1; }, "G5AU02_P1_FACTOR_PAIR_PRODUCT_MISMATCH");

  const symmetry = generateG5AU02Canonical(PATTERN_IDS[1], { seed: 306101 });
  expectCode(symmetry, (item) => { item.data.orderedFactors.reverse(); }, "G5AU02_P1_FACTOR_SYMMETRY_ORDER_INVALID");
  expectCode(symmetry, (item) => { item.data.outerToInnerLinks[0].rightPosition -= 1; }, "G5AU02_P1_U_RECORD_LINK_MISMATCH");
  expectCode(symmetry, (item) => { item.data.midpointPolicy = "duplicated_square_root"; }, "G5AU02_P1_FACTOR_SYMMETRY_MIDPOINT_INVALID");

  const masked = generateG5AU02Canonical(PATTERN_IDS[2], { seed: 306201 });
  expectCode(masked, (item) => { item.data.visibleValues.pop(); }, "G5AU02_P1_MASKED_FACTOR_TABLE_INCOMPLETE");
  expectCode(masked, (item) => { item.data.pairLinks[0].rightPosition -= 1; }, "G5AU02_P1_PAIR_SYMMETRY_CUE_INVALID");
  expectCode(masked, (item) => { item.data.solutionCount = 2; }, "G5AU02_P1_MISSING_FACTOR_NOT_UNIQUE");
});

test("S106 renderer accepts all 54 pattern-layout projections", () => {
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [patternSpecId],
      questionCount: 1,
      generationSeed: 406000 + patternIndex,
      includeAnswerKey: true,
    });
    assert.equal(result.ok, true, result.errors?.join(","));
    for (const [columns, rows] of LAYOUTS) {
      const html = renderWorksheetDocumentToHtml(
        publicDocument(result, columns, rows, true),
        { stylesheetHref: "" },
      );
      assert.match(html, /data-renderer-profile="g5a_u02_s104_p0_integrated_v1"/);
      assert.ok(html.includes(`data-semantic-kind="${KINDS.get(patternSpecId)}"`));
      assert.ok(html.includes(`data-g5a-u02-s106-kind="${KINDS.get(patternSpecId)}"`));
      assert.ok(html.includes(`data-layout-columns="${columns}" data-layout-rows="${rows}"`));
      inspected += 1;
    }
  }
  assert.equal(inspected, 54);
});

test("S106 answer boundary passes 18 pattern-layout-state projections", () => {
  const boundaryLayouts = [[3, 5], [2, 6], [1, 7]];
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [PATTERN_IDS[patternIndex]],
      questionCount: 1,
      generationSeed: 506000 + patternIndex,
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
