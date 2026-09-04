export * from "./batch-a-selector-p01e-extension.js";

import * as historical from "./batch-a-selector-p01e-extension.js";
import * as current from "./batch-a-selector-p04f33-extension.js";

// Earlier inventory milestones run in Node and retain the exact P01E selector snapshot.
// The actual Classic browser consumes the bounded P04F33 successor without mutating those histories.
const currentBrowserSelectorActive = () => typeof document !== "undefined";

const P1_01_TENS_MULTIPLICATION_KP_ID = "kp_g3a_u03_10_multiple_by_1digit";
const P1_01_C0_PATTERN_ID = "ps_g3a_u03_10_multiple_by_1digit";
export const P1_01_TENS_MULTIPLICATION_DIVERSITY_PATTERN_IDS = Object.freeze([
  "ps_g3a_u03_10_multiple_base_fact_scale",
  "ps_g3a_u03_10_multiple_number_of_tens",
  "ps_g3a_u03_10_multiple_decomposition",
  "ps_g3a_u03_10_multiple_missing_digit",
  "ps_g3a_u03_10_multiple_misconception_diagnosis",
]);

function selectorAuthority() {
  return currentBrowserSelectorActive() ? current : historical;
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function augmentP101TensMultiplicationGroups(groups = []) {
  let augmented = false;
  const nextGroups = groups.map((group) => {
    const patternSpecIds = Array.isArray(group?.patternSpecIds) ? group.patternSpecIds : [];
    if (!patternSpecIds.includes(P1_01_C0_PATTERN_ID)) return group;
    augmented = true;
    return {
      ...group,
      patternSpecIds: [...new Set([...patternSpecIds, ...P1_01_TENS_MULTIPLICATION_DIVERSITY_PATTERN_IDS])],
      allocationPolicy: "balanced_by_pattern_spec",
      diversityExpansionId: "path1_p1_01_tens_multiplication_c1_c5",
    };
  });
  return augmented ? nextGroups : groups;
}

export const BATCH_A_SELECTOR_AVAILABILITY = currentBrowserSelectorActive()
  ? current.BATCH_A_SELECTOR_AVAILABILITY
  : historical.BATCH_A_SELECTOR_AVAILABILITY;
export function listVisibleBatchAKnowledgePoints() { return selectorAuthority().listVisibleBatchAKnowledgePoints(); }
export function listBatchAKnowledgePointAvailabilityBySource(sourceId) { return selectorAuthority().listBatchAKnowledgePointAvailabilityBySource(sourceId); }
export function getVisibleBatchAKnowledgePoint(knowledgePointId) { return selectorAuthority().getVisibleBatchAKnowledgePoint(knowledgePointId); }
export function getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) {
  const groups = selectorAuthority().getVisiblePatternGroupsForKnowledgePoint(knowledgePointId);
  if (knowledgePointId !== P1_01_TENS_MULTIPLICATION_KP_ID) return groups;
  return clone(augmentP101TensMultiplicationGroups(groups));
}
export function resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode = null) {
  const baseIds = selectorAuthority().resolveVisiblePatternSpecIdsForKnowledgePoint(knowledgePointId, mode);
  if (knowledgePointId !== P1_01_TENS_MULTIPLICATION_KP_ID || !baseIds.includes(P1_01_C0_PATTERN_ID)) return baseIds;
  return [...new Set([...baseIds, ...P1_01_TENS_MULTIPLICATION_DIVERSITY_PATTERN_IDS])];
}
export {
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01D2_BASE_SELECTOR_COMPOSER_METADATA,
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01D3_BASE_SELECTOR_COMPOSER_METADATA,
  BATCH_A_KNOWLEDGE_POINT_REGISTRY_METADATA as P01E_BASE_SELECTOR_COMPOSER_METADATA,
} from "./batch-a-selector-composer.js";
