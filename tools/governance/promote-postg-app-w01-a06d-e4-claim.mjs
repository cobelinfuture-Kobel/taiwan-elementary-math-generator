import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const repoPath = (relative) => resolve(ROOT, relative);
const CLAIM_REL = 'data/project/milestones/POSTG-APP-W01-A06.claim.json';
const REVIEW_DECISION_REL = 'data/curriculum/application/reviews/POSTG-APP-W01-A06_HumanReviewDecisionAndSemanticRemediation.json';
const CONTRACT_REL = 'docs/curriculum/application/contracts/POSTG_APP_W01_A06_Human_Review_Decision_And_Semantic_Remediation_V1.md';
const HTML_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW.html';
const PDF_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW.pdf';
const TXT_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW.extracted.txt';
const DATA_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW_DATA.json';
const MANIFEST_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A06D_REVIEW_MANIFEST.json';
const MARKER_REL = 'docs/curriculum/output/POSTG_APP_W01_A06D_E4_HUMAN_REVIEW_READY.marker';
const READBACK_REL = 'docs/curriculum/output/POSTG_APP_W01_A06D_E4_HUMAN_REVIEW_READBACK.md';

function sha256(relativePath) {
  return createHash('sha256').update(readFileSync(repoPath(relativePath))).digest('hex');
}

const manifest = JSON.parse(readFileSync(repoPath(MANIFEST_REL), 'utf8'));
if (manifest.status !== 'REGENERATED_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY'
    || manifest.evidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
    || manifest.exactProductionGeneratorUsed !== true
    || manifest.productionRendererUsed !== true
    || manifest.questionLevelMacroTitleVisible !== false
    || manifest.forbiddenMacroLabelCount !== 0
    || manifest.genericVisibleUnitCount !== 0
    || manifest.mathPreservedCount !== 16
    || manifest.numberFactsPreservedCount !== 16
    || manifest.humanReviewReady !== true
    || manifest.productionAdmissionGranted !== false) {
  throw new Error(`A06D manifest not promotable: ${JSON.stringify(manifest)}`);
}

const artifactPaths = [HTML_REL, PDF_REL, TXT_REL, DATA_REL, MANIFEST_REL];
const artifactHashes = artifactPaths.map((path) => ({ path, sha256: sha256(path) }));
const claim = JSON.parse(readFileSync(repoPath(CLAIM_REL), 'utf8'));
claim.actualEvidenceLevel = 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED';
claim.claimedStatus = 'REGENERATED_PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY';
claim.claims.productionEquivalentGeneratorUsed = true;
claim.claims.productionRendererUsed = true;
claim.claims.htmlOutputVerified = true;
claim.claims.pdfOutputVerified = true;
claim.claims.visibleOutputChanged = true;
claim.claims.humanReviewReady = true;
claim.claims.productionAdmitted = false;
claim.claims.d0Complete = false;
claim.evidence.runtimeTestPaths = [...new Set([
  ...(claim.evidence.runtimeTestPaths ?? []),
  'src/curriculum/application/w01-a06d-production-review-runtime.mjs',
  'tests/curriculum/postg-app-w01-a06d-production-review.test.js'
])];
claim.evidence.rendererTestPaths = [
  'site/modules/renderer/html-renderer-s57f5-extension.js',
  'tools/curriculum/generate-postg-app-w01-a06d-review-artifacts.mjs',
  'tools/curriculum/render-postg-app-w01-a06d-review-pdf.mjs',
  'tools/curriculum/finalize-postg-app-w01-a06d-review-evidence.mjs',
  '.github/workflows/postg-app-w01-a06d-regenerated-review.yml'
];
claim.evidence.htmlArtifactPaths = [HTML_REL];
claim.evidence.pdfArtifactPaths = [PDF_REL];
claim.evidence.beforeAfterEvidencePaths = [...new Set([
  ...(claim.evidence.beforeAfterEvidencePaths ?? []),
  DATA_REL,
  MANIFEST_REL
])];
claim.evidence.reviewArtifactPaths = artifactPaths;
claim.evidence.artifactHashes = artifactHashes;
claim.humanReview = {
  type: 'production_equivalent_output_review',
  canUnlockProduction: true,
  reviewArtifactRequired: true
};
claim.distance = {
  before: 'D1',
  after: 'D1',
  distanceReduced: 'The relation-specific A06C shadow surfaces now run through the existing production renderer and produce a hash-locked HTML/PDF second Human Review package. Question-level Macro Context titles are absent, mathematical and numeric facts remain exact, concrete units replace generic placeholders, and production admission remains closed pending explicit operator approval.'
};
claim.nextStep = {
  taskId: 'POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision',
  requiredEvidenceLevelBeforeStart: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
};
writeFileSync(repoPath(CLAIM_REL), `${JSON.stringify(claim, null, 2)}\n`, 'utf8');

const reviewDecision = JSON.parse(readFileSync(repoPath(REVIEW_DECISION_REL), 'utf8'));
reviewDecision.a06dEvidenceResult = {
  status: manifest.status,
  evidenceLevel: manifest.evidenceLevel,
  reviewCohortQuestionCount: manifest.reviewCohortQuestionCount,
  reviewCohortSourceCount: manifest.reviewCohortSourceCount,
  reviewCohortMacroContextCount: manifest.reviewCohortMacroContextCount,
  mathPreservedCount: manifest.mathPreservedCount,
  numberFactsPreservedCount: manifest.numberFactsPreservedCount,
  promptChangedCount: manifest.promptChangedCount,
  questionLevelMacroTitleVisible: manifest.questionLevelMacroTitleVisible,
  forbiddenMacroLabelCount: manifest.forbiddenMacroLabelCount,
  genericVisibleUnitCount: manifest.genericVisibleUnitCount,
  applicationSurfaceCount: manifest.applicationSurfaceCount,
  numericPreservedCount: manifest.numericPreservedCount,
  actualPdfPageCount: manifest.actualPdfPageCount,
  humanReviewReady: true,
  secondHumanReviewDecision: 'PENDING_SECOND_OPERATOR_DECISION',
  productionAdmissionGranted: false,
  artifactHashes
};
reviewDecision.productionAdmissionGranted = false;
reviewDecision.nextPhase = {
  taskId: 'POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision',
  scope: 'Review the regenerated HTML/PDF package and record APPROVE, REJECT or REMEDIATION_REQUIRED. No automated approval is allowed.'
};
writeFileSync(repoPath(REVIEW_DECISION_REL), `${JSON.stringify(reviewDecision, null, 2)}\n`, 'utf8');

const marker = `PASS_E4_REGENERATED_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED\nTASK_ID=POSTG-APP-W01-A06D_RegeneratedHTMLPDFHumanReviewPackage\nQUESTION_LEVEL_MACRO_TITLE_VISIBLE=false\nMATH_PRESERVED_COUNT=16\nNUMBER_FACTS_PRESERVED_COUNT=16\nGENERIC_VISIBLE_UNIT_COUNT=0\nHUMAN_REVIEW_READY=true\nREVIEW_DECISION=PENDING_SECOND_OPERATOR_DECISION\nPRODUCTION_ADMITTED=false\nNEXT=POSTG-APP-W01-A06E_OperatorSecondHumanReviewDecision\n`;
writeFileSync(repoPath(MARKER_REL), marker, 'utf8');

const readback = `# POSTG-APP W01-A06D Regenerated Human Review Readback\n\n\`\`\`text\nSTATUS = PASS_E4_REGENERATED_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED\nHUMAN_REVIEW_READY = true\nREVIEW_DECISION = PENDING_SECOND_OPERATOR_DECISION\nPRODUCTION_ADMITTED = false\n\`\`\`\n\n## Operator findings remediated in the review package\n\n- Question-level Macro Context titles visible: ${manifest.questionLevelMacroTitleVisible}\n- Forbidden Macro labels found in PDF: ${manifest.forbiddenMacroLabelCount}\n- Generic visible units found: ${manifest.genericVisibleUnitCount}\n- Mathematical witnesses preserved: ${manifest.mathPreservedCount}\n- Numeric fact sets preserved: ${manifest.numberFactsPreservedCount}\n- Rejected prompts changed: ${manifest.promptChangedCount}\n- Application surfaces: ${manifest.applicationSurfaceCount}\n- Numeric-preserved surfaces: ${manifest.numericPreservedCount}\n- Review questions: ${manifest.reviewCohortQuestionCount}\n- Eligible source units: ${manifest.reviewCohortSourceCount}\n- Macro Context metadata coverage: ${manifest.reviewCohortMacroContextCount}\n- PDF pages: ${manifest.actualPdfPageCount}\n\n## Evidence\n\n- HTML: \`${HTML_REL}\`\n- PDF: \`${PDF_REL}\`\n- Extracted text: \`${TXT_REL}\`\n- Review data: \`${DATA_REL}\`\n- Manifest: \`${MANIFEST_REL}\`\n\n## Required operator decision\n\nReview the regenerated prompts for natural Taiwanese elementary-school language, quantity-role correctness, unit correctness, mathematical-relation fidelity and the numeric-only boundary. Record APPROVE, REJECT or REMEDIATION_REQUIRED. Production admission remains false until explicit approval.\n`;
writeFileSync(repoPath(READBACK_REL), readback, 'utf8');

const contractAppendix = `\n\n## A06D regenerated E4 evidence\n\n\`\`\`text\nSTATUS = ${manifest.status}\nEVIDENCE_LEVEL = ${manifest.evidenceLevel}\nQUESTION_COUNT = ${manifest.reviewCohortQuestionCount}\nSOURCE_COUNT = ${manifest.reviewCohortSourceCount}\nMACRO_METADATA_COUNT = ${manifest.reviewCohortMacroContextCount}\nQUESTION_LEVEL_MACRO_TITLE_VISIBLE = ${manifest.questionLevelMacroTitleVisible}\nFORBIDDEN_MACRO_LABEL_COUNT = ${manifest.forbiddenMacroLabelCount}\nGENERIC_VISIBLE_UNIT_COUNT = ${manifest.genericVisibleUnitCount}\nMATH_PRESERVED_COUNT = ${manifest.mathPreservedCount}\nNUMBER_FACTS_PRESERVED_COUNT = ${manifest.numberFactsPreservedCount}\nPDF_PAGE_COUNT = ${manifest.actualPdfPageCount}\nHUMAN_REVIEW_READY = true\nSECOND_REVIEW_DECISION = PENDING_SECOND_OPERATOR_DECISION\nPRODUCTION_ADMITTED = false\n\`\`\`\n`;
const contractText = readFileSync(repoPath(CONTRACT_REL), 'utf8');
if (!contractText.includes('## A06D regenerated E4 evidence')) {
  writeFileSync(repoPath(CONTRACT_REL), `${contractText.trimEnd()}${contractAppendix}`, 'utf8');
}

console.log(JSON.stringify({
  claim: CLAIM_REL,
  reviewDecision: REVIEW_DECISION_REL,
  marker: MARKER_REL,
  readback: READBACK_REL,
  evidenceLevel: claim.actualEvidenceLevel,
  humanReviewReady: claim.claims.humanReviewReady,
  productionAdmitted: claim.claims.productionAdmitted,
  artifactHashCount: artifactHashes.length
}, null, 2));
