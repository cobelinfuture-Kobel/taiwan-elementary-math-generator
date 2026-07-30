import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const a00 = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/PGC-R08-A00.public-generate-button-e2e-scope.json", import.meta.url),
  "utf8",
));
const capacity = JSON.parse(readFileSync(
  new URL("../../data/curriculum/public-generation/generator_capacity_contract.json", import.meta.url),
  "utf8",
));
const builder = readFileSync(
  new URL("../../tools/curriculum/build-pgc-r08-a01-legal-route-browser-matrix.mjs", import.meta.url),
  "utf8",
);

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
  for (const field of a00.matrixAuthority.routeIdentityFields) {
    assert.match(builder, new RegExp(field));
  }
});

test("PGC-R08 A01 materializes nine pending gates and 20-question browser expectations", () => {
  assert.deepEqual(a00.perRouteGateCodes, expectedGateCodes);
  assert.match(builder, /const GATE_CODES = Object\.freeze\(\[/);
  for (const gateCode of expectedGateCodes) assert.match(builder, new RegExp(gateCode));
  assert.match(builder, /requestedQuestionCount: 20/);
  assert.match(builder, /expectedAnswerKeyItemCount: 20/);
  assert.match(builder, /overallStatus: "PENDING_BROWSER_EXECUTION"/);
  assert.match(builder, /publicUiSurface: "CLASSIC"/);
});

test("PGC-R08 A01 preserves limited-capacity routes as explicit pre-execution risk", () => {
  assert.match(builder, /VERIFIED_MAX_BELOW_REQUESTED_20/);
  assert.match(builder, /CAPACITY_STATUS_VERIFIED_LIMITED/);
  assert.match(builder, /preknownLimitedCapacityRiskCount/);
  assert.match(builder, /verifiedLimitedRouteCount/);
  assert.equal(a00.matrixAuthority.questionCountPerRoute, 20);
});

test("PGC-R08 A01 produces deterministic JSON CSV report and fixed 50-route shards", () => {
  assert.match(builder, /public_generate_button_acceptance\.json/);
  assert.match(builder, /public_capability_e2e_matrix\.csv/);
  assert.match(builder, /failed_combination_report\.md/);
  assert.match(builder, /const SHARD_SIZE = 50/);
  assert.match(builder, /routeIdsSha256/);
  assert.match(builder, /browserExecutionStarted: false/);
  assert.match(builder, /PGC-R08-A02_PublicGenerateButtonCanaryAndHarnessQualification/);
});
