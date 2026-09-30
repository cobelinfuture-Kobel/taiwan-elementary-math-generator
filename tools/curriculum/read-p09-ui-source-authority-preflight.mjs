globalThis.document = Object.create(null);
const { materializeR05DeliveryWaveRebase } = await import("../../src/curriculum/global/r05-delivery-wave-rebase.mjs");
const selector = await import("../../site/modules/curriculum/registry/batch-a-selector-extension.js");
const { R07_PUBLIC_PRODUCT_UNIT_IDS } = await import("../../site/modules/curriculum/global/r07-authoritative-consumer-cutover.js");
const r05 = materializeR05DeliveryWaveRebase();
const visible = selector.listVisibleBatchAKnowledgePoints();
const sourceIds = new Set(r05.knowledgePointAssignments.flatMap((row) => row.sourceNodeIds));
const readback = {
  status: visible.length === 482 && sourceIds.size === 79 ? "PASS_PREFLIGHT_AUTHORITY_PARITY" : "FAIL_PREFLIGHT_AUTHORITY_PARITY",
  canonicalSourceNodes: sourceIds.size,
  canonicalKnowledgePoints: r05.knowledgePointAssignments.length,
  browserVisibleKnowledgePoints: visible.length,
  browserAvailabilityVisibleCount: selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
  browserAvailabilitySourceCount: selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,
  browserAvailabilityHiddenPendingCount: selector.BATCH_A_SELECTOR_AVAILABILITY.hiddenPendingCount,
  browserAvailabilityNotSelectableCount: selector.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount,
  r07ExplicitAuthoritativeConsumerUnits: R07_PUBLIC_PRODUCT_UNIT_IDS.length,
  nextShortestStep: "P09_UI_A01_DeployedSourceDropdownAuthorityRepair_And_79SourceCurrentInventoryMaterialization"
};
console.log("P09_UI_SOURCE_AUTHORITY_PREFLIGHT_READBACK=" + JSON.stringify(readback));
