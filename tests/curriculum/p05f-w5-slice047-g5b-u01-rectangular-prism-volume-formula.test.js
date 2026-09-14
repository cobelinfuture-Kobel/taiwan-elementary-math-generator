import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBatchABrowserWorksheetDocument as buildQ047Worksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f47-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrentWorksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f32-extension.js";
import {requestsP05F47} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f47.js";
import {generateG5BU01P05F47Questions,validateG5BU01P05F47Question} from "../../site/modules/curriculum/batch-a/g5b-u01-rectangular-prism-volume-formula-runtime-p05f47.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validateLayeredCubeVolumeDiagramModel} from "../../site/modules/renderer/cubic-centimeter-unit-diagram.js";
import {auditG5BU01P05F47Projection,G5B_U01_P05F47_FORMAL_MAPPING,G5B_U01_P05F47_KP_ID,G5B_U01_P05F47_PATTERN_GROUP_ID,G5B_U01_P05F47_SOURCE_ID,G5B_U01_P05F47_SPEC_IDS,G5B_U01_P05F47_REMAINING_FUTURE_KP_IDS} from "../../site/modules/curriculum/registry/g5b-u01-rectangular-prism-volume-formula-selector-projection-p05f47.js";
import {auditP05F47PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p05f46-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f46.js";
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q047-g5b-u01-rectangular-prism-volume-formula-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q047-g5b-u01-rectangular-prism-volume-formula-implementation.json",import.meta.url),"utf8"));
const Q019="kp_g5b_u01_volume_unit_conversion";
const opts=(count=24)=>({sourceId:G5B_U01_P05F47_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5B_U01_P05F47_KP_ID],selectedPatternGroupIds:[G5B_U01_P05F47_PATTERN_GROUP_ID],patternSpecIds:[...G5B_U01_P05F47_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:count,generationSeed:"p05f47-focused-prism-volume",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}});
const occurrences=(text,token)=>text.split(token).length-1;

test("Q047 exact preflight and implementation identities remain frozen",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,47);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G5B_U01_P05F47_KP_ID]);
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(implementation.taskId,"P05F_W5DirectProductVerticalSlice047Implementation");
  assert.equal(implementation.queueAuthority.sliceId,"p05e_q047_r4_g5b_u01_5b01_profile_spatial_solid_c1");
  assert.equal(implementation.preflightMergeSha,"53dbce21af989bfa90231e3ca85a43d4ef2cf63f");
  assert.equal(implementation.scopeGuard.q019VolumeUnitConversionReowned,false);
  assert.equal(implementation.scopeGuard.q048OrLaterTouched,false);
});

test("Q047 materializes one mapping one group and four bounded PatternSpecs",()=>{
  const audit=auditG5BU01P05F47Projection();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,diagram:4,application:0});
  assert.equal(G5B_U01_P05F47_FORMAL_MAPPING.mappingId,"fm_g5b_u01_rectangular_prism_volume_formula_p05f47");
  assert.deepEqual(G5B_U01_P05F47_FORMAL_MAPPING.includedRelations,preflight.q047ScopeLock.includedRelations);
  assert.deepEqual(G5B_U01_P05F47_FORMAL_MAPPING.optionalCapabilityIds,["cap_geometry_construction"]);
});

test("Q047 selector promotes only rectangular-prism formula and preserves Q019 plus future siblings",()=>{
  const audit=auditP05F47PublicSelectorComposition();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  const source=listBatchAKnowledgePointAvailabilityBySource(G5B_U01_P05F47_SOURCE_ID);
  assert.equal(source.visibleCount,2);
  assert.equal(source.hiddenPendingCount,3);
  assert.equal(source.notSelectableCount,3);
  for(const id of [Q019,G5B_U01_P05F47_KP_ID]) assert.ok(getVisibleBatchAKnowledgePoint(id),id);
  for(const id of G5B_U01_P05F47_REMAINING_FUTURE_KP_IDS){
    assert.equal(getVisibleBatchAKnowledgePoint(id),null,id);
    assert.ok(source.hiddenPendingKnowledgePointIds.includes(id),id);
    assert.ok(source.notSelectableKnowledgePointIds.includes(id),id);
  }
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G5B_U01_P05F47_KP_ID,"diagram"),G5B_U01_P05F47_SPEC_IDS);
});

test("Q047 public binding is single-KP only and explicit multi-KP fails closed",()=>{
  const audit=auditPublicUiCapabilityBinding();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  const b=resolvePublicUiCapabilityBinding(opts());
  assert.equal(b.blocked,false);
  assert.equal(b.questionType,"diagram");
  assert.equal(b.questionCount.max,240);
  assert.equal(b.rectangularPrismVolumeFormulaTarget,true);
  assert.deepEqual(b.optionalCapabilityIds,["cap_geometry_construction"]);
  assert.equal(b.volumeUnitConversionReowned,false);
  assert.equal(b.cubeVolumeFormulaAdmission,false);
  assert.equal(b.compositeRectangularVolumeAdmission,false);
  assert.equal(b.unknownDimensionAdmission,false);
  const multi={...opts(),selectedKnowledgePointIds:[G5B_U01_P05F47_KP_ID,Q019]};
  assert.equal(requestsP05F47(multi),false);
  assert.notEqual(resolvePublicUiCapabilityBinding(multi).rectangularPrismVolumeFormulaTarget,true);
});

test("Q047 generates deterministic source-backed formula questions",()=>{
  const a=generateG5BU01P05F47Questions(opts(24)),b=generateG5BU01P05F47Questions(opts(24));
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(a.questions.length,24);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,24);
  for(const q of a.questions){
    assert.equal(validateG5BU01P05F47Question(q).ok,true);
    assert.equal(validateLayeredCubeVolumeDiagramModel(q.geometryDiagram).ok,true);
    assert.equal(q.answerValue,q.geometryDiagram.length*q.geometryDiagram.width*q.geometryDiagram.height);
    assert.equal(q.geometryDiagram.layerCubeCount,q.geometryDiagram.length*q.geometryDiagram.width);
    assert.equal(q.geometryDiagram.totalCubeCount,q.geometryDiagram.layerCubeCount*q.geometryDiagram.height);
    assert.equal(q.metadata.q019VolumeUnitConversionReowned,false);
    assert.equal(q.metadata.q052CubeVolumeFormulaTouched,false);
    assert.equal(q.metadata.q052CompositeRectangularVolumeTouched,false);
    assert.equal(q.metadata.q058VolumeUnknownDimensionTouched,false);
    assert.equal(q.metadata.q048OrLaterTouched,false);
  }
});

test("Q047 proves 240 deterministic variants for every PatternSpec and shared renderer contract",()=>{
  for(const patternSpecId of G5B_U01_P05F47_SPEC_IDS){
    const r=generateG5BU01P05F47Questions({knowledgePointId:G5B_U01_P05F47_KP_ID,questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});
    assert.equal(r.ok,true,`${patternSpecId}:${r.errors.join("\n")}`);
    assert.equal(r.questions.length,240);
    assert.equal(new Set(r.questions.map(q=>q.questionSignature)).size,240);
    for(const q of r.questions) assert.equal(validateLayeredCubeVolumeDiagramModel(q.geometryDiagram).ok,true,`${patternSpecId}:${q.geometryDiagram.variantIndex}:${q.geometryDiagram.shiftX}`);
  }
});

test("Q047 validator fails closed on geometry answer and provenance tampering",()=>{
  const q=generateG5BU01P05F47Questions({...opts(1),patternSpecIds:[G5B_U01_P05F47_SPEC_IDS[0]]}).questions[0];
  for(const mutate of [x=>x.geometryDiagram.length+=1,x=>x.answerValue+=1,x=>x.geometryDiagram.arrangements[0].cubes.pop(),x=>x.metadata.q019VolumeUnitConversionReowned=true]){
    const t=JSON.parse(JSON.stringify(q));mutate(t);assert.equal(validateG5BU01P05F47Question(t).ok,false);
  }
});

test("Q047 worksheet reuses layered unit-cube renderer for questions and answers",()=>{
  const r=buildQ047Worksheet(opts(16));
  assert.equal(r.ok,true,r.errors.join("\n"));
  assert.equal(r.worksheetDocument.questionCount,16);
  assert.equal(r.worksheetDocument.answerKeyItems.length,16);
  const html=renderWorksheetDocumentToHtml(r.worksheetDocument,{stylesheetHref:"",title:r.worksheetDocument.title,debugDataAttributes:false});
  assert.equal(occurrences(html,'data-representation="layered-cube-volume-diagram"'),32);
  assert.equal(html.includes("kp_g5b_u01_"),false);
  assert.equal(html.includes("ps_g5b_u01_"),false);
});

test("Q047 current top-slot bridge reaches rectangular-prism formula worksheet",()=>{
  const r=buildCurrentWorksheet(opts(8));
  assert.equal(r.ok,true,r.errors.join("\n"));
  assert.equal(r.p05f47Implemented,true);
  assert.equal(r.worksheetDocument.metadata.knowledgePointId,G5B_U01_P05F47_KP_ID);
});

test("Q047 browser current selector and binding wrappers expose target without future leakage",async()=>{
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f47=${Date.now()}`);
    const binding=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f47=${Date.now()}`);
    assert.equal(selector.getVisibleBatchAKnowledgePoint(G5B_U01_P05F47_KP_ID)?.sourceId,G5B_U01_P05F47_SOURCE_ID);
    assert.equal(binding.resolvePublicUiCapabilityBinding(opts()).rectangularPrismVolumeFormulaTarget,true);
    assert.ok(selector.getVisibleBatchAKnowledgePoint(Q019));
    for(const id of G5B_U01_P05F47_REMAINING_FUTURE_KP_IDS) assert.equal(selector.getVisibleBatchAKnowledgePoint(id),null,id);
  }finally{delete globalThis.document;}
});
