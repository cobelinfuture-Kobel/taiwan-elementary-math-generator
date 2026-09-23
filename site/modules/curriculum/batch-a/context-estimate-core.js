export function estimateAddSubToUnit(left, right, operator, unit = 1000) {
  const roundedLeft = Math.round(left / unit) * unit;
  const roundedRight = Math.round(right / unit) * unit;
  const answer = operator === "subtract" ? roundedLeft - roundedRight : roundedLeft + roundedRight;
  return { roundedLeft, roundedRight, answer };
}

export function isSupportedEstimateOperator(operator) {
  return operator === "add" || operator === "subtract";
}
