import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, "../..");
const OUT = resolve(ROOT, "docs/curriculum/output/gctx");
const CLAIM_PATH = resolve(ROOT, "data/project/milestones/GCTX-P12R.claim.json");
const CONTRACT_PATH = resolve(ROOT, "data/curriculum/contracts/GCTX_P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix.json");
const MARKER_PATH = resolve(ROOT, "docs/curriculum/output/GCTX_P12R_G3BU04_RUNTIME_RENDERER_PDF_PASS.marker");
const READBACK_PATH = resolve(ROOT, "docs/curriculum/output/GCTX_P12R_G3BU04_RUNTIME_RENDERER_PDF_READBACK.md");

const paths = {
  beforeHtml: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_BEFORE.html",
  afterHtml: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.html",
  pdf: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.pdf",
  extracted: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.extracted.txt",
  diff: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_VISIBLE_DIFF.json",
  manifest: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_RENDERED_ARTIFACTS.manifest.json"
};

function abs(repoPath) {
  return resolve(ROOT, repoPath);
}

function sha256(repoPath) {
  return createHash("sha256").update(readFileSync(abs(repoPath))).digest("hex");
}

const artifactManifest = JSON.parse(readFileSync(abs(paths.manifest), "utf8"));
if (artifactManifest.status !== "production_equivalent_html_pdf_visible_difference_pass"
  || artifactManifest.evidenceLevel !== "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED"
  || artifactManifest.changedPromptCount !== 5
  || artifactManifest.preservedMathematicalWitnessCount !== 5
  || artifactManifest.extractedPromptCount !== 5
  || artifactManifest.extractedAnswerCount !== 5
  || artifactManifest.leakedLegacyPhraseCount !== 0
  || artifactManifest.humanReviewReady !== true) {
  throw new Error(`P12R artifact manifest is not eligible for E4 promotion: ${JSON.stringify(artifactManifest)}`);
}

const exactHashes = {
  beforeHtml: sha256(paths.beforeHtml),
  afterHtml: sha256(paths.afterHtml),
  pdf: sha256(paths.pdf),
  extracted: sha256(paths.extracted),
  diff: sha256(paths.diff),
  manifest: sha256(paths.manifest)
};
if (exactHashes.beforeHtml !== artifactManifest.beforeHtmlSha256
  || exactHashes.afterHtml !== artifactManifest.afterHtmlSha256
  || exactHashes.pdf !== artifactManifest.pdfSha256
  || exactHashes.diff !== artifactManifest.visibleDiffSha256) {
  throw new Error(`P12R exact artifact hash mismatch: ${JSON.stringify({ exactHashes, artifactManifest })}`);
}

const claim = {
  schemaVersion: 1,
  taskId: "GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix",
  taskClass: "renderer",
  targetEvidenceLevel: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
  actualEvidenceLevel: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
  claimedStatus: "PRODUCTION_EQUIVALENT_HTML_PDF_VISIBLE_DIFFERENCE_VERIFIED",
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
    productionAdmitted: false,
    d0Complete: false
  },
  evidence: {
    runtimeTestPaths: [
      "site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-runtime.js",
      "site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-worksheet.js",
      "tests/curriculum/gctx-p12r-global-context-runtime-renderer.test.js"
    ],
    rendererTestPaths: [
      "site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-worksheet.js",
      "site/modules/renderer/html-renderer-s57f5-extension.js",
      ".github/workflows/gctx-p12r-html-pdf.yml"
    ],
    htmlArtifactPaths: [paths.beforeHtml, paths.afterHtml],
    pdfArtifactPaths: [paths.pdf],
    beforeAfterEvidencePaths: [paths.diff],
    reviewArtifactPaths: [paths.afterHtml, paths.pdf, paths.diff, paths.manifest],
    artifactHashes: [
      { path: paths.beforeHtml, sha256: exactHashes.beforeHtml },
      { path: paths.afterHtml, sha256: exactHashes.afterHtml },
      { path: paths.pdf, sha256: exactHashes.pdf },
      { path: paths.extracted, sha256: exactHashes.extracted },
      { path: paths.diff, sha256: exactHashes.diff },
      { path: paths.manifest, sha256: exactHashes.manifest }
    ]
  },
  humanReview: {
    type: "production_equivalent_output_review",
    canUnlockProduction: true,
    reviewArtifactRequired: true
  },
  distance: {
    before: "D2",
    after: "D1",
    distanceReduced: "the five global contexts now pass the canonical resolver, canonical generator, production semantic renderer, exact before-after HTML gate and verified Chromium PDF gate"
  },
  nextStep: {
    taskId: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
    requiredEvidenceLevelBeforeStart: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED"
  }
};

const contract = {
  schemaName: "GCTXG3BU04GlobalContextPilotRuntimeRendererAndPDFFullFixContract",
  schemaVersion: 1,
  task: claim.taskId,
  status: "pass_e4_verified_pending_human_review",
  evidenceLevel: claim.actualEvidenceLevel,
  scope: {
    sourceId: artifactManifest.sourceId,
    knowledgePointId: artifactManifest.knowledgePointId,
    patternSpecId: artifactManifest.patternSpecId,
    pilotMode: artifactManifest.pilotMode,
    canonicalResolverUsed: true,
    canonicalGeneratorUsed: true,
    productionRendererUsed: true,
    productionSelectable: false,
    publicQuerySelectable: false,
    publicRouterChanged: false,
    productionAdmitted: false
  },
  acceptance: {
    questionCount: artifactManifest.questionCount,
    globalContextVariantCount: artifactManifest.globalContextVariantCount,
    changedPromptCount: artifactManifest.changedPromptCount,
    preservedMathematicalWitnessCount: artifactManifest.preservedMathematicalWitnessCount,
    extractedPromptCount: artifactManifest.extractedPromptCount,
    extractedAnswerCount: artifactManifest.extractedAnswerCount,
    legacyPromptCountInAfter: artifactManifest.legacyPromptCountInAfter,
    leakedLegacyPhraseCount: artifactManifest.leakedLegacyPhraseCount,
    expectedPdfPageCount: artifactManifest.expectedPdfPageCount,
    actualPdfPageCount: artifactManifest.actualPdfPageCount,
    pdfBytes: artifactManifest.pdfBytes
  },
  hashes: exactHashes,
  workflow: {
    runId: process.env.GITHUB_RUN_ID ?? null,
    runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    headSha: process.env.GITHUB_SHA ?? null
  },
  humanReview: {
    ready: true,
    type: "production_equivalent_output_review",
    artifactPaths: claim.evidence.reviewArtifactPaths,
    productionAdmissionBeforeReview: false
  },
  distance: {
    goalDistanceBefore: "D2_GCTX_G3BU04_CANDIDATE_TEXT_EXISTS",
    goalDistanceAfter: "D1_GCTX_G3BU04_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED_PENDING_HUMAN_REVIEW",
    distanceReduced: claim.distance.distanceReduced,
    remainingBlockers: ["human semantic review", "human mathematical review", "formal production admission", "public production regression after admission"],
    nextShortestStep: claim.nextStep.taskId
  }
};

const marker = [
  `TASK=${claim.taskId}`,
  "STATUS=PASS_E4_VERIFIED_PENDING_HUMAN_REVIEW",
  `ACTUAL_EVIDENCE_LEVEL=${claim.actualEvidenceLevel}`,
  `SOURCE_ID=${artifactManifest.sourceId}`,
  `KNOWLEDGE_POINT_ID=${artifactManifest.knowledgePointId}`,
  `PATTERN_SPEC_ID=${artifactManifest.patternSpecId}`,
  `QUESTION_COUNT=${artifactManifest.questionCount}`,
  `GLOBAL_CONTEXT_VARIANTS=${artifactManifest.globalContextVariantCount}`,
  `CHANGED_PROMPTS=${artifactManifest.changedPromptCount}`,
  `PRESERVED_MATH_WITNESSES=${artifactManifest.preservedMathematicalWitnessCount}`,
  `EXTRACTED_PROMPTS=${artifactManifest.extractedPromptCount}`,
  `EXTRACTED_ANSWERS=${artifactManifest.extractedAnswerCount}`,
  `LEGACY_PROMPTS_AFTER=${artifactManifest.legacyPromptCountInAfter}`,
  `PDF_PAGES=${artifactManifest.actualPdfPageCount}`,
  `PDF_BYTES=${artifactManifest.pdfBytes}`,
  `PDF_SHA256=${exactHashes.pdf}`,
  "PRODUCTION_SELECTABLE=false",
  "PUBLIC_ROUTER_CHANGED=false",
  "PRODUCTION_ADMITTED=false",
  "HUMAN_REVIEW_READY=true",
  "HUMAN_REVIEW_TYPE=production_equivalent_output_review",
  "STOP_REASON=HUMAN_REVIEW_REQUIRED",
  `NEXT_SHORTEST_STEP=${claim.nextStep.taskId}`,
  ""
].join("\n");

const readback = `# GCTX-P12R G3B-U04 Runtime / Renderer / PDF FullFix — E4 Readback

## Status

\`\`\`text
PASS_E4_VERIFIED_PENDING_HUMAN_REVIEW
\`\`\`

The five global-context variants now pass through the existing visible PatternGroup resolver, canonical G3B-U04 generator, \`worksheet-document-v1\` assembly, S57F5 production semantic renderer, Chromium PDF print path, and Poppler text/page verification.

## Exact output evidence

\`\`\`text
questionCount                     = ${artifactManifest.questionCount}
globalContextVariantCount         = ${artifactManifest.globalContextVariantCount}
changedPromptCount                = ${artifactManifest.changedPromptCount}
preservedMathematicalWitnessCount = ${artifactManifest.preservedMathematicalWitnessCount}
extractedPromptCount              = ${artifactManifest.extractedPromptCount}
extractedAnswerCount              = ${artifactManifest.extractedAnswerCount}
legacyPromptCountInAfter          = ${artifactManifest.legacyPromptCountInAfter}
actualPdfPageCount                = ${artifactManifest.actualPdfPageCount}
pdfBytes                          = ${artifactManifest.pdfBytes}
pdfSha256                         = ${exactHashes.pdf}
\`\`\`

## Safety boundary

\`\`\`text
productionSelectable = false
publicQuerySelectable = false
publicRouterChanged   = false
productionAdmitted    = false
\`\`\`

Human Review is now valid because the exact production-equivalent AFTER HTML/PDF and before-after diff are committed and hash-locked. Human Review does not itself imply production admission.

## Distance

\`\`\`text
GOAL_DISTANCE_BEFORE = D2_GCTX_G3BU04_CANDIDATE_TEXT_EXISTS
GOAL_DISTANCE_AFTER  = D1_GCTX_G3BU04_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED_PENDING_HUMAN_REVIEW
DISTANCE_REDUCED     = ${claim.distance.distanceReduced}
REMAINING_BLOCKERS   = [human semantic review, human mathematical review, formal production admission, public production regression after admission]
NEXT_SHORTEST_STEP   = ${claim.nextStep.taskId}
\`\`\`

## Stop boundary

\`\`\`text
STOP_REASON=HUMAN_REVIEW_REQUIRED
BLOCKER_TYPE=PRODUCTION_EQUIVALENT_OUTPUT_REVIEW
LAST_COMPLETED_STATUS=PASS_E4_VERIFIED_PENDING_HUMAN_REVIEW
REQUIRED_OPERATOR_ACTION=Review the exact committed AFTER PDF/HTML and approve or reject the five rendered questions.
NEXT_RESUME_TASK=${claim.nextStep.taskId}
\`\`\`
`;

mkdirSync(dirname(CONTRACT_PATH), { recursive: true });
mkdirSync(dirname(MARKER_PATH), { recursive: true });
writeFileSync(CLAIM_PATH, `${JSON.stringify(claim, null, 2)}\n`, "utf8");
writeFileSync(CONTRACT_PATH, `${JSON.stringify(contract, null, 2)}\n`, "utf8");
writeFileSync(MARKER_PATH, marker, "utf8");
writeFileSync(READBACK_PATH, readback, "utf8");

console.log(JSON.stringify({
  claimPath: CLAIM_PATH,
  contractPath: CONTRACT_PATH,
  markerPath: MARKER_PATH,
  readbackPath: READBACK_PATH,
  actualEvidenceLevel: claim.actualEvidenceLevel,
  humanReviewReady: claim.claims.humanReviewReady,
  productionAdmitted: claim.claims.productionAdmitted,
  hashes: exactHashes
}, null, 2));
