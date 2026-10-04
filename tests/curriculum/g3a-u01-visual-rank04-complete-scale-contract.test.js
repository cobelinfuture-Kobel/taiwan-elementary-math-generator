import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { validatePatternSpec } from "../../src/validation/core/validate-pattern-spec.js";

const CONTRACT_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank04_integer_number_line_complete_scale.v1.json", import.meta.url);
const PREFLIGHT_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_rank04_source_authority_preflight.v1.json", import.meta.url);
const VISUAL_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.visual-pattern-families.v1.json", import.meta.url);
const MAPPING_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_formal_mapping_candidates.v1.json", import.meta.url);
const KP_PATH = new URL("../../data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json", import.meta.url);
const RANK03_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank03_integer_number_line_mark_value.v1.json", import.meta.url);

const contract=JSON.parse(fs.readFileSync(CONTRACT_PATH,"utf8"));
const preflight=JSON.parse(fs.readFileSync(PREFLIGHT_PATH,"utf8"));
const visual=JSON.parse(fs.readFileSync(VISUAL_PATH,"utf8"));
const mappings=JSON.parse(fs.readFileSync(MAPPING_PATH,"utf8"));
const kp=JSON.parse(fs.readFileSync(KP_PATH,"utf8"));
const rank03=JSON.parse(fs.readFileSync(RANK03_PATH,"utf8"));

const FAMILY="vf_g3a_u01_integer_number_line_complete_scale";
const CANONICAL_KP="kp_g3a_u01_integer_number_line_scale_location";
const GROUP="pg_g3a_u01_visual_integer_number_line_complete_scale";
const SPEC="ps_g3a_u01_visual_integer_number_line_complete_scale";

test("Rank04 contract materializes the exact source-backed COMPLETE_MISSING_TICK_VALUES family",()=>{
  const family=visual.families.find((row)=>row.visualFamilyId===FAMILY);
  assert.ok(family);
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(contract.status,"public_cutover_implemented_pending_three_mode_acceptance");
  assert.equal(contract.sourceAuthorityPreflight.visualFamilyId,FAMILY);
  assert.equal(contract.sourceAuthorityPreflight.sourceQuestionCount,7);
  assert.equal(contract.sourceAuthorityPreflight.taskCore,"COMPLETE_MISSING_TICK_VALUES");
  assert.equal(contract.sourceAuthorityPreflight.priorityRank,4);
  assert.deepEqual([...contract.sourceCoverage.sourceQuestionIds].sort(),[...family.questionIds].sort());
});

test("Rank04 keeps curriculum page 3 as shared scale semantics and historical exams as direct completion authority",()=>{
  assert.equal(contract.authority.curriculumSourcePage,3);
  assert.equal(contract.authority.curriculumEvidenceRole,"SHARED_NUMBER_LINE_SEMANTICS_ONLY");
  assert.equal(contract.authority.directTaskAuthority,"historical_exam_visual_family");
  assert.equal(contract.patternSpec.sourceMetadata.directTaskAuthority,"historical_exam_visual_family");
  assert.equal(contract.sourceSemanticFixtures.length,3);
  assert.ok(contract.sourceSemanticFixtures.every((row)=>row.provenanceClass==="SOURCE_GROUNDED"));
});

test("Rank04 FormalMapping resolves to the existing canonical number-line KP after Rank03 D0",()=>{
  const candidate=mappings.mappings.find((row)=>row.visualFamilyId===FAMILY);
  const canonical=kp.knowledgePoints.find((row)=>row.knowledgePointId===CANONICAL_KP);
  assert.ok(candidate);
  assert.ok(canonical);
  assert.match(canonical.scope,/補刻度/);
  assert.equal(rank03.status,"D0_COMPLETE");
  assert.equal(rank03.lifecycle.d0Closeout,"PASS");
  assert.equal(candidate.formalMappingCandidateId,"fmc_g3a_u01_integer_number_line_complete_scale");
  assert.equal(candidate.primaryKnowledgePointId,"kpc_g3a_u01_integer_number_line_scale_location");
  assert.equal(contract.formalMapping.sourceMappingCandidateId,candidate.formalMappingCandidateId);
  assert.equal(contract.formalMapping.primaryKnowledgePointId,CANONICAL_KP);
  assert.equal(contract.formalMapping.patternGroupId,GROUP);
  assert.equal(contract.formalMapping.patternSpecId,SPEC);
  assert.equal(contract.lifecycle.newKnowledgePointMinted,false);
});

test("Rank04 PatternSpec validates after bounded public-review cutover",()=>{
  assert.equal(contract.patternSpec.patternSpecId,SPEC);
  assert.equal(contract.patternSpec.patternGroupId,GROUP);
  assert.equal(contract.patternSpec.knowledgePointId,CANONICAL_KP);
  assert.equal(contract.patternSpec.taskCore,"COMPLETE_MISSING_TICK_VALUES");
  assert.equal(contract.patternSpec.selectorStatus,"visible_public_review");
  assert.equal(contract.patternSpec.productionUse,"public_review");
  const result=validatePatternSpec(contract.patternSpec);
  assert.equal(result.validationStatus,"pass");
  assert.deepEqual(result.errorCodes,[]);
});

test("Rank04 validator contract enforces exact missing-value reconstruction without answer leakage",()=>{
  assert.equal(
    contract.patternSpec.answerModel.equation,
    "missingValues[i] = startValue + missingTickIndices[i] * step"
  );
  assert.ok(contract.validatorContract.inputModelChecks.includes("missing_tick_indices_are_unique_legal_ticks"));
  assert.ok(contract.validatorContract.questionRepresentationChecks.includes("question_does_not_leak_missing_values_as_labels"));
  assert.ok(contract.validatorContract.answerChecks.includes("all_question_visible_labels_are_preserved"));
  assert.ok(contract.validatorContract.answerRepresentationChecks.includes("answer_restores_missing_labels_at_exact_tick_indices"));
  assert.ok(contract.validatorContract.forbidden.includes("wrong_completed_value"));
});

test("Rank04 can reuse the current integer-number-line renderer without code changes",()=>{
  assert.equal(contract.rendererBinding.existingRendererPath,"site/modules/renderer/fraction-number-line.js");
  assert.equal(contract.rendererBinding.existingModelKind,"integer_number_line");
  assert.equal(contract.rendererBinding.classification,"REUSE_EXISTING_INTEGER_NUMBER_LINE_RUNTIME_WITH_MODEL_PROJECTION");
  assert.equal(contract.rendererBinding.newRendererFamilyRequired,false);
  assert.equal(contract.rendererBinding.rendererCodeChangeRequired,false);
  assert.equal(contract.rendererBinding.rendererCodeChanged,false);
});

test("Rank04 controlled examples satisfy the completion equation and preserve source-vs-controlled provenance",()=>{
  for(const example of contract.controlledContractExamples){
    assert.equal(example.provenanceClass,"CONTROLLED_CONTRACT_EXAMPLE_NOT_SOURCE_FACT");
    const {startValue,step,missingTickIndices}=example.model;
    assert.deepEqual(
      example.expected.missingValues,
      missingTickIndices.map((index)=>startValue+index*step)
    );
  }
});

test("Rank04 preserves hidden-runtime evidence while bounded public cutover starts without Rank05+ scope",()=>{
  assert.equal(contract.lifecycle.formalMappingMaterialized,true);
  assert.equal(contract.lifecycle.patternSpecMaterialized,true);
  assert.equal(contract.lifecycle.validatorContractMaterialized,true);
  assert.equal(contract.lifecycle.rendererReuseContractMaterialized,true);
  assert.equal(contract.lifecycle.generatorImplemented,true);
  assert.equal(contract.lifecycle.validatorRuntimeImplemented,true);
  assert.equal(contract.lifecycle.hiddenWorksheetImplemented,true);
  assert.equal(contract.lifecycle.hiddenWorksheetAcceptance,"PASS_FOCUSED_CI");
  assert.equal(contract.lifecycle.hiddenRuntimeFocusedGate,"PASS");
  assert.equal(contract.lifecycle.hiddenRuntimeMerged,true);
  assert.equal(contract.lifecycle.hiddenRuntimeMergeSha,"dd1a793be1c68739a522307341c4a7d1227ce06f");
  assert.equal(contract.lifecycle.rendererCodeChanged,false);
  assert.equal(contract.lifecycle.selectorVisible,true);
  assert.equal(contract.lifecycle.productionUse,"public_review");
  assert.equal(contract.lifecycle.publicCutover,"PENDING_FOCUSED_CI");
  assert.equal(contract.lifecycle.threeModeE2E,"PENDING_FOCUSED_CI");
  assert.equal(contract.hiddenRuntime.selectorVisible,true);
  assert.equal(contract.hiddenRuntime.productionUse,"public_review");
  assert.equal(contract.hiddenRuntime.publicCutoverStarted,true);
  assert.equal(contract.publicCutover.selectorTargetId,"pg_g3a_u01_visual_integer_number_line_complete_scale");
  assert.equal(contract.publicCutover.expectedSameUnitSelectorTargetCount,12);
  assert.equal(contract.hiddenRuntime.focusedGateRunId,37243469584);
  assert.equal(contract.hiddenRuntime.focusedGateHeadSha,"d47c30fe03788ca9fe482b84cd1efaf1cb2be351");
  assert.deepEqual(contract.hiddenRuntime.focusedNodeTests,{tests:14,pass:14,fail:0});
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.status,"PASS");
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.overflowPageCount,0);
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.overflowCellCount,0);
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.projectionMismatchCount,0);
  assert.equal(contract.hiddenRuntime.layoutDecision,"PASS_ACTUAL_A4_2X3_NO_OVERFLOW");
  assert.equal(contract.patternSpec.constraints.generation.rank05ToRank06OperationsForbidden,true);
});
