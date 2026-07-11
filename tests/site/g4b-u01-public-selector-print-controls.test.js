import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  G4B_U01_PUBLIC_SELECTOR_PRINT_QA,
  validateG4BU01PublicSelectorPrintQAContract,
} from '../../site/modules/curriculum/batch-a/g4b-u01-public-selector-print-qa.js';
import {
  G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U01_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U01_PROMOTED_PATTERN_SPEC_IDS,
} from '../../site/modules/curriculum/registry/g4b-u01-horizontal-promotion.js';
import {
  createConfigState,
  getBatchAWorksheetPlan,
  setBatchAIncludeAnswerKey,
  setBatchAOrdering,
  setBatchAQuestionCount,
  setBatchASelectionMode,
  setBatchASourceId,
  setSelectedKnowledgePointIds,
  setSelectedPatternGroupIds,
  storeWorksheetResult,
} from '../../site/assets/browser/state/config-state.js';
import {
  parseQueryState,
  serializeQueryState,
} from '../../site/assets/browser/state/query-state.js';
import {
  getPublicErrorMessage,
  formatPublicErrorSummary,
} from '../../site/assets/browser/state/public-ui-messages.js';
import { buildWorksheetDocumentFromState } from '../../site/assets/browser/pipeline/build-worksheet-document.js';
import { renderWorksheetDocumentToHtml } from '../../site/modules/renderer/html-renderer-s59h-extension.js';
import { PixelState } from '../../site/assets/browser/pixel/pixel-state.js';
import { PixelWorksheetController } from '../../site/assets/browser/pixel/pixel-worksheet-controller.js';
import { BATCH_A_RESOLVER_SELECTION_MODES } from '../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js';

const SOURCE_ID = 'g4b_u01_4b01';
const KP_IDS = [...G4B_U01_PROMOTED_KNOWLEDGE_POINT_IDS];
const GROUP_IDS = [...G4B_U01_PROMOTED_PATTERN_GROUP_IDS];
const SPEC_IDS = [...G4B_U01_PROMOTED_PATTERN_SPEC_IDS];

function read(relativePath) {
  return readFileSync(new URL(`../../${relativePath}`, import.meta.url), 'utf8');
}

function classicState(overrides = {}) {
  const state = createConfigState();
  setBatchASourceId(state, SOURCE_ID);
  setBatchASelectionMode(state, BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  setSelectedKnowledgePointIds(state, KP_IDS);
  setSelectedPatternGroupIds(state, GROUP_IDS);
  setBatchAQuestionCount(state, overrides.questionCount ?? 72);
  setBatchAOrdering(state, overrides.ordering ?? 'groupedByPattern');
  setBatchAIncludeAnswerKey(state, overrides.includeAnswerKey ?? true);
  return state;
}

function configurePixelState(overrides = {}) {
  const state = new PixelState();
  state.setSourceId(SOURCE_ID);
  state.setSelectionMode(BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  state.setSelectedKnowledgePointIds(KP_IDS);
  state.setSelectedPatternGroupIds(GROUP_IDS);
  state.setQuestionCount(overrides.questionCount ?? 72);
  state.setOrdering(overrides.ordering ?? 'groupedByPattern');
  state.setIncludeAnswerKey(overrides.includeAnswerKey ?? true);
  return state;
}

test('S59I public selector/print QA contract accepts exactly 9 KPs, 9 groups and 12 PatternSpecs', () => {
  const result = validateG4BU01PublicSelectorPrintQAContract();
  assert.equal(result.ok, true, result.errors.join(', '));
  assert.deepEqual(result.counts, {
    visibleKnowledgePoints: 9,
    visiblePatternGroups: 9,
    promotedPatternSpecs: 12,
    publicApplicationGroups: 0,
  });
  assert.deepEqual(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.surfaces, ['classic', 'fallback404', 'pixel']);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.horizontalOnly, true);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.representationToggleAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.verticalRepresentationAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.publicHiddenModeFlagAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.publicQuestionCountMax, 200);
});

test('S59I Classic query state preserves valid G4B-U01 public selection exactly', () => {
  const queryState = {
    presetId: 'batch-a-balanced',
    sourceId: SOURCE_ID,
    questionCount: 72,
    ordering: 'shuffleAcrossPatterns',
    includeAnswerKey: false,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: KP_IDS,
    selectedPatternGroupIds: GROUP_IDS,
  };
  const serialized = serializeQueryState(queryState);
  const parsed = parseQueryState(serialized);
  assert.equal(parsed.sourceId, SOURCE_ID);
  assert.equal(parsed.questionCount, 72);
  assert.equal(parsed.ordering, 'shuffleAcrossPatterns');
  assert.equal(parsed.includeAnswerKey, false);
  assert.equal(parsed.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT);
  assert.deepEqual(parsed.selectedKnowledgePointIds, KP_IDS);
  assert.deepEqual(parsed.selectedPatternGroupIds, GROUP_IDS);
});

test('S59I Classic query state clears stale and cross-unit selector ids', () => {
  const stale = parseQueryState(
    `?unit=${SOURCE_ID}&selection=mixedKnowledgePointsSameUnit&kps=${KP_IDS[0]},kp_stale&groups=${GROUP_IDS[0]},pg_stale`,
  );
  assert.equal(stale.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(stale.selectedKnowledgePointIds, []);
  assert.deepEqual(stale.selectedPatternGroupIds, []);

  const crossUnit = parseQueryState(
    `?unit=${SOURCE_ID}&selection=mixedKnowledgePointsSameUnit&kps=${KP_IDS[0]},kp_g3b_u08_total_from_groups&groups=${GROUP_IDS[0]},pg_g3b_u08_total_from_groups`,
  );
  assert.equal(crossUnit.selectionMode, BATCH_A_RESOLVER_SELECTION_MODES.SOURCE_UNIT);
  assert.deepEqual(crossUnit.selectedKnowledgePointIds, []);
  assert.deepEqual(crossUnit.selectedPatternGroupIds, []);
});

test('S59I Classic public state builds a printable 72-question all-family worksheet', () => {
  const state = classicState();
  const plan = getBatchAWorksheetPlan(state);
  assert.equal(plan.sourceId, SOURCE_ID);
  assert.deepEqual(plan.selectedKnowledgePointIds, KP_IDS);
  assert.deepEqual(plan.selectedPatternGroupIds, GROUP_IDS);
  const result = buildWorksheetDocumentFromState(state);
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const document = result.worksheetDocument;
  assert.equal(document.generatedQuestions.length, 72);
  assert.equal(document.answerKeyItems.length, 72);
  assert.deepEqual(
    new Set(document.generatedQuestions.map((question) => question.patternSpecId)),
    new Set(SPEC_IDS),
  );
  assert.equal(document.rendererProfile.profileId, 'g4b_u01_horizontal_numeric_v1');
  assert.equal(document.printOptions.columns, 3);
  assert.equal(document.printOptions.rowsPerPage, 8);
  assert.equal(document.printOptions.answerKeyColumns, 3);
  assert.equal(document.printOptions.answerKeyRowsPerPage, 10);
  assert.ok(document.generatedQuestions.every((question) => question.representation === 'horizontal_only'));
  assert.ok(document.generatedQuestions.every((question) => question.applicationText === false));
});

test('S59I Pixel public state builds the same canonical worksheet path', () => {
  const state = configurePixelState();
  const controller = new PixelWorksheetController({ state });
  const result = controller.generate();
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  assert.equal(result.worksheetDocument.generatedQuestions.length, 72);
  assert.equal(result.worksheetDocument.answerKeyItems.length, 72);
  assert.equal(result.worksheetDocument.rendererProfile.profileId, 'g4b_u01_horizontal_numeric_v1');
  assert.deepEqual(
    new Set(result.worksheetDocument.generatedQuestions.map((question) => question.patternSpecId)),
    new Set(SPEC_IDS),
  );
  assert.equal(state.canPrint(), true);
  assert.equal(state.isDirty, false);
});

test('S59I Classic and Pixel answer-key controls suppress answer pages without changing questions', () => {
  const classic = buildWorksheetDocumentFromState(classicState({ questionCount: 24, includeAnswerKey: false }));
  assert.equal(classic.ok, true, JSON.stringify(classic.errors));
  assert.equal(classic.worksheetDocument.generatedQuestions.length, 24);
  assert.equal(classic.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(classic.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(classic.worksheetDocument.printOptions.showAnswerKey, false);

  const pixelState = configurePixelState({ questionCount: 24, includeAnswerKey: false });
  const pixel = new PixelWorksheetController({ state: pixelState }).generate();
  assert.equal(pixel.ok, true, JSON.stringify(pixel.errors));
  assert.equal(pixel.worksheetDocument.generatedQuestions.length, 24);
  assert.equal(pixel.worksheetDocument.answerKeyItems.length, 0);
  assert.equal(pixel.worksheetDocument.answerKeyPages.length, 0);
  assert.equal(pixelState.canPrint(), true);
});

test('S59I Classic and Pixel invalidate stale preview/print output after control changes', () => {
  const classic = classicState({ questionCount: 12 });
  const generated = buildWorksheetDocumentFromState(classic);
  assert.equal(generated.ok, true);
  assert.equal(classic.hasPrintableResult, true);
  setBatchAQuestionCount(classic, 13);
  assert.equal(classic.lastWorksheetResult, null);
  assert.equal(classic.hasPrintableResult, false);

  const pixelState = configurePixelState({ questionCount: 12 });
  const pixelController = new PixelWorksheetController({ state: pixelState });
  assert.equal(pixelController.generate().ok, true);
  assert.equal(pixelState.canPrint(), true);
  pixelState.setOrdering('shuffleAcrossPatterns');
  assert.equal(pixelState.isDirty, true);
  assert.equal(pixelState.canPrint(), false);
});

test('S59I grouped and shuffled public generation are deterministic and preserve membership', () => {
  const groupedA = buildWorksheetDocumentFromState(classicState({ questionCount: 72, ordering: 'groupedByPattern' }));
  const groupedB = buildWorksheetDocumentFromState(classicState({ questionCount: 72, ordering: 'groupedByPattern' }));
  const shuffledA = buildWorksheetDocumentFromState(classicState({ questionCount: 72, ordering: 'shuffleAcrossPatterns' }));
  const shuffledB = buildWorksheetDocumentFromState(classicState({ questionCount: 72, ordering: 'shuffleAcrossPatterns' }));
  assert.equal(groupedA.ok, true);
  assert.equal(shuffledA.ok, true);
  assert.deepEqual(groupedA.worksheetDocument, groupedB.worksheetDocument);
  assert.deepEqual(shuffledA.worksheetDocument, shuffledB.worksheetDocument);
  const groupedMembership = groupedA.worksheetDocument.generatedQuestions.map((row) => `${row.patternSpecId}:${row.answerText}`).sort();
  const shuffledMembership = shuffledA.worksheetDocument.generatedQuestions.map((row) => `${row.patternSpecId}:${row.answerText}`).sort();
  assert.deepEqual(shuffledMembership, groupedMembership);
});

test('S59I Classic, 404 fallback and Pixel surfaces retain public generation and print controls', () => {
  const classicHtml = read('site/index.html');
  const fallbackHtml = read('site/404.html');
  const pixelHtml = read('site/pixel.html');
  const mainSource = read('site/assets/browser/main.js');
  const pixelActionSource = read('site/assets/browser/pixel/pixel-action-controller.js');

  for (const html of [classicHtml, fallbackHtml]) {
    assert.match(html, /id="knowledge-point-list"/);
    assert.match(html, /id="pattern-group-list"/);
    assert.match(html, /id="question-count-input"/);
    assert.match(html, /id="ordering-select"/);
    assert.match(html, /id="include-answer-key-input"/);
    assert.match(html, /id="generate-button"/);
    assert.match(html, /id="print-button"/);
    assert.match(html, /id="preview-frame"/);
  }
  assert.match(pixelHtml, /data-action="generate"/);
  assert.match(pixelHtml, /data-action="print"/);
  assert.match(pixelHtml, /data-action="answer-toggle"/);
  assert.match(mainSource, /printPreviewFrame/);
  assert.match(mainSource, /canPrintCurrentResult/);
  assert.match(pixelActionSource, /canPrint\(\)/);
  assert.match(pixelActionSource, /print\(\)/);
});

test('S59I renderer output is printable, horizontal-only and redacts internal ids', () => {
  const result = buildWorksheetDocumentFromState(classicState({ questionCount: 24 }));
  assert.equal(result.ok, true, JSON.stringify(result.errors));
  const html = renderWorksheetDocumentToHtml(result.worksheetDocument, {
    stylesheetHref: '',
    debugDataAttributes: false,
  });
  assert.match(html, /worksheet-renderer--g4b-u01-horizontal/);
  assert.match(html, /white-space: nowrap/);
  assert.doesNotMatch(html, /(?:kp_g4b_u01_|pg_g4b_u01_|ps_g4b_u01_)/);
  assert.doesNotMatch(html, /word_problem|vertical_algorithm|hiddenMode/);
});

test('S59I public messages localize G4B-U01 failures without exposing ids or raw codes', () => {
  const codes = [
    'G4B_U01_PRODUCTION_QUESTION_COUNT_INVALID',
    'G4B_U01_REMAINDER_SCALE_NOT_RESTORED',
    'G4B_U01_NON_HORIZONTAL_REPRESENTATION',
    'G4B_U01_APPLICATION_TEXT_FORBIDDEN',
    'G4B_U01_GENERIC_FALLBACK_FORBIDDEN',
  ];
  for (const code of codes) {
    const message = getPublicErrorMessage(code);
    assert.ok(message.length > 0);
    assert.equal(message.includes(code), false);
    assert.doesNotMatch(message, /(?:kp_|pg_|ps_)/);
  }
  const summary = formatPublicErrorSummary(codes.map((code) => ({ code })));
  assert.doesNotMatch(summary, /G4B_U01_|(?:kp_|pg_|ps_)/);
  assert.equal(getPublicErrorMessage('G4B_U01_UNKNOWN_RAW_CODE'), '目前無法產生題目，請重新選擇後再試。');
});

test('S59I public QA exposes no application, vertical, hidden or representation-toggle mode', () => {
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.publicApplicationGroupCount, 0);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.horizontalOnly, true);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.verticalRepresentationAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.representationToggleAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.publicHiddenModeFlagAllowed, false);
  assert.equal(G4B_U01_PUBLIC_SELECTOR_PRINT_QA.requiredNextGate, 'S59J_G4B_U01_ProductionStressHTMLPDFPromotionCloseout');
});
