import {
  getG5AU08HiddenPatternSpecById,
} from "./source-pattern-g5a-u08-extension.js";

const MAX_BATCH_COUNT = 1000;
const ALLOWED_CONTEXT_TYPES = Object.freeze(["daily_life", "sdg"]);
const ALLOWED_SDG_IDS = Object.freeze(["SDG_2", "SDG_4", "SDG_6", "SDG_7", "SDG_11", "SDG_12", "SDG_13", "SDG_15"]);

export const G5A_U08_S60H_PATTERN_SPEC_IDS = Object.freeze([
  "ps_g5a_u08_app_two_same_rate_groups_sum",
  "ps_g5a_u08_app_two_product_groups_difference",
  "ps_g5a_u08_app_discount_change",
  "ps_g5a_u08_app_adjust_unit_remaining",
  "ps_g5a_u08_app_group_select",
  "ps_g5a_u08_app_near_round_unit_price",
  "ps_g5a_u08_app_nested_grouping",
  "ps_g5a_u08_app_direct_average",
  "ps_g5a_u08_app_average_share_transfer",
  "ps_g5a_u08_app_average_inverse",
  "ps_g5a_u08_app_average_update",
]);

const SPEC_POLICY = Object.freeze({
  ps_g5a_u08_app_two_same_rate_groups_sum: {
    templateFamilyId: "tf_g5a_u08_two_same_rate_groups_sum",
    depths: ["N", "N_PLUS_1"],
    deltaByDepth: { N: [], N_PLUS_1: ["combine_groups"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_two_product_groups_difference: {
    templateFamilyId: "tf_g5a_u08_two_product_groups_difference",
    depths: ["N_PLUS_1"],
    deltaByDepth: { N_PLUS_1: ["combine_groups"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_discount_change: {
    templateFamilyId: "tf_g5a_u08_discount_and_change",
    depths: ["N_PLUS_1"],
    deltaByDepth: { N_PLUS_1: ["discount_or_compensation"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_adjust_unit_remaining: {
    templateFamilyId: "tf_g5a_u08_adjust_unit_then_remaining",
    depths: ["N_PLUS_1"],
    deltaByDepth: { N_PLUS_1: ["adjust_unit_amount"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_group_select: {
    templateFamilyId: "tf_g5a_u08_group_then_select_groups",
    depths: ["N_PLUS_1"],
    deltaByDepth: { N_PLUS_1: ["nested_grouping"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_near_round_unit_price: {
    templateFamilyId: "tf_g5a_u08_near_round_unit_price",
    depths: ["N", "N_PLUS_1"],
    deltaByDepth: { N: [], N_PLUS_1: ["discount_or_compensation"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_nested_grouping: {
    templateFamilyId: "tf_g5a_u08_nested_grouping",
    depths: ["N_PLUS_1"],
    deltaByDepth: { N_PLUS_1: ["nested_grouping"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_direct_average: {
    templateFamilyId: "tf_g5a_u08_direct_average",
    depths: ["N"],
    deltaByDepth: { N: [] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_average_share_transfer: {
    templateFamilyId: "tf_g5a_u08_average_share_transfer",
    depths: ["N_PLUS_1"],
    deltaByDepth: { N_PLUS_1: ["reverse_from_total"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_average_inverse: {
    templateFamilyId: "tf_g5a_u08_average_inverse_or_update",
    depths: ["N_PLUS_1"],
    deltaByDepth: { N_PLUS_1: ["reverse_from_average"] },
    contexts: ["daily_life", "sdg"],
  },
  ps_g5a_u08_app_average_update: {
    templateFamilyId: "tf_g5a_u08_average_inverse_or_update",
    depths: ["N_PLUS_1"],
    deltaByDepth: { N_PLUS_1: ["update_population"] },
    contexts: ["sdg"],
  },
});

function hashSeed(value) {
  let acc = 2166136261;
  for (const char of String(value ?? "s60h")) {
    acc ^= char.charCodeAt(0);
    acc = Math.imul(acc, 16777619);
  }
  return acc >>> 0 || 1;
}

function mix32(value) {
  let mixed = value >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x7feb352d);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x846ca68b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

function randomInt(seed, offset, min, max) {
  const mixed = mix32(seed + Math.imul(offset + 1, 0x9e3779b1));
  return min + (mixed % (max - min + 1));
}

function randomChoice(seed, offset, values) {
  return values[randomInt(seed, offset, 0, values.length - 1)];
}

function deterministicShuffle(values, seed) {
  const output = [...values];
  for (let index = output.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(seed, output.length - index, 0, index);
    [output[index], output[swapIndex]] = [output[swapIndex], output[index]];
  }
  return output;
}

function contextMeta(patternSpecId, contextType, seed) {
  const metadata = {
    ps_g5a_u08_app_two_same_rate_groups_sum: {
      daily_life: ["cv_daily_two_same_rate_groups_sum", "meal_or_craft_orders", "兩組用途不同但共用同一單價"],
      sdg: ["cv_sdg4_two_same_rate_groups_sum", "learning_material_packs", "兩個班級取得同價的學習資源包", "SDG_4"],
    },
    ps_g5a_u08_app_two_product_groups_difference: {
      daily_life: ["cv_daily_two_product_groups_difference", "seating_or_storage_capacity", "停用或保留的組數會改變可用容量"],
      sdg: ["cv_sdg11_two_product_groups_difference", "public_transport_seats", "無障礙保留空間會改變大眾運輸可用座位", "SDG_11"],
    },
    ps_g5a_u08_app_discount_change: {
      daily_life: ["cv_daily_discount_and_change", "store_purchase", "固定組數折扣會改變實付與找零"],
      sdg: ["cv_sdg12_discount_and_change", "refill_or_reuse_discount", "自備容器的固定折扣會改變實付金額", "SDG_12"],
    },
    ps_g5a_u08_app_adjust_unit_remaining: {
      daily_life: ["cv_daily_adjust_unit_then_remaining", "recipe_or_material_use", "每份材料用量減少後改變總使用量"],
      sdg: randomInt(seed, 1, 0, 1) === 0
        ? ["cv_sdg6_adjust_unit_then_remaining", "water_saving_per_activity", "每次活動節水會改變總用水量", "SDG_6"]
        : ["cv_sdg7_adjust_unit_then_remaining", "energy_saving_per_device", "每台設備節電會改變總用電量", "SDG_7"],
    },
    ps_g5a_u08_app_group_select: {
      daily_life: ["cv_daily_group_then_select_groups", "boxes_or_teams", "先平均分組再選取部分組別"],
      sdg: ["cv_sdg2_group_then_select_groups", "food_aid_boxes", "食物先平均裝箱再分配部分箱數", "SDG_2"],
    },
    ps_g5a_u08_app_near_round_unit_price: {
      daily_life: ["cv_daily_near_round_unit_price", "tickets_or_supplies", "接近整數的單價適合補償計算"],
      sdg: ["cv_sdg13_near_round_unit_price", "tree_planting_kits", "植樹材料包的接近整數單價影響總成本", "SDG_13"],
    },
    ps_g5a_u08_app_nested_grouping: {
      daily_life: ["cv_daily_nested_grouping", "bundles_and_boxes", "物品先成束再把束平均裝箱"],
      sdg: ["cv_sdg15_nested_grouping", "seedlings_trays_and_zones", "樹苗先裝盤再把苗盤平均分配到棲地區", "SDG_15"],
    },
    ps_g5a_u08_app_direct_average: {
      daily_life: ["cv_daily_direct_average", "shared_cost_or_scores", "同單位數值直接求平均"],
      sdg: ["cv_sdg11_direct_average", "daily_public_transport_ridership", "每日搭乘人數使用相同單位求平均", "SDG_11"],
    },
    ps_g5a_u08_app_average_share_transfer: {
      daily_life: ["cv_daily_average_share_transfer", "shared_meal_or_activity_cost", "實際付款與平均分攤的差額決定補款方向"],
      sdg: ["cv_sdg12_average_share_transfer", "shared_repair_or_reuse_project_cost", "共享維修計畫費用依平均分攤調整", "SDG_12"],
    },
    ps_g5a_u08_app_average_inverse: {
      daily_life: ["cv_daily_average_inverse", "scores_or_measurements", "由平均值反推缺少的一筆同單位數值"],
      sdg: ["cv_sdg7_average_inverse", "missing_daily_energy_value", "由平均用電量反推缺少一天的用電量", "SDG_7"],
    },
    ps_g5a_u08_app_average_update: {
      sdg: ["cv_sdg6_average_update", "daily_water_use_average_update", "新增一天用水資料後會改變平均用水量", "SDG_6"],
    },
  }[patternSpecId]?.[contextType];
  if (!metadata) throw new Error(`G5A_U08_APP_CONTEXT_UNSUPPORTED:${patternSpecId}:${contextType}`);
  const [contextVariantId, theme, semanticRelevance, sdgGoalId = null] = metadata;
  return Object.freeze({
    contextVariantId,
    contextType,
    theme,
    semanticRelevance,
    sdgGoalId,
    dataStatus: "fictionalized_for_practice",
    sourceRef: null,
    sdgActionAffectsMath: contextType === "sdg",
  });
}

function expressionAnswer(expression, value, unit) {
  return {
    answerModelShape: "expressionAnswer",
    canonicalExpression: expression,
    finalAnswer: value,
    answerText: `${expression}＝${value}${unit}`,
    structuredAnswer: { expression, value, unit },
  };
}

function sampleSameRate(seed, context, depth) {
  const rate = randomInt(seed, 1, 35, 480);
  const countA = randomInt(seed, 2, 2, 18);
  const countB = randomInt(seed, 3, 1, 15);
  const total = rate * countA + rate * countB;
  const promptText = context.contextType === "sdg"
    ? `學校為甲班準備${countA}份、為乙班準備${countB}份同款學習資源包，每份${rate}元。兩班資源包共需多少元？請列成一個算式。`
    : `手作活動訂了${countA}份材料包，又加訂${countB}份同款材料包，每份${rate}元。共需多少元？請列成一個算式。`;
  return {
    promptText,
    roleBindings: { rate, countA, countB, total },
    unitFlow: ["元/份×份", "元/份×份", "元"],
    operationSignature: "rate×countA + rate×countB",
    ...expressionAnswer(`${rate}×${countA}＋${rate}×${countB}`, total, "元"),
  };
}

function sampleProductDifference(seed, context) {
  const rate = randomInt(seed, 1, 24, 60);
  const availableCount = randomInt(seed, 2, 8, 30);
  const removedCount = randomInt(seed, 3, 1, availableCount - 1);
  const remainingTotal = rate * availableCount - rate * removedCount;
  const promptText = context.contextType === "sdg"
    ? `接駁車原有${availableCount}輛，每輛${rate}個座位，其中${removedCount}輛改作無障礙專車暫不載一般乘客。一般乘客可使用多少個座位？請列成一個算式。`
    : `活動場地原本開放${availableCount}排座位，每排${rate}個，其中${removedCount}排保留不用。可使用多少個座位？請列成一個算式。`;
  return {
    promptText,
    roleBindings: { rate, availableCount, reservedOrRemovedCount: removedCount, remainingTotal },
    unitFlow: ["座位/組×組", "座位/組×組", "座位"],
    operationSignature: "rate×countA - rate×countB",
    ...expressionAnswer(`${rate}×${availableCount}－${rate}×${removedCount}`, remainingTotal, "個"),
  };
}

function sampleDiscount(seed, context) {
  const unitPrice = randomInt(seed, 1, 45, 260);
  const discountGroupSize = randomChoice(seed, 2, [2, 3, 4]);
  const groupCount = randomInt(seed, 3, 2, 6);
  const quantity = discountGroupSize * groupCount;
  const discountPerGroup = randomInt(seed, 4, 5, Math.min(40, unitPrice));
  const finalCost = unitPrice * quantity - discountPerGroup * groupCount;
  const payment = Math.ceil((finalCost + randomInt(seed, 5, 20, 300)) / 100) * 100;
  const change = payment - finalCost;
  const promptText = context.contextType === "sdg"
    ? `補充站每瓶清潔液${unitPrice}元，自備容器每${discountGroupSize}瓶折${discountPerGroup}元。買${quantity}瓶，付${payment}元，應找回多少元？請列成一個算式。`
    : `商店每瓶飲料${unitPrice}元，每買${discountGroupSize}瓶折${discountPerGroup}元。買${quantity}瓶，付${payment}元，應找回多少元？請列成一個算式。`;
  return {
    promptText,
    roleBindings: { unitPrice, quantity, discountGroupSize, discountPerGroup, payment, change },
    unitFlow: ["元/瓶×瓶", "元/組×組", "元", "元"],
    operationSignature: "payment - (unitPrice×quantity - discountPerGroup×discountGroupCount)",
    ...expressionAnswer(`${payment}－(${unitPrice}×${quantity}－${discountPerGroup}×${groupCount})`, change, "元"),
  };
}

function sampleAdjustUnit(seed, context) {
  const originalUnitAmount = randomInt(seed, 1, 60, 240);
  const unitAdjustment = randomInt(seed, 2, 5, Math.min(40, originalUnitAmount - 1));
  const count = randomInt(seed, 3, 3, 18);
  const adjustedUse = (originalUnitAmount - unitAdjustment) * count;
  const startingTotal = adjustedUse + randomInt(seed, 4, 100, 1200);
  const remainingTotal = startingTotal - adjustedUse;
  let promptText;
  let unit;
  if (context.contextType === "daily_life") {
    unit = "克";
    promptText = `原有${startingTotal}克材料，每件作品原需${originalUnitAmount}克，改良後每件少用${unitAdjustment}克。製作${count}件後還剩多少克？請列成一個算式。`;
  } else if (context.sdgGoalId === "SDG_6") {
    unit = "公升";
    promptText = `水塔原有${startingTotal}公升水，每次清洗原用${originalUnitAmount}公升，節水後每次少用${unitAdjustment}公升。清洗${count}次後還剩多少公升？請列成一個算式。`;
  } else {
    unit = "度";
    promptText = `本週可用電量為${startingTotal}度，每台設備原用${originalUnitAmount}度，改善後每台少用${unitAdjustment}度。啟用${count}台後還剩多少度？請列成一個算式。`;
  }
  return {
    promptText,
    roleBindings: { startingTotal, originalUnitAmount, unitAdjustment, count, remainingTotal },
    unitFlow: [unit, `${unit}/件`, `${unit}/件`, "件", unit],
    operationSignature: "startingTotal - (originalUnitAmount-adjustment)×count",
    ...expressionAnswer(`${startingTotal}－(${originalUnitAmount}－${unitAdjustment})×${count}`, remainingTotal, unit),
  };
}

function sampleGroupSelect(seed, context) {
  const groupCount = randomInt(seed, 1, 6, 24);
  const eachGroup = randomInt(seed, 2, 12, 80);
  const total = groupCount * eachGroup;
  const selectedGroupCount = randomInt(seed, 3, 1, groupCount - 1);
  const selectedQuantity = eachGroup * selectedGroupCount;
  const promptText = context.contextType === "sdg"
    ? `募集到${total}包食品，平均裝成${groupCount}箱，其中${selectedGroupCount}箱先送到服務站。先送出的食品共有多少包？請列成一個算式。`
    : `共有${total}顆球，平均裝成${groupCount}箱，取出其中${selectedGroupCount}箱。取出的球共有多少顆？請列成一個算式。`;
  return {
    promptText,
    roleBindings: { total, groupCount, selectedGroupCount, selectedQuantity },
    unitFlow: ["個÷箱", "個/箱×箱", "個"],
    operationSignature: "total÷groupCount×selectedGroupCount",
    ...expressionAnswer(`${total}÷${groupCount}×${selectedGroupCount}`, selectedQuantity, context.contextType === "sdg" ? "包" : "顆"),
  };
}

function sampleNearRoundPrice(seed, context, depth) {
  const roundBase = randomChoice(seed, 1, [100, 500, 1000, 2000]);
  const offset = randomInt(seed, 2, 1, 9);
  const direction = randomInt(seed, 3, 0, 1) === 0 ? "below" : "above";
  const nearRoundUnitPrice = direction === "below" ? roundBase - offset : roundBase + offset;
  const quantity = randomInt(seed, 4, 3, 24);
  const totalCost = nearRoundUnitPrice * quantity;
  const promptText = context.contextType === "sdg"
    ? `植樹材料包每套${nearRoundUnitPrice}元，社區購買${quantity}套，共需多少元？`
    : `活動票每張${nearRoundUnitPrice}元，買${quantity}張，共需多少元？`;
  return {
    promptText: depth === "N_PLUS_1" ? `${promptText}（可利用接近${roundBase}元的關係思考。）` : promptText,
    roleBindings: { nearRoundUnitPrice, quantity, totalCost, roundAnchor: roundBase, offset },
    unitFlow: ["元/份×份", "元"],
    operationSignature: "nearRoundUnitPrice×quantity",
    ...expressionAnswer(`${nearRoundUnitPrice}×${quantity}`, totalCost, "元"),
  };
}

function sampleNestedGrouping(seed, context) {
  const itemsPerFirstGroup = randomInt(seed, 1, 6, 30);
  const secondGroupCount = randomInt(seed, 2, 3, 12);
  const groupsPerSecondContainer = randomInt(seed, 3, 2, 15);
  const total = itemsPerFirstGroup * secondGroupCount * groupsPerSecondContainer;
  const promptText = context.contextType === "sdg"
    ? `共有${total}株樹苗，每${itemsPerFirstGroup}株裝成一盤，再把苗盤平均分到${secondGroupCount}個棲地區。每區分到幾盤？請列成一個算式。`
    : `共有${total}朵花，每${itemsPerFirstGroup}朵綁成一束，再把花束平均裝入${secondGroupCount}箱。每箱有幾束？請列成一個算式。`;
  return {
    promptText,
    roleBindings: { total, itemsPerFirstGroup, secondGroupCount, groupsPerSecondContainer },
    unitFlow: ["個÷個/束", "束÷箱", "束/箱"],
    operationSignature: "total÷itemsPerFirstGroup÷secondGroupCount",
    ...expressionAnswer(`${total}÷${itemsPerFirstGroup}÷${secondGroupCount}`, groupsPerSecondContainer, context.contextType === "sdg" ? "盤" : "束"),
  };
}

function zeroSumDeviations(seed, count) {
  const values = [];
  let sum = 0;
  for (let index = 0; index < count - 1; index += 1) {
    const deviation = randomInt(seed, index + 1, -15, 15);
    values.push(deviation);
    sum += deviation;
  }
  values.push(-sum);
  return values;
}

function sampleDirectAverage(seed, context) {
  const count = randomInt(seed, 1, 3, 6);
  const average = randomInt(seed, 2, 60, 300);
  const deviations = zeroSumDeviations(seed + 11, count);
  const values = deviations.map((value) => average + value);
  const promptText = context.contextType === "sdg"
    ? `接駁車連續${count}天的搭乘人數是${values.join("、")}人。平均每天有多少人搭乘？`
    : `${count}次測驗成績是${values.join("、")}分。平均成績是多少分？`;
  return {
    promptText,
    roleBindings: { values, count, average },
    unitFlow: ["同單位數值總和", `÷${count}`, context.contextType === "sdg" ? "人" : "分"],
    operationSignature: "sum(values)÷count",
    answerModelShape: "numericAnswer",
    canonicalExpression: `(${values.join("＋")})÷${count}`,
    finalAnswer: average,
    answerText: `${average}${context.contextType === "sdg" ? "人" : "分"}`,
    structuredAnswer: { values, count, average, unit: context.contextType === "sdg" ? "人" : "分" },
  };
}

function sampleAverageShare(seed, context) {
  const count = 3;
  const averageShare = randomInt(seed, 1, 150, 800);
  const transferAmount = randomInt(seed, 2, 20, Math.min(150, averageShare - 1));
  const payments = [averageShare + transferAmount, averageShare - transferAmount, averageShare];
  const names = ["甲", "乙", "丙"];
  const promptText = context.contextType === "sdg"
    ? `甲、乙、丙共同維修可重複使用的物品，分別先付${payments[0]}元、${payments[1]}元、${payments[2]}元。若平均分攤，誰應補給誰多少元？`
    : `甲、乙、丙一起參加活動，分別先付${payments[0]}元、${payments[1]}元、${payments[2]}元。若平均分攤，誰應補給誰多少元？`;
  return {
    promptText,
    roleBindings: {
      payments,
      count,
      averageShare,
      payerAboveAverage: names[0],
      payerBelowAverage: names[1],
      transferAmount,
    },
    unitFlow: ["元×人", "元/人", "元"],
    operationSignature: "averageShare=sum(payments)÷count; transfer=payment-averageShare",
    answerModelShape: "allocationTransferAnswer",
    canonicalExpression: `(${payments.join("＋")})÷${count}`,
    finalAnswer: transferAmount,
    answerText: `${names[1]}應補給${names[0]}${transferAmount}元`,
    structuredAnswer: {
      averageShare,
      from: names[1],
      to: names[0],
      transferAmount,
      unit: "元",
    },
  };
}

function sampleAverageInverse(seed, context) {
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const count = 4;
    const average = randomInt(seed, attempt * 7 + 1, 70, 220);
    const a = randomInt(seed, attempt * 7 + 2, 5, 20);
    const b = randomInt(seed, attempt * 7 + 3, 1, 12);
    const c = randomInt(seed, attempt * 7 + 4, 1, 8);
    const knownValues = [average - a, average + b, average + c];
    const missingValue = average * count - knownValues.reduce((sum, value) => sum + value, 0);
    if (missingValue <= 0 || missingValue > 999) continue;
    const unit = context.contextType === "sdg" ? "度" : "分";
    const promptText = context.contextType === "sdg"
      ? `4天平均用電量是${average}度，已知3天分別是${knownValues.join("、")}度。缺少的那一天用電量是多少度？`
      : `4科平均成績是${average}分，已知3科分別是${knownValues.join("、")}分。第4科是多少分？`;
    return {
      promptText,
      roleBindings: { average, count, knownValues, missingValue, memberValue: null, newAverage: null },
      unitFlow: ["同單位/人×人", "同單位總量", "同單位"],
      operationSignature: "average×count-knownParts",
      answerModelShape: "averageInverseAnswer",
      canonicalExpression: `${average}×${count}－(${knownValues.join("＋")})`,
      finalAnswer: missingValue,
      answerText: `${missingValue}${unit}`,
      structuredAnswer: { variant: "inverse", total: average * count, missingValue, unit },
    };
  }
  throw new Error("G5A_U08_APP_AVERAGE_INVERSE_EXHAUSTED");
}

function sampleAverageUpdate(seed, context) {
  const oldCount = randomInt(seed, 1, 3, 8);
  const oldAverage = randomInt(seed, 2, 80, 260);
  const delta = randomInt(seed, 3, 1, 8);
  const newAverage = oldAverage + delta;
  const memberValue = newAverage * (oldCount + 1) - oldAverage * oldCount;
  const promptText = `前${oldCount}天平均每天用水${oldAverage}公升，第${oldCount + 1}天用水${memberValue}公升。這${oldCount + 1}天平均每天用水多少公升？`;
  return {
    promptText,
    roleBindings: { average: oldAverage, count: oldCount, knownValues: null, missingValue: null, memberValue, newAverage },
    unitFlow: ["公升/天×天", "公升", "公升/天"],
    operationSignature: "(oldAverage×oldCount+memberValue)÷newCount",
    answerModelShape: "averageInverseAnswer",
    canonicalExpression: `(${oldAverage}×${oldCount}＋${memberValue})÷${oldCount + 1}`,
    finalAnswer: newAverage,
    answerText: `${newAverage}公升`,
    structuredAnswer: {
      variant: "update",
      oldTotal: oldAverage * oldCount,
      newCount: oldCount + 1,
      newAverage,
      unit: "公升",
    },
  };
}

function sampleForPatternSpec(patternSpecId, seed, context, depth) {
  switch (patternSpecId) {
    case "ps_g5a_u08_app_two_same_rate_groups_sum": return sampleSameRate(seed, context, depth);
    case "ps_g5a_u08_app_two_product_groups_difference": return sampleProductDifference(seed, context);
    case "ps_g5a_u08_app_discount_change": return sampleDiscount(seed, context);
    case "ps_g5a_u08_app_adjust_unit_remaining": return sampleAdjustUnit(seed, context);
    case "ps_g5a_u08_app_group_select": return sampleGroupSelect(seed, context);
    case "ps_g5a_u08_app_near_round_unit_price": return sampleNearRoundPrice(seed, context, depth);
    case "ps_g5a_u08_app_nested_grouping": return sampleNestedGrouping(seed, context);
    case "ps_g5a_u08_app_direct_average": return sampleDirectAverage(seed, context);
    case "ps_g5a_u08_app_average_share_transfer": return sampleAverageShare(seed, context);
    case "ps_g5a_u08_app_average_inverse": return sampleAverageInverse(seed, context);
    case "ps_g5a_u08_app_average_update": return sampleAverageUpdate(seed, context);
    default: throw new Error(`G5A_U08_APP_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  }
}

function validateGenerationRequest(patternSpecId, depth, contextType) {
  const policy = SPEC_POLICY[patternSpecId];
  const spec = getG5AU08HiddenPatternSpecById(patternSpecId);
  if (!policy || !spec || !G5A_U08_S60H_PATTERN_SPEC_IDS.includes(patternSpecId)) {
    throw new Error(`G5A_U08_APP_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  }
  if (!policy.depths.includes(depth)) {
    throw new Error(`G5A_U08_APP_DEPTH_UNSUPPORTED:${patternSpecId}:${depth}`);
  }
  if (!policy.contexts.includes(contextType)) {
    throw new Error(`G5A_U08_APP_CONTEXT_UNSUPPORTED:${patternSpecId}:${contextType}`);
  }
  return { policy, spec };
}

export function generateG5AU08ApplicationQuestion(
  patternSpecId,
  { seed = "s60h", depth = null, contextType = null } = {},
) {
  const policy = SPEC_POLICY[patternSpecId];
  if (!policy) throw new Error(`G5A_U08_APP_PATTERN_SPEC_UNSUPPORTED:${patternSpecId}`);
  const normalizedSeed = hashSeed(`${seed}:${patternSpecId}`);
  const selectedDepth = depth ?? policy.depths[randomInt(normalizedSeed, 1, 0, policy.depths.length - 1)];
  const selectedContext = contextType ?? policy.contexts[randomInt(normalizedSeed, 2, 0, policy.contexts.length - 1)];
  const { spec } = validateGenerationRequest(patternSpecId, selectedDepth, selectedContext);
  const context = contextMeta(patternSpecId, selectedContext, normalizedSeed);
  const sample = sampleForPatternSpec(patternSpecId, normalizedSeed, context, selectedDepth);
  return Object.freeze({
    sourceId: "g5a_u08_5a08",
    unitCode: "5A-U08",
    unitTitle: "整數四則",
    kind: "g5aU08IntegerFourOperations",
    representation: "application_text",
    applicationText: true,
    patternSpecId,
    patternGroupId: spec.patternGroupId,
    knowledgePointId: spec.knowledgePointId,
    mode: spec.mode,
    contextualReasoning: spec.contextualReasoning === true,
    templateFamilyId: policy.templateFamilyId,
    depth: selectedDepth,
    semanticDeltaIds: Object.freeze([...policy.deltaByDepth[selectedDepth]]),
    context,
    promptText: sample.promptText,
    roleBindings: Object.freeze(sample.roleBindings),
    unitFlow: Object.freeze(sample.unitFlow),
    operationSignature: sample.operationSignature,
    answerModelShape: sample.answerModelShape,
    canonicalExpression: sample.canonicalExpression,
    finalAnswer: sample.finalAnswer,
    answerText: sample.answerText,
    structuredAnswer: Object.freeze(sample.structuredAnswer),
    generatorRouting: "hidden_application_not_canonical",
    fallbackUsed: false,
    genericFallbackAllowed: false,
    seedLabel: String(seed),
  });
}

function normalizeSelectedIds(ids) {
  const selected = ids == null ? [...G5A_U08_S60H_PATTERN_SPEC_IDS] : [...new Set(ids)];
  if (selected.length === 0) throw new Error("G5A_U08_APP_EMPTY_PATTERN_SELECTION");
  for (const id of selected) {
    if (!G5A_U08_S60H_PATTERN_SPEC_IDS.includes(id)) {
      throw new Error(`G5A_U08_APP_PATTERN_SPEC_UNSUPPORTED:${id}`);
    }
  }
  return selected;
}

function requestedDepths(questionCount, selected, depthMode) {
  if (depthMode === "N" || depthMode === "N_PLUS_1") return Array(questionCount).fill(depthMode);
  if (depthMode !== "mixed") throw new Error(`G5A_U08_APP_DEPTH_MODE_INVALID:${depthMode}`);
  const hasN = selected.some((id) => SPEC_POLICY[id].depths.includes("N"));
  const hasNPlus1 = selected.some((id) => SPEC_POLICY[id].depths.includes("N_PLUS_1"));
  if (!hasN) return Array(questionCount).fill("N_PLUS_1");
  if (!hasNPlus1) return Array(questionCount).fill("N");
  const nCount = Math.round(questionCount * 0.3);
  return [...Array(nCount).fill("N"), ...Array(questionCount - nCount).fill("N_PLUS_1")];
}

function requestedContexts(questionCount, contextMode) {
  if (ALLOWED_CONTEXT_TYPES.includes(contextMode)) return Array(questionCount).fill(contextMode);
  if (contextMode !== "mixed") throw new Error(`G5A_U08_APP_CONTEXT_MODE_INVALID:${contextMode}`);
  const dailyCount = Math.round(questionCount * 0.5);
  return [...Array(dailyCount).fill("daily_life"), ...Array(questionCount - dailyCount).fill("sdg")];
}

export function generateG5AU08ApplicationBatch({
  questionCount,
  seed = "s60h-batch",
  selectedPatternSpecIds = null,
  depthMode = "mixed",
  contextMode = "mixed",
  ordering = "grouped",
} = {}) {
  if (!Number.isSafeInteger(questionCount) || questionCount < 1 || questionCount > MAX_BATCH_COUNT) {
    throw new Error(`G5A_U08_APP_QUESTION_COUNT_INVALID:${questionCount}`);
  }
  if (!new Set(["grouped", "shuffled"]).has(ordering)) {
    throw new Error(`G5A_U08_APP_ORDERING_INVALID:${ordering}`);
  }
  const selected = normalizeSelectedIds(selectedPatternSpecIds);
  const depths = requestedDepths(questionCount, selected, depthMode);
  const contexts = requestedContexts(questionCount, contextMode);
  const specCounts = new Map(selected.map((id) => [id, 0]));
  const rows = [];
  for (let index = 0; index < questionCount; index += 1) {
    const depth = depths[index];
    let contextType = contexts[index];
    let eligible = selected.filter((id) => SPEC_POLICY[id].depths.includes(depth) && SPEC_POLICY[id].contexts.includes(contextType));
    if (eligible.length === 0 && contextMode === "mixed") {
      contextType = contextType === "daily_life" ? "sdg" : "daily_life";
      eligible = selected.filter((id) => SPEC_POLICY[id].depths.includes(depth) && SPEC_POLICY[id].contexts.includes(contextType));
    }
    if (eligible.length === 0) {
      throw new Error(`G5A_U08_APP_NO_ELIGIBLE_PATTERN:${depth}:${contextType}`);
    }
    const minimum = Math.min(...eligible.map((id) => specCounts.get(id)));
    const leastUsed = eligible.filter((id) => specCounts.get(id) === minimum);
    const patternSpecId = leastUsed[randomInt(hashSeed(seed), index + 1, 0, leastUsed.length - 1)];
    specCounts.set(patternSpecId, specCounts.get(patternSpecId) + 1);
    rows.push(generateG5AU08ApplicationQuestion(patternSpecId, {
      seed: `${seed}:${patternSpecId}:${index}`,
      depth,
      contextType,
    }));
  }
  let questions;
  if (ordering === "shuffled") {
    questions = deterministicShuffle(rows, hashSeed(seed));
  } else {
    const order = new Map(selected.map((id, index) => [id, index]));
    questions = [...rows].sort((a, b) => order.get(a.patternSpecId) - order.get(b.patternSpecId));
  }
  const depthAllocation = Object.freeze({
    N: questions.filter((row) => row.depth === "N").length,
    N_PLUS_1: questions.filter((row) => row.depth === "N_PLUS_1").length,
  });
  const contextAllocation = Object.freeze({
    daily_life: questions.filter((row) => row.context.contextType === "daily_life").length,
    sdg: questions.filter((row) => row.context.contextType === "sdg").length,
  });
  return Object.freeze({
    sourceId: "g5a_u08_5a08",
    unitCode: "5A-U08",
    kind: "g5aU08ApplicationBatch",
    questionCount,
    seed: String(seed),
    ordering,
    depthMode,
    contextMode,
    selectedPatternSpecIds: Object.freeze(selected),
    specAllocation: Object.freeze(Object.fromEntries(specCounts)),
    depthAllocation,
    contextAllocation,
    generatorRouting: "hidden_application_not_canonical",
    fallbackUsed: false,
    questions: Object.freeze(questions),
  });
}

export { ALLOWED_SDG_IDS, SPEC_POLICY };
