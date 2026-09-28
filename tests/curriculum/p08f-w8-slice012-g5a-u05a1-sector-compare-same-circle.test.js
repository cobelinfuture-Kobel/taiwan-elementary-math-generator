import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

import {
  G5A_U05A1_P08F12_APPLIED_MODIFIER_IDS,
  G5A_U05A1_P08F12_BLOCKING_CAPABILITY_IDS,
  G5A_U05A1_P08F12_FORMAL_MAPPING,
  G5A_U05A1_P08F12_KP_ID as KP,
  G5A_U05A1_P08F12_PATTERN_GROUP as GROUP,
  G5A_U05A1_P08F12_PATTERN_SPECS as SPECS,
  G5A_U05A1_P08F12_PRIOR_KP_IDS as PRIOR,
  G5A_U05A1_P08F12_REQUIRED_CAPABILITY_IDS,
  G5A_U05A1_P08F12_SOURCE_ID as SRC,
  G5A_U05A1_P08F12_SPEC_IDS as SPEC_IDS,
  auditG5AU05A1P08F12Projection
} from "../../site/modules/curriculum/registry/g5a-u05a1-sector-compare-same-circle-selector-projection-p08f12.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP08F12PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource
} from "../../site/modules/curriculum/registry/batch-a-selector-p08f12-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f12.js";
import {
  generateG5AU05A1P08F12Questions,
  validateG5AU05A1P08F12Answer,
  validateG5AU05A1P08F12Question
} from "../../site/modules/curriculum/batch-a/g5a-u05a1-sector-compare-same-circle-runtime-p08f12.js";
import {
  buildBatchABrowserPlan,
  generateBatchABrowserQuestions
} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderSameRadiusSectorComparisonDiagramP08F12} from "../../site/modules/renderer/same-radius-sector-comparison-diagram-p08f12.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(p,"utf8"));
const impl=read("data/curriculum/full-product/p08f/q012-g5a-u05a1-sector-compare-same-circle-implementation.json");
const impact=read("data/project/change-impact/P08F_W8_Q012.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q012.validation.json");
const preflight=read("data/curriculum/full-product/p08f/q012-g5a-u05a1-sector-compare-same-circle-source-authority-preflight.json");
const q011=read("data/curriculum/full-product/p08f/q011-final-learner-visual-d0-closeout.json");
const req=(o={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"diagram",...o});

test("W8 Q012 consumes human-accepted Q011 D0 and exact twelfth frozen queue identity",()=>{
  assert.equal(q011.status,"Q011_PASS_E6_D0_LEARNER_VISUAL_HUMAN_ACCEPTED");
  assert.equal(q011.operatorAcceptance.d0Granted,true);
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.mergeSha,"b17d62dcd408d519b084c9159a23a768c3b032bf");
  assert.equal(impl.queueAuthority.queuePosition,12);
  assert.equal(impl.queueAuthority.sliceId,"p08e_q012_r6_g5a_u05_5a05a1_profile_geometry_property_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.queueAuthority.runtimeProfileId,"profile_geometry_property");
  assert.deepEqual(impl.queueAuthority.appliedRuntimeModifierIds,[]);
});

test("W8 Q012 materializes one FormalMapping one PatternGroup and three source-bounded PatternSpecs",()=>{
  const audit=auditG5AU05A1P08F12Projection();assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.equal(G5A_U05A1_P08F12_FORMAL_MAPPING.knowledgePointId,KP);
  assert.equal(G5A_U05A1_P08F12_FORMAL_MAPPING.sourceId,SRC);
  assert.deepEqual(G5A_U05A1_P08F12_FORMAL_MAPPING.sourcePages,[1,2]);
  assert.equal(GROUP.primaryKnowledgePointId,KP);
  assert.equal(SPECS.length,3);
  assert.deepEqual(SPECS.map(x=>x.patternSpecId),[...SPEC_IDS]);
  assert.deepEqual(G5A_U05A1_P08F12_APPLIED_MODIFIER_IDS,[]);
  assert.deepEqual(G5A_U05A1_P08F12_BLOCKING_CAPABILITY_IDS,["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"]);
  assert.ok(G5A_U05A1_P08F12_REQUIRED_CAPABILITY_IDS.includes("cap_geometry_diagram_representation"));
  for(const s of SPECS){
    assert.equal(s.questionMode,"diagram");
    assert.equal(s.sameCircleOrEqualRadiusRequired,true);
    assert.equal(s.comparedSectorCentralAnglesRequired,true);
    assert.equal(s.noAreaFormulaRequired,true);
    assert.equal(s.noArcLengthFormulaRequired,true);
    assert.equal(s.noRulerMeasurementRequired,true);
    assert.equal(s.geometryConstructionAllowed,false);
  }
});

test("W8 Q012 selector promotes only same-circle comparison and preserves prior same-source owners",()=>{
  const audit=auditP08F12PublicSelectorComposition();assert.equal(audit.ok,true,audit.errors.join("\n"));
  const s=listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.ok(s.visibleKnowledgePointIds.includes(KP));
  assert.equal(s.hiddenPendingKnowledgePointIds.includes(KP),false);
  assert.equal(s.notSelectableKnowledgePointIds.includes(KP),false);
  assert.equal(s.sameSourceCandidateSetComplete,true);
  assert.equal(s.sameUnitMixedAllowed,false);
  assert.ok(getVisibleBatchAKnowledgePoint(KP));
  for(const id of PRIOR){assert.ok(s.visibleKnowledgePointIds.includes(id),id);assert.ok(getVisibleBatchAKnowledgePoint(id),id);}
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC].q012AddedKnowledgePointIds[0],KP);
});

test("W8 Q012 public binding stays same-circle comparison only and mixed modes fail closed",()=>{
  const b=resolvePublicUiCapabilityBinding(req());
  assert.equal(b.blocked,false);
  assert.equal(b.questionType,"diagram");
  assert.equal(b.questionCount.max,240);
  for(const key of ["sameCircleSectorComparisonRequired","sameCircleOrEqualRadiusRequired","comparedSectorCentralAnglesRequired","largerCentralAngleImpliesLargerArc","largerCentralAngleImpliesLargerSector","equalCentralAnglesImplyEqualSectorSize","noAreaFormulaRequired","noArcLengthFormulaRequired","noRulerMeasurementRequired"])assert.equal(b[key],true,key);
  for(const key of ["centralAngleMeasurementReownershipAllowed","combinedSectorUnknownAngleReownershipAllowed","sectorFractionOfCircleReownershipAllowed","sectorElementNamingReownershipAllowed","sectorAreaArcLengthReownershipAllowed","geometryConstructionReownershipAllowed","sameUnitMixedAdmission","crossUnitMixedAdmission"])assert.equal(b[key],false,key);
  assert.deepEqual(b.appliedRuntimeModifierIds,[]);
});

for(const patternSpecId of SPEC_IDS)test("W8 Q012 "+patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const o={selectedKnowledgePointIds:[KP],questionCount:240,patternSpecIds:[patternSpecId],generationSeed:"stable-"+patternSpecId};
  const a=generateG5AU05A1P08F12Questions(o),b=generateG5AU05A1P08F12Questions(o);
  assert.equal(a.ok,true,a.errors.join("\n"));
  assert.deepEqual(a.questions,b.questions);
  assert.equal(a.questions.length,240);
  assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){
    assert.equal(validateG5AU05A1P08F12Question(q).ok,true);
    assert.equal(validateG5AU05A1P08F12Answer(q,q.answerText).ok,true);
    const d=q.geometryDiagram;
    assert.equal(new Set(d.sectors.map(s=>s.radius)).size,1);
    assert.equal(d.rulerMeasurementRequired,false);
    assert.equal(d.printScaleIsAnswerAuthority,false);
    assert.equal(q.metadata.q013OrLaterTouched,false);
  }
});

for(const count of [1,20,120,121,240])test("W8 Q012 generates "+count+" validated questions under exact KP",()=>{
  const g=generateG5AU05A1P08F12Questions({selectedKnowledgePointIds:[KP],questionCount:count,generationSeed:"matrix-"+count});
  assert.equal(g.ok,true,g.errors.join("\n"));
  assert.equal(g.questions.length,count);
  assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,count);
  assert.ok(g.questions.every(q=>q.knowledgePointId===KP&&validateG5AU05A1P08F12Question(q).ok));
});

test("W8 Q012 relation coverage preserves same-radius sector comparison semantics",()=>{
  const qs=generateG5AU05A1P08F12Questions({selectedKnowledgePointIds:[KP],questionCount:90,generationSeed:"semantic-coverage"}).questions;
  assert.deepEqual([...new Set(qs.map(q=>q.relation))].sort(),[
    "COMPARE_SECTOR_SIZE_BY_CENTRAL_ANGLE_SAME_CIRCLE",
    "IDENTIFY_EQUAL_SECTOR_SIZE_FROM_EQUAL_CENTRAL_ANGLES",
    "ORDER_SECTORS_BY_CENTRAL_ANGLE_SAME_RADIUS"
  ].sort());
  for(const q of qs){
    const d=q.geometryDiagram;
    assert.equal(d.sameCircleOrEqualRadiusRequired,true);
    assert.equal(d.equalRadius,true);
    assert.equal(d.comparedSectorCentralAnglesRequired,true);
    assert.equal(d.largerCentralAngleImpliesLargerSector,true);
    assert.equal(d.noAreaFormulaRequired,true);
    assert.equal(d.noArcLengthFormulaRequired,true);
  }
});

test("W8 Q012 answer validator accepts supported learner formats and rejects wrong comparisons",()=>{
  const pair=generateG5AU05A1P08F12Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"answer-pair"}).questions[0];
  assert.equal(validateG5AU05A1P08F12Answer(pair,pair.answerText).ok,true);
  assert.equal(validateG5AU05A1P08F12Answer(pair,pair.answerText==="A"?"B":"A").ok,false);
  const order=generateG5AU05A1P08F12Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[1]],generationSeed:"answer-order"}).questions[0];
  assert.equal(validateG5AU05A1P08F12Answer(order,order.answerText.replaceAll(">", "＞")).ok,true);
  const equal=generateG5AU05A1P08F12Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[2]],generationSeed:"answer-equal"}).questions[0];
  assert.equal(validateG5AU05A1P08F12Answer(equal,"相等").ok,true);
  assert.equal(validateG5AU05A1P08F12Answer(equal,"A").ok,false);
});

test("W8 Q012 validator rejects unequal radii and ownership leakage",()=>{
  const q=generateG5AU05A1P08F12Questions({selectedKnowledgePointIds:[KP],questionCount:1,patternSpecIds:[SPEC_IDS[0]],generationSeed:"wrong"}).questions[0];
  assert.equal(validateG5AU05A1P08F12Question({...q,metadata:{...q.metadata,sectorFractionOfCircleReowned:true}}).ok,false);
  const sectors=q.geometryDiagram.sectors.map((s,i)=>i===1?{...s,radius:s.radius+2}:s);
  assert.equal(validateG5AU05A1P08F12Question({...q,geometryDiagram:{...q.geometryDiagram,sectors}}).ok,false);
});

test("W8 Q012 aggregate browser generator worksheet and dedicated renderer are wired",()=>{
  const p=buildBatchABrowserPlan(req({questionCount:15}));
  assert.deepEqual(p.selectedKnowledgePointIds,[KP]);
  assert.equal(p.questionCountMax,240);
  assert.equal(p.questionMode,"diagram");
  const g=generateBatchABrowserQuestions(req({questionCount:15}));
  assert.equal(g.ok,true,g.errors.join("\n"));
  assert.equal(g.questions.length,15);
  const q=g.questions[0],direct=renderSameRadiusSectorComparisonDiagramP08F12(q.geometryDiagram);
  assert.match(direct,/worksheet-same-radius-sector-comparison-diagram/);
  assert.match(direct,/data-representation="same-radius-sector-comparison-diagram"/);
  assert.match(direct,/半徑相同/);
  assert.match(direct,/不需要量尺/);
  const w=buildBatchABrowserWorksheetDocument(req({questionCount:15,includeAnswerKey:true,printLayout:{columns:3,rowsPerPage:5,showAnswerKeyPage:true}}));
  assert.equal(w.ok,true,w.errors.join("\n"));
  assert.equal(w.worksheetDocument.printOptions.columns,2);
  assert.equal(w.worksheetDocument.printOptions.rowsPerPage,3);
  assert.equal(w.worksheetDocument.questionPages.length,3);
  assert.equal(w.worksheetDocument.answerKeyPages.length,3);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
  assert.match(html,/worksheet-same-radius-sector-comparison-diagram/);
  assert.match(html,/data-representation="same-radius-sector-comparison-diagram"/);
  const learner=html.replace(/<[^>]*>/g," ");
  for(const x of ["kp_g5a_","P08F12","扇形面積公式","弧長公式","量角器","用尺作圖"])assert.equal(learner.includes(x),false,x);
});

test("W8 Q012 prior source-unit route remains available while same-unit mixed stays fail closed",()=>{
  const priorPlan=buildBatchABrowserPlan({sourceId:SRC,selectionMode:"sourceUnit",questionMode:"diagram",questionCount:8,generationSeed:"prior-owner"});
  assert.equal(priorPlan.sourceId,SRC);
  assert.equal(priorPlan.selectedKnowledgePointIds.includes(KP),false);
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[PRIOR[3],KP],questionMode:"diagram",questionCount:8});
  assert.equal(mixed.ok,false);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.changeImpact.affectedRoutes,"BOUNDED");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);
  assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
