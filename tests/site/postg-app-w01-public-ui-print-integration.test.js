import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  listPublicPatternGroupChoices,
} from "../../site/assets/browser/state/public-pattern-group-selection.js";
import {
  buildWorksheetDocumentFromPlan,
} from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import {
  getPublicPatternGroupDisplayLabel,
} from "../../site/assets/browser/state/public-pattern-group-selection.js";
import {
  W01_PUBLIC_APPLICATION_GROUPS,
} from "../../site/modules/curriculum/registry/w01-public-application-groups.js";

const planFor = (group) => ({
  sourceId: group.sourceId,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [group.primaryKnowledgePointId],
  selectedPatternGroupIds: [group.patternGroupId],
  questionCount: 3,
  ordering: "groupedByPattern",
  includeAnswerKey: true,
  generationSeed: `w01-public:${group.patternGroupId}`,
  printLayout: { columns: 1, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true },
});

test("W01 E5 groups are visible as a separate global-context application choice", () => {
  assert.equal(W01_PUBLIC_APPLICATION_GROUPS.length, 7);
  for (const group of W01_PUBLIC_APPLICATION_GROUPS) {
    const visible = listPublicPatternGroupChoices([group.primaryKnowledgePointId]);
    assert.ok(visible.some((entry) => entry.patternGroupId === group.patternGroupId));
    assert.equal(getPublicPatternGroupDisplayLabel(group), "全域情境應用題");
    assert.equal(group.productionAdmitted, true);
    assert.equal(group.publicQuerySelectable, true);
  }
});

test("every newly exposed W01 group generates previewable and printable admitted questions", () => {
  for (const group of W01_PUBLIC_APPLICATION_GROUPS) {
    const result = buildWorksheetDocumentFromPlan(planFor(group));
    assert.equal(result.ok, true, `${group.patternGroupId}: ${JSON.stringify(result.errors)}`);
    const document = result.worksheetDocument;
    assert.equal(document.summary.questionCount, 3);
    assert.ok(document.questionPages.length > 0);
    assert.ok(document.answerKeyPages.length > 0);
    assert.equal(document.generatedQuestions.length, 3);
    for (const question of document.generatedQuestions) {
      assert.equal(question.applicationText, true);
      assert.equal(question.productionUse, "allowed");
      assert.equal(question.w01ApplicationAdmission.evidenceLevel, "E5_PRODUCTION_ADMITTED");
      assert.equal(question.w01ApplicationAdmission.publicPrintEnabled, true);
      assert.doesNotMatch(question.promptText, /(?:算式|_{2,}|答\s*[:：])/);
    }
    const visibleText = document.questionDisplayModels.map((row) => row.blankedDisplayText).join("\n");
    assert.doesNotMatch(visibleText, /(?:算式|_{2,}|答\s*[:：])/);
  }
});

test("numeric and W01 application choices remain separate", () => {
  const group = W01_PUBLIC_APPLICATION_GROUPS.find((entry) => entry.sourceId === "g3a_u02_3a02");
  const numericPlan = { ...planFor(group), selectedPatternGroupIds: [group.basePatternGroupId] };
  const numeric = buildWorksheetDocumentFromPlan(numericPlan);
  const application = buildWorksheetDocumentFromPlan(planFor(group));
  assert.equal(numeric.ok, true);
  assert.equal(application.ok, true);
  assert.ok(numeric.worksheetDocument.generatedQuestions.every((question) => question.applicationText !== true));
  assert.ok(application.worksheetDocument.generatedQuestions.every((question) => question.applicationText === true));
});

test("public HTML surfaces retain the selector, preview, and print controls", () => {
  for (const path of ["site/index.html", "site/404.html"]) {
    const html = fs.readFileSync(path, "utf8");
    assert.match(html, /id="batch-a-pattern-group-selector"/);
    assert.match(html, /id="preview-frame"/);
    assert.match(html, /id="print-button"/);
  }
});
