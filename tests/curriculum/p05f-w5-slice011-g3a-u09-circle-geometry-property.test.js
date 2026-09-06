import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f11-extension.js";
import {generateG3AU09P05F11Questions,validateG3AU09P05F11Question} from "../../site/modules/curriculum/batch-a/g3a-u09-circle-geometry-property-runtime-p05f11.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validateCircleGeometryPropertyDiagramModel} from "../../site/modules/renderer/circle-geometry-property-diagram.js";
import {
  G3A_U09_P05F11_EXISTING_KP_ID,
  G3A_U09_P05F11_FORMAL_MAPPINGS,
  G3A_U09_P05F11_GROUP_IDS,
  G3A_U09_P05F11_KP_IDS,
  G3A_U09_P05F11_PATTERN_SPECS,
  G3A_U09_P05F11_SOURCE_ID,
  G3A_U09_P05F11_SPEC_IDS,
  G3A_U09_P05F11_SPEC_IDS_BY_KP,
  auditG3AU09P05F11SelectorProjection,
} from "../../site/modules/curriculum/registry/g3a-u09-circle-geometry-property-selector-projection-p05f11.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP05F11PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f11-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f11.js";

const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q011-g3a-u09-circle-compass-construction-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q011-g3a-u09-circle-geometry-property-implementation.json",import.meta.url),"utf8"));
const baseOptions={sourceId:G3A_U09_P05F11_SOURCE_ID,selectionMode:"singleKnowledgePoint",questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f11-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};
const optionsFor=(index)=>({...baseOptions,selectedKnowledgePointIds:[G3A_U09_P05F11_KP_IDS[index]],selectedPatternGroupIds:[G3A_U09_P05F11_GROUP_IDS[index]],patternSpecIds:[...G3A_U09_P05F11_SPEC_IDS_BY_KP[G3A_U09_P05F11_KP_IDS[index]]],generationSeed:`p05f11-focused-${index}`});
const occurrences=(text,token)=>text.split(token).length-1;
const forbidden=["圓周率","圓面積公式","圓周長公式","同心圓","摺線","應用題"];

test("P05F W5 Q011 preserves the exact atomic three-KP queue/source boundary and Q010 D0 prerequisite",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,11);
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q011_r1_g3a_u09_3a09_profile_geometry_property_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice011Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[...G3A_U09_P05F11_KP_IDS]);
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(preflight.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(preflight.sourceAuthority.reviewedPages,[1,2]);
  assert.equal(preflight.sourceConstraintReconciliation.pointPositionSubrelationExplicitlyObservedInCurrentVisualReadback,false);
  assert.equal(preflight.sourceConstraintReconciliation.pointPositionSubrelationAuthority,"R02_REVIEWED_CANDIDATE_REASONING_INVARIANT");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.scopeGuard.q002CirclePartsSemanticsTouched,false);
});

test("P05F W5 Q011 materializes 3 FormalMappings, 3 groups, and exactly 15 diagram PatternSpecs",()=>{
  const audit=auditG3AU09P05F11SelectorProjection();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{knowledgePoints:3,patternGroups:3,patternSpecs:15,diagram:15,application:0});
  assert.equal(G3A_U09_P05F11_FORMAL_MAPPINGS.length,3);
  assert.equal(G3A_U09_P05F11_PATTERN_SPECS.length,15);
  assert.equal(new Set(G3A_U09_P05F11_SPEC_IDS).size,15);
  const included=new Set(G3A_U09_P05F11_FORMAL_MAPPINGS.flatMap(row=>row.includedRelations));
  assert.equal(included.size,15);
  for(const relation of preflight.q011ScopeLock.includedRelations)assert.equal(included.has(relation),true,relation);
  for(const mapping of G3A_U09_P05F11_FORMAL_MAPPINGS){
    for(const relation of ["CIRCLE_PART_LABEL_IDENTIFICATION_AS_TARGET_KP","IDENTIFY_CIRCUMFERENCE_AS_TARGET_KP","GENERIC_COMPASS_SEGMENT_LENGTH_MEASUREMENT","GENERIC_COMPASS_SEGMENT_LENGTH_COMPARISON","CONCENTRIC_CIRCLE_CONSTRUCTION","FOLD_LINE_RADIUS_CONSTRUCTION","CIRCLE_CIRCUMFERENCE_FORMULA","CIRCLE_AREA_FORMULA","APPLICATION_CONTEXT"])assert.ok(mapping.excludedRelations.includes(relation),`${mapping.mappingId}:${relation}`);
  }
});

test("P05F W5 Q011 promotes the remaining three G3A-U09 leaves while Q002 remains visible",()=>{
  const audit=auditP05F11PublicSelectorComposition();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{sources:51,knowledgePoints:325,g3aU09Visible:4,g3aU09Hidden:0,g3aU09NotSelectable:0});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount,51);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,325);
  const source=listBatchAKnowledgePointAvailabilityBySource(G3A_U09_P05F11_SOURCE_ID);
  assert.deepEqual(source.visibleKnowledgePointIds,[G3A_U09_P05F11_EXISTING_KP_ID,...G3A_U09_P05F11_KP_IDS]);
  assert.deepEqual(source.hiddenPendingKnowledgePointIds,[]);
  assert.deepEqual(source.notSelectableKnowledgePointIds,[]);
  assert.equal(getVisibleBatchAKnowledgePoint(G3A_U09_P05F11_EXISTING_KP_ID)?.knowledgePointId,G3A_U09_P05F11_EXISTING_KP_ID);
  for(const kp of G3A_U09_P05F11_KP_IDS){
    assert.equal(getVisibleBatchAKnowledgePoint(kp)?.knowledgePointId,kp);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kp,"diagram"),[...G3A_U09_P05F11_SPEC_IDS_BY_KP[kp]]);
    assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kp,"application"),[]);
  }
});

test("P05F W5 Q011 generates balanced source-backed diagrams for every target KP and validates fail-closed",()=>{
  for(let index=0;index<G3A_U09_P05F11_KP_IDS.length;index+=1){
    const result=generateG3AU09P05F11Questions(optionsFor(index));
    assert.equal(result.ok,true,`${G3A_U09_P05F11_KP_IDS[index]}: ${result.errors.join("\n")}`);
    assert.equal(result.questions.length,24);
    assert.equal(new Set(result.questions.map(q=>q.questionSignature)).size,24);
    assert.equal(result.allocation.reduce((sum,row)=>sum+row.count,0),24);
    assert.equal(Math.max(...result.allocation.map(row=>row.count))-Math.min(...result.allocation.map(row=>row.count))<=1,true);
    for(const q of result.questions){
      assert.equal(validateG3AU09P05F11Question(q).ok,true);
      assert.equal(validateCircleGeometryPropertyDiagramModel(q.geometryDiagram).ok,true);
      assert.equal(q.knowledgePointId,G3A_U09_P05F11_KP_IDS[index]);
      assert.equal(q.metadata.applicationContextUsed,false);
      assert.equal(q.metadata.circleCircumferenceFormulaUsed,false);
      assert.equal(q.metadata.circleAreaFormulaUsed,false);
      assert.equal(q.metadata.concentricConstructionUsed,false);
      assert.equal(q.metadata.foldLineConstructionUsed,false);
      assert.equal(q.metadata.q002SemanticsTouched,false);
      for(const term of forbidden)assert.equal(`${q.promptText} ${q.answerText}`.includes(term),false,term);
    }
  }
  const pointSet=generateG3AU09P05F11Questions({...optionsFor(1),questionCount:120});
  assert.equal(new Set(pointSet.questions.filter(q=>q.geometryDiagram.diagramMode==="POINT_POSITION").map(q=>q.geometryDiagram.positionClass)).size,3);
  const relationClasses=new Set(pointSet.questions.filter(q=>q.geometryDiagram.diagramMode==="TWO_CIRCLE_RELATION").map(q=>q.geometryDiagram.relationClass));
  assert.deepEqual(relationClasses,new Set(["INTERSECTION","TANGENCY","SEPARATION"]));
  const radial=generateG3AU09P05F11Questions({...optionsFor(2),questionCount:120});
  assert.equal(radial.questions.every(q=>q.geometryDiagram.diameterCm===q.geometryDiagram.radiusCm*2),true);
  const measurement=radial.questions.filter(q=>q.relation.startsWith("MEASURE_CIRCLE_"));
  assert.ok(measurement.length>0);
  for(const q of measurement)assert.equal(q.promptText.includes(q.answerText),false,`${q.relation} leaked ${q.answerText}`);
});

test("P05F W5 Q011 validator rejects semantic geometry tampering",()=>{
  const point=generateG3AU09P05F11Questions({...optionsFor(1),questionCount:120}).questions.find(q=>q.geometryDiagram.diagramMode==="POINT_POSITION"&&q.geometryDiagram.positionClass==="ON");
  const pointTamper=JSON.parse(JSON.stringify(point));pointTamper.geometryDiagram.distanceCm+=1;
  assert.equal(validateG3AU09P05F11Question(pointTamper).ok,false);
  const radial=generateG3AU09P05F11Questions({...optionsFor(2),questionCount:24}).questions[0];
  const radialTamper=JSON.parse(JSON.stringify(radial));radialTamper.geometryDiagram.diameterCm+=1;
  assert.equal(validateG3AU09P05F11Question(radialTamper).ok,false);
  const answerTamper=JSON.parse(JSON.stringify(radial));answerTamper.answerText="圓周率";
  assert.equal(validateG3AU09P05F11Question(answerTamper).ok,false);
  const mixed=generateG3AU09P05F11Questions({sourceId:G3A_U09_P05F11_SOURCE_ID,selectedKnowledgePointIds:[G3A_U09_P05F11_KP_IDS[0],G3A_U09_P05F11_KP_IDS[1]],questionCount:20});
  assert.equal(mixed.ok,false);
  assert.ok(mixed.errors.includes("P05F11_SELECTION_INVALID"));
});

test("P05F W5 Q011 proves 240 distinct variants for every PatternSpec",()=>{
  for(const patternSpecId of G3A_U09_P05F11_SPEC_IDS){
    const result=generateG3AU09P05F11Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});
    assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);
    assert.equal(result.questions.length,240);
    assert.equal(new Set(result.questions.map(row=>row.questionSignature)).size,240);
    assert.equal(result.questions.every(row=>row.patternSpecId===patternSpecId),true);
  }
});

test("P05F W5 Q011 public binding is single-KP diagram-only max-240 and keeps forbidden admissions disabled",()=>{
  for(let index=0;index<G3A_U09_P05F11_KP_IDS.length;index+=1){
    const binding=resolvePublicUiCapabilityBinding(optionsFor(index));
    assert.equal(binding.blocked,false);
    assert.equal(binding.questionType,"diagram");
    assert.deepEqual(binding.availableQuestionTypeOptions.map(row=>row.value),["diagram"]);
    assert.equal(binding.questionCount.max,240);
    assert.deepEqual(binding.compatiblePatternGroupIds,[G3A_U09_P05F11_GROUP_IDS[index]]);
    assert.deepEqual(binding.patternSpecIds,[...G3A_U09_P05F11_SPEC_IDS_BY_KP[G3A_U09_P05F11_KP_IDS[index]]]);
    assert.equal(binding.geometryDiagramRepresentationRequired,true);
    assert.equal(binding.geometryDomainValidatorRequired,true);
    assert.equal(binding.geometryPropertyReasoningRequired,true);
    assert.equal(binding.geometryConstructionRequired,index===0);
    assert.equal(binding.applicationImplementationAllowed,false);
    assert.equal(binding.circleCircumferenceFormulaAdmission,false);
    assert.equal(binding.circleAreaFormulaAdmission,false);
    assert.equal(binding.concentricConstructionAdmission,false);
    assert.equal(binding.foldLineConstructionAdmission,false);
    assert.equal(binding.mixedQuestionModeAdmission,false);
    assert.equal(binding.genericFallback,false);
    assert.equal(binding.freeFormAI,false);
  }
});

test("P05F W5 Q011 worksheet and HTML renderer preserve 24 questions, 24 answers, and source-backed diagrams for each KP",()=>{
  const expectedModes=[new Set(["COMPASS_CONSTRUCTION"]),new Set(["POINT_POSITION","TWO_CIRCLE_RELATION"]),new Set(["RADIUS_DIAMETER_MEASURE"])];
  for(let index=0;index<G3A_U09_P05F11_KP_IDS.length;index+=1){
    const result=buildBatchABrowserWorksheetDocument(optionsFor(index));
    assert.equal(result.ok,true,result.errors.join("\n"));
    const document=result.worksheetDocument;
    assert.equal(document.questionCount,24);
    assert.equal(document.answerKeyItems.length,24);
    assert.equal(document.questionPages.length,3);
    assert.equal(document.answerKeyPages.length,3);
    assert.equal(document.questionDisplayModels.every(row=>row.geometryDiagram?.kind==="circle_geometry_property_diagram"),true);
    assert.equal(document.answerKeyItems.every(row=>row.geometryDiagram?.kind==="circle_geometry_property_diagram"),true);
    const modes=new Set(document.questionDisplayModels.map(row=>row.geometryDiagram.diagramMode));
    assert.deepEqual(modes,expectedModes[index]);
    const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""});
    assert.equal(occurrences(html,'class="worksheet-circle-geometry-property-diagram"'),48);
    assert.equal(occurrences(html,'data-representation="circle-geometry-property-diagram"'),48);
    for(const term of forbidden)assert.equal(html.includes(term),false,`${G3A_U09_P05F11_KP_IDS[index]}:${term}`);
  }
});

test("P05F W5 Q011 stable browser selector/binding wrappers expose all three new leaves",async()=>{
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f11=${Date.now()}`);
    const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f11=${Date.now()}`);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,51);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,325);
    for(let index=0;index<G3A_U09_P05F11_KP_IDS.length;index+=1){
      const kp=G3A_U09_P05F11_KP_IDS[index];
      assert.equal(selector.getVisibleBatchAKnowledgePoint(kp)?.sourceId,G3A_U09_P05F11_SOURCE_ID);
      const binding=bindingModule.resolvePublicUiCapabilityBinding(optionsFor(index));
      assert.equal(binding.questionType,"diagram");
      assert.equal(binding.questionCount.max,240);
    }
  }finally{delete globalThis.document;}
});

test("P05F W5 Q011 pre-push static relative-import smoke proves every changed JS/MJS import exists",()=>{
  const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
  const files=[
    "site/modules/curriculum/registry/g3a-u09-circle-geometry-property-selector-projection-p05f11.js",
    "site/modules/curriculum/registry/batch-a-selector-p05f11-extension.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p05f11.js",
    "site/modules/curriculum/batch-a/g3a-u09-circle-geometry-property-runtime-p05f11.js",
    "site/modules/curriculum/batch-a/batch-a-browser-generator-p05f11.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f11-extension.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    "site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",
    "site/modules/renderer/circle-geometry-property-diagram.js",
    "site/modules/renderer/html-renderer.js",
    "tools/curriculum/run-p05f-w5-slice011-classic-ui-acceptance.mjs"
  ];
  const importPattern=/(?:import|export)\s+(?:[^'";]+?\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/g;
  for(const file of files){
    const absolute=path.join(root,file),text=readFileSync(absolute,"utf8");
    for(const match of text.matchAll(importPattern)){
      const target=path.resolve(path.dirname(absolute),match[1]);
      assert.equal(existsSync(target),true,`${file} -> ${match[1]}`);
    }
  }
});
