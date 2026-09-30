import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {materializeP08EW8DirectProductVerticalSliceQueue} from "../../src/curriculum/full-product/p08e-w8-direct-product-vertical-slice-queue.mjs";
import {getR04KnowledgePointCapabilityMapping} from "../../src/curriculum/global/r04-shared-runtime-capability-matrix.mjs";
import {getR05DeliveryWaveAssignment} from "../../src/curriculum/global/r05-delivery-wave-rebase.mjs";
import {
  G6A_U07_P08F20_APPLIED_MODIFIER_IDS,
  G6A_U07_P08F20_CONTRACT_ONLY_CAPABILITY_IDS,
  G6A_U07_P08F20_FORMAL_MAPPING,
  G6A_U07_P08F20_KP_ID,
  G6A_U07_P08F20_PATTERN_SPECS,
  G6A_U07_P08F20_REQUIRED_CAPABILITY_IDS,
  G6A_U07_P08F20_SOURCE_ID,
  G6A_U07_P08F20_SPEC_IDS,
  auditG6AU07P08F20Projection
} from "../../site/modules/curriculum/registry/g6a-u07-composite-circle-area-selector-projection-p08f20.js";
import {
  buildG6AU07P08F20Question,
  generateG6AU07P08F20Questions,
  validateG6AU07P08F20Answer,
  validateG6AU07P08F20Question
} from "../../site/modules/curriculum/batch-a/g6a-u07-composite-circle-area-runtime-p08f20.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP08F20PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource
} from "../../site/modules/curriculum/registry/batch-a-selector-p08f20-extension.js";
import {resolvePublicUiCapabilityBinding,auditPublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p08f20.js";
import {buildBatchABrowserPlan,generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p08f20.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p08f20-extension.js";
import {renderCompositeCircleAreaDiagramP08F20} from "../../site/modules/renderer/composite-circle-area-diagram-p08f20.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const impl=read("data/curriculum/full-product/p08f/q020-g6a-u07-composite-circle-area-implementation.json");
const preflight=read("data/curriculum/full-product/p08f/q020-g6a-u07-composite-circle-area-source-authority-preflight.json");
const q019=read("docs/ci/latest-p08f-w8-q019-pages-e2e.json");
const impact=read("data/project/change-impact/P08F_W8_Q020.impact.json");
const validation=read("data/project/validation-plans/P08F_W8_Q020.validation.json");
const KP=G6A_U07_P08F20_KP_ID,SRC=G6A_U07_P08F20_SOURCE_ID;

test("W8 Q020 implementation binds twentieth frozen row and Q019 D0 predecessor",()=>{
  const queue=materializeP08EW8DirectProductVerticalSliceQueue(),slice=queue.queueEntries[19];
  assert.equal(q019.status,"PASS_E6_D0_COMPLETE");
  assert.equal(q019.d0Granted,true);
  assert.equal(q019.operatorHumanVisualReview?.status,"PASS_OPERATOR_APPROVED");
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(impl.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(slice.queuePosition,20);
  assert.equal(slice.sliceId,"p08e_q020_r12_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.equal(slice.previousSliceId,"p08e_q019_r11_g6a_u07_6a07_profile_geometry_formula_c1");
  assert.equal(slice.sourceNodeId??slice.primarySourceNodeId,SRC);
  assert.deepEqual(slice.knowledgePointIds,[KP]);
  assert.equal(slice.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(slice.intraWavePrerequisiteRank,12);
  assert.equal(impl.goalDistance.reduced,"D2_TO_D1");
});

test("W8 Q020 exact R04 and R05 runtime authority matches implementation projection",()=>{
  const mapping=getR04KnowledgePointCapabilityMapping(KP);assert.ok(mapping);
  assert.equal(mapping.mappingId,"r04map_g6a_u07_composite_circle_area");
  assert.equal(mapping.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.equal(mapping.classificationRuleId,"rule_geometry_formula");
  assert.deepEqual(mapping.appliedModifierIds,G6A_U07_P08F20_APPLIED_MODIFIER_IDS);
  assert.deepEqual(mapping.requiredRuntimeCapabilityIds,G6A_U07_P08F20_REQUIRED_CAPABILITY_IDS);
  assert.deepEqual(mapping.optionalRuntimeCapabilityIds,[]);
  assert.deepEqual(mapping.forbiddenRuntimeCapabilityIds,[]);
  const row=getR05DeliveryWaveAssignment(KP);assert.ok(row);
  assert.equal(row.deliveryWaveId,"R05-W8");
  assert.equal(row.intraWavePrerequisiteRank,12);
  assert.equal(row.primaryRuntimeProfileId,"profile_geometry_formula");
  assert.deepEqual(new Set(row.contractOnlyRequiredCapabilityIds),new Set(G6A_U07_P08F20_CONTRACT_ONLY_CAPABILITY_IDS));
  assert.deepEqual(row.contractOnlyCapabilityWaveIds,["R05-W5"]);
});

test("W8 Q020 formal mapping and two source-backed pattern specs stay composite-area only",()=>{
  const a=auditG6AU07P08F20Projection();assert.equal(a.ok,true,JSON.stringify(a.errors));
  assert.equal(G6A_U07_P08F20_FORMAL_MAPPING.canonicalNameZh,"複合圓形面積");
  assert.equal(G6A_U07_P08F20_FORMAL_MAPPING.semanticCore,"COMPOSITE_CIRCLE_AREA_BY_PARTITION_AND_SUBTRACTION");
  assert.deepEqual(G6A_U07_P08F20_FORMAL_MAPPING.directVisualWitnessFamilies,[
    "QUARTER_CIRCLE_AND_SEMICIRCLE_COMPOSITE_AREA","CIRCULAR_SEGMENT_AREA","SQUARE_CIRCLE_COMPOSITE_AREA",
    "INSCRIBED_RECTANGLE_IN_CIRCLE_AREA","CONCENTRIC_CIRCLE_COMPOSITE_AREA"
  ]);
  assert.equal(G6A_U07_P08F20_PATTERN_SPECS.length,2);
  assert.deepEqual(new Set(G6A_U07_P08F20_PATTERN_SPECS.map(x=>x.targetKind)),new Set(["SEMICIRCLE_PLUS_SECTOR","SQUARE_MINUS_CIRCLE"]));
  assert.ok(G6A_U07_P08F20_PATTERN_SPECS.every(x=>x.decompositionIntoNonOverlappingRegionsRequired&&x.noOmissionOrDoubleCountRequired));
  assert.ok(G6A_U07_P08F20_PATTERN_SPECS.every(x=>!x.q014CircleAreaFormulaTeachingReownershipAllowed&&!x.q017AnnulusAreaTeachingReownershipAllowed&&!x.q019SectorAreaTeachingReownershipAllowed));
});

test("W8 Q020 materializes 240 deterministic valid variants per PatternSpec",()=>{
  for(const patternSpecId of G6A_U07_P08F20_SPEC_IDS){
    const qs=[...Array(240)].map((_,variant)=>buildG6AU07P08F20Question({patternSpecId,variant,generationSeed:"q020-contract"}));
    assert.equal(qs.length,240);
    assert.equal(new Set(qs.map(q=>q.questionSignature)).size,240);
    for(const q of qs){
      const v=validateG6AU07P08F20Question(q);assert.equal(v.ok,true,JSON.stringify(v.errors));
      assert.equal(validateG6AU07P08F20Answer(q,q.answerText).ok,true);
      assert.equal(q.knowledgePointId,KP);
      assert.equal(q.metadata.compositeCircleAreaOwned,true);
      assert.equal(q.metadata.q019SectorAreaTeachingReowned,false);
    }
  }
  const directA=buildG6AU07P08F20Question({patternSpecId:G6A_U07_P08F20_SPEC_IDS[0],variant:0});
  const directB=buildG6AU07P08F20Question({patternSpecId:G6A_U07_P08F20_SPEC_IDS[1],variant:0});
  assert.equal(directA.patternRepresentation.sourceParameterCarrier,"SOURCE_PAGE1_QUARTER_CIRCLE_AND_SEMICIRCLE_COMPOSITE");
  assert.equal(directA.patternRepresentation.radius,18);
  assert.equal(directA.patternRepresentation.sectorAngleDeg,90);
  assert.equal(directB.patternRepresentation.sourceParameterCarrier,"SOURCE_PAGE1_SQUARE_CIRCLE_COMPOSITE");
  assert.equal(directB.patternRepresentation.margin,0);
});

test("W8 Q020 formula validator rejects tampering and preserves partition/subtraction semantics",()=>{
  const a=buildG6AU07P08F20Question({patternSpecId:G6A_U07_P08F20_SPEC_IDS[0],variant:0});
  const b=buildG6AU07P08F20Question({patternSpecId:G6A_U07_P08F20_SPEC_IDS[1],variant:0});
  assert.equal(a.patternRepresentation.compositeArea,763.02);
  assert.equal(a.answerValue,763.02);
  assert.equal(b.patternRepresentation.squareArea,400);
  assert.equal(b.patternRepresentation.circleArea,314);
  assert.equal(b.answerValue,86);
  assert.equal(validateG6AU07P08F20Answer(b,85).ok,false);
  const tampered={...b,patternRepresentation:{...b.patternRepresentation,compositeArea:999}};
  assert.equal(validateG6AU07P08F20Question(tampered).ok,false);
});

test("W8 Q020 renderer exposes two explicit composite visual contracts",()=>{
  const a=buildG6AU07P08F20Question({patternSpecId:G6A_U07_P08F20_SPEC_IDS[0],variant:0});
  const b=buildG6AU07P08F20Question({patternSpecId:G6A_U07_P08F20_SPEC_IDS[1],variant:0});
  const ha=renderCompositeCircleAreaDiagramP08F20(a.geometryDiagram),hb=renderCompositeCircleAreaDiagramP08F20(b.geometryDiagram);
  assert.match(ha,/data-visual-contract-version="P08F20_R1"/);
  assert.match(ha,/composite-circle-area__semicircle/);
  assert.match(ha,/composite-circle-area__sector/);
  assert.match(ha,/data-component-role="semicircle" x="160\.00" y="54\.00"/);
  assert.match(ha,/data-component-role="sector" x="70\.00" y="126\.00"/);
  assert.match(ha,/composite-circle-area__sector-label-leader/);
  assert.match(ha,/陰影面積＝半圓面積＋扇形面積/);
  assert.match(hb,/composite-circle-area__difference-fill/);
  assert.match(hb,/composite-circle-area__square/);
  assert.match(hb,/陰影面積＝正方形面積－圓面積/);
  assert.doesNotMatch(ha+hb,/弧長|周長/);
});

test("W8 Q020 selector promotes final G6A-U07 candidate but keeps mixed modes closed",()=>{
  const s=listBatchAKnowledgePointAvailabilityBySource(SRC);
  const ids=s.visibleKnowledgePointIds.filter(id=>id.startsWith("kp_g6a_u07_"));
  assert.equal(ids.length,5);
  assert.ok(ids.includes(KP));
  assert.equal(s.hiddenPendingKnowledgePointIds.includes(KP),false);
  assert.equal(s.notSelectableKnowledgePointIds.includes(KP),false);
  assert.equal(s.remainingProtectedKnowledgePointIds.length,0);
  assert.equal(s.sameSourceCandidateSetComplete,true);
  assert.equal(s.sameUnitMixedAllowed,false);
  assert.ok(getVisibleBatchAKnowledgePoint(KP));
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.bySourceId[SRC].visibleCount,5);
  assert.equal(auditP08F20PublicSelectorComposition().ok,true);
});

test("W8 Q020 binding, generator and worksheet are single-KP diagram-only",()=>{
  const binding=resolvePublicUiCapabilityBinding({sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP]});
  assert.equal(binding.blocked,false);assert.equal(binding.questionType,"diagram");assert.equal(binding.questionCount.max,240);
  assert.equal(binding.compositeCircleAreaOwned,true);assert.equal(binding.sameUnitMixedAdmission,false);assert.equal(binding.crossUnitMixedAdmission,false);
  assert.equal(auditPublicUiCapabilityBinding().ok,true);
  const options={sourceId:SRC,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[KP],questionCount:16,generationSeed:"q020-test",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:2}};
  const plan=buildBatchABrowserPlan(options);assert.equal(plan.questionCountMax,240);assert.equal(plan.questionMode,"diagram");
  const gen=generateBatchABrowserQuestions(options);assert.equal(gen.ok,true,JSON.stringify(gen.errors));assert.equal(gen.questions.length,16);
  assert.deepEqual(gen.allocation.map(x=>x.count),[8,8]);
  const w=buildBatchABrowserWorksheetDocument(options);assert.equal(w.ok,true,JSON.stringify(w.errors));assert.equal(w.worksheetDocument.questionPages.length,4);assert.equal(w.worksheetDocument.answerKeyPages.length,4);
  const html=renderWorksheetDocumentToHtml(w.worksheetDocument);assert.match(html,/composite-circle-area-diagram-p08f20/);
  for(const bad of ["mixedKnowledgePointsSameUnit","mixedKnowledgePointsCrossUnit"]){
    const g=generateBatchABrowserQuestions({...options,selectionMode:bad,selectedKnowledgePointIds:[KP,"kp_g6a_u07_sector_area"]});
    assert.equal(g.ok,false);
  }
});

test("W8 Q020 current pointer files and impact policy stay bounded",()=>{
  const selectorPtr=readFileSync(new URL("../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",import.meta.url),"utf8");
  const bindingPtr=readFileSync(new URL("../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",import.meta.url),"utf8");
  const generatorBridge=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f60.js",import.meta.url),"utf8");
  const worksheetBridge=readFileSync(new URL("../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f60-extension.js",import.meta.url),"utf8");
  assert.match(selectorPtr,/batch-a-selector-p08f20-extension/);assert.match(bindingPtr,/public-ui-capability-binding-p08f20/);
  assert.match(generatorBridge,/requestsP08F20/);assert.match(worksheetBridge,/buildP08F20Worksheet/);
  assert.equal(impact.expectedDerivedGate,"SHARED_RUNTIME_BOUNDED");
  assert.equal(impact.scopeGuards.q021OrLaterMutation,false);
  assert.equal(impact.scopeGuards.sameUnitMixedAdmission,false);
  assert.equal(impact.scopeGuards.crossUnitMixedAdmission,false);
  assert.deepEqual(validation.lanes.SHARED_RUNTIME_BOUNDED.map(x=>x.gateId),["GLOBAL_CONTRACTS","TARGETED_ROUTE_REPLAY"]);
  assert.ok(validation.forbidden.includes("FULL_NODE_REGRESSION"));assert.ok(validation.forbidden.includes("GLOBAL_BROWSER_REPLAY"));
});
