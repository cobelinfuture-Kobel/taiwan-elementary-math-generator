import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";

const REGISTRY_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.visual-pattern-families.v1.json", import.meta.url);
const MODALITY_PATH = new URL("../../data/curriculum/source-archive/g3a-u01-membership/2026-10-03.question-modality-freeze-v1.json", import.meta.url);

const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, "utf8"));
const modality = JSON.parse(fs.readFileSync(MODALITY_PATH, "utf8"));

function digestLines(lines) {
  return crypto.createHash("sha256").update([...lines].sort().join("\n") + "\n").digest("hex");
}

test("G3A U01 canonical visual family registry covers all 228 B_VISUAL questions exactly once", () => {
  assert.equal(registry.schemaName, "G3AU01CanonicalVisualPatternFamilyRegistryV1");
  assert.equal(registry.unitId, "g3a_u01_3a01");
  assert.deepEqual(registry.finalCounts, {
    B_VISUAL_TOTAL: 228,
    CANONICAL_VISUAL_PATTERN_FAMILIES: 18,
    UNCLUSTERED: 0
  });

  const familyIds = registry.families.map((row) => row.visualFamilyId);
  assert.equal(new Set(familyIds).size, familyIds.length);

  const clustered = registry.families.flatMap((row) => row.questionIds);
  assert.equal(clustered.length, 228);
  assert.equal(new Set(clustered).size, 228);

  const frozenB = modality.classificationSets.B_VISUAL.flatMap((row) => row.questionIds);
  assert.deepEqual([...clustered].sort(), [...frozenB].sort());
  assert.equal(digestLines(clustered), registry.setDigests.bVisualQuestionIdsSha256);
});

test("renderer reconciliation summary is complete and bounded", () => {
  assert.deepEqual(registry.rendererReconciliationSummary, {
    NATIVE: 11,
    EXTEND: 85,
    NEW_RENDERER: 120,
    NEW_RENDERER_COMPOSITE: 10,
    NEW_RENDERER_CANDIDATE: 2
  });

  const allowed = new Set(["NATIVE", "EXTEND", "NEW_RENDERER", "NEW_RENDERER_COMPOSITE", "NEW_RENDERER_CANDIDATE"]);
  assert.ok(registry.families.every((row) => allowed.has(row.rendererReconciliation.classification)));
  assert.equal(
    registry.families.reduce((sum, row) => sum + row.count, 0),
    228
  );
});

test("existing renderers are reused only for semantically compatible families", () => {
  const byId = new Map(registry.families.map((row) => [row.visualFamilyId, row]));
  assert.equal(
    byId.get("vf_g3a_u01_one_way_table_compare")?.rendererReconciliation.classification,
    "NATIVE"
  );
  assert.equal(
    byId.get("vf_g3a_u01_one_way_table_compare")?.rendererReconciliation.existingRendererPath,
    "site/modules/renderer/one-way-statistics-table.js"
  );

  for (const id of [
    "vf_g3a_u01_integer_number_line_read_value",
    "vf_g3a_u01_integer_number_line_mark_value",
    "vf_g3a_u01_integer_number_line_complete_scale",
    "vf_g3a_u01_integer_number_line_movement",
    "vf_g3a_u01_integer_number_line_relation_or_compute"
  ]) {
    assert.equal(byId.get(id)?.rendererReconciliation.classification, "EXTEND");
    assert.equal(
      byId.get(id)?.rendererReconciliation.existingRendererPath,
      "site/modules/renderer/fraction-number-line.js"
    );
  }
});

test("visually inspected edge cases stay in their canonical families", () => {
  const owner = new Map();
  for (const family of registry.families) {
    for (const questionId of family.questionIds) owner.set(questionId, family.visualFamilyId);
  }

  assert.equal(owner.get("exam_pdf_65fc1653aa1e_p1_I-3"), "vf_g3a_u01_integer_number_line_complete_scale");
  assert.equal(owner.get("exam_pdf_3e141c57c342_p2_V-1"), "vf_g3a_u01_base10_block_read");
  assert.equal(owner.get("exam_pdf_3dba86522ac7_p2_II-14a"), "vf_g3a_u01_receipt_range_reasoning");
  assert.equal(owner.get("exam_pdf_3dba86522ac7_p2_II-14b"), "vf_g3a_u01_receipt_range_reasoning");
});
