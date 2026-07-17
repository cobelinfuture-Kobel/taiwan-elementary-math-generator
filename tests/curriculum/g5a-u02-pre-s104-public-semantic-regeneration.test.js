import test from "node:test";
import assert from "node:assert/strict";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import { getG5AU02HiddenWorksheetPatternIds } from "../../src/curriculum/g5a-u02/hidden-worksheet-answer-key.js";
import {
  G5A_U02_S103_GENERATED_PROFILE_ID,
  G5A_U02_S103_SOURCE_PROFILE_ID,
} from "../../src/curriculum/g5a-u02/s103-digit-code-runtime.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const PATTERN_IDS = getG5AU02HiddenWorksheetPatternIds();
const QUESTION_COUNT = 60;
const GENERATION_SEED = 104001;

function chunk(values, size) {
  const rows = [];
  for (let index = 0; index < values.length; index += size) rows.push(values.slice(index, index + size));
  return rows;
}

function buildRegeneratedDocument() {
  const dynamic = buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: PATTERN_IDS,
    questionCount: QUESTION_COUNT,
    generationSeed: GENERATION_SEED,
    includeAnswerKey: true,
    questionRowsPerPage: 6,
    answerRowsPerPage: 6,
  });
  assert.equal(dynamic?.ok, true, dynamic?.errors?.join(","));
  const projected = projectG5AU02DynamicDocumentForGlobalLayout(dynamic);
  assert.equal(projected?.ok, true, projected?.errors?.join(","));
  const document = projected.worksheetDocument;
  const questionPages = chunk(document.questionDisplayModels, 6).map((records, pageIndex) => ({
    pageNumber: pageIndex + 1,
    columns: 2,
    cells: records.map((displayModel) => ({
      cellType: "question",
      questionNumber: displayModel.questionNumber,
      displayModel,
    })),
  }));
  const answerKeyPages = chunk(document.answerKeyItems, 6).map((records, pageIndex) => ({
    pageNumber: pageIndex + 1,
    columns: 1,
    cells: records.map((answerKeyItem) => ({ cellType: "answerKey", answerKeyItem })),
  }));
  const printable = {
    ...document,
    title: "五上因數與公因數｜Pre-S104語意修正版",
    subtitle: "60題題目卷與答案卷",
    questionPages,
    answerKeyPages,
  };
  const html = renderWorksheetDocumentToHtml(printable, { stylesheetHref: "" });
  return { dynamic, document, printable, html };
}

function recordsFor(document, patternSpecId) {
  return document.questionItems.filter((item) => item.patternSpecId === patternSpecId);
}

function answersFor(document, patternSpecId) {
  return document.answerKeyItems.filter((item) => item.patternSpecId === patternSpecId);
}

test("Pre-S104 regeneration produces 60 answerable questions across all 22 canonical patterns", () => {
  const { document } = buildRegeneratedDocument();
  assert.equal(document.questionItems.length, QUESTION_COUNT);
  assert.equal(document.answerKeyItems.length, QUESTION_COUNT);
  assert.deepEqual(new Set(document.questionItems.map((item) => item.patternSpecId)), new Set(PATTERN_IDS));
  assert.ok(document.questionItems.every((item) => item.promptCompletenessStatus === "visible_unique_solution_data_complete"
    || item.promptCompletenessStatus === "not_required_for_pattern"));
  assert.ok(document.questionItems.every((item) => !("answer" in item) && !("structuredAnswer" in item) && !("answerText" in item)));
});

test("Pre-S104 regeneration preserves S101 partition and geometry representations", () => {
  const { document, html } = buildRegeneratedDocument();
  const partition = recordsFor(document, "ps_g5a_u02_equal_partition_all_segment_counts");
  const rectangle = recordsFor(document, "ps_g5a_u02_rectangle_square_side_lengths");
  const tile = recordsFor(document, "ps_g5a_u02_square_tile_area_possibilities");
  assert.ok(partition.length > 0 && rectangle.length > 0 && tile.length > 0);
  for (const item of partition) {
    assert.equal(item.questionDisplayModel.kind, "partition_count_length_pairs");
    assert.ok(item.questionDisplayModel.pairs.every((pair) => pair.segmentCount * pair.lengthPerSegment === item.questionDisplayModel.totalLength));
  }
  for (const item of rectangle) assert.equal(item.questionDisplayModel.kind, "rectangle_square_partition_diagram");
  for (const item of tile) {
    assert.equal(item.questionDisplayModel.kind, "square_tile_side_area_chain");
    assert.ok(item.questionDisplayModel.sideAreaPairs.every((pair) => pair.tileArea === pair.sideLength ** 2));
  }
  assert.match(html, /data-g5a-u02-s101-kind="partition_count_length_pairs"/);
  assert.match(html, /data-g5a-u02-s101-kind="rectangle_square_partition_diagram"/);
  assert.match(html, /data-g5a-u02-s101-kind="square_tile_side_area_chain"/);
});

test("Pre-S104 regeneration uses nondegenerate S102 operands and visible factor-set witnesses", () => {
  const { document, html } = buildRegeneratedDocument();
  const patternIds = ["ps_g5a_u02_common_factor_enumeration", "ps_g5a_u02_greatest_common_factor"];
  for (const patternSpecId of patternIds) {
    const rows = recordsFor(document, patternSpecId);
    assert.ok(rows.length > 0);
    for (const item of rows) {
      const model = item.questionDisplayModel;
      assert.notEqual(model.a, model.b);
      assert.notDeepEqual(model.factorSetA, model.factorSetB);
      const answer = document.answerKeyItems.find((row) => row.questionNumber === item.questionNumber).structuredAnswer;
      assert.ok(answer.commonFactors.length > 1);
      assert.ok(answer.greatestCommonFactor >= 2);
      assert.ok(answer.greatestCommonFactor < Math.min(model.a, model.b));
    }
  }
  assert.match(html, /data-g5a-u02-s102-kind="parallel_factor_sets_with_intersection"/);
  assert.match(html, /data-g5a-u02-s102-kind="common_factor_set_with_gcf"/);
  assert.match(html, /公因數（交集）/);
});

test("Pre-S104 regeneration excludes source 1725 from default S103 allocation", () => {
  const { document, html } = buildRegeneratedDocument();
  const questions = recordsFor(document, "ps_g5a_u02_multi_constraint_digit_code");
  const answers = answersFor(document, "ps_g5a_u02_multi_constraint_digit_code");
  assert.ok(questions.length >= 2);
  assert.equal(questions.length, answers.length);
  for (const item of questions) {
    assert.equal(item.questionDisplayModel.profileId, G5A_U02_S103_GENERATED_PROFILE_ID);
    assert.notEqual(item.questionDisplayModel.profileId, G5A_U02_S103_SOURCE_PROFILE_ID);
    assert.equal(item.questionDisplayModel.productionAllocation, "default_regeneration");
    assert.equal(item.questionDisplayModel.solutionCount, 1);
  }
  assert.ok(answers.every((answer) => answer.structuredAnswer.value !== 1725));
  assert.match(html, /data-g5a-u02-s103-kind="unique_digit_code_constraints"/);
  assert.doesNotMatch(html, /來源參考題/);
});

test("Pre-S104 public wording contains no internal placeholders or decimal-like statement numbers", () => {
  const { document, html } = buildRegeneratedDocument();
  const unknownQuestions = recordsFor(document, "ps_g5a_u02_complete_factor_list_unknown_values");
  const unknownAnswers = answersFor(document, "ps_g5a_u02_complete_factor_list_unknown_values");
  assert.ok(unknownQuestions.length > 0);
  assert.ok(unknownQuestions.every((item) => item.questionDisplayModel.sequence.some((entry) => entry.role === "unknown" && ["甲", "乙", "丙", "丁"].includes(entry.text))));
  assert.ok(unknownAnswers.every((item) => /甲=/.test(item.answerText)));
  const joined = `${document.questionItems.map((item) => item.prompt).join("\n")}\n${document.answerKeyItems.map((item) => item.answerText).join("\n")}\n${html}`;
  assert.doesNotMatch(joined, /\bp\d+\b/i);
  assert.doesNotMatch(joined, /\b\d+\.\d+\s+是/);
  assert.match(joined, /①/);
});

test("Pre-S104 answer key satisfies explanation and unit instructions", () => {
  const { document } = buildRegeneratedDocument();
  const judgementAnswers = answersFor(document, "ps_g5a_u02_factor_statement_judgement");
  assert.ok(judgementAnswers.length > 0);
  assert.ok(judgementAnswers.every((answer) => answer.answerText.includes("÷")
    && (answer.answerText.includes("沒有餘數") || answer.answerText.includes("不能整除"))));
  const groupingAnswers = answersFor(document, "ps_g5a_u02_maximum_equal_grouping");
  assert.ok(groupingAnswers.length > 0);
  assert.ok(groupingAnswers.every((answer) => answer.answerText.endsWith("組")));
  const statementAnswers = answersFor(document, "ps_g5a_u02_complete_factor_list_statement_evaluation");
  assert.ok(statementAnswers.every((answer) => answer.answerText.includes("①") && answer.answerText.includes("④")));
});

test("Pre-S104 public renderer emits the integrated semantic profile without answer leakage", () => {
  const { html } = buildRegeneratedDocument();
  assert.match(html, /data-renderer-profile="g5a_u02_pre_s104_semantic_v1"/);
  assert.match(html, /data-g5a-u02-public-symbol-kind="symbolic_complete_factor_sequence"/);
  assert.doesNotMatch(html, /source_1725_reference/);
  assert.doesNotMatch(html, /ps_g5a_u02_|fm_g5a_u02_|fmc_g5a_u02_|pg_g5a_u02_|kp_g5a_u02_/);
  const questionSection = html.split("worksheet-section--answer-key")[0];
  const digitAnswers = answersFor(buildRegeneratedDocument().document, "ps_g5a_u02_multi_constraint_digit_code");
  for (const answer of digitAnswers) assert.equal(questionSection.includes(String(answer.structuredAnswer.value)), false);
});
