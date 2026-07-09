export const G4A_U08_PHASE2A_CONVERSION_TARGET_RATE = 0.4;

export const UNIT_DOMAINS = Object.freeze({
  money: Object.freeze({ unitLabels: Object.freeze(["元"]), conversionEligible: false }),
  count_items: Object.freeze({ unitLabels: Object.freeze(["個", "箱", "盒", "包", "片", "張", "支", "顆", "人", "班", "條", "本"]), conversionEligible: false }),
  capacity: Object.freeze({ unitLabels: Object.freeze(["L", "mL"]), conversionEligible: true }),
  weight: Object.freeze({ unitLabels: Object.freeze(["kg", "g"]), conversionEligible: true }),
  length: Object.freeze({ unitLabels: Object.freeze(["km", "m", "cm", "mm"]), conversionEligible: true }),
  time: Object.freeze({ unitLabels: Object.freeze(["時", "分", "秒"]), conversionEligible: true })
});

export const CONVERSION_RULES = Object.freeze({
  L_to_mL: Object.freeze({ id: "L_to_mL", unitDomain: "capacity", fromUnit: "L", toUnit: "mL", factor: 1000, lineText: "1 L = 1000 mL" }),
  kg_to_g: Object.freeze({ id: "kg_to_g", unitDomain: "weight", fromUnit: "kg", toUnit: "g", factor: 1000, lineText: "1 kg = 1000 g" }),
  km_to_m: Object.freeze({ id: "km_to_m", unitDomain: "length", fromUnit: "km", toUnit: "m", factor: 1000, lineText: "1 km = 1000 m" }),
  m_to_cm: Object.freeze({ id: "m_to_cm", unitDomain: "length", fromUnit: "m", toUnit: "cm", factor: 100, lineText: "1 m = 100 cm" }),
  cm_to_mm: Object.freeze({ id: "cm_to_mm", unitDomain: "length", fromUnit: "cm", toUnit: "mm", factor: 10, lineText: "1 cm = 10 mm" }),
  hour_to_minute: Object.freeze({ id: "hour_to_minute", unitDomain: "time", fromUnit: "時", toUnit: "分", factor: 60, lineText: "1 時 = 60 分" }),
  minute_to_second: Object.freeze({ id: "minute_to_second", unitDomain: "time", fromUnit: "分", toUnit: "秒", factor: 60, lineText: "1 分 = 60 秒" })
});

const DEFAULT_CONVERSION_RULE_BY_DOMAIN = Object.freeze({
  capacity: "L_to_mL",
  weight: "kg_to_g",
  length: "m_to_cm",
  time: "hour_to_minute"
});

export function cloneValue(value) {
  if (Array.isArray(value)) return value.map((item) => cloneValue(item));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, cloneValue(nested)]));
  return value;
}

export function getUnitDomainPolicy(unitDomain) {
  return UNIT_DOMAINS[unitDomain] ?? null;
}

export function isUnitDomainAllowed(unitDomain) {
  return Boolean(getUnitDomainPolicy(unitDomain));
}

export function isUnitLabelAllowed(unitDomain, unitLabel) {
  return Boolean(getUnitDomainPolicy(unitDomain)?.unitLabels.includes(unitLabel));
}

export function isConversionEligibleDomain(unitDomain) {
  return getUnitDomainPolicy(unitDomain)?.conversionEligible === true;
}

export function getDefaultConversionRuleForDomain(unitDomain) {
  const ruleId = DEFAULT_CONVERSION_RULE_BY_DOMAIN[unitDomain];
  return ruleId ? CONVERSION_RULES[ruleId] : null;
}

export function convertByRule(rule, sourceValue) {
  if (!rule || !Number.isInteger(sourceValue)) return null;
  const convertedValue = sourceValue * rule.factor;
  return {
    ruleId: rule.id,
    unitDomain: rule.unitDomain,
    fromUnit: rule.fromUnit,
    toUnit: rule.toUnit,
    sourceValue,
    convertedValue,
    lineText: rule.lineText,
    conversionText: `${sourceValue} ${rule.fromUnit} = ${convertedValue} ${rule.toUnit}`
  };
}

export function hasAllowedConversionRule(unitDomain, ruleId) {
  const rule = CONVERSION_RULES[ruleId];
  return Boolean(rule && rule.unitDomain === unitDomain);
}
