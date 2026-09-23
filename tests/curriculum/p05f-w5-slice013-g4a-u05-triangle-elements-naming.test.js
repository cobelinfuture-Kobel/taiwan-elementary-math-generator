import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {buildBatchABrowserWorksheetDocument as buildP05F13Worksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f13-extension.js";
import {buildBatchABrowserPlan,requestsP05F13} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f13.js";
import {generateG4AU05P05F13Questions,validateG4AU05P05F13Question} from "../../site/modules/curriculum/batch-a/g4a-u05-triangle-elements-naming-runtime-p05f13.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validateTriangleElementsNamingDiagramModel} from "../../site/modules/renderer/triangle-elements-naming-diagram.js";
import {
  G4A_U05_P05F13_EXCLUDED_RELATIONS,
  G4A_U05_P05F13_FORMAL_MAPPING,
  G4A_U05_P05F13_FUTURE_KP_IDS,
  G4A_U05_P05F13_INCLUDED_RELATIONS,
  G4A_U05_P05F13_KP_ID,
  G4A_U05_P05F13_PATTERN_GROUP_ID,
  G4A_U05_P05F13_PATTERN_SPECS,
  G4A_U05_P05F13_REQUIRED_CAPABILITY_IDS,
  G4A_U05_P05F13_SOURCE_ID,
  G4A_U05_P05F13_SPEC_IDS,
  auditG4AU05P05F13SelectorProjection,
} from "../../site/modules/curriculum/registry/g4a-u05-triangle-elements-naming-selector-projection-p05f13.js";
import {BATCH_A_SELECTOR_AVAILABILITY,auditP05F13PublicSelectorComposition,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f13-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f13.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const implementation=JSON.parse(readFileSync(path.join(ROOT,"data/curriculum/full-product/p05f/q013-g4a-u05-triangle-elements-naming-implementation.json"),"utf8"));
const preflight=JSON.parse(readFileSync(path.join(ROOT,"data/curriculum/full-product/p05f/q013-g4a-u05-triangle-elements-naming-source-authority-preflight.json"),"utf8"));
const EXPECTED_CAPS=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_property_reasoning"];
const FORBIDDEN=["等邊","等腰","不等邊","銳角三角形","直角三角形","鈍角三角形","三角形不等式","全等","作圖","應用題"];
function options(extra={}){return{sourceId:G4A_U05_P05F13_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G4A_U05_P05F13_KP_ID],selectedPatternGroupIds:[G4A_U05_P05F13_PATTERN_GROUP_ID],...extra};}

test("P05F W5 Q013 implementation remains bound to frozen queue and merged preflight",()=>{
  assert.equal(implementation.taskId,"P05F_W5DirectProductVerticalSlice013Implementation");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,13);
  assert.equal(implementation.queueAuthority.sliceId,"p05e_q013_r1_g4a_u05_4a05_profile_geometry_property_c1");
  assert.equal(implementation.queueAuthority.sourceId,G4A_U05_P05F13_SOURCE_ID);
  assert.equal(implementation.queueAuthority.runtimeProfileId,"profile_geometry_property");
  assert.equal(implementation.queueAuthority.knowledgePointId,G4A_U05_P05F13_KP_ID);
  assert.deepEqual(implementation.queueAuthority.requiredW5CapabilityIds,EXPECTED_CAPS);
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,13);
  assert.equal(preflight.queueAuthority.sliceId,implementation.queueAuthority.sliceId);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G4A_U05_P05F13_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,EXPECTED_CAPS);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.sourceRefAmbiguity,false);
  assert.equal(preflight.sourceAuthority.sourceIdentityCrossCheck.embeddedHeaderUrlMismatchObserved,true);
});

test("P05F W5 Q013 FormalMapping and five PatternSpecs match exact preflight scope",()=>{
  assert.equal(auditG4AU05P05F13SelectorProjection().ok,true);
  assert.equal(G4A_U05_P05F13_FORMAL_MAPPING.mappingId,"fm_g4a_u05_triangle_elements_naming_p05f13");
  assert.deepEqual(G4A_U05_P05F13_FORMAL_MAPPING.includedRelations,G4A_U05_P05F13_INCLUDED_RELATIONS);
  assert.deepEqual(G4A_U05_P05F13_FORMAL_MAPPING.excludedRelations,G4A_U05_P05F13_EXCLUDED_RELATIONS);
  assert.deepEqual(G4A_U05_P05F13_FORMAL_MAPPING.requiredCapabilityIds,G4A_U05_P05F13_REQUIRED_CAPABILITY_IDS);
  assert.equal(G4A_U05_P05F13_PATTERN_SPECS.length,5);
  assert.equal(new Set(G4A_U05_P05F13_SPEC_IDS).size,5);
  assert.deepEqual([...G4A_U05_P05F13_INCLUDED_RELATIONS],preflight.q013ScopeLock.includedRelations);
  assert.deepEqual([...G4A_U05_P05F13_EXCLUDED_RELATIONS],preflight.q013ScopeLock.excludedRelations);
  for(const spec of G4A_U05_P05F13_PATTERN_SPECS){
    assert.equal(spec.questionMode,"diagram");
    assert.equal(spec.requiresDiagramRepresentation,true);
    assert.equal(spec.applicationAllowed,false);
    assert.equal(spec.sideClassificationAllowed,false);
    assert.equal(spec.angleClassificationAllowed,false);
    assert.equal(spec.triangleInequalityAllowed,false);
    assert.equal(spec.congruenceCorrespondenceAllowed,false);
    assert.equal(spec.constructionAllowed,false);
  }
});

test("P05F W5 Q013 proves 240 distinct validated questions for every PatternSpec",()=>{
  for(const specId of G4A_U05_P05F13_SPEC_IDS){
    const generated=generateG4AU05P05F13Questions(options({patternSpecIds:[specId],questionCount:240,generationSeed:`q013-capacity-${specId}`}));
    assert.equal(generated.ok,true,`${specId}: ${generated.errors.join(",")}`);
    assert.equal(generated.questions.length,240);
    assert.equal(new Set(generated.questions.map(q=>q.questionSignature)).size,240);
    for(const question of generated.questions){
      assert.equal(validateG4AU05P05F13Question(question).ok,true);
      assert.equal(validateTriangleElementsNamingDiagramModel(question.geometryDiagram).ok,true);
      assert.equal(question.geometryDiagram.segmentCount,3);
      assert.equal(question.geometryDiagram.closed,true);
      assert.equal(question.geometryDiagram.vertices.length,3);
      assert.equal(question.metadata.sourceMetadataMismatchPreserved,true);
      assert.equal(question.metadata.q014OrLaterTouched,false);
      for(const term of FORBIDDEN)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false);
    }
  }
});

test("P05F W5 Q013 balanced generation and public binding expose only bounded diagram product",()=>{
  const generated=generateG4AU05P05F13Questions(options({questionCount:25,generationSeed:"q013-balanced"}));
  assert.equal(generated.ok,true);
  assert.deepEqual(generated.allocation.map(row=>row.count),[5,5,5,5,5]);
  const plan=buildBatchABrowserPlan(options({questionCount:24,generationSeed:"q013-plan"}));
  assert.equal(requestsP05F13(options()),true);
  assert.equal(plan.questionMode,"diagram");
  assert.equal(plan.questionCountMax,240);
  assert.equal(plan.genericFallback,false);
  assert.equal(plan.freeFormAI,false);
  const binding=resolvePublicUiCapabilityBinding(options());
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.equal(binding.questionCount.max,240);
  assert.deepEqual(binding.patternSpecIds,G4A_U05_P05F13_SPEC_IDS);
  assert.equal(binding.applicationImplementationAllowed,false);
  assert.equal(binding.triangleSideClassificationAdmission,false);
  assert.equal(binding.triangleAngleClassificationAdmission,false);
  assert.equal(binding.triangleInequalityAdmission,false);
  assert.equal(binding.congruentTriangleCorrespondenceAdmission,false);
  assert.equal(binding.geometryConstructionAdmission,false);
  assert.equal(binding.mixedQuestionModeAdmission,false);
  assert.equal(auditPublicUiCapabilityBinding().ok,true);
});

test("P05F W5 Q013 public selector admits target and keeps all four sibling semantics hidden",()=>{
  assert.equal(auditP05F13PublicSelectorComposition().ok,true);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount,52);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,327);
  const source=listBatchAKnowledgePointAvailabilityBySource(G4A_U05_P05F13_SOURCE_ID);
  assert.equal(source.visibleCount,1);
  assert.equal(source.hiddenPendingCount,4);
  assert.equal(source.notSelectableCount,4);
  assert.ok(source.visibleKnowledgePointIds.includes(G4A_U05_P05F13_KP_ID));
  for(const sibling of G4A_U05_P05F13_FUTURE_KP_IDS){
    assert.equal(source.visibleKnowledgePointIds.includes(sibling),false);
    assert.ok(source.hiddenPendingKnowledgePointIds.includes(sibling));
    assert.ok(source.notSelectableKnowledgePointIds.includes(sibling));
  }
});

test("P05F W5 Q013 worksheet projects diagrams answers pagination and HTML rendering",()=>{
  const result=buildP05F13Worksheet(options({questionCount:24,generationSeed:"q013-worksheet",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
  assert.equal(result.ok,true,result.errors?.join(","));
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,24);
  assert.equal(doc.questionDisplayModels.length,24);
  assert.equal(doc.answerKeyItems.length,24);
  assert.equal(doc.questionPages.length,3);
  assert.equal(doc.answerKeyPages.length,3);
  assert.equal(doc.summary.diagramQuestionCount,24);
  assert.equal(doc.summary.applicationQuestionCount,0);
  assert.equal(doc.metadata.q014OrLaterTouched,false);
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/worksheet-triangle-elements-naming-diagram/g)??[]).length,48);
  assert.equal((html.match(/data-representation="triangle-elements-naming-diagram"/g)??[]).length,48);
});

test("P05F W5 Q013 scope guard and static relative imports fail closed",()=>{
  for(const [key,value] of Object.entries(implementation.scopeGuard))assert.equal(value,false,`${key} must remain false`);
  const files=[
    "site/modules/curriculum/registry/g4a-u05-triangle-elements-naming-selector-projection-p05f13.js",
    "site/modules/curriculum/registry/batch-a-selector-p05f13-extension.js",
    "site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p05f13.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",
    "site/modules/curriculum/batch-a/g4a-u05-triangle-elements-naming-runtime-p05f13.js",
    "site/modules/curriculum/batch-a/batch-a-browser-generator-p05f13.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f13-extension.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    "site/modules/renderer/triangle-elements-naming-diagram.js",
    "site/modules/renderer/html-renderer.js"
  ];
  const importPattern=/(?:import|export)\s+(?:[^'\";]+?\s+from\s+)?[\"'](\.{1,2}\/[^\"']+)[\"']/g;
  for(const file of files){
    const absolute=path.join(ROOT,file);
    assert.equal(existsSync(absolute),true,`missing touched file ${file}`);
    const text=readFileSync(absolute,"utf8");
    for(const match of text.matchAll(importPattern)){
      const target=path.resolve(path.dirname(absolute),match[1]);
      assert.equal(existsSync(target),true,`${file} imports missing ${match[1]}`);
    }
  }
});
