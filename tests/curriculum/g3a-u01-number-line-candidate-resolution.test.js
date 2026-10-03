import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const PATH = new URL("../../data/curriculum/mapping/g3a_u01_number_line_candidate_resolution.v1.json", import.meta.url);
const r = JSON.parse(fs.readFileSync(PATH, "utf8"));

test("two number-line KP candidates are approved for design but not minted", () => {
  assert.equal(r.knowledgePointCandidateResolution.length, 2);
  assert.ok(r.knowledgePointCandidateResolution.every((row) =>
    row.disposition === "APPROVED_FOR_PATTERNSPEC_DESIGN_NOT_MINTED"
    && row.runtimeAuthorityChanged === false
  ));
  assert.equal(r.scopeBoundary.officialKnowledgeAuthorityChanged, false);
  assert.equal(r.scopeBoundary.newKnowledgePointMinted, false);
});

test("mixed three-question number-line family is split into three one-question effective families", () => {
  assert.equal(r.mixedFamilyResolution.originalQuestionCount, 3);
  assert.equal(r.mixedFamilyResolution.subfamilies.length, 3);
  assert.deepEqual(
    r.mixedFamilyResolution.subfamilies.map((row) => row.questionIds.length),
    [1,1,1]
  );
  const ids = r.mixedFamilyResolution.subfamilies.flatMap((row) => row.questionIds);
  assert.equal(new Set(ids).size, 3);
  assert.deepEqual(new Set(ids), new Set([
    "exam_pdf_767ae9f793b7_p3_VI-1",
    "exam_pdf_748c876ec715_p2_VIII-1",
    "exam_pdf_3dba86522ac7_p1_I-10"
  ]));
});

test("read-then-add remains a prerequisite capability instead of minting an addition KP", () => {
  const row = r.mixedFamilyResolution.subfamilies.find((item) =>
    item.effectiveVisualFamilyId === "vf_g3a_u01_integer_number_line_read_then_add"
  );
  assert.deepEqual(row.secondaryCapabilities, ["PREREQUISITE_INTEGER_ADDITION"]);
  assert.match(row.boundary, /not minted as a new G3A_U01 KP/);
});

test("effective visual PatternSpec queue has 20 unique ranked families and preserves 228 source questions", () => {
  assert.deepEqual(r.effectiveFamilyCounts, {
    originalCanonicalFamilies:18,
    splitRemovedFamilies:1,
    splitAddedFamilies:3,
    effectivePatternFamilies:20,
    sourceQuestions:228,
    unassignedQuestions:0
  });
  assert.equal(r.patternSpecPriorityOrderingV2.length, 20);
  assert.deepEqual(
    r.patternSpecPriorityOrderingV2.map((row) => row.rank),
    Array.from({length:20},(_,i)=>i+1)
  );
  assert.equal(new Set(r.patternSpecPriorityOrderingV2.map((row) => row.visualFamilyId)).size, 20);
  assert.equal(r.patternSpecPriorityOrderingV2[0].visualFamilyId, "vf_g3a_u01_one_way_table_compare");
});
