export const G3A_U01_VISUAL_RANK01_PUBLIC_TASK_ID = "G3A_U01_VisualPatternSpec_Rank01_SelectorAdmissionPreflight_ThenPublicCutover";
export const G3A_U01_VISUAL_RANK01_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_VISUAL_RANK01_CANONICAL_KP_ID = "kp_g3a_u01_4digit_compare";
export const G3A_U01_VISUAL_RANK01_KP_ID = "kp_g3a_u01_one_way_table_compare";
export const G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID = "pg_g3a_u01_visual_one_way_table_compare";
export const G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID = "ps_g3a_u01_visual_one_way_table_compare";

export const G3A_U01_VISUAL_RANK01_PUBLIC_PATTERN_GROUP = Object.freeze({
  patternGroupId:G3A_U01_VISUAL_RANK01_PATTERN_GROUP_ID,
  sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,
  unitCode:"3A-U01",
  unitTitle:"10000以內的數",
  displayName:"一維資料表四位數比較",
  primaryKnowledgePointId:G3A_U01_VISUAL_RANK01_KP_ID,
  canonicalPrimaryKnowledgePointId:G3A_U01_VISUAL_RANK01_CANONICAL_KP_ID,
  knowledgePointIds:Object.freeze([G3A_U01_VISUAL_RANK01_KP_ID]),
  canonicalKnowledgePointIds:Object.freeze([G3A_U01_VISUAL_RANK01_CANONICAL_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"one_way_statistics_table",
  representationTags:Object.freeze(["visual_table","four_digit_compare","one_way_statistics_table"]),
  patternSpecIds:Object.freeze([G3A_U01_VISUAL_RANK01_PATTERN_SPEC_ID]),
  allocationPolicy:"single_visual_pattern_spec",
  visibilityStatus:"visible",
  selectorStatus:"visible_public_review",
  holdReason:null,
  sameUnitMixedAllowed:false,
  crossUnitMixedAllowed:false,
  sourceQuestionCount:11,
  deterministicVariantCount:240,
  publicLayoutReviewStatus:"OPERATOR_MULTI_MODE_REVIEW_PENDING",
  productionUse:"public_review"
});

export const G3A_U01_VISUAL_RANK01_PUBLIC_SELECTOR_PROJECTION = Object.freeze({
  taskId:G3A_U01_VISUAL_RANK01_PUBLIC_TASK_ID,
  sourceId:G3A_U01_VISUAL_RANK01_SOURCE_ID,
  existingKnowledgePointId:G3A_U01_VISUAL_RANK01_CANONICAL_KP_ID,
  selectorKnowledgePointId:G3A_U01_VISUAL_RANK01_KP_ID,
  selectorKnowledgePointDisplayName:"一維資料表四位數比較",
  selectorNodeType:"ranked_practice_target",
  canonicalGraphNodeAdded:false,
  addedKnowledgePointCount:0,
  addedSelectableTargetCount:1,
  addedPatternGroupCount:1,
  addedPatternSpecCount:1,
  admissionMode:"singleKnowledgePoint_only",
  sourceUnitChanged:false,
  sameUnitMixedChanged:false,
  rank02PlusVisible:false,
  operatorLayoutReviewRequired:true
});
