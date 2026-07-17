import test from "node:test";
import assert from "node:assert/strict";

import { buildG5AU02BrowserDynamicWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const SOURCE_ID = "g5a_u02_5a02";
const PATTERN_IDS = [
  "ps_g5a_u02_factor_relation_equivalence",
  "ps_g5a_u02_factor_enumeration_trial_division",
  "ps_g5a_u02_factor_pair_enumeration",
  "ps_g5a_u02_factor_list_from_pairs",
  "ps_g5a_u02_factor_order_and_symmetry",
  "ps_g5a_u02_missing_factor_reconstruction",
  "ps_g5a_u02_divisor_candidate_selection",
  "ps_g5a_u02_factor_statement_judgement",
  "ps_g5a_u02_equal_partition_all_segment_counts",
  "ps_g5a_u02_equal_partition_range_constrained_recipients",
  "ps_g5a_u02_problem_type_classification",
  "ps_g5a_u02_complete_factor_list_unknown_values",
  "ps_g5a_u02_complete_factor_list_statement_evaluation",
  "ps_g5a_u02_remainder_transfer",
  "ps_g5a_u02_common_factor_concept_identification",
  "ps_g5a_u02_common_factor_enumeration",
  "ps_g5a_u02_greatest_common_factor",
  "ps_g5a_u02_maximum_equal_grouping",
  "ps_g5a_u02_possible_equal_packaging_counts",
  "ps_g5a_u02_rectangle_square_side_lengths",
  "ps_g5a_u02_square_tile_area_possibilities",
  "ps_g5a_u02_multi_constraint_digit_code",
];

function buildRegeneratedDocument() {
  const result = buildG5AU02BrowserDynamicWorksheet({
    sourceId: SOURCE_ID,
    patternSpecIds: PATTERN_IDS,
    questionCount: 60,
    generationSeed: "pre-s104-regeneration",
    includeAnswerKey: true,
    questionColumns: 2,
    questionRowsPerPage: 3,
    answerKeyColumns: 2,
    answerKeyRowsPerPage: 4,
  });
  assert.equal(result.ok, true, result.errors?.join(","));
  const document = result.worksheetDocument;
  const html = renderWorksheetDocumentToHtml(document, {
    title: "五上因數與公因數｜Pre-S104語意修正版",
    stylesheetHref: "",
  });
  return { result, document, html };
}

function questionsFor(document, patternSpecId) {
  return document.questionItems.filter((item) => item.patternSpecId === patternSpecId);
}

function answersFor(document, patternSpecId) {
  return document.answerKeyItems.filter((item) => item.patternSpecId === patternSpecId);
}

test("Pre-S104 regeneration produces 60 answerable questions across all 22 canonical patterns", () => {
  const { document } = buildRegeneratedDocument();
  assert.equal(document.questionItems.length, 60);
  assert.equal(document.answerKeyItems.length, 60);
  assert.equal(new Set(document.questionItems.map((item) => item.patternSpecId)).size, 22);
  assert.ok(document.questionItems.every((item) => item.promptCompletenessStatus === "visible_unique_solution_data_complete"));
});

test("Pre-S104 regeneration preserves S101 partition and geometry representations", () => {
  const { document } = buildRegeneratedDocument();
  for (const patternSpecId of [
    "ps_g5a_u02_equal_partition_all_segment_counts",
    "ps_g5a_u02_rectangle_square_side_lengths",
    "ps_g5a_u02_square_tile_area_possibilities",
  ]) {
    const rows = questionsFor(document, patternSpecId);
    assert.ok(rows.length > 0);
    assert.ok(rows.every((row) => row.questionDisplayModel));
  }
});

test("Pre-S104 regeneration uses nondegenerate S102 operands and visible factor-set witnesses", () => {
  const { document } = buildRegeneratedDocument();
  for (const patternSpecId of [
    "ps_g5a_u02_common_factor_enumeration",
    "ps_g5a_u02_greatest_common_factor",
  ]) {
    const rows = questionsFor(document, patternSpecId);
    assert.ok(rows.length > 0);
    for (const row of rows) {
      assert.notEqual(row.questionDisplayModel.comparedValues?.[0], row.questionDisplayModel.comparedValues?.[1]);
      assert.ok(row.prompt.includes("因數"));
    }
  }
});

test("Pre-S104 regeneration excludes source 1725 from default S103 allocation", () => {
  const { document } = buildRegeneratedDocument();
  const rows = questionsFor(document, "ps_g5a_u02_multi_constraint_digit_code");
  assert.ok(rows.length > 0);
  assert.ok(rows.every((row) => row.questionDisplayModel.profileId !== "source_1725_reference"));
});

test("Pre-S104 public wording contains no internal placeholders or decimal-like statement numbers", () => {
  const { document } = buildRegeneratedDocument();
  const joined = document.questionItems.map((item) => item.prompt).join("\n");
  assert.doesNotMatch(joined, /unknownKeys|shownFactorList|candidateDomain|pairRelations/);
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
  const { document, html } = buildRegeneratedDocument();
  assert.match(html, /data-renderer-profile="g5a_u02_s104_p0_integrated_v1"/);
  assert.match(html, /data-layout-columns="2" data-layout-rows="3"/);
  assert.match(html, /data-g5a-u02-s107-kind="symbolic_complete_factor_relation_table"/);
  assert.match(html, /data-g5a-u02-s107-kind="candidate_circle_selection_row"/);
  assert.match(html, /data-g5a-u02-s107-kind="marked_common_factor_row"/);
  assert.doesNotMatch(html, /data-g5a-u02-public-symbol-kind="symbolic_complete_factor_sequence"/);
  assert.doesNotMatch(html, /source_1725_reference/);
  assert.doesNotMatch(html, /ps_g5a_u02_|fm_g5a_u02_|fmc_g5a_u02_|pg_g5a_u02_|kp_g5a_u02_/);
  const questionSection = html.split("worksheet-section--answer-key")[0];
  const digitAnswers = answersFor(document, "ps_g5a_u02_multi_constraint_digit_code");
  for (const answer of digitAnswers) assert.equal(questionSection.includes(String(answer.structuredAnswer.value)), false);
});
