import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function loadJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(repoRoot, relativePath), "utf8"));
}

const mapping = loadJson("data/curriculum/mapping/S57_G3B_U04_SourceFieldKnowledgePointMapping.json");
const templates = loadJson("data/curriculum/templates/S57_G3B_U04_SemanticTemplateFamilies.json");
const contract = loadJson("data/curriculum/contracts/S57_G3B_U04_SemanticValidationContract.json");

test("G3B-U04 source mapping locks 18 fields to 9 unique knowledge points", () => {
  assert.equal(mapping.sourceFields.length, 18);
  assert.equal(mapping.knowledgePoints.length, 9);
  assert.equal(new Set(mapping.knowledgePoints.map((row) => row.knowledgePointId)).size, 9);
  assert.equal(mapping.summary.sourceLabelMismatches, 1);
});

test("G3B-U04 known PDF heading mismatch maps to multiplication then division", () => {
  const mismatch = mapping.sourceFields.find((row) => row.sourceFieldId === "g3b_u04_p1_r2_r");
  assert.ok(mismatch);
  assert.equal(mismatch.sourceLabelMismatch, true);
  assert.equal(mismatch.actualOperationHeading, "先乘→再除");
  assert.equal(mismatch.equation, "(87*2)/3");
  assert.equal(mismatch.knowledgePointId, "kp_g3b_u04_multiply_then_divide_average_unit_price");
});

test("G3B-U04 approved registry provides at least 27 distinct semantic families", () => {
  assert.ok(templates.templateFamilies.length >= 27);
  assert.equal(templates.templateFamilies.length, templates.semanticFamilyCount);
  assert.equal(
    new Set(templates.templateFamilies.map((row) => row.templateFamilyId)).size,
    templates.templateFamilies.length
  );
  assert.equal(templates.summary.minimumFamilyGatePassed, true);
});

test("every source field and template family resolves to approved registry IDs", () => {
  const knowledgePointIds = new Set(mapping.knowledgePoints.map((row) => row.knowledgePointId));
  const templateFamilyIds = new Set(templates.templateFamilies.map((row) => row.templateFamilyId));

  for (const sourceField of mapping.sourceFields) {
    assert.ok(knowledgePointIds.has(sourceField.knowledgePointId), sourceField.sourceFieldId);
    assert.ok(templateFamilyIds.has(sourceField.semanticTemplateFamilyId), sourceField.sourceFieldId);
  }

  for (const family of templates.templateFamilies) {
    assert.ok(knowledgePointIds.has(family.knowledgePointId), family.templateFamilyId);
    assert.ok(family.semanticSignature);
    assert.ok(family.equationShape);
    assert.ok(family.unknownRole);
    assert.ok(family.promptSkeletonZh);
    assert.ok(Object.keys(family.quantityRoles).length >= 2);
    assert.ok(family.requiredConstraints.length >= 3);
  }
});

test("semantic template coverage summary matches actual family allocation", () => {
  const actualCoverage = Object.fromEntries(
    mapping.knowledgePoints.map((row) => [row.knowledgePointId, 0])
  );
  for (const family of templates.templateFamilies) {
    actualCoverage[family.knowledgePointId] += 1;
  }
  assert.deepEqual(actualCoverage, templates.coverageSummary);
});

test("semantic validation is blocking and covers every approved knowledge point", () => {
  assert.equal(contract.validationPolicy.semanticErrorsAreBlocking, true);
  assert.equal(contract.blockingErrorCodes.length, 25);
  assert.equal(contract.warningCodes.length, 3);
  assert.equal(contract.validationStages.length, 8);

  const knowledgePointIds = mapping.knowledgePoints.map((row) => row.knowledgePointId).sort();
  assert.deepEqual(Object.keys(contract.knowledgePointInvariants).sort(), knowledgePointIds);
  assert.ok(
    contract.validationPolicy.forbiddenFallbacks.includes("accept_by_numeric_answer_only")
  );
  assert.ok(
    contract.validationPolicy.forbiddenFallbacks.includes(
      "accept_implausible_real_world_quantity_because_arithmetic_is_valid"
    )
  );
});

test("former context and representation rows are normalized to tags, not knowledge points", () => {
  const knowledgePointIds = new Set(mapping.knowledgePoints.map((row) => row.knowledgePointId));
  const normalizedFormerRows = Object.keys(mapping.tagNormalization.formerS43E6RowsNowTags);
  assert.equal(normalizedFormerRows.length, 5);
  for (const formerRow of normalizedFormerRows) {
    assert.equal(knowledgePointIds.has(formerRow), false, formerRow);
  }
});

