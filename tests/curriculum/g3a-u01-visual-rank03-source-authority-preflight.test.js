import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const PREFLIGHT_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_rank03_source_authority_preflight.v1.json", import.meta.url);
const VISUAL_PATH = new URL("../../data/curriculum/representation/units/g3a_u01_3a01.visual-pattern-families.v1.json", import.meta.url);
const MAPPING_PATH = new URL("../../data/curriculum/mapping/g3a_u01_visual_formal_mapping_candidates.v1.json", import.meta.url);
const KP_PATH = new URL("../../data/curriculum/knowledge/units/g3a_u01_3a01.knowledge-operation.json", import.meta.url);
const RANK02_PATH = new URL("../../data/curriculum/pattern_specs/g3a_u01_visual_rank02_integer_number_line_read_value.v1.json", import.meta.url);

const preflight=JSON.parse(fs.readFileSync(PREFLIGHT_PATH,"utf8"));
const visual=JSON.parse(fs.readFileSync(VISUAL_PATH,"utf8"));
const mapping=JSON.parse(fs.readFileSync(MAPPING_PATH,"utf8"));
const kp=JSON.parse(fs.readFileSync(KP_PATH,"utf8"));
const rank02=JSON.parse(fs.readFileSync(RANK02_PATH,"utf8"));

const FAMILY="vf_g3a_u01_integer_number_line_mark_value";
const KP="kp_g3a_u01_integer_number_line_scale_location";

test("Rank03 preflight locks the 20-question MARK_GIVEN_VALUE visual family at rank 3",()=>{
  const family=visual.families.find((row)=>row.visualFamilyId===FAMILY);
  assert.ok(family);
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.rank,3);
  assert.equal(family.count,20);
  assert.equal(family.taskCore,"MARK_GIVEN_VALUE");
  assert.equal(family.representationFamily,"integer_number_line");
  assert.equal(preflight.visualFamily.questionCount,20);
  assert.equal(preflight.visualFamily.priorityWave,"P1_SHARED_NUMBER_LINE_EXTENSION");
});

test("Rank03 distinguishes shared curriculum number-line semantics from direct historical MARK_GIVEN_VALUE authority",()=>{
  assert.equal(preflight.sourceAuthority.curriculumSource.page,3);
  assert.equal(preflight.sourceAuthority.curriculumSource.supportLevel,"SHARED_NUMBER_LINE_SEMANTICS_ONLY");
  assert.equal(preflight.sourceAuthority.curriculumSource.directMarkGivenValueEvidence,false);
  assert.equal(preflight.sourceAuthority.historicalExamVisualFamily.directTaskAuthority,true);
  assert.equal(preflight.sourceAuthority.historicalExamVisualFamily.sourceQuestionCount,20);
  assert.equal(preflight.sourceAuthority.historicalExamVisualFamily.sampleEvidence[0].prompt,"在數線上標出23。");
  assert.equal(preflight.sourceAuthority.authorityDecision,"PASS");
});

test("Rank03 reuses the canonical number-line KP minted by Rank02 instead of creating a duplicate",()=>{
  const current=kp.knowledgePoints.find((row)=>row.knowledgePointId===KP);
  assert.ok(current);
  assert.equal(rank02.status,"D0_COMPLETE");
  assert.equal(rank02.lifecycle.d0Closeout,"PASS");
  assert.equal(preflight.knowledgePointResolution.currentCanonicalKnowledgePointId,KP);
  assert.equal(preflight.knowledgePointResolution.reuseExistingCanonicalKnowledgePoint,true);
  assert.equal(preflight.knowledgePointResolution.newKnowledgePointRequired,false);
});

test("Rank03 resolves the existing mapping candidate to the current canonical KP",()=>{
  const candidate=mapping.mappings.find((row)=>row.visualFamilyId===FAMILY);
  assert.ok(candidate);
  assert.equal(candidate.formalMappingCandidateId,"fmc_g3a_u01_integer_number_line_mark_value");
  assert.equal(candidate.patternSpecCandidateId,"psc_g3a_u01_visual_number_line_mark_value");
  assert.equal(candidate.primaryKnowledgePointId,"kpc_g3a_u01_integer_number_line_scale_location");
  assert.equal(preflight.mappingReadback.resolvedPrimaryKnowledgePointId,KP);
  assert.equal(preflight.mappingReadback.operationContract,candidate.operationContract);
  assert.deepEqual(preflight.mappingReadback.validatorGuards,candidate.validatorGuards);
  assert.equal(preflight.mappingReadback.preflightDisposition,"READY_FOR_FORMAL_MAPPING_AND_PATTERNSPEC_CONTRACT");
});

test("Rank03 reuses Rank02 integer-number-line geometry but requires question/answer overlay semantics",()=>{
  assert.equal(preflight.rank02ReuseAssessment.sharedRendererPath,"site/modules/renderer/fraction-number-line.js");
  assert.equal(preflight.rank02ReuseAssessment.existingRank02ModelKind,"integer_number_line");
  assert.equal(preflight.rank02ReuseAssessment.rendererClassification,"EXTEND_EXISTING_INTEGER_NUMBER_LINE_RUNTIME");
  assert.equal(preflight.rank02ReuseAssessment.newRendererFamilyRequired,false);
  assert.ok(preflight.rank02ReuseAssessment.rank03RequiredExtension.some((value)=>value.includes("omit the answer marker")));
  assert.ok(preflight.rank02ReuseAssessment.rank03RequiredExtension.some((value)=>value.includes("answer representation")));
});

test("Rank03 preflight preserves the planning-to-implementation boundary and excludes Rank04+",()=>{
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("materialize Rank03 PatternSpec"));
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("modify number-line renderer code"));
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("implement Rank03 generator or validator"));
  assert.ok(preflight.antiScopeBoundary.forbidden.includes("implement Rank04 or Rank05"));
  assert.equal(
    preflight.nextStep,
    "G3A_U01_VisualRank03_FormalMappingAndPatternSpecContract_Then_MarkValueValidatorAndRendererExtensionContract"
  );
});
