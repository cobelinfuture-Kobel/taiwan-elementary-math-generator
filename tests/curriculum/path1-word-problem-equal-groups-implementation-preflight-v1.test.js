import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const readText = (path) => fs.readFileSync(path, "utf8");

const PREFLIGHT_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_EQUAL_GROUPS_IMPLEMENTATION_PREFLIGHT_V1.json";
const TRANSFER_PATH = "data/curriculum/application/contracts/PATH1_WORD_PROBLEM_EQUAL_GROUPS_TRANSFER_CONTRACT_V1.json";
const A05_PATH = "data/curriculum/application/contracts/APP-SOP-A05_ValidatorCIGatesAndG3BU01PilotFixtures.json";
const APP_BINDINGS_PATH = "data/curriculum/application/registry/application-context-bindings.json";
const APP_ADMISSIONS_PATH = "data/curriculum/application/registry/application-admission-registry.json";
const A05_VALIDATOR_PATH = "src/curriculum/application/application-sop-validator.mjs";
const KNOWLEDGE_PATH = "data/curriculum/knowledge/units/g3b_u08_3b08.knowledge-operation.json";
const PATTERN_PATH = "data/curriculum/pattern_specs/S58C_G3B_U08_SemanticPatternSpecRegistry.json";
const PROMOTION_PATH = "data/curriculum/registry/promotions/S58F_G3B_U08_SemanticPromotionRegistry.json";
const PATH1_BINDING_PATH = "site/modules/curriculum/learning-paths/path1-public-worksheet-binding.js";

const preflight = readJson(PREFLIGHT_PATH);
const transfer = readJson(TRANSFER_PATH);
const a05 = readJson(A05_PATH);
const appBindings = readJson(APP_BINDINGS_PATH);
const appAdmissions = readJson(APP_ADMISSIONS_PATH);
const knowledge = readJson(KNOWLEDGE_PATH);
const patterns = readJson(PATTERN_PATH);
const promotion = readJson(PROMOTION_PATH);
const a05Validator = readText(A05_VALIDATOR_PATH);
const path1Binding = readText(PATH1_BINDING_PATH);

const allowedSurfaces = [
  "ps_g3b_u08_total_daily_saving_accumulation",
  "ps_g3b_u08_total_score_per_success",
  "ps_g3b_u08_total_material_per_product",
  "ps_g3b_u08_total_items_per_package",
];

test("preflight stays planning-only and bounded to P1-01/P1-02", () => {
  assert.equal(preflight.status, "IMPLEMENTATION_PREFLIGHT_LOCKED_NO_RUNTIME");
  assert.equal(preflight.implementationAllowed, false);
  assert.equal(preflight.runtimeChanged, false);
  assert.equal(preflight.publicCutoverAllowed, false);
  assert.deepEqual(preflight.scope.includedPathBlocks, ["P1-01", "P1-02"]);
  assert.deepEqual(preflight.scope.excludedPathBlocks, ["P1-03", "P1-04"]);
  assert.equal(preflight.newCanonicalKnowledgePointMinted, false);
});

test("preflight preserves the merged transfer contract semantic boundary", () => {
  assert.equal(transfer.relationContract.relationKnowledgePointId, "kp_g3b_u08_total_from_groups");
  assert.deepEqual(transfer.relationContract.allowedUnknownRoles, ["totalAmount"]);
  assert.equal(transfer.arithmeticToRelationRoleBinding.multiplicand, "amountPerGroup");
  assert.equal(transfer.arithmeticToRelationRoleBinding.oneDigitMultiplier, "groupCount");
  assert.equal(transfer.arithmeticToRelationRoleBinding.commutativeArithmeticRoleSwapAllowed, false);
  assert.equal(preflight.scope.includedRelationKnowledgePointId, transfer.relationContract.relationKnowledgePointId);
  assert.equal(preflight.scope.includedUnknownRole, "totalAmount");
});

test("A05 global application registry is shadow-only and must not become the Path1 production dependency", () => {
  assert.equal(a05.result.productionRuntimeIntegrated, false);
  assert.equal(a05.result.productionAdmissionChanged, false);
  assert.equal(a05.scope.productionAdmissionAllowed, false);
  assert.match(appBindings.status, /SHADOW_PILOT_NO_PRODUCTION_ADMISSIONS/);
  assert.match(appAdmissions.status, /SHADOW_PILOT_NO_PRODUCTION_ADMISSIONS/);
  assert.equal(appAdmissions.admissionRecords.some((row) => row.productionAdmissionAllowed === true), false);
  assert.match(a05Validator, /APP_A05_PRODUCTION_BINDING_FORBIDDEN/);
  assert.match(a05Validator, /APP_A05_PRODUCTION_ADMISSION_FORBIDDEN/);
  assert.equal(preflight.architectureDecision.doNotUseAsProductionDependency, "A05_GLOBAL_APPLICATION_CONTEXT_BINDING_REGISTRY");
  assert.equal(preflight.architectureDecision.globalApplicationRegistryMutationPlanned, false);
});

test("selected semantic surfaces are exactly the production-promoted G3B-U08 equal-groups surfaces", () => {
  const group = patterns.patternGroups.find((row) => row.patternGroupId === "pg_g3b_u08_total_from_groups");
  assert.ok(group);
  assert.deepEqual(group.patternSpecIds, allowedSurfaces);
  assert.deepEqual(preflight.semanticSurfaceAdmission.allowedPatternSpecIds, allowedSurfaces);
  for (const id of allowedSurfaces) {
    assert.ok(promotion.patternSpecIds.includes(id), `${id} must remain promoted`);
    const spec = patterns.patternSpecs.find((row) => row.patternSpecId === id);
    assert.ok(spec);
    assert.equal(spec.knowledgePointId, "kp_g3b_u08_total_from_groups");
    assert.equal(spec.patternGroupId, "pg_g3b_u08_total_from_groups");
    assert.equal(spec.equationShape, "a*b");
    assert.equal(spec.answerModel.shape, "semantic_single_integer_with_unit");
  }
  assert.equal(promotion.lifecycle.runtimeStatus, "production_routed");
  assert.equal(promotion.lifecycle.worksheetStatus, "production_eligible");
  assert.equal(promotion.lifecycle.productionUse, "allowed");
  assert.equal(promotion.activation.humanSemanticReadbackAccepted, true);
  assert.equal(promotion.activation.publicSelectorAndPrintQaAccepted, true);
});

test("equal-groups KnowledgeOperation authority matches the bridge relation and numeric ceiling", () => {
  const kp = knowledge.knowledgePoints.find((row) => row.knowledgePointId === "kp_g3b_u08_total_from_groups");
  assert.ok(kp);
  const op = kp.operationModels.find((row) => row.modelId === "op_g3b_u08_total_from_groups");
  assert.ok(op);
  assert.deepEqual(op.unknownRoles, ["totalAmount"]);
  assert.ok(op.canonicalExpressions.includes("totalAmount = amountPerGroup * groupCount"));
  assert.ok(op.numberConstraints.includes("groupCount is a positive one-digit integer"));
  assert.ok(op.numberConstraints.includes("totalAmount <= 999"));
  assert.equal(preflight.semanticSurfaceAdmission.relationOperationModelId, op.modelId);
});

test("dual lineage and additive worksheet practiceMode are locked", () => {
  assert.equal(preflight.dualLineageContract.arithmeticSourceId, "g3a_u03_3a03");
  assert.equal(preflight.dualLineageContract.semanticSourceId, "g3b_u08_3b08");
  assert.equal(preflight.futureWorksheetContract.newOption.name, "practiceMode");
  assert.equal(preflight.futureWorksheetContract.newOption.default, "arithmetic");
  assert.equal(preflight.futureWorksheetContract.newOption.transferValue, "equalGroupsTransfer");
  assert.deepEqual(preflight.futureWorksheetContract.supportedTransferBlocks, ["P1-01", "P1-02"]);
  assert.equal(preflight.futureWorksheetContract.defaultArithmeticBehaviorMustRemainUnchanged, true);
  assert.equal(preflight.futureWorksheetContract.path1PublicWorksheetBindingModificationRequired, false);
  assert.equal(preflight.futureWorksheetContract.visibleUiControlInThisVerticalSlice, false);
  assert.match(path1Binding, /block\("P1-01"/);
  assert.match(path1Binding, /block\("P1-02"/);
});

test("future generator and validator stay isolated from G3B-U08 runtime and P1-03/P1-04", () => {
  assert.equal(preflight.futureGeneratorContract.mustNotModifyG3BU08Generator, true);
  assert.equal(preflight.futureGeneratorContract.mustNotCallHiddenGeneratorForOperandSampling, true);
  assert.equal(preflight.futureValidatorContract.failClosed, true);
  assert.equal(preflight.implementationBoundary.applicationRegistryMutationAllowed, false);
  assert.equal(preflight.implementationBoundary.productionUiCutoverAllowed, false);
  for (const forbidden of preflight.implementationBoundary.runtimeFilesForbidden) {
    assert.ok(!preflight.implementationBoundary.futureRuntimeFilesAllowed.includes(forbidden));
  }
  assert.ok(preflight.implementationBoundary.runtimeFilesForbidden.some((path) => path.includes("g3b-u08-semantic-generator.js")));
  assert.ok(preflight.implementationBoundary.runtimeFilesForbidden.some((path) => path.includes("path1-public-worksheet-binding.js")));
});

test("focused implementation acceptance is bounded and explicitly excludes full/global validation", () => {
  assert.equal(preflight.futureGeneratorContract.capacityTargets["P1-01"], 120);
  assert.equal(preflight.futureGeneratorContract.capacityTargets["P1-02"], 120);
  assert.ok(preflight.focusedImplementationAcceptance.node.some((entry) => entry.includes("1/20/120")));
  assert.equal(preflight.focusedImplementationAcceptance.fullRegressionRequired, false);
  assert.equal(preflight.focusedImplementationAcceptance.globalReplayRequired, false);
  assert.equal(preflight.distance.nextShortestStep, "PATH1_WORD_PROBLEM_EQUAL_GROUPS_IMPLEMENTATION_V1");
});
