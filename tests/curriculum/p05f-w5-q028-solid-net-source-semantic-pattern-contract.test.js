import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP05EW5DirectProductVerticalSliceQueue } from "../../src/curriculum/full-product/p05e-w5-direct-product-vertical-slice-queue.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
const contract = readJson("data/curriculum/full-product/p05f/q028-g5a-u10a-solid-net-source-semantic-pattern-contract.json");
const integration = readJson("data/curriculum/full-product/p05f/q028-g5a-u10a-solid-net-current-integration-path-resolution.json");
const r02 = readJson("data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-03.json");

const KP = "kp_g5a_u10a_solid_net_correspondence";
const SOURCE = "g5a_u10_5a10a";
const EXACT_CAPS = [
  "cap_geometry_construction",
  "cap_geometry_domain_validator",
  "cap_geometry_property_reasoning",
  "cap_solid_geometry_representation",
  "cap_spatial_solid_reasoning",
];

function findR02Candidate() {
  const source = r02.sourceRecords.find((record) => record.sourceNodeId === SOURCE);
  assert.ok(source, "R02 source g5a_u10_5a10a must exist");
  const candidate = source.candidates.find((item) => item.knowledgePointId === KP);
  assert.ok(candidate, "R02 Q028 candidate must exist");
  return { source, candidate };
}

test("Q028 source semantic contract is bound to exact frozen row and exact W5 closure", () => {
  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const q028 = queue.queueEntries.find((entry) => entry.queuePosition === 28);
  assert.ok(q028);
  assert.equal(q028.sliceId, "p05e_q028_r2_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(q028.primarySourceNodeId, SOURCE);
  assert.deepEqual(q028.knowledgePointIds, [KP]);
  assert.deepEqual([...q028.requiredW5CapabilityIds].sort(), [...EXACT_CAPS].sort());
  assert.deepEqual([...contract.queueAuthority.requiredW5CapabilityIds].sort(), [...EXACT_CAPS].sort());
});

test("Q028 contract copies the reviewed R02 semantic authority exactly", () => {
  const { source, candidate } = findR02Candidate();
  assert.equal(source.sourcePdfTitle, "meow911_5a10a_source.pdf");
  assert.deepEqual(source.reviewedPages, [1, 2]);
  assert.equal(candidate.canonicalNameZh, "立體與展開圖對應");
  assert.equal(candidate.capabilityStatement, "學生能判斷展開圖是否能摺成立體。");
  assert.equal(candidate.reasoningInvariant, "相鄰面與邊的連接關係在摺疊前後必須一致。");
  assert.equal(contract.r02ReviewedCandidateAuthority.canonicalNameZh, candidate.canonicalNameZh);
  assert.equal(contract.r02ReviewedCandidateAuthority.capabilityStatement, candidate.capabilityStatement);
  assert.equal(contract.r02ReviewedCandidateAuthority.reasoningInvariant, candidate.reasoningInvariant);
});

test("Q028 direct visual evidence admits source-shown prism pyramid cylinder cone families but defers cube cuboid to Q029", () => {
  const page1 = contract.sourceAuthority.directVisualEvidence.page1;
  const page2 = contract.sourceAuthority.directVisualEvidence.page2;
  assert.equal(page1.panelTitle, "角柱、角錐的展開圖");
  assert.ok(page1.observedNetLabels.includes("正方體"));
  assert.ok(page1.observedNetLabels.includes("長方體"));
  assert.deepEqual(page1.deferredToQ029DespiteVisualPresence, ["CUBE", "CUBOID"]);
  assert.equal(page2.panelTitle, "圓柱與圓錐");
  assert.deepEqual(page2.q028AdmittedFamiliesFromThisPanel, ["CYLINDER", "CONE"]);

  const queue = materializeP05EW5DirectProductVerticalSliceQueue();
  const q029 = queue.queueEntries.find((entry) => entry.queuePosition === 29);
  assert.ok(q029);
  assert.ok(q029.knowledgePointIds.includes("kp_g5a_u10a1_cube_cuboid_net"));
  assert.equal(contract.semanticContract.deferredQueuePosition, 29);
  assert.equal(contract.semanticContract.deferredKnowledgePointId, "kp_g5a_u10a1_cube_cuboid_net");
  assert.ok(!contract.semanticContract.admittedSolidFamilies.includes("CUBE"));
  assert.ok(!contract.semanticContract.admittedSolidFamilies.includes("CUBOID"));
});

test("Q028 PatternSpecs stay within source-supported net correspondence and R02 foldability semantics", () => {
  const specs = contract.patternContract.patternSpecs;
  assert.deepEqual(
    specs.map((spec) => spec.patternSpecId),
    [
      "ps_g5a_u10a_prism_pyramid_net_correspondence",
      "ps_g5a_u10a_cylinder_cone_net_correspondence",
      "ps_g5a_u10a_solid_net_foldability_judgement",
    ],
  );
  assert.deepEqual(
    [...new Set(specs.map((spec) => spec.task))].sort(),
    ["JUDGE_NET_FOLDABILITY", "MATCH_NET_TO_SOLID_FAMILY"],
  );
  const foldability = specs.find((spec) => spec.patternSpecId === "ps_g5a_u10a_solid_net_foldability_judgement");
  assert.equal(foldability.negativeExampleGeneration.sourceShowsInvalidExamplesDirectly, false);
  assert.deepEqual(foldability.negativeExampleGeneration.allowedMutationReasons, ["FACE_ADJACENCY_MISMATCH", "EDGE_CONNECTION_MISMATCH"]);
  assert.equal(foldability.negativeExampleGeneration.mutationMustBeValidatedAgainstReasoningInvariant, true);
});

test("Q028 contract is a planning/materialization milestone only and hands off to bounded runtime implementation", () => {
  assert.equal(integration.nextTask, contract.taskId);
  assert.equal(contract.implementationBoundary.publicCutoverPerformedByThisMilestone, false);
  assert.equal(contract.implementationBoundary.generatorMaterializedByThisMilestone, false);
  assert.equal(contract.implementationBoundary.rendererMaterializedByThisMilestone, false);
  assert.equal(contract.implementationBoundary.worksheetMaterializedByThisMilestone, false);
  assert.equal(contract.validatorContract.failClosed, true);
  assert.equal(contract.validatorContract.genericFallbackAllowed, false);
  assert.equal(contract.validatorContract.freeFormAIAllowed, false);
  assert.equal(contract.scopeGuard.q029CubeCuboidNetTouched, false);
  assert.equal(contract.nextTask, "P05F_W5DirectProductVerticalSlice028Implementation_RuntimeRendererValidatorMaterialization");
});
