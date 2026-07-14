import { validateG4AU08AllCanonicalPublicQuestion } from "./g4a-u08-all-canonical-public-router.js";

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

function answerTextInteger(answerText) {
  const normalized = String(answerText ?? "").replaceAll(",", "");
  const match = normalized.match(/-?\d+/);
  return match ? Number(match[0]) : null;
}

export function validateG4AU08S76RProductionQuestion(question = {}) {
  const lifecycleNormalized = question.productionUse === "allowed"
    ? { ...question, productionUse: "preview_only_pending_s76r" }
    : question;
  const base = validateG4AU08AllCanonicalPublicQuestion(lifecycleNormalized);
  const errors = [...base.errors];
  const textValue = answerTextInteger(question.answerText);
  const structuredValue = Number.isInteger(question.structuredAnswer?.value)
    ? question.structuredAnswer.value
    : null;

  if (!["preview_only_pending_s76r", "allowed"].includes(question.productionUse)) {
    errors.push(issue(
      "G4A_U08_S76R_PRODUCTION_USE_INVALID",
      "productionUse",
      "S76R canonical 題目必須是 pending 或 allowed lifecycle。",
    ));
  }

  if (!Number.isInteger(textValue)) {
    errors.push(issue(
      "G4A_U08_S76R_ANSWER_TEXT_INVALID",
      "answerText",
      "公開答案文字必須包含唯一整數答案。",
    ));
  } else if (Number.isInteger(question.finalAnswer) && textValue !== question.finalAnswer) {
    errors.push(issue(
      "G4A_U08_S76R_ANSWER_TEXT_MISMATCH",
      "answerText",
      "答案文字與 finalAnswer 不一致。",
      { expected: question.finalAnswer, actual: textValue },
    ));
  }

  if (structuredValue !== null && Number.isInteger(question.finalAnswer) && structuredValue !== question.finalAnswer) {
    errors.push(issue(
      "G4A_U08_S76R_STRUCTURED_ANSWER_MISMATCH",
      "structuredAnswer.value",
      "structuredAnswer.value 與 finalAnswer 不一致。",
      { expected: question.finalAnswer, actual: structuredValue },
    ));
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings: [...base.warnings],
    validatorVersion: "s76r-g4a-u08-production-v1",
  };
}

export function validateG4AU08S76RProductionQuestions(questions = []) {
  const errors = [];
  for (const [index, question] of questions.entries()) {
    const checked = validateG4AU08S76RProductionQuestion(question);
    for (const entry of checked.errors) {
      errors.push({ ...entry, path: `questions[${index}].${entry.path}` });
    }
  }
  return {
    ok: errors.length === 0,
    errors,
    warnings: [],
    validatorVersion: "s76r-g4a-u08-production-v1",
  };
}
