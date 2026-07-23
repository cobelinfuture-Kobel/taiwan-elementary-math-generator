import {
  materializeW02HiddenPatternSpecs,
  validateW02HiddenPatternSpecs
} from '../w02-hidden-pattern-specs.mjs';
import {
  materializeSharedW02WorksheetProjection,
  validateSharedW02WorksheetProjection
} from './worksheet-projection-runtime.mjs';
import {
  generateSharedOperationFamilyItem,
  supportedSharedOperationFamilies,
  validateSharedOperationFamilyItem
} from './operation-family-runtime.mjs';
import {
  applyStudentFacingOperationSurface,
  instantiateStudentFacingPblTaskSet,
  validateStudentFacingOperationSurface,
  validateStudentFacingPblTaskSet
} from './student-facing-operation-surface.mjs';
import { buildWorksheetDocumentFromGeneratedItems } from '../../../../site/assets/browser/pipeline/build-worksheet-document.js';
import { renderWorksheetDocumentToHtml } from '../../../../site/modules/renderer/html-renderer-s57f5-extension.js';

const sortedUnique = (values) => [...new Set(values)].sort();
const countBy = (rows, selector) => rows.reduce((counts, row) => {
  const key = selector(row);
  counts[key] = (counts[key] ?? 0) + 1;
  return counts;
}, {});
const issue = (code, pathValue, details = {}) => ({ code, path: pathValue, ...details });
const countRenderedCards = (html, modifierClass) => (
  html.match(new RegExp(`<article class="worksheet-cell ${modifierClass}"`, 'g')) ?? []
).length;
const ARTIFACT_STYLESHEET_HREF = '../../../../../src/renderer/print-styles.css';

function flattenSpecs(hidden) {
  return hidden.records.flatMap(({ actual }) => actual.knowledgePoints.flatMap((kp) => (
    kp.patternSpecs.map((spec) => Object.freeze({
      ...spec,
      sourceNodeId: actual.sourceNodeId,
      sourceTitle: actual.sourceTitle,
      knowledgePointId: kp.knowledgePointId,
      knowledgePointName: kp.knowledgePointName,
      applicationClassification: kp.applicationClassification
    }))
  )));
}

function injectArtifactMarker(html, mode) {
  return html
    .replace('<body class="worksheet-renderer">', `<body class="worksheet-renderer" data-postg-app-w02-a06="true" data-question-mode="${mode}" data-student-facing-surface="W02_A08R1_V1">`)
    .replace('</head>', [
      '<style>',
      '.worksheet-cell__prompt{font-size:13px;line-height:1.45;overflow-wrap:anywhere;}',
      '.worksheet-cell--answer-key .worksheet-cell__answer{font-weight:700;}',
      '@media print{.worksheet-cell__prompt{font-size:12px;line-height:1.35;}}',
      '</style>',
      '</head>'
    ].join(''));
}

function buildDocument(items, mode) {
  const isApplication = mode === 'APPLICATION';
  return buildWorksheetDocumentFromGeneratedItems({
    worksheetId: `postg-app-w02-a06-${mode.toLowerCase()}-195-contract`,
    generatedItems: items,
    title: isApplication ? 'W02 應用題 Production-equivalent Worksheet' : 'W02 數字題 Production-equivalent Worksheet',
    subtitle: isApplication ? '61 個 application PatternSpecs' : '134 個 numeric PatternSpecs',
    orderingMode: 'SOURCE_PATTERN_SPEC_ORDER',
    printLayout: {
      paperSize: 'A4',
      columns: 1,
      rowsPerPage: isApplication ? 3 : 4,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
      worksheetTitle: isApplication ? 'W02 應用題驗收卷' : 'W02 數字題驗收卷'
    },
    report: {
      warnings: [],
      errors: [],
      summary: {
        mode,
        operationFamilyCount: sortedUnique(items.map((item) => item.operationFamilyId)).length
      }
    },
    metadata: {
      taskId: 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration',
      remediationTaskId: 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview',
      evidenceLevel: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED',
      studentFacingSurfaceVersion: 'W02_A08R1_V1',
      productionSelectable: false,
      publicSelectable: false
    }
  });
}

export function materializeW02A06ProductionEquivalentPackage({ root = process.cwd() } = {}) {
  const hidden = materializeW02HiddenPatternSpecs({ root });
  const hiddenValidation = validateW02HiddenPatternSpecs(hidden);
  const projection = materializeSharedW02WorksheetProjection({ root });
  const projectionValidation = validateSharedW02WorksheetProjection(projection);
  const applicationRecordByPattern = new Map(
    projection.applicationQuestionRecords.map((row) => [row.patternSpecId, row])
  );
  const specs = flattenSpecs(hidden);
  const generatedItems = specs.map((spec, index) => {
    const applicationRecord = applicationRecordByPattern.get(spec.patternSpecId) ?? null;
    const rawItem = generateSharedOperationFamilyItem({
      spec,
      applicationRecord,
      ordinal: index + 1
    });
    return applyStudentFacingOperationSurface({
      spec,
      item: { ...rawItem, sourceTitle: spec.sourceTitle },
      applicationRecord
    });
  });
  const validationResults = generatedItems.map((item, index) => {
    const operation = validateSharedOperationFamilyItem({ spec: specs[index], item });
    const surface = validateStudentFacingOperationSurface({ spec: specs[index], item });
    return {
      ok: operation.ok && surface.ok,
      issues: [...operation.issues, ...surface.issues],
      operation,
      surface
    };
  });
  const numericItems = generatedItems.filter((item) => item.mode === 'NUMERIC');
  const applicationItems = generatedItems.filter((item) => item.mode === 'APPLICATION');
  const applicationItemByPattern = new Map(applicationItems.map((item) => [item.patternSpecId, item]));
  const pblTaskSetRecords = projection.pblTaskSetRecords.map((record) => instantiateStudentFacingPblTaskSet({
    record,
    item: applicationItemByPattern.get(record.patternSpecId)
  }));
  const pblValidationResults = pblTaskSetRecords.map((record) => validateStudentFacingPblTaskSet(record));
  const numericResult = buildDocument(numericItems, 'NUMERIC');
  const applicationResult = buildDocument(applicationItems, 'APPLICATION');
  const numericHtml = injectArtifactMarker(renderWorksheetDocumentToHtml(numericResult.worksheetDocument, {
    title: 'W02 數字題 Production-equivalent Worksheet',
    stylesheetHref: ARTIFACT_STYLESHEET_HREF,
    debugDataAttributes: false,
    renderFillerCells: false
  }), 'NUMERIC');
  const applicationHtml = injectArtifactMarker(renderWorksheetDocumentToHtml(applicationResult.worksheetDocument, {
    title: 'W02 應用題 Production-equivalent Worksheet',
    stylesheetHref: ARTIFACT_STYLESHEET_HREF,
    debugDataAttributes: false,
    renderFillerCells: false
  }), 'APPLICATION');

  return {
    root,
    hidden,
    hiddenValidation,
    projection,
    projectionValidation,
    specs,
    generatedItems,
    validationResults,
    numericItems,
    applicationItems,
    pblTaskSetRecords,
    pblValidationResults,
    numericWorksheetResult: numericResult,
    applicationWorksheetResult: applicationResult,
    numericHtml,
    applicationHtml
  };
}

export function validateW02A06ProductionEquivalentPackage(pkg) {
  const issues = [];
  if (!pkg.hiddenValidation.ok) issues.push(issue('POSTG_APP_W02_A06_HIDDEN_PATTERN_AUTHORITY_INVALID', 'hidden', { hiddenIssues: pkg.hiddenValidation.issues }));
  if (!pkg.projectionValidation.ok) issues.push(issue('POSTG_APP_W02_A06_SHARED_PROJECTION_INVALID', 'projection', { projectionIssues: pkg.projectionValidation.issues }));
  const unsupported = sortedUnique(pkg.specs.map((row) => row.operationFamilyId)).filter((family) => !supportedSharedOperationFamilies().includes(family));
  if (unsupported.length) issues.push(issue('POSTG_APP_W02_A06_OPERATION_FAMILY_UNSUPPORTED', 'operationFamilies', { unsupported }));
  pkg.validationResults.forEach((result, index) => {
    if (!result.ok) issues.push(issue('POSTG_APP_W02_A06_GENERATED_ITEM_INVALID', `generatedItems.${index}`, { itemIssues: result.issues }));
  });
  pkg.pblValidationResults.forEach((result, index) => {
    if (!result.ok) issues.push(issue('POSTG_APP_W02_A06_PBL_STUDENT_SURFACE_INVALID', `pblTaskSetRecords.${index}`, { pblIssues: result.issues }));
  });

  const counts = {
    sourceNodeCount: sortedUnique(pkg.generatedItems.map((item) => item.sourceNodeId)).length,
    numericPatternSpecCount: pkg.numericItems.length,
    applicationPatternSpecCount: pkg.applicationItems.length,
    totalPatternSpecCount: pkg.generatedItems.length,
    operationFamilyCount: sortedUnique(pkg.generatedItems.map((item) => item.operationFamilyId)).length,
    validatedItemCount: pkg.validationResults.filter((result) => result.ok).length,
    studentFacingValidatedItemCount: pkg.validationResults.filter((result) => result.surface.ok).length,
    pblTaskSetRecordCount: pkg.pblTaskSetRecords.length,
    pblValidatedTaskSetCount: pkg.pblValidationResults.filter((result) => result.ok).length,
    pbl3TaskSetRecordCount: pkg.pblTaskSetRecords.filter((row) => row.graphType === 'PBL3_LINEAR').length,
    pbl5TaskSetRecordCount: pkg.pblTaskSetRecords.filter((row) => row.graphType === 'PBL5_BOUNDED_DECISION').length,
    numericQuestionPageCount: pkg.numericWorksheetResult.worksheetDocument.questionPages.length,
    numericAnswerPageCount: pkg.numericWorksheetResult.worksheetDocument.answerKeyPages.length,
    applicationQuestionPageCount: pkg.applicationWorksheetResult.worksheetDocument.questionPages.length,
    applicationAnswerPageCount: pkg.applicationWorksheetResult.worksheetDocument.answerKeyPages.length,
    productionSelectableCount: pkg.generatedItems.filter((row) => row.productionSelectable).length,
    publicSelectableCount: pkg.generatedItems.filter((row) => row.publicSelectable).length
  };
  const expected = {
    sourceNodeCount: 13,
    numericPatternSpecCount: 134,
    applicationPatternSpecCount: 61,
    totalPatternSpecCount: 195,
    operationFamilyCount: 49,
    validatedItemCount: 195,
    studentFacingValidatedItemCount: 195,
    pblTaskSetRecordCount: 31,
    pblValidatedTaskSetCount: 31,
    pbl3TaskSetRecordCount: 19,
    pbl5TaskSetRecordCount: 12,
    productionSelectableCount: 0,
    publicSelectableCount: 0
  };
  for (const [key, expectedValue] of Object.entries(expected)) {
    if (counts[key] !== expectedValue) issues.push(issue('POSTG_APP_W02_A06_COUNT_MISMATCH', `counts.${key}`, { expected: expectedValue, actual: counts[key] }));
  }
  const ids = pkg.generatedItems.map((item) => item.generatedItemId);
  if (new Set(ids).size !== ids.length) issues.push(issue('POSTG_APP_W02_A06_GENERATED_ID_DUPLICATED', 'generatedItems'));
  if (pkg.numericItems.some((item) => item.mode !== 'NUMERIC') || pkg.applicationItems.some((item) => item.mode !== 'APPLICATION')) {
    issues.push(issue('POSTG_APP_W02_A06_MODE_SEPARATION_INVALID', 'generatedItems'));
  }
  if (pkg.generatedItems.some((item) => item.studentFacingSurfaceVersion !== 'W02_A08R1_V1')) {
    issues.push(issue('POSTG_APP_W02_A06_STUDENT_SURFACE_VERSION_INVALID', 'generatedItems'));
  }
  if (pkg.pblTaskSetRecords.some((row) => row.studentFacingInstantiationVersion !== 'W02_A08R1_V1')) {
    issues.push(issue('POSTG_APP_W02_A06_PBL_INSTANTIATION_VERSION_INVALID', 'pblTaskSetRecords'));
  }
  for (const [mode, html, expectedQuestions] of [
    ['NUMERIC', pkg.numericHtml, 134],
    ['APPLICATION', pkg.applicationHtml, 61]
  ]) {
    const questionCards = countRenderedCards(html, 'worksheet-cell--question');
    const answerCards = countRenderedCards(html, 'worksheet-cell--answer-key');
    if (!html.includes('data-postg-app-w02-a06="true"')
        || !html.includes(`data-question-mode="${mode}"`)
        || !html.includes('data-student-facing-surface="W02_A08R1_V1"')
        || !html.includes(`href="${ARTIFACT_STYLESHEET_HREF}"`)
        || questionCards !== expectedQuestions
        || answerCards !== expectedQuestions
        || html.includes('{{')
        || html.includes('答：')
        || html.includes('_____')
        || /([A-Za-z][A-Za-z0-9_]*)為/.test(html)
        || /\b(?:op|ps|kp|gctx|w02)_[a-z0-9_]+\b/i.test(html)) {
      issues.push(issue('POSTG_APP_W02_A06_HTML_STRUCTURE_INVALID', `html.${mode}`, { questionCards, answerCards, expectedQuestions }));
    }
  }
  if (pkg.generatedItems.some((item) => item.generatorAdapterId !== 'SHARED_OPERATION_FAMILY_GENERATOR_V1'
      || item.validatorAdapterId !== 'SHARED_OPERATION_FAMILY_VALIDATOR_V1')) {
    issues.push(issue('POSTG_APP_W02_A06_SHARED_ADAPTER_BYPASS', 'generatedItems'));
  }

  return {
    ok: issues.length === 0,
    issues,
    counts,
    modeCounts: countBy(pkg.generatedItems, (row) => row.mode),
    familyCounts: countBy(pkg.generatedItems, (row) => row.operationFamilyId),
    sourceCounts: countBy(pkg.generatedItems, (row) => row.sourceNodeId),
    artifactExpectations: {
      htmlArtifactCount: 2,
      pdfArtifactCount: 2,
      packageJsonCount: 1,
      manifestCount: 1
    },
    status: issues.length === 0
      ? 'W02_SHARED_GENERATOR_VALIDATOR_RENDERER_STUDENT_SURFACE_HTML_READY_PDF_PENDING'
      : 'W02_SHARED_GENERATOR_VALIDATOR_RENDERER_BLOCKED'
  };
}

export function buildW02A06Readback({ root = process.cwd() } = {}) {
  const pkg = materializeW02A06ProductionEquivalentPackage({ root });
  const validation = validateW02A06ProductionEquivalentPackage(pkg);
  return {
    ...validation,
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration',
    remediationTaskId: 'POSTG-APP-W02-A08R1_StudentFacingSemanticSurfacePBLInstantiationAndReReview',
    nextShortestStep: 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage',
    sampleNumericItem: pkg.numericItems[0] ?? null,
    sampleApplicationItem: pkg.applicationItems[0] ?? null,
    samplePBLTaskSetRecord: pkg.pblTaskSetRecords[0] ?? null
  };
}
