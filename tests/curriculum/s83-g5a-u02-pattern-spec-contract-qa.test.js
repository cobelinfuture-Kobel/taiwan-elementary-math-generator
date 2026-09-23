import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  clone,
  digitCodeSolutions,
  effectiveHooks,
  factorPairs,
  factorSet,
  qaErrors,
  templateRoleBlocks,
} from "./helpers/s83-g5a-u02-qa-fixture.js";
import { mutations } from "./helpers/s83-g5a-u02-mutations.js";

const url = (path) => new URL(`../../${path}`, import.meta.url);
const load = async (path) => JSON.parse(await readFile(url(path), "utf8"));

async function loadS82() {
  const index = await load("data/curriculum/contracts/S82_G5A_U02_PatternSpecContractDesign.json");
  const [rules, answers, templates, groups, validator, ...specBundles] = await Promise.all([
    load(index.artifacts.rules),
    load(index.artifacts.answerSchemas),
    load(index.artifacts.templates),
    load(index.artifacts.patternGroups),
    load(index.artifacts.validator),
    ...index.artifacts.patternSpecs.map(load),
  ]);
  return {
    ...index,
    answerModelSchemas: answers.answerModelSchemas,
    controlledTemplateFamilies: templates.controlledTemplateFamilies,
    patternGroups: groups.patternGroups,
    validatorContract: validator.validatorContract,
    patternSpecs: specBundles.flatMap((bundle) => bundle.patternSpecs).sort((a, b) => a.patternOrder - b.patternOrder),
  };
}

async function loadS83() {
  const index = await load("data/curriculum/contracts/S83_G5A_U02_PatternSpecContractQA.json");
  const [answers, templates, semantic, validator] = await Promise.all([
    load(index.artifacts.answerSchemaOverlay),
    load(index.artifacts.templateSemanticOverlay),
    load(index.artifacts.semanticGrammarOverlay),
    load(index.artifacts.validatorCoverageOverlay),
  ]);
  return {
    ...index,
    effectiveContractOverlay: {
      consumptionRule: validator.consumptionRule,
      answerSchemaPolicy: answers.answerSchemaPolicy,
      controlledTemplateOverrides: templates.controlledTemplateOverrides,
      problemTypeDecisionTable: semantic.problemTypeDecisionTable,
      closedStatementGrammar: semantic.closedStatementGrammar,
      requiredHookAugmentations: semantic.requiredHookAugmentations,
      validatorCoverageByStage: validator.validatorCoverageByStage,
    },
    mutationRequirements: validator.mutationRequirements,
  };
}

function placeholders(prompt) {
  return [...new Set([...prompt.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]))].sort();
}

test("S83 reviews and accepts all 22 S82 PatternSpec contracts with six blocking corrections", async () => {
  const [s82, s83] = await Promise.all([loadS82(), loadS83()]);
  assert.equal(s83.schemaName, "G5AU02PatternSpecContractQA");
  assert.equal(s83.task, "S83_G5A_U02_PatternSpecContractQA");
  assert.deepEqual(s83.summary, {
    patternSpecContractsReviewed: 22,
    patternSpecContractsAccepted: 22,
    patternSpecContractsRejected: 0,
    patternGroupsReviewed: 18,
    answerModelSchemasReviewed: 16,
    controlledTemplateFamiliesReviewed: 8,
    validatorStagesReviewed: 9,
    blockingCodesReviewed: 64,
    qaCorrectionsApplied: 6,
    mutationCaseCount: 36,
  });
  assert.equal(s83.corrections.length, 6);
  const errors = qaErrors(s82, s83);
  assert.deepEqual(errors, [], errors.join(","));
});

test("S83 closes all 16 answer schemas and conditions the factor quotient witness", async () => {
  const [s82, s83] = await Promise.all([loadS82(), loadS83()]);
  const policy = s83.effectiveContractOverlay.answerSchemaPolicy;
  assert.deepEqual(Object.keys(policy.closedSchemas).sort(), Object.keys(s82.answerModelSchemas).sort());
  for (const schema of Object.values(policy.closedSchemas)) {
    assert.equal(schema.type, "object");
    assert.equal(schema.additionalProperties, false);
    for (const field of schema.required) assert.ok(Object.hasOwn(schema.properties, field));
  }
  const relation = policy.closedSchemas.relationClassificationAnswer;
  assert.match(relation.conditionalWitness.whenTrue, /candidateDivisor\*quotient===target/);
  assert.match(relation.conditionalWitness.whenFalse, /quotient===null/);
});

test("S83 role-binds eight templates and closes both equal-partition answer roles", async () => {
  const s83 = await loadS83();
  const templates = s83.effectiveContractOverlay.controlledTemplateOverrides;
  assert.equal(templates.length, 8);
  for (const template of templates) {
    for (const block of templateRoleBlocks(template)) {
      assert.deepEqual(placeholders(block.promptSkeletonZh), [...block.requiredRoles].sort());
      assert.deepEqual(Object.keys(block.roleBindings).sort(), [...block.requiredRoles].sort());
    }
  }
  const partition = templates.find((row) => row.templateFamilyId === "tpl_g5a_u02_equal_partition_segments");
  assert.deepEqual(partition.controlledVariants.map((row) => row.variantId), ["segment_count", "per_segment_quantity"]);
  assert.equal(partition.controlledVariants[0].answerUnitPolicy.fixed, "段");
  assert.equal(partition.controlledVariants[1].answerUnitPolicy.fromContext, "itemUnit");
});

test("S83 locks application semantics, geometry units and source password predicates", async () => {
  const s83 = await loadS83();
  const byId = new Map(s83.effectiveContractOverlay.controlledTemplateOverrides.map((row) => [row.templateFamilyId, row]));
  for (const id of ["tpl_g5a_u02_maximum_equal_grouping", "tpl_g5a_u02_possible_equal_packaging"]) assert.equal(byId.get(id).crossCategoryEqualityRequired, false);
  assert.deepEqual(byId.get("tpl_g5a_u02_square_tile_areas").answerUnitPolicy.derivedMap, {"公分": "平方公分", "公尺": "平方公尺"});
  assert.equal(byId.get("tpl_g5a_u02_source_password").arbitraryRuleParaphraseForbidden, true);
  assert.deepEqual(digitCodeSolutions(), [[1, 7, 2, 5]]);
});

test("S83 uses a finite mutually-exclusive problem-type table and closed statement grammar", async () => {
  const s83 = await loadS83();
  const overlay = s83.effectiveContractOverlay;
  assert.deepEqual(overlay.problemTypeDecisionTable.labels, ["factor", "multiple", "common_factor", "common_multiple"]);
  assert.equal(overlay.problemTypeDecisionTable.mutuallyExclusive, true);
  assert.equal(overlay.problemTypeDecisionTable.freeFormClassificationForbidden, true);
  assert.equal(overlay.closedStatementGrammar.targetParityAndFactorCountParitySeparated, true);
  assert.equal(overlay.closedStatementGrammar.booleanVectorLengthEqualsStatementCount, true);
});

test("S83 covers all 64 blocking codes exactly once and all effective hooks", async () => {
  const [s82, s83] = await Promise.all([loadS82(), loadS83()]);
  const overlay = s83.effectiveContractOverlay;
  const stages = overlay.validatorCoverageByStage;
  assert.deepEqual(stages.map((row) => row.stage), [1,2,3,4,5,6,7,8,9]);
  const codes = stages.flatMap((row) => row.blockingCodes);
  assert.equal(codes.length, 64);
  assert.equal(new Set(codes).size, 64);
  assert.deepEqual([...codes].sort(), [...s82.validatorContract.blockingCodes].sort());
  const hooks = new Set(stages.flatMap((row) => row.hooks));
  for (const spec of s82.patternSpecs) for (const hook of effectiveHooks(spec, overlay)) assert.ok(hooks.has(hook), `${spec.patternSpecId}: ${hook}`);
  for (const spec of s82.patternSpecs.filter((row) => row.qaOverlayRefs.length > 0)) assert.ok(overlay.requiredHookAugmentations[spec.patternSpecId].includes("validateG5AU02S81Overlay"), spec.patternSpecId);
});

test("S83 source vectors remain deterministic across factor, common-factor, remainder and geometry rules", () => {
  assert.deepEqual(factorSet(56), [1,2,4,7,8,14,28,56]);
  assert.deepEqual(factorPairs(56), [[1,56],[2,28],[4,14],[7,8]]);
  assert.deepEqual(factorPairs(36), [[1,36],[2,18],[3,12],[4,9],[6,6]]);
  assert.deepEqual(factorSet(72).filter((d) => 90 % d === 0), [1,2,3,6,9,18]);
  assert.equal(Math.max(...factorSet(27).filter((d) => 18 % d === 0)), 9);
  assert.deepEqual(factorSet(60).filter((d) => d >= 10 && d <= 16), [10,12,15]);
  assert.equal((3 * 24 + 21) % 8, 5);
  const sides = factorSet(36).filter((d) => 28 % d === 0);
  assert.deepEqual(sides, [1,2,4]);
  assert.deepEqual(sides.map((side) => side ** 2), [1,4,16]);
});

test("S83 rejects all 36 required contract mutations", async () => {
  const [s82, source] = await Promise.all([loadS82(), loadS83()]);
  assert.deepEqual(Object.keys(mutations).sort(), source.mutationRequirements.map((row) => row.caseId).sort());
  for (const requirement of source.mutationRequirements) {
    const mutated = clone(source);
    mutations[requirement.caseId](mutated);
    assert.ok(qaErrors(s82, mutated).length > 0, requirement.caseId);
  }
});

test("S83 remains a non-materializing QA overlay and hands off only to S84", async () => {
  const s83 = await loadS83();
  assert.deepEqual(s83.scopeBoundary, {
    sourceMetadataMutated: false,
    formalMappingMaterialized: false,
    patternGroupsMaterialized: false,
    patternSpecsMaterialized: false,
    generatorImplemented: false,
    validatorImplemented: false,
    publicSelectorEnabled: false,
    canonicalRoutingEnabled: false,
    productionUse: "forbidden",
  });
  assert.equal(s83.handoff.nextTask, "S84_G5A_U02_FormalMappingAndHiddenPatternSpecMaterialization");
  assert.equal(s83.handoff.materializationAllowedByS83, false);
});
