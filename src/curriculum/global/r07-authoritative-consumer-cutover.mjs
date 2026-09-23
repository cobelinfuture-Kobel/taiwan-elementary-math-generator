import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeR06LegacyCompatibilityMigration } from "./r06-legacy-compatibility-migration.mjs";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const R07_DIR = path.join(ROOT, "data/curriculum/global/cutover/r07");

function readR07Json(fileName) {
  return JSON.parse(fs.readFileSync(path.join(R07_DIR, fileName), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function buildAuthorityUnit(compatibilityUnit) {
  const knowledgePointIds = [...compatibilityUnit.canonicalKnowledgePointIds];
  const legacyQuestionBindingIds = compatibilityUnit.legacyQuestionBindings
    .map((row) => row.legacyQuestionId);
  const reconciliationIds = compatibilityUnit.globalModelReconciliations
    .map((row) => row.reconciliationId);
  const exactKnowledgePointParity = compatibilityUnit.legacyKnowledgePointMappings.every((row) => (
    row.legacyKnowledgePointId === row.canonicalKnowledgePointId
    && row.canonicalTargetExists === true
  ));
  const questionIdentityParity = compatibilityUnit.legacyQuestionBindings.every((row) => row.identityPreserved === true);

  return Object.freeze({
    authorityUnitId: `r07authority_${compatibilityUnit.productUnitId}`,
    productUnitId: compatibilityUnit.productUnitId,
    legacySourceNodeIds: freezeArray(compatibilityUnit.legacySourceNodeIds),
    globalKnowledgePointIds: freezeArray(knowledgePointIds),
    legacyQuestionBindingIds: freezeArray(legacyQuestionBindingIds),
    globalModelReconciliationIds: freezeArray(reconciliationIds),
    authorityMode: "GLOBAL_PRIMARY",
    legacyAuthorityRole: "COMPATIBILITY_ALIAS_READ_ONLY",
    cutoverState: "PRODUCTION_AUTHORITY_CUTOVER_ADMITTED",
    identityParity: Object.freeze({
      sourceIdsPreserved: compatibilityUnit.productionParityContract.sourceIdsPreserved === true,
      knowledgePointIdsPreserved: exactKnowledgePointParity,
      patternSpecAndQuestionIdsPreserved: questionIdentityParity,
      currentProductionUsePreserved: compatibilityUnit.productionParityContract.currentProductionUsePreserved === true,
      visibleOutputChangeExpected: false,
    }),
    compatibilityScopeFence: Object.freeze({
      existingLegacyPatternsRemainProductionAllowed: compatibilityUnit.globalModelReconciliations.every((row) => (
        row.existingLegacyPatternsRemainProductionAllowed === true
      )),
      newGlobalPatternsRequireCompleteCapabilities: compatibilityUnit.globalModelReconciliations.every((row) => (
        row.newGlobalPatternAdmissionRequiresCapabilities === true
      )),
    }),
  });
}

function buildMetrics(authorityUnits) {
  const sourceNodeIds = unique(authorityUnits.flatMap((row) => row.legacySourceNodeIds));
  const knowledgePointIds = unique(authorityUnits.flatMap((row) => row.globalKnowledgePointIds));
  const questionBindingIds = unique(authorityUnits.flatMap((row) => row.legacyQuestionBindingIds));
  const reconciliationIds = unique(authorityUnits.flatMap((row) => row.globalModelReconciliationIds));
  return Object.freeze({
    productUnitCount: authorityUnits.length,
    sourceNodeCount: sourceNodeIds.length,
    globalKnowledgePointCount: knowledgePointIds.length,
    legacyQuestionBindingCount: questionBindingIds.length,
    globalModelReconciliationCount: reconciliationIds.length,
    globalPrimaryUnitCount: authorityUnits.filter((row) => row.authorityMode === "GLOBAL_PRIMARY").length,
    identityParityFailureCount: authorityUnits.filter((row) => (
      !row.identityParity.sourceIdsPreserved
      || !row.identityParity.knowledgePointIdsPreserved
      || !row.identityParity.patternSpecAndQuestionIdsPreserved
      || !row.identityParity.currentProductionUsePreserved
    )).length,
  });
}

export function materializeR07AuthoritativeConsumerCutover() {
  const manifest = readR07Json("authoritative-consumer-cutover.manifest.json");
  const policy = readR07Json("authoritative-consumer-cutover-policy.json");
  const r06 = materializeR06LegacyCompatibilityMigration();
  const authorityUnits = r06.compatibilityUnits
    .map(buildAuthorityUnit)
    .sort((a, b) => a.productUnitId.localeCompare(b.productUnitId));
  const authorityByProductUnitId = new Map(authorityUnits.map((row) => [row.productUnitId, row]));
  const metrics = buildMetrics(authorityUnits);

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    authorityUnits: freezeArray(authorityUnits),
    metrics,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    mainlineBoundary: Object.freeze(manifest.mainlineBoundary),
    legacyCompatibilityAuthority: r06,
    getAuthorityUnit(productUnitId) {
      return authorityByProductUnitId.get(productUnitId) ?? null;
    },
  });
}

export function getR07AuthorityUnit(productUnitId) {
  return materializeR07AuthoritativeConsumerCutover().getAuthorityUnit(productUnitId);
}

export function listR07AuthorityUnits() {
  return materializeR07AuthoritativeConsumerCutover().authorityUnits;
}
