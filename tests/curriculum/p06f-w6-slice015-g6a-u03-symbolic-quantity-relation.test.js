import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditG6AU03P06F15Projection,G6A_U03_P06F15_FUTURE_KP_IDS as FUTURE,G6A_U03_P06F15_KP_ID as KP,G6A_U03_P06F15_OPTIONAL_CAPABILITY_IDS as OPTIONAL,G6A_U03_P06F15_PATTERN_SPECS as SPECS,G6A_U03_P06F15_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U03_P06F15_SOURCE_ID as SRC,G6A_U03_P06F15_SPEC_IDS as SPEC_IDS} from "../../site/modules/curriculum/registry/g6a-u03-symbolic-quantity-relation-selector-projection-p06f15.js";
import {buildG6AU03P06F15Question,generateG6AU03P06F15Questions,validateG6AU03P06F15Question} from "../../site/modules/curriculum/batch-a/g6a-u03-symbolic-quantity-relation-runtime-p06f15.js";
import {auditP06F15PublicSelectorComposition,BATCH_A_SELECTOR_AVAILABILITY,getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p06f15-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p06f15.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p06f15.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p06f15-extension.js";
import {getBatchASourceUnit,listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const impl=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q015-g6a-u03-symbolic-quantity-relation-implementation.json",import.meta.url),"utf8"));
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p06f/q015-g6a-u03-symbolic-quantity-relation-source-authority-preflight.json",import.meta.url),"utf8"));

test("Q015 implementation preserves exact preflight queue source and semantic boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.preflight.prNumber,1001);
  assert.equal(impl.queueAuthority.sliceId,"p06e_q015_r6_g6a_u03_6a03_profile_pattern_relation_c1");
  assert.deepEqual(impl.queueAuthority.knowledgePointIds,[KP]);
  assert.equal(impl.sourceAuthority.reviewMethod,"FULL_PAGE_VISUAL_READBACK");
  assert.deepEqual(impl.sourceAuthority.targetEvidencePages,[1]);
  assert.equal(impl.semanticProfileLock.symbolicQuantityRelationRepresentationIsCore,true);
  assert.equal(impl.semanticProfileLock.symbolicRelationReasoningPromotedToRequired,false);
  assert.equal(impl.semanticProfileLock.relationEquationUnknownSolvingUsed,false);
});
test("Q015 FormalMapping and two PatternSpecs stay inside frozen profile_pattern_relation",()=>{
  const a=auditG6AU03P06F15Projection();assert.equal(a.ok,true,a.errors.join(","));
  assert.equal(a.counts.formalMappings,1);assert.equal(a.counts.patternSpecs,2);
  assert.deepEqual(REQUIRED,["cap_pattern_sequence_reasoning","cap_pattern_relation_validator","cap_text_numeric_representation"]);
  assert.deepEqual(OPTIONAL,["cap_symbolic_relation_reasoning"]);
  assert.ok(SPECS.every(x=>x.semanticCore==="SYMBOLIC_QUANTITY_RELATION_REPRESENTATION"&&x.sameSymbolFixedWithinProblem&&x.operationRelationMustBePreserved&&!x.symbolicRelationReasoningRequired&&x.symbolicRelationReasoningOptional&&!x.relationEquationUnknownSolvingAllowed&&!x.inputOutputGeneralRuleAllowed&&!x.geometricCountGeneralizationAllowed&&!x.linearNthTermAllowed&&!x.applicationAllowed&&!x.sameUnitMixedAllowed&&!x.crossUnitMixedAllowed));
});
test("Q015 each PatternSpec supports 240 deterministic unique validated variants",()=>{
  for(const patternSpecId of SPEC_IDS){
    const qs=Array.from({length:240},(_,variant)=>buildG6AU03P06F15Question({patternSpecId,variant,generationSeed:"capacity"}));
    assert.equal(new Set(qs.map(q=>q.questionSignature)).size,240,patternSpecId);
    for(const q of qs){const v=validateG6AU03P06F15Question(q);assert.equal(v.ok,true,v.errors.join(","));assert.ok(q.promptText.includes(q.patternRepresentation.symbol));assert.ok(q.patternRepresentation.relationExpression.includes(q.patternRepresentation.symbol));}
  }
});
test("Q015 validator rejects operation or fixed-symbol tampering",()=>{
  const q=JSON.parse(JSON.stringify(buildG6AU03P06F15Question({patternSpecId:SPEC_IDS[0],variant:17})));
  q.patternRepresentation.answer+=1;
  let v=validateG6AU03P06F15Question(q);assert.equal(v.ok,false);assert.ok(v.errors.includes("P06F15_RELATION_PAYLOAD_INVALID")||v.errors.includes("P06F15_ADDITIVE_RELATION_INVALID"));
  const q2=JSON.parse(JSON.stringify(buildG6AU03P06F15Question({patternSpecId:SPEC_IDS[1],variant:18})));
  q2.patternRepresentation.symbol="☆";
  v=validateG6AU03P06F15Question(q2);assert.equal(v.ok,false);assert.ok(v.errors.includes("P06F15_RELATION_PAYLOAD_INVALID")||v.errors.includes("P06F15_SYMBOL_RELATION_INVALID"));
});
test("Q015 public selector promotes only symbolic relation and protects Q017 Q018 candidates",()=>{
  const a=auditP06F15PublicSelectorComposition();assert.equal(a.ok,true,a.errors.join(","));
  const s=listBatchAKnowledgePointAvailabilityBySource(SRC);
  assert.equal(getVisibleBatchAKnowledgePoint(KP)?.knowledgePointId,KP);
  assert.equal(s.visibleKnowledgePointIds.includes(KP),true);
  for(const id of FUTURE){assert.equal(s.visibleKnowledgePointIds.includes(id),false);assert.equal(s.hiddenPendingKnowledgePointIds.includes(id),true);assert.equal(s.notSelectableKnowledgePointIds.includes(id),true);}
  assert.equal(s.sameUnitMixedAllowed,false);assert.ok(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC]);
});
test("Q015 source unit and capability binding keep symbolic reasoning optional not required",()=>{
  const unit=getBatchASourceUnit(SRC);assert.equal(unit.unitCode,"6A-U03");assert.equal(unit.title,"數量關係與規律問題");
  assert.ok(listBatchASourceUnits({includeW6Slice015:true}).some(x=>x.sourceId===SRC));
  const b=resolvePublicUiCapabilityBinding({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP]});
  assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.equal(b.symbolicRelationReasoningPromotedToRequired,false);assert.equal(b.relationEquationUnknownSolvingAllowed,false);assert.equal(b.sameUnitMixedAdmission,false);
  const a=auditPublicUiCapabilityBinding();assert.equal(a.ok,true,a.errors.join(","));
});
test("Q015 browser generator produces 240 unique valid questions and rejects mixed mode",()=>{
  const opts={sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionCount:240,generationSeed:"q015-240"};
  const plan=buildBatchABrowserPlan(opts);assert.equal(plan.sourceId,SRC);assert.equal(plan.questionCountMax,240);assert.deepEqual(plan.patternSpecIds,SPEC_IDS);
  const g=generateBatchABrowserQuestions(opts);assert.equal(g.ok,true,g.errors.join(","));assert.equal(g.questions.length,240);assert.equal(new Set(g.questions.map(q=>q.questionSignature)).size,240);
  const bad=generateBatchABrowserQuestions({...opts,selectionMode:"mixedKnowledgePointsSameUnit"});assert.equal(bad.ok,false);
});
test("Q015 worksheet answer print HTML contains learner symbols but no visible internal ids",()=>{
  const w=buildBatchABrowserWorksheetDocument({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionCount:8,generationSeed:"q015-render",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}});
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,8);assert.equal(w.worksheetDocument.answerKeyItems.length,8);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""});
  const visibleText=html.replace(/<[^>]*>/g," ");
  assert.match(visibleText,/符號/);assert.match(visibleText,/[△○□◇]/);
  assert.equal(visibleText.includes("kp_g6a_u03_"),false);assert.equal(visibleText.includes("ps_g6a_u03_"),false);assert.equal(visibleText.includes("P06F15"),false);
});
test("Q015 remains reachable through the current browser successor chain",()=>{
  const readRepo=rel=>readFileSync(new URL("../../"+rel,import.meta.url),"utf8");
  const chainContains=(start,target,prefix)=>{
    const stack=[start],seen=new Set();
    while(stack.length){
      const rel=stack.pop();
      if(seen.has(rel))continue;
      seen.add(rel);
      const source=readRepo(rel);
      if(source.includes(target))return true;
      for(const match of source.matchAll(/["']\.\/([^"']+\.js)["']/g)){
        const name=match[1];
        if(name.startsWith(prefix)){
          const dir=rel.slice(0,rel.lastIndexOf("/")+1);
          stack.push(dir+name);
        }
      }
    }
    return false;
  };
  assert.equal(chainContains("site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","batch-a-selector-p06f15-extension.js","batch-a-selector-p06f"),true);
  assert.equal(chainContains("site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","public-ui-capability-binding-p06f15.js","public-ui-capability-binding-p06f"),true);
  const generator=readRepo("site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js");
  const worksheet=readRepo("site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js");
  assert.match(generator,/requestsP06F15/);assert.match(worksheet,/buildP06F15Worksheet/);
});
