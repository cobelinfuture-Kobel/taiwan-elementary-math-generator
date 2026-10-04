import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const PREFLIGHT_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_rank04_source_authority_preflight.v1.json", import.meta.url);
const VISUAL_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.visual-pattern-families.v1.json", import.meta.url);
const MAPPING_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_formal_mapping_candidates.v1.json", import.meta.url);
const KP_PATH = new URL("../../data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json", import.meta.url);
const RANK03_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank03_integer_number_line_mark_value.v1.json", import.meta.url);

const preflight=JSON.parse(fs.readFileSync(PREFLIGHT_PATH,"utf8"));
const visual=JSON.parse(fs.readFileSync(VISUAL_PATH,"utf8"));
const mapping=JSON.parse(fs.readFileSync(MAPPING_PATH,"utf8"));
const kp=JSON.parse(fs.readFileSync(KP_PATH,"utf8"));
const rank03=JSON.parse(fs.readFileSync(RANK03_PATH,"utf8"));

const FAMILY="vf_g3a_u01_integer_number_line_complete_scale";
const KP="kp_g3a_u01_integer_number_line_scale_location";

test("Rank04 preflight locks the 7-question COMPLETE_MISSING_TICK_VALUES visual family at rank 4",()=>{
  const family=visual.families.find((row)=>row.visualFamilyId===FAMILY);
  assert.ok(family);
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.rank,4);
  assert.equal(family.count,7);
  assert.equal(family.taskCore,"COMPLETE_MISSING_TICK_VALUES");
  assert.equal(family.representationFamily,"integer_number_line");
  assert.equal(preflight.visualFamily.questionCount,7);
  assert.equal(preflight.visualFamily.priorityWave,"P1_SHARED_NUMBER_LINE_EXTENSION");
});

test("Rank04 distinguishes shared curriculum number-line semantics from direct historical completion authority",()=>{
  assert.equal(preflight.sourceAuthority.curriculumSource.page,3);
  assert.equal(preflight.sourceAuthority.curriculumSource.supportLevel,"SHARED_NUMBER_LINE_SEMANTICS_ONLY");
  assert.equal(preflight.sourceAuthority.curriculumSource.directCompleteScaleEvidence,false);
  assert.equal(preflight.sourceAuthority.historicalExamVisualFamily.directTaskAuthority,true);
  assert.equal(preflight.sourceAuthority.historicalExamVisualFamily.sourceQuestionCount,7);
  assert.equal(preflight.sourceAuthority.historicalExamVisualFamily.sampleEvidence[0].expectedSemanticAnswer,"150");
  assert.equal(preflight.sourceAuthority.authorityDecision,"PASS");
});

test("Rank04 reuses the canonical number-line KP whose current scope explicitly includes scale completion",()=>{
  const current=kp.knowledgePoints.find((row)=>row.knowledgePointId===KP);
  assert.ok(current);
  assert.match(current.scope,/補刻度/);
  assert.equal(rank03.status,"D0_COMPLETE");
  assert.equal(rank03.lifecycle.d0Closeout,"PASS");
  assert.equal(preflight.knowledgePointResolution.currentCanonicalKnowledgePointId,KP);
  assert.equal(preflight.knowledgePointResolution.reuseExistingCanonicalKnowledgePoint,true);
  assert.equal(preflight.knowledgePointResolution.newKnowledgePointRequired,false);
});

test("Rank04 resolves the existing mapping candidate to the current canonical number-line KP",()=>{
  const candidate=mapping.mappings.find((row)=>row.visualFamilyId===FAMILY);
  assert.ok(candidate);
  assert.equal(candidate.formalMappingCandidateId,"fmc_g3a_u01_integer_number_line_complete_scale");
  assert.equal(candidate.patternSpecCandidateId,"psc_g3a_u01_visual_number_line_complete_scale");
  assert.equal(candidate.primaryKnowledgePointId,"kpc_g3a_u01_integer_number_line_scale_location");
  assert.equal(preflight.mappingReadback.resolvedPrimaryKnowledgePointId,KP);
  assert.equal(preflight.mappingReadback.operationContract,candidate.operationContract);
  assert.deepEqual(preflight.mappingReadback.validatorGuards,candidate.validatorGuards);
  assert.equal(preflight.mappingReadback.preflightDisposition,"READY_FOR_FORMAL_MAPPING_AND_PATTERNSPEC_CONTRACT");
});

test("Rank04 reuses the existing integer-number-line renderer and adds only missing-label completion semantics",()=>{
  assert.equal(preflight.rank02Rank03ReuseAssessment.sharedRendererPath,"site/modules/renderer/fraction-number-line.js");
  assert.equal(preflight.rank02Rank03ReuseAssessment.existingModelKind,"integer_number_line");
  assert.equal(preflight.rank02Rank03ReuseAssessment.rendererClassification,"EXTEND_EXISTING_INTEGER_NUMBER_LINE_RUNTIME");
  assert.equal(preflight.rank02Rank03ReuseAssessment.newRendererFamilyRequired,false);
  assert.ok(preflight.rank02Rank03ReuseAssessment.rank04RequiredExtension.some((value)=>value.includes("omit one or more legal tick labels")));
  assert.ok(preflight.rank02Rank03ReuseAssessment.rank04RequiredExtension.some((value)=>value.includes("restore every missing tick value")));
});

test("Rank04 preflight preserves the milestone boundary while the approved queue continues through Rank06",()=>{
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("materialize Rank04 PatternSpec"));
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("modify number-line renderer code"));
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("implement Rank04 generator or validator"));
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("implement Rank05 or Rank06"));
  assert.equal(
    preflight.nextStep,
    "G3A_U01_VisualRank04_FormalMappingAndPatternSpecContract_Then_CompleteScaleValidatorAndRendererExtensionContract"
  );
});
