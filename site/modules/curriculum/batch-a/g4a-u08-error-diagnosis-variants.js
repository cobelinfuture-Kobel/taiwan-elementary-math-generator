// G4A-U08 T2: source-bound mistake diagnosis for existing integer-arithmetic KPs.
// No additional KP/PatternSpec IDs. This is a controlled question variation,
// not evidence that a new textbook-source problem was certified.
const SUPPORTED_GROUPS = new Set([
  "pg_g4a_u08_num_repeated_subtract_group",
  "pg_g4a_u08_num_add_sub_left_assoc",
  "pg_g4a_u08_num_parentheses_change_precedence",
]);

const stringify = (tokens) => tokens.join(" ").replace(/\( /g, "(").replace(/ \)/g, ")");

function wrongInterpretation(item) {
  const tokens = item.expressionTokens ?? [];
  const group = item.patternGroupId;
  if (group === "pg_g4a_u08_num_repeated_subtract_group" ||
      group === "pg_g4a_u08_num_add_sub_left_assoc") {
    if (tokens.length !== 5 ||
        !Number.isInteger(tokens[0]) || tokens[1] !== "-" ||
        !Number.isInteger(tokens[2]) || !["-", "+"].includes(tokens[3]) ||
        !Number.isInteger(tokens[4])) return null;
    const [a, , b, op, c] = tokens;
    if (group === "pg_g4a_u08_num_repeated_subtract_group" && op !== "-") return null;
    if (group === "pg_g4a_u08_num_add_sub_left_assoc" && op !== "+") return null;
    const wrong = op === "-" ? a - (b - c) : a - (b + c);
    return {
      misconceptionId: "incorrect_subtraction_grouping",
      wrongExpression: stringify([a, "-", "(", b, op, c, ")"]),
      wrongAnswer: wrong,
    };
  }
  if (group === "pg_g4a_u08_num_parentheses_change_precedence") {
    const evidence = item.canonicalEvidence ?? {};
    const ungrouped = tokens.filter((token) => token !== "(" && token !== ")");
    if (!tokens.includes("(") || !Number.isInteger(evidence.unparenthesizedValue)) return null;
    return {
      misconceptionId: "ignored_parentheses",
      wrongExpression: stringify(ungrouped),
      wrongAnswer: evidence.unparenthesizedValue,
    };
  }
  return null;
}

export function projectG4AU08ErrorDiagnosis(item, ordinal = 0) {
  if (!SUPPORTED_GROUPS.has(item?.patternGroupId) || ordinal % 2 !== 0) return null;
  const mistake = wrongInterpretation(item);
  const correctAnswer = item.answerModel?.value;
  // Both the wrong attempt and the correct computation must remain in the
  // elementary integer domain, and the mistake must affect the result.
  if (!mistake || !Number.isInteger(correctAnswer) || correctAnswer < 0 ||
      !Number.isInteger(mistake.wrongAnswer) || mistake.wrongAnswer < 0 ||
      mistake.wrongAnswer === correctAnswer) return null;
  const prompt = `小明計算「${item.expression}」時，把它錯算成「${mistake.wrongExpression}」，得到 ${mistake.wrongAnswer}。請依正確的運算順序算出原式的答案：______`;
  return {
    prompt,
    reasoningVariant: "error_diagnosis",
    diagnosticWitness: Object.freeze({
      misconceptionId: mistake.misconceptionId,
      originalExpression: item.expression,
      incorrectExpression: mistake.wrongExpression,
      incorrectAnswer: mistake.wrongAnswer,
      correctAnswer,
    }),
  };
}

export function validateG4AU08ErrorDiagnosisProjection(item, projection) {
  if (!projection) return { valid: true, errors: [] };
  const expected = wrongInterpretation(item);
  const errors = [];
  if (!expected || !Number.isInteger(item?.answerModel?.value) ||
      projection.reasoningVariant !== "error_diagnosis" ||
      projection.diagnosticWitness?.incorrectExpression !== expected.wrongExpression ||
      projection.diagnosticWitness?.incorrectAnswer !== expected.wrongAnswer ||
      projection.diagnosticWitness?.correctAnswer !== item.answerModel.value ||
      expected.wrongAnswer === item.answerModel.value ||
      !projection.prompt?.includes(item.expression) ||
      !projection.prompt?.includes(expected.wrongExpression)) {
    errors.push("G4AU08_T2_DIAGNOSTIC_WITNESS_INVALID");
  }
  return { valid: errors.length === 0, errors };
}
