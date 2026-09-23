import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TMP = path.join(ROOT, "tmp/p03f-slice013-product-acceptance");
const OUT = path.join(ROOT, "docs/curriculum/output/p03f-slice013-product-admission");
const MANIFEST_PATH = path.join(ROOT, "data/curriculum/full-product/p03f/slice013-product-admission.manifest.json");
const FILES = ["g5a-u04-simplest-fraction.html", "g5a-u04-simplest-fraction.pdf", "p03f-slice013-product-acceptance-report.json"];
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const writeJson = (filePath, value) => fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

const manifest = readJson(MANIFEST_PATH);
if (manifest.status !== "SLICE013_RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE") throw new Error(`P03F13_MATERIALIZATION_STATE_INVALID:${manifest.status}`);
for (const name of FILES) if (!fs.existsSync(path.join(TMP, name))) throw new Error(`P03F13_MATERIALIZATION_INPUT_MISSING:${name}`);
const report = readJson(path.join(TMP, FILES[2]));
if (report.status !== "PASS_AUTOMATED_PENDING_VISUAL_REVIEW"
  || report.questionCount !== 9 || report.answerKeyItemCount !== 9 || report.physicalPdfPageCount !== 2
  || report.patternSpecIds?.length !== 5 || report.knowledgePointIds?.length !== 2
  || report.duplicatePromptFindingCount !== 0 || report.overflowFindingCount !== 0
  || report.consoleErrorCount !== 0 || report.pageErrorCount !== 0 || report.semanticScopeFindingCount !== 0) {
  throw new Error(`P03F13_MATERIALIZATION_REPORT_INVALID:${JSON.stringify(report)}`);
}
fs.mkdirSync(OUT, { recursive: true });
for (const name of FILES.slice(0, 2)) fs.copyFileSync(path.join(TMP, name), path.join(OUT, name));
const hashes = { html: sha256(path.join(OUT, FILES[0])), pdf: sha256(path.join(OUT, FILES[1])) };
if (hashes.html !== report.htmlSha256 || hashes.pdf !== report.pdfSha256) throw new Error("P03F13_MATERIALIZATION_HASH_COPY_MISMATCH");
const materializedReport = { ...report, materialization: { mode: "GITHUB_ACTIONS_RUNNER_BINARY_COMMIT", workflowRunId: Number(process.env.GITHUB_RUN_ID ?? 0) || null, sourceHeadSha: process.env.P03F13_SOURCE_HEAD_SHA ?? null, visualReviewAuthority: "PENDING_OPERATOR_REVIEW" } };
writeJson(path.join(OUT, FILES[2]), materializedReport);
manifest.status = "SLICE013_ARTIFACT_MATERIALIZED_PENDING_VISUAL_REVIEW";
manifest.exactAcceptance.productionHtmlPassed = true;
manifest.exactAcceptance.chromiumPdfPrintPassed = true;
manifest.exactAcceptance.physicalPageParityPassed = true;
manifest.exactAcceptance.artifactHashSweepPassed = true;
manifest.exactAcceptance.visualReviewPassed = false;
manifest.exactAcceptance.committedHtmlSha256 = hashes.html;
manifest.exactAcceptance.committedPdfSha256 = hashes.pdf;
manifest.exactAcceptance.artifactMaterializationWorkflowRunId = Number(process.env.GITHUB_RUN_ID ?? 0) || null;
manifest.mainlineBoundary.queuePositionConsumed = 12;
manifest.mainlineBoundary.slice013KnowledgePointCountAdmitted = 0;
writeJson(MANIFEST_PATH, manifest);
console.log(`P03F13_RUNNER_ARTIFACT_MATERIALIZED=${JSON.stringify({ hashes, workflowRunId: manifest.exactAcceptance.artifactMaterializationWorkflowRunId })}`);
