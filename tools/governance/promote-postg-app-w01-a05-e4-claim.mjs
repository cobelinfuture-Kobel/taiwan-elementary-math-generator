import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../..');
const repoPath = (relative) => resolve(ROOT, relative);
const CLAIM_REL = 'data/project/milestones/POSTG-APP-W01-A05.claim.json';
const CONTRACT_REL = 'data/curriculum/application/contracts/POSTG-APP-W01-A05_UnitFlowExactGeneratorRendererAndHumanReviewRemediation.json';
const HTML_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW.html';
const PDF_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW.pdf';
const TXT_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW.extracted.txt';
const DATA_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW_DATA.json';
const MANIFEST_REL = 'docs/curriculum/output/postg-app/POSTG_APP_W01_A05_REVIEW_MANIFEST.json';
const MARKER_REL = 'docs/curriculum/output/POSTG_APP_W01_A05_E4_HUMAN_REVIEW_READY.marker';
const READBACK_REL = 'docs/curriculum/output/POSTG_APP_W01_A05_E4_HUMAN_REVIEW_READBACK.md';

function sha256(relativePath) {
  return createHash('sha256').update(readFileSync(repoPath(relativePath))).digest('hex');
}

const manifest = JSON.parse(readFileSync(repoPath(MANIFEST_REL), 'utf8'));
if (manifest.status !== 'PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY'
    || manifest.evidenceLevel !== 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
    || manifest.exactProductionGeneratorUsed !== true
    || manifest.productionRendererUsed !== true
    || manifest.humanReviewReady !== true
    || manifest.productionAdmissionGranted !== false) {
  throw new Error(`A05 manifest not promotable: ${JSON.stringify(manifest)}`);
}

const artifactPaths = [HTML_REL, PDF_REL, TXT_REL, DATA_REL, MANIFEST_REL];
const artifactHashes = artifactPaths.map((path) => ({ path, sha256: sha256(path) }));
const claim = JSON.parse(readFileSync(repoPath(CLAIM_REL), 'utf8'));
claim.actualEvidenceLevel = 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED';
claim.claimedStatus = 'PRODUCTION_EQUIVALENT_HTML_PDF_HUMAN_REVIEW_READY';
claim.claims.productionEquivalentGeneratorUsed = true;
claim.claims.productionRendererUsed = true;
claim.claims.htmlOutputVerified = true;
claim.claims.pdfOutputVerified = true;
claim.claims.visibleOutputChanged = true;
claim.claims.humanReviewReady = true;
claim.claims.productionAdmitted = false;
claim.claims.d0Complete = false;
claim.evidence.htmlArtifactPaths = [HTML_REL];
claim.evidence.pdfArtifactPaths = [PDF_REL];
claim.evidence.beforeAfterEvidencePaths = [DATA_REL];
claim.evidence.reviewArtifactPaths = artifactPaths;
claim.evidence.artifactHashes = artifactHashes;
claim.distance.distanceReduced = 'exact production generator routes and the shared production renderer now produce a hash-locked HTML/PDF review cohort covering every eligible source and all 16 Macro Context Domains; production remains closed pending operator decision';
claim.nextStep = {
  taskId: 'POSTG-APP-W01-A06_HumanReviewDecisionAndProductionAdmissionRemediation',
  requiredEvidenceLevelBeforeStart: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED'
};
writeFileSync(repoPath(CLAIM_REL), `${JSON.stringify(claim, null, 2)}\n`, 'utf8');

const contract = JSON.parse(readFileSync(repoPath(CONTRACT_REL), 'utf8'));
contract.status = 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED_HUMAN_REVIEW_READY';
contract.evidenceResult = {
  evidenceLevel: 'E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED',
  reviewCohortQuestionCount: manifest.reviewCohortQuestionCount,
  reviewCohortSourceCount: manifest.reviewCohortSourceCount,
  reviewCohortMacroContextCount: manifest.reviewCohortMacroContextCount,
  mathPreservedCount: manifest.mathPreservedCount,
  promptChangedCount: manifest.promptChangedCount,
  pblReviewSectionCount: manifest.pblReviewSectionCount,
  unresolvedUnitReviewCount: manifest.unresolvedUnitReviewCount,
  actualPdfPageCount: manifest.actualPdfPageCount,
  humanReviewReady: true,
  productionAdmissionGranted: false,
  artifactHashes
};
writeFileSync(repoPath(CONTRACT_REL), `${JSON.stringify(contract, null, 2)}\n`, 'utf8');

const marker = `PASS_E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED\nTASK_ID=POSTG-APP-W01-A05_UnitFlowExactGeneratorRendererAndHumanReviewRemediation\nHUMAN_REVIEW_READY=true\nPRODUCTION_ADMITTED=false\nNEXT=POSTG-APP-W01-A06_HumanReviewDecisionAndProductionAdmissionRemediation\n`;
writeFileSync(repoPath(MARKER_REL), marker, 'utf8');

const readback = `# POSTG-APP W01-A05 E4 Human Review Readback\n\n\`\`\`text\nSTATUS = PASS_E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED\nHUMAN_REVIEW_READY = true\nPRODUCTION_ADMITTED = false\nREVIEW_DECISION = PENDING_OPERATOR_DECISION\n\`\`\`\n\n## Coverage\n\n- Review questions: ${manifest.reviewCohortQuestionCount}\n- Eligible source units: ${manifest.reviewCohortSourceCount}\n- Macro Context Domains: ${manifest.reviewCohortMacroContextCount}\n- Mathematical witnesses preserved: ${manifest.mathPreservedCount}\n- Visible prompts changed: ${manifest.promptChangedCount}\n- PBL review sections: ${manifest.pblReviewSectionCount}\n- Unit-flow rows still requiring review: ${manifest.unresolvedUnitReviewCount}\n- PDF pages: ${manifest.actualPdfPageCount}\n\n## Evidence\n\n- HTML: \`${HTML_REL}\`\n- PDF: \`${PDF_REL}\`\n- Extracted text: \`${TXT_REL}\`\n- Review data: \`${DATA_REL}\`\n- Manifest: \`${MANIFEST_REL}\`\n\n## Required operator decision\n\nReview semantic naturalness, quantity-role correctness, answer unit, N/N+1 depth, PBL authenticity and dependency integrity. Record APPROVE or REJECT. No automated approval is allowed.\n`;
writeFileSync(repoPath(READBACK_REL), readback, 'utf8');

console.log(JSON.stringify({
  claim: CLAIM_REL,
  contract: CONTRACT_REL,
  marker: MARKER_REL,
  readback: READBACK_REL,
  evidenceLevel: claim.actualEvidenceLevel,
  humanReviewReady: claim.claims.humanReviewReady,
  artifactHashCount: artifactHashes.length
}, null, 2));
