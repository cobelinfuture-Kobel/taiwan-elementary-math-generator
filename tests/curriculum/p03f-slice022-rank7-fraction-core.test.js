import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  auditG5AU04Slice022SelectorProjection,
  G5A_U04_SLICE022_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g5a-u04-rank7-fraction-selector-projection.js";
import {
  P03F22_REQUIRED_CAPABILITY_IDS,
  generateG5AU04Slice022Questions,
  validateG5AU04Slice022Question,
} from "../../site/modules/curriculum/batch-a/g5a-u04-rank7-fraction-runtime-p03f22.js";

const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice022-common-denominator-reduction-authority.json", import.meta.url), "utf8"));
const plan = (count = 24) => ({ sourceId: "g5a_u04_5a04", patternSpecIds: G5A_U04_SLICE022_PATTERN_SPEC_IDS, questionCount: count, generationSeed: "p03f22-core" });

test("P03F22 authority freezes two KPs six numeric specs and no-context boundary", () => {
  assert.equal(authority.queueAuthority.queuePosition, 22);
  assert.equal(authority.queueAuthority.previousSliceD0Complete, true);
  assert.deepEqual(authority.knowledgePoints.map((row) => row.knowledgePointId), ["kp_g5a_u04_common_denominator", "kp_g5a_u04_divisibility_supported_reduction"]);
  assert.deepEqual(authority.requiredCapabilityIds, P03F22_REQUIRED_CAPABILITY_IDS);
  assert.equal(authority.productBoundary.globalContextOntologyExpansionAllowed, false);
  assert.equal(authority.productBoundary.otherG5AU04KnowledgePointsExcluded, true);
  assert.deepEqual(auditG5AU04Slice022SelectorProjection().counts, { knowledgePoints: 2, patternGroups: 2, patternSpecs: 6 });
});

test("P03F22 deterministically materializes balanced exact witnesses", () => {
  const first = generateG5AU04Slice022Questions({ ...plan(), plan: plan() });
  const second = generateG5AU04Slice022Questions({ ...plan(), plan: plan() });
  assert.equal(first.ok, true, JSON.stringify(first.errors));
  assert.deepEqual(first.questions, second.questions);
  assert.equal(first.questions.length, 24);
  assert.deepEqual(first.allocation.map((row) => row.questionCount), [4, 4, 4, 4, 4, 4]);
  assert.equal(new Set(first.questions.map((row) => row.blankedDisplayText)).size, 24);
  first.questions.forEach((question) => assert.equal(validateG5AU04Slice022Question(question).ok, true));
});

test("P03F22 closes the public 240-question ceiling without duplicates", () => {
  const request = plan(240);
  const result = generateG5AU04Slice022Questions({ ...request, plan: request });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 240);
  assert.equal(new Set(result.questions.map((row) => row.blankedDisplayText)).size, 240);
  result.questions.forEach((question) => assert.equal(validateG5AU04Slice022Question(question).ok, true));
});

test("P03F22 validator fails closed on arithmetic answer capability and context tampering", () => {
  const request = plan(6);
  const questions = generateG5AU04Slice022Questions({ ...request, plan: request }).questions;
  assert.equal(validateG5AU04Slice022Question({ ...questions[0], commonDenominator: questions[0].commonDenominator + 1 }).ok, false);
  assert.equal(validateG5AU04Slice022Question({ ...questions[3], commonFactor: questions[3].commonFactor + 1 }).ok, false);
  assert.equal(validateG5AU04Slice022Question({ ...questions[1], answerText: "999" }).ok, false);
  assert.equal(validateG5AU04Slice022Question({ ...questions[2], metadata: { ...questions[2].metadata, requiredCapabilityIds: [] } }).ok, false);
  assert.equal(validateG5AU04Slice022Question({ ...questions[4], metadata: { ...questions[4].metadata, contextAuthority: { fake: true } } }).ok, false);
});
