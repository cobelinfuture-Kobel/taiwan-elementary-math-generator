import { fileURLToPath } from "node:url";

import { materializeP03DW3ProtectedD0CompatibilityRevalidation } from "../../src/curriculum/full-product/p03d-w3-protected-d0-compatibility-revalidation.mjs";

const EXPECTED_PROTECTED_IDS = [
  "kp_g3a_u01_digit_arrangement_max_min",
  "kp_g4a_u01_boundary_number_difference",
  "kp_g4a_u01_missing_digit_comparison_extreme_digit",
  "kp_g4b_u01_trailing_zero_division_remainder_restore",
];

const FREEZE_AFTER_FIRST_CI_FIELDS = new Set([
  "revalidatedProtectedCount",
  "publicPatternGroupCount",
  "publicPatternSpecCount",
  "compatibilityWitnessCount",
  "generatedQuestionCount",
  "answerKeyWitnessCount",
  "htmlWitnessCount",
  "printLayoutWitnessCount",
  "globalAuthorityWitnessCount",
]);

function push(errors, condition, code) {
  if (!condition) errors.push(code);
}

export function validateP03DW3ProtectedD0CompatibilityRevalidation() {
  const runtime = materializeP03DW3ProtectedD0CompatibilityRevalidation();
  const errors = [];
  const expected = runtime.manifest.expectedCounts;

  push(errors, runtime.taskId === "P03D_W3ProtectedD0CompatibilityRevalidation", "P03D_TASK_ID_DRIFT");
  push(errors, JSON.stringify([...runtime.protectedKnowledgePointIds].sort()) === JSON.stringify(EXPECTED_PROTECTED_IDS), `P03D_PROTECTED_IDENTITY_DRIFT:${runtime.protectedKnowledgePointIds.join(",")}`);
  push(errors, runtime.predecessor.taskId === "P03C_W3CapabilityCloseoutAndProductUnblockReconciliation", "P03D_PREDECESSOR_DRIFT");
  push(errors, runtime.predecessor.metrics.productionAdmittedW3CapabilityCount === 7, `P03D_PREDECESSOR_CAPABILITY_COUNT_DRIFT:${runtime.predecessor.metrics.productionAdmittedW3CapabilityCount}`);
  push(errors, runtime.predecessor.metrics.capabilityUnblockedKnowledgePointCount === 119, `P03D_PREDECESSOR_UNBLOCK_COUNT_DRIFT:${runtime.predecessor.metrics.capabilityUnblockedKnowledgePointCount}`);
  push(errors, runtime.predecessor.metrics.protectedExistingD0KnowledgePointCount === 4, `P03D_PREDECESSOR_PROTECTED_COUNT_DRIFT:${runtime.predecessor.metrics.protectedExistingD0KnowledgePointCount}`);
  push(errors, runtime.predecessor.metrics.newProductDependentKnowledgePointCount === 115, `P03D_PREDECESSOR_NEW_PRODUCT_COUNT_DRIFT:${runtime.predecessor.metrics.newProductDependentKnowledgePointCount}`);

  push(errors, runtime.metrics.protectedKnowledgePointCount === 4, `P03D_PROTECTED_KP_COUNT_DRIFT:${runtime.metrics.protectedKnowledgePointCount}`);
  push(errors, runtime.metrics.protectedSourceCount === 3, `P03D_PROTECTED_SOURCE_COUNT_DRIFT:${runtime.metrics.protectedSourceCount}`);
  push(errors, runtime.metrics.historicallyProductionAdmittedCount === 4, `P03D_HISTORICAL_ADMISSION_COUNT_DRIFT:${runtime.metrics.historicallyProductionAdmittedCount}`);
  push(errors, runtime.metrics.capabilityUnblockedProtectedCount === 4, `P03D_CAPABILITY_UNBLOCKED_COUNT_DRIFT:${runtime.metrics.capabilityUnblockedProtectedCount}`);
  push(errors, runtime.metrics.revalidatedProtectedCount === 4, `P03D_REVALIDATED_COUNT_DRIFT:${runtime.metrics.revalidatedProtectedCount}`);
  push(errors, runtime.metrics.publicPatternGroupCount > 0, "P03D_PUBLIC_PATTERN_GROUPS_EMPTY");
  push(errors, runtime.metrics.publicPatternSpecCount > 0, "P03D_PUBLIC_PATTERN_SPECS_EMPTY");
  push(errors, runtime.metrics.compatibilityWitnessCount > 0, "P03D_COMPATIBILITY_WITNESSES_EMPTY");
  push(errors, runtime.metrics.compatibilityWitnessPassCount === runtime.metrics.compatibilityWitnessCount, `P03D_WITNESS_PASS_COUNT_DRIFT:${runtime.metrics.compatibilityWitnessPassCount}/${runtime.metrics.compatibilityWitnessCount}`);
  push(errors, runtime.metrics.compatibilityWitnessFailCount === 0, `P03D_WITNESS_FAILURES:${runtime.metrics.compatibilityWitnessFailCount}`);
  push(errors, runtime.metrics.answerKeyWitnessCount === runtime.metrics.compatibilityWitnessCount, `P03D_ANSWER_KEY_WITNESS_DRIFT:${runtime.metrics.answerKeyWitnessCount}/${runtime.metrics.compatibilityWitnessCount}`);
  push(errors, runtime.metrics.htmlWitnessCount === runtime.metrics.compatibilityWitnessCount, `P03D_HTML_WITNESS_DRIFT:${runtime.metrics.htmlWitnessCount}/${runtime.metrics.compatibilityWitnessCount}`);
  push(errors, runtime.metrics.printLayoutWitnessCount === runtime.metrics.compatibilityWitnessCount, `P03D_PRINT_LAYOUT_WITNESS_DRIFT:${runtime.metrics.printLayoutWitnessCount}/${runtime.metrics.compatibilityWitnessCount}`);
  push(errors, runtime.metrics.globalAuthorityWitnessCount === runtime.metrics.compatibilityWitnessCount, `P03D_GLOBAL_AUTHORITY_WITNESS_DRIFT:${runtime.metrics.globalAuthorityWitnessCount}/${runtime.metrics.compatibilityWitnessCount}`);
  push(errors, runtime.metrics.preservedProtectedProductAdmissionCount === 4, `P03D_PRESERVED_ADMISSION_COUNT_DRIFT:${runtime.metrics.preservedProtectedProductAdmissionCount}`);
  push(errors, runtime.metrics.newProductAdmissionCount === 0, `P03D_NEW_PRODUCT_ADMISSION_FABRICATED:${runtime.metrics.newProductAdmissionCount}`);
  push(errors, runtime.metrics.unaffectedNewProductRowCount === 115, `P03D_UNAFFECTED_NEW_PRODUCT_ROWS_DRIFT:${runtime.metrics.unaffectedNewProductRowCount}`);

  for (const row of runtime.rows) {
    push(errors, EXPECTED_PROTECTED_IDS.includes(row.knowledgePointId), `P03D_UNEXPECTED_PROTECTED_ROW:${row.knowledgePointId}`);
    push(errors, row.protectedExistingD0 === true, `P03D_ROW_NOT_PROTECTED:${row.knowledgePointId}`);
    push(errors, row.historicalProductProductionAdmitted === true, `P03D_HISTORICAL_ADMISSION_LOST:${row.knowledgePointId}`);
    push(errors, row.capabilityUnblocked === true, `P03D_CAPABILITY_STILL_BLOCKED:${row.knowledgePointId}`);
    push(errors, row.checks.predecessorPendingState === true, `P03D_PREDECESSOR_STATE_DRIFT:${row.knowledgePointId}:${row.historicalProductAdmissionState}`);
    push(errors, row.checks.publicSourceSelectable === true, `P03D_PUBLIC_SOURCE_NOT_SELECTABLE:${row.knowledgePointId}:${row.sourceId}`);
    push(errors, row.checks.publicKnowledgePointVisible === true, `P03D_PUBLIC_KP_NOT_VISIBLE:${row.knowledgePointId}`);
    push(errors, row.checks.publicPatternGroupsPresent === true, `P03D_PATTERN_GROUPS_MISSING:${row.knowledgePointId}`);
    push(errors, row.checks.publicPatternSpecsPresent === true, `P03D_PATTERN_SPECS_MISSING:${row.knowledgePointId}`);
    push(errors, row.checks.everyPatternWitnessPassed === true, `P03D_PATTERN_WITNESS_BLOCKED:${row.knowledgePointId}`);
    push(errors, row.compatibilityRevalidated === true, `P03D_ROW_NOT_REVALIDATED:${row.knowledgePointId}`);
    push(errors, row.successorProductAdmissionState === "PROTECTED_D0_COMPATIBILITY_REVALIDATED_ADMISSION_PRESERVED", `P03D_SUCCESSOR_STATE_DRIFT:${row.knowledgePointId}:${row.successorProductAdmissionState}`);
    push(errors, row.productProductionAdmitted === true, `P03D_PROTECTED_ADMISSION_NOT_PRESERVED:${row.knowledgePointId}`);
    push(errors, row.newlyProductAdmittedByP03D === false, `P03D_PRODUCT_ADMISSION_RECREATED:${row.knowledgePointId}`);
    push(errors, row.compatibilityWitnesses.length === row.publicPatternGroupIds.length, `P03D_WITNESS_PATTERN_COUNT_DRIFT:${row.knowledgePointId}`);

    for (const witness of row.compatibilityWitnesses) {
      push(errors, witness.passed === true, `P03D_WITNESS_BLOCKED:${witness.witnessId}:${JSON.stringify(witness.issues)}`);
      push(errors, witness.checks.worksheetBuildPass === true, `P03D_WORKSHEET_BUILD_FAILED:${witness.witnessId}`);
      push(errors, witness.checks.validatorPass === true, `P03D_VALIDATOR_FAILED:${witness.witnessId}:${witness.issues.join(",")}`);
      push(errors, witness.checks.generatedQuestionPass === true, `P03D_QUESTION_EMPTY:${witness.witnessId}`);
      push(errors, witness.checks.answerKeyPass === true, `P03D_ANSWER_KEY_EMPTY:${witness.witnessId}`);
      push(errors, witness.checks.htmlRenderPass === true, `P03D_HTML_RENDER_FAILED:${witness.witnessId}`);
      push(errors, witness.checks.printLayoutPass === true, `P03D_PRINT_LAYOUT_MISSING:${witness.witnessId}`);
      push(errors, witness.checks.globalAuthorityCutoverPass === true, `P03D_GLOBAL_AUTHORITY_INVALID:${witness.witnessId}:${JSON.stringify(witness.authority)}`);
      push(errors, witness.checks.knowledgePointIdentityPass === true, `P03D_KP_IDENTITY_NOT_PRESERVED:${witness.witnessId}`);
      push(errors, witness.checks.patternGroupIdentityPass === true, `P03D_PATTERN_IDENTITY_NOT_PRESERVED:${witness.witnessId}`);
    }
  }

  for (const [field, expectedValue] of Object.entries(expected)) {
    if (!(field in runtime.metrics)) continue;
    if (FREEZE_AFTER_FIRST_CI_FIELDS.has(field) && expectedValue === 0) continue;
    push(errors, runtime.metrics[field] === expectedValue, `P03D_MANIFEST_COUNT_DRIFT:${field}:${runtime.metrics[field]}:${expectedValue}`);
  }

  push(errors, runtime.manifest.mainlineBoundary.historicalP03InventoryMutated === false, "P03D_HISTORICAL_P03_MUTATION_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.p03CReconciliationMutated === false, "P03D_P03C_MUTATION_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.capabilityPromotionChanged === false, "P03D_PROMOTION_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.protectedProductAdmissionChanged === false, "P03D_PROTECTED_ADMISSION_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.newProductAdmissionChanged === false, "P03D_NEW_PRODUCT_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.formalMappingImplementationStarted === false, "P03D_FORMAL_MAPPING_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.patternSpecImplementationStarted === false, "P03D_PATTERNSPEC_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.generatorBehaviorChanged === false, "P03D_GENERATOR_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.publicUiFeatureChanged === false, "P03D_UI_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.worksheetRendererBehaviorChanged === false, "P03D_RENDERER_SCOPE_DRIFT");
  push(errors, runtime.manifest.mainlineBoundary.visibleOutputChanged === false, "P03D_VISIBLE_OUTPUT_SCOPE_DRIFT");
  push(errors, runtime.manifest.exactAcceptance.chromiumRequired === true, "P03D_CHROMIUM_REQUIREMENT_DRIFT");

  const counts = Object.freeze({
    protectedKnowledgePoints: runtime.metrics.protectedKnowledgePointCount,
    protectedSources: runtime.metrics.protectedSourceCount,
    revalidatedProtected: runtime.metrics.revalidatedProtectedCount,
    patternGroups: runtime.metrics.publicPatternGroupCount,
    patternSpecs: runtime.metrics.publicPatternSpecCount,
    witnesses: runtime.metrics.compatibilityWitnessCount,
    generatedQuestions: runtime.metrics.generatedQuestionCount,
    answerKeyWitnesses: runtime.metrics.answerKeyWitnessCount,
    htmlWitnesses: runtime.metrics.htmlWitnessCount,
    printLayoutWitnesses: runtime.metrics.printLayoutWitnessCount,
    globalAuthorityWitnesses: runtime.metrics.globalAuthorityWitnessCount,
    preservedAdmissions: runtime.metrics.preservedProtectedProductAdmissionCount,
    newProductAdmissions: runtime.metrics.newProductAdmissionCount,
    unaffectedNewProductRows: runtime.metrics.unaffectedNewProductRowCount,
  });

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts,
    protectedRows: Object.freeze(runtime.rows.map((row) => Object.freeze({
      knowledgePointId: row.knowledgePointId,
      sourceId: row.sourceId,
      patternGroupCount: row.publicPatternGroupIds.length,
      patternSpecCount: row.publicPatternSpecIds.length,
      witnessCount: row.compatibilityWitnesses.length,
      compatibilityRevalidated: row.compatibilityRevalidated,
      successorProductAdmissionState: row.successorProductAdmissionState,
    }))),
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const result = validateP03DW3ProtectedD0CompatibilityRevalidation();
  process.stdout.write(`P03D_READBACK ${JSON.stringify(result.counts)}\n`);
  process.stdout.write(`P03D_PROTECTED_ROWS ${JSON.stringify(result.protectedRows)}\n`);
  if (!result.ok) {
    process.stderr.write(`${result.errors.join("\n")}\n`);
    process.exitCode = 1;
  }
}
