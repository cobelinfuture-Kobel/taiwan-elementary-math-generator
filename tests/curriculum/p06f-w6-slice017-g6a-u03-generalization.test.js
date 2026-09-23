import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG6AU03P06F17Projection,G6A_U03_P06F17_GEOMETRIC_KP_ID as GEO,G6A_U03_P06F17_INPUT_OUTPUT_KP_ID as IO,G6A_U03_P06F17_LINEAR_KP_ID as LINEAR,G6A_U03_P06F17_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U03_P06F17_PATTERN_SPECS as SPECS,G6A_U03_P06F17_PREDECESSOR_KP_IDS as PREV,G6A_U03_P06F17_REMAINING_KP_IDS as REMAIN,G6A_U03_P06F17_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U03_P06F17_SOURCE_ID as SRC,G6A_U03_P06F17_TARGET_KP_IDS as KPS} from "../../site/modules/curriculum/registry/g6a-u03-generalization-selector-projection-p06f17.js";
import * as preSelector from "../../site/modules/curriculum/registry/batch-a-selector-p06f16-extension.js";
import {auditP06F17PublicSelectorComposition,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p06f17-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f17.js";
import {buildG6AU03P06F17Question,generateG6AU03P06F17Questions,validateG6AU03P06F17Answer,validateG6AU03P06F17Question} from "../../site/modules/curriculum/batch-a/g6a-u03-generalization-runtime-p06f17.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p06f/q017-g6a-u03-generalization-implementation.json");
const preflight=read("data/curriculum/full-product/p06f/q017-g6a-u03-generalization-source-authority-preflight.json");
const impact=read("data/project/change-impact/P06F_W6_Q017.impact.json");
const validation=read("data/project/validation-plans/P06F_W6_Q017.validation.json");
const request=(kp,extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[kp],questionMode:"numeric",questionCount:20,generationSeed:"p06f17-"+kp,...extra});

test("Q017 materializes exact three-KP frozen slice from merged preflight",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1005);
  assert.equal(impl.preflight.mergeSha,"02b7b12becb1d49fc3768926bff9aa2c4eb81188");
  assert.equal(impl.queueAuthority.sliceId,"p06e_q017_r7_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,KPS);
  assert.equal(impl.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(auditG6AU03P06F17Projection(),{ok:true,errors:[],counts:{knowledgePoints:3,patternGroups:3,patternSpecs:3,formalMappings:3}});
});

test("Q017 public selector promotes exact targets, preserves Q015, and keeps Q018 hidden",()=>{
  const before=preSelector.listBatchAKnowledgePointAvailabilityBySource(SRC);assert.ok(before);
  assert.ok(PREV.every(id=>before.visibleKnowledgePointIds.includes(id)));
  assert.ok(KPS.every(id=>preSelector.getVisibleBatchAKnowledgePoint(id)==null&&before.hiddenPendingKnowledgePointIds.includes(id)&&before.notSelectableKnowledgePointIds.includes(id)));
  assert.ok(REMAIN.every(id=>before.hiddenPendingKnowledgePointIds.includes(id)&&before.notSelectableKnowledgePointIds.includes(id)));
  const a=auditP06F17PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join("\n"));
  const after=listBatchAKnowledgePointAvailabilityBySource(SRC),visible=listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId);
  assert.ok(PREV.every(id=>visible.includes(id)));
  assert.ok(KPS.every(id=>visible.includes(id)&&getVisibleBatchAKnowledgePoint(id)&&!after.hiddenPendingKnowledgePointIds.includes(id)&&!after.notSelectableKnowledgePointIds.includes(id)));
  assert.ok(KPS.every(id=>resolveVisiblePatternSpecIdsForKnowledgePoint(id,"numeric").length===1));
  assert.ok(REMAIN.every(id=>!visible.includes(id)&&after.hiddenPendingKnowledgePointIds.includes(id)&&after.notSelectableKnowledgePointIds.includes(id)));
  assert.equal(after.sameUnitMixedAllowed,false);
});

test("Q017 public bindings preserve each semantic core without promoting optional symbolic reasoning",()=>{
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join("\n"));
  for(const kp of KPS){
    const b=resolvePublicUiCapabilityBinding(request(kp));
    assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
    assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);
    assert.equal(b.patternSequenceReasoningRequired,true);assert.equal(b.patternRelationValidationRequired,true);assert.equal(b.textNumericRepresentationRequired,true);
    assert.equal(b.symbolicRelationReasoningPromotedToRequired,false);assert.equal(b.symbolicRelationReasoningOptional,true);
    assert.equal(b.genericSymbolicQuantityRelationReownershipAllowed,false);assert.equal(b.relationEquationUnknownSolvingAllowed,false);
    assert.equal(b.sameUnitMixedAdmission,false);assert.equal(b.crossUnitMixedAdmission,false);assert.equal(b.frozenRuntimeProfile,"profile_pattern_relation");
  }
  assert.equal(resolvePublicUiCapabilityBinding(request(GEO)).fixedPartAndPerStageIncrementSeparated,true);
  assert.equal(resolvePublicUiCapabilityBinding(request(IO)).generalRuleExplainsAllPairsRequired,true);
  assert.equal(resolvePublicUiCapabilityBinding(request(LINEAR)).nthTermFormulaRequired,true);
});

for(const spec of SPECS)test("Q017 "+spec.patternSpecId+" has 240 deterministic unique validated variants",()=>{
  const a=generateG6AU03P06F17Questions({knowledgePointId:spec.knowledgePointId,questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  const b=generateG6AU03P06F17Questions({knowledgePointId:spec.knowledgePointId,questionCount:240,patternSpecIds:[spec.patternSpecId],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join("\n"));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){assert.equal(validateG6AU03P06F17Question(q).ok,true);assert.equal(validateG6AU03P06F17Answer(q,q.answerValue).ok,true);assert.equal(q.metadata.genericSymbolicQuantityRelationReowned,false);assert.equal(q.metadata.relationEquationUnknownSolvingUsed,false);}
});

test("Q017 validator fails closed on each semantic invariant mutation",()=>{
  const g=buildG6AU03P06F17Question({variant:17,patternSpecId:SPECS.find(x=>x.knowledgePointId===GEO).patternSpecId});
  assert.equal(validateG6AU03P06F17Answer(g,g.answerValue+1).ok,false);
  assert.equal(validateG6AU03P06F17Question({...g,patternRepresentation:{...g.patternRepresentation,fixedPart:g.patternRepresentation.fixedPart+1}}).ok,false);
  const io=buildG6AU03P06F17Question({variant:29,patternSpecId:SPECS.find(x=>x.knowledgePointId===IO).patternSpecId});
  assert.equal(validateG6AU03P06F17Question({...io,patternRepresentation:{...io.patternRepresentation,offset:io.patternRepresentation.offset+1}}).ok,false);
  const linear=buildG6AU03P06F17Question({variant:31,patternSpecId:SPECS.find(x=>x.knowledgePointId===LINEAR).patternSpecId});
  assert.equal(validateG6AU03P06F17Question({...linear,patternRepresentation:{...linear.patternRepresentation,fixedDifference:linear.patternRepresentation.fixedDifference+1}}).ok,false);
  assert.equal(validateG6AU03P06F17Question({...linear,metadata:{...linear.metadata,relationEquationUnknownSolvingUsed:true}}).ok,false);
});

test("Q017 browser and worksheet routes all three targets and preserves Q015 predecessor",()=>{
  for(const kp of KPS){
    const plan=buildBatchABrowserPlan(request(kp,{questionCount:8}));assert.deepEqual(plan.selectedKnowledgePointIds,[kp]);assert.equal(plan.questionCountMax,240);
    const g=generateBatchABrowserQuestions(request(kp,{questionCount:8}));assert.equal(g.ok,true,g.errors.join("\n"));assert.equal(g.questions.length,8);
    const w=buildBatchABrowserWorksheetDocument(request(kp,{questionCount:8,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));assert.equal(w.ok,true,w.errors.join("\n"));assert.equal(w.worksheetDocument.answerKeyItems.length,8);
    const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");
    assert.equal(visible.includes("kp_g6a_u03_"),false);assert.equal(visible.includes("ps_g6a_u03_"),false);assert.equal(visible.includes("P06F17"),false);
  }
  const q15=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[PREV[0]],questionMode:"numeric",questionCount:4,generationSeed:"q15-preserve"});
  assert.equal(q15.ok,true,q15.errors.join("\n"));assert.ok(q15.questions.every(x=>x.knowledgePointId===PREV[0]));
  const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[...PREV,...KPS],questionMode:"numeric",questionCount:4,generationSeed:"mixed-not-admitted"});
  assert.equal(mixed.ok,false);
});

test("Q017 remains reachable through the current browser successor chain while Q014-Q016 routes stay present",()=>{
  const readRepo=rel=>readFileSync(new URL("../../"+rel,import.meta.url),"utf8");
  const chainContains=(start,target,prefix)=>{
    const stack=[start],seen=new Set();
    while(stack.length){
      const rel=stack.pop();if(seen.has(rel))continue;seen.add(rel);
      const source=readRepo(rel);if(source.includes(target))return true;
      for(const match of source.matchAll(/["']\.\/([^"']+\.js)["']/g)){
        const name=match[1];if(name.startsWith(prefix)){const dir=rel.slice(0,rel.lastIndexOf("/")+1);stack.push(dir+name);}
      }
    }
    return false;
  };
  assert.equal(chainContains("site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","batch-a-selector-p06f17-extension.js","batch-a-selector-p06f"),true);
  assert.equal(chainContains("site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","public-ui-capability-binding-p06f17.js","public-ui-capability-binding-p06f"),true);
  const generator=readRepo("site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js");
  const worksheet=readRepo("site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js");
  assert.match(generator,/requestsP06F17/);assert.match(generator,/requestsP06F16/);assert.match(generator,/requestsP06F15/);assert.match(generator,/requestsP06F14/);
  assert.match(worksheet,/buildP06F17Worksheet/);assert.match(worksheet,/buildP06F16Worksheet/);assert.match(worksheet,/buildP06F15Worksheet/);assert.match(worksheet,/buildP06F14Worksheet/);
});

test("Q017 validation contract stays SHARED_RUNTIME_BOUNDED",()=>{
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.equal(validation.policyId,"UNIT_INCREMENTAL_VALIDATION_V1");
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(JSON.stringify(validation).includes("FULL_REPOSITORY"),false);assert.equal(JSON.stringify(validation).includes("GLOBAL_BROWSER_REPLAY"),false);
});
