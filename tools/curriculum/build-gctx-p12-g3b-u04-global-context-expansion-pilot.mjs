import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT,
  G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS,
  buildG3BU04GlobalContextExpansionPreview,
  validateG3BU04GlobalContextExpansionQuestion
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-expansion-pilot.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/contracts/GCTX_P12_G3BU04GlobalContextExpansionPilotAndRenderedDifferenceGate.json"
);

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));

export function loadGctxP12Contract() {
  return readJson(CONTRACT_PATH);
}

function buildCandidateBindingSummary(variant, contract) {
  return {
    bindingId: `gctx_bind_g3b_u04_joint_purchase_${variant.contextDomainId}`,
    rulesetVersion: contract.rulesetVersion,
    sourceId: contract.scope.sourceId,
    unitCode: contract.scope.unitCode,
    knowledgePointId: contract.scope.knowledgePointId,
    patternSpecId: contract.scope.patternSpecId,
    contextFamilyId: contract.scope.contextFamilyId,
    semanticVariantId: variant.variantId,
    languageVariantId: variant.languageVariantId,
    contextDomainId: variant.contextDomainId,
    operationSignature: contract.scope.operationSignature,
    lifecycleStatus: "candidate",
    actualEvidenceLevel: "E2_CONTENT_AUTHORED",
    productionSelectable: false,
    runtimeResolvable: false,
    humanReviewReady: false
  };
}

function buildNonReviewPacket(binding, question, validation) {
  return {
    reviewPacketId: `gctx_nonreview_${binding.semanticVariantId.replace(/^gctx_semvar_/, "")}`,
    bindingId: binding.bindingId,
    semanticVariantId: binding.semanticVariantId,
    renderedCandidateText: question.promptText,
    equationModel: question.equationModel,
    answerText: question.answerText,
    mathematicalWitnessValid: validation.ok,
    artifactClass: "standalone_candidate_preview_not_production_evidence",
    reviewStatus: "not_ready_missing_e4_artifact",
    reviewType: "none",
    decision: null,
    productionSelectable: false,
    runtimeResolvable: false,
    humanReviewReady: false
  };
}

export function buildGctxP12GlobalContextExpansionPilot() {
  const contract = loadGctxP12Contract();
  const preview = buildG3BU04GlobalContextExpansionPreview();
  const bindings = G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => buildCandidateBindingSummary(variant, contract));
  const validations = preview.questions.map((question) => validateG3BU04GlobalContextExpansionQuestion(question));
  const errors = [...preview.errors, ...validations.flatMap((validation) => validation.errors)];
  const reviewPackets = bindings.map((binding, index) => buildNonReviewPacket(binding, preview.questions[index], validations[index]));

  const summary = {
    actualEvidenceLevel: "E2_CONTENT_AUTHORED",
    bindingCount: bindings.length,
    renderedCandidateQuestionCount: preview.questions.length,
    uniquePromptCount: preview.summary.uniquePromptCount,
    uniqueContextDomainCount: preview.summary.uniqueContextDomainCount,
    uniqueSemanticFingerprintCount: preview.summary.uniqueSemanticFingerprintCount,
    candidateMathErrorCount: errors.length,
    productionSelectableCount: 0,
    runtimeResolvableCount: 0,
    productionRendererUsedCount: 0,
    htmlOutputVerifiedCount: 0,
    pdfOutputVerifiedCount: 0,
    visibleOutputChangedCount: 0,
    humanReviewReadyCount: 0,
    humanDecisionCount: 0,
    errorCount: errors.length
  };

  return clone({
    registryId: "gctx_registry_g3b_u04_global_context_expansion_pilot_v1",
    schemaVersion: 1,
    rulesetVersion: contract.rulesetVersion,
    task: contract.task,
    status: errors.length === 0
      ? "candidate_content_authored_runtime_output_not_integrated"
      : "blocked",
    pilot: G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT,
    bindings,
    preview,
    reviewPackets,
    summary,
    scopeBoundary: {
      formalApprovedRegistryChanged: false,
      publicRouterChanged: false,
      productionSelectable: false,
      runtimeResolvable: false,
      productionEquivalentGeneratorUsed: false,
      productionRendererUsed: false,
      htmlOutputVerified: false,
      pdfOutputVerified: false,
      visibleOutputChanged: false,
      humanReviewReady: false
    },
    errors,
    nextShortestStep: contract.distance.nextShortestStep
  });
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;

if (isCli) {
  const result = buildGctxP12GlobalContextExpansionPilot();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.errors.length > 0) process.exitCode = 1;
}
