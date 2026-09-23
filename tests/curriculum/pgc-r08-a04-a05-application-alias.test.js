import test from "node:test";
import assert from "node:assert/strict";
import {
  generateBatchABrowserQuestions,
  normalizePublicApplicationDiversitySeed,
  normalizePublicApplicationPatternGroupAliases,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";

const cases = Object.freeze([
  ["g3a_u02_3a02", "kp_g3a_u02_add_multi_carry", "pg_g3a_u02_add_multi_carry_seed", "w01_app_pg_g3a_u02_add_multi_carry"],
  ["g3a_u02_3a02", "kp_g3a_u02_sub_multi_borrow", "pg_g3a_u02_sub_multi_borrow_seed", "w01_app_pg_g3a_u02_sub_multi_borrow"],
  ["g3a_u03_3a03", "kp_g3a_u03_2digit_by_1digit_carry", "pg_g3a_u03_2digit_by_1digit_carry", "w01_app_pg_g3a_u03_2digit_by_1digit"],
  ["g3a_u06_3a06", "kp_g3a_u06_exact_division_check", "pg_g3a_u06_exact_division_check", "w01_app_pg_g3a_u06_exact_division"],
  ["g3b_u01_3b01", "kp_g3b_u01_2digit_division_place_value_cases", "pg_g3b_u01_2digit_division_place_value_cases", "w01_app_pg_g3b_u01_place_value_division"],
  ["g3b_u04_3b04", "kp_g3b_u04_consecutive_multiplication", "pg_g3b_u04_consecutive_multiplication_numeric", "pg_g3b_u04_consecutive_multiplication_application"],
]);

test("A05 normalizes each residual UI base group to its admitted application group", () => {
  for (const [sourceId, knowledgePointId, basePatternGroupId, applicationPatternGroupId] of cases) {
    const options = {
      sourceId,
      questionMode: "application",
      selectionMode: "singleKnowledgePoint",
      selectedKnowledgePointIds: [knowledgePointId],
      selectedPatternGroupIds: [basePatternGroupId],
      generationSeed: "pgc-r08-alias-contract-seed",
    };
    const normalized = normalizePublicApplicationPatternGroupAliases(options);
    assert.deepEqual(
      normalized.selectedPatternGroupIds,
      [applicationPatternGroupId],
      `${sourceId}:${knowledgePointId}`,
    );
    assert.deepEqual(normalized.publicApplicationAliasProjection, {
      mode: "PRODUCTION_APPLICATION_GROUP_PRIMARY",
      requestedPatternGroupIds: [basePatternGroupId],
      normalizedPatternGroupIds: [applicationPatternGroupId],
    });

    const diversitySeeded = normalizePublicApplicationDiversitySeed(normalized);
    assert.equal(diversitySeeded.generationSeed, "pgc-r08-alias-contract-seed:pgc-r05-application-diversity");
    assert.deepEqual(diversitySeeded.publicApplicationDiversitySeedProjection, {
      mode: "REUSE_PGC_R05_DETERMINISTIC_RETRY",
      originalGenerationSeed: "pgc-r08-alias-contract-seed",
      effectiveGenerationSeed: "pgc-r08-alias-contract-seed:pgc-r05-application-diversity",
    });
  }
});

test("A05 application alias normalization is route-agnostic and fail-closed", () => {
  const numeric = {
    questionMode: "numeric",
    selectedKnowledgePointIds: [cases[0][1]],
    selectedPatternGroupIds: [cases[0][2]],
  };
  const missingKnowledgePoint = {
    questionMode: "application",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [cases[0][2]],
  };
  const unknown = {
    questionMode: "application",
    selectedKnowledgePointIds: ["kp_unknown"],
    selectedPatternGroupIds: ["pg_unknown"],
  };

  assert.equal(normalizePublicApplicationPatternGroupAliases(numeric), numeric);
  assert.equal(normalizePublicApplicationPatternGroupAliases(missingKnowledgePoint), missingKnowledgePoint);
  assert.equal(normalizePublicApplicationPatternGroupAliases(unknown), unknown);
  assert.equal(normalizePublicApplicationDiversitySeed(numeric), numeric);
  assert.equal(normalizePublicApplicationDiversitySeed(unknown), unknown);
});

test("A05 G3B-U04 exact application route produces twenty validated diverse prompts", () => {
  const baseOptions = {
    sourceId: "g3b_u04_3b04",
    questionMode: "application",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g3b_u04_consecutive_multiplication"],
    selectedPatternGroupIds: ["pg_g3b_u04_consecutive_multiplication_numeric"],
    questionCount: 20,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
  };
  const first = generateBatchABrowserQuestions({
    ...baseOptions,
    generationSeed: "pgc-r08-g3b-u04-focused-seed-a",
  });
  const second = generateBatchABrowserQuestions({
    ...baseOptions,
    generationSeed: "pgc-r08-g3b-u04-focused-seed-b",
  });

  for (const result of [first, second]) {
    assert.equal(result.ok, true, JSON.stringify(result.errors));
    assert.equal(result.questions.length, 20);
    assert.equal(new Set(result.questions.map((question) => question.promptText)).size, 20);
    assert.equal(
      result.questions.every((question) => (
        question.resolvedPatternGroupId === "pg_g3b_u04_consecutive_multiplication_application"
      )),
      true,
    );
  }
  assert.notDeepEqual(
    first.questions.map((question) => question.promptText),
    second.questions.map((question) => question.promptText),
  );
});
