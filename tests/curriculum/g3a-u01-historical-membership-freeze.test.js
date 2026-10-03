import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const PATH = new URL("../../data/curriculum/source-archive/g3a-u01-membership/2026-10-03.membership-freeze-v1.json", import.meta.url);
const freeze = JSON.parse(fs.readFileSync(PATH, "utf8"));

function digestLines(lines) {
  return crypto.createHash("sha256").update([...lines].sort().join("\n") + "\n").digest("hex");
}

test("G3A U01 historical membership freeze resolves all 1431 candidates", () => {
  assert.equal(freeze.schemaName, "G3AU01HistoricalExamMembershipFreezeV1");
  assert.equal(freeze.unitId, "g3a_u01_3a01");
  assert.equal(freeze.sourceDataset.candidateCount, 1431);
  assert.deepEqual(freeze.finalCounts, { YES: 1327, NO: 104, REVIEW: 0 });
  assert.equal(freeze.semanticAdjudication.reviewInputCount, 52);
  assert.equal(freeze.semanticAdjudication.resolvedYes, 40);
  assert.equal(freeze.semanticAdjudication.resolvedNo, 12);
  assert.equal(freeze.semanticAdjudication.remainingReview, 0);
});

test("YES and NO sets are unique, disjoint, complete, and hash-locked", () => {
  const yes = freeze.yesQuestionIds;
  const no = freeze.noQuestionIds;
  assert.equal(yes.length, 1327);
  assert.equal(no.length, 104);
  assert.equal(new Set(yes).size, yes.length);
  assert.equal(new Set(no).size, no.length);
  const noSet = new Set(no);
  assert.deepEqual(yes.filter((id) => noSet.has(id)), []);
  assert.equal(new Set([...yes, ...no]).size, 1431);
  assert.equal(digestLines(yes), freeze.setDigests.yesQuestionIdsSha256);
  assert.equal(digestLines(no), freeze.setDigests.noQuestionIdsSha256);
  const membershipLines = [
    ...yes.map((id) => `${id}\tYES`),
    ...no.map((id) => `${id}\tNO`),
  ];
  assert.equal(digestLines(membershipLines), freeze.setDigests.membershipMapSha256);
});

test("all 52 semantic review rows are explicitly adjudicated YES or NO", () => {
  const rows = freeze.semanticAdjudication.rows;
  assert.equal(rows.length, 52);
  assert.equal(new Set(rows.map((row) => row.questionId)).size, 52);
  assert.ok(rows.every((row) => row.finalMembership === "YES" || row.finalMembership === "NO"));
  assert.ok(rows.every((row) => typeof row.reasonCode === "string" && row.reasonCode.length > 0));
  assert.equal(rows.filter((row) => row.finalMembership === "YES").length, 40);
  assert.equal(rows.filter((row) => row.finalMembership === "NO").length, 12);
});

test("semantic boundary examples remain locked", () => {
  const byId = new Map(freeze.semanticAdjudication.rows.map((row) => [row.questionId, row]));
  assert.equal(byId.get("exam_pdf_53e879310b5e_p1_F-1")?.finalMembership, "YES");
  assert.equal(byId.get("exam_pdf_02abfb88fc24_p1_I-8")?.finalMembership, "NO");
  assert.equal(byId.get("exam_pdf_49dbfb086cd5_p1_D-3")?.finalMembership, "YES");
  assert.equal(byId.get("exam_pdf_594cb2fe47c6_p1_I-3")?.finalMembership, "NO");
});
