import {
  listPublicPatternGroupChoices,
  normalizePublicPatternGroupSelection,
} from "../../site/assets/browser/state/public-pattern-group-selection.js";
import {
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f30.js";
import {
  buildBatchABrowserPlan,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f30.js";

const g4bInput = {
  sourceId: "g4b_u04_4b04",
  selectionMode: "mixedKnowledgePointsSameUnit",
  selectedKnowledgePointIds: [
    "kp_g4b_u04_inverse_rounding_unknown_digit",
    "kp_g4b_u04_inverse_rounding_possible_original",
  ],
  selectedPatternGroupIds: [
    "pg_g4b_u04_inverse_digit_set",
    "pg_g4b_u04_inverse_original_values",
  ],
  requestedQuestionType: "numeric",
  questionMode: "numeric",
  questionCount: 12,
  generationSeed: "g4b-u04-r4-public-ui",
};

const g4bChoices = listPublicPatternGroupChoices(g4bInput.selectedKnowledgePointIds);
const g4bNormalized = normalizePublicPatternGroupSelection(g4bInput);
const g4bBinding = resolvePublicUiCapabilityBinding(g4bInput);
const g4bPlan = buildBatchABrowserPlan(g4bInput);

console.log(`P03F30_DIAG_G4B_CHOICES=${JSON.stringify(g4bChoices.map((row) => ({ knowledgePointId: row.knowledgePointId, patternGroupId: row.patternGroupId, patternSpecIds: row.patternSpecIds })))}`);
console.log(`P03F30_DIAG_G4B_NORMALIZED=${JSON.stringify(g4bNormalized)}`);
console.log(`P03F30_DIAG_G4B_BINDING=${JSON.stringify({ blocked: g4bBinding.blocked, blockedReasons: g4bBinding.blockedReasons, selectedKnowledgePointIds: g4bBinding.selectedKnowledgePointIds, compatiblePatternGroupIds: g4bBinding.compatiblePatternGroupIds, selectedCompatiblePatternGroupIds: g4bBinding.selectedCompatiblePatternGroupIds, questionType: g4bBinding.questionType })}`);
console.log(`P03F30_DIAG_G4B_PLAN=${JSON.stringify({ sourceId: g4bPlan.sourceId, patternSpecIds: g4bPlan.patternSpecIds, requestedKnowledgePointIds: g4bPlan.requestedKnowledgePointIds, requestedPatternGroupIds: g4bPlan.requestedPatternGroupIds, errors: g4bPlan.errors })}`);

const g5aU04Input = {
  sourceId: "g5a_u04_5a04",
  selectionMode: "singleKnowledgePoint",
  selectedKnowledgePointIds: ["kp_g5a_u04_unlike_fraction_compare"],
  requestedQuestionType: "numeric",
};
const g5aU04Choices = listPublicPatternGroupChoices(g5aU04Input.selectedKnowledgePointIds);
const g5aU04Binding = resolvePublicUiCapabilityBinding(g5aU04Input);
console.log(`P03F30_DIAG_G5AU04_CHOICES=${JSON.stringify(g5aU04Choices.map((row) => ({ knowledgePointId: row.knowledgePointId, patternGroupId: row.patternGroupId, patternSpecIds: row.patternSpecIds })))}`);
console.log(`P03F30_DIAG_G5AU04_BINDING=${JSON.stringify({ blocked: g5aU04Binding.blocked, blockedReasons: g5aU04Binding.blockedReasons, selectedKnowledgePointIds: g5aU04Binding.selectedKnowledgePointIds, compatiblePatternGroupIds: g5aU04Binding.compatiblePatternGroupIds, selectedCompatiblePatternGroupIds: g5aU04Binding.selectedCompatiblePatternGroupIds, questionType: g5aU04Binding.questionType })}`);
