import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR05DeliveryWaveRebase } from "./r05-delivery-wave-rebase.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const R06_DIR = path.join(ROOT, "data/curriculum/global/compatibility/r06");

function readJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}

function readR06Json(fileName) {
  return JSON.parse(fs.readFileSync(path.join(R06_DIR, fileName), "utf8"));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function dedupeBy(rows, keyFn) {
  return [...new Map(rows.map((row) => [keyFn(row), row])).values()];
}

function sourceIdsForProductUnit(productUnitId, baseline) {
  return baseline.sourceNodeIds.filter((sourceNodeId) => (
    (baseline.sourceNodeToProductUnitId[sourceNodeId] ?? sourceNodeId) === productUnitId
  ));
}

function resolveS43Alias(row, canonicalIdSet, policy) {
  if (canonicalIdSet.has(row.knowledgePointId)) {
    return {
      legacyKnowledgePointId: row.knowledgePointId,
      canonicalKnowledgePointIds: [row.knowledgePointId],
      migrationType: "EXACT_ID",
      compatibilityStatus: "RESOLVED",
    };
  }
  const rule = policy.legacyKnowledgePointAliasRules[row.knowledgePointId];
  if (rule) {
    const missing = rule.canonicalKnowledgePointIds.filter((id) => !canonicalIdSet.has(id));
    return {
      legacyKnowledgePointId: row.knowledgePointId,
      canonicalKnowledgePointIds: freezeArray(rule.canonicalKnowledgePointIds),
      migrationType: rule.migrationType,
      compatibilityStatus: missing.length === 0 ? "RESOLVED" : "BLOCKING_CANONICAL_TARGET_MISSING",
      missingCanonicalKnowledgePointIds: freezeArray(missing),
    };
  }
  return {
    legacyKnowledgePointId: row.knowledgePointId,
    canonicalKnowledgePointIds: [],
    migrationType: "NON_PRODUCTION_LEGACY_ROW_DEFERRED",
    compatibilityStatus: row.supportClass === "A"
      ? "BLOCKING_SUPPORTED_LEGACY_ALIAS_UNRESOLVED"
      : "DEFERRED_NON_PRODUCTION",
    holdReason: row.holdReason ?? null,
  };
}

function buildProductUnit(productUnitId, registry) {
  const sourceNodeIds = sourceIdsForProductUnit(productUnitId, registry.baseline);
  const authorityEntries = sourceNodeIds.map((sourceNodeId) => {
    const entry = registry.authorityBySourceNodeId.get(sourceNodeId);
    if (!entry) throw new Error(`R06_AUTHORITY_ENTRY_MISSING:${sourceNodeId}`);
    return entry;
  });
  const authorityDocs = dedupeBy(authorityEntries, (row) => row.authorityPath)
    .map((entry) => ({
      entry,
      document: readJson(entry.authorityPath),
    }));

  const protectedAssignments = registry.r05.knowledgePointAssignments
    .filter((row) => row.protectedPublicProductUnitIds.includes(productUnitId));
  const canonicalKnowledgePointIds = unique(protectedAssignments.map((row) => row.knowledgePointId)).sort();
  const canonicalIdSet = new Set(canonicalKnowledgePointIds);

  const legacyKnowledgePointMappings = dedupeBy(authorityDocs.flatMap(({ entry, document }) => (
    (document.knowledgePoints ?? []).map((row) => ({
      legacyKnowledgePointId: row.knowledgePointId,
      canonicalKnowledgePointId: row.knowledgePointId,
      migrationType: "PRODUCTION_AUTHORITY_EXACT_ID",
      sourceNodeIds: freezeArray(sourceNodeIds.filter((id) => (
        registry.authorityBySourceNodeId.get(id)?.authorityPath === entry.authorityPath
      ))),
      operationModelIds: freezeArray((row.operationModels ?? []).map((model) => model.modelId)),
      canonicalTargetExists: canonicalIdSet.has(row.knowledgePointId),
    }))
  )), (row) => row.legacyKnowledgePointId)
    .sort((a, b) => a.legacyKnowledgePointId.localeCompare(b.legacyKnowledgePointId));

  const legacyQuestionBindings = dedupeBy(authorityDocs.flatMap(({ document }) => (
    (document.existingQuestionBindings ?? []).map((row) => ({
      legacyQuestionId: row.questionId,
      canonicalKnowledgePointId: row.knowledgePointId,
      operationModelId: row.operationModelId,
      questionType: row.questionType,
      sourcePath: row.sourcePath,
      identityPreserved: true,
    }))
  )), (row) => row.legacyQuestionId)
    .sort((a, b) => a.legacyQuestionId.localeCompare(b.legacyQuestionId));

  const s43KnowledgePointRows = registry.s43KnowledgePoints.rows
    .filter((row) => sourceNodeIds.includes(row.sourceId));
  const s43AliasMappings = s43KnowledgePointRows
    .map((row) => Object.freeze({
      ...resolveS43Alias(row, canonicalIdSet, registry.policy),
      sourceId: row.sourceId,
      supportClass: row.supportClass,
      htmlSelectableStatus: row.htmlSelectableStatus,
      legacyPatternGroupIds: freezeArray(row.patternGroupIds ?? []),
    }))
    .sort((a, b) => a.legacyKnowledgePointId.localeCompare(b.legacyKnowledgePointId));

  const s43PatternMappings = registry.s43PatternMap.rows
    .filter((row) => sourceNodeIds.includes(row.sourceId))
    .map((row) => {
      const alias = s43AliasMappings.find((entry) => entry.legacyKnowledgePointId === row.knowledgePointId);
      return Object.freeze({
        legacyMappingId: row.mappingId,
        legacyKnowledgePointId: row.knowledgePointId,
        legacyPatternGroupId: row.patternGroupId,
        legacyPatternSpecId: row.patternSpecId,
        canonicalKnowledgePointIds: freezeArray(alias?.canonicalKnowledgePointIds ?? []),
        migrationType: alias?.migrationType ?? "NON_PRODUCTION_LEGACY_ROW_DEFERRED",
        compatibilityStatus: alias?.compatibilityStatus ?? "DEFERRED_NON_PRODUCTION",
        originalMappingStatus: row.mappingStatus,
        originalSupportClass: row.supportClass,
      });
    });

  const globalModelReconciliations = protectedAssignments
    .filter((row) => row.protectedPrerequisiteCapabilityContradictionIds.length > 0)
    .map((row) => Object.freeze({
      reconciliationId: `r06recon_${row.knowledgePointId.replace(/^kp_/, "")}`,
      knowledgePointId: row.knowledgePointId,
      legacyProductionProofState: "D0_ACCEPTED",
      globalModelAdditionalCapabilityIds: freezeArray(row.protectedPrerequisiteCapabilityContradictionIds),
      resolutionState: "RESOLVED_BY_LEGACY_SCOPE_FENCE",
      existingLegacyPatternsRemainProductionAllowed: true,
      newGlobalPatternAdmissionRequiresCapabilities: true,
      r07DualReadParityRequired: true,
    }));

  return Object.freeze({
    compatibilityUnitId: `r06compat_${productUnitId}`,
    productUnitId,
    legacySourceNodeIds: freezeArray(sourceNodeIds),
    legacyAuthorityPaths: freezeArray(unique(authorityEntries.map((row) => row.authorityPath)).sort()),
    canonicalKnowledgePointIds: freezeArray(canonicalKnowledgePointIds),
    legacyKnowledgePointMappings: freezeArray(legacyKnowledgePointMappings),
    legacyQuestionBindings: freezeArray(legacyQuestionBindings),
    legacyS43AliasMappings: freezeArray(s43AliasMappings),
    legacyS43PatternMappings: freezeArray(s43PatternMappings),
    globalModelReconciliations: freezeArray(globalModelReconciliations),
    compatibilityState: "SHADOW_COMPATIBILITY_READY_R07_CUTOVER_DEFERRED",
    productionParityContract: Object.freeze({
      sourceIdsPreserved: true,
      knowledgePointIdsPreserved: legacyKnowledgePointMappings.every((row) => row.canonicalTargetExists),
      patternSpecIdsPreserved: legacyQuestionBindings.every((row) => row.identityPreserved),
      currentProductionUsePreserved: true,
      visibleOutputChangeExpected: false,
    }),
  });
}

function buildMetrics(units) {
  const allExactMappings = dedupeBy(
    units.flatMap((row) => row.legacyKnowledgePointMappings),
    (row) => row.legacyKnowledgePointId,
  );
  const allCanonicalIds = unique(units.flatMap((row) => row.canonicalKnowledgePointIds));
  const allQuestionBindings = dedupeBy(
    units.flatMap((row) => row.legacyQuestionBindings),
    (row) => row.legacyQuestionId,
  );
  const allAliases = units.flatMap((row) => row.legacyS43AliasMappings);
  const allReconciliations = units.flatMap((row) => row.globalModelReconciliations);
  return Object.freeze({
    productUnitCount: units.length,
    sourceNodeCount: new Set(units.flatMap((row) => row.legacySourceNodeIds)).size,
    canonicalKnowledgePointCount: allCanonicalIds.length,
    productionAuthorityExactMappingCount: allExactMappings.length,
    legacyQuestionBindingCount: allQuestionBindings.length,
    s43LegacyAliasRowCount: allAliases.length,
    s43ResolvedAliasCount: allAliases.filter((row) => row.compatibilityStatus === "RESOLVED").length,
    s43DeferredNonProductionCount: allAliases.filter((row) => row.compatibilityStatus === "DEFERRED_NON_PRODUCTION").length,
    globalModelReconciliationCount: allReconciliations.length,
    unresolvedBlockingCount: allAliases.filter((row) => row.compatibilityStatus.startsWith("BLOCKING_")).length
      + allExactMappings.filter((row) => !row.canonicalTargetExists).length,
  });
}

export function materializeR06LegacyCompatibilityMigration() {
  const policy = readR06Json("legacy-compatibility-policy.json");
  const manifest = readR06Json("legacy-compatibility-migration.manifest.json");
  const r05 = materializeR05DeliveryWaveRebase();
  const index = readJson(policy.authorities.sourceAuthorityIndex);
  const authorityBySourceNodeId = new Map(
    (index.existingAuthoritySources ?? []).map((row) => [row.sourceNodeId, row]),
  );
  const s43KnowledgePoints = readJson(policy.authorities.legacyS43KnowledgePoints);
  const s43PatternGroups = readJson(policy.authorities.legacyS43PatternGroups);
  const s43PatternMap = readJson(policy.authorities.legacyS43KnowledgePointPatternMap);
  const baseline = r05.policy.publicBaseline;
  const registry = {
    policy,
    r05,
    baseline,
    authorityBySourceNodeId,
    s43KnowledgePoints,
    s43PatternGroups,
    s43PatternMap,
  };

  const compatibilityUnits = baseline.productUnitIds
    .map((productUnitId) => buildProductUnit(productUnitId, registry))
    .sort((a, b) => a.productUnitId.localeCompare(b.productUnitId));
  const unitById = new Map(compatibilityUnits.map((row) => [row.productUnitId, row]));
  const metrics = buildMetrics(compatibilityUnits);

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    compatibilityUnits: freezeArray(compatibilityUnits),
    metrics,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    mainlineBoundary: Object.freeze(manifest.mainlineBoundary),
    deliveryWaveAuthority: r05,
    getCompatibilityUnit(productUnitId) {
      return unitById.get(productUnitId) ?? null;
    },
  });
}

export function getR06LegacyCompatibilityUnit(productUnitId) {
  return materializeR06LegacyCompatibilityMigration().getCompatibilityUnit(productUnitId);
}

export function listR06GlobalModelReconciliations() {
  return materializeR06LegacyCompatibilityMigration().compatibilityUnits
    .flatMap((row) => row.globalModelReconciliations);
}
