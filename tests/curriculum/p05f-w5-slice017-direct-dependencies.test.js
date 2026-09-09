import test from "node:test";
import assert from "node:assert/strict";
import {buildBatchABrowserPlan as buildQ017Plan} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f17.js";
import {generateG5AU10AP05F7Questions,validateG5AU10AP05F7Question} from "../../site/modules/curriculum/batch-a/g5a-u10a-solid-shape-classification-runtime-p05f7.js";
import {generateG5AU07P05F16Questions,validateG5AU07P05F16Question} from "../../site/modules/curriculum/batch-a/g5a-u07-symmetry-axis-count-runtime-p05f16.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f17.js";
const SOURCE="g5a_u10_5a10a",Q007="kp_g5a_u10a_solid_shape_classification",Q017="kp_g5a_u10a_prism_pyramid_elements";

test("Q017 does not steal G5A-U10A sourceUnit ownership from Q007",()=>{
  const plan=buildQ017Plan({sourceId:SOURCE,selectionMode:"sourceUnit",questionCount:24,generationSeed:"q017-sourceunit-protection"});
  assert.equal(plan.selectionMode,"sourceUnit");
  assert.deepEqual(plan.selectedKnowledgePointIds,[Q007]);
  assert.equal(plan.selectedKnowledgePointIds.includes(Q017),false);
  assert.equal(plan.patternSpecIds.length,3);
  const binding=resolvePublicUiCapabilityBinding({sourceId:SOURCE,selectionMode:"sourceUnit",questionCount:24});
  assert.equal(binding.selectionMode,"sourceUnit");assert.equal(binding.patternSpecIds.length,3);assert.equal(binding.solidElementsNamingOrCountAdmission,false);
});

test("Q007 solid classification runtime remains valid and excludes element semantics",()=>{
  const result=generateG5AU10AP05F7Questions({questionCount:24,generationSeed:"q017-q007-protection"});
  assert.equal(result.ok,true,result.errors.join(","));assert.equal(result.questions.length,24);
  assert.ok(result.questions.every(q=>validateG5AU10AP05F7Question(q).ok&&q.knowledgePointId===Q007&&q.metadata.solidElementsNamingOrCountUsed===false));
});

test("Q016 symmetry-axis runtime remains valid after Q017 shared cutovers",()=>{
  const result=generateG5AU07P05F16Questions({questionCount:24,generationSeed:"q017-q016-protection"});
  assert.equal(result.ok,true,result.errors.join(","));assert.equal(result.questions.length,24);
  assert.ok(result.questions.every(q=>validateG5AU07P05F16Question(q).ok&&q.knowledgePointId==="kp_g5a_u07_symmetry_axis_count"));
});
