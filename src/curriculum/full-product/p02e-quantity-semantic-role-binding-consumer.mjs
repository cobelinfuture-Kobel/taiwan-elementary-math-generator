import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP02W2ProductAdmissionInventory } from "./p02-w2-product-admission-inventory.mjs";
import { materializeP02BGlobalAuthorityLookupConsumer } from "./p02b-global-authority-lookup-consumer.mjs";
import { materializeP02CQuantityDimensionUnitIdentityConsumer } from "./p02c-quantity-dimension-unit-identity-consumer.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P02E_DIR = path.join(ROOT, "data/curriculum/full-product/p02e");
const TARGET_CAPABILITY_ID = "cap_quantity_semantic_role_binding";

export const P02E_QUANTITY_SEMANTIC_ROLE_CONSUMER_VERSION = "p02e-quantity-semantic-role-binding-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P02E_DIR, fileName), "utf8"));
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

function bindingFromRule({ row, authority, quantityIdentity, rule, classificationRuleId }) {
  const allowedTargetRoleIds = unique(rule.allowedTargetRoleIds ?? [rule.targetRoleId]);
  return Object.freeze({
    bindingId: `p02esr_${row.knowledgePointId.replace(/^kp_/, "")}`,
    knowledgePointId: row.knowledgePointId,
    canonicalNameZh: authority?.canonicalNameZh ?? row.canonicalNameZh,
    primaryRuntimeProfileId: row.primaryRuntimeProfileId,
    classificationRuleId,
    relationFamilyId: rule.relationFamilyId,
    knownRoleIds: freezeArray(unique(rule.knownRoleIds)),
    targetRoleId: rule.targetRoleId,
    targetRoleMode: rule.targetRoleMode,
    allowedTargetRoleIds: freezeArray(allowedTargetRoleIds),
    relationDirection: "KNOWN_ROLES_TO_TARGET_ROLE",
    quantityIdentityId: quantityIdentity.identityId,
    dimensionId: quantityIdentity.dimensionId,
    unitFamilyId: quantityIdentity.unitFamilyId,
    canonicalUnitIds: freezeArray(quantityIdentity.canonicalUnitIds),
    unitIdentityMode: quantityIdentity.unitIdentityMode,
    sourceNodeIds: freezeArray(unique(row.sourceNodeIds).sort()),
    assignedDeliveryWaveId: row.assignedDeliveryWaveId,
    authorityMode: "GLOBAL_PRIMARY",
    consumerMode: "PRODUCTION_READ_ONLY_QUANTITY_SEMANTIC_ROLE_BINDING",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    storyTemplateGenerationAllowed: false,
    numericComputationAllowed: false,
    quantityArithmeticAllowed: false,
  });
}

function classifyRoleBinding(row, authority, quantityIdentity, policy, overrideByKnowledgePointId) {
  const profileId = row.primaryRuntimeProfileId;
  if (!policy.scope.allowedPrimaryRuntimeProfileIds.includes(profileId)) {
    return {
      binding: null,
      errors: [`P02E_PRIMARY_PROFILE_INVALID:${row.knowledgePointId}:${profileId}`],
    };
  }
  if (!quantityIdentity) {
    return {
      binding: null,
      errors: [`P02E_QUANTITY_IDENTITY_REQUIRED:${row.knowledgePointId}`],
    };
  }

  const exactOverride = overrideByKnowledgePointId.get(row.knowledgePointId);
  if (exactOverride) {
    return {
      errors: [],
      binding: bindingFromRule({
        row,
        authority,
        quantityIdentity,
        rule: exactOverride,
        classificationRuleId: `override:${row.knowledgePointId}`,
      }),
    };
  }

  const corpus = semanticCorpus(row, authority);
  const profileRules = policy.roleFamilyRules.filter((rule) => rule.profileIds.includes(profileId));
  const semanticMatches = profileRules.filter((rule) => (
    rule.fallbackForProfile !== true
    && matchesAny(corpus, rule.anyTerms)
    && !matchesAny(corpus, rule.noneTerms)
  ));
  const fallbackMatches = profileRules.filter((rule) => rule.fallbackForProfile === true);
  let matches = semanticMatches;
  if (matches.length > 1) {
    const minimumPriority = Math.min(...matches.map((rule) => Number(rule.priority ?? 1000)));
    matches = matches.filter((rule) => Number(rule.priority ?? 1000) === minimumPriority);
  }
  if (matches.length === 0) matches = fallbackMatches;

  if (matches.length === 0) {
    return {
      binding: null,
      errors: [`P02E_ROLE_BINDING_UNCLASSIFIED:${row.knowledgePointId}`],
    };
  }
  if (matches.length !== 1) {
    return {
      binding: null,
      errors: [`P02E_ROLE_BINDING_AMBIGUOUS:${row.knowledgePointId}:${matches.map((rule) => rule.ruleId).join(",")}`],
    };
  }
  return {
    errors: [],
    binding: bindingFromRule({
      row,
      authority,
      quantityIdentity,
      rule: matches[0],
      classificationRuleId: matches[0].ruleId,
    }),
  };
}

function blockedResult(request, errors) {
  return Object.freeze({
    ok: false,
    blocked: true,
    errors: freezeArray(errors),
    request: Object.freeze({ ...request }),
    consumerVersion: P02E_QUANTITY_SEMANTIC_ROLE_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_READ_ONLY_QUANTITY_SEMANTIC_ROLE_BINDING",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    binding: null,
    quantityIdentity: null,
  });
}

function successResult(request, binding, quantityIdentity) {
  return Object.freeze({
    ok: true,
    blocked: false,
    errors: Object.freeze([]),
    request: Object.freeze({ ...request }),
    consumerVersion: P02E_QUANTITY_SEMANTIC_ROLE_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_READ_ONLY_QUANTITY_SEMANTIC_ROLE_BINDING",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    binding: Object.freeze(clone(binding)),
    quantityIdentity: Object.freeze(clone(quantityIdentity)),
  });
}

export function materializeP02EQuantitySemanticRoleBindingConsumer() {
  const policy = readJson("quantity-semantic-role-binding-policy.json");
  const overrideRegistry = readJson("quantity-semantic-role-overrides.json");
  const manifest = readJson("quantity-semantic-role-binding.manifest.json");
  const promotionRegistry = readJson("w2-capability-promotion-registry.json");
  const predecessorPromotionRegistry = readRepoJson(promotionRegistry.predecessorPromotionRegistryPath);
  const p02 = materializeP02W2ProductAdmissionInventory();
  const p02b = materializeP02BGlobalAuthorityLookupConsumer();
  const p02c = materializeP02CQuantityDimensionUnitIdentityConsumer();
  const overrideByKnowledgePointId = new Map(
    (overrideRegistry.bindings ?? []).map((row) => [row.knowledgePointId, row]),
  );
  const dependentRows = p02.dependentKnowledgePointRows.filter((row) => (
    row.w2FoundationCapabilityIds.includes(TARGET_CAPABILITY_ID)
  ));

  const classificationErrors = [];
  const bindings = [];
  for (const row of dependentRows) {
    const authority = p02b.getKnowledgePoint(row.knowledgePointId);
    if (!authority) {
      classificationErrors.push(`P02E_UNKNOWN_KNOWLEDGE_POINT:${row.knowledgePointId}`);
      continue;
    }
    const classified = classifyRoleBinding(
      row,
      authority,
      p02c.getIdentity(row.knowledgePointId),
      policy,
      overrideByKnowledgePointId,
    );
    classificationErrors.push(...classified.errors);
    if (classified.binding) bindings.push(classified.binding);
  }

  bindings.sort((a, b) => a.knowledgePointId.localeCompare(b.knowledgePointId));
  const bindingByKnowledgePointId = new Map(bindings.map((row) => [row.knowledgePointId, row]));
  const dependentByKnowledgePointId = new Map(dependentRows.map((row) => [row.knowledgePointId, row]));
  const sourceNodeIds = unique(bindings.flatMap((row) => row.sourceNodeIds)).sort();
  const relationFamilyCounts = Object.fromEntries(unique(bindings.map((row) => row.relationFamilyId)).sort().map((familyId) => [
    familyId,
    bindings.filter((row) => row.relationFamilyId === familyId).length,
  ]));
  const inheritedPromotionIds = predecessorPromotionRegistry.effectivePromotionCapabilityIds
    ?? predecessorPromotionRegistry.promotions.map((row) => row.capabilityId);
  const effectivePromotionCapabilityIds = unique([
    ...inheritedPromotionIds,
    ...promotionRegistry.promotions.map((row) => row.capabilityId),
  ]).sort();

  function resolve({
    knowledgePointId = null,
    sourceNodeId = null,
    assertedRelationFamilyId = null,
    assertedTargetRoleId = null,
    assertedDimensionId = null,
    assertedUnitId = null,
  } = {}) {
    const request = {
      knowledgePointId: typeof knowledgePointId === "string" && knowledgePointId.length > 0 ? knowledgePointId : null,
      sourceNodeId: typeof sourceNodeId === "string" && sourceNodeId.length > 0 ? sourceNodeId : null,
      assertedRelationFamilyId: typeof assertedRelationFamilyId === "string" && assertedRelationFamilyId.length > 0
        ? assertedRelationFamilyId
        : null,
      assertedTargetRoleId: typeof assertedTargetRoleId === "string" && assertedTargetRoleId.length > 0
        ? assertedTargetRoleId
        : null,
      assertedDimensionId: typeof assertedDimensionId === "string" && assertedDimensionId.length > 0
        ? assertedDimensionId
        : null,
      assertedUnitId: typeof assertedUnitId === "string" && assertedUnitId.length > 0 ? assertedUnitId : null,
    };
    if (!request.knowledgePointId) {
      return blockedResult(request, ["P02E_SEMANTIC_ROLE_KP_ID_REQUIRED"]);
    }
    if (!p02b.getKnowledgePoint(request.knowledgePointId)) {
      return blockedResult(request, [`P02E_UNKNOWN_KNOWLEDGE_POINT:${request.knowledgePointId}`]);
    }
    if (!dependentByKnowledgePointId.has(request.knowledgePointId)) {
      return blockedResult(request, [`P02E_KP_NOT_SEMANTIC_ROLE_DEPENDENT:${request.knowledgePointId}`]);
    }
    const binding = bindingByKnowledgePointId.get(request.knowledgePointId);
    if (!binding) {
      const errors = classificationErrors.filter((code) => code.includes(request.knowledgePointId));
      return blockedResult(request, errors.length > 0 ? errors : [`P02E_ROLE_BINDING_UNCLASSIFIED:${request.knowledgePointId}`]);
    }

    const quantityResolution = p02c.resolve({
      knowledgePointId: request.knowledgePointId,
      sourceNodeId: request.sourceNodeId,
      assertedDimensionId: request.assertedDimensionId,
      assertedUnitId: request.assertedUnitId,
    });
    if (!quantityResolution.ok) {
      if (quantityResolution.errors.some((code) => code.startsWith("P02C_SOURCE_KP_MISMATCH"))) {
        return blockedResult(request, [`P02E_SOURCE_KP_MISMATCH:${request.sourceNodeId}:${request.knowledgePointId}`]);
      }
      if (quantityResolution.errors.some((code) => code.startsWith("P02C_DIMENSION_ID_MISMATCH"))) {
        return blockedResult(request, [`P02E_DIMENSION_ASSERTION_INVALID:${request.knowledgePointId}:${request.assertedDimensionId}`]);
      }
      if (quantityResolution.errors.some((code) => code.startsWith("P02C_UNIT_ID_MISMATCH"))) {
        return blockedResult(request, [`P02E_UNIT_ASSERTION_INVALID:${request.knowledgePointId}:${request.assertedUnitId}`]);
      }
      return blockedResult(request, [`P02E_QUANTITY_IDENTITY_REQUIRED:${request.knowledgePointId}`]);
    }
    if (request.assertedRelationFamilyId && request.assertedRelationFamilyId !== binding.relationFamilyId) {
      return blockedResult(request, [
        `P02E_RELATION_FAMILY_MISMATCH:${request.knowledgePointId}:${request.assertedRelationFamilyId}:${binding.relationFamilyId}`,
      ]);
    }
    if (request.assertedTargetRoleId && !binding.allowedTargetRoleIds.includes(request.assertedTargetRoleId)) {
      return blockedResult(request, [
        `P02E_TARGET_ROLE_MISMATCH:${request.knowledgePointId}:${request.assertedTargetRoleId}:${binding.targetRoleId}`,
      ]);
    }
    return successResult(request, binding, quantityResolution.identity);
  }

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    consumerVersion: P02E_QUANTITY_SEMANTIC_ROLE_CONSUMER_VERSION,
    consumerMode: "PRODUCTION_READ_ONLY_QUANTITY_SEMANTIC_ROLE_BINDING",
    productionAdmissionState: "PRODUCTION_ADMITTED",
    policy: Object.freeze(policy),
    overrideRegistry: Object.freeze(overrideRegistry),
    manifest: Object.freeze(manifest),
    promotionRegistry: Object.freeze(promotionRegistry),
    predecessorPromotionRegistry: Object.freeze(predecessorPromotionRegistry),
    bindings: freezeArray(bindings),
    classificationErrors: freezeArray(classificationErrors),
    metrics: Object.freeze({
      effectiveDependentKnowledgePointCount: dependentRows.length,
      classifiedKnowledgePointCount: bindings.length,
      classificationErrorCount: classificationErrors.length,
      dependentSourceNodeCount: sourceNodeIds.length,
      sourceKnowledgePointBindingCount: bindings.reduce((sum, row) => sum + row.sourceNodeIds.length, 0),
      authorityOverrideBindingCount: bindings.filter((row) => row.classificationRuleId.startsWith("override:")).length,
      genericFallbackBindingCount: bindings.filter((row) => row.relationFamilyId.startsWith("SOURCE_DECLARED_")).length,
      sourceDeclaredRoleBindingCount: bindings.filter((row) => row.targetRoleMode !== "FIXED").length,
      fixedRoleBindingCount: bindings.filter((row) => row.targetRoleMode === "FIXED").length,
      relationFamilyCounts: Object.freeze(relationFamilyCounts),
      inheritedPromotionCount: inheritedPromotionIds.length,
      newPromotionCount: promotionRegistry.promotions.length,
      effectivePromotionCount: effectivePromotionCapabilityIds.length,
      remainingShadowFoundationCount: promotionRegistry.remainingShadowFoundationCapabilityIds.length,
    }),
    effectivePromotionCapabilityIds: freezeArray(effectivePromotionCapabilityIds),
    sourceNodeIds: freezeArray(sourceNodeIds),
    resolve,
    getBinding(knowledgePointId) {
      return bindingByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function resolveP02EQuantitySemanticRoleBinding(request = {}) {
  return materializeP02EQuantitySemanticRoleBindingConsumer().resolve(request);
}

export function listP02EQuantitySemanticRoleBindings() {
  return clone(materializeP02EQuantitySemanticRoleBindingConsumer().bindings);
}

export function getP02EQuantitySemanticRoleBinding(knowledgePointId) {
  const binding = materializeP02EQuantitySemanticRoleBindingConsumer().getBinding(knowledgePointId);
  return binding ? clone(binding) : null;
}

export function listP02EEffectiveW2PromotionCapabilityIds() {
  return clone(materializeP02EQuantitySemanticRoleBindingConsumer().effectivePromotionCapabilityIds);
}
