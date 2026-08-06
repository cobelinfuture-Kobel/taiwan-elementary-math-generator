import assert from "node:assert/strict";
import test from "node:test";

import {
  G4A_U06_FRACTION_CLASSIFICATION_KP_ID,
  G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g4a-u06-fraction-type-classification-selector-projection.js";
import {
  G4A_U06_P03F25_KP_ID,
  G4A_U06_P03F25_PATTERN_GROUPS,
  G4A_U06_P03F25_PATTERN_SPEC_IDS,
  G4A_U06_P03F25_REQUIRED_CAPABILITY_IDS,
  auditG4AU06P03F25SelectorProjection,
  getG4AU06P03F25SelectorRow,
  listG4AU06P03F25PatternGroups,
} from "../../site/modules/curriculum/registry/g4a-u06-improper-mixed-conversion-selector-projection-p03f25.js";
import {
  resolveP03F25PatternSpecIdsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/pattern-spec-runtime-p03f25-extension.js";
import {
  generateP03F25PatternSpecItem,
} from "../../site/modules/curriculum/batch-a/pattern-spec-generator-router-p03f25-extension.js";
import {
  validateP03F25PatternSpecItem,
} from "../../site/modules/curriculum/batch-a/pattern-spec-validator-router-p03f25-extension.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f25-extension.js";
import {
  getCurrentPixelRegistrySnapshot,
  listPixelKnowledgePointsForSource,
} from "../../site/pixel/pixel-registry-bridge.js";

const sourceId = G4A_U06_FRACTION_CLASSIFICATION_SOURCE_ID;
const conversionSpecs = Object.freeze([
  "ps_g4a_u06_improper_to_mixed_or_integer",
  "ps_g4a_u06_integer_to_improper_fraction",
  "ps_g4a_u06_mixed_to_improper_fraction",
]);

function makeOptions(overrides = {}) {
  return {
    sourceId,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [G4A_U06_P03F25_KP_ID],
    selectedPatternGroupIds: [G4A_U06_P03F25_PATTERN_GROUPS[0].patternGroupId],
    questionMode: "numeric",
    questionCount: 18,
    includeAnswerKey: true,
    generationSeed: "p03f25-test-seed",
    ordering: "shuffleAcrossPatterns",
    ...overrides,
  };
}

test("P03F25 authority freezes exactly one new G4A-U06 conversion KP", () => {
  assert.deepEqual(G4A_U06_P03F25_REQUIRED_CAPABILITY_IDS, [
    "cap_fraction_domain_validator",
    "cap_fraction_number_system",
  ]);
  assert.deepEqual(G4A_U06_P03F25_PATTERN_SPEC_IDS, conversionSpecs);
  assert.equal(G4A_U06_P03F25_PATTERN_GROUPS.length, 1);
  assert.equal(G4AU06P03F25SelectorProjectionSafe().expectedSourceVisibleCountAfterAdmission, 2);
  assert.equal(G4AU06P03F25SelectorProjectionSafe().expectedSourceHiddenCountAfterAdmission, 4);
  assert.equal(G4AU06P03F25SelectorProjectionSafe().expectedPublicKnowledgePointCountAfterAdmission, 212);
  const audit = auditG4AU06P03F25SelectorProjection();
  assert.equal(audit.ok, true, audit.errors.join("\n"));
});

function G4AU06P03F25SelectorProjectionSafe() {
  const row = getG4AU06P03F25SelectorRow(G4A_U06_P03F25_KP_ID);
  return {
    expectedSourceVisibleCountAfterAdmission: row ? 2 : 0,
    expectedSourceHiddenCountAfterAdmission: row ? 4 : 0,
    expectedPublicKnowledgePointCountAfterAdmission: row ? 212 : 0,
  };
}

test("P03F25 keeps the earlier G4A-U06 fraction-classification identity separate", () => {
  assert.notEqual(G4A_U06_P03F25_KP_ID, G4A_U06_FRACTION_CLASSIFICATION_KP_ID);
  const row = getG4AU06P03F25SelectorRow(G4A_U06_P03F25_KP_ID);
  assert.equal(row.sourceId, sourceId);
  assert.equal(row.visibilityStatus, "visible");
  assert.equal(row.applicationClassification, "APPLICATION_NOT_APPLICABLE");
  assert.equal(row.questionModes.join(","), "numeric");
  assert.equal(listG4AU06P03F25PatternGroups(G4A_U06_P03F25_KP_ID).length, 1);
});

test("P03F25 runtime resolves all three conversion PatternSpecs", () => {
  assert.deepEqual(resolveP03F25PatternSpecIdsForKnowledgePoint(G4A_U06_P03F25_KP_ID), conversionSpecs);
});

test("P03F25 generator and validator admit deterministic witnesses for every conversion PatternSpec", () => {
  for (const [index, patternSpecId] of conversionSpecs.entries()) {
    const item = generateP03F25PatternSpecItem({ patternSpecId, seed: `p03f25-${index}` });
    assert.ok(item, patternSpecId);
    assert.equal(item.patternSpecId, patternSpecId);
    assert.equal(item.knowledgePointId, G4A_U06_P03F25_KP_ID);
    assert.equal(validateP03F25PatternSpecItem(item).ok, true, patternSpecId);
  }
});

test("P03F25 public binding exposes both G4A-U06 KPs while single conversion selection stays bounded", async () => {
  const { resolvePublicUiCapabilityBinding } = await import(`../../site/modules/curriculum/public/public-ui-capability-binding.js?p03f25=${Date.now()}`);
  const sourceUnit = resolvePublicUiCapabilityBinding({ sourceId, selectionMode: "sourceUnit", surfaceId: "CLASSIC" });
  assert.equal(sourceUnit.blocked, false, JSON.stringify(sourceUnit.blockedReasons));
  assert.equal(sourceUnit.selectedKnowledgePointIds.includes(G4A_U06_FRACTION_CLASSIFICATION_KP_ID), true);
  assert.equal(sourceUnit.selectedKnowledgePointIds.includes(G4A_U06_P03F25_KP_ID), true);

  const single = resolvePublicUiCapabilityBinding({
    sourceId,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [G4A_U06_P03F25_KP_ID],
    surfaceId: "CLASSIC",
  });
  assert.equal(single.blocked, false, JSON.stringify(single.blockedReasons));
  assert.deepEqual(single.selectedKnowledgePointIds, [G4A_U06_P03F25_KP_ID]);
  assert.equal(single.compatiblePatternGroupIds.includes(G4A_U06_P03F25_PATTERN_GROUPS[0].patternGroupId), true);
});

test("P03F25 shared worksheet produces printable questions and answer key", () => {
  const result = buildBatchABrowserWorksheetDocument(makeOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.questionCount, 18);
  assert.equal(result.worksheetDocument.questionDisplayModels.length, 18);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 18);
  assert.equal(result.worksheetDocument.summary.applicationQuestionCount, 0);
  assert.equal(result.worksheetDocument.metadata.knowledgePointIds.includes(G4A_U06_P03F25_KP_ID), true);
});

test("P03F25 current Pixel projection preserves two G4A-U06 KPs while current public total advances to 216", () => {
  const rows = listPixelKnowledgePointsForSource(sourceId);
  assert.equal(rows.length, 2);
  assert.equal(rows.some((row) => row.knowledgePointId === G4A_U06_P03F25_KP_ID), true);
  const snapshot = getCurrentPixelRegistrySnapshot();
  assert.equal(snapshot.sourceCount, 29);
  assert.equal(snapshot.visibleKnowledgePointCount, 216);
  assert.equal(snapshot.bySourceId[sourceId].visibleKnowledgePoints.length, 2);
});
