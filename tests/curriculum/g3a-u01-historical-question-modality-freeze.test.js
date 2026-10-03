import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const MODALITY_PATH = new URL("../../data/curriculum/source-archive/g3a-u01-membership/2026-10-03.question-modality-freeze-v1.json", import.meta.url);
const MEMBERSHIP_PATH = new URL("../../data/curriculum/source-archive/g3a-u01-membership/2026-10-03.membership-freeze-v1.json", import.meta.url);

const freeze = JSON.parse(fs.readFileSync(MODALITY_PATH, "utf8"));
const membership = JSON.parse(fs.readFileSync(MEMBERSHIP_PATH, "utf8"));

function digestLines(lines) {
  return crypto.createHash("sha256").update([...lines].sort().join("\n") + "\n").digest("hex");
}

test("G3A U01 modality freeze classifies the complete membership-YES set", () => {
  assert.equal(freeze.schemaName, "G3AU01HistoricalExamQuestionModalityFreezeV1");
  assert.equal(freeze.unitId, "g3a_u01_3a01");
  assert.deepEqual(freeze.finalCounts, { A_TEXT: 1099, B_VISUAL: 228, C_UNKNOWN: 0 });
  assert.equal(freeze.classificationSets.C_UNKNOWN.length, 0);

  const aIds = freeze.classificationSets.A_TEXT;
  const bIds = freeze.classificationSets.B_VISUAL.flatMap((row) => row.questionIds);
  const membershipYes = membership.yesQuestionIds;

  assert.equal(aIds.length, 1099);
  assert.equal(bIds.length, 228);
  assert.equal(new Set(aIds).size, aIds.length);
  assert.equal(new Set(bIds).size, bIds.length);

  const bSet = new Set(bIds);
  assert.deepEqual(aIds.filter((id) => bSet.has(id)), []);
  assert.deepEqual([...new Set([...aIds, ...bIds])].sort(), [...membershipYes].sort());
});

test("G3A U01 A/B/C policy keeps C temporary and forbids silent fourth-class creation", () => {
  assert.match(freeze.policy.A_TEXT, /文字/);
  assert.match(freeze.policy.B_VISUAL, /視覺/);
  assert.match(freeze.policy.C_UNKNOWN, /暫時/);
  assert.match(freeze.policy.nonABRule, /不新增第四類/);
  assert.equal(freeze.reconciliationDelta.C_REMAINING, 0);
});

test("G3A U01 modality sets are digest-locked", () => {
  const aIds = freeze.classificationSets.A_TEXT;
  const bIds = freeze.classificationSets.B_VISUAL.flatMap((row) => row.questionIds);
  assert.equal(digestLines(aIds), freeze.setDigests.aTextQuestionIdsSha256);
  assert.equal(digestLines(bIds), freeze.setDigests.bVisualQuestionIdsSha256);
});

test("G3A U01 visual classifications preserve important semantic boundary examples", () => {
  const a = new Set(freeze.classificationSets.A_TEXT);
  const b = new Set(freeze.classificationSets.B_VISUAL.flatMap((row) => row.questionIds));

  assert.ok(a.has("exam_pdf_7a1a17115f40_p2_III-5a")); // start/direction/count fully textual
  assert.ok(a.has("exam_pdf_935fd5aaca67_p1_II-11")); // number-line movement values fully textual
  assert.ok(b.has("exam_pdf_61b733fed599_p1_I-1")); // source base-ten blocks carry required representation
  assert.ok(b.has("exam_pdf_767ae9f793b7_p5_X-2")); // money values live in source image
  assert.ok(b.has("exam_pdf_65fc1653aa1e_p1_I-3")); // inspected source visual number-line/pattern
  assert.ok(b.has("exam_pdf_34fa32051182_p2_DRAW-3")); // existing money diagram is required
});
