const PATTERN_ID = "ps_g5a_u02_remainder_transfer";

const SCENARIO_FAMILIES = Object.freeze([
  Object.freeze({
    scenarioFamilyId: "school_sticker_packets",
    contextDomain: "school_supplies_packaging",
    actor: "老師",
    itemName: "貼紙",
    itemUnit: "張",
    largerContainerName: "大包",
    smallerContainerName: "小包",
  }),
  Object.freeze({
    scenarioFamilyId: "classroom_card_bundles",
    contextDomain: "classroom_material_distribution",
    actor: "班上",
    itemName: "字卡",
    itemUnit: "張",
    largerContainerName: "大疊",
    smallerContainerName: "小疊",
  }),
  Object.freeze({
    scenarioFamilyId: "art_bead_bags",
    contextDomain: "art_material_packaging",
    actor: "美勞教室",
    itemName: "串珠",
    itemUnit: "顆",
    largerContainerName: "大袋",
    smallerContainerName: "小袋",
  }),
  Object.freeze({
    scenarioFamilyId: "library_book_carts",
    contextDomain: "library_book_distribution",
    actor: "圖書館",
    itemName: "圖書",
    itemUnit: "本",
    largerContainerName: "大車",
    smallerContainerName: "小車",
  }),
]);

const FAMILY_BY_ID = new Map(SCENARIO_FAMILIES.map((family) => [family.scenarioFamilyId, family]));

function clone(value) { return JSON.parse(JSON.stringify(value)); }
function exact(actual, expected) { return JSON.stringify(actual) === JSON.stringify(expected); }
function freeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) freeze(nested);
  return Object.freeze(value);
}

function buildScenarioText(family, values) {
  return `${family.actor}有 ${values.total} ${family.itemUnit}${family.itemName}。每 ${values.largerDivisor} ${family.itemUnit}裝成一${family.largerContainerName}，裝完會剩 ${values.remainder} ${family.itemUnit}；若改成每 ${values.smallerDivisor} ${family.itemUnit}裝成一${family.smallerContainerName}，會剩幾${family.itemUnit}？`;
}

function buildQuantityRoles(family, values) {
  return {
    total: { role: "total_quantity", value: values.total, itemName: family.itemName, unitLabel: family.itemUnit },
    largerDistribution: {
      role: "known_larger_distribution",
      groupSize: values.largerDivisor,
      containerName: family.largerContainerName,
      groupCount: values.largerGroupCount,
      unitLabel: family.itemUnit,
    },
    smallerDistribution: {
      role: "target_smaller_distribution",
      groupSize: values.smallerDivisor,
      containerName: family.smallerContainerName,
      groupCount: values.smallerGroupCount,
      unitLabel: family.itemUnit,
    },
    remainder: { role: "transferred_remainder", value: values.remainder, unitLabel: family.itemUnit },
  };
}

function buildDivisorRelation(values) {
  return {
    relationKind: "larger_divisor_is_multiple_of_smaller_divisor",
    largerDivisor: values.largerDivisor,
    smallerDivisor: values.smallerDivisor,
    multiplier: values.multiplier,
    equationText: `${values.largerDivisor}＝${values.smallerDivisor}×${values.multiplier}`,
  };
}

function buildDistributionWitness(values) {
  return {
    witnessKind: "two_level_distribution_remainder_transfer",
    knownDistribution: {
      dividend: values.total,
      divisor: values.largerDivisor,
      quotient: values.largerGroupCount,
      remainder: values.remainder,
      equationText: `${values.total}＝${values.largerDivisor}×${values.largerGroupCount}＋${values.remainder}`,
    },
    transferredDistribution: {
      dividend: values.total,
      divisor: values.smallerDivisor,
      quotient: values.smallerGroupCount,
      remainder: values.remainder,
      equationText: `${values.total}＝${values.smallerDivisor}×${values.smallerGroupCount}＋${values.remainder}`,
    },
    groupConversion: {
      largerGroupCount: values.largerGroupCount,
      smallerGroupsPerLargerGroup: values.multiplier,
      smallerGroupCount: values.smallerGroupCount,
      equationText: `${values.largerGroupCount}×${values.multiplier}＝${values.smallerGroupCount}`,
    },
  };
}

export function isG5AU02S108Pattern(patternSpecId) { return patternSpecId === PATTERN_ID; }
export function getG5AU02S108PatternIds() { return [PATTERN_ID]; }
export function getG5AU02S108ScenarioFamilyIds() { return SCENARIO_FAMILIES.map((family) => family.scenarioFamilyId); }

export function generateG5AU02S108Pattern(patternSpecId, rng) {
  if (!isG5AU02S108Pattern(patternSpecId)) return null;
  const family = rng.pick(SCENARIO_FAMILIES);
  const smallerDivisor = rng.int(2, 8);
  const multiplier = rng.int(2, 5);
  const largerDivisor = smallerDivisor * multiplier;
  const remainder = rng.int(1, smallerDivisor - 1);
  const largerGroupCount = rng.int(2, 12);
  const smallerGroupCount = largerGroupCount * multiplier;
  const total = largerDivisor * largerGroupCount + remainder;
  const values = { total, smallerDivisor, largerDivisor, multiplier, remainder, largerGroupCount, smallerGroupCount };
  const scenarioText = buildScenarioText(family, values);
  return freeze({
    prompt: scenarioText,
    data: {
      scenarioFamilyId: family.scenarioFamilyId,
      contextDomain: family.contextDomain,
      scenarioText,
      total,
      dividend: total,
      largerDivisor,
      smallerDivisor,
      multiplier,
      knownRemainder: remainder,
      remainder,
      quantityRoles: buildQuantityRoles(family, values),
      divisorRelation: buildDivisorRelation(values),
      distributionWitness: buildDistributionWitness(values),
      semanticRole: "remainder_transfer",
    },
    answer: { remainder, smallerDivisor },
  });
}

export function expectedG5AU02S108Answer(item) {
  const data = item?.data ?? {};
  return { remainder: data.total % data.smallerDivisor, smallerDivisor: data.smallerDivisor };
}

export function validateG5AU02S108Pattern(item) {
  const errors = [];
  if (!isG5AU02S108Pattern(item?.patternSpecId)) {
    return freeze({ ok: false, errors: ["G5AU02_S108_PATTERN_UNSUPPORTED"] });
  }
  const data = item.data ?? {};
  const family = FAMILY_BY_ID.get(data.scenarioFamilyId);
  if (!family || data.contextDomain !== family.contextDomain) {
    errors.push("G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_FAMILY_UNKNOWN");
  }

  if (family) {
    const values = {
      total: data.total,
      smallerDivisor: data.smallerDivisor,
      largerDivisor: data.largerDivisor,
      multiplier: data.multiplier,
      remainder: data.remainder,
      largerGroupCount: data.distributionWitness?.knownDistribution?.quotient,
      smallerGroupCount: data.distributionWitness?.transferredDistribution?.quotient,
    };
    const expectedScenario = buildScenarioText(family, values);
    const expectedRoles = buildQuantityRoles(family, values);
    if (data.scenarioText !== expectedScenario || item.prompt !== expectedScenario || !exact(data.quantityRoles, expectedRoles)) {
      errors.push("G5AU02_P2_REMAINDER_TRANSFER_CONTEXT_ROLE_MISSING");
    }
  }

  const knownQuotient = data.distributionWitness?.knownDistribution?.quotient;
  const transferredQuotient = data.distributionWitness?.transferredDistribution?.quotient;
  const values = {
    total: data.total,
    smallerDivisor: data.smallerDivisor,
    largerDivisor: data.largerDivisor,
    multiplier: data.multiplier,
    remainder: data.remainder,
    largerGroupCount: knownQuotient,
    smallerGroupCount: transferredQuotient,
  };
  const witnessValid = Number.isInteger(data.total)
    && data.total === data.dividend
    && Number.isInteger(data.smallerDivisor)
    && data.smallerDivisor >= 2
    && Number.isInteger(data.multiplier)
    && data.multiplier >= 2
    && data.largerDivisor === data.smallerDivisor * data.multiplier
    && Number.isInteger(data.remainder)
    && data.remainder >= 1
    && data.remainder < data.smallerDivisor
    && Number.isInteger(knownQuotient)
    && knownQuotient >= 2
    && transferredQuotient === knownQuotient * data.multiplier
    && data.total === data.largerDivisor * knownQuotient + data.remainder
    && data.total === data.smallerDivisor * transferredQuotient + data.remainder
    && data.knownRemainder === data.remainder
    && exact(data.divisorRelation, buildDivisorRelation(values))
    && exact(data.distributionWitness, buildDistributionWitness(values))
    && exact(item.answer, expectedG5AU02S108Answer(item));
  if (!witnessValid) errors.push("G5AU02_P2_REMAINDER_TRANSFER_WITNESS_MISMATCH");

  return freeze({ ok: errors.length === 0, errors: [...new Set(errors)] });
}

export const G5A_U02_S108_SCENARIO_FAMILIES = freeze(clone(SCENARIO_FAMILIES));
