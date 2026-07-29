import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  buildPublicGenerationCapabilityMatrix,
} from "../../tools/curriculum/materialize-pgc-r01-public-capability-matrix.mjs";
import {
  CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const jsonPath = path.join(repoRoot, "data/curriculum/public-generation/public_generation_capability_matrix.json");
const csvPath = path.join(repoRoot, "data/curriculum/public-generation/public_generation_capability_matrix.csv");
const gapPath = path.join(repoRoot, "docs/curriculum/output/PGC-R01_capability_gap_report.md");

function readMatrix() {
  return JSON.parse(fs.readFileSync(jsonPath, "utf8"));
}

test("PGC-R01 materializes the deterministic current public capability authority", () => {
  assert.equal(fs.existsSync(jsonPath), true);
  assert.equal(fs.existsSync(csvPath), true);
  assert.equal(fs.existsSync(gapPath), true);

  const committed = readMatrix();
  const rebuilt = buildPublicGenerationCapabilityMatrix();
  assert.equal(committed.programId, "PUBLIC_KP_GENERATION_CONFORMANCE_V1");
  assert.equal(committed.taskId, "PGC-R01_PublicKnowledgePointCapabilityMatrix");
  assert.deepEqual(committed.summary, rebuilt.summary);
  assert.deepEqual(
    committed.capabilities.map((row) => row.capabilityId),
    rebuilt.capabilities.map((row) => row.capabilityId),
  );
});

test("PGC-R01 accounts for all 26 public sources and all visible KnowledgePoints", () => {
  const matrix = readMatrix();
  assert.equal(matrix.summary.publicSourceCount, 26);
  assert.equal(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length, 26);
  assert.equal(matrix.summary.publicVisibleKnowledgePointCount, listVisibleBatchAKnowledgePoints().length);

  const matrixSources = new Set(matrix.capabilities.map((row) => row.sourceId));
  for (const source of CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS) {
    assert.equal(matrixSources.has(source.sourceId), true, `missing capability source ${source.sourceId}`);
  }

  const matrixKps = new Set(matrix.capabilities.map((row) => row.knowledgePointId));
  for (const kp of listVisibleBatchAKnowledgePoints()) {
    assert.equal(matrixKps.has(kp.knowledgePointId), true, `missing capability KP ${kp.knowledgePointId}`);
  }
});

test("PGC-R01 capability rows have closed consumer and output lineage", () => {
  const matrix = readMatrix();
  assert.ok(matrix.capabilities.length > 0);
  assert.equal(new Set(matrix.capabilities.map((row) => row.capabilityId)).size, matrix.capabilities.length);
  assert.deepEqual(new Set(matrix.capabilities.map((row) => row.surfaceId)), new Set(["CLASSIC", "FALLBACK_404", "PIXEL"]));

  for (const row of matrix.capabilities) {
    assert.ok(row.sourceId);
    assert.ok(row.knowledgePointId);
    assert.ok(row.patternGroupId);
    assert.ok(row.patternSpecId);
    assert.ok(row.questionType);
    assert.ok(row.questionForm);
    assert.ok(row.generatorConsumer);
    assert.ok(row.validatorConsumer);
    assert.equal(row.htmlRouteId, "renderer.preview_html");
    assert.equal(row.pdfRouteId, "renderer.iframe_print");
    assert.equal(row.defaultQuestionCount, 20);
    assert.equal(row.declaredUiMaxQuestionCount, 200);
    assert.equal(row.verifiedMaxQuestionCount, null);
    assert.equal(row.capacityEvidence, "UNVERIFIED_UNTIL_PGC_R03");
  }
});

test("PGC-R01 accounts every public UI question-type option or fails closed", () => {
  const matrix = readMatrix();
  assert.equal(matrix.summary.accountedUiOptionCount, matrix.summary.uiOptionCoverageCount);
  assert.equal(matrix.summary.blockingGapCount, 0, JSON.stringify(matrix.gaps.filter((gap) => gap.severity === "blocking_r01"), null, 2));
  assert.equal(matrix.status, "PASS_WITH_DOWNSTREAM_GAPS");
  assert.equal(matrix.uiOptionCoverage.every((row) => row.accounted), true);
});

test("PGC-R01 CSV and gap report remain synchronized", () => {
  const matrix = readMatrix();
  const csvRows = fs.readFileSync(csvPath, "utf8").trim().split(/\r?\n/);
  assert.equal(csvRows.length, matrix.capabilities.length + 1);
  const report = fs.readFileSync(gapPath, "utf8");
  assert.match(report, new RegExp(`PUBLIC_SOURCES\\s+= ${matrix.summary.publicSourceCount}`));
  assert.match(report, new RegExp(`CAPABILITY_ROWS\\s+= ${matrix.summary.capabilityRowCount}`));
  assert.match(report, /NEXT_SHORTEST_STEP\s+= PGC-R02_KnowledgePointDrivenUICapabilityBinding/);
});
