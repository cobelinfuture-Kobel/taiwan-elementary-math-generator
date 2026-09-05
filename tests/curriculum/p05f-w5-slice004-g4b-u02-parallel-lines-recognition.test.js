import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f4-extension.js";
import {generateG4BU02P05F4Questions,validateG4BU02P05F4Question} from "../../site/modules/curriculum/batch-a/g4b-u02-parallel-lines-recognition-runtime-p05f4.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {
  G4B_U02_P05F4_FORMAL_MAPPING,
  G4B_U02_P05F4_FUTURE_KP_IDS,
  G4B_U02_P05F4_GROUP_ID,
  G4B_U02_P05F4_KP_ID,
  G4B_U02_P05F4_REQUIRED_CAPABILITY_IDS,
  G4B_U02_P05F4_SPEC_IDS,
  G4B_U02_P05F4_SOURCE_ID,
  auditG4BU02P05F4SelectorProjection,
} from "../../site/modules/curriculum/registry/g4b-u02-parallel-lines-recognition-selector-projection-p05f4.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP05F4PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f4-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f4.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q004-g4b-u02-parallel-lines-recognition-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q004-g4b-u02-parallel-lines-recognition-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G4B_U02_P05F4_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4B_U02_P05F4_KP_ID],selectedPatternGroupIds:[G4B_U02_P05F4_GROUP_ID],patternSpecIds:[...G4B_U02_P05F4_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f4-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const FORBIDDEN_LEARNER_TERMS=["垂直","直角","量距離","作圖","四邊形","應用題"];
function occurrences(text,token){return text.split(token).length-1;}

test("P05F W5 Q004 preserves exact frozen queue, Q003 D0 predecessor, and source authority",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,4);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q004_r0_g4b_u02_4b02_profile_geometry_property_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice004Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G4B_U02_P05F4_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,[...G4B_U02_P05F4_REQUIRED_CAPABILITY_IDS]);
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement,"學生能辨認同平面內不相交且距離固定的直線。");
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant,"平行線延伸後仍不相交，方向保持一致。");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(implementation.previousSliceD0Evidence.exactPagesRunId,"33926418642");
  assert.equal(implementation.scopeGuard.q003SemanticsTouched,false);
});

test("P05F W5 Q004 materializes one FormalMapping, one group, and four source-backed diagram PatternSpecs",()=>{
  const audit=auditG4BU02P05F4SelectorProjection();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,diagram:4,application:0});
  assert.equal(G4B_U02_P05F4_FORMAL_MAPPING.mappingId,"fm_g4b_u02_parallel_lines_recognition_p05f4");
  assert.deepEqual(G4B_U02_P05F4_FORMAL_MAPPING.includedRelations,["IDENTIFY_PARALLEL_LINE_PAIR","RECOGNIZE_COPLANAR_NONINTERSECTING_LINES","RECOGNIZE_PARALLEL_LINES_REMAIN_NONINTERSECTING_WHEN_EXTENDED","RECOGNIZE_CONSISTENT_DIRECTION"]);
  for(const relation of ["PERPENDICULAR_LINE_RECOGNITION","PARALLEL_DISTANCE_MEASUREMENT","PARALLEL_LINE_CONSTRUCTION","QUADRILATERAL_CLASSIFICATION","QUADRILATERAL_INCLUSION_RELATION","APPLICATION_CONTEXT"])assert.ok(G4B_U02_P05F4_FORMAL_MAPPING.excludedRelations.includes(relation));
  assert.equal(G4B_U02_P05F4_FORMAL_MAPPING.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(G4B_U02_P05F4_FORMAL_MAPPING.applicationContextSupportedByDirectPdf,false);
  assert.equal(G4B_U02_P05F4_FORMAL_MAPPING.applicationImplementationAllowed,false);
});

test("P05F W5 Q004 promotes one G4B-U02 public leaf and keeps four same-source future KPs fail-closed",()=>{
  const audit=auditP05F4PublicSelectorComposition();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{sources:47,knowledgePoints:316,g4bU02Visible:1,g4bU02Hidden:4,g4bU02NotSelectable:4});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,47);
  const source=listBatchAKnowledgePointAvailabilityBySource(G4B_U02_P05F4_SOURCE_ID);
  assert.deepEqual(source.visibleKnowledgePointIds,[G4B_U02_P05F4_KP_ID]);
  assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G4B_U02_P05F4_FUTURE_KP_IDS]);
  assert.deepEqual(source.notSelectableKnowledgePointIds,[...G4B_U02_P05F4_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G4B_U02_P05F4_KP_ID,"diagram"),[...G4B_U02_P05F4_SPEC_IDS]);
  for(const id of G4B_U02_P05F4_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
  const units=listBatchASourceUnits({includeW5Slice001:true,includeW5Slice002:true,includeW5Slice003:true,includeW5Slice004:true,includeCurrentFullProductPublic:true});
  const unit=units.find((row)=>row.sourceId===G4B_U02_P05F4_SOURCE_ID);
  assert.deepEqual(unit,{sourceId:G4B_U02_P05F4_SOURCE_ID,grade:4,semester:"lower",unitCode:"4B-U02",title:"垂直平行與四邊形",domain:"geometry_property",lifecycle:"public_full_product_w5_slice004_candidate"});
});

test("P05F W5 Q004 generates balanced 24-question parallel-line diagrams with fail-closed validation",()=>{
  const generated=generateG4BU02P05F4Questions(options);
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,24);
  assert.deepEqual(generated.allocation.map((row)=>row.count),[6,6,6,6]);
  assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);
  assert.deepEqual(new Set(generated.questions.map((row)=>row.answerText)),new Set(["平行線","不會相交","方向一致"]));
  for(const question of generated.questions){
    assert.equal(validateG4BU02P05F4Question(question).ok,true);
    for(const term of FORBIDDEN_LEARNER_TERMS)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false,`${question.id}:${term}`);
    assert.equal(question.metadata.applicationContextUsed,false);
    assert.equal(question.metadata.perpendicularRecognitionUsed,false);
    assert.equal(question.metadata.parallelDistanceMeasurementUsed,false);
    assert.equal(question.metadata.parallelLineConstructionUsed,false);
    assert.equal(question.metadata.quadrilateralClassificationUsed,false);
    assert.equal(question.metadata.quadrilateralInclusionUsed,false);
  }
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));answerTamper.answerText="垂直線";assert.equal(validateG4BU02P05F4Question(answerTamper).ok,false);
  const diagramTamper=JSON.parse(JSON.stringify(generated.questions[1]));diagramTamper.geometryDiagram.gapPx=99;assert.equal(validateG4BU02P05F4Question(diagramTamper).ok,false);
});

test("P05F W5 Q004 proves 240 distinct diagram variants for every PatternSpec",()=>{
  for(const patternSpecId of G4B_U02_P05F4_SPEC_IDS){
    const result=generateG4BU02P05F4Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});
    assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);
    assert.equal(result.questions.length,240);
    assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);
    assert.equal(result.questions.every((row)=>row.patternSpecId===patternSpecId),true);
  }
});

test("P05F W5 Q004 public binding exposes diagram-only max-240 while excluded geometry semantics remain unadmitted",()=>{
  const binding=resolvePublicUiCapabilityBinding(options);
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.deepEqual(binding.availableQuestionTypeOptions.map((row)=>row.value),["diagram"]);
  assert.equal(binding.questionCount.max,240);
  assert.deepEqual(binding.compatiblePatternGroupIds,[G4B_U02_P05F4_GROUP_ID]);
  assert.deepEqual(binding.patternSpecIds,[...G4B_U02_P05F4_SPEC_IDS]);
  assert.equal(binding.geometryDiagramRepresentation,true);
  assert.equal(binding.geometryFormulaEvaluationRequired,false);
  assert.equal(binding.geometryPropertyReasoningRequired,true);
  assert.equal(binding.applicationImplementationAllowed,false);
  assert.equal(binding.perpendicularRecognitionAdmission,false);
  assert.equal(binding.parallelDistanceMeasurementAdmission,false);
  assert.equal(binding.parallelLineConstructionAdmission,false);
  assert.equal(binding.quadrilateralClassificationAdmission,false);
  assert.equal(binding.quadrilateralInclusionAdmission,false);
  assert.equal(binding.genericFallback,false);
  assert.equal(binding.freeFormAI,false);
});

test("P05F W5 Q004 worksheet and shared HTML renderer preserve parallel-line diagrams across questions and answers",()=>{
  const result=buildBatchABrowserWorksheetDocument(options);assert.equal(result.ok,true,result.errors.join("\n"));
  const document=result.worksheetDocument;
  assert.equal(document.title,"垂直平行與四邊形");assert.equal(document.questionCount,24);assert.equal(document.answerKeyItems.length,24);assert.equal(document.questionPages.length,3);assert.equal(document.answerKeyPages.length,3);
  assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="parallel_lines_recognition_diagram"),true);assert.equal(document.answerKeyItems.every((row)=>row.geometryDiagram?.kind==="parallel_lines_recognition_diagram"),true);
  const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:"",title:document.title});
  assert.equal(occurrences(html,'class="worksheet-parallel-lines-recognition-diagram"'),48);
  assert.equal(occurrences(html,'class="parallel-lines-recognition-diagram__line"'),96);
  assert.equal(occurrences(html,'class="parallel-lines-recognition-diagram__extension"'),48);
  assert.equal(occurrences(html,'class="parallel-lines-recognition-diagram__direction-arrow"'),24);
  assert.equal(occurrences(html,'data-diagram-mode="PLAIN_PAIR"'),12);
  assert.equal(occurrences(html,'data-diagram-mode="NONINTERSECTING_PAIR"'),12);
  assert.equal(occurrences(html,'data-diagram-mode="EXTENSION_GUIDES"'),12);
  assert.equal(occurrences(html,'data-diagram-mode="DIRECTION_ARROWS"'),12);
});

test("P05F W5 Q004 stable browser selector and binding wrappers cut over while Node historical snapshots remain isolated",async()=>{
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f4=${Date.now()}`);
    const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f4=${Date.now()}`);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,47);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,316);assert.equal(selector.getVisibleBatchAKnowledgePoint(G4B_U02_P05F4_KP_ID)?.sourceId,G4B_U02_P05F4_SOURCE_ID);
    const binding=bindingModule.resolvePublicUiCapabilityBinding(options);assert.equal(binding.questionType,"diagram");assert.equal(binding.questionCount.max,240);assert.ok(listBatchASourceUnits().some((row)=>row.sourceId===G4B_U02_P05F4_SOURCE_ID));
  }finally{delete globalThis.document;}
});

test("P05F W5 Q004 post-merge workflow is main-push Q-specific plus dispatch only",()=>{
  const workflow=readFileSync(path.join(ROOT,".github/workflows/p05f-w5-q004-live-pages-e2e.yml"),"utf8");
  assert.match(workflow,/\n  push:\n/);assert.match(workflow,/\n    branches:\n      - main\n/);assert.match(workflow,/\n  workflow_dispatch:\n/);assert.doesNotMatch(workflow,/\n  pull_request:/);assert.doesNotMatch(workflow,/\n  workflow_run:/);
  for(const uniquePath of ["g4b-u02-parallel-lines-recognition-selector-projection-p05f4.js","batch-a-selector-p05f4-extension.js","public-ui-capability-binding-p05f4.js","g4b-u02-parallel-lines-recognition-runtime-p05f4.js","batch-a-browser-generator-p05f4.js","batch-a-browser-worksheet-p05f4-extension.js","parallel-lines-recognition-diagram.js"])assert.ok(workflow.includes(uniquePath),uniquePath);
  for(const broadPath of ["html-renderer.js","source-units.js","config-state.js","batch-a-selector-p04f33-extension.js","public-ui-capability-binding-p04f33.js","batch-a-browser-worksheet-r2e-entry.js"])assert.equal(workflow.includes(broadPath),false,broadPath);
});

test("P05F W5 Q004 pre-push static import smoke proves every changed JS/MJS relative import exists",()=>{
  const files=[
    "site/modules/curriculum/registry/g4b-u02-parallel-lines-recognition-selector-projection-p05f4.js","site/modules/curriculum/registry/batch-a-selector-p05f4-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p05f4.js","site/modules/curriculum/batch-a/g4b-u02-parallel-lines-recognition-runtime-p05f4.js","site/modules/curriculum/batch-a/batch-a-browser-generator-p05f4.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f4-extension.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js","site/modules/curriculum/batch-a/source-units.js","site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","site/assets/browser/state/config-state.js","site/modules/renderer/parallel-lines-recognition-diagram.js","site/modules/renderer/html-renderer.js","tools/curriculum/run-p05f-w5-slice004-classic-ui-acceptance.mjs","tools/curriculum/run-p05f-w5-q004-live-pages-e2e.mjs"
  ];
  const missing=[];const importPattern=/(?:import|export)\s+(?:[^'\"]*?\sfrom\s*)?["']([^"']+)["']/g;
  for(const relativeFile of files){const absolute=path.join(ROOT,relativeFile);assert.equal(existsSync(absolute),true,relativeFile);const text=readFileSync(absolute,"utf8");for(const match of text.matchAll(importPattern)){const specifier=match[1];if(!specifier.startsWith("."))continue;const resolved=path.resolve(path.dirname(absolute),specifier);if(!existsSync(resolved))missing.push(`${relativeFile} -> ${specifier}`);}}
  assert.deepEqual(missing,[]);
});
