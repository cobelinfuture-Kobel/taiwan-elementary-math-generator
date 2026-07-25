import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR02GlobalKnowledgePointRegistry } from "../global/r02-global-kp-candidate-reconciliation.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P02B_DIR = path.join(ROOT, "data/curriculum/full-product/p02b");

export const P02B_GLOBAL_AUTHORITY_CONSUMER_VERSION = "p02b-global-authority-lookup-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P02B_DIR, fileName), "utf8"));
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function sourceNodeIdOf(ref) {
  return typeof ref === "string" ? ref : ref?.sourceNodeId;
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze({ ...request }),
    consumerVersion: P02B_GLOBAL_AUTHORITY_CONSUMER_VERSION,
    authorityMode: "GLOBAL_PRIMARY",
    consumerMode: "PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    source: null,
    knowledgePoint: null,
  });
}

function successResult(request, source, knowledgePoint) {
  return Object.freeze({
    ok: true,
    blocked: false,
    errors: Object.freeze([]),
    request: Object.freeze({ ...request }),
    consumerVersion: P02B_GLOBAL_AUTHORITY_CONSUMER_VERSION,
    authorityMode: "GLOBAL_PRIMARY",
    legacyAuthorityRole: "COMPATIBILITY_ALIAS_READ_ONLY",
    consumerMode: "PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    source: source ? Object.freeze(clone(source)) : null,
    knowledgePoint: knowledgePoint ? Object.freeze(clone(knowledgePoint)) : null,
  });
}

function buildSourceDescriptors(r02) {
  return r02.sourceViews.map((view) => Object.freeze({
    sourceNodeId: view.sourceNodeId,
    legacyBatchId: view.legacyBatchId ?? null,
    evidenceClass: view.evidenceClass ?? null,
    authorityPath: view.authorityPath ?? null,
    driveFileId: view.driveFileId ?? null,
    sourcePdfTitle: view.sourcePdfTitle ?? null,
    knowledgePointIds: freezeArray(unique(view.knowledgePointIds).sort()),
    candidateProjectionCount: view.candidateProjectionCount,
    authorityMode: "GLOBAL_PRIMARY",
    consumerMode: "PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY",
    productionAdmissionState: "PRODUCTION_ADMITTED",
  })).sort((a, b) => a.sourceNodeId.localeCompare(b.sourceNodeId));
}

function buildKnowledgePointDescriptors(r02) {
  return r02.knowledgePoints.map((knowledgePoint) => Object.freeze({
    knowledgePointId: knowledgePoint.knowledgePointId,
    canonicalNameZh: knowledgePoint.canonicalNameZh,
    capabilityStatement: knowledgePoint.capabilityStatement,
    reasoningInvariant: knowledgePoint.reasoningInvariant,
    candidateStatus: knowledgePoint.candidateStatus,
    sourceNodeIds: freezeArray(unique((knowledgePoint.sourceRefs ?? []).map(sourceNodeIdOf)).sort()),
    sourceRefs: freezeArray(clone(knowledgePoint.sourceRefs ?? [])),
    validatorCapabilityId: knowledgePoint.validatorCapability?.validatorCapabilityId ?? null,
    authorityMode: "GLOBAL_PRIMARY",
    consumerMode: "PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY",
    productionAdmissionState: "PRODUCTION_ADMITTED",
  })).sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
}

export function materializeP02BGlobalAuthorityLookupConsumer() {
  const policy = readJson("global-authority-lookup-policy.json");
  const manifest = readJson("global-authority-lookup.manifest.json");
  const promotionRegistry = readJson("w2-capability-promotion-registry.json");
  const r02 = materializeR02GlobalKnowledgePointRegistry({ root: ROOT });
  const sourceDescriptors = buildSourceDescriptors(r02);
  const knowledgePointDescriptors = buildKnowledgePointDescriptors(r02);
  const sourceById = new Map(sourceDescriptors.map((row) => [row.sourceNodeId, row]));
  const knowledgePointById = new Map(knowledgePointDescriptors.map((row) => [row.knowledgePointId, row]));
  const promotionByCapabilityId = new Map(
    promotionRegistry.promotions.map((row) => [row.capabilityId, Object.freeze({ ...row })]),
  );

  const metrics = Object.freeze({
    globalSourceNodeCount: sourceDescriptors.length,
    canonicalKnowledgePointCount: knowledgePointDescriptors.length,
    sourceKnowledgePointBindingCount: sourceDescriptors.reduce((sum, row) => sum + row.knowledgePointIds.length, 0),
    knowledgePointSourceBindingCount: knowledgePointDescriptors.reduce((sum, row) => sum + row.sourceNodeIds.length, 0),
    reconciledExistingKnowledgePointCount: knowledgePointDescriptors.filter((row) => (
      row.candidateStatus === "RECONCILED_EXISTING_KP"
    )).length,
    candidateOnlyKnowledgePointCount: knowledgePointDescriptors.filter((row) => (
      row.candidateStatus === "CANDIDATE_ONLY"
    )).length,
    promotedCapabilityCount: promotionRegistry.promotions.length,
    remainingShadowFoundationCount: promotionRegistry.remainingShadowFoundationCapabilityIds.length,
  });

  function resolve({ sourceNodeId = null, knowledgePointId = null } = {}) {
    const request = {
      sourceNodeId: typeof sourceNodeId === "string" && sourceNodeId.length > 0 ? sourceNodeId : null,
      knowledgePointId: typeof knowledgePointId === "string" && knowledgePointId.length > 0 ? knowledgePointId : null,
    };
    if (!request.sourceNodeId && !request.knowledgePointId) {
      return blockedResult(request, ["P02B_LOOKUP_ID_REQUIRED"]);
    }
    const source = request.sourceNodeId ? sourceById.get(request.sourceNodeId) ?? null : null;
    if (request.sourceNodeId && !source) {
      return blockedResult(request, [`P02B_UNKNOWN_SOURCE_NODE:${request.sourceNodeId}`]);
    }
    const knowledgePoint = request.knowledgePointId
      ? knowledgePointById.get(request.knowledgePointId) ?? null
      : null;
    if (request.knowledgePointId && !knowledgePoint) {
      return blockedResult(request, [`P02B_UNKNOWN_KNOWLEDGE_POINT:${request.knowledgePointId}`]);
    }
    if (source && knowledgePoint && !source.knowledgePointIds.includes(knowledgePoint.knowledgePointId)) {
      return blockedResult(request, [
        `P02B_SOURCE_KP_MISMATCH:${source.sourceNodeId}:${knowledgePoint.knowledgePointId}`,
      ]);
    }
    return successResult(request, source, knowledgePoint);
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    consumerVersion: P02B_GLOBAL_AUTHORITY_CONSUMER_VERSION,
    authorityMode: "GLOBAL_PRIMARY",
    consumerMode: "PRODUCTION_READ_ONLY_GLOBAL_AUTHORITY",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    sourceDescriptors: freezeArray(sourceDescriptors),
    knowledgePointDescriptors: freezeArray(knowledgePointDescriptors),
    metrics,
    upstreamAuthority: r02,
    resolve,
    getSource(sourceNodeId) {
      return sourceById.get(sourceNodeId) ?? null;
    },
    getKnowledgePoint(knowledgePointId) {
      return knowledgePointById.get(knowledgePointId) ?? null;
    },
    getCapabilityPromotion(capabilityId) {
      return promotionByCapabilityId.get(capabilityId) ?? null;
    },
  });
}

export function resolveP02BGlobalAuthorityLookup(request = {}) {
  return materializeP02BGlobalAuthorityLookupConsumer().resolve(request);
}

export function resolveP02BGlobalSourceAuthority(sourceNodeId) {
  return resolveP02BGlobalAuthorityLookup({ sourceNodeId });
}

export function resolveP02BGlobalKnowledgePointAuthority(knowledgePointId) {
  return resolveP02BGlobalAuthorityLookup({ knowledgePointId });
}

export function listP02BGlobalSourceAuthorities() {
  return clone(materializeP02BGlobalAuthorityLookupConsumer().sourceDescriptors);
}

export function listP02BGlobalKnowledgePointAuthorities() {
  return clone(materializeP02BGlobalAuthorityLookupConsumer().knowledgePointDescriptors);
}

export function getP02BW2CapabilityPromotion(capabilityId) {
  const promotion = materializeP02BGlobalAuthorityLookupConsumer().getCapabilityPromotion(capabilityId);
  return promotion ? clone(promotion) : null;
}
