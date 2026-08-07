import test from "node:test";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";

import { buildPgcR02UiCapabilityBindingContract } from "../../tools/curriculum/materialize-pgc-r02-ui-capability-binding-r03.mjs";

const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function buildCsv(contract) {
  const columns = [
    "bindingId", "caseId", "sourceId", "surfaceId", "selectionMode",
    "selectedKnowledgePointIds", "selectedKnowledgePointCount", "questionType", "questionTypeLabel",
    "compatiblePatternGroupIds", "compatiblePatternSpecIds", "questionFormLabels",
    "depthModes", "contextModes", "questionCountMin", "questionCountDefault", "questionCountMax",
    "capacityStatus", "capacityRouteIds", "capacityQualityStatuses", "blocked", "blockedReasons",
  ];
  const lines = [columns.join(",")];
  for (const row of contract.bindings) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  return `${lines.join("\n")}\n`;
}

function buildReadback(contract) {
  const summary = contract.summary;
  const lines = [
    "# PGC-R02 KnowledgePoint-driven UI Capability Binding Readback",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "## Capacity-aware accepted matrix",
    "",
    "```text",
    `PUBLIC_SOURCES                  = ${summary.publicSourceCount}`,
    `VISIBLE_KNOWLEDGE_POINTS        = ${summary.visibleKnowledgePointCount}`,
    `PUBLIC_SURFACES                 = ${summary.publicSurfaceCount}`,
    `QUESTION_TYPE_BINDING_ROWS      = ${summary.questionTypeBindingRowCount}`,
    `VERIFIED_20_BINDINGS            = ${summary.verified20BindingCount}`,
    `VERIFIED_LIMITED_BINDINGS       = ${summary.limitedCapacityBindingCount}`,
    `STRUCTURAL_FALLBACK_BINDINGS    = ${summary.structuralFallbackBindingCount}`,
    `MINIMUM_VERIFIED_QUESTION_COUNT = ${summary.minimumVerifiedQuestionCount}`,
    `MAXIMUM_VERIFIED_QUESTION_COUNT = ${summary.maximumVerifiedQuestionCount}`,
    `UNVERIFIED_CAPACITY_EXPOSURES   = ${summary.unverifiedCapacityExposureCount}`,
    `GAPS                            = ${summary.gapCount}`,
    "```",
    "",
    "PGC-R03 removes illegal depth/context/scope intersections and applies the verified per-capability question-count ceiling. Later direct-product slices may use the already accepted structural fallback under the global 240 ceiling until the capacity registry is rematerialized; this does not mutate historical PGC-R03 route evidence.",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_KP_DRIVEN_UI_BINDING_CONFORMANT",
    `GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_CAPACITY_AWARE_UI_BINDING_CONFORMANT" : "D1_CAPACITY_AWARE_UI_BINDING_FAIL_CLOSED"}`,
    "DISTANCE_REDUCED     = public controls now expose only legal routes and clamp question count to the accepted global runtime ceiling",
    "REMAINING_BLOCKERS   = [PGC-R04_NUMERIC_QUALITY, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix",
    "```",
    "",
  ];
  if (contract.gaps.length > 0) {
    lines.push("## Blocking gaps", "", ...contract.gaps.map((gap) => `- \`${gap.code}\`: \`${JSON.stringify(gap)}\``), "");
  }
  return `${lines.join("\n")}\n`;
}

test("P03F27 exact-head R02 materialization is canonical and captureable without mutating the worktree", () => {
  const contract = buildPgcR02UiCapabilityBindingContract();
  assert.equal(contract.status, "PASS", JSON.stringify(contract.gaps));
  assert.equal(contract.schemaName, "PublicUiCapabilityBindingContractV2");
  assert.equal(contract.summary.publicSourceCount, 29);
  assert.equal(contract.summary.visibleKnowledgePointCount, 218);
  assert.equal(contract.summary.gapCount, 0);
  assert.equal(contract.r06TerminalStatus, "D0_CLOSED");

  const serialized = JSON.stringify(contract);
  for (const hiddenSpecId of [
    "ps_g4b_u08_fraction_compare_cross_product_comparison_application",
    "ps_g4b_u08_unlike_denominator_add_sub_result_application",
  ]) {
    assert.equal(serialized.includes(hiddenSpecId), false);
  }

  const payload = {
    contractText: `${JSON.stringify(contract, null, 2)}\n`,
    csvText: buildCsv(contract),
    readbackText: buildReadback(contract),
  };
  const encoded = gzipSync(Buffer.from(JSON.stringify(payload), "utf8"), { level: 9 }).toString("base64");
  console.log(`P03F27_R02_CAPTURE_GZIP_B64=${encoded}`);
});
