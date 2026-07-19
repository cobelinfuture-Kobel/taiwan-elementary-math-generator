import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const FAMILY_PATH = resolve(ROOT, "data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json");
const BINDING_PATH = resolve(ROOT, "data/curriculum/context/registry/gs02-g5a-u08-unit-context-bindings.json");
const COVERAGE_PATH = resolve(ROOT, "docs/curriculum/output/GS02_G5AU08_GLOBAL_CONTEXT_COVERAGE.json");

const TEMPLATE_META = Object.freeze({"tf_g5a_u08_two_same_rate_groups_sum":{"kp":"kp_g5a_u08_common_factor_extract","pg":"pg_g5a_u08_common_factor_application","ps":["ps_g5a_u08_app_two_same_rate_groups_sum"],"op":"two_same_rate_groups_sum"},"tf_g5a_u08_two_product_groups_difference":{"kp":"kp_g5a_u08_common_factor_extract","pg":"pg_g5a_u08_common_factor_application","ps":["ps_g5a_u08_app_two_product_groups_difference"],"op":"two_product_groups_difference"},"tf_g5a_u08_discount_and_change":{"kp":"kp_g5a_u08_mixed_operation_order","pg":"pg_g5a_u08_mixed_operation_order_application","ps":["ps_g5a_u08_app_discount_change"],"op":"discount_and_change"},"tf_g5a_u08_adjust_unit_then_remaining":{"kp":"kp_g5a_u08_distributive_expand","pg":"pg_g5a_u08_distributive_expand_application","ps":["ps_g5a_u08_app_adjust_unit_remaining"],"op":"adjust_unit_then_remaining"},"tf_g5a_u08_group_then_select_groups":{"kp":"kp_g5a_u08_mul_div_equivalent_regroup","pg":"pg_g5a_u08_mul_div_regroup_application","ps":["ps_g5a_u08_app_group_select"],"op":"group_then_select_groups"},"tf_g5a_u08_near_round_unit_price":{"kp":"kp_g5a_u08_near_round_multiply_compensation","pg":"pg_g5a_u08_near_round_multiply_application","ps":["ps_g5a_u08_app_near_round_unit_price"],"op":"near_round_unit_price"},"tf_g5a_u08_nested_grouping":{"kp":"kp_g5a_u08_mul_div_equivalent_regroup","pg":"pg_g5a_u08_mul_div_regroup_application","ps":["ps_g5a_u08_app_nested_grouping"],"op":"nested_grouping"},"tf_g5a_u08_direct_average":{"kp":"kp_g5a_u08_average_inverse_update","pg":"pg_g5a_u08_average_application","ps":["ps_g5a_u08_app_direct_average"],"op":"direct_average"},"tf_g5a_u08_average_share_transfer":{"kp":"kp_g5a_u08_average_inverse_update","pg":"pg_g5a_u08_average_application","ps":["ps_g5a_u08_app_average_share_transfer"],"op":"average_share_transfer"},"tf_g5a_u08_average_inverse_or_update":{"kp":"kp_g5a_u08_average_inverse_update","pg":"pg_g5a_u08_average_reasoning","ps":["ps_g5a_u08_app_average_inverse","ps_g5a_u08_app_average_update"],"op":"average_inverse_or_update"}});
const FAMILY_DEFS = Object.freeze([
{"id":"gctx_family_school_class_activity","label":"校園與班級活動","domain":"school_education","purpose":"班級共同準備、教材配置與活動費用分攤","event":"class_prepares_shared_activity_resources","relationship":"teacher_students_or_class_groups_coordinate_shared_resources","place":"學校教室","actorA":"五年一班","actorB":"五年二班","item":"活動材料包","container":"收納箱","activity":"班級成果展","sdg":["SDG_4"],"units":["item","pack","box","TWD","point"],"compat":["two_same_rate_groups_sum","discount_and_change","group_then_select_groups","near_round_unit_price","nested_grouping","average_share_transfer"]},
{"id":"gctx_family_household_daily_planning","label":"家庭與日常生活","domain":"household_daily_life","purpose":"家庭採買、家務資源與共同支出的規劃","event":"household_plans_repeated_daily_resource_use","relationship":"family_members_share_and_adjust_household_resources","place":"家中","actorA":"哥哥","actorB":"妹妹","item":"家庭用品","container":"置物盒","activity":"週末家庭整理","sdg":[],"units":["item","box","TWD","mL","g","minute"],"compat":["two_product_groups_difference","adjust_unit_then_remaining","near_round_unit_price","direct_average","average_share_transfer","average_inverse_or_update"]},
{"id":"gctx_family_store_budget_purchase","label":"商店與預算","domain":"commerce_budget","purpose":"固定單價、折扣、付款與找零的預算決策","event":"buyer_selects_goods_under_fixed_budget_rule","relationship":"buyer_and_shop_apply_one_explicit_price_rule","place":"社區商店","actorA":"小安","actorB":"小美","item":"文具組","container":"購物袋","activity":"採買用品","sdg":["SDG_12"],"units":["item","set","TWD"],"compat":["two_same_rate_groups_sum","discount_and_change","near_round_unit_price","average_share_transfer","two_product_groups_difference"]},
{"id":"gctx_family_transit_trip_capacity","label":"交通與行程","domain":"transport_mobility","purpose":"座位容量、班次配置與行程數據的估算","event":"travelers_allocate_capacity_across_trip_segments","relationship":"passengers_and_operator_manage_limited_transport_capacity","place":"公車轉運站","actorA":"甲班學生","actorB":"乙班學生","item":"乘車名額","container":"接駁車","activity":"校外教學行程","sdg":["SDG_11"],"units":["person","seat","vehicle","trip","minute"],"compat":["two_product_groups_difference","group_then_select_groups","near_round_unit_price","direct_average","average_inverse_or_update"]},
{"id":"gctx_family_sports_team_training","label":"運動與競賽","domain":"sports_competition","purpose":"隊伍器材、訓練次數與平均表現的安排","event":"teams_prepare_equipment_and_track_training_results","relationship":"teams_share_equipment_and_compare_training_records","place":"學校操場","actorA":"紅隊","actorB":"藍隊","item":"訓練器材","container":"器材箱","activity":"接力訓練","sdg":["SDG_3"],"units":["item","team","box","point","minute","TWD"],"compat":["two_same_rate_groups_sum","two_product_groups_difference","near_round_unit_price","direct_average","average_share_transfer","average_inverse_or_update"]},
{"id":"gctx_family_community_public_service","label":"社區與公共服務","domain":"community_public_service","purpose":"公共物資、服務名額與志工資源的配置","event":"community_center_allocates_shared_public_service_resources","relationship":"volunteers_and_residents_coordinate_public_resources","place":"社區活動中心","actorA":"第一志工隊","actorB":"第二志工隊","item":"服務物資包","container":"配送箱","activity":"社區服務日","sdg":["SDG_11"],"units":["item","pack","box","person","TWD"],"compat":["two_product_groups_difference","group_then_select_groups","nested_grouping","average_share_transfer","two_same_rate_groups_sum"]},
{"id":"gctx_family_environmental_cleanup","label":"環境保護","domain":"environmental_protection","purpose":"清理區域、工具使用與減量成效的追蹤","event":"cleanup_teams_remove_and_measure_environmental_waste","relationship":"cleanup_groups_divide_zones_and_record_removed_material","place":"河岸公園","actorA":"河岸組","actorB":"步道組","item":"清潔工具","container":"回收袋","activity":"環境清潔","sdg":["SDG_13","SDG_15"],"units":["item","bag","zone","kg","minute"],"compat":["two_product_groups_difference","adjust_unit_then_remaining","group_then_select_groups","direct_average","average_inverse_or_update"]},
{"id":"gctx_family_water_conservation","label":"能源與用水－節水","domain":"water_conservation","purpose":"每次用水量調整與多日平均用水追蹤","event":"users_reduce_per_activity_water_and_monitor_totals","relationship":"participants_follow_one_conservation_rule_and_compare_records","place":"校園洗手區","actorA":"上午班","actorB":"下午班","item":"節水紀錄卡","container":"紀錄夾","activity":"節水行動","sdg":["SDG_6"],"units":["L","mL","day","activity"],"compat":["adjust_unit_then_remaining","direct_average","average_inverse_or_update","two_product_groups_difference","group_then_select_groups"]},
{"id":"gctx_family_energy_conservation","label":"能源與用水－節能","domain":"energy_conservation","purpose":"設備節能、使用次數與平均耗能的管理","event":"devices_apply_per_use_energy_reduction_and_update_average","relationship":"users_apply_same_energy_rule_to_multiple_devices","place":"校園電腦教室","actorA":"A 組","actorB":"B 組","item":"節能設備","container":"設備櫃","activity":"節能觀察","sdg":["SDG_7"],"units":["device","use","Wh","day"],"compat":["adjust_unit_then_remaining","direct_average","average_inverse_or_update","two_same_rate_groups_sum","near_round_unit_price"]},
{"id":"gctx_family_food_resource_distribution","label":"食物與資源分配","domain":"food_resource_distribution","purpose":"食物包裝、等分配送與剩餘資源管理","event":"food_resources_are_packed_equally_then_allocated","relationship":"preparation_team_and_recipient_groups_share_equal_portions","place":"學校餐飲教室","actorA":"備餐組","actorB":"配送組","item":"餐點包","container":"保鮮箱","activity":"餐點分配","sdg":["SDG_2","SDG_12"],"units":["item","pack","box","person","g"],"compat":["two_same_rate_groups_sum","group_then_select_groups","nested_grouping","two_product_groups_difference","average_share_transfer"]},
{"id":"gctx_family_outdoor_trip_supplies","label":"旅遊與戶外活動","domain":"outdoor_travel","purpose":"行前用品、分組裝備與共同費用的安排","event":"travel_group_prepares_and_distributes_trip_supplies","relationship":"trip_members_share_costs_and_group_equipment","place":"自然步道集合點","actorA":"山線小隊","actorB":"湖線小隊","item":"戶外用品組","container":"裝備箱","activity":"戶外探索","sdg":["SDG_15"],"units":["item","set","box","person","TWD"],"compat":["two_product_groups_difference","near_round_unit_price","nested_grouping","average_share_transfer","group_then_select_groups"]},
{"id":"gctx_family_science_observation","label":"科學觀察","domain":"science_observation","purpose":"重複測量、樣本分組與平均數據的整理","event":"student_scientists_collect_repeated_measurements_and_reconstruct_missing_data","relationship":"observation_groups_follow_same_protocol_and_compare_measurements","place":"自然科教室","actorA":"觀察一組","actorB":"觀察二組","item":"觀察樣本","container":"樣本盤","activity":"植物生長觀察","sdg":["SDG_4","SDG_15"],"units":["sample","tray","mm","cm","day"],"compat":["adjust_unit_then_remaining","nested_grouping","direct_average","average_inverse_or_update","group_then_select_groups"]},
{"id":"gctx_family_agriculture_production","label":"農業與生產","domain":"agriculture_production","purpose":"作物批次、育苗分盤與產量資源的規劃","event":"farm_team_groups_production_units_and_allocates_batches","relationship":"growers_manage_equal_batches_across_fields_or_trays","place":"校園農園","actorA":"蔬菜組","actorB":"香草組","item":"幼苗","container":"育苗盤","activity":"農園育苗","sdg":["SDG_2","SDG_15"],"units":["plant","tray","zone","kg","TWD"],"compat":["two_same_rate_groups_sum","adjust_unit_then_remaining","group_then_select_groups","nested_grouping","two_product_groups_difference"]},
{"id":"gctx_family_recycling_circular_use","label":"回收與循環利用","domain":"recycling_circular_economy","purpose":"回收分類、再利用折抵與材料重新分裝","event":"materials_are_collected_sorted_and_reused_under_fixed_rule","relationship":"collection_team_and_reuse_team_transform_same_material_stream","place":"校園資源回收站","actorA":"收集組","actorB":"再利用組","item":"回收材料","container":"分類箱","activity":"資源循環活動","sdg":["SDG_12"],"units":["item","kg","box","TWD"],"compat":["discount_and_change","group_then_select_groups","near_round_unit_price","nested_grouping","two_product_groups_difference"]},
{"id":"gctx_family_charity_donation","label":"公益與捐贈","domain":"charity_donation","purpose":"捐贈物資等量包裝、分配與共同費用分攤","event":"donors_pool_resources_then_pack_and_allocate_aid","relationship":"donor_groups_and_service_team_coordinate_equal_aid_packages","place":"公益物資募集站","actorA":"甲募集組","actorB":"乙募集組","item":"捐贈物資","container":"愛心箱","activity":"公益募集","sdg":["SDG_1","SDG_2"],"units":["item","pack","box","person","TWD"],"compat":["two_same_rate_groups_sum","discount_and_change","group_then_select_groups","nested_grouping","average_share_transfer"]},
{"id":"gctx_family_cultural_event","label":"文化活動","domain":"culture_event","purpose":"展演票券、布置材料與活動共同支出的安排","event":"event_team_budgets_materials_and_balances_shared_costs","relationship":"performance_groups_share_venue_resources_and_costs","place":"地方文化館","actorA":"表演組","actorB":"布置組","item":"活動材料","container":"道具箱","activity":"文化展演","sdg":["SDG_11"],"units":["ticket","item","box","person","TWD"],"compat":["two_same_rate_groups_sum","discount_and_change","near_round_unit_price","average_share_transfer","two_product_groups_difference"]},
{"id":"gctx_family_health_activity_tracking","label":"健康與運動量","domain":"health_activity","purpose":"每日運動量、健康紀錄與平均變化的追蹤","event":"participants_record_repeated_health_activity_and_update_average","relationship":"students_follow_same_activity_protocol_and_compare_records","place":"健康中心","actorA":"晨間組","actorB":"午後組","item":"健康紀錄卡","container":"紀錄冊","activity":"健康挑戰","sdg":["SDG_3"],"units":["step","minute","day","point"],"compat":["adjust_unit_then_remaining","direct_average","average_inverse_or_update","two_same_rate_groups_sum","near_round_unit_price"]},
{"id":"gctx_family_disaster_preparedness","label":"災害準備","domain":"disaster_preparedness","purpose":"緊急物資分箱、避難名額與備援資源的配置","event":"response_team_prepositions_supplies_and_reserves_capacity","relationship":"response_groups_allocate_limited_resources_under_readiness_rules","place":"校園防災倉庫","actorA":"避難引導組","actorB":"物資管理組","item":"防災物資包","container":"緊急箱","activity":"防災演練","sdg":["SDG_11","SDG_13"],"units":["item","pack","box","person","TWD"],"compat":["two_product_groups_difference","group_then_select_groups","near_round_unit_price","nested_grouping","two_same_rate_groups_sum"]}
]);

const sha = (value) => createHash("sha256").update(value).digest("hex");
const tfId = (op) => `tf_g5a_u08_${op}`;

function makeParams(op, familyIndex, seedNo) {
  const k = familyIndex + seedNo;
  switch (op) {
    case "two_same_rate_groups_sum": return { rate: 6 + k % 5, countA: 3 + k % 4, countB: 5 + k % 5 };
    case "two_product_groups_difference": return { rate: 4 + k % 6, availableCount: 9 + k % 5, removedCount: 2 + k % 3 };
    case "discount_and_change": {
      const discountGroupSize = 2 + k % 3;
      const groupCount = 3 + k % 3;
      const quantity = discountGroupSize * groupCount;
      const unitPrice = 70 + 10 * (k % 5);
      const discountPerGroup = 5 * (1 + k % 4);
      const cost = unitPrice * quantity - discountPerGroup * groupCount;
      const payment = Math.ceil(cost / 100) * 100 + 100;
      return { unitPrice, quantity, discountGroupSize, discountPerGroup, payment };
    }
    case "adjust_unit_then_remaining": {
      const originalUnitAmount = 30 + 5 * (k % 5);
      const unitAdjustment = 5 * (1 + k % 3);
      const count = 4 + k % 4;
      const used = (originalUnitAmount - unitAdjustment) * count;
      return { startingTotal: used + 100 + 10 * (k % 5), originalUnitAmount, unitAdjustment, count };
    }
    case "group_then_select_groups": {
      const groupCount = 4 + k % 4;
      const perGroup = 6 + k % 5;
      const selectedGroupCount = Math.min(groupCount - 1, 2 + k % (groupCount - 1));
      return { total: groupCount * perGroup, groupCount, selectedGroupCount };
    }
    case "near_round_unit_price": {
      const roundAnchor = 100 + 100 * (k % 4);
      const offsets = [-3, -2, 2, 3];
      return { unitPrice: roundAnchor + offsets[k % 4], quantity: 4 + k % 7, roundAnchor };
    }
    case "nested_grouping": {
      const itemsPerFirstGroup = 4 + k % 4;
      const secondGroupCount = 2 + k % 3;
      const containerCount = 3 + k % 4;
      return { total: itemsPerFirstGroup * secondGroupCount * containerCount, itemsPerFirstGroup, secondGroupCount };
    }
    case "direct_average": {
      const base = 20 + 2 * (k % 8);
      return { values: [base - 3, base - 1, base + 1, base + 3], count: 4 };
    }
    case "average_share_transfer": {
      const average = 200 + 20 * (k % 6);
      const delta = 20 + 10 * (k % 4);
      return { payments: [average + delta, average - delta], count: 2 };
    }
    case "average_inverse_or_update": {
      const count = 4;
      let missing = 20 + 2 * (k % 10);
      const knownValues = [missing - 4, missing + 2, missing + 6];
      missing += (count - ((knownValues.reduce((a, b) => a + b, 0) + missing) % count)) % count;
      return { mode: "inverse", average: (knownValues.reduce((a, b) => a + b, 0) + missing) / count, count, knownValues };
    }
    default: throw new Error(`GS02_UNKNOWN_OPERATION:${op}`);
  }
}

export function recomputeGS02Seed(op, p) {
  switch (op) {
    case "two_same_rate_groups_sum": return { answer: p.rate * (p.countA + p.countB), equation: `${p.rate}×${p.countA}+${p.rate}×${p.countB}` };
    case "two_product_groups_difference": return { answer: p.rate * (p.availableCount - p.removedCount), equation: `${p.rate}×${p.availableCount}-${p.rate}×${p.removedCount}` };
    case "discount_and_change": {
      const groups = p.quantity / p.discountGroupSize;
      return { answer: p.payment - (p.unitPrice * p.quantity - p.discountPerGroup * groups), equation: `${p.payment}-(${p.unitPrice}×${p.quantity}-${p.discountPerGroup}×${groups})` };
    }
    case "adjust_unit_then_remaining": return { answer: p.startingTotal - (p.originalUnitAmount - p.unitAdjustment) * p.count, equation: `${p.startingTotal}-(${p.originalUnitAmount}-${p.unitAdjustment})×${p.count}` };
    case "group_then_select_groups": return { answer: p.total / p.groupCount * p.selectedGroupCount, equation: `${p.total}÷${p.groupCount}×${p.selectedGroupCount}` };
    case "near_round_unit_price": return { answer: p.unitPrice * p.quantity, equation: `${p.unitPrice}×${p.quantity}` };
    case "nested_grouping": return { answer: p.total / p.itemsPerFirstGroup / p.secondGroupCount, equation: `${p.total}÷${p.itemsPerFirstGroup}÷${p.secondGroupCount}` };
    case "direct_average": return { answer: p.values.reduce((a, b) => a + b, 0) / p.count, equation: `(${p.values.join("＋")})÷${p.count}` };
    case "average_share_transfer": {
      const average = p.payments.reduce((a, b) => a + b, 0) / p.count;
      return { answer: p.payments[0] - average, equation: `(${p.payments.join("＋")})÷${p.count}=${average}；${p.payments[0]}-${average}` };
    }
    case "average_inverse_or_update": return { answer: p.average * p.count - p.knownValues.reduce((a, b) => a + b, 0), equation: `${p.average}×${p.count}-(${p.knownValues.join("＋")})` };
    default: throw new Error(`GS02_UNKNOWN_OPERATION:${op}`);
  }
}

function promptFor(f, op, p) {
  switch (op) {
    case "two_same_rate_groups_sum": return `在${f.place}準備${f.activity}時，${f.actorA}做了${p.countA}組、${f.actorB}做了${p.countB}組，每組都有${p.rate}份${f.item}。兩組合計有多少份${f.item}？`;
    case "two_product_groups_difference": return `${f.place}原有${p.availableCount}個${f.container}，每箱有${p.rate}份${f.item}；其中${p.removedCount}箱已先保留。其餘共有多少份${f.item}？`;
    case "discount_and_change": return `${f.actorA}為${f.activity}購買${p.quantity}份${f.item}，每份${p.unitPrice}元；每滿${p.discountGroupSize}份折${p.discountPerGroup}元。付${p.payment}元，應找回多少元？`;
    case "adjust_unit_then_remaining": return `${f.place}有${p.startingTotal}單位的資源。原本每次${f.activity}用${p.originalUnitAmount}單位，改進後每次少用${p.unitAdjustment}單位，共進行${p.count}次。最後剩多少單位？`;
    case "group_then_select_groups": return `${f.actorA}把${p.total}份${f.item}平均分成${p.groupCount}組，再取其中${p.selectedGroupCount}組投入${f.activity}。取出的共有多少份？`;
    case "near_round_unit_price": return `${f.actorB}為${f.activity}購買${p.quantity}份${f.item}，每份${p.unitPrice}元。總共需要多少元？`;
    case "nested_grouping": return `${f.place}有${p.total}份${f.item}，每${p.itemsPerFirstGroup}份綁成一組，再把每${p.secondGroupCount}組放進一個${f.container}。共可裝成多少箱？`;
    case "direct_average": return `${f.actorA}連續4次記錄${f.activity}的數值為${p.values.join("、")}。平均數是多少？`;
    case "average_share_transfer": return `${f.actorA}先為${f.activity}付了${p.payments[0]}元，${f.actorB}付了${p.payments[1]}元。兩人平均分擔，${f.actorB}應再給${f.actorA}多少元？`;
    case "average_inverse_or_update": return `${f.place}共有${p.count}次${f.activity}紀錄，平均是${p.average}，其中3次為${p.knownValues.join("、")}。另一次的數值是多少？`;
    default: throw new Error(`GS02_UNKNOWN_OPERATION:${op}`);
  }
}

const ANSWER_UNITS = Object.freeze({
  two_same_rate_groups_sum: "item",
  two_product_groups_difference: "item",
  discount_and_change: "TWD",
  adjust_unit_then_remaining: "resource_unit",
  group_then_select_groups: "item",
  near_round_unit_price: "TWD",
  nested_grouping: "container",
  direct_average: "same_as_values",
  average_share_transfer: "TWD",
  average_inverse_or_update: "same_as_values",
});

function buildFamily(f, familyIndex) {
  const compatibleTemplateFamilyIds = f.compat.map(tfId);
  const compatibleKnowledgePoints = [...new Set(compatibleTemplateFamilyIds.map((id) => TEMPLATE_META[id].kp))].sort();
  const compatiblePatternGroups = [...new Set(compatibleTemplateFamilyIds.map((id) => TEMPLATE_META[id].pg))].sort();
  const compatiblePatternSpecs = [...new Set(compatibleTemplateFamilyIds.flatMap((id) => TEMPLATE_META[id].ps))].sort();
  const slug = f.id.replace("gctx_family_", "");
  const surfaceTemplates = [
    { templateId: `tpl_${slug}_01`, textZh: `在${f.place}，${f.actorA}和${f.actorB}為了${f.activity}，依同一數量規則處理{{quantityFacts}}，求{{targetQuantity}}。`, surfaceVariantPurpose: "共同任務與雙角色協作", requiredSlots: ["actorA", "actorB", "place", "activity", "quantityFacts", "targetQuantity"] },
    { templateId: `tpl_${slug}_02`, textZh: `為完成${f.activity}，${f.actorA}先處理{{firstEvent}}，${f.actorB}再處理{{secondEvent}}。根據{{quantityFacts}}，計算{{targetQuantity}}。`, surfaceVariantPurpose: "先後事件與狀態轉移", requiredSlots: ["actorA", "actorB", "firstEvent", "secondEvent", "quantityFacts", "targetQuantity"] },
    { templateId: `tpl_${slug}_03`, textZh: `一份${f.activity}紀錄顯示{{observedState}}。若遵守{{fixedRule}}，最後{{targetQuantity}}是多少？`, surfaceVariantPurpose: "紀錄判讀與固定規則", requiredSlots: ["observedState", "fixedRule", "targetQuantity"] },
  ];
  const seedQA = f.compat.slice(0, 5).map((op, index) => {
    const parameters = makeParams(op, familyIndex, index + 1);
    const witness = recomputeGS02Seed(op, parameters);
    const templateFamilyId = tfId(op);
    return {
      seedId: `seed_${slug}_${String(index + 1).padStart(2, "0")}`,
      templateFamilyId,
      patternGroupId: TEMPLATE_META[templateFamilyId].pg,
      patternSpecId: TEMPLATE_META[templateFamilyId].ps[0],
      promptZh: promptFor(f, op, parameters),
      parameters,
      equation: witness.equation,
      answer: witness.answer,
      answerUnit: ANSWER_UNITS[op],
      expectedValidation: "PASS",
      fictionalizedPracticeData: true,
    };
  });
  return {
    contextFamilyId: f.id,
    labelZh: f.label,
    domain: f.domain,
    scenarioPurpose: f.purpose,
    canonicalSemanticModel: {
      eventStructureId: f.event,
      actorRelationship: f.relationship,
      eventSequence: ["introduce_context_and_roles", "apply_one_fixed_quantity_rule", "derive_terminal_quantity"],
      quantityRelationship: "selected_from_unit_owned_template_family",
      terminalQuestionPurpose: "calculate_one_reconstructable_integer_quantity",
      semanticFingerprint: sha(`${f.event}|${f.relationship}|${f.domain}`).slice(0, 24),
    },
    surfaceTemplates,
    compatibleTemplateFamilyIds,
    compatibleKnowledgePoints,
    compatiblePatternGroups,
    compatiblePatternSpecs,
    parameterSchema: { dataPolicy: "fictionalized_for_practice", numberType: "positive_integer", requiredSemanticSlots: ["actorA", "actorB", "place", "activity", "object", "quantityFacts", "targetQuantity"], roleBindingPolicy: "must_resolve_through_unit_template_family", externalKnowledgeRequired: false },
    allowedUnits: f.units,
    semanticConstraints: ["preserve the selected G5A-U08 operation signature", "bind every stated quantity to one explicit semantic role", "keep one terminal question target", "use Traditional Chinese suitable for Grade 5", "recompute the canonical answer from parameters"],
    forbiddenCombinations: ["decorative context with unchanged generic noun-only substitution", "quantity without actor, object, or event ownership", "unit mismatch across compared or combined quantities", "real statistic without admitted source evidence", "second independent semantic delta", "free-form AI runtime composition"],
    sdgTags: f.sdg,
    difficultyRange: { min: "N", max: "N_PLUS_1", publicNPlus2: false },
    answerWitnessContract: { mode: "reuse_unit_owned_canonical_witness", canonicalAnswerRecomputationRequired: true, preserveOperationSignature: true, preserveRoleBindings: true, preserveUnitFlow: true, validatorFailurePolicy: "block" },
    seedQA,
    lifecycle: { status: "candidate_gs02", productionSelectable: false, runtimeResolvable: false },
  };
}

export function buildGS02Registries() {
  const contextFamilies = FAMILY_DEFS.map((f, index) => buildFamily(f, index + 1));
  const compatibilityCount = Object.fromEntries(Object.keys(TEMPLATE_META).sort().map((id) => [id, contextFamilies.filter((f) => f.compatibleTemplateFamilyIds.includes(id)).length]));
  const familyRegistry = {
    schemaName: "GS02G5AU08GlobalContextFamilyRegistry", schemaVersion: 1, programId: "G5AU08_GOLDEN_SAMPLE_V1", taskId: "GS02_G5AU08_GlobalContext18FamilyExpansion", sourceId: "g5a_u08_5a08", rulesetVersion: "1.0.0-candidate",
    authority: { globalOwns: ["context family identity", "domain", "actors", "places", "objects", "activities", "surface templates", "safety constraints"], unitBindingOwns: ["knowledgePointId", "patternGroupId", "patternSpecId", "operation signature", "quantity roles", "unit flow", "answer witness"], runtimeComposition: "forbidden_until_GS04", productionSelection: "forbidden_until_GS03_GS04_and_review" },
    acceptanceTargets: { minimumScenarioFamilies: 15, targetScenarioFamilies: 18, minimumDomainCount: 6, minimumTemplatesPerFamily: 3, minimumFamiliesPerWordPattern: 5, minimumGeneratedQASamples: 90 },
    contextFamilies,
    coverage: { contextFamilyCount: contextFamilies.length, domainCount: new Set(contextFamilies.map((f) => f.domain)).size, surfaceTemplateCount: contextFamilies.reduce((n, f) => n + f.surfaceTemplates.length, 0), seedQACount: contextFamilies.reduce((n, f) => n + f.seedQA.length, 0), templateFamilyCompatibilityCount: compatibilityCount, allPracticeDataFictionalized: true, externalKnowledgeClaimCount: 0, productionSelectableFamilyCount: 0 },
  };
  const bindings = contextFamilies.map((f) => ({
    unitContextBindingId: `ucb_g5a_u08_${f.contextFamilyId.replace("gctx_family_", "")}`, sourceId: "g5a_u08_5a08", contextFamilyId: f.contextFamilyId,
    eligibleTemplateFamilyIds: f.compatibleTemplateFamilyIds, eligibleKnowledgePointIds: f.compatibleKnowledgePoints, eligiblePatternGroupIds: f.compatiblePatternGroups, eligiblePatternSpecIds: f.compatiblePatternSpecs,
    operationSignatureAuthority: "S60D_G5A_U08_ApplicationTemplateAndSDGContextContract", quantityRoleAuthority: "unit_owned_existing_template_family", unitFlowAuthority: "unit_owned_existing_template_family", answerWitnessAuthority: "unit_owned_existing_validator_and_answer_model",
    eligibilityRules: { contextMayChangeMath: false, contextMayReplaceTemplateFamily: false, mustPassSemanticConstraints: true, mustPassForbiddenCombinationChecks: true, mustUseFictionalizedPracticeData: true, minimumCompatibleTemplateFamilies: 5 },
    lifecycle: { status: "candidate_binding_gs02", productionSelectable: false, runtimeResolvable: false, admissionGate: "GS03_G5AU08_GoldenContractFreeze" },
  }));
  const bindingRegistry = {
    schemaName: "GS02G5AU08UnitContextBindingRegistry", schemaVersion: 1, programId: "G5AU08_GOLDEN_SAMPLE_V1", taskId: "GS02_G5AU08_GlobalContext18FamilyExpansion", sourceId: "g5a_u08_5a08", familyRegistryRef: "data/curriculum/context/registry/gs02-g5a-u08-global-context-families.json", bindingCount: bindings.length, bindings,
    coverage: { boundContextFamilyCount: bindings.length, minimumEligibleTemplateFamiliesPerBinding: Math.min(...bindings.map((b) => b.eligibleTemplateFamilyIds.length)), productionSelectableBindingCount: bindings.filter((b) => b.lifecycle.productionSelectable).length, runtimeResolvableBindingCount: bindings.filter((b) => b.lifecycle.runtimeResolvable).length },
  };
  const coverage = {
    schemaVersion: 1, taskId: "GS02_G5AU08_GlobalContext18FamilyExpansion", status: "PASS_CANDIDATE_CONTENT_MATERIALIZED", contextFamilyCount: familyRegistry.coverage.contextFamilyCount, domainCount: familyRegistry.coverage.domainCount, surfaceTemplateCount: familyRegistry.coverage.surfaceTemplateCount, seedQACount: familyRegistry.coverage.seedQACount, minimumFamiliesPerWordPattern: Math.min(...Object.values(compatibilityCount)), templateFamilyCompatibilityCount: compatibilityCount, bindingCount: bindingRegistry.bindingCount, runtimeChanged: false, productionSelectable: false, nextShortestStep: "GS03_G5AU08_GoldenContractFreeze",
  };
  return { familyRegistry, bindingRegistry, coverage };
}

export async function writeGS02Registries() {
  const { familyRegistry, bindingRegistry, coverage } = buildGS02Registries();
  await mkdir(dirname(FAMILY_PATH), { recursive: true });
  await mkdir(dirname(COVERAGE_PATH), { recursive: true });
  await writeFile(FAMILY_PATH, `${JSON.stringify(familyRegistry, null, 2)}\n`, "utf8");
  await writeFile(BINDING_PATH, `${JSON.stringify(bindingRegistry, null, 2)}\n`, "utf8");
  await writeFile(COVERAGE_PATH, `${JSON.stringify(coverage, null, 2)}\n`, "utf8");
  return { familyRegistry, bindingRegistry, coverage };
}

if (process.argv.includes("--write")) {
  const result = await writeGS02Registries();
  console.log(JSON.stringify(result.coverage, null, 2));
}
