import { buildFifteenUnitGlobalContextLineage } from "./fifteen-unit-global-context-registry.js";

const PBL_SOURCE_IDS = Object.freeze(new Set([
  "g3b_u04_3b04",
  "g4a_u08_4a08",
  "g5a_u08_5a08",
  "g4b_u04_4b04",
  "g5a_u02_5a02",
]));

function gcd(a, b) {
  let left = Math.abs(a);
  let right = Math.abs(b);
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

function makeItem(plan, index, payload) {
  const lineage = buildFifteenUnitGlobalContextLineage({
    sourceId: plan.sourceId,
    generationSeed: plan.generationSeed,
    sequenceNumber: index + 1,
    patternSpecId: payload.patternSpecId,
  });
  return Object.freeze({
    generatedItemId: `pbl-${plan.sourceId}-${index + 1}`,
    id: `pbl-${plan.sourceId}-${index + 1}`,
    sourceNodeId: plan.sourceId,
    sourceId: plan.sourceId,
    knowledgePointId: payload.knowledgePointId,
    patternSpecId: payload.patternSpecId,
    operationFamilyId: payload.operationFamilyId,
    mode: "PBL",
    questionMode: "pbl",
    prompt: payload.prompt,
    answerText: payload.answerText,
    givenRoleValues: Object.freeze({ ...payload.givenRoleValues }),
    pblTaskSetRecord: Object.freeze({
      projectionType: payload.projectionType,
      taskCount: payload.taskCount,
      dependencyGraph: Object.freeze([...payload.dependencyGraph]),
      finalProduct: payload.finalProduct,
      completeProjection: true,
      arbitraryPageSplitAllowed: false,
    }),
    globalContextProduction: lineage,
    metadata: Object.freeze({
      globalContextProduction: lineage,
      pbl: true,
      pblTaskCount: payload.taskCount,
      sdgTags: Object.freeze([...(lineage?.sdgTags ?? [])]),
      productionUse: "allowed",
    }),
  });
}

function buildG3BU04(plan, index) {
  const groups = 4 + (index % 3);
  const first = 120 + (index * 20);
  const second = 80 + (index * 10);
  const total = first + second;
  const perGroup = total / groups;
  const adjustedSecond = Number.isInteger(perGroup) ? second : second + (groups - (total % groups));
  const adjustedTotal = first + adjustedSecond;
  const adjustedPerGroup = adjustedTotal / groups;
  return makeItem(plan, index, {
    patternSpecId: "pbl_g3b_u04_shared_activity_budget",
    knowledgePointId: "kp_g3b_u04_add_then_divide",
    operationFamilyId: "PBL3_ADD_THEN_DIVIDE",
    projectionType: "PBL3_LINEAR",
    taskCount: 3,
    dependencyGraph: ["Q1->Q2", "Q2->Q3"],
    finalProduct: "每組資源配置表",
    givenRoleValues: { first, second: adjustedSecond, groups },
    prompt: `PBL任務｜班級活動資源配置。第一項材料費${first}元，第二項材料費${adjustedSecond}元，由${groups}組平均分擔。①兩項合計多少元？②每組分擔多少元？③若每組預算上限為${adjustedPerGroup + 10}元，是否符合限制？請完成配置結論。`,
    answerText: `①${adjustedTotal}元；②每組${adjustedPerGroup}元；③符合，上限尚餘10元。`,
  });
}

function buildG4AU08(plan, index) {
  const participants = 24 + (index * 4);
  const ticket = 35 + (index % 3) * 5;
  const fixed = 600 + index * 50;
  const support = 200 + index * 20;
  const variable = participants * ticket;
  const total = fixed + variable - support;
  const perPerson = Math.ceil(total / participants);
  return makeItem(plan, index, {
    patternSpecId: "pbl_g4a_u08_event_budget_decision",
    knowledgePointId: "kp_g4a_u08_app_mul_div_before_add_sub",
    operationFamilyId: "PBL5_MIXED_OPERATION_BUDGET",
    projectionType: "PBL5_BOUNDED_DECISION",
    taskCount: 5,
    dependencyGraph: ["Q1->Q2", "Q2->Q3", "Q3->Q4", "Q4->Q5"],
    finalProduct: "活動收費決策",
    givenRoleValues: { participants, ticket, fixed, support },
    prompt: `PBL任務｜社區活動預算。預計${participants}人參加，每人材料費${ticket}元，固定場地費${fixed}元，另獲補助${support}元。①材料費總額？②補助前總成本？③補助後需自付多少？④平均每人至少收多少元才足夠？⑤若每人收${perPerson}元，請做出是否可行的決策。`,
    answerText: `①${variable}元；②${fixed + variable}元；③${total}元；④至少${perPerson}元；⑤可行。`,
  });
}

function buildG5AU08(plan, index) {
  const days = 5 + (index % 3);
  const daily = 120 + index * 15;
  const bonus = 300 + index * 20;
  const redeemed = 180 + index * 10;
  const earned = days * daily + bonus;
  const remaining = earned - redeemed;
  const average = Math.floor(remaining / days);
  return makeItem(plan, index, {
    patternSpecId: "pbl_g5a_u08_recycling_points_plan",
    knowledgePointId: "kp_g5a_u08_mixed_operation_order",
    operationFamilyId: "PBL5_MIXED_OPERATION_RESOURCE_PLAN",
    projectionType: "PBL5_BOUNDED_DECISION",
    taskCount: 5,
    dependencyGraph: ["Q1->Q2", "Q2->Q3", "Q3->Q4", "Q4->Q5"],
    finalProduct: "回收點數使用計畫",
    givenRoleValues: { days, daily, bonus, redeemed },
    prompt: `PBL任務｜資源回收點數計畫。連續${days}天每天獲得${daily}點，完成專題再加${bonus}點，已兌換${redeemed}點。①每日點數合計？②加上專題後共有多少點？③兌換後剩多少點？④把剩餘點數平均規劃到${days}天，每天最多可用多少整數點？⑤提出不超支的使用決策。`,
    answerText: `①${days * daily}點；②${earned}點；③${remaining}點；④每天最多${average}點；⑤依此上限使用不超支。`,
  });
}

function buildG4BU04(plan, index) {
  const people = 238 + index * 17;
  const busCapacity = 40;
  const roundedPeople = Math.round(people / 10) * 10;
  const estimatedBuses = Math.ceil(roundedPeople / busCapacity);
  const exactBuses = Math.ceil(people / busCapacity);
  return makeItem(plan, index, {
    patternSpecId: "pbl_g4b_u04_transport_estimation",
    knowledgePointId: "kp_g4b_u04_context_floor_ceiling_selection",
    operationFamilyId: "PBL3_ROUNDING_DECISION",
    projectionType: "PBL3_LINEAR",
    taskCount: 3,
    dependencyGraph: ["Q1->Q2", "Q2->Q3"],
    finalProduct: "交通需求估算表",
    givenRoleValues: { people, busCapacity },
    prompt: `PBL任務｜戶外學習交通估算。共有${people}人，每輛車最多坐${busCapacity}人。①把人數四捨五入到十位做快速估算。②估計至少需要幾輛車？③再用精確人數檢查，做出最後訂車決策。`,
    answerText: `①約${roundedPeople}人；②估計${estimatedBuses}輛；③精確需要${exactBuses}輛，應訂${exactBuses}輛。`,
  });
}

function buildG5AU02(plan, index) {
  const red = 24 + index * 6;
  const blue = 36 + index * 6;
  const groupSize = gcd(red, blue);
  const groups = (red / groupSize) + (blue / groupSize);
  return makeItem(plan, index, {
    patternSpecId: "pbl_g5a_u02_equal_group_design",
    knowledgePointId: "kp_g5a_u02_common_factor",
    operationFamilyId: "PBL3_GCF_GROUP_DESIGN",
    projectionType: "PBL3_LINEAR",
    taskCount: 3,
    dependencyGraph: ["Q1->Q2", "Q2->Q3"],
    finalProduct: "等量分組方案",
    givenRoleValues: { red, blue },
    prompt: `PBL任務｜文化活動分組設計。有${red}張紅色卡與${blue}張藍色卡，要分成大小相同且不剩下的材料包。①列出兩數的公因數。②每包最多可放幾張同色卡？③完成最大包裝方案，說明紅色包與藍色包合計有幾包。`,
    answerText: `①公因數為${Array.from({ length: groupSize }, (_, value) => value + 1).filter((value) => red % value === 0 && blue % value === 0).join("、")}；②每包最多${groupSize}張；③共${groups}包。`,
  });
}

const builders = Object.freeze({
  g3b_u04_3b04: buildG3BU04,
  g4a_u08_4a08: buildG4AU08,
  g5a_u08_5a08: buildG5AU08,
  g4b_u04_4b04: buildG4BU04,
  g5a_u02_5a02: buildG5AU02,
});

export function isFifteenUnitPublicPblSource(sourceId) {
  return PBL_SOURCE_IDS.has(sourceId);
}

export function buildFifteenUnitPublicPblGeneratedItems(plan = {}) {
  const builder = builders[plan.sourceId];
  if (!builder) return Object.freeze({ ok: false, errors: Object.freeze([{ code: "PBL_SOURCE_NOT_ADMITTED" }]), generatedItems: Object.freeze([]) });
  const count = Number.isInteger(plan.questionCount) && plan.questionCount > 0 ? plan.questionCount : 1;
  const generatedItems = Array.from({ length: count }, (_, index) => builder(plan, index));
  const errors = [];
  for (const [index, item] of generatedItems.entries()) {
    if (!item.prompt.includes("PBL任務") || item.pblTaskSetRecord.completeProjection !== true || item.globalContextProduction?.runtimeResolvable !== true) {
      errors.push({ code: "PBL_PROJECTION_INVALID", path: `generatedItems[${index}]` });
    }
  }
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    warnings: Object.freeze([]),
    generatedItems: Object.freeze(generatedItems),
    summary: Object.freeze({
      sourceId: plan.sourceId,
      pblTaskSetCount: generatedItems.length,
      completeProjectionCount: generatedItems.filter((item) => item.pblTaskSetRecord.completeProjection).length,
    }),
  });
}
