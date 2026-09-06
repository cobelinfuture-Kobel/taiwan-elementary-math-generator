import test from "node:test";
import assert from "node:assert/strict";

import {generateG3AU05P05F1Questions,validateG3AU05P05F1Question} from "../../site/modules/curriculum/batch-a/g3a-u05-angle-parts-runtime-p05f1.js";
import {buildBatchABrowserPlan as buildP05F10Plan,requestsP05F10} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f10.js";
import {requestsP05F1} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p05f1.js";
import {getVisibleBatchAKnowledgePoint,listBatchAKnowledgePointAvailabilityBySource} from "../../site/modules/curriculum/registry/batch-a-selector-p05f10-extension.js";

const SOURCE_ID="g3a_u05_3a05",Q001_KP="kp_angle_parts_identification",Q010_KP="kp_right_angle_recognition";

test("P05F W5 Q010 preserves Q001 angle-parts deterministic runtime semantics",()=>{const result=generateG3AU05P05F1Questions({questionCount:12,generationSeed:"p05f10-q001-protection"});assert.equal(result.ok,true,result.errors.join("\n"));assert.equal(result.questions.length,12);assert.equal(new Set(result.questions.map(q=>q.questionSignature)).size,12);for(const q of result.questions){assert.equal(validateG3AU05P05F1Question(q).ok,true);assert.equal(q.knowledgePointId,Q001_KP);assert.equal(q.promptText.includes("直角"),false);}});

test("P05F W5 Q010 does not steal the existing G3A-U05 sourceUnit route from Q001",()=>{const sourceUnit={sourceId:SOURCE_ID,selectionMode:"sourceUnit",questionCount:12,generationSeed:"p05f10-source-unit-protection"};assert.equal(requestsP05F10(sourceUnit),false);assert.equal(requestsP05F1(sourceUnit),true);const plan=buildP05F10Plan(sourceUnit);assert.equal(plan.sourceId,SOURCE_ID);assert.deepEqual(plan.selectedKnowledgePointIds,[Q001_KP]);assert.equal(plan.questionMode,"diagram");assert.equal(plan.selectionMode,"sourceUnit");});

test("P05F W5 Q010 explicit selection remains isolated from Q001 and future same-source leaves",()=>{const q010={sourceId:SOURCE_ID,selectionMode:"singleKnowledgePoint",selectedKnowledgePointIds:[Q010_KP]};assert.equal(requestsP05F10(q010),true);assert.equal(requestsP05F1(q010),false);assert.equal(getVisibleBatchAKnowledgePoint(Q001_KP)?.knowledgePointId,Q001_KP);assert.equal(getVisibleBatchAKnowledgePoint(Q010_KP)?.knowledgePointId,Q010_KP);for(const future of ["kp_acute_obtuse_angle_qualitative_classification","kp_rectangle_square_right_angle_properties"])assert.equal(getVisibleBatchAKnowledgePoint(future),null);const source=listBatchAKnowledgePointAvailabilityBySource(SOURCE_ID);assert.deepEqual(source.visibleKnowledgePointIds,[Q001_KP,Q010_KP]);assert.deepEqual(source.hiddenPendingKnowledgePointIds,["kp_acute_obtuse_angle_qualitative_classification","kp_rectangle_square_right_angle_properties"]);});
