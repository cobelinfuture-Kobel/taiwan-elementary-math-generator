export const G3A_U01_VISUAL_RANK02_PUBLIC_TASK_ID =
  "G3A_U01_VisualRank02_PublicSelectorCutover_ThreeModeLinkage";
export const G3A_U01_VISUAL_RANK02_SOURCE_ID = "g3a_u01_3a01";
export const G3A_U01_VISUAL_RANK02_KP_ID = "kp_g3a_u01_integer_number_line_scale_location";
export const G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID =
  "pg_g3a_u01_visual_integer_number_line_read_value";
export const G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID =
  "ps_g3a_u01_visual_integer_number_line_read_value";

export const G3A_U01_VISUAL_RANK02_PUBLIC_PATTERN_GROUP = Object.freeze({
  patternGroupId:G3A_U01_VISUAL_RANK02_PATTERN_GROUP_ID,
  sourceId:G3A_U01_VISUAL_RANK02_SOURCE_ID,
  unitCode:"3A-U01",
  unitTitle:"10000以內的數",
  displayName:"整數數線讀值",
  primaryKnowledgePointId:G3A_U01_VISUAL_RANK02_KP_ID,
  knowledgePointIds:Object.freeze([G3A_U01_VISUAL_RANK02_KP_ID]),
  supportClass:"A",
  mode:"numeric",
  publicQuestionMode:"numeric",
  representationTag:"integer_number_line",
  representationTags:Object.freeze(["integer_number_line","read_marker_value","within_10000"]),
  patternSpecIds:Object.freeze([G3A_U01_VISUAL_RANK02_PATTERN_SPEC_ID]),
  allocationPolicy:"single_visual_pattern_spec",
  visibilityStatus:"visible",
  selectorStatus:"visible_public_review",
  holdReason:null,
  sameUnitMixedAllowed:true,
  crossUnitMixedAllowed:true,
  sourceQuestionCount:50,
  deterministicVariantCount:240,
  publicLayoutReviewStatus:"A4_2X3_BROWSER_ACCEPTED_OPERATOR_PUBLIC_REVIEW_PENDING",
  productionUse:"public_review"
});

export const G3A_U01_VISUAL_RANK02_PUBLIC_SELECTOR_PROJECTION = Object.freeze({
  taskId:G3A_U01_VISUAL_RANK02_PUBLIC_TASK_ID,
  sourceId:G3A_U01_VISUAL_RANK02_SOURCE_ID,
  canonicalKnowledgePointId:G3A_U01_VISUAL_RANK02_KP_ID,
  addedKnowledgePointCount:1,
  addedPatternGroupCount:1,
  addedPatternSpecCount:1,
  admissionMode:"canonical_kp_single_and_mixed",
  sourceUnitChanged:false,
  sameUnitMixedChanged:true,
  crossUnitMixedChanged:true,
  rank03PlusVisible:false,
  operatorLayoutReviewRequired:true
});
