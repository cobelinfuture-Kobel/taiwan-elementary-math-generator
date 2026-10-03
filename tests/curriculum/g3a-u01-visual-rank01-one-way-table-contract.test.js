import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { validatePatternSpec } from "../../src/validation/core/validate-pattern-spec.js";
import {
  validateOneWayStatisticsTable,
  renderOneWayStatisticsTable
} from "../../site/modules/renderer/one-way-statistics-table.js";

const CONTRACT_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank01_one_way_table_compare.v1.json", import.meta.url);
const VISUAL_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.visual-pattern-families.v1.json", import.meta.url);
const MAPPING_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_formal_mapping_candidates.v1.json", import.meta.url);

const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
const visual = JSON.parse(fs.readFileSync(VISUAL_PATH, "utf8"));
const mappings = JSON.parse(fs.readFileSync(MAPPING_PATH, "utf8"));

test("Rank01 materializes one hidden PatternSpec from the approved FormalMapping candidate", () => {
  assert.equal(contract.schemaName, "G3AU01VisualPatternSpecRank01Contract");
  assert.equal(contract.formalMapping.formalMappingId, "fm_g3a_u01_visual_one_way_table_compare");
  assert.equal(contract.formalMapping.sourceMappingCandidateId, "fmc_g3a_u01_one_way_table_compare");
  assert.equal(contract.patternSpec.patternSpecId, "ps_g3a_u01_visual_one_way_table_compare");
  assert.equal(contract.patternSpec.sourcePatternSpecCandidateId, "psc_g3a_u01_visual_one_way_table_compare");
  assert.equal(contract.patternSpec.knowledgePointId, "kp_g3a_u01_4digit_compare");
  assert.equal(contract.patternSpec.selectorStatus, "hidden");
  assert.equal(contract.patternSpec.productionUse, "forbidden");
  assert.equal(contract.lifecycle.generatorImplemented, false);
  assert.equal(contract.lifecycle.validatorRuntimeImplemented, false);
});

test("Rank01 PatternSpec passes the repository core PatternSpec schema helper", () => {
  const result = validatePatternSpec(contract.patternSpec);
  assert.equal(result.validationStatus, "pass");
  assert.deepEqual(result.errorCodes, []);
});

test("Rank01 preserves exact 11-question visual-family lineage", () => {
  const family = visual.families.find((row) => row.visualFamilyId === "vf_g3a_u01_one_way_table_compare");
  const candidate = mappings.mappings.find((row) => row.visualFamilyId === family.visualFamilyId);
  assert.equal(family.count, 11);
  assert.equal(candidate.questionCount, 11);
  assert.equal(contract.sourceCoverage.sourceQuestionCount, 11);
  assert.deepEqual([...contract.sourceCoverage.sourceQuestionIds].sort(), [...family.questionIds].sort());
  assert.deepEqual([...contract.patternSpec.sourceMetadata.sourceQuestionIds].sort(), [...family.questionIds].sort());
});

test("Rank01 native renderer binding accepts the source calibration model without renderer changes", () => {
  const fixture = contract.sourceCalibrationFixtures[0];
  assert.equal(validateOneWayStatisticsTable(fixture.model), true);
  const html = renderOneWayStatisticsTable(fixture.model);
  assert.match(html, /data-representation="one-way-statistics-table"/);
  assert.match(html, /9080/);
  assert.match(html, /9800/);
  assert.match(html, /9008/);
  assert.equal(contract.rendererBinding.noRendererCodeChangeRequired, true);
});

test("Rank01 source calibration answer satisfies the materialized minimum contract", () => {
  const fixture = contract.sourceCalibrationFixtures[0];
  const rows = fixture.model.rows;
  const min = rows.reduce((best, row) => row.displayValue < best.displayValue ? row : best);
  assert.deepEqual(fixture.expectedAnswer, {
    selectedCategory:min.displayCategory,
    selectedValue:min.displayValue
  });
  assert.equal(min.displayCategory, "第三天");
  assert.equal(min.displayValue, 9008);
});

test("Rank01 lifecycle stops before runtime implementation and selector admission", () => {
  assert.deepEqual(contract.lifecycle, {
    formalMappingMaterialized:true,
    patternGroupMaterialized:true,
    patternSpecMaterialized:true,
    answerModelMaterialized:true,
    validatorContractMaterialized:true,
    nativeRendererBindingMaterialized:true,
    generatorImplemented:false,
    validatorRuntimeImplemented:false,
    rendererCodeChanged:false,
    selectorVisible:false,
    productionUse:"forbidden"
  });
});
