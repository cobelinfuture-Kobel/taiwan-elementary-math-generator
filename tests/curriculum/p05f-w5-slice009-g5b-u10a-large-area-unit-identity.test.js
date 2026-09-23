import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f9-extension.js";
import {generateG5BU10AP05F9Questions,validateG5BU10AP05F9Question} from "../../site/modules/curriculum/batch-a/g5b-u10a-large-area-unit-identity-runtime-p05f9.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {
  G5B_U10A_P05F9_FORMAL_MAPPING,
  G5B_U10A_P05F9_FUTURE_KP_IDS,
  G5B_U10A_P05F9_GROUP_ID,
  G5B_U10A_P05F9_KP_ID,
  G5B_U10A_P05F9_REQUIRED_CAPABILITY_IDS,
  G5B_U10A_P05F9_SPEC_IDS,
  G5B_U10A_P05F9_SOURCE_ID,
  auditG5BU10AP05F9SelectorProjection,
} from "../../site/modules/curriculum/registry/g5b-u10a-large-area-unit-identity-selector-projection-p05f9.js";
import {BATCH_A_SELECTOR_AVAILABILITY,auditP05F9PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p05f9-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f9.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q009-g5b-u10a-large-area-unit-identity-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q009-g5b-u10a-large-area-unit-identity-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G5B_U10A_P05F9_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5B_U10A_P05F9_KP_ID],selectedPatternGroupIds:[G5B_U10A_P05F9_GROUP_ID],patternSpecIds:[...G5B_U10A_P05F9_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f9-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const FORBIDDEN=["平方公尺換算","公頃換算","平方公里換算","公噸","公斤","估測應用","面積公式","應用題"];
const occurrences=(text,token)=>text.split(token).length-1;

test("P05F W5 Q009 preserves exact frozen queue, Q008 D0 predecessor, and merged source authority",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,9);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q009_r0_g5b_u10_5b10a_profile_geometry_formula_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice009Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G5B_U10A_P05F9_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,[...G5B_U10A_P05F9_REQUIRED_CAPABILITY_IDS]);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"80e6463ef66abbcafdeec4f4931f3536403a92a9");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34000572190");
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement,"學生能選擇並辨認表示土地或地區面積的大單位。");
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant,"單位選擇須符合面積尺度，不能與長度單位混用。");
  assert.equal(preflight.runtimeCapabilityAuthority.profileCategoryMismatchAcknowledged,true);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.scopeGuard.q008SemanticsTouched,false);
  assert.equal(implementation.scopeGuard.p04f19MetricTonSemanticsTouched,false);
  assert.equal(implementation.scopeGuard.q010Touched,false);
});

test("P05F W5 Q009 materializes one FormalMapping, one group, and three source-backed PatternSpecs",()=>{
  const audit=auditG5BU10AP05F9SelectorProjection();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0});
  assert.equal(G5B_U10A_P05F9_FORMAL_MAPPING.mappingId,"fm_g5b_u10a_large_area_unit_identity_p05f9");
  assert.deepEqual(G5B_U10A_P05F9_FORMAL_MAPPING.answerDomain,["公畝","公頃","平方公里"]);
  assert.deepEqual(G5B_U10A_P05F9_FORMAL_MAPPING.includedRelations,["RECOGNIZE_ARE_HECTARE_SQUARE_KILOMETER_AS_AREA_UNITS","SELECT_LARGE_AREA_UNIT_BY_LAND_OR_REGION_SCALE","DISTINGUISH_LARGE_AREA_UNIT_FROM_LENGTH_UNIT"]);
  for(const relation of ["HECTARE_SQUARE_METER_CONVERSION","SQUARE_KILOMETER_HECTARE_CONVERSION","METRIC_TON_KILOGRAM_CONVERSION","LARGE_UNIT_ESTIMATION_APPLICATION","AREA_UNIT_CONVERSION_ARITHMETIC","AREA_FORMULA_CALCULATION","APPLICATION_CONTEXT"])assert.ok(G5B_U10A_P05F9_FORMAL_MAPPING.excludedRelations.includes(relation));
  assert.equal(G5B_U10A_P05F9_FORMAL_MAPPING.applicationImplementationAllowed,false);
  assert.equal(G5B_U10A_P05F9_FORMAL_MAPPING.frozenProfileCategoryMismatchAcknowledged,true);
});

test("P05F W5 Q009 promotes a second G5B-U10A public leaf without creating a new source and keeps three future siblings fail-closed",()=>{
  const audit=auditP05F9PublicSelectorComposition();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{sources:51,knowledgePoints:321,g5bU10aVisible:2,g5bU10aHidden:3,g5bU10aNotSelectable:3});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,51);
  const source=listBatchAKnowledgePointAvailabilityBySource(G5B_U10A_P05F9_SOURCE_ID);assert.equal(source.visibleKnowledgePointIds.includes(G5B_U10A_P05F9_KP_ID),true);assert.equal(source.visibleKnowledgePointIds.includes("kp_g5b_u10a_metric_ton_kilogram_conversion"),true);
  assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G5B_U10A_P05F9_FUTURE_KP_IDS]);assert.deepEqual(source.notSelectableKnowledgePointIds,[...G5B_U10A_P05F9_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G5B_U10A_P05F9_KP_ID,"diagram"),[...G5B_U10A_P05F9_SPEC_IDS]);for(const id of G5B_U10A_P05F9_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
});

test("P05F W5 Q009 generates balanced 24-question diagrams with fail-closed validation",()=>{
  const generated=generateG5BU10AP05F9Questions(options);assert.equal(generated.ok,true,generated.errors.join("\n"));assert.equal(generated.questions.length,24);assert.deepEqual(generated.allocation.map((row)=>row.count),[8,8,8]);assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);
  const relations=generated.questions.map((q)=>q.relation);for(const relation of G5B_U10A_P05F9_FORMAL_MAPPING.includedRelations)assert.equal(relations.filter((x)=>x===relation).length,8);
  for(const question of generated.questions){assert.equal(validateG5BU10AP05F9Question(question).ok,true);assert.equal(["公畝","公頃","平方公里"].includes(question.answerText),true);for(const term of FORBIDDEN)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false,`${question.id}:${term}`);assert.equal(question.metadata.hectareSquareMeterConversionUsed,false);assert.equal(question.metadata.squareKilometerHectareConversionUsed,false);assert.equal(question.metadata.metricTonKilogramConversionUsed,false);assert.equal(question.metadata.estimationApplicationUsed,false);assert.equal(question.metadata.areaUnitConversionArithmeticUsed,false);assert.equal(question.metadata.areaFormulaCalculationUsed,false);assert.equal(question.metadata.applicationContextUsed,false);}
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));answerTamper.answerText="公尺";assert.equal(validateG5BU10AP05F9Question(answerTamper).ok,false);
  const modeTamper=JSON.parse(JSON.stringify(generated.questions[1]));modeTamper.geometryDiagram.diagramMode="DISTINGUISH_AREA_LENGTH_UNIT";assert.equal(validateG5BU10AP05F9Question(modeTamper).ok,false);
});

test("P05F W5 Q009 proves 240 distinct variants for every PatternSpec",()=>{
  for(const patternSpecId of G5B_U10A_P05F9_SPEC_IDS){const result=generateG5BU10AP05F9Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);assert.equal(result.questions.length,240);assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);assert.deepEqual([...new Set(result.questions.map((row)=>row.answerText))].sort(),["公畝","公頃","平方公里"].sort());}
});

test("P05F W5 Q009 public binding exposes diagram-only max-240 while conversion/formula/application semantics remain unadmitted",()=>{
  const binding=resolvePublicUiCapabilityBinding(options);assert.equal(binding.blocked,false);assert.equal(binding.questionType,"diagram");assert.equal(binding.questionCount.max,240);assert.equal(binding.geometryDiagramRepresentationRequired,true);assert.equal(binding.geometryDomainValidatorRequired,true);assert.equal(binding.geometryFormulaEvaluationCapabilityRequired,true);assert.equal(binding.geometryPropertyReasoningRequired,true);assert.equal(binding.conversionArithmeticAdmission,false);assert.equal(binding.formulaArithmeticAdmission,false);assert.equal(binding.metricTonAdmission,false);assert.equal(binding.estimationApplicationAdmission,false);assert.equal(binding.applicationImplementationAllowed,false);assert.equal(binding.genericFallback,false);assert.equal(binding.freeFormAI,false);
});

test("P05F W5 Q009 worksheet and shared HTML renderer preserve large-area-unit diagrams",()=>{
  const result=buildBatchABrowserWorksheetDocument(options);assert.equal(result.ok,true,result.errors.join("\n"));const document=result.worksheetDocument;assert.equal(document.title,"生活中的大單位");assert.equal(document.questionCount,24);assert.equal(document.answerKeyItems.length,24);assert.equal(document.questionPages.length,3);assert.equal(document.answerKeyPages.length,3);assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="large_area_unit_scale_diagram"),true);
  const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:"",title:document.title});assert.equal(occurrences(html,'class="worksheet-large-area-unit-scale-diagram"'),48);assert.equal(occurrences(html,'data-diagram-mode="RECOGNIZE_AREA_UNIT"'),16);assert.equal(occurrences(html,'data-diagram-mode="SELECT_UNIT_BY_SCALE"'),16);assert.equal(occurrences(html,'data-diagram-mode="DISTINGUISH_AREA_LENGTH_UNIT"'),16);assert.equal(occurrences(html,'class="large-area-unit-diagram__unit-token"'),16);assert.equal(occurrences(html,'class="large-area-unit-diagram__badge-pair"'),16);
});

test("P05F W5 Q009 stable browser selector/binding/config wrappers cut over only for the selected Q009 leaf",async()=>{
  globalThis.document={getElementById:()=>null};try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f9=${Date.now()}`);const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f9=${Date.now()}`);const config=await import(`../../site/assets/browser/state/config-state.js?p05f9=${Date.now()}`);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,51);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,321);assert.equal(selector.getVisibleBatchAKnowledgePoint(G5B_U10A_P05F9_KP_ID)?.sourceId,G5B_U10A_P05F9_SOURCE_ID);assert.equal(bindingModule.resolvePublicUiCapabilityBinding(options).questionCount.max,240);
    const state=config.createConfigState({queryState:{sourceId:G5B_U10A_P05F9_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5B_U10A_P05F9_KP_ID]}});assert.equal(config.getBatchAWorksheetPlan(state).questionMode,"diagram");
    const sourceUnitState=config.createConfigState({queryState:{sourceId:G5B_U10A_P05F9_SOURCE_ID,selectionMode:"sourceUnit"}});assert.notEqual(config.getBatchAWorksheetPlan(sourceUnitState).questionMode,"diagram");
  }finally{delete globalThis.document;}
});

test("P05F W5 Q009 post-merge workflow is main-push Q-specific plus dispatch only",()=>{
  const workflow=readFileSync(path.join(ROOT,".github/workflows/p05f-w5-q009-live-pages-e2e.yml"),"utf8");assert.match(workflow,/\n  push:\n/);assert.match(workflow,/\n    branches:\n      - main\n/);assert.match(workflow,/\n  workflow_dispatch:\n/);assert.doesNotMatch(workflow,/\n  pull_request:/);assert.doesNotMatch(workflow,/\n  workflow_run:/);
  for(const uniquePath of ["g5b-u10a-large-area-unit-identity-selector-projection-p05f9.js","batch-a-selector-p05f9-extension.js","public-ui-capability-binding-p05f9.js","g5b-u10a-large-area-unit-identity-runtime-p05f9.js","batch-a-browser-generator-p05f9.js","batch-a-browser-worksheet-p05f9-extension.js","large-area-unit-scale-diagram.js"])assert.ok(workflow.includes(uniquePath),uniquePath);
  for(const broadPath of ["html-renderer.js","config-state.js","batch-a-selector-p04f33-extension.js","public-ui-capability-binding-p04f33.js","batch-a-browser-worksheet-r2e-entry.js"])assert.equal(workflow.includes(broadPath),false,broadPath);
});

test("P05F W5 Q009 pre-push static import smoke proves every changed JS/MJS relative import exists",()=>{
  const files=[
    "site/modules/curriculum/registry/g5b-u10a-large-area-unit-identity-selector-projection-p05f9.js",
    "site/modules/curriculum/registry/batch-a-selector-p05f9-extension.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p05f9.js",
    "site/modules/curriculum/batch-a/g5b-u10a-large-area-unit-identity-runtime-p05f9.js",
    "site/modules/curriculum/batch-a/batch-a-browser-generator-p05f9.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f9-extension.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    "site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",
    "site/assets/browser/state/config-state.js",
    "site/modules/renderer/large-area-unit-scale-diagram.js",
    "site/modules/renderer/html-renderer.js",
    "tools/curriculum/run-p05f-w5-slice009-classic-ui-acceptance.mjs",
    "tools/curriculum/run-p05f-w5-q009-live-pages-e2e.mjs",
  ];
  const importRe=/(?:import|export)\s+(?:[^"']*?\s+from\s+)?["'](\.[^"']+)["']/g;
  for(const file of files){const text=readFileSync(path.join(ROOT,file),"utf8");for(const match of text.matchAll(importRe)){const resolved=path.resolve(path.dirname(path.join(ROOT,file)),match[1]);assert.equal(existsSync(resolved),true,`${file} -> ${match[1]}`);}}
});
