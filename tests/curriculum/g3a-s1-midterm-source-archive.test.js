import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const preflight = JSON.parse(fs.readFileSync(
  path.join(ROOT, "data/curriculum/source-archive/g3a-s1-midterm/2026-09-22.source-authority-preflight.json"),
  "utf8",
));
const items = fs.readFileSync(
  path.join(ROOT, "data/curriculum/source-archive/g3a-s1-midterm/2026-09-22.atomic-items.batch001.jsonl"),
  "utf8",
).trim().split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));

test("3上期中 source preflight preserves bounded source authority", () => {
  assert.equal(preflight.schemaName, "ExamSourceAuthorityPreflight");
  assert.equal(preflight.currentScope.grade, 3);
  assert.equal(preflight.currentScope.semester, "upper");
  assert.equal(preflight.currentScope.assessmentType, "midterm");
  assert.equal(preflight.currentScope.selectedSourceCount, 3);
  assert.equal(preflight.currentScope.selectedAtomicItemCount, 18);
  assert.equal(preflight.status, "PARTIAL_PASS_WITH_EXPLICIT_BLOCKERS");
  assert.deepEqual(preflight.currentScope.forbiddenChanges, [
    "Generator",
    "Validator runtime",
    "Renderer",
    "Website UI",
    "public production admission",
  ]);
});

test("atomic pilot is traceable, non-production, and complete", () => {
  assert.equal(items.length, 18);
  assert.equal(new Set(items.map((item) => item.atomicItemId)).size, 18);
  assert.ok(items.every((item) => item.sourceId));
  assert.ok(items.every((item) => item.sourceRef?.questionNo));
  assert.ok(items.every((item) => item.productionUse === "forbidden"));
  assert.ok(items.every((item) => item.annotationStatus === "atomic_candidate_reviewed"));
  assert.ok(items.every((item) => item.sourceTextPolicy === "exact wording remains in Drive; GitHub stores a semantic summary"));
  assert.equal(items.filter((item) => item.knowledgePointResolution?.status === "CANDIDATE").length, 13);
  assert.equal(items.filter((item) => item.knowledgePointResolution?.status === "UNRESOLVED").length, 5);
  const selectedSourceIds = new Set(preflight.selectedSources.map((source) => source.sourceId));
  assert.ok(items.every((item) => selectedSourceIds.has(item.sourceId)));
});
