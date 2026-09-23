import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP02W2ProductAdmissionInventory } from "./p02-w2-product-admission-inventory.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "./p02b-global-authority-lookup-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P02C_DIR = path.join(ROOT, "data/curriculum/full-product/p02c");
const TARGET_CAPABILITY_ID = "cap_quantity_dimension_unit_identity";

export const P02C_QUANTITY_IDENTITY_CONSUMER_VERSION = "p02c-quantity-dimension-unit-identity-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P02C_DIR, fileName), "utf8"));
}

function readRepoJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
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

function semanticCorpus(row, authority) {
  return JSON.stringify({
    knowledgePointId: row.knowledgePointId,
    canonicalNameZh: row.canonicalNameZh,
    capabilityStatement: row.capabilityStatement,
    reasoningInvariant: row.reasoningInvariant,
    primaryRuntimeProfileId: row.primaryRuntimeProfileId,
    sourceRefs: row.sourceRefs,
    authorityName: authority?.canonicalNameZh,
    authorityCapability: authority?.capabilityStatement,
    authorityInvariant: authority?.reasoningInvariant,
  }).toLowerCase();
}

function matchesAny(corpus, terms = []) {
  return terms.some((term) => corpus.includes(String(term).toLowerCase()));
}

function classifyIdentity(row, authority, policy) {
  const profileId = row.primaryRuntimeProfileId;
  if (!policy.scope.allowedPrimaryRuntimeProfileIds.includes(profileId)) {
    return {
      identity: null,
      errors: [`P02C_PRIMARY_PROFILE_INVALID:${row.knowledgePointId}:${profileId}`],
    };
  }

  const corpus = semanticCorpus(row, authority);
  const profileRules = policy.dimensionRules.filter((rule) => rule.profileIds.includes(profileId));
  const fixedRules = profileRules.filter((rule) => rule.fixedForProfile === true);
  const semanticRules = profileRules.filter((rule) => (
    rule.fixedForProfile !== true
    && rule.fallbackForProfile !== true
    && matchesAny(corpus, rule.anyTerms)
  ));
  const fallbackRules = profileRules.filter((rule) => rule.fallbackForProfile === true);
  const matches = fixedRules.length > 0 ? fixedRules : (semanticRules.length > 0 ? semanticRules : fallbackRules);

  if (matches.length === 0) {
    return {
      identity: null,
      errors: [`P02C_QUANTITY_IDENTITY_UNCLASSIFIED:${row.knowledgePointId}`],
    };
  }
  if (matches.length !== 1) {
    return {
      identity: null,
      errors: [`P02C_QUANTITY_IDENTITY_AMBIGUOUS:${row.knowledgePointId}:${matches.map((rule) => rule.ruleId).join(",")}`],
    };
  }

  const rule = matches[0];
  return {
    errors: [],
    identity: Object.freeze({
      identityId: `p02cqi_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      canonicalNameZh: authority?.canonicalNameZh ?? row.canonicalNameZh,
      primaryRuntimeProfileId: profileId,
      classificationRuleId: rule.ruleId,
      dimensionId: rule.dimensionId,
      unitFamilyId: rule.unitFamilyId,
      canonicalUnitIds: freezeArray(rule.canonicalUnitIds),
      unitIdentityMode: rule.unitIdentityMode,
      sourceNodeIds: freezeArray(unique(row.sourceNodeIds).sort()),
      assignedDeliveryWaveId: row.assignedDeliveryWaveId,
      authorityMode: "GLOBAL_PRIMARY",
      consumerMode: "PRODUCTION_READ_ONLY_QUANTITY_IDENTITY",
      productionAdmissionState: "PRODUCTION_ADMITTED",
      conversionAllowed: false,
      semanticRoleBindingAllowed: false,
      quantityArithmeticAllowed: false,
    }),
  };
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze({ ...request }),
    consumerVersion: P02C_QUANTITY_IDENTITY_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_READ_ONLY_QUANTITY_IDENTITY",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    identity: null,
  });
}

function successResult(request, identity) {
  return Object.freeze({
    ok: true,
    blocked: false,
    errors: Object.freeze([]),
    request: Object.freeze({ ...request }),
    consumerVersion: P02C_QUANTITY_IDENTITY_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_READ_ONLY_QUANTITY_IDENTITY",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    identity: Object.freeze(clone(identity)),
  });
}

export function materializeP02CQuantityDimensionUnitIdentityConsumer() {
  const policy = readJson("quantity-dimension-unit-identity-policy.json");
  const manifest = readJson("quantity-dimension-unit-identity.manifest.json");
  const promotionRegistry = readJson("w2-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(promotionRegistry.predecessorPromotionRegistryPath);
  const p02 = materializeP02W2ProductAdmissionInventory();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const dependentRows = p02.dependentKnowledgePointRows.filter((row) => (
    row.w2FoundationCapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));

  const classificationErrors = [];
  const identities = [];
  for (const row of dependentRows) {
    const authority = p02b.getKnowledgePoint(row.knowledgePointId);
    if (!authority) {
      classificationErrors.push(`P02C_UNKNOWN_KNOWLEDGE_POINT:${row.knowledgePointId}`);
      continue;
    }
    const classified = classifyIdentity(row, authority, policy);
    classificationErrors.push(...classified.errors);
    if (classified.identity) identities.push(classified.identity);
  }

  identities.sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
  const identityByKnowledgePointId = new Map(identities.map((row) => [row.knowledgePointId, row]));
  const dependentByKnowledgePointId = new Map(dependentRows.map((row) => [row.knowledgePointId, row]));
  const dimensionCounts = Object.fromEntries(unique(identities.map((row) => row.dimensionId)).sort().map((dimensionId) => [
    dimensionId,
    identities.filter((row) => row.dimensionId === dimensionId).length,
  ]));
  const sourceNodeIds = unique(identities.flatMap((row) => row.sourceNodeIds)).sort();
  const inheritedPromotionIds = predecessorPromotionRegistry.promotions.map((row) => row.capabilityId);
  const effectivePromotionCapabilityIds = unique([
    ...inheritedPromotionIds,
    ...promotionRegistry.promotions.map((row) => row.capabilityId),
  ]).sort();

  function resolve({
    knowledgePointId = null,
    sourceNodeId = null,
    assertedDimensionId = null,
    assertedUnitId = null,
  } = {}) {
    const request = {
      knowledgePointId: typeof knowledgePointId === "string" && knowledgePointId.length > 0 ? knowledgePointId : null,
      sourceNodeId: typeof sourceNodeId === "string" && sourceNodeId.length > 0 ? sourceNodeId : null,
      assertedDimensionId: typeof assertedDimensionId === "string" && assertedDimensionId.length > 0 ? assertedDimensionId : null,
      assertedUnitId: typeof assertedUnitId === "string" && assertedUnitId.length > 0 ? assertedUnitId : null,
    };
    if (!request.knowledgePointId) {
      return blockedResult(request, ["P02C_QUANTITY_KP_ID_REQUIRED"]);
    }
    if (!p02b.getKnowledgePoint(request.knowledgePointId)) {
      return blockedResult(request, [`P02C_UNKNOWN_KNOWLEDGE_POINT:${request.knowledgePointId}`]);
    }
    if (!dependentByKnowledgePointId.has(request.knowledgePointId)) {
      return blockedResult(request, [`P02C_KP_NOT_QUANTITY_IDENTITY_DEPENDENT:${request.knowledgePointId}`]);
    }
    const identity = identityByKnowledgePointId.get(request.knowledgePointId);
    if (!identity) {
      const errors = classificationErrors.filter((code) => code.includes(request.knowledgePointId));
      return blockedResult(request, errors.length > 0 ? errors : [`P02C_QUANTITY_IDENTITY_UNCLASSIFIED:${request.knowledgePointId}`]);
    }
    if (request.sourceNodeId) {
      const sourcePair = p02b.resolve({
        sourceNodeId: request.sourceNodeId,
        knowledgePointId: request.knowledgePointId,
      });
      if (!sourcePair.ok) {
        return blockedResult(request, [
          `P02C_SOURCE_KP_MISMATCH:${request.sourceNodeId}:${request.knowledgePointId}`,
        ]);
      }
    }
    if (request.assertedDimensionId && request.assertedDimensionId !== identity.dimensionId) {
      return blockedResult(request, [
        `P02C_DIMENSION_ID_MISMATCH:${request.knowledgePointId}:${request.assertedDimensionId}:${identity.dimensionId}`,
      ]);
    }
    if (request.assertedUnitId && !identity.canonicalUnitIds.includes(request.assertedUnitId)) {
      return blockedResult(request, [
        `P02C_UNIT_ID_MISMATCH:${request.knowledgePointId}:${request.assertedUnitId}:${identity.unitFamilyId}`,
      ]);
    }
    return successResult(request, identity);
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    consumerVersion: P02C_QUANTITY_IDENTITY_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_READ_ONLY_QUANTITY_IDENTITY",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    identities: freezeArray(identities),
    classificationErrors: freezeArray(classificationErrors),
    metrics: Object.freeze({
      effectiveDependentKnowledgePointCount: dependentRows.length,
      classifiedKnowledgePointCount: identities.length,
      classificationErrorCount: classificationErrors.length,
      dependentSourceNodeCount: sourceNodeIds.length,
      quantityIdentityBindingCount: identities.reduce((sum, row) => sum + row.sourceNodeIds.length, 0),
      sourceDeclaredFallbackCount: identities.filter((row) => row.unitIdentityMode === "SOURCE_DECLARED_ONLY").length,
      dimensionCounts: Object.freeze(dimensionCounts),
      inheritedPromotionCount: inheritedPromotionIds.length,
      newPromotionCount: promotionRegistry.promotions.length,
      effectivePromotionCount: effectivePromotionCapabilityIds.length,
      remainingShadowFoundationCount: promotionRegistry.remainingShadowFoundationCapabilityIds.length,
    }),
    effectivePromotionCapabilityIds: freezeArray(effectivePromotionCapabilityIds),
    sourceNodeIds: freezeArray(sourceNodeIds),
    resolve,
    getIdentity(knowledgePointId) {
      return identityByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function resolveP02CQuantityIdentity(request = {}) {
  return materializeP02CQuantityDimensionUnitIdentityConsumer().resolve(request);
}

export function listP02CQuantityIdentities() {
  return clone(materializeP02CQuantityDimensionUnitIdentityConsumer().identities);
}

export function getP02CQuantityIdentity(knowledgePointId) {
  const identity = materializeP02CQuantityDimensionUnitIdentityConsumer().getIdentity(knowledgePointId);
  return identity ? clone(identity) : null;
}

export function listP02CEffectiveW2PromotionCapabilityIds() {
  return clone(materializeP02CQuantityDimensionUnitIdentityConsumer().effectivePromotionCapabilityIds);
}
