import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

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
    ...rules,
    answerModelSchemas: answers.answerModelSchemas,
    controlledTemplateFamilies: templates.controlledTemplateFamilies,
    patternGroups: groups.patternGroups,
    validatorContract: validator.validatorContract,
    patternSpecs: specBundles
      .flatMap((bundle) => bundle.patternSpecs)
      .sort((a, b) => a.patternOrder - b.patternOrder),
  };
}

const factorSet = (n) =>
  Array.from({ length: n }, (_, index) => index + 1).filter((d) => n % d === 0);

function factorPairs(n) {
  const pairs = [];
  for (let a = 1; a <= Math.floor(Math.sqrt(n)); a += 1) {
    if (n % a === 0) pairs.push([a, n / a]);
  }
  return pairs;
}

function digitCodeSolutions() {
  const divides = (n, d) => d > 0 && n % d === 0;
  const values = [];
  for (let x1 = 0; x1 <= 9; x1 += 1)
    for (let x2 = 0; x2 <= 9; x2 += 1)
      for (let x3 = 0; x3 <= 9; x3 += 1)
        for (let x4 = 0; x4 <= 9; x4 += 1) {
          if (!(x1 > 0 && x2 > 0 && x4 > 0)) continue;
          if (![22, 33, 45, 60].every((n) => divides(n, x1))) continue;
          if (!(divides(6, x3) && divides(8, x3) && x3 !== x1)) continue;
          if (!(divides(70, x2) && divides(70, x4))) continue;
          const value = 1000 * x1 + 100 * x2 + 10 * x3 + x4;
          if (value % 3 || value % 5) continue;
          if (new Set([x1, x2, x3, x4]).size !== 4) continue;
          values.push([x1, x2, x3, x4]);
        }
  return values;
}

test("S82 bundle projects all 22 S81 mappings one-to-one", async () => {
  const [s80, s81, s82] = await Promise.all([
    load("data/curriculum/mapping/g5a_u02_formal_mapping_candidates.json"),
    load("data/curriculum/mapping/g5a_u02_formal_mapping_candidate_qa.json"),
    loadS82(),
  ]);
  assert.equal(s82.schemaName, "G5AU02PatternSpecContractDesign");
  assert.equal(s81.status, "qa_passed_ci_synced_and_merged");
  assert.equal(s82.patternSpecs.length, 22);
  const byMapping = new Map(s82.patternSpecs.map((row) => [row.sourceMappingCandidateId, row]));
  assert.deepEqual([...byMapping.keys()].sort(), [...s81.acceptedMappingCandidateIds].sort());
  for (const mapping of s80.formalMappingCandidates) {
    const spec = byMapping.get(mapping.id);
    assert.equal(spec.patternSpecId, mapping.ps);
    assert.equal(spec.knowledgePointId, mapping.kp);
    assert.equal(spec.patternGroupId, mapping.pg.replace(/^pgc_/, "pg_"));
    assert.equal(spec.answerModel, mapping.answer);
    assert.equal(spec.implementationClass, mapping.class);
    assert.deepEqual(spec.sourceEvidence, mapping.evidence);
  }
});

test("S82 freezes cardinality, order and hidden lifecycle", async () => {
  const s82 = await loadS82();
  assert.deepEqual(s82.cardinality, {
    knowledgePointCount: 18,
    patternGroupCount: 18,
    patternSpecContractCount: 22,
    answerModelSchemaCount: 16,
    controlledTemplateFamilyCount: 8,
    implementationClassCCount: 14,
    implementationClassDCount: 8,
    qaOverlayApplicationCount: 5,
  });
  assert.equal(s82.patternGroups.length, 18);
  assert.equal(Object.keys(s82.answerModelSchemas).length, 16);
  assert.deepEqual(s82.patternSpecs.map((row) => row.patternOrder),
    Array.from({ length: 22 }, (_, index) => index + 1));
  assert.deepEqual(
    s82.patternGroups.flatMap((row) => row.patternSpecIds).sort(),
    s82.patternSpecs.map((row) => row.patternSpecId).sort(),
  );
  for (const spec of s82.patternSpecs) {
    for (const field of s82.requiredPatternSpecFields)
      assert.ok(Object.hasOwn(spec, field), `${spec.patternSpecId}: ${field}`);
    assert.deepEqual(spec.lifecycle, s82.fixedLifecycle);
    assert.equal(spec.generationContract.freeFormAI, "forbidden");
    assert.equal(spec.generationContract.genericFallback, "forbidden");
    assert.equal(spec.answerSchemaRef, `#/answerModelSchemas/${spec.answerModel}`);
  }
});

test("S82 applies the five S81 overlays with higher precedence", async () => {
  const s82 = await loadS82();
  assert.equal(s82.authorityPrecedence.uncorrectedS80ConsumptionAllowed, false);
  const overlays = new Map(s82.qaOverlayApplications.map((row) => [row.correctionCode, row]));
  assert.equal(overlays.size, 5);
  assert.equal(s82.patternSpecs.filter((row) => row.qaOverlayRefs.length).length, 5);
  for (const spec of s82.patternSpecs)
    for (const ref of spec.qaOverlayRefs)
      assert.equal(overlays.get(ref).targetPatternSpecId, spec.patternSpecId);
  assert.match(s82.formalRules.factorPairs, /floor\(sqrt\(n\)\)/);
  assert.match(s82.formalRules.factorCountParity, /perfect square/);
  assert.match(s82.formalRules.remainderTransfer, /0<=r<D/);
  assert.match(s82.formalRules.digitCodeSolutions, /x2 divides 70/);
});

test("S82 deterministic rules reproduce source vectors", async () => {
  assert.deepEqual(factorSet(56), [1, 2, 4, 7, 8, 14, 28, 56]);
  assert.deepEqual(factorPairs(56), [[1, 56], [2, 28], [4, 14], [7, 8]]);
  assert.deepEqual(factorPairs(36), [[1, 36], [2, 18], [3, 12], [4, 9], [6, 6]]);
  assert.deepEqual(factorSet(72).filter((d) => 90 % d === 0), [1, 2, 3, 6, 9, 18]);
  assert.deepEqual(factorSet(60).filter((d) => d >= 10 && d <= 16), [10, 12, 15]);
  assert.equal((3 * 24 + 21) % 8, 5);
  const sides = factorSet(36).filter((d) => 28 % d === 0);
  assert.deepEqual(sides, [1, 2, 4]);
  assert.deepEqual(sides.map((side) => side ** 2), [1, 4, 16]);
  assert.deepEqual(digitCodeSolutions(), [[1, 7, 2, 5]]);
});

test("S82 separates false factor converse and parity theorems", () => {
  assert.ok(factorSet(12).includes(2) && factorSet(12).includes(3));
  assert.notEqual(2 * 3, 12);
  assert.equal(factorSet(18).includes(2), true);
  assert.equal(factorSet(25).includes(2), false);
  assert.equal(factorSet(25).length % 2, 1);
});

test("S82 Class D contracts use exactly eight controlled templates", async () => {
  const s82 = await loadS82();
  const templates = new Map(s82.controlledTemplateFamilies.map((row) => [row.templateFamilyId, row]));
  const classD = s82.patternSpecs.filter((row) => row.implementationClass === "D");
  assert.equal(templates.size, 8);
  assert.equal(classD.length, 8);
  for (const template of templates.values()) {
    const placeholders = [...new Set(
      [...template.promptSkeletonZh.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((match) => match[1]),
    )].sort();
    assert.deepEqual(placeholders, [...template.requiredRoles].sort());
  }
  for (const spec of classD) {
    assert.equal(spec.generationContract.controlledTemplateRequired, true);
    for (const ref of spec.promptContract.templateFamilyRefs)
      assert.equal(templates.get(ref).mappingId, spec.sourceMappingCandidateId);
  }
});

test("S82 validator design is staged, blocking and fallback-free", async () => {
  const { validatorContract: validator } = await loadS82();
  assert.equal(validator.validationMode, "blocking_before_question_return");
  assert.deepEqual(validator.stages.map((row) => row.stage), [1,2,3,4,5,6,7,8,9]);
  assert.equal(validator.blockingCodeCount, 64);
  assert.equal(new Set(validator.blockingCodes).size, 64);
  for (const code of [
    "G5AU02_FACTOR_RELATION_FALSE_BICONDITIONAL",
    "G5AU02_FACTOR_PAIR_STOP_RULE_INVALID",
    "G5AU02_PARITY_THEOREMS_CONFLATED",
    "G5AU02_REMAINDER_WITNESS_INVALID",
    "G5AU02_DIGIT_LCM_SUBSTITUTION_FORBIDDEN",
    "G5AU02_QA_OVERLAY_NOT_APPLIED",
  ]) assert.ok(validator.blockingCodes.includes(code));
  assert.equal(validator.resultContract.fallbackQuestionAllowed, false);
  assert.equal(validator.resultContract.blockingFailureReturnsQuestion, false);
});

test("S82 remains non-materialized and hands off only to S83", async () => {
  const s82 = await loadS82();
  assert.deepEqual(s82.scopeBoundary, {
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
  assert.equal(s82.sourceIdentityBoundary.publicCatalogPromotionRequiresMetadataCorrection, true);
  assert.equal(s82.handoff.nextTask, "S83_G5A_U02_PatternSpecContractQA");
  assert.equal(s82.handoff.materializationAllowedByS82, false);
});
