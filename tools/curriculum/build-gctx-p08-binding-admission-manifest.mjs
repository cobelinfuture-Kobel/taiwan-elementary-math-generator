import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildGctxP07EligibilityAudit } from "./audit-gctx-p07-existing-patternspec-semantic-eligibility.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/contracts/GCTX_P08_ApprovedSemanticBindingBackfillAndLegacyAuthorityNormalization.json",
);
const AUTHORITY_PATH = path.join(
  ROOT,
  "data/curriculum/contracts/GCTX_S01_ExistingContextAuthorityInventoryAndMigrationMap.json",
);
const APPROVED_REGISTRY_PATH = path.join(
  ROOT,
  "data/curriculum/context/registry/approved-semantic-bindings.json",
);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const sortedUnique = (values) => [...new Set(values.filter(Boolean))].sort();

function slug(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function priorityRank(priority) {
  return { P0: 0, P1: 1, P2: 2, P3: 3 }[priority] ?? 99;
}

function selectMigrationPriority(authorities) {
  return [...authorities]
    .map((row) => row.migrationPriority)
    .filter(Boolean)
    .sort((left, right) => priorityRank(left) - priorityRank(right))[0] ?? "P3";
}

function sameMembers(left, right) {
  return JSON.stringify(sortedUnique(left)) === JSON.stringify(sortedUnique(right));
}

export function loadGctxP08Contract() {
  return readJson(CONTRACT_PATH);
}

export function loadApprovedSemanticBindingRegistry() {
  return readJson(APPROVED_REGISTRY_PATH);
}

export function buildGctxP08BindingAdmissionManifest() {
  const contract = loadGctxP08Contract();
  const authorityInventory = readJson(AUTHORITY_PATH);
  const approvedRegistry = loadApprovedSemanticBindingRegistry();
  const p07 = buildGctxP07EligibilityAudit();
  const errors = [];

  if (p07.errors.length > 0 || p07.summary.errorCount !== 0) {
    errors.push({ code: "GCTX_P08_P07_AUDIT_NOT_ACCEPTED", p07Errors: clone(p07.errors) });
  }

  const publicUnitBySource = new Map(
    authorityInventory.publicUnits.map((unit) => [unit.sourceId, unit]),
  );
  const authoritiesBySource = new Map();
  for (const authority of authorityInventory.authorityFamilies) {
    if (!authority.sourceId) continue;
    const rows = authoritiesBySource.get(authority.sourceId) ?? [];
    rows.push(authority);
    authoritiesBySource.set(authority.sourceId, rows);
  }

  const allowedDecisions = new Set([
    "eligible_existing_authority",
    "eligible_binding_backfill",
  ]);
  const eligibleEntries = p07.entries.filter((entry) => allowedDecisions.has(entry.decision));
  const candidates = [];

  for (const entry of eligibleEntries) {
    const unit = publicUnitBySource.get(entry.sourceId);
    if (!unit) {
      errors.push({
        code: "GCTX_P08_PUBLIC_UNIT_IDENTITY_MISSING",
        sourceId: entry.sourceId,
        patternSpecId: entry.patternSpecId,
      });
      continue;
    }

    const authorities = authoritiesBySource.get(entry.sourceId) ?? [];
    const admissionClass = entry.decision === "eligible_existing_authority"
      ? "legacy_authority_normalization"
      : "new_binding_backfill";

    if (entry.decision === "eligible_existing_authority" && authorities.length === 0) {
      errors.push({
        code: "GCTX_P08_LEGACY_AUTHORITY_MISSING",
        sourceId: entry.sourceId,
        patternSpecId: entry.patternSpecId,
      });
    }

    const candidateBindingId = `gctx_bind_${slug(entry.sourceId)}_${slug(entry.patternSpecId)}`;
    const candidateKey = `${entry.sourceId}::${entry.patternSpecId}`;
    const authorityIds = sortedUnique(authorities.map((row) => row.authorityId));
    const authorityPaths = sortedUnique(authorities.flatMap((row) => row.authorityPaths ?? []));
    const consumerPaths = sortedUnique(authorities.flatMap((row) => row.consumerPaths ?? []));
    const preservationRules = sortedUnique(authorities.flatMap((row) => row.preserve ?? []));

    candidates.push({
      admissionId: `gctx_admission_${slug(entry.sourceId)}_${slug(entry.patternSpecId)}`,
      candidateKey,
      candidateBindingId,
      rulesetVersion: contract.rulesetVersion,
      sourceId: entry.sourceId,
      unitCode: unit.unitCode,
      unitTitle: unit.title,
      knowledgePointIds: sortedUnique(entry.knowledgePointIds),
      patternGroupIds: sortedUnique(entry.patternGroupIds),
      patternSpecId: entry.patternSpecId,
      p07Decision: entry.decision,
      semanticSignals: sortedUnique(entry.semanticSignals),
      admissionClass,
      legacyNormalization: {
        authorityIds,
        authorityPaths,
        consumerPaths,
        migrationPriority: selectMigrationPriority(authorities),
        migrationTargets: sortedUnique(authorities.map((row) => row.migrationTarget)),
        preservationRules,
        legacyReplayKeys: sortedUnique([entry.patternSpecId, ...authorityIds]),
      },
      bindingReadiness: {
        lifecycleStatus: "candidate",
        approvalState: "candidate",
        exactP01BindingMaterialized: false,
        p01SchemaValid: false,
        productionSelectable: false,
        runtimeResolvable: false,
        requiredExactMaterializationFields: [...contract.p01FieldsRequiringExactMaterialization],
      },
      recommendedNextAction: admissionClass === "legacy_authority_normalization"
        ? "extract_exact_p01_binding_from_legacy_authority"
        : "author_source_backed_exact_p01_binding",
    });
  }

  candidates.sort((left, right) => (
    left.sourceId.localeCompare(right.sourceId)
    || left.patternSpecId.localeCompare(right.patternSpecId)
  ));

  const candidateKeys = candidates.map((row) => row.candidateKey);
  const candidateBindingIds = candidates.map((row) => row.candidateBindingId);
  if (new Set(candidateKeys).size !== candidateKeys.length) {
    errors.push({ code: "GCTX_P08_DUPLICATE_SOURCE_PATTERNSPEC_KEY" });
  }
  if (new Set(candidateBindingIds).size !== candidateBindingIds.length) {
    errors.push({ code: "GCTX_P08_DUPLICATE_CANDIDATE_BINDING_ID" });
  }

  const p07EligibleKeys = sortedUnique(eligibleEntries.map((row) => `${row.sourceId}::${row.patternSpecId}`));
  if (!sameMembers(candidateKeys, p07EligibleKeys)) {
    errors.push({ code: "GCTX_P08_P07_ELIGIBLE_COVERAGE_MISMATCH" });
  }

  const bySource = {};
  for (const candidate of candidates) {
    const current = bySource[candidate.sourceId] ?? {
      sourceId: candidate.sourceId,
      unitCode: candidate.unitCode,
      candidateCount: 0,
      legacyAuthorityNormalizationCount: 0,
      newBindingBackfillCount: 0,
      authorityIds: [],
    };
    current.candidateCount += 1;
    if (candidate.admissionClass === "legacy_authority_normalization") {
      current.legacyAuthorityNormalizationCount += 1;
    } else {
      current.newBindingBackfillCount += 1;
    }
    current.authorityIds = sortedUnique([
      ...current.authorityIds,
      ...candidate.legacyNormalization.authorityIds,
    ]);
    bySource[candidate.sourceId] = current;
  }

  for (const [sourceId, expected] of Object.entries(contract.expectedCandidatesBySource)) {
    const actual = bySource[sourceId];
    if (!actual || actual.candidateCount !== expected.candidateCount) {
      errors.push({
        code: "GCTX_P08_SOURCE_CANDIDATE_COUNT_MISMATCH",
        sourceId,
        expected: expected.candidateCount,
        actual: actual?.candidateCount ?? 0,
      });
      continue;
    }
    const classCount = expected.admissionClass === "legacy_authority_normalization"
      ? actual.legacyAuthorityNormalizationCount
      : actual.newBindingBackfillCount;
    if (classCount !== expected.candidateCount) {
      errors.push({
        code: "GCTX_P08_SOURCE_ADMISSION_CLASS_MISMATCH",
        sourceId,
        admissionClass: expected.admissionClass,
        expected: expected.candidateCount,
        actual: classCount,
      });
    }
  }

  const actualSourceIds = sortedUnique(candidates.map((row) => row.sourceId));
  const expectedSourceIds = sortedUnique(Object.keys(contract.expectedCandidatesBySource));
  if (!sameMembers(actualSourceIds, expectedSourceIds)) {
    errors.push({ code: "GCTX_P08_CANDIDATE_SOURCE_SET_MISMATCH" });
  }

  for (const [sourceId, expectedAuthorityIds] of Object.entries(contract.expectedLegacyAuthoritiesBySource)) {
    const actualAuthorityIds = bySource[sourceId]?.authorityIds ?? [];
    if (!sameMembers(actualAuthorityIds, expectedAuthorityIds)) {
      errors.push({
        code: "GCTX_P08_LEGACY_AUTHORITY_SET_MISMATCH",
        sourceId,
        expectedAuthorityIds: sortedUnique(expectedAuthorityIds),
        actualAuthorityIds: sortedUnique(actualAuthorityIds),
      });
    }
  }

  if (!Array.isArray(approvedRegistry.entries) || approvedRegistry.entries.length !== 0) {
    errors.push({
      code: "GCTX_P08_APPROVED_REGISTRY_MUST_REMAIN_EMPTY",
      actualEntryCount: Array.isArray(approvedRegistry.entries) ? approvedRegistry.entries.length : null,
    });
  }

  for (const candidate of candidates) {
    if (
      candidate.bindingReadiness.lifecycleStatus !== "candidate"
      || candidate.bindingReadiness.approvalState !== "candidate"
      || candidate.bindingReadiness.exactP01BindingMaterialized !== false
      || candidate.bindingReadiness.p01SchemaValid !== false
      || candidate.bindingReadiness.productionSelectable !== false
      || candidate.bindingReadiness.runtimeResolvable !== false
    ) {
      errors.push({
        code: "GCTX_P08_FALSE_APPROVAL_OR_RUNTIME_CLAIM",
        candidateKey: candidate.candidateKey,
      });
    }
  }

  const legacyAuthorityNormalizationCount = candidates.filter(
    (row) => row.admissionClass === "legacy_authority_normalization",
  ).length;
  const newBindingBackfillCount = candidates.filter(
    (row) => row.admissionClass === "new_binding_backfill",
  ).length;
  const summary = {
    candidateCount: candidates.length,
    legacyAuthorityNormalizationCount,
    newBindingBackfillCount,
    sourceCount: actualSourceIds.length,
    approvedRegistryEntryCount: approvedRegistry.entries.length,
    excludedNotApplicablePatternSpecCount: p07.summary.decisionCounts.not_applicable_non_semantic ?? 0,
    errorCount: errors.length,
    readyForP09ExactExtraction: errors.length === 0,
  };

  for (const [field, expected] of Object.entries(contract.acceptedSnapshot)) {
    if (field === "errorCount") continue;
    if (summary[field] !== expected) {
      errors.push({
        code: "GCTX_P08_ACCEPTED_SNAPSHOT_MISMATCH",
        field,
        expected,
        actual: summary[field],
      });
    }
  }
  summary.errorCount = errors.length;
  summary.readyForP09ExactExtraction = errors.length === 0;

  return clone({
    schemaName: "GCTXBindingAdmissionAndLegacyAuthorityNormalizationManifest",
    schemaVersion: 1,
    task: contract.task,
    status: errors.length === 0 ? "accepted_for_p09_exact_extraction" : "blocked",
    rulesetVersion: contract.rulesetVersion,
    inputs: clone(contract.inputs),
    summary,
    bySource,
    candidates,
    approvedRegistry: {
      path: contract.outputs.approvedBindingRegistry,
      registryId: approvedRegistry.registryId,
      entryCount: approvedRegistry.entries.length,
      productionSelectionAllowed: false,
    },
    errors,
    scopeBoundary: {
      runtimeBehaviorChanged: false,
      approvedProductionBindingCreated: false,
      unitAuthorityDeletedOrRewritten: false,
      unitMigrationPerformed: false,
      rendererChanged: false,
      publicControlsChanged: false,
    },
    nextShortestStep: contract.nextTask,
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.stdout.write(`${JSON.stringify(buildGctxP08BindingAdmissionManifest(), null, 2)}\n`);
}
