import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const readText = (path) => fs.readFileSync(path, "utf8");

const CONTRACT_PATH = "data/curriculum/full-product/p09/p09-ui-source-authority-preflight.json";
const IMPACT_PATH = "data/project/change-impact/P09_UI_SOURCE_AUTHORITY_PREFLIGHT.impact.json";
const PLAN_PATH = "data/project/validation-plans/P09_UI_SOURCE_AUTHORITY_PREFLIGHT.validation.json";

test("P09 preflight locks 79-source / 482-KP current authority without semantic mutation", async () => {
  const contract = readJson(CONTRACT_PATH);
  const impact = readJson(IMPACT_PATH);
  const { materializeR05DeliveryWaveRebase } = await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
  const r05 = materializeR05DeliveryWaveRebase();
  const sourceIds = new Set(r05.knowledgePointAssignments.flatMap((row) => row.sourceNodeIds));

  assert.equal(r05.knowledgePointAssignments.length, 482);
  assert.equal(sourceIds.size, 79);
  assert.equal(r05.waves.length, 9);
  assert.equal(contract.sourceAuthority.canonicalSourceNodeCount, 79);
  assert.equal(contract.sourceAuthority.canonicalKnowledgePointCount, 482);
  assert.equal(contract.sourceAuthority.deliveryWaveCount, 9);
  assert.equal(impact.changeImpact.currentAuthorityChanged, false);
  assert.equal(impact.scopeGuards.r02Mutation, false);
  assert.equal(impact.scopeGuards.r03Mutation, false);
  assert.equal(impact.scopeGuards.r04Mutation, false);
  assert.equal(impact.scopeGuards.r05Mutation, false);
});

test("P09 preflight measures the exact browser selector gap against the 482-KP authority", async () => {
  globalThis.document = Object.create(null);
  try {
    const selector = await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
    const visible = selector.listVisibleBatchAKnowledgePoints();
    const ids = visible.map((row) => row.knowledgePointId);
    const { materializeR05DeliveryWaveRebase } = await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
    const canonicalIds = materializeR05DeliveryWaveRebase().knowledgePointAssignments.map((row) => row.knowledgePointId);
    const visibleSet = new Set(ids);
    const missingKnowledgePointIds = canonicalIds.filter((id) => !visibleSet.has(id));
    assert.equal(visible.length, 480);
    assert.equal(new Set(ids).size, 480);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount, 480);
    assert.equal(missingKnowledgePointIds.length, 2);
    assert.deepEqual(missingKnowledgePointIds, [
      "kp_g3a_u08_whole_as_fraction",
      "kp_g3a_u08_unlike_denominator_comparison_limit"
    ]);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount, 76);
    const contract = readJson(CONTRACT_PATH);
    assert.equal(contract.currentPublicUiInventory.browserSelectorObservedSourceCount, 76);
    assert.equal(contract.currentPublicUiInventory.expectedPublicProductSourceUnitCount, 76);
    assert.equal(contract.currentPublicUiInventory.canonicalSourceNodeToPublicUnitCollapseCount, 3);
    assert.equal(contract.currentPublicUiInventory.browserSelectorSourceProjectionStatus, "76_PUBLIC_PRODUCT_UNITS_ACCOUNT_FOR_79_CANONICAL_SOURCE_NODES");
    assert.deepEqual(contract.currentPublicUiInventory.browserSelectorMissingKnowledgePointIds, missingKnowledgePointIds);
    console.log("P09_UI_SELECTOR_READBACK=" + JSON.stringify({
      visibleKnowledgePoints: visible.length,
      canonicalKnowledgePoints: canonicalIds.length,
      missingKnowledgePointIds,
      sourceCount: selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,
      hiddenPendingCount: selector.BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount,
      notSelectableCount: selector.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount
    }));
  } finally {
    delete globalThis.document;
  }
});

test("P09 current public UI surface and pointer inventory are explicit", () => {
  const contract = readJson(CONTRACT_PATH);
  const index = readText("site/index.html");
  const selectorEntry = readText("site/modules/curriculum/registry/batch-a-selector-extension.js");
  const selectorPointer = readText("site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js");
  const bindingPointer = readText("site/modules/curriculum/public/public-ui-capability-binding-p04f33.js");
  const worksheet = readText("site/assets/browser/pipeline/build-worksheet-document.js");

  for (const id of [
    "batch-a-grade-select",
    "batch-a-semester-select",
    "batch-a-source-select",
    "batch-a-selection-mode-select",
    "batch-a-question-count-input",
    "batch-a-ordering-select",
    "batch-a-answer-key-input",
    "generation-seed-input",
    "preview-frame"
  ]) assert.match(index, new RegExp(id));
  assert.match(index, /mixedKnowledgePointsCrossUnit" disabled/);
  assert.match(selectorEntry, /batch-a-selector-p04f33-extension/);
  assert.match(selectorPointer, /batch-a-selector-p08f22-extension/);
  assert.match(bindingPointer, /public-ui-capability-binding-p08f22/);
  assert.match(worksheet, /applyR07AuthoritativeConsumerCutover/);
  assert.equal(contract.currentPublicUiInventory.controls.crossUnitMixedDefault, "DISABLED");
});

test("P09 preflight isolates the 15-unit R07 consumer-coverage gap from 79-source authority", async () => {
  globalThis.document = Object.create(null);
  try {
    const { R07_PUBLIC_PRODUCT_UNIT_IDS } = await import("../../site/modules/curriculum/global/r07-authoritative-consumer-cutover.js");
    const contract = readJson(CONTRACT_PATH);
    assert.equal(R07_PUBLIC_PRODUCT_UNIT_IDS.length, 15);
    assert.equal(contract.currentPublicUiInventory.authoritativeConsumerCutover.currentExplicitProductUnitCount, 15);
    assert.equal(contract.currentPublicUiInventory.authoritativeConsumerCutover.remainingPublicUnitsCurrentlyRelyOnCompatibilityOrHistoricalRouting, true);
    assert.ok(R07_PUBLIC_PRODUCT_UNIT_IDS.length < contract.sourceAuthority.canonicalSourceNodeCount);
  } finally {
    delete globalThis.document;
  }
});

test("P09 preflight preserves the deployed UI blocker snapshot without depending on mutable latest readbacks", () => {
  const contract = readJson(CONTRACT_PATH);
  assert.equal(contract.deployedUiEvidence.evidencePaths.length, 6);
  assert.equal(contract.deployedUiEvidence.status, "BLOCKED");
  assert.equal(contract.deployedUiEvidence.observedFailureClass, "PUBLIC_SOURCE_DROPDOWN_OR_DEPLOYED_CONTROL_MATERIALIZATION_FAILURE");
  assert.equal(contract.currentPublicUiInventory.browserSourceUnitProviderObservedCountBeforeA01, 74);
  assert.deepEqual(contract.currentPublicUiInventory.browserSourceUnitProviderMissingProductSourceIds, ["g5b_u02_5b02","g5b_u09_5b09"]);
  assert.equal(contract.p09DoneContract.deployedRequiredSourceOptionFailures, 0);
});

test("P09 and P10 boundaries remain fail-closed and require a separate implementation approval", () => {
  const contract = readJson(CONTRACT_PATH);
  const impact = readJson(IMPACT_PATH);
  const plan = readJson(PLAN_PATH);

  assert.equal(contract.p09ScopeLock.forbidden.includes("No P10 closeout claim inside P09."), true);
  assert.equal(contract.p09DoneContract.sourceInventoryParity, "76_OF_76_PUBLIC_PRODUCT_UNITS_WITH_79_OF_79_CANONICAL_SOURCE_NODES_ACCOUNTED");
  assert.equal(contract.p09DoneContract.knowledgePointSelectorParity, "480_OF_480_CURRENT_PRODUCT_ADMITTED");
  assert.equal(contract.p09DoneContract.canonicalProductAdmissionGap, 2);
  assert.equal(contract.p09DoneContract.full482SelectorParityRequiresSeparateProductAdmission, true);
  assert.equal(contract.p09DoneContract.crossUnitMixedRequired, false);
  assert.ok(contract.p10CloseoutPrerequisiteLock.prerequisites.includes("P09_UI_D0_COMPLETE"));
  assert.ok(contract.p10CloseoutPrerequisiteLock.prerequisites.includes("ZERO_CANONICAL_KP_PRODUCT_ADMISSION_GAP"));
  assert.ok(contract.p10CloseoutPrerequisiteLock.prerequisites.includes("GLOBAL_RELEASE_CERTIFICATION_AT_P10"));
  assert.equal(contract.distance.nextShortestStep, "P09_UI_A01_RestoreG5BU02AndG5BU09_SourceProvider_ThenClassicAndLivePagesReadback");
  assert.equal(contract.distance.nextTaskRequiresSeparateOperatorApproval, true);
  assert.equal(impact.scopeGuards.publicUiRuntimeMutation, false);
  assert.deepEqual(plan.forbidden, ["FULL_NODE_REGRESSION", "GLOBAL_BROWSER_REPLAY"]);
});
