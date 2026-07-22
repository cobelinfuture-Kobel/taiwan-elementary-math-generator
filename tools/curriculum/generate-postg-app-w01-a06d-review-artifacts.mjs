import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { renderWorksheetDocumentToHtml } from '../../site/modules/renderer/html-renderer-s57f5-extension.js';
import { buildW01A06DProductionReviewReadback } from '../../src/curriculum/application/w01-a06d-production-review-runtime.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUT_DIR = resolve(ROOT, 'docs/curriculum/output/postg-app');
const HTML_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW.html');
const PDF_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW.pdf');
const DATA_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW_DATA.json');
const MANIFEST_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW_MANIFEST.json');

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

function quantityFactList(pair) {
  if (!Array.isArray(pair.quantityFacts) || pair.quantityFacts.length === 0) {
    return '<p class="postg-review-note">此題保留數字題形式，未強套生活情境。</p>';
  }
  return `<ul class="postg-quantity-facts">${pair.quantityFacts.map((fact) => (
    `<li><span>${escapeHtml(fact.role)}</span>：${escapeHtml(fact.value)}${escapeHtml(fact.unit)} ${escapeHtml(fact.entity)}</li>`
  )).join('')}</ul>`;
}

function reviewCards(readback) {
  return readback.reviewPairs.map((pair, index) => `
    <article class="postg-review-pair" data-binding-id="${escapeHtml(pair.bindingCandidateId)}" data-macro-id="${escapeHtml(pair.macroContextId)}">
      <h3>${index + 1}. ${escapeHtml(pair.knowledgePointId)}</h3>
      <p class="postg-review-meta">${escapeHtml(pair.semanticClass)} · ${escapeHtml(pair.suitability)} · ${escapeHtml(pair.templateFamilyId)}</p>
      <p><strong>原始數學題意</strong> ${escapeHtml(pair.originalPrompt)}</p>
      <p><strong>修正版題目</strong> ${escapeHtml(pair.remediatedPrompt)}</p>
      <p><strong>核對結果</strong> ${escapeHtml(pair.answerText)}${pair.answerUnit && !String(pair.answerText ?? '').endsWith(pair.answerUnit) ? escapeHtml(pair.answerUnit) : ''}</p>
      <p><strong>數量角色</strong></p>
      ${quantityFactList(pair)}
      <p class="postg-review-proof"><strong>固定證據</strong> 數學 witness：${pair.mathPreserved ? 'PASS' : 'FAIL'} · 數字事實：${pair.numberFactsPreserved ? 'PASS' : 'FAIL'} · 題目級情境標題：${pair.questionLevelMacroTitleVisible ? 'VISIBLE' : 'HIDDEN'}</p>
      <fieldset>
        <legend>第二次人工審核</legend>
        <label>語句自然 <input type="checkbox"></label>
        <label>數量角色正確 <input type="checkbox"></label>
        <label>單位正確 <input type="checkbox"></label>
        <label>數學關係正確 <input type="checkbox"></label>
        <label>核准 <input type="checkbox"></label>
        <label>退回 <input type="checkbox"></label>
      </fieldset>
    </article>`).join('');
}

function unitRows(readback) {
  return readback.unitReviewRows.map((row) => `
    <tr>
      <td>${escapeHtml(row.sourceId)}</td>
      <td>${escapeHtml(row.knowledgePointId)}</td>
      <td>${escapeHtml(row.semanticClass)}</td>
      <td>${escapeHtml(row.suitability)}</td>
      <td>${escapeHtml(row.remediatedAnswerUnit)}</td>
      <td>${escapeHtml(row.answerShape)}</td>
      <td>${escapeHtml(row.unitPolicy)}</td>
    </tr>`).join('');
}

function reviewAppendix(readback) {
  return `
  <section class="postg-human-review-dossier">
    <style>
      .postg-human-review-dossier{break-before:page;padding:10mm;font-family:Arial,"Noto Sans TC",sans-serif;color:#111}
      .postg-review-summary,.postg-unit-flow,.postg-review-pair{border:1px solid #999;border-radius:6px;padding:8px;margin:0 0 10px;break-inside:avoid}
      .postg-review-pair h3{margin:0 0 4px;font-size:13px}
      .postg-review-pair p{margin:3px 0;font-size:11px;line-height:1.45}
      .postg-review-meta,.postg-review-note,.postg-review-proof{color:#444}
      .postg-quantity-facts{margin:2px 0 5px;padding-left:20px;font-size:10px}
      .postg-human-review-dossier table{border-collapse:collapse;width:100%;font-size:8.5px}
      .postg-human-review-dossier th,.postg-human-review-dossier td{border:1px solid #aaa;padding:3px;vertical-align:top}
      .postg-human-review-dossier fieldset{margin-top:6px;font-size:9px}
      .postg-human-review-dossier label{display:inline-block;margin-right:8px}
      @media print{.postg-review-pair,.postg-unit-flow{break-inside:avoid}}
    </style>
    <h1>Wave 01 應用題語意修正版人工審核</h1>
    <div class="postg-review-summary">
      <p><strong>任務</strong> ${escapeHtml(readback.taskId)}</p>
      <p><strong>範圍</strong> 16 題、12 個來源單元；16 個 Macro Context 僅保留於 metadata，不作為題目標題或固定開頭。</p>
      <p><strong>固定邊界</strong> 使用既有 exact generator lineage 與 production renderer；公開選單與 production admission 均未開放。</p>
      <p><strong>本次審核</strong> 檢查語句自然度、數量角色、單位、比較／範圍／總量／分組語意與 numeric-only 邊界。</p>
    </div>
    <h2>逐題審核</h2>
    ${reviewCards(readback)}
    <h2>單位與結果形狀矩陣</h2>
    <div class="postg-unit-flow"><table><thead><tr><th>Source</th><th>KP</th><th>Semantic class</th><th>Suitability</th><th>Review unit</th><th>Answer shape</th><th>Unit policy</th></tr></thead><tbody>${unitRows(readback)}</tbody></table></div>
  </section>`;
}

const readback = buildW01A06DProductionReviewReadback({ root: ROOT });
if (!readback.ok || !readback.reviewDocumentReady) {
  throw new Error(`POSTG-APP W01-A06D runtime failed: ${JSON.stringify(readback.issues)}`);
}

let html = renderWorksheetDocumentToHtml(readback.worksheetDocument, {
  title: readback.worksheetDocument.title,
  stylesheetHref: '../../../../site/assets/styles/print-styles.css',
  debugDataAttributes: false
});
html = html
  .replace('<head>', '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="POSTG-APP-W01-A06D Remediated Human Review">')
  .replace('</body>', `${reviewAppendix(readback)}</body>`);
html = `${html}\n`;

const reviewData = {
  schemaName: 'POSTGAPPW01A06DRegeneratedProductionReviewDataV1',
  schemaVersion: 1,
  taskId: readback.taskId,
  status: 'REGENERATED_PRODUCTION_EQUIVALENT_HTML_GENERATED_PDF_PENDING',
  counts: readback.counts,
  selectedSources: readback.selectedSources,
  selectedMacros: readback.selectedMacros,
  reviewPairs: readback.reviewPairs,
  unitReviewRows: readback.unitReviewRows,
  pblReviewSections: readback.pblReviewSections,
  questionLevelMacroTitleVisible: false,
  productionSelectable: false,
  publicRouteChanged: false,
  productionAdmissionGranted: false,
  humanReviewReady: false
};
const dataText = `${JSON.stringify(reviewData, null, 2)}\n`;
const manifest = {
  schemaName: 'POSTGAPPW01A06DRegeneratedProductionReviewManifestV1',
  schemaVersion: 1,
  taskId: readback.taskId,
  status: 'REGENERATED_HTML_REVIEW_PASS_PDF_PENDING',
  evidenceLevel: 'E3_SHADOW_RUNTIME_INTEGRATED',
  exactProductionGeneratorUsed: true,
  productionRendererUsed: true,
  questionLevelMacroTitleVisible: false,
  productionSelectable: false,
  publicRouteChanged: false,
  productionAdmissionGranted: false,
  reviewCohortQuestionCount: readback.counts.reviewCohortQuestionCount,
  reviewCohortSourceCount: readback.counts.reviewCohortSourceCount,
  reviewCohortMacroContextCount: readback.counts.reviewCohortMacroContextCount,
  mathPreservedCount: readback.counts.mathPreservedCount,
  numberFactsPreservedCount: readback.counts.numberFactsPreservedCount,
  promptChangedCount: readback.counts.promptChangedCount,
  visibleTitleCount: readback.counts.visibleTitleCount,
  forbiddenMacroPrefixCount: readback.counts.forbiddenMacroPrefixCount,
  genericVisibleUnitCount: readback.counts.genericVisibleUnitCount,
  applicationSurfaceCount: readback.counts.applicationSurfaceCount,
  numericPreservedCount: readback.counts.numericPreservedCount,
  questionPageCount: readback.counts.questionPageCount,
  answerKeyPageCount: readback.counts.answerKeyPageCount,
  expectedMinimumPdfPageCount: readback.counts.questionPageCount + readback.counts.answerKeyPageCount,
  actualPdfPageCount: null,
  extractedReviewCardCount: null,
  forbiddenVisibleLabelCount: null,
  forbiddenMacroLabelCount: null,
  htmlPath: 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW.html',
  pdfPath: 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW.pdf',
  extractedTextPath: 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW.extracted.txt',
  reviewDataPath: 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW_DATA.json',
  htmlSha256: sha256(html),
  reviewDataSha256: sha256(dataText),
  pdfSha256: null,
  pdfBytes: null,
  humanReviewReady: false,
  reviewDecision: 'PENDING_SECOND_OPERATOR_DECISION'
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
