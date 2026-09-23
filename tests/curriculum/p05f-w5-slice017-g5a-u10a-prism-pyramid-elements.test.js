import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {G5A_U10A_P05F17_FORMAL_MAPPING,G5A_U10A_P05F17_FUTURE_KP_IDS,G5A_U10A_P05F17_KP_ID,G5A_U10A_P05F17_PATTERN_SPECS,G5A_U10A_P05F17_SPEC_IDS,auditG5AU10AP05F17SelectorProjection} from "../../site/modules/curriculum/registry/g5a-u10a-prism-pyramid-elements-selector-projection-p05f17.js";
import {BATCH_A_SELECTOR_AVAILABILITY,auditP05F17PublicSelectorComposition,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f17-extension.js";
import {generateG5AU10AP05F17Questions,validateG5AU10AP05F17Question} from "../../site/modules/curriculum/batch-a/g5a-u10a-prism-pyramid-elements-runtime-p05f17.js";
import {buildBatchABrowserPlan} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f17.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f17-extension.js";
import {resolvePublicUiCapabilityBinding,auditPublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f17.js";
import {renderPrismPyramidElementsDiagram,validatePrismPyramidElementsDiagramModel} from "../../site/modules/renderer/prism-pyramid-elements-diagram.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const implementation=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q017-g5a-u10a-prism-pyramid-elements-implementation.json",import.meta.url),"utf8"));
const preflight=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p05f/q017-g5a-u10a-prism-pyramid-elements-source-authority-preflight.json",import.meta.url),"utf8"));
const SOURCE="g5a_u10_5a10a",Q007="kp_g5a_u10a_solid_shape_classification";
const options=(extra={})=>({sourceId:SOURCE,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G5A_U10A_P05F17_KP_ID],questionCount:24,generationSeed:"p05f17-focused",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showQuestionNumbers:true,showAnswerKeyPage:true},...extra});

test("P05F W5 Q017 materializes exact preflight authority and two locked relations",()=>{
  assert.equal(implementation.taskId,"P05F_W5DirectProductVerticalSlice017Implementation");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(G5A_U10A_P05F17_FORMAL_MAPPING.canonicalNameZh,"柱體錐體構成要素");
  assert.equal(G5A_U10A_P05F17_FORMAL_MAPPING.capabilityStatement,"學生能辨認立體的底面、側面、稜與頂點。");
  assert.equal(G5A_U10A_P05F17_FORMAL_MAPPING.reasoningInvariant,"構成要素的數量與位置由底面多邊形決定。");
  assert.deepEqual(G5A_U10A_P05F17_FORMAL_MAPPING.includedRelations,["IDENTIFY_BASE_SIDE_FACE_EDGE_VERTEX","RELATE_ELEMENT_COUNT_POSITION_TO_BASE_POLYGON"]);
  assert.equal(G5A_U10A_P05F17_PATTERN_SPECS.length,7);
  assert.equal(auditG5AU10AP05F17SelectorProjection().ok,true);
});

test("P05F W5 Q017 proves 240 distinct validated diagrams for every PatternSpec",()=>{
  for(const specId of G5A_U10A_P05F17_SPEC_IDS){
    const generated=generateG5AU10AP05F17Questions(options({patternSpecIds:[specId],questionCount:240,generationSeed:`q017-capacity-${specId}`}));
    assert.equal(generated.ok,true,`${specId}:${generated.errors.join(",")}`);
    assert.equal(generated.questions.length,240);
    assert.equal(new Set(generated.questions.map(q=>q.questionSignature)).size,240);
    assert.equal(new Set(generated.questions.map(q=>JSON.stringify(q.geometryDiagram))).size,240);
    for(const q of generated.questions){assert.equal(validateG5AU10AP05F17Question(q).ok,true);assert.equal(validatePrismPyramidElementsDiagramModel(q.geometryDiagram).ok,true);}
  }
});

test("P05F W5 Q017 identification covers base side face edge vertex without leaking later solid semantics",()=>{
  const generated=generateG5AU10AP05F17Questions(options({patternSpecIds:G5A_U10A_P05F17_SPEC_IDS.slice(0,4),questionCount:40,generationSeed:"q017-identify"}));
  assert.equal(generated.ok,true,generated.errors.join(","));
  assert.deepEqual(new Set(generated.questions.map(q=>q.answerText)),new Set(["底面","側面","稜","頂點"]));
  for(const q of generated.questions){const html=renderPrismPyramidElementsDiagram(q.geometryDiagram);assert.ok(html.includes("worksheet-prism-pyramid-elements-diagram"));assert.equal(q.metadata.solidNetCorrespondenceUsed,false);assert.equal(q.metadata.solidCrossSectionUsed,false);assert.equal(q.metadata.solidViewpointRepresentationUsed,false);}
});

test("P05F W5 Q017 structural counts obey n-gon prism and pyramid invariants",()=>{
  const generated=generateG5AU10AP05F17Questions(options({patternSpecIds:G5A_U10A_P05F17_SPEC_IDS.slice(4),questionCount:240,generationSeed:"q017-count-structure"}));
  assert.equal(generated.ok,true,generated.errors.join(","));
  assert.deepEqual([...new Set(generated.questions.map(q=>q.geometryDiagram.baseSides))].sort((a,b)=>a-b),[3,4,5,6,7,8,9,10]);
  assert.deepEqual(new Set(generated.questions.map(q=>q.geometryDiagram.solidKind)),new Set(["PRISM","PYRAMID"]));
  for(const q of generated.questions){const d=q.geometryDiagram,n=d.baseSides;if(d.solidKind==="PRISM"){assert.equal(d.faceCount,n+2);assert.equal(d.edgeCount,3*n);assert.equal(d.vertexCount,2*n);}else{assert.equal(d.faceCount,n+1);assert.equal(d.edgeCount,2*n);assert.equal(d.vertexCount,n+1);}}
});

test("P05F W5 Q017 validator fails closed on answer count and provenance tampering",()=>{
  const q=generateG5AU10AP05F17Questions(options({questionCount:1,generationSeed:"q017-tamper"})).questions[0];
  assert.ok(q);
  assert.equal(validateG5AU10AP05F17Question({...q,answerText:"錯誤"}).ok,false);
  assert.equal(validateG5AU10AP05F17Question({...q,geometryDiagram:{...q.geometryDiagram,edgeCount:999}}).ok,false);
  assert.equal(validateG5AU10AP05F17Question({...q,metadata:{...q.metadata,solidNetCorrespondenceUsed:true}}).ok,false);
});

test("P05F W5 Q017 promotes only target and preserves Q007 sourceUnit owner plus three siblings hidden",()=>{
  assert.equal(auditP05F17PublicSelectorComposition().ok,true);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount,53);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,331);
  const source=listBatchAKnowledgePointAvailabilityBySource(SOURCE);
  assert.equal(source.visibleCount,2);assert.equal(source.hiddenPendingCount,3);assert.equal(source.notSelectableCount,3);
  assert.ok(source.visibleKnowledgePointIds.includes(Q007));assert.ok(source.visibleKnowledgePointIds.includes(G5A_U10A_P05F17_KP_ID));
  for(const id of G5A_U10A_P05F17_FUTURE_KP_IDS){assert.ok(source.hiddenPendingKnowledgePointIds.includes(id));assert.ok(source.notSelectableKnowledgePointIds.includes(id));}
});

test("P05F W5 Q017 binding and browser plan are explicit-target only while sourceUnit remains Q007",()=>{
  const target=resolvePublicUiCapabilityBinding(options());
  assert.equal(target.blocked,false);assert.equal(target.questionType,"diagram");assert.equal(target.questionCount.max,240);assert.equal(target.patternSpecIds.length,7);assert.equal(target.prismPyramidElementIdentificationAdmission,true);assert.equal(target.prismPyramidStructuralCountAdmission,true);assert.equal(target.solidShapeClassificationAdmission,false);assert.equal(target.applicationImplementationAllowed,false);
  const sourceUnit=resolvePublicUiCapabilityBinding({sourceId:SOURCE,selectionMode:"sourceUnit",questionCount:12});
  assert.equal(sourceUnit.selectionMode,"sourceUnit");assert.equal(sourceUnit.patternSpecIds.length,3);assert.equal(sourceUnit.solidElementsNamingOrCountAdmission,false);assert.equal(auditPublicUiCapabilityBinding().ok,true);
  const plan=buildBatchABrowserPlan(options());assert.equal(plan.selectionMode,"singleKnowledgePoint");assert.deepEqual(plan.selectedKnowledgePointIds,[G5A_U10A_P05F17_KP_ID]);assert.equal(plan.questionCountMax,240);assert.equal(plan.genericFallback,false);assert.equal(plan.freeFormAI,false);
  const sourceUnitPlan=buildBatchABrowserPlan({sourceId:SOURCE,selectionMode:"sourceUnit",questionCount:12});assert.equal(sourceUnitPlan.selectionMode,"sourceUnit");assert.deepEqual(sourceUnitPlan.selectedKnowledgePointIds,[Q007]);
});

test("P05F W5 Q017 worksheet projects 24 diagrams answers pagination and shared renderer",()=>{
  const result=buildBatchABrowserWorksheetDocument(options());assert.equal(result.ok,true,result.errors?.join(","));const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,24);assert.equal(doc.answerKeyItems.length,24);assert.equal(doc.questionPages.length,3);assert.equal(doc.answerKeyPages.length,3);
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/worksheet-prism-pyramid-elements-diagram/g)??[]).length,48);
  assert.equal((html.match(/data-representation="prism-pyramid-elements-diagram"/g)??[]).length,48);
});

test("P05F W5 Q017 changed static relative imports exist",()=>{
  const files=[
    "site/modules/curriculum/registry/g5a-u10a-prism-pyramid-elements-selector-projection-p05f17.js","site/modules/curriculum/registry/batch-a-selector-p05f17-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p05f17.js","site/modules/curriculum/batch-a/g5a-u10a-prism-pyramid-elements-runtime-p05f17.js","site/modules/curriculum/batch-a/batch-a-browser-generator-p05f17.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f17-extension.js","site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js","site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js","site/modules/curriculum/public/public-ui-capability-binding-p04f33.js","site/modules/renderer/prism-pyramid-elements-diagram.js","site/modules/renderer/html-renderer.js"
  ];
  const missing=[],re=/(?:import|export)\s+(?:[^'\"]*?\s+from\s+)?["'](\.[^"']+)["']/g;
  for(const file of files){const full=path.join(ROOT,file),text=readFileSync(full,"utf8");for(const match of text.matchAll(re)){let target=path.resolve(path.dirname(full),match[1]);if(!path.extname(target))target+=".js";if(!existsSync(target))missing.push(`${file}:${match[1]}`);}}
  assert.deepEqual(missing,[]);
});
