import {
  ALLOCATION_MODES,
  BLANK_MODES,
  GENERATION_MODES,
  NUMBER_DOMAINS,
  OPERATORS,
  PAPER_SIZES,
  PREFERRED_V1_PATTERN_SUPPORT_STATUSES,
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  WORKSHEET_ORDERING_MODES
} from "./constants.js";

export function createDefaultConfig() {
  return {
    version: "1",
    numberDomain: {
      kind: NUMBER_DOMAINS.INTEGER
    },
    questionKind: QUESTION_KINDS.EXPRESSION,
    generationMode: GENERATION_MODES.SINGLE_PATTERN,
    metadata: {
      patternTags: [],
      skillTags: [],
      difficultyTags: [],
      curriculumNodeIds: [],
      canonicalSkillIds: []
    },
    expression: {
      operandCount: 2,
      globalOperators: [OPERATORS.ADD, OPERATORS.SUBTRACT],
      operatorSlots: [
        { slot: 1, allowedOperators: [OPERATORS.ADD, OPERATORS.SUBTRACT] }
      ],
      operandRanges: [
        { position: 1, min: 0, max: 20, allowZero: true, allowOne: true },
        { position: 2, min: 0, max: 20, allowZero: true, allowOne: true }
      ],
      digitConstraints: []
    },
    answerConstraint: {
      min: 0,
      max: 100,
      allowZero: true,
      allowNegative: false,
      requireInteger: true
    },
    intermediateConstraint: {
      enabled: false,
      min: null,
      max: null,
      allowNegative: false,
      requireInteger: true
    },
    division: {
      mode: "exactIntegerOnly",
      allowDivideByOne: false,
      allowZeroDividend: true,
      requireExactQuotient: true
    },
    blankMode: {
      mode: BLANK_MODES.SOLVE_FINAL_ANSWER
    },
    generation: {
      questionCount: 20,
      maxAttemptsPerQuestion: 100,
      maxTotalAttempts: 4000
    },
    patternPlan: {
      patternPool: {
        poolId: "default-pool",
        selectionMode: "single",
        patterns: [
          {
            patternId: "default_integer_add_sub_2op",
            enabled: true,
            questionKind: QUESTION_KINDS.EXPRESSION,
            supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
            patternTags: [],
            skillTags: [],
            difficultyTags: [],
            curriculumNodeIds: [],
            canonicalSkillIds: [],
            expressionTemplate: {
              operandCount: 2,
              allowedOperatorsBySlot: [
                [OPERATORS.ADD, OPERATORS.SUBTRACT]
              ],
              operandDigitConstraints: [],
              answerConstraintPatch: null,
              intermediateConstraintPatch: null,
              divisionPattern: null,
              algorithmicComplexityPolicy: null
            },
            generatorConfigPatch: {},
            notes: null
          }
        ]
      },
      allocation: {
        mode: ALLOCATION_MODES.FIXED_COUNTS,
        totalQuestionCount: 20,
        fixedCounts: [
          { patternId: "default_integer_add_sub_2op", questionCount: 20 }
        ],
        weights: []
      },
      mixedPatternMode: {
        enabled: false,
        allowRepeatedPatterns: false,
        weightingEnabled: false
      },
      worksheetOrdering: {
        mode: WORKSHEET_ORDERING_MODES.GROUPED_BY_PATTERN,
        stablePatternOrder: ["default_integer_add_sub_2op"]
      },
      allowedSupportStatuses: [...PREFERRED_V1_PATTERN_SUPPORT_STATUSES]
    },
    printLayout: {
      paperSize: PAPER_SIZES.A4,
      columns: 4,
      rowsPerPage: 10,
      showQuestionNumbers: true,
      showAnswerKeyPage: false
    }
  };
}

export const DEFAULT_CONFIG = createDefaultConfig();
