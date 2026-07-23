import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildW02A06Readback,
  materializeW02A06ProductionEquivalentPackage,
  validateW02A06ProductionEquivalentPackage
} from '../../src/curriculum/application/shared/production-equivalent-html-pdf-runtime.mjs';
import { supportedSharedOperationFamilies } from '../../src/curriculum/application/shared/operation-family-runtime.mjs';
import { buildWorksheetDocumentFromGeneratedItems } from '../../site/assets/browser/pipeline/build-worksheet-document.js';

const pkg = materializeW02A06ProductionEquivalentPackage();
const countCells = (pages, cellType) => pages
  .flatMap((page) => page.cells)
  .filter((cell) => cell.cellType === cellType).length;

test('A06 generates and validates the exact 195 PatternSpec cohort', () => {
  const result = validateW02A06ProductionEquivalentPackage(pkg);
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.equal(result.counts.sourceNodeCount, 13);
  assert.equal(result.counts.numericPatternSpecCount, 134);
  assert.equal(result.counts.applicationPatternSpecCount, 61);
  assert.equal(result.counts.totalPatternSpecCount, 195);
  assert.equal(result.counts.operationFamilyCount, 49);
  assert.equal(result.counts.validatedItemCount, 195);
  assert.equal(result.counts.pblTaskSetRecordCount, 31);
  assert.equal(result.counts.pbl3TaskSetRecordCount, 19);
  assert.equal(result.counts.pbl5TaskSetRecordCount, 12);
  assert.equal(result.counts.productionSelectableCount, 0);
  assert.equal(result.counts.publicSelectableCount, 0);
  assert.deepEqual(result.modeCounts, { NUMERIC: 134, APPLICATION: 61 });
  assert.equal(result.status, 'W02_SHARED_GENERATOR_VALIDATOR_RENDERER_HTML_READY_PDF_PENDING');
});

test('all 49 operation families are registered once and no family is bypassed', () => {
  assert.equal(supportedSharedOperationFamilies().length, 49);
  assert.equal(new Set(supportedSharedOperationFamilies()).size, 49);
  assert.deepEqual(
    [...new Set(pkg.generatedItems.map((item) => item.operationFamilyId))].sort(),
    [...supportedSharedOperationFamilies()].sort()
  );
  assert.equal(pkg.generatedItems.every((item) => item.generatorAdapterId === 'SHARED_OPERATION_FAMILY_GENERATOR_V1'), true);
  assert.equal(pkg.generatedItems.every((item) => item.validatorAdapterId === 'SHARED_OPERATION_FAMILY_VALIDATOR_V1'), true);
});

test('numeric and application worksheets remain separate and pair answers one-to-one', () => {
  assert.equal(pkg.numericWorksheetResult.worksheetDocument.questionCount, 134);
  assert.equal(pkg.applicationWorksheetResult.worksheetDocument.questionCount, 61);
  assert.equal(pkg.numericWorksheetResult.worksheetDocument.questions.every((item) => item.mode === 'NUMERIC'), true);
  assert.equal(pkg.applicationWorksheetResult.worksheetDocument.questions.every((item) => item.mode === 'APPLICATION'), true);
  assert.equal(countCells(pkg.numericWorksheetResult.worksheetDocument.answerKeyPages, 'answerKey'), 134);
  assert.equal(countCells(pkg.applicationWorksheetResult.worksheetDocument.answerKeyPages, 'answerKey'), 61);
});

test('A06 uses the generic generated-item worksheet consumer rather than a W02 renderer', () => {
  const sample = pkg.numericItems.slice(0, 2);
  const result = buildWorksheetDocumentFromGeneratedItems({
    worksheetId: 'shared-consumer-test',
    generatedItems: sample,
    printLayout: { columns: 1, rowsPerPage: 2, showAnswerKeyPage: true }
  });
  assert.equal(result.ok, true);
  assert.equal(result.worksheetDocument.questionCount, 2);
  assert.equal(result.worksheetDocument.questionPages.length, 1);
  assert.equal(result.worksheetDocument.answerKeyPages.length, 1);
});

test('rendered HTML contains exact question and answer card counts with no internal placeholders', () => {
  for (const [mode, html, expected] of [
    ['NUMERIC', pkg.numericHtml, 134],
    ['APPLICATION', pkg.applicationHtml, 61]
  ]) {
    assert.equal(html.includes('data-postg-app-w02-a06="true"'), true);
    assert.equal(html.includes(`data-question-mode="${mode}"`), true);
    assert.equal((html.match(/worksheet-cell--question/g) ?? []).length, expected);
    assert.equal((html.match(/worksheet-cell--answer-key/g) ?? []).length, expected);
    assert.equal(html.includes('{{'), false);
    assert.equal(html.includes('答：'), false);
    assert.equal(html.includes('_____'), false);
  }
});

test('all 31 PBL records remain complete data projections without automatic compatible PBL', () => {
  assert.equal(pkg.pblTaskSetRecords.length, 31);
  for (const record of pkg.pblTaskSetRecords) {
    const expected = record.graphType === 'PBL5_BOUNDED_DECISION' ? 5 : 3;
    assert.equal(record.tasks.length, expected);
    assert.equal(record.milestones.length, expected);
    assert.equal(record.productionSelectable, false);
  }
});

test('production and public admission remain fail closed', () => {
  assert.equal(pkg.generatedItems.some((item) => item.productionSelectable), false);
  assert.equal(pkg.generatedItems.some((item) => item.publicSelectable), false);
  assert.equal(pkg.projection.access.w02.provider.productionAdmitted, false);
  assert.equal(pkg.projection.access.w02.provider.publicSelectable, false);
  assert.equal(pkg.projection.access.w03.ok, false);
});

test('materialization is deterministic', () => {
  const repeated = materializeW02A06ProductionEquivalentPackage();
  assert.deepEqual(repeated.generatedItems, pkg.generatedItems);
  assert.equal(repeated.numericHtml, pkg.numericHtml);
  assert.equal(repeated.applicationHtml, pkg.applicationHtml);
});

test('readback exposes E4 artifact expectations without claiming admission', () => {
  const result = buildW02A06Readback();
  assert.equal(result.ok, true, JSON.stringify(result.issues, null, 2));
  assert.deepEqual(result.artifactExpectations, {
    htmlArtifactCount: 2,
    pdfArtifactCount: 2,
    packageJsonCount: 1,
    manifestCount: 1
  });
  assert.equal(result.nextShortestStep, 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage');
});
