import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const OUT_DIR = resolve(ROOT, 'docs/curriculum/output/postg-app');
const HTML_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW.html');
const PDF_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW.pdf');
const TXT_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW.extracted.txt');
const DATA_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW_DATA.json');
const MANIFEST_PATH = resolve(OUT_DIR, 'POSTG_APP_W01_A06D_REVIEW_MANIFEST.json');

const MACRO_LABELS = [
  '公益、合作與資源共享',
  '商業、交易與預算',
  '社區、公民與公共服務',
  '文化、歷史與地方記憶',
  '資料、統計與公共資訊',
  '防災、應變與韌性',
  '環境保護與生態保育',
  '食物、農業與生產',
  '未來生活與永續設計',
  '健康、運動與競賽',
  '家庭與日常生活',
  '學校與學習',
  '科學、科技與觀察',
  '交通、移動與行程',
  '水資源與能源',
  '工作流程、物流與配送'
];

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function occurrenceCount(text, token) {
  return text.split(token).length - 1;
}

const html = readFileSync(HTML_PATH);
const pdf = readFileSync(PDF_PATH);
const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));

execFileSync('pdftotext', ['-layout', PDF_PATH, TXT_PATH]);
const extracted = readFileSync(TXT_PATH, 'utf8');
const pdfInfo = execFileSync('pdfinfo', [PDF_PATH], { encoding: 'utf8' });
const pageMatch = /^Pages:\s+(\d+)$/m.exec(pdfInfo);
const actualPdfPageCount = Number(pageMatch?.[1] ?? 0);
const forbiddenVisibleLabelCount = ['算式', '答：', '_____']
  .reduce((count, label) => count + occurrenceCount(extracted, label), 0);
const forbiddenMacroLabelCount = MACRO_LABELS
  .reduce((count, label) => count + occurrenceCount(extracted, label), 0);
const extractedReviewCardCount = occurrenceCount(extracted, '修正版題目');
const extractedSourceCount = data.selectedSources.filter((sourceId) => extracted.includes(sourceId)).length;
const extractedHumanReviewHeadingCount = extracted.includes('Wave 01 應用題語意修正版人工審核') ? 1 : 0;
const representativeChecks = {
  compare: extracted.includes('甲隊有5979張運動會集點卡')
    && extracted.includes('乙隊有2172張運動會集點卡'),
  range: extracted.includes('超過2478箱')
    && extracted.includes('少於3437箱')
    && extracted.includes('A批有2395箱')
    && extracted.includes('B批有3276箱'),
  addition: extracted.includes('1594個寶特瓶')
    && extracted.includes('6個寶特瓶')
};

const failures = [];
if (pdf.length < 10000) failures.push('PDF_TOO_SMALL');
if (actualPdfPageCount < manifest.expectedMinimumPdfPageCount) failures.push('PDF_PAGE_COUNT_BELOW_WORKSHEET_MINIMUM');
if (forbiddenVisibleLabelCount !== 0) failures.push('FORBIDDEN_VISIBLE_LABEL_FOUND');
if (forbiddenMacroLabelCount !== 0) failures.push('QUESTION_LEVEL_MACRO_LABEL_VISIBLE');
if (data.counts.reviewCohortQuestionCount !== 16 || data.reviewPairs.length !== 16) failures.push('REVIEW_QUESTION_COUNT_MISMATCH');
if (data.counts.reviewCohortSourceCount !== 12 || data.selectedSources.length !== 12) failures.push('ELIGIBLE_SOURCE_COUNT_MISMATCH');
if (data.counts.reviewCohortMacroContextCount !== 16 || data.selectedMacros.length !== 16) failures.push('MACRO_METADATA_COVERAGE_MISMATCH');
if (data.counts.mathPreservedCount !== 16) failures.push('MATHEMATICAL_WITNESS_NOT_FULLY_PRESERVED');
if (data.counts.numberFactsPreservedCount !== 16) failures.push('NUMERIC_FACTS_NOT_FULLY_PRESERVED');
if (data.counts.promptChangedCount !== 16) failures.push('REJECTED_PROMPT_REMEDIATION_INCOMPLETE');
if (data.counts.visibleTitleCount !== 0 || data.counts.forbiddenMacroPrefixCount !== 0) failures.push('VISIBLE_TITLE_POLICY_INVALID');
if (data.counts.genericVisibleUnitCount !== 0) failures.push('GENERIC_VISIBLE_UNIT_REMAINS');
if (extractedReviewCardCount !== 16) failures.push('PDF_REVIEW_CARD_COUNT_MISMATCH');
if (extractedSourceCount !== data.selectedSources.length) failures.push('PDF_SOURCE_COVERAGE_MISMATCH');
if (extractedHumanReviewHeadingCount !== 1) failures.push('HUMAN_REVIEW_DOSSIER_MISSING');
if (!Object.values(representativeChecks).every(Boolean)) failures.push('REPRESENTATIVE_REMEDIATION_TEXT_MISSING');
if (data.productionAdmissionGranted !== false || data.productionSelectable !== false || data.publicRouteChanged !== false) failures.push('PRODUCTION_BOUNDARY_INVALID');
if (failures.length > 0) {
  throw new Error(`POSTG-APP W01-A06D PDF evidence failed: ${failures.join(',')}`);
}

const finalizedData = {
  ...data,
  status: 'REGENERATED_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY',
  actualPdfPageCount,
  extractedReviewCardCount,
  forbiddenVisibleLabelCount,
  forbiddenMacroLabelCount,
  representativeChecks,
  humanReviewReady: true,
  reviewDecision: 'PENDING_SECOND_OPERATOR_DECISION',
  productionAdmissionGranted: false
};
const finalizedDataText = `${JSON.stringify(finalizedData, null, 2)}\n`;
writeFileSync(DATA_PATH, finalizedDataText, 'utf8');

const finalized = {
  ...manifest,
  status: 'REGENERATED_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY',
  evidenceLevel: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED',
  actualPdfPageCount,
  extractedReviewCardCount,
  extractedSourceCount,
  extractedHumanReviewHeadingCount,
  forbiddenVisibleLabelCount,
  forbiddenMacroLabelCount,
  representativeChecks,
  htmlSha256: sha256(html),
  reviewDataSha256: sha256(Buffer.from(finalizedDataText, 'utf8')),
  pdfSha256: sha256(pdf),
  extractedTextSha256: sha256(readFileSync(TXT_PATH)),
  pdfBytes: pdf.length,
  humanReviewReady: true,
  productionAdmissionGranted: false,
  reviewDecision: 'PENDING_SECOND_OPERATOR_DECISION'
};
writeFileSync(MANIFEST_PATH, `${JSON.stringify(finalized, null, 2)}\n`, 'utf8');

console.log(JSON.stringify({
  manifestPath: MANIFEST_PATH,
  status: finalized.status,
  evidenceLevel: finalized.evidenceLevel,
  actualPdfPageCount,
  pdfBytes: finalized.pdfBytes,
  extractedReviewCardCount,
  extractedSourceCount,
  forbiddenVisibleLabelCount,
  forbiddenMacroLabelCount,
  representativeChecks,
  humanReviewReady: finalized.humanReviewReady
}, null, 2));
