import test from "node:test";
import assert from "node:assert/strict";
import {
  generateG4AU05P05F24Questions,
  validateG4AU05P05F24Question,
} from "../../site/modules/curriculum/batch-a/g4a-u05-triangle-side-classification-runtime-p05f24.js";
import {G4A_U05_P05F24_KP_ID} from "../../site/modules/curriculum/registry/g4a-u05-triangle-side-classification-selector-projection-p05f24.js";

const SEED="live-q024-side-classification";
const rotations=questions=>new Set(questions.map(question=>question.geometryDiagram.rotationDeg)).size;

test("Q024 failed 60-item live sample was an E2E sampling mismatch, not a product semantic failure",()=>{
  const generated=generateG4AU05P05F24Questions({knowledgePointId:G4A_U05_P05F24_KP_ID,questionCount:60,generationSeed:SEED});
  assert.equal(generated.ok,true,generated.errors.join(","));
  assert.equal(generated.questions.length,60);
  assert.equal(new Set(generated.questions.map(question=>question.questionSignature)).size,60);
  assert.ok(generated.questions.every(question=>validateG4AU05P05F24Question(question).ok));
  assert.equal(rotations(generated.questions),11);
  assert.ok(rotations(generated.questions)<20);
});

test("Q024 repaired 120-item live sample satisfies the existing >=20 orientation-diversity gate without changing product semantics",()=>{
  const generated=generateG4AU05P05F24Questions({knowledgePointId:G4A_U05_P05F24_KP_ID,questionCount:120,generationSeed:SEED});
  assert.equal(generated.ok,true,generated.errors.join(","));
  assert.equal(generated.questions.length,120);
  assert.equal(new Set(generated.questions.map(question=>question.questionSignature)).size,120);
  assert.equal(new Set(generated.questions.map(question=>`${question.promptText}|${question.geometryDiagram.rotationDeg}|${question.geometryDiagram.sideClass}`)).size,120);
  assert.ok(generated.questions.every(question=>validateG4AU05P05F24Question(question).ok));
  assert.ok(rotations(generated.questions)>=20);
  assert.deepEqual([...new Set(generated.questions.map(question=>question.answerText))].sort(),["不等邊三角形","等腰三角形","等邊三角形"].sort());
  assert.ok(generated.questions.every(question=>question.geometryDiagram.classificationBasis==="EQUAL_SIDE_COUNT"&&question.geometryDiagram.rotationInvariant===true));
  assert.ok(generated.questions.every(question=>question.metadata.triangleAngleClassificationTouched===false&&question.metadata.triangleInequalityTouched===false&&question.metadata.congruentTriangleCorrespondenceTouched===false&&question.metadata.applicationContextUsed===false&&question.metadata.q025OrLaterTouched===false));
});
