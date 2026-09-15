import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBatchABrowserWorksheetDocument as buildQ048Worksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f48-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrentWorksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f32-extension.js";
import {requestsP05F48} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f48.js";
import {generateG5BU07P05F48Questions,validateG5BU07P05F48Question} from "../../site/modules/curriculum/batch-a/g5b-u07-cube-cuboid-surface-area-runtime-p05f48.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validateLayeredCubeVolumeDiagramModel} from "../../site/modules/renderer/cubic-centimeter-unit-diagram.js";
import {auditG5BU07P05F48Projection,G5B_U07_P05F48_FORMAL_MAPPINGS,G5B_U07_P05F48_FUTURE_KP_IDS,G5B_U07_P05F48_GROUP_BY_KP,G5B_U07_P05F48_KP_IDS,G5B_U07_P05F48_SOURCE_ID,G5B_U07_P05F48_SPECS_BY_KP} from "../../site/modules/curriculum/registry/g5b-u07-cube-cuboid-surface-area-selector-projection-p05f48.js";
import {auditP05F48PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p05f48-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f48.js";
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q048-g5b-u07-cube-cuboid-surface-area-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q048-g5b-u07-cube-cuboid-surface-area-implementation.json",import.meta.url),"utf8"));
const impact=JSON.parse(readFileSync(new URL("../../data/project/change-impact/P05F_W5_Q048.impact.json",import.meta.url),"utf8"));
const plan=JSON.parse(readFileSync(new URL("../../data/project/validation-plans/P05F_W5_Q048.validation.json",import.meta.url),"utf8"));
const Q040="kp_g5b_u07_surface_area_from_net",[CUBE,CUBOID]=G5B_U07_P05F48_KP_IDS;
const opts=(kp,count=24)=>({sourceId:G5B_U07_P05F48_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],selectedPatternGroupIds:[G5B_U07_P05F48_GROUP_BY_KP[kp]],patternSpecIds:[...G5B_U07_P05F48_SPECS_BY_KP[kp]],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:count,generationSeed:`p05f48-focused-${kp}`,includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}});
const occurrences=(text,token)=>text.split(token).length-1;

test("Q048 exact frozen identity and implementation manifest remain bounded",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,48);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,G5B_U07_P05F48_KP_IDS);
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(implementation.taskId,"P05F_W5DirectProductVerticalSlice048Implementation");
  assert.equal(implementation.queueAuthority.sliceId,"p05e_q048_r4_g5b_u07_5b07_profile_spatial_solid_c1");
  assert.equal(implementation.runtimeContract.frozenRuntimeProfile,"profile_spatial_solid");
  for(const value of Object.values(implementation.scopeGuard)) assert.equal(value,false);
});

test("Q048 materializes two mappings, two groups and six source-backed PatternSpecs",()=>{
  const audit=auditG5BU07P05F48Projection();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{knowledgePoints:2,patternGroups:2,patternSpecs:6,formalMappings:2});
  assert.equal(G5B_U07_P05F48_FORMAL_MAPPINGS.length,2);
  for(const mapping of G5B_U07_P05F48_FORMAL_MAPPINGS){
    assert.deepEqual(mapping.sourcePages,[1,2]);
    assert.deepEqual(mapping.optionalCapabilityIds,["cap_geometry_construction"]);
    assert.equal(mapping.applicationImplementationAllowed,false);
  }
});

test("Q048 selector promotes only cube and cuboid formulas while preserving Q040 and future ownership",()=>{
  const audit=auditP05F48PublicSelectorComposition();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  const source=listBatchAKnowledgePointAvailabilityBySource(G5B_U07_P05F48_SOURCE_ID);
  assert.equal(source.visibleCount,3);
  assert.equal(source.hiddenPendingCount,2);
  assert.equal(source.notSelectableCount,2);
  for(const id of [Q040,...G5B_U07_P05F48_KP_IDS]) assert.ok(getVisibleBatchAKnowledgePoint(id),id);
  for(const id of G5B_U07_P05F48_FUTURE_KP_IDS){
    assert.equal(getVisibleBatchAKnowledgePoint(id),null,id);
    assert.ok(source.hiddenPendingKnowledgePointIds.includes(id),id);
    assert.ok(source.notSelectableKnowledgePointIds.includes(id),id);
  }
  for(const kp of G5B_U07_P05F48_KP_IDS) assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(kp,"diagram"),G5B_U07_P05F48_SPECS_BY_KP[kp]);
});

test("Q048 public binding is single-KP diagram only and explicit mixed selection fails closed",()=>{
  const audit=auditPublicUiCapabilityBinding();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  for(const kp of G5B_U07_P05F48_KP_IDS){
    const b=resolvePublicUiCapabilityBinding(opts(kp));
    assert.equal(b.blocked,false);
    assert.equal(b.questionType,"diagram");
    assert.equal(b.questionCount.max,240);
    assert.equal(b.frozenRuntimeProfile,"profile_spatial_solid");
    assert.deepEqual(b.optionalCapabilityIds,["cap_geometry_construction"]);
    assert.equal(b.surfaceAreaFromNetReowned,false);
    assert.equal(b.compositeHiddenFacesAdmission,false);
    assert.equal(b.unknownDimensionAdmission,false);
    assert.equal(requestsP05F48(opts(kp)),true);
  }
  const mixed={...opts(CUBE),selectedKnowledgePointIds:[CUBE,CUBOID]};
  assert.equal(requestsP05F48(mixed),false);
  assert.notEqual(resolvePublicUiCapabilityBinding(mixed).cubeSurfaceAreaAdmission,true);
  assert.notEqual(resolvePublicUiCapabilityBinding(mixed).cuboidSurfaceAreaAdmission,true);
});

test("Q048 generates 240 deterministic variants per PatternSpec and satisfies the shared renderer contract",()=>{
  for(const kp of G5B_U07_P05F48_KP_IDS){
    for(const patternSpecId of G5B_U07_P05F48_SPECS_BY_KP[kp]){
      const a=generateG5BU07P05F48Questions({knowledgePointId:kp,patternSpecIds:[patternSpecId],questionCount:240,generationSeed:`capacity-${patternSpecId}`});
      const b=generateG5BU07P05F48Questions({knowledgePointId:kp,patternSpecIds:[patternSpecId],questionCount:240,generationSeed:`capacity-${patternSpecId}`});
      assert.equal(a.ok,true,`${patternSpecId}:${a.errors.join("\n")}`);
      assert.deepEqual(a.questions,b.questions);
      assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240,patternSpecId);
      for(const q of a.questions){
        assert.equal(validateG5BU07P05F48Question(q).ok,true,patternSpecId);
        assert.equal(validateLayeredCubeVolumeDiagramModel(q.geometryDiagram).ok,true,`${patternSpecId}:${q.geometryDiagram.variantIndex}`);
        assert.equal(q.geometryDiagram.diagramMode,"EQUAL_LAYER_COUNT");
        assert.equal(q.geometryDiagram.q048DiagramMode,q.task);
        assert.equal(q.geometryDiagram.surfaceAreaModel,true);
        if(kp===CUBE) assert.equal(q.answerValue,6*q.geometryDiagram.edge*q.geometryDiagram.edge);
        else assert.equal(q.answerValue,2*(q.geometryDiagram.faceAreas.lw+q.geometryDiagram.faceAreas.lh+q.geometryDiagram.faceAreas.wh));
      }
    }
  }
});

test("Q048 validator fails closed on formula, renderer-model and provenance tampering",()=>{
  const q=generateG5BU07P05F48Questions({...opts(CUBOID,1),patternSpecIds:[G5B_U07_P05F48_SPECS_BY_KP[CUBOID][0]]}).questions[0];
  for(const mutate of [x=>x.answerValue+=1,x=>x.geometryDiagram.diagramMode="DIRECT_SURFACE_AREA_FORMULA",x=>x.geometryDiagram.surfaceArea+=1,x=>x.metadata.q054CompositeHiddenFacesTouched=true]){
    const t=JSON.parse(JSON.stringify(q));mutate(t);assert.equal(validateG5BU07P05F48Question(t).ok,false);
  }
});

test("Q048 worksheet renders both surface-area KPs through the shared layered solid renderer",()=>{
  for(const kp of G5B_U07_P05F48_KP_IDS){
    const r=buildQ048Worksheet(opts(kp,16));
    assert.equal(r.ok,true,r.errors.join("\n"));
    assert.equal(r.worksheetDocument.questionCount,16);
    assert.equal(r.worksheetDocument.answerKeyItems.length,16);
    const html=renderWorksheetDocumentToHtml(r.worksheetDocument,{stylesheetHref:"",title:r.worksheetDocument.title,debugDataAttributes:false});
    assert.equal(occurrences(html,'data-representation="layered-cube-volume-diagram"'),32);
    assert.equal(html.includes("kp_g5b_u07_"),false);
    assert.equal(html.includes("ps_g5b_u07_"),false);
  }
});

test("Q048 current top-slot selector, binding and worksheet bridges reach the two new targets",async()=>{
  for(const kp of G5B_U07_P05F48_KP_IDS){
    const r=buildCurrentWorksheet(opts(kp,8));
    assert.equal(r.ok,true,r.errors.join("\n"));
    assert.equal(r.p05f48Implemented,true);
    assert.equal(r.worksheetDocument.metadata.knowledgePointId,kp);
  }
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f48=${Date.now()}`);
    const binding=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f48=${Date.now()}`);
    for(const kp of G5B_U07_P05F48_KP_IDS){
      assert.equal(selector.getVisibleBatchAKnowledgePoint(kp)?.sourceId,G5B_U07_P05F48_SOURCE_ID);
      const b=binding.resolvePublicUiCapabilityBinding(opts(kp));
      assert.equal(b.cubeSurfaceAreaAdmission,kp===CUBE);
      assert.equal(b.cuboidSurfaceAreaAdmission,kp===CUBOID);
    }
    assert.ok(selector.getVisibleBatchAKnowledgePoint(Q040));
    for(const id of G5B_U07_P05F48_FUTURE_KP_IDS) assert.equal(selector.getVisibleBatchAKnowledgePoint(id),null,id);
  }finally{delete globalThis.document;}
});

test("Q048 validation policy stays SHARED_RUNTIME_BOUNDED without full regression or global replay",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged,false);
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[0].kind,"NODE_TEST");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"PLAYWRIGHT_CHROMIUM");
  assert.equal(implementation.validation.fullRepositoryRegression,"FORBIDDEN");
  assert.equal(implementation.validation.globalBrowserReplay,"FORBIDDEN");
});
