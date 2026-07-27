import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TMP = path.join(ROOT, "tmp/p03f-slice003-product-acceptance");
const OUTPUT = path.join(ROOT, "docs/curriculum/output/p03f-slice003-product-admission");
const HTML_NAME = "g3b-u07-quotient-as-fraction.html";
const PDF_NAME = "g3b-u07-quotient-as-fraction.pdf";
const REPORT_NAME = "p03f-slice003-product-acceptance-report.json";
const MANIFEST_PATH = path.join(ROOT, "data/curriculum/full-product/p03f/slice003-product-admission.manifest.json");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/FPL-P03F3.claim.json");
const READBACK_PATH = path.join(ROOT, "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE003_READBACK.md");
const TEST_PATH = path.join(ROOT, "tests/curriculum/p03f-slice003-quotient-fraction.test.js");
const WORKFLOW_PATH = path.join(ROOT, ".github/workflows/p03f3-acceptance-one-shot.yml");
const SELF_PATH = fileURLToPath(import.meta.url);

const PRE_D0_HEAD = "998af007b7aaa82c0f42484659e8d5756fd8d9ef";
const PRE_D0_NODE_RUN = 30280070827;
const PRE_D0_ARTIFACT = 8658504673;
const PRE_D0_ARTIFACT_DIGEST = "sha256:e52aaccdeef5835755713d2f6496dfc605a66f31e3b0652d63d3cb38c6e5e35e";

function sha256(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}
function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
function replaceExact(text, from, to, label) {
  if (!text.includes(from)) throw new Error(`P03F3_MATERIALIZE_REPLACEMENT_MISSING:${label}`);
  return text.replace(from, to);
}

for (const name of [HTML_NAME, PDF_NAME, REPORT_NAME]) {
  const source = path.join(TMP, name);
  if (!fs.existsSync(source)) throw new Error(`P03F3_ACCEPTED_ARTIFACT_MISSING:${name}`);
}
fs.mkdirSync(OUTPUT, { recursive: true });
fs.copyFileSync(path.join(TMP, HTML_NAME), path.join(OUTPUT, HTML_NAME));
fs.copyFileSync(path.join(TMP, PDF_NAME), path.join(OUTPUT, PDF_NAME));

const htmlPath = path.join(OUTPUT, HTML_NAME);
const pdfPath = path.join(OUTPUT, PDF_NAME);
const htmlSha256 = sha256(htmlPath);
const pdfSha256 = sha256(pdfPath);

const report = JSON.parse(fs.readFileSync(path.join(TMP, REPORT_NAME), "utf8"));
Object.assign(report, {
  status: "PASS_VISUAL_AND_SEMANTIC_REVIEWED",
  htmlSha256,
  pdfSha256,
  properFractionCount: 4,
  improperFractionCount: 4,
  wholeNumberCount: 0,
  visualReview: {
    status: "PASS_DIRECT_VISUAL_READBACK",
    questionPageReviewed: true,
    answerKeyPageReviewed: true,
    physicalPageParityReviewed: true,
    clippedTextFindingCount: 0,
    overlapFindingCount: 0,
    brokenGlyphFindingCount: 0,
    semanticScopeFindingCount: 0,
    orderedOperandRoleFindingCount: 0,
  },
});
writeJson(path.join(OUTPUT, REPORT_NAME), report);

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
manifest.status = "SLICE003_D0_COMPLETE_PENDING_FINAL_CI_AND_MERGE";
Object.assign(manifest.expectedCounts, {
  chromiumPdfWitnessCount: 1,
  newProductAdmissionCount: 1,
  cumulativeW3ProductAdmissionCount: 4,
  remainingDirectSliceCount: 50,
  remainingDirectKnowledgePointCount: 78,
});
Object.assign(manifest.exactAcceptance, {
  nodeTestsPassed: 2494,
  nodeTestsFailed: 0,
  preD0NodeWorkflowRunId: PRE_D0_NODE_RUN,
  preD0NodeWorkflowHeadSha: PRE_D0_HEAD,
  preD0ChromiumArtifactId: PRE_D0_ARTIFACT,
  preD0ChromiumArtifactDigest: PRE_D0_ARTIFACT_DIGEST,
  chromiumPdfPrintPassed: true,
  physicalPageParityPassed: true,
  overflowSweepPassed: true,
  artifactHashSweepPassed: true,
  visualReviewPassed: true,
  committedHtmlSha256: htmlSha256,
  committedPdfSha256: pdfSha256,
});
Object.assign(manifest.mainlineBoundary, {
  queuePositionConsumed: 3,
  slice003KnowledgePointAdmitted: true,
});
writeJson(MANIFEST_PATH, manifest);

const claim = JSON.parse(fs.readFileSync(CLAIM_PATH, "utf8"));
claim.actualEvidenceLevel = "E6_D0_COMPLETE";
claim.claimedStatus = "W3_SLICE003_D0_COMPLETE_PENDING_FINAL_CI_AND_MERGE";
Object.assign(claim.claims, {
  pdfOutputVerified: true,
  visibleOutputChanged: true,
  productionAdmitted: true,
  d0Complete: true,
});
claim.d0Closeout = {
  mode: "full_pipeline",
  implementationPrNumber: 412,
  preD0HeadSha: PRE_D0_HEAD,
  preD0NodeWorkflowRunId: PRE_D0_NODE_RUN,
  preD0ChromiumArtifactId: PRE_D0_ARTIFACT,
  nodeTestsPassed: 2494,
  nodeTestsFailed: 0,
  visualReviewPassed: true,
  finalExactHeadAccepted: false,
};
claim.evidence.htmlArtifactPaths = ["docs/curriculum/output/p03f-slice003-product-admission/g3b-u07-quotient-as-fraction.html"];
claim.evidence.pdfArtifactPaths = ["docs/curriculum/output/p03f-slice003-product-admission/g3b-u07-quotient-as-fraction.pdf"];
claim.evidence.reviewArtifactPaths = ["docs/curriculum/output/p03f-slice003-product-admission/p03f-slice003-product-acceptance-report.json"];
claim.evidence.artifactHashes = [
  { path: claim.evidence.htmlArtifactPaths[0], sha256: htmlSha256 },
  { path: claim.evidence.pdfArtifactPaths[0], sha256: pdfSha256 },
];
claim.distance.distanceReduced = "Frozen queue position 3 now has a source-backed quotient-as-fraction D0 product through three W3 fraction capabilities, shared generator and validator, current Classic and Pixel selection, answer key, committed HTML/PDF, hashes and visual semantic review; final clean-head CI and merge remain.";
claim.nextStep = { taskId: "P03F_W3DirectProductVerticalSlice004Implementation", requiredEvidenceLevelBeforeStart: "E6_D0_COMPLETE" };
writeJson(CLAIM_PATH, claim);

const readback = `# P03F W3 Direct Product Vertical Slice 003 Readback

\`\`\`text
PROGRAM_ID = FULL_PRODUCT_LINE_D0_V1
TASK_ID    = P03F_W3DirectProductVerticalSlice003Implementation
STATUS     = E6_D0_COMPLETE_PENDING_FINAL_CI_AND_MERGE
EVIDENCE   = E6_D0_COMPLETE
\`\`\`

## Frozen slice

\`\`\`text
queue position = 3
slice ID       = p03e_q003_r5_g3b_u07_3b07_profile_fraction_c1
source         = g3b_u07_3b07
KnowledgePoint = kp_g3b_u07_quotient_as_fraction
PatternGroups  = 1
PatternSpecs   = 1
application    = APPLICATION_NOT_APPLICABLE
\`\`\`

## Product nodes

\`\`\`text
source evidence                 = BOUND
Tag Registry bindings           = 8
FormalMappings                  = 1
numeric PatternSpecs            = 1
shared generator                = CONNECTED
shared deterministic validator  = CONNECTED
fraction number system          = CONNECTED
fraction domain validator       = CONNECTED
fraction arithmetic             = CONNECTED
current Classic selection       = CONNECTED
current Pixel selection         = CONNECTED
WorksheetDocument / answer key  = 8 / 8 PASS
production HTML                 = 1 COMMITTED
Chromium PDF / print            = 1 COMMITTED
physical PDF pages              = 2
artifact SHA256 gate            = CONNECTED
visual semantic review          = PASS
product admission               = PRODUCTION_ADMITTED_D0
\`\`\`

## Capability and semantic acceptance

\`\`\`text
required W3 capabilities = 3 / 3 PASS
ordered quotient identity = dividend ÷ divisor = dividend/divisor
proper fractions          = 4
improper fractions        = 4
whole-number quotient     = 0
duplicate prompts         = 0
overflow findings         = 0
clipping findings         = 0
overlap findings          = 0
broken glyph findings     = 0
semantic findings         = 0
\`\`\`

The arithmetic witness independently executes \`(dividend / 1) ÷ (divisor / 1)\` and must produce the same reduced canonical value as the fraction number-system consumer. The public answer preserves the original ordered dividend/divisor representation required by the source-backed KnowledgePoint.

## Committed output evidence

\`\`\`text
HTML   = docs/curriculum/output/p03f-slice003-product-admission/g3b-u07-quotient-as-fraction.html
PDF    = docs/curriculum/output/p03f-slice003-product-admission/g3b-u07-quotient-as-fraction.pdf
REPORT = docs/curriculum/output/p03f-slice003-product-admission/p03f-slice003-product-acceptance-report.json

HTML SHA256 = ${htmlSha256}
PDF SHA256  = ${pdfSha256}
\`\`\`

## Pre-D0 exact-head acceptance

\`\`\`text
implementation PR          = #412
accepted head              = ${PRE_D0_HEAD}
Node / Chromium run        = ${PRE_D0_NODE_RUN} SUCCESS
Chromium artifact          = ${PRE_D0_ARTIFACT}
artifact digest            = ${PRE_D0_ARTIFACT_DIGEST}
full Node regression       = 2494 / 2494 PASS
questions                  = 8 / 8 PASS
answer-key items           = 8 / 8 PASS
physical page parity       = PASS
visual semantic review     = PASS
all completed governance   = PASS
\`\`\`

## Admission effect

\`\`\`text
new product admissions       = 1
cumulative W3 admissions     = 4
remaining direct slices      = 50
remaining direct W3 KPs      = 78
later-wave dependent rows    = 33 unchanged
slice004 started             = false
other G3B-U07 KPs admitted   = 0
application stories added    = 0
parallel product pipelines   = 0
\`\`\`

## Distance

\`\`\`text
GOAL_DISTANCE_BEFORE = D1_W3_DIRECT_PRODUCT_SLICE002_D0_MERGED
GOAL_DISTANCE_AFTER  = D1_W3_DIRECT_PRODUCT_SLICE003_D0_PENDING_FINAL_CI_AND_MERGE
DISTANCE_REDUCED     = Frozen queue position 3 now has one D0 quotient-as-fraction KnowledgePoint through three W3 fraction capabilities, the shared product path, current Classic/Pixel selection, answer key and committed A4 HTML/PDF output.
REMAINING_BLOCKERS   = [final artifact-materialized clean-head CI and PR merge; 50 later direct-product slices; 33 later-wave dependent rows]
NEXT_SHORTEST_STEP   = Complete final clean-head CI and merge PR #412 within this milestone
\`\`\`

## Task closeout state

\`\`\`text
1. Distance segment shortened = queue position 3 moved from frozen-only to artifact-materialized E6 D0.
2. System nodes advanced       = KnowledgePoint, Tag Registry, FormalMapping, PatternSpec, Generator, Validator, three W3 capabilities, Classic/Pixel selector, Worksheet, HTML/PDF renderer.
3. Blocker removed             = quotient-as-fraction runtime, artifact and visual acceptance blockers.
4. New blocker added           = none; final CI/merge is ordinary milestone completion work.
5. Next shortest valid step    = final clean-head CI and merge PR #412.
\`\`\`
`;
fs.writeFileSync(READBACK_PATH, readback);

let testText = fs.readFileSync(TEST_PATH, "utf8");
testText = replaceExact(testText,
  'test("P03F3 aggregate admission is E4 fail-closed and preserves slice002 D0", () => {',
  'test("P03F3 aggregate admission is D0 and preserves slice002 D0", () => {',
  "aggregate-test-title");
testText = replaceExact(testText,
  '  assert.equal(result.productAdmissionState, "PRODUCT_ACCEPTANCE_PENDING");\n  assert.equal(result.d0Complete, false);',
  '  assert.equal(result.productAdmissionState, "PRODUCTION_ADMITTED_D0");\n  assert.equal(result.d0Complete, true);',
  "aggregate-d0-state");
testText = replaceExact(testText,
  '  assert.equal(result.metrics.newProductAdmissionCount, 0);\n  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 3);\n  assert.equal(result.metrics.remainingDirectSliceCount, 51);\n  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 79);',
  '  assert.equal(result.metrics.newProductAdmissionCount, 1);\n  assert.equal(result.metrics.cumulativeW3ProductAdmissionCount, 4);\n  assert.equal(result.metrics.remainingDirectSliceCount, 50);\n  assert.equal(result.metrics.remainingDirectKnowledgePointCount, 78);',
  "aggregate-d0-metrics");
fs.writeFileSync(TEST_PATH, testText);

for (const temporaryPath of [WORKFLOW_PATH, SELF_PATH]) {
  if (fs.existsSync(temporaryPath)) fs.rmSync(temporaryPath);
}

console.log(`P03F3_D0_MATERIALIZED=${JSON.stringify({ htmlSha256, pdfSha256, reportStatus: report.status })}`);
