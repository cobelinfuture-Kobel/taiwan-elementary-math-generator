import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildG5AU02BrowserDynamicWorksheet as buildSourceWorksheet } from "../../src/curriculum/g5a-u02/browser-dynamic-entry.js";
import {
  generateG5AU02Canonical,
  validateG5AU02Canonical,
} from "../../src/curriculum/g5a-u02/canonical-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet as buildBundledWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { getG5AU02HiddenPatternSpecs } from "../../site/modules/curriculum/batch-b/source-pattern-g5a-u02-extension.js";
import { projectG5AU02DynamicDocumentForGlobalLayout } from "../../site/modules/curriculum/batch-a/g5a-u02-global-layout-projection.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const SOURCE_ID = "g5a_u02_5a02";
const RENDERER_PROFILE = "g5a_u02_s104_p0_integrated_v1";
const CONTRACT = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/contracts/G5AU02_S110_All22IntegratedAcceptance.json",
  import.meta.url,
), "utf8"));
const S99 = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/contracts/G5AU02_S99_P0SourceMethodAndRepresentationFullFixContract.json",
  import.meta.url,
), "utf8"));
const S105 = JSON.parse(readFileSync(new URL(
  "../../data/curriculum/contracts/G5AU02_S105_P1P2SourceParityMilestoneDefinition.json",
  import.meta.url,
), "utf8"));

const SPECS = Object.freeze([...getG5AU02HiddenPatternSpecs()].sort((a, b) => a.patternOrder - b.patternOrder));
const STRUCTURED_KIND = new Map([
  ...S99.patternContracts.map((row) => [row.patternSpecId, row.requiredDisplayModelKind]),
  ...S105.patternContracts.map((row) => [row.patternSpecId, row.requiredDisplayModelKind]),
]);
const REGRESSION_ONLY = new Set(S105.regressionOnlyContracts.map((row) => row.patternSpecId));

function printableDocument(document) {
  return {
    ...document,
    questionPages: [{
      pageNumber: 1,
      columns: 1,
      rowsPerPage: 1,
      cells: document.questionDisplayModels.map((displayModel) => ({
        cellType: "question",
        questionNumber: displayModel.questionNumber,
        displayModel,
      })),
    }],
    answerKeyPages: [{
      pageNumber: 1,
      columns: 1,
      rowsPerPage: 1,
      cells: document.answerKeyItems.map((answerKeyItem) => ({
        cellType: "answerKey",
        answerKeyItem,
      })),
    }],
  };
}

function build(builder, patternSpecId, seed) {
  const result = builder({
    sourceId: SOURCE_ID,
    patternSpecIds: [patternSpecId],
    questionCount: 1,
    generationSeed: seed,
    includeAnswerKey: true,
    questionRowsPerPage: 1,
    answerRowsPerPage: 1,
  });
  assert.equal(result?.ok, true, `${patternSpecId}:${seed}:${result?.errors?.join(",")}`);
  return result.worksheetDocument;
}

function assertPublicBoundary(document, spec, seed) {
  assert.equal(document.questionCount, 1);
  assert.equal(document.questionItems.length, 1);
  assert.equal(document.questionDisplayModels.length, 1);
  assert.equal(document.answerKeyItems.length, 1);

  const question = document.questionItems[0];
  const answer = document.answerKeyItems[0];
  assert.equal(question.patternSpecId, spec.patternSpecId);
  assert.equal(question.answerModelId, spec.answerModelId);
  assert.equal(typeof question.prompt, "string");
  assert.ok(question.prompt.length > 0);
  assert.equal("answer" in question, false);
  assert.equal("structuredAnswer" in question, false);
  assert.equal("answerText" in question, false);
  assert.equal(answer.patternSpecId, spec.patternSpecId);
  assert.ok(answer.answerText.length > 0, `${spec.patternSpecId}:${seed}:answer text missing`);

  if (REGRESSION_ONLY.has(spec.patternSpecId)) {
    assert.equal(question.questionDisplayModel, null);
    assert.equal(question.promptCompletenessStatus, "not_required_for_pattern");
  } else {
    const expectedKind = STRUCTURED_KIND.get(spec.patternSpecId);
    assert.ok(expectedKind, `${spec.patternSpecId}:structured kind missing`);
    assert.equal(question.questionDisplayModel?.kind, expectedKind);
    assert.equal(answer.questionDisplayModel?.kind, expectedKind);
    assert.equal(question.promptCompletenessStatus, "visible_unique_solution_data_complete");
  }
}

test("S110 contract partitions exactly 22 patterns into 12 P0, 7 repaired and 3 regression-only rows", () => {
  assert.equal(CONTRACT.schemaName, "G5AU02All22IntegratedAcceptance");
  assert.equal(SPECS.length, 22);
  assert.deepEqual(SPECS.map((row) => row.patternOrder), CONTRACT.patternPartition.allOrders);
  assert.equal(CONTRACT.patternPartition.p0Orders.length, 12);
  assert.equal(CONTRACT.patternPartition.repairedOrders.length, 7);
  assert.equal(CONTRACT.patternPartition.regressionOnlyOrders.length, 3);
  assert.equal(STRUCTURED_KIND.size, 19);
  assert.equal(REGRESSION_ONLY.size, 3);
  assert.equal(CONTRACT.acceptance.itemIntegration.scenarioCount, 1408);
  assert.equal(CONTRACT.acceptance.layoutMatrix.scenarioCount, 396);
  assert.equal(CONTRACT.acceptance.answerBoundaryMatrix.scenarioCount, 132);
});

test("S110 validates 1408/1408 canonical-source-bundle-public-renderer integrations", () => {
  let passCount = 0;
  for (let patternIndex = 0; patternIndex < SPECS.length; patternIndex += 1) {
    const spec = SPECS[patternIndex];
    for (let offset = 0; offset < 64; offset += 1) {
      const seed = 110000 + patternIndex * 1000 + offset;
      const canonical = generateG5AU02Canonical(spec.patternSpecId, { seed });
      const canonicalReplay = generateG5AU02Canonical(spec.patternSpecId, { seed });
      assert.deepEqual(canonicalReplay, canonical, `${spec.patternSpecId}:${seed}:nondeterministic canonical item`);
      const validation = validateG5AU02Canonical(canonical);
      assert.equal(validation.ok, true, `${spec.patternSpecId}:${seed}:${validation.errors.join(",")}`);
      assert.equal(canonical.canonicalRoute.binding.patternOrder, spec.patternOrder);
      assert.equal(canonical.canonicalRoute.answerModelId, spec.answerModelId);

      const sourceDocument = build(buildSourceWorksheet, spec.patternSpecId, seed);
      const bundledDocument = build(buildBundledWorksheet, spec.patternSpecId, seed);
      assert.deepEqual(bundledDocument, sourceDocument, `${spec.patternSpecId}:${seed}:bundle drift`);
      assertPublicBoundary(bundledDocument, spec, seed);

      const projected = projectG5AU02DynamicDocumentForGlobalLayout({
        ok: true,
        errors: [],
        worksheetDocument: bundledDocument,
      });
      assert.equal(projected?.ok, true, `${spec.patternSpecId}:${seed}:${projected?.errors?.join(",")}`);
      const publicDocument = projected.worksheetDocument;
      assertPublicBoundary(publicDocument, spec, seed);

      const html = renderWorksheetDocumentToHtml(printableDocument(publicDocument), { stylesheetHref: "" });
      assert.match(html, new RegExp(`data-renderer-profile="${RENDERER_PROFILE}"`));
      assert.match(html, /worksheet-section--questions/);
      assert.match(html, /worksheet-section--answer-key/);
      assert.doesNotMatch(html, /\b(?:ps|fm|fmc|pg|kp)_g5a_u02_[a-z0-9_]+\b/i);
      const questionOnlyHtml = html.split("worksheet-section--answer-key")[0];
      assert.doesNotMatch(questionOnlyHtml, /worksheet-cell__answer/);
      if (REGRESSION_ONLY.has(spec.patternSpecId)) {
        assert.doesNotMatch(html, /data-semantic-kind=/);
      } else {
        assert.ok(html.includes(`data-semantic-kind="${STRUCTURED_KIND.get(spec.patternSpecId)}"`));
      }
      passCount += 1;
    }
  }
  assert.equal(passCount, 1408);
});

test("S110 freezes all identity, no-fallback and D0 eligibility boundaries", () => {
  assert.equal(CONTRACT.globalInvariants.patternSpecIdsStable, true);
  assert.equal(CONTRACT.globalInvariants.knowledgePointIdsStable, true);
  assert.equal(CONTRACT.globalInvariants.patternGroupIdsStable, true);
  assert.equal(CONTRACT.globalInvariants.formalMappingIdsStable, true);
  assert.equal(CONTRACT.globalInvariants.answerModelIdsStable, true);
  assert.equal(CONTRACT.globalInvariants.crossUnitChangeForbidden, true);
  assert.equal(CONTRACT.globalInvariants.gctxChangeForbidden, true);
  assert.equal(CONTRACT.globalInvariants.genericFallback, "forbidden");
  assert.equal(CONTRACT.globalInvariants.freeFormAI, "forbidden");
  assert.equal(CONTRACT.globalInvariants.runtimeWebSearch, "forbidden");
  assert.equal(CONTRACT.distance.d0EligibleBeforeAcceptance, false);
  assert.equal(CONTRACT.distance.d0EligibleAfterEveryGatePasses, true);
});
