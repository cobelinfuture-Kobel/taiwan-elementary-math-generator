import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const CONTRACT_PATH = path.join(ROOT, "data/curriculum/global/contracts/R01_GlobalKnowledgePointDecompositionContract.json");
const SCHEMA_PATH = path.join(ROOT, "data/curriculum/global/schema/global-knowledge-point-candidate.schema.json");
const SOURCE_REGISTRY_PATH = path.join(ROOT, "data/curriculum/application/controller/postg-app-79-unit-registry.json");
const PRODUCT_CONTRACT_PATH = path.join(ROOT, "data/curriculum/public/15-unit-public-worksheet-closeout.json");

const EXPECTED_BASELINE_SHA = "9846627e1263d9dfb3e9e2318989cc5ae94c35dd";
const EXPECTED_CONSUMER = "site/assets/browser/pipeline/build-worksheet-document.js";
const EXPECTED_REQUIRED_FIELDS = Object.freeze([
  "knowledgePointId",
  "canonicalNameZh",
  "capabilityStatement",
  "indispensableConcepts",
  "reasoningInvariant",
  "misconceptionFamilies",
  "validatorCapability",
  "allowedVariationAxes",
  "sourceRefs",
  "legacyBatchRefs",
  "candidateStatus",
  "prerequisiteDeclaration",
  "runtimeCapabilityDeclaration",
  "mainlineBinding",
]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function issue(code, pathValue, message) {
  return { code, path: pathValue, message };
}

function sameSet(left, right) {
  return left.length === right.length && [...left].sort().every((value, index) => value === [...right].sort()[index]);
}

function isNonEmptyString(value, minLength = 1) {
  return typeof value === "string" && value.trim().length >= minLength;
}

function isUniqueNonEmptyStringArray(value, minItems = 1) {
  return Array.isArray(value)
    && value.length >= minItems
    && value.every((item) => isNonEmptyString(item))
    && new Set(value).size === value.length;
}

export function validateKnowledgePointCandidate(candidate = {}) {
  const errors = [];
  for (const field of EXPECTED_REQUIRED_FIELDS) {
    if (!(field in candidate)) errors.push(issue("GKP_CANDIDATE_REQUIRED_FIELD_MISSING", field, `Missing required field ${field}.`));
  }

  if (!/^kp_[a-z0-9_]+$/.test(String(candidate.knowledgePointId ?? ""))) {
    errors.push(issue("GKP_CANDIDATE_ID_INVALID", "knowledgePointId", "KnowledgePoint ID must use the canonical kp_ snake-case form."));
  }
  if (!isNonEmptyString(candidate.canonicalNameZh, 2)) errors.push(issue("GKP_CANDIDATE_NAME_INVALID", "canonicalNameZh", "Canonical name is required."));
  if (!isNonEmptyString(candidate.capabilityStatement, 8)) errors.push(issue("GKP_CAPABILITY_STATEMENT_INVALID", "capabilityStatement", "Capability statement must describe a teachable learner capability."));
  if (candidate.capabilityStatement === candidate.canonicalNameZh) errors.push(issue("GKP_TITLE_ONLY_CAPABILITY_FORBIDDEN", "capabilityStatement", "A source or display title cannot substitute for a capability statement."));
  if (!isUniqueNonEmptyStringArray(candidate.indispensableConcepts)) errors.push(issue("GKP_INDISPENSABLE_CONCEPTS_INVALID", "indispensableConcepts", "At least one indispensable concept is required."));
  if (!isNonEmptyString(candidate.reasoningInvariant, 8)) errors.push(issue("GKP_REASONING_INVARIANT_INVALID", "reasoningInvariant", "Reasoning invariant is required."));
  if (!isUniqueNonEmptyStringArray(candidate.misconceptionFamilies)) errors.push(issue("GKP_MISCONCEPTION_FAMILY_INVALID", "misconceptionFamilies", "At least one diagnosable misconception family is required."));

  const validator = candidate.validatorCapability;
  if (!validator || typeof validator !== "object" || Array.isArray(validator)) {
    errors.push(issue("GKP_VALIDATOR_CAPABILITY_INVALID", "validatorCapability", "Validator capability object is required."));
  } else {
    if (!/^valcap_[a-z0-9_]+$/.test(String(validator.validatorCapabilityId ?? ""))) {
      errors.push(issue("GKP_VALIDATOR_CAPABILITY_ID_INVALID", "validatorCapability.validatorCapabilityId", "Validator capability ID is invalid."));
    }
    if (!isUniqueNonEmptyStringArray(validator.acceptanceCriteria)) errors.push(issue("GKP_VALIDATOR_ACCEPTANCE_INVALID", "validatorCapability.acceptanceCriteria", "Acceptance criteria are required."));
    if (!isUniqueNonEmptyStringArray(validator.rejectionCodes) || validator.rejectionCodes.some((code) => !/^[A-Z][A-Z0-9_]+$/.test(code))) {
      errors.push(issue("GKP_VALIDATOR_REJECTION_CODES_INVALID", "validatorCapability.rejectionCodes", "At least one canonical rejection code is required."));
    }
  }

  if (!Array.isArray(candidate.allowedVariationAxes) || new Set(candidate.allowedVariationAxes).size !== candidate.allowedVariationAxes.length) {
    errors.push(issue("GKP_VARIATION_AXES_INVALID", "allowedVariationAxes", "Variation axes must be a unique array."));
  }
  if (!Array.isArray(candidate.sourceRefs) || candidate.sourceRefs.length === 0) {
    errors.push(issue("GKP_SOURCE_EVIDENCE_REQUIRED", "sourceRefs", "At least one source evidence reference is required."));
  } else {
    for (const [index, ref] of candidate.sourceRefs.entries()) {
      if (!/^g[3-6][ab]_u[0-9]{2}_[a-z0-9]+$/.test(String(ref?.sourceNodeId ?? ""))) {
        errors.push(issue("GKP_SOURCE_NODE_ID_INVALID", `sourceRefs[${index}].sourceNodeId`, "Source node ID is invalid."));
      }
      if (!isUniqueNonEmptyStringArray(ref?.evidenceRefs)) errors.push(issue("GKP_SOURCE_EVIDENCE_REF_INVALID", `sourceRefs[${index}].evidenceRefs`, "Source evidence references are required."));
    }
  }
  if (!isUniqueNonEmptyStringArray(candidate.legacyBatchRefs) || candidate.legacyBatchRefs.some((batch) => !["A", "B", "C", "D", "E"].includes(batch))) {
    errors.push(issue("GKP_LEGACY_BATCH_REFS_INVALID", "legacyBatchRefs", "Legacy batch references must be provenance values A-E."));
  }
  if (!["CANDIDATE_ONLY", "BOUNDARY_REVIEW_REQUIRED", "RECONCILED_EXISTING_KP", "REJECTED_DUPLICATE", "REJECTED_AMBIGUOUS_CAPABILITY"].includes(candidate.candidateStatus)) {
    errors.push(issue("GKP_CANDIDATE_STATUS_INVALID", "candidateStatus", "Candidate status is invalid."));
  }

  if (candidate.prerequisiteDeclaration?.mode !== "DEFERRED_TO_R03" || candidate.prerequisiteDeclaration?.directPrerequisiteKnowledgePointIds?.length !== 0) {
    errors.push(issue("GKP_R01_PREREQUISITE_SCOPE_VIOLATION", "prerequisiteDeclaration", "R01/R02 candidates must defer prerequisite edges to R03."));
  }
  if (candidate.runtimeCapabilityDeclaration?.mode !== "DEFERRED_TO_R04" || candidate.runtimeCapabilityDeclaration?.requiredRuntimeCapabilityIds?.length !== 0) {
    errors.push(issue("GKP_R01_RUNTIME_SCOPE_VIOLATION", "runtimeCapabilityDeclaration", "R01/R02 candidates must defer runtime capability mapping to R04."));
  }
  if (candidate.mainlineBinding?.productBaselineMergeSha !== EXPECTED_BASELINE_SHA
    || candidate.mainlineBinding?.existingConsumerEntryPoint !== EXPECTED_CONSUMER
    || candidate.mainlineBinding?.productionCutoverAllowed !== false) {
    errors.push(issue("GKP_MAINLINE_BINDING_INVALID", "mainlineBinding", "Candidate must remain bound to the PR #350 D0 baseline and cannot cut over production."));
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors) });
}

export function validateGlobalKnowledgePointDecompositionContract() {
  const contract = readJson(CONTRACT_PATH);
  const schema = readJson(SCHEMA_PATH);
  const sourceRegistry = readJson(SOURCE_REGISTRY_PATH);
  const productContract = readJson(PRODUCT_CONTRACT_PATH);
  const errors = [];

  if (contract.programId !== "GLOBAL_CURRICULUM_KNOWLEDGE_GRAPH_AND_DELIVERY_WAVE_REBASE_V1") {
    errors.push(issue("GKP_PROGRAM_ID_INVALID", "programId", "Global curriculum rebase program ID mismatch."));
  }
  if (contract.taskId !== "R01_GlobalKnowledgePointDecompositionContract_From_PR350MergeSHA") {
    errors.push(issue("GKP_TASK_ID_INVALID", "taskId", "R01 task ID mismatch."));
  }
  if (contract.productBaseline?.mergeCommitSha !== EXPECTED_BASELINE_SHA) {
    errors.push(issue("GKP_PRODUCT_BASELINE_SHA_MISMATCH", "productBaseline.mergeCommitSha", "Contract must bind to the PR #350 merge SHA."));
  }
  if (contract.productBaseline?.existingConsumerEntryPoint !== EXPECTED_CONSUMER) {
    errors.push(issue("GKP_EXISTING_CONSUMER_MISMATCH", "productBaseline.existingConsumerEntryPoint", "Existing worksheet consumer must remain authoritative."));
  }
  if (productContract.units?.length !== 15
    || productContract.units.filter((row) => row.batch === "A").length !== 13
    || productContract.units.filter((row) => row.batch === "B").length !== 2
    || productContract.closeCondition?.goalDistance !== "D0"
    || productContract.closeCondition?.productionUse !== "allowed") {
    errors.push(issue("GKP_PRODUCT_BASELINE_NOT_D0", "productBaseline", "The 15-unit D0 product baseline is not intact."));
  }

  const sourceCount = sourceRegistry.batches?.reduce((sum, batch) => sum + (batch.sourceNodeIds?.length ?? 0), 0) ?? 0;
  const batchCounts = Object.fromEntries((sourceRegistry.batches ?? []).map((batch) => [batch.batchId, batch.sourceNodeIds?.length ?? 0]));
  if (sourceCount !== 79 || sourceRegistry.coverage?.sourceNodeCount !== 79) errors.push(issue("GKP_SOURCE_SCOPE_COUNT_MISMATCH", "sourceScope.sourceNodeCount", "Source scope must contain exactly 79 source nodes."));
  for (const [batchId, expected] of Object.entries({ A: 13, B: 24, C: 17, D: 16, E: 9 })) {
    if (batchCounts[batchId] !== expected || contract.sourceScope?.legacyBatchCounts?.[batchId] !== expected) {
      errors.push(issue("GKP_LEGACY_BATCH_COUNT_MISMATCH", `sourceScope.legacyBatchCounts.${batchId}`, `Legacy batch ${batchId} count mismatch.`));
    }
  }
  if (sourceRegistry.coverage?.goldenBaselineUnitCount !== 15
    || sourceRegistry.coverage?.goldenBaselineSourceNodeCount !== 16
    || sourceRegistry.coverage?.remainingSourceNodeCount !== 63) {
    errors.push(issue("GKP_SOURCE_COVERAGE_MISMATCH", "sourceScope", "79-node and 15-unit baseline coverage mismatch."));
  }

  if (contract.authorityPolicy?.legacyPrimaryBatchAssignmentRole !== "DELIVERY_PROVENANCE_ONLY"
    || contract.authorityPolicy?.legacyPrimaryBatchAssignmentDefinesKnowledgeBoundary !== false
    || contract.authorityPolicy?.sourceUnitMayDecomposeToMultipleKnowledgePoints !== true
    || contract.authorityPolicy?.knowledgePointMayReferenceMultipleSourceUnits !== true) {
    errors.push(issue("GKP_AUTHORITY_POLICY_INVALID", "authorityPolicy", "Batch boundaries must not define KnowledgePoint boundaries."));
  }
  if (contract.authorityPolicy?.canonicalAuthorityCutoverAllowedInR01 !== false
    || contract.authorityPolicy?.productionConsumerChangeAllowedInR01 !== false
    || contract.authorityPolicy?.secondProductionResolverAllowed !== false) {
    errors.push(issue("GKP_R01_SCOPE_LEAK", "authorityPolicy", "R01 must not change production authority or add a second resolver."));
  }
  if (contract.mainlineIntegration?.runtimeConsumer !== EXPECTED_CONSUMER
    || contract.mainlineIntegration?.consumerCutoverAllowedBeforeR07 !== false
    || contract.mainlineIntegration?.parallelCurriculumAuthorityAllowed !== false
    || contract.mainlineIntegration?.parallelGeneratorValidatorWorksheetPipelineAllowed !== false) {
    errors.push(issue("GKP_MAINLINE_INTEGRATION_INVALID", "mainlineIntegration", "Mainline integration contract is incomplete."));
  }

  const contractRequired = contract.knowledgePointBoundary?.requiredCandidateFields ?? [];
  const schemaRequired = schema.required ?? [];
  if (!sameSet(contractRequired, EXPECTED_REQUIRED_FIELDS) || !sameSet(schemaRequired, EXPECTED_REQUIRED_FIELDS)) {
    errors.push(issue("GKP_REQUIRED_FIELD_PARITY_MISMATCH", "knowledgePointBoundary.requiredCandidateFields", "Contract and schema required fields must match."));
  }
  if (schema.additionalProperties !== false
    || schema.properties?.prerequisiteDeclaration?.properties?.mode?.const !== "DEFERRED_TO_R03"
    || schema.properties?.runtimeCapabilityDeclaration?.properties?.mode?.const !== "DEFERRED_TO_R04"
    || schema.properties?.mainlineBinding?.properties?.productionCutoverAllowed?.const !== false) {
    errors.push(issue("GKP_SCHEMA_FAIL_CLOSED_INVALID", "schema", "Candidate schema must fail closed for deferred graph/runtime work and production cutover."));
  }
  if (contract.r01Acceptance?.all79CandidatesMaterialized !== false
    || contract.r01Acceptance?.productionConsumerChanged !== false
    || contract.r01Acceptance?.visibleOutputChanged !== false
    || contract.r01Acceptance?.nextTask !== "R02_G3toG6_79SourceNodeKnowledgePointCandidateReconciliation") {
    errors.push(issue("GKP_R01_ACCEPTANCE_INVALID", "r01Acceptance", "R01 acceptance boundary or next task is invalid."));
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    metrics: Object.freeze({
      sourceNodeCount: sourceCount,
      completedPublicUnitCount: productContract.units.length,
      completedBatchAUnitCount: productContract.units.filter((row) => row.batch === "A").length,
      completedBatchBUnitCount: productContract.units.filter((row) => row.batch === "B").length,
      requiredCandidateFieldCount: EXPECTED_REQUIRED_FIELDS.length,
      productionCutoverAllowed: false,
      existingConsumerEntryPoint: EXPECTED_CONSUMER,
    }),
  });
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const result = validateGlobalKnowledgePointDecompositionContract();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 1;
}
