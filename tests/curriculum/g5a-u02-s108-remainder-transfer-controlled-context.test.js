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
import {
  getG5AU02S108PatternIds,
  getG5AU02S108ScenarioFamilyIds,
} from "../../src/curriculum/g5a-u02/s108-remainder-transfer-runtime.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const PATTERN_ID = "ps_g5a_u02_remainder_transfer";
const KIND = "remainder_transfer_story_witness";
const LAYOUTS = [
  [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6],
  [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6],
  [3, 1], [3, 2], [3, 3], [3, 4], [3, 5], [3, 6],
];

function clone(value) { return JSON.parse(JSON.stringify(value)); }
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

test("S108 scope is exactly order 14 from the accepted S105 program", () => {
  assert.deepEqual(getG5AU02S108PatternIds(), [PATTERN_ID]);
  assert.deepEqual(getG5AU02S108ScenarioFamilyIds(), [
    "school_sticker_packets",
    "classroom_card_bundles",
    "art_bead_bags",
    "library_book_carts",
  ]);
});

test("S108 64/64 canonical scenarios preserve finite story roles and arithmetic witnesses", () => {
  const reachedFamilies = new Set();
  for (let offset = 0; offset < 64; offset += 1) {
    const item = generateG5AU02Canonical(PATTERN_ID, { seed: 108000 + offset });
    const validation = validateG5AU02Canonical(item);
    assert.equal(validation.ok, true, validation.errors.join(","));
    assert.equal(item.canonicalRoute.answerModelId, "remainderAnswer");
    assert.equal(item.p2RemainderTransferParity.status, "finite_controlled_story_roles_and_witness_runtime");
    reachedFamilies.add(item.data.scenarioFamilyId);
    assert.equal(item.data.total, item.data.dividend);
    assert.equal(item.data.largerDivisor, item.data.smallerDivisor * item.data.multiplier);
    assert.ok(item.data.remainder > 0 && item.data.remainder < item.data.smallerDivisor);
    assert.equal(item.data.total, item.data.largerDivisor * item.data.distributionWitness.knownDistribution.quotient + item.data.remainder);
    assert.equal(item.data.total, item.data.smallerDivisor * item.data.distributionWitness.transferredDistribution.quotient + item.data.remainder);
    assert.equal(item.answer.remainder, item.data.total % item.data.smallerDivisor);
    const enriched = enrichG5AU02GeneratedItemPrompt(item);
    assert.equal(enriched.questionDisplayModel.kind, KIND);
    assert.equal(enriched.questionDisplayModel.scenarioFamilyId, item.data.scenarioFamilyId);
    assert.match(enriched.prompt, /除數關係：\d+＝\d+×\d+/);
    assert.match(enriched.prompt, /已知分裝：\d+ ÷ \d+ 餘 \d+/);
    assert.match(enriched.prompt, /改分裝：\d+ ÷ \d+ 餘 ______/);
    assert.equal(enriched.prompt.includes(item.data.distributionWitness.transferredDistribution.equationText), false);
    assert.equal(enriched.questionDisplayModel.distributionWitness.transferredDistribution.quotientResponseText, "______");
    assert.equal(enriched.questionDisplayModel.distributionWitness.transferredDistribution.remainderResponseText, "______");
    const displayValidation = validateG5AU02QuestionDisplayModel(item, enriched.questionDisplayModel, enriched.prompt);
    assert.equal(displayValidation.ok, true, displayValidation.errors.join(","));
  }
  assert.deepEqual([...reachedFamilies].sort(), [...getG5AU02S108ScenarioFamilyIds()].sort());
});

test("S108 public worksheet retains 64 structured questions without answer-record or worked-solution leakage", () => {
  const result = buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: [PATTERN_ID],
    questionCount: 64,
    generationSeed: 208000,
    includeAnswerKey: true,
    questionRowsPerPage: 4,
  });
  assert.equal(result.ok, true, result.errors?.join(","));
  assert.equal(result.worksheetDocument.questionItems.length, 64);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 64);
  for (const question of result.worksheetDocument.questionItems) {
    assert.equal(question.questionDisplayModel.kind, KIND);
    assert.equal(question.promptCompletenessStatus, "visible_unique_solution_data_complete");
    assert.equal(question.answerModelId, "remainderAnswer");
    assert.match(question.questionDisplayModel.distributionWitness.transferredDistribution.statementText, /餘 ______$/);
    assert.equal("answer" in question, false);
    assert.equal("structuredAnswer" in question, false);
    assert.equal("answerText" in question, false);
  }
});

test("S108 blocking validators reject unknown family, missing roles and mismatched witness", () => {
  const canonical = generateG5AU02Canonical(PATTERN_ID, { seed: 308001 });
  expectCode(canonical, (item) => {
    item.data.scenarioFamilyId = "runtime_free_text_family";
    item.p2RemainderTransferParity.scenarioFamilyId = "runtime_free_text_family";
  }, "G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_FAMILY_UNKNOWN");
  expectCode(canonical, (item) => {
    delete item.data.quantityRoles.smallerDistribution;
  }, "G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_ROLE_MISSING");
  expectCode(canonical, (item) => {
    item.data.distributionWitness.transferredDistribution.quotient += 1;
  }, "G5AU02_P2_REMAINDER_TRANSFER_WITNESS_MISMATCH");
  expectCode(canonical, (item) => {
    item.answer.remainder = (item.answer.remainder + 1) % item.data.smallerDivisor;
  }, "G5AU02_P2_REMAINDER_TRANSFER_WITNESS_MISMATCH");
});

test("S108 renderer accepts all 18 approved layout projections", () => {
  const result = buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: [PATTERN_ID],
    questionCount: 1,
    generationSeed: 408001,
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, result.errors?.join(","));
  let inspected = 0;
  for (const [columns, rows] of LAYOUTS) {
    const html = renderWorksheetDocumentToHtml(publicDocument(result, columns, rows, true), { stylesheetHref: "" });
    assert.match(html, /data-renderer-profile="g5a_u02_s104_p0_integrated_v1"/);
    assert.ok(html.includes(`data-semantic-kind="${KIND}"`));
    assert.ok(html.includes(`data-g5a-u02-s108-kind="${KIND}"`));
    assert.ok(html.includes("data-scenario-family="));
    assert.ok(html.includes("改分裝："));
    assert.ok(html.includes("餘 ______"));
    assert.ok(html.includes(`data-layout-columns="${columns}" data-layout-rows="${rows}"`));
    inspected += 1;
  }
  assert.equal(inspected, 18);
});

test("S108 answer boundary passes 6 layout-state projections", () => {
  const result = buildG5AU02BrowserDynamicWorksheet({
    sourceId: "g5a_u02_5a02",
    patternSpecIds: [PATTERN_ID],
    questionCount: 1,
    generationSeed: 508001,
    includeAnswerKey: true,
  });
  assert.equal(result.ok, true, result.errors?.join(","));
  let inspected = 0;
  for (const [columns, rows] of [[3, 5], [2, 6], [1, 7]]) {
    for (const includeAnswerKey of [false, true]) {
      const html = renderWorksheetDocumentToHtml(publicDocument(result, columns, rows, includeAnswerKey), { stylesheetHref: "" });
      assert.equal(html.includes("worksheet-section--answer-key"), includeAnswerKey);
      assert.ok(html.includes(`data-layout-columns="${columns}" data-layout-rows="${rows}"`));
      inspected += 1;
    }
  }
  assert.equal(inspected, 6);
});
