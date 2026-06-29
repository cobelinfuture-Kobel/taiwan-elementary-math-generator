import {
  ALLOCATION_MODES,
  GENERATION_MODES,
  OPERATORS,
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  WORKSHEET_ORDERING_MODES
} from "../../../src/core/index.js";
import { createDefaultConfig } from "../../../src/core/default-config.js";

export function createGroupedPreviewConfig() {
  const config = createDefaultConfig();

  config.generationMode = GENERATION_MODES.MIXED_PATTERN;
  config.generation.questionCount = 4;
  config.printLayout.columns = 2;
  config.printLayout.rowsPerPage = 2;
  config.printLayout.showAnswerKeyPage = true;
  config.patternPlan.patternPool.selectionMode = "multiple";
  config.patternPlan.patternPool.patterns = [
    createPattern({
      patternId: "group_add",
      operator: OPERATORS.ADD,
      skillTag: "addition"
    }),
    createPattern({
      patternId: "group_sub",
      operator: OPERATORS.SUBTRACT,
      skillTag: "subtraction"
    })
  ];
  config.patternPlan.allocation = {
    mode: ALLOCATION_MODES.FIXED_COUNTS,
    totalQuestionCount: 4,
    fixedCounts: [
      { patternId: "group_add", questionCount: 2 },
      { patternId: "group_sub", questionCount: 2 }
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
    stablePatternOrder: ["group_sub", "group_add"]
  };

  return config;
}

function createPattern({ patternId, operator, skillTag }) {
  return {
    patternId,
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: [patternId],
    skillTags: [skillTag],
    difficultyTags: ["basic"],
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
          { position: 1, min: operator === OPERATORS.SUBTRACT ? 6 : 2, max: 12, allowZero: false, allowOne: true },
          { position: 2, min: 2, max: 6, allowZero: false, allowOne: true }
        ]
      },
      answerConstraint: {
        min: 0,
        max: 40,
        allowZero: true,
        allowNegative: false,
        requireInteger: true
      }
    },
    notes: null
  };
}
