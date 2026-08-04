import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  G4B_U06_SLICE019_SOURCE_ID,
  G4B_U06_TWO_DECIMAL_KP_ID,
  G4B_U06_RATE_TOTAL_KP_ID,
  G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID,
  G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID,
  G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID,
  G4B_U06_SLICE019_PATTERN_SPEC_IDS,
  auditG4BU06Slice019SelectorProjection,
} from "../../site/modules/curriculum/registry/g4b-u06-two-decimal-rate-selector-projection.js";
import {
  P03F19_CONTEXT_AUTHORITIES,
  P03F19_REQUIRED_CAPABILITY_IDS,
  canGenerateG4BU06Slice019Questions,
  generateG4BU06Slice019Questions,
  validateG4BU06Slice019Question,
} from "../../site/modules/curriculum/batch-a/two-decimal-rate-runtime-p03f19.js";

const authority = JSON.parse(readFileSync(
  new URL("../../data/curriculum/full-product/p03f/slice019-two-decimal-rate-authority.json", import.meta.url),
  "utf8",
));

const plan = (patternSpecId, questionCount = 12) => Object.freeze({
  sourceId: G4B_U06_SLICE019_SOURCE_ID,
  patternSpecIds: [patternSpecId],
  questionCount,
  generationSeed: `p03f19-${patternSpecId}`,
});

test("P03F19 core freezes exact queue, predecessor, source, KP and capability scope", () => {
  assert.equal(authority.queueAuthority.queuePosition, 19);
  assert.equal(authority.queueAuthority.sliceId, "p03e_q019_r7_g4b_u06_4b06_profile_decimal_c1");
  assert.equal(authority.queueAuthority.previousSliceId, "p03e_q018_r7_g4a_u09_4a09_profile_decimal_c1");
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.acceptedState, "PASS_D0_CLOSED");
  assert.equal(authority.sourceAuthority.sourceNodeId, G4B_U06_SLICE019_SOURCE_ID);
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId), [G4B_U06_RATE_TOTAL_KP_ID, G4B_U06_TWO_DECIMAL_KP_ID]);
  assert.deepEqual(authority.sliceCapabilityUnion, P03F19_REQUIRED_CAPABILITY_IDS);
  assert.equal(authority.productBoundary.parallelPipelineAllowed, false);
  assert.equal(authority.productBoundary.applicationContextCandidateExpansionAllowed, false);
});

test("P03F19 core projects exactly two KPs, four groups and six existing PatternSpecs", () => {
  const audit = auditG4BU06Slice019SelectorProjection();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.deepEqual(audit.counts, { knowledgePoints: 2, patternGroups: 4, patternSpecs: 6 });
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternSpecId), G4B_U06_SLICE019_PATTERN_SPEC_IDS);
});

test("P03F19 core consumes exactly the three preflight W02 A02 context candidates", () => {
  const expected = [
    G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID,
    G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID,
    G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID,
  ].sort();
  assert.deepEqual(authority.applicationContexts.map((row) => row.patternSpecId).sort(), expected);
  assert.deepEqual(Object.keys(P03F19_CONTEXT_AUTHORITIES).sort(), expected);
  for (const row of authority.applicationContexts) {
    assert.deepEqual(P03F19_CONTEXT_AUTHORITIES[row.patternSpecId], {
      bindingCandidateId: row.bindingCandidateId,
      itemCandidateId: row.itemCandidateId,
      macroContextId: row.macroContextId,
      mesoSituationId: row.mesoSituationId,
      microScenarioId: row.microScenarioId,
      atomicEpisodeId: row.atomicEpisodeId,
      surfaceTemplateId: row.surfaceTemplateId,
    });
  }
});

test("P03F19 runtime deterministically materializes twelve exact witnesses for every admitted PatternSpec", () => {
  for (const patternSpecId of G4B_U06_SLICE019_PATTERN_SPEC_IDS) {
    const selectedPlan = plan(patternSpecId);
    assert.equal(canGenerateG4BU06Slice019Questions(selectedPlan), true);
    const first = generateG4BU06Slice019Questions({ ...selectedPlan, plan: selectedPlan });
    const second = generateG4BU06Slice019Questions({ ...selectedPlan, plan: selectedPlan });
    assert.equal(first.ok, true, JSON.stringify(first.errors));
    assert.deepEqual(first.questions, second.questions);
    assert.equal(first.questions.length, 12);
    assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 12);
    for (const question of first.questions) {
      const validation = validateG4BU06Slice019Question(question);
      assert.equal(validation.ok, true, JSON.stringify(validation.errors));
      assert.deepEqual(question.metadata.requiredCapabilityIds, P03F19_REQUIRED_CAPABILITY_IDS);
      assert.equal(question.finalAnswer.scale, 2);
      assert.equal(question.finalAnswer.exact, true);
      assert.match(question.finalAnswer.canonicalText, /^\d+\.\d{2}$/);
    }
  }
});

test("P03F19 application witnesses preserve exact context lineage and close their quantity semantics", () => {
  const cases = [
    [G4B_U06_TWO_DECIMAL_APPLICATION_SPEC_ID, /防災物資/, "箱"],
    [G4B_U06_RATE_TOTAL_APPLICATION_SPEC_ID, /節能紀錄/, "度"],
    [G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID, /市場/, "份"],
  ];
  for (const [patternSpecId, surface, unit] of cases) {
    const selectedPlan = plan(patternSpecId, 1);
    const question = generateG4BU06Slice019Questions({ ...selectedPlan, plan: selectedPlan }).questions[0];
    assert.match(question.promptText, surface);
    assert.equal(question.finalAnswer.unit, unit);
    assert.deepEqual(question.metadata.contextAuthority, P03F19_CONTEXT_AUTHORITIES[patternSpecId]);
  }
});

test("P03F19 validator fails closed on arithmetic, role and context tampering", () => {
  const numericPlan = plan(G4B_U06_SLICE019_PATTERN_SPEC_IDS[0], 1);
  const numeric = generateG4BU06Slice019Questions({ ...numericPlan, plan: numericPlan }).questions[0];
  assert.equal(validateG4BU06Slice019Question({ ...numeric, answerText: "99.99" }).ok, false);
  assert.equal(validateG4BU06Slice019Question({ ...numeric, integerFactor: 0 }).ok, false);

  const combinedPlan = plan(G4B_U06_RATE_COMBINED_APPLICATION_SPEC_ID, 1);
  const combined = generateG4BU06Slice019Questions({ ...combinedPlan, plan: combinedPlan }).questions[0];
  assert.equal(validateG4BU06Slice019Question({ ...combined, combined: "0.00" }).ok, false);
  assert.equal(validateG4BU06Slice019Question({
    ...combined,
    metadata: {
      ...combined.metadata,
      contextAuthority: { ...combined.metadata.contextAuthority, bindingCandidateId: "wrong" },
    },
  }).ok, false);
});
