import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderWorksheetDocumentToHtml } from '../../site/modules/renderer/html-renderer-s57f5-extension.js';
import { buildW01E4ProductionReviewReadback } from '../../src/curriculum/application/w01-e4-production-review-runtime.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUT_DIR = resolve(ROOT, 'docs/curriculum/output/postg-app');
const HTML_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW.html');
const PDF_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW.pdf');
const DATA_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW_DATA.json');
const MANIFEST_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW_MANIFEST.json');

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function answerText(value) {
  return typeof value === 'string' ? value : JSON.stringify(value);
}

function pairCards(readback) {
  return readback.reviewPairs.map((pair, index) => `
    <article class="postg-review-pair" data-binding-id="${escapeHtml(pair.bindingCandidateId)}">
      <h3>${index + 1}. ${escapeHtml(pair.sourceId)} · ${escapeHtml(pair.knowledgePointId)}</h3>
      <p><strong>Macro Context</strong> ${escapeHtml(pair.macroContextId)}</p>
      <p><strong>Exact Pattern</strong> ${escapeHtml(pair.exactPatternSpecId)} / ${escapeHtml(pair.exactPatternGroupId)}</p>
      <p><strong>Before</strong> ${escapeHtml(pair.originalPrompt)}</p>
      <p><strong>Application Review Candidate</strong> ${escapeHtml(pair.reviewPrompt)}</p>
      <p><strong>Answer</strong> ${escapeHtml(answerText(pair.answerText))} ${escapeHtml(pair.answerUnit)}</p>
      <p><strong>Math Preserved</strong> ${pair.mathPreserved ? 'PASS' : 'FAIL'} · <strong>Prompt Changed</strong> ${pair.promptChanged ? 'PASS' : 'FAIL'}</p>
      <fieldset>
        <legend>Human Review</legend>
        <label>語意自然 <input type="checkbox"></label>
        <label>數量角色正確 <input type="checkbox"></label>
        <label>單位正確 <input type="checkbox"></label>
        <label>N+1／直接應用深度正確 <input type="checkbox"></label>
        <label>核准 <input type="checkbox"></label>
        <label>退回 <input type="checkbox"></label>
      </fieldset>
    </article>`).join('');
}

function unitFlowRows(readback) {
  return readback.unitFlowReviewRows.map((row) => `
    <tr>
      <td>${escapeHtml(row.sourceId)}</td>
      <td>${escapeHtml(row.knowledgePointId)}</td>
      <td>${escapeHtml(row.originalAnswerUnitCandidate)}</td>
      <td>${escapeHtml(row.exactGeneratorAnswerUnit)}</td>
      <td>${escapeHtml(row.semanticInferenceUnit)}</td>
      <td>${escapeHtml(row.resolvedAnswerUnitCandidate)}</td>
      <td>${escapeHtml(row.resolutionStatus)}</td>
    </tr>`).join('');
}

function pblCards(readback) {
  return readback.pblReviewSections.map((section) => `
    <article class="postg-review-pbl" data-pbl-id="${escapeHtml(section.pblCandidateId)}">
      <h3>${escapeHtml(section.sourceId)} · ${escapeHtml(section.graphType)}</h3>
      <p><strong>Driving Problem</strong> ${escapeHtml(section.drivingProblemCandidate.problemStatementZh)}</p>
      <p><strong>Projection</strong> ${escapeHtml(section.projectionCandidate)}</p>
      <ol>${section.taskBlueprints.map((task) => `<li>${escapeHtml(task.promptZh)} <small>${escapeHtml(task.inputRefs.join(', '))}</small></li>`).join('')}</ol>
      <p><strong>Final Product</strong> ${escapeHtml(section.finalProductCandidate.finalProductType)} · ${escapeHtml(section.finalProductCandidate.decisionWitnessCandidate)}</p>
      <fieldset>
        <legend>PBL Human Review</legend>
        <label>真實任務成立 <input type="checkbox"></label>
        <label>任務依賴成立 <input type="checkbox"></label>
        <label>最終綜合成立 <input type="checkbox"></label>
        <label>投影完整 <input type="checkbox"></label>
        <label>核准 <input type="checkbox"></label>
        <label>退回 <input type="checkbox"></label>
      </fieldset>
    </article>`).join('');
}

function reviewAppendix(readback) {
  return `
  <section class="postg-human-review-dossier">
    <style>
      .postg-human-review-dossier{break-before:page;padding:10mm;font-family:Arial,"Noto Sans TC",sans-serif;color:#111}
      .postg-review-summary,.postg-unit-flow,.postg-review-pair,.postg-review-pbl{border:1px solid #999;border-radius:6px;padding:8px;margin:0 0 10px;break-inside:avoid}
      .postg-review-pair h3,.postg-review-pbl h3{margin:0 0 6px;font-size:14px}
      .postg-review-pair p,.postg-review-pbl p{margin:3px 0;font-size:12px;line-height:1.45}
      .postg-human-review-dossier table{border-collapse:collapse;width:100%;font-size:9px}
      .postg-human-review-dossier th,.postg-human-review-dossier td{border:1px solid #aaa;padding:3px;vertical-align:top}
      .postg-human-review-dossier fieldset{margin-top:6px;font-size:10px}
      .postg-human-review-dossier label{display:inline-block;margin-right:10px}
      @media print{.postg-review-pair,.postg-review-pbl,.postg-unit-flow{break-inside:avoid}}
    </style>
    <h1>Wave 01 Application Human Review Dossier</h1>
    <div class="postg-review-summary">
      <p><strong>Task</strong> ${escapeHtml(readback.taskId)}</p>
      <p><strong>Evidence boundary</strong> Exact production generator and shared production renderer are used for this hidden review cohort. Public selection and production admission remain disabled.</p>
      <p><strong>Coverage</strong> ${readback.counts.reviewCohortSourceCount} eligible sources · ${readback.counts.reviewCohortMacroContextCount} macro contexts · ${readback.counts.reviewCohortQuestionCount} review questions.</p>
      <p><strong>Operator decision required</strong> Review semantic coherence, quantity-role binding, answer unit, N+1 depth, and PBL dependency integrity.</p>
    </div>
    <h2>Before / After Review Pairs</h2>
    ${pairCards(readback)}
    <h2>Unit-flow Review Matrix</h2>
    <div class="postg-unit-flow"><table><thead><tr><th>Source</th><th>KP</th><th>Original</th><th>Exact generator</th><th>Semantic inference</th><th>Review unit</th><th>Status</th></tr></thead><tbody>${unitFlowRows(readback)}</tbody></table></div>
    <h2>PBL Review Sections</h2>
    ${pblCards(readback)}
  </section>`;
}

const generationSeed = process.env.POSTG_APP_W01_A05_SEED ?? 'postg-app-w01-a05-e4-review';
const readback = buildW01E4ProductionReviewReadback({ root: ROOT, generationSeed });
if (!readback.ok || !readback.humanReviewReady) {
  throw new Error(`POSTG-APP W01-A05 runtime failed: ${JSON.stringify(readback.issues)}`);
}

let html = renderWorksheetDocumentToHtml(readback.worksheetDocument, {
  title: readback.worksheetDocument.title,
  stylesheetHref: '../../../../site/assets/styles/print-styles.css',
  debugDataAttributes: false
});
html = html
  .replace('<head>', '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="POSTG-APP-W01-A05 E4 Human Review">')
  .replace('</body>', `${reviewAppendix(readback)}</body>`);
html = `${html}\n`;

const reviewData = {
  schemaName: 'POSTGAPPW01A05ProductionEquivalentReviewDataV1',
  schemaVersion: 1,
  taskId: readback.taskId,
  status: 'PRODUCTION_EQUIVALENT_HTML_GENERATED_PDF_PENDING',
  generationSeed,
  counts: readback.counts,
  selectedSources: readback.selectedSources,
  selectedMacros: readback.selectedMacros,
  reviewPairs: readback.reviewPairs,
  unitFlowReviewRows: readback.unitFlowReviewRows,
  pblReviewSections: readback.pblReviewSections,
  exactGenerationFailures: readback.exactGenerationFailures,
  productionSelectable: false,
  publicRouteChanged: false,
  productionAdmissionGranted: false,
  humanReviewReady: true
};
const dataText = `${JSON.stringify(reviewData, null, 2)}\n`;
const manifest = {
  schemaName: 'POSTGAPPW01A05ProductionEquivalentReviewManifestV1',
  schemaVersion: 1,
  taskId: readback.taskId,
  status: 'HTML_REVIEW_PASS_PDF_PENDING',
  evidenceLevel: 'E3_SHADOW_RUNTIME_INTEGRATED',
  generationSeed,
  exactProductionGeneratorUsed: true,
  productionRendererUsed: true,
  productionSelectable: false,
  publicRouteChanged: false,
  productionAdmissionGranted: false,
  reviewCohortQuestionCount: readback.counts.reviewCohortQuestionCount,
  reviewCohortSourceCount: readback.counts.reviewCohortSourceCount,
  reviewCohortMacroContextCount: readback.counts.reviewCohortMacroContextCount,
  mathPreservedCount: readback.counts.mathPreservedCount,
  promptChangedCount: readback.counts.promptChangedCount,
  pblReviewSectionCount: readback.counts.pblReviewSectionCount,
  unresolvedUnitReviewCount: readback.counts.unresolvedUnitReviewCount,
  questionPageCount: readback.counts.questionPageCount,
  answerKeyPageCount: readback.counts.answerKeyPageCount,
  expectedMinimumPdfPageCount: readback.counts.questionPageCount + readback.counts.answerKeyPageCount,
  actualPdfPageCount: null,
  extractedQuestionMarkerCount: null,
  extractedAnswerMarkerCount: null,
  forbiddenVisibleLabelCount: null,
  htmlPath: 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW.html',
  pdfPath: 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW.pdf',
  extractedTextPath: 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW.extracted.txt',
  reviewDataPath: 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW_DATA.json',
  htmlSha256: sha256(html),
  reviewDataSha256: sha256(dataText),
  pdfSha256: null,
  pdfBytes: null,
  humanReviewReady: false
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(HTML_PATH, html, 'utf8');
writeFileSync(DATA_PATH, dataText, 'utf8');
writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  htmlPath: HTML_PATH,
  pdfPath: PDF_PATH,
  dataPath: DATA_PATH,
  manifestPath: MANIFEST_PATH,
  reviewCohortQuestionCount: manifest.reviewCohortQuestionCount,
  reviewCohortSourceCount: manifest.reviewCohortSourceCount,
  reviewCohortMacroContextCount: manifest.reviewCohortMacroContextCount,
  expectedMinimumPdfPageCount: manifest.expectedMinimumPdfPageCount
}, null, 2));
