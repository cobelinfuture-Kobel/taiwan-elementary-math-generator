import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import * as selector from "../../site/modules/curriculum/registry/batch-a-selector-p08f22-extension.js";
import {auditG6AU08P08F22Projection,G6A_U08_P08F22_KP_ID as KP,G6A_U08_P08F22_PRIOR_OWNER_KP_IDS as PRIOR,
  G6A_U08_P08F22_REQUIRED_CAPABILITY_IDS as REQUIRED,G6A_U08_P08F22_OPTIONAL_CAPABILITY_IDS as OPTIONAL,
  G6A_U08_P08F22_CONTRACT_ONLY_CAPABILITY_IDS as CONTRACT_ONLY,G6A_U08_P08F22_SOURCE_ID as SRC,G6A_U08_P08F22_SPEC_IDS as SPEC_IDS}
from "../../site/modules/curriculum/registry/g6a-u08-speed-unit-conversion-selector-projection-p08f22.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f22.js";
import {buildG6AU08P08F22Question,generateG6AU08P08F22Questions,validateG6AU08P08F22Answer,validateG6AU08P08F22Question} from "../../site/modules/curriculum/batch-a/g6a-u08-speed-unit-conversion-runtime-p08f22.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p08f/q022-g6a-u08-speed-unit-conversion-implementation.json"),pre=read("data/curriculum/full-product/p08f/q022-g6a-u08-speed-unit-conversion-source-authority-preflight.json"),
  impact=read("data/project/change-impact/P08F_W8_Q022.impact.json"),plan=read("data/project/validation-plans/P08F_W8_Q022.validation.json");
const req=(extra={})=>({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionMode:"numeric",questionCount:20,generationSeed:"p08f22",...extra});
test("W8 Q022 consumes merged preflight and is the final frozen W8 slice",()=>{assert.equal(pre.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");assert.equal(impl.preflight.prNumber,1162);
  assert.equal(impl.preflight.mergeSha,"ca9d19167f5198b5f618b6fd41dda2113d5b39b1");assert.equal(impl.queueAuthority.queuePosition,22);assert.equal(impl.queueAuthority.queueSliceCount,22);
  assert.equal(impl.queueAuthority.sliceId,"p08e_q022_r14_g6a_u08_6a08_profile_speed_rate_c1");assert.equal(impl.queueAuthority.finalFrozenW8Slice,true);assert.deepEqual(impl.queueAuthority.targetKnowledgePointIds,[KP]);});
test("W8 Q022 projection and public binding are exact and bounded",()=>{const a=auditG6AU08P08F22Projection();assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:6,formalMappings:1});
  const ua=auditPublicUiCapabilityBinding();assert.equal(ua.ok,true,ua.errors.join(","));const b=resolvePublicUiCapabilityBinding(req());assert.equal(b.blocked,false);assert.equal(b.questionType,"numeric");assert.equal(b.questionCount.max,240);
  assert.deepEqual(b.requiredCapabilityIds,REQUIRED);assert.deepEqual(b.contractOnlyRequiredCapabilityIds,CONTRACT_ONLY);assert.deepEqual(b.optionalCapabilityIds,OPTIONAL);assert.equal(b.speedUnitConversionOwned,true);assert.equal(b.w8FrozenQueueComplete,true);});
test("W8 Q022 promotes the final G6A-U08 KP and preserves four prior speed owners",()=>{const ids=selector.listVisibleBatchAKnowledgePoints().filter(x=>x.sourceId===SRC).map(x=>x.knowledgePointId),av=selector.listBatchAKnowledgePointAvailabilityBySource(SRC),a=selector.auditP08F22PublicSelectorComposition();
  assert.equal(a.ok,true,a.errors.join(","));assert.equal(ids.includes(KP),true);for(const id of PRIOR)assert.equal(ids.includes(id),true,id);assert.equal(av.hiddenPendingKnowledgePointIds.includes(KP),false);
  assert.equal(av.notSelectableKnowledgePointIds.includes(KP),false);assert.equal(av.sameSourceCandidateSetComplete,true);assert.equal(av.sameUnitMixedAllowed,false);assert.equal(av.w8FrozenQueueComplete,true);});
for(const id of SPEC_IDS)test(id+" has 240 deterministic unique valid conversions",()=>{const a=generateG6AU08P08F22Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"}),b=generateG6AU08P08F22Questions({knowledgePointId:KP,questionCount:240,patternSpecIds:[id],generationSeed:"stable"});
  assert.equal(a.ok,true,a.errors.join(","));assert.deepEqual(a.questions,b.questions);assert.equal(new Set(a.questions.map(q=>q.questionSignature)).size,240);
  for(const q of a.questions){const v=validateG6AU08P08F22Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));assert.equal(Number.isInteger(q.answerValue),true);assert.equal(validateG6AU08P08F22Answer(q,q.answerText).ok,true);}});
test("W8 Q022 exact direction examples preserve equivalent speed",()=>{for(const [patternSpecId,sourceValue,targetValue] of [["ps_g6a_u08_kmh_to_mmin",3,50],["ps_g6a_u08_mmin_to_kmh",50,3],["ps_g6a_u08_kmh_to_mps",18,5],["ps_g6a_u08_mps_to_kmh",5,18],["ps_g6a_u08_mmin_to_mps",60,1],["ps_g6a_u08_mps_to_mmin",1,60]]){const q=buildG6AU08P08F22Question({patternSpecId,variant:0});assert.equal(q.patternRepresentation.sourceValue,sourceValue);assert.equal(q.patternRepresentation.targetValue,targetValue);assert.equal(validateG6AU08P08F22Question(q).ok,true);}});
test("W8 Q022 aggregate worksheet is answer-key and print ready without prior-owner leakage",()=>{const p=buildBatchABrowserPlan(req({questionCount:20}));assert.deepEqual(p.selectedKnowledgePointIds,[KP]);assert.equal(p.questionCountMax,240);
  const g=generateBatchABrowserQuestions(req({questionCount:20}));assert.equal(g.ok,true,g.errors.join(","));const w=buildBatchABrowserWorksheetDocument(req({questionCount:12,includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4}}));
  assert.equal(w.ok,true,w.errors.join(","));assert.equal(w.worksheetDocument.questionCount,12);assert.equal(w.worksheetDocument.answerKeyItems.length,12);assert.equal(w.worksheetDocument.title,"認識速率｜速率單位換算");
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument,{stylesheetHref:""}),visible=html.replace(/<[^>]*>/g," ");assert.match(visible,/換算成/);assert.match(visible,/公里\/小時|公尺\/分鐘|公尺\/秒/);
  for(const x of ["P08F22","kp_speed_","ps_g6a_u08_","平均速率","追趕","相遇","順流","逆流","風速"])assert.equal(visible.includes(x),false,x);});
test("W8 Q022 mixed modes fail closed and predecessor speed owners remain routable",()=>{const mixed=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[KP,PRIOR[0]],questionMode:"numeric",questionCount:8});assert.equal(mixed.ok,false);
  for(const id of PRIOR){const g=generateBatchABrowserQuestions({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[id],questionMode:"numeric",questionCount:2,generationSeed:"prior-owner"});assert.equal(g.ok,true,id+":"+JSON.stringify(g.errors));assert.equal(g.questions.every(q=>q.knowledgePointId===id),true);}});
test("W8 Q022 current pointers and bounded validation are final-slice safe",()=>{const s=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8"),b=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8"),
  g=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8"),w=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(s,/batch-a-selector-p08f22-extension/);assert.match(b,/public-ui-capability-binding-p08f22/);assert.match(g,/requestsP08F22/);assert.match(w,/requestsP08F22/);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");assert.deepEqual(plan.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.equal(plan.forbidden.includes("FULL_NODE_REGRESSION"),true);assert.equal(plan.forbidden.includes("GLOBAL_BROWSER_REPLAY"),true);});
