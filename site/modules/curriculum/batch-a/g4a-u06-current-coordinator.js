import {
  buildBatchABrowserPlan as buildLegacyPlan,
} from "./batch-a-browser-generator-p03f33.js";

import {
  generateG4AU06FractionClassificationSlice017Questions,
  validateG4AU06FractionClassificationSlice017Question,
} from "./fraction-type-classification-runtime-p03f17.js";

import {
  generateG4AU06P03F25Questions,
  validateG4AU06P03F25Question,
} from "./improper-mixed-integer-conversion-runtime-p03f25.js";

import {
  generateG4AU06P03F33Questions,
  validateG4AU06P03F33Question,
} from "./g4a-u06-rank9-fraction-runtime-p03f33.js";

import {
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
} from "../registry/g4a-u06-fraction-type-classification-selector-projection.js";

import {
  G4A_U06_P03F25_KP_ID,
  G4A_U06_P03F25_PATTERN_SPEC_IDS,
} from "../registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";

import {
  G4A_U06_P03F33_SURFACES,
} from "../registry/g4a-u06-rank9-fraction-selector-projection-p03f33.js";

const SOURCE_ID =
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID;

const issue = (code, path) => ({
  code,
  severity: "error",
  path,
  message: code,
});

const SPEC_IDS_BY_KP = Object.freeze({
  [G4A_U06_FRACTION_CLASSIFICATION_KP_ID]:
    Object.freeze([
      ...G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
    ]),

  [G4A_U06_P03F25_KP_ID]:
    Object.freeze([
      ...G4A_U06_P03F25_PATTERN_SPEC_IDS,
    ]),

  ...Object.fromEntries(
    G4A_U06_P03F33_SURFACES.map((surface) => [
      surface.knowledgePointId,
      Object.freeze([...surface.patternSpecIds]),
    ]),
  ),
});

export const G4A_U06_CURRENT_KP_IDS =
  Object.freeze(Object.keys(SPEC_IDS_BY_KP));

export const G4A_U06_CURRENT_PATTERN_SPEC_IDS =
  Object.freeze(
    G4A_U06_CURRENT_KP_IDS.flatMap(
      (knowledgePointId) =>
        SPEC_IDS_BY_KP[knowledgePointId],
    ),
  );

const CURRENT_KP_SET =
  new Set(G4A_U06_CURRENT_KP_IDS);

const SLICE017_SPEC_SET =
  new Set(
    G4A_U06_FRACTION_CLASSIFICATION_PATTERN_SPEC_IDS,
  );

const SLICE025_SPEC_SET =
  new Set(G4A_U06_P03F25_PATTERN_SPEC_IDS);

const SLICE033_SPEC_SET =
  new Set(
    G4A_U06_P03F33_SURFACES.flatMap(
      (surface) => surface.patternSpecIds,
    ),
  );

function uniqueStrings(values = []) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map((value) => String(value ?? "").trim())
        .filter(Boolean),
    ),
  ];
}

function resolveSelectedKnowledgePointIds(options = {}) {
  const requested = uniqueStrings(
    options.selectedKnowledgePointIds,
  ).filter(
    (knowledgePointId) =>
      CURRENT_KP_SET.has(knowledgePointId),
  );

  const selectionMode =
    options.selectionMode ?? "sourceUnit";

  if (selectionMode === "singleKnowledgePoint") {
    return [
      requested[0]
      ?? G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
    ];
  }

  if (
    selectionMode === "mixedKnowledgePointsSameUnit"
  ) {
    return requested.length > 0
      ? requested
      : [...G4A_U06_CURRENT_KP_IDS];
  }

  return [...G4A_U06_CURRENT_KP_IDS];
}

function allocateAcrossKnowledgePoints(
  knowledgePointIds,
  questionCount,
) {
  const baseCount = Math.floor(
    questionCount / knowledgePointIds.length,
  );

  let remainder =
    questionCount % knowledgePointIds.length;

  return knowledgePointIds
    .map((knowledgePointId) => {
      const allocatedQuestionCount =
        baseCount + (remainder > 0 ? 1 : 0);

      if (remainder > 0) {
        remainder -= 1;
      }

      return Object.freeze({
        knowledgePointId,
        questionCount: allocatedQuestionCount,
      });
    })
    .filter((entry) => entry.questionCount > 0);
}

function hashSeed(value) {
  let hash = 2166136261;

  for (const character of String(value)) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function mix32(value) {
  let mixed = value >>> 0;

  mixed ^= mixed << 13;
  mixed ^= mixed >>> 17;
  mixed ^= mixed << 5;

  return mixed >>> 0;
}

function groupedByPattern(questions, patternSpecIds) {
  const patternOrder = new Map(
    patternSpecIds.map(
      (patternSpecId, index) => [
        patternSpecId,
        index,
      ],
    ),
  );

  const originalOrder = new Map(
    questions.map(
      (question, index) => [question, index],
    ),
  );

  return [...questions].sort((left, right) => {
    const patternDifference =
      (patternOrder.get(left.patternSpecId) ?? 999)
      - (patternOrder.get(right.patternSpecId) ?? 999);

    if (patternDifference !== 0) {
      return patternDifference;
    }

    return (
      originalOrder.get(left)
      - originalOrder.get(right)
    );
  });
}

function shuffleAcrossPatterns(
  questions,
  generationSeed,
) {
  const shuffled = [...questions];

  let state = hashSeed(
    `${generationSeed}:g4a-u06-ordering`,
  );

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    state = mix32(state + index);

    const swapIndex =
      state % (index + 1);

    [
      shuffled[index],
      shuffled[swapIndex],
    ] = [
      shuffled[swapIndex],
      shuffled[index],
    ];
  }

  return shuffled;
}

function applyOrdering(questions, plan) {
  if (plan.ordering === "shuffleAcrossPatterns") {
    return shuffleAcrossPatterns(
      questions,
      plan.generationSeed,
    );
  }

  return groupedByPattern(
    questions,
    plan.patternSpecIds,
  );
}

export function buildG4AU06CurrentPlan(options = {}) {
  const legacyPlan = buildLegacyPlan(options);

  const selectedKnowledgePointIds =
    resolveSelectedKnowledgePointIds(options);

  const patternSpecIds =
    selectedKnowledgePointIds.flatMap(
      (knowledgePointId) =>
        SPEC_IDS_BY_KP[knowledgePointId] ?? [],
    );

  return Object.freeze({
    ...legacyPlan,

    sourceId: SOURCE_ID,

    selectionMode:
      options.selectionMode
      ?? legacyPlan.selectionMode
      ?? "sourceUnit",

    selectedKnowledgePointIds:
      Object.freeze([
        ...selectedKnowledgePointIds,
      ]),

    requestedKnowledgePointIds:
      Object.freeze([
        ...selectedKnowledgePointIds,
      ]),

    selectedPatternGroupIds:
      Object.freeze(
        uniqueStrings(
          options.selectedPatternGroupIds,
        ),
      ),

    patternSpecIds:
      Object.freeze([...patternSpecIds]),

    questionCount:
      Number(
        options.questionCount
        ?? legacyPlan.questionCount
        ?? 20,
      ),

    questionMode: "numeric",

    ordering:
      options.ordering
      === "shuffleAcrossPatterns"
        ? "shuffleAcrossPatterns"
        : "groupedByPattern",

    generationSeed:
      String(
        options.generationSeed
        ?? legacyPlan.generationSeed
        ?? "batch-a-browser",
      ),

    allocation: null,
    genericFallbackAllowed: false,
  });
}

export function validateG4AU06CurrentPlan(plan = {}) {
  const errors = [];

  if (plan.sourceId !== SOURCE_ID) {
    errors.push(
      issue(
        "g4a_u06_current_source_invalid",
        "sourceId",
      ),
    );
  }

  if (
    !Number.isInteger(plan.questionCount)
    || plan.questionCount < 1
    || plan.questionCount > 240
  ) {
    errors.push(
      issue(
        "g4a_u06_current_question_count_invalid",
        "questionCount",
      ),
    );
  }

  if (
    ![
      "groupedByPattern",
      "shuffleAcrossPatterns",
    ].includes(plan.ordering)
  ) {
    errors.push(
      issue(
        "g4a_u06_current_ordering_invalid",
        "ordering",
      ),
    );
  }

  if (
    !Array.isArray(
      plan.selectedKnowledgePointIds,
    )
    || plan.selectedKnowledgePointIds.length < 1
    || plan.selectedKnowledgePointIds.some(
      (knowledgePointId) =>
        !CURRENT_KP_SET.has(knowledgePointId),
    )
  ) {
    errors.push(
      issue(
        "g4a_u06_current_kp_selection_invalid",
        "selectedKnowledgePointIds",
      ),
    );
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
  });
}

function generatorForKnowledgePoint(
  knowledgePointId,
) {
  if (
    knowledgePointId
    === G4A_U06_FRACTION_CLASSIFICATION_KP_ID
  ) {
    return generateG4AU06FractionClassificationSlice017Questions;
  }

  if (
    knowledgePointId
    === G4A_U06_P03F25_KP_ID
  ) {
    return generateG4AU06P03F25Questions;
  }

  return generateG4AU06P03F33Questions;
}

export function validateG4AU06CurrentQuestion(
  question = {},
) {
  const patternSpecId =
    question.patternSpecId
    ?? question.metadata?.patternId;

  if (SLICE017_SPEC_SET.has(patternSpecId)) {
    return validateG4AU06FractionClassificationSlice017Question(
      question,
    );
  }

  if (SLICE025_SPEC_SET.has(patternSpecId)) {
    return validateG4AU06P03F25Question(
      question,
    );
  }

  if (SLICE033_SPEC_SET.has(patternSpecId)) {
    return validateG4AU06P03F33Question(
      question,
    );
  }

  return Object.freeze({
    ok: false,
    errors: Object.freeze([
      issue(
        "g4a_u06_current_pattern_invalid",
        "patternSpecId",
      ),
    ]),
    warnings: Object.freeze([]),
  });
}

export function validateG4AU06CurrentQuestions(
  questions = [],
) {
  const errors = [];

  questions.forEach((question, index) => {
    const validation =
      validateG4AU06CurrentQuestion(question);

    errors.push(
      ...validation.errors.map((error) => ({
        ...error,
        path:
          `questions[${index}].${error.path}`,
      })),
    );
  });

  const uniquePromptCount = new Set(
    questions.map(
      (question) =>
        String(
          question.blankedDisplayText ?? "",
        ).trim(),
    ),
  ).size;

  if (uniquePromptCount !== questions.length) {
    errors.push(
      issue(
        "g4a_u06_current_duplicate_prompt_detected",
        "questions",
      ),
    );
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    infos: Object.freeze([]),
    validatorVersion:
      "g4a-u06-current-coordinator-v1",
    validatedAt: null,
  });
}

export function generateG4AU06CurrentQuestions(
  options = {},
) {
  const plan =
    options.plan
    ?? buildG4AU06CurrentPlan(options);

  const planValidation =
    validateG4AU06CurrentPlan(plan);

  if (!planValidation.ok) {
    return Object.freeze({
      ok: false,
      errors: planValidation.errors,
      warnings: planValidation.warnings,
      questions: Object.freeze([]),
      allocation: Object.freeze([]),
      knowledgePointAllocation:
        Object.freeze([]),
      plan,
    });
  }

  const knowledgePointAllocation =
    allocateAcrossKnowledgePoints(
      plan.selectedKnowledgePointIds,
      plan.questionCount,
    );

  const generatedQuestions = [];
  const errors = [];

  for (
    const entry of knowledgePointAllocation
  ) {
    const generator =
      generatorForKnowledgePoint(
        entry.knowledgePointId,
      );

    const generation = generator({
      ...options,

      plan: undefined,

      sourceId: SOURCE_ID,

      selectionMode:
        "singleKnowledgePoint",

      selectedKnowledgePointIds: [
        entry.knowledgePointId,
      ],

      selectedPatternGroupIds: [],
      patternSpecIds: undefined,

      questionMode: "numeric",

      questionCount:
        entry.questionCount,

      ordering: "groupedByPattern",

      generationSeed:
        `${plan.generationSeed}:${entry.knowledgePointId}`,
    });

    if (!generation.ok) {
      errors.push(
        ...generation.errors.map((error) => ({
          ...error,
          path:
            `${entry.knowledgePointId}.${error.path}`,
        })),
      );

      continue;
    }

    generatedQuestions.push(
      ...generation.questions,
    );
  }

  if (
    generatedQuestions.length
    !== plan.questionCount
  ) {
    errors.push(
      issue(
        "g4a_u06_current_output_count_mismatch",
        "questions",
      ),
    );
  }

  const orderedQuestions =
    applyOrdering(
      generatedQuestions,
      plan,
    );

  const questionValidation =
    validateG4AU06CurrentQuestions(
      orderedQuestions,
    );

  errors.push(...questionValidation.errors);

  const allocation =
    plan.patternSpecIds
      .map((patternSpecId) =>
        Object.freeze({
          patternSpecId,
          questionCount:
            orderedQuestions.filter(
              (question) =>
                question.patternSpecId
                === patternSpecId,
            ).length,
        }),
      )
      .filter(
        (entry) =>
          entry.questionCount > 0,
      );

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),

    questions:
      Object.freeze(orderedQuestions),

    allocation:
      Object.freeze(allocation),

    knowledgePointAllocation:
      Object.freeze(
        knowledgePointAllocation,
      ),

    plan,
  });
}
