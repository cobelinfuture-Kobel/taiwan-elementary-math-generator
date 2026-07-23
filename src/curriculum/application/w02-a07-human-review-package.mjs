import {
  materializeW02A06ProductionEquivalentPackage,
  validateW02A06ProductionEquivalentPackage
} from './shared/production-equivalent-html-pdf-runtime.mjs';

const TASK_ID = 'POSTG-APP-W02-A07_ProductionEquivalentHTMLPDFHumanReviewPackage';
const STATUS = 'W02_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY';
const REVIEW_TYPE = 'production_equivalent_output_review';

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const sortedUnique = (values) => [...new Set(values)].sort();
const issue = (code, path, details = {}) => ({ code, path, ...details });
const esc = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const REVIEW_CHECKLIST = Object.freeze([
  'APPLICATION_SEMANTIC_NATURALNESS',
  'QUANTITY_ROLE_AND_UNIT_BINDING',
  'MATHEMATICAL_WITNESS_PRESERVATION',
  'ANSWER_UNIQUENESS_AND_ANSWER_KEY_PAIRING',
  'PBL_DEPENDENCY_AND_FINAL_DECISION_COMPLETENESS',
  'NUMERIC_APPLICATION_MODE_SEPARATION',
  'HTML_PDF_LAYOUT_AND_PAGE_CONTAINMENT',
  'FORBIDDEN_INTERNAL_LABEL_ABSENCE'
]);

function applicationReviewRow(item) {
  return {
    generatedItemId: item.generatedItemId,
    sourceNodeId: item.sourceNodeId,
    sourceTitle: item.sourceTitle,
    knowledgePointId: item.knowledgePointId,
    patternSpecId: item.patternSpecId,
    operationFamilyId: item.operationFamilyId,
    contextMacroId: item.contextMacroId ?? item.metadata?.contextMacroId ?? null,
    promptText: item.prompt ?? item.promptText ?? item.displayText ?? null,
    answerText: item.answerText ?? null,
    answerValue: clone(item.answerValue ?? item.answer ?? null),
    answerUnit: item.answerUnit ?? null,
    generatorAdapterId: item.generatorAdapterId,
    validatorAdapterId: item.validatorAdapterId,
    productionSelectable: item.productionSelectable === true,
    publicSelectable: item.publicSelectable === true,
    reviewChecks: REVIEW_CHECKLIST.slice(0, 4).concat(REVIEW_CHECKLIST.slice(7))
  };
}

function pblReviewRow(row) {
  return {
    pblTaskSetId: row.pblTaskSetId ?? row.taskSetId ?? row.id,
    sourceNodeId: row.sourceNodeId,
    knowledgePointId: row.knowledgePointId,
    patternSpecId: row.patternSpecId,
    graphType: row.graphType,
    taskCount: Array.isArray(row.tasks) ? row.tasks.length : (row.taskCount ?? null),
    dependencyGraph: clone(row.dependencyGraph ?? row.dependencies ?? null),
    finalDecisionRequired: row.finalDecisionRequired ?? true,
    record: clone(row),
    reviewChecks: [
      'PBL_DEPENDENCY_AND_FINAL_DECISION_COMPLETENESS',
      'MATHEMATICAL_WITNESS_PRESERVATION',
      'ANSWER_UNIQUENESS_AND_ANSWER_KEY_PAIRING'
    ]
  };
}

function numericBoundaryRows(items) {
  const byFamily = new Map();
  for (const item of items) {
    if (!byFamily.has(item.operationFamilyId)) byFamily.set(item.operationFamilyId, item);
  }
  return [...byFamily.values()].map((item) => ({
    generatedItemId: item.generatedItemId,
    sourceNodeId: item.sourceNodeId,
    knowledgePointId: item.knowledgePointId,
    patternSpecId: item.patternSpecId,
    operationFamilyId: item.operationFamilyId,
    promptText: item.prompt ?? item.promptText ?? item.displayText ?? null,
    answerText: item.answerText ?? null,
    mode: item.mode,
    productionSelectable: item.productionSelectable === true,
    publicSelectable: item.publicSelectable === true,
    reviewChecks: ['NUMERIC_APPLICATION_MODE_SEPARATION', 'ANSWER_UNIQUENESS_AND_ANSWER_KEY_PAIRING']
  }));
}

function renderReviewIndex(model) {
  const applicationRows = model.applicationReviewRows.map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${esc(row.sourceNodeId)}</td>
      <td>${esc(row.operationFamilyId)}</td>
      <td>${esc(row.promptText)}</td>
      <td>${esc(row.answerText ?? row.answerValue)}</td>
      <td>□ 通過 □ 修正 □ 拒絕</td>
    </tr>`).join('');
  const pblRows = model.pblReviewRows.map((row, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${esc(row.sourceNodeId)}</td>
      <td>${esc(row.graphType)}</td>
      <td>${esc(row.taskCount)}</td>
      <td>□ 依賴完整 □ 最終決策完整 □ 修正</td>
    </tr>`).join('');
  const checklist = model.reviewChecklist.map((item) => `<li>□ ${esc(item)}</li>`).join('');
  return `<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>W02 Production-equivalent HTML/PDF 人工審核包</title>
<style>
body{font-family:Arial,"Noto Sans TC",sans-serif;margin:24px;line-height:1.45;color:#111}
h1,h2{margin:.5em 0}.summary{display:grid;grid-template-columns:repeat(4,minmax(140px,1fr));gap:8px}
.card{border:1px solid #888;padding:10px;border-radius:6px}table{border-collapse:collapse;width:100%;font-size:12px}
th,td{border:1px solid #aaa;padding:6px;vertical-align:top}th{background:#eee;position:sticky;top:0}
.boundary{border:2px solid #222;padding:12px;margin:12px 0}.artifacts a{display:block;margin:4px 0}
@media print{body{margin:10mm}.summary{grid-template-columns:repeat(2,1fr)}th{position:static}.no-print{display:none}}
</style>
</head>
<body data-postg-app-w02-a07="true" data-human-review-ready="true">
<h1>W02 Production-equivalent HTML/PDF 人工審核包</h1>
<div class="boundary"><strong>Fail-closed：</strong>本文件只代表人工審核材料已備妥；尚未記錄 operator decision，production admission 與 public selection 均維持 false。</div>
<div class="summary">
<div class="card">來源節點<br><strong>${model.summary.sourceNodeCount}</strong></div>
<div class="card">應用題<br><strong>${model.summary.applicationReviewCount}</strong></div>
<div class="card">PBL 題組<br><strong>${model.summary.pblReviewCount}</strong></div>
<div class="card">數字題邊界樣本<br><strong>${model.summary.numericBoundaryReviewCount}</strong></div>
</div>
<h2>審核準則</h2><ul>${checklist}</ul>
<h2>Production-equivalent artifacts</h2>
<div class="artifacts">
<a href="../w02-a06/POSTG_APP_W02_A06_NUMERIC_WORKSHEET.html">數字題 HTML（134 題）</a>
<a href="../w02-a06/POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf">數字題 PDF</a>
<a href="../w02-a06/POSTG_APP_W02_A06_APPLICATION_WORKSHEET.html">應用題 HTML（61 題）</a>
<a href="../w02-a06/POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf">應用題 PDF</a>
</div>
<h2>61 題應用題逐題審核</h2>
<table><thead><tr><th>#</th><th>Source</th><th>Family</th><th>題目</th><th>答案</th><th>決定</th></tr></thead><tbody>${applicationRows}</tbody></table>
<h2>31 組 PBL 題組審核</h2>
<table><thead><tr><th>#</th><th>Source</th><th>Graph</th><th>Tasks</th><th>決定</th></tr></thead><tbody>${pblRows}</tbody></table>
</body></html>`;
}

export function materializeW02A07HumanReviewPackage({ root = process.cwd(), a06Package = null } = {}) {
  const productionPackage = a06Package ?? materializeW02A06ProductionEquivalentPackage({ root });
  const a06Validation = validateW02A06ProductionEquivalentPackage(productionPackage);
  const applicationReviewRows = productionPackage.applicationItems.map(applicationReviewRow);
  const pblReviewRows = productionPackage.pblTaskSetRecords.map(pblReviewRow);
  const numericReviews = numericBoundaryRows(productionPackage.numericItems);
  const sourceNodeIds = sortedUnique(productionPackage.generatedItems.map((row) => row.sourceNodeId));
  const macroContextIds = sortedUnique(applicationReviewRows.map((row) => row.contextMacroId).filter(Boolean));
  const model = {
    schemaName: 'POSTGAPPW02A07ProductionEquivalentHumanReviewPackageV1',
    schemaVersion: 1,
    programId: 'POST_GOLDEN_APPLICATION_CAPABILITY_EXPANSION_V1',
    taskId: TASK_ID,
    parentTaskId: 'POSTG-APP-W02-A06_SharedGeneratorValidatorRendererHTMLPDFIntegration',
    status: STATUS,
    evidenceLevel: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED',
    reviewType: REVIEW_TYPE,
    reviewChecklist: [...REVIEW_CHECKLIST],
    applicationReviewRows,
    pblReviewRows,
    numericBoundaryReviewRows: numericReviews,
    summary: {
      sourceNodeCount: sourceNodeIds.length,
      macroContextCount: macroContextIds.length,
      totalGeneratedItemCount: productionPackage.generatedItems.length,
      numericGeneratedItemCount: productionPackage.numericItems.length,
      applicationReviewCount: applicationReviewRows.length,
      pblReviewCount: pblReviewRows.length,
      pbl3ReviewCount: pblReviewRows.filter((row) => row.graphType === 'PBL3_LINEAR').length,
      pbl5ReviewCount: pblReviewRows.filter((row) => row.graphType === 'PBL5_BOUNDED_DECISION').length,
      numericBoundaryReviewCount: numericReviews.length,
      operationFamilyCount: sortedUnique(productionPackage.generatedItems.map((row) => row.operationFamilyId)).length
    },
    artifacts: {
      numericHtml: 'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_NUMERIC_WORKSHEET.html',
      numericPdf: 'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_NUMERIC_WORKSHEET.pdf',
      applicationHtml: 'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_APPLICATION_WORKSHEET.html',
      applicationPdf: 'docs/curriculum/output/postg-app/w02-a06/POSTG_APP_W02_A06_APPLICATION_WORKSHEET.pdf',
      reviewIndexHtml: 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW_INDEX.html',
      reviewDataJson: 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW_DATA.json',
      reviewExtractedText: 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW.extracted.txt',
      reviewManifestJson: 'docs/curriculum/output/postg-app/w02-a07/POSTG_APP_W02_A07_HUMAN_REVIEW_MANIFEST.json'
    },
    boundaries: {
      exactProductionEquivalentGeneratorUsed: true,
      productionRendererUsed: true,
      humanReviewReady: true,
      operatorDecisionRecorded: false,
      reviewDecision: 'NOT_STARTED',
      automaticApprovalAllowed: false,
      productionAdmissionGranted: false,
      publicSelectable: false,
      publicUIChanged: false,
      futureWaveContentAuthored: false
    },
    a06Validation
  };
  return { ...model, reviewIndexHtml: renderReviewIndex(model) };
}

export function validateW02A07HumanReviewPackage(model) {
  const issues = [];
  const expected = {
    sourceNodeCount: 13,
    totalGeneratedItemCount: 195,
    numericGeneratedItemCount: 134,
    applicationReviewCount: 61,
    pblReviewCount: 31,
    pbl3ReviewCount: 19,
    pbl5ReviewCount: 12,
    operationFamilyCount: 49
  };
  if (!model.a06Validation?.ok) issues.push(issue('POSTG_APP_W02_A07_A06_EVIDENCE_INVALID', 'a06Validation', { issues: model.a06Validation?.issues ?? [] }));
  for (const [key, value] of Object.entries(expected)) {
    if (model.summary?.[key] !== value) issues.push(issue('POSTG_APP_W02_A07_COUNT_MISMATCH', `summary.${key}`, { expected: value, actual: model.summary?.[key] }));
  }
  if (!Array.isArray(model.reviewChecklist) || model.reviewChecklist.length !== REVIEW_CHECKLIST.length) {
    issues.push(issue('POSTG_APP_W02_A07_REVIEW_CHECKLIST_INVALID', 'reviewChecklist'));
  }
  if (model.applicationReviewRows.some((row) => !row.promptText || row.answerText == null
      || row.productionSelectable || row.publicSelectable)) {
    issues.push(issue('POSTG_APP_W02_A07_APPLICATION_REVIEW_ROW_INVALID', 'applicationReviewRows'));
  }
  if (model.numericBoundaryReviewRows.some((row) => row.mode !== 'NUMERIC'
      || row.productionSelectable || row.publicSelectable)) {
    issues.push(issue('POSTG_APP_W02_A07_NUMERIC_BOUNDARY_INVALID', 'numericBoundaryReviewRows'));
  }
  if (model.pblReviewRows.some((row) => !['PBL3_LINEAR', 'PBL5_BOUNDED_DECISION'].includes(row.graphType))) {
    issues.push(issue('POSTG_APP_W02_A07_PBL_GRAPH_INVALID', 'pblReviewRows'));
  }
  if (!model.reviewIndexHtml.includes('data-postg-app-w02-a07="true"')
      || !model.reviewIndexHtml.includes('data-human-review-ready="true"')
      || !model.reviewIndexHtml.includes('production admission')
      || model.reviewIndexHtml.includes('{{')) {
    issues.push(issue('POSTG_APP_W02_A07_REVIEW_INDEX_INVALID', 'reviewIndexHtml'));
  }
  const boundary = model.boundaries ?? {};
  if (!boundary.exactProductionEquivalentGeneratorUsed
      || !boundary.productionRendererUsed
      || !boundary.humanReviewReady
      || boundary.operatorDecisionRecorded
      || boundary.reviewDecision !== 'NOT_STARTED'
      || boundary.automaticApprovalAllowed
      || boundary.productionAdmissionGranted
      || boundary.publicSelectable
      || boundary.publicUIChanged
      || boundary.futureWaveContentAuthored) {
    issues.push(issue('POSTG_APP_W02_A07_FAIL_CLOSED_BOUNDARY_INVALID', 'boundaries'));
  }
  return {
    ok: issues.length === 0,
    issues,
    counts: clone(model.summary),
    status: issues.length === 0 ? STATUS : 'W02_HUMAN_REVIEW_PACKAGE_BLOCKED',
    nextShortestStep: 'POSTG-APP-W02-A08_OperatorHumanReviewDecisionAndProductionAdmission'
  };
}

export function buildW02A07Readback({ root = process.cwd() } = {}) {
  const model = materializeW02A07HumanReviewPackage({ root });
  return { ...validateW02A07HumanReviewPackage(model), taskId: TASK_ID, reviewType: REVIEW_TYPE };
}
