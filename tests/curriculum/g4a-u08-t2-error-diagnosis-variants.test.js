import test from "node:test";
import assert from "node:assert/strict";

import {
  generateG4AU08AllCanonicalPublicQuestions,
  validateG4AU08AllCanonicalPublicQuestion,
} from "../../site/modules/curriculum/batch-a/g4a-u08-all-canonical-public-router.js";
import {
  projectG4AU08ErrorDiagnosis,
  validateG4AU08ErrorDiagnosisProjection,
} from "../../site/modules/curriculum/batch-a/g4a-u08-error-diagnosis-variants.js";

const group = "pg_g4a_u08_num_repeated_subtract_group";
const kp = "kp_g4a_u08_num_repeated_subtract_group";

const options = (questionCount = 2, generationSeed = "u08-t2-diagnosis") => ({
  sourceId: "g4a_u08_4a08",
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: [kp],
  selectedPatternGroupIds: [group],
  questionMode: "numeric",
  questionCount,
  ordering: "groupedByPattern",
  generationSeed,
});

test("G4A-U08 T2 generates an error-diagnosis item on the existing public repeated-subtraction route", () => {
  const result = generateG4AU08AllCanonicalPublicQuestions(options());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 2);
  const diagnostic = result.questions[0];
  assert.equal(diagnostic.patternGroupId, group);
  assert.equal(diagnostic.reasoningVariant, "error_diagnosis");
  assert.equal(diagnostic.diagnosticWitness.misconceptionId, "incorrect_subtraction_grouping");
  assert.notEqual(diagnostic.diagnosticWitness.incorrectAnswer, diagnostic.finalAnswer);
  assert.equal(diagnostic.diagnosticWitness.correctAnswer, diagnostic.finalAnswer);
  assert.ok(diagnostic.promptText.includes("錯算成"));
  assert.ok(diagnostic.promptText.includes(diagnostic.diagnosticWitness.incorrectExpression));
  assert.ok(diagnostic.blankedDisplayText.includes("______"));
  assert.equal(validateG4AU08AllCanonicalPublicQuestion(diagnostic).ok, true);
  assert.equal(result.questions[1].reasoningVariant, undefined, "forward computation must remain available");
});

test("G4A-U08 T2 rejects corrupted diagnosis witnesses instead of accepting a matching-looking number", () => {
  const result = generateG4AU08AllCanonicalPublicQuestions(options(1));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const item = structuredClone(result.questions[0]);
  item.diagnosticWitness.incorrectAnswer = item.finalAnswer;
  const checked = validateG4AU08AllCanonicalPublicQuestion(item);
  assert.equal(checked.ok, false);
  assert.ok(checked.errors.some((row) => row.code === "G4A_U08_T2_DIAGNOSTIC_WITNESS_INVALID"));
});

test("G4A-U08 T2 projection is strictly gated and cannot invent a miscalculation for unsupported group", () => {
  assert.equal(projectG4AU08ErrorDiagnosis({ patternGroupId: "pg_g4a_u08_num_add_group_round" }, 0), null);
  assert.equal(projectG4AU08ErrorDiagnosis({ patternGroupId: group }, 1), null);
  const fake = {
    patternGroupId: group,
    expression: "60 - 10 - 5",
    expressionTokens: [60, "-", 10, "-", 5],
    answerModel: { value: 45 },
  };
  const projected = projectG4AU08ErrorDiagnosis(fake, 0);
  assert.ok(projected);
  assert.equal(projected.diagnosticWitness.incorrectExpression, "60 - (10 - 5)");
  assert.equal(projected.diagnosticWitness.incorrectAnswer, 55);
  assert.deepEqual(validateG4AU08ErrorDiagnosisProjection(fake, projected), { valid: true, errors: [] });
  const invalid = { ...projected, diagnosticWitness: { ...projected.diagnosticWitness, incorrectAnswer: 45 } };
  assert.equal(validateG4AU08ErrorDiagnosisProjection(fake, invalid).valid, false);
});
