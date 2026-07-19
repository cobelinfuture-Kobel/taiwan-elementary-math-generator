import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const repoPath = (path) => resolve(ROOT, path);

const paths = {
  claim: "data/project/milestones/GCTX-P13.claim.json",
  contract: "data/curriculum/contracts/GCTX_P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission.json",
  reviewDecision: "data/curriculum/review/GCTX_P13_G3BU04_HUMAN_REVIEW_DECISION.json",
  marker: "docs/curriculum/output/GCTX_P13_G3BU04_PRODUCTION_ADMISSION_PASS.marker",
  readback: "docs/curriculum/output/GCTX_P13_G3BU04_PRODUCTION_ADMISSION_READBACK.md",
  reviewHtml: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.html",
  reviewPdf: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.pdf",
  visibleDiff: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_VISIBLE_DIFF.json",
  publicHtml: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.html",
  publicPdf: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.pdf",
  publicText: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.extracted.txt",
  publicEvidence: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.json",
  publicManifest: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.manifest.json"
};

function sha256File(path) {
  return createHash("sha256").update(readFileSync(repoPath(path))).digest("hex");
}

const manifest = JSON.parse(readFileSync(repoPath(paths.publicManifest), "utf8"));
const productionEvidence = JSON.parse(readFileSync(repoPath(paths.publicEvidence), "utf8"));
const reviewDecision = JSON.parse(readFileSync(repoPath(paths.reviewDecision), "utf8"));

if (manifest.status !== "public_production_html_pdf_admission_pass"
  || manifest.evidenceLevel !== "E5_PRODUCTION_ADMITTED"
  || manifest.productionAdmitted !== true
  || manifest.publicQuerySelectable !== true
  || manifest.publicProductionRegressionPassed !== true
  || manifest.targetQuestionCount !== 5
  || manifest.targetAnswerCount !== 5
  || manifest.uniqueApprovedVariantCount !== 5
  || manifest.mathematicalWitnessCount !== 5
  || manifest.extractedRequiredContextCount !== 5
  || manifest.leakedLegacyTargetPhraseCount !== 0
  || reviewDecision.decision !== "approve_all"
  || reviewDecision.semanticReviewApproved !== true
  || reviewDecision.mathematicalReviewApproved !== true
  || reviewDecision.reviewArtifact.sha256 !== "777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0") {
  throw new Error("GCTX-P13 E5 promotion prerequisites are incomplete.");
}

const finalizedEvidence = {
  ...productionEvidence,
  status: "public_production_html_pdf_admission_pass",
  evidenceLevel: "E5_PRODUCTION_ADMITTED",
  actualPdfPageCount: manifest.actualPdfPageCount,
  pdfSha256: manifest.pdfSha256,
  pdfBytes: manifest.pdfBytes,
  extractedRequiredContextCount: manifest.extractedRequiredContextCount,
  extractedAnswerCount: manifest.extractedAnswerCount,
  publicProductionRegressionPassed: true
};
writeFileSync(repoPath(paths.publicEvidence), `${JSON.stringify(finalizedEvidence, null, 2)}\n`, "utf8");

const artifactPaths = [
  paths.reviewDecision,
  paths.reviewHtml,
  paths.reviewPdf,
  paths.visibleDiff,
  paths.publicHtml,
  paths.publicPdf,
  paths.publicText,
  paths.publicEvidence,
  paths.publicManifest
];
const artifactHashes = artifactPaths.map((path) => ({ path, sha256: sha256File(path) }));

const claim = {
  schemaVersion: 1,
  taskId: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
  taskClass: "release",
  targetEvidenceLevel: "E5_PRODUCTION_ADMITTED",
  actualEvidenceLevel: "E5_PRODUCTION_ADMITTED",
  claimedStatus: "PUBLIC_PRODUCTION_ADMITTED_HTML_PDF_REGRESSION_VERIFIED",
  claims: {
    dataStructureReady: true,
    contentAuthored: true,
    runtimeIntegrated: true,
    productionEquivalentGeneratorUsed: true,
    productionRendererUsed: true,
    htmlOutputVerified: true,
    pdfOutputVerified: true,
    visibleOutputChanged: true,
    humanReviewReady: true,
    productionAdmitted: true,
    d0Complete: false
  },
  evidence: {
    runtimeTestPaths: [
      "site/modules/curriculum/batch-a/g3b-u04-global-context-production-registry.js",
      "site/modules/curriculum/batch-a/g3b-u04-global-context-production-admission.js",
      "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
      "site/modules/curriculum/batch-a/batch-a-browser-validator-s57f5-extension.js",
      "site/modules/curriculum/batch-a/batch-a-browser-worksheet-gctx-p13-entry.js",
      "site/assets/browser/pipeline/build-worksheet-document.js",
      "tests/curriculum/gctx-p13-global-context-production-admission.test.js",
      "tests/curriculum/gctx-p12r-global-context-runtime-renderer.test.js"
    ],
    rendererTestPaths: [
      "site/modules/renderer/html-renderer-s73-extension.js",
      "tools/curriculum/generate-gctx-p13-g3b-u04-public-production-artifacts.mjs",
      "tools/curriculum/render-gctx-p13-public-production-pdf.mjs",
      "tools/curriculum/finalize-gctx-p13-public-production-evidence.mjs",
      ".github/workflows/gctx-p13-production-admission-html-pdf.yml"
    ],
    htmlArtifactPaths: [paths.reviewHtml, paths.publicHtml],
    pdfArtifactPaths: [paths.reviewPdf, paths.publicPdf],
    beforeAfterEvidencePaths: [paths.visibleDiff, paths.publicEvidence, paths.publicManifest],
    reviewArtifactPaths: [paths.reviewDecision, paths.reviewPdf, paths.publicHtml, paths.publicPdf, paths.publicEvidence, paths.publicManifest],
    artifactHashes
  },
  humanReview: {
    type: "production_equivalent_output_review",
    canUnlockProduction: true,
    reviewArtifactRequired: true
  },
  distance: {
    before: "D1",
    after: "D1",
    distanceReduced: "All five Human Review-approved contexts are production admitted through the canonical public resolver, generator, blocking validator, worksheet and renderer, with exact public HTML/PDF regression evidence."
  },
  nextStep: {
    taskId: "GCTX-P14_G3BU04LivePublicUIProductionRegressionAndD0Closeout",
    requiredEvidenceLevelBeforeStart: "E5_PRODUCTION_ADMITTED"
  }
};
writeFileSync(repoPath(paths.claim), `${JSON.stringify(claim, null, 2)}\n`, "utf8");

const contract = JSON.parse(readFileSync(repoPath(paths.contract), "utf8"));
contract.status = "public_production_admitted_html_pdf_regression_verified";
contract.actualEvidenceLevel = "E5_PRODUCTION_ADMITTED";
contract.productionAdmission = {
  productionSelectable: true,
  publicQuerySelectable: true,
  productionAdmitted: true,
  publicHiddenModeFlagUsed: false,
  publicProductionRegressionPassed: true,
  publicHtmlPath: paths.publicHtml,
  publicPdfPath: paths.publicPdf,
  publicPdfSha256: manifest.pdfSha256,
  publicPdfPageCount: manifest.actualPdfPageCount,
  worksheetQuestionCount: manifest.worksheetQuestionCount,
  targetQuestionCount: manifest.targetQuestionCount,
  uniqueApprovedVariantCount: manifest.uniqueApprovedVariantCount,
  targetAnswerCount: manifest.targetAnswerCount
};
contract.pendingAcceptance = {};
contract.distance = {
  goalDistanceBefore: "D1_GCTX_G3BU04_PAGES_PUBLIC_ROUTE_VERIFIED_PENDING_HUMAN_REVIEW",
  goalDistanceAfter: "D1_GCTX_G3BU04_PUBLIC_PRODUCTION_ADMITTED_HTML_PDF_VERIFIED",
  distanceReduced: "Human Review is resolved and all five approved contexts are now production-selectable and public-query-selectable through the canonical pipeline with verified HTML/PDF output.",
  remainingBlockers: ["final exact-head CI", "merge", "live deployed public UI regression", "D0 closeout"],
  nextShortestStep: "GCTX-P14_G3BU04LivePublicUIProductionRegressionAndD0Closeout"
};
writeFileSync(repoPath(paths.contract), `${JSON.stringify(contract, null, 2)}\n`, "utf8");

writeFileSync(repoPath(paths.marker), `TASK=GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission\nSTATUS=PASS_PUBLIC_PRODUCTION_ADMITTED_HTML_PDF_REGRESSION_VERIFIED\nTARGET_EVIDENCE_LEVEL=E5_PRODUCTION_ADMITTED\nACTUAL_EVIDENCE_LEVEL=E5_PRODUCTION_ADMITTED\nHUMAN_REVIEW_DECISION=approve_all\nHUMAN_REVIEW_DECISION_ID=gctx_p13_review_20260719_all_five_approved\nHUMAN_REVIEW_ARTIFACT_SHA256=777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0\nAPPROVED_VARIANT_COUNT=5\nWORKSHEET_QUESTION_COUNT=${manifest.worksheetQuestionCount}\nTARGET_QUESTION_COUNT=${manifest.targetQuestionCount}\nTARGET_ANSWER_COUNT=${manifest.targetAnswerCount}\nUNIQUE_APPROVED_VARIANT_COUNT=${manifest.uniqueApprovedVariantCount}\nMATHEMATICAL_WITNESS_COUNT=${manifest.mathematicalWitnessCount}\nPUBLIC_PDF_PAGES=${manifest.actualPdfPageCount}\nPUBLIC_PDF_BYTES=${manifest.pdfBytes}\nPUBLIC_PDF_SHA256=${manifest.pdfSha256}\nLEAKED_LEGACY_TARGET_PHRASE_COUNT=${manifest.leakedLegacyTargetPhraseCount}\nPRODUCTION_SELECTABLE=true\nPUBLIC_QUERY_SELECTABLE=true\nPRODUCTION_ADMITTED=true\nPUBLIC_HTML_VERIFIED=true\nPUBLIC_PDF_VERIFIED=true\nPUBLIC_PRODUCTION_REGRESSION_PASSED=true\nD0_COMPLETE=false\nSTOP_REASON=NONE\nNEXT_SHORTEST_STEP=GCTX-P14_G3BU04LivePublicUIProductionRegressionAndD0Closeout\n`, "utf8");

writeFileSync(repoPath(paths.readback), `# GCTX-P13 G3B-U04 Human Review and Production Admission\n\n## Status\n\n\`\`\`text\nPASS_PUBLIC_PRODUCTION_ADMITTED_HTML_PDF_REGRESSION_VERIFIED\n\`\`\`\n\nAll five production-equivalent questions were explicitly approved for semantic and mathematical correctness. The decision is bound to PDF SHA-256 \`${reviewDecision.reviewArtifact.sha256}\`.\n\n## Production result\n\n\`\`\`text\nproductionSelectable     = true\npublicQuerySelectable    = true\nproductionAdmitted       = true\npublicHiddenModeFlagUsed = false\nworksheetQuestionCount   = ${manifest.worksheetQuestionCount}\ntargetQuestionCount      = ${manifest.targetQuestionCount}\nuniqueApprovedVariants   = ${manifest.uniqueApprovedVariantCount}\ntargetAnswerCount        = ${manifest.targetAnswerCount}\nmathematicalWitnessCount = ${manifest.mathematicalWitnessCount}\npublicPdfPages            = ${manifest.actualPdfPageCount}\npublicPdfSha256           = ${manifest.pdfSha256}\nlegacyTargetLeakage       = ${manifest.leakedLegacyTargetPhraseCount}\n\`\`\`\n\n## Distance\n\n\`\`\`text\nGOAL_DISTANCE_BEFORE = D1_GCTX_G3BU04_PAGES_PUBLIC_ROUTE_VERIFIED_PENDING_HUMAN_REVIEW\nGOAL_DISTANCE_AFTER  = D1_GCTX_G3BU04_PUBLIC_PRODUCTION_ADMITTED_HTML_PDF_VERIFIED\nDISTANCE_REDUCED     = Human Review and production admission blockers are removed; canonical public HTML/PDF output is verified.\nREMAINING_BLOCKERS   = [final exact-head CI, merge, live deployed public UI regression, D0 closeout]\nNEXT_SHORTEST_STEP   = GCTX-P14_G3BU04LivePublicUIProductionRegressionAndD0Closeout\n\`\`\`\n`, "utf8");

console.log(JSON.stringify({
  claimPath: paths.claim,
  contractPath: paths.contract,
  markerPath: paths.marker,
  readbackPath: paths.readback,
  actualEvidenceLevel: claim.actualEvidenceLevel,
  productionAdmitted: claim.claims.productionAdmitted,
  publicPdfSha256: manifest.pdfSha256,
  artifactHashCount: artifactHashes.length
}, null, 2));
