import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const readText = (relativePath) => readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));

const contractPath = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_EQUAL_GROUPS_PUBLIC_CUTOVER_PREFLIGHT_V1.json";
const implementationContractPath = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_EQUAL_GROUPS_IMPLEMENTATION_PREFLIGHT_V1.json";
const matrixPath = "data/curriculum/learning-paths/path1-integer-foundations.curriculum-matrix.json";
const publicPagePath = "site/path1/index.html";
const browserControllerPath = "site/assets/browser/path1-manual.js";
const currentEntrypointPath = "site/assets/browser/pipeline/build-path1-manual-worksheet-p1-03-extension.js";
const baseBuilderPath = "site/assets/browser/pipeline/build-path1-manual-worksheet.js";
const classicQueryStatePath = "site/assets/browser/state/query-state.js";

const contract = readJson(contractPath);
const implementationPreflight = readJson(implementationContractPath);
const matrix = readJson(matrixPath);
const publicPage = readText(publicPagePath);
const browserController = readText(browserControllerPath);
const currentEntrypoint = readText(currentEntrypointPath);
const baseBuilder = readText(baseBuilderPath);
const classicQueryState = readText(classicQueryStatePath);

function block(blockId) {
  return matrix.blocks.find((entry) => entry.blockId === blockId);
}

test("public cutover preflight stays planning-only and bounded to P1-01/P1-02", () => {
  assert.equal(contract.taskId, "PATH1_WORD_PROBLEM_EQUAL_GROUPS_PUBLIC_CUTOVER_PREFLIGHT_V1");
  assert.equal(contract.status, "PUBLIC_CUTOVER_PREFLIGHT_LOCKED_NO_VISIBLE_UI_CHANGE");
  assert.equal(contract.implementationAllowed, false);
  assert.equal(contract.visibleUiChanged, false);
  assert.equal(contract.publicCutoverApplied, false);
  assert.equal(contract.runtimeSemanticsChanged, false);
  assert.deepEqual(contract.scope.includedPathBlocks, ["P1-01", "P1-02"]);
  assert.deepEqual(contract.scope.excludedPathBlocks, ["P1-03", "P1-04"]);
  assert.deepEqual(contract.scope.practiceModes, ["arithmetic", "equalGroupsTransfer"]);
  assert.equal(contract.scope.defaultPracticeMode, "arithmetic");
});

test("preflight preserves the merged implementation authority instead of reopening transfer runtime", () => {
  assert.equal(contract.prerequisite.mergeSha, "31278870fd9950990d595b75b4741244c44bbce3");
  assert.equal(implementationPreflight.architectureDecision.selectedStrategy, "G3BU08_CANONICAL_SEMANTIC_SURFACE_BRIDGE");
  assert.equal(contract.architectureDecision.baseTransferRuntimeMutationRequired, false);
  assert.ok(contract.futureCutoverImplementationBoundary.forbiddenFiles.includes(
    "site/modules/curriculum/learning-paths/path1-equal-groups-transfer-generator.js",
  ));
  assert.ok(contract.futureCutoverImplementationBoundary.forbiddenFiles.includes(
    "site/modules/curriculum/learning-paths/path1-equal-groups-transfer-validator.js",
  ));
  assert.ok(contract.futureCutoverImplementationBoundary.forbiddenFiles.includes(baseBuilderPath));
});

test("current public Path1 page has no practiceMode control or Path1-local query-state wiring yet", () => {
  assert.equal(publicPage.includes('id="path1-practice-mode"'), false);
  assert.equal(browserController.includes("practiceMode"), false);
  assert.equal(browserController.includes("path1-manual-query-state"), false);
  assert.match(browserController, /build-path1-manual-worksheet-p1-03-extension\.js/);
});

test("current P1-03 extension entrypoint is the public pass-through blocker and remains forbidden to modify", () => {
  assert.equal(currentEntrypoint.includes("practiceMode"), false);
  assert.match(currentEntrypoint, /if \(blockId !== "P1-03"\)/);
  assert.match(currentEntrypoint, /buildBasePath1ManualWorksheet\(\{/);
  assert.equal(contract.architectureDecision.selectedStrategy, "PATH1_LOCAL_PRACTICE_MODE_PUBLIC_ADAPTER");
  assert.equal(contract.architectureDecision.p103ExtensionMutationRequired, false);
  assert.ok(contract.futureCutoverImplementationBoundary.forbiddenFiles.includes(currentEntrypointPath));
});

test("future adapter preserves arithmetic through the existing extension and routes transfer only to the existing base builder", () => {
  assert.equal(
    contract.futurePublicAdapterContract.routing.arithmetic,
    "delegate unchanged to build-path1-manual-worksheet-p1-03-extension.js",
  );
  assert.equal(
    contract.futurePublicAdapterContract.routing["equalGroupsTransfer_P1-01_P1-02"],
    "delegate to build-path1-manual-worksheet.js with practiceMode=equalGroupsTransfer",
  );
  assert.equal(
    contract.futurePublicAdapterContract.routing.equalGroupsTransfer_other_block,
    "fail closed with PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED",
  );
  assert.match(baseBuilder, /practiceMode = "arithmetic"/);
  assert.match(baseBuilder, /practiceMode === PATH1_EQUAL_GROUPS_TRANSFER_PRACTICE_MODE/);
  assert.match(baseBuilder, /\["P1-01", "P1-02"\]\.includes\(blockId\)/);
  assert.match(baseBuilder, /PATH1_TRANSFER_MODE_BLOCK_NOT_SUPPORTED/);
});

test("public control is one additive practice-mode selector with arithmetic default", () => {
  const control = contract.futurePublicControlContract;
  assert.equal(control.controlId, "path1-practice-mode");
  assert.equal(control.controlName, "path1PracticeMode");
  assert.equal(control.controlKind, "select");
  assert.equal(control.defaultValue, "arithmetic");
  assert.deepEqual(control.values.map((entry) => entry.value), ["arithmetic", "equalGroupsTransfer"]);
  assert.deepEqual(control.values[1].supportedBlocks, ["P1-01", "P1-02"]);
  assert.match(control.unsupportedBlockUiRule, /disable equalGroupsTransfer/);
  assert.match(control.unsupportedBlockUiRule, /normalize to arithmetic/);
});

test("Path1 query state is local and cannot mutate the Classic query-state contract", () => {
  const query = contract.futureQueryStateContract;
  assert.equal(query.strategy, "PATH1_LOCAL_QUERY_STATE");
  assert.equal(query.modulePath, "site/assets/browser/state/path1-manual-query-state.js");
  assert.equal(query.mustNotModify, classicQueryStatePath);
  assert.deepEqual(query.parameters.practiceMode.allowed, ["arithmetic", "equalGroupsTransfer"]);
  assert.equal(query.parameters.practiceMode.default, "arithmetic");
  assert.equal(query.parameters.path1BlockId.default, "P1-01");
  assert.ok(query.parseRules.some((rule) => rule.includes("P1-01 + arithmetic")));
  assert.ok(query.parseRules.some((rule) => rule.includes("PATH1_PUBLIC_TRANSFER_MODE_BLOCK_NOT_SUPPORTED")));
  assert.ok(contract.futureCutoverImplementationBoundary.forbiddenFiles.includes(classicQueryStatePath));
  assert.match(classicQueryState, /parseQueryState/);
});

test("modeling transfer checkpoint is placed after arithmetic mastery without mutating canonical Path1 mastery gates", () => {
  const gate = contract.modelingTransferGateContract;
  assert.equal(gate.placement, "AFTER_BLOCK_ARITHMETIC_MASTERY_BEFORE_NEXT_BLOCK_RECOMMENDATION");
  assert.equal(gate.publicCutoverEnforcement, "PRACTICE_CHECKPOINT_NOT_MASTERY_BLOCKING");
  assert.equal(gate.canonicalMatrixMutationRequired, false);
  assert.equal(gate.p101P102MasteryGateMutationRequired, false);
  assert.equal(gate.futureMasteryUpgradeRequiresSeparateApproval, true);
  assert.deepEqual(gate.appliesToBlocks, ["P1-01", "P1-02"]);
  assert.equal(block("P1-01").fusionGate.mode, "NOT_APPLICABLE");
  assert.equal(block("P1-02").fusionGate.mode, "NOT_APPLICABLE");
  assert.equal(block("P1-12").fusionGate.mode, "REQUIRED");
  assert.ok(block("P1-12").fusionGate.requiredBlockIds.includes("P1-02"));
});

test("worksheet metadata contract distinguishes public practice selection from mastery evidence", () => {
  const projection = contract.futurePublicAdapterContract.metadataProjection;
  assert.equal(projection.canonicalLocation, "worksheetDocument.configSnapshot.metadata");
  assert.deepEqual(projection.requiredForBothModes, ["path1BlockId", "practiceMode"]);
  assert.deepEqual(projection.requiredForTransfer, ["relationKnowledgePointId", "semanticPatternSpecIdsUsed"]);
  assert.equal(
    projection.additionalFields.modelingTransferGateId,
    "PATH1_EQUAL_GROUPS_MODELING_TRANSFER_CHECKPOINT_V1",
  );
  assert.equal(projection.additionalFields.modelingTransferMasteryCredit, "NONE_GENERATION_ONLY");
});

test("future implementation boundary changes only the Path1-local public access layer", () => {
  const allowed = new Set(contract.futureCutoverImplementationBoundary.allowedFiles);
  assert.ok(allowed.has("site/assets/browser/pipeline/build-path1-manual-worksheet-practice-mode-entry.js"));
  assert.ok(allowed.has("site/assets/browser/state/path1-manual-query-state.js"));
  assert.ok(allowed.has("site/assets/browser/path1-manual.js"));
  assert.ok(allowed.has("site/path1/index.html"));
  assert.equal(contract.futureCutoverImplementationBoundary.visibleUiImplementationRequiresNextApproval, true);
  assert.equal(contract.focusedFutureAcceptance.fullRegressionRequired, false);
  assert.equal(contract.focusedFutureAcceptance.globalReplayRequired, false);
});
