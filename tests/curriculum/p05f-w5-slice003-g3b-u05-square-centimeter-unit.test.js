import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f3-extension.js";
import {generateG3BU05P05F3Questions,validateG3BU05P05F3Question} from "../../site/modules/curriculum/batch-a/g3b-u05-square-centimeter-unit-runtime-p05f3.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {
  G3B_U05_P05F3_FORMAL_MAPPING,
  G3B_U05_P05F3_FUTURE_KP_IDS,
  G3B_U05_P05F3_GROUP_ID,
  G3B_U05_P05F3_KP_ID,
  G3B_U05_P05F3_REQUIRED_CAPABILITY_IDS,
  G3B_U05_P05F3_SPEC_IDS,
  G3B_U05_P05F3_SOURCE_ID,
  auditG3BU05P05F3SelectorProjection,
} from "../../site/modules/curriculum/registry/g3b-u05-square-centimeter-unit-selector-projection-p05f3.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP05F3PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f3-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f3.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q003-g3b-u05-square-centimeter-area-unit-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q003-g3b-u05-square-centimeter-area-unit-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G3B_U05_P05F3_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3B_U05_P05F3_KP_ID],selectedPatternGroupIds:[G3B_U05_P05F3_GROUP_ID],patternSpecIds:[...G3B_U05_P05F3_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f3-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const FORBIDDEN_LEARNER_TERMS=["長×寬","周長公式","數格子","剪拼","不規則圖形"];
function occurrences(text,token){return text.split(token).length-1;}

test("P05F W5 Q003 preserves exact frozen queue, Q002 D0 predecessor, and source authority",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,3);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q003_r0_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice003Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G3B_U05_P05F3_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,[...G3B_U05_P05F3_REQUIRED_CAPABILITY_IDS]);
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement,"學生能理解邊長1公分正方形的面積是1平方公分。");
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant,"面積單位由二維覆蓋單位形成，不等同於周長單位。");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(implementation.previousSliceD0Evidence.exactPagesRunId,"33884662896");
  assert.equal(implementation.scopeGuard.q001SemanticsTouched,false);
  assert.equal(implementation.scopeGuard.q002SemanticsTouched,false);
});

test("P05F W5 Q003 materializes one FormalMapping, one group, and four source-backed diagram PatternSpecs",()=>{
  const audit=auditG3BU05P05F3SelectorProjection();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,diagram:4,application:0});
  assert.equal(G3B_U05_P05F3_FORMAL_MAPPING.mappingId,"fm_g3b_u05_square_centimeter_area_unit_p05f3");
  assert.deepEqual(G3B_U05_P05F3_FORMAL_MAPPING.includedRelations,["IDENTIFY_ONE_SQUARE_CENTIMETER","MATCH_ONE_CM_BY_ONE_CM_SQUARE_TO_ONE_CM2","DISTINGUISH_AREA_UNIT_FROM_LENGTH_OR_PERIMETER_UNIT","RECOGNIZE_CM2_AS_AREA_UNIT"]);
  for(const relation of ["COUNT_AREA_GRID_SQUARES","COMPUTE_IRREGULAR_GRID_AREA","CUT_REARRANGE_AREA_CONSERVATION","COMPARE_AREA_UNDER_SAME_PERIMETER","RECTANGLE_AREA_FORMULA","SQUARE_AREA_FORMULA","PERIMETER_COMPUTATION","APPLICATION_CONTEXT"])assert.ok(G3B_U05_P05F3_FORMAL_MAPPING.excludedRelations.includes(relation));
  assert.equal(G3B_U05_P05F3_FORMAL_MAPPING.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(G3B_U05_P05F3_FORMAL_MAPPING.applicationContextSupportedByDirectPdf,false);
  assert.equal(G3B_U05_P05F3_FORMAL_MAPPING.applicationImplementationAllowed,false);
});

test("P05F W5 Q003 promotes one G3B-U05 public leaf and keeps four same-source future KPs fail-closed",()=>{
  const audit=auditP05F3PublicSelectorComposition();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{sources:46,knowledgePoints:315,g3bU05Visible:1,g3bU05Hidden:4,g3bU05NotSelectable:4});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,46);
  const source=listBatchAKnowledgePointAvailabilityBySource(G3B_U05_P05F3_SOURCE_ID);
  assert.deepEqual(source.visibleKnowledgePointIds,[G3B_U05_P05F3_KP_ID]);
  assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G3B_U05_P05F3_FUTURE_KP_IDS]);
  assert.deepEqual(source.notSelectableKnowledgePointIds,[...G3B_U05_P05F3_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G3B_U05_P05F3_KP_ID,"diagram"),[...G3B_U05_P05F3_SPEC_IDS]);
  for(const id of G3B_U05_P05F3_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
  const units=listBatchASourceUnits({includeW5Slice001:true,includeW5Slice002:true,includeW5Slice003:true,includeCurrentFullProductPublic:true});
  const unit=units.find((row)=>row.sourceId===G3B_U05_P05F3_SOURCE_ID);
  assert.deepEqual(unit,{sourceId:G3B_U05_P05F3_SOURCE_ID,grade:3,semester:"lower",unitCode:"3B-U05",title:"面積與平方公分",domain:"geometry_formula",lifecycle:"public_full_product_w5_slice003_candidate"});
});

test("P05F W5 Q003 generates balanced 24-question diagrams with fail-closed validation",()=>{
  const generated=generateG3BU05P05F3Questions(options);
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,24);
  assert.deepEqual(generated.allocation.map((row)=>row.count),[6,6,6,6]);
  assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);
  assert.deepEqual(new Set(generated.questions.map((row)=>row.answerText)),new Set(["1 平方公分","面積單位","平方公分"]));
  for(const question of generated.questions){
    assert.equal(validateG3BU05P05F3Question(question).ok,true);
    for(const term of FORBIDDEN_LEARNER_TERMS)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false,`${question.id}:${term}`);
    assert.equal(question.metadata.applicationContextUsed,false);
    assert.equal(question.metadata.gridCountingUsed,false);
    assert.equal(question.metadata.rectangleSquareFormulaUsed,false);
    assert.equal(question.metadata.perimeterComputationUsed,false);
  }
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));answerTamper.answerText="1 公分";assert.equal(validateG3BU05P05F3Question(answerTamper).ok,false);
  const diagramTamper=JSON.parse(JSON.stringify(generated.questions[1]));diagramTamper.geometryDiagram.sideLengthCm=2;assert.equal(validateG3BU05P05F3Question(diagramTamper).ok,false);
});

test("P05F W5 Q003 proves 240 distinct diagram variants for every PatternSpec",()=>{
  for(const patternSpecId of G3B_U05_P05F3_SPEC_IDS){
    const result=generateG3BU05P05F3Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});
    assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);
    assert.equal(result.questions.length,240);
    assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);
    assert.equal(result.questions.every((row)=>row.patternSpecId===patternSpecId),true);
  }
});

test("P05F W5 Q003 public binding exposes diagram-only max-240 while later area semantics remain unadmitted",()=>{
  const binding=resolvePublicUiCapabilityBinding(options);
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.deepEqual(binding.availableQuestionTypeOptions.map((row)=>row.value),["diagram"]);
  assert.equal(binding.questionCount.max,240);
  assert.deepEqual(binding.compatiblePatternGroupIds,[G3B_U05_P05F3_GROUP_ID]);
  assert.deepEqual(binding.patternSpecIds,[...G3B_U05_P05F3_SPEC_IDS]);
  assert.equal(binding.geometryDiagramRepresentation,true);
  assert.equal(binding.geometryFormulaEvaluationRequired,true);
  assert.equal(binding.geometryPropertyReasoningRequired,true);
  assert.equal(binding.applicationContextSupportedByDirectPdf,false);
  assert.equal(binding.applicationImplementationAllowed,false);
  assert.equal(binding.gridCountingAdmission,false);
  assert.equal(binding.areaFormulaAdmission,false);
  assert.equal(binding.perimeterComputationAdmission,false);
  assert.equal(binding.genericFallback,false);
  assert.equal(binding.freeFormAI,false);
});

test("P05F W5 Q003 worksheet and shared HTML renderer preserve unit-square diagrams across questions and answers",()=>{
  const result=buildBatchABrowserWorksheetDocument(options);assert.equal(result.ok,true,result.errors.join("\n"));
  const document=result.worksheetDocument;
  assert.equal(document.title,"面積與平方公分");assert.equal(document.questionCount,24);assert.equal(document.answerKeyItems.length,24);assert.equal(document.questionPages.length,3);assert.equal(document.answerKeyPages.length,3);
  assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="square_centimeter_unit_diagram"),true);assert.equal(document.answerKeyItems.every((row)=>row.geometryDiagram?.kind==="square_centimeter_unit_diagram"),true);
  const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:"",title:document.title});
  assert.equal(occurrences(html,'class="worksheet-square-centimeter-unit-diagram"'),48);
  assert.equal(occurrences(html,"square-centimeter-unit-diagram__square"),48);
  assert.equal(occurrences(html,"square-centimeter-unit-diagram__shade"),12);
  assert.equal(occurrences(html,"square-centimeter-unit-diagram__area-badge"),12);
  assert.equal(occurrences(html,"square-centimeter-unit-diagram__cm2-symbol"),12);
  assert.equal(occurrences(html,"square-centimeter-unit-diagram__side-label"),72);
  for(const term of FORBIDDEN_LEARNER_TERMS)assert.equal(html.includes(term),false,term);
});

test("P05F W5 Q003 stable browser selector and binding wrappers cut over while Node historical snapshots remain isolated",async()=>{
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f3=${Date.now()}`);
    const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f3=${Date.now()}`);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,46);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,315);assert.equal(selector.getVisibleBatchAKnowledgePoint(G3B_U05_P05F3_KP_ID)?.sourceId,G3B_U05_P05F3_SOURCE_ID);
    const binding=bindingModule.resolvePublicUiCapabilityBinding(options);assert.equal(binding.questionType,"diagram");assert.equal(binding.questionCount.max,240);assert.ok(listBatchASourceUnits().some((row)=>row.sourceId===G3B_U05_P05F3_SOURCE_ID));
  }finally{delete globalThis.document;}
});

test("P05F W5 Q003 post-merge workflow is main-push Q-specific plus dispatch only",()=>{
  const workflow=readFileSync(path.join(ROOT,".github/workflows/p05f-w5-q003-live-pages-e2e.yml"),"utf8");
  assert.match(workflow,/\n  push:\n/);assert.match(workflow,/\n    branches:\n      - main\n/);assert.match(workflow,/\n  workflow_dispatch:\n/);assert.doesNotMatch(workflow,/\n  pull_request:/);assert.doesNotMatch(workflow,/\n  workflow_run:/);
  for(const uniquePath of ["g3b-u05-square-centimeter-unit-selector-projection-p05f3.js","batch-a-selector-p05f3-extension.js","public-ui-capability-binding-p05f3.js","g3b-u05-square-centimeter-unit-runtime-p05f3.js","batch-a-browser-generator-p05f3.js","batch-a-browser-worksheet-p05f3-extension.js","square-centimeter-unit-diagram.js"])assert.ok(workflow.includes(uniquePath),uniquePath);
  for(const broadPath of ["html-renderer.js","source-units.js","config-state.js","batch-a-selector-p04f33-extension.js","public-ui-capability-binding-p04f33.js","batch-a-browser-worksheet-r2e-entry.js"])assert.equal(workflow.includes(`      - '${broadPath}'`),false,broadPath);
});

test("P05F W5 Q003 pre-push static import smoke proves every changed JS/MJS relative import exists",()=>{
  const files=[
    "site/modules/curriculum/registry/g3b-u05-square-centimeter-unit-selector-projection-p05f3.js","site/modules/curriculum/registry/batch-a-selector-p05f3-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p05f3.js","site/modules/curriculum/batch-a/g3b-u05-square-centimeter-unit-runtime-p05f3.js","site/modules/curriculum/batch-a/batch-a-browser-generator-p05f3.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f3-extension.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js","site/modules/curriculum/batch-a/source-units.js","site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","site/assets/browser/state/config-state.js","site/modules/renderer/square-centimeter-unit-diagram.js","site/modules/renderer/html-renderer.js","tools/curriculum/run-p05f-w5-slice003-classic-ui-acceptance.mjs","tools/curriculum/run-p05f-w5-q003-live-pages-e2e.mjs"
  ];
  const missing=[];const importPattern=/(?:import|export)\s+(?:[^'\"]*?\sfrom\s*)?["']([^"']+)["']/g;
  for(const relativeFile of files){const absolute=path.join(ROOT,relativeFile);assert.equal(existsSync(absolute),true,relativeFile);const text=readFileSync(absolute,"utf8");for(const match of text.matchAll(importPattern)){const specifier=match[1];if(!specifier.startsWith("."))continue;const resolved=path.resolve(path.dirname(absolute),specifier);if(!existsSync(resolved))missing.push(`${relativeFile} -> ${specifier}`);}}
  assert.deepEqual(missing,[]);
});
