import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { buildPublicGenerationCapabilityMatrixV6 } from "../../tools/curriculum/materialize-pgc-r01-public-capability-matrix-v6.mjs";
import { CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import { BATCH_A_SELECTOR_AVAILABILITY, listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f32-extension.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsonPath = path.join(repoRoot, "data/curriculum/public-generation/public_generation_capability_matrix.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/public_generation_capability_matrix.csv");
const gapPath = path.join(repoRoot, "docs/curriculum/output/PGC-R01_capability_gap_report.md");
const SURFACE_IDS = ["CLASSIC", "FALLBACK_404", "PIXEL"];

function readMatrix() { return JSON.parse(fs.readFileSync(jsonPath, "utf8")); }
function currentMatrix() { return buildPublicGenerationCapabilityMatrixV6(); }

test("PGC-R01 V6 rebuild is deterministic while committed authority may remain V5 until Slice032 reconciliation", () => {
  assert.equal(fs.existsSync(jsonPath), true);
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(gapPath), true);
  const committed = readMatrix();
  const rebuilt = currentMatrix();
  assert.equal(rebuilt.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(rebuilt.taskId, "PGC-R01_PublicKnowledgePointCapabilityMatrix");
  assert.equal(rebuilt.matrixVersion, "pgc-r01-public-capability-matrix-v6");
  assert.equal(rebuilt.selectorAuthority, "batch-a-selector-p03f32-extension.js");
  if (committed.matrixVersion !== rebuilt.matrixVersion) {
    assert.equal(committed.matrixVersion, "pgc-r01-public-capability-matrix-v5");
    assert.equal(committed.selectorAuthority, "batch-a-selector-p03f31-extension.js");
    return;
  }
  assert.deepEqual(committed.summary, rebuilt.summary);
  assert.deepEqual(committed.normalizationPatch, rebuilt.normalizationPatch);
  assert.deepEqual(committed.coverageNormalizationPatch, rebuilt.coverageNormalizationPatch);
  assert.deepEqual(committed.surfaceGapPolicy, rebuilt.surfaceGapPolicy);
  assert.deepEqual(committed.currentAuthorityPatch, rebuilt.currentAuthorityPatch);
  assert.deepEqual(committed.capabilities.map((row)=>row.capabilityId), rebuilt.capabilities.map((row)=>row.capabilityId));
});

test("PGC-R01 V6 remains frozen to the exact Slice032 32-source / 226-KP authority", () => {
  const matrix = currentMatrix();
  const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();
  assert.equal(matrix.summary.publicSourceCount, 32);
  assert.ok(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length >= 32);
  const frozenSourceIds = new Set(Object.keys(BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  assert.equal(frozenSourceIds.size, 32);
  assert.equal(matrix.summary.publicVisibleKnowledgePointCount, 226);
  assert.equal(visibleKnowledgePoints.length, 226);
  const matrixSources = new Set(matrix.capabilities.map((row)=>row.sourceId));
  for (const source of CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.filter((row) => frozenSourceIds.has(row.sourceId))) assert.equal(matrixSources.has(source.sourceId), true, `missing capability source ${source.sourceId}`);
  const accountedKps = new Set([
    ...matrix.capabilities.map((row)=>row.knowledgePointId),
    ...matrix.gaps.filter((gap)=>gap.capabilityStatus === "ABSENT_EXPLICIT").map((gap)=>gap.knowledgePointId),
  ]);
  for (const kp of visibleKnowledgePoints) assert.equal(accountedKps.has(kp.knowledgePointId), true, `unaccounted public KP ${kp.knowledgePointId}`);
});

test("PGC-R01 V6 accounts all current KnowledgePoints by three-surface pairs", () => {
  const matrix = currentMatrix();
  const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();
  const expectedPairCount = visibleKnowledgePoints.length * SURFACE_IDS.length;
  const capabilityPairs = new Set(matrix.capabilities.map((row)=>`${row.knowledgePointId}|${row.surfaceId}`));
  const explicitGapPairs = new Set(matrix.gaps.filter((gap)=>gap.code === "FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY").map((gap)=>`${gap.knowledgePointId}|${gap.surfaceId}`));
  assert.equal(expectedPairCount, 678);
  assert.equal(matrix.summary.visibleKpSurfaceExpectedPairCount, expectedPairCount);
  assert.equal(matrix.summary.visibleKpSurfaceAccountedPairCount, expectedPairCount);
  assert.equal(matrix.summary.visibleKpSurfaceUnaccountedPairCount, 0);
  assert.equal(matrix.surfaceGapPolicy.unaccountedPairCount, 0);
  assert.equal(matrix.summary.visibleKpSurfaceExplicitGapPairCount, explicitGapPairs.size);
  assert.ok(explicitGapPairs.size > 0);
  for (const kp of visibleKnowledgePoints) for (const surfaceId of SURFACE_IDS) {
    const pair = `${kp.knowledgePointId}|${surfaceId}`;
    assert.equal(capabilityPairs.has(pair) || explicitGapPairs.has(pair), true, `unaccounted ${pair}`);
  }
});

test("PGC-R01 V6 capability rows have closed consumer and output lineage", () => {
  const matrix = currentMatrix();
  assert.ok(matrix.capabilities.length > 0);
  assert.equal(new Set(matrix.capabilities.map((row)=>row.capabilityId)).size, matrix.capabilities.length);
  assert.deepEqual(new Set(matrix.capabilities.map((row)=>row.surfaceId)), new Set(SURFACE_IDS));
  for (const row of matrix.capabilities) {
    assert.ok(row.sourceId); assert.ok(row.knowledgePointId); assert.ok(row.patternGroupId); assert.ok(row.patternSpecId);
    assert.ok(row.questionType); assert.ok(row.effectiveQuestionType); assert.ok(row.questionForm); assert.ok(row.generatorConsumer); assert.ok(row.validatorConsumer);
    assert.equal(row.htmlRouteId, "renderer.preview_html");
    assert.equal(row.pdfRouteId, "renderer.iframe_print");
    assert.equal(row.defaultQuestionCount, 20);
    assert.equal(row.declaredUiMaxQuestionCount, 200);
    assert.equal(row.verifiedMaxQuestionCount, null);
    assert.equal(row.capacityEvidence, "UNVERIFIED_UNTIL_PGC_R03");
  }
});

test("PGC-R01 V6 accounts every public UI question-type option", () => {
  const matrix = currentMatrix();
  assert.equal(matrix.summary.accountedUiOptionCount, matrix.summary.uiOptionCoverageCount);
  assert.equal(matrix.summary.blockingGapCount, 0, JSON.stringify(matrix.gaps.filter((gap)=>gap.severity === "blocking_r01"), null, 2));
  assert.equal(matrix.status, "PASS_WITH_DOWNSTREAM_GAPS");
  assert.equal(matrix.uiOptionCoverage.every((row)=>row.accounted), true);
  assert.equal(matrix.normalizationPatch.recoveredUiOptionCount, 9);
  assert.deepEqual(new Set(matrix.normalizationPatch.affectedSourceIds), new Set(["g3b_u04_3b04", "g3b_u08_3b08", "g4b_u01_4b01"]));
  assert.ok(matrix.coverageNormalizationPatch.addedCapabilityRowCount > 0);
});

test("PGC-R01 V6 preserves downstream R02 and R03 blockers without fabricating capability", () => {
  const matrix = currentMatrix();
  assert.ok(matrix.summary.r02UiBindingGapCount > 0);
  assert.equal(matrix.summary.capacityUnverifiedCapabilityCount, matrix.summary.capabilityRowCount);
  assert.equal(matrix.gaps.some((gap)=>gap.code === "FALLBACK_404_PUBLIC_CONTROL_PARITY_GAP"), true);
  assert.equal(matrix.gaps.some((gap)=>gap.code === "FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY"), true);
  assert.equal(matrix.gaps.some((gap)=>gap.code === "PUBLIC_UI_OPTION_WITHOUT_CAPABILITY"), false);
  assert.equal(matrix.gaps.some((gap)=>gap.code === "PUBLIC_KP_SURFACE_UNACCOUNTED"), false);
  assert.equal(matrix.gaps.filter((gap)=>gap.code === "FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY").every((gap)=>gap.capabilityStatus === "ABSENT_EXPLICIT" && gap.severity === "r02_ui_binding"), true);
});

test("PGC-R01 committed CSV/report remain synchronized after canonical artifact reconciliation", () => {
  const committed = readMatrix();
  if (committed.matrixVersion !== "pgc-r01-public-capability-matrix-v6") return;
  const csvRows = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
  assert.equal(csvRows.length, committed.capabilities.length + 1);
  const report = fs.readFileSync(gapPath, "utf8");
  assert.match(report, new RegExp(`PUBLIC_SOURCES\\s+= ${committed.summary.publicSourceCount}`));
  assert.match(report, new RegExp(`VISIBLE_KP_SURFACE_ACCOUNTED\\s+= ${committed.summary.visibleKpSurfaceAccountedPairCount} / ${committed.summary.visibleKpSurfaceExpectedPairCount}`));
  assert.match(report, new RegExp(`CAPABILITY_ROWS\\s+= ${committed.summary.capabilityRowCount}`));
  assert.match(report, /BLOCKING_R01_GAPS\s+= 0/);
});
