import test from "node:test";
import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

import {buildBatchABrowserWorksheetDocument as buildP05F12Worksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f12-extension.js";
import {buildBatchABrowserPlan,requestsP05F12} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f12.js";
import {generateG3BU05P05F12Questions,validateG3BU05P05F12Question} from "../../site/modules/curriculum/batch-a/g3b-u05-area-grid-counting-runtime-p05f12.js";
import {renderWorksheetDocumentToHtml} from "../../site/modules/renderer/html-renderer.js";
import {validateAreaGridCountingDiagramModel} from "../../site/modules/renderer/area-grid-counting-diagram.js";
import {
  G3B_U05_P05F12_EXCLUDED_RELATIONS,
  G3B_U05_P05F12_FORMAL_MAPPING,
  G3B_U05_P05F12_INCLUDED_RELATIONS,
  G3B_U05_P05F12_KP_ID,
  G3B_U05_P05F12_PATTERN_GROUP_ID,
  G3B_U05_P05F12_PATTERN_SPECS,
  G3B_U05_P05F12_REQUIRED_CAPABILITY_IDS,
  G3B_U05_P05F12_SOURCE_ID,
  G3B_U05_P05F12_SPEC_IDS,
  auditG3BU05P05F12SelectorProjection,
} from "../../site/modules/curriculum/registry/g3b-u05-area-grid-counting-selector-projection-p05f12.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP05F12PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../site/modules/curriculum/registry/batch-a-selector-p05f12-extension.js";
import {auditPublicUiCapabilityBinding,resolvePublicUiCapabilityBinding} from "../../site/modules/curriculum/public/public-ui-capability-binding-p05f12.js";

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const implementation=JSON.parse(readFileSync(path.join(ROOT,"data/curriculum/full-product/p05f/q012-g3b-u05-area-grid-counting-implementation.json"),"utf8"));
const preflight=JSON.parse(readFileSync(path.join(ROOT,"data/curriculum/full-product/p05f/q012-g3b-u05-area-grid-counting-source-authority-preflight.json"),"utf8"));
const EXPECTED_CAPS=["cap_geometry_diagram_representation","cap_geometry_domain_validator","cap_geometry_formula_evaluation","cap_geometry_property_reasoning"];
const FORBIDDEN=["剪拼","周長相同","長方形面積公式","正方形面積公式","估測","應用題"];

function generationOptions(extra={}){
  return {
    sourceId:G3B_U05_P05F12_SOURCE_ID,
    selectionMode:"singleKnowledgePoint",
    selectedKnowledgePointIds:[G3B_U05_P05F12_KP_ID],
    selectedPatternGroupIds:[G3B_U05_P05F12_PATTERN_GROUP_ID],
    ...extra,
  };
}

test("P05F W5 Q012 implementation remains bound to the exact frozen queue and merged preflight",()=>{
  assert.equal(implementation.taskId,"P05F_W5DirectProductVerticalSlice012Implementation");
  assert.equal(implementation.status,"IMPLEMENTATION_MATERIALIZED_AWAITING_FOCUSED_CI");
  assert.equal(implementation.queueAuthority.queuePosition,12);
  assert.equal(implementation.queueAuthority.sliceId,"p05e_q012_r1_g3b_u05_3b05_profile_geometry_formula_c1");
  assert.equal(implementation.queueAuthority.sourceId,G3B_U05_P05F12_SOURCE_ID);
  assert.equal(implementation.queueAuthority.runtimeProfileId,"profile_geometry_formula");
  assert.deepEqual(implementation.queueAuthority.knowledgePointIds,[G3B_U05_P05F12_KP_ID]);
  assert.deepEqual(implementation.queueAuthority.requiredW5CapabilityIds,EXPECTED_CAPS);
  assert.equal(preflight.status,"PASS_SOURCE_AUTHORITY_PREFLIGHT");
  assert.equal(preflight.queueAuthority.queuePosition,12);
  assert.equal(preflight.queueAuthority.sliceId,implementation.queueAuthority.sliceId);
  assert.deepEqual(preflight.queueAuthority.knowledgePointIds,[G3B_U05_P05F12_KP_ID]);
  assert.deepEqual(preflight.queueAuthority.requiredW5CapabilityIds,EXPECTED_CAPS);
  assert.equal(preflight.previousSliceD0Evidence.status,"PASS_E6_D0_COMPLETE");
  assert.equal(preflight.previousSliceD0Evidence.productMergeSha,"8f92fbc3faa8a6ca1e3af45d558dfe1e8e18b218");
  assert.equal(preflight.previousSliceD0Evidence.exactPagesRunId,"34040879338");
});

test("P05F W5 Q012 FormalMapping and five PatternSpecs match the preflight scope exactly",()=>{
  assert.equal(auditG3BU05P05F12SelectorProjection().ok,true);
  assert.equal(G3B_U05_P05F12_FORMAL_MAPPING.mappingId,"fm_g3b_u05_area_grid_counting_p05f12");
  assert.equal(G3B_U05_P05F12_FORMAL_MAPPING.knowledgePointId,G3B_U05_P05F12_KP_ID);
  assert.equal(G3B_U05_P05F12_FORMAL_MAPPING.relationFamily,"AREA_GRID_COUNTING");
  assert.deepEqual(G3B_U05_P05F12_FORMAL_MAPPING.includedRelations,G3B_U05_P05F12_INCLUDED_RELATIONS);
  assert.deepEqual(G3B_U05_P05F12_FORMAL_MAPPING.excludedRelations,G3B_U05_P05F12_EXCLUDED_RELATIONS);
  assert.deepEqual(G3B_U05_P05F12_FORMAL_MAPPING.requiredCapabilityIds,G3B_U05_P05F12_REQUIRED_CAPABILITY_IDS);
  assert.equal(G3B_U05_P05F12_PATTERN_SPECS.length,5);
  assert.equal(new Set(G3B_U05_P05F12_SPEC_IDS).size,5);
  assert.deepEqual([...G3B_U05_P05F12_INCLUDED_RELATIONS],preflight.q012ScopeLock.includedRelations);
  assert.deepEqual([...G3B_U05_P05F12_EXCLUDED_RELATIONS],preflight.q012ScopeLock.excludedRelations);
  for(const spec of G3B_U05_P05F12_PATTERN_SPECS){
    assert.equal(spec.questionMode,"diagram");
    assert.equal(spec.requiresDiagramRepresentation,true);
    assert.equal(spec.applicationAllowed,false);
    assert.equal(spec.irregularGridDecompositionAllowed,false);
    assert.equal(spec.cutRearrangeConservationAllowed,false);
    assert.equal(spec.samePerimeterComparisonAllowed,false);
    assert.equal(spec.rectangleSquareFormulaAllowed,false);
    assert.equal(spec.realWorldEstimationAllowed,false);
  }
});

test("P05F W5 Q012 proves 240 distinct validated questions for every PatternSpec",()=>{
  for(const specId of G3B_U05_P05F12_SPEC_IDS){
    const generated=generateG3BU05P05F12Questions(generationOptions({patternSpecIds:[specId],questionCount:240,generationSeed:`q012-capacity-${specId}`}));
    assert.equal(generated.ok,true,`${specId}: ${generated.errors.join(",")}`);
    assert.equal(generated.questions.length,240);
    assert.equal(new Set(generated.questions.map(q=>q.questionSignature)).size,240);
    for(const question of generated.questions){
      assert.equal(validateG3BU05P05F12Question(question).ok,true);
      assert.equal(validateAreaGridCountingDiagramModel(question.geometryDiagram).ok,true);
      assert.equal(question.geometryDiagram.areaCm2,question.geometryDiagram.wholeCount+question.geometryDiagram.halfCount/2);
      assert.equal(question.geometryDiagram.noOverlap,true);
      assert.equal(question.geometryDiagram.noGap,true);
      assert.equal(question.metadata.q003SemanticsTouched,false);
      assert.equal(question.metadata.applicationContextUsed,false);
      assert.equal(question.metadata.generalIrregularGridDecompositionUsed,false);
      assert.equal(question.metadata.cutRearrangeAreaConservationUsed,false);
      assert.equal(question.metadata.samePerimeterAreaComparisonUsed,false);
      assert.equal(question.metadata.rectangleSquareAreaFormulaUsed,false);
      assert.equal(question.metadata.realWorldAreaEstimationUsed,false);
      for(const term of FORBIDDEN)assert.equal(`${question.promptText} ${question.answerText}`.includes(term),false);
    }
  }
});

test("P05F W5 Q012 balanced multi-spec generation covers whole and half-unit grid modes without admitting mixed KP mode",()=>{
  const generated=generateG3BU05P05F12Questions(generationOptions({patternSpecIds:[...G3B_U05_P05F12_SPEC_IDS],questionCount:25,generationSeed:"q012-balanced"}));
  assert.equal(generated.ok,true);
  assert.deepEqual(generated.allocation.map(row=>row.count),[5,5,5,5,5]);
  assert.deepEqual([...new Set(generated.questions.map(q=>q.geometryDiagram.diagramMode))].sort(),["WHOLE_AND_HALF_GRID","WHOLE_UNIT_GRID"]);
  assert.equal(requestsP05F12({sourceId:G3B_U05_P05F12_SOURCE_ID,selectionMode:"sourceUnit"}),false);
  assert.equal(requestsP05F12({sourceId:G3B_U05_P05F12_SOURCE_ID,selectionMode:"mixedKnowledgePointsSameUnit",selectedKnowledgePointIds:[G3B_U05_P05F12_KP_ID]}),false);
  assert.equal(requestsP05F12({sourceId:G3B_U05_P05F12_SOURCE_ID,selectionMode:"mixedKnowledgePointsCrossUnit",selectedKnowledgePointIds:[G3B_U05_P05F12_KP_ID]}),false);
});

test("P05F W5 Q012 browser plan and public binding expose only the bounded diagram product",()=>{
  const options=generationOptions({questionCount:24,generationSeed:"q012-plan"});
  assert.equal(requestsP05F12(options),true);
  const plan=buildBatchABrowserPlan(options);
  assert.equal(plan.sourceId,G3B_U05_P05F12_SOURCE_ID);
  assert.equal(plan.selectionMode,"singleKnowledgePoint");
  assert.deepEqual(plan.selectedKnowledgePointIds,[G3B_U05_P05F12_KP_ID]);
  assert.deepEqual(plan.selectedPatternGroupIds,[G3B_U05_P05F12_PATTERN_GROUP_ID]);
  assert.equal(plan.questionMode,"diagram");
  assert.equal(plan.questionCountMax,240);
  assert.equal(plan.genericFallback,false);
  assert.equal(plan.freeFormAI,false);
  const binding=resolvePublicUiCapabilityBinding(options);
  assert.equal(binding.blocked,false);
  assert.equal(binding.questionType,"diagram");
  assert.equal(binding.questionCount.max,240);
  assert.deepEqual(binding.patternSpecIds,G3B_U05_P05F12_SPEC_IDS);
  assert.equal(binding.applicationImplementationAllowed,false);
  assert.equal(binding.generalIrregularGridDecompositionAdmission,false);
  assert.equal(binding.cutRearrangeAreaConservationAdmission,false);
  assert.equal(binding.samePerimeterAreaComparisonAdmission,false);
  assert.equal(binding.rectangleSquareAreaFormulaAdmission,false);
  assert.equal(binding.realWorldAreaEstimationAdmission,false);
  assert.equal(binding.mixedQuestionModeAdmission,false);
  assert.equal(auditPublicUiCapabilityBinding().ok,true);
});

test("P05F W5 Q012 public selector promotes exactly one same-source KP while preserving remaining siblings",()=>{
  assert.equal(auditP05F12PublicSelectorComposition().ok,true);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount,51);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,326);
  const source=listBatchAKnowledgePointAvailabilityBySource(G3B_U05_P05F12_SOURCE_ID);
  assert.equal(source.visibleCount,2);
  assert.equal(source.hiddenPendingCount,3);
  assert.equal(source.notSelectableCount,3);
  assert.ok(source.visibleKnowledgePointIds.includes("kp_area_square_centimeter_unit"));
  assert.ok(source.visibleKnowledgePointIds.includes(G3B_U05_P05F12_KP_ID));
  for(const sibling of ["kp_area_conservation_cut_rearrange","kp_irregular_grid_area","kp_area_compare_same_perimeter"]){
    assert.equal(source.visibleKnowledgePointIds.includes(sibling),false);
    assert.ok(source.hiddenPendingKnowledgePointIds.includes(sibling));
    assert.ok(source.notSelectableKnowledgePointIds.includes(sibling));
  }
});

test("P05F W5 Q012 worksheet projects validated diagrams, answers, pagination and HTML rendering",()=>{
  const result=buildP05F12Worksheet(generationOptions({questionCount:24,generationSeed:"q012-worksheet",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}}));
  assert.equal(result.ok,true,result.errors?.join(","));
  const doc=result.worksheetDocument;
  assert.equal(doc.questionCount,24);
  assert.equal(doc.questionDisplayModels.length,24);
  assert.equal(doc.answerKeyItems.length,24);
  assert.equal(doc.questionPages.length,3);
  assert.equal(doc.answerKeyPages.length,3);
  assert.equal(doc.summary.diagramQuestionCount,24);
  assert.equal(doc.summary.applicationQuestionCount,0);
  assert.equal(doc.metadata.q003SemanticsTouched,false);
  assert.equal(doc.metadata.applicationContextUsed,false);
  const html=renderWorksheetDocumentToHtml(doc,{stylesheetHref:""});
  assert.equal((html.match(/worksheet-area-grid-counting-diagram/g)??[]).length,48);
  assert.equal((html.match(/data-representation="area-grid-counting-diagram"/g)??[]).length,48);
  assert.ok(html.includes("每1小格 = 1 cm²"));
});

test("P05F W5 Q012 implementation scope guard and static relative imports fail closed",()=>{
  for(const [key,value] of Object.entries(implementation.scopeGuard))assert.equal(value,false,`${key} must remain false`);
  const files=[
    "site/modules/curriculum/registry/g3b-u05-area-grid-counting-selector-projection-p05f12.js",
    "site/modules/curriculum/registry/batch-a-selector-p05f12-extension.js",
    "site/modules/curriculum/registry/batch-a-selector-p04f33-extension.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p05f12.js",
    "site/modules/curriculum/public/public-ui-capability-binding-p04f33.js",
    "site/modules/curriculum/batch-a/g3b-u05-area-grid-counting-runtime-p05f12.js",
    "site/modules/curriculum/batch-a/batch-a-browser-generator-p05f12.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p05f12-extension.js",
    "site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js",
    "site/modules/renderer/area-grid-counting-diagram.js",
    "site/modules/renderer/html-renderer.js",
  ];
  const importPattern=/(?:import|export)\s+(?:[^'";]+?\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/g;
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
