import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { validatePatternSpec } from "../../src/validation/core/validate-pattern-spec.js";

const CONTRACT_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank03_integer_number_line_mark_value.v1.json", import.meta.url);
const PREFLIGHT_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_rank03_source_authority_preflight.v1.json", import.meta.url);
const VISUAL_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.visual-pattern-families.v1.json", import.meta.url);
const MAPPING_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_formal_mapping_candidates.v1.json", import.meta.url);
const KP_PATH = new URL("../../data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json", import.meta.url);
const RANK02_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank02_integer_number_line_read_value.v1.json", import.meta.url);

const contract=JSON.parse(fs.readFileSync(CONTRACT_PATH,"utf8"));
const preflight=JSON.parse(fs.readFileSync(PREFLIGHT_PATH,"utf8"));
const visual=JSON.parse(fs.readFileSync(VISUAL_PATH,"utf8"));
const mappings=JSON.parse(fs.readFileSync(MAPPING_PATH,"utf8"));
const kp=JSON.parse(fs.readFileSync(KP_PATH,"utf8"));
const rank02=JSON.parse(fs.readFileSync(RANK02_PATH,"utf8"));

const FAMILY="vf_g3a_u01_integer_number_line_mark_value";
const CANONICAL_KP="kp_g3a_u01_integer_number_line_scale_location";
const GROUP="pg_g3a_u01_visual_integer_number_line_mark_value";
const SPEC="ps_g3a_u01_visual_integer_number_line_mark_value";

test("Rank03 contract materializes the exact source-backed MARK_GIVEN_VALUE family",()=>{
  const family=visual.families.find((row)=>row.visualFamilyId===FAMILY);
  assert.ok(family);
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(contract.status,"hidden_runtime_accepted_public_cutover_not_started");
  assert.equal(contract.sourceAuthorityPreflight.visualFamilyId,FAMILY);
  assert.equal(contract.sourceAuthorityPreflight.sourceQuestionCount,20);
  assert.equal(contract.sourceAuthorityPreflight.taskCore,"MARK_GIVEN_VALUE");
  assert.equal(contract.sourceAuthorityPreflight.priorityRank,3);
  assert.equal(contract.sourceAuthorityPreflight.priorityWave,"P1_SHARED_NUMBER_LINE_EXTENSION");
  assert.deepEqual([...contract.sourceCoverage.sourceQuestionIds].sort(),[...family.questionIds].sort());
});

test("Rank03 keeps curriculum page 3 as shared scale semantics and historical exams as direct marking authority",()=>{
  assert.equal(contract.authority.curriculumSourcePage,3);
  assert.equal(contract.authority.curriculumEvidenceRole,"SHARED_NUMBER_LINE_SEMANTICS_ONLY");
  assert.equal(contract.authority.directTaskAuthority,"historical_exam_visual_family");
  assert.equal(contract.patternSpec.sourceMetadata.directTaskAuthority,"historical_exam_visual_family");
  assert.equal(contract.sourceSemanticFixtures.length,3);
  assert.ok(contract.sourceSemanticFixtures.every((row)=>row.provenanceClass==="SOURCE_GROUNDED"));
  assert.equal(contract.sourceSemanticFixtures[0].prompt,"在數線上標出23。");
});

test("Rank03 FormalMapping resolves the historical candidate to the existing canonical number-line KP",()=>{
  const candidate=mappings.mappings.find((row)=>row.visualFamilyId===FAMILY);
  const canonical=kp.knowledgePoints.find((row)=>row.knowledgePointId===CANONICAL_KP);
  assert.ok(candidate);
  assert.ok(canonical);
  assert.equal(rank02.status,"D0_COMPLETE");
  assert.equal(candidate.formalMappingCandidateId,"fmc_g3a_u01_integer_number_line_mark_value");
  assert.equal(candidate.primaryKnowledgePointId,"kpc_g3a_u01_integer_number_line_scale_location");
  assert.equal(contract.formalMapping.sourceMappingCandidateId,candidate.formalMappingCandidateId);
  assert.equal(contract.formalMapping.primaryKnowledgePointId,CANONICAL_KP);
  assert.equal(contract.formalMapping.historicalPrimaryKnowledgePointCandidateId,candidate.primaryKnowledgePointId);
  assert.equal(contract.formalMapping.patternGroupId,GROUP);
  assert.equal(contract.formalMapping.patternSpecId,SPEC);
  assert.equal(contract.formalMapping.runtimeAdmission,true);
  assert.equal(contract.lifecycle.newKnowledgePointMinted,false);
});

test("Rank03 PatternSpec contract passes repository schema validation and remains hidden",()=>{
  assert.equal(contract.patternSpec.patternSpecId,SPEC);
  assert.equal(contract.patternSpec.patternGroupId,GROUP);
  assert.equal(contract.patternSpec.knowledgePointId,CANONICAL_KP);
  assert.equal(contract.patternSpec.taskCore,"MARK_GIVEN_VALUE");
  assert.deepEqual(contract.patternSpec.allowedPromptVariants,["MARK_GIVEN_VALUE"]);
  assert.equal(contract.patternSpec.selectorStatus,"hidden");
  assert.equal(contract.patternSpec.productionUse,"forbidden");

  const result=validatePatternSpec(contract.patternSpec);
  assert.equal(result.validationStatus,"pass");
  assert.deepEqual(result.errorCodes,[]);
});

test("Rank03 validator contract enforces a unique legal tick and prevents answer leakage",()=>{
  assert.equal(
    contract.patternSpec.answerModel.equation,
    "targetTickIndex = (targetValue - startValue) / step"
  );
  assert.ok(contract.validatorContract.inputModelChecks.includes("target_value_minus_start_is_divisible_by_step"));
  assert.ok(contract.validatorContract.inputModelChecks.includes("derived_target_index_is_one_legal_tick"));
  assert.ok(contract.validatorContract.questionRepresentationChecks.includes("question_number_line_contains_no_answer_marker"));
  assert.ok(contract.validatorContract.answerRepresentationChecks.includes("answer_marker_tick_index_equals_derived_target_index"));
  assert.ok(contract.validatorContract.forbidden.includes("question_leaks_answer_marker"));
  assert.ok(contract.validatorContract.forbidden.includes("target_between_legal_ticks"));
});

test("Rank03 renderer contract reuses Rank02 integer-number-line geometry and adds only question-vs-answer overlay semantics",()=>{
  assert.equal(contract.rendererExtensionContract.existingRendererPath,"site/modules/renderer/fraction-number-line.js");
  assert.equal(contract.rendererExtensionContract.existingModelKind,"integer_number_line");
  assert.equal(
    contract.rendererExtensionContract.classification,
    "EXTEND_EXISTING_INTEGER_NUMBER_LINE_RUNTIME_IMPLEMENTED"
  );
  assert.equal(contract.rendererExtensionContract.noNewRendererFamily,true);
  assert.equal(contract.rendererExtensionContract.rendererCodeChangeRequired,true);
  assert.equal(contract.rendererExtensionContract.rendererCodeChanged,true);
  assert.deepEqual(contract.rendererExtensionContract.implementedMarkerPolicies,["forbidden","required"]);
  assert.equal(contract.rendererExtensionContract.rank03RequiredModelExtension.questionTargetMarkerOptionalOrAbsent,true);
  assert.equal(contract.rendererExtensionContract.rank03RequiredModelExtension.answerOverlayMarkerRequired,true);
  assert.equal(contract.rendererExtensionContract.rank03RequiredModelExtension.questionAndAnswerScaleIdentityRequired,true);
});

test("Rank03 controlled examples satisfy the mark-value index equation without being misrepresented as source facts",()=>{
  for(const example of contract.controlledContractExamples){
    assert.equal(example.provenanceClass,"CONTROLLED_CONTRACT_EXAMPLE_NOT_SOURCE_FACT");
    const {startValue,step,targetValue}=example.model;
    assert.equal((targetValue-startValue)%step,0);
    assert.equal(example.expected.targetTickIndex,(targetValue-startValue)/step);
  }
});

test("Rank03 contract advances to hidden runtime while excluding public selector and Rank04+",()=>{
  assert.equal(contract.lifecycle.formalMappingMaterialized,true);
  assert.equal(contract.lifecycle.patternSpecMaterialized,true);
  assert.equal(contract.lifecycle.validatorContractMaterialized,true);
  assert.equal(contract.lifecycle.rendererExtensionContractMaterialized,true);
  assert.equal(contract.lifecycle.generatorImplemented,true);
  assert.equal(contract.lifecycle.validatorRuntimeImplemented,true);
  assert.equal(contract.lifecycle.rendererCodeChanged,true);
  assert.equal(contract.lifecycle.hiddenWorksheetImplemented,true);
  assert.equal(contract.lifecycle.hiddenWorksheetAcceptance,"PASS_FOCUSED_CI");
  assert.equal(contract.lifecycle.hiddenRuntimeFocusedGate,"PASS");
  assert.equal(contract.lifecycle.hiddenRuntimeMerged,true);
  assert.equal(contract.lifecycle.hiddenRuntimeMergeSha,"6a3260fcc6e26ce5a7c01bc03f28b668b64c1f75");
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.status,"PASS");
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.overflowPageCount,0);
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.overflowCellCount,0);
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.questionMarkerCount,0);
  assert.equal(contract.hiddenRuntime.hiddenWorksheetAcceptance.answerMarkerCount,60);
  assert.equal(contract.hiddenRuntime.layoutDecision,"PASS_NO_SIZE_CHANGE_REQUIRED");
  assert.equal(contract.hiddenRuntime.publicCutoverStarted,false);
  assert.equal(contract.lifecycle.selectorVisible,false);
  assert.equal(contract.lifecycle.productionUse,"forbidden");
  assert.equal(contract.patternSpec.constraints.generation.rank04ToRank05OperationsForbidden,true);
  assert.equal(contract.patternSpec.constraints.generation.movementTaskForbidden,true);
});
