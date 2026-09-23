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

// ---------------------------------------------------------------------------
// Distribution QA / Sampling Bias Tests (S20D)
// ---------------------------------------------------------------------------

function ratio(values, predicate) {
  return values.filter(predicate).length / values.length;
}

function uniqueRatio(values) {
  return new Set(values).size / values.length;
}

function lastDigitSet(values) {
  return new Set(values.map((value) => Math.abs(value) % 10));
}

function createDivisionPattern(overrides = {}) {
  return {
    patternId: "pattern_div_distribution",
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["two-operand"],
    skillTags: ["integer_division"],
    difficultyTags: ["basic"],
    curriculumNodeIds: ["node-div"],
    canonicalSkillIds: ["integer_division"],
    expressionTemplate: {
      operandCount: 2,
      allowedOperatorsBySlot: [["÷"]],
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: null,
      algorithmicComplexityPolicy: null
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 1000, max: 999999, allowZero: true, allowOne: true },
          { position: 2, min: 2, max: 99, allowZero: false, allowOne: true }
        ]
      },
      answerConstraint: {
        max: 10000,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    ...overrides
  };
}

function createAdditionPattern(overrides = {}) {
  return {
    patternId: "pattern_add_distribution",
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["two-operand"],
    skillTags: ["integer_addition"],
    difficultyTags: ["basic"],
    curriculumNodeIds: ["node-add"],
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
          { position: 1, min: 1000, max: 9999, allowZero: true, allowOne: true },
          { position: 2, min: 1000, max: 9999, allowZero: true, allowOne: true }
        ]
      },
      answerConstraint: {
        max: 20000,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    ...overrides
  };
}

function createSubtractionPattern(overrides = {}) {
  return {
    patternId: "pattern_sub_distribution",
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["two-operand"],
    skillTags: ["integer_subtraction"],
    difficultyTags: ["basic"],
    curriculumNodeIds: ["node-sub"],
    canonicalSkillIds: ["integer_subtraction"],
    expressionTemplate: {
      operandCount: 2,
      allowedOperatorsBySlot: [["-"]],
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: null,
      algorithmicComplexityPolicy: null
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 5000, max: 9999, allowZero: true, allowOne: true },
          { position: 2, min: 1000, max: 4999, allowZero: true, allowOne: true }
        ]
      },
      answerConstraint: {
        max: 10000,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    ...overrides
  };
}

function createMultiplicationPattern(overrides = {}) {
  return {
    patternId: "pattern_mul_distribution",
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["two-operand"],
    skillTags: ["integer_multiplication"],
    difficultyTags: ["basic"],
    curriculumNodeIds: ["node-mul"],
    canonicalSkillIds: ["integer_multiplication"],
    expressionTemplate: {
      operandCount: 2,
      allowedOperatorsBySlot: [["×"]],
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: null,
      algorithmicComplexityPolicy: null
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 1000, max: 9999, allowZero: true, allowOne: true },
          { position: 2, min: 2, max: 9, allowZero: true, allowOne: true }
        ]
      },
      answerConstraint: {
        max: 100000,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    ...overrides
  };
}

function createMixedOperatorPattern(overrides = {}) {
  return {
    patternId: "pattern_mixed_distribution",
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: ["two-operand"],
    skillTags: ["mixed_operations"],
    difficultyTags: ["basic"],
    curriculumNodeIds: ["node-mixed"],
    canonicalSkillIds: ["mixed_operations"],
    expressionTemplate: {
      operandCount: 2,
      allowedOperatorsBySlot: [["+", "-", "×", "÷"]],
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: null,
      algorithmicComplexityPolicy: null
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: 1000, max: 9999, allowZero: true, allowOne: true },
          { position: 2, min: 2, max: 99, allowZero: false, allowOne: true }
        ]
      },
      answerConstraint: {
        max: 50000,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    ...overrides
  };
}

// ------- Division Quotient Bias Tests -------

test("S20D division: all divisions are exact", () => {
  const pattern = createDivisionPattern();
  const results = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 200 + i });
    assert.equal(result.ok, true, `Question ${i} failed to generate`);
    results.push(result.question);
  }

  for (const question of results) {
    const dividend = getIntegerRawValue(question.expression.left.value);
    const divisor = getIntegerRawValue(question.expression.right.value);
    const quotient = getIntegerRawValue(question.finalAnswer);
    assert.equal(dividend % divisor, 0, `${dividend} ÷ ${divisor} is not exact`);
    assert.equal(dividend / divisor, quotient, `${dividend} ÷ ${divisor} != ${quotient}`);
  }
});

test("S20D division: no divisor is zero", () => {
  const pattern = createDivisionPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 300 + i });
    assert.equal(result.ok, true);
    const divisor = getIntegerRawValue(result.question.expression.right.value);
    assert.notEqual(divisor, 0);
  }
});

test("S20D division: all quotients respect answerMax", () => {
  const pattern = createDivisionPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 400 + i });
    assert.equal(result.ok, true);
    const quotient = getIntegerRawValue(result.question.finalAnswer);
    assert.ok(quotient <= 10000, `Quotient ${quotient} exceeds answerMax 10000`);
  }
});

test("S20D division: not all quotients are multiples of 10", () => {
  const pattern = createDivisionPattern();
  const quotients = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 500 + i });
    assert.equal(result.ok, true);
    quotients.push(getIntegerRawValue(result.question.finalAnswer));
  }

  const multipleOf10Ratio = ratio(quotients, (q) => q % 10 === 0);
  assert.ok(multipleOf10Ratio < 1.0, `All quotients are multiples of 10 (ratio=${multipleOf10Ratio})`);
  // Stricter: should be clearly less than 0.8
  assert.ok(multipleOf10Ratio <= 0.8, `Quotients multiples of 10 ratio ${multipleOf10Ratio} exceeds 0.8`);
});

test("S20D division: quotient last digits have reasonable diversity", () => {
  const pattern = createDivisionPattern();
  const quotients = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 600 + i });
    assert.equal(result.ok, true);
    quotients.push(getIntegerRawValue(result.question.finalAnswer));
  }

  const digits = lastDigitSet(quotients);
  assert.ok(digits.size >= 4, `Quotient last digits only ${digits.size} distinct values (${[...digits].join(",")})`);
});

test("S20D division: expression uniqueness is acceptable", () => {
  const pattern = createDivisionPattern();
  const keys = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 700 + i });
    assert.equal(result.ok, true);
    keys.push(result.question.duplicateKey);
  }

  const uniqueness = uniqueRatio(keys);
  assert.ok(uniqueness >= 0.8, `Division expression uniqueness ${uniqueness} is below 0.8`);
});

// ------- Addition Distribution Sanity Tests -------

test("S20D addition: operands are within range", () => {
  const pattern = createAdditionPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 800 + i });
    assert.equal(result.ok, true);
    const a = getIntegerRawValue(result.question.expression.left.value);
    const b = getIntegerRawValue(result.question.expression.right.value);
    assert.ok(a >= 1000 && a <= 9999, `First operand ${a} out of range`);
    assert.ok(b >= 1000 && b <= 9999, `Second operand ${b} out of range`);
  }
});

test("S20D addition: answers are correct", () => {
  const pattern = createAdditionPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 900 + i });
    assert.equal(result.ok, true);
    const a = getIntegerRawValue(result.question.expression.left.value);
    const b = getIntegerRawValue(result.question.expression.right.value);
    const answer = getIntegerRawValue(result.question.finalAnswer);
    assert.equal(a + b, answer, `${a} + ${b} != ${answer}`);
  }
});

test("S20D addition: answers are not all multiples of 10", () => {
  const pattern = createAdditionPattern();
  const answers = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1000 + i });
    assert.equal(result.ok, true);
    answers.push(getIntegerRawValue(result.question.finalAnswer));
  }

  const multipleOf10Ratio = ratio(answers, (a) => a % 10 === 0);
  assert.ok(multipleOf10Ratio < 1.0, `All addition answers are multiples of 10 (ratio=${multipleOf10Ratio})`);
});

test("S20D addition: answer last digits have reasonable diversity", () => {
  const pattern = createAdditionPattern();
  const answers = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1100 + i });
    assert.equal(result.ok, true);
    answers.push(getIntegerRawValue(result.question.finalAnswer));
  }

  const digits = lastDigitSet(answers);
  assert.ok(digits.size >= 4, `Addition answer last digits only ${digits.size} distinct values (${[...digits].join(",")})`);
});

test("S20D addition: expression uniqueness is acceptable", () => {
  const pattern = createAdditionPattern();
  const keys = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1200 + i });
    assert.equal(result.ok, true);
    keys.push(result.question.duplicateKey);
  }

  const uniqueness = uniqueRatio(keys);
  assert.ok(uniqueness >= 0.8, `Addition expression uniqueness ${uniqueness} is below 0.8`);
});

// ------- Subtraction Distribution Sanity Tests -------

test("S20D subtraction: operands are within range", () => {
  const pattern = createSubtractionPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1300 + i });
    assert.equal(result.ok, true);
    const a = getIntegerRawValue(result.question.expression.left.value);
    const b = getIntegerRawValue(result.question.expression.right.value);
    assert.ok(a >= 5000 && a <= 9999, `First operand ${a} out of range`);
    assert.ok(b >= 1000 && b <= 4999, `Second operand ${b} out of range`);
  }
});

test("S20D subtraction: answers are correct", () => {
  const pattern = createSubtractionPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1400 + i });
    assert.equal(result.ok, true);
    const a = getIntegerRawValue(result.question.expression.left.value);
    const b = getIntegerRawValue(result.question.expression.right.value);
    const answer = getIntegerRawValue(result.question.finalAnswer);
    assert.equal(a - b, answer, `${a} - ${b} != ${answer}`);
  }
});

test("S20D subtraction: no negative answers", () => {
  const pattern = createSubtractionPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1500 + i });
    assert.equal(result.ok, true);
    const answer = getIntegerRawValue(result.question.finalAnswer);
    assert.ok(answer >= 0, `Subtraction answer ${answer} is negative`);
  }
});

test("S20D subtraction: answer last digits have reasonable diversity", () => {
  const pattern = createSubtractionPattern();
  const answers = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1600 + i });
    assert.equal(result.ok, true);
    answers.push(getIntegerRawValue(result.question.finalAnswer));
  }

  const digits = lastDigitSet(answers);
  assert.ok(digits.size >= 4, `Subtraction answer last digits only ${digits.size} distinct values (${[...digits].join(",")})`);
});

test("S20D subtraction: expression uniqueness is acceptable", () => {
  const pattern = createSubtractionPattern();
  const keys = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1700 + i });
    assert.equal(result.ok, true);
    keys.push(result.question.duplicateKey);
  }

  const uniqueness = uniqueRatio(keys);
  assert.ok(uniqueness >= 0.8, `Subtraction expression uniqueness ${uniqueness} is below 0.8`);
});

// ------- Multiplication Distribution Sanity Tests -------

test("S20D multiplication: operands are within range", () => {
  const pattern = createMultiplicationPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1800 + i });
    assert.equal(result.ok, true);
    const a = getIntegerRawValue(result.question.expression.left.value);
    const b = getIntegerRawValue(result.question.expression.right.value);
    assert.ok(a >= 1000 && a <= 9999, `First operand ${a} out of range`);
    assert.ok(b >= 2 && b <= 9, `Second operand ${b} out of range`);
  }
});

test("S20D multiplication: answers are correct", () => {
  const pattern = createMultiplicationPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 1900 + i });
    assert.equal(result.ok, true);
    const a = getIntegerRawValue(result.question.expression.left.value);
    const b = getIntegerRawValue(result.question.expression.right.value);
    const answer = getIntegerRawValue(result.question.finalAnswer);
    assert.equal(a * b, answer, `${a} × ${b} != ${answer}`);
  }
});

test("S20D multiplication: first operands are not all multiples of 10 or 100", () => {
  const pattern = createMultiplicationPattern();
  const operands = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 2000 + i });
    assert.equal(result.ok, true);
    operands.push(getIntegerRawValue(result.question.expression.left.value));
  }

  const multipleOf10Ratio = ratio(operands, (a) => a % 10 === 0);
  const multipleOf100Ratio = ratio(operands, (a) => a % 100 === 0);

  // Multiples of 10 naturally ~10% of numbers; multiples of 100 ~1%.
  // If we get significantly more than expected, sampling is biased.
  assert.ok(multipleOf10Ratio < 1.0, `All multiplication first operands are multiples of 10`);
  assert.ok(multipleOf100Ratio < 1.0, `All multiplication first operands are multiples of 100`);
  // Do not enforce a strict <0.2 on multiples of 10, since ranges like 1000-9999 make ~10% natural.
});

test("S20D multiplication: expression uniqueness is acceptable", () => {
  const pattern = createMultiplicationPattern();
  const keys = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 2100 + i });
    assert.equal(result.ok, true);
    keys.push(result.question.duplicateKey);
  }

  const uniqueness = uniqueRatio(keys);
  assert.ok(uniqueness >= 0.8, `Multiplication expression uniqueness ${uniqueness} is below 0.8`);
});

// ------- Mixed Operator Sanity Tests -------

test("S20D mixed: generates only enabled operators", () => {
  const pattern = createMixedOperatorPattern();
  const validOperators = new Set(["+", "-", "×", "÷"]);
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 2200 + i });
    assert.equal(result.ok, true);
    for (const op of result.question.operatorsUsed) {
      assert.ok(validOperators.has(op), `Operator "${op}" not in enabled set`);
    }
  }
});

test("S20D mixed: all answers respect answerMax", () => {
  const pattern = createMixedOperatorPattern();
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 2300 + i });
    assert.equal(result.ok, true);
    const answer = getIntegerRawValue(result.question.finalAnswer);
    assert.ok(answer <= 50000, `Mixed answer ${answer} exceeds answerMax 50000`);
  }
});

test("S20D mixed: division is exact and no division by zero", () => {
  const pattern = createMixedOperatorPattern();
  for (let i = 0; i < 200; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 2400 + i });
    assert.equal(result.ok, true);
    if (result.question.operatorsUsed.includes("÷")) {
      const dividend = getIntegerRawValue(result.question.expression.left.value);
      const divisor = getIntegerRawValue(result.question.expression.right.value);
      assert.notEqual(divisor, 0, "Division by zero in mixed mode");
      assert.equal(dividend % divisor, 0, `${dividend} ÷ ${divisor} is not exact in mixed mode`);
    }
  }
});

test("S20D mixed: subtraction results are non-negative", () => {
  const pattern = createMixedOperatorPattern();
  for (let i = 0; i < 200; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 2600 + i });
    assert.equal(result.ok, true);
    if (result.question.operatorsUsed.includes("-")) {
      const answer = getIntegerRawValue(result.question.finalAnswer);
      assert.ok(answer >= 0, `Subtraction answer ${answer} is negative in mixed mode`);
    }
  }
});

test("S20D mixed: expression uniqueness is acceptable", () => {
  const pattern = createMixedOperatorPattern();
  const keys = [];
  for (let i = 0; i < 100; i += 1) {
    const result = generateQuestionFromPattern(pattern, { seed: 2800 + i });
    assert.equal(result.ok, true);
    keys.push(result.question.duplicateKey);
  }

  const uniqueness = uniqueRatio(keys);
  assert.ok(uniqueness >= 0.8, `Mixed expression uniqueness ${uniqueness} is below 0.8`);
});
