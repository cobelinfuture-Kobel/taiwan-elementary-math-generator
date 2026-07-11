function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function randomInt(seed, offset, min, max) {
  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || max < min) {
    throw new Error(`G3B_U08_REALISM_INVALID_RANGE:${min}:${max}`);
  }
  const mixed = mix32(seed + Math.imul(offset + 1, 0x9e3779b1));
  return min + (mixed % (max - min + 1));
}

function pick(seed, offset, values) {
  return values[randomInt(seed, offset, 0, values.length - 1)];
}

function range(min, max) {
  return Object.freeze({ min, max });
}

function contextKey(scenario) {
  return String(scenario?.contextVariantId ?? "");
}

function multiplyPerGroupRange(spec, scenario) {
  const family = spec.templateFamilyId;
  const key = contextKey(scenario);
  if (family === "tpl_g3b_u08_total_daily_saving_accumulation") return range(5, 100);
  if (family === "tpl_g3b_u08_total_score_per_success") return range(2, 10);
  if (family === "tpl_g3b_u08_total_material_per_product") {
    if (key.endsWith("paper_card")) return range(1, 6);
    if (key.endsWith("bracelet")) return range(5, 15);
    return range(2, 6);
  }
  if (family === "tpl_g3b_u08_total_items_per_package") {
    if (key.endsWith("cookies")) return range(4, 24);
    if (key.endsWith("crayons")) return range(6, 36);
    return range(10, 60);
  }
  return range(2, 99);
}

function divisionProfile(spec, scenario) {
  const family = spec.templateFamilyId;
  const key = contextKey(scenario);
  if (family === "tpl_g3b_u08_group_count_score_events") {
    return { divisor: range(2, 10), quotient: range(2, 20) };
  }
  if (family === "tpl_g3b_u08_group_count_craft_products") {
    if (key.endsWith("bracelet")) return { divisor: range(5, 9), quotient: range(2, 20) };
    if (key.endsWith("necklace")) return { divisor: range(6, 9), quotient: range(2, 20) };
    return { divisor: range(2, 6), quotient: range(2, 20) };
  }
  if (family === "tpl_g3b_u08_group_count_equal_segments") {
    return { divisor: range(4, 9), quotient: range(2, 30) };
  }
  if (family === "tpl_g3b_u08_group_count_packaging") {
    return { divisor: range(3, 9), quotient: range(2, 20) };
  }
  if (family === "tpl_g3b_u08_per_group_daily_saving") {
    return { divisor: range(2, 9), quotient: range(5, 100) };
  }
  if (family === "tpl_g3b_u08_per_group_equal_share_people") {
    if (key.endsWith("beads")) return { divisor: range(2, 9), quotient: range(5, 30) };
    return { divisor: range(2, 9), quotient: range(2, 12) };
  }
  if (family === "tpl_g3b_u08_per_group_equal_container_capacity") {
    return { divisor: range(2, 9), quotient: range(50, 180) };
  }
  if (family === "tpl_g3b_u08_per_group_equal_segment_length") {
    return key.endsWith("track")
      ? { divisor: range(2, 9), quotient: range(10, 100) }
      : { divisor: range(2, 9), quotient: range(5, 50) };
  }
  if (family === "tpl_g3b_u08_reverse_base_price_multiple") {
    if (key.endsWith("clothing")) return { divisor: range(2, 6), quotient: range(50, 250) };
    if (key.endsWith("stationery")) return { divisor: range(2, 6), quotient: range(20, 150) };
    return { divisor: range(2, 6), quotient: range(20, 180) };
  }
  if (family === "tpl_g3b_u08_reverse_base_quantity_multiple") {
    if (key.endsWith("books")) return { divisor: range(2, 6), quotient: range(2, 20) };
    return { divisor: range(2, 9), quotient: range(5, 50) };
  }
  if (family === "tpl_g3b_u08_reverse_base_length_multiple") {
    return key.endsWith("track")
      ? { divisor: range(2, 6), quotient: range(20, 150) }
      : { divisor: range(2, 6), quotient: range(10, 150) };
  }
  if (family === "tpl_g3b_u08_reverse_base_capacity_multiple") {
    return { divisor: range(2, 6), quotient: range(50, 300) };
  }
  return { divisor: range(2, 9), quotient: range(2, 99) };
}

function comparisonPerUnitRange(spec, scenario) {
  const key = contextKey(scenario);
  if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_weight") return range(50, 250);
  if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_capacity") return range(100, 500);
  if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_item_count") {
    if (key.endsWith("pencils")) return range(6, 36);
    if (key.endsWith("stickers")) return range(10, 100);
    return range(10, 60);
  }
  return range(30, 250);
}

function sampleMultiply(spec, scenario, seed) {
  const b = randomInt(seed, 1, 2, 9);
  const allowed = multiplyPerGroupRange(spec, scenario);
  const maxA = Math.min(allowed.max, Math.floor(999 / b));
  const a = randomInt(seed, 2, allowed.min, maxA);
  const answer = a * b;
  return { values: { a, b }, answer, intermediateResults: [answer] };
}

function sampleDivision(spec, scenario, seed) {
  const profile = divisionProfile(spec, scenario);
  const maxDivisor = Math.min(profile.divisor.max, 9);
  const b = randomInt(seed, 3, profile.divisor.min, maxDivisor);
  const maxQuotient = Math.min(profile.quotient.max, Math.floor(999 / b));
  const minQuotient = Math.max(profile.quotient.min, Math.ceil(10 / b));
  const answer = randomInt(seed, 4, minQuotient, maxQuotient);
  const a = answer * b;
  return { values: { a, b }, answer, intermediateResults: [answer] };
}

function sampleNearestHundredEstimate(seed) {
  const h = pick(seed, 5, [100, 200, 300]);
  const delta = randomInt(seed, 6, 5, 40);
  const direction = randomInt(seed, 7, 0, 1) === 0 ? -1 : 1;
  const a = h + direction * delta;
  const maxB = Math.max(2, Math.min(6, Math.floor(999 / Math.max(h, a))));
  const b = randomInt(seed, 8, 2, maxB);
  const estimateValue = h * b;
  const exactValue = a * b;
  return {
    values: { a, b, h },
    answer: estimateValue,
    estimateValue,
    exactValue,
    exactDifference: exactValue - estimateValue,
    judgment: "approximately",
    estimateEquationModel: `${h} × ${b} = ${estimateValue}`,
    exactEquationModel: `${a} × ${b} = ${exactValue}`,
    intermediateResults: [h, estimateValue, exactValue]
  };
}

function sampleUpperBudgetEstimate(seed) {
  const h = pick(seed, 9, [100, 200, 300]);
  const d = randomInt(seed, 10, 5, 40);
  const a = h - d;
  const maxB = Math.max(2, Math.min(6, Math.floor(999 / h)));
  const b = randomInt(seed, 11, 2, maxB);
  const c = h * b;
  const exactValue = a * b;
  return {
    values: { a, b, c, h, d },
    answer: c,
    estimateValue: c,
    exactValue,
    exactDifference: c - exactValue,
    judgment: "enough",
    estimateEquationModel: `${h} × ${b} = ${c}`,
    exactEquationModel: `${a} × ${b} = ${exactValue}`,
    intermediateResults: [h, c, exactValue]
  };
}

function sampleBenchmarkDifference(seed, direction) {
  const h = pick(seed, 12, [100, 200, 300]);
  const d = randomInt(seed, 13, 5, 25);
  const unitPrice = direction === "over" ? h + d : h - d;
  const maxB = Math.max(2, Math.min(6, Math.floor(999 / Math.max(h, unitPrice))));
  const b = randomInt(seed, 14, 2, maxB);
  const c = h * b;
  const exactValue = unitPrice * b;
  const exactDifference = d * b;
  return {
    values: { h, d, b, c, unitPrice },
    answer: exactDifference,
    estimateValue: c,
    exactValue,
    exactDifference,
    judgment: direction === "over" ? "more_by" : "less_by",
    estimateEquationModel: `${h} × ${b} = ${c}`,
    exactEquationModel: `${unitPrice} × ${b} = ${exactValue}`,
    intermediateResults: [c, exactValue, exactDifference]
  };
}

function sampleComparison(spec, scenario, seed) {
  const allowed = comparisonPerUnitRange(spec, scenario);
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const a = randomInt(seed, 20 + attempt * 4, 2, 6);
    const c = randomInt(seed, 21 + attempt * 4, 2, 6);
    const maxB = Math.min(allowed.max, Math.floor(999 / a));
    const maxD = Math.min(allowed.max, Math.floor(999 / c));
    if (maxB < allowed.min || maxD < allowed.min) continue;
    const b = randomInt(seed, 22 + attempt * 4, allowed.min, maxB);
    const d = randomInt(seed, 23 + attempt * 4, allowed.min, maxD);
    const optionATotal = a * b;
    const optionBTotal = c * d;
    if (optionATotal === optionBTotal) continue;
    const ratio = Math.max(optionATotal, optionBTotal) / Math.min(optionATotal, optionBTotal);
    if (ratio > 3) continue;
    const winner = optionATotal > optionBTotal ? "option_a" : "option_b";
    return {
      values: { a, b, c, d },
      answer: winner,
      optionATotal,
      optionBTotal,
      winner,
      intermediateResults: [optionATotal, optionBTotal]
    };
  }
  throw new Error(`G3B_U08_REALISM_COMPARISON_EXHAUSTED:${spec.patternSpecId}:${scenario.contextVariantId}`);
}

export function sampleG3BU08RealisticForSpec(spec, scenario, seed) {
  if (spec.equationShape === "a*b") return sampleMultiply(spec, scenario, seed);
  if (spec.equationShape === "a/b") return sampleDivision(spec, scenario, seed);
  if (spec.equationShape === "round100(a)*b") return sampleNearestHundredEstimate(seed);
  if (spec.equationShape === "ceil100(a)*b") return sampleUpperBudgetEstimate(seed);
  if (spec.equationShape === "(h+d)*b") return sampleBenchmarkDifference(seed, "over");
  if (spec.equationShape === "(h-d)*b") return sampleBenchmarkDifference(seed, "under");
  if (spec.equationShape === "a*b vs c*d") return sampleComparison(spec, scenario, seed);
  return null;
}

function within(value, allowed) {
  return Number.isSafeInteger(value) && value >= allowed.min && value <= allowed.max;
}

export function checkG3BU08HumanRealism(question, spec, scenario) {
  const reasons = [];
  if (!spec || !scenario) return { ok: false, reasons: ["missing_spec_or_scenario"] };
  const values = question.quantities ?? {};

  if (spec.equationShape === "a*b") {
    const allowed = multiplyPerGroupRange(spec, scenario);
    if (!within(values.a, allowed) || !within(values.b, range(2, 9))) reasons.push("multiplication_context_range");
  }
  if (spec.equationShape === "a/b") {
    const profile = divisionProfile(spec, scenario);
    if (!within(values.b, profile.divisor) || !within(question.finalAnswer, profile.quotient)) reasons.push("division_context_range");
  }
  if (spec.equationShape === "a*b vs c*d") {
    const allowed = comparisonPerUnitRange(spec, scenario);
    if (!within(values.a, range(2, 6)) || !within(values.c, range(2, 6))) reasons.push("comparison_count_range");
    if (!within(values.b, allowed) || !within(values.d, allowed)) reasons.push("comparison_per_unit_range");
    const low = Math.min(question.optionATotal, question.optionBTotal);
    const high = Math.max(question.optionATotal, question.optionBTotal);
    if (!Number.isFinite(low) || low <= 0 || high / low > 3) reasons.push("comparison_excessive_ratio");
    if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_capacity" && scenario.bindings.item && !question.promptText.includes(scenario.bindings.item)) {
      reasons.push("capacity_context_not_expressed");
    }
    if (spec.templateFamilyId === "tpl_g3b_u08_same_price_compare_total_length" && !/總長度較長/.test(question.conclusionZh ?? "")) {
      reasons.push("length_conclusion_wording");
    }
  }

  return { ok: reasons.length === 0, reasons };
}
