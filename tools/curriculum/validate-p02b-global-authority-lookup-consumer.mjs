import path from "node:path";
import { pathToFileURL } from "node:url";

import { materializeR04SharedRuntimeCapabilityMatrix } from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "../../src/curriculum/full-product/p02b-global-authority-lookup-consumer.mjs";
import { listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";

function issue(code, details = {}) {
  return Object.freeze({ code, ...details });
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

export function validateP02BGlobalAuthorityLookupConsumer(candidate = null) {
  const consumer = candidate ?? materializeP02BGlobalAuthorityLookupConsumer();
  const errors = [];
  const sources = consumer.sourceDescriptors ?? [];
  const knowledgePoints = consumer.knowledgePointDescriptors ?? [];
  const metrics = consumer.metrics ?? {};
  const expected = consumer.manifest?.expectedCounts ?? {};
  const sourceById = new Map(sources.map((row) => [row.sourceNodeId, row]));
  const knowledgePointById = new Map(knowledgePoints.map((row) => [row.knowledgePointId, row]));

  if (consumer.programId !== "FULL_PRODUCT_LINE_D0_V1") {
    errors.push(issue("P02B_PROGRAM_ID_INVALID", { actual: consumer.programId }));
  }
  if (consumer.taskId !== "P02B_W2GlobalAuthorityLookupConsumerAdmission") {
    errors.push(issue("P02B_TASK_ID_INVALID", { actual: consumer.taskId }));
  }
  if (consumer.authorityMode !== "GLOBAL_PRIMARY"
    || consumer.consumerMode !== "PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY"
    || consumer.productionAdmissionState !== "PRODUCTION_ADMITTED") {
    errors.push(issue("P02B_CONSUMER_ADMISSION_STATE_INVALID"));
  }

  if (sources.length !== expected.globalSourceNodeCount || metrics.globalSourceNodeCount !== sources.length) {
    errors.push(issue("P02B_SOURCE_COUNT_INVALID", {
      expected: expected.globalSourceNodeCount,
      actual: sources.length,
      metric: metrics.globalSourceNodeCount,
    }));
  }
  if (knowledgePoints.length !== expected.canonicalKnowledgePointCount
    || metrics.canonicalKnowledgePointCount !== knowledgePoints.length) {
    errors.push(issue("P02B_KP_COUNT_INVALID", {
      expected: expected.canonicalKnowledgePointCount,
      actual: knowledgePoints.length,
      metric: metrics.canonicalKnowledgePointCount,
    }));
  }
  if (new Set(sources.map((row) => row.sourceNodeId)).size !== sources.length) {
    errors.push(issue("P02B_DUPLICATE_SOURCE_NODE"));
  }
  if (new Set(knowledgePoints.map((row) => row.knowledgePointId)).size !== knowledgePoints.length) {
    errors.push(issue("P02B_DUPLICATE_KNOWLEDGE_POINT"));
  }

  for (const source of sources) {
    if (!Array.isArray(source.knowledgePointIds) || source.knowledgePointIds.length === 0) {
      errors.push(issue("P02B_SOURCE_KP_BINDING_EMPTY", { sourceNodeId: source.sourceNodeId }));
      continue;
    }
    for (const knowledgePointId of source.knowledgePointIds) {
      const knowledgePoint = knowledgePointById.get(knowledgePointId);
      if (!knowledgePoint) {
        errors.push(issue("P02B_SOURCE_REFERENCES_UNKNOWN_KP", { sourceNodeId: source.sourceNodeId, knowledgePointId }));
      } else if (!knowledgePoint.sourceNodeIds.includes(source.sourceNodeId)) {
        errors.push(issue("P02B_SOURCE_KP_ROUNDTRIP_INVALID", { sourceNodeId: source.sourceNodeId, knowledgePointId }));
      }
    }
    const result = consumer.resolve({ sourceNodeId: source.sourceNodeId });
    if (!result.ok || result.blocked || result.source?.sourceNodeId !== source.sourceNodeId) {
      errors.push(issue("P02B_SOURCE_LOOKUP_INVALID", { sourceNodeId: source.sourceNodeId }));
    }
  }

  for (const knowledgePoint of knowledgePoints) {
    if (!Array.isArray(knowledgePoint.sourceNodeIds) || knowledgePoint.sourceNodeIds.length === 0) {
      errors.push(issue("P02B_KP_SOURCE_BINDING_EMPTY", { knowledgePointId: knowledgePoint.knowledgePointId }));
      continue;
    }
    for (const sourceNodeId of knowledgePoint.sourceNodeIds) {
      const source = sourceById.get(sourceNodeId);
      if (!source) {
        errors.push(issue("P02B_KP_REFERENCES_UNKNOWN_SOURCE", { knowledgePointId: knowledgePoint.knowledgePointId, sourceNodeId }));
      } else if (!source.knowledgePointIds.includes(knowledgePoint.knowledgePointId)) {
        errors.push(issue("P02B_KP_SOURCE_ROUNDTRIP_INVALID", { knowledgePointId: knowledgePoint.knowledgePointId, sourceNodeId }));
      }
    }
    const result = consumer.resolve({ knowledgePointId: knowledgePoint.knowledgePointId });
    if (!result.ok || result.blocked || result.knowledgePoint?.knowledgePointId !== knowledgePoint.knowledgePointId) {
      errors.push(issue("P02B_KP_LOOKUP_INVALID", { knowledgePointId: knowledgePoint.knowledgePointId }));
    }
  }

  const emptyResult = consumer.resolve({});
  const unknownSource = consumer.resolve({ sourceNodeId: "g9z_u99_unknown" });
  const unknownKnowledgePoint = consumer.resolve({ knowledgePointId: "kp_unknown_p02b" });
  if (!emptyResult.blocked || !emptyResult.errors.includes("P02B_LOOKUP_ID_REQUIRED")) {
    errors.push(issue("P02B_EMPTY_LOOKUP_NOT_BLOCKED"));
  }
  if (!unknownSource.blocked || !unknownSource.errors.some((code) => code.startsWith("P02B_UNKNOWN_SOURCE_NODE:"))) {
    errors.push(issue("P02B_UNKNOWN_SOURCE_NOT_BLOCKED"));
  }
  if (!unknownKnowledgePoint.blocked
    || !unknownKnowledgePoint.errors.some((code) => code.startsWith("P02B_UNKNOWN_KNOWLEDGE_POINT:"))) {
    errors.push(issue("P02B_UNKNOWN_KP_NOT_BLOCKED"));
  }

  const mismatchSource = sources[0] ?? null;
  const mismatchKnowledgePoint = mismatchSource
    ? knowledgePoints.find((row) => !mismatchSource.knowledgePointIds.includes(row.knowledgePointId)) ?? null
    : null;
  if (!mismatchSource || !mismatchKnowledgePoint) {
    errors.push(issue("P02B_MISMATCH_FIXTURE_UNAVAILABLE"));
  } else {
    const mismatch = consumer.resolve({
      sourceNodeId: mismatchSource.sourceNodeId,
      knowledgePointId: mismatchKnowledgePoint.knowledgePointId,
    });
    if (!mismatch.blocked || !mismatch.errors.some((code) => code.startsWith("P02B_SOURCE_KP_MISMATCH:"))) {
      errors.push(issue("P02B_SOURCE_KP_MISMATCH_NOT_BLOCKED"));
    }
  }

  const publicSourceIds = unique(listVisibleBatchAKnowledgePoints().map((row) => row.sourceId)).sort();
  if (publicSourceIds.length !== expected.currentPublicSourceNodeCount) {
    errors.push(issue("P02B_PUBLIC_SOURCE_COUNT_INVALID", {
      expected: expected.currentPublicSourceNodeCount,
      actual: publicSourceIds.length,
    }));
  }
  for (const sourceNodeId of publicSourceIds) {
    const result = consumer.resolve({ sourceNodeId });
    if (!result.ok || result.blocked) errors.push(issue("P02B_PUBLIC_SOURCE_LOOKUP_INVALID", { sourceNodeId }));
  }

  const r04 = materializeR04SharedRuntimeCapabilityMatrix();
  const r04Capability = r04.capabilities.find((row) => row.capabilityId === "cap_kp_authority_lookup");
  const promotion = consumer.getCapabilityPromotion("cap_kp_authority_lookup");
  if (r04Capability?.deliveryStatus !== "shadow_available") {
    errors.push(issue("P02B_R04_HISTORICAL_BASELINE_MUTATED", { actual: r04Capability?.deliveryStatus }));
  }
  if (!promotion
    || promotion.previousDeliveryStatus !== "shadow_available"
    || promotion.effectiveDeliveryStatus !== "production_admitted"
    || promotion.scope?.sourceNodeCount !== sources.length
    || promotion.scope?.knowledgePointCount !== knowledgePoints.length) {
    errors.push(issue("P02B_PROMOTION_RECORD_INVALID", { promotion }));
  }
  if ((consumer.promotionRegistry?.promotions ?? []).length !== expected.promotedCapabilityCount) {
    errors.push(issue("P02B_PROMOTED_CAPABILITY_COUNT_INVALID"));
  }
  const remaining = consumer.promotionRegistry?.remainingShadowFoundationCapabilityIds ?? [];
  if (remaining.length !== expected.remainingShadowFoundationCount
    || remaining.includes("cap_kp_authority_lookup")) {
    errors.push(issue("P02B_REMAINING_SHADOW_FOUNDATIONS_INVALID", { remaining }));
  }

  const rules = consumer.policy?.rules ?? {};
  const forbiddenTrueRules = [
    "parallelAuthorityAllowed",
    "parallelKnowledgePointRegistryAllowed",
    "knowledgePointContentDuplicationAllowed",
    "patternSpecImplementationAllowed",
    "generatorImplementationAllowed",
    "worksheetImplementationAllowed",
    "rendererImplementationAllowed",
    "publicUiChangeAllowed",
    "p03ToP08ImplementationAllowed",
    "existing19SourceProductModificationAllowed",
    "recursiveImprovementAdminAllowed",
  ];
  for (const key of forbiddenTrueRules) {
    if (rules[key] !== false) errors.push(issue("P02B_POLICY_BOUNDARY_INVALID", { key, actual: rules[key] }));
  }

  const boundary = consumer.manifest?.mainlineBoundary ?? {};
  if (boundary.r02AuthorityReused !== true
    || boundary.parallelRegistryCreated !== false
    || boundary.r04HistoricalBaselineMutated !== false
    || boundary.effectiveCapabilityPromotionChanged !== true
    || boundary.productionReadOnlyConsumerAdded !== true
    || boundary.productionAdmissionChanged !== true
    || boundary.publicUiChanged !== false
    || boundary.patternSpecImplementationStarted !== false
    || boundary.generatorImplementationStarted !== false
    || boundary.worksheetRendererChanged !== false
    || boundary.existing19SourceProductPreserved !== true) {
    errors.push(issue("P02B_MAINLINE_BOUNDARY_INVALID", { boundary }));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({
      globalSourceNodeCount: sources.length,
      canonicalKnowledgePointCount: knowledgePoints.length,
      currentPublicSourceNodeCount: publicSourceIds.length,
      sourceKnowledgePointBindingCount: metrics.sourceKnowledgePointBindingCount,
      knowledgePointSourceBindingCount: metrics.knowledgePointSourceBindingCount,
      promotedCapabilityCount: consumer.promotionRegistry?.promotions?.length ?? 0,
      remainingShadowFoundationCount: remaining.length,
    }),
  });
}

export function runP02BGlobalAuthorityLookupValidation() {
  const report = validateP02BGlobalAuthorityLookupConsumer();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) runP02BGlobalAuthorityLookupValidation();
