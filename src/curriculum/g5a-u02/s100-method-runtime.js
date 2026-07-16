const S100_PATTERN_IDS = Object.freeze([
  "ps_g5a_u02_factor_relation_equivalence",
  "ps_g5a_u02_factor_enumeration_trial_division",
  "ps_g5a_u02_factor_list_from_pairs",
  "ps_g5a_u02_factor_statement_judgement",
  "ps_g5a_u02_problem_type_classification",
  "ps_g5a_u02_complete_factor_list_statement_evaluation",
]);
const S100_PATTERN_SET = new Set(S100_PATTERN_IDS);

const DIVISIBILITY_FAMILIES = Object.freeze([
  "candidate_is_factor_of_target",
  "target_is_multiple_of_candidate",
  "target_is_divisible_by_candidate",
  "candidate_divides_target",
]);

const PROBLEM_SCENARIOS = Object.freeze({
  equal_partition_single_quantity: Object.freeze({
    expectedLabel: "factor",
    build(values) {
      return {
        scenarioText: `有 ${values.total} 條彩帶，要平均分成若干組且沒有剩下。所有可能的組數屬於哪一類數？`,
        quantityRoles: {
          totalQuantity: values.total,
          unknownRole: "equal_group_count_dividing_one_total",
          remainderRule: "zero",
        },
      };
    },
  }),
  repeated_grouping_single_quantity: Object.freeze({
    expectedLabel: "multiple",
    build(values) {
      return {
        scenarioText: `每盒有 ${values.groupSize} 顆球，依序裝 1 盒、2 盒、3 盒……所得的總顆數屬於哪一類數？`,
        quantityRoles: {
          repeatedGroupSize: values.groupSize,
          repetitionDomain: "positive_integers",
          unknownRole: "repeated_total",
        },
      };
    },
  }),
  equal_partition_two_quantities: Object.freeze({
    expectedLabel: "common_factor",
    build(values) {
      return {
        scenarioText: `有 ${values.a} 顆紅珠和 ${values.b} 顆藍珠，要各自平均分成相同組數且都沒有剩下。所有可能的組數屬於哪一類數？`,
        quantityRoles: {
          firstQuantity: values.a,
          secondQuantity: values.b,
          unknownRole: "shared_equal_group_count",
          remainderRule: "zero_for_both",
        },
      };
    },
  }),
  synchronized_repetition_two_quantities: Object.freeze({
    expectedLabel: "common_multiple",
    build(values) {
      return {
        scenarioText: `甲燈每 ${values.a} 秒亮一次，乙燈每 ${values.b} 秒亮一次。兩燈同時亮的經過秒數屬於哪一類數？`,
        quantityRoles: {
          firstCycle: values.a,
          secondCycle: values.b,
          unknownRole: "shared_repetition_time",
        },
      };
    },
  }),
});
const PROBLEM_SCENARIO_IDS = Object.freeze(Object.keys(PROBLEM_SCENARIOS));

function factorsOf(target) {
  const low = [];
  const high = [];
  for (let divisor = 1; divisor * divisor <= target; divisor += 1) {
    if (target % divisor !== 0) continue;
    low.push(divisor);
    const paired = target / divisor;
    if (paired !== divisor) high.push(paired);
  }
  return [...low, ...high.reverse()];
}

function factorPairsOf(target) {
  return factorsOf(target)
    .filter((value) => value <= target / value)
    .map((value) => [value, target / value]);
}

function firstNonFactor(target, start = 2) {
  for (let candidate = start; candidate <= Math.max(target + 1, 24); candidate += 1) {
    if (target % candidate !== 0) return candidate;
  }
  return target + 1;
}

function divisibilityTruth(grammarFamilyId, subjectValue, objectValue) {
  if (!Number.isInteger(subjectValue) || !Number.isInteger(objectValue) || subjectValue <= 0 || objectValue <= 0) return null;
  switch (grammarFamilyId) {
    case "candidate_is_factor_of_target":
    case "candidate_divides_target":
      return objectValue % subjectValue === 0;
    case "target_is_multiple_of_candidate":
    case "target_is_divisible_by_candidate":
      return subjectValue % objectValue === 0;
    default:
      return null;
  }
}

function divisibilityText(grammarFamilyId, subjectValue, objectValue) {
  switch (grammarFamilyId) {
    case "candidate_is_factor_of_target": return `${subjectValue} 是 ${objectValue} 的因數。`;
    case "target_is_multiple_of_candidate": return `${subjectValue} 是 ${objectValue} 的倍數。`;
    case "target_is_divisible_by_candidate": return `${subjectValue} 可以被 ${objectValue} 整除。`;
    case "candidate_divides_target": return `${subjectValue} 可以整除 ${objectValue}。`;
    default: throw new Error(`G5AU02_P0_DIVISIBILITY_GRAMMAR_UNKNOWN:${grammarFamilyId}`);
  }
}

function buildTrialDivision(target) {
  const searchEnd = Math.floor(Math.sqrt(target));
  const rows = [];
  for (let divisor = 1; divisor <= searchEnd; divisor += 1) {
    const quotient = Math.floor(target / divisor);
    const remainder = target % divisor;
    rows.push({ divisor, quotient, remainder, isExact: remainder === 0 });
  }
  const factorValues = [...new Set(rows.flatMap((row) => row.isExact ? [row.divisor, target / row.divisor] : []))]
    .sort((a, b) => a - b);
  return { rows, searchEnd, factorValues };
}

function buildReasoningStatements(target, rng) {
  const factorList = factorsOf(target);
  const nontrivialFactor = factorList.find((value) => value !== 1 && value !== target) ?? 1;
  const nonFactor = firstNonFactor(target, 2);
  const factorCount = factorList.length;
  const square = Number.isInteger(Math.sqrt(target));
  const parityClaim = rng.int(0, 1) === 1 ? "even" : "odd";
  const parityTruth = parityClaim === "even" ? factorCount % 2 === 0 : factorCount % 2 === 1;
  const pair = factorPairsOf(target)[rng.int(0, factorPairsOf(target).length - 1)];
  const pairIsTrue = rng.int(0, 1) === 1;
  const shownPair = pairIsTrue ? pair : [pair[0], pair[1] + 1];

  return [
    {
      statementFamilyId: "candidate_is_factor",
      text: `${nontrivialFactor} 是 ${target} 的因數。`,
      truthValue: true,
      requiredInference: "locate_candidate_in_complete_factor_list",
      parameters: { candidate: nontrivialFactor },
    },
    {
      statementFamilyId: "target_is_multiple",
      text: `${target} 是 ${nonFactor} 的倍數。`,
      truthValue: false,
      requiredInference: "test_exact_divisibility_from_factor_structure",
      parameters: { candidate: nonFactor },
    },
    {
      statementFamilyId: "factor_count_parity",
      text: `${target} 的因數個數是${parityClaim === "even" ? "偶數" : "奇數"}。`,
      truthValue: parityTruth,
      requiredInference: "count_complete_factor_list",
      parameters: { parityClaim },
    },
    rng.int(0, 1) === 1
      ? {
          statementFamilyId: "square_number_odd_factor_count",
          text: `${target} 是完全平方數，而且因數個數是奇數。`,
          truthValue: square && factorCount % 2 === 1,
          requiredInference: "connect_square_number_to_unpaired_middle_factor",
          parameters: { squareClaim: true },
        }
      : {
          statementFamilyId: "paired_factors_product_target",
          text: `${shownPair[0]} 和 ${shownPair[1]} 是一組乘積為 ${target} 的配對因數。`,
          truthValue: shownPair[0] * shownPair[1] === target,
          requiredInference: "verify_factor_pair_product",
          parameters: { pair: shownPair },
        },
  ];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function isG5AU02S100Pattern(patternSpecId) {
  return S100_PATTERN_SET.has(patternSpecId);
}

export function getG5AU02S100PatternIds() {
  return [...S100_PATTERN_IDS];
}

export function generateG5AU02S100Pattern(patternSpecId, rng) {
  if (!S100_PATTERN_SET.has(patternSpecId)) return null;

  switch (patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence": {
      const target = rng.int(2, 12) * rng.int(2, 12);
      const isFactor = rng.int(0, 1) === 1;
      const candidateDivisor = isFactor
        ? rng.pick(factorsOf(target))
        : firstNonFactor(target, rng.int(2, 6));
      const quotient = Math.floor(target / candidateDivisor);
      const remainder = target % candidateDivisor;
      const multiplicationWitness = {
        factorA: candidateDivisor,
        factorB: quotient,
        product: candidateDivisor * quotient,
        target,
        relation: remainder === 0 ? "equals_target" : "does_not_equal_target",
      };
      const divisionWitness = {
        dividend: target,
        divisor: candidateDivisor,
        quotient,
        remainder,
        isExact: remainder === 0,
      };
      const learnerTaskMode = rng.int(0, 1) === 1 ? "compare_two_methods" : "complete_and_judge";
      return {
        data: { target, candidateDivisor, multiplicationWitness, divisionWitness, learnerTaskMode },
        prompt: `利用乘法分解和除法兩種方法，判斷 ${candidateDivisor} 是否為 ${target} 的因數。`,
        answer: { target, candidateDivisor, isFactor: remainder === 0, quotient: remainder === 0 ? quotient : null },
      };
    }

    case "ps_g5a_u02_factor_enumeration_trial_division": {
      const target = rng.int(2, 12) * rng.int(2, 12);
      const { rows, searchEnd, factorValues } = buildTrialDivision(target);
      return {
        data: { target, trialDivisionRows: rows, searchEnd, factorValues },
        prompt: `依序試除 1 到 ${searchEnd}，完成試除表，再列出 ${target} 的所有因數。`,
        answer: { values: factorValues },
      };
    }

    case "ps_g5a_u02_factor_list_from_pairs": {
      const target = rng.int(2, 12) * rng.int(2, 12);
      const factorPairs = factorPairsOf(target);
      const orderedFactorList = factorsOf(target);
      return {
        data: {
          target,
          factorPairs,
          orderedFactorList,
          transformationPrompt: "把每組配對因數展開、去除重複，再由小到大排列。",
        },
        prompt: `根據乘積為 ${target} 的配對因數，整理出完整因數表。`,
        answer: { values: orderedFactorList },
      };
    }

    case "ps_g5a_u02_factor_statement_judgement": {
      const target = rng.int(2, 12) * rng.int(2, 12);
      const truthWanted = rng.int(0, 1) === 1;
      const candidateDivisor = truthWanted
        ? rng.pick(factorsOf(target))
        : firstNonFactor(target, rng.int(2, 6));
      const grammarFamilyId = rng.pick(DIVISIBILITY_FAMILIES);
      const subjectValue = ["candidate_is_factor_of_target", "candidate_divides_target"].includes(grammarFamilyId)
        ? candidateDivisor
        : target;
      const objectValue = ["candidate_is_factor_of_target", "candidate_divides_target"].includes(grammarFamilyId)
        ? target
        : candidateDivisor;
      const truthValue = divisibilityTruth(grammarFamilyId, subjectValue, objectValue);
      const statementText = divisibilityText(grammarFamilyId, subjectValue, objectValue);
      return {
        data: {
          target,
          candidateDivisor,
          statementKind: grammarFamilyId,
          grammarFamilyId,
          subjectValue,
          objectValue,
          statementText,
          truthValue,
        },
        prompt: `判斷下列敘述是否正確：${statementText}`,
        answer: { value: truthValue },
      };
    }

    case "ps_g5a_u02_problem_type_classification": {
      const scenarioFamilyId = rng.pick(PROBLEM_SCENARIO_IDS);
      const scenario = PROBLEM_SCENARIOS[scenarioFamilyId];
      const values = {
        total: rng.int(4, 12) * rng.int(2, 8),
        groupSize: rng.int(2, 12),
        a: rng.int(2, 10) * rng.int(2, 7),
        b: rng.int(2, 10) * rng.int(2, 7),
      };
      const built = scenario.build(values);
      return {
        data: {
          contextKind: scenario.expectedLabel,
          scenarioFamilyId,
          scenarioText: built.scenarioText,
          quantityRoles: built.quantityRoles,
          expectedLabel: scenario.expectedLabel,
        },
        prompt: `${built.scenarioText}\n請判斷這是因數、倍數、公因數或公倍數問題。`,
        answer: { label: scenario.expectedLabel },
      };
    }

    case "ps_g5a_u02_complete_factor_list_statement_evaluation": {
      const target = rng.int(2, 12) * rng.int(2, 12);
      const factorList = factorsOf(target);
      const statements = buildReasoningStatements(target, rng);
      return {
        data: {
          target,
          factorList,
          statements,
          truthPattern: statements.map((statement) => statement.truthValue),
        },
        prompt: "先觀察完整因數表，再判斷每個敘述是否正確。",
        answer: { values: statements.map((statement) => statement.truthValue) },
      };
    }

    default:
      return null;
  }
}

export function expectedG5AU02S100Answer(item) {
  const { patternSpecId, data } = item;
  if (!S100_PATTERN_SET.has(patternSpecId)) return null;
  switch (patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence": {
      const isFactor = data.target % data.candidateDivisor === 0;
      return {
        target: data.target,
        candidateDivisor: data.candidateDivisor,
        isFactor,
        quotient: isFactor ? data.target / data.candidateDivisor : null,
      };
    }
    case "ps_g5a_u02_factor_enumeration_trial_division":
      return { values: factorsOf(data.target) };
    case "ps_g5a_u02_factor_list_from_pairs":
      return { values: factorsOf(data.target) };
    case "ps_g5a_u02_factor_statement_judgement":
      return { value: divisibilityTruth(data.grammarFamilyId, data.subjectValue, data.objectValue) };
    case "ps_g5a_u02_problem_type_classification":
      return { label: PROBLEM_SCENARIOS[data.scenarioFamilyId]?.expectedLabel ?? data.expectedLabel ?? data.contextKind };
    case "ps_g5a_u02_complete_factor_list_statement_evaluation":
      return { values: (data.statements ?? []).map((statement) => Boolean(statement.truthValue)) };
    default:
      return null;
  }
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function validateG5AU02S100Pattern(item) {
  const errors = [];
  if (!S100_PATTERN_SET.has(item?.patternSpecId)) return Object.freeze({ ok: true, errors: Object.freeze([]) });
  const data = item.data ?? {};

  switch (item.patternSpecId) {
    case "ps_g5a_u02_factor_relation_equivalence": {
      const expectedExact = data.target % data.candidateDivisor === 0;
      const multiplication = data.multiplicationWitness;
      const division = data.divisionWitness;
      if (!multiplication || !division || !["compare_two_methods", "complete_and_judge"].includes(data.learnerTaskMode)) {
        errors.push("G5AU02_P0_FACTOR_RELATION_DUAL_WITNESS_MISSING");
        break;
      }
      const multiplicationValid = multiplication.factorA === data.candidateDivisor
        && multiplication.factorB === Math.floor(data.target / data.candidateDivisor)
        && multiplication.product === multiplication.factorA * multiplication.factorB
        && multiplication.target === data.target
        && multiplication.relation === (expectedExact ? "equals_target" : "does_not_equal_target");
      const divisionValid = division.dividend === data.target
        && division.divisor === data.candidateDivisor
        && division.quotient === Math.floor(data.target / data.candidateDivisor)
        && division.remainder === data.target % data.candidateDivisor
        && division.isExact === expectedExact;
      if (!multiplicationValid || !divisionValid) errors.push("G5AU02_P0_FACTOR_RELATION_WITNESS_INCONSISTENT");
      break;
    }

    case "ps_g5a_u02_factor_enumeration_trial_division": {
      const expected = buildTrialDivision(data.target);
      const rows = data.trialDivisionRows;
      if (!Array.isArray(rows) || rows.length !== expected.searchEnd || data.searchEnd !== expected.searchEnd) {
        errors.push("G5AU02_P0_TRIAL_DIVISION_ROWS_INCOMPLETE");
      } else if (!same(rows, expected.rows)) {
        errors.push("G5AU02_P0_TRIAL_DIVISION_ROW_ARITHMETIC_INVALID");
      }
      if (!same(data.factorValues, expected.factorValues)) errors.push("G5AU02_P0_TRIAL_DIVISION_FACTOR_SET_MISMATCH");
      break;
    }

    case "ps_g5a_u02_factor_list_from_pairs": {
      const expectedPairs = factorPairsOf(data.target);
      const expectedList = factorsOf(data.target);
      if (!Array.isArray(data.factorPairs) || data.factorPairs.length === 0 || !data.transformationPrompt) {
        errors.push("G5AU02_P0_PAIR_SOURCE_NOT_VISIBLE");
      }
      if (!same(data.factorPairs, expectedPairs) || !same(data.orderedFactorList, expectedList)) {
        errors.push("G5AU02_P0_PAIR_TO_LIST_TRANSFORMATION_INVALID");
      }
      break;
    }

    case "ps_g5a_u02_factor_statement_judgement": {
      if (!DIVISIBILITY_FAMILIES.includes(data.grammarFamilyId)) {
        errors.push("G5AU02_P0_DIVISIBILITY_GRAMMAR_UNKNOWN");
        break;
      }
      const expectedSubject = ["candidate_is_factor_of_target", "candidate_divides_target"].includes(data.grammarFamilyId)
        ? data.candidateDivisor
        : data.target;
      const expectedObject = ["candidate_is_factor_of_target", "candidate_divides_target"].includes(data.grammarFamilyId)
        ? data.target
        : data.candidateDivisor;
      if (data.subjectValue !== expectedSubject || data.objectValue !== expectedObject
        || data.statementText !== divisibilityText(data.grammarFamilyId, expectedSubject, expectedObject)) {
        errors.push("G5AU02_P0_DIVISIBILITY_ROLE_DIRECTION_INVALID");
      }
      if (data.truthValue !== divisibilityTruth(data.grammarFamilyId, data.subjectValue, data.objectValue)) {
        errors.push("G5AU02_P0_DIVISIBILITY_TRUTH_MISMATCH");
      }
      break;
    }

    case "ps_g5a_u02_problem_type_classification": {
      const scenario = PROBLEM_SCENARIOS[data.scenarioFamilyId];
      if (!scenario) {
        errors.push("G5AU02_P0_PROBLEM_SCENARIO_FAMILY_UNKNOWN");
        break;
      }
      if (!data.scenarioText || !data.quantityRoles || Object.keys(data.quantityRoles).length < 2) {
        errors.push("G5AU02_P0_PROBLEM_QUANTITY_ROLE_MISSING");
      }
      if (data.expectedLabel !== scenario.expectedLabel || data.contextKind !== scenario.expectedLabel) {
        errors.push("G5AU02_P0_PROBLEM_TYPE_LABEL_MISMATCH");
      }
      break;
    }

    case "ps_g5a_u02_complete_factor_list_statement_evaluation": {
      const statements = data.statements ?? [];
      const truthPattern = statements.map((statement) => Boolean(statement.truthValue));
      const allowedFamilies = new Set([
        "candidate_is_factor",
        "target_is_multiple",
        "factor_count_parity",
        "square_number_odd_factor_count",
        "paired_factors_product_target",
      ]);
      const oldTrivial = statements.length <= 3 && statements.every((statement) => ["contains_one", "contains_self", "factor_count_even"].includes(statement.kind));
      if (statements.length < 3 || oldTrivial || statements.some((statement) => !allowedFamilies.has(statement.statementFamilyId))) {
        errors.push("G5AU02_P0_STATEMENT_SET_TRIVIAL");
      }
      if (!truthPattern.includes(true) || !truthPattern.includes(false) || !same(data.truthPattern, truthPattern)) {
        errors.push("G5AU02_P0_STATEMENT_TRUTH_PATTERN_INVALID");
      }
      if (!statements.some((statement) => [
        "count_complete_factor_list",
        "connect_square_number_to_unpaired_middle_factor",
        "verify_factor_pair_product",
      ].includes(statement.requiredInference))) {
        errors.push("G5AU02_P0_STATEMENT_INFERENCE_NOT_REQUIRED");
      }
      break;
    }

    default:
      break;
  }

  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze([...new Set(errors)]) });
}

export const G5A_U02_S100_DIVISIBILITY_FAMILIES = DIVISIBILITY_FAMILIES;
export const G5A_U02_S100_PROBLEM_SCENARIO_IDS = PROBLEM_SCENARIO_IDS;
export const G5A_U02_S100_PROBLEM_SCENARIOS = PROBLEM_SCENARIOS;
