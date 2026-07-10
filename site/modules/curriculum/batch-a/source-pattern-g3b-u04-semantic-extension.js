import {
  getBatchABrowserPatternDefinition as baseGetDefinition,
  getBatchAPatternSpecIdsForSource as baseGetPatternIds
} from "./source-pattern-g4a-u08-phase2a-extension.js";

export const G3B_U04_SOURCE_ID = "g3b_u04_3b04";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

const patternSpecs = deepFreeze([
  {
    "patternSpecId": "ps_g3b_u04_add_divide_joint_purchase_equal_share",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_add_then_divide",
    "knowledgePointId": "kp_g3b_u04_add_then_divide",
    "templateFamilyId": "tpl_g3b_u04_add_divide_joint_purchase_equal_share",
    "semanticSignature": "combine_costs_then_equal_share",
    "equationShape": "(a+b)/c",
    "unknownRole": "cost_per_person",
    "quantityRoles": {
      "a": "first_shared_cost",
      "b": "second_shared_cost",
      "c": "payer_count"
    },
    "contextDomains": [
      "food",
      "school_supplies",
      "tickets",
      "equipment_rental"
    ],
    "promptSkeletonZh": "{c}人合買{item1}和{item2}，總費用由大家平均分擔，每人要付多少{currencyUnit}？",
    "requiredConstraints": [
      "SUM_DIVISIBLE_BY_C",
      "C_AT_LEAST_2",
      "COST_UNIT_FLOW",
      "SHARED_OWNERSHIP_CLEAR"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "addition_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_add_divide_joint_purchase_equal_share"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 1,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_add_divide_pooled_money_unit_price",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_add_then_divide",
    "knowledgePointId": "kp_g3b_u04_add_then_divide",
    "templateFamilyId": "tpl_g3b_u04_add_divide_pooled_money_unit_price",
    "semanticSignature": "pool_money_then_find_unit_price",
    "equationShape": "(a+b)/c",
    "unknownRole": "unit_price",
    "quantityRoles": {
      "a": "first_person_money",
      "b": "second_person_money",
      "c": "identical_item_count"
    },
    "contextDomains": [
      "snacks",
      "stationery",
      "tickets"
    ],
    "promptSkeletonZh": "{person1}有{a}元，{person2}有{b}元，兩人的錢合起來剛好買{c}{itemUnit}{item}，每{itemUnit}多少元？",
    "requiredConstraints": [
      "SUM_DIVISIBLE_BY_C",
      "IDENTICAL_ITEMS",
      "MONEY_EXHAUSTED_EXACTLY",
      "UNIT_PRICE_ANSWER"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "addition_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_add_divide_pooled_money_unit_price"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 2,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_add_divide_combined_inventory_equal_distribution",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_add_then_divide",
    "knowledgePointId": "kp_g3b_u04_add_then_divide",
    "templateFamilyId": "tpl_g3b_u04_add_divide_combined_inventory_equal_distribution",
    "semanticSignature": "combine_inventory_then_equal_distribution",
    "equationShape": "(a+b)/c",
    "unknownRole": "quantity_per_recipient",
    "quantityRoles": {
      "a": "first_batch_count",
      "b": "second_batch_count",
      "c": "recipient_count"
    },
    "contextDomains": [
      "classroom",
      "library",
      "sports",
      "crafts"
    ],
    "promptSkeletonZh": "老師把兩批共{a}和{b}{itemUnit}{item}合在一起，平均分給{c}{recipientUnit}{recipient}，每{recipientUnit}分到多少{itemUnit}？",
    "requiredConstraints": [
      "SUM_DIVISIBLE_BY_C",
      "COUNT_UNIT_FLOW",
      "RECIPIENT_ROLE_CLEAR"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "addition_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_add_divide_combined_inventory_equal_distribution"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 3,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_add_divide_combined_liquid_equal_portions",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_add_then_divide",
    "knowledgePointId": "kp_g3b_u04_add_then_divide",
    "templateFamilyId": "tpl_g3b_u04_add_divide_combined_liquid_equal_portions",
    "semanticSignature": "combine_same_liquid_then_equal_portions",
    "equationShape": "(a+b)/c",
    "unknownRole": "capacity_per_container",
    "quantityRoles": {
      "a": "first_liquid_capacity",
      "b": "second_liquid_capacity",
      "c": "target_container_count"
    },
    "contextDomains": [
      "drinks",
      "cooking",
      "school_experiment"
    ],
    "promptSkeletonZh": "把{a}{capacityUnit}和{b}{capacityUnit}的同一種{liquid}倒在一起，平均裝成{c}{containerUnit}，每{containerUnit}有多少{capacityUnit}？",
    "requiredConstraints": [
      "SUM_DIVISIBLE_BY_C",
      "SAME_SUBSTANCE_REQUIRED",
      "CAPACITY_UNIT_FLOW",
      "CONTAINER_CAPACITY_PLAUSIBLE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "addition_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_add_divide_combined_liquid_equal_portions"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 4,
    "familyOrderWithinKnowledgePoint": 4,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_mul_div_buy_get_free_average_price",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_multiply_then_divide_average_unit_price",
    "knowledgePointId": "kp_g3b_u04_multiply_then_divide_average_unit_price",
    "templateFamilyId": "tpl_g3b_u04_mul_div_buy_get_free_average_price",
    "semanticSignature": "pay_for_units_receive_bonus_find_average_price",
    "equationShape": "(p*q)/r",
    "unknownRole": "average_cost_per_received_unit",
    "quantityRoles": {
      "p": "unit_price",
      "q": "paid_item_count",
      "r": "received_item_count"
    },
    "contextDomains": [
      "bakery",
      "drinks",
      "stationery",
      "daily_goods"
    ],
    "promptSkeletonZh": "{item}每{itemUnit}{p}元，活動期間付{q}{itemUnit}的錢可以拿到{r}{itemUnit}，平均每{itemUnit}多少元？",
    "requiredConstraints": [
      "RECEIVED_GREATER_THAN_PAID",
      "PAID_TOTAL_DIVISIBLE_BY_RECEIVED",
      "PROMOTION_RULE_EXPLICIT",
      "AVERAGE_UNIT_PRICE_ANSWER"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "multiplication_then_division",
      "average_unit_price",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_mul_div_buy_get_free_average_price"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 5,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_mul_div_bonus_units_average_cost",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_multiply_then_divide_average_unit_price",
    "knowledgePointId": "kp_g3b_u04_multiply_then_divide_average_unit_price",
    "templateFamilyId": "tpl_g3b_u04_mul_div_bonus_units_average_cost",
    "semanticSignature": "purchase_quantity_plus_bonus_units_average_cost",
    "equationShape": "(p*q)/(q+g)",
    "unknownRole": "average_cost_per_received_unit",
    "quantityRoles": {
      "p": "unit_price",
      "q": "paid_item_count",
      "g": "bonus_item_count"
    },
    "contextDomains": [
      "tickets",
      "stickers",
      "sports_cards",
      "coupons"
    ],
    "promptSkeletonZh": "每{itemUnit}{item}{p}元，買{q}{itemUnit}另外贈送{g}{itemUnit}，把總費用平均到收到的全部{item}，每{itemUnit}平均多少元？",
    "requiredConstraints": [
      "BONUS_POSITIVE",
      "PAID_TOTAL_DIVISIBLE_BY_TOTAL_RECEIVED",
      "PROMOTION_RULE_EXPLICIT",
      "COUNT_NOUN_MATCH"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "multiplication_then_division",
      "average_unit_price",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_mul_div_bonus_units_average_cost"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 6,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_mul_div_bulk_repack_average_cost",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_multiply_then_divide_average_unit_price",
    "knowledgePointId": "kp_g3b_u04_multiply_then_divide_average_unit_price",
    "templateFamilyId": "tpl_g3b_u04_mul_div_bulk_repack_average_cost",
    "semanticSignature": "buy_bulk_packs_repack_find_cost_per_small_pack",
    "equationShape": "(p*q)/r",
    "unknownRole": "average_cost_per_repacked_unit",
    "quantityRoles": {
      "p": "large_pack_price",
      "q": "large_pack_count",
      "r": "small_pack_count_after_repack"
    },
    "contextDomains": [
      "tea_bags",
      "cookies",
      "craft_materials",
      "seeds"
    ],
    "promptSkeletonZh": "買了{q}{largePackUnit}{item}，每{largePackUnit}{p}元，重新平均分裝成{r}{smallPackUnit}，平均每{smallPackUnit}的成本是多少元？",
    "requiredConstraints": [
      "TOTAL_COST_DIVISIBLE_BY_REPACK_COUNT",
      "REPACK_COUNT_GREATER_THAN_ZERO",
      "REPACK_SEMANTICS_CLEAR",
      "COST_NOT_SALE_PRICE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "multiplication_then_division",
      "average_unit_price",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_mul_div_bulk_repack_average_cost"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 7,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_sub_div_used_amount_then_share",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_subtract_then_divide",
    "knowledgePointId": "kp_g3b_u04_subtract_then_divide",
    "templateFamilyId": "tpl_g3b_u04_sub_div_used_amount_then_share",
    "semanticSignature": "subtract_used_amount_then_equal_share",
    "equationShape": "(a-b)/c",
    "unknownRole": "share_after_use",
    "quantityRoles": {
      "a": "original_quantity",
      "b": "used_quantity",
      "c": "share_count"
    },
    "contextDomains": [
      "milk",
      "juice",
      "ribbon",
      "clay"
    ],
    "promptSkeletonZh": "原有{a}{measureUnit}{item}，先用掉{b}{measureUnit}，剩下的平均分成{c}份，每份有多少{measureUnit}？",
    "requiredConstraints": [
      "A_GREATER_THAN_B",
      "DIFFERENCE_DIVISIBLE_BY_C",
      "MEASURE_UNIT_FLOW",
      "USE_EVENT_PRECEDES_SHARE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "subtraction_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_sub_div_used_amount_then_share"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 8,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_sub_div_damage_loss_then_package",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_subtract_then_divide",
    "knowledgePointId": "kp_g3b_u04_subtract_then_divide",
    "templateFamilyId": "tpl_g3b_u04_sub_div_damage_loss_then_package",
    "semanticSignature": "subtract_damaged_items_then_package",
    "equationShape": "(a-b)/c",
    "unknownRole": "package_count_after_loss",
    "quantityRoles": {
      "a": "original_item_count",
      "b": "damaged_item_count",
      "c": "items_per_package"
    },
    "contextDomains": [
      "eggs",
      "fruit",
      "cups",
      "parts"
    ],
    "promptSkeletonZh": "原有{a}{itemUnit}{item}，檢查後發現{b}{itemUnit}損壞，剩下的每{c}{itemUnit}裝一{packageUnit}，可以裝成幾{packageUnit}？",
    "requiredConstraints": [
      "A_GREATER_THAN_B",
      "DIFFERENCE_DIVISIBLE_BY_C",
      "DAMAGED_ITEMS_NOT_PACKAGED",
      "PACKAGE_UNIT_FLOW"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "subtraction_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_sub_div_damage_loss_then_package"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 9,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_sub_div_reserved_amount_then_distribute",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_subtract_then_divide",
    "knowledgePointId": "kp_g3b_u04_subtract_then_divide",
    "templateFamilyId": "tpl_g3b_u04_sub_div_reserved_amount_then_distribute",
    "semanticSignature": "reserve_items_then_equal_distribution",
    "equationShape": "(a-b)/c",
    "unknownRole": "quantity_per_recipient_after_reserve",
    "quantityRoles": {
      "a": "total_item_count",
      "b": "reserved_item_count",
      "c": "recipient_count"
    },
    "contextDomains": [
      "books",
      "prizes",
      "snacks",
      "sports_equipment"
    ],
    "promptSkeletonZh": "共有{a}{itemUnit}{item}，先保留{b}{itemUnit}，其餘平均分給{c}{recipientUnit}{recipient}，每{recipientUnit}分到多少{itemUnit}？",
    "requiredConstraints": [
      "A_GREATER_THAN_B",
      "DIFFERENCE_DIVISIBLE_BY_C",
      "RESERVE_EVENT_EXPLICIT",
      "RECIPIENT_ROLE_CLEAR"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "subtraction_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_sub_div_reserved_amount_then_distribute"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 10,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_sub_div_absent_participants_then_group",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_subtract_then_divide",
    "knowledgePointId": "kp_g3b_u04_subtract_then_divide",
    "templateFamilyId": "tpl_g3b_u04_sub_div_absent_participants_then_group",
    "semanticSignature": "subtract_absent_participants_then_form_groups",
    "equationShape": "(a-b)/c",
    "unknownRole": "group_count_after_absence",
    "quantityRoles": {
      "a": "registered_participant_count",
      "b": "absent_participant_count",
      "c": "participants_per_group"
    },
    "contextDomains": [
      "sports",
      "field_trip",
      "club",
      "school_event"
    ],
    "promptSkeletonZh": "原有{a}人報名，活動當天有{b}人請假，其餘每{c}人一組，可以分成幾組？",
    "requiredConstraints": [
      "A_GREATER_THAN_B",
      "DIFFERENCE_DIVISIBLE_BY_C",
      "PEOPLE_UNIT_FLOW",
      "ABSENT_NOT_GROUPED"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "subtraction_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_sub_div_absent_participants_then_group"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 11,
    "familyOrderWithinKnowledgePoint": 4,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_div_add_shared_cost_plus_personal_purchase",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_divide_then_add",
    "knowledgePointId": "kp_g3b_u04_divide_then_add",
    "templateFamilyId": "tpl_g3b_u04_div_add_shared_cost_plus_personal_purchase",
    "semanticSignature": "equal_share_cost_plus_personal_extra_cost",
    "equationShape": "a/b+c",
    "unknownRole": "personal_total_cost",
    "quantityRoles": {
      "a": "shared_total_cost",
      "b": "payer_count",
      "c": "personal_extra_cost"
    },
    "contextDomains": [
      "meal",
      "transport",
      "class_activity",
      "equipment_rental"
    ],
    "promptSkeletonZh": "{b}人平均分擔{a}元的共同費用，{person}另外花了{c}元，{person}一共花了多少元？",
    "requiredConstraints": [
      "A_DIVISIBLE_BY_B",
      "MONEY_UNIT_FLOW",
      "PERSONAL_EXTRA_OWNER_CLEAR",
      "SHARED_COST_PRECEDES_EXTRA"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_then_addition",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_div_add_shared_cost_plus_personal_purchase"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 12,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_div_add_new_packages_plus_existing_stock",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_divide_then_add",
    "knowledgePointId": "kp_g3b_u04_divide_then_add",
    "templateFamilyId": "tpl_g3b_u04_div_add_new_packages_plus_existing_stock",
    "semanticSignature": "package_new_items_then_add_existing_packages",
    "equationShape": "a/b+c",
    "unknownRole": "total_package_count",
    "quantityRoles": {
      "a": "new_item_count",
      "b": "items_per_package",
      "c": "existing_package_count"
    },
    "contextDomains": [
      "bakery",
      "books",
      "balls",
      "building_blocks"
    ],
    "promptSkeletonZh": "把新做好的{a}{itemUnit}{item}每{b}{itemUnit}裝一{packageUnit}，再加上原有的{c}{packageUnit}，現在共有幾{packageUnit}？",
    "requiredConstraints": [
      "A_DIVISIBLE_BY_B",
      "PACKAGE_UNIT_FLOW",
      "EXISTING_COUNT_IS_PACKAGES",
      "NO_ITEM_PACKAGE_UNIT_MIX"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_then_addition",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_div_add_new_packages_plus_existing_stock"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 13,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_divide_then_add",
    "knowledgePointId": "kp_g3b_u04_divide_then_add",
    "templateFamilyId": "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group",
    "semanticSignature": "distribute_new_resources_then_add_existing_per_recipient",
    "equationShape": "a/b+c",
    "unknownRole": "final_quantity_per_recipient",
    "quantityRoles": {
      "a": "new_resource_count",
      "b": "recipient_count",
      "c": "existing_quantity_per_recipient"
    },
    "contextDomains": [
      "classroom",
      "library",
      "sports",
      "technology"
    ],
    "promptSkeletonZh": "把{a}{itemUnit}{item}平均分給{b}{recipientUnit}{recipient}，每{recipientUnit}原本已有{c}{itemUnit}，分完後每{recipientUnit}共有多少{itemUnit}？",
    "requiredConstraints": [
      "A_DIVISIBLE_BY_B",
      "EXISTING_QUANTITY_IS_PER_RECIPIENT",
      "COUNT_UNIT_FLOW",
      "RECIPIENT_SCOPE_CLEAR"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_then_addition",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_div_add_distributed_resources_plus_existing_per_group"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 14,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_total_minus_share_wallet_minus_shared_purchase",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_total_minus_shared_amount",
    "knowledgePointId": "kp_g3b_u04_total_minus_shared_amount",
    "templateFamilyId": "tpl_g3b_u04_total_minus_share_wallet_minus_shared_purchase",
    "semanticSignature": "personal_money_minus_personal_share_of_group_purchase",
    "equationShape": "a-(b/c)",
    "unknownRole": "personal_money_remaining",
    "quantityRoles": {
      "a": "personal_initial_money",
      "b": "group_purchase_total",
      "c": "participant_count"
    },
    "contextDomains": [
      "cake",
      "gift",
      "meal",
      "class_materials"
    ],
    "promptSkeletonZh": "{person}原有{a}元，和另外的人共{c}人平均分擔一筆{b}元的費用，付完自己的部分後還剩多少元？",
    "requiredConstraints": [
      "B_DIVISIBLE_BY_C",
      "A_GREATER_THAN_PERSONAL_SHARE",
      "PERSONAL_OWNERSHIP_CLEAR",
      "ANSWER_IS_PERSONAL_REMAINDER"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_before_subtraction",
      "personal_share",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_total_minus_share_wallet_minus_shared_purchase"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 15,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_total_minus_share_personal_budget_minus_group_fee",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_total_minus_shared_amount",
    "knowledgePointId": "kp_g3b_u04_total_minus_shared_amount",
    "templateFamilyId": "tpl_g3b_u04_total_minus_share_personal_budget_minus_group_fee",
    "semanticSignature": "personal_budget_minus_equal_share_activity_fee",
    "equationShape": "a-(b/c)",
    "unknownRole": "personal_budget_remaining",
    "quantityRoles": {
      "a": "personal_budget",
      "b": "group_activity_fee",
      "c": "participant_count"
    },
    "contextDomains": [
      "field_trip",
      "club",
      "class_event",
      "sports_day"
    ],
    "promptSkeletonZh": "每人有{a}元活動預算，{c}人平均分擔{b}元的共同費用，每人還剩多少元預算？",
    "requiredConstraints": [
      "B_DIVISIBLE_BY_C",
      "A_GREATER_THAN_PERSONAL_SHARE",
      "BUDGET_SCOPE_IS_PER_PERSON",
      "MONEY_UNIT_FLOW"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_before_subtraction",
      "personal_share",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_total_minus_share_personal_budget_minus_group_fee"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 16,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_total_minus_share_reward_points_minus_shared_redemption",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_total_minus_shared_amount",
    "knowledgePointId": "kp_g3b_u04_total_minus_shared_amount",
    "templateFamilyId": "tpl_g3b_u04_total_minus_share_reward_points_minus_shared_redemption",
    "semanticSignature": "personal_points_minus_equal_share_redemption_cost",
    "equationShape": "a-(b/c)",
    "unknownRole": "personal_points_remaining",
    "quantityRoles": {
      "a": "personal_initial_points",
      "b": "shared_redemption_points",
      "c": "member_count"
    },
    "contextDomains": [
      "class_rewards",
      "reading_points",
      "game_points"
    ],
    "promptSkeletonZh": "每位組員原有{a}點，{c}位組員平均負擔兌換獎品所需的{b}點，每人兌換後還剩多少點？",
    "requiredConstraints": [
      "B_DIVISIBLE_BY_C",
      "A_GREATER_THAN_PERSONAL_SHARE",
      "POINT_UNIT_FLOW",
      "EQUAL_CONTRIBUTION_CLEAR"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_before_subtraction",
      "personal_share",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_total_minus_share_reward_points_minus_shared_redemption"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 17,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_group_minus_remaining_packaged_total_minus_remaining_sold",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_group_total_minus_remaining",
    "knowledgePointId": "kp_g3b_u04_group_total_minus_remaining",
    "templateFamilyId": "tpl_g3b_u04_group_minus_remaining_packaged_total_minus_remaining_sold",
    "semanticSignature": "find_total_packages_then_subtract_remaining_packages",
    "equationShape": "(a/b)-c",
    "unknownRole": "packages_sold",
    "quantityRoles": {
      "a": "total_item_count",
      "b": "items_per_package",
      "c": "remaining_package_count"
    },
    "contextDomains": [
      "pudding",
      "cookies",
      "eggs",
      "fruit"
    ],
    "promptSkeletonZh": "把{a}{itemUnit}{item}每{b}{itemUnit}裝一{packageUnit}，最後剩下{c}{packageUnit}沒有賣出，已經賣出幾{packageUnit}？",
    "requiredConstraints": [
      "A_DIVISIBLE_BY_B",
      "TOTAL_PACKAGES_GREATER_THAN_C",
      "C_IS_PACKAGE_COUNT",
      "SOLD_PLUS_REMAINING_CONSERVATION"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_then_subtraction",
      "group_count",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_group_minus_remaining_packaged_total_minus_remaining_sold"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 18,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_group_minus_remaining_formed_teams_minus_inactive_teams",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_group_total_minus_remaining",
    "knowledgePointId": "kp_g3b_u04_group_total_minus_remaining",
    "templateFamilyId": "tpl_g3b_u04_group_minus_remaining_formed_teams_minus_inactive_teams",
    "semanticSignature": "form_all_teams_then_subtract_inactive_teams",
    "equationShape": "(a/b)-c",
    "unknownRole": "active_team_count",
    "quantityRoles": {
      "a": "participant_count",
      "b": "members_per_team",
      "c": "inactive_team_count"
    },
    "contextDomains": [
      "sports",
      "relay",
      "school_competition"
    ],
    "promptSkeletonZh": "把{a}人每{b}人組成一隊，其中有{c}隊沒有參賽，實際參賽的有幾隊？",
    "requiredConstraints": [
      "A_DIVISIBLE_BY_B",
      "TOTAL_TEAMS_GREATER_THAN_C",
      "C_IS_TEAM_COUNT",
      "PEOPLE_TO_TEAM_UNIT_FLOW"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_then_subtraction",
      "group_count",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_group_minus_remaining_formed_teams_minus_inactive_teams"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 19,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_group_minus_remaining_prepared_trays_minus_leftover_trays",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_group_total_minus_remaining",
    "knowledgePointId": "kp_g3b_u04_group_total_minus_remaining",
    "templateFamilyId": "tpl_g3b_u04_group_minus_remaining_prepared_trays_minus_leftover_trays",
    "semanticSignature": "prepare_all_trays_then_subtract_leftover_trays",
    "equationShape": "(a/b)-c",
    "unknownRole": "trays_served_or_delivered",
    "quantityRoles": {
      "a": "total_item_count",
      "b": "items_per_tray",
      "c": "leftover_tray_count"
    },
    "contextDomains": [
      "snacks",
      "fruit",
      "lunch",
      "drinks"
    ],
    "promptSkeletonZh": "把{a}{itemUnit}{item}每{b}{itemUnit}放一盤，活動後剩下{c}盤，已經送出幾盤？",
    "requiredConstraints": [
      "A_DIVISIBLE_BY_B",
      "TOTAL_TRAYS_GREATER_THAN_C",
      "C_IS_TRAY_COUNT",
      "DELIVERED_PLUS_LEFTOVER_CONSERVATION"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "division_then_subtraction",
      "group_count",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_group_minus_remaining_prepared_trays_minus_leftover_trays"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 20,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_consecutive_items_per_row_per_box",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_consecutive_multiplication",
    "knowledgePointId": "kp_g3b_u04_consecutive_multiplication",
    "templateFamilyId": "tpl_g3b_u04_consecutive_items_per_row_per_box",
    "semanticSignature": "items_per_row_times_rows_per_box_times_boxes",
    "equationShape": "a*b*c",
    "unknownRole": "total_item_count",
    "quantityRoles": {
      "a": "items_per_row",
      "b": "rows_per_box",
      "c": "box_count"
    },
    "contextDomains": [
      "beverages",
      "cans",
      "balls",
      "plants"
    ],
    "promptSkeletonZh": "每排有{a}{itemUnit}{item}，每箱有{b}排，共有{c}箱，一共有多少{itemUnit}{item}？",
    "requiredConstraints": [
      "THREE_DISTINCT_HIERARCHY_ROLES",
      "COUNT_UNIT_FLOW",
      "PRODUCT_WITHIN_RANGE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_multiplication"
    ],
    "skillTags": [
      "two_step",
      "consecutive_multiplication",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_consecutive_items_per_row_per_box"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 21,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_consecutive_units_per_group_per_container",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_consecutive_multiplication",
    "knowledgePointId": "kp_g3b_u04_consecutive_multiplication",
    "templateFamilyId": "tpl_g3b_u04_consecutive_units_per_group_per_container",
    "semanticSignature": "units_per_group_times_groups_per_container_times_containers",
    "equationShape": "a*b*c",
    "unknownRole": "total_unit_count",
    "quantityRoles": {
      "a": "units_per_group",
      "b": "groups_per_container",
      "c": "container_count"
    },
    "contextDomains": [
      "toothpaste",
      "markers",
      "cards",
      "snacks"
    ],
    "promptSkeletonZh": "每組有{a}{itemUnit}{item}，每{containerUnit}有{b}組，共有{c}{containerUnit}，一共有多少{itemUnit}？",
    "requiredConstraints": [
      "THREE_DISTINCT_HIERARCHY_ROLES",
      "GROUP_CONTAINER_UNIT_FLOW",
      "PRODUCT_WITHIN_RANGE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_multiplication"
    ],
    "skillTags": [
      "two_step",
      "consecutive_multiplication",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_consecutive_units_per_group_per_container"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 22,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_consecutive_unit_price_items_per_pack_packs",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_consecutive_multiplication",
    "knowledgePointId": "kp_g3b_u04_consecutive_multiplication",
    "templateFamilyId": "tpl_g3b_u04_consecutive_unit_price_items_per_pack_packs",
    "semanticSignature": "unit_price_times_items_per_pack_times_pack_count",
    "equationShape": "a*b*c",
    "unknownRole": "total_cost",
    "quantityRoles": {
      "a": "unit_price",
      "b": "items_per_pack",
      "c": "pack_count"
    },
    "contextDomains": [
      "stationery",
      "snacks",
      "tickets",
      "craft_materials"
    ],
    "promptSkeletonZh": "每{itemUnit}{item}{a}元，每{packUnit}有{b}{itemUnit}，買{c}{packUnit}一共要付多少元？",
    "requiredConstraints": [
      "PRICE_COUNT_UNIT_FLOW",
      "PACK_COUNT_POSITIVE",
      "PRODUCT_WITHIN_RANGE",
      "TOTAL_COST_ANSWER"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_multiplication"
    ],
    "skillTags": [
      "two_step",
      "consecutive_multiplication",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_consecutive_unit_price_items_per_pack_packs"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 23,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_consecutive_length_width_layers_array",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_consecutive_multiplication",
    "knowledgePointId": "kp_g3b_u04_consecutive_multiplication",
    "templateFamilyId": "tpl_g3b_u04_consecutive_length_width_layers_array",
    "semanticSignature": "length_count_times_width_count_times_layer_count",
    "equationShape": "a*b*c",
    "unknownRole": "total_block_count",
    "quantityRoles": {
      "a": "blocks_along_length",
      "b": "blocks_along_width",
      "c": "layer_count"
    },
    "contextDomains": [
      "building_blocks",
      "storage_grid",
      "display_array"
    ],
    "promptSkeletonZh": "每層長邊排{a}個、寬邊排{b}個，共疊{c}層，一共用了多少個積木？",
    "requiredConstraints": [
      "RECTANGULAR_ARRAY_SEMANTICS",
      "THREE_DIMENSION_ROLES",
      "PRODUCT_WITHIN_RANGE",
      "BLOCK_COUNT_ANSWER"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_multiplication"
    ],
    "skillTags": [
      "two_step",
      "consecutive_multiplication",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_consecutive_length_width_layers_array"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 24,
    "familyOrderWithinKnowledgePoint": 4,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_ratio_length_ratio_composition",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_composite_multiplicative_ratio",
    "knowledgePointId": "kp_g3b_u04_composite_multiplicative_ratio",
    "templateFamilyId": "tpl_g3b_u04_ratio_length_ratio_composition",
    "semanticSignature": "compose_two_length_multipliers_find_final_ratio",
    "equationShape": "m*n",
    "unknownRole": "composite_multiplier",
    "quantityRoles": {
      "m": "middle_to_base_multiplier",
      "n": "final_to_middle_multiplier"
    },
    "contextDomains": [
      "ribbon",
      "rope",
      "sticks",
      "tracks"
    ],
    "promptSkeletonZh": "{middleObject}的長度是{baseObject}的{m}倍，{finalObject}的長度是{middleObject}的{n}倍，{finalObject}是{baseObject}的幾倍？",
    "requiredConstraints": [
      "MULTIPLIER_DIRECTION_CONSISTENT",
      "ANSWER_UNIT_IS_TIMES",
      "M_AND_N_BETWEEN_2_AND_9"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "multiplicative_comparison"
    ],
    "skillTags": [
      "two_step",
      "multiplicative_ratio",
      "relationship_chain",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_ratio_length_ratio_composition"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 25,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_ratio_capacity_ratio_composition",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_composite_multiplicative_ratio",
    "knowledgePointId": "kp_g3b_u04_composite_multiplicative_ratio",
    "templateFamilyId": "tpl_g3b_u04_ratio_capacity_ratio_composition",
    "semanticSignature": "compose_two_capacity_multipliers_find_final_ratio",
    "equationShape": "m*n",
    "unknownRole": "composite_multiplier",
    "quantityRoles": {
      "m": "middle_to_base_capacity_multiplier",
      "n": "final_to_middle_capacity_multiplier"
    },
    "contextDomains": [
      "bottles",
      "jugs",
      "water_tanks"
    ],
    "promptSkeletonZh": "{middleContainer}的容量是{baseContainer}的{m}倍，{finalContainer}是{middleContainer}的{n}倍，{finalContainer}的容量是{baseContainer}的幾倍？",
    "requiredConstraints": [
      "SAME_MEASURE_DIMENSION",
      "MULTIPLIER_DIRECTION_CONSISTENT",
      "ANSWER_UNIT_IS_TIMES",
      "CONTAINER_ORDER_PLAUSIBLE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "multiplicative_comparison"
    ],
    "skillTags": [
      "two_step",
      "multiplicative_ratio",
      "relationship_chain",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_ratio_capacity_ratio_composition"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 26,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_ratio_weight_ratio_composition",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_composite_multiplicative_ratio",
    "knowledgePointId": "kp_g3b_u04_composite_multiplicative_ratio",
    "templateFamilyId": "tpl_g3b_u04_ratio_weight_ratio_composition",
    "semanticSignature": "compose_two_weight_multipliers_find_final_ratio",
    "equationShape": "m*n",
    "unknownRole": "composite_multiplier",
    "quantityRoles": {
      "m": "middle_to_base_weight_multiplier",
      "n": "final_to_middle_weight_multiplier"
    },
    "contextDomains": [
      "parcels",
      "fruit_boxes",
      "sports_equipment"
    ],
    "promptSkeletonZh": "{middleObject}的重量是{baseObject}的{m}倍，{finalObject}是{middleObject}的{n}倍，{finalObject}是{baseObject}的幾倍？",
    "requiredConstraints": [
      "SAME_MEASURE_DIMENSION",
      "MULTIPLIER_DIRECTION_CONSISTENT",
      "ANSWER_UNIT_IS_TIMES",
      "OBJECT_WEIGHT_ORDER_PLAUSIBLE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "multiplicative_comparison"
    ],
    "skillTags": [
      "two_step",
      "multiplicative_ratio",
      "relationship_chain",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_ratio_weight_ratio_composition"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 27,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_quantity_chain_personal_quantity_ratio_chain",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_multiplicative_quantity_chain",
    "knowledgePointId": "kp_g3b_u04_multiplicative_quantity_chain",
    "templateFamilyId": "tpl_g3b_u04_quantity_chain_personal_quantity_ratio_chain",
    "semanticSignature": "base_person_quantity_times_two_relationship_multipliers",
    "equationShape": "a*m*n",
    "unknownRole": "final_person_quantity",
    "quantityRoles": {
      "a": "base_person_quantity",
      "m": "middle_to_base_multiplier",
      "n": "final_to_middle_multiplier"
    },
    "contextDomains": [
      "pens",
      "stickers",
      "cards",
      "books"
    ],
    "promptSkeletonZh": "{person1}有{a}{itemUnit}{item}，{person2}有{person1}的{m}倍，{person3}有{person2}的{n}倍，{person3}有多少{itemUnit}？",
    "requiredConstraints": [
      "RELATIONSHIP_DIRECTION_CONSISTENT",
      "PEOPLE_OWNERSHIP_CLEAR",
      "COUNT_UNIT_FLOW",
      "PRODUCT_WITHIN_RANGE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "multiplicative_comparison"
    ],
    "skillTags": [
      "two_step",
      "multiplicative_quantity_chain",
      "relationship_chain",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_quantity_chain_personal_quantity_ratio_chain"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 28,
    "familyOrderWithinKnowledgePoint": 1,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_quantity_chain_price_equivalence_chain",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_multiplicative_quantity_chain",
    "knowledgePointId": "kp_g3b_u04_multiplicative_quantity_chain",
    "templateFamilyId": "tpl_g3b_u04_quantity_chain_price_equivalence_chain",
    "semanticSignature": "base_unit_price_times_two_equivalence_multipliers",
    "equationShape": "a*m*n",
    "unknownRole": "final_product_price",
    "quantityRoles": {
      "a": "base_product_price",
      "m": "middle_product_base_equivalent_count",
      "n": "final_product_middle_equivalent_count"
    },
    "contextDomains": [
      "bakery",
      "drinks",
      "tickets",
      "school_store"
    ],
    "promptSkeletonZh": "一{baseUnit}{baseItem}{a}元，一{middleUnit}{middleItem}和{m}{baseUnit}{baseItem}一樣多，一{finalUnit}{finalItem}和{n}{middleUnit}{middleItem}一樣多，一{finalUnit}{finalItem}多少元？",
    "requiredConstraints": [
      "PRICE_EQUIVALENCE_DIRECTION_CLEAR",
      "MONEY_UNIT_FLOW",
      "PRODUCT_WITHIN_RANGE",
      "OBJECT_COUNT_NOUN_MATCH"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "multiplicative_comparison"
    ],
    "skillTags": [
      "two_step",
      "multiplicative_quantity_chain",
      "relationship_chain",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_quantity_chain_price_equivalence_chain"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 29,
    "familyOrderWithinKnowledgePoint": 2,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_quantity_chain_production_capacity_chain",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_multiplicative_quantity_chain",
    "knowledgePointId": "kp_g3b_u04_multiplicative_quantity_chain",
    "templateFamilyId": "tpl_g3b_u04_quantity_chain_production_capacity_chain",
    "semanticSignature": "base_output_times_two_capacity_multipliers",
    "equationShape": "a*m*n",
    "unknownRole": "final_output_quantity",
    "quantityRoles": {
      "a": "base_output_per_period",
      "m": "middle_to_base_output_multiplier",
      "n": "final_to_middle_output_multiplier"
    },
    "contextDomains": [
      "school_crafts",
      "printing",
      "packing",
      "recycling"
    ],
    "promptSkeletonZh": "小型工作臺每段時間完成{a}{itemUnit}{item}，中型工作臺是小型的{m}倍，大型工作臺是中型的{n}倍，大型工作臺完成多少{itemUnit}？",
    "requiredConstraints": [
      "SAME_TIME_PERIOD_REQUIRED",
      "OUTPUT_RELATIONSHIP_DIRECTION_CLEAR",
      "COUNT_UNIT_FLOW",
      "PRODUCT_WITHIN_RANGE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "multiplicative_comparison"
    ],
    "skillTags": [
      "two_step",
      "multiplicative_quantity_chain",
      "relationship_chain",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_quantity_chain_production_capacity_chain"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 30,
    "familyOrderWithinKnowledgePoint": 3,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_add_divide_promotion_total_equal_share",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_add_then_divide",
    "knowledgePointId": "kp_g3b_u04_add_then_divide",
    "templateFamilyId": "tpl_g3b_u04_add_divide_promotion_total_equal_share",
    "semanticSignature": "base_price_plus_promotion_surcharge_then_equal_share",
    "equationShape": "(a+b)/c",
    "unknownRole": "cost_per_person",
    "quantityRoles": {
      "a": "base_product_price",
      "b": "promotion_surcharge",
      "c": "payer_count"
    },
    "contextDomains": [
      "daily_goods",
      "food",
      "school_supplies"
    ],
    "promptSkeletonZh": "{item}原價{a}元，活動期間再加{b}元可以多拿一{itemUnit}，{c}人一起購買並平均分擔，平均每人要付多少元？",
    "requiredConstraints": [
      "SUM_DIVISIBLE_BY_C",
      "PROMOTION_SURCHARGE_EXPLICIT",
      "RECEIVED_QUANTITY_MATCHES_PAYERS",
      "SHARED_OWNERSHIP_CLEAR"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "integer_mixed_operations"
    ],
    "skillTags": [
      "two_step",
      "addition_then_division",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_add_divide_promotion_total_equal_share"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 31,
    "familyOrderWithinKnowledgePoint": 5,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  },
  {
    "patternSpecId": "ps_g3b_u04_quantity_chain_age_ratio_chain",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "kind": "g3bU04SemanticWordProblem",
    "patternGroupId": "pg_g3b_u04_multiplicative_quantity_chain",
    "knowledgePointId": "kp_g3b_u04_multiplicative_quantity_chain",
    "templateFamilyId": "tpl_g3b_u04_quantity_chain_age_ratio_chain",
    "semanticSignature": "base_child_age_times_sibling_and_parent_multipliers",
    "equationShape": "a*m*n",
    "unknownRole": "final_person_age",
    "quantityRoles": {
      "a": "base_child_age",
      "m": "sibling_to_child_multiplier",
      "n": "parent_to_sibling_multiplier"
    },
    "contextDomains": [
      "family_age"
    ],
    "promptSkeletonZh": "{child}今年{a}歲，{sibling}的年齡是{child}的{m}倍，{parent}的年齡是{sibling}的{n}倍，{parent}今年幾歲？",
    "requiredConstraints": [
      "AGE_PROFILE_REQUIRED",
      "AGE_ORDERING_PLAUSIBLE",
      "RELATIONSHIP_DIRECTION_CONSISTENT",
      "FINAL_AGE_WITHIN_PARENT_RANGE"
    ],
    "numericPolicyRef": "S57.sharedNumericPolicy",
    "semanticValidatorRef": "S57_G3B_U04_SemanticValidationContract",
    "answerModel": {
      "shape": "semantic_equation_answer",
      "fields": [
        "equationModel",
        "finalAnswer",
        "finalAnswerWithUnit",
        "semanticSnapshot"
      ]
    },
    "canonicalSkillIds": [
      "multiplicative_comparison"
    ],
    "skillTags": [
      "two_step",
      "multiplicative_quantity_chain",
      "relationship_chain",
      "word_problem"
    ],
    "difficultyTags": [
      "batch_a_browser_bridge",
      "g3b_u04_semantic_word_problem",
      "hidden_s57e1"
    ],
    "patternTags": [
      "batch_a",
      "g3b_u04",
      "semantic_family",
      "tpl_g3b_u04_quantity_chain_age_ratio_chain"
    ],
    "curriculumNodeIds": [
      "g3b_u04_3b04"
    ],
    "familyOrder": 32,
    "familyOrderWithinKnowledgePoint": 4,
    "generatorStatus": "hidden_implementation_candidate",
    "validatorStatus": "blocking_validator_required",
    "runtimeProjectionStatus": "materialized_not_routed",
    "selectorStatus": "hidden",
    "productionUse": "forbidden"
  }
]);
const patternGroups = deepFreeze([
  {
    "patternGroupId": "pg_g3b_u04_add_then_divide",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "先加再除",
    "primaryKnowledgePointId": "kp_g3b_u04_add_then_divide",
    "knowledgePointIds": [
      "kp_g3b_u04_add_then_divide"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_add_divide_joint_purchase_equal_share",
      "ps_g3b_u04_add_divide_pooled_money_unit_price",
      "ps_g3b_u04_add_divide_combined_inventory_equal_distribution",
      "ps_g3b_u04_add_divide_combined_liquid_equal_portions",
      "ps_g3b_u04_add_divide_promotion_total_equal_share"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  },
  {
    "patternGroupId": "pg_g3b_u04_multiply_then_divide_average_unit_price",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "先乘再除求平均單價",
    "primaryKnowledgePointId": "kp_g3b_u04_multiply_then_divide_average_unit_price",
    "knowledgePointIds": [
      "kp_g3b_u04_multiply_then_divide_average_unit_price"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_mul_div_buy_get_free_average_price",
      "ps_g3b_u04_mul_div_bonus_units_average_cost",
      "ps_g3b_u04_mul_div_bulk_repack_average_cost"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  },
  {
    "patternGroupId": "pg_g3b_u04_subtract_then_divide",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "先減再除",
    "primaryKnowledgePointId": "kp_g3b_u04_subtract_then_divide",
    "knowledgePointIds": [
      "kp_g3b_u04_subtract_then_divide"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_sub_div_used_amount_then_share",
      "ps_g3b_u04_sub_div_damage_loss_then_package",
      "ps_g3b_u04_sub_div_reserved_amount_then_distribute",
      "ps_g3b_u04_sub_div_absent_participants_then_group"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  },
  {
    "patternGroupId": "pg_g3b_u04_divide_then_add",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "先除再加",
    "primaryKnowledgePointId": "kp_g3b_u04_divide_then_add",
    "knowledgePointIds": [
      "kp_g3b_u04_divide_then_add"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_div_add_shared_cost_plus_personal_purchase",
      "ps_g3b_u04_div_add_new_packages_plus_existing_stock",
      "ps_g3b_u04_div_add_distributed_resources_plus_existing_per_group"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  },
  {
    "patternGroupId": "pg_g3b_u04_total_minus_shared_amount",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "總量減去平均分擔量",
    "primaryKnowledgePointId": "kp_g3b_u04_total_minus_shared_amount",
    "knowledgePointIds": [
      "kp_g3b_u04_total_minus_shared_amount"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_total_minus_share_wallet_minus_shared_purchase",
      "ps_g3b_u04_total_minus_share_personal_budget_minus_group_fee",
      "ps_g3b_u04_total_minus_share_reward_points_minus_shared_redemption"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  },
  {
    "patternGroupId": "pg_g3b_u04_group_total_minus_remaining",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "分組總數減剩餘組數",
    "primaryKnowledgePointId": "kp_g3b_u04_group_total_minus_remaining",
    "knowledgePointIds": [
      "kp_g3b_u04_group_total_minus_remaining"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_group_minus_remaining_packaged_total_minus_remaining_sold",
      "ps_g3b_u04_group_minus_remaining_formed_teams_minus_inactive_teams",
      "ps_g3b_u04_group_minus_remaining_prepared_trays_minus_leftover_trays"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  },
  {
    "patternGroupId": "pg_g3b_u04_consecutive_multiplication",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "連續乘法",
    "primaryKnowledgePointId": "kp_g3b_u04_consecutive_multiplication",
    "knowledgePointIds": [
      "kp_g3b_u04_consecutive_multiplication"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_consecutive_items_per_row_per_box",
      "ps_g3b_u04_consecutive_units_per_group_per_container",
      "ps_g3b_u04_consecutive_unit_price_items_per_pack_packs",
      "ps_g3b_u04_consecutive_length_width_layers_array"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  },
  {
    "patternGroupId": "pg_g3b_u04_composite_multiplicative_ratio",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "複合倍數關係",
    "primaryKnowledgePointId": "kp_g3b_u04_composite_multiplicative_ratio",
    "knowledgePointIds": [
      "kp_g3b_u04_composite_multiplicative_ratio"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_ratio_length_ratio_composition",
      "ps_g3b_u04_ratio_capacity_ratio_composition",
      "ps_g3b_u04_ratio_weight_ratio_composition"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  },
  {
    "patternGroupId": "pg_g3b_u04_multiplicative_quantity_chain",
    "sourceId": "g3b_u04_3b04",
    "unitCode": "3B-U04",
    "unitTitle": "兩步驟計算",
    "displayName": "倍數數量鏈",
    "primaryKnowledgePointId": "kp_g3b_u04_multiplicative_quantity_chain",
    "knowledgePointIds": [
      "kp_g3b_u04_multiplicative_quantity_chain"
    ],
    "supportClass": "B",
    "patternSpecIds": [
      "ps_g3b_u04_quantity_chain_personal_quantity_ratio_chain",
      "ps_g3b_u04_quantity_chain_price_equivalence_chain",
      "ps_g3b_u04_quantity_chain_production_capacity_chain",
      "ps_g3b_u04_quantity_chain_age_ratio_chain"
    ],
    "allocationPolicy": "balanced_by_family",
    "visibilityStatus": "hidden",
    "holdReason": "semantic_runtime_and_smoke_qa_required"
  }
]);
const definitions = new Map(patternSpecs.map((spec) => [spec.patternSpecId, spec]));

export const G3B_U04_SEMANTIC_PATTERN_SPEC_IDS = Object.freeze(patternSpecs.map((spec) => spec.patternSpecId));
export const G3B_U04_SEMANTIC_PATTERN_DEFINITIONS = Object.freeze(Object.fromEntries(definitions));
export const G3B_U04_SEMANTIC_PATTERN_GROUPS = patternGroups;

export function isG3BU04SemanticPatternSpecId(patternSpecId) {
  return definitions.has(patternSpecId);
}

export function getG3BU04SemanticPatternDefinition(patternSpecId) {
  return definitions.get(patternSpecId) ?? null;
}

export function listG3BU04SemanticPatternDefinitions() {
  return [...patternSpecs];
}

export function listG3BU04SemanticPatternGroups() {
  return [...patternGroups];
}

export function getBatchABrowserPatternDefinition(patternSpecId) {
  return definitions.get(patternSpecId) ?? baseGetDefinition(patternSpecId);
}

export function getBatchAPatternSpecIdsForSource(sourceId) {
  const baseIds = baseGetPatternIds(sourceId);
  if (sourceId === G3B_U04_SOURCE_ID) return [...baseIds, ...G3B_U04_SEMANTIC_PATTERN_SPEC_IDS];
  return baseIds;
}
