globalThis.document = Object.create(null);
const { materializeR05DeliveryWaveRebase } = await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
const selector = await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
const { R07_PUBLIC_PRODUCT_UNIT_IDS } = await import("../../site/modules/curriculum/global/r07-authoritative-consumer-cutover.js");
const r05 = materializeR05DeliveryWaveRebase();
const visible = selector.listVisibleBatchAKnowledgePoints();
const sourceIds = new Set(r05.knowledgePointAssignments.flatMap((row) => row.sourceNodeIds));
const canonicalIds = r05.knowledgePointAssignments.map((row) => row.knowledgePointId);
const visibleSet = new Set(visible.map((row) => row.knowledgePointId));
const missingKnowledgePointIds = canonicalIds.filter((id) => !visibleSet.has(id));
const readback = {
  status: visible.length === 480 && sourceIds.size === 79 && missingKnowledgePointIds.length === 2 ? "PASS_PREFLIGHT_EXACT_GAP_MEASURED" : "FAIL_PREFLIGHT_INVENTORY_UNEXPECTED",
  canonicalSourceNodes: sourceIds.size,
  canonicalKnowledgePoints: r05.knowledgePointAssignments.length,
  browserVisibleKnowledgePoints: visible.length,
  missingKnowledgePointIds,
  browserAvailabilityVisibleCount: selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
  browserAvailabilitySourceCount: selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,
  browserAvailabilityHiddenPendingCount: selector.BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount,
  browserAvailabilityNotSelectableCount: selector.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount,
  r07ExplicitAuthoritativeConsumerUnits: R07_PUBLIC_PRODUCT_UNIT_IDS.length,
  nextShortestStep: "P09_UI_A01_DeployedSourceDropdownAuthorityRepair_And_79SourceCurrentInventoryMaterialization"
};
console.log("P09_UI_SOURCE_AUTHORITY_PREFLIGHT_READBACK=" + JSON.stringify(readback));
