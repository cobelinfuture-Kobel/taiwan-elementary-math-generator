import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

globalThis.document = Object.freeze({ getElementById() { return null; } });

const { materializeMatrix } = await import(
  "../../tools/curriculum/build-pgc-r08-a01-legal-route-browser-matrix.mjs"
);
const { enrichBrowserRowWithExactPatternGroups } = await import(
  "../../tools/curriculum/pgc-r08-exact-pattern-group-authority.mjs"
);
const { generateBatchABrowserQuestions } = await import(
  "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js"
);
const { buildWorksheetDocumentFromPlan: buildCloseoutWorksheetDocumentFromPlan } = await import(
  "../../site/assets/browser/pipeline/build-worksheet-document-p01e-closeout.js"
);
const { buildWorksheetDocumentFromPlan: buildPublicWorksheetDocumentFromPlan } = await import(
  "../../site/assets/browser/pipeline/build-worksheet-document.js"
);

const plan = JSON.parse(await readFile(
  "data/curriculum/public-generation/PGC-R08-A04-A06.capacity-shortfall-plan.json",
  "utf8",
));
const capacityPath = plan.capacityAuthorityPath;
const capacityRaw = await readFile(capacityPath, "utf8");
const capacity = JSON.parse(capacityRaw);
const routeMatrixAuthority = JSON.parse(await readFile(plan.routeMatrixAuthorityPath, "utf8"));
const matrix = materializeMatrix(capacity, routeMatrixAuthority, capacityRaw);
const pipelineSource = await readFile(
  "site/assets/browser/pipeline/build-worksheet-document-p01e-closeout.js",
  "utf8",
);

function targetOptions(routeId, suffix = "a") {
  const matches = matrix.rows.filter((row) => row.routeId === routeId);
  assert.equal(matches.length, 1, routeId);
  const row = enrichBrowserRowWithExactPatternGroups(matches[0]);
  return {
    sourceId: row.sourceId,
    questionMode: row.questionType,
    selectionMode: row.selectionMode,
    selectedKnowledgePointIds: row.selectedKnowledgePointIds,
    selectedPatternGroupIds: row.uiSelectablePatternGroupIds,
    questionCount: 20,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `pgc-r08-a03-${routeId}-seed-${suffix}`,
    depthMode: row.depthMode,
    contextMode: row.contextMode,
    printLayout: { columns: 3, rowsPerPage: 5, showAnswerKeyPage: true },
  };
}

function assertTwentyProjectedQuestions(routeId, options, direct, worksheet) {
  assert.equal(direct.ok, true, JSON.stringify({ routeId, errors: direct.errors }));
  assert.equal(direct.questions.length, 20, routeId);
  assert.equal(worksheet.ok, true, JSON.stringify({
    routeId,
    errors: worksheet.errors,
    currentRouterErrors: worksheet.currentRouterGeneration?.errors,
  }));
  assert.equal(worksheet.currentRouterGeneration?.questions?.length, 20, routeId);
  assert.equal(worksheet.p01eApplicationAdmission?.projectedQuestionCount, 20, routeId);
  assert.equal(worksheet.worksheetDocument.generatedQuestions.length, 20, routeId);
  assert.equal(worksheet.worksheetDocument.questionDisplayModels.length, 20, routeId);
  assert.equal(worksheet.worksheetDocument.answerKeyItems.length, 20, routeId);
  assert.ok(worksheet.worksheetDocument.questionPages.length > 0, routeId);
  assert.ok(worksheet.worksheetDocument.answerKeyPages.length > 0, routeId);
  assert.equal(
    worksheet.worksheetDocument.generatedQuestions.every((question) => (
      question.mode === "application"
      && question.applicationText === true
      && question.p01eApplicationAdmission?.productionSelectable === true
      && question.globalContextProduction?.runtimeResolvable === true
    )),
    true,
    routeId,
  );
  assert.deepEqual(
    worksheet.worksheetDocument.generatedQuestions.map((question) => question.id),
    direct.questions.map((question) => question.id),
    routeId,
  );
  assert.deepEqual(
    worksheet.worksheetDocument.metadata.currentRouterQuestionAuthority.allocation,
    direct.allocation,
    routeId,
  );
  assert.equal(options.questionCount, worksheet.worksheetDocument.summary.questionCount);
}

test("A06 authority contains exactly three active verified-20 application routes", () => {
  assert.equal(plan.status, "IMPLEMENTATION_PENDING_EXACT_REPLAY");
  assert.equal(plan.targetRouteCount, 3);
  assert.equal(plan.targetRouteIds.length, 3);
  assert.equal(new Set(plan.targetRouteIds).size, 3);
  for (const routeId of plan.targetRouteIds) {
    const row = capacity.routes.find((entry) => entry.routeId === routeId);
    assert.ok(row, routeId);
    assert.equal(row.capacityStatus, "VERIFIED_20", routeId);
    assert.equal(row.verifiedMaxQuestionCount, 20, routeId);
  }
});

test("A06 closeout consumer uses current-router twenty-question authority for exact historical seeds", () => {
  for (const routeId of plan.targetRouteIds) {
    const options = targetOptions(routeId, "a");
    const direct = generateBatchABrowserQuestions(options);
    const worksheet = buildCloseoutWorksheetDocumentFromPlan(options);
    assertTwentyProjectedQuestions(routeId, options, direct, worksheet);
  }
});

test("A06 public Classic wrapper consumes the same current-router authority", () => {
  for (const routeId of plan.targetRouteIds) {
    const options = targetOptions(routeId, "a");
    const direct = generateBatchABrowserQuestions(options);
    const worksheet = buildPublicWorksheetDocumentFromPlan(options);
    assertTwentyProjectedQuestions(routeId, options, direct, worksheet);
  }
});

test("A06 paired historical seeds remain twenty-question application worksheets", () => {
  for (const routeId of plan.targetRouteIds) {
    const firstOptions = targetOptions(routeId, "a");
    const secondOptions = targetOptions(routeId, "b");
    const first = buildPublicWorksheetDocumentFromPlan(firstOptions);
    const second = buildPublicWorksheetDocumentFromPlan(secondOptions);
    assert.equal(first.ok, true, routeId);
    assert.equal(second.ok, true, routeId);
    assert.equal(first.worksheetDocument.generatedQuestions.length, 20, routeId);
    assert.equal(second.worksheetDocument.generatedQuestions.length, 20, routeId);
    assert.equal(first.p01eApplicationAdmission.projectedQuestionCount, 20, routeId);
    assert.equal(second.p01eApplicationAdmission.projectedQuestionCount, 20, routeId);
  }
});

test("A06 repair is shared and does not mutate capacity, generator runtimes, validators, or renderer", () => {
  assert.match(pipelineSource, /generateBatchABrowserQuestions/);
  assert.match(pipelineSource, /buildCurrentRouterBaseResult/);
  assert.match(pipelineSource, /CURRENT_BATCH_A_BROWSER_ROUTER/);
  assert.match(pipelineSource, /applyW1FullProductPublicApplicationAdmission/);
  assert.doesNotMatch(pipelineSource, /pgc_r03_/);
  assert.equal(plan.repairContract.capacityAuthorityMutationAllowed, false);
  assert.equal(plan.repairContract.generatorRuntimeMutationAllowed, false);
  assert.equal(plan.repairContract.validatorMutationAllowed, false);
  assert.equal(plan.repairContract.rendererMutationAllowed, false);
  assert.equal(plan.repairContract.perRoutePatchAllowed, false);
  assert.deepEqual(plan.repairContract.productMutationScope, [
    "site/assets/browser/pipeline/build-worksheet-document-p01e-closeout.js",
  ]);
});
