import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  auditG6AU06P08F17Projection,
  G6A_U06_P08F17_FORMAL_MAPPING as MAP,
  G6A_U06_P08F17_KP_ID as KP,
  G6A_U06_P08F17_PATTERN_GROUP as GROUP,
  G6A_U06_P08F17_PATTERN_SPECS as SPECS,
  G6A_U06_P08F17_PRIOR_KP_IDS as PRIOR,
  G6A_U06_P08F17_SOURCE_ID as SRC,
  G6A_U06_P08F17_SPEC_IDS as SPEC_IDS
} from "../../site/modules/curriculum/registry/g6a-u06-composite-arc-perimeter-selector-projection-p08f17.js";
import {generateG6AU06P08F17Questions,validateG6AU06P08F17Question,validateG6AU06P08F17Answer} from "../../site/modules/curriculum/batch-a/g6a-u06-composite-arc-perimeter-runtime-p08f17.js";
import {requestsP08F17,buildBatchABrowserPlan} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p08f17.js";
import {buildBatchABrowserWorksheetDocument as buildQ017} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f17-extension.js";
import {buildBatchABrowserWorksheetDocument as buildCurrent} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const implementation=read("data/curriculum/full-product/p08f/q017-g6a-u06-composite-arc-perimeter-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q017-g6a-u06-composite-arc-perimeter-source-authority-preflight.json");
const impact=read("data/project/change-impact/P08F_W8_Q017.impact.json");
const plan=read("data/project/validation-plans/P08F_W8_Q017.validation.json");
const req=(count=16)=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],selectedPatternGroupIds:[GROUP.patternGroupId],patternSpecIds:SPEC_IDS,questionMode:"diagram",requestedQuestionType:"diagram",questionCount:count,generationSeed:"p08f17-test",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:3,showAnswerKeyPage:true}});
const occ=(s,t)=>s.split(t).length-1;

test("Q017 materializes exact preflight mapping and four composite-boundary PatternSpecs",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(implementation.preflight.mergeSha,"604737528f0d490387b5c81f95bc1e4618bf8e02");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,17);
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(MAP.r04MappingId,"r04map_g6a_u06_composite_arc_perimeter");
  assert.equal(MAP.semanticCore,"SUM_ONLY_EXTERNALLY_EXPOSED_STRAIGHT_SEGMENTS_AND_CIRCULAR_ARCS_TO_OBTAIN_COMPOSITE_PERIMETER");
  assert.equal(MAP.externalBoundaryOnlyRequired,true);
  assert.equal(MAP.internalOrSharedEdgesExcluded,true);
  assert.deepEqual(MAP.appliedRuntimeModifierIds,[]);
  assert.equal(auditG6AU06P08F17Projection().ok,true);
  assert.equal(SPECS.length,4);
  assert.equal(new Set(SPEC_IDS).size,4);
  assert.equal(requestsP08F17(req()),true);
  assert.equal(requestsP08F17({...req(),selectionMode:"sourceUnit"}),false);
  assert.equal(requestsP08F17({...req(),selectedKnowledgePointIds:[KP,PRIOR[0]]}),false);
  const p=buildBatchABrowserPlan(req());
  assert.equal(p.questionCountMax,240);
  assert.equal(p.genericFallback,false);
});

test("Q017 every PatternSpec yields 240 deterministic distinct valid variants",()=>{
  for(const id of SPEC_IDS){
    const a=generateG6AU06P08F17Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:id});
    const b=generateG6AU06P08F17Questions({knowledgePointId:KP,patternSpecIds:[id],questionCount:240,generationSeed:id});
    assert.equal(a.ok,true,id+":"+a.errors.join("\n"));
    assert.deepEqual(a.questions,b.questions);
    assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
    assert.ok(a.questions.every(q=>validateG6AU06P08F17Question(q).ok));
    const t=JSON.parse(JSON.stringify(a.questions[0]));t.answerText="999 公分";
    assert.equal(validateG6AU06P08F17Question(t).ok,false);
    assert.equal(validateG6AU06P08F17Answer(a.questions[0],a.questions[0].answerText).ok,true);
  }
});

test("Q017 sums only external straight and arc boundary parts without reowning prerequisites",()=>{
  const r=generateG6AU06P08F17Questions({knowledgePointId:KP,questionCount:240,generationSeed:"q017-semantics"});
  assert.equal(r.ok,true,r.errors.join("\n"));
  const modes=new Set();
  let internalExclusionCases=0;
  for(const q of r.questions){
    const p=q.patternRepresentation;modes.add(p.shapeMode);
    assert.equal(p.externalBoundaryOnly,true);
    assert.equal(p.internalSharedEdgesExcluded,true);
    assert.ok(p.arcLength>0&&p.straightTotal>0&&p.totalPerimeter>0);
    assert.equal(Number((p.arcLength+p.straightTotal).toFixed(2)),p.totalPerimeter);
    assert.equal(p.boundaryReconstructionMatches,true);
    assert.ok(p.boundaryParts.some(x=>x.kind==="arc"));
    assert.ok(p.boundaryParts.some(x=>x.kind==="straight"));
    if(p.omittedInternalParts.length)internalExclusionCases++;
    assert.equal(q.geometryDiagram.semanticRole,"COMPOSITE_ARC_PERIMETER");
    assert.equal(q.metadata.q004PiCircumferenceRelationTeachingReowned,false);
    assert.equal(q.metadata.q006CircleCircumferenceFormulaTeachingReowned,false);
    assert.equal(q.metadata.q010SemicirclePerimeterTeachingReowned,false);
    assert.equal(q.metadata.q015SectorArcLengthTeachingReowned,false);
    assert.equal(q.metadata.sectorAreaUsed,false);
    assert.equal(q.metadata.compositeCircleAreaUsed,false);
  }
  assert.deepEqual(modes,new Set(["SECTOR","STADIUM","RECT_SEMICIRCLE","DOUBLE_BUMP"]));
  assert.ok(internalExclusionCases>0);
});

test("Q017 worksheet current bridge selector answer and print representation stay learner-facing",async()=>{
  const r=buildQ017(req(16));
  assert.equal(r.ok,true,r.errors.join("\n"));
  assert.equal(r.worksheetDocument.questionCount,16);
  assert.equal(r.worksheetDocument.answerKeyItems.length,16);
  const html=renderWorksheetDocumentToHtml(r.worksheetDocument,{stylesheetHref:"",title:r.worksheetDocument.title,debugDataAttributes:false});
  assert.equal(occ(html,'data-representation="composite-arc-perimeter-diagram"'),32);
  assert.equal(html.includes("kp_g6a_u06_"),false);
  assert.equal(html.includes("ps_g6a_u06_"),false);
  const current=buildCurrent(req(8));
  assert.equal(current.ok,true,current.errors.join("\n"));
  assert.equal(current.p08f17Implemented,true);
  assert.equal(current.worksheetDocument.metadata.knowledgePointId,KP);
  globalThis.document={};
  try{
    const selector=await import("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p08f17="+Date.now());
    const binding=await import("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p08f17="+Date.now());
    for(const id of [...PRIOR,KP])assert.equal(selector.getVisibleBatchAKnowledgePoint(id)?.sourceId,SRC,id);
    const b=binding.resolvePublicUiCapabilityBinding(req());
    assert.equal(b.compositeArcPerimeterRequired,true);
    assert.equal(b.externalBoundaryOnlyRequired,true);
    assert.equal(b.internalSharedEdgesExcluded,true);
    assert.deepEqual(b.appliedRuntimeModifierIds,[]);
  }finally{delete globalThis.document;}
});

test("Q017 bounded validation and ownership guards remain closed",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.equal(impact.changeImpact.legalRouteSemanticsChanged,false);
  assert.equal(plan.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[0].kind,"NODE_TEST");
  assert.equal(plan.lanes.SHARED_RUNTIME_BOUNDED[1].runtime,"PLAYWRIGHT_CHROMIUM");
  assert.deepEqual(plan.forbidden,["FULL_NODE_REGRESSION","GLOBAL_BROWSER_REPLAY"]);
  for(const v of Object.values(implementation.ownershipGuard))assert.equal(v,false);
});
