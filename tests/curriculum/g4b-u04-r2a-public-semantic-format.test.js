import assert from "node:assert/strict";
import test from "node:test";

import {
  auditG4BU04PublicSemanticText,
  normalizeG4BU04PublicAnswer,
  normalizeG4BU04PublicPrompt,
} from "../../site/modules/renderer/g4b-u04-public-semantic-format.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

test("R2A replaces implausible large classroom quantities with a plausible exact context", () => {
  const prompt = normalizeG4BU04PublicPrompt("下面敘述中的數量是概數還是精確數？「教室裡正好有 31561 張椅子。」");
  assert.match(prompt, /體育館裡正好有 31,561 個座位/);
  assert.doesNotMatch(prompt, /教室裡正好有 31,561 張椅子/);
});

test("R2A adds the missing item noun to complete-group packing prompts", () => {
  const prompt = normalizeG4BU04PublicPrompt("有 4,383枝，每 10枝 裝成一捆鉛筆，最多可以裝成幾捆完整的鉛筆？");
  assert.equal(prompt, "有 4,383 枝鉛筆，每 10 枝裝成一捆，最多可以裝成幾捆完整的鉛筆？");
});

test("R2A adds the missing item noun to minimum-container prompts", () => {
  const prompt = normalizeG4BU04PublicPrompt("有 64,360頂，每個收納袋最多裝 100頂，全部裝完至少需要幾個收納袋？");
  assert.equal(prompt, "有 64,360 頂帽子，每個收納袋最多裝 100 頂，全部裝完至少需要幾個收納袋？");
});

test("R2A formats direct numeric, money and count answers consistently", () => {
  assert.equal(normalizeG4BU04PublicAnswer("8645000", "numericAnswer"), "8,645,000");
  assert.equal(normalizeG4BU04PublicAnswer("5000元", "moneyAmountAnswer"), "5,000元");
  assert.equal(normalizeG4BU04PublicAnswer("39張", "banknoteCountAnswer"), "39張");
  assert.equal(normalizeG4BU04PublicAnswer("0、1、2、3、4", "digitSetAnswer"), "0、1、2、3、4");
});

test("R2A semantic audit accepts normalized public text", () => {
  const result = auditG4BU04PublicSemanticText(
    "有 522,087顆，每 1,000顆 裝成一袋球，最多可以裝成幾袋完整的球？",
    "522袋",
    "numericAnswer",
  );
  assert.equal(result.ok, true);
  assert.deepEqual(result.errors, []);
  assert.equal(result.promptText, "有 522,087 顆球，每 1,000 顆裝成一袋，最多可以裝成幾袋完整的球？");
});

test("R2A renderer applies public semantic normalization to questions and answers", () => {
  const document = {
    title: "Batch B 4B-U04 概數",
    subtitle: "概數綜合練習",
    rendererProfile: { profileId: "g4b_u04_contextual_estimation_v1" },
    questionPages: [{
      pageNumber: 1,
      columns: 1,
      cells: [{
        cellType: "question",
        displayModel: {
          renderKind: "classification",
          answerModelShape: "classificationAnswer",
          questionNumberText: "1.",
          blankedDisplayText: "下面敘述中的數量是概數還是精確數？「教室裡正好有 43878 張椅子。」",
          responsePrompt: "作答：________________",
        },
      }],
    }],
    answerKeyPages: [{
      pageNumber: 1,
      columns: 1,
      cells: [{
        cellType: "answer",
        answerKeyItem: {
          questionNumber: 1,
          renderKind: "numeric_rounding",
          answerModelShape: "numericAnswer",
          promptText: "把 8,645,292 用無條件捨去法取概數到千位。",
          answerText: "8645000",
        },
      }],
    }],
  };

  const html = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  assert.match(html, /體育館裡正好有 43,878 個座位/);
  assert.match(html, /<strong>答案：<\/strong>8,645,000/);
  assert.doesNotMatch(html, /教室裡正好有 43878 張椅子/);
});
