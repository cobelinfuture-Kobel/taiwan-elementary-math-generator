export const SCHOOL_EXAM_COMPOSITION_MODES = Object.freeze({
  SINGLE_UNIT: "SINGLE_UNIT",
  SINGLE_KP: "SINGLE_KP",
  MIXED_KP_SAME_UNIT: "MIXED_KP_SAME_UNIT",
  MIXED_KP_CROSS_UNIT: "MIXED_KP_CROSS_UNIT",
});

const DEFINITIONS = Object.freeze({
  [SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT]: Object.freeze({
    examMode: SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT,
    batchASelectionMode: "sourceUnit",
    enabled: true,
    milestone: "M2",
  }),
  [SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_KP]: Object.freeze({
    examMode: SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_KP,
    batchASelectionMode: "singleKnowledgePoint",
    enabled: true,
    milestone: "G3A_U01_RANK01_FLAT_SELECTOR",
  }),
  [SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT]: Object.freeze({
    examMode: SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_SAME_UNIT,
    batchASelectionMode: "mixedKnowledgePointsSameUnit",
    enabled: true,
    milestone: "M3",
  }),
  [SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT]: Object.freeze({
    examMode: SCHOOL_EXAM_COMPOSITION_MODES.MIXED_KP_CROSS_UNIT,
    batchASelectionMode: "mixedKnowledgePointsCrossUnit",
    enabled: true,
    milestone: "M4",
    scope: "sameGradeSameSemester",
  }),
});

export function resolveSchoolExamCompositionMode(value) {
  const normalized = String(value ?? "").trim();
  return DEFINITIONS[normalized] ?? DEFINITIONS[SCHOOL_EXAM_COMPOSITION_MODES.SINGLE_UNIT];
}
