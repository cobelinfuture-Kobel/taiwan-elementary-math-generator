import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  G4A_U09_DECIMAL_COMPOSE_KP_ID,
  G4A_U09_DECIMAL_COMPOSE_GROUP_ID,
  G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID,
  auditG4AU09DecimalComposeProjection,
} from "../../site/modules/curriculum/registry/g4a-u09-decimal-compose-decompose-selector-projection.js";
import {
  canGenerateG4AU09DecimalComposeSlice018Questions,
  generateG4AU09DecimalComposeSlice018Questions,
  validateG4AU09DecimalComposeSlice018Question,
} from "../../site/modules/curriculum/batch-a/decimal-compose-decompose-runtime-p03f18.js";

const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice018-decimal-compose-decompose-authority.json", import.meta.url), "utf8"));

const plan = Object.freeze({
  sourceId: "g4a_u09_4a09",
  patternSpecIds: [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID],
  questionCount: 18,
  generationSeed: "p03f18-focused-witness",
});

test("P03F18 freezes exact queue/source/KP/PatternSpec scope after Slice017 D0", () => {
  assert.equal(authority.queueAuthority.queuePosition, 18);
  assert.equal(authority.queueAuthority.sliceId, "p03e_q018_r7_g4a_u09_4a09_profile_decimal_c1");
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.equal(authority.queueAuthority.previousSliceCloseoutEvidence.acceptedState, "PASS_D0_CLOSED");
  assert.equal(authority.sourceAuthority.sourceNodeId, "g4a_u09_4a09");
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId), [G4A_U09_DECIMAL_COMPOSE_KP_ID]);
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternGroupId), [G4A_U09_DECIMAL_COMPOSE_GROUP_ID]);
  assert.deepEqual(authority.patternSurfaces.map((row) => row.patternSpecId), [G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID]);
  assert.equal(authority.productBoundary.parallelPipelineAllowed, false);
  assert.equal(authority.productBoundary.applicationExpansionAllowed, false);
});

test("P03F18 selector projection is one numeric KP/group/spec only", () => {
  const audit = auditG4AU09DecimalComposeProjection();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.deepEqual(audit.counts, { knowledgePoints: 1, patternGroups: 1, patternSpecs: 1 });
});

test("P03F18 deterministic runtime materializes 18 distinct exact two-decimal witnesses", () => {
  assert.equal(canGenerateG4AU09DecimalComposeSlice018Questions(plan), true);
  const result = generateG4AU09DecimalComposeSlice018Questions({ ...plan, plan });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 18);
  assert.equal(new Set(result.questions.map((row) => row.blankedDisplayText)).size, 18);
  for (const question of result.questions) {
    const validation = validateG4AU09DecimalComposeSlice018Question(question);
    assert.equal(validation.ok, true, JSON.stringify(validation.errors));
    assert.equal(question.metadata.knowledgePointId, G4A_U09_DECIMAL_COMPOSE_KP_ID);
    assert.equal(question.metadata.patternGroupId, G4A_U09_DECIMAL_COMPOSE_GROUP_ID);
    assert.equal(question.metadata.patternId, G4A_U09_DECIMAL_COMPOSE_PATTERN_SPEC_ID);
    assert.deepEqual(question.metadata.requiredCapabilityIds, ["cap_decimal_domain_validator", "cap_decimal_number_system"]);
    assert.equal(question.metadata.applicationClassification, "APPLICATION_NOT_APPLICABLE");
    assert.match(question.answerText, /^\d+\.\d{2}$/);
  }
});

test("P03F18 validator fails closed on decimal identity tamper", () => {
  const result = generateG4AU09DecimalComposeSlice018Questions({ ...plan, questionCount: 1, plan: { ...plan, questionCount: 1 } });
  const question = result.questions[0];
  const tampered = { ...question, answerText: "99.99" };
  const validation = validateG4AU09DecimalComposeSlice018Question(tampered);
  assert.equal(validation.ok, false);
  assert.ok(validation.errors.some((row) => row.code === "p03f18_decimal_answer_invalid"));
});
