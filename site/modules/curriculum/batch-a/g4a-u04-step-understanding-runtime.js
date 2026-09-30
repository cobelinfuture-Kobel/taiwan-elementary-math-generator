export const G4A_U04_STEP_QUESTION_GROUP_IDS = Object.freeze([
  "G1_STEP_SEQUENCE_ORDERING",
  "G2_WHOLE_EXPRESSION_RECONSTRUCTION",
  "G3_INTERMEDIATE_STEP_IDENTIFICATION",
  "G4_ERROR_DIAGNOSIS",
  "G5_COMPOSITE_2SUB",
  "G6_FILL_IN_RECONSTRUCTION",
]);

export const G4A_U04_STEP_FILL_IN_TARGETS = Object.freeze([
  "place_value_conversion",
  "intermediate_quotient",
  "intermediate_remainder",
  "whole_expression_dividend",
  "whole_expression_divisor",
  "whole_expression_quotient",
  "whole_expression_remainder",
]);

const PLACE_ROWS = Object.freeze([
  Object.freeze({ key: "thousands", label: "千", digitIndex: 0 }),
  Object.freeze({ key: "hundreds", label: "百", digitIndex: 1 }),
  Object.freeze({ key: "tens", label: "十", digitIndex: 2 }),
  Object.freeze({ key: "ones", label: "一", digitIndex: 3 }),
]);
const LABELS = Object.freeze(["甲", "乙", "丙", "丁", "戊", "己"]);

function hashSeed(value) {
  let acc = 0;
  for (const char of String(value ?? "default")) acc = ((acc * 31) + char.charCodeAt(0)) >>> 0;
  return acc || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function wholeExpression(dividend, divisor, quotient, remainder) {
  return remainder > 0
    ? `${dividend} ÷ ${divisor} = ${quotient}…${remainder}`
    : `${dividend} ÷ ${divisor} = ${quotient}`;
}

function localExpression(step, divisor) {
  return step.remainderUnits > 0
    ? `${step.combinedUnits} ÷ ${divisor} = ${step.quotientDigit}…${step.remainderUnits}`
    : `${step.combinedUnits} ÷ ${divisor} = ${step.quotientDigit}`;
}

function contextText(step) {
  if (step.carryIn > 0) {
    return `${step.carryIn}個${step.previousPlaceLabel}換成${step.convertedUnits}個${step.placeLabel}，和${step.sourceDigit}個${step.placeLabel}合起來是${step.combinedUnits}個${step.placeLabel}`;
  }
  return `${step.combinedUnits}個${step.placeLabel}`;
}

function stepDescription(step, divisor) {
  const context = contextText(step);
  return `${context}，再除以${divisor}，得到${step.quotientDigit}個${step.placeLabel}，剩下${step.remainderUnits}個${step.placeLabel}`;
}

export function buildG4AU04LongDivisionTrace({ dividend, divisor } = {}) {
  if (!Number.isSafeInteger(dividend) || dividend < 1000 || dividend > 9999) {
    throw new Error("G4A_U04_STEP_TRACE_DIVIDEND_INVALID");
  }
  if (!Number.isSafeInteger(divisor) || divisor < 2 || divisor > 9) {
    throw new Error("G4A_U04_STEP_TRACE_DIVISOR_INVALID");
  }
  const digits = String(dividend).split("").map(Number);
  const steps = [];
  let carry = 0;
  let emitted = 0;
  for (let index = 0; index < PLACE_ROWS.length; index += 1) {
    const place = PLACE_ROWS[index];
    const sourceDigit = digits[index];
    const carryIn = carry;
    const combinedUnits = carryIn * 10 + sourceDigit;
    if (index === 0 && combinedUnits < divisor) {
      carry = combinedUnits;
      continue;
    }
    const quotientDigit = Math.floor(combinedUnits / divisor);
    const remainderUnits = combinedUnits % divisor;
    const previousPlaceLabel = index > 0 ? PLACE_ROWS[index - 1].label : null;
    const step = {
      stepId: `S${++emitted}`,
      placeKey: place.key,
      placeLabel: place.label,
      previousPlaceLabel,
      sourceDigit,
      carryIn,
      convertedUnits: carryIn * 10,
      combinedUnits,
      quotientDigit,
      remainderUnits,
    };
    steps.push(Object.freeze({
      ...step,
      contextText: contextText(step),
      description: stepDescription(step, divisor),
      localExpression: localExpression(step, divisor),
    }));
    carry = remainderUnits;
  }
  return Object.freeze(steps);
}

function shuffledLabeledSteps(trace, salt) {
  const rows = trace.map((step) => ({ step }));
  let state = hashSeed(salt);
  for (let index = rows.length - 1; index > 0; index -= 1) {
    state = mix32(state + index);
    const swap = state % (index + 1);
    [rows[index], rows[swap]] = [rows[swap], rows[index]];
  }
  const isIdentity = rows.every((row, index) => row.step.stepId === trace[index].stepId);
  if (isIdentity && rows.length > 1) rows.push(rows.shift());
  return rows.map((row, index) => Object.freeze({ label: LABELS[index], step: row.step }));
}

function orderedLabelsFromLabeled(trace, labeled) {
  const byStepId = new Map(labeled.map((row) => [row.step.stepId, row.label]));
  return trace.map((step) => byStepId.get(step.stepId));
}

function labeledStepText(labeled) {
  return labeled.map((row) => `${row.label}：${row.step.description}`).join("；");
}

function traceText(trace) {
  return trace.map((step, index) => `${index + 1}. ${step.description}`).join("；");
}

function deterministicChoice(trace, salt) {
  return trace[mix32(hashSeed(salt)) % trace.length];
}

function makeAlternativeWholeExpressions(selected, correct, lastStep) {
  const expressions = [];
  const push = (text, extra = {}) => {
    if (!text || expressions.some((row) => row.text === text)) return;
    expressions.push({ text, ...extra });
  };
  push(correct, { isCorrect: true, isIntermediateStep: false });
  push(localExpression(lastStep, selected.divisor), { isCorrect: false, isIntermediateStep: true });
  for (const delta of [selected.divisor, selected.divisor * 2, selected.divisor * 10, -selected.divisor, -selected.divisor * 2]) {
    const dividend = selected.dividend + delta;
    if (dividend < 1000 || dividend > 9999 || dividend === selected.dividend) continue;
    const quotient = Math.floor(dividend / selected.divisor);
    const remainder = dividend % selected.divisor;
    push(wholeExpression(dividend, selected.divisor, quotient, remainder), { isCorrect: false, isIntermediateStep: false });
    if (expressions.length >= 4) break;
  }
  return expressions.slice(0, 4);
}

function labelChoices(options, salt) {
  const rows = options.map((option) => ({ ...option }));
  let state = hashSeed(salt);
  for (let index = rows.length - 1; index > 0; index -= 1) {
    state = mix32(state + index);
    const swap = state % (index + 1);
    [rows[index], rows[swap]] = [rows[swap], rows[index]];
  }
  return rows.map((row, index) => Object.freeze({ ...row, label: String.fromCharCode(65 + index) }));
}

function commonQuestion(definition, selected, trace, questionGroupId, responseMode, promptText, answerText, metadata) {
  return {
    patternSpecId: definition.patternSpecId,
    sourceId: definition.sourceId,
    kind: "g4aU04LongDivisionStepUnderstanding",
    primaryKnowledgePointId: definition.primaryKnowledgePointId,
    questionGroupId,
    responseMode,
    dividend: selected.dividend,
    divisor: selected.divisor,
    quotient: selected.quotient,
    remainder: selected.remainder,
    dividendDigits: definition.dividendDigits,
    divisorDigits: definition.divisorDigits,
    quotientStartPlace: selected.quotientStartPlace,
    firstPlaceCase: definition.firstPlaceCase,
    coverageCase: selected.coverageCase,
    reasoningTrace: trace,
    promptText,
    blankedDisplayText: promptText,
    displayText: `${promptText} ${answerText}`,
    answerText,
    finalAnswer: answerText,
    metadata: {
      ...metadata,
      questionGroupId,
      responseMode,
      primaryKnowledgePointId: definition.primaryKnowledgePointId,
      longDivisionStepUnderstanding: Object.freeze({
        version: "v1",
        questionGroupId,
        responseMode,
      }),
    },
  };
}

function makeG1(definition, selected, trace, sequenceNumber, seed, metadata) {
  const labeled = shuffledLabeledSteps(trace, `${seed}:g1:${sequenceNumber}`);
  const orderedLabels = orderedLabelsFromLabeled(trace, labeled);
  const promptText = `下列是某個除法直式的計算步驟：${labeledStepText(labeled)}。請將步驟排成正確順序：${trace.map(() => "____").join(" → ")}。`;
  const answerText = orderedLabels.join(" → ");
  return {
    ...commonQuestion(definition, selected, trace, "G1_STEP_SEQUENCE_ORDERING", "ordering", promptText, answerText, metadata),
    scrambledSteps: labeled,
    orderedLabels,
  };
}

function makeG2(definition, selected, trace, sequenceNumber, seed, metadata) {
  const responseMode = sequenceNumber % 2 === 0 ? "fill_in" : "multiple_choice";
  const correctExpression = wholeExpression(selected.dividend, selected.divisor, selected.quotient, selected.remainder);
  const stimulus = `依照下列完整直式步驟：${traceText(trace)}。`;
  if (responseMode === "fill_in") {
    const promptText = `${stimulus}完整算式：____ ÷ ____ = 商____，餘____。`;
    const answerText = `${selected.dividend} ÷ ${selected.divisor} = 商${selected.quotient}，餘${selected.remainder}`;
    return {
      ...commonQuestion(definition, selected, trace, "G2_WHOLE_EXPRESSION_RECONSTRUCTION", responseMode, promptText, answerText, metadata),
      wholeExpression: correctExpression,
      fillInAnswers: [selected.dividend, selected.divisor, selected.quotient, selected.remainder],
    };
  }
  const options = labelChoices(makeAlternativeWholeExpressions(selected, correctExpression, trace.at(-1)), `${seed}:g2-options:${sequenceNumber}`);
  const correctOption = options.find((option) => option.isCorrect);
  const promptText = `${stimulus}這些步驟合起來完整對應哪一個算式？${options.map((option) => ` ${option.label}. ${option.text}`).join("　")}`;
  const answerText = `${correctOption.label}. ${correctOption.text}`;
  return {
    ...commonQuestion(definition, selected, trace, "G2_WHOLE_EXPRESSION_RECONSTRUCTION", responseMode, promptText, answerText, metadata),
    wholeExpression: correctExpression,
    options,
    correctOptionLabel: correctOption.label,
  };
}

function makeG3(definition, selected, trace, sequenceNumber, seed, metadata) {
  const target = deterministicChoice(trace, `${seed}:g3-target:${sequenceNumber}`);
  const responseMode = sequenceNumber % 2 === 0 ? "fill_in" : "multiple_choice";
  if (responseMode === "fill_in") {
    const promptText = `${target.contextText}，再除以${selected.divisor}。商是____個${target.placeLabel}，餘____個${target.placeLabel}。`;
    const answerText = `${target.quotientDigit}，${target.remainderUnits}`;
    return {
      ...commonQuestion(definition, selected, trace, "G3_INTERMEDIATE_STEP_IDENTIFICATION", responseMode, promptText, answerText, metadata),
      targetStepId: target.stepId,
      targetPlaceKey: target.placeKey,
      fillInAnswers: [target.quotientDigit, target.remainderUnits],
    };
  }
  const options = ["千", "百", "十", "一"].map((label, index) => Object.freeze({
    label: String.fromCharCode(65 + index),
    text: `${label}位`,
    isCorrect: label === target.placeLabel,
  }));
  const correctOption = options.find((option) => option.isCorrect);
  const promptText = `在直式除法中，「${target.contextText}，再除以${selected.divisor}」這一步的商應寫在哪一位？${options.map((option) => ` ${option.label}. ${option.text}`).join("　")}`;
  const answerText = `${correctOption.label}. ${correctOption.text}`;
  return {
    ...commonQuestion(definition, selected, trace, "G3_INTERMEDIATE_STEP_IDENTIFICATION", responseMode, promptText, answerText, metadata),
    targetStepId: target.stepId,
    targetPlaceKey: target.placeKey,
    options,
    correctOptionLabel: correctOption.label,
  };
}

function corruptedDescription(step, divisor) {
  if (step.carryIn > 0) {
    const presentedValue = step.combinedUnits + 10;
    return {
      errorFamily: "PLACE_VALUE_RECOMBINATION_ERROR",
      presentedValue,
      correctValue: step.combinedUnits,
      text: `${step.carryIn}個${step.previousPlaceLabel}換成${step.convertedUnits}個${step.placeLabel}，和${step.sourceDigit}個${step.placeLabel}合起來是${presentedValue}個${step.placeLabel}，再除以${divisor}`,
    };
  }
  const presentedValue = step.quotientDigit + 1;
  return {
    errorFamily: "QUOTIENT_PLACE_ERROR",
    presentedValue,
    correctValue: step.quotientDigit,
    text: `${step.combinedUnits}個${step.placeLabel}除以${divisor}，得到${presentedValue}個${step.placeLabel}，剩下${step.remainderUnits}個${step.placeLabel}`,
  };
}

function makeG4(definition, selected, trace, sequenceNumber, seed, metadata) {
  const target = trace.find((step) => step.carryIn > 0) ?? trace[Math.min(1, trace.length - 1)];
  const corruption = corruptedDescription(target, selected.divisor);
  const labeled = trace.map((step, index) => Object.freeze({
    label: LABELS[index],
    step,
    presentedText: step.stepId === target.stepId ? corruption.text : step.description,
  }));
  const targetLabel = labeled.find((row) => row.step.stepId === target.stepId).label;
  const responseMode = sequenceNumber % 2 === 0 ? "fill_in" : "multiple_choice";
  if (responseMode === "fill_in") {
    const promptText = `下列直式步驟中有一個數字寫錯：「${corruption.text}」。請把錯誤的數字改成____。`;
    const answerText = String(corruption.correctValue);
    return {
      ...commonQuestion(definition, selected, trace, "G4_ERROR_DIAGNOSIS", responseMode, promptText, answerText, metadata),
      errorDiagnosis: Object.freeze({ targetStepId: target.stepId, targetLabel, ...corruption }),
      fillInAnswers: [corruption.correctValue],
    };
  }
  const promptText = `下列直式計算步驟有一個錯誤：${labeled.map((row) => `${row.label}：${row.presentedText}`).join("；")}。錯的是哪一步？`;
  const answerText = `${targetLabel}（正確值：${corruption.correctValue}）`;
  return {
    ...commonQuestion(definition, selected, trace, "G4_ERROR_DIAGNOSIS", responseMode, promptText, answerText, metadata),
    presentedSteps: labeled,
    errorDiagnosis: Object.freeze({ targetStepId: target.stepId, targetLabel, ...corruption }),
  };
}

function makeG5(definition, selected, trace, sequenceNumber, seed, metadata) {
  const labeled = shuffledLabeledSteps(trace, `${seed}:g5:${sequenceNumber}`);
  const orderedLabels = orderedLabelsFromLabeled(trace, labeled);
  const expression = wholeExpression(selected.dividend, selected.divisor, selected.quotient, selected.remainder);
  const promptText = `下列是某個除法直式的計算步驟：${labeledStepText(labeled)}。 (1) 請排出正確順序：${trace.map(() => "____").join(" → ")}。 (2) 這些步驟合起來的完整算式：________________。`;
  const answerText = `(1) ${orderedLabels.join(" → ")}；(2) ${expression}`;
  const subitems = Object.freeze([
    Object.freeze({ id: "(1)", kind: "step_order", answer: orderedLabels }),
    Object.freeze({ id: "(2)", kind: "whole_expression", answer: expression }),
  ]);
  return {
    ...commonQuestion(definition, selected, trace, "G5_COMPOSITE_2SUB", "composite_two_subitems", promptText, answerText, metadata),
    scrambledSteps: labeled,
    orderedLabels,
    wholeExpression: expression,
    subitems,
    independentSubitemScoring: true,
  };
}

function makeG6(definition, selected, trace, sequenceNumber, seed, metadata) {
  let fillInTarget = G4A_U04_STEP_FILL_IN_TARGETS[(sequenceNumber - 1) % G4A_U04_STEP_FILL_IN_TARGETS.length];
  const target = deterministicChoice(trace, `${seed}:g6-target:${sequenceNumber}`);
  const carryTarget = trace.find((step) => step.carryIn > 0);
  let promptText;
  let answerText;
  let fillInAnswers;
  if (fillInTarget === "place_value_conversion" && carryTarget) {
    promptText = `${carryTarget.carryIn}個${carryTarget.previousPlaceLabel}換成____個${carryTarget.placeLabel}，再和${carryTarget.sourceDigit}個${carryTarget.placeLabel}合併。`;
    answerText = String(carryTarget.convertedUnits);
    fillInAnswers = [carryTarget.convertedUnits];
  } else if (fillInTarget === "intermediate_quotient" || (fillInTarget === "place_value_conversion" && !carryTarget)) {
    fillInTarget = "intermediate_quotient";
    promptText = `${target.contextText}，再除以${selected.divisor}，商是____個${target.placeLabel}。`;
    answerText = String(target.quotientDigit);
    fillInAnswers = [target.quotientDigit];
  } else if (fillInTarget === "intermediate_remainder") {
    promptText = `${target.contextText}，再除以${selected.divisor}，餘____個${target.placeLabel}。`;
    answerText = String(target.remainderUnits);
    fillInAnswers = [target.remainderUnits];
  } else {
    const stimulus = `依照直式步驟：${traceText(trace)}。`;
    const blanks = {
      whole_expression_dividend: `____ ÷ ${selected.divisor} = 商${selected.quotient}，餘${selected.remainder}`,
      whole_expression_divisor: `${selected.dividend} ÷ ____ = 商${selected.quotient}，餘${selected.remainder}`,
      whole_expression_quotient: `${selected.dividend} ÷ ${selected.divisor} = 商____，餘${selected.remainder}`,
      whole_expression_remainder: `${selected.dividend} ÷ ${selected.divisor} = 商${selected.quotient}，餘____`,
    };
    const answers = {
      whole_expression_dividend: selected.dividend,
      whole_expression_divisor: selected.divisor,
      whole_expression_quotient: selected.quotient,
      whole_expression_remainder: selected.remainder,
    };
    promptText = `${stimulus}請填空：${blanks[fillInTarget]}。`;
    answerText = String(answers[fillInTarget]);
    fillInAnswers = [answers[fillInTarget]];
  }
  return {
    ...commonQuestion(definition, selected, trace, "G6_FILL_IN_RECONSTRUCTION", "fill_in", promptText, answerText, metadata),
    fillInTarget,
    fillInAnswers,
  };
}

export function makeG4AU04StepUnderstandingQuestion(definition, selected, sequenceNumber, seed, metadata = {}) {
  const trace = buildG4AU04LongDivisionTrace(selected);
  const questionGroupId = G4A_U04_STEP_QUESTION_GROUP_IDS[(sequenceNumber - 1) % G4A_U04_STEP_QUESTION_GROUP_IDS.length];
  if (questionGroupId === "G1_STEP_SEQUENCE_ORDERING") return makeG1(definition, selected, trace, sequenceNumber, seed, metadata);
  if (questionGroupId === "G2_WHOLE_EXPRESSION_RECONSTRUCTION") return makeG2(definition, selected, trace, sequenceNumber, seed, metadata);
  if (questionGroupId === "G3_INTERMEDIATE_STEP_IDENTIFICATION") return makeG3(definition, selected, trace, sequenceNumber, seed, metadata);
  if (questionGroupId === "G4_ERROR_DIAGNOSIS") return makeG4(definition, selected, trace, sequenceNumber, seed, metadata);
  if (questionGroupId === "G5_COMPOSITE_2SUB") return makeG5(definition, selected, trace, sequenceNumber, seed, metadata);
  return makeG6(definition, selected, trace, sequenceNumber, seed, metadata);
}
