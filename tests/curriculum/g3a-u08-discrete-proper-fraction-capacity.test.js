import test from "node:test";
import assert from "node:assert/strict";

import {
  G3A_U08_DISCRETE_FRACTION_KP_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID,
  G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID,
  G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID,
} from "../../site/modules/curriculum/registry/g3a-u08-slice002-selector-projection.js";
import {
  generateG3AU08Slice002QuestionsFromPlan,
} from "../../site/modules/curriculum/batch-a/slice002-fraction-runtime.js";

const SOURCE_ID = "g3a_u08_3a08";

const specsForMode = (mode) => mode === "application"
  ? [
      G3A_U08_DISCRETE_ITEM_COUNT_APPLICATION_SPEC_ID,
      G3A_U08_DISCRETE_FRACTIONAL_UNITS_APPLICATION_SPEC_ID,
    ]
  : [
      G3A_U08_DISCRETE_ITEM_COUNT_NUMERIC_SPEC_ID,
      G3A_U08_DISCRETE_FRACTIONAL_UNITS_NUMERIC_SPEC_ID,
    ];

const plan = (mode, questionCount) => ({
  sourceId: SOURCE_ID,
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [G3A_U08_DISCRETE_FRACTION_KP_ID],
  selectedPatternGroupIds: [],
  patternSpecIds: specsForMode(mode),
  questionMode: mode,
  questionCount,
  ordering: "groupedByPattern",
  generationSeed: `g3a-u08-discrete-proper-${mode}-${questionCount}`,
  genericFallbackAllowed: false,
});

for (const mode of ["numeric", "application"]) {
  for (const questionCount of [60, 120, 121]) {
    test(`G3A-U08 discrete ${mode} ${questionCount} stays proper-fraction-only with unique prompts`, () => {
      const result = generateG3AU08Slice002QuestionsFromPlan(plan(mode, questionCount));

      assert.equal(result.ok, true, JSON.stringify(result.errors));
      assert.equal(result.questions.length, questionCount);
      assert.equal(new Set(result.questions.map((question) => question.blankedDisplayText)).size, questionCount);
      assert.deepEqual(
        [...new Set(result.questions.map((question) => question.metadata?.knowledgePointId))],
        [G3A_U08_DISCRETE_FRACTION_KP_ID],
      );

      for (const question of result.questions) {
        assert.equal(question.wholeUnits, 0);
        assert.ok(question.numerator > 0);
        assert.ok(question.numerator < question.denominator);
        assert.doesNotMatch(question.blankedDisplayText, /又/);
      }
    });
  }
}
