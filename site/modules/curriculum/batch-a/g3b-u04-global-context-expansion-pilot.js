const PILOT_PATTERN_SPEC_ID = "ps_g3b_u04_add_divide_joint_purchase_equal_share";
const PILOT_KNOWLEDGE_POINT_ID = "kp_g3b_u04_add_then_divide";
const PILOT_CONTEXT_FAMILY_ID = "gctx_cf_g3b_u04_add_divide_joint_purchase_equal_share";

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const nested of Object.values(value)) deepFreeze(nested);
  return Object.freeze(value);
}

export const G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS = deepFreeze([
  {
    variantId: "gctx_semvar_g3b_u04_joint_purchase_class_festival",
    languageVariantId: "gctx_lang_zh_tw_g3b_u04_joint_purchase_class_festival",
    contextDomainId: "class_festival_preparation",
    displayNameZh: "班級園遊會籌備",
    eventPurposeId: "prepare_class_festival",
    placeAssetId: "gctx_place_school_class_festival",
    activityAssetId: "gctx_activity_prepare_class_festival",
    actorAssetId: "gctx_actor_student_planning_group",
    firstCostLabel: "布置材料費",
    secondCostLabel: "點心材料費",
    promptTemplateZh: "{c}位同學共同準備班級園遊會，布置材料費{a}元，點心材料費{b}元。兩項費用由{c}人平均分擔，每人要付多少元？",
    semanticFingerprint: "shared_cost|class_festival|decoration_and_snacks|student_planning_group"
  },
  {
    variantId: "gctx_semvar_g3b_u04_joint_purchase_field_learning",
    languageVariantId: "gctx_lang_zh_tw_g3b_u04_joint_purchase_field_learning",
    contextDomainId: "field_learning_preparation",
    displayNameZh: "戶外學習準備",
    eventPurposeId: "prepare_field_learning",
    placeAssetId: "gctx_place_school_field_learning",
    activityAssetId: "gctx_activity_prepare_field_learning",
    actorAssetId: "gctx_actor_student_field_learning_group",
    firstCostLabel: "活動手冊印製費",
    secondCostLabel: "導覽器材租借費",
    promptTemplateZh: "{c}位同學一起準備戶外學習，活動手冊印製費{a}元，導覽器材租借費{b}元。兩項費用由{c}人平均分擔，每人要付多少元？",
    semanticFingerprint: "shared_cost|field_learning|booklet_and_guide_equipment|student_field_group"
  },
  {
    variantId: "gctx_semvar_g3b_u04_joint_purchase_sports_practice",
    languageVariantId: "gctx_lang_zh_tw_g3b_u04_joint_purchase_sports_practice",
    contextDomainId: "sports_practice_booking",
    displayNameZh: "運動練習預約",
    eventPurposeId: "book_sports_practice",
    placeAssetId: "gctx_place_community_sports_court",
    activityAssetId: "gctx_activity_book_sports_practice",
    actorAssetId: "gctx_actor_student_sports_team",
    firstCostLabel: "場地使用費",
    secondCostLabel: "器材租借費",
    promptTemplateZh: "{c}位同學一起安排運動練習，場地使用費{a}元，器材租借費{b}元。兩項費用由{c}人平均分擔，每人要付多少元？",
    semanticFingerprint: "shared_cost|sports_practice|court_and_equipment|student_sports_team"
  },
  {
    variantId: "gctx_semvar_g3b_u04_joint_purchase_community_cleanup",
    languageVariantId: "gctx_lang_zh_tw_g3b_u04_joint_purchase_community_cleanup",
    contextDomainId: "community_cleanup_preparation",
    displayNameZh: "社區清潔準備",
    eventPurposeId: "prepare_community_cleanup",
    placeAssetId: "gctx_place_community_cleanup_area",
    activityAssetId: "gctx_activity_prepare_community_cleanup",
    actorAssetId: "gctx_actor_student_service_group",
    firstCostLabel: "工作手套費",
    secondCostLabel: "清潔袋費",
    promptTemplateZh: "{c}位同學共同準備社區清潔活動，工作手套費{a}元，清潔袋費{b}元。兩項費用由{c}人平均分擔，每人要付多少元？",
    semanticFingerprint: "shared_cost|community_cleanup|gloves_and_cleanup_bags|student_service_group"
  },
  {
    variantId: "gctx_semvar_g3b_u04_joint_purchase_camping_activity",
    languageVariantId: "gctx_lang_zh_tw_g3b_u04_joint_purchase_camping_activity",
    contextDomainId: "camping_activity_preparation",
    displayNameZh: "露營活動準備",
    eventPurposeId: "prepare_camping_activity",
    placeAssetId: "gctx_place_camping_activity_site",
    activityAssetId: "gctx_activity_prepare_camping_activity",
    actorAssetId: "gctx_actor_student_camping_group",
    firstCostLabel: "營燈租借費",
    secondCostLabel: "炊事用品費",
    promptTemplateZh: "{c}位同學一起準備露營活動，營燈租借費{a}元，炊事用品費{b}元。兩項費用由{c}人平均分擔，每人要付多少元？",
    semanticFingerprint: "shared_cost|camping_activity|lamp_and_cooking_supplies|student_camping_group"
  }
]);

const variantById = new Map(G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => [variant.variantId, variant]));

function renderTemplate(template, values) {
  return template.replace(/\{([abc])\}/g, (_, key) => String(values[key]));
}

function issue(code, path, message, details = {}) {
  return { code, severity: "error", path, message, ...details };
}

export const G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT = deepFreeze({
  task: "GCTX-P12_G3BU04GlobalContextExpansionPilotAndRenderedDifferenceGate",
  rulesetVersion: "0.1.0",
  sourceId: "g3b_u04_3b04",
  unitCode: "3B-U04",
  patternSpecId: PILOT_PATTERN_SPEC_ID,
  knowledgePointId: PILOT_KNOWLEDGE_POINT_ID,
  contextFamilyId: PILOT_CONTEXT_FAMILY_ID,
  operationSignature: "(a+b)/c",
  variantCount: G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length,
  lifecycleStatus: "candidate_rendered_for_human_review",
  productionSelectable: false,
  runtimeResolvable: false,
  legacyContextPreservedAsFallback: false
});

export function getG3BU04GlobalContextExpansionVariant(variantId) {
  return variantById.get(variantId) ?? null;
}

export function selectG3BU04GlobalContextExpansionVariant(sequenceNumber = 1) {
  const normalized = Number.isInteger(sequenceNumber) && sequenceNumber > 0 ? sequenceNumber : 1;
  return G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS[(normalized - 1) % G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.length];
}

export function renderG3BU04GlobalContextExpansionQuestion({ variantId, a, b, c } = {}) {
  const variant = getG3BU04GlobalContextExpansionVariant(variantId);
  if (!variant) return null;
  const values = { a, b, c };
  const promptText = renderTemplate(variant.promptTemplateZh, values);
  const finalAnswer = Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c) && c > 0 ? (a + b) / c : Number.NaN;
  return {
    patternSpecId: PILOT_PATTERN_SPEC_ID,
    knowledgePointId: PILOT_KNOWLEDGE_POINT_ID,
    contextFamilyId: PILOT_CONTEXT_FAMILY_ID,
    semanticVariantId: variant.variantId,
    languageVariantId: variant.languageVariantId,
    contextDomainId: variant.contextDomainId,
    displayNameZh: variant.displayNameZh,
    semanticFingerprint: variant.semanticFingerprint,
    promptText,
    equationModel: `(${a} + ${b}) ÷ ${c}`,
    quantities: { a, b, c },
    finalAnswer,
    answerUnit: "元",
    answerText: `${finalAnswer}元`,
    eventFlow: [
      { order: 1, action: "introduce_two_shared_costs", result: [a, b] },
      { order: 2, action: "combine_shared_costs", result: a + b },
      { order: 3, action: "equal_share_combined_cost", result: finalAnswer }
    ],
    globalContextBinding: {
      rulesetVersion: G3B_U04_GLOBAL_CONTEXT_EXPANSION_PILOT.rulesetVersion,
      contextFamilyId: PILOT_CONTEXT_FAMILY_ID,
      semanticVariantId: variant.variantId,
      languageVariantId: variant.languageVariantId,
      contextDomainId: variant.contextDomainId,
      eventPurposeId: variant.eventPurposeId,
      placeAssetId: variant.placeAssetId,
      activityAssetId: variant.activityAssetId,
      actorAssetId: variant.actorAssetId,
      lifecycleStatus: "candidate_rendered_for_human_review",
      productionSelectable: false,
      runtimeResolvable: false
    }
  };
}

export function validateG3BU04GlobalContextExpansionQuestion(question = {}) {
  const errors = [];
  const variant = getG3BU04GlobalContextExpansionVariant(question.semanticVariantId);
  const { a, b, c } = question.quantities ?? {};
  const expectedAnswer = Number.isInteger(a) && Number.isInteger(b) && Number.isInteger(c) && c > 0 ? (a + b) / c : Number.NaN;

  if (!variant) errors.push(issue("GCTX_P12_VARIANT_UNREGISTERED", "semanticVariantId", "Global context semantic variant is not registered."));
  if (question.patternSpecId !== PILOT_PATTERN_SPEC_ID) errors.push(issue("GCTX_P12_PATTERN_SPEC_MISMATCH", "patternSpecId", "Pilot question uses the wrong PatternSpec."));
  if (question.knowledgePointId !== PILOT_KNOWLEDGE_POINT_ID) errors.push(issue("GCTX_P12_KNOWLEDGE_POINT_MISMATCH", "knowledgePointId", "Pilot question uses the wrong KnowledgePoint."));
  if (![a, b, c].every((value) => Number.isInteger(value) && value > 0)) errors.push(issue("GCTX_P12_QUANTITY_INVALID", "quantities", "a, b and c must be positive integers."));
  if (!Number.isInteger(expectedAnswer) || expectedAnswer <= 0) errors.push(issue("GCTX_P12_SUM_NOT_DIVISIBLE", "quantities", "The combined cost must divide evenly by the payer count."));
  if (question.finalAnswer !== expectedAnswer || question.answerText !== `${expectedAnswer}元`) errors.push(issue("GCTX_P12_ANSWER_RECOMPUTATION_MISMATCH", "finalAnswer", "Answer does not equal (a+b)/c."));
  if (question.equationModel !== `(${a} + ${b}) ÷ ${c}`) errors.push(issue("GCTX_P12_EQUATION_MODEL_MISMATCH", "equationModel", "Equation model does not preserve (a+b)/c."));
  if (variant && question.promptText !== renderTemplate(variant.promptTemplateZh, { a, b, c })) errors.push(issue("GCTX_P12_PROMPT_TEMPLATE_MISMATCH", "promptText", "Rendered prompt does not match the admitted language variant."));
  if (!question.promptText?.includes(`${a}元`) || !question.promptText?.includes(`${b}元`) || !question.promptText?.includes(`${c}人`) || !question.promptText?.includes("每人要付多少元")) {
    errors.push(issue("GCTX_P12_VISIBLE_ROLE_EVIDENCE_MISSING", "promptText", "Prompt must visibly preserve both costs, payer count and per-person target."));
  }
  if (/三明治費用共|筆記本費用共|門票費用共|帳篷租金共/.test(question.promptText ?? "")) {
    errors.push(issue("GCTX_P12_LEGACY_CONTEXT_LEAKED", "promptText", "Pilot output still contains a legacy context prompt."));
  }
  if (question.globalContextBinding?.productionSelectable !== false || question.globalContextBinding?.runtimeResolvable !== false) {
    errors.push(issue("GCTX_P12_FALSE_PRODUCTION_ADMISSION", "globalContextBinding", "Candidate pilot must remain non-production until human review."));
  }
  return { ok: errors.length === 0, errors, warnings: [] };
}

export function buildG3BU04GlobalContextExpansionPreview({ a = 60, b = 90, c = 5 } = {}) {
  const questions = G3B_U04_GLOBAL_CONTEXT_EXPANSION_VARIANTS.map((variant) => renderG3BU04GlobalContextExpansionQuestion({
    variantId: variant.variantId,
    a,
    b,
    c
  }));
  const validations = questions.map((question) => validateG3BU04GlobalContextExpansionQuestion(question));
  const errors = validations.flatMap((validation) => validation.errors);
  return {
    ok: errors.length === 0,
    baselinePromptText: `三明治費用共${a}元，果汁費用共${b}元。${c}人一起訂購並分享餐點，總費用平均分擔，每人要付多少元？`,
    questions,
    validations,
    errors,
    summary: {
      variantCount: questions.length,
      uniquePromptCount: new Set(questions.map((question) => question.promptText)).size,
      uniqueContextDomainCount: new Set(questions.map((question) => question.contextDomainId)).size,
      uniqueSemanticFingerprintCount: new Set(questions.map((question) => question.semanticFingerprint)).size,
      legacyPromptCount: questions.filter((question) => /三明治費用共|筆記本費用共|門票費用共|帳篷租金共/.test(question.promptText)).length,
      productionSelectableCount: questions.filter((question) => question.globalContextBinding.productionSelectable).length,
      runtimeResolvableCount: questions.filter((question) => question.globalContextBinding.runtimeResolvable).length,
      errorCount: errors.length
    }
  };
}
