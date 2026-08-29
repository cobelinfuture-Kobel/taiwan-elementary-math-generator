import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { auditP04F27PublicSelectorComposition, listBatchAKnowledgePointAvailabilityBySource } from "../../site/modules/curriculum/registry/batch-a-selector-p04f27-extension.js";
import { G4A_U06_P04F27_KP_ID, G4A_U06_P04F27_HISTORICAL_ALIAS_ID, G4A_U06_P04F27_GROUP_ID, G4A_U06_P04F27_SPEC_ID } from "../../site/modules/curriculum/registry/g4a-u06-fraction-times-integer-quantity-selector-projection-p04f27.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p04f27.js";
import { generateG4AU06P04F27FractionTimesIntegerQuantityQuestions, validateG4AU06P04F27Question } from "../../site/modules/curriculum/batch-a/fraction-times-integer-quantity-runtime-p04f27.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { resolvePublicUiCapabilityBinding } from "../../site/modules/curriculum/public/public-ui-capability-binding-p04f27.js";
import { getCurrentPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";
const authority = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/full-product/p04f/slice027-g4a-u06-fraction-times-integer-quantity-authority.json", import.meta.url), "utf8"));
const overrides = JSON.parse(fs.readFileSync(new URL("../../data/curriculum/full-product/p02e/quantity-semantic-role-overrides.json", import.meta.url), "utf8"));
const q027 = (count = 24) => ({ sourceId: "g4a_u06_4a06", selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [G4A_U06_P04F27_KP_ID], selectedPatternGroupIds: [G4A_U06_P04F27_GROUP_ID], patternSpecIds: [G4A_U06_P04F27_SPEC_ID], questionMode: "application", questionCount: count, generationSeed: "p04f27-focused", includeAnswerKey: true, printLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true } });

test("P04F27 authority locks frozen q027, page-3 witness, exact P02E mapping, and q028 untouched", () => {
  assert.equal(authority.queue.sliceId, "p04e_q027_r6_g4a_u06_4a06_profile_quantity_measurement_c1");
  assert.deepEqual(authority.source.primaryWitnessPages, [3]);
  assert.equal(authority.knowledgePoints[0].knowledgePointId, G4A_U06_P04F27_KP_ID);
  assert.equal(authority.knowledgePoints[0].historicalHiddenAliasId, G4A_U06_P04F27_HISTORICAL_ALIAS_ID);
  assert.equal(authority.formalMapping.relationFamilyId, "FRACTIONAL_QUANTITY_SCALING");
  assert.deepEqual(authority.formalMapping.knownRoleIds, ["BASE_FRACTIONAL_QUANTITY", "INTEGER_MULTIPLIER"]);
  assert.equal(authority.formalMapping.targetRoleId, "SCALED_QUANTITY");
  const exact = overrides.bindings.find((row) => row.knowledgePointId === G4A_U06_P04F27_KP_ID);
  assert.equal(exact.relationFamilyId, authority.formalMapping.relationFamilyId);
  assert.equal(authority.implementationBoundary.q028Touched, false);
});

test("P04F27 selector reconciles hidden alias and reaches 42 / 297, G4A-U06 6/0/0", () => {
  const audit = auditP04F27PublicSelectorComposition();
  const availability = listBatchAKnowledgePointAvailabilityBySource("g4a_u06_4a06");
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  assert.equal(audit.counts.sources, 42);
  assert.equal(audit.counts.knowledgePoints, 297);
  assert.equal(availability.visibleCount, 6);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(availability.notSelectableCount, 0);
  assert.equal(availability.visibleKnowledgePointIds.includes(G4A_U06_P04F27_KP_ID), true);
  assert.equal(availability.hiddenPendingKnowledgePointIds.includes(G4A_U06_P04F27_HISTORICAL_ALIAS_ID), false);
});

test("P04F27 generates 24 unique exact rational quantity applications balanced 12/12", () => {
  const plan = buildBatchABrowserPlan(q027());
  const result = generateG4AU06P04F27FractionTimesIntegerQuantityQuestions({ ...q027(), plan });
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.questions.length, 24);
  assert.equal(new Set(result.questions.map((question) => question.blankedDisplayText)).size, 24);
  const counts = Object.fromEntries(["PROPER_FRACTION_LENGTH_TIMES_INTEGER", "MIXED_NUMBER_MASS_TIMES_INTEGER"].map((family) => [family, result.questions.filter((question) => question.metadata.presentationFamilyId === family).length]));
  assert.deepEqual(counts, { PROPER_FRACTION_LENGTH_TIMES_INTEGER: 12, MIXED_NUMBER_MASS_TIMES_INTEGER: 12 });
  for (const question of result.questions) {
    assert.equal(question.metadata.productNumerator, question.metadata.baseImproperNumerator * question.metadata.integerMultiplier);
    assert.equal(question.metadata.productDenominator, question.metadata.baseDenominator);
    assert.equal(question.metadata.exactRationalArithmetic, true);
    assert.equal(question.metadata.roundingUsed, false);
    assert.equal(question.metadata.parallelFractionEngine, false);
    assert.equal(question.metadata.q028Touched, false);
    assert.equal(validateG4AU06P04F27Question(question).ok, true);
  }
});

test("P04F27 shared worksheet is 24Q/24A, 3+3 pages, and reuses fraction renderer", () => {
  const result = buildBatchABrowserWorksheetDocument(q027());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 24);
  assert.equal(document.answerKeyItems.length, 24);
  assert.equal(document.questionPages.length, 3);
  assert.equal(document.answerKeyPages.length, 3);
  assert.equal(document.metadata.worksheetAdapter.sharedFractionArithmetic, true);
  assert.equal(document.metadata.worksheetAdapter.sharedPagination, true);
  assert.equal(document.metadata.worksheetAdapter.sharedRenderer, true);
  assert.equal(document.metadata.worksheetAdapter.parallelFractionEngine, false);
  assert.equal(document.questionDisplayModels.every((model) => model.promptInlineMath != null), true);
});

test("P04F27 preserves existing G4A-U06 sourceUnit route instead of mixing application q027", () => {
  const sourceUnit = buildBatchABrowserPlan({ sourceId: "g4a_u06_4a06", selectionMode: "sourceUnit", questionCount: 20, generationSeed: "p04f27-sourceunit" });
  assert.equal(sourceUnit.patternSpecIds.includes(G4A_U06_P04F27_SPEC_ID), false);
  assert.equal((sourceUnit.selectedKnowledgePointIds ?? []).includes(G4A_U06_P04F27_KP_ID), false);
  assert.equal((sourceUnit.selectedKnowledgePointIds ?? []).includes(G4A_U06_P04F27_HISTORICAL_ALIAS_ID), false);
});

test("P04F27 public UI exposes q027 single-KP application at max 24", () => {
  const binding = resolvePublicUiCapabilityBinding({ sourceId: "g4a_u06_4a06", surfaceId: "classic", selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [G4A_U06_P04F27_KP_ID] });
  assert.equal(binding.blocked, false);
  assert.equal(binding.questionType, "application");
  assert.deepEqual(binding.selectedKnowledgePointIds, [G4A_U06_P04F27_KP_ID]);
  assert.equal(binding.compatiblePatternGroupIds.length, 1);
  assert.equal(binding.questionCount.max, 24);
});

test("P04F27 Pixel current projection is 42 / 297 and G4A-U06 contains frozen q027 id", () => {
  const registry = getCurrentPixelRegistrySnapshot();
  const source = registry.bySourceId["g4a_u06_4a06"];
  assert.equal(registry.sourceCount, 42);
  assert.equal(registry.visibleKnowledgePointCount, 297);
  assert.equal(source.visibleKnowledgePoints.length, 6);
  assert.equal(source.visibleKnowledgePoints.some((row) => row.knowledgePointId === G4A_U06_P04F27_KP_ID), true);
});
