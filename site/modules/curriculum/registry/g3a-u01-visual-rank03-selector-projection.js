export const G3A_U01_VISUAL_RANK03_PUBLIC_TASK_ID =
  "G3A_U01_VisualRank03_PublicSelectorSiblingCutover_ThreeModeLinkage";
export const G3A_U01_VISUAL_RANK03_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_VISUAL_RANK03_KP_ID = "kp_g3a_u01_integer_number_line_scale_location";
export const G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID =
  "pg_g3a_u01_visual_integer_number_line_mark_value";
export const G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID =
  "ps_g3a_u01_visual_integer_number_line_mark_value";

export const G3A_U01_VISUAL_RANK03_PUBLIC_PATTERN_GROUP = Object.freeze({
  patternGroupId:G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID,
  sourceId:G3A_U01_VISUAL_RANK03_SOURCE_ID,
  unitCode:"3A-U01",
  unitTitle:"10000以內的數",
  displayName:"整數數線定位／標記",
  primaryKnowledgePointId:G3A_U01_VISUAL_RANK03_KP_ID,
  knowledgePointIds:Object.freeze([G3A_U01_VISUAL_RANK03_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"integer_number_line",
  representationTags:Object.freeze(["integer_number_line","mark_given_value","within_10000"]),
  patternSpecIds:Object.freeze([G3A_U01_VISUAL_RANK03_PATTERN_SPEC_ID]),
  allocationPolicy:"single_visual_pattern_spec",
  visibilityStatus:"visible",
  selectorStatus:"visible_public_review",
  holdReason:null,
  sameUnitMixedAllowed:true,
  crossUnitMixedAllowed:true,
  sourceQuestionCount:20,
  deterministicVariantCount:240,
  publicLayoutReviewStatus:"A4_2X3_HIDDEN_BROWSER_ACCEPTED_OPERATOR_PUBLIC_REVIEW_PENDING",
  productionUse:"public_review"
});

export const G3A_U01_VISUAL_RANK03_PUBLIC_SELECTOR_PROJECTION = Object.freeze({
  taskId:G3A_U01_VISUAL_RANK03_PUBLIC_TASK_ID,
  sourceId:G3A_U01_VISUAL_RANK03_SOURCE_ID,
  canonicalKnowledgePointId:G3A_U01_VISUAL_RANK03_KP_ID,
  selectorTargetId:G3A_U01_VISUAL_RANK03_PATTERN_GROUP_ID,
  selectorNodeStrategy:"PATTERN_GROUP_SIBLING_REUSING_EXISTING_CANONICAL_KP",
  addedKnowledgePointCount:0,
  addedSiblingSelectorTargetCount:1,
  addedPatternGroupCount:1,
  addedPatternSpecCount:1,
  admissionMode:"single_and_mixed_sibling_selector_target",
  sameUnitExpectedTargetCount:11,
  sourceUnitChanged:false,
  sameUnitMixedChanged:true,
  crossUnitMixedChanged:true,
  rank04PlusVisible:false,
  operatorLayoutReviewRequired:true
});
