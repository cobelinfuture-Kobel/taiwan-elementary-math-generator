import { ERROR_CODES } from "../constants/error-codes.js";
import { WARNING_CODES } from "../constants/warning-codes.js";

function createHookResult(overrides = {}) {
  return {
    hookName: "validateUniqueAnswer",
    passed: true,
    errorCodes: [],
    warnings: [],
    computedAnswer: null,
    normalizedInput: null,
    notes: "",
    ...overrides
  };
}

function hasDuplicateChoices(answerModel) {
  const choices = Array.isArray(answerModel?.choices) ? answerModel.choices : [];
  return new Set(choices.map((choice) => JSON.stringify(choice))).size !== choices.length;
}

function promptLooksAmbiguous(prompt) {
  if (typeof prompt !== "string") {
    return false;
  }

  const normalized = prompt.toLowerCase();
  return normalized.includes("any")
    || normalized.includes("choose all")
    || normalized.includes("all possible")
    || normalized.includes("more than one");
}

export function validateUniqueAnswer(itemPrompt, answerModel = {}, constraints = {}) {
  const explicitMultipleAnswers = Array.isArray(answerModel?.acceptedAnswers) && answerModel.acceptedAnswers.length > 1;
  const duplicateChoices = hasDuplicateChoices(answerModel);
  const structurallyAmbiguous = explicitMultipleAnswers || duplicateChoices;
  const borderline = constraints?.allowMultipleRepresentations === true || promptLooksAmbiguous(itemPrompt);

  return createHookResult({
    passed: !structurallyAmbiguous,
    errorCodes: structurallyAmbiguous ? [ERROR_CODES.E_ANSWER_NOT_UNIQUE] : [],
    warnings: !structurallyAmbiguous && borderline ? [WARNING_CODES.W_HUMAN_REVIEW_RECOMMENDED] : [],
    normalizedInput: {
      itemPrompt: typeof itemPrompt === "string" ? itemPrompt : null,
      answerModel
    },
    notes: borderline && !structurallyAmbiguous
      ? "Borderline ambiguity detected; deterministic precheck passed but human review is recommended."
      : ""
  });
}
