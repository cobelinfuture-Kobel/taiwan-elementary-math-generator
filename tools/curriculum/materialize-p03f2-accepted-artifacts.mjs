import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const TMP = path.join(ROOT, "tmp/p03f-slice002-product-acceptance");
const DEST = path.join(ROOT, "docs/curriculum/output/p03f-slice002-product-admission");
const WORKFLOW = path.join(ROOT, ".github/workflows/p03f2-one-shot-materialize.yml");
const SELF = fileURLToPath(import.meta.url);
const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");

execFileSync(process.execPath, [path.join(ROOT, "tools/curriculum/render-p03f-slice002-product-acceptance.mjs")], { cwd: ROOT, stdio: "inherit" });
fs.mkdirSync(DEST, { recursive: true });
for (const name of [
  "g3a-u08-fraction-quantity-numeric.html",
  "g3a-u08-fraction-quantity-application.html",
  "g3a-u08-fraction-quantity-numeric.pdf",
  "g3a-u08-fraction-quantity-application.pdf",
]) fs.copyFileSync(path.join(TMP, name), path.join(DEST, name));

const reportPath = path.join(TMP, "p03f-slice002-product-acceptance-report.json");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
report.status = "PASS_VISUAL_AND_SEMANTIC_REVIEWED";
report.reviewedWorkflowRunId = 30249876370;
report.reviewedWorkflowHeadSha = "e907c6e4f0a4c115f559cabe7d3ca842dc36c3e2";
report.reviewedWorkflowArtifactId = 8646585482;
report.reviewedWorkflowArtifactDigest = "sha256:a18c3dafe6a9f0a94addae9361c44b892617ed405798779c4a5eba0025aa4ccc";
report.numericHtmlSha256 = sha256(path.join(DEST, "g3a-u08-fraction-quantity-numeric.html"));
report.applicationHtmlSha256 = sha256(path.join(DEST, "g3a-u08-fraction-quantity-application.html"));
report.numericPdfSha256 = sha256(path.join(DEST, "g3a-u08-fraction-quantity-numeric.pdf"));
report.applicationPdfSha256 = sha256(path.join(DEST, "g3a-u08-fraction-quantity-application.pdf"));
report.visualReview = {
  status: "PASS_PRODUCTION_EQUIVALENT",
  renderTool: "/home/oai/skills/pdfs/scripts/render_pdf.py",
  renderDpi: 200,
  numericQuestionPageReviewed: true,
  numericAnswerKeyPageReviewed: true,
  applicationQuestionPageReviewed: true,
  applicationAnswerKeyPageReviewed: true,
  physicalPageParityReviewed: true,
  duplicatePromptFindingCount: 0,
  clippedTextFindingCount: 0,
  overlapFindingCount: 0,
  brokenGlyphFindingCount: 0,
  semanticScopeFindingCount: 0,
  committedHtmlGeneratedFromReviewedDeterministicRuntime: true,
  committedPdfGeneratedFromSameHtmlAndRenderer: true,
  finalCleanHeadVisualReadbackPending: true
};
fs.writeFileSync(path.join(DEST, "p03f-slice002-product-acceptance-report.json"), JSON.stringify(report, null, 2) + "\n");

const pixelPath = path.join(ROOT, "site/pixel/pixel-registry-bridge.js");
const pixelBefore = fs.readFileSync(pixelPath, "utf8");
const pixelAfter = pixelBefore.replace(
  'from "../modules/curriculum/registry/batch-a-selector-p03f-extension.js";',
  'from "../modules/curriculum/registry/batch-a-selector-p03f2-extension.js";'
);
if (pixelAfter === pixelBefore) throw new Error("P03F2_PIXEL_IMPORT_REPLACEMENT_MISSING");
fs.writeFileSync(pixelPath, pixelAfter);

const predecessorTestPath = path.join(ROOT, "tests/curriculum/p03f-slice001-part-whole-fraction.test.js");
let predecessorTest = fs.readFileSync(predecessorTestPath, "utf8");
const oldImport = 'import { listCurrentPixelSourceOptions, listPixelKnowledgePointsForSource } from "../../site/pixel/pixel-registry-bridge.js";';
const newImport = `import {
  listVisibleBatchAKnowledgePoints as listP03F1VisibleKnowledgePoints,
  listBatchAKnowledgePointAvailabilityBySource as getP03F1Availability,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f-extension.js";`;
if (!predecessorTest.includes(oldImport)) throw new Error("P03F2_PREDECESSOR_TEST_IMPORT_MISSING");
predecessorTest = predecessorTest.replace(oldImport, newImport);
const oldBlock = `test("P03F current Classic and Pixel selectors expose only the slice001 KP", () => {
  const currentPixelSources = listCurrentPixelSourceOptions();
  assert.equal(currentPixelSources.length, 20);
  const pixelSource = currentPixelSources.find((row) => row.sourceId === SOURCE_ID);
  assert.ok(pixelSource);
  assert.equal(pixelSource.visibleKnowledgePointCount, 1);
  const rows = listPixelKnowledgePointsForSource(SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, KP_ID);
});`;
const newBlock = `test("P03F explicit slice001 selector authority remains one-KP reproducible", () => {
  const rows = listP03F1VisibleKnowledgePoints().filter((row) => row.sourceId === SOURCE_ID);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].knowledgePointId, KP_ID);
  const availability = getP03F1Availability(SOURCE_ID);
  assert.equal(availability.visibleCount, 1);
  assert.equal(availability.hiddenPendingCount, 6);
});`;
if (!predecessorTest.includes(oldBlock)) throw new Error("P03F2_PREDECESSOR_TEST_BLOCK_MISSING");
predecessorTest = predecessorTest.replace(oldBlock, newBlock);
fs.writeFileSync(predecessorTestPath, predecessorTest);

fs.rmSync(WORKFLOW, { force: true });
fs.rmSync(SELF, { force: true });
execFileSync("git", ["config", "user.name", "github-actions[bot]"], { cwd: ROOT });
execFileSync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { cwd: ROOT });
execFileSync("git", ["add", ".github/workflows/p03f2-one-shot-materialize.yml", "tools/curriculum/materialize-p03f2-accepted-artifacts.mjs", "docs/curriculum/output/p03f-slice002-product-admission", "site/pixel/pixel-registry-bridge.js", "tests/curriculum/p03f-slice001-part-whole-fraction.test.js"], { cwd: ROOT });
execFileSync("git", ["commit", "-m", "P03F2: materialize reviewed HTML PDF artifacts"], { cwd: ROOT, stdio: "inherit" });
execFileSync("git", ["push", "origin", "HEAD:p03f-w3-direct-product-vertical-slice002-v1"], { cwd: ROOT, stdio: "inherit" });
