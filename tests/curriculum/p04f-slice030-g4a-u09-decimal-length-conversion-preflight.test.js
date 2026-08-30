import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const readJson=(path)=>JSON.parse(fs.readFileSync(new URL(`../../${path}`,import.meta.url),"utf8"));
const queue=readJson("data/curriculum/full-product/p04e/w4-direct-product-vertical-slice-queue.json");
const authority=readJson("data/curriculum/full-product/p04f/slice030-g4a-u09-decimal-length-conversion-preflight-authority.json");
const overrides=readJson("data/curriculum/full-product/p02e/quantity-semantic-role-overrides.json");

test("q030 frozen queue identity is exact rank7 G4A-U09 quantity-measurement",()=>{
  assert.equal(queue.orderedSliceIds[29],"p04e_q030_r7_g4a_u09_4a09_profile_quantity_measurement_c1");
  assert.equal(queue.orderedKnowledgePointIds[40],"kp_g4a_u09_decimal_length_conversion");
  assert.equal(authority.queue.queuePosition,30);
  assert.equal(authority.queue.primaryRuntimeProfileId,"profile_quantity_measurement");
  assert.equal(authority.knowledgePoints.length,1);
  assert.equal(authority.knowledgePoints[0].knowledgePointId,"kp_g4a_u09_decimal_length_conversion");
});

test("q030 source witness supports exact centimeter to decimal-meter equivalence",()=>{
  assert.equal(authority.source.driveFileId,"1UTeIt3juNA_gtsGWMs114FWPvAKnkMRT");
  assert.deepEqual(authority.source.primaryWitnessPages,[2]);
  assert.ok(authority.source.page2Witness.includes("805公分=( )公尺"));
  assert.ok(authority.source.page2Witness.includes("5公尺19公分=( )公尺"));
  assert.ok(authority.source.page2Witness.includes("2公尺7公分=( )公尺"));
});

test("q030 FormalMapping candidate locks two source-supported directions without rounding",()=>{
  const mapping=authority.formalMappingCandidate;
  assert.equal(mapping.relationFamilyId,"DECIMAL_LENGTH_EQUIVALENT_REPRESENTATION");
  assert.deepEqual(mapping.knownRoleIds,["SOURCE_LENGTH_REPRESENTATION"]);
  assert.equal(mapping.targetRoleId,"EQUIVALENT_LENGTH_REPRESENTATION");
  assert.deepEqual(mapping.allowedDirections,["CM_TO_M_DECIMAL","M_CM_TO_M_DECIMAL"]);
  assert.equal(mapping.unitInvariant.centimetersPerMeter,100);
  assert.equal(mapping.exactConversionRequired,true);
  assert.equal(mapping.roundingAllowed,false);
  assert.equal(overrides.bindings.some(row=>row.knowledgePointId==="kp_g4a_u09_decimal_length_conversion"),false);
});

test("q030 remains planning-only and q031 is untouched",()=>{
  assert.equal(authority.boundary.patternSpecMaterialized,false);
  assert.equal(authority.boundary.generatorMaterialized,false);
  assert.equal(authority.boundary.validatorMaterialized,false);
  assert.equal(authority.boundary.selectorPromoted,false);
  assert.equal(authority.boundary.worksheetEnabled,false);
  assert.equal(authority.boundary.q031Touched,false);
  assert.equal(authority.boundary.implementationApprovalRequired,true);
});
