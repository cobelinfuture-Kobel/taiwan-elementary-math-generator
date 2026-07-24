import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  getR02SourceCandidateView,
  materializeR02GlobalKnowledgePointRegistry,
} from "../../src/curriculum/global/r02-global-kp-candidate-reconciliation.mjs";
import {
  validateKnowledgePointCandidate,
} from "./validate-global-knowledge-point-decomposition-contract.mjs";

const ROOT = process.cwd();
const SOURCE_REGISTRY_PATH = "data/curriculum/application/controller/postg-app-79-unit-registry.json";
const REVIEWED_PACK_PATH = "data/curriculum/global/candidates/r02/reviewed-source-candidate-pack.manifest.json";
const INDEX_PATH = "data/curriculum/global/candidates/r02/source-authority-reconciliation-index.json";
const CONSUMER_PATH = "site/assets/browser/pipeline/build-worksheet-document.js";

function loadReviewedPack(root) {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, REVIEWED_PACK_PATH), "utf8"));
  const chunkPaths = manifest.chunkPaths ?? manifest.shardPaths ?? [];
  const sourceRecords = chunkPaths.flatMap((repoPath) => {
    const chunk = JSON.parse(fs.readFileSync(path.join(root, repoPath), "utf8"));
    return chunk.sourceRecords ?? [];
  });
  return { ...manifest, sourceRecords };
}
const issue = (code, pathValue, message, details = {}) => ({ code, path: pathValue, message, ...details });
const unique = (values) => new Set(values).size === values.length;

function sourceRefIds(candidate) {
  return new Set((candidate?.sourceRefs ?? []).map((row) => row.sourceNodeId));
}

function findKnowledgePoint(registry, id) {
  return registry.knowledgePoints.find((row) => row.knowledgePointId === id) ?? null;
}

export function validateR02GlobalKnowledgePointCandidateReconciliation({ root = ROOT } = {}) {
  const registry = materializeR02GlobalKnowledgePointRegistry({ root });
  const sourceRegistry = JSON.parse(fs.readFileSync(path.join(root, SOURCE_REGISTRY_PATH), "utf8"));
  const reviewedPack = loadReviewedPack(root);
  const index = JSON.parse(fs.readFileSync(path.join(root, INDEX_PATH), "utf8"));
  const issues = [];

  const expectedSourceIds = (sourceRegistry.batches ?? []).flatMap((batch) => batch.sourceNodeIds ?? []);
  const actualSourceIds = registry.sourceViews.map((row) => row.sourceNodeId);
  if (expectedSourceIds.length !== 79 || !unique(expectedSourceIds)) {
    issues.push(issue("R02_SOURCE_REGISTRY_INVALID", SOURCE_REGISTRY_PATH, "The authoritative source registry must contain exactly 79 unique source nodes."));
  }
  if (registry.sourceViews.length !== 79
    || !unique(actualSourceIds)
    || expectedSourceIds.some((sourceId) => !actualSourceIds.includes(sourceId))) {
    issues.push(issue("R02_SOURCE_VIEW_COVERAGE_INVALID", "sourceViews", "Every one of the 79 source nodes must have exactly one reconciled source view."));
  }

  if (index.sourceScope.existingProductionAuthoritySourceCount !== 16
    || index.sourceScope.existingW02CandidateAuthoritySourceCount !== 13
    || index.sourceScope.fullPageReviewedMissingSourceCount !== 50
    || reviewedPack.sourceRecords.length !== 50
    || reviewedPack.sourcePolicy.sourcePdfCount !== 50
    || reviewedPack.sourcePolicy.renderedPageCount !== 99
    || reviewedPack.counts.candidateProjectionCount !== 247
    || reviewedPack.counts.uniqueKnowledgePointIdCount !== 242
    || reviewedPack.counts.semanticDuplicateProjectionCount !== 5) {
    issues.push(issue("R02_EVIDENCE_CLASS_COUNTS_INVALID", "counts", "The 16 + 13 + 50 evidence partition or reviewed-source counts do not match the frozen R02 inventory."));
  }

  if (registry.conflicts.length !== 0 || registry.counts.semanticIdentityConflictCount !== 0) {
    issues.push(issue("R02_SEMANTIC_IDENTITY_CONFLICT", "conflicts", "Canonical KnowledgePoint identities contain conflicting semantic contracts.", { conflicts: registry.conflicts }));
  }

  for (const [indexValue, candidate] of registry.knowledgePoints.entries()) {
    const validation = validateKnowledgePointCandidate(candidate);
    if (!validation.ok) {
      issues.push(issue(
        "R02_GLOBAL_KP_CANDIDATE_INVALID",
        `knowledgePoints[${indexValue}]`,
        `Candidate ${candidate.knowledgePointId} violates the R01 contract.`,
        { candidateErrors: validation.errors },
      ));
    }
    if (candidate.prerequisiteDeclaration?.mode !== "DEFERRED_TO_R03"
      || candidate.prerequisiteDeclaration?.directPrerequisiteKnowledgePointIds?.length !== 0
      || candidate.runtimeCapabilityDeclaration?.mode !== "DEFERRED_TO_R04"
      || candidate.runtimeCapabilityDeclaration?.requiredRuntimeCapabilityIds?.length !== 0
      || candidate.mainlineBinding?.productionCutoverAllowed !== false) {
      issues.push(issue("R02_PREMATURE_GRAPH_RUNTIME_OR_CUTOVER", `knowledgePoints.${candidate.knowledgePointId}`, "R02 must remain candidate-only and fail closed for R03, R04 and R07 work."));
    }
  }

  const preserved = findKnowledgePoint(registry, "kp_g3a_u01_4digit_compare");
  if (!preserved || preserved.candidateStatus !== "RECONCILED_EXISTING_KP"
    || !sourceRefIds(preserved).has("g3a_u01_3a01")) {
    issues.push(issue("R02_EXISTING_PRODUCTION_KP_NOT_PRESERVED", "kp_g3a_u01_4digit_compare", "Existing D0 KnowledgePoint identity and source lineage must be preserved."));
  }

  const duplicateCanonicalIds = [
    "kp_fraction_true_improper_mixed_classification",
    "kp_fraction_improper_mixed_integer_conversion",
    "kp_fraction_improper_mixed_compare_order",
    "kp_fraction_improper_mixed_number_line",
    "kp_fraction_same_denominator_mixed_add_sub",
    "kp_fraction_times_integer_quantity",
  ];
  for (const id of duplicateCanonicalIds) {
    const row = findKnowledgePoint(registry, id);
    const refs = sourceRefIds(row);
    if (!row || refs.size !== 2 || !refs.has("g4a_u06_4a06") || !refs.has("g4b_u03_4b03")) {
      issues.push(issue("R02_BYTE_IDENTICAL_SOURCE_RECONCILIATION_INVALID", id, "Byte-identical g4a_u06 and g4b_u03 evidence must project to one canonical KnowledgePoint identity with two source references."));
    }
  }

  const sharedSpeedIds = index.semanticIdentityRules.sharedReviewedKnowledgePointIds.knowledgePointIds;
  for (const id of sharedSpeedIds) {
    const row = findKnowledgePoint(registry, id);
    const refs = sourceRefIds(row);
    if (!row || refs.size !== 2 || !refs.has("g6a_u08_6a08") || !refs.has("g6b_u02_6b02")) {
      issues.push(issue("R02_SPEED_SEMANTIC_IDENTITY_INVALID", id, "The duplicated speed source projections must merge into one semantic identity with both source references."));
    }
  }

  const massView = getR02SourceCandidateView("g3b_u06_3b06", { root });
  const massIds = new Set(massView?.knowledgePointIds ?? []);
  if (!massView || massIds.size !== 6 || !massIds.has("kp_mass_kg_g_conversion")) {
    issues.push(issue("R02_G3B_U06_DECOMPOSITION_INVALID", "g3b_u06_3b06", "The kilograms/grams source must decompose into six reviewed KnowledgePoints including kg-g conversion."));
  }

  if (registry.counts.globalKnowledgePointCount <= reviewedPack.counts.uniqueKnowledgePointIdCount
    || registry.counts.reconciledExistingKnowledgePointCount === 0
    || registry.counts.candidateOnlyKnowledgePointCount === 0) {
    issues.push(issue("R02_GLOBAL_REGISTRY_COUNTS_INVALID", "counts", "The global registry must include reviewed candidates plus reconciled existing authorities."));
  }

  const consumerText = fs.readFileSync(path.join(root, CONSUMER_PATH), "utf8");
  if (consumerText.includes("r02-global-kp-candidate-reconciliation")
    || consumerText.includes("data/curriculum/global/candidates/r02")) {
    issues.push(issue("R02_PRODUCTION_CONSUMER_CUTOVER_FORBIDDEN", CONSUMER_PATH, "R02 shadow candidate authority must not be imported by the production worksheet consumer."));
  }
  if (registry.mainlineBoundary.productionCutoverAllowed !== false
    || registry.mainlineBoundary.parallelAuthorityAllowed !== false
    || registry.mainlineBoundary.parallelRuntimePipelineAllowed !== false
    || registry.mainlineBoundary.prerequisiteEdgesMaterialized !== false
    || registry.mainlineBoundary.runtimeCapabilityMappingsMaterialized !== false) {
    issues.push(issue("R02_MAINLINE_BOUNDARY_INVALID", "mainlineBoundary", "R02 mainline boundaries must remain fail closed."));
  }

  return Object.freeze({
    ok: issues.length === 0,
    issues: Object.freeze(issues),
    status: issues.length === 0
      ? "PASS_R02_ALL_79_SOURCE_NODES_GLOBAL_KP_CANDIDATE_RECONCILED"
      : "FAIL_R02_GLOBAL_KP_CANDIDATE_RECONCILIATION",
    counts: registry.counts,
    mainlineIntegrationStatus: "SHADOW_CANDIDATE_AUTHORITY_READY_NOT_CUT_OVER",
    nextShortestStep: "R03_GlobalPrerequisiteGraph",
  });
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = validateR02GlobalKnowledgePointCandidateReconciliation();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
