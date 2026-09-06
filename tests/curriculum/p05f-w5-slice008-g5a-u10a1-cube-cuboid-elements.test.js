import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f8-extension.js";
import {generateG5AU10A1P05F8Questions,validateG5AU10A1P05F8Question} from "../../site/modules/curriculum/batch-a/g5a-u10a1-cube-cuboid-elements-runtime-p05f8.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {G5A_U10A1_P05F8_FORMAL_MAPPING,G5A_U10A1_P05F8_FUTURE_KP_IDS,G5A_U10A1_P05F8_GROUP_ID,G5A_U10A1_P05F8_KP_ID,G5A_U10A1_P05F8_REQUIRED_CAPABILITY_IDS,G5A_U10A1_P05F8_SPEC_IDS,G5A_U10A1_P05F8_SOURCE_ID,auditG5AU10A1P05F8SelectorProjection} from "../../site/modules/curriculum/registry/g5a-u10a1-cube-cuboid-elements-selector-projection-p05f8.js";
import {BATCH_A_SELECTOR_AVAILABILITY,auditP05F8PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p05f8-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f8.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q008-g5a-u10a1-cube-cuboid-faces-edges-vertices-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q008-g5a-u10a1-cube-cuboid-faces-edges-vertices-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G5A_U10A1_P05F8_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5A_U10A1_P05F8_KP_ID],selectedPatternGroupIds:[G5A_U10A1_P05F8_GROUP_ID],patternSpecIds:[...G5A_U10A1_P05F8_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f8-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const FORBIDDEN=["相對面","相鄰面","垂直關係","展開圖","稜長關係","長寬高","缺面","塗色","切割","體積","表面積","公式","應用題"];
const EXPECTED_ANSWERS=["面","稜","頂點","6個面","12條稜","8個頂點","正方體","長方體"].sort();
const occurrences=(text,token)=>text.split(token).length-1;


test("P05F W5 Q008 preserves exact frozen queue, Q007 D0 predecessor, and source authority",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,8);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q008_r0_g5a_u10_5a10a1_profile_spatial_solid_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice008Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G5A_U10A1_P05F8_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,[...G5A_U10A1_P05F8_REQUIRED_CAPABILITY_IDS]);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"0b978af92e463785b6cce6ddc614e260b9ccde18");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"33953512923");
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement,"學生能辨認正方體、長方體的面、稜與頂點。");
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant,"兩者均有6面、12稜、8頂點，面與稜的形狀長度條件不同。");
  assert.equal(preflight.sourceAuthority.sourceIdentityAnomaly.disposition,"NON_BLOCKING_EMBEDDED_URL_ALIAS_MATCHING_TITLE_FILE_AND_R02_SOURCE_IDENTITY");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.scopeGuard.q007SemanticsTouched,false);
  assert.equal(implementation.scopeGuard.q009Touched,false);
  assert.equal(implementation.scopeGuard.frozenQueueAuthorityTouched,false);
});

test("P05F W5 Q008 materializes one FormalMapping, one group, and three source-backed cube/cuboid PatternSpecs",()=>{
  const audit=auditG5AU10A1P05F8SelectorProjection();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0});
  assert.equal(G5A_U10A1_P05F8_FORMAL_MAPPING.mappingId,"fm_g5a_u10a1_cube_cuboid_faces_edges_vertices_p05f8");
  assert.deepEqual(G5A_U10A1_P05F8_FORMAL_MAPPING.includedRelations,["IDENTIFY_CUBE_CUBOID_FACES_EDGES_VERTICES","RECOGNIZE_CUBE_CUBOID_FIXED_ELEMENT_COUNTS","DISTINGUISH_CUBE_CUBOID_ELEMENT_STRUCTURE"]);
  for(const relation of ["CUBE_CUBOID_FACE_RELATIONSHIP","CUBE_CUBOID_NET","CUBE_CUBOID_EDGE_LENGTH_RELATION","CUBE_CUBOID_SPATIAL_REASONING","SOLID_MEASUREMENT_OR_FORMULA","APPLICATION_CONTEXT"])assert.ok(G5A_U10A1_P05F8_FORMAL_MAPPING.excludedRelations.includes(relation));
  assert.equal(G5A_U10A1_P05F8_FORMAL_MAPPING.applicationImplementationAllowed,false);
  assert.deepEqual(G5A_U10A1_P05F8_FORMAL_MAPPING.answerDomain,["面","稜","頂點","6個面","12條稜","8個頂點","正方體","長方體"]);
});

test("P05F W5 Q008 promotes one G5A-U10a1 public leaf and keeps four same-source future KPs fail-closed",()=>{
  const audit=auditP05F8PublicSelectorComposition();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{sources:51,knowledgePoints:320,g5aU10a1Visible:1,g5aU10a1Hidden:4,g5aU10a1NotSelectable:4});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,51);
  const source=listBatchAKnowledgePointAvailabilityBySource(G5A_U10A1_P05F8_SOURCE_ID);assert.deepEqual(source.visibleKnowledgePointIds,[G5A_U10A1_P05F8_KP_ID]);assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G5A_U10A1_P05F8_FUTURE_KP_IDS]);assert.deepEqual(source.notSelectableKnowledgePointIds,[...G5A_U10A1_P05F8_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G5A_U10A1_P05F8_KP_ID,"diagram"),[...G5A_U10A1_P05F8_SPEC_IDS]);for(const id of G5A_U10A1_P05F8_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
  const unit=listBatchASourceUnits({includeW5Slice008:true,includeCurrentFullProductPublic:true}).find((row)=>row.sourceId===G5A_U10A1_P05F8_SOURCE_ID);assert.deepEqual(unit,{sourceId:G5A_U10A1_P05F8_SOURCE_ID,grade:5,semester:"upper",unitCode:"5A-U10A1",title:"正方體和長方體",domain:"spatial_solid",lifecycle:"public_full_product_w5_slice008_candidate"});
});

test("P05F W5 Q008 generates balanced 24-question cube/cuboid diagrams with fail-closed validation",()=>{
  const generated=generateG5AU10A1P05F8Questions(options);assert.equal(generated.ok,true,generated.errors.join("\n"));assert.equal(generated.questions.length,24);assert.deepEqual(generated.allocation.map((row)=>row.count),[8,8,8]);assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);assert.deepEqual([...new Set(generated.questions.map((row)=>row.answerText))].sort(),EXPECTED_ANSWERS);
  const solids=generated.questions.map((q)=>q.geometryDiagram.solidType);assert.deepEqual({CUBE:solids.filter(x=>x==="CUBE").length,CUBOID:solids.filter(x=>x==="CUBOID").length},{CUBE:12,CUBOID:12});
  for(const question of generated.questions){assert.equal(validateG5AU10A1P05F8Question(question).ok,true);assert.equal(question.geometryDiagram.faceCount,6);assert.equal(question.geometryDiagram.edgeCount,12);assert.equal(question.geometryDiagram.vertexCount,8);for(const term of FORBIDDEN)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false,`${question.id}:${term}`);assert.equal(question.metadata.faceRelationshipUsed,false);assert.equal(question.metadata.netUsed,false);assert.equal(question.metadata.edgeLengthRelationUsed,false);assert.equal(question.metadata.broaderSpatialReasoningUsed,false);assert.equal(question.metadata.solidMeasurementOrFormulaUsed,false);assert.equal(question.metadata.applicationContextUsed,false);}
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));answerTamper.answerText="長方體";assert.equal(validateG5AU10A1P05F8Question(answerTamper).ok,false);
  const countTamper=JSON.parse(JSON.stringify(generated.questions[1]));countTamper.geometryDiagram.edgeCount=11;assert.equal(validateG5AU10A1P05F8Question(countTamper).ok,false);
});

test("P05F W5 Q008 proves 240 distinct diagram variants for every PatternSpec",()=>{
  const expectedBySpec=new Map([[G5A_U10A1_P05F8_SPEC_IDS[0],new Set(["面","稜","頂點"])],[G5A_U10A1_P05F8_SPEC_IDS[1],new Set(["6個面","12條稜","8個頂點"])],[G5A_U10A1_P05F8_SPEC_IDS[2],new Set(["正方體","長方體"])]]);
  for(const patternSpecId of G5A_U10A1_P05F8_SPEC_IDS){const result=generateG5AU10A1P05F8Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);assert.equal(result.questions.length,240);assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);assert.deepEqual(new Set(result.questions.map((row)=>row.answerText)),expectedBySpec.get(patternSpecId));}
});

test("P05F W5 Q008 public binding exposes diagram-only max-240 and excluded semantics remain unadmitted",()=>{const binding=resolvePublicUiCapabilityBinding(options);assert.equal(binding.blocked,false);assert.equal(binding.questionType,"diagram");assert.equal(binding.questionCount.max,240);assert.equal(binding.solidGeometryRepresentation,true);assert.equal(binding.spatialSolidReasoningRequired,true);assert.equal(binding.geometryPropertyReasoningRequired,true);assert.equal(binding.faceRelationshipAdmission,false);assert.equal(binding.netAdmission,false);assert.equal(binding.edgeLengthRelationAdmission,false);assert.equal(binding.broaderSpatialReasoningAdmission,false);assert.equal(binding.solidMeasurementOrFormulaAdmission,false);assert.equal(binding.applicationImplementationAllowed,false);assert.equal(binding.genericFallback,false);assert.equal(binding.freeFormAI,false);});

test("P05F W5 Q008 worksheet and shared HTML renderer preserve cube/cuboid element diagrams",()=>{const result=buildBatchABrowserWorksheetDocument(options);assert.equal(result.ok,true,result.errors.join("\n"));const document=result.worksheetDocument;assert.equal(document.title,"正方體和長方體");assert.equal(document.questionCount,24);assert.equal(document.answerKeyItems.length,24);assert.equal(document.questionPages.length,3);assert.equal(document.answerKeyPages.length,3);assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="cube_cuboid_elements_diagram"),true);const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:"",title:document.title});assert.equal(occurrences(html,'class="worksheet-cube-cuboid-elements-diagram"'),48);assert.equal(occurrences(html,'<g class="cube-cuboid-elements-diagram__shape '),48);assert.equal(occurrences(html,'data-solid-type="CUBE"'),24);assert.equal(occurrences(html,'data-solid-type="CUBOID"'),24);assert.equal(occurrences(html,'data-diagram-mode="IDENTIFY_ELEMENT"'),16);assert.equal(occurrences(html,'data-diagram-mode="FIXED_ELEMENT_COUNTS"'),16);assert.equal(occurrences(html,'data-diagram-mode="DISTINGUISH_CUBE_CUBOID"'),16);assert.equal(occurrences(html,'class="cube-cuboid-elements-diagram__highlight '),16);});

test("P05F W5 Q008 stable browser selector and binding wrappers cut over while Node historical snapshots remain isolated",async()=>{globalThis.document={};try{const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f8=${Date.now()}`);const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f8=${Date.now()}`);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,51);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,320);assert.equal(selector.getVisibleBatchAKnowledgePoint(G5A_U10A1_P05F8_KP_ID)?.sourceId,G5A_U10A1_P05F8_SOURCE_ID);const binding=bindingModule.resolvePublicUiCapabilityBinding(options);assert.equal(binding.questionCount.max,240);assert.ok(listBatchASourceUnits().some((row)=>row.sourceId===G5A_U10A1_P05F8_SOURCE_ID));}finally{delete globalThis.document;}});

test("P05F W5 Q008 post-merge workflow is main-push Q-specific plus dispatch only",()=>{const workflow=readFileSync(path.join(ROOT,".github/workflows/p05f-w5-q008-live-pages-e2e.yml"),"utf8");assert.match(workflow,/\n  push:\n/);assert.match(workflow,/\n    branches:\n      - main\n/);assert.match(workflow,/\n  workflow_dispatch:\n/);assert.doesNotMatch(workflow,/\n  pull_request:/);assert.doesNotMatch(workflow,/\n  workflow_run:/);for(const uniquePath of ["g5a-u10a1-cube-cuboid-elements-selector-projection-p05f8.js","batch-a-selector-p05f8-extension.js","public-ui-capability-binding-p05f8.js","g5a-u10a1-cube-cuboid-elements-runtime-p05f8.js","batch-a-browser-generator-p05f8.js","batch-a-browser-worksheet-p05f8-extension.js","cube-cuboid-elements-diagram.js"])assert.ok(workflow.includes(uniquePath),uniquePath);for(const broadPath of ["html-renderer.js","source-units.js","config-state.js","batch-a-selector-p04f33-extension.js","public-ui-capability-binding-p04f33.js","batch-a-browser-worksheet-r2e-entry.js"])assert.equal(workflow.includes(broadPath),false,broadPath);});

test("P05F W5 Q008 pre-push static import smoke proves every changed JS/MJS relative import exists",()=>{const files=["site/modules/curriculum/registry/g5a-u10a1-cube-cuboid-elements-selector-projection-p05f8.js","site/modules/curriculum/registry/batch-a-selector-p05f8-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p05f8.js","site/modules/curriculum/batch-a/g5a-u10a1-cube-cuboid-elements-runtime-p05f8.js","site/modules/curriculum/batch-a/batch-a-browser-generator-p05f8.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f8-extension.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js","site/modules/curriculum/batch-a/source-units.js","site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","site/assets/browser/state/config-state.js","site/modules/renderer/cube-cuboid-elements-diagram.js","site/modules/renderer/html-renderer.js","tools/curriculum/run-p05f-w5-slice008-classic-ui-acceptance.mjs","tools/curriculum/run-p05f-w5-q008-live-pages-e2e.mjs"];const missing=[];const importPattern=/(?:import|export)\s+(?:[^'\"]*?\sfrom\s*)?["']([^"']+)["']/g;for(const relativeFile of files){const absolute=path.join(ROOT,relativeFile);assert.equal(existsSync(absolute),true,relativeFile);const text=readFileSync(absolute,"utf8");for(const match of text.matchAll(importPattern)){const specifier=match[1];if(!specifier.startsWith("."))continue;const resolved=path.resolve(path.dirname(absolute),specifier);if(!existsSync(resolved))missing.push(`${relativeFile} -> ${specifier}`);}}assert.deepEqual(missing,[]);});
