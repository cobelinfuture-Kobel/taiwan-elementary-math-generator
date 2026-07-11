import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const registryPath = "data/curriculum/templates/S58_G3B_U08_SemanticTemplateFamilies.json";
const freezePath = "data/curriculum/contracts/S58A1_G3B_U08_24FamilyHumanReadbackFreeze.json";

const registryRaw = readFileSync(registryPath);
const registry = JSON.parse(registryRaw.toString("utf8"));
const freeze = JSON.parse(readFileSync(freezePath, "utf8"));

function gitBlobSha(buffer) {
  const header = Buffer.from(`blob ${buffer.length}\0`, "utf8");
  return createHash("sha1").update(header).update(buffer).digest("hex");
}

test("S58A1 freezes the exact reviewed 24-family registry", () => {
  assert.equal(freeze.status, "accepted_family_contract_frozen_for_patternspecific_design");
  assert.equal(gitBlobSha(registryRaw), freeze.registryGitBlobSha);
  assert.equal(registry.templateFamilies.length, 24);
  assert.equal(freeze.acceptedFamilyCount, 24);
  assert.equal(freeze.rejectedFamilyCount, 0);
  assert.equal(freeze.mergedFamilyCount, 0);
});

test("S58A1 records four accepted families for each of the six public KPs", () => {
  assert.equal(freeze.knowledgePointReadback.length, 6);
  assert.equal(
    freeze.knowledgePointReadback.reduce((sum, entry) => sum + entry.acceptedFamilyCount, 0),
    24
  );
  for (const entry of freeze.knowledgePointReadback) {
    assert.equal(entry.acceptedFamilyCount, 4, entry.knowledgePointId);
    assert.equal(entry.familyLabelsZh.length, 4, entry.knowledgePointId);
    assert.match(entry.decision, /^accepted_/);
  }
});

test("S58A1 keeps the approved horizontal-only and prior-Batch-A boundary", () => {
  assert.equal(freeze.humanReadbackPolicy.representation, "horizontal_only");
  assert.equal(freeze.humanReadbackPolicy.publicPureNumericPracticeAllowed, false);
  assert.equal(freeze.humanReadbackPolicy.generalTwoStepMixedOperationAllowed, false);
  assert.equal(freeze.humanReadbackPolicy.freeFormAIGenerationAllowed, false);
  assert.deepEqual(freeze.acceptedScope, {
    directSourceFamilyCount: 13,
    controlledStructuralExtensionFamilyCount: 11,
    verticalFamilyCount: 0,
    generalTwoStepFamilyCount: 0,
    publicRemainderApplicationFamilyCount: 0,
    twoDigitMultiplierComputationFamilyCount: 0,
    twoDigitDivisorComputationFamilyCount: 0
  });
});

test("S58A1 FullFix directives target reviewed families and critical semantic guards", () => {
  const familyIds = new Set(registry.templateFamilies.map((entry) => entry.templateFamilyId));
  const familyDirectives = freeze.fullFixDirectives.filter((entry) => entry.templateFamilyId);
  for (const directive of familyDirectives) {
    assert.ok(familyIds.has(directive.templateFamilyId), directive.templateFamilyId);
    assert.ok(directive.blockingRule);
  }

  const rules = new Set(freeze.fullFixDirectives.map((entry) => entry.blockingRule));
  assert.ok(rules.has("SEGMENT_LENGTH_WORDING_NATURAL"));
  assert.ok(rules.has("SUCCESS_EVENT_PHRASE_NATURAL"));
  assert.ok(rules.has("SUCCESS_EVENT_CLASSIFIER_MATCH"));
  assert.ok(rules.has("SAME_PRICE_COMPARISON_UNIQUE_AND_COMPARABLE"));
});

test("S58A1 freeze is the only next authority before S58B design", () => {
  assert.equal(
    freeze.nextGate,
    "S58B_G3B_U08_FormalMappingPatternSpecAndSemanticValidatorDesignScan"
  );
});
