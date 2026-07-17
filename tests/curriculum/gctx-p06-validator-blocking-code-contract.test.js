import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { GCTX_P05_REPRESENTATIVE_FIXTURE_CORPUS } from "../fixtures/gctx-p05-representative-fixture-corpus.js";

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, "../..");

const readJson = (relativePath) => JSON.parse(readFileSync(
  path.join(repoRoot, relativePath),
  "utf8",
));

const schema = readJson(
  "data/curriculum/context/schemas/GCTX_ValidatorAndBlockingCode.schema.json",
);
const contract = readJson(
  "data/curriculum/contracts/GCTX_P06_ValidatorAndBlockingCodeContract.json",
);
const p02 = readJson(
  "data/curriculum/contracts/GCTX_P02_ScenarioChainBoundedPBLAndCompleteProjectionContract.json",
);
const p03 = readJson(
  "data/curriculum/contracts/GCTX_P03_SourceMiningCommonKnowledgeAndEvidenceGovernanceContract.json",
);
const p04 = readJson(
  "data/curriculum/contracts/GCTX_P04_PBLSemanticBreadthFingerprintAndNearDuplicateContract.json",
);
const p05 = readJson(
  "data/curriculum/contracts/GCTX_P05_RepresentativePositiveNegativeFixtureCorpusContract.json",
);

const defs = schema.$defs;

const stageOrder = Object.freeze([
  "ruleset_and_request",
  "p02_chain_closure",
  "p03_evidence_admission",
  "p04_fingerprint_canonicalization",
  "p04_pairwise_similarity",
  "p04_breadth_gate",
  "production_admission",
]);

const p06InternalCodes = Object.freeze([
  "GCTX_VALIDATOR_REQUEST_INVALID",
  "GCTX_VALIDATOR_RULESET_VERSION_MISMATCH",
  "GCTX_VALIDATOR_INPUT_DIGEST_MISSING",
  "GCTX_VALIDATOR_STAGE_RESULT_MISSING",
  "GCTX_VALIDATOR_UNKNOWN_BLOCKING_CODE",
  "GCTX_VALIDATOR_NONDETERMINISTIC_OUTPUT",
  "GCTX_VALIDATOR_PRODUCTION_ELIGIBILITY_INCONSISTENT",
]);

const warningCodes = Object.freeze([
  "PBL_TARGET_CHAIN_BAND_NOT_REACHED",
  "GCTX_EVIDENCE_REVIEW_DUE_SOON",
  "PBL_SURFACE_VARIETY_BELOW_TARGET",
  "PBL_NUMERIC_CAPACITY_BELOW_TARGET",
]);

const flattenGroups = (groups) => Object.values(groups).flat();

function resolveStageCodes(stage) {
  return stage.blockingCodeGroups.flatMap((groupName) => {
    const codes = contract.blockingCodeGroups[groupName];
    assert.ok(codes, `unknown blocking-code group ${groupName}`);
    return codes;
  });
}

test("GCTX-P06 follows accepted P02-P05 contracts and remains contract-only", () => {
  assert.equal(contract.task, "GCTX-P06_ValidatorAndBlockingCodeContract");
  assert.match(contract.status, /^validator_contract_locked_/);
  assert.equal(contract.validatorContractVersion, "gctx-validator-contract-v1");
  assert.equal(contract.rulesetVersion, "0.1.0");
  assert.equal(contract.fingerprintVersion, "pbl-semantic-fingerprint-v1");

  assert.equal(p02.status, contract.upstreamDependencies.p02Status);
  assert.equal(p03.status, contract.upstreamDependencies.p03Status);
  assert.equal(p04.status, contract.upstreamDependencies.p04Status);
  assert.equal(p05.status, contract.upstreamDependencies.p05Status);
  assert.equal(p05.nextTask, contract.task);

  assert.equal(contract.scope.schemaAndContractOnly, true);
  assert.equal(contract.scope.blockingCodeRegistryMaterialized, false);
  assert.equal(contract.scope.validatorImplementationChange, false);
  assert.equal(contract.scope.runtimeBehaviorChange, false);
  assert.equal(contract.scope.unitMigrationChange, false);
  assert.equal(contract.scope.rendererImplementationChange, false);
  assert.equal(contract.scope.productionPopulationChange, false);
});

test("GCTX-P06 schema and contract lock exactly seven ordered stages", () => {
  assert.deepEqual(defs.validatorStageId.enum, stageOrder);
  assert.deepEqual(contract.stageOrder, stageOrder);
  assert.equal(contract.stageDefinitions.length, 7);
  assert.deepEqual(
    contract.stageDefinitions.map((stage) => stage.stageId),
    stageOrder,
  );
  assert.deepEqual(
    contract.stageDefinitions.map((stage) => stage.order),
    [1, 2, 3, 4, 5, 6, 7],
  );

  for (const stage of contract.stageDefinitions) {
    assert.equal(stage.mustRun, true);
    assert.equal(stage.mayMutateInput, false);
    assert.equal(stage.passRequiresNoStageBlockingErrors, true);
    assert.ok(stage.requiredInputs.length > 0);
  }

  const schemaStages = defs.registryEnvelope.properties.stageDefinitions;
  assert.equal(schemaStages.minItems, 7);
  assert.equal(schemaStages.maxItems, 7);
  assert.equal(contract.stageResultContract.exactStageResultCount, 7);
  assert.equal(contract.stageResultContract.allStagesExecuted, true);
});

test("GCTX-P06 locks deterministic fail-closed collection policy", () => {
  const policy = defs.validationPolicy.properties;
  assert.equal(policy.deterministic.const, true);
  assert.equal(policy.sameInputProducesSameOutput.const, true);
  assert.equal(policy.failClosed.const, true);
  assert.equal(policy.failFast.const, false);
  assert.equal(policy.collectAllBlockingErrors.const, true);
  assert.equal(policy.runtimeWebSearchAllowed.const, false);
  assert.equal(policy.aiJudgmentAllowed.const, false);
  assert.equal(policy.genericFallbackAllowed.const, false);
  assert.equal(policy.unknownBlockingCodePolicy.const, "block");
  assert.equal(policy.warningMayOverrideBlockingError.const, false);
  assert.equal(policy.productionEligibilityRequiresZeroBlockingErrors.const, true);
  assert.equal(policy.productionEligibilityRequiresAllStagesPass.const, true);
  assert.equal(policy.inputDigestRequired.const, true);
  assert.equal(policy.outputDigestRequired.const, true);
  assert.equal(policy.stableIssueOrderingRequired.const, true);
  assert.equal(policy.issueDeduplicationRequired.const, true);

  assert.deepEqual(contract.deterministicPolicy, {
    deterministic: true,
    sameInputProducesSameOutput: true,
    failClosed: true,
    failFast: false,
    collectAllBlockingErrors: true,
    runtimeWebSearchAllowed: false,
    aiJudgmentAllowed: false,
    genericFallbackAllowed: false,
    unknownBlockingCodePolicy: "block",
    warningMayOverrideBlockingError: false,
    productionEligibilityRequiresZeroBlockingErrors: true,
    productionEligibilityRequiresAllStagesPass: true,
    inputDigestRequired: true,
    outputDigestRequired: true,
    stableIssueOrderingRequired: true,
    issueDeduplicationRequired: true,
  });
});

test("GCTX-P06 recognizes the exact P02, P03 and P04 blocking-code sets", () => {
  assert.deepEqual(contract.blockingCodeGroups.p02ClosureCodes, p02.blockingCodesReserved);
  assert.deepEqual(contract.blockingCodeGroups.p03EvidenceCodes, p03.blockingCodesReserved);

  const p04FromGroups = [
    ...contract.blockingCodeGroups.p04FingerprintCodes,
    ...contract.blockingCodeGroups.p04PairwiseCodes,
    ...contract.blockingCodeGroups.p04BreadthCodes,
  ];
  assert.equal(p04FromGroups.length, 20);
  assert.deepEqual(new Set(p04FromGroups), new Set(p04.blockingCodesReserved));

  assert.deepEqual(contract.p06InternalBlockingCodes, p06InternalCodes);
  assert.equal(p02.blockingCodesReserved.length, 12);
  assert.equal(p03.blockingCodesReserved.length, 19);
  assert.equal(p04.blockingCodesReserved.length, 20);
  assert.equal(contract.p06InternalBlockingCodes.length, 7);
});

test("GCTX-P06 recognizes exactly 58 unique blocking codes", () => {
  const allCodes = flattenGroups(contract.blockingCodeGroups);
  assert.equal(allCodes.length, 58);
  assert.equal(new Set(allCodes).size, 58);
  assert.equal(contract.recognizedBlockingCodeCount, 58);

  const expected = [
    ...p02.blockingCodesReserved,
    ...p03.blockingCodesReserved,
    ...p04.blockingCodesReserved,
    ...p06InternalCodes,
  ];
  assert.equal(expected.length, 58);
  assert.deepEqual(new Set(allCodes), new Set(expected));
});

test("GCTX-P06 assigns every blocking code to exactly one stage", () => {
  const stageAssignments = contract.stageDefinitions.flatMap((stage) => (
    resolveStageCodes(stage).map((code) => ({code, stageId: stage.stageId}))
  ));
  assert.equal(stageAssignments.length, 58);

  const owners = new Map();
  for (const assignment of stageAssignments) {
    const existing = owners.get(assignment.code) ?? [];
    existing.push(assignment.stageId);
    owners.set(assignment.code, existing);
  }

  assert.equal(owners.size, 58);
  for (const [code, stageIds] of owners) {
    assert.equal(stageIds.length, 1, `${code} has multiple stage owners`);
  }

  assert.deepEqual(
    owners.get("PBL_CHAIN_INCOMPLETE"),
    ["p02_chain_closure"],
  );
  assert.deepEqual(
    owners.get("GCTX_EVIDENCE_EXPIRED"),
    ["p03_evidence_admission"],
  );
  assert.deepEqual(
    owners.get("PBL_FINGERPRINT_CANONICALIZATION_FAILED"),
    ["p04_fingerprint_canonicalization"],
  );
  assert.deepEqual(
    owners.get("PBL_NEAR_DUPLICATE_CHAIN"),
    ["p04_pairwise_similarity"],
  );
  assert.deepEqual(
    owners.get("PBL_APPROVED_CHAIN_BREADTH_INSUFFICIENT"),
    ["p04_breadth_gate"],
  );
  assert.deepEqual(
    owners.get("GCTX_VALIDATOR_PRODUCTION_ELIGIBILITY_INCONSISTENT"),
    ["production_admission"],
  );
});

test("GCTX-P06 exposes exactly four warnings and warnings remain nonblocking", () => {
  assert.equal(contract.recognizedWarningCodeCount, 4);
  assert.deepEqual(
    contract.warningCodeDefinitions.map((definition) => definition.code),
    warningCodes,
  );
  assert.equal(new Set(warningCodes).size, 4);

  for (const definition of contract.warningCodeDefinitions) {
    assert.equal(definition.blocking, false);
    assert.equal(definition.productionEligibilityEffect, "none");
  }

  const stageWarnings = contract.stageDefinitions.flatMap((stage) => stage.warningCodes);
  assert.deepEqual(new Set(stageWarnings), new Set(warningCodes));
  assert.equal(contract.resultContract.warningMayChangeValid, false);
  assert.equal(contract.resultContract.warningMayChangeProductionEligible, false);
});

test("GCTX-P06 locks complete validation-request shape and version checks", () => {
  const required = [
    "validationRunId",
    "validationMode",
    "rulesetVersion",
    "fingerprintVersion",
    "candidateChainId",
    "unitCode",
    "sourceId",
    "p02ChainId",
    "p02ProjectionProfileIds",
    "p03EvidenceIds",
    "p04FingerprintId",
    "unitBreadthProfileId",
    "deterministicReplayKey",
    "inputDigest",
  ];
  assert.deepEqual(defs.validationRequest.required, required);
  assert.deepEqual(contract.requestContract.requiredFields, required);
  assert.equal(defs.validationRequest.additionalProperties, false);
  assert.equal(contract.requestContract.unknownFieldsAllowed, false);
  assert.equal(contract.requestContract.rulesetVersionMustEqual, "0.1.0");
  assert.equal(
    contract.requestContract.fingerprintVersionMustEqual,
    "pbl-semantic-fingerprint-v1",
  );
  assert.equal(contract.requestContract.inputDigestAlgorithm, "sha256");
  assert.equal(contract.requestContract.replayKeyRequired, true);
});

test("GCTX-P06 locks result shape, validity and production-eligibility formulas", () => {
  const required = [
    "validationRunId",
    "validatorContractVersion",
    "rulesetVersion",
    "fingerprintVersion",
    "deterministicReplayKey",
    "inputDigest",
    "outputDigest",
    "valid",
    "productionEligible",
    "stageResults",
    "blockingErrors",
    "warnings",
    "canonicalFingerprintHash",
    "pairwiseAssessmentIds",
    "breadthGateResultRef",
  ];
  assert.deepEqual(defs.validationResult.required, required);
  assert.deepEqual(contract.resultContract.requiredFields, required);
  assert.equal(defs.validationResult.properties.stageResults.minItems, 7);
  assert.equal(defs.validationResult.properties.stageResults.maxItems, 7);

  assert.equal(
    contract.resultContract.validFormula,
    "blockingErrors.length === 0 && stageResults.every(stage => stage.passed)",
  );
  assert.equal(
    contract.resultContract.productionEligibleFormula,
    "validationMode === 'production_gate' && valid === true && allUpstreamProductionGatesPass === true",
  );
  assert.equal(contract.resultContract.anyBlockingErrorForcesValidFalse, true);
  assert.equal(contract.resultContract.anyBlockingErrorForcesProductionEligibleFalse, true);
  assert.equal(contract.resultContract.nonProductionModeForcesProductionEligibleFalse, true);
  assert.equal(contract.resultContract.canonicalFingerprintHashRequiredWhenStage4Passes, true);
  assert.equal(contract.resultContract.canonicalFingerprintHashNullWhenStage4Fails, true);
  assert.equal(contract.resultContract.pairwiseAssessmentIdsRequiredWhenStage5Passes, true);
  assert.equal(contract.resultContract.breadthGateResultRequiredWhenStage6Passes, true);
});

test("GCTX-P06 locks stable issue ordering, deduplication and unknown-code failure", () => {
  assert.deepEqual(contract.issueContract.stableSortKeys, [
    "stageOrder",
    "code",
    "path",
    "entityId",
  ]);
  assert.equal(
    contract.issueContract.deduplicationIdentity,
    "stageId|code|path|entityId",
  );
  assert.equal(contract.issueContract.duplicateIssuesCollapsed, true);
  assert.equal(
    contract.issueContract.unknownCodeEmits,
    "GCTX_VALIDATOR_UNKNOWN_BLOCKING_CODE",
  );
  assert.ok(contract.p06InternalBlockingCodes.includes(
    "GCTX_VALIDATOR_UNKNOWN_BLOCKING_CODE",
  ));
  assert.equal(contract.deterministicPolicy.unknownBlockingCodePolicy, "block");
});

test("GCTX-P06 locks deterministic replay and digest behavior", () => {
  assert.equal(
    contract.replayContract.sameReplayKeyAndInputDigestMustProduceSameOutputDigest,
    true,
  );
  assert.equal(contract.replayContract.sameInputMayProduceDifferentIssueOrdering, false);
  assert.equal(contract.replayContract.sameInputMayProduceDifferentClassification, false);
  assert.equal(contract.replayContract.sameInputMayProduceDifferentProductionEligibility, false);
  assert.equal(contract.replayContract.digestIncludesValidatorContractVersion, true);
  assert.equal(contract.replayContract.digestIncludesRulesetVersion, true);
  assert.equal(contract.replayContract.digestIncludesFingerprintVersion, true);
  assert.equal(
    contract.replayContract.nonDeterministicOutputBlockingCode,
    "GCTX_VALIDATOR_NONDETERMINISTIC_OUTPUT",
  );
  assert.equal(contract.requestContract.inputDigestAlgorithm, "sha256");
  assert.equal(contract.resultContract.outputDigestAlgorithm, "sha256");
});

test("GCTX-P06 locks P05 fixture expectations for future implementation", () => {
  const corpus = GCTX_P05_REPRESENTATIVE_FIXTURE_CORPUS;
  assert.equal(corpus.positiveChains.length, contract.fixtureAcceptanceContract.positiveChainCount);
  assert.equal(corpus.pairwiseFixtures.length, contract.fixtureAcceptanceContract.pairwiseFixtureCount);
  assert.equal(
    corpus.breadthProfileFixtures.length,
    contract.fixtureAcceptanceContract.breadthProfileFixtureCount,
  );
  assert.deepEqual(
    corpus.pairwiseFixtures.map((fixture) => fixture.expectedWeightedScore),
    contract.fixtureAcceptanceContract.pairwiseExpectedScores,
  );
  assert.deepEqual(
    corpus.pairwiseFixtures.map((fixture) => fixture.expectedClassification),
    contract.fixtureAcceptanceContract.pairwiseExpectedClassifications,
  );
  assert.equal(
    corpus.breadthProfileFixtures.filter((fixture) => fixture.expectedProductionEligible).length,
    1,
  );
  assert.equal(
    corpus.breadthProfileFixtures.filter((fixture) => !fixture.expectedProductionEligible).length,
    contract.fixtureAcceptanceContract.negativeBreadthProfileCount,
  );
  assert.equal(contract.fixtureAcceptanceContract.positiveBreadthProfileMustPass, true);
  assert.equal(contract.fixtureAcceptanceContract.allNegativeBreadthProfilesMustFail, true);
  assert.equal(contract.fixtureAcceptanceContract.numericCapacitySubstitutionMustFail, true);
  assert.equal(contract.fixtureAcceptanceContract.fixtureOnlyRecordsMustRemainProductionIneligible, true);
});

test("GCTX-P06 forbids inconsistent production eligibility", () => {
  for (const [key, value] of Object.entries(contract.productionEligibilityConsistency)) {
    assert.equal(value, false, `${key} must remain false`);
  }
  assert.equal(contract.deterministicPolicy.warningMayOverrideBlockingError, false);
  assert.equal(contract.resultContract.anyBlockingErrorForcesProductionEligibleFalse, true);
  assert.equal(contract.resultContract.nonProductionModeForcesProductionEligibleFalse, true);
});

test("GCTX-P06 preserves P07/P08 and existing runtime boundaries", () => {
  assert.deepEqual(contract.deferredToP07, [
    "existingPatternSpecSemanticEligibilityAudit",
    "existingUnitCompatibilityMatrix",
    "approvedBindingReadinessAudit",
    "scenarioAndPblReadinessClassification",
  ]);
  assert.deepEqual(contract.deferredToP08, [
    "validatorImplementation",
    "fingerprintCanonicalizerImplementation",
    "weightedSimilarityCalculatorImplementation",
    "breadthGateValidatorImplementation",
    "productionAdmissionResolverImplementation",
  ]);
  assert.equal(contract.compatibilityContract.p02ClosureAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p03EvidenceAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p04FingerprintAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.p05FixtureAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingPatternSpecAuthorityUnchanged, true);
  assert.equal(contract.compatibilityContract.existingUnitRuntimeUnchanged, true);
  assert.equal(contract.compatibilityContract.g5aU02FilesMayBeModified, false);
  assert.equal(
    contract.nextTask,
    "GCTX-P07_ExistingPatternSpecSemanticEligibilityAudit",
  );
});
