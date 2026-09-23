import {
  ALLOCATION_MODES,
  GENERATION_MODES,
  OPERATORS,
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  WORKSHEET_ORDERING_MODES
} from "../../../src/core/index.js";
import { createDefaultConfig } from "../../../src/core/default-config.js";

export function createShuffledPreviewConfig() {
  const config = createDefaultConfig();

  config.generationMode = GENERATION_MODES.MIXED_PATTERN;
  config.generation.questionCount = 6;
  config.printLayout.columns = 2;
  config.printLayout.rowsPerPage = 2;
  config.printLayout.showAnswerKeyPage = true;
  config.patternPlan.patternPool.selectionMode = "multiple";
  config.patternPlan.patternPool.patterns = [
    createPattern("shuffle_add", OPERATORS.ADD, "addition"),
    createPattern("shuffle_sub", OPERATORS.SUBTRACT, "subtraction")
  ];
  config.patternPlan.allocation = {
    mode: ALLOCATION_MODES.EQUAL_DISTRIBUTION,
    totalQuestionCount: 6,
    fixedCounts: [],
    weights: []
  };
  config.patternPlan.mixedPatternMode = {
    enabled: true,
    allowRepeatedPatterns: false,
    weightingEnabled: false
  };
  config.patternPlan.worksheetOrdering = {
    mode: WORKSHEET_ORDERING_MODES.SHUFFLE_ACROSS_PATTERNS,
    stablePatternOrder: ["shuffle_add", "shuffle_sub"]
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
    difficultyTags: ["mixed"],
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
          { position: 1, min: operator === OPERATORS.SUBTRACT ? 7 : 3, max: 15, allowZero: false, allowOne: true },
          { position: 2, min: 2, max: 7, allowZero: false, allowOne: true }
        ]
      },
      answerConstraint: {
        min: 0,
        max: 50,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    notes: null
  };
}
