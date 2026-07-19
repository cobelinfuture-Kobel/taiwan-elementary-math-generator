import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildGS03GoldenContract } from "./build-gs03-g5a-u08-golden-contract.mjs";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const CONTRACT_PATH = resolve(ROOT, "data/curriculum/golden/G5AU08_GOLDEN_V1.contract.json");

const issue = (code, details = {}) => ({ code, ...details });
const stable = (value) => JSON.stringify(value);

export async function readCommittedGS03GoldenContract() {
  return JSON.parse(await readFile(CONTRACT_PATH, "utf8"));
}

export async function validateGS03GoldenContract(contract = await readCommittedGS03GoldenContract()) {
  const expected = await buildGS03GoldenContract();
  const errors = [];

  if (contract.goldenContractId !== "G5AU08_GOLDEN_V1") {
    errors.push(issue("GS03_GOLDEN_CONTRACT_ID_INVALID", { actual: contract.goldenContractId }));
  }
  if (contract.goldenContractVersion !== "1.0.0") {
    errors.push(issue("GS03_GOLDEN_CONTRACT_VERSION_INVALID", { actual: contract.goldenContractVersion }));
  }
  if (contract.status !== "FROZEN_FOR_GS04_CONSUMPTION") {
    errors.push(issue("GS03_GOLDEN_CONTRACT_NOT_FROZEN", { actual: contract.status }));
  }

  const exactCounts = {
    knowledgePointCount: 11,
    patternGroupCount: 17,
    patternSpecCount: 30,
    numericPatternSpecCount: 19,
    applicationPatternSpecCount: 11,
    generatorPatternSpecUnionCount: 30,
    templateFamilyCount: 10,
    globalContextFamilyCount: 18,
    unitContextBindingCount: 18,
    surfaceTemplateCount: 54,
    seedQACount: 90,
  };
  for (const [key, value] of Object.entries(exactCounts)) {
    if (contract.frozenCounts?.[key] !== value) {
      errors.push(issue("GS03_FROZEN_COUNT_DRIFT", { key, expected: value, actual: contract.frozenCounts?.[key] }));
    }
  }

  const authorityRows = contract.authoritySnapshot ?? [];
  if (authorityRows.length !== 20) {
    errors.push(issue("GS03_AUTHORITY_FILE_COUNT_INVALID", { actual: authorityRows.length }));
  }
  if (new Set(authorityRows.map((row) => row.path)).size !== authorityRows.length) {
    errors.push(issue("GS03_DUPLICATE_AUTHORITY_PATH"));
  }
  if (authorityRows.some((row) => !["schema", "binding", "generator", "validator", "renderer"].includes(row.layer))) {
    errors.push(issue("GS03_UNKNOWN_AUTHORITY_LAYER"));
  }
  if (authorityRows.some((row) => !/^[a-f0-9]{64}$/.test(row.sha256 ?? ""))) {
    errors.push(issue("GS03_AUTHORITY_HASH_INVALID"));
  }
  for (const layer of ["schema", "binding", "generator", "validator", "renderer"]) {
    if (!authorityRows.some((row) => row.layer === layer)) {
      errors.push(issue("GS03_AUTHORITY_LAYER_MISSING", { layer }));
    }
  }

  if (contract.bindingContract?.productionUse !== "allowed"
    || contract.bindingContract?.productionSelectorStatus !== "visible") {
    errors.push(issue("GS03_PRODUCTION_BASELINE_NOT_PRESERVED"));
  }
  if (contract.bindingContract?.globalContextProductionSelectableAtFreeze !== false
    || contract.bindingContract?.globalContextRuntimeResolvableAtFreeze !== false) {
    errors.push(issue("GS03_PREMATURE_GLOBAL_CONTEXT_ADMISSION"));
  }
  if (contract.bindingContract?.contextMayChangeMath !== false
    || contract.bindingContract?.contextMayReplaceTemplateFamily !== false) {
    errors.push(issue("GS03_CONTEXT_MATH_OWNERSHIP_INVALID"));
  }

  if (contract.generatorContract?.genericFallbackAllowed !== false
    || contract.generatorContract?.freeFormAICompositionAllowed !== false
    || contract.generatorContract?.unsupportedPatternPolicy !== "block") {
    errors.push(issue("GS03_GENERATOR_SAFETY_CONTRACT_INVALID"));
  }
  if (contract.validatorContract?.blockingFailureReturnsOutput !== false
    || contract.validatorContract?.canonicalAnswerRecomputationRequired !== true) {
    errors.push(issue("GS03_VALIDATOR_FAIL_CLOSED_CONTRACT_INVALID"));
  }
  if (contract.rendererContract?.internalIdVisible !== false
    || contract.rendererContract?.questionAndAnswerNumberSequenceMustMatch !== true
    || contract.rendererContract?.iframePrintInvocationRequired !== true) {
    errors.push(issue("GS03_RENDERER_CONTRACT_INVALID"));
  }

  const extension = contract.extensionPolicy ?? {};
  for (const field of ["perUnitNewGeneratorMax", "perUnitNewValidatorMax", "perUnitNewRendererMax", "perUnitNewWorkflowMax"]) {
    if (extension[field] !== 0) errors.push(issue("GS03_PER_UNIT_RUNTIME_LIMIT_INVALID", { field, actual: extension[field] }));
  }
  if (extension.affectedUnitCountForSharedCapability !== 2
    || extension.sharedCapabilityExtensionRequiresApproval !== true
    || extension.versionBumpRequiredForContractMutation !== true) {
    errors.push(issue("GS03_SHARED_EXTENSION_POLICY_INVALID"));
  }

  const consumer = contract.consumerBoundary ?? {};
  if (consumer.nextTaskId !== "GS04_G5AU08_SharedRuntimeAndBatchAdapter"
    || consumer.runtimeConsumerImplementedByGS03 !== false
    || consumer.batchAdapterImplementedByGS03 !== false
    || consumer.crossUnitPilotImplementedByGS03 !== false
    || consumer.productionAdmissionOfGS02ContextsByGS03 !== false) {
    errors.push(issue("GS03_CONSUMER_BOUNDARY_VIOLATED"));
  }

  const requiredConformanceFields = [
    "unitId", "implementationStatus", "goldenContractVersion", "knowledgePointCoverage",
    "patternSpecCoverage", "contextBindingStatus", "generatorConformance", "validatorConformance",
    "rendererConformance", "publicUIConformance", "exceptionStatus"
  ];
  if (stable(contract.unitConformanceContract?.requiredFields) !== stable(requiredConformanceFields)) {
    errors.push(issue("GS03_UNIT_CONFORMANCE_FIELDS_DRIFT"));
  }

  if (stable(contract) !== stable(expected)) {
    errors.push(issue("GS03_GOLDEN_SNAPSHOT_DRIFT"));
  }

  return {
    ok: errors.length === 0,
    errors,
    summary: {
      goldenContractId: contract.goldenContractId,
      goldenContractVersion: contract.goldenContractVersion,
      authorityFileCount: authorityRows.length,
      frozenCounts: contract.frozenCounts,
      status: contract.status,
      snapshotMatchesCurrentAuthorities: stable(contract) === stable(expected),
    },
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await validateGS03GoldenContract();
  console.log(`GS03_GOLDEN_CONTRACT_VALIDATION=${JSON.stringify(result.summary)}`);
  if (!result.ok) {
    console.error(JSON.stringify(result.errors, null, 2));
    process.exitCode = 1;
  }
}
