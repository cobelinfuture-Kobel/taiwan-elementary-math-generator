function buildCrossProductCases() {
  const rows = [];
  for (let leftDenominator = 2; leftDenominator <= 15; leftDenominator += 1) {
    for (let leftNumerator = 1; leftNumerator < leftDenominator; leftNumerator += 1) {
      for (let factor = 2; factor <= 6; factor += 1) {
        rows.push(Object.freeze({ leftNumerator, leftDenominator, rightNumerator: leftNumerator * factor, rightDenominator: leftDenominator * factor }));
        rows.push(Object.freeze({ leftNumerator, leftDenominator, rightNumerator: leftNumerator * factor + 1, rightDenominator: leftDenominator * factor }));
      }
    }
  }
  return rows;
}
export const G4B_U08_EQUIVALENCE_CROSS_PRODUCT_CASES = Object.freeze(buildCrossProductCases()); // PGC-R04 cross product parameter space
