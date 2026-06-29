import test from "node:test";
import assert from "node:assert/strict";

import {
  QUESTION_KINDS,
  SUPPORT_STATUSES
} from "../../src/core/constants.js";
import {
  buildDuplicateKey,
  generateQuestionFromPattern
} from "../../src/core/generate-expression.js";
import {
  createBinaryNode,
  createValueNode
} from "../../src/core/expression-model.js";
import {
  createIntegerValue,
  getIntegerRawValue
} from "../../src/core/number-value.js";

function createPattern(overrides = {}) {
  return {
    patternId: "pattern_add",
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["two-operand"],
    skillTags: ["integer_addition"],
    difficultyTags: ["basic"],
    curriculumNodeIds: ["node-1"],
    canonicalSkillIds: ["integer_addition"],
    expressionTemplate: {
      operandCount: 2,
      allowedOperatorsBySlot: [["+"]],
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: null,
      algorithmicComplexityPolicy: null
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 2, max: 9, allowZero: true, allowOne: true },
          { position: 2, min: 2, max: 9, allowZero: true, allowOne: true }
        ]
      }
    },
    ...overrides
  };
}

test("generate 2-operand addition from pattern", () => {
  const result = generateQuestionFromPattern(createPattern(), { seed: 101 });
  assert.equal(result.ok, true);
  assert.equal(result.question.operatorsUsed[0], "+");
});

test("generate 2-operand subtraction from pattern", () => {
  const pattern = createPattern({
    patternId: "pattern_sub",
    expressionTemplate: {
      ...createPattern().expressionTemplate,
      allowedOperatorsBySlot: [["-"]]
    }
  });

  const result = generateQuestionFromPattern(pattern, { seed: 102 });
  assert.equal(result.ok, true);
  assert.equal(result.question.operatorsUsed[0], "-");
});

test("generate 2-operand multiplication from pattern", () => {
  const pattern = createPattern({
    patternId: "pattern_mul",
    expressionTemplate: {
      ...createPattern().expressionTemplate,
      allowedOperatorsBySlot: [["×"]]
    }
  });

  const result = generateQuestionFromPattern(pattern, { seed: 103 });
  assert.equal(result.ok, true);
  assert.equal(result.question.operatorsUsed[0], "×");
});

test("generate exact division from pattern", () => {
  const pattern = createPattern({
    patternId: "pattern_div",
    expressionTemplate: {
      ...createPattern().expressionTemplate,
      allowedOperatorsBySlot: [["÷"]]
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 4, max: 81, allowZero: false, allowOne: true },
          { position: 2, min: 2, max: 9, allowZero: false, allowOne: true }
        ]
      },
      answerConstraint: {
        min: 2,
        max: 9,
        allowZero: false,
        allowNegative: false,
        requireInteger: true
      },
      division: {
        allowDivideByOne: false,
        allowZeroDividend: false,
        requireExactQuotient: true
      }
    }
  });

  const result = generateQuestionFromPattern(pattern, { seed: 104 });
  assert.equal(result.ok, true);
  const [intermediate] = result.question.intermediateResults;
  assert.equal(getIntegerRawValue(result.question.finalAnswer), getIntegerRawValue(intermediate));
  assert.equal(result.question.operatorsUsed[0], "÷");
});

test("reject future question kind", () => {
  const result = generateQuestionFromPattern(createPattern({
    questionKind: QUESTION_KINDS.WORD_PROBLEM
  }));
  assert.equal(result.ok, false);
  assert.match(result.errors.map((error) => error.code).join(","), /pattern_question_kind_not_supported/);
});

test("reject future support status", () => {
  const result = generateQuestionFromPattern(createPattern({
    supportStatus: [SUPPORT_STATUSES.FUTURE_DECIMAL_DOMAIN]
  }));
  assert.equal(result.ok, false);
  assert.match(result.errors.map((error) => error.code).join(","), /pattern_support_status_missing/);
});

test("answer min/max constraint is enforced", () => {
  const result = generateQuestionFromPattern(createPattern(), {
    seed: 105,
    config: {
      answerConstraint: {
        min: 999,
        max: 1000,
        allowZero: true,
        allowNegative: true,
        requireInteger: true
      }
    },
    maxAttempts: 5
  });
  assert.equal(result.ok, false);
  assert.match(result.errors.map((error) => error.code).join(","), /pattern_generation_attempts_exhausted/);
});

test("allowZero false is enforced", () => {
  const pattern = createPattern({
    patternId: "pattern_zero",
    expressionTemplate: {
      ...createPattern().expressionTemplate,
      allowedOperatorsBySlot: [["-"]]
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 5, max: 5, allowZero: true, allowOne: true },
          { position: 2, min: 5, max: 5, allowZero: true, allowOne: true }
        ]
      }
    }
  });

  const result = generateQuestionFromPattern(pattern, {
    config: {
      answerConstraint: {
        min: -10,
        max: 10,
        allowZero: false,
        allowNegative: true,
        requireInteger: true
      }
    },
    maxAttempts: 3,
    seed: 106
  });
  assert.equal(result.ok, false);
});

test("allowNegative false is enforced", () => {
  const pattern = createPattern({
    patternId: "pattern_negative",
    expressionTemplate: {
      ...createPattern().expressionTemplate,
      allowedOperatorsBySlot: [["-"]]
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 2, max: 2, allowZero: true, allowOne: true },
          { position: 2, min: 5, max: 5, allowZero: true, allowOne: true }
        ]
      }
    }
  });

  const result = generateQuestionFromPattern(pattern, {
    config: {
      answerConstraint: {
        min: -10,
        max: 10,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    maxAttempts: 3,
    seed: 107
  });
  assert.equal(result.ok, false);
});

test("pattern metadata is preserved on GeneratedQuestion", () => {
  const pattern = createPattern({
    patternTags: ["tag-a"],
    skillTags: ["skill-a"],
    difficultyTags: ["difficulty-a"],
    curriculumNodeIds: ["curriculum-a"],
    canonicalSkillIds: ["canonical-a"]
  });

  const result = generateQuestionFromPattern(pattern, {
    seed: 108,
    config: {
      precedence: { mode: "standard" },
      parentheses: { mode: "none" }
    }
  });

  assert.equal(result.ok, true);
  assert.deepEqual(result.question.metadata, {
    patternId: "pattern_add",
    patternTags: ["tag-a"],
    skillTags: ["skill-a"],
    difficultyTags: ["difficulty-a"],
    curriculumNodeIds: ["curriculum-a"],
    canonicalSkillIds: ["canonical-a"],
    precedenceMode: "standard",
    parenthesesMode: "none"
  });
});

test("seeded generation is deterministic", () => {
  const first = generateQuestionFromPattern(createPattern(), { seed: "repeatable" });
  const second = generateQuestionFromPattern(createPattern(), { seed: "repeatable" });

  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(first.question.duplicateKey, second.question.duplicateKey);
  assert.equal(getIntegerRawValue(first.question.finalAnswer), getIntegerRawValue(second.question.finalAnswer));
});

test("generated multiplication question using ASCII alias input stores canonical operator", () => {
  const pattern = createPattern({
    patternId: "pattern_mul_alias",
    expressionTemplate: {
      ...createPattern().expressionTemplate,
      allowedOperatorsBySlot: [["*"]]
    }
  });

  const result = generateQuestionFromPattern(pattern, { seed: 109 });
  assert.equal(result.ok, true);
  assert.equal(result.question.expression.operator, "×");
  assert.equal(result.question.duplicateKey.includes("×"), true);
});

test("generated division question using ASCII alias input stores canonical operator", () => {
  const pattern = createPattern({
    patternId: "pattern_div_alias",
    expressionTemplate: {
      ...createPattern().expressionTemplate,
      allowedOperatorsBySlot: [["/"]]
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 4, max: 81, allowZero: false, allowOne: true },
          { position: 2, min: 2, max: 9, allowZero: false, allowOne: true }
        ]
      },
      answerConstraint: {
        min: 2,
        max: 9,
        allowZero: false,
        allowNegative: false,
        requireInteger: true
      },
      division: {
        allowDivideByOne: false,
        allowZeroDividend: false,
        requireExactQuotient: true
      }
    }
  });

  const result = generateQuestionFromPattern(pattern, { seed: 110 });
  assert.equal(result.ok, true);
  assert.equal(result.question.expression.operator, "÷");
  assert.equal(result.question.duplicateKey.includes("÷"), true);
});

test("duplicate key is canonical for multiplication alias", () => {
  const canonical = createBinaryNode(
    "×",
    createValueNode(createIntegerValue(3), 1),
    createValueNode(createIntegerValue(2), 2)
  );
  const alias = createBinaryNode(
    "*",
    createValueNode(createIntegerValue(3), 1),
    createValueNode(createIntegerValue(2), 2)
  );

  assert.equal(buildDuplicateKey(canonical), "(3×2)");
  assert.equal(buildDuplicateKey(alias), "(3×2)");
});

test("duplicate key is canonical for division alias", () => {
  const canonical = createBinaryNode(
    "÷",
    createValueNode(createIntegerValue(6), 1),
    createValueNode(createIntegerValue(2), 2)
  );
  const alias = createBinaryNode(
    "/",
    createValueNode(createIntegerValue(6), 1),
    createValueNode(createIntegerValue(2), 2)
  );

  assert.equal(buildDuplicateKey(canonical), "(6÷2)");
  assert.equal(buildDuplicateKey(alias), "(6÷2)");
});
