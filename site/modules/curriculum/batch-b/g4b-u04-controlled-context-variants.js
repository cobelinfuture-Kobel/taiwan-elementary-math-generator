import {
  generateG4BU04ClassDQuestion,
  g4bU04MethodLabel,
  g4bU04TargetPlaceLabel,
} from "./g4b-u04-class-d-semantic-generator.js";
import {
  validateG4BU04ClassDQuestion,
} from "./g4b-u04-class-d-semantic-validator.js";

export const G4B_U04_CONTEXT_CONTRACT_VERSION = "g4b-u04-controlled-context-v1";
export const G4B_U04_CONTEXT_MODES = Object.freeze(["mixed", "daily_life", "sdg"]);
export const G4B_U04_CONTEXT_DEFAULT_MODE = "mixed";
export const G4B_U04_ALLOWLISTED_SDG_GOALS = Object.freeze([6, 7, 11, 12, 13, 15]);

export const G4B_U04_SDG_ELIGIBLE_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g4b_u04_floor_complete_groups",
  "ps_g4b_u04_ceiling_minimum_required",
  "ps_g4b_u04_round_then_add",
  "ps_g4b_u04_round_then_subtract",
  "ps_g4b_u04_round_then_multiply",
  "ps_g4b_u04_round_then_divide",
]);

const eligibleIds = new Set(G4B_U04_SDG_ELIGIBLE_PATTERN_SPEC_IDS);

function deepClone(value) {
  if (Array.isArray(value)) return value.map(deepClone);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, deepClone(nested)]));
  }
  return value;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

function sameValue(left, right) {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right));
}

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "r2e")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function formatNumber(value) {
  return new Intl.NumberFormat("zh-TW").format(value);
}

function numericAnswer(question, unitLabel) {
  return {
    structuredAnswer: { ...(question.structuredAnswer ?? {}), value: question.finalAnswer, unitLabel },
    answerText: `${formatNumber(question.finalAnswer)}${unitLabel}`,
  };
}

const VARIANTS = Object.freeze([
  Object.freeze({
    id: "sdg12_recycling_full_boxes",
    patternSpecId: "ps_g4b_u04_floor_complete_groups",
    sdgGoal: 12,
    contextDomain: "responsible_recycling",
    unitLabel: "箱",
    render(question) {
      const total = question.input.total;
      const groupSize = question.input.groupSize;
      return {
        promptText: `某次社區回收活動收集了 ${formatNumber(total)} 個寶特瓶，每 ${formatNumber(groupSize)} 個裝成一箱，最多可以裝成幾箱完整的回收箱？`,
        context: { itemUnit: "個", itemName: "寶特瓶", containerClassifier: "箱", containerName: "回收箱" },
        templateRoles: { total, itemUnit: "個", itemName: "寶特瓶", groupSize, containerClassifier: "箱", containerName: "回收箱" },
        ...numericAnswer(question, "箱"),
      };
    },
  }),
  Object.freeze({
    id: "sdg15_seedling_full_trays",
    patternSpecId: "ps_g4b_u04_floor_complete_groups",
    sdgGoal: 15,
    contextDomain: "habitat_restoration",
    unitLabel: "盤",
    render(question) {
      const total = question.input.total;
      const groupSize = question.input.groupSize;
      return {
        promptText: `某次棲地復育活動準備了 ${formatNumber(total)} 株樹苗，每 ${formatNumber(groupSize)} 株放成一盤，最多可以放成幾盤完整的樹苗？`,
        context: { itemUnit: "株", itemName: "樹苗", containerClassifier: "盤", containerName: "育苗盤" },
        templateRoles: { total, itemUnit: "株", itemName: "樹苗", groupSize, containerClassifier: "盤", containerName: "育苗盤" },
        ...numericAnswer(question, "盤"),
      };
    },
  }),
  Object.freeze({
    id: "sdg6_rainwater_storage_minimum",
    patternSpecId: "ps_g4b_u04_ceiling_minimum_required",
    sdgGoal: 6,
    contextDomain: "water_conservation",
    unitLabel: "座",
    render(question) {
      const total = question.input.total;
      const capacity = question.input.capacityOrIncrement;
      return {
        promptText: `某次校園節水規劃要收集 ${formatNumber(total)} 公升雨水，每座儲水設備最多裝 ${formatNumber(capacity)} 公升，全部裝完至少需要幾座？`,
        context: { itemUnit: "公升", containerClassifier: "座", containerName: "儲水設備" },
        templateRoles: { total, itemUnit: "公升", capacity, containerClassifier: "座", containerName: "儲水設備" },
        ...numericAnswer(question, "座"),
      };
    },
  }),
  Object.freeze({
    id: "sdg12_recycling_boxes_minimum",
    patternSpecId: "ps_g4b_u04_ceiling_minimum_required",
    sdgGoal: 12,
    contextDomain: "responsible_recycling",
    unitLabel: "箱",
    render(question) {
      const total = question.input.total;
      const capacity = question.input.capacityOrIncrement;
      return {
        promptText: `某次資源回收活動共有 ${formatNumber(total)} 個回收物，每箱最多裝 ${formatNumber(capacity)} 個，全部裝完至少需要幾箱？`,
        context: { itemUnit: "個", itemName: "回收物", containerClassifier: "箱", containerName: "回收箱" },
        templateRoles: { total, itemUnit: "個", itemName: "回收物", capacity, containerClassifier: "箱", containerName: "回收箱" },
        ...numericAnswer(question, "箱"),
      };
    },
  }),
  Object.freeze({
    id: "sdg11_shuttle_trips_minimum",
    patternSpecId: "ps_g4b_u04_ceiling_minimum_required",
    sdgGoal: 11,
    contextDomain: "sustainable_transport",
    unitLabel: "趟",
    applicable(question) {
      return question.input.capacityOrIncrement <= 100;
    },
    render(question) {
      const total = question.input.total;
      const capacity = question.input.capacityOrIncrement;
      return {
        promptText: `某次社區接駁規劃要載送 ${formatNumber(total)} 人，每趟最多載 ${formatNumber(capacity)} 人，全部載完至少需要幾趟？`,
        context: { itemUnit: "人", containerClassifier: "趟", containerName: "接駁車" },
        templateRoles: { total, itemUnit: "人", capacity, containerClassifier: "趟", containerName: "接駁車" },
        ...numericAnswer(question, "趟"),
      };
    },
  }),
  Object.freeze({
    id: "sdg6_water_saved_total",
    patternSpecId: "ps_g4b_u04_round_then_add",
    sdgGoal: 6,
    contextDomain: "water_conservation",
    unitLabel: "公升",
    render(question) {
      const input = question.input;
      return {
        promptText: `甲校某次節水活動記錄 ${formatNumber(input.operandA)} 公升，用${g4bU04MethodLabel(input.methodA)}取概數到${g4bU04TargetPlaceLabel(input.targetUnitA)}；乙校記錄 ${formatNumber(input.operandB)} 公升，用${g4bU04MethodLabel(input.methodB)}取概數到${g4bU04TargetPlaceLabel(input.targetUnitB)}。兩校合計約節省多少公升？`,
        context: { unitLabel: "公升", setting: "兩校節水活動" },
        templateRoles: { ...input, unitLabel: "公升" },
        ...numericAnswer(question, "公升"),
      };
    },
  }),
  Object.freeze({
    id: "sdg11_transit_riders_total",
    patternSpecId: "ps_g4b_u04_round_then_add",
    sdgGoal: 11,
    contextDomain: "sustainable_transport",
    unitLabel: "人",
    render(question) {
      const input = question.input;
      return {
        promptText: `甲站某日有 ${formatNumber(input.operandA)} 人搭乘大眾運輸，用${g4bU04MethodLabel(input.methodA)}取概數到${g4bU04TargetPlaceLabel(input.targetUnitA)}；乙站有 ${formatNumber(input.operandB)} 人，用${g4bU04MethodLabel(input.methodB)}取概數到${g4bU04TargetPlaceLabel(input.targetUnitB)}。兩站合計約有多少人？`,
        context: { unitLabel: "人", setting: "大眾運輸站點" },
        templateRoles: { ...input, unitLabel: "人" },
        ...numericAnswer(question, "人"),
      };
    },
  }),
  Object.freeze({
    id: "sdg13_tree_planting_difference",
    patternSpecId: "ps_g4b_u04_round_then_subtract",
    sdgGoal: 13,
    contextDomain: "tree_planting",
    unitLabel: "棵",
    render(question) {
      const input = question.input;
      return {
        promptText: `甲社區某次植樹規劃有 ${formatNumber(input.operandA)} 棵，用${g4bU04MethodLabel(input.methodA)}取概數到${g4bU04TargetPlaceLabel(input.targetUnitA)}；乙社區有 ${formatNumber(input.operandB)} 棵，用${g4bU04MethodLabel(input.methodB)}取概數到${g4bU04TargetPlaceLabel(input.targetUnitB)}。兩社區相差約多少棵？`,
        context: { unitLabel: "棵", setting: "社區植樹規劃" },
        templateRoles: { ...input, unitLabel: "棵" },
        ...numericAnswer(question, "棵"),
      };
    },
  }),
  Object.freeze({
    id: "sdg15_restoration_seedlings_difference",
    patternSpecId: "ps_g4b_u04_round_then_subtract",
    sdgGoal: 15,
    contextDomain: "habitat_restoration",
    unitLabel: "株",
    render(question) {
      const input = question.input;
      return {
        promptText: `甲地某次復育規劃準備 ${formatNumber(input.operandA)} 株樹苗，用${g4bU04MethodLabel(input.methodA)}取概數到${g4bU04TargetPlaceLabel(input.targetUnitA)}；乙地準備 ${formatNumber(input.operandB)} 株，用${g4bU04MethodLabel(input.methodB)}取概數到${g4bU04TargetPlaceLabel(input.targetUnitB)}。兩地相差約多少株？`,
        context: { unitLabel: "株", setting: "棲地復育規劃" },
        templateRoles: { ...input, unitLabel: "株" },
        ...numericAnswer(question, "株"),
      };
    },
  }),
  Object.freeze({
    id: "sdg7_renewable_energy_repeated_total",
    patternSpecId: "ps_g4b_u04_round_then_multiply",
    sdgGoal: 7,
    contextDomain: "renewable_energy",
    unitLabel: "度",
    render(question) {
      const input = question.input;
      return {
        promptText: `某處再生能源設備一期預計產生 ${formatNumber(input.value)} 度電，用${g4bU04MethodLabel(input.method)}取概數到${g4bU04TargetPlaceLabel(input.targetUnit)}後，估算 ${input.factor} 期約產生多少度電？`,
        context: { unitLabel: "度", setting: "再生能源設備規劃" },
        templateRoles: { ...input, unitLabel: "度" },
        ...numericAnswer(question, "度"),
      };
    },
  }),
  Object.freeze({
    id: "sdg6_water_saving_repeated_total",
    patternSpecId: "ps_g4b_u04_round_then_multiply",
    sdgGoal: 6,
    contextDomain: "water_conservation",
    unitLabel: "公升",
    render(question) {
      const input = question.input;
      return {
        promptText: `某次節水計畫一期預計節省 ${formatNumber(input.value)} 公升，用${g4bU04MethodLabel(input.method)}取概數到${g4bU04TargetPlaceLabel(input.targetUnit)}後，估算 ${input.factor} 期約節省多少公升？`,
        context: { unitLabel: "公升", setting: "節水計畫" },
        templateRoles: { ...input, unitLabel: "公升" },
        ...numericAnswer(question, "公升"),
      };
    },
  }),
  Object.freeze({
    id: "sdg12_recycling_equal_allocation",
    patternSpecId: "ps_g4b_u04_round_then_divide",
    sdgGoal: 12,
    contextDomain: "responsible_recycling",
    unitLabel: "公斤",
    render(question) {
      const input = question.input;
      return {
        promptText: `某次區域回收活動收集 ${formatNumber(input.value)} 公斤材料，用${g4bU04MethodLabel(input.method)}取概數到${g4bU04TargetPlaceLabel(input.targetUnit)}後，平均分配給 ${input.divisor} 個處理站，每站約分到多少公斤？`,
        context: { unitLabel: "公斤", setting: "區域回收活動" },
        templateRoles: { ...input, unitLabel: "公斤" },
        ...numericAnswer(question, "公斤"),
      };
    },
  }),
  Object.freeze({
    id: "sdg15_seedlings_equal_allocation",
    patternSpecId: "ps_g4b_u04_round_then_divide",
    sdgGoal: 15,
    contextDomain: "habitat_restoration",
    unitLabel: "株",
    render(question) {
      const input = question.input;
      return {
        promptText: `某次棲地復育規劃準備 ${formatNumber(input.value)} 株樹苗，用${g4bU04MethodLabel(input.method)}取概數到${g4bU04TargetPlaceLabel(input.targetUnit)}後，平均分配給 ${input.divisor} 個小組，每組約分到多少株？`,
        context: { unitLabel: "株", setting: "棲地復育規劃" },
        templateRoles: { ...input, unitLabel: "株" },
        ...numericAnswer(question, "株"),
      };
    },
  }),
]);

export const G4B_U04_CONTROLLED_SDG_VARIANTS = deepFreeze(
  Object.fromEntries(VARIANTS.map((variant) => [variant.id, {
    id: variant.id,
    patternSpecId: variant.patternSpecId,
    sdgGoal: variant.sdgGoal,
    contextDomain: variant.contextDomain,
    unitLabel: variant.unitLabel,
  }])),
);

const variantsByPattern = new Map();
for (const variant of VARIANTS) {
  const list = variantsByPattern.get(variant.patternSpecId) ?? [];
  list.push(variant);
  variantsByPattern.set(variant.patternSpecId, list);
}

export function normalizeG4BU04ContextMode(value) {
  return G4B_U04_CONTEXT_MODES.includes(value) ? value : G4B_U04_CONTEXT_DEFAULT_MODE;
}

export function isG4BU04SDGEligiblePatternSpecId(patternSpecId) {
  return eligibleIds.has(patternSpecId);
}

function appliedMode(question, requestedMode, eligibleOccurrence) {
  if (question?.implementationClass !== "D" || !eligibleIds.has(question.patternSpecId)) return "not_applicable";
  if (requestedMode === "daily_life") return "daily_life";
  if (requestedMode === "sdg") return "sdg";
  return eligibleOccurrence % 3 === 2 ? "sdg" : "daily_life";
}

function chooseVariant(question, seed, eligibleOccurrence) {
  const candidates = (variantsByPattern.get(question.patternSpecId) ?? [])
    .filter((variant) => typeof variant.applicable !== "function" || variant.applicable(question));
  if (candidates.length === 0) throw new Error(`G4BU04_R2E_NO_SDG_VARIANT:${question.patternSpecId}`);
  const index = hashSeed(`${seed}:${question.patternSpecId}:${eligibleOccurrence}`) % candidates.length;
  return candidates[index];
}

function contextMetadata(question, requestedMode, mode, variant = null) {
  return {
    contextContractVersion: G4B_U04_CONTEXT_CONTRACT_VERSION,
    contextModeRequested: requestedMode,
    contextModeApplied: mode,
    contextApplicability: mode === "not_applicable" ? "not_applicable" : "eligible",
    contextVariantId: variant?.id ?? (mode === "daily_life" ? `daily:${question.semanticTemplateId}` : null),
    sdgGoal: variant?.sdgGoal ?? null,
    fictionalExerciseData: true,
    controlledContext: true,
  };
}

export function applyG4BU04ControlledContextVariant(question, {
  contextMode = G4B_U04_CONTEXT_DEFAULT_MODE,
  seed = "g4b-u04-r2e",
  eligibleOccurrence = 0,
} = {}) {
  const requestedMode = normalizeG4BU04ContextMode(contextMode);
  const mode = appliedMode(question, requestedMode, eligibleOccurrence);
  if (question?.implementationClass !== "D") return question;

  const output = deepClone(question);
  if (mode === "sdg") {
    const variant = chooseVariant(output, seed, eligibleOccurrence);
    const rendered = variant.render(output);
    output.promptText = rendered.promptText;
    output.answerText = rendered.answerText;
    output.structuredAnswer = rendered.structuredAnswer;
    output.context = {
      ...rendered.context,
      contextCategory: "sdg",
      contextDomain: variant.contextDomain,
      contextVariantId: variant.id,
      sdgGoal: variant.sdgGoal,
      fictionalExerciseData: true,
      currentRealWorldStatistic: false,
      persuasion: false,
      fearBasedLanguage: false,
    };
    output.templateRoles = rendered.templateRoles;
  }

  const metadata = contextMetadata(output, requestedMode, mode, mode === "sdg"
    ? VARIANTS.find((variant) => variant.id === output.context.contextVariantId)
    : null);
  Object.assign(output, metadata);
  output.metadata = {
    ...(output.metadata ?? {}),
    contextContractVersion: metadata.contextContractVersion,
    contextModeRequested: metadata.contextModeRequested,
    contextModeApplied: metadata.contextModeApplied,
    contextApplicability: metadata.contextApplicability,
    contextVariantId: metadata.contextVariantId,
    sdgGoal: metadata.sdgGoal,
    fictionalExerciseData: true,
  };
  return deepFreeze(output);
}

function replayBaseQuestion(question) {
  const marker = `:${question.patternSpecId}:`;
  const index = String(question.seedLabel ?? "").lastIndexOf(marker);
  if (index < 0) return null;
  const seed = question.seedLabel.slice(0, index);
  const sequence = Number(question.seedLabel.slice(index + marker.length));
  if (!Number.isSafeInteger(sequence) || sequence < 0) return null;
  try {
    return generateG4BU04ClassDQuestion({ patternSpecId: question.patternSpecId, seed, sequence });
  } catch {
    return null;
  }
}

function issue(code, path, message) {
  return Object.freeze({ code, severity: "error", path, message, stage: "controlled_context" });
}

function immutableMathMatches(question, base) {
  return sameValue(question.input, base.input)
    && sameValue(question.derived, base.derived)
    && sameValue(question.finalAnswer, base.finalAnswer)
    && question.answerModelShape === base.answerModelShape
    && question.formalMappingId === base.formalMappingId
    && question.sourceMappingCandidateId === base.sourceMappingCandidateId
    && question.patternGroupId === base.patternGroupId
    && question.knowledgePointId === base.knowledgePointId;
}

function hasForbiddenClaims(question) {
  const text = `${question.promptText ?? ""} ${JSON.stringify(question.context ?? {})}`;
  return /真實統計|最新數據|一定要|否則|災難|恐慌|支持候選人|政黨/u.test(text);
}

export function validateG4BU04ControlledContextQuestion(question = {}) {
  const errors = [];
  if (question.implementationClass !== "D") {
    return Object.freeze({ ok: true, errors: Object.freeze([]), warnings: Object.freeze([]) });
  }
  const base = replayBaseQuestion(question);
  if (!base || validateG4BU04ClassDQuestion(base).ok !== true) {
    errors.push(issue("G4BU04_R2E_BASE_REPLAY_INVALID", "seedLabel", "無法重播原始 validator-backed Class D 題目。"));
    return Object.freeze({ ok: false, errors: Object.freeze(errors), warnings: Object.freeze([]) });
  }
  if (!immutableMathMatches(question, base)) {
    errors.push(issue("G4BU04_R2E_MATH_AUTHORITY_MUTATED", "input", "情境變體不得修改輸入、公式、答案或 curriculum mapping。"));
  }
  const requested = normalizeG4BU04ContextMode(question.contextModeRequested);
  if (question.contextContractVersion !== G4B_U04_CONTEXT_CONTRACT_VERSION
    || question.contextModeRequested !== requested
    || question.controlledContext !== true
    || question.fictionalExerciseData !== true) {
    errors.push(issue("G4BU04_R2E_CONTEXT_METADATA_INVALID", "contextModeRequested", "受控情境 metadata 不完整。"));
  }
  const eligible = eligibleIds.has(question.patternSpecId);
  if (!eligible) {
    if (question.contextModeApplied !== "not_applicable"
      || question.contextApplicability !== "not_applicable"
      || question.contextVariantId !== null
      || question.sdgGoal !== null
      || question.promptText !== base.promptText
      || !sameValue(question.structuredAnswer, base.structuredAnswer)) {
      errors.push(issue("G4BU04_R2E_NONELIGIBLE_CONTEXT_MUTATED", "contextModeApplied", "未核准 SDG mapping 的題型必須保持原始情境。"));
    }
    return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
  }
  if (question.contextModeApplied === "daily_life") {
    if (question.contextVariantId !== `daily:${base.semanticTemplateId}`
      || question.sdgGoal !== null
      || question.promptText !== base.promptText
      || question.answerText !== base.answerText
      || !sameValue(question.context, base.context)
      || !sameValue(question.templateRoles, base.templateRoles)
      || !sameValue(question.structuredAnswer, base.structuredAnswer)) {
      errors.push(issue("G4BU04_R2E_DAILY_CONTEXT_MUTATED", "contextVariantId", "daily_life 模式必須保留原始受控模板。"));
    }
  } else if (question.contextModeApplied === "sdg") {
    const variant = VARIANTS.find((entry) => entry.id === question.contextVariantId);
    if (!variant
      || variant.patternSpecId !== question.patternSpecId
      || !G4B_U04_ALLOWLISTED_SDG_GOALS.includes(variant.sdgGoal)
      || variant.sdgGoal !== question.sdgGoal
      || (typeof variant.applicable === "function" && !variant.applicable(base))) {
      errors.push(issue("G4BU04_R2E_SDG_VARIANT_NOT_ALLOWLISTED", "contextVariantId", "SDG 情境不在 allowlist 或不適用此題。"));
    } else {
      const rendered = variant.render(base);
      if (question.promptText !== rendered.promptText
        || question.answerText !== rendered.answerText
        || !sameValue(question.structuredAnswer, rendered.structuredAnswer)
        || !sameValue(question.templateRoles, rendered.templateRoles)
        || question.context?.contextDomain !== variant.contextDomain
        || question.context?.contextVariantId !== variant.id
        || question.context?.sdgGoal !== variant.sdgGoal
        || question.context?.fictionalExerciseData !== true
        || question.context?.currentRealWorldStatistic !== false
        || question.context?.persuasion !== false
        || question.context?.fearBasedLanguage !== false) {
        errors.push(issue("G4BU04_R2E_SDG_RENDER_MISMATCH", "promptText", "SDG 題面、單位或 safety metadata 與確定性變體不一致。"));
      }
    }
  } else {
    errors.push(issue("G4BU04_R2E_CONTEXT_MODE_APPLIED_INVALID", "contextModeApplied", "可套用題型只能使用 daily_life 或 sdg。"));
  }
  if (hasForbiddenClaims(question)) {
    errors.push(issue("G4BU04_R2E_CONTEXT_SAFETY_VIOLATION", "promptText", "情境題不得包含即時統計、政治勸說或恐懼式語言。"));
  }
  return Object.freeze({ ok: errors.length === 0, errors: Object.freeze(errors), warnings: Object.freeze([]) });
}

export function summarizeG4BU04ContextAllocation(questions = [], requestedMode = G4B_U04_CONTEXT_DEFAULT_MODE) {
  const counts = { daily_life: 0, sdg: 0, not_applicable: 0 };
  for (const question of questions) {
    if (question.implementationClass !== "D") {
      counts.not_applicable += 1;
      continue;
    }
    const mode = question.contextModeApplied ?? "not_applicable";
    if (Object.hasOwn(counts, mode)) counts[mode] += 1;
    else counts.not_applicable += 1;
  }
  return deepFreeze({
    contractVersion: G4B_U04_CONTEXT_CONTRACT_VERSION,
    requestedMode: normalizeG4BU04ContextMode(requestedMode),
    counts,
    eligibleQuestionCount: counts.daily_life + counts.sdg,
    sdgShareAmongEligible: counts.daily_life + counts.sdg > 0
      ? counts.sdg / (counts.daily_life + counts.sdg)
      : 0,
    genericFallbackUsed: false,
    freeFormAIUsed: false,
  });
}
