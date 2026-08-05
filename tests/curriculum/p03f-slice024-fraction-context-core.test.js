import test from "node:test";
import assert from "node:assert/strict";
import {
  G3B_U07_P03F24_KP_IDS,
  G3B_U07_P03F24_PATTERN_SPEC_IDS,
  G3B_U07_P03F24_NUMERIC_SPEC_IDS,
  G3B_U07_P03F24_APPLICATION_SPEC_IDS,
  auditG3BU07P03F24SelectorProjection,
} from "../../site/modules/curriculum/registry/g3b-u07-fraction-context-selector-projection-p03f24.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
  auditP03F24PublicSelectorComposition,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f24-extension.js";
import { BATCH_A_SELECTOR_AVAILABILITY as P03F23_AVAILABILITY } from "../../site/modules/curriculum/registry/batch-a-selector-p03f23-extension.js";
import { validateP03F24PatternDefinitions } from "../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f24-extension.js";
import { buildBatchABrowserPlan } from "../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f24.js";
import { generateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f24.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f24.js";
import { P03F24_APPLICATION_AUTHORITY } from "../../site/modules/curriculum/batch-a/fraction-context-runtime-p03f24.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f24-extension.js";

const SOURCE = "g3b_u07_3b07";

test("Slice024 authority is exactly 4 KP / 8 groups / 20 specs with 10+10 mode parity", () => {
  assert.deepEqual(auditG3BU07P03F24SelectorProjection(), {
    ok: true,
    errors: [],
    counts: { knowledgePoints: 4, patternGroups: 8, patternSpecs: 20, numeric: 10, application: 10 },
  });
  assert.equal(G3B_U07_P03F24_KP_IDS.length, 4);
  assert.equal(G3B_U07_P03F24_PATTERN_SPEC_IDS.length, 20);
  assert.equal(G3B_U07_P03F24_NUMERIC_SPEC_IDS.length, 10);
  assert.equal(G3B_U07_P03F24_APPLICATION_SPEC_IDS.length, 10);
  assert.equal(new Set(G3B_U07_P03F24_PATTERN_SPEC_IDS).size, 20);
  assert.equal(validateP03F24PatternDefinitions().ok, true);
});

test("Slice024 expands existing G3B-U07 to 8 visible / 0 hidden without adding a source", () => {
  const audit = auditP03F24PublicSelectorComposition();
  assert.equal(audit.ok, true, JSON.stringify(audit.errors));
  const availability = listBatchAKnowledgePointAvailabilityBySource(SOURCE);
  assert.equal(availability.visibleCount, 8);
  assert.equal(availability.hiddenPendingCount, 0);
  assert.equal(listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === SOURCE).length, 8);
  assert.equal(BATCH_A_SELECTOR_AVAILABILITY.publicSourceCount, P03F23_AVAILABILITY.publicSourceCount);
});

test("all 20 existing hidden PatternSpec identities generate and validate through Slice024", () => {
  for (const patternSpecId of G3B_U07_P03F24_PATTERN_SPEC_IDS) {
    const result = generateBatchABrowserQuestions({ sourceId: SOURCE, patternSpecIds: [patternSpecId], questionCount: 2, generationSeed: `slice024-${patternSpecId}` });
    assert.equal(result.ok, true, `${patternSpecId}:${JSON.stringify(result.errors)}`);
    assert.equal(result.questions.length, 2);
    assert.equal(result.questions.every((question) => question.patternSpecId === patternSpecId), true);
    const validation = validateBatchABrowserQuestions(result.questions);
    assert.equal(validation.ok, true, `${patternSpecId}:${JSON.stringify(validation.errors)}`);
  }
});

test("application specs preserve W02 deterministic authority IDs and numeric specs do not leak context", () => {
  for (const patternSpecId of G3B_U07_P03F24_APPLICATION_SPEC_IDS) {
    const result = generateBatchABrowserQuestions({ sourceId: SOURCE, patternSpecIds: [patternSpecId], questionCount: 1, generationSeed: "slice024-app" });
    const question = result.questions[0];
    const authority = P03F24_APPLICATION_AUTHORITY[patternSpecId];
    assert.equal(question.metadata.bindingCandidateId, authority.bindingCandidateId);
    assert.equal(question.metadata.proofCandidateId, authority.proofCandidateId);
    assert.equal(question.metadata.fixtureId, authority.fixtureId);
    assert.equal(question.globalContextProduction.status, "GLOBAL_CONTEXT_BOUND_EXISTING_W02_A06");
    assert.match(question.metadata.productionPackagePath, /POSTG_APP_W02_A06_PRODUCTION_EQUIVALENT_PACKAGE\.json$/);
  }
  for (const patternSpecId of G3B_U07_P03F24_NUMERIC_SPEC_IDS) {
    const result = generateBatchABrowserQuestions({ sourceId: SOURCE, patternSpecIds: [patternSpecId], questionCount: 1, generationSeed: "slice024-num" });
    assert.equal(result.questions[0].globalContextProduction, null);
    assert.equal(result.questions[0].metadata.bindingCandidateId, null);
  }
});

test("selected Slice024 KP plans preserve numeric/application separation", () => {
  const kp = G3B_U07_P03F24_KP_IDS[1];
  const numeric = buildBatchABrowserPlan({ sourceId: SOURCE, selectedKnowledgePointIds: [kp], questionMode: "numeric", questionCount: 6 });
  const application = buildBatchABrowserPlan({ sourceId: SOURCE, selectedKnowledgePointIds: [kp], questionMode: "application", questionCount: 6 });
  assert.equal(numeric.patternSpecIds.length, 3);
  assert.equal(application.patternSpecIds.length, 3);
  assert.equal(numeric.patternSpecIds.every((id) => id.endsWith("_numeric")), true);
  assert.equal(application.patternSpecIds.every((id) => id.endsWith("_application")), true);
  assert.equal(numeric.genericFallbackAllowed, false);
  assert.equal(application.publicControls.globalContextAuthority, "W02_A06_EXISTING_PRODUCTION_EQUIVALENT_LINEAGE");
});

test("Slice024 shared worksheet produces numeric and application printable documents with answer keys", () => {
  const numeric = buildBatchABrowserWorksheetDocument({ sourceId: SOURCE, selectedKnowledgePointIds: [G3B_U07_P03F24_KP_IDS[0]], questionMode: "numeric", questionCount: 8, generationSeed: "slice024-numeric", includeAnswerKey: true });
  assert.equal(numeric.ok, true, JSON.stringify(numeric.errors));
  assert.equal(numeric.worksheetDocument.summary.numericQuestionCount, 8);
  assert.equal(numeric.worksheetDocument.summary.applicationQuestionCount, 0);
  assert.ok(numeric.worksheetDocument.answerKeyItems.length > 0);
  const application = buildBatchABrowserWorksheetDocument({ sourceId: SOURCE, selectedKnowledgePointIds: [G3B_U07_P03F24_KP_IDS[2]], questionMode: "application", questionCount: 8, generationSeed: "slice024-application", includeAnswerKey: true });
  assert.equal(application.ok, true, JSON.stringify(application.errors));
  assert.equal(application.worksheetDocument.summary.numericQuestionCount, 0);
  assert.equal(application.worksheetDocument.summary.applicationQuestionCount, 8);
  assert.ok(application.worksheetDocument.questionPages.length > 0);
  assert.ok(application.worksheetDocument.answerKeyPages.length > 0);
});
