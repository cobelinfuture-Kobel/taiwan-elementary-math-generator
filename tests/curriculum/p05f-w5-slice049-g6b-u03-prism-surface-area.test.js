import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBatchABrowserWorksheetDocument as buildQ049Worksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f49-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrentWorksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f32-extension.js";
import {requestsP05F49} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f49.js";
import {generateG6BU03P05F49Questions,validateG6BU03P05F49Question} from "../../site/modules/curriculum/batch-a/g6b-u03-prism-surface-area-runtime-p05f49.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validatePrismPyramidElementsDiagramModel} from "../../site/modules/renderer/prism-pyramid-elements-diagram.js";
import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {auditG6BU03P05F49Projection,G6B_U03_P05F49_FORMAL_MAPPING,G6B_U03_P05F49_KP_ID as KP,G6B_U03_P05F49_PATTERN_GROUP_ID as GROUP,G6B_U03_P05F49_PROTECTED_KP_IDS as PROTECTED,G6B_U03_P05F49_SOURCE_ID as SRC,G6B_U03_P05F49_SPEC_IDS as SPECS} from "../../site/modules/curriculum/registry/g6b-u03-prism-surface-area-selector-projection-p05f49.js";
import {auditP05F49PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p05f49-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f49.js";
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q049-g6b-u03-prism-surface-area-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q049-g6b-u03-prism-surface-area-implementation.json",import.meta.url),"utf8"));
const impact=JSON.parse(readFileSync(new URL("../../data/project/change-impact/P05F_W5_Q049.impact.json",import.meta.url),"utf8"));
const plan=JSON.parse(readFileSync(new URL("../../data/project/validation-plans/P05F_W5_Q049.validation.json",import.meta.url),"utf8"));
const opts=(count=24)=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],selectedPatternGroupIds:[GROUP],patternSpecIds:[...SPECS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:count,generationSeed:"p05f49-focused-prism-surface-area",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}});
const occurrences=(text,token)=>text.split(token).length-1;

test("Q049 exact frozen identity and implementation manifest remain bounded",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,49);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(implementation.taskId,"P05F_W5DirectProductVerticalSlice049Implementation");
  assert.equal(implementation.queueAuthority.sliceId,"p05e_q049_r4_g6b_u03_6b03_profile_spatial_solid_c1");
  assert.equal(implementation.runtimeContract.frozenRuntimeProfile,"profile_spatial_solid");
  for(const value of Object.values(implementation.scopeGuard)) assert.equal(value,false);
});

test("Q049 materializes one source-backed mapping, one group and three bounded PatternSpecs",()=>{
  const audit=auditG6BU03P05F49Projection();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:3,formalMappings:1});
  assert.deepEqual(G6B_U03_P05F49_FORMAL_MAPPING.sourcePages,[1,2]);
  assert.deepEqual(G6B_U03_P05F49_FORMAL_MAPPING.optionalCapabilityIds,["cap_geometry_construction"]);
  assert.equal(G6B_U03_P05F49_FORMAL_MAPPING.applicationImplementationAllowed,false);
});

test("Q049 public source and selector expose only prism surface area while protecting siblings",()=>{
  globalThis.document={};
  try{
    const units=listBatchASourceUnits();
    assert.ok(units.some(u=>u.sourceId===SRC&&u.grade===6&&u.semester==="lower"&&u.unitCode==="6B-U03"));
  }finally{delete globalThis.document;}
  const audit=auditP05F49PublicSelectorComposition();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  const source=listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.equal(source.visibleCount,1);
  assert.equal(source.hiddenPendingCount,4);
  assert.equal(source.notSelectableCount,4);
  assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(KP,"diagram"),SPECS);
  for(const id of PROTECTED){
    assert.equal(getVisibleBatchAKnowledgePoint(id),null,id);
    assert.ok(source.hiddenPendingKnowledgePointIds.includes(id),id);
    assert.ok(source.notSelectableKnowledgePointIds.includes(id),id);
  }
});

test("Q049 public binding is single-KP diagram only and mixed/source-unit selection fails closed",()=>{
  const audit=auditPublicUiCapabilityBinding();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  const b=resolvePublicUiCapabilityBinding(opts());
  assert.equal(b.blocked,false);
  assert.equal(b.questionType,"diagram");
  assert.equal(b.questionCount.max,240);
  assert.equal(b.frozenRuntimeProfile,"profile_spatial_solid");
  assert.equal(b.prismSurfaceAreaAdmission,true);
  assert.equal(b.prismVolumeAdmission,false);
  assert.equal(b.cylinderAdmission,false);
  assert.deepEqual(b.optionalCapabilityIds,["cap_geometry_construction"]);
  assert.equal(requestsP05F49(opts()),true);
  assert.equal(requestsP05F49({...opts(),selectionMode:"sourceUnit"}),false);
  assert.equal(requestsP05F49({...opts(),selectedKnowledgePointIds:[KP,PROTECTED[0]]}),false);
});

test("Q049 generates 240 deterministic variants per PatternSpec and enforces the prism surface-area invariant",()=>{
  for(const patternSpecId of SPECS){
    const a=generateG6BU03P05F49Questions({knowledgePointId:KP,patternSpecIds:[patternSpecId],questionCount:240,generationSeed:`capacity-${patternSpecId}`});
    const b=generateG6BU03P05F49Questions({knowledgePointId:KP,patternSpecIds:[patternSpecId],questionCount:240,generationSeed:`capacity-${patternSpecId}`});
    assert.equal(a.ok,true,`${patternSpecId}:${a.errors.join("\n")}`);
    assert.deepEqual(a.questions,b.questions);
    assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240,patternSpecId);
    for(const q of a.questions){
      assert.equal(validateG6BU03P05F49Question(q).ok,true,patternSpecId);
      assert.equal(validatePrismPyramidElementsDiagramModel(q.geometryDiagram).ok,true,`${patternSpecId}:${q.geometryDiagram.variant}`);
      const d=q.geometryDiagram;
      assert.equal(d.solidKind,"PRISM");
      assert.equal(d.surfaceArea,2*d.baseArea+d.basePerimeter*d.prismLength);
      assert.equal(d.lateralNetWidth,d.basePerimeter);
      assert.equal(d.countEachExteriorFaceExactlyOnce,true);
      assert.equal(d.lateralNetWidthEqualsBasePerimeter,true);
    }
  }
});

test("Q049 validator fails closed on formula, net-width, geometry and provenance tampering",()=>{
  const q=generateG6BU03P05F49Questions({...opts(1),patternSpecIds:[SPECS[0]]}).questions[0];
  for(const mutate of [
    x=>x.answerValue+=1,
    x=>x.geometryDiagram.surfaceArea+=1,
    x=>x.geometryDiagram.lateralNetWidth+=1,
    x=>x.geometryDiagram.taskMode="IDENTIFY_EDGE",
    x=>x.metadata.cylinderTouched=true,
  ]){
    const t=JSON.parse(JSON.stringify(q));mutate(t);assert.equal(validateG6BU03P05F49Question(t).ok,false);
  }
});

test("Q049 worksheet renders questions and answers through the shared prism renderer without internal ids",()=>{
  const r=buildQ049Worksheet(opts(16));
  assert.equal(r.ok,true,r.errors.join("\n"));
  assert.equal(r.worksheetDocument.questionCount,16);
  assert.equal(r.worksheetDocument.answerKeyItems.length,16);
  const html=renderWorksheetDocumentToHtml(r.worksheetDocument,{stylesheetHref:"",title:r.worksheetDocument.title,debugDataAttributes:false});
  assert.equal(occurrences(html,'data-representation="prism-pyramid-elements-diagram"'),32);
  assert.equal(html.includes("kp_g6b_u03_"),false);
  assert.equal(html.includes("ps_g6b_u03_"),false);
});

test("Q049 current top-slot selector, binding and worksheet bridges reach the new 6B-U03 target",async()=>{
  const r=buildCurrentWorksheet(opts(8));
  assert.equal(r.ok,true,r.errors.join("\n"));
  assert.equal(r.p05f49Implemented,true);
  assert.equal(r.worksheetDocument.metadata.knowledgePointId,KP);
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f49=${Date.now()}`);
    const binding=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f49=${Date.now()}`);
    assert.equal(selector.getVisibleBatchAKnowledgePoint(KP)?.sourceId,SRC);
    assert.equal(binding.resolvePublicUiCapabilityBinding(opts()).prismSurfaceAreaAdmission,true);
    for(const id of PROTECTED) assert.equal(selector.getVisibleBatchAKnowledgePoint(id),null,id);
  }finally{delete globalThis.document;}
});

test("Q049 validation policy stays SHARED_RUNTIME_BOUNDED without full regression or global replay",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged,false);
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[0].kind,"NODE_TEST");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"PLAYWRIGHT_CHROMIUM");
  assert.equal(implementation.validation.fullRepositoryRegression,"FORBIDDEN");
  assert.equal(implementation.validation.globalBrowserReplay,"FORBIDDEN");
});
