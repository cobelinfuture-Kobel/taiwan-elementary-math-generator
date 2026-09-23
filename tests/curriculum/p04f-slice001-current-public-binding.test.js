import test from "node:test";
import assert from "node:assert/strict";

import {buildBatchABrowserWorksheetDocument as buildStableR2EWorksheet} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {listCurrentFullProductPublicSourceUnits as listP04F1SourceUnits} from "../../site/modules/curriculum/batch-a/source-units-p04f1-extension.js";
import {resolvePublicUiCapabilityBinding,auditPublicUiCapabilityBinding,PUBLIC_UI_SURFACES} from "../../site/modules/curriculum/public/public-ui-capability-binding-p04f1.js";
import {parseQueryState} from "../../site/assets/browser/state/query-state.js";
import {G3A_U04_P04F1_GROUP_ID,G3A_U04_P04F1_KP_ID,G3A_U04_P04F1_SOURCE_ID} from "../../site/modules/curriculum/registry/g3a-u04-ruler-reading-selector-projection-p04f1.js";

const plan={sourceId:G3A_U04_P04F1_SOURCE_ID,selectionMode:"sourceUnit",questionMode:"numeric",questionCount:8,generationSeed:"p04f1-stable-public",includeAnswerKey:true,printLayout:{paperSize:"A4",columns:2,rowsPerPage:4,showAnswerKeyPage:true}};

test("P04F1 successor source registry exposes exactly the new G3A-U04 source",()=>{const units=listP04F1SourceUnits();assert.equal(units.length,35);const unit=units.find(row=>row.sourceId===G3A_U04_P04F1_SOURCE_ID);assert.ok(unit);assert.equal(unit.unitCode,"3A-U04");assert.equal(unit.title,"毫米與數線");});

test("P04F1 stable r2e worksheet dispatcher reaches the ruler-reading runtime",()=>{const result=buildStableR2EWorksheet(plan);assert.equal(result.ok,true,JSON.stringify(result.errors));assert.equal(result.worksheetDocument.batchA.sourceId,G3A_U04_P04F1_SOURCE_ID);assert.equal(result.worksheetDocument.questionCount,8);assert.ok(result.worksheetDocument.questionDisplayModels.every(row=>row.numberLine?.kind==="measurement_ruler"));assert.equal(result.worksheetDocument.metadata.w4Slice001Expansion,true);});

test("P04F1 public capability binding is ready on Classic, Pixel and fallback surfaces",()=>{const audit=auditPublicUiCapabilityBinding();assert.equal(audit.ok,true,JSON.stringify(audit.errors));for(const surfaceId of Object.values(PUBLIC_UI_SURFACES)){const binding=resolvePublicUiCapabilityBinding({sourceId:G3A_U04_P04F1_SOURCE_ID,surfaceId,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[G3A_U04_P04F1_KP_ID],selectedPatternGroupIds:[G3A_U04_P04F1_GROUP_ID]});assert.equal(binding.blocked,false);assert.equal(binding.questionType,"numeric");assert.equal(binding.questionCount.max,39);assert.equal(binding.directTextbookScaleWitness,true);assert.deepEqual(binding.compatiblePatternGroupIds,[G3A_U04_P04F1_GROUP_ID]);}});

test("P04F1 query-state preserves the q001 single-KP deep link",()=>{const search=`?sourceId=${G3A_U04_P04F1_SOURCE_ID}&selectionMode=singleKnowledgePoint&kp=${G3A_U04_P04F1_KP_ID}&pg=${G3A_U04_P04F1_GROUP_ID}&questionCount=8&answerKey=1&generationSeed=p04f1-deeplink&columns=2&rowsPerPage=4`;const state=parseQueryState(search);assert.equal(state.sourceId,G3A_U04_P04F1_SOURCE_ID);assert.equal(state.selectionMode,"singleKnowledgePoint");assert.deepEqual(state.selectedKnowledgePointIds,[G3A_U04_P04F1_KP_ID]);assert.deepEqual(state.selectedPatternGroupIds,[G3A_U04_P04F1_GROUP_ID]);assert.equal(state.selectorWarnings.length,0);});
