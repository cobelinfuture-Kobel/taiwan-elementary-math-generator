import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f5-extension.js";
import {generateG4BU10P05F5Questions,validateG4BU10P05F5Question} from "../../site/modules/curriculum/batch-a/g4b-u10-cubic-centimeter-unit-runtime-p05f5.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {G4B_U10_P05F5_FORMAL_MAPPING,G4B_U10_P05F5_FUTURE_KP_IDS,G4B_U10_P05F5_GROUP_ID,G4B_U10_P05F5_KP_ID,G4B_U10_P05F5_REQUIRED_CAPABILITY_IDS,G4B_U10_P05F5_SPEC_IDS,G4B_U10_P05F5_SOURCE_ID,auditG4BU10P05F5SelectorProjection} from "../../site/modules/curriculum/registry/g4b-u10-cubic-centimeter-unit-selector-projection-p05f5.js";
import {BATCH_A_SELECTOR_AVAILABILITY,auditP05F5PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p05f5-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f5.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q005-g4b-u10-cubic-centimeter-unit-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q005-g4b-u10-cubic-centimeter-unit-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G4B_U10_P05F5_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4B_U10_P05F5_KP_ID],selectedPatternGroupIds:[G4B_U10_P05F5_GROUP_ID],patternSpecIds:[...G4B_U10_P05F5_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f5-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const FORBIDDEN=["數方塊","幾個方塊","每層","層數","重組","長乘寬乘高","長×寬×高","應用題"];
const occurrences=(text,token)=>text.split(token).length-1;

test("P05F W5 Q005 preserves exact frozen queue, Q004 D0 predecessor, and source authority",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,5);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q005_r0_g4b_u10_4b10_profile_spatial_solid_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice005Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G4B_U10_P05F5_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,[...G4B_U10_P05F5_REQUIRED_CAPABILITY_IDS]);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"eb538bb879164830995f11d908a1931e31f0bd03");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"33934940413");
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement,"學生能理解邊長1公分正方體的體積是1立方公分。");
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant,"體積單位是三維堆疊單位，不等同面積或長度單位。");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.scopeGuard.q004SemanticsTouched,false);
});

test("P05F W5 Q005 materializes one FormalMapping, one group, and four source-backed solid diagram PatternSpecs",()=>{
  const audit=auditG4BU10P05F5SelectorProjection();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,diagram:4,application:0});
  assert.equal(G4B_U10_P05F5_FORMAL_MAPPING.mappingId,"fm_g4b_u10_cubic_centimeter_unit_p05f5");
  assert.deepEqual(G4B_U10_P05F5_FORMAL_MAPPING.includedRelations,["IDENTIFY_ONE_CUBIC_CENTIMETER","MATCH_ONE_CM_EDGE_CUBE_TO_ONE_CM3","RECOGNIZE_CM3_AS_VOLUME_UNIT","DISTINGUISH_VOLUME_UNIT_FROM_AREA_OR_LENGTH_UNIT"]);
  for(const relation of ["UNIT_CUBE_COUNTING","LAYERED_CUBE_COUNTING","VOLUME_CONSERVATION_REARRANGEMENT","RECTANGULAR_PRISM_VOLUME_STRUCTURE","APPLICATION_CONTEXT"])assert.ok(G4B_U10_P05F5_FORMAL_MAPPING.excludedRelations.includes(relation));
  assert.equal(G4B_U10_P05F5_FORMAL_MAPPING.applicationImplementationAllowed,false);
});

test("P05F W5 Q005 promotes one G4B-U10 public leaf and keeps four same-source future KPs fail-closed",()=>{
  const audit=auditP05F5PublicSelectorComposition();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{sources:48,knowledgePoints:317,g4bU10Visible:1,g4bU10Hidden:4,g4bU10NotSelectable:4});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,48);
  const source=listBatchAKnowledgePointAvailabilityBySource(G4B_U10_P05F5_SOURCE_ID);assert.deepEqual(source.visibleKnowledgePointIds,[G4B_U10_P05F5_KP_ID]);assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G4B_U10_P05F5_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G4B_U10_P05F5_KP_ID,"diagram"),[...G4B_U10_P05F5_SPEC_IDS]);for(const id of G4B_U10_P05F5_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
  const unit=listBatchASourceUnits({includeW5Slice005:true,includeCurrentFullProductPublic:true}).find((row)=>row.sourceId===G4B_U10_P05F5_SOURCE_ID);assert.deepEqual(unit,{sourceId:G4B_U10_P05F5_SOURCE_ID,grade:4,semester:"lower",unitCode:"4B-U10",title:"立方公分與體積",domain:"spatial_solid",lifecycle:"public_full_product_w5_slice005_candidate"});
});

test("P05F W5 Q005 generates balanced 24-question unit-cube diagrams with fail-closed validation",()=>{
  const generated=generateG4BU10P05F5Questions(options);assert.equal(generated.ok,true,generated.errors.join("\n"));assert.equal(generated.questions.length,24);assert.deepEqual(generated.allocation.map((row)=>row.count),[6,6,6,6]);assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);assert.deepEqual(new Set(generated.questions.map((row)=>row.answerText)),new Set(["1 立方公分","立方公分","體積單位"]));
  for(const question of generated.questions){assert.equal(validateG4BU10P05F5Question(question).ok,true);assert.equal(question.geometryDiagram.cubeCount,1);assert.equal(question.geometryDiagram.edgeCentimeters,1);assert.equal(question.geometryDiagram.volumeCubicCentimeters,1);for(const term of FORBIDDEN)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false,`${question.id}:${term}`);assert.equal(question.metadata.unitCubeCountingUsed,false);assert.equal(question.metadata.layeredCubeCountingUsed,false);assert.equal(question.metadata.volumeConservationRearrangementUsed,false);assert.equal(question.metadata.rectangularPrismVolumeStructureUsed,false);assert.equal(question.metadata.applicationContextUsed,false);}
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));answerTamper.answerText="8 立方公分";assert.equal(validateG4BU10P05F5Question(answerTamper).ok,false);
  const cubeTamper=JSON.parse(JSON.stringify(generated.questions[1]));cubeTamper.geometryDiagram.cubeCount=2;assert.equal(validateG4BU10P05F5Question(cubeTamper).ok,false);
});

test("P05F W5 Q005 proves 240 distinct diagram variants for every PatternSpec",()=>{for(const patternSpecId of G4B_U10_P05F5_SPEC_IDS){const result=generateG4BU10P05F5Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);assert.equal(result.questions.length,240);assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);}});

test("P05F W5 Q005 public binding exposes solid diagram-only max-240 and excluded semantics remain unadmitted",()=>{const binding=resolvePublicUiCapabilityBinding(options);assert.equal(binding.blocked,false);assert.equal(binding.questionType,"diagram");assert.equal(binding.questionCount.max,240);assert.equal(binding.solidGeometryRepresentation,true);assert.equal(binding.spatialSolidReasoningRequired,true);assert.equal(binding.geometryPropertyReasoningRequired,true);assert.equal(binding.unitCubeCountingAdmission,false);assert.equal(binding.layeredCubeCountingAdmission,false);assert.equal(binding.volumeConservationRearrangementAdmission,false);assert.equal(binding.rectangularPrismVolumeStructureAdmission,false);assert.equal(binding.applicationImplementationAllowed,false);assert.equal(binding.genericFallback,false);assert.equal(binding.freeFormAI,false);});

test("P05F W5 Q005 worksheet and shared HTML renderer preserve one-cube representations",()=>{const result=buildBatchABrowserWorksheetDocument(options);assert.equal(result.ok,true,result.errors.join("\n"));const document=result.worksheetDocument;assert.equal(document.questionCount,24);assert.equal(document.answerKeyItems.length,24);assert.equal(document.questionPages.length,3);assert.equal(document.answerKeyPages.length,3);assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="cubic_centimeter_unit_diagram"&&row.geometryDiagram.cubeCount===1),true);const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:"",title:document.title});assert.equal(occurrences(html,'class="worksheet-cubic-centimeter-unit-diagram"'),48);assert.equal(occurrences(html,'cubic-centimeter-unit-diagram__face '),144);assert.equal(occurrences(html,'data-diagram-mode="UNIT_CUBE_VOLUME"'),12);assert.equal(occurrences(html,'data-diagram-mode="EDGE_LABELS"'),12);assert.equal(occurrences(html,'data-diagram-mode="CM3_UNIT"'),12);assert.equal(occurrences(html,'data-diagram-mode="DIMENSION_CUE"'),12);});

test("P05F W5 Q005 stable browser selector and binding wrappers cut over while Node historical snapshots remain isolated",async()=>{globalThis.document={};try{const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f5=${Date.now()}`);const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f5=${Date.now()}`);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,48);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,317);assert.equal(selector.getVisibleBatchAKnowledgePoint(G4B_U10_P05F5_KP_ID)?.sourceId,G4B_U10_P05F5_SOURCE_ID);const binding=bindingModule.resolvePublicUiCapabilityBinding(options);assert.equal(binding.questionCount.max,240);assert.ok(listBatchASourceUnits().some((row)=>row.sourceId===G4B_U10_P05F5_SOURCE_ID));}finally{delete globalThis.document;}});

test("P05F W5 Q005 post-merge workflow is main-push Q-specific plus dispatch only",()=>{const workflow=readFileSync(path.join(ROOT,".github/workflows/p05f-w5-q005-live-pages-e2e.yml"),"utf8");assert.match(workflow,/\n  push:\n/);assert.match(workflow,/\n    branches:\n      - main\n/);assert.match(workflow,/\n  workflow_dispatch:\n/);assert.doesNotMatch(workflow,/\n  pull_request:/);assert.doesNotMatch(workflow,/\n  workflow_run:/);for(const uniquePath of ["g4b-u10-cubic-centimeter-unit-selector-projection-p05f5.js","batch-a-selector-p05f5-extension.js","public-ui-capability-binding-p05f5.js","g4b-u10-cubic-centimeter-unit-runtime-p05f5.js","batch-a-browser-generator-p05f5.js","batch-a-browser-worksheet-p05f5-extension.js","cubic-centimeter-unit-diagram.js"])assert.ok(workflow.includes(uniquePath),uniquePath);for(const broadPath of ["html-renderer.js","source-units.js","config-state.js","batch-a-selector-p04f33-extension.js","public-ui-capability-binding-p04f33.js","batch-a-browser-worksheet-r2e-entry.js"])assert.equal(workflow.includes(broadPath),false,broadPath);});

test("P05F W5 Q005 pre-push static import smoke proves every changed JS/MJS relative import exists",()=>{const files=["site/modules/curriculum/registry/g4b-u10-cubic-centimeter-unit-selector-projection-p05f5.js","site/modules/curriculum/registry/batch-a-selector-p05f5-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p05f5.js","site/modules/curriculum/batch-a/g4b-u10-cubic-centimeter-unit-runtime-p05f5.js","site/modules/curriculum/batch-a/batch-a-browser-generator-p05f5.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f5-extension.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js","site/modules/curriculum/batch-a/source-units.js","site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","site/assets/browser/state/config-state.js","site/modules/renderer/cubic-centimeter-unit-diagram.js","site/modules/renderer/html-renderer.js","tools/curriculum/run-p05f-w5-slice005-classic-ui-acceptance.mjs","tools/curriculum/run-p05f-w5-q005-live-pages-e2e.mjs"];const missing=[];const importPattern=/(?:import|export)\s+(?:[^'\"]*?\sfrom\s*)?["']([^"']+)["']/g;for(const relativeFile of files){const absolute=path.join(ROOT,relativeFile);assert.equal(existsSync(absolute),true,relativeFile);const text=readFileSync(absolute,"utf8");for(const match of text.matchAll(importPattern)){const specifier=match[1];if(!specifier.startsWith("."))continue;const resolved=path.resolve(path.dirname(absolute),specifier);if(!existsSync(resolved))missing.push(`${relativeFile} -> ${specifier}`);}}assert.deepEqual(missing,[]);});
