import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  generateG5AU08CanonicalQuestions,
} from "../../site/modules/curriculum/batch-a/g5a-u08-canonical-router.js";
import {
  G5A_U08_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g5a-u08-promotion.js";

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), "utf8"));

const a00 = readJson("data/curriculum/public-generation/PGC-R07-A00.surface-renderer-print-scope.json");
const a01 = readJson("data/curriculum/public-generation/PGC-R07-A01.three-surface-parity-baseline.json");
const deployed = readJson("docs/ci/latest-g5a-u08-r1-deployed-pages-smoke.json");

const expectedSurfaces = ["CLASSIC", "FALLBACK_404", "PIXEL"];
const expectedOutputs = ["PREVIEW_HTML", "PRINT_HTML", "CHROMIUM_PDF", "ANSWER_KEY"];
const missingOperatorKnowledgePointId = "kp_g5a_u08_missing_operator_inference";
const missingOperatorPatternGroupId = "pg_g5a_u08_missing_operator_reasoning";
const missingOperatorPatternSpecId = "ps_g5a_u08_missing_operator_sequence";

function assertLocalMissingOperatorRecovery() {
  const binding = resolvePublicUiCapabilityBinding({
    sourceId: G5A_U08_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [missingOperatorKnowledgePointId],
    requestedQuestionType: "numeric",
    requestedDepthMode: "mixed",
    requestedContextMode: "mixed",
  });
  assert.equal(binding.blocked, false, binding.blockedReasons.join("|"));
  assert.notEqual(binding.questionType, "numeric");
  assert.equal(binding.availableQuestionTypeOptions.some((row) => row.value === "reasoning"), true);
  const targetGroup = binding.compatiblePatternGroups.find((row) => row.patternGroupId === missingOperatorPatternGroupId);
  assert.ok(targetGroup, `Missing ${missingOperatorPatternGroupId}`);
  assert.equal(targetGroup.effectiveQuestionType, "reasoning");

  const generated = generateG5AU08CanonicalQuestions({
    sourceId: G5A_U08_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [missingOperatorKnowledgePointId],
    selectedPatternGroupIds: [missingOperatorPatternGroupId],
    questionCount: 6,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "g5a-u08-r1-kp-9",
    questionMode: binding.questionType,
    depthMode: "mixed",
    contextMode: "mixed",
    resolverResult: {
      ok: true,
      errors: [],
      warnings: [],
      provenance: {
        resolver: "visiblePatternGroupResolver",
        sourceId: G5A_U08_SOURCE_ID,
      },
    },
  });
  assert.equal(generated.ok, true, generated.errors?.map((row) => row.code).join("|") ?? "");
  assert.equal(generated.questions.length, 6);
  assert.equal(new Set(generated.questions.map((row) => String(row.promptText ?? row.prompt ?? row.blankedDisplayText ?? "").trim())).size, 6);
  assert.equal(generated.allocation.length, 1);
  assert.equal(generated.allocation[0].patternGroupId, missingOperatorPatternGroupId);
  assert.deepEqual(generated.allocation[0].selectedPatternSpecIds, [missingOperatorPatternSpecId]);
}

test("PGC-R07 A01 consumes the merged A00 scope and preserves all counts", () => {
  assert.equal(a01.previousTaskId, a00.taskId);
  assert.equal(a01.scope.surfaceCount, a00.summary.surfaceCount);
  assert.equal(a01.scope.outputProjectionCount, a00.summary.outputProjectionCount);
  assert.equal(a01.scope.rendererBranchCount, a00.rendererBranchesToAudit.length);
  assert.equal(a01.scope.identityFieldCount, a00.summary.identityFieldCount);
  assert.equal(a01.scope.currentPublicSourceCount, a00.summary.publicSourceCount);
  assert.equal(a01.scope.currentVisibleKnowledgePointCount, a00.summary.publicVisibleKnowledgePointCount);
  assert.equal(a01.scope.capabilitySurfaceRowCount, a00.summary.capabilitySurfaceRowCount);
  assert.equal(a01.scope.capacityRouteCount, a00.summary.capacityRouteCount);
});

test("PGC-R07 A01 materializes exactly three surfaces by four output projections", () => {
  assert.equal(a01.baselineRows.length, expectedSurfaces.length * expectedOutputs.length);
  assert.equal(new Set(a01.baselineRows.map((row) => row.rowId)).size, a01.baselineRows.length);
  for (const surfaceId of expectedSurfaces) {
    assert.deepEqual(
      a01.baselineRows.filter((row) => row.surfaceId === surfaceId).map((row) => row.outputProjection),
      expectedOutputs,
    );
  }
});

test("PGC-R07 A01 preserves its historical Classic failure while later deployed smokes may advance", () => {
  assert.ok(["PASS", "FAIL"].includes(deployed.status));
  assert.match(deployed.deploymentSha, /^[0-9a-f]{40}$/);
  assert.ok(Number(deployed.run?.attempt ?? 0) >= 1);
  if (deployed.status === "PASS") {
    assert.equal(deployed.audit?.publicSelectorComplete, true);
    assert.equal(deployed.audit?.generatorValidatorRendererConsistent, true);
  } else {
    const legacySelectorMismatch = /#g5a-u08-question-mode/.test(deployed.message)
      && /did not find some options/.test(deployed.message);
    const advancedAdmissionBoundary = deployed.message === "G5A_U08_R1_UNADMITTED_CONTROL_INTERSECTION_EXPOSED";
    const preDeploymentMissingOperatorEvidence = deployed.message === "G5A_U08_R1_DEPLOYED_GENERATION_FAILED"
      && deployed.details?.label === "反向推算運算符號"
      && /0 unique prompts/.test(String(deployed.details?.validation ?? ""));
    if (preDeploymentMissingOperatorEvidence) assertLocalMissingOperatorRecovery();
    assert.equal(
      legacySelectorMismatch || advancedAdmissionBoundary || preDeploymentMissingOperatorEvidence,
      true,
      `Unexpected current G5A-U08 deployed failure: ${deployed.message}`,
    );
  }

  const evidence = a01.evidence.classicDeployedSmoke;
  assert.match(evidence.runId, /^\d+$/);
  assert.ok(evidence.attempt >= 1);
  assert.match(evidence.deploymentSha, /^[0-9a-f]{40}$/);
  assert.equal(evidence.status, "FAIL");
  assert.equal(evidence.failureClass, "SURFACE_CONTROL_OPTION_MISMATCH");
  assert.equal(evidence.failedSelector, "#g5a-u08-question-mode");
  assert.equal(evidence.consoleErrorCount, 0);
  assert.equal(evidence.pageErrorCount, 0);
  assert.equal(evidence.transient503ExcludedByReplay, true);
});

test("PGC-R07 A01 does not promote unreached or metadata-only paths to PASS", () => {
  assert.equal(a01.summary.passRowCount, 0);
  assert.equal(a01.summary.failRowCount, 1);
  assert.equal(a01.summary.blockedUpstreamRowCount, 2);
  assert.equal(a01.summary.unprovenRowCount, 9);
  assert.equal(a01.baselineRows.filter((row) => row.status === "PASS").length, 0);
  assert.ok(a01.baselineRows.filter((row) => row.status === "UNPROVEN").every((row) => row.browserEvidence === "NONE_CURRENT_CONFIG_SEED_PARITY"));
});

test("PGC-R07 A01 covers all existing renderer branches and selects one ordered repair path", () => {
  assert.deepEqual(
    a01.rendererBranchBaseline.map((row) => row.branchId),
    a00.rendererBranchesToAudit.map((row) => row.branchId),
  );
  assert.equal(a01.repairQueue.length, a01.summary.repairQueueCount);
  assert.deepEqual(a01.repairQueue.map((row) => row.priority), [1, 2, 3, 4, 5]);
  assert.equal(a01.goalDistance.nextShortestStep, "PGC-R07-A02_SharedRendererAndLegacyBranchParityFullFix");
});

test("PGC-R07 A01 is baseline-only and leaves product authorities unchanged", () => {
  assert.deepEqual(a01.frozenBoundary, {
    generatorModified: false,
    validatorModified: false,
    rendererModified: false,
    uiModified: false,
    knowledgePointModified: false,
    patternGroupModified: false,
    patternSpecModified: false,
    slice014Started: false,
  });
});
