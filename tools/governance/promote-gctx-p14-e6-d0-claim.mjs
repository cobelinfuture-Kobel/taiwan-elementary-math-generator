import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const repoPath = (path) => resolve(ROOT, path);

const paths = {
  p13Claim: "data/project/milestones/GCTX-P13.claim.json",
  claim: "data/project/milestones/GCTX-P14.claim.json",
  contract: "data/curriculum/contracts/GCTX_P14_G3BU04LivePublicUIProductionRegressionAndD0Closeout.json",
  marker: "docs/curriculum/output/GCTX_P14_G3BU04_LIVE_PUBLIC_UI_D0_PASS.marker",
  readback: "docs/curriculum/output/GCTX_P14_G3BU04_LIVE_PUBLIC_UI_D0_READBACK.md",
  reviewDecision: "data/curriculum/review/GCTX_P13_G3BU04_HUMAN_REVIEW_DECISION.json",
  reviewPdf: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.pdf",
  visibleDiff: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_VISIBLE_DIFF.json",
  p13Html: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.html",
  p13Pdf: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.pdf",
  p13Evidence: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.json",
  p13Manifest: "docs/curriculum/output/gctx/GCTX_P13_G3BU04_PUBLIC_PRODUCTION.manifest.json",
  liveEvidence: "docs/curriculum/output/gctx/p14-live/GCTX_P14_LIVE_PUBLIC_UI.json",
  livePreviewHtml: "docs/curriculum/output/gctx/p14-live/GCTX_P14_LIVE_PUBLIC_PREVIEW.html",
  livePageScreenshot: "docs/curriculum/output/gctx/p14-live/GCTX_P14_LIVE_PUBLIC_UI.png",
  livePreviewScreenshot: "docs/curriculum/output/gctx/p14-live/GCTX_P14_LIVE_PUBLIC_PREVIEW.png"
};

function sha256File(path) {
  return createHash("sha256").update(readFileSync(repoPath(path))).digest("hex");
}

const p13Claim = JSON.parse(readFileSync(repoPath(paths.p13Claim), "utf8"));
const live = JSON.parse(readFileSync(repoPath(paths.liveEvidence), "utf8"));

const requiredP13Claims = [
  "dataStructureReady",
  "contentAuthored",
  "runtimeIntegrated",
  "productionEquivalentGeneratorUsed",
  "productionRendererUsed",
  "htmlOutputVerified",
  "pdfOutputVerified",
  "visibleOutputChanged",
  "humanReviewReady",
  "productionAdmitted"
];
if (p13Claim.actualEvidenceLevel !== "E5_PRODUCTION_ADMITTED"
  || requiredP13Claims.some((claim) => p13Claim.claims?.[claim] !== true)
  || p13Claim.claims?.d0Complete !== false) {
  throw new Error("GCTX-P14 cannot promote D0 without a complete P13 E5 pipeline.");
}

if (live.status !== "live_public_ui_production_regression_pass"
  || live.evidenceLevel !== "E6_D0_COMPLETE"
  || live.deployedAssetIdentityVerified !== true
  || live.deployedAssets?.length !== 4
  || live.deployedAssets.some((row) => row.expectedSha256 !== row.liveSha256 || row.missingTokenCount !== 0)
  || live.selectorState?.sourceId !== "g3b_u04_3b04"
  || live.selectorState?.selectionMode !== "singleKnowledgePoint"
  || live.selectorState?.selectedKnowledgePoint !== "true"
  || live.selectorState?.selectedPatternGroup !== "true"
  || live.output?.questionCount !== 25
  || live.output?.answerCount !== 25
  || live.output?.questionPageCount !== 4
  || live.output?.answerPageCount !== 4
  || live.output?.targetQuestionCount !== 5
  || live.output?.targetAnswerCount !== 5
  || live.output?.uniqueRequiredPhraseCount !== 5
  || live.output?.targetAnswersWithEquationAndAnswer !== 5
  || live.output?.missingRequiredPhrases?.length !== 0
  || live.output?.leakedLegacyTargetPhrases?.length !== 0
  || live.output?.internalIdLeakage?.length !== 0
  || live.consoleErrors?.length !== 0
  || live.pageErrors?.length !== 0
  || live.requestFailures?.length !== 0
  || live.forbiddenQueryKeys?.length !== 0
  || live.shellState?.validationHasErrors !== "false"
  || live.shellState?.printButtonDisabled !== false
  || live.fullPipeline?.d0Complete !== true
  || live.reviewArtifactSha256 !== "777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0"
  || live.p13PublicPdfSha256 !== "ab94e9b6d3c53227e9524d9b21aa4d05022272d191e8c8a078fc243ca79d57fa") {
  throw new Error("GCTX-P14 live public UI evidence does not satisfy the D0 contract.");
}

if (live.pageScreenshotSha256 !== sha256File(paths.livePageScreenshot)
  || live.previewScreenshotSha256 !== sha256File(paths.livePreviewScreenshot)
  || live.previewHtmlSha256 !== sha256File(paths.livePreviewHtml)) {
  throw new Error("GCTX-P14 screenshot or preview HTML identity drifted.");
}

const artifactPaths = [
  paths.reviewDecision,
  paths.reviewPdf,
  paths.visibleDiff,
  paths.p13Html,
  paths.p13Pdf,
  paths.p13Evidence,
  paths.p13Manifest,
  paths.liveEvidence,
  paths.livePreviewHtml,
  paths.livePageScreenshot,
  paths.livePreviewScreenshot
];
const artifactHashes = artifactPaths.map((path) => ({ path, sha256: sha256File(path) }));

const claim = {
  schemaVersion: 1,
  taskId: "GCTX-P14_G3BU04LivePublicUIProductionRegressionAndD0Closeout",
  taskClass: "release",
  targetEvidenceLevel: "E6_D0_COMPLETE",
  actualEvidenceLevel: "E6_D0_COMPLETE",
  claimedStatus: "LIVE_PUBLIC_UI_PRODUCTION_REGRESSION_PASS_D0_COMPLETE",
  claims: {
    dataStructureReady: true,
    contentAuthored: true,
    runtimeIntegrated: true,
    productionEquivalentGeneratorUsed: true,
    productionRendererUsed: true,
    htmlOutputVerified: true,
    pdfOutputVerified: true,
    visibleOutputChanged: true,
    humanReviewReady: false,
    productionAdmitted: true,
    d0Complete: true
  },
  evidence: {
    runtimeTestPaths: [
      "site/modules/curriculum/batch-a/g3b-u04-global-context-production-registry.js",
      "site/modules/curriculum/batch-a/g3b-u04-global-context-production-admission.js",
      "site/modules/curriculum/batch-a/g3b-u04-human-semantic-readback-quality-v2.js",
      "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
      "site/modules/curriculum/batch-a/batch-a-browser-validator-s57f5-extension.js",
      "site/modules/curriculum/batch-a/batch-a-browser-worksheet-gctx-p13-entry.js",
      "site/assets/browser/pipeline/build-worksheet-document.js",
      "tools/curriculum/run-gctx-p14-live-public-ui-regression.mjs",
      ".github/workflows/gctx-p14-live-public-ui-d0.yml"
    ],
    rendererTestPaths: [
      "site/modules/renderer/html-renderer-s73-extension.js",
      "tools/curriculum/run-gctx-p14-live-public-ui-regression.mjs",
      ".github/workflows/gctx-p14-live-public-ui-d0.yml"
    ],
    htmlArtifactPaths: [paths.p13Html],
    pdfArtifactPaths: [paths.reviewPdf, paths.p13Pdf],
    beforeAfterEvidencePaths: [paths.visibleDiff, paths.p13Evidence, paths.p13Manifest, paths.liveEvidence],
    reviewArtifactPaths: [paths.reviewDecision, paths.reviewPdf, paths.p13Pdf],
    artifactHashes
  },
  humanReview: {
    type: "none",
    canUnlockProduction: false,
    reviewArtifactRequired: false
  },
  distance: {
    before: "D1",
    after: "D0",
    distanceReduced: "The deployed GitHub Pages UI loads the exact P13 runtime, resolves the public G3B-U04 selector/query route, generates 25 validated questions with five approved contexts and 25 answer entries, and exposes stable worksheet output without hidden flags or legacy target leakage."
  },
  nextStep: {
    taskId: "GS01_G5AU08_DeployedPagesSmokeRecloseout",
    requiredEvidenceLevelBeforeStart: "E6_D0_COMPLETE"
  }
};
writeFileSync(repoPath(paths.claim), `${JSON.stringify(claim, null, 2)}\n`, "utf8");

const contract = JSON.parse(readFileSync(repoPath(paths.contract), "utf8"));
contract.status = "live_public_ui_production_regression_pass_d0_complete";
contract.actualEvidenceLevel = "E6_D0_COMPLETE";
contract.liveAcceptance = {
  baseUrl: live.baseUrl,
  liveQueryUrl: live.liveQueryUrl,
  deploymentAttempt: live.deploymentAttempt,
  deployedAssetIdentityVerified: true,
  questionCount: live.output.questionCount,
  answerCount: live.output.answerCount,
  questionPageCount: live.output.questionPageCount,
  answerPageCount: live.output.answerPageCount,
  targetQuestionCount: live.output.targetQuestionCount,
  targetAnswerCount: live.output.targetAnswerCount,
  uniqueApprovedContextCount: live.output.uniqueRequiredPhraseCount,
  consoleErrorCount: live.consoleErrors.length,
  pageErrorCount: live.pageErrors.length,
  requestFailureCount: live.requestFailures.length,
  hiddenQueryFlagCount: live.forbiddenQueryKeys.length,
  legacyTargetLeakageCount: live.output.leakedLegacyTargetPhrases.length,
  d0Complete: true
};
contract.distance = {
  goalDistanceBefore: "D1_GCTX_G3BU04_PUBLIC_PRODUCTION_ADMITTED_HTML_PDF_VERIFIED",
  goalDistanceAfter: "D0_GCTX_G3BU04_LIVE_PUBLIC_UI_COMPLETE",
  distanceReduced: "The final deployed UI/selector/runtime/validator/renderer/worksheet output path is verified against exact deployed assets and live DOM output.",
  remainingBlockers: [],
  nextShortestStep: "GS01_G5AU08_DeployedPagesSmokeRecloseout"
};
writeFileSync(repoPath(paths.contract), `${JSON.stringify(contract, null, 2)}\n`, "utf8");

writeFileSync(repoPath(paths.marker), `TASK=GCTX-P14_G3BU04LivePublicUIProductionRegressionAndD0Closeout\nSTATUS=PASS_LIVE_PUBLIC_UI_PRODUCTION_REGRESSION_D0_COMPLETE\nTARGET_EVIDENCE_LEVEL=E6_D0_COMPLETE\nACTUAL_EVIDENCE_LEVEL=E6_D0_COMPLETE\nLIVE_BASE_URL=${live.baseUrl}\nLIVE_QUERY_URL=${live.liveQueryUrl}\nDEPLOYED_ASSET_IDENTITY_VERIFIED=true\nDEPLOYMENT_ATTEMPT=${live.deploymentAttempt}\nQUESTION_COUNT=${live.output.questionCount}\nANSWER_COUNT=${live.output.answerCount}\nQUESTION_PAGE_COUNT=${live.output.questionPageCount}\nANSWER_PAGE_COUNT=${live.output.answerPageCount}\nTARGET_QUESTION_COUNT=${live.output.targetQuestionCount}\nTARGET_ANSWER_COUNT=${live.output.targetAnswerCount}\nUNIQUE_APPROVED_CONTEXT_COUNT=${live.output.uniqueRequiredPhraseCount}\nCONSOLE_ERROR_COUNT=${live.consoleErrors.length}\nPAGE_ERROR_COUNT=${live.pageErrors.length}\nREQUEST_FAILURE_COUNT=${live.requestFailures.length}\nHIDDEN_QUERY_FLAG_COUNT=${live.forbiddenQueryKeys.length}\nLEGACY_TARGET_LEAKAGE_COUNT=${live.output.leakedLegacyTargetPhrases.length}\nPRODUCTION_ADMITTED=true\nD0_COMPLETE=true\nSTOP_REASON=NONE\nBLOCKER_TYPE=NONE\nNEXT_SHORTEST_STEP=GS01_G5AU08_DeployedPagesSmokeRecloseout\n`, "utf8");

writeFileSync(repoPath(paths.readback), `# GCTX-P14 G3B-U04 Live Public UI D0 Closeout\n\n## Status\n\n\`\`\`text\nPASS_LIVE_PUBLIC_UI_PRODUCTION_REGRESSION_D0_COMPLETE\n\`\`\`\n\nThe GitHub Pages deployment was verified against exact repository asset bytes before the public UI test ran. The public query selected G3B-U04, the approved KnowledgePoint and PatternGroup, then generated the live worksheet through the actual Classic UI.\n\n## Live result\n\n\`\`\`text\nbaseUrl                      = ${live.baseUrl}\nliveQueryUrl                 = ${live.liveQueryUrl}\ndeployedAssetIdentity        = true\nquestionCount                = ${live.output.questionCount}\nanswerCount                  = ${live.output.answerCount}\nquestionPageCount            = ${live.output.questionPageCount}\nanswerPageCount              = ${live.output.answerPageCount}\ntargetQuestionCount          = ${live.output.targetQuestionCount}\ntargetAnswerCount            = ${live.output.targetAnswerCount}\nuniqueApprovedContexts       = ${live.output.uniqueRequiredPhraseCount}\nlegacyTargetLeakage          = ${live.output.leakedLegacyTargetPhrases.length}\nconsoleErrors                = ${live.consoleErrors.length}\npageErrors                   = ${live.pageErrors.length}\nrequestFailures              = ${live.requestFailures.length}\nhiddenQueryFlags             = ${live.forbiddenQueryKeys.length}\nproductionAdmitted           = true\nd0Complete                   = true\n\`\`\`\n\n## Distance\n\n\`\`\`text\nGOAL_DISTANCE_BEFORE = D1_GCTX_G3BU04_PUBLIC_PRODUCTION_ADMITTED_HTML_PDF_VERIFIED\nGOAL_DISTANCE_AFTER  = D0_GCTX_G3BU04_LIVE_PUBLIC_UI_COMPLETE\nDISTANCE_REDUCED     = The deployed public UI, selector, canonical runtime, blocking validator, renderer, worksheet and answer output are all verified.\nREMAINING_BLOCKERS   = []\nNEXT_SHORTEST_STEP   = GS01_G5AU08_DeployedPagesSmokeRecloseout\n\`\`\`\n\n## Continuation boundary\n\n\`\`\`text\nSTOP_REASON = NONE\nBLOCKER_TYPE = NONE\nNEXT_RESUME_TASK = GS01_G5AU08_DeployedPagesSmokeRecloseout\n\`\`\`\n`, "utf8");

console.log(JSON.stringify({
  claimPath: paths.claim,
  contractPath: paths.contract,
  markerPath: paths.marker,
  readbackPath: paths.readback,
  actualEvidenceLevel: claim.actualEvidenceLevel,
  d0Complete: claim.claims.d0Complete,
  artifactHashCount: artifactHashes.length
}, null, 2));
