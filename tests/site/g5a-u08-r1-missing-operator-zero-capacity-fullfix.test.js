import assert from "node:assert/strict";
import test from "node:test";

import {
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  generateG5AU08CanonicalQuestions,
} from "../../site/modules/curriculum/batch-a/g5a-u08-canonical-router.js";
import {
  G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G5A_U08_PROMOTED_PATTERN_GROUP_IDS,
  G5A_U08_PROMOTED_PATTERN_SPEC_IDS,
  G5A_U08_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";

const MISSING_OPERATOR_KP = "kp_g5a_u08_missing_operator_inference";
const MISSING_OPERATOR_GROUP = "pg_g5a_u08_missing_operator_reasoning";
const MISSING_OPERATOR_SPEC = "ps_g5a_u08_missing_operator_sequence";
const EQUIVALENCE_KP = "kp_g5a_u08_equivalence_error_judgement";
const EQUIVALENCE_GROUP = "pg_g5a_u08_equivalence_reasoning";
const AVERAGE_KP = "kp_g5a_u08_average_inverse_update";

function optionValues(binding) {
  return binding.availableQuestionTypeOptions.map((row) => row.value);
}

function singleBinding(knowledgePointId, requestedQuestionType = "mixed") {
  return resolvePublicUiCapabilityBinding({
    sourceId: G5A_U08_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    requestedQuestionType,
    requestedDepthMode: "mixed",
    requestedContextMode: "mixed",
  });
}

test("G5A-U08 authority counts stay frozen during deployed zero-capacity repair", () => {
  assert.equal(G5A_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length, 11);
  assert.equal(G5A_U08_PROMOTED_PATTERN_GROUP_IDS.length, 17);
  assert.equal(G5A_U08_PROMOTED_PATTERN_SPEC_IDS.length, 30);
});

test("missing-operator single-KP fallback preserves reasoning instead of coercing numeric", () => {
  const binding = singleBinding(MISSING_OPERATOR_KP, "numeric");
  assert.equal(binding.blocked, false, binding.blockedReasons.join("|"));
  assert.notEqual(binding.questionType, "numeric");
  assert.equal(optionValues(binding).includes("reasoning"), true);
  const targetGroup = binding.compatiblePatternGroups.find((row) => row.patternGroupId === MISSING_OPERATOR_GROUP);
  assert.ok(targetGroup, `Missing ${MISSING_OPERATOR_GROUP}`);
  assert.equal(targetGroup.effectiveQuestionType, "reasoning");
  assert.equal(targetGroup.uiQuestionType, "reasoning");
});

test("missing-operator deployed seed produces six unique canonical reasoning questions", () => {
  const binding = singleBinding(MISSING_OPERATOR_KP, "numeric");
  const result = generateG5AU08CanonicalQuestions({
    sourceId: G5A_U08_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [MISSING_OPERATOR_KP],
    selectedPatternGroupIds: [MISSING_OPERATOR_GROUP],
    questionCount: 6,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g5a-u08-r1-kp-9",
    questionMode: binding.questionType,
    depthMode: "mixed",
    contextMode: "mixed",
    resolverResult: {
      ok: true,
      errors: [],
      warnings: [],
      provenance: {
        resolver: "visiblePatternGroupResolver",
        sourceId: G5A_U08_SOURCE_ID,
      },
    },
  });

  assert.equal(result.ok, true, result.errors?.map((row) => row.code).join("|") ?? "");
  assert.equal(result.questions.length, 6);
  assert.equal(result.allocation.length, 1);
  assert.equal(result.allocation[0].patternGroupId, MISSING_OPERATOR_GROUP);
  assert.deepEqual(result.allocation[0].selectedPatternSpecIds, [MISSING_OPERATOR_SPEC]);
  assert.equal(result.allocation[0].runtimeKind, "numeric_or_noncontext_reasoning");
  const prompts = result.questions.map((question) => String(question.promptText ?? question.prompt ?? question.blankedDisplayText ?? "").trim());
  assert.equal(prompts.every(Boolean), true);
  assert.equal(new Set(prompts).size, 6);
});

test("other G5A-U08 reasoning and mixed-mode fallback identities remain coherent", () => {
  const equivalence = singleBinding(EQUIVALENCE_KP, "numeric");
  assert.notEqual(equivalence.questionType, "numeric");
  assert.equal(optionValues(equivalence).includes("reasoning"), true);
  const equivalenceGroup = equivalence.compatiblePatternGroups.find((row) => row.patternGroupId === EQUIVALENCE_GROUP);
  assert.ok(equivalenceGroup, `Missing ${EQUIVALENCE_GROUP}`);
  assert.equal(equivalenceGroup.effectiveQuestionType, "reasoning");

  const average = singleBinding(AVERAGE_KP, "mixed");
  assert.equal(average.questionType, "mixed");
  assert.equal(optionValues(average).includes("mixed"), true);
  assert.equal(optionValues(average).includes("application"), true);
  assert.equal(optionValues(average).includes("reasoning"), true);
});
