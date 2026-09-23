import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const SOURCE = path.join(ROOT, process.env.P03F8_REVIEWED_ARTIFACT_DIR ?? "tmp/p03f-slice008-reviewed-artifact");
const OUTPUT = path.join(ROOT, "docs/curriculum/output/p03f-slice008-product-admission");
const MANIFEST_PATH = path.join(ROOT, "data/curriculum/full-product/p03f/slice008-product-admission.manifest.json");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03F8.claim.json");
const READBACK_PATH = path.join(ROOT, "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE008_READBACK.md");
const HTML_NAME = "g3b-u09-decimal-read-write-compose.html";
const PDF_NAME = "g3b-u09-decimal-read-write-compose.pdf";
const REPORT_NAME = "p03f-slice008-product-acceptance-report.json";
const EXPECTED_HTML_SHA = "c138b45d8d0fa9ab44ba9f8a5967af9fd6afbed8ba315e7d3b59620c1e0afbee";
const EXPECTED_PDF_SHA = "b8d2091bf52fad35bebfa09d843166d73ded4ce9b79dbc9f3be1750d881c3a2e";
const REVIEWED_RUN_ID = 30342108267;
const REVIEWED_ARTIFACT_ID = 8681439918;
const REVIEWED_HEAD_SHA = "6d6462757e03107c957343764e66212a1d3d8d0f";

const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, value) => fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);

const sourceHtml = path.join(SOURCE, HTML_NAME);
const sourcePdf = path.join(SOURCE, PDF_NAME);
const sourceReport = path.join(SOURCE, REPORT_NAME);
for (const file of [sourceHtml, sourcePdf, sourceReport]) {
  if (!fs.existsSync(file)) throw new Error(`P03F8_REVIEWED_ARTIFACT_MISSING:${path.basename(file)}`);
}
if (sha256(sourceHtml) !== EXPECTED_HTML_SHA) throw new Error("P03F8_REVIEWED_HTML_HASH_MISMATCH");
if (sha256(sourcePdf) !== EXPECTED_PDF_SHA) throw new Error("P03F8_REVIEWED_PDF_HASH_MISMATCH");

const report = readJson(sourceReport);
if (report.questionCount !== 8 || report.answerKeyItemCount !== 8 || report.physicalPdfPageCount !== 2) {
  throw new Error("P03F8_REVIEWED_REPORT_COUNT_MISMATCH");
}
if (report.patternSpecIds?.length !== 2 || report.patternAllocation?.some((row) => row.questionCount !== 4)) {
  throw new Error("P03F8_REVIEWED_PATTERN_ALLOCATION_MISMATCH");
}
if (report.htmlSha256 !== EXPECTED_HTML_SHA || report.pdfSha256 !== EXPECTED_PDF_SHA) {
  throw new Error("P03F8_REVIEWED_REPORT_HASH_MISMATCH");
}
if ([report.duplicatePromptFindingCount, report.overflowFindingCount, report.consoleErrorCount, report.pageErrorCount, report.semanticScopeFindingCount].some((value) => value !== 0)) {
  throw new Error("P03F8_REVIEWED_REPORT_FINDINGS_PRESENT");
}
report.status = "PASS_VISUAL_AND_SEMANTIC_REVIEWED";
report.visualReview = {
  status: "PASS_MANUAL_VISUAL_AND_SEMANTIC_REVIEW",
  questionPageReviewed: true,
  answerKeyPageReviewed: true,
  physicalPageParityReviewed: true,
  clippedTextFindingCount: 0,
  overlapFindingCount: 0,
  brokenGlyphFindingCount: 0,
  semanticScopeFindingCount: 0,
  reviewedArtifactWorkflowRunId: REVIEWED_RUN_ID,
  reviewedArtifactId: REVIEWED_ARTIFACT_ID,
  reviewedArtifactHeadSha: REVIEWED_HEAD_SHA,
};

fs.mkdirSync(OUTPUT, { recursive: true });
fs.copyFileSync(sourceHtml, path.join(OUTPUT, HTML_NAME));
fs.copyFileSync(sourcePdf, path.join(OUTPUT, PDF_NAME));
writeJson(path.join(OUTPUT, REPORT_NAME), report);

const manifest = readJson(MANIFEST_PATH);
manifest.status = "SLICE008_PRODUCTION_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI";
Object.assign(manifest.expectedCounts, {
  chromiumPdfWitnessCount: 1,
  newProductAdmissionCount: 2,
  cumulativeW3ProductAdmissionCount: 10,
  remainingDirectSliceCount: 45,
  remainingDirectKnowledgePointCount: 72,
});
Object.assign(manifest.exactAcceptance, {
  chromiumPdfPrintPassed: true,
  physicalPageParityPassed: true,
  artifactHashSweepPassed: true,
  visualReviewPassed: true,
  committedHtmlSha256: EXPECTED_HTML_SHA,
  committedPdfSha256: EXPECTED_PDF_SHA,
  preD0ChromiumWorkflowRunId: REVIEWED_RUN_ID,
  preD0ChromiumArtifactId: REVIEWED_ARTIFACT_ID,
  artifactMaterializationWorkflowRunId: Number(process.env.GITHUB_RUN_ID ?? 0) || null,
});
Object.assign(manifest.mainlineBoundary, {
  queuePositionConsumed: 8,
  slice008KnowledgePointsAdmitted: true,
  visibleOutputChanged: true,
});
writeJson(MANIFEST_PATH, manifest);

const claim = readJson(CLAIM_PATH);
claim.actualEvidenceLevel = "E5_PRODUCTION_ADMITTED";
claim.claimedStatus = "W3_SLICE008_PRODUCTION_ADMITTED_PENDING_EXACT_HEAD_CI_AND_MERGE";
Object.assign(claim.claims, {
  productionRendererUsed: true,
  htmlOutputVerified: true,
  pdfOutputVerified: true,
  visibleOutputChanged: true,
  humanReviewReady: true,
  productionAdmitted: true,
  d0Complete: false,
});
claim.evidence.htmlArtifactPaths = [`docs/curriculum/output/p03f-slice008-product-admission/${HTML_NAME}`];
claim.evidence.pdfArtifactPaths = [`docs/curriculum/output/p03f-slice008-product-admission/${PDF_NAME}`];
claim.evidence.reviewArtifactPaths = [`docs/curriculum/output/p03f-slice008-product-admission/${REPORT_NAME}`];
claim.evidence.artifactHashes = [
  { path: claim.evidence.htmlArtifactPaths[0], sha256: EXPECTED_HTML_SHA },
  { path: claim.evidence.pdfArtifactPaths[0], sha256: EXPECTED_PDF_SHA },
];
claim.humanReview = { type: "manual_visual_semantic_review", canUnlockProduction: true, reviewArtifactRequired: true };
claim.distance.distanceReduced = "Queue position 8 has two production-admitted KnowledgePoints with reviewed HTML/PDF and exact hashes; exact-head CI and merge remain.";
claim.nextStep = { taskId: "P03F8_ExactHeadCIAndMerge", requiredEvidenceLevelBeforeStart: "E5_PRODUCTION_ADMITTED" };
Object.assign(claim.d0Closeout, {
  preD0HeadSha: REVIEWED_HEAD_SHA,
  preD0ChromiumWorkflowRunId: REVIEWED_RUN_ID,
  preD0ChromiumArtifactId: REVIEWED_ARTIFACT_ID,
  artifactMaterializationWorkflowRunId: Number(process.env.GITHUB_RUN_ID ?? 0) || null,
  visualReviewPassed: true,
});
writeJson(CLAIM_PATH, claim);

const readback = `# P03F W3 Direct Product Vertical Slice 008 Readback\n\n\`\`\`text\nPROGRAM_ID = FULL_PRODUCT_LINE_D0_V1\nTASK_ID    = P03F_W3DirectProductVerticalSlice008Implementation\nSTATUS     = PRODUCTION_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI\nEVIDENCE   = E5_PRODUCTION_ADMITTED\n\`\`\`\n\n## Frozen slice\n\n\`\`\`text\nqueue position = 8\nslice ID       = p03e_q008_r6_g3b_u09_3b09_profile_decimal_c1\nsource         = g3b_u09_3b09\nKnowledgePoints = kp_g3b_u09_decimal_read_write, kp_g3b_u09_decimal_compose_decompose\nPatternGroups  = 2\nPatternSpecs   = 2\nnumeric/application = NUMERIC_ONLY\n\`\`\`\n\n## Reviewed product evidence\n\n\`\`\`text\nTag Registry bindings          = 16\nFormalMappings                 = 2\nquestion / answer witnesses    = 8 / 8 PASS\nPatternSpec allocation         = 4 / 4 PASS\ndecimal number system          = CONNECTED\ndecimal domain validator       = CONNECTED\nClassic / Pixel visible KPs    = 3 / 3\nHTML / Chromium PDF            = COMMITTED / COMMITTED\nphysical PDF pages             = 2\noverflow / duplicate / semantic = 0 / 0 / 0\nvisual clipping / overlap / glyph = 0 / 0 / 0\nHTML SHA256 = ${EXPECTED_HTML_SHA}\nPDF SHA256  = ${EXPECTED_PDF_SHA}\nproduction admission = E5_PRODUCTION_ADMITTED\n\`\`\`\n\n## Admission effect\n\n\`\`\`text\nnew product admissions       = 2\ncumulative W3 admissions     = 10\nremaining direct slices      = 45\nremaining direct W3 KPs      = 72\nlater-wave dependent rows    = 33 unchanged\nslice009 started             = false\nparallel product pipelines   = 0\n\`\`\`\n\n\`\`\`text\nGOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE007_D0_MERGED\nGOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE008_E5_PENDING_EXACT_HEAD_CI\nDISTANCE_REDUCED     = Queue position 8 now has two reviewed production artifacts and exact hash evidence through the shared product path.\nREMAINING_BLOCKERS   = [exact-head full regression, exact-head Chromium gate, PR merge, E6 metadata closeout]\nNEXT_SHORTEST_STEP   = P03F8_ExactHeadCIAndMerge\nslice009 started     = false\n\`\`\`\n`;
fs.writeFileSync(READBACK_PATH, readback);

console.log(JSON.stringify({
  status: "PASS_P03F8_REVIEWED_ARTIFACTS_MATERIALIZED",
  htmlSha256: EXPECTED_HTML_SHA,
  pdfSha256: EXPECTED_PDF_SHA,
  reviewedRunId: REVIEWED_RUN_ID,
  reviewedArtifactId: REVIEWED_ARTIFACT_ID,
}));
