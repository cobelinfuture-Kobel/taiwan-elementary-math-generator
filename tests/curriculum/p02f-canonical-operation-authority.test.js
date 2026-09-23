import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const ROOT = process.cwd();
const AUTHORITY_PATH = "data/curriculum/application/operations/w02/g4a_u06_4a06.canonical-operation.json";

test("P02F preserves the canonical fraction-or-mixed-number quantity times integer model", () => {
  const authority = JSON.parse(fs.readFileSync(path.join(ROOT, AUTHORITY_PATH), "utf8"));
  const knowledgePoint = authority.knowledgePoints.find((row) => (
    row.knowledgePointId === "kp_g4a_u06_fraction_times_integer_quantity"
  ));
  assert.ok(knowledgePoint, "canonical source operation is missing");
  const model = knowledgePoint.operationModels[0];
  assert.equal(knowledgePoint.knowledgePointName, "分數或帶分數乘整數量");
  assert.equal(model.operationFamilyId, "fraction_times_integer");
  assert.equal(model.operandRoles.amountPerGroup, "每份分數或帶分數量");
  assert.equal(model.operandRoles.groupCount, "份數");
  assert.equal(model.answerType, "fraction_measure");
  assert.ok(model.equivalentForms.includes("repeated addition"));
  assert.ok(model.equivalentForms.includes("fraction multiplication"));
  assert.ok(model.numberConstraints.includes("groupCount is a nonnegative integer"));
  assert.ok(model.numberConstraints.includes("amountPerGroup >= 0"));
  assert.ok(model.validationInvariants.includes("measurement unit is preserved"));
});
