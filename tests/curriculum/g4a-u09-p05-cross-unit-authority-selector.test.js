import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  P05_CROSS_UNIT_PATTERN_ROWS, P05_CROSS_UNIT_STATUS, P05_DIMENSION_OWNERS,
  P05_COMPARISON_KP_ID, listG4AU09P05CrossUnitPatternRows,
  resolveG4AU09P05CrossUnitRoute,
  validateG4AU09P05MinorQuantity,
  validateG4AU09P05SameDimension,
} from "../../site/modules/curriculum/registry/g4a-u09-p05-cross-unit-selector-projection.js";
import { G4A_U09_HIDDEN_PENDING_KP_IDS, G4A_U09_CURRENT_PUBLIC_KP_IDS } from "../../site/modules/curriculum/batch-a/g4a-u09-current-coordinator.js";
import { G3B_U02_P04F7_CONVERSION_KP_ID } from "../../site/modules/curriculum/registry/g3b-u02-capacity-scale-conversion-selector-projection-p04f7.js";
import { G3B_U06_P04F9_KP_ID } from "../../site/modules/curriculum/registry/g3b-u06-mass-kg-g-conversion-selector-projection-p04f9.js";
const authority = JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05/g4a-u09-p05-cross-unit-authority-selector-gate-v1.json", import.meta.url), "utf8"));

test("P05 authority is narrowly staged without generator or public selector admission", () => {
  assert.equal(authority.designAuthority.patternCount, 10);
  assert.equal(authority.designAuthority.reviewedExamples, 50);
  assert.deepEqual(authority.decision.gates, ["A1", "A2", "A3", "A4"]);
  assert.equal(authority.admissionState.publicProductionAdmitted, false);
  assert.equal(authority.admissionState.currentCoordinatorModified, false);
  assert.equal(authority.admissionState.generatorImplemented, false);
  assert.equal(P05_CROSS_UNIT_STATUS, "AUTHORITY_SELECTOR_STAGED_NOT_PUBLIC");
  assert.equal(P05_CROSS_UNIT_PATTERN_ROWS.length, 10);
  assert.equal(new Set(P05_CROSS_UNIT_PATTERN_ROWS.map(row=>row.patternId)).size, 10);
  assert.equal(new Set(P05_CROSS_UNIT_PATTERN_ROWS.map(row=>row.patternSpecId)).size, 10);
  assert.deepEqual(authority.composition.patternIds, P05_CROSS_UNIT_PATTERN_ROWS.map(row=>row.patternId));
});
test("P05 source owners are not rewritten or misbound across dimensions", () => {
  assert.equal(P05_DIMENSION_OWNERS.LENGTH.ownerKpId, "kp_g4a_u09_decimal_length_conversion");
  assert.equal(P05_DIMENSION_OWNERS.MASS.ownerKpId, G3B_U06_P04F9_KP_ID);
  assert.equal(P05_DIMENSION_OWNERS.CAPACITY.ownerKpId, G3B_U02_P04F7_CONVERSION_KP_ID);
  assert.deepEqual(authority.sourceAuthority.map(x=>x.kpId), [P05_DIMENSION_OWNERS.LENGTH.ownerKpId, P05_DIMENSION_OWNERS.MASS.ownerKpId, P05_DIMENSION_OWNERS.CAPACITY.ownerKpId]);
  assert.equal(P05_COMPARISON_KP_ID, "kp_g4a_u09_decimal_compare");
  assert.ok(G4A_U09_HIDDEN_PENDING_KP_IDS.includes(P05_DIMENSION_OWNERS.LENGTH.ownerKpId));
  assert.ok(!G4A_U09_CURRENT_PUBLIC_KP_IDS.includes(P05_DIMENSION_OWNERS.LENGTH.ownerKpId));
  assert.ok(!G4A_U09_CURRENT_PUBLIC_KP_IDS.includes(G3B_U06_P04F9_KP_ID));
  assert.ok(!G4A_U09_CURRENT_PUBLIC_KP_IDS.includes(G3B_U02_P04F7_CONVERSION_KP_ID));
});
test("P05 10 pattern x 3 dimensions are referenced via correct owner and never admitted for production", () => {
  for (const pattern of P05_CROSS_UNIT_PATTERN_ROWS) {
    for (const dimensionId of ["LENGTH","MASS","CAPACITY"]) {
      const result = resolveG4AU09P05CrossUnitRoute({patternId:pattern.patternId,dimensionId,questionMode:pattern.patternId==="P05-10"?"application":"numeric"});
      assert.equal(result.ok,true,`${pattern.patternId}/${dimensionId}`);
      assert.equal(result.ownerKnowledgePointId,P05_DIMENSION_OWNERS[dimensionId].ownerKpId);
      assert.equal(result.ownerSourceUnitCode,P05_DIMENSION_OWNERS[dimensionId].ownerUnitCode);
      assert.equal(result.globalSelectorVisible,false);
      assert.equal(result.generatorAllowed,false);
      assert.equal(result.publicProductionAllowed,false);
      assert.equal(result.applicationContextAuthorized,false);
      assert.equal(result.applicationContextRequired, dimensionId==="LENGTH" || pattern.patternId==="P05-10");
      assert.equal(result.comparisonKnowledgePointId,["P05-06","P05-07","P05-08","P05-10"].includes(pattern.patternId)?P05_COMPARISON_KP_ID:null);
    }
  }
});
test("P05-10 cannot be silently routed as numeric; illegal inputs reject deterministically", () => {
  assert.deepEqual(resolveG4AU09P05CrossUnitRoute({patternId:"P05-10",dimensionId:"CAPACITY",questionMode:"numeric"}),{ok:false,code:"P05_CONTEXT_MODE_REQUIRED"});
  assert.equal(resolveG4AU09P05CrossUnitRoute({patternId:"P05-01",dimensionId:"WEIGHT"}).code,"P05_DIMENSION_INVALID");
  assert.equal(resolveG4AU09P05CrossUnitRoute({patternId:"P05-11",dimensionId:"LENGTH"}).code,"P05_PATTERN_INVALID");
  assert.equal(resolveG4AU09P05CrossUnitRoute({patternId:"P05-01",dimensionId:"LENGTH",sourceId:"g3b_u02_3b02"}).code,"P05_SOURCE_INVALID");
  assert.equal(resolveG4AU09P05CrossUnitRoute({patternId:"P05-01",dimensionId:"LENGTH",questionMode:"unreviewed"}).code,"P05_MODE_INVALID");
});
test("P05 unit factors and two-decimal exact conversion guard", () => {
  assert.deepEqual(
    Object.fromEntries(Object.entries(P05_DIMENSION_OWNERS).map(([key,x])=>[key,[x.factor,x.minorDivisibility]])),
    {LENGTH:[100,1],MASS:[1000,10],CAPACITY:[1000,10]});
  assert.equal(validateG4AU09P05MinorQuantity({dimensionId:"CAPACITY",minorInteger:120}).majorText,"0.12");
  assert.equal(validateG4AU09P05MinorQuantity({dimensionId:"MASS",minorInteger:1240}).majorText,"1.24");
  assert.equal(validateG4AU09P05MinorQuantity({dimensionId:"LENGTH",minorInteger:308}).majorText,"3.08");
  assert.equal(validateG4AU09P05MinorQuantity({dimensionId:"CAPACITY",minorInteger:125}).code,"P05_THIRD_DECIMAL_FORBIDDEN");
  assert.equal(validateG4AU09P05MinorQuantity({dimensionId:"MASS",minorInteger:385}).code,"P05_THIRD_DECIMAL_FORBIDDEN");
  assert.equal(validateG4AU09P05MinorQuantity({dimensionId:"MASS",minorInteger:-1}).code,"P05_MINOR_VALUE_INVALID");
  assert.equal(validateG4AU09P05MinorQuantity({dimensionId:"LENGTH",minorInteger:2.1}).code,"P05_MINOR_VALUE_INVALID");
});
test("P05 dimension cross-contamination forbidden", () => {
  assert.equal(validateG4AU09P05SameDimension(["LENGTH","LENGTH"]),true);
  assert.equal(validateG4AU09P05SameDimension(["MASS","CAPACITY"]),false);
  assert.equal(validateG4AU09P05SameDimension(["CAPACITY","CAPACITY","CAPACITY"]),true);
  assert.equal(validateG4AU09P05SameDimension(["WEIGHT","WEIGHT"]),false);
  assert.equal(validateG4AU09P05SameDimension([]),false);
});
test("P05 selector registry data cannot be modified by returned list consumer", () => {
  const clone = listG4AU09P05CrossUnitPatternRows();
  clone[0].primaryKnowledgePointByDimension.MASS="kp_g4a_u09_decimal_length_conversion";
  assert.equal(P05_CROSS_UNIT_PATTERN_ROWS[0].primaryKnowledgePointByDimension.MASS,"kp_mass_kg_g_conversion");
});
