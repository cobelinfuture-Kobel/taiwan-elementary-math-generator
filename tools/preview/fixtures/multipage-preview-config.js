import {
  ALLOCATION_MODES,
  GENERATION_MODES,
  OPERATORS,
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  WORKSHEET_ORDERING_MODES
} from "../../../src/core/index.js";
import { createDefaultConfig } from "../../../src/core/default-config.js";

export function createMultipagePreviewConfig() {
  const config = createDefaultConfig();

  config.generationMode = GENERATION_MODES.MIXED_PATTERN;
  config.generation.questionCount = 9;
  config.printLayout.columns = 2;
  config.printLayout.rowsPerPage = 2;
  config.printLayout.showAnswerKeyPage = true;
  config.patternPlan.patternPool.selectionMode = "multiple";
  config.patternPlan.patternPool.patterns = [
    createPattern("multi_add", OPERATORS.ADD, "addition"),
    createPattern("multi_sub", OPERATORS.SUBTRACT, "subtraction"),
    createPattern("multi_mix", OPERATORS.ADD, "mixedReview")
  ];
  config.patternPlan.allocation = {
    mode: ALLOCATION_MODES.FIXED_COUNTS,
    totalQuestionCount: 9,
    fixedCounts: [
      { patternId: "multi_add", questionCount: 3 },
      { patternId: "multi_sub", questionCount: 3 },
      { patternId: "multi_mix", questionCount: 3 }
    ],
    weights: []
  };
  config.patternPlan.mixedPatternMode = {
    enabled: true,
    allowRepeatedPatterns: false,
    weightingEnabled: false
  };
  config.patternPlan.worksheetOrdering = {
    mode: WORKSHEET_ORDERING_MODES.GROUPED_BY_PATTERN,
    stablePatternOrder: ["multi_add", "multi_sub", "multi_mix"]
  };

  return config;
}

function createPattern(patternId, operator, skillTag) {
  return {
    patternId,
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: [patternId],
    skillTags: [skillTag],
    difficultyTags: ["multipage"],
    curriculumNodeIds: [`curriculum_${patternId}`],
    canonicalSkillIds: [`canonical_${skillTag}`],
    expressionTemplate: {
      operandCount: 2,
      allowedOperatorsBySlot: [[operator]],
      operandDigitConstraints: [],
      answerConstraintPatch: null,
      intermediateConstraintPatch: null,
      divisionPattern: null,
      algorithmicComplexityPolicy: null
    },
    generatorConfigPatch: {
      expression: {
        operandRanges: [
          { position: 1, min: operator === OPERATORS.SUBTRACT ? 8 : 4, max: 18, allowZero: false, allowOne: true },
          { position: 2, min: 2, max: 8, allowZero: false, allowOne: true }
        ]
      },
      answerConstraint: {
        min: 0,
        max: 60,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    notes: null
  };
}
