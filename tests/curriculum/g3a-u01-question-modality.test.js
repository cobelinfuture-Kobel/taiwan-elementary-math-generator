import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const MODALITY_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.question-modality.json", import.meta.url);
const AUTHORITY_PATH = new URL("../../data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json", import.meta.url);

const modality = JSON.parse(fs.readFileSync(MODALITY_PATH, "utf8"));
const authority = JSON.parse(fs.readFileSync(AUTHORITY_PATH, "utf8"));

test("G3A U01 modality inventory is unit-scoped and uses only A/B/C classes", () => {
  assert.equal(modality.sourceId, "g3a_u01_3a01");
  assert.equal(modality.scopePolicy.unitOnly, true);
  assert.deepEqual(modality.scopePolicy.allowedClasses, ["A_TEXT", "B_VISUAL", "C_UNKNOWN"]);
});

test("G3A U01 A_TEXT baseline covers every current runtime PatternSpec exactly once", () => {
  const runtimeIds = authority.existingQuestionBindings.map((row) => row.questionId).sort();
  const textIds = modality.A_TEXT.items.map((row) => row.patternSpecId).sort();
  assert.equal(runtimeIds.length, 20);
  assert.deepEqual(textIds, runtimeIds);
  assert.equal(new Set(textIds).size, textIds.length);
});

test("G3A U01 B_VISUAL baseline is source-backed and remains candidate-only", () => {
  assert.equal(modality.B_VISUAL.families.length, 6);
  for (const family of modality.B_VISUAL.families) {
    assert.match(family.visualFamilyId, /^vf_g3a_u01_/);
    assert.ok(family.sourceEvidence.length >= 1);
    assert.ok(family.sourceEvidence.every((row) => Number.isInteger(row.page) && row.page >= 1 && row.page <= 3));
    assert.notEqual(family.admissionStatus, "PRODUCTION_ADMITTED");
  }
});

test("G3A U01 C_UNKNOWN starts empty and is reserved for future discussion", () => {
  assert.equal(modality.C_UNKNOWN.status, "EMPTY_UNTIL_ENCOUNTERED");
  assert.deepEqual(modality.C_UNKNOWN.items, []);
});
