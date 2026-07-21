import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUT_DIR = resolve(ROOT, 'docs/curriculum/output/postg-app');
const HTML_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW.html');
const PDF_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW.pdf');
const TXT_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW.extracted.txt');
const DATA_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW_DATA.json');
const MANIFEST_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A05_REVIEW_MANIFEST.json');

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

const html = readFileSync(HTML_PATH);
const pdf = readFileSync(PDF_PATH);
const dataText = readFileSync(DATA_PATH);
const data = JSON.parse(dataText.toString('utf8'));
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

execFileSync('pdftotext', ['-layout', PDF_PATH, TXT_PATH]);
const extracted = readFileSync(TXT_PATH, 'utf8');
const pdfInfo = execFileSync('pdfinfo', [PDF_PATH], { encoding: 'utf8' });
const pageMatch = /^Pages:\s+(\d+)$/m.exec(pdfInfo);
const actualPdfPageCount = Number(pageMatch?.[1] ?? 0);
const forbiddenVisibleLabelCount = ['算式', '答：', '_____']
  .reduce((count, label) => count + (extracted.split(label).length - 1), 0);
const extractedSourceCount = data.selectedSources.filter((sourceId) => extracted.includes(sourceId)).length;
const extractedMacroCount = data.selectedMacros.filter((macroId) => extracted.includes(macroId)).length;
const extractedHumanReviewHeadingCount = extracted.includes('Wave 01 Application Human Review Dossier') ? 1 : 0;

const failures = [];
if (pdf.length < 10000) failures.push('PDF_TOO_SMALL');
if (actualPdfPageCount < manifest.expectedMinimumPdfPageCount) failures.push('PDF_PAGE_COUNT_BELOW_WORKSHEET_MINIMUM');
if (forbiddenVisibleLabelCount !== 0) failures.push('FORBIDDEN_VISIBLE_LABEL_FOUND');
if (extractedSourceCount !== data.selectedSources.length) failures.push('PDF_SOURCE_COVERAGE_MISMATCH');
if (extractedMacroCount !== data.selectedMacros.length) failures.push('PDF_MACRO_CONTEXT_COVERAGE_MISMATCH');
if (extractedHumanReviewHeadingCount !== 1) failures.push('HUMAN_REVIEW_DOSSIER_MISSING');
if (data.counts.mathPreservedCount !== data.counts.reviewCohortQuestionCount) failures.push('MATHEMATICAL_WITNESS_NOT_FULLY_PRESERVED');
if (data.counts.promptChangedCount !== data.counts.reviewCohortQuestionCount) failures.push('VISIBLE_CONTEXT_CHANGE_INCOMPLETE');
if (data.productionAdmissionGranted !== false || data.productionSelectable !== false) failures.push('PRODUCTION_BOUNDARY_INVALID');
if (failures.length > 0) throw new Error(`POSTG-APP W01-A05 PDF evidence failed: ${failures.join(',')}`);

const finalized = {
  ...manifest,
  status: 'PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY',
  evidenceLevel: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED',
  actualPdfPageCount,
  extractedSourceCount,
  extractedMacroCount,
  extractedHumanReviewHeadingCount,
  forbiddenVisibleLabelCount,
  htmlSha256: sha256(html),
  reviewDataSha256: sha256(dataText),
  pdfSha256: sha256(pdf),
  extractedTextSha256: sha256(readFileSync(TXT_PATH)),
  pdfBytes: pdf.length,
  humanReviewReady: true,
  productionAdmissionGranted: false,
  reviewDecision: 'PENDING_OPERATOR_DECISION'
};
writeFileSync(MANIFEST_PATH, `${JSON.stringify(finalized, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  manifestPath: MANIFEST_PATH,
  status: finalized.status,
  evidenceLevel: finalized.evidenceLevel,
  actualPdfPageCount,
  pdfBytes: finalized.pdfBytes,
  extractedSourceCount,
  extractedMacroCount,
  forbiddenVisibleLabelCount,
  humanReviewReady: finalized.humanReviewReady
}, null, 2));
