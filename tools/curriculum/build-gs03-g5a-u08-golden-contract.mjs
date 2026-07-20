import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G5A_U08_PRODUCTION_LIFECYCLE,
  G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
  getG5AU08ProductionPromotionProjection,
  validateG5AU08ProductionPromotionProjection,
} from "../../site/modules/curriculum/registry/g5a-u08-production-promotion.js";
import { G5A_U08_S60G_PATTERN_SPEC_IDS } from "../../site/modules/curriculum/batch-a/g5a-u08-numeric-generator.js";
import {
  ALLOWED_SDG_IDS,
  G5A_U08_S60H_PATTERN_SPEC_IDS,
  SPEC_POLICY,
} from "../../site/modules/curriculum/batch-a/g5a-u08-application-generator.js";
import { G5A_U08_RENDERER_INTEGRATION } from "../../site/modules/renderer/html-renderer-s60j-extension.js";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUTPUT_PATH = resolve(ROOT, "data/curriculum/golden/G5AU08_GOLDEN_V1.contract.json");

const AUTHORITY_DEFS = Object.freeze([
  { layer: "schema", path: "data/curriculum/contracts/S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json", tokens: ["templateFamilies", "allowedSemanticDeltaIds", "maxSemanticDeltaPerItem"] },
  { layer: "schema", path: "site/modules/curriculum/batch-a/source-pattern-g5a-u08-extension.js", tokens: ["G5A_U08_HIDDEN_PATTERN_GROUPS", "G5A_U08_HIDDEN_PATTERN_SPECS"] },
  { layer: "schema", path: "data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json", tokens: ["GS02G5AU08GlobalContextFamilyRegistry", "contextFamilies"] },
  { layer: "binding", path: "data/curriculum/context/registry/gs02-g5a-u08-unit-context-bindings.json", tokens: ["GS02G5AU08UnitContextBindingRegistry", "bindings"] },
  { layer: "binding", path: "site/modules/curriculum/registry/g5a-u08-promotion.js", tokens: ["G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS", "G5A_U08_PROMOTED_PATTERN_SPEC_IDS"] },
  { layer: "binding", path: "site/modules/curriculum/registry/g5a-u08-production-promotion.js", tokens: ["G5A_U08_PRODUCTION_LIFECYCLE", "getG5AU08ProductionPromotionProjection"] },
  { layer: "binding", path: "site/modules/curriculum/registry/g5a-u08-worksheet-promotion.js", tokens: ["G5A_U08_WORKSHEET_PROMOTION_OVERLAY_ID"] },
  { layer: "binding", path: "site/modules/curriculum/batch-a/g5a-u08-worksheet-eligibility.js", tokens: ["G5A_U08_WORKSHEET_ELIGIBILITY", "validateG5AU08WorksheetEligibility"] },
  { layer: "binding", path: "site/modules/curriculum/batch-a/g5a-u08-canonical-router.js", tokens: ["g5a_u08_5a08", "validateG5AU08CanonicalPlan"] },
  { layer: "generator", path: "site/modules/curriculum/batch-a/g5a-u08-numeric-generator.js", tokens: ["G5A_U08_S60G_PATTERN_SPEC_IDS", "genericFallbackAllowed"] },
  { layer: "generator", path: "site/modules/curriculum/batch-a/g5a-u08-application-generator.js", tokens: ["generateG5AU08ApplicationQuestion", "generateG5AU08ApplicationBatch"] },
  { layer: "generator", path: "site/modules/curriculum/batch-a/g5a-u08-application-generator-core.js", tokens: ["G5A_U08_S60H_PATTERN_SPEC_IDS", "genericFallbackAllowed"] },
  { layer: "generator", path: "site/modules/curriculum/batch-a/g5a-u08-application-batch-planner.js", tokens: ["generateG5AU08ApplicationBatch", "resolveJointPlan"] },
  { layer: "validator", path: "site/modules/curriculum/batch-a/g5a-u08-numeric-validator.js", tokens: ["valid", "output"] },
  { layer: "validator", path: "site/modules/curriculum/batch-a/g5a-u08-application-validator.js", tokens: ["G5A_U08_BLOCKING_CODES", "validateG5AU08ApplicationBatch"] },
  { layer: "validator", path: "site/modules/curriculum/batch-a/g5a-u08-application-validator-core.js", tokens: ["G5A_U08_BLOCKING_CODES", "acceptedQuestions"] },
  { layer: "renderer", path: "site/modules/renderer/html-renderer-s60j-extension.js", tokens: ["G5A_U08_RENDERER_INTEGRATION", "renderWorksheetDocumentToHtml"] },
  { layer: "renderer", path: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60j-extension.js", tokens: ["g5a_u08"] },
  { layer: "renderer", path: "site/assets/browser/pipeline/build-worksheet-document.js", tokens: ["questionPages", "answerKeyPages"] },
  { layer: "renderer", path: "site/assets/browser/pipeline/render-preview-frame.js", tokens: ["renderPreviewFrame", "printPreviewFrame", "contentWindow"] },
]);

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

async function readJson(repoPath) {
  return JSON.parse(await readFile(resolve(ROOT, repoPath), "utf8"));
}

async function snapshotAuthorities() {
  const rows = [];
  for (const definition of AUTHORITY_DEFS) {
    const content = await readFile(resolve(ROOT, definition.path), "utf8");
    const missingTokens = definition.tokens.filter((token) => !content.includes(token));
    if (missingTokens.length > 0) {
      throw new Error(`GS03_AUTHORITY_TOKEN_MISSING:${definition.path}:${missingTokens.join(",")}`);
    }
    rows.push({
      layer: definition.layer,
      path: definition.path,
      sha256: sha256(content),
      requiredTokens: [...definition.tokens],
    });
  }
  return rows;
}

export async function buildGS03GoldenContract() {
  const s60d = await readJson("data/curriculum/contracts/S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json");
  const familyRegistry = await readJson("data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json");
  const bindingRegistry = await readJson("data/curriculum/context/registry/gs02-g5a-u08-unit-context-bindings.json");
  const promotion = getG5AU08ProductionPromotionProjection();
  const promotionValidation = validateG5AU08ProductionPromotionProjection();
  if (!promotionValidation.ok) {
    throw new Error(`GS03_PRODUCTION_PROMOTION_INVALID:${promotionValidation.errors.join(",")}`);
  }
  const authoritySnapshot = await snapshotAuthorities();
  const surfaceTemplateCount = familyRegistry.contextFamilies.reduce((total, row) => total + row.surfaceTemplates.length, 0);
  const seedQACount = familyRegistry.contextFamilies.reduce((total, row) => total + row.seedQA.length, 0);
  const numericIds = [...G5A_U08_S60G_PATTERN_SPEC_IDS].sort();
  const applicationIds = [...G5A_U08_S60H_PATTERN_SPEC_IDS].sort();
  const allGeneratorIds = [...new Set([...numericIds, ...applicationIds])].sort();

  return {
    schemaName: "G5AU08GoldenContract",
    schemaVersion: 1,
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    sourceId: "g5a_u08_5a08",
    unitCode: "5A-U08",
    status: "FROZEN_FOR_GS04_CONSUMPTION",
    freezeTaskId: "GS03_G5AU08_GoldenContractFreeze",
    predecessorEvidence: {
      gs01MergeSha: "5286417b30dffe319f1d103fc2ea8b306be19b9a",
      gs02MergeSha: "348f001e9ede0bf852448e32cf1162d5502ea552",
      gs01EvidenceLevel: "E5_PRODUCTION_ADMITTED",
      gs02EvidenceLevel: "E2_CONTENT_AUTHORED",
    },
    frozenCounts: {
      knowledgePointCount: promotion.knowledgePointIds.length,
      patternGroupCount: promotion.patternGroupIds.length,
      patternSpecCount: promotion.patternSpecIds.length,
      numericPatternSpecCount: numericIds.length,
      applicationPatternSpecCount: applicationIds.length,
      generatorPatternSpecUnionCount: allGeneratorIds.length,
      templateFamilyCount: s60d.templateFamilies.length,
      globalContextFamilyCount: familyRegistry.contextFamilies.length,
      unitContextBindingCount: bindingRegistry.bindings.length,
      surfaceTemplateCount,
      seedQACount,
    },
    schemaContract: {
      sourcePatternAuthority: "site/modules/curriculum/batch-a/source-pattern-g5a-u08-extension.js",
      applicationTemplateAuthority: "data/curriculum/contracts/S60D_G5A_U08_ApplicationTemplateAndSDGContextContract.json",
      globalContextFamilyAuthority: "data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json",
      unitContextBindingAuthority: "data/curriculum/context/registry/gs02-g5a-u08-unit-context-bindings.json",
      requiredNodeIdentityFields: ["sourceId", "knowledgePointId", "patternGroupId", "patternSpecId"],
      requiredQuestionFields: ["sourceId", "patternSpecId", "patternGroupId", "knowledgePointId", "answerModelShape", "finalAnswer", "fallbackUsed", "genericFallbackAllowed"],
      allowedDepths: ["N", "N_PLUS_1"],
      allowedContextTypes: ["daily_life", "sdg"],
      publicNPlus2: false,
      formalEquationPublicMode: false,
    },
    bindingContract: {
      promotionOverlayId: G5A_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
      productionLifecycle: { ...G5A_U08_PRODUCTION_LIFECYCLE },
      productionUse: "allowed",
      productionSelectorStatus: "visible",
      globalContextLifecycleAtFreeze: "candidate_gs02",
      globalContextProductionSelectableAtFreeze: false,
      globalContextRuntimeResolvableAtFreeze: false,
      contextMayChangeMath: false,
      contextMayReplaceTemplateFamily: false,
      operationSignatureAuthority: "unit_owned_existing_template_family",
      quantityRoleAuthority: "unit_owned_existing_template_family",
      unitFlowAuthority: "unit_owned_existing_template_family",
      answerWitnessAuthority: "unit_owned_existing_validator_and_answer_model",
    },
    generatorContract: {
      numericModule: "site/modules/curriculum/batch-a/g5a-u08-numeric-generator.js",
      applicationModule: "site/modules/curriculum/batch-a/g5a-u08-application-generator.js",
      numericPatternSpecIds: numericIds,
      applicationPatternSpecIds: applicationIds,
      patternSpecUnionCount: allGeneratorIds.length,
      applicationSpecPolicy: JSON.parse(JSON.stringify(SPEC_POLICY)),
      allowedSdgIds: [...ALLOWED_SDG_IDS],
      deterministicGenerationRequired: true,
      rejectionSamplingBounded: true,
      genericFallbackAllowed: false,
      freeFormAICompositionAllowed: false,
      unsupportedPatternPolicy: "block",
    },
    validatorContract: {
      numericModule: "site/modules/curriculum/batch-a/g5a-u08-numeric-validator.js",
      applicationModule: "site/modules/curriculum/batch-a/g5a-u08-application-validator.js",
      applicationCoreModule: "site/modules/curriculum/batch-a/g5a-u08-application-validator-core.js",
      blockingFailureReturnsOutput: false,
      canonicalAnswerRecomputationRequired: true,
      patternSpecDepthContextAllocationParityRequired: true,
      unitFlowValidationRequired: true,
      semanticRoleValidationRequired: true,
      sdgLabelOnlyContextBlocked: true,
      unsupportedContextBindingBlocked: true,
      errorSeverityForBlockingFailure: "error",
    },
    rendererContract: {
      module: "site/modules/renderer/html-renderer-s60j-extension.js",
      worksheetAssemblyModule: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-s60j-extension.js",
      documentPipeline: "site/assets/browser/pipeline/build-worksheet-document.js",
      previewPipeline: "site/assets/browser/pipeline/render-preview-frame.js",
      profileIds: [...G5A_U08_RENDERER_INTEGRATION.profileIds],
      answerShapes: [...G5A_U08_RENDERER_INTEGRATION.answerShapes],
      internalIdVisible: G5A_U08_RENDERER_INTEGRATION.internalIdVisible,
      questionPageType: "question",
      answerPageType: "answer",
      questionAndAnswerNumberSequenceMustMatch: true,
      answerKeyMayBeOmitted: true,
      printPageWidthMm: 210,
      printPageHeightMm: 296,
      iframePrintInvocationRequired: true,
      genericRendererFallbackAllowedForG5AU08: false,
    },
    unitConformanceContract: {
      requiredFields: [
        "unitId",
        "implementationStatus",
        "goldenContractVersion",
        "knowledgePointCoverage",
        "patternSpecCoverage",
        "contextBindingStatus",
        "generatorConformance",
        "validatorConformance",
        "rendererConformance",
        "publicUIConformance",
        "exceptionStatus"
      ],
      allowedStatuses: [
        "LEGACY_COMPLETED_PENDING_GOLDEN_VALIDATION",
        "GOLDEN_CONFORMANT",
        "IN_PROGRESS_GOLDEN_NATIVE",
        "BLOCKED_SOURCE_EVIDENCE",
        "SHARED_CAPABILITY_EXCEPTION",
        "NOT_STARTED"
      ],
      productionGateRequiresGoldenConformant: true,
    },
    extensionPolicy: {
      perUnitNewGeneratorMax: 0,
      perUnitNewValidatorMax: 0,
      perUnitNewRendererMax: 0,
      perUnitNewWorkflowMax: 0,
      affectedUnitCountForSharedCapability: 2,
      sharedCapabilityExtensionRequiresApproval: true,
      versionBumpRequiredForContractMutation: true,
      migrationNoteRequiredForBreakingChange: true,
    },
    consumerBoundary: {
      nextTaskId: "GS04_G5AU08_SharedRuntimeAndBatchAdapter",
      runtimeConsumerImplementedByGS03: false,
      batchAdapterImplementedByGS03: false,
      crossUnitPilotImplementedByGS03: false,
      productionAdmissionOfGS02ContextsByGS03: false,
    },
    authoritySnapshot,
  };
}

export async function writeGS03GoldenContract() {
  const contract = await buildGS03GoldenContract();
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
  return contract;
}

if (process.argv.includes("--write")) {
  const contract = await writeGS03GoldenContract();
  console.log(JSON.stringify({
    goldenContractId: contract.goldenContractId,
    goldenContractVersion: contract.goldenContractVersion,
    authorityFileCount: contract.authoritySnapshot.length,
    frozenCounts: contract.frozenCounts,
  }, null, 2));
}
