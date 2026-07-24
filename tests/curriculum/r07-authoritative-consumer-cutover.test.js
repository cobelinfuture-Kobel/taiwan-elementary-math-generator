import test from "node:test";
import assert from "node:assert/strict";

import {
  getR07AuthorityUnit,
  materializeR07AuthoritativeConsumerCutover,
} from "../../src/curriculum/global/r07-authoritative-consumer-cutover.mjs";
import {
  applyR07AuthoritativeConsumerCutover,
  listR07GlobalAuthorityDescriptors,
  resolveR07GlobalAuthorityDescriptor,
  R07_PUBLIC_PRODUCT_UNIT_IDS,
  validateR07BrowserAuthorityRegistry,
} from "../../site/modules/curriculum/global/r07-authoritative-consumer-cutover.js";
import { validateR07AuthoritativeConsumerCutover } from "../../tools/curriculum/validate-r07-authoritative-consumer-cutover.mjs";

const G4A_U08_LEGACY_KP_ALIASES = Object.freeze([
  "kp_g4a_u08_parentheses_first",
  "kp_g4a_u08_mul_div_before_add_sub",
  "kp_g4a_u08_left_to_right_same_level",
  "kp_g4a_u08_comprehensive_order_of_operations",
]);


test("R07 materializes the 15-unit Global-primary authority", () => {
  const cutover = materializeR07AuthoritativeConsumerCutover();
  assert.equal(cutover.metrics.productUnitCount, 15);
  assert.equal(cutover.metrics.sourceNodeCount, 16);
  assert.equal(cutover.metrics.globalKnowledgePointCount, 156);
  assert.equal(cutover.metrics.globalModelReconciliationCount, 9);
  assert.equal(cutover.metrics.globalPrimaryUnitCount, 15);
  assert.equal(cutover.metrics.identityParityFailureCount, 0);
});


test("R07 preserves existing IDs and demotes legacy authority to a read-only alias", () => {
  const cutover = materializeR07AuthoritativeConsumerCutover();
  for (const unit of cutover.authorityUnits) {
    assert.equal(unit.authorityMode, "GLOBAL_PRIMARY");
    assert.equal(unit.legacyAuthorityRole, "COMPATIBILITY_ALIAS_READ_ONLY");
    assert.equal(unit.cutoverState, "PRODUCTION_AUTHORITY_CUTOVER_ADMITTED");
    assert.deepEqual(unit.identityParity, {
      sourceIdsPreserved: true,
      knowledgePointIdsPreserved: true,
      patternSpecAndQuestionIdsPreserved: true,
      currentProductionUsePreserved: true,
      visibleOutputChangeExpected: false,
    });
  }
  assert.deepEqual(getR07AuthorityUnit("g5a_u02_5a02").legacySourceNodeIds, [
    "g5a_u02_5a02a",
    "g5a_u02_5a02a1",
  ]);
});


test("R07 browser authority resolves and cuts over all 15 public units", () => {
  const descriptors = listR07GlobalAuthorityDescriptors();
  assert.equal(descriptors.length, 15);
  assert.deepEqual(new Set(descriptors.map((row) => row.sourceId)), new Set(R07_PUBLIC_PRODUCT_UNIT_IDS));
  for (const sourceId of R07_PUBLIC_PRODUCT_UNIT_IDS) {
    const descriptor = resolveR07GlobalAuthorityDescriptor(sourceId);
    assert.ok(descriptor, sourceId);
    assert.ok(descriptor.knowledgePointIds.length > 0, sourceId);
    assert.ok(descriptor.patternGroupIds.length > 0, sourceId);
    const result = applyR07AuthoritativeConsumerCutover({ sourceId, selectionMode: "sourceUnit" });
    assert.equal(result.applied, true, sourceId);
    assert.equal(result.blocked, false, sourceId);
    assert.equal(result.plan.globalAuthorityCutover.authorityMode, "GLOBAL_PRIMARY");
    assert.equal(result.plan.legacyCompatibilityAlias.role, "COMPATIBILITY_ALIAS_READ_ONLY");
  }
  assert.equal(validateR07BrowserAuthorityRegistry().ok, true);
});


test("R07 preserves an explicit KnowledgePoint and PatternGroup selection", () => {
  const descriptor = resolveR07GlobalAuthorityDescriptor("g3a_u02_3a02");
  const knowledgePointId = descriptor.knowledgePointIds[0];
  const patternGroupId = descriptor.patternGroupIds[0];
  const result = applyR07AuthoritativeConsumerCutover({
    sourceId: "g3a_u02_3a02",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: [patternGroupId],
  });
  assert.equal(result.applied, true);
  assert.deepEqual(result.plan.selectedKnowledgePointIds, [knowledgePointId]);
  assert.deepEqual(result.plan.selectedPatternGroupIds, [patternGroupId]);
  assert.equal(result.dualReadParity.requestedKnowledgePointIdsPreserved, true);
  assert.equal(result.dualReadParity.requestedPatternGroupIdsPreserved, true);
});


test("R07 keeps G4A-U08 production KP aliases routable as read-only compatibility identities", () => {
  const descriptor = resolveR07GlobalAuthorityDescriptor("g4a_u08_4a08");
  assert.ok(G4A_U08_LEGACY_KP_ALIASES.every((id) => descriptor.compatibilityKnowledgePointAliasIds.includes(id)));
  for (const knowledgePointId of G4A_U08_LEGACY_KP_ALIASES) {
    const result = applyR07AuthoritativeConsumerCutover({
      sourceId: "g4a_u08_4a08",
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePointId],
    });
    assert.equal(result.applied, true, knowledgePointId);
    assert.equal(result.blocked, false, knowledgePointId);
    assert.deepEqual(result.plan.selectedKnowledgePointIds, [knowledgePointId]);
    assert.ok(result.plan.selectedPatternGroupIds.length > 0, knowledgePointId);
    assert.equal(result.plan.globalAuthorityCutover.compatibilityAliasKnowledgePointCount, 1);
    assert.deepEqual(result.plan.legacyCompatibilityAlias.knowledgePointIds, [knowledgePointId]);
  }
});


test("R07 fails closed for an unknown KP and passes through non-baseline sources", () => {
  const blocked = applyR07AuthoritativeConsumerCutover({
    sourceId: "g3a_u02_3a02",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_not_registered"],
  });
  assert.equal(blocked.blocked, true);
  assert.ok(blocked.errors.includes("R07_UNKNOWN_KNOWLEDGE_POINT:kp_not_registered"));

  const passthrough = applyR07AuthoritativeConsumerCutover({
    sourceId: "future_source",
    selectionMode: "sourceUnit",
  });
  assert.equal(passthrough.applied, false);
  assert.equal(passthrough.blocked, false);
  assert.equal(passthrough.adapter, null);
});


test("R07 locks full product close before recursive-improvement admin development", () => {
  const cutover = materializeR07AuthoritativeConsumerCutover();
  assert.equal(cutover.mainlineBoundary.fullProductLineCloseTask, "P10_FullUIHTMLPDFPrintProductCloseout");
  assert.equal(cutover.mainlineBoundary.recursiveImprovementAdminDeferredUntil, "P10_FullUIHTMLPDFPrintProductCloseout");
  assert.equal(cutover.policy.postMigrationSequence.recursiveImprovementAdminStartAllowedAfter, "P10_FullUIHTMLPDFPrintProductCloseout");
});


test("R07 validator passes the authoritative cutover", () => {
  const report = validateR07AuthoritativeConsumerCutover();
  assert.equal(report.ok, true, JSON.stringify(report.errors, null, 2));
  assert.equal(report.summary.productUnitCount, 15);
  assert.equal(report.summary.browserAuthorityUnitCount, 15);
  assert.equal(report.summary.identityParityFailureCount, 0);
});


test("R07 validator fails closed on a legacy-primary or incomplete cutover", () => {
  const cutover = materializeR07AuthoritativeConsumerCutover();
  const authorityUnits = cutover.authorityUnits.map((row, index) => index === 0 ? {
    ...row,
    authorityMode: "LEGACY_PRIMARY",
  } : row);
  const tampered = {
    ...cutover,
    authorityUnits,
    metrics: { ...cutover.metrics, globalPrimaryUnitCount: 14 },
    mainlineBoundary: { ...cutover.mainlineBoundary, globalAuthorityPrimary: false },
  };
  const report = validateR07AuthoritativeConsumerCutover(tampered);
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((row) => row.code === "R07_GLOBAL_PRIMARY_UNIT_COUNT_INVALID"));
  assert.ok(report.errors.some((row) => row.code === "R07_GLOBAL_AUTHORITY_NOT_PRIMARY"));
  assert.ok(report.errors.some((row) => row.code === "R07_PRODUCTION_AUTHORITY_NOT_CUT_OVER"));
});
