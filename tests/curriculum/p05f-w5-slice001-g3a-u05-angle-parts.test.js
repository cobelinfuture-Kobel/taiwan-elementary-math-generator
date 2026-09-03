import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

import {listBatchASourceUnits} from "../../site/modules/curriculum/batch-a/source-units.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f1-extension.js";
import {generateG3AU05P05F1Questions,validateG3AU05P05F1Question} from "../../site/modules/curriculum/batch-a/g3a-u05-angle-parts-runtime-p05f1.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {
  G3A_U05_P05F1_FORMAL_MAPPING,
  G3A_U05_P05F1_FUTURE_KP_IDS,
  G3A_U05_P05F1_GROUP_ID,
  G3A_U05_P05F1_KP_ID,
  G3A_U05_P05F1_SPEC_IDS,
  G3A_U05_P05F1_SOURCE_ID,
  auditG3AU05P05F1SelectorProjection,
} from "../../site/modules/curriculum/registry/g3a-u05-angle-parts-selector-projection-p05f1.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP05F1PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  resolveVisiblePatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f1-extension.js";
import {resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f1.js";

const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q001-g3a-u05-angle-parts-source-authority-preflight.json",import.meta.url),"utf8"));
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q001-g3a-u05-angle-parts-implementation.json",import.meta.url),"utf8"));
const options={sourceId:G3A_U05_P05F1_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3A_U05_P05F1_KP_ID],selectedPatternGroupIds:[G3A_U05_P05F1_GROUP_ID],patternSpecIds:[...G3A_U05_P05F1_SPEC_IDS],questionMode:"diagram",requestedQuestionType:"diagram",questionCount:24,generationSeed:"p05f1-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true}};

function occurrences(text,token){return text.split(token).length-1;}

test("P05F W5 Q001 preserves exact queue and source-authority boundary",()=>{
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.sliceId,"p05e_q001_r0_g3a_u05_3a05_profile_geometry_property_c1");
  assert.equal(preflight.queueAuthority.implementationTaskId,"P05F_W5DirectProductVerticalSlice001Implementation");
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G3A_U05_P05F1_KP_ID]);
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.panelTitle,"角的組成");
  assert.equal(preflight.sourceAuthority.page1DirectEvidence.visibleStatement,"兩條邊+1個頂點");
  assert.equal(preflight.sourceConstraintReconciliation.learnerFacingImplementationMustNotRequireRayVocabularyWithoutAdditionalSourceEvidence,true);
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.scopeGuard.q002Touched,false);
});

test("P05F W5 Q001 materializes one FormalMapping, one group, and four diagram PatternSpecs",()=>{
  const audit=auditG3AU05P05F1SelectorProjection();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{knowledgePoints:1,patternGroups:1,patternSpecs:4,diagram:4,application:0});
  assert.equal(G3A_U05_P05F1_FORMAL_MAPPING.mappingId,"fm_g3a_u05_angle_parts_identification_p05f1");
  assert.deepEqual(G3A_U05_P05F1_FORMAL_MAPPING.includedRelations,["IDENTIFY_VERTEX","IDENTIFY_SIDE","IDENTIFY_ANGLE_MARKER","MATCH_ANGLE_PART_LABEL_TO_DIAGRAM"]);
  assert.ok(G3A_U05_P05F1_FORMAL_MAPPING.excludedRelations.includes("RECOGNIZE_RIGHT_ANGLE"));
  assert.ok(G3A_U05_P05F1_FORMAL_MAPPING.excludedRelations.includes("ANGLE_MEASURE_NUMERIC"));
  assert.ok(G3A_U05_P05F1_FORMAL_MAPPING.excludedRelations.includes("APPLICATION_CONTEXT"));
  assert.deepEqual(G3A_U05_P05F1_FORMAL_MAPPING.learnerFacingForbiddenVocabulary,["射線"]);
});

test("P05F W5 Q001 promotes one G3A-U05 public leaf and keeps three successors fail-closed",()=>{
  const audit=auditP05F1PublicSelectorComposition();
  assert.equal(audit.ok,true,audit.errors.join("\n"));
  assert.deepEqual(audit.counts,{sources:44,knowledgePoints:313,g3aU05Visible:1,g3aU05Hidden:3,g3aU05NotSelectable:3});
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,44);
  const source=listBatchAKnowledgePointAvailabilityBySource(G3A_U05_P05F1_SOURCE_ID);
  assert.deepEqual(source.visibleKnowledgePointIds,[G3A_U05_P05F1_KP_ID]);
  assert.deepEqual(source.hiddenPendingKnowledgePointIds,[...G3A_U05_P05F1_FUTURE_KP_IDS]);
  assert.deepEqual(source.notSelectableKnowledgePointIds,[...G3A_U05_P05F1_FUTURE_KP_IDS]);
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G3A_U05_P05F1_KP_ID,"diagram"),[...G3A_U05_P05F1_SPEC_IDS]);
  for(const id of G3A_U05_P05F1_FUTURE_KP_IDS)assert.equal(getVisibleBatchAKnowledgePoint(id),null);
  const units=listBatchASourceUnits({includeW5Slice001:true,includeCurrentFullProductPublic:true});
  const unit=units.find((row)=>row.sourceId===G3A_U05_P05F1_SOURCE_ID);
  assert.deepEqual(unit,{sourceId:G3A_U05_P05F1_SOURCE_ID,grade:3,semester:"upper",unitCode:"3A-U05",title:"角與形狀",domain:"geometry_property",lifecycle:"public_full_product_w5_slice001_candidate"});
});

test("P05F W5 Q001 generates a balanced 24-question diagram worksheet with fail-closed validation",()=>{
  const generated=generateG3AU05P05F1Questions(options);
  assert.equal(generated.ok,true,generated.errors.join("\n"));
  assert.equal(generated.questions.length,24);
  assert.deepEqual(generated.allocation.map((row)=>row.count),[6,6,6,6]);
  assert.equal(new Set(generated.questions.map((row)=>row.questionSignature)).size,24);
  assert.deepEqual(new Set(generated.questions.map((row)=>row.answerText)),new Set(["頂點","邊","角"]));
  for(const question of generated.questions){
    assert.equal(validateG3AU05P05F1Question(question).ok,true);
    assert.equal(question.promptText.includes("射線"),false);
    assert.equal(question.metadata.applicationContextUsed,false);
  }
  const answerTamper=JSON.parse(JSON.stringify(generated.questions[0]));
  answerTamper.answerText="直角";
  assert.equal(validateG3AU05P05F1Question(answerTamper).ok,false);
  const diagramTamper=JSON.parse(JSON.stringify(generated.questions[1]));
  diagramTamper.geometryDiagram.openingDeg=35;
  assert.equal(validateG3AU05P05F1Question(diagramTamper).ok,false);
});

test("P05F W5 Q001 proves 240 distinct diagram variants for every PatternSpec",()=>{
  for(const patternSpecId of G3A_U05_P05F1_SPEC_IDS){
    const result=generateG3AU05P05F1Questions({questionCount:240,patternSpecIds:[patternSpecId],generationSeed:`capacity-${patternSpecId}`});
    assert.equal(result.ok,true,`${patternSpecId}: ${result.errors.join("\n")}`);
    assert.equal(result.questions.length,240);
    assert.equal(new Set(result.questions.map((row)=>row.questionSignature)).size,240);
    assert.equal(result.questions.every((row)=>row.patternSpecId===patternSpecId),true);
  }
});

test("P05F W5 Q001 public binding exposes diagram-only max-240 capability",()=>{
  const binding=resolvePublicUiCapabilityBinding(options);
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.deepEqual(binding.availableQuestionTypeOptions.map((row)=>row.value),["diagram"]);
  assert.equal(binding.questionCount.max,240);
  assert.deepEqual(binding.compatiblePatternGroupIds,[G3A_U05_P05F1_GROUP_ID]);
  assert.deepEqual(binding.patternSpecIds,[...G3A_U05_P05F1_SPEC_IDS]);
  assert.equal(binding.geometryDiagramRepresentation,true);
  assert.equal(binding.applicationSuitability,"APPLICATION_NOT_APPLICABLE");
  assert.equal(binding.genericFallback,false);
  assert.equal(binding.freeFormAI,false);
});

test("P05F W5 Q001 worksheet and HTML renderer preserve diagrams across questions and answers",()=>{
  const result=buildBatchABrowserWorksheetDocument(options);
  assert.equal(result.ok,true,result.errors.join("\n"));
  const document=result.worksheetDocument;
  assert.equal(document.questionCount,24);
  assert.equal(document.answerKeyItems.length,24);
  assert.equal(document.questionPages.length,3);
  assert.equal(document.answerKeyPages.length,3);
  assert.equal(document.questionDisplayModels.every((row)=>row.geometryDiagram?.kind==="angle_parts_diagram"),true);
  assert.equal(document.answerKeyItems.every((row)=>row.geometryDiagram?.kind==="angle_parts_diagram"),true);
  const html=renderWorksheetDocumentToHtml(document,{stylesheetHref:""});
  assert.equal(occurrences(html,'class="worksheet-angle-parts-diagram"'),48);
  assert.equal(occurrences(html,"angle-parts-diagram__side "),96);
  assert.equal(occurrences(html,"angle-parts-diagram__marker--vertex"),12);
  assert.equal(occurrences(html,"angle-parts-diagram__marker--arc"),12);
  assert.equal(occurrences(html,"angle-parts-diagram__marker--label-point"),12);
  assert.equal(occurrences(html,'stroke-width="7"'),12);
  assert.equal(html.includes("射線"),false);
});

test("P05F W5 Q001 stable browser selector and binding wrappers cut over without changing Node historical snapshots",async()=>{
  globalThis.document={};
  try{
    const selector=await import(`../../site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js?p05f1=${Date.now()}`);
    const bindingModule=await import(`../../site/modules/curriculum/public/public-ui-capability-binding-p04f33.js?p05f1=${Date.now()}`);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.sourceCount,44);
    assert.equal(selector.BATCH_A_SELECTOR_AVAILABILITY.visibleCount,313);
    assert.equal(selector.getVisibleBatchAKnowledgePoint(G3A_U05_P05F1_KP_ID)?.sourceId,G3A_U05_P05F1_SOURCE_ID);
    const binding=bindingModule.resolvePublicUiCapabilityBinding(options);
    assert.equal(binding.questionType,"diagram");
    assert.equal(binding.questionCount.max,240);
    assert.ok(listBatchASourceUnits().some((row)=>row.sourceId===G3A_U05_P05F1_SOURCE_ID));
  }finally{
    delete globalThis.document;
  }
});
