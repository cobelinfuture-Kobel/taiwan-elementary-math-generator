import {
  ALLOCATION_MODES,
  GENERATION_MODES,
  OPERATORS,
  QUESTION_KINDS,
  SUPPORT_STATUSES,
  WORKSHEET_ORDERING_MODES,
  createDefaultConfig
} from "../../../modules/core/index.js";

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cloneValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, cloneValue(nestedValue)])
    );
  }

  return value;
}

function createPattern({ patternId, operator, skillTag, difficultyTag, firstMin, firstMax, secondMin, secondMax }) {
  return {
    patternId,
    enabled: true,
    questionKind: QUESTION_KINDS.EXPRESSION,
    supportStatus: [SUPPORT_STATUSES.V1_EXPRESSION_SUPPORTED],
    patternTags: [patternId],
    skillTags: [skillTag],
    difficultyTags: [difficultyTag],
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
          { position: 1, min: firstMin, max: firstMax, allowZero: false, allowOne: true },
          { position: 2, min: secondMin, max: secondMax, allowZero: false, allowOne: true }
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

function createDefaultPresetConfig() {
  return createDefaultConfig();
}

function createGroupedPresetConfig() {
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
      skillTag: "addition",
      difficultyTag: "basic",
      firstMin: 2,
      firstMax: 12,
      secondMin: 2,
      secondMax: 6
    }),
    createPattern({
      patternId: "group_sub",
      operator: OPERATORS.SUBTRACT,
      skillTag: "subtraction",
      difficultyTag: "basic",
      firstMin: 6,
      firstMax: 12,
      secondMin: 2,
      secondMax: 6
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

function createShuffledPresetConfig() {
  const config = createDefaultConfig();

  config.generationMode = GENERATION_MODES.MIXED_PATTERN;
  config.generation.questionCount = 6;
  config.printLayout.columns = 2;
  config.printLayout.rowsPerPage = 2;
  config.printLayout.showAnswerKeyPage = true;
  config.patternPlan.patternPool.selectionMode = "multiple";
  config.patternPlan.patternPool.patterns = [
    createPattern({
      patternId: "shuffle_add",
      operator: OPERATORS.ADD,
      skillTag: "addition",
      difficultyTag: "mixed",
      firstMin: 3,
      firstMax: 15,
      secondMin: 2,
      secondMax: 7
    }),
    createPattern({
      patternId: "shuffle_sub",
      operator: OPERATORS.SUBTRACT,
      skillTag: "subtraction",
      difficultyTag: "mixed",
      firstMin: 7,
      firstMax: 15,
      secondMin: 2,
      secondMax: 7
    })
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

function createMultipagePresetConfig() {
  const config = createDefaultConfig();

  config.generationMode = GENERATION_MODES.MIXED_PATTERN;
  config.generation.questionCount = 9;
  config.printLayout.columns = 2;
  config.printLayout.rowsPerPage = 2;
  config.printLayout.showAnswerKeyPage = true;
  config.patternPlan.patternPool.selectionMode = "multiple";
  config.patternPlan.patternPool.patterns = [
    createPattern({
      patternId: "multi_add",
      operator: OPERATORS.ADD,
      skillTag: "addition",
      difficultyTag: "multipage",
      firstMin: 4,
      firstMax: 18,
      secondMin: 2,
      secondMax: 8
    }),
    createPattern({
      patternId: "multi_sub",
      operator: OPERATORS.SUBTRACT,
      skillTag: "subtraction",
      difficultyTag: "multipage",
      firstMin: 8,
      firstMax: 18,
      secondMin: 2,
      secondMax: 8
    }),
    createPattern({
      patternId: "multi_mix",
      operator: OPERATORS.ADD,
      skillTag: "mixedReview",
      difficultyTag: "multipage",
      firstMin: 4,
      firstMax: 18,
      secondMin: 2,
      secondMax: 8
    })
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

const PRESET_BUILDERS = Object.freeze({
  default: () => ({
    id: "default",
    label: "Default",
    description: "Single-pattern default worksheet.",
    draftConfig: createDefaultPresetConfig(),
    seeds: {
      generationSeed: "default-generation-seed",
      orderingSeed: "default-ordering-seed",
      lockOrderingSeedToGenerationSeed: false
    }
  }),
  grouped: () => ({
    id: "grouped",
    label: "Grouped",
    description: "Grouped mixed-pattern worksheet with answer key pages.",
    draftConfig: createGroupedPresetConfig(),
    seeds: {
      generationSeed: "grouped-generation-seed",
      orderingSeed: "grouped-ordering-seed",
      lockOrderingSeedToGenerationSeed: false
    }
  }),
  shuffled: () => ({
    id: "shuffled",
    label: "Shuffled",
    description: "Deterministic shuffled ordering across patterns.",
    draftConfig: createShuffledPresetConfig(),
    seeds: {
      generationSeed: "shuffled-generation-seed",
      orderingSeed: "shuffled-ordering-seed",
      lockOrderingSeedToGenerationSeed: false
    }
  }),
  multipage: () => ({
    id: "multipage",
    label: "Multipage",
    description: "Multi-page grouped worksheet with answer key pages.",
    draftConfig: createMultipagePresetConfig(),
    seeds: {
      generationSeed: "multipage-generation-seed",
      orderingSeed: "multipage-ordering-seed",
      lockOrderingSeedToGenerationSeed: false
    }
  })
});

export function listPresetDefinitions() {
  return Object.keys(PRESET_BUILDERS).map((presetId) => getPresetDefinition(presetId));
}

export function getPresetDefinition(presetId = "default") {
  const preset = (PRESET_BUILDERS[presetId] ?? PRESET_BUILDERS.default)();
  return {
    ...preset,
    draftConfig: cloneValue(preset.draftConfig),
    seeds: cloneValue(preset.seeds)
  };
}
