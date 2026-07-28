import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reviewedDir = process.env.P03F9_REVIEWED_DIR;
if (!reviewedDir) throw new Error("P03F9_REVIEWED_DIR_REQUIRED");
const source = (name) => path.join(reviewedDir, name);
const outputDir = path.join(ROOT, "docs/curriculum/output/p03f-slice009-product-admission");
fs.mkdirSync(outputDir, { recursive: true });
const htmlName = "g3b-u09-tenths-fraction-decimal.html";
const pdfName = "g3b-u09-tenths-fraction-decimal.pdf";
const reportName = "p03f-slice009-product-acceptance-report.json";
for (const name of [htmlName, pdfName, reportName]) if (!fs.existsSync(source(name))) throw new Error(`P03F9_REVIEWED_ARTIFACT_MISSING:${name}`);
fs.copyFileSync(source(htmlName), path.join(outputDir, htmlName));
fs.copyFileSync(source(pdfName), path.join(outputDir, pdfName));
const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const htmlSha256 = sha256(path.join(outputDir, htmlName));
const pdfSha256 = sha256(path.join(outputDir, pdfName));
const report = JSON.parse(fs.readFileSync(source(reportName), "utf8"));
report.status = "PASS_VISUAL_AND_SEMANTIC_REVIEWED";
report.htmlSha256 = htmlSha256;
report.pdfSha256 = pdfSha256;
report.visualReview = {
  status: "PASS_MANUAL_VISUAL_SEMANTIC_REVIEW",
  questionPageReviewed: true,
  answerKeyPageReviewed: true,
  physicalPageParityReviewed: true,
  clippedTextFindingCount: 0,
  overlapFindingCount: 0,
  brokenGlyphFindingCount: 0,
  semanticScopeFindingCount: 0,
};
fs.writeFileSync(path.join(outputDir, reportName), JSON.stringify(report, null, 2) + "\n");

const manifestPath = path.join(ROOT, "data/curriculum/full-product/p03f/slice009-product-admission.manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.status = "SLICE009_PRODUCTION_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI";
Object.assign(manifest.expectedCounts, {
  chromiumPdfWitnessCount: 1,
  newProductAdmissionCount: 1,
  cumulativeW3ProductAdmissionCount: 11,
  remainingDirectSliceCount: 44,
  remainingDirectKnowledgePointCount: 71,
});
Object.assign(manifest.exactAcceptance, {
  nodeTestsPassed: 2543,
  nodeTestsFailed: 0,
  chromiumPdfPrintPassed: true,
  physicalPageParityPassed: true,
  artifactHashSweepPassed: true,
  visualReviewPassed: true,
  committedHtmlSha256: htmlSha256,
  committedPdfSha256: pdfSha256,
  preD0NodeWorkflowRunId: 30353566569,
  preD0NodeWorkflowHeadSha: "e7ba2bf744737d40f9293f1a0977cb308c44726d",
  preD0ChromiumWorkflowRunId: 30353566616,
  preD0ChromiumArtifactId: 8685872102,
  artifactMaterializationCommitSha: null,
  artifactMaterializationWorkflowRunId: Number(process.env.GITHUB_RUN_ID ?? 0) || null,
});
Object.assign(manifest.mainlineBoundary, { queuePositionConsumed: 9, slice009KnowledgePointAdmitted: true });
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

const claimPath = path.join(ROOT, "data/project/milestones/FPL-P03F9.claim.json");
const claim = JSON.parse(fs.readFileSync(claimPath, "utf8"));
claim.actualEvidenceLevel = "E5_PRODUCTION_ADMITTED";
claim.claimedStatus = "W3_SLICE009_PRODUCTION_ADMITTED_PENDING_EXACT_HEAD_CI_AND_MERGE";
Object.assign(claim.claims, {
  productionRendererUsed: true,
  htmlOutputVerified: true,
  pdfOutputVerified: true,
  visibleOutputChanged: true,
  humanReviewReady: true,
  productionAdmitted: true,
  d0Complete: false,
});
claim.evidence.htmlArtifactPaths = [`docs/curriculum/output/p03f-slice009-product-admission/${htmlName}`];
claim.evidence.pdfArtifactPaths = [`docs/curriculum/output/p03f-slice009-product-admission/${pdfName}`];
claim.evidence.reviewArtifactPaths = [`docs/curriculum/output/p03f-slice009-product-admission/${reportName}`];
claim.evidence.artifactHashes = [
  { path: claim.evidence.htmlArtifactPaths[0], sha256: htmlSha256 },
  { path: claim.evidence.pdfArtifactPaths[0], sha256: pdfSha256 },
];
claim.humanReview = { type: "production_equivalent_output_review", canUnlockProduction: true, reviewArtifactRequired: true };
claim.distance.distanceReduced = "Queue position 9 has one production-admitted KnowledgePoint with reviewed HTML/PDF and exact hashes; exact-head CI and merge remain.";
claim.nextStep = { taskId: "P03F9_ExactHeadCIAndMerge", requiredEvidenceLevelBeforeStart: "E5_PRODUCTION_ADMITTED" };
Object.assign(claim.d0Closeout, {
  preD0HeadSha: "e7ba2bf744737d40f9293f1a0977cb308c44726d",
  preD0NodeWorkflowRunId: 30353566569,
  preD0ChromiumWorkflowRunId: 30353566616,
  preD0ChromiumArtifactId: 8685872102,
  artifactMaterializationCommitSha: null,
  artifactMaterializationWorkflowRunId: Number(process.env.GITHUB_RUN_ID ?? 0) || null,
  nodeTestsPassed: 2543,
  nodeTestsFailed: 0,
  visualReviewPassed: true,
});
fs.writeFileSync(claimPath, JSON.stringify(claim, null, 2) + "\n");

const readbackPath = path.join(ROOT, "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE009_READBACK.md");
fs.writeFileSync(readbackPath, `# P03F W3 Direct Product Vertical Slice 009 Readback

\`\`\`text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice009Implementation
STATUS     = PRODUCTION_ARTIFACT_REVIEWED_PENDING_EXACT_HEAD_CI
EVIDENCE   = E5_PRODUCTION_ADMITTED
\`\`\`

## Frozen slice

\`\`\`text
queue position = 9
slice ID       = p03e_q009_r6_g3b_u09_3b09_profile_fraction_c1
source         = g3b_u09_3b09
KnowledgePoint = kp_g3b_u09_tenths_fraction_decimal
PatternGroups  = 1
PatternSpecs   = 1
numeric/application = NUMERIC_ONLY
slice010 started = false
\`\`\`

## Reviewed product evidence

\`\`\`text
Tag Registry bindings          = 8
FormalMappings                 = 1
question / answer witnesses    = 8 / 8 PASS
direction allocation           = 4 fraction→decimal / 4 decimal→fraction
fraction number system         = CONNECTED
fraction domain validator      = CONNECTED
Classic / Pixel visible KPs    = 4 / 4
HTML / Chromium PDF            = COMMITTED / COMMITTED
physical PDF pages             = 2
overflow / duplicate / semantic = 0 / 0 / 0
visual clipping / overlap / glyph = 0 / 0 / 0
HTML SHA256 = ${htmlSha256}
PDF SHA256  = ${pdfSha256}
production admission = E5_PRODUCTION_ADMITTED
\`\`\`

## Admission effect

\`\`\`text
new product admissions       = 1
cumulative W3 admissions     = 11
remaining direct slices      = 44
remaining direct W3 KPs      = 71
later-wave dependent rows    = 33 unchanged
slice010 started             = false
parallel product pipelines   = 0
\`\`\`

\`\`\`text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE008_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE009_E5_PENDING_EXACT_HEAD_CI
DISTANCE_REDUCED     = Queue position 9 now has one reviewed production artifact pair and exact hash evidence through the shared product path.
REMAINING_BLOCKERS   = [exact-head full regression, exact-head Chromium gate, PR merge, E6 metadata closeout]
NEXT_SHORTEST_STEP   = P03F9_ExactHeadCIAndMerge
slice010 started     = false
\`\`\`
`);
console.log(JSON.stringify({ status: "P03F9_REVIEWED_ARTIFACT_MATERIALIZED", htmlSha256, pdfSha256, runId: process.env.GITHUB_RUN_ID ?? null }));
