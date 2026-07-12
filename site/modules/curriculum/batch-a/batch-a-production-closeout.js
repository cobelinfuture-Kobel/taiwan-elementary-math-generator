import { BATCH_A_SOURCE_UNITS } from "./source-units.js";

export const BATCH_A_PRODUCTION_SOURCE_IDS = Object.freeze([
  "g3a_u01_3a01",
  "g3a_u02_3a02",
  "g3a_u03_3a03",
  "g3a_u06_3a06",
  "g3b_u01_3b01",
  "g3b_u04_3b04",
  "g3b_u08_3b08",
  "g4a_u01_4a01",
  "g4a_u02_4a02",
  "g4a_u04_4a04",
  "g4a_u08_4a08",
  "g4b_u01_4b01",
  "g5a_u08_5a08",
]);

export const BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT = Object.freeze({
  task: "S60M_BatchA_AllUnitsProductionCloseout",
  status: "all_source_unit_production_gate_integrated",
  batch: "A",
  sourceUnitCount: 13,
  sourceIds: BATCH_A_PRODUCTION_SOURCE_IDS,
  publicSurfaces: Object.freeze(["classic", "fallback404", "pixel"]),
  requiredOrderingModes: Object.freeze(["groupedByPattern", "shuffleAcrossPatterns"]),
  answerKeyModes: Object.freeze([true, false]),
  productionCapabilities: Object.freeze([
    "source_selectable",
    "question_generation",
    "blocking_validation",
    "worksheet_assembly",
    "answer_key_assembly",
    "html_preview",
    "print_output",
  ]),
  scope: "batch_a_source_unit_production_path",
  enhancedKnowledgePointRoutesRemainUnitScoped: true,
  productionUse: "allowed",
  goalDistance: "D0_BATCH_A_SOURCE_UNIT_WORKSHEET",
  nextGate: "S61_BatchBPlanningAndSourcePriorityLock",
});

export function validateBatchAAllUnitsProductionCloseoutContract() {
  const errors = [];
  const actualIds = BATCH_A_SOURCE_UNITS.map((unit) => unit.sourceId);
  const expectedIds = [...BATCH_A_PRODUCTION_SOURCE_IDS];
  if (actualIds.length !== 13) errors.push("source_unit_count_mismatch");
  if (new Set(actualIds).size !== actualIds.length) errors.push("duplicate_source_id");
  if (JSON.stringify(actualIds) !== JSON.stringify(expectedIds)) errors.push("source_unit_order_or_membership_mismatch");
  if (BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.productionUse !== "allowed") errors.push("production_use_not_allowed");
  if (BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.publicSurfaces.length !== 3) errors.push("public_surface_count_mismatch");
  if (BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.requiredOrderingModes.length !== 2) errors.push("ordering_mode_count_mismatch");
  if (BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.answerKeyModes.length !== 2) errors.push("answer_key_mode_count_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      sourceUnits: actualIds.length,
      publicSurfaces: BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.publicSurfaces.length,
      orderingModes: BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.requiredOrderingModes.length,
      answerKeyModes: BATCH_A_ALL_UNITS_PRODUCTION_CLOSEOUT.answerKeyModes.length,
    }),
  });
}
