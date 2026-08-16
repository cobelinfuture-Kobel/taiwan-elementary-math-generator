import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

import {exactMixedDomainCompare} from "../../site/modules/curriculum/public/shared-mixed-domain-normalizer-p03f32.js";
import {G6B_U01_P03F32_SPEC_IDS} from "../../site/modules/curriculum/registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";
import {BATCH_A_SELECTOR_AVAILABILITY,auditP03F41PublicSelectorComposition,listBatchAKnowledgePointAvailabilityBySource,listVisibleBatchAKnowledgePoints,resolveVisiblePatternSpecIdsForKnowledgePoint} from "../../site/modules/curriculum/registry/batch-a-selector-p03f41-extension.js";
import {G6B_U01_P03F41_GROUP_ID,G6B_U01_P03F41_KP_ID,G6B_U01_P03F41_SOURCE_ID,G6B_U01_P03F41_SPEC_ID,P03F41_HIDDEN_SIBLING_KP_IDS,P03F41_REQUIRED_CAPABILITY_IDS,auditG6BU01P03F41SelectorProjection} from "../../site/modules/curriculum/registry/g6b-u01-rank9-mixed-domain-order-selector-projection-p03f41.js";
import {G6B_U01_P03F41_PATTERN_DEFINITION,validateP03F41PatternDefinitions} from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f41-extension.js";
import {buildBatchABrowserPlan} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f41.js";
import {generateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f41.js";
import {validateBatchABrowserPlan,validateBatchABrowserQuestions} from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f41.js";
import {buildBatchABrowserWorksheetDocument} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f41-extension.js";

const authority=JSON.parse(readFileSync(new URL("../../data/curriculum/full-product/p03f/slice041-g6b-u01-rank9-mixed-domain-order-authority.json",import.meta.url),"utf8"));

test("P03F41 authority binds q041 to the R02 mixed-domain order candidate only",()=>{
  assert.equal(authority.queueAuthority.queuePosition,41);
  assert.equal(authority.queueAuthority.sliceId,"p03e_q041_r9_g6b_u01_6b01_profile_mixed_number_domain_c1");
  assert.equal(authority.queueAuthority.previousSliceD0Complete,true);
  assert.equal(authority.sourceAuthority.sourceNodeId,G6B_U01_P03F41_SOURCE_ID);
  assert.deepEqual(authority.knowledgePoints.map(row=>row.knowledgePointId),[G6B_U01_P03F41_KP_ID]);
  assert.deepEqual(authority.knowledgePoints[0].requiredW3CapabilityIds,P03F41_REQUIRED_CAPABILITY_IDS);
  assert.equal(authority.patternSurfaces[0].patternGroupId,G6B_U01_P03F41_GROUP_ID);
  assert.equal(authority.patternSurfaces[0].patternSpecId,G6B_U01_P03F41_SPEC_ID);
  assert.equal(authority.formalMappingBoundary.floatingPointApproximationAllowed,false);
  assert.equal(authority.formalMappingBoundary.arithmeticMutationAllowed,false);
  assert.equal(authority.productBoundary.applicationExpansionAllowed,false);
  assert.equal(authority.productBoundary.slice047LeakAllowed,false);
});

test("P03F41 promotes one existing-source KP without changing public source count",()=>{
  assert.equal(auditG6BU01P03F41SelectorProjection().ok,true);
  const audit=auditP03F41PublicSelectorComposition();
  assert.equal(audit.ok,true,JSON.stringify(audit.errors));
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.sourceCount,33);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount,33);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.visibleCount,239);
  const availability=listBatchAKnowledgePointAvailabilityBySource(G6B_U01_P03F41_SOURCE_ID);
  assert.deepEqual([availability.visibleCount,availability.hiddenPendingCount,availability.notSelectableCount],[2,3,3]);
  const sourceRows=listVisibleBatchAKnowledgePoints().filter(row=>row.sourceId===G6B_U01_P03F41_SOURCE_ID);
  assert.equal(sourceRows.length,2);
  assert.ok(sourceRows.some(row=>row.knowledgePointId===G6B_U01_P03F41_KP_ID));
  assert.ok(P03F41_HIDDEN_SIBLING_KP_IDS.every(id=>!sourceRows.some(row=>row.knowledgePointId===id)));
  assert.deepEqual(resolveVisiblePatternSpecIdsForKnowledgePoint(G6B_U01_P03F41_KP_ID,"numeric"),[G6B_U01_P03F41_SPEC_ID]);
});

test("P03F41 PatternSpec uses the shared exact mixed-domain comparison contract",()=>{
  const audit=validateP03F41PatternDefinitions();
  assert.equal(audit.ok,true,JSON.stringify(audit.errors));
  assert.equal(G6B_U01_P03F41_PATTERN_DEFINITION.operationFamilyId,"mixed_domain_compare");
  assert.equal(G6B_U01_P03F41_PATTERN_DEFINITION.requestedUnknownRole,"relation");
  assert.deepEqual(G6B_U01_P03F41_PATTERN_DEFINITION.givenRoles,["decimalOperand","fractionOperand"]);
  assert.equal(G6B_U01_P03F41_PATTERN_DEFINITION.numericDomain.exactRationalComparisonRequired,true);
  assert.equal(G6B_U01_P03F41_PATTERN_DEFINITION.numericDomain.arithmeticRequired,false);
});

test("P03F41 single-KP runtime emits exact cross-domain < = > witnesses with both orientations",()=>{
  const options={sourceId:G6B_U01_P03F41_SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G6B_U01_P03F41_KP_ID],selectedPatternGroupIds:[G6B_U01_P03F41_GROUP_ID],questionCount:24,generationSeed:"p03f41-focused",includeAnswerKey:true};
  const plan=buildBatchABrowserPlan(options);
  assert.deepEqual(plan.patternSpecIds,[G6B_U01_P03F41_SPEC_ID]);
  assert.equal(plan.genericFallbackAllowed,false);
  assert.equal(validateBatchABrowserPlan(plan).ok,true);
  const generated=generateBatchABrowserQuestions({...options,plan});
  assert.equal(generated.ok,true,JSON.stringify(generated.errors));
  assert.equal(generated.questions.length,24);
  const validation=validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok,true,JSON.stringify(validation.errors));
  assert.equal(new Set(generated.questions.map(question=>question.blankedDisplayText)).size,24);
  const relationCounts=Object.fromEntries(["<","=",">"].map(symbol=>[symbol,generated.questions.filter(question=>question.answerText===symbol).length]));
  assert.ok(relationCounts["<"]>0&&relationCounts["="]>0&&relationCounts[">"]>0,JSON.stringify(relationCounts));
  assert.ok(generated.questions.some(question=>question.decimalLeft===true));
  assert.ok(generated.questions.some(question=>question.decimalLeft===false));
  for(const question of generated.questions){
    assert.equal(question.metadata.mixedDomainNormalizerId,"shared-mixed-domain-normalizer-p03f32-v2");
    assert.deepEqual(question.metadata.requiredCapabilityIds,P03F41_REQUIRED_CAPABILITY_IDS);
    assert.equal(question.metadata.contextAuthority,null);
    const fraction={numerator:question.fractionNumerator,denominator:question.fractionDenominator};
    const exact=question.decimalLeft?exactMixedDomainCompare({leftDomain:"DECIMAL",leftValue:question.decimal,rightDomain:"FRACTION",rightValue:fraction}):exactMixedDomainCompare({leftDomain:"FRACTION",leftValue:fraction,rightDomain:"DECIMAL",rightValue:question.decimal});
    assert.equal(question.finalAnswer.relation,exact.relation);
    assert.equal(question.finalAnswer.comparison,exact.comparison);
    assert.equal(question.finalAnswer.exact,true);
  }
});

test("P03F41 sourceUnit consumes existing Slice032 conversion plus the new compare PatternSpec",()=>{
  const options={sourceId:G6B_U01_P03F41_SOURCE_ID,selectionMode:"sourceUnit",questionCount:24,generationSeed:"p03f41-source-unit",includeAnswerKey:true,printLayout:{columns:2,rowsPerPage:4,showAnswerKeyPage:true}};
  const plan=buildBatchABrowserPlan(options);
  assert.deepEqual(new Set(plan.patternSpecIds),new Set([...G6B_U01_P03F32_SPEC_IDS,G6B_U01_P03F41_SPEC_ID]));
  assert.equal(plan.requestedKnowledgePointIds.length,2);
  const generated=generateBatchABrowserQuestions({...options,plan});
  assert.equal(generated.ok,true,JSON.stringify(generated.errors));
  assert.equal(generated.questions.length,24);
  for(const patternSpecId of [...G6B_U01_P03F32_SPEC_IDS,G6B_U01_P03F41_SPEC_ID])assert.ok(generated.questions.some(question=>question.patternSpecId===patternSpecId),patternSpecId);
  const validation=validateBatchABrowserQuestions(generated.questions);
  assert.equal(validation.ok,true,JSON.stringify(validation.errors));
  const worksheet=buildBatchABrowserWorksheetDocument(options);
  assert.equal(worksheet.ok,true,JSON.stringify(worksheet.errors));
  assert.equal(worksheet.worksheetDocument.questionCount,24);
  assert.equal(worksheet.worksheetDocument.questionPages.length,3);
  assert.equal(worksheet.worksheetDocument.answerKeyPages.length,3);
  assert.deepEqual(new Set(worksheet.worksheetDocument.metadata.knowledgePointIds),new Set(["kp_g6b_u01_decimal_fraction_conversion",G6B_U01_P03F41_KP_ID]));
  assert.equal(worksheet.worksheetDocument.metadata.applicationExpansion,false);
  assert.equal(worksheet.worksheetDocument.metadata.arithmeticExpansion,false);
  assert.equal(worksheet.worksheetDocument.metadata.slice047Expansion,false);
});
