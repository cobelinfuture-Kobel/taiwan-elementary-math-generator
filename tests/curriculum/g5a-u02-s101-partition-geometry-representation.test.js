import test from "node:test";
import assert from "node:assert/strict";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import { generateG5AU02Canonical, validateG5AU02Canonical } from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import { enrichG5AU02GeneratedItemPrompt } from "../../src/curriculum/g5a-u02/question-display-model.js";
import { getG5AU02S101PatternIds } from "../../src/curriculum/g5a-u02/s101-representation-runtime.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const PATTERN_IDS = getG5AU02S101PatternIds();
const KINDS = new Map([
  ["ps_g5a_u02_equal_partition_all_segment_counts", "partition_count_length_pairs"],
  ["ps_g5a_u02_rectangle_square_side_lengths", "rectangle_square_partition_diagram"],
  ["ps_g5a_u02_square_tile_area_possibilities", "square_tile_side_area_chain"],
]);
const ANSWER_MODELS = new Map([
  ["ps_g5a_u02_equal_partition_all_segment_counts", "partitionPairListAnswer"],
  ["ps_g5a_u02_rectangle_square_side_lengths", "lengthListAnswer"],
  ["ps_g5a_u02_square_tile_area_possibilities", "tileSideAreaPairListAnswer"],
]);

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function expectCode(item, mutate, code) {
  const changed = clone(item);
  mutate(changed);
  const validation = validateG5AU02Canonical(changed);
  assert.equal(validation.ok, false, code);
  assert.ok(validation.errors.includes(code), validation.errors.join(","));
}

test("S101 scope is exactly the three S99 partition and geometry PatternSpecs", () => {
  assert.deepEqual(PATTERN_IDS, [
    "ps_g5a_u02_equal_partition_all_segment_counts",
    "ps_g5a_u02_rectangle_square_side_lengths",
    "ps_g5a_u02_square_tile_area_possibilities",
  ]);
});

test("S101 192/192 canonical scenarios retain paired roles and bounded geometry", () => {
  let inspected = 0;
  for (let patternIndex = 0; patternIndex < PATTERN_IDS.length; patternIndex += 1) {
    const patternSpecId = PATTERN_IDS[patternIndex];
    for (let offset = 0; offset < 64; offset += 1) {
      const item = generateG5AU02Canonical(patternSpecId, { seed: 101000 + patternIndex * 1000 + offset });
      const validation = validateG5AU02Canonical(item);
      assert.equal(validation.ok, true, validation.errors.join(","));
      assert.equal(item.canonicalRoute.answerModelId, ANSWER_MODELS.get(patternSpecId));
      const enriched = enrichG5AU02GeneratedItemPrompt(item);
      assert.equal(enriched.questionDisplayModel.kind, KINDS.get(patternSpecId));
      assert.ok(enriched.prompt.includes("所有"));
      if (patternIndex === 0) {
        assert.ok(item.data.pairs.every((pair) => pair.segmentCount * pair.lengthPerSegment === item.data.totalLength));
        assert.deepEqual(item.answer.pairs, item.data.pairs);
      } else {
        assert.ok(item.data.diagramScale.cellCount <= 81);
        assert.equal(item.data.diagramScale.columns * item.data.diagramScale.previewSideLength, item.data.length);
        assert.equal(item.data.diagramScale.rows * item.data.diagramScale.previewSideLength, item.data.width);
      }
      if (patternIndex === 2) {
        assert.ok(item.data.sideAreaPairs.every((pair) => pair.tileArea === pair.sideLength ** 2));
        assert.deepEqual(item.answer.pairs, item.data.sideAreaPairs);
      }
      inspected += 1;
    }
  }
  assert.equal(inspected, 192);
});

test("S101 public worksheets retain 192 structured questions and additive answer models", () => {
  let inspected = 0;
  for (let index = 0; index < PATTERN_IDS.length; index += 1) {
    const patternSpecId = PATTERN_IDS[index];
    const result = buildG5AU02BrowserDynamicWorksheet({
      sourceId: "g5a_u02_5a02",
      patternSpecIds: [patternSpecId],
      questionCount: 64,
      generationSeed: 201000 + index * 1000,
      includeAnswerKey: true,
      questionRowsPerPage: 4,
    });
    assert.equal(result.ok, true, result.errors?.join(","));
    assert.equal(result.worksheetDocument.questionItems.length, 64);
    assert.equal(result.worksheetDocument.answerKeyItems.length, 64);
    for (let row = 0; row < 64; row += 1) {
      const question = result.worksheetDocument.questionItems[row];
      const answer = result.worksheetDocument.answerKeyItems[row];
      assert.equal(question.questionDisplayModel.kind, KINDS.get(patternSpecId));
      assert.equal(question.answerModelId, ANSWER_MODELS.get(patternSpecId));
      assert.equal(answer.answerModelId, ANSWER_MODELS.get(patternSpecId));
      assert.equal("answer" in question, false);
      assert.equal("structuredAnswer" in question, false);
      assert.equal("answerText" in question, false);
      inspected += 1;
    }
  }
  assert.equal(inspected, 192);
});

test("S101 blocking validators reject representation mutations", () => {
  const partition = generateG5AU02Canonical(PATTERN_IDS[0], { seed: 301001 });
  expectCode(partition, (item) => { item.data.pairs.pop(); }, "G5AU02_P0_PARTITION_PAIR_INCOMPLETE");
  expectCode(partition, (item) => { item.data.pairs[0].lengthPerSegment += 1; }, "G5AU02_P0_PARTITION_PAIR_PRODUCT_INVALID");
  expectCode(partition, (item) => { item.data.lengthUnit = ""; }, "G5AU02_P0_PARTITION_UNIT_MISSING");

  const rectangle = generateG5AU02Canonical(PATTERN_IDS[1], { seed: 302001 });
  expectCode(rectangle, (item) => { item.data.diagramScale.columns += 1; }, "G5AU02_P0_RECTANGLE_DIAGRAM_DIMENSION_MISMATCH");
  expectCode(rectangle, (item) => { item.data.candidateSideLengths.pop(); }, "G5AU02_P0_RECTANGLE_SIDE_SET_MISMATCH");

  const tile = generateG5AU02Canonical(PATTERN_IDS[2], { seed: 303001 });
  expectCode(tile, (item) => { item.data.diagramScale.rows += 1; }, "G5AU02_P0_TILE_DIAGRAM_DIMENSION_MISMATCH");
  expectCode(tile, (item) => { item.data.sideAreaPairs.pop(); }, "G5AU02_P0_TILE_SIDE_AREA_PAIR_INCOMPLETE");
  expectCode(tile, (item) => { item.data.sideAreaPairs[0].tileArea += 1; }, "G5AU02_P0_TILE_AREA_NOT_SIDE_SQUARED");
});

test("S101 public renderer emits bounded CSS geometry and paired response rows", () => {
  const source = buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: PATTERN_IDS,
    questionCount: 3,
    generationSeed: 401001,
    includeAnswerKey: true,
  });
  assert.equal(source.ok, true, source.errors?.join(","));
  const displayModels = source.worksheetDocument.questionItems.map((record) => ({
    questionNumberText: `${record.questionNumber}.`,
    blankedDisplayText: record.prompt,
    patternId: record.patternSpecId,
    answerModelShape: record.answerModelId,
    responsePrompt: "答：________________",
    questionDisplayModel: record.questionDisplayModel,
  }));
  const document = {
    unitId: "g5a_u02",
    questionDisplayModels: displayModels,
    questionPages: [{ pageNumber: 1, columns: 3, cells: displayModels.map((displayModel, index) => ({ cellType: "question", questionNumber: index + 1, displayModel })) }],
    answerKeyPages: [{ pageNumber: 1, columns: 1, cells: source.worksheetDocument.answerKeyItems.map((answerKeyItem) => ({ cellType: "answerKey", answerKeyItem: { ...answerKeyItem, promptText: source.worksheetDocument.questionItems[answerKeyItem.questionNumber - 1].prompt } })) }],
  };
  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /data-renderer-profile="g5a_u02_pre_s104_semantic_v1"/);
  for (const kind of KINDS.values()) assert.ok(html.includes(`data-g5a-u02-s101-kind="${kind}"`));
  assert.ok((html.match(/g5a-u02-semantic-diagram__cell/g) ?? []).length <= 162);
  assert.ok(html.includes("worksheet-page__grid"));
  assert.ok(html.includes("worksheet-cell--question"));
});
