import * as base from "./batch-a-selector-g3b-u08-semantic-extension.js";
import {
  G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
} from "./g4b-u01-horizontal-promotion.js";
import {
  G4B_U01_HIDDEN_PATTERN_GROUPS,
} from "../batch-a/source-pattern-g4b-u01-horizontal-extension.js";

const SOURCE_ID = "g4b_u01_4b01";
const UNIT_CODE = "4B-U01";
const UNIT_TITLE = "多位數的乘與除";
const clone = (value) => JSON.parse(JSON.stringify(value));

const kpRows = Object.freeze([
  ["kp_g4b_u01_3digit_by_3digit", "三位數乘三位數", "multi_digit_multiplication", ["three_digit_by_three_digit"], "pg_g4b_u01_3digit_by_3digit"],
  ["kp_g4b_u01_4digit_by_3digit", "四位數乘三位數", "multi_digit_multiplication", ["four_digit_by_three_digit"], "pg_g4b_u01_4digit_by_3digit"],
  ["kp_g4b_u01_multiplier_internal_zero", "乘數中間有0的乘法", "multi_digit_multiplication", ["multiplier_internal_zero"], "pg_g4b_u01_multiplier_internal_zero"],
  ["kp_g4b_u01_trailing_zero_multiplication", "尾0乘法與位值簡算", "multi_digit_multiplication", ["trailing_zero_factor", "power_of_ten_scaling"], "pg_g4b_u01_trailing_zero_multiplication"],
  ["kp_g4b_u01_3digit_div_3digit", "三位數除以三位數", "multi_digit_division", ["three_digit_dividend_three_digit_divisor", "one_digit_quotient"], "pg_g4b_u01_3digit_div_3digit"],
  ["kp_g4b_u01_4digit_div_3digit_2digit_quotient", "四位數除以三位數，商為兩位數", "multi_digit_division", ["four_digit_dividend_three_digit_divisor", "two_digit_quotient"], "pg_g4b_u01_4digit_div_3digit_2digit_quotient"],
  ["kp_g4b_u01_4digit_div_3digit_1digit_quotient", "四位數除以三位數，商為一位數", "multi_digit_division", ["four_digit_dividend_three_digit_divisor", "one_digit_quotient"], "pg_g4b_u01_4digit_div_3digit_1digit_quotient"],
  ["kp_g4b_u01_trailing_zero_division_exact", "尾0除法，整除", "multi_digit_division", ["common_trailing_zero_reduction", "exact_division"], "pg_g4b_u01_trailing_zero_division_exact"],
  ["kp_g4b_u01_trailing_zero_division_remainder_restore", "尾0除法，有餘數及餘數還原", "multi_digit_division", ["common_trailing_zero_reduction", "remainder_scale_restoration"], "pg_g4b_u01_trailing_zero_division_remainder_restore"],
]);

const hiddenGroupById = new Map(
  G4B_U01_HIDDEN_PATTERN_GROUPS.map((group) => [group.patternGroupId, group]),
);

function toPatternGroup([knowledgePointId, displayName, , , patternGroupId]) {
  const authority = hiddenGroupById.get(patternGroupId);
  return Object.freeze({
    patternGroupId,
    hiddenAuthorityGroupId: patternGroupId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName,
    primaryKnowledgePointId: knowledgePointId,
    knowledgePointIds: Object.freeze([knowledgePointId]),
    supportClass: "B",
    representationTag: "numeric_expression",
    representationTags: Object.freeze(["numeric_expression", "horizontal_expression"]),
    patternSpecIds: Object.freeze([...authority.patternSpecIds]),
    allocationPolicy: "balanced_by_pattern_spec",
    visibilityStatus: "visible",
    holdReason: null,
    promotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
    promotionRole: "promoted_horizontal_group",
  });
}

const visibleGroups = Object.freeze(kpRows.map(toPatternGroup));
const groupsByKnowledgePointId = new Map(
  visibleGroups.map((group) => [group.primaryKnowledgePointId, Object.freeze([group])]),
);

function toKnowledgePoint([knowledgePointId, displayName, canonicalSkillTag, subskillTags]) {
  const groups = groupsByKnowledgePointId.get(knowledgePointId) ?? [];
  return Object.freeze({
    knowledgePointId,
    sourceId: SOURCE_ID,
    unitCode: UNIT_CODE,
    unitTitle: UNIT_TITLE,
    displayName,
    supportClass: "B",
    canonicalSkillTag,
    subskillTags: Object.freeze([...subskillTags]),
    difficultyTags: Object.freeze(["g4b_u01", "multi_digit", "horizontal_only"]),
    representationTags: Object.freeze(["numeric_expression", "horizontal_expression"]),
    patternGroupIds: Object.freeze(groups.map((group) => group.patternGroupId)),
    patternSpecIds: Object.freeze([...new Set(groups.flatMap((group) => group.patternSpecIds))]),
    qaStatusLabel: "blocking_validator_accepted",
    promotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  });
}

const visibleKnowledgePoints = Object.freeze(kpRows.map(toKnowledgePoint));
const knowledgePointById = new Map(visibleKnowledgePoints.map((row) => [row.knowledgePointId, row]));

function availabilityBySource() {
  const entries = new Map(Object.entries(base.BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
  const current = entries.get(SOURCE_ID) ?? {
    sourceId: SOURCE_ID,
    visibleCount: 0,
    hiddenPendingCount: 0,
    notSelectableCount: 0,
  };
  entries.set(SOURCE_ID, {
    ...current,
    visibleCount: current.visibleCount + visibleKnowledgePoints.length,
  });
  return Object.fromEntries(entries);
}

function duplicates(values) {
  const seen = new Set();
  const repeated = new Set();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function sameMembers(left, right) {
  return left.length === right.length
    && JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export const G4B_U01_VISIBLE_SELECTOR_PROJECTION = Object.freeze({
  task: "S59F_G4B_U01_PromotionLifecycleAndVisibleSelectorProjection",
  sourceId: SOURCE_ID,
  promotionRegistryId: G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID,
  status: "selector_projected_resolver_not_integrated",
  visibleKnowledgePointCount: visibleKnowledgePoints.length,
  visibleHorizontalGroupCount: visibleGroups.length,
  visibleApplicationGroupCount: 0,
  visiblePatternGroupCount: visibleGroups.length,
  promotedPatternSpecCount: G4B_U01_PROMOTED_PATTERN_SPEC_IDS.length,
  publicProjectionChanged: true,
  selectorBehaviorChanged: true,
  resolverBehaviorChanged: false,
  productionEligibilityBehaviorChanged: false,
  representationToggleAdded: false,
  requiredNextGate: "S59G_G4B_U01_ResolverBrowserStateAndCanonicalRouterIntegration",
});

export const BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA = base.BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA;
export const BATCH_A_SELECTOR_AVAILABILITY = Object.freeze({
  ...base.BATCH_A_SELECTOR_AVAILABILITY,
  visibleCount: base.BATCH_A_SELECTOR_AVAILABILITY.visibleCount + visibleKnowledgePoints.length,
  notSelectableCount: base.BATCH_A_SELECTOR_AVAILABILITY.notSelectableCount,
  bySourceId: availabilityBySource(),
});

export function listVisibleBatchAKnowledgePoints() {
  return [...base.listVisibleBatchAKnowledgePoints(), ...visibleKnowledgePoints.map(clone)];
}

export function listBatchAKnowledgePointAvailabilityBySource(sourceId) {
  const entry = BATCH_A_SELECTOR_AVAILABILITY.bySourceId[sourceId];
  return entry ? clone(entry) : base.listBatchAKnowledgePointAvailabilityBySource(sourceId);
}

export function getVisibleBatchAKnowledgePoint(knowledgePointId) {
  return knowledgePointById.has(knowledgePointId)
    ? clone(knowledgePointById.get(knowledgePointId))
    : base.getVisibleBatchAKnowledgePoint(knowledgePointId);
}

export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  return groupsByKnowledgePointId.has(knowledgePointId)
    ? clone(groupsByKnowledgePointId.get(knowledgePointId))
    : base.getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
}

export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId) {
  const groups = getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (groups.length > 0) return [...new Set(groups.flatMap((group) => group.patternSpecIds ?? []))];
  return base.resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId);
}

export function validateG4BU01VisibleSelectorProjection() {
  const errors = [];
  const baseKpIds = base.listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId);
  const kpIds = visibleKnowledgePoints.map((row) => row.knowledgePointId);
  const groupIds = visibleGroups.map((row) => row.patternGroupId);
  const specIds = visibleGroups.flatMap((row) => row.patternSpecIds);
  const labels = [...visibleKnowledgePoints, ...visibleGroups].map((row) => row.displayName);
  if (kpIds.length !== 9) errors.push("visible_knowledge_point_count_mismatch");
  if (groupIds.length !== 9) errors.push("visible_pattern_group_count_mismatch");
  if (specIds.length !== 12) errors.push("pattern_spec_count_mismatch");
  if (duplicates(kpIds).length > 0) errors.push("duplicate_g4b_u01_knowledge_point_id");
  if (duplicates(groupIds).length > 0) errors.push("duplicate_g4b_u01_pattern_group_id");
  if (duplicates(specIds).length > 0) errors.push("duplicate_g4b_u01_pattern_spec_membership");
  if (duplicates([...baseKpIds, ...kpIds]).length > 0) errors.push("duplicate_global_knowledge_point_id");
  if (!sameMembers(kpIds, G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS)) errors.push("promoted_knowledge_point_projection_drift");
  if (!sameMembers(groupIds, G4B_U01_PROMOTED_PATTERN_GROUP_IDS)) errors.push("promoted_pattern_group_projection_drift");
  if (!sameMembers(specIds, G4B_U01_PROMOTED_PATTERN_SPEC_IDS)) errors.push("promoted_pattern_spec_projection_drift");
  if (labels.some((label) => /(?:kp_|pg_|ps_)/.test(label))) errors.push("internal_id_leaked_to_display_name");
  if (visibleKnowledgePoints.some((row) => row.sourceId !== SOURCE_ID)) errors.push("knowledge_point_source_mismatch");
  if (visibleKnowledgePoints.some((row) => row.patternGroupIds.length !== 1)) errors.push("representation_toggle_or_multi_group_added");
  if (visibleKnowledgePoints.some((row) => row.representationTags.includes("word_problem"))) errors.push("application_mode_added");
  if (visibleGroups.some((row) => row.visibilityStatus !== "visible" || row.representationTag !== "numeric_expression")) errors.push("group_visibility_or_representation_mismatch");
  if (visibleGroups.some((row) => row.promotionRegistryId !== G4B_U01_HORIZONTAL_PROMOTION_REGISTRY_ID)) errors.push("promotion_registry_reference_mismatch");
  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    counts: Object.freeze({
      visibleKnowledgePoints: kpIds.length,
      visibleHorizontalGroups: groupIds.length,
      visibleApplicationGroups: 0,
      visiblePatternGroups: groupIds.length,
      patternSpecs: specIds.length,
    }),
  });
}
