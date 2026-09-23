import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f7-extension.js";
import {generateG5AU10AP05F7Questions,validateG5AU10AP05F7Question} from "../../site/modules/curriculum/batch-a/g5a-u10a-solid-shape-classification-runtime-p05f7.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {G5A_U10A_P05F7_FORMAL_MAPPING,G5A_U10A_P05F7_FUTURE_KP_IDS,G5A_U10A_P05F7_GROUP_ID,G5A_U10A_P05F7_KP_ID,G5A_U10A_P05F7_REQUIRED_CAPABILITY_IDS,G5A_U10A_P05F7_SPEC_IDS,G5A_U10A_P05F7_SOURCE_ID,auditG5AU10AP05F7SelectorProjection} from "../../site/modules/curriculum/registry/g5a-u10a-solid-shape-classification-selector-projection-p05f7.js";
import {BATCH_A_SELECTOR_AVAILABILITY,auditP05F7PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p05f7-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f7.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q007-g5a-u10a-solid-shape-classification-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q007-g5a-u10a-solid-shape-classification-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G5A_U10A_P05F7_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5A_U10A_P05F7_KP_ID],selectedPatternGroupIds:[G5A_U10A_P05F7_GROUP_ID],patternSpecIds:[...G5A_U10A_P05F7_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f7-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const FORBIDDEN=["幾個面","幾條稜","幾個頂點","展開圖","截面","視圖","正方體","長方體","體積","表面積","公式","應用題"];
const occurrences=(text,token)=>text.split(token).length-1;

test("P05F W5 Q007 preserves exact frozen queue, Q006 D0 predecessor, and source authority",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,7);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q007_r0_g5a_u10_5a10a_profile_spatial_solid_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice007Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G5A_U10A_P05F7_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,[...G5A_U10A_P05F7_REQUIRED_CAPABILITY_IDS]);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"0f386d75c86b98fc0998f797ef3f5850fa20ef6b");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"33950114817");
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement,"學生能依底面、側面與頂點特徵分類立體形體。");
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant,"柱體有兩個全等平行底面，錐體向一頂點收斂，球無平面底面。");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.scopeGuard.q006SemanticsTouched,false);
  assert.equal(implementation.scopeGuard.q008Touched,false);
  assert.equal(implementation.scopeGuard.frozenQueueAuthorityTouched,false);
});

test("P05F W5 Q007 materializes one FormalMapping, one group, and three source-backed solid-classification PatternSpecs",()=>{
  const audit=auditG5AU10AP05F7SelectorProjection();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0});
  assert.equal(G5A_U10A_P05F7_FORMAL_MAPPING.mappingId,"fm_g5a_u10a_solid_shape_classification_p05f7");
  assert.deepEqual(G5A_U10A_P05F7_FORMAL_MAPPING.includedRelations,["CLASSIFY_SOLIDS_BY_BASE_SIDE_VERTEX_FEATURES","DISTINGUISH_COLUMN_CONE_SPHERE","RECOGNIZE_DEFINING_SOLID_FEATURES"]);
  for(const relation of ["SOLID_ELEMENTS_NAMING_OR_COUNT","SOLID_NET_CORRESPONDENCE","SOLID_CROSS_SECTION","SOLID_VIEWPOINT_REPRESENTATION","CUBE_CUBOID_SPECIAL_CASE_REASONING","SOLID_MEASUREMENT_OR_FORMULA","APPLICATION_CONTEXT"])assert.ok(G5A_U10A_P05F7_FORMAL_MAPPING.excludedRelations.includes(relation));
  assert.equal(G5A_U10A_P05F7_FORMAL_MAPPING.applicationImplementationAllowed,false);
  assert.deepEqual(G5A_U10A_P05F7_FORMAL_MAPPING.answerDomain,["柱體","錐體","球"]);
});

test("P05F W5 Q007 promotes one G5A-U10a public leaf and keeps four same-source future KPs fail-closed",()=>{
  const audit=auditP05F7PublicSelectorComposition();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{sources:50,knowledgePoints:319,g5aU10aVisible:1,g5aU10aHidden:4,g5aU10aNotSelectable:4});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,50);
  const source=listBatchAKnowledgePointAvailabilityBySource(G5A_U10A_P05F7_SOURCE_ID);assert.deepEqual(source.visibleKnowledgePointIds,[G5A_U10A_P05F7_KP_ID]);assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G5A_U10A_P05F7_FUTURE_KP_IDS]);assert.deepEqual(source.notSelectableKnowledgePointIds,[...G5A_U10A_P05F7_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G5A_U10A_P05F7_KP_ID,"diagram"),[...G5A_U10A_P05F7_SPEC_IDS]);for(const id of G5A_U10A_P05F7_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
  const unit=listBatchASourceUnits({includeW5Slice007:true,includeCurrentFullProductPublic:true}).find((row)=>row.sourceId===G5A_U10A_P05F7_SOURCE_ID);assert.deepEqual(unit,{sourceId:G5A_U10A_P05F7_SOURCE_ID,grade:5,semester:"upper",unitCode:"5A-U10A",title:"柱體錐體和球",domain:"spatial_solid",lifecycle:"public_full_product_w5_slice007_candidate"});
});

test("P05F W5 Q007 generates balanced 24-question solid diagrams with fail-closed validation",()=>{
  const generated=generateG5AU10AP05F7Questions(options);assert.equal(generated.ok,true,generated.errors.join("\n"));assert.equal(generated.questions.length,24);assert.deepEqual(generated.allocation.map((row)=>row.count),[8,8,8]);assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);assert.deepEqual(new Set(generated.questions.map((row)=>row.answerText)),new Set(["柱體","錐體","球"]));
  const families=generated.questions.map((q)=>q.geometryDiagram.solidFamily);assert.deepEqual({COLUMN:families.filter(x=>x==="COLUMN").length,CONE:families.filter(x=>x==="CONE").length,SPHERE:families.filter(x=>x==="SPHERE").length},{COLUMN:8,CONE:8,SPHERE:8});
  for(const question of generated.questions){assert.equal(validateG5AU10AP05F7Question(question).ok,true);for(const term of FORBIDDEN)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false,`${question.id}:${term}`);assert.equal(question.metadata.solidElementsNamingOrCountUsed,false);assert.equal(question.metadata.solidNetCorrespondenceUsed,false);assert.equal(question.metadata.solidCrossSectionUsed,false);assert.equal(question.metadata.solidViewpointRepresentationUsed,false);assert.equal(question.metadata.cubeCuboidSpecialCaseReasoningUsed,false);assert.equal(question.metadata.solidMeasurementOrFormulaUsed,false);assert.equal(question.metadata.applicationContextUsed,false);}
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));answerTamper.answerText="球";assert.equal(validateG5AU10AP05F7Question(answerTamper).ok,false);
  const featureTamper=JSON.parse(JSON.stringify(generated.questions[1]));featureTamper.geometryDiagram.hasPlaneBase=!featureTamper.geometryDiagram.hasPlaneBase;assert.equal(validateG5AU10AP05F7Question(featureTamper).ok,false);
});

test("P05F W5 Q007 proves 240 distinct diagram variants for every PatternSpec",()=>{for(const patternSpecId of G5A_U10A_P05F7_SPEC_IDS){const result=generateG5AU10AP05F7Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);assert.equal(result.questions.length,240);assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);assert.deepEqual(new Set(result.questions.map((row)=>row.answerText)),new Set(["柱體","錐體","球"]));}});

test("P05F W5 Q007 public binding exposes diagram-only max-240 and excluded solid semantics remain unadmitted",()=>{const binding=resolvePublicUiCapabilityBinding(options);assert.equal(binding.blocked,false);assert.equal(binding.questionType,"diagram");assert.equal(binding.questionCount.max,240);assert.equal(binding.solidGeometryRepresentation,true);assert.equal(binding.spatialSolidReasoningRequired,true);assert.equal(binding.geometryPropertyReasoningRequired,true);assert.equal(binding.solidElementsNamingOrCountAdmission,false);assert.equal(binding.solidNetCorrespondenceAdmission,false);assert.equal(binding.solidCrossSectionAdmission,false);assert.equal(binding.solidViewpointRepresentationAdmission,false);assert.equal(binding.cubeCuboidSpecialCaseReasoningAdmission,false);assert.equal(binding.solidMeasurementOrFormulaAdmission,false);assert.equal(binding.applicationImplementationAllowed,false);assert.equal(binding.genericFallback,false);assert.equal(binding.freeFormAI,false);});

test("P05F W5 Q007 worksheet and shared HTML renderer preserve solid-classification diagrams",()=>{const result=buildBatchABrowserWorksheetDocument(options);assert.equal(result.ok,true,result.errors.join("\n"));const document=result.worksheetDocument;assert.equal(document.title,"柱體錐體和球");assert.equal(document.questionCount,24);assert.equal(document.answerKeyItems.length,24);assert.equal(document.questionPages.length,3);assert.equal(document.answerKeyPages.length,3);assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="solid_shape_classification_diagram"),true);const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:"",title:document.title});assert.equal(occurrences(html,'class="worksheet-solid-shape-classification-diagram"'),48);assert.equal(occurrences(html,'solid-shape-classification-diagram__shape'),48);assert.equal(occurrences(html,'data-solid-family="COLUMN"'),16);assert.equal(occurrences(html,'data-solid-family="CONE"'),16);assert.equal(occurrences(html,'data-solid-family="SPHERE"'),16);assert.equal(occurrences(html,'data-diagram-mode="CLASSIFY_BY_FEATURES"'),16);assert.equal(occurrences(html,'data-diagram-mode="COLUMN_CONE_SPHERE_CHOICE"'),16);assert.equal(occurrences(html,'data-diagram-mode="DEFINING_FEATURES"'),16);});

test("P05F W5 Q007 stable browser selector and binding wrappers cut over while Node historical snapshots remain isolated",async()=>{globalThis.document={};try{const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f7=${Date.now()}`);const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f7=${Date.now()}`);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,50);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,319);assert.equal(selector.getVisibleBatchAKnowledgePoint(G5A_U10A_P05F7_KP_ID)?.sourceId,G5A_U10A_P05F7_SOURCE_ID);const binding=bindingModule.resolvePublicUiCapabilityBinding(options);assert.equal(binding.questionCount.max,240);assert.ok(listBatchASourceUnits().some((row)=>row.sourceId===G5A_U10A_P05F7_SOURCE_ID));}finally{delete globalThis.document;}});

test("P05F W5 Q007 post-merge workflow is main-push Q-specific plus dispatch only",()=>{const workflow=readFileSync(path.join(ROOT,".github/workflows/p05f-w5-q007-live-pages-e2e.yml"),"utf8");assert.match(workflow,/\n  push:\n/);assert.match(workflow,/\n    branches:\n      - main\n/);assert.match(workflow,/\n  workflow_dispatch:\n/);assert.doesNotMatch(workflow,/\n  pull_request:/);assert.doesNotMatch(workflow,/\n  workflow_run:/);for(const uniquePath of ["g5a-u10a-solid-shape-classification-selector-projection-p05f7.js","batch-a-selector-p05f7-extension.js","public-ui-capability-binding-p05f7.js","g5a-u10a-solid-shape-classification-runtime-p05f7.js","batch-a-browser-generator-p05f7.js","batch-a-browser-worksheet-p05f7-extension.js","solid-shape-classification-diagram.js"])assert.ok(workflow.includes(uniquePath),uniquePath);for(const broadPath of ["html-renderer.js","source-units.js","config-state.js","batch-a-selector-p04f33-extension.js","public-ui-capability-binding-p04f33.js","batch-a-browser-worksheet-r2e-entry.js"])assert.equal(workflow.includes(broadPath),false,broadPath);});

test("P05F W5 Q007 pre-push static import smoke proves every changed JS/MJS relative import exists",()=>{const files=["site/modules/curriculum/registry/g5a-u10a-solid-shape-classification-selector-projection-p05f7.js","site/modules/curriculum/registry/batch-a-selector-p05f7-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p05f7.js","site/modules/curriculum/batch-a/g5a-u10a-solid-shape-classification-runtime-p05f7.js","site/modules/curriculum/batch-a/batch-a-browser-generator-p05f7.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f7-extension.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js","site/modules/curriculum/batch-a/source-units.js","site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","site/assets/browser/state/config-state.js","site/modules/renderer/solid-shape-classification-diagram.js","site/modules/renderer/html-renderer.js","tools/curriculum/run-p05f-w5-slice007-classic-ui-acceptance.mjs","tools/curriculum/run-p05f-w5-q007-live-pages-e2e.mjs"];const missing=[];const importPattern=/(?:import|export)\s+(?:[^'\"]*?\sfrom\s*)?["']([^"']+)["']/g;for(const relativeFile of files){const absolute=path.join(ROOT,relativeFile);assert.equal(existsSync(absolute),true,relativeFile);const text=readFileSync(absolute,"utf8");for(const match of text.matchAll(importPattern)){const specifier=match[1];if(!specifier.startsWith("."))continue;const resolved=path.resolve(path.dirname(absolute),specifier);if(!existsSync(resolved))missing.push(`${relativeFile} -> ${specifier}`);}}assert.deepEqual(missing,[]);});
