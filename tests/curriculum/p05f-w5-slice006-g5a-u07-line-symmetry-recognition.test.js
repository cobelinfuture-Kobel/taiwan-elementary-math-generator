import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f6-extension.js";
import {generateG5AU07P05F6Questions,validateG5AU07P05F6Question} from "../../site/modules/curriculum/batch-a/g5a-u07-line-symmetry-recognition-runtime-p05f6.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {G5A_U07_P05F6_FORMAL_MAPPING,G5A_U07_P05F6_FUTURE_KP_IDS,G5A_U07_P05F6_GROUP_ID,G5A_U07_P05F6_KP_ID,G5A_U07_P05F6_REQUIRED_CAPABILITY_IDS,G5A_U07_P05F6_SPEC_IDS,G5A_U07_P05F6_SOURCE_ID,auditG5AU07P05F6SelectorProjection} from "../../site/modules/curriculum/registry/g5a-u07-line-symmetry-recognition-selector-projection-p05f6.js";
import {BATCH_A_SELECTOR_AVAILABILITY,auditP05F6PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p05f6-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f6.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q006-g5a-u07-line-symmetry-recognition-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q006-g5a-u07-line-symmetry-recognition-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G5A_U07_P05F6_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5A_U07_P05F6_KP_ID],selectedPatternGroupIds:[G5A_U07_P05F6_GROUP_ID],patternSpecIds:[...G5A_U07_P05F6_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f6-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const FORBIDDEN=["幾條對稱軸","對稱軸位置","對稱點距離","補完圖形","完成圖形","座標","反射","畫出","作圖","應用題"];
const occurrences=(text,token)=>text.split(token).length-1;

test("P05F W5 Q006 preserves exact frozen queue, Q005 D0 predecessor, and source authority",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,6);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q006_r0_g5a_u07_5a07_profile_geometry_property_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice006Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G5A_U07_P05F6_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,[...G5A_U07_P05F6_REQUIRED_CAPABILITY_IDS]);
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"4c25827b55d463892ff165f93227c2a6c82971e8");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"33937587482");
  assert.equal(preflight.r02ReviewedCandidateAuthority.capabilityStatement,"學生能判斷圖形是否能沿一直線摺合重疊。");
  assert.equal(preflight.r02ReviewedCandidateAuthority.reasoningInvariant,"對稱線兩側對應部分形狀大小相同且方向相反。");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.scopeGuard.q005SemanticsTouched,false);
  assert.equal(implementation.scopeGuard.q007Touched,false);
  assert.equal(implementation.scopeGuard.frozenQueueAuthorityTouched,false);
});

test("P05F W5 Q006 materializes one FormalMapping, one group, and three source-backed diagram PatternSpecs",()=>{
  const audit=auditG5AU07P05F6SelectorProjection();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,diagram:3,application:0});
  assert.equal(G5A_U07_P05F6_FORMAL_MAPPING.mappingId,"fm_g5a_u07_line_symmetry_recognition_p05f6");
  assert.deepEqual(G5A_U07_P05F6_FORMAL_MAPPING.includedRelations,["IDENTIFY_LINE_SYMMETRIC_FIGURE","DISTINGUISH_LINE_SYMMETRIC_FROM_NON_SYMMETRIC_FIGURE","RECOGNIZE_FOLD_OVERLAP_AS_LINE_SYMMETRY_CRITERION"]);
  for(const relation of ["SYMMETRY_AXIS_COUNT","SYMMETRY_AXIS_LOCATION_OR_CONSTRUCTION","SYMMETRIC_POINT_DISTANCE","SYMMETRIC_CORRESPONDING_PARTS_QUANTITATIVE_REASONING","COMPLETE_SYMMETRIC_FIGURE","COORDINATE_REFLECTION","DRAW_OR_CONSTRUCT_SYMMETRIC_FIGURE","APPLICATION_CONTEXT","GEOMETRY_FORMULA_OR_MEASUREMENT"])assert.ok(G5A_U07_P05F6_FORMAL_MAPPING.excludedRelations.includes(relation));
  assert.equal(G5A_U07_P05F6_FORMAL_MAPPING.applicationImplementationAllowed,false);
});

test("P05F W5 Q006 promotes one G5A-U07 public leaf and keeps four same-source future KPs fail-closed",()=>{
  const audit=auditP05F6PublicSelectorComposition();assert.equal(audit.ok,true,audit.errors.join("\n"));assert.deepEqual(audit.counts,{sources:49,knowledgePoints:318,g5aU07Visible:1,g5aU07Hidden:4,g5aU07NotSelectable:4});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,49);
  const source=listBatchAKnowledgePointAvailabilityBySource(G5A_U07_P05F6_SOURCE_ID);assert.deepEqual(source.visibleKnowledgePointIds,[G5A_U07_P05F6_KP_ID]);assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G5A_U07_P05F6_FUTURE_KP_IDS]);assert.deepEqual(source.notSelectableKnowledgePointIds,[...G5A_U07_P05F6_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G5A_U07_P05F6_KP_ID,"diagram"),[...G5A_U07_P05F6_SPEC_IDS]);for(const id of G5A_U07_P05F6_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
  const unit=listBatchASourceUnits({includeW5Slice006:true,includeCurrentFullProductPublic:true}).find((row)=>row.sourceId===G5A_U07_P05F6_SOURCE_ID);assert.deepEqual(unit,{sourceId:G5A_U07_P05F6_SOURCE_ID,grade:5,semester:"upper",unitCode:"5A-U07",title:"線對稱圖形",domain:"geometry_property",lifecycle:"public_full_product_w5_slice006_candidate"});
});

test("P05F W5 Q006 generates balanced 24-question symmetry diagrams with fail-closed validation",()=>{
  const generated=generateG5AU07P05F6Questions(options);assert.equal(generated.ok,true,generated.errors.join("\n"));assert.equal(generated.questions.length,24);assert.deepEqual(generated.allocation.map((row)=>row.count),[8,8,8]);assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);assert.deepEqual(new Set(generated.questions.map((row)=>row.answerText)),new Set(["是","不是","可以"]));
  for(const question of generated.questions){assert.equal(validateG5AU07P05F6Question(question).ok,true);for(const term of FORBIDDEN)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false,`${question.id}:${term}`);assert.equal(question.metadata.symmetryAxisCountUsed,false);assert.equal(question.metadata.symmetryAxisLocationOrConstructionUsed,false);assert.equal(question.metadata.symmetricPointDistanceUsed,false);assert.equal(question.metadata.completeSymmetricFigureUsed,false);assert.equal(question.metadata.coordinateReflectionUsed,false);assert.equal(question.metadata.geometryFormulaOrMeasurementUsed,false);assert.equal(question.metadata.applicationContextUsed,false);}
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));answerTamper.answerText="不是";assert.equal(validateG5AU07P05F6Question(answerTamper).ok,false);
  const symmetryTamper=JSON.parse(JSON.stringify(generated.questions[1]));symmetryTamper.geometryDiagram.isLineSymmetric=!symmetryTamper.geometryDiagram.isLineSymmetric;assert.equal(validateG5AU07P05F6Question(symmetryTamper).ok,false);
});

test("P05F W5 Q006 proves 240 distinct diagram variants for every PatternSpec",()=>{for(const patternSpecId of G5A_U07_P05F6_SPEC_IDS){const result=generateG5AU07P05F6Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);assert.equal(result.questions.length,240);assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);}});

test("P05F W5 Q006 public binding exposes diagram-only max-240 and excluded symmetry semantics remain unadmitted",()=>{const binding=resolvePublicUiCapabilityBinding(options);assert.equal(binding.blocked,false);assert.equal(binding.questionType,"diagram");assert.equal(binding.questionCount.max,240);assert.equal(binding.geometryDiagramRepresentation,true);assert.equal(binding.geometryPropertyReasoningRequired,true);assert.equal(binding.symmetryAxisCountAdmission,false);assert.equal(binding.symmetryAxisLocationOrConstructionAdmission,false);assert.equal(binding.symmetricPointDistanceAdmission,false);assert.equal(binding.completeSymmetricFigureAdmission,false);assert.equal(binding.coordinateReflectionAdmission,false);assert.equal(binding.applicationImplementationAllowed,false);assert.equal(binding.genericFallback,false);assert.equal(binding.freeFormAI,false);});

test("P05F W5 Q006 worksheet and shared HTML renderer preserve symmetry diagrams",()=>{const result=buildBatchABrowserWorksheetDocument(options);assert.equal(result.ok,true,result.errors.join("\n"));const document=result.worksheetDocument;assert.equal(document.title,"線對稱圖形");assert.equal(document.questionCount,24);assert.equal(document.answerKeyItems.length,24);assert.equal(document.questionPages.length,3);assert.equal(document.answerKeyPages.length,3);assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="line_symmetry_recognition_diagram"),true);const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:"",title:document.title});assert.equal(occurrences(html,'class="worksheet-line-symmetry-recognition-diagram"'),48);assert.equal(occurrences(html,'class="line-symmetry-recognition-diagram__shape"'),48);assert.equal(occurrences(html,'class="line-symmetry-recognition-diagram__fold-guide"'),16);assert.equal(occurrences(html,'data-diagram-mode="SYMMETRIC_CLASSIFICATION"'),16);assert.equal(occurrences(html,'data-diagram-mode="NON_SYMMETRIC_CLASSIFICATION"'),16);assert.equal(occurrences(html,'data-diagram-mode="FOLD_OVERLAP_CUE"'),16);});

test("P05F W5 Q006 stable browser selector and binding wrappers cut over while Node historical snapshots remain isolated",async()=>{globalThis.document={};try{const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f6=${Date.now()}`);const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f6=${Date.now()}`);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,49);assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,318);assert.equal(selector.getVisibleBatchAKnowledgePoint(G5A_U07_P05F6_KP_ID)?.sourceId,G5A_U07_P05F6_SOURCE_ID);const binding=bindingModule.resolvePublicUiCapabilityBinding(options);assert.equal(binding.questionCount.max,240);assert.ok(listBatchASourceUnits().some((row)=>row.sourceId===G5A_U07_P05F6_SOURCE_ID));}finally{delete globalThis.document;}});

test("P05F W5 Q006 post-merge workflow is main-push Q-specific plus dispatch only",()=>{const workflow=readFileSync(path.join(ROOT,".github/workflows/p05f-w5-q006-live-pages-e2e.yml"),"utf8");assert.match(workflow,/\n  push:\n/);assert.match(workflow,/\n    branches:\n      - main\n/);assert.match(workflow,/\n  workflow_dispatch:\n/);assert.doesNotMatch(workflow,/\n  pull_request:/);assert.doesNotMatch(workflow,/\n  workflow_run:/);for(const uniquePath of ["g5a-u07-line-symmetry-recognition-selector-projection-p05f6.js","batch-a-selector-p05f6-extension.js","public-ui-capability-binding-p05f6.js","g5a-u07-line-symmetry-recognition-runtime-p05f6.js","batch-a-browser-generator-p05f6.js","batch-a-browser-worksheet-p05f6-extension.js","line-symmetry-recognition-diagram.js"])assert.ok(workflow.includes(uniquePath),uniquePath);for(const broadPath of ["html-renderer.js","source-units.js","config-state.js","batch-a-selector-p04f33-extension.js","public-ui-capability-binding-p04f33.js","batch-a-browser-worksheet-r2e-entry.js"])assert.equal(workflow.includes(broadPath),false,broadPath);});

test("P05F W5 Q006 pre-push static import smoke proves every changed JS/MJS relative import exists",()=>{const files=["site/modules/curriculum/registry/g5a-u07-line-symmetry-recognition-selector-projection-p05f6.js","site/modules/curriculum/registry/batch-a-selector-p05f6-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p05f6.js","site/modules/curriculum/batch-a/g5a-u07-line-symmetry-recognition-runtime-p05f6.js","site/modules/curriculum/batch-a/batch-a-browser-generator-p05f6.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f6-extension.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js","site/modules/curriculum/batch-a/source-units.js","site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","site/assets/browser/state/config-state.js","site/modules/renderer/line-symmetry-recognition-diagram.js","site/modules/renderer/html-renderer.js","tools/curriculum/run-p05f-w5-slice006-classic-ui-acceptance.mjs","tools/curriculum/run-p05f-w5-q006-live-pages-e2e.mjs"];const missing=[];const importPattern=/(?:import|export)\s+(?:[^'\"]*?\sfrom\s*)?["']([^"']+)["']/g;for(const relativeFile of files){const absolute=path.join(ROOT,relativeFile);assert.equal(existsSync(absolute),true,relativeFile);const text=readFileSync(absolute,"utf8");for(const match of text.matchAll(importPattern)){const specifier=match[1];if(!specifier.startsWith("."))continue;const resolved=path.resolve(path.dirname(absolute),specifier);if(!existsSync(resolved))missing.push(`${relativeFile} -> ${specifier}`);}}assert.deepEqual(missing,[]);});
