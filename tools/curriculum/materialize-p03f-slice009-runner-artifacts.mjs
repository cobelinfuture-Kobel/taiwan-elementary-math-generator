import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TMP_DIR = path.join(ROOT, "tmp/p03f-slice009-product-acceptance");
const OUTPUT_DIR = path.join(ROOT, "docs/curriculum/output/p03f-slice009-product-admission");
const MANIFEST_PATH = path.join(ROOT, "data/curriculum/full-product/p03f/slice009-product-admission.manifest.json");

const FILES = Object.freeze({
  html: "g3b-u09-tenths-fraction-decimal.html",
  pdf: "g3b-u09-tenths-fraction-decimal.pdf",
  report: "p03f-slice009-product-acceptance-report.json",
});

const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const writeJson = (filePath, value) => fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);

const manifest = readJson(MANIFEST_PATH);
if (manifest.status !== "SLICE009_RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE") {
  throw new Error(`P03F9_MATERIALIZATION_STATE_INVALID:${manifest.status}`);
}

for (const fileName of Object.values(FILES)) {
  const sourcePath = path.join(TMP_DIR, fileName);
  if (!fs.existsSync(sourcePath)) throw new Error(`P03F9_MATERIALIZATION_INPUT_MISSING:${fileName}`);
}

const reportSourcePath = path.join(TMP_DIR, FILES.report);
const report = readJson(reportSourcePath);
if (
  report.status !== "PASS_AUTOMATED_PENDING_VISUAL_REVIEW"
  || report.questionCount !== 8
  || report.answerKeyItemCount !== 8
  || report.physicalPdfPageCount !== 2
  || report.directionCounts?.fraction_to_decimal !== 4
  || report.directionCounts?.decimal_to_fraction !== 4
  || report.duplicatePromptFindingCount !== 0
  || report.overflowFindingCount !== 0
  || report.consoleErrorCount !== 0
  || report.pageErrorCount !== 0
  || report.semanticScopeFindingCount !== 0
) {
  throw new Error(`P03F9_MATERIALIZATION_REPORT_INVALID:${JSON.stringify(report)}`);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
fs.copyFileSync(path.join(TMP_DIR, FILES.html), path.join(OUTPUT_DIR, FILES.html));
fs.copyFileSync(path.join(TMP_DIR, FILES.pdf), path.join(OUTPUT_DIR, FILES.pdf));

const htmlSha256 = sha256(path.join(OUTPUT_DIR, FILES.html));
const pdfSha256 = sha256(path.join(OUTPUT_DIR, FILES.pdf));
if (htmlSha256 !== report.htmlSha256 || pdfSha256 !== report.pdfSha256) {
  throw new Error(`P03F9_MATERIALIZATION_HASH_COPY_MISMATCH:${htmlSha256}:${pdfSha256}`);
}

const materializedReport = {
  ...report,
  materialization: {
    mode: "GITHUB_ACTIONS_RUNNER_BINARY_COMMIT",
    workflowRunId: Number(process.env.GITHUB_RUN_ID ?? 0) || null,
    sourceHeadSha: process.env.P03F9_SOURCE_HEAD_SHA ?? null,
    visualReviewAuthority: "PENDING_OPERATOR_REVIEW",
  },
};
writeJson(path.join(OUTPUT_DIR, FILES.report), materializedReport);

manifest.status = "SLICE009_ARTIFACT_MATERIALIZED_PENDING_VISUAL_REVIEW";
manifest.exactAcceptance.chromiumPdfPrintPassed = true;
manifest.exactAcceptance.physicalPageParityPassed = true;
manifest.exactAcceptance.artifactHashSweepPassed = true;
manifest.exactAcceptance.visualReviewPassed = false;
manifest.exactAcceptance.committedHtmlSha256 = htmlSha256;
manifest.exactAcceptance.committedPdfSha256 = pdfSha256;
manifest.exactAcceptance.artifactMaterializationWorkflowRunId = Number(process.env.GITHUB_RUN_ID ?? 0) || null;
manifest.exactAcceptance.artifactMaterializationCommitSha = null;
manifest.exactAcceptance.finalExactHeadAccepted = false;
manifest.mainlineBoundary.queuePositionConsumed = 8;
manifest.mainlineBoundary.slice009KnowledgePointAdmitted = false;
writeJson(MANIFEST_PATH, manifest);

console.log(`P03F9_RUNNER_ARTIFACT_MATERIALIZED=${JSON.stringify({ htmlSha256, pdfSha256, workflowRunId: manifest.exactAcceptance.artifactMaterializationWorkflowRunId })}`);
