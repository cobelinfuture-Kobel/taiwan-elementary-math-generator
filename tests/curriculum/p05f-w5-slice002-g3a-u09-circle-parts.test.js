import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f2-extension.js";
import {generateG3AU09P05F2Questions,validateG3AU09P05F2Question} from "../../site/modules/curriculum/batch-a/g3a-u09-circle-parts-runtime-p05f2.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {
  G3A_U09_P05F2_FORMAL_MAPPING,
  G3A_U09_P05F2_FUTURE_KP_IDS,
  G3A_U09_P05F2_GROUP_ID,
  G3A_U09_P05F2_KP_ID,
  G3A_U09_P05F2_SPEC_IDS,
  G3A_U09_P05F2_SOURCE_ID,
  auditG3AU09P05F2SelectorProjection,
} from "../../site/modules/curriculum/registry/g3a-u09-circle-parts-selector-projection-p05f2.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP05F2PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f2-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f2.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q002-g3a-u09-circle-parts-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q002-g3a-u09-circle-parts-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G3A_U09_P05F2_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3A_U09_P05F2_KP_ID],selectedPatternGroupIds:[G3A_U09_P05F2_GROUP_ID],patternSpecIds:[...G3A_U09_P05F2_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f2-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const FORBIDDEN_LEARNER_TERMS=["圓周","圓規","弦","相切","外切","內切"];
function occurrences(text,token){return text.split(token).length-1;}

test("P05F W5 Q002 preserves exact queue, Q001 predecessor D0 evidence, and source-authority boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,2);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q002_r0_g3a_u09_3a09_profile_geometry_property_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice002Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G3A_U09_P05F2_KP_ID]);
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.panelTitle,"圓的各部位名稱");
  assert.deepEqual(preflight.sourceAuthority.page1DirectEvidence.targetKnowledgePointLabels,["圓心","半徑","直徑"]);
  assert.equal(preflight.sourceConstraintReconciliation.sourceRefAmbiguity,false);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(implementation.previousSliceD0Evidence.exactPostMergePagesE2ERunId,"33879084977");
  assert.equal(implementation.scopeGuard.q001SemanticsTouched,false);
});

test("P05F W5 Q002 materializes one FormalMapping, one group, and five source-backed diagram PatternSpecs",()=>{
  const audit=auditG3AU09P05F2SelectorProjection();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:5,diagram:5,application:0});
  assert.equal(G3A_U09_P05F2_FORMAL_MAPPING.mappingId,"fm_g3a_u09_circle_center_radius_diameter_p05f2");
  assert.deepEqual(G3A_U09_P05F2_FORMAL_MAPPING.includedRelations,["IDENTIFY_CIRCLE_CENTER","IDENTIFY_RADIUS","IDENTIFY_DIAMETER","MATCH_CIRCLE_PART_LABEL_TO_DIAGRAM","DISTINGUISH_DIAMETER_FROM_NONCENTER_CHORD"]);
  for(const relation of ["IDENTIFY_CIRCUMFERENCE_AS_TARGET_KP","COMPASS_CONSTRUCTION","RADIUS_DIAMETER_MEASUREMENT","COMPUTE_RADIUS_FROM_DIAMETER","CIRCLE_POINT_POSITION","TWO_CIRCLE_TANGENCY","APPLICATION_CONTEXT"])assert.ok(G3A_U09_P05F2_FORMAL_MAPPING.excludedRelations.includes(relation));
  assert.equal(G3A_U09_P05F2_FORMAL_MAPPING.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(G3A_U09_P05F2_FORMAL_MAPPING.applicationContextSupportedByDirectPdf,false);
  assert.equal(G3A_U09_P05F2_FORMAL_MAPPING.applicationImplementationAllowed,false);
});

test("P05F W5 Q002 promotes one G3A-U09 public leaf and keeps three successors fail-closed",()=>{
  const audit=auditP05F2PublicSelectorComposition();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{sources:45,knowledgePoints:314,g3aU09Visible:1,g3aU09Hidden:3,g3aU09NotSelectable:3});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,45);
  const source=listBatchAKnowledgePointAvailabilityBySource(G3A_U09_P05F2_SOURCE_ID);
  assert.deepEqual(source.visibleKnowledgePointIds,[G3A_U09_P05F2_KP_ID]);
  assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G3A_U09_P05F2_FUTURE_KP_IDS]);
  assert.deepEqual(source.notSelectableKnowledgePointIds,[...G3A_U09_P05F2_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G3A_U09_P05F2_KP_ID,"diagram"),[...G3A_U09_P05F2_SPEC_IDS]);
  for(const id of G3A_U09_P05F2_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
  const units=listBatchASourceUnits({includeW5Slice001:true,includeW5Slice002:true,includeCurrentFullProductPublic:true});
  const unit=units.find((row)=>row.sourceId===G3A_U09_P05F2_SOURCE_ID);
  assert.deepEqual(unit,{sourceId:G3A_U09_P05F2_SOURCE_ID,grade:3,semester:"upper",unitCode:"3A-U09",title:"圓",domain:"geometry_property",lifecycle:"public_full_product_w5_slice002_candidate"});
});

test("P05F W5 Q002 generates a balanced 24-question diagram worksheet with fail-closed validation",()=>{
  const generated=generateG3AU09P05F2Questions(options);
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,24);
  assert.deepEqual(generated.allocation.map((row)=>row.count),[5,5,5,5,4]);
  assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);
  assert.deepEqual(new Set(generated.questions.map((row)=>row.answerText)),new Set(["圓心","半徑","直徑","是直徑","不是直徑"]));
  for(const question of generated.questions){
    assert.equal(validateG3AU09P05F2Question(question).ok,true);
    for(const term of FORBIDDEN_LEARNER_TERMS)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false,`${question.id}:${term}`);
    assert.equal(question.metadata.applicationContextUsed,false);
    assert.equal(question.metadata.numericRadiusDiameterSolveUsed,false);
    assert.equal(question.metadata.constructionUsed,false);
    assert.equal(question.metadata.circumferenceTargetUsed,false);
  }
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));
  answerTamper.answerText="圓周";
  assert.equal(validateG3AU09P05F2Question(answerTamper).ok,false);
  const diagramTamper=JSON.parse(JSON.stringify(generated.questions[1]));
  diagramTamper.geometryDiagram.radius=31;
  assert.equal(validateG3AU09P05F2Question(diagramTamper).ok,false);
});

test("P05F W5 Q002 proves 240 distinct diagram variants for every PatternSpec",()=>{
  for(const patternSpecId of G3A_U09_P05F2_SPEC_IDS){
    const result=generateG3AU09P05F2Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});
    assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);
    assert.equal(result.questions.length,240);
    assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);
    assert.equal(result.questions.every((row)=>row.patternSpecId===patternSpecId),true);
  }
});

test("P05F W5 Q002 public binding exposes diagram-only max-240 capability while application context stays unadmitted",()=>{
  const binding=resolvePublicUiCapabilityBinding(options);
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.deepEqual(binding.availableQuestionTypeOptions.map((row)=>row.value),["diagram"]);
  assert.equal(binding.questionCount.max,240);
  assert.deepEqual(binding.compatiblePatternGroupIds,[G3A_U09_P05F2_GROUP_ID]);
  assert.deepEqual(binding.patternSpecIds,[...G3A_U09_P05F2_SPEC_IDS]);
  assert.equal(binding.geometryDiagramRepresentation,true);
  assert.equal(binding.applicationSuitability,"APPLICATION_COMPATIBLE");
  assert.equal(binding.applicationContextSupportedByDirectPdf,false);
  assert.equal(binding.applicationImplementationAllowed,false);
  assert.equal(binding.genericFallback,false);
  assert.equal(binding.freeFormAI,false);
});

test("P05F W5 Q002 worksheet and shared HTML renderer preserve circle diagrams across questions and answers",()=>{
  const result=buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok,true,result.errors.join("\n"));
  const document=result.worksheetDocument;
  assert.equal(document.title,"圓");
  assert.equal(document.questionCount,24);
  assert.equal(document.answerKeyItems.length,24);
  assert.equal(document.questionPages.length,3);
  assert.equal(document.answerKeyPages.length,3);
  assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="circle_parts_diagram"),true);
  assert.equal(document.answerKeyItems.every((row)=>row.geometryDiagram?.kind==="circle_parts_diagram"),true);
  const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:"",title:document.title});
  assert.equal(occurrences(html,'class="worksheet-circle-parts-diagram"'),48);
  assert.equal(occurrences(html,"circle-parts-diagram__center-reference"),48);
  assert.ok(occurrences(html,"circle-parts-diagram__segment--radius")>0);
  assert.ok(occurrences(html,"circle-parts-diagram__segment--diameter")>0);
  assert.ok(occurrences(html,"circle-parts-diagram__segment--diameter-test")>0);
  for(const term of FORBIDDEN_LEARNER_TERMS)assert.equal(html.includes(term),false,term);
});

test("P05F W5 Q002 stable browser selector and binding wrappers cut over without changing Node historical snapshots",async()=>{
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f2=${Date.now()}`);
    const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f2=${Date.now()}`);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,45);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,314);
    assert.equal(selector.getVisibleBatchAKnowledgePoint(G3A_U09_P05F2_KP_ID)?.sourceId,G3A_U09_P05F2_SOURCE_ID);
    const binding=bindingModule.resolvePublicUiCapabilityBinding(options);
    assert.equal(binding.questionType,"diagram");
    assert.equal(binding.questionCount.max,240);
    assert.ok(listBatchASourceUnits().some((row)=>row.sourceId===G3A_U09_P05F2_SOURCE_ID));
  }finally{
    delete globalThis.document;
  }
});

test("P05F W5 Q002 pre-push static import smoke proves every changed JS/MJS relative import exists",()=>{
  const files=[
    "site/modules/curriculum/registry/g3a-u09-circle-parts-selector-projection-p05f2.js",
    "site/modules/curriculum/registry/batch-a-selector-p05f2-extension.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p05f2.js",
    "site/modules/curriculum/batch-a/g3a-u09-circle-parts-runtime-p05f2.js",
    "site/modules/curriculum/batch-a/batch-a-browser-generator-p05f2.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f2-extension.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    "site/modules/curriculum/batch-a/source-units.js",
    "site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",
    "site/assets/browser/state/config-state.js",
    "site/modules/renderer/circle-parts-diagram.js",
    "site/modules/renderer/html-renderer.js",
    "tools/curriculum/run-p05f-w5-slice002-classic-ui-acceptance.mjs"
  ];
  const missing=[];
  const importPattern=/(?:import|export)\s+(?:[^'\"]*?\sfrom\s*)?["']([^"']+)["']/g;
  for(const relativeFile of files){
    const absolute=path.join(ROOT,relativeFile);
    assert.equal(existsSync(absolute),true,relativeFile);
    const text=readFileSync(absolute,"utf8");
    for(const match of text.matchAll(importPattern)){
      const specifier=match[1];
      if(!specifier.startsWith("."))continue;
      const resolved=path.resolve(path.dirname(absolute),specifier);
      if(!existsSync(resolved))missing.push(`${relativeFile} -> ${specifier}`);
    }
  }
  assert.deepEqual(missing,[]);
});
