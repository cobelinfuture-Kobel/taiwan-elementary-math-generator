import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readJson = (relativePath) => JSON.parse(readFileSync(new URL(relativePath, import.meta.url), "utf8"));

const a00 = readJson("../../data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json");
const capacity = readJson("../../data/curriculum/public-generation/generator_capacity_contract.json");
const manifest = readJson("../../data/curriculum/public-generation/public_generate_button_acceptance.json");
const builder = readFileSync(
  new URL("../../tools/curriculum/build-pgc-r08-a01-legal-route-browser-matrix.mjs", import.meta.url),
  "utf8",
);
const shardCsv = readFileSync(
  new URL("../../docs/curriculum/output/public_capability_e2e_matrix.csv", import.meta.url),
  "utf8",
).trim().split(/\r?\n/);
const failedReport = readFileSync(
  new URL("../../docs/curriculum/output/failed_combination_report.md", import.meta.url),
  "utf8",
);
const workflow = readFileSync(new URL("../../.github/workflows/node-test.yml", import.meta.url), "utf8");

const expectedGateCodes = [
  "UI_OPTIONS_PASS",
  "GENERATE_BUTTON_PASS",
  "QUESTION_COUNT_PASS",
  "QUESTION_IDENTITY_PASS",
  "ANSWER_VALIDATION_PASS",
  "REGENERATE_PASS",
  "HTML_PASS",
  "PDF_PASS",
  "ANSWER_KEY_PASS",
];

test("PGC-R08 A01 consumes the closed A00 and current capacity authority", () => {
  assert.equal(a00.status, "PASS_R08_A00_PUBLIC_GENERATE_BUTTON_E2E_SCOPE_FROZEN");
  assert.equal(capacity.status, "PASS");
  assert.equal(capacity.summary.legalRouteCount, 793);
  assert.equal(capacity.summary.verified20RouteCount, 724);
  assert.equal(capacity.summary.verifiedLimitedRouteCount, 69);
  assert.equal(capacity.summary.zeroCapacityRouteCount, 0);
  assert.equal(capacity.summary.diversityGapRouteCount, 0);
});

test("PGC-R08 A01 builder projects only legal routes and preserves exact route identity", () => {
  assert.match(builder, /capacity\.routes\s*\.filter\(\(route\) => route\.legalRoute === true\)/);
  assert.match(builder, /\.sort\(\(left, right\) => left\.routeId\.localeCompare\(right\.routeId\)\)/);
  assert.match(builder, /PGC_R08_A01_LEGAL_ROUTE_COUNT_DRIFT/);
  assert.match(builder, /PGC_R08_A01_ROUTE_ID_DUPLICATE/);
  for (const field of a00.matrixAuthority.routeIdentityFields) assert.match(builder, new RegExp(field));
});

test("PGC-R08 A01 compact manifest preserves exact matrix and artifact evidence", () => {
  assert.equal(manifest.status, "PASS_MATRIX_MATERIALIZED_PENDING_BROWSER_EXECUTION");
  assert.equal(manifest.sourceAuthority.rowAuthorityType, "DETERMINISTIC_CAPACITY_VIEW");
  assert.equal(manifest.sourceAuthority.rowsInline, false);
  assert.equal(manifest.sourceAuthority.fullRowMatrixLocation, "CI_ARTIFACT");
  assert.equal(manifest.sourceAuthority.capacitySha256, "44009fa826a3362aae84ffac4f68c7b20c729a8f1459ad2bf953b4fe2f6b20c9");
  assert.equal(manifest.summary.routeCount, 1155);
  assert.equal(manifest.summary.legalRouteCount, 793);
  assert.equal(manifest.summary.verified20RouteCount, 724);
  assert.equal(manifest.summary.verifiedLimitedRouteCount, 69);
  assert.equal(manifest.summary.preknownLimitedCapacityRiskCount, 69);
  assert.equal(manifest.summary.pendingRouteCount, 793);
  assert.equal(manifest.summary.executedRouteCount, 0);
  assert.equal(manifest.artifactEvidence.workflowRunId, 30564781169);
  assert.equal(manifest.artifactEvidence.artifactId, 8768421486);
  assert.equal(manifest.artifactEvidence.artifactDigest, "sha256:05de91f1a9a61f172d65113d08b0826414ef0ecc1eda2818757f652b69fa6c75");
  assert.equal(manifest.artifactEvidence.fullJsonSha256, "b1b123970dd30c43b1fe8e63e02e38fd943598821db38a90874bce6d21d7d5a1");
  assert.equal(manifest.artifactEvidence.fullCsvSha256, "608fd5e3a245ec9b0e00454b4945980352fd63ae1da169f322d7a163106ea2b4");
});

test("PGC-R08 A01 materializes nine pending gates and 20-question browser expectations", () => {
  assert.deepEqual(a00.perRouteGateCodes, expectedGateCodes);
  assert.deepEqual(manifest.executionContract.gateCodes, expectedGateCodes);
  assert.equal(manifest.executionContract.requestedQuestionCountPerRoute, 20);
  assert.equal(manifest.executionContract.expectedAnswerKeyItemCountPerRoute, 20);
  assert.equal(manifest.executionContract.browserExecutionStarted, false);
  assert.equal(manifest.executionContract.surface, "CLASSIC");
  for (const gateCode of expectedGateCodes) assert.match(builder, new RegExp(gateCode));
});

test("PGC-R08 A01 shard index covers all 793 legal routes exactly once", () => {
  assert.equal(manifest.shards.length, 16);
  assert.equal(shardCsv.length, 17);
  assert.equal(manifest.shards.reduce((sum, shard) => sum + shard.routeCount, 0), 793);
  assert.equal(manifest.shards[0].firstRouteIndex, 1);
  assert.equal(manifest.shards.at(-1).lastRouteIndex, 793);
  assert.equal(manifest.shards.at(-1).routeCount, 43);
  for (const shard of manifest.shards) {
    assert.equal(shard.status, "PENDING_BROWSER_EXECUTION");
    assert.match(shard.routeIdsSha256, /^[a-f0-9]{64}$/);
    assert.ok(shard.lastRouteIndex >= shard.firstRouteIndex);
  }
  for (let index = 1; index < manifest.shards.length; index += 1) {
    assert.equal(manifest.shards[index].firstRouteIndex, manifest.shards[index - 1].lastRouteIndex + 1);
  }
});

test("PGC-R08 A01 report is fail-closed and retains limited-capacity risk", () => {
  assert.match(failedReport, /STATUS = PENDING_BROWSER_EXECUTION/);
  assert.match(failedReport, /LEGAL_ROUTE_COUNT = 793/);
  assert.match(failedReport, /EXECUTED_ROUTE_COUNT = 0/);
  assert.match(failedReport, /FAILED_ROUTE_COUNT = 0/);
  assert.match(failedReport, /PREKNOWN_LIMITED_CAPACITY_RISK_COUNT = 69/);
  assert.match(builder, /VERIFIED_MAX_BELOW_REQUESTED_20/);
  assert.match(builder, /CAPACITY_STATUS_VERIFIED_LIMITED/);
});

test("PGC-R08 A01 leaves no permanent milestone-specific Node workflow fan-out", () => {
  assert.doesNotMatch(workflow, /pgc-r08-a01-legal-route-browser-matrix/);
  assert.doesNotMatch(workflow, /build-pgc-r08-a01-legal-route-browser-matrix\.mjs/);
  assert.doesNotMatch(workflow, /pgc-r08-a01-legal-route-browser-matrix artifacts/);
  assert.equal(manifest.goalDistance.nextShortestStep, "PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification");
});
