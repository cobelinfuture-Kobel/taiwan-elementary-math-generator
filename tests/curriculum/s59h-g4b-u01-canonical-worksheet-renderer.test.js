import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { buildBatchABrowserPlan } from '../../site/modules/curriculum/batch-a/batch-a-browser-generator.js';
import {
  G4B_U01_CANONICAL_WORKSHEET_INTEGRATION,
  buildBatchABrowserWorksheetDocument,
  isS59HG4BU01CanonicalWorksheetOptions,
} from '../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s59h-extension.js';
import {
  G4B_U01_CANONICAL_VALIDATOR_INTEGRATION,
  validateBatchABrowserQuestion,
  validateBatchABrowserQuestions,
} from '../../site/modules/curriculum/batch-a/batch-a-browser-validator-s59h-extension.js';
import {
  G4B_U01_PRODUCTION_WORKSHEET_ELIGIBILITY,
  validateG4BU01ProductionWorksheetEligibility,
} from '../../site/modules/curriculum/batch-a/g4b-u01-production-eligibility.js';
import {
  G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE,
  G4B_U01_PRODUCTION_PROMOTION_ACTIVATION,
  G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE,
  G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID,
  getG4BU01ProductionPromotionProjection,
  validateG4BU01ProductionPromotionProjection,
} from '../../site/modules/curriculum/registry/g4b-u01-horizontal-production-promotion.js';
import {
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
} from '../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js';
import {
  G4B_U01_CANONICAL_RENDERER_INTEGRATION,
  renderWorksheetDocumentToHtml,
} from '../../site/modules/renderer/html-renderer-s59h-extension.js';
import { BATCH_A_RESOLVER_SELECTION_MODES } from '../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js';

const SOURCE_ID = 'g4b_u01_4b01';
const overlay = JSON.parse(readFileSync(
  new URL('../../data/curriculum/registry/promotions/S59H_G4B_U01_CanonicalWorksheetPromotionRegistry.json', import.meta.url),
  'utf8',
));

function allOptions(overrides = {}) {
  return {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: [...G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4B_U01_PROMOTED_PATTERN_GROUP_IDS],
    questionCount: 72,
    ordering: 'groupedByPattern',
    includeAnswerKey: true,
    generationSeed: 's59h-all-horizontal',
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true },
    ...overrides,
  };
}

test('S59H promotion authority and runtime projection have exact lifecycle parity', () => {
  const projection = getG4BU01ProductionPromotionProjection();
  assert.equal(overlay.promotionRegistryId, G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID);
  assert.equal(projection.promotionRegistryId, overlay.promotionRegistryId);
  assert.equal(projection.basePromotionRegistryId, overlay.basePromotionRegistryId);
  assert.deepEqual(projection.knowledgePointIds, G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS);
  assert.deepEqual(projection.patternGroupIds, G4B_U01_PROMOTED_PATTERN_GROUP_IDS);
  assert.deepEqual(projection.patternSpecIds, G4B_U01_PROMOTED_PATTERN_SPEC_IDS);
  assert.deepEqual(projection.lifecycle, overlay.lifecycle);
  assert.deepEqual(projection.activation, overlay.activation);
  assert.deepEqual(projection.rendererProfile, overlay.rendererProfile);
  assert.equal(validateG4BU01ProductionPromotionProjection().ok, true);
  assert.equal(G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.validatorStatus, 'blocking_validator_required');
  assert.equal(G4B_U01_PRODUCTION_PROMOTION_LIFECYCLE.worksheetStatus, 'production_eligible');
  assert.equal(G4B_U01_PRODUCTION_PROMOTION_ACTIVATION.publicPrintControlBehaviorChanged, false);
});

test('S59H integration locks 3x8 question and 3x10 answer horizontal profile', () => {
  assert.equal(G4B_U01_CANONICAL_VALIDATOR_INTEGRATION.blockingCodeCount, 24);
  assert.equal(G4B_U01_CANONICAL_VALIDATOR_INTEGRATION.lifecycleValidationRequired, true);
  assert.equal(G4B_U01_CANONICAL_WORKSHEET_INTEGRATION.rendererProfileId, 'g4b_u01_horizontal_numeric_v1');
  assert.equal(G4B_U01_CANONICAL_WORKSHEET_INTEGRATION.horizontalOnly, true);
  assert.equal(G4B_U01_CANONICAL_RENDERER_INTEGRATION.noWrapExpression, true);
  assert.deepEqual(G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.questionSheet, {
    paperSize: 'A4', columns: 3, rowsPerPage: 8, noWrapExpression: true, avoidSplit: true,
  });
  assert.deepEqual(G4B_U01_HORIZONTAL_NUMERIC_RENDERER_PROFILE.answerKey, {
    paperSize: 'A4', columns: 3, rowsPerPage: 10, noWrapExpression: true, avoidSplit: true,
  });
  assert.equal(G4B_U01_PRODUCTION_WORKSHEET_ELIGIBILITY.questionCountMax, 200);
});

test('S59H builds a 72-question production worksheet reaching all 12 PatternSpecs', () => {
  assert.equal(isS59HG4BU01CanonicalWorksheetOptions(allOptions()), true);
  const result = buildBatchABrowserWorksheetDocument(allOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.schemaVersion, 'worksheet-document-v1');
  assert.equal(document.visibilityStatus, 'visible');
  assert.equal(document.productionUse, 'allowed');
  assert.equal(document.promotionRegistryId, G4B_U01_PRODUCTION_PROMOTION_OVERLAY_ID);
  assert.equal(document.rendererProfile.profileId, 'g4b_u01_horizontal_numeric_v1');
  assert.equal(document.productionEligibility.ok, true);
  assert.equal(document.generatedQuestions.length, 72);
  assert.equal(document.summary.questionCount, 72);
  assert.equal(document.summary.numericQuestionCount, 72);
  assert.equal(document.summary.applicationQuestionCount, 0);
  assert.equal(document.numericSummary.knowledgePointCount, 9);
  assert.equal(document.numericSummary.patternSpecCount, 12);
  assert.deepEqual(
    new Set(document.generatedQuestions.map((question) => question.patternSpecId)),
    new Set(G4B_U01_PROMOTED_PATTERN_SPEC_IDS),
  );
  assert.ok(document.generatedQuestions.every((question) => question.phase === 'S59H'));
  assert.ok(document.generatedQuestions.every((question) => question.productionUse === 'allowed'));
  assert.ok(document.generatedQuestions.every((question) => question.representation === 'horizontal_only'));
  assert.ok(document.generatedQuestions.every((question) => question.applicationText === false));
});

test('S59H pagination and surface models preserve horizontal equations and answers', () => {
  const result = buildBatchABrowserWorksheetDocument(allOptions());
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.printOptions.columns, 3);
  assert.equal(document.printOptions.rowsPerPage, 8);
  assert.equal(document.printOptions.answerKeyColumns, 3);
  assert.equal(document.printOptions.answerKeyRowsPerPage, 10);
  assert.equal(document.printOptions.pageBreakMode, 'avoidLongTextCards');
  assert.equal(document.printOptions.noWrapExpression, true);
  assert.equal(document.questionPages.length, 3);
  assert.equal(document.answerKeyPages.length, 3);
  assert.equal(document.questionDisplayModels.length, 72);
  assert.equal(document.answerKeyItems.length, 72);
  for (const [index, display] of document.questionDisplayModels.entries()) {
    const question = document.generatedQuestions[index];
    const answer = document.answerKeyItems[index];
    assert.equal(display.blankedDisplayText, question.blankedDisplayText);
    assert.equal(display.equationModel, question.equationModel);
    assert.equal(display.answerText, question.answerText);
    assert.equal(display.layoutHints.noWrapExpression, true);
    assert.equal(display.layoutHints.avoidPageBreakInside, true);
    assert.equal(answer.answerText, question.answerText);
    assert.equal(answer.equationText, question.equationModel);
    assert.equal(answer.layoutHints.noWrapExpression, true);
  }
});

test('S59H production validator blocks lifecycle and representation mutation', () => {
  const result = buildBatchABrowserWorksheetDocument(allOptions({ questionCount: 12 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const accepted = result.worksheetDocument.generatedQuestions[0];
  assert.equal(validateBatchABrowserQuestion(accepted).ok, true);
  const mutated = structuredClone(accepted);
  mutated.productionUse = 'forbidden';
  mutated.productionWorksheetStatus = 'canonical_runtime';
  mutated.representation = 'vertical';
  const rejected = validateBatchABrowserQuestion(mutated);
  assert.equal(rejected.ok, false);
  assert.ok(rejected.errors.some((entry) => entry.code === 'G4B_U01_CANONICAL_QUESTION_PRODUCTION_USE_INVALID'));
  assert.ok(rejected.errors.some((entry) => entry.code === 'G4B_U01_CANONICAL_QUESTION_RUNTIME_STATUS_INVALID'));
  assert.ok(rejected.errors.some((entry) => entry.code === 'G4B_U01_CANONICAL_QUESTION_REPRESENTATION_INVALID'));
  const batch = validateBatchABrowserQuestions([accepted, mutated]);
  assert.equal(batch.ok, false);
  assert.ok(batch.errors.some((entry) => entry.path.startsWith('questions[1].')));
});

test('S59H eligibility enforces public count and mode boundaries', () => {
  const eligible = validateG4BU01ProductionWorksheetEligibility(buildBatchABrowserPlan(allOptions({ questionCount: 24 })));
  assert.equal(eligible.ok, true, JSON.stringify(eligible.errors));
  const hidden = buildBatchABrowserPlan(allOptions({ questionCount: 24 }));
  hidden.hiddenMode = true;
  assert.ok(validateG4BU01ProductionWorksheetEligibility(hidden).errors.some((entry) => entry.code === 'G4B_U01_PRODUCTION_MODE_FLAG_FORBIDDEN'));
  const overLimit = buildBatchABrowserWorksheetDocument(allOptions({ questionCount: 201 }));
  assert.equal(overLimit.ok, false);
  assert.equal(overLimit.worksheetDocument, null);
  assert.ok(overLimit.errors.some((entry) => entry.code === 'G4B_U01_PRODUCTION_QUESTION_COUNT_INVALID'));
});

test('S59H answer-key suppression keeps question pages and removes answer surfaces', () => {
  const result = buildBatchABrowserWorksheetDocument(allOptions({
    questionCount: 16,
    includeAnswerKey: false,
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: false },
  }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 16);
  assert.equal(document.answerKeyItems.length, 0);
  assert.equal(document.answerKeyPages.length, 0);
  assert.equal(document.printOptions.showAnswerKey, false);
  assert.equal(document.printOptions.answerKeyPlacement, 'none');
});

test('S59H renderer applies no-wrap horizontal profile without leaking internal IDs', () => {
  const result = buildBatchABrowserWorksheetDocument(allOptions({ questionCount: 24, generationSeed: 's59h-renderer' }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  const html = renderWorksheetDocumentToHtml(document, {
    title: document.title,
    stylesheetHref: '',
    debugDataAttributes: false,
  });
  assert.ok(html.includes('worksheet-renderer--g4b-u01-horizontal'));
  assert.ok(html.includes('data-renderer-profile="g4b_u01_horizontal_numeric_v1"'));
  assert.ok(html.includes('white-space: nowrap'));
  assert.ok(html.includes(document.questionDisplayModels[0].blankedDisplayText));
  assert.ok(html.includes(document.answerKeyItems[0].answerText));
  assert.doesNotMatch(html, /(?:kp_g4b_u01_|pg_g4b_u01_|ps_g4b_u01_)/);
});
