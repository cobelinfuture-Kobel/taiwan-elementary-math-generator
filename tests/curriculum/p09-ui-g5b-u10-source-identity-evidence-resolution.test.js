import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));

const RESOLUTION_PATH = "data/curriculum/full-product/p09/p09-ui-g5b-u10-source-identity-evidence-resolution.json";
const A03A_PATH = "data/curriculum/full-product/p09/p09-ui-a03a-public-curriculum-unit-completeness-preflight.json";
const REVIEWED05_PATH = "data/curriculum/global/candidates/r02/chunks/reviewed-source-candidates-05.json";
const IMPACT_PATH = "data/project/change-impact/P09_UI_G5B_U10_SOURCE_IDENTITY_EVIDENCE_RESOLUTION.impact.json";
const PLAN_PATH = "data/project/validation-plans/P09_UI_G5B_U10_SOURCE_IDENTITY_EVIDENCE_RESOLUTION.validation.json";

const resolution = readJson(RESOLUTION_PATH);
const a03a = readJson(A03A_PATH);
const reviewed05 = readJson(REVIEWED05_PATH);
const impact = readJson(IMPACT_PATH);
const plan = readJson(PLAN_PATH);

const source = reviewed05.sourceRecords.find((row) => row.sourceNodeId === "g5b_u10_5b10a");

test("G5B-U10 evidence resolution preserves the reviewed source lineage", () => {
  assert.ok(source);
  assert.equal(source.sourceTitle, "生活中的大單位");
  assert.equal(source.sourcePdfTitle, "meow911_5b10a_source.pdf");
  assert.equal(source.pageCount, 1);
  assert.equal(source.candidates.length, 5);
  assert.equal(resolution.resolution.sourceAssetIdentity.canonicalSourceNodeId, source.sourceNodeId);
  assert.equal(resolution.resolution.sourceAssetIdentity.preserveSourceNodeId, true);
  assert.equal(resolution.resolution.knowledgePointIdentity.preserveExistingKnowledgePointIds, true);
  assert.equal(resolution.resolution.knowledgePointIdentity.renameExistingKnowledgePointIds, false);
});

test("G5B-U10 curriculum identity is resolved separately from the 5b10a asset slug", () => {
  assert.equal(resolution.status, "SOURCE_IDENTITY_RESOLVED_PUBLIC_CURRICULUM_ROUTE_G5B_U10");
  assert.equal(resolution.resolution.curriculumUnitIdentity.unitCode, "5B-U10");
  assert.equal(resolution.resolution.curriculumUnitIdentity.title, "生活中的大單位");
  assert.equal(resolution.resolution.curriculumUnitIdentity.status, "SOURCE_BACKED_RESOLVED");
  assert.equal(resolution.resolution.sourceAssetIdentity.sourceAssetCode, "5b10a");
  assert.equal(resolution.resolution.sourceAssetIdentity.sourceAssetSuffixAIsNotCurriculumUnitSuffix, true);
  assert.equal(resolution.resolution.publicUiNormalization.newCanonicalSourceNodeRequired, false);
  assert.equal(resolution.resolution.publicUiNormalization.metadataNormalizationOnly, true);
});

test("5b10b existence does not create a current G5B-U10B split", () => {
  assert.equal(resolution.evidence.currentMeow5b10bPage.pageExists, true);
  assert.equal(resolution.resolution.fiveB10B.currentKangHsuanMapping, "5B-U05");
  assert.equal(resolution.resolution.fiveB10B.belongsToCurrentG5BU10, false);
  assert.equal(resolution.resolution.fiveB10B.createG5BU10BSourceNode, false);
  assert.match(resolution.evidence.currentMeow5b10bPage.conflictResolution, /stale image alt/);
});

test("resolution supersedes the A03A identity blocker without rewriting historical preflight", () => {
  assert.equal(a03a.diagnosis.g5bU10.status, "SOURCE_SCOPE_PARENT_OR_SPLIT_IDENTITY_UNRESOLVED");
  assert.equal(resolution.problem.priorStatus, a03a.diagnosis.g5bU10.status);
  assert.deepEqual(resolution.distance.remainingBlockers, [
    "G5B_U10_PUBLIC_UI_UNITCODE_METADATA_NOT_NORMALIZED"
  ]);
  assert.equal(resolution.scopeBoundary.historicalPreflightRewrite, false);
});

test("evidence resolution is planning-only and forbids expensive/global gates", () => {
  assert.equal(impact.changeImpact.productImplementation, false);
  assert.equal(impact.changeImpact.currentAuthorityChanged, false);
  assert.equal(impact.scopeGuards.planningOnly, true);
  assert.equal(impact.scopeGuards.r02Mutation, false);
  assert.equal(impact.scopeGuards.r04Mutation, false);
  assert.equal(impact.scopeGuards.publicUiRuntimeMutation, false);
  assert.ok(plan.forbidden.includes("FULL_NODE_REGRESSION"));
  assert.ok(plan.forbidden.includes("GLOBAL_BROWSER_REPLAY"));
  assert.ok(plan.forbidden.includes("PAGES_E6"));
});
