import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { buildGctxP10RemainingExactBindings } from "./build-gctx-p10-g3b-u04-remaining-exact-bindings.mjs";
import { loadApprovedSemanticBindingRegistry } from "./build-gctx-p08-binding-admission-manifest.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/contracts/GCTX_P11_G3BU04CandidateReferenceRegistryAdmissionAndReviewGate.json",
);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));
const sortedUnique = (values) => [...new Set(values.filter(Boolean))].sort();
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const slug = (value) => String(value ?? "")
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "_")
  .replace(/^_+|_+$/g, "");

function groupConsumers(bindings, idSelector) {
  const groups = new Map();
  for (const binding of bindings) {
    for (const id of idSelector(binding)) {
      const rows = groups.get(id) ?? [];
      rows.push(binding);
      groups.set(id, rows);
    }
  }
  return groups;
}

function baseEntry(id, kind, consumers) {
  return {
    id,
    registryKind: kind,
    lifecycleStatus: "candidate",
    approvalState: "candidate",
    sourceId: "g3b_u04_3b04",
    unitCode: "3B-U04",
    consumerBindingIds: sortedUnique(consumers.map((row) => row.bindingId)),
    consumerPatternSpecIds: sortedUnique(consumers.map((row) => row.patternSpecId)),
    sourceEvidenceIds: sortedUnique(consumers.flatMap((row) => row.reviewEvidence.sourceEvidenceIds)),
    productionSelectable: false,
    runtimeResolvable: false,
  };
}

function buildReferenceRegistries(bindings) {
  const contextFamilies = [...groupConsumers(bindings, (row) => [row.contextFamilyId])]
    .map(([id, consumers]) => ({
      ...baseEntry(id, "context_family", consumers),
      knowledgePointIds: sortedUnique(consumers.map((row) => row.knowledgePointId)),
      operationSignatures: sortedUnique(consumers.map((row) => row.operationSignature)),
      semanticVariantIds: sortedUnique(consumers.map((row) => row.semanticVariantId)),
    }));

  const semanticVariants = [...groupConsumers(bindings, (row) => [row.semanticVariantId])]
    .map(([id, consumers]) => {
      const binding = consumers[0];
      return {
        ...baseEntry(id, "semantic_variant", consumers),
        bindingId: binding.bindingId,
        contextFamilyId: binding.contextFamilyId,
        knowledgePointId: binding.knowledgePointId,
        patternSpecId: binding.patternSpecId,
        operationSignature: binding.operationSignature,
        questionRoleId: binding.questionRole.questionRoleId,
      };
    });

  const commonKnowledge = [...groupConsumers(bindings, (row) => row.commonKnowledgeIds)]
    .map(([id, consumers]) => ({
      ...baseEntry(id, "common_knowledge", consumers),
      provenanceKind: "candidate_derived_from_legacy_semantic_authority",
      externalSourceAdmissionState: "not_yet_reviewed",
    }));

  const languageVariants = [...groupConsumers(bindings, (row) => row.languageVariantIds)]
    .map(([id, consumers]) => {
      const binding = consumers[0];
      return {
        ...baseEntry(id, "language_variant", consumers),
        bindingId: binding.bindingId,
        semanticVariantId: binding.semanticVariantId,
        locale: "zh-TW",
        naturalnessReviewStatus: "pending_human_review",
      };
    });

  const numericProfiles = [...groupConsumers(bindings, (row) => row.numericProfileIds)]
    .map(([id, consumers]) => ({
      ...baseEntry(id, "numeric_profile", consumers),
      operationSignatures: sortedUnique(consumers.map((row) => row.operationSignature)),
      numericRoleKeys: sortedUnique(consumers.flatMap((row) => row.quantityRoles.map((quantity) => quantity.numericProfileRoleKey))),
      canonicalRecomputationRequired: true,
      mathematicalReviewStatus: "pending_human_review",
    }));

  const answerUnits = [...groupConsumers(bindings, (row) => row.answerUnitPolicy.allowedUnitIds)]
    .map(([id, consumers]) => ({
      ...baseEntry(id, "answer_unit", consumers),
      answerPolicyModes: sortedUnique(consumers.map((row) => row.answerUnitPolicy.mode)),
      omissionAllowed: consumers.some((row) => row.answerUnitPolicy.studentAnswerMayOmitUnit),
      unitReviewStatus: "pending_human_review",
    }));

  const sortById = (rows) => rows.sort((left, right) => left.id.localeCompare(right.id));
  return {
    contextFamilies: sortById(contextFamilies),
    semanticVariants: sortById(semanticVariants),
    commonKnowledge: sortById(commonKnowledge),
    languageVariants: sortById(languageVariants),
    numericProfiles: sortById(numericProfiles),
    answerUnits: sortById(answerUnits),
  };
}

function buildReviewPacket(binding, validation, contract) {
  return {
    reviewPacketId: `gctx_review_${slug(binding.bindingId.replace(/^gctx_bind_/, ""))}`,
    bindingId: binding.bindingId,
    sourceId: binding.sourceId,
    unitCode: binding.unitCode,
    knowledgePointId: binding.knowledgePointId,
    patternSpecId: binding.patternSpecId,
    contextFamilyId: binding.contextFamilyId,
    semanticVariantId: binding.semanticVariantId,
    contextDomain: validation.contextDomain,
    operationSignature: binding.operationSignature,
    questionTargetSemanticRoles: binding.quantityRoles
      .filter((row) => row.isQuestionTarget)
      .map((row) => row.semanticRole),
    sourceEvidenceIds: [...binding.reviewEvidence.sourceEvidenceIds],
    semanticReview: {
      status: contract.reviewGate.initialReviewStatus,
      reviewerId: null,
      reviewEvidenceId: null,
      decision: null,
      checks: Object.fromEntries(contract.reviewGate.semanticChecks.map((check) => [check, "pending"])),
    },
    mathematicalReview: {
      status: contract.reviewGate.initialReviewStatus,
      reviewerId: null,
      reviewEvidenceId: null,
      decision: null,
      checks: Object.fromEntries(contract.reviewGate.mathematicalChecks.map((check) => [check, "pending"])),
    },
    blockingUntilBothApproved: true,
    productionSelectable: false,
    runtimeResolvable: false,
  };
}

function registryIdSets(registries) {
  return {
    contextFamilyIds: new Set(registries.contextFamilies.map((row) => row.id)),
    semanticVariantIds: new Set(registries.semanticVariants.map((row) => row.id)),
    commonKnowledgeIds: new Set(registries.commonKnowledge.map((row) => row.id)),
    languageVariantIds: new Set(registries.languageVariants.map((row) => row.id)),
    numericProfileIds: new Set(registries.numericProfiles.map((row) => row.id)),
    answerUnitIds: new Set(registries.answerUnits.map((row) => row.id)),
  };
}

export function loadGctxP11Contract() {
  return readJson(CONTRACT_PATH);
}

export function buildGctxP11ReferenceAdmissionAndReviewGate() {
  const contract = loadGctxP11Contract();
  const p10 = buildGctxP10RemainingExactBindings();
  const approvedRegistry = loadApprovedSemanticBindingRegistry();
  const errors = [];

  if (p10.errors.length > 0 || p10.summary.bindingCount !== contract.scope.bindingCount) {
    errors.push(issue("GCTX_P11_P10_REGISTRY_NOT_ACCEPTED", "p10"));
  }

  const registries = buildReferenceRegistries(p10.entries);
  const ids = registryIdSets(registries);
  let crossRegistryUnresolvedCount = 0;
  for (const binding of p10.entries) {
    const refs = [
      [binding.contextFamilyId, ids.contextFamilyIds, "contextFamilyId"],
      [binding.semanticVariantId, ids.semanticVariantIds, "semanticVariantId"],
      ...binding.commonKnowledgeIds.map((id) => [id, ids.commonKnowledgeIds, "commonKnowledgeId"]),
      ...binding.languageVariantIds.map((id) => [id, ids.languageVariantIds, "languageVariantId"]),
      ...binding.numericProfileIds.map((id) => [id, ids.numericProfileIds, "numericProfileId"]),
      ...binding.answerUnitPolicy.allowedUnitIds.map((id) => [id, ids.answerUnitIds, "answerUnitId"]),
    ];
    for (const [id, set, kind] of refs) {
      if (!set.has(id)) {
        crossRegistryUnresolvedCount += 1;
        errors.push(issue("GCTX_P11_CROSS_REGISTRY_REFERENCE_UNRESOLVED", binding.bindingId, { id, kind }));
      }
    }
  }

  for (const [registryName, rows] of Object.entries(registries)) {
    const entryIds = rows.map((row) => row.id);
    if (new Set(entryIds).size !== entryIds.length) errors.push(issue("GCTX_P11_DUPLICATE_REFERENCE_ID", registryName));
    for (const row of rows) {
      if (row.lifecycleStatus !== "candidate" || row.approvalState !== "candidate"
        || row.consumerBindingIds.length === 0 || row.sourceEvidenceIds.length === 0
        || row.productionSelectable !== false || row.runtimeResolvable !== false) {
        errors.push(issue("GCTX_P11_REFERENCE_FALSE_APPROVAL_OR_EMPTY_PROVENANCE", `${registryName}.${row.id}`));
      }
    }
  }

  const validationByBinding = new Map(p10.validations.map((row) => [row.bindingId, row]));
  const reviewPackets = p10.entries.map((binding) => buildReviewPacket(
    binding,
    validationByBinding.get(binding.bindingId),
    contract,
  )).sort((left, right) => left.reviewPacketId.localeCompare(right.reviewPacketId));
  const packetIds = reviewPackets.map((row) => row.reviewPacketId);
  if (new Set(packetIds).size !== packetIds.length) errors.push(issue("GCTX_P11_DUPLICATE_REVIEW_PACKET_ID", "reviewPackets"));

  for (const packet of reviewPackets) {
    const semanticChecks = Object.keys(packet.semanticReview.checks);
    const mathChecks = Object.keys(packet.mathematicalReview.checks);
    if (JSON.stringify(semanticChecks) !== JSON.stringify(contract.reviewGate.semanticChecks)
      || JSON.stringify(mathChecks) !== JSON.stringify(contract.reviewGate.mathematicalChecks)) {
      errors.push(issue("GCTX_P11_REVIEW_CHECK_SET_DRIFT", packet.reviewPacketId));
    }
    for (const review of [packet.semanticReview, packet.mathematicalReview]) {
      if (review.status !== "pending_human_review" || review.reviewerId !== null
        || review.reviewEvidenceId !== null || review.decision !== null
        || Object.values(review.checks).some((value) => value !== "pending")) {
        errors.push(issue("GCTX_P11_AUTOMATIC_REVIEW_DECISION_FORBIDDEN", packet.reviewPacketId));
      }
    }
  }

  if (approvedRegistry.entries.length !== 0) {
    errors.push(issue("GCTX_P11_FORMAL_APPROVED_REGISTRY_NOT_EMPTY", "approvedRegistry.entries"));
  }

  const allReferenceRows = Object.values(registries).flat();
  const summary = {
    bindingCount: p10.entries.length,
    contextFamilyCount: registries.contextFamilies.length,
    semanticVariantCount: registries.semanticVariants.length,
    commonKnowledgeCount: registries.commonKnowledge.length,
    languageVariantCount: registries.languageVariants.length,
    numericProfileCount: registries.numericProfiles.length,
    answerUnitCount: registries.answerUnits.length,
    reviewPacketCount: reviewPackets.length,
    crossRegistryUnresolvedCount,
    humanSemanticReviewPendingCount: reviewPackets.filter((row) => row.semanticReview.status === "pending_human_review").length,
    humanMathematicalReviewPendingCount: reviewPackets.filter((row) => row.mathematicalReview.status === "pending_human_review").length,
    approvedReferenceCount: allReferenceRows.filter((row) => row.approvalState === "approved").length,
    approvedBindingCount: p10.entries.filter((row) => row.lifecycleStatus === "approved").length,
    formalApprovedRegistryEntryCount: approvedRegistry.entries.length,
    errorCount: errors.length,
    readyForHumanReviewExecution: errors.length === 0,
  };

  for (const [field, expected] of Object.entries(contract.acceptedSnapshot)) {
    if (field === "errorCount") continue;
    if (summary[field] !== expected) errors.push(issue("GCTX_P11_ACCEPTED_SNAPSHOT_MISMATCH", `summary.${field}`, { expected, actual: summary[field] }));
  }
  summary.errorCount = errors.length;
  summary.readyForHumanReviewExecution = errors.length === 0;

  return clone({
    registryId: "gctx_registry_g3b_u04_candidate_references_v1",
    schemaVersion: 1,
    rulesetVersion: contract.rulesetVersion,
    task: contract.task,
    status: errors.length === 0 ? "accepted_for_human_review_execution" : "blocked",
    sourceId: contract.scope.sourceId,
    unitCode: contract.scope.unitCode,
    registries,
    reviewPackets,
    summary,
    formalApprovedRegistry: {
      path: contract.inputs.formalApprovedRegistry,
      entryCount: approvedRegistry.entries.length,
      changedByP11: false,
    },
    errors,
    scopeBoundary: {
      runtimeBehaviorChanged: false,
      formalApprovedRegistryChanged: false,
      productionSelectable: false,
      humanReviewExecuted: false,
      rendererChanged: false,
    },
    nextShortestStep: contract.nextTask,
  });
}

const invokedPath = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  process.stdout.write(`${JSON.stringify(buildGctxP11ReferenceAdmissionAndReviewGate(), null, 2)}\n`);
}
