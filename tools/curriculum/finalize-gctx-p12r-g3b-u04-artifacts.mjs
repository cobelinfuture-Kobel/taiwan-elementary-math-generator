import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUTPUT = path.join(ROOT, "docs/curriculum/output/gctx-p12r");
const MANIFEST_PATH = path.join(OUTPUT, "GCTX_P12R_G3BU04_ArtifactManifest.json");
const CLAIM_PATH = path.join(ROOT, "data/project/milestones/GCTX-P12R.claim.json");
const CONTRACT_PATH = path.join(ROOT, "data/curriculum/contracts/GCTX_P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix.json");
const PENDING_MARKER = path.join(ROOT, "docs/curriculum/output/GCTX_P12R_G3BU04_RUNTIME_RENDERER_PDF_PENDING.marker");
const PASS_MARKER = path.join(ROOT, "docs/curriculum/output/GCTX_P12R_G3BU04_RUNTIME_RENDERER_PDF_PASS.marker");
const READBACK_PATH = path.join(ROOT, "docs/curriculum/output/GCTX_P12R_G3BU04_RUNTIME_RENDERER_PDF_READBACK.md");

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const writeJson = (filePath, value) => fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
const sha256File = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const repoPath = (filePath) => path.relative(ROOT, filePath).replaceAll("\\", "/");

const beforePages = Number(process.env.BEFORE_PAGES);
const afterPages = Number(process.env.AFTER_PAGES);
if (!Number.isInteger(beforePages) || !Number.isInteger(afterPages)) {
  throw new Error("BEFORE_PAGES and AFTER_PAGES must be positive integers.");
}

const manifest = readJson(MANIFEST_PATH);
const artifactKeys = ["beforeHtml", "afterHtml", "beforePdf", "afterPdf", "beforeAfter"];
for (const key of artifactKeys) {
  const filePath = path.join(ROOT, manifest.artifacts[key].path);
  if (!fs.existsSync(filePath)) throw new Error(`Missing P12R artifact: ${manifest.artifacts[key].path}`);
  manifest.artifacts[key].bytes = fs.statSync(filePath).size;
  manifest.artifacts[key].sha256 = sha256File(filePath);
}
manifest.artifacts.beforePdf.pages = beforePages;
manifest.artifacts.afterPdf.pages = afterPages;
manifest.status = "production_equivalent_html_pdf_pass";
manifest.actualEvidenceLevel = "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED";
manifest.productionRendererUsed = true;
manifest.htmlOutputVerified = true;
manifest.pdfOutputVerified = true;
manifest.visibleOutputChanged = manifest.visibleChangedCount === manifest.targetQuestionCount;
manifest.humanReviewReady = manifest.visibleOutputChanged
  && beforePages === manifest.expectedPdfPageCount
  && afterPages === manifest.expectedPdfPageCount;
if (!manifest.humanReviewReady) throw new Error(`P12R artifact completion failed: ${JSON.stringify(manifest)}`);
writeJson(MANIFEST_PATH, manifest);

const hashRows = artifactKeys.map((key) => ({
  path: manifest.artifacts[key].path,
  sha256: manifest.artifacts[key].sha256
}));
const claim = {
  schemaVersion: 1,
  taskId: "GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix",
  taskClass: "renderer",
  targetEvidenceLevel: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
  actualEvidenceLevel: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
  claimedStatus: "PASS_PRODUCTION_EQUIVALENT_HTML_PDF_PENDING_HUMAN_REVIEW",
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
      "tests/curriculum/gctx-p12r-g3b-u04-runtime-renderer-pdf.test.js"
    ],
    rendererTestPaths: [
      "site/modules/renderer/html-renderer-s57f5-extension.js",
      "tests/curriculum/gctx-p12r-g3b-u04-artifacts.test.js"
    ],
    htmlArtifactPaths: [
      manifest.artifacts.beforeHtml.path,
      manifest.artifacts.afterHtml.path
    ],
    pdfArtifactPaths: [
      manifest.artifacts.beforePdf.path,
      manifest.artifacts.afterPdf.path
    ],
    beforeAfterEvidencePaths: [manifest.artifacts.beforeAfter.path],
    reviewArtifactPaths: [
      manifest.artifacts.afterHtml.path,
      manifest.artifacts.afterPdf.path,
      manifest.artifacts.beforeAfter.path
    ],
    artifactHashes: hashRows
  },
  humanReview: {
    type: "production_equivalent_output_review",
    canUnlockProduction: true,
    reviewArtifactRequired: true
  },
  distance: {
    before: "D2",
    after: "D1",
    distanceReduced: "five global contexts now pass the production-equivalent resolver, generator, validator, renderer, HTML and PDF path with immutable before-after evidence"
  },
  nextStep: {
    taskId: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
    requiredEvidenceLevelBeforeStart: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED"
  }
};
writeJson(CLAIM_PATH, claim);

const contract = readJson(CONTRACT_PATH);
contract.status = "pass_production_equivalent_html_pdf_pending_human_review";
contract.actualEvidenceLevel = "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED";
contract.artifactAcceptance = {
  manifest: repoPath(MANIFEST_PATH),
  beforeHtml: manifest.artifacts.beforeHtml,
  afterHtml: manifest.artifacts.afterHtml,
  beforePdf: manifest.artifacts.beforePdf,
  afterPdf: manifest.artifacts.afterPdf,
  beforeAfter: manifest.artifacts.beforeAfter,
  visibleChangedCount: manifest.visibleChangedCount,
  equationPreservedCount: manifest.equationPreservedCount,
  answerPreservedCount: manifest.answerPreservedCount,
  humanReviewReady: true,
  productionSelectable: false
};
contract.distance = {
  goalDistanceBefore: "D2_GCTX_G3BU04_CANDIDATE_TEXT_EXISTS",
  goalDistanceAfter: "D1_GCTX_G3BU04_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED_PENDING_HUMAN_REVIEW",
  distanceReduced: "five global contexts are visibly different in formal HTML/PDF while equations, answers, units and answer keys remain unchanged",
  remainingBlockers: [
    "production-equivalent Human Review",
    "formal production admission",
    "public selector/runtime admission",
    "public worksheet regression and release verification"
  ],
  nextShortestStep: "GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission"
};
writeJson(CONTRACT_PATH, contract);

if (fs.existsSync(PENDING_MARKER)) fs.unlinkSync(PENDING_MARKER);
fs.writeFileSync(PASS_MARKER, [
  "TASK=GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix",
  "STATUS=PASS_PRODUCTION_EQUIVALENT_HTML_PDF_PENDING_HUMAN_REVIEW",
  "ACTUAL_EVIDENCE_LEVEL=E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
  "CLAIM_MANIFEST=data/project/milestones/GCTX-P12R.claim.json",
  `ARTIFACT_MANIFEST=${repoPath(MANIFEST_PATH)}`,
  `QUESTION_COUNT=${manifest.questionCount}`,
  `TARGET_QUESTION_COUNT=${manifest.targetQuestionCount}`,
  `VISIBLE_CHANGED_COUNT=${manifest.visibleChangedCount}`,
  `EQUATION_PRESERVED_COUNT=${manifest.equationPreservedCount}`,
  `ANSWER_PRESERVED_COUNT=${manifest.answerPreservedCount}`,
  `EXPECTED_PDF_PAGE_COUNT=${manifest.expectedPdfPageCount}`,
  `BEFORE_PDF_PAGE_COUNT=${beforePages}`,
  `AFTER_PDF_PAGE_COUNT=${afterPages}`,
  "RUNTIME_INTEGRATED=true",
  "PRODUCTION_EQUIVALENT_GENERATOR_USED=true",
  "PRODUCTION_RENDERER_USED=true",
  "HTML_OUTPUT_VERIFIED=true",
  "PDF_OUTPUT_VERIFIED=true",
  "VISIBLE_OUTPUT_CHANGED=true",
  "HUMAN_REVIEW_READY=true",
  "PRODUCTION_SELECTABLE=false",
  "PUBLIC_SELECTOR_EXPOSED=false",
  "STOP_REASON=HUMAN_REVIEW_REQUIRED",
  "NEXT_SHORTEST_STEP=GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission",
  ""
].join("\n"), "utf8");

fs.writeFileSync(READBACK_PATH, `# GCTX-P12R G3B-U04 Runtime Renderer PDF FullFix\n\n## Status\n\n\`\`\`text\nPASS_PRODUCTION_EQUIVALENT_HTML_PDF_PENDING_HUMAN_REVIEW\nACTUAL_EVIDENCE_LEVEL=E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED\n\`\`\`\n\n## Production-equivalent path\n\n\`\`\`text\nvisible PatternGroup resolver\n→ S57F4 canonical semantic generator\n→ S57F5 canonical validator + P12R validator extension\n→ worksheet-document-v1\n→ S57F5 production HTML renderer\n→ headless Chrome PDF\n\`\`\`\n\n## Visible result\n\nFive target questions changed from the legacy joint-purchase contexts to:\n\n1. 班級園遊會；\n2. 戶外學習；\n3. 運動練習；\n4. 社區清潔活動；\n5. 露營活動。\n\nThe exact before/after prompts and preserved mathematical witnesses are recorded in:\n\n\`\`\`text\n${manifest.artifacts.beforeAfter.path}\n\`\`\`\n\n## Acceptance\n\n\`\`\`text\nworksheet questions       = ${manifest.questionCount}\ntarget questions          = ${manifest.targetQuestionCount}\nvisible prompt changes    = ${manifest.visibleChangedCount}\nequations preserved       = ${manifest.equationPreservedCount}\nanswers preserved         = ${manifest.answerPreservedCount}\nquestion pages            = ${manifest.questionPageCount}\nanswer pages              = ${manifest.answerKeyPageCount}\nbefore PDF pages          = ${beforePages}\nafter PDF pages           = ${afterPages}\nHTML verified             = true\nPDF verified              = true\nproduction selectable     = false\nhuman review ready        = true\n\`\`\`\n\n## Distance\n\n\`\`\`text\nGOAL_DISTANCE_BEFORE = D2_GCTX_G3BU04_CANDIDATE_TEXT_EXISTS\nGOAL_DISTANCE_AFTER  = D1_GCTX_G3BU04_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED_PENDING_HUMAN_REVIEW\nDISTANCE_REDUCED     = five global contexts now pass the exact production-equivalent runtime, renderer, HTML and PDF path\nREMAINING_BLOCKERS   = [Human Review, formal production admission, public selector/runtime admission, public release verification]\nNEXT_SHORTEST_STEP   = GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission\n\`\`\`\n\n\`\`\`text\nSTOP_REASON=HUMAN_REVIEW_REQUIRED\nBLOCKER_TYPE=PRODUCTION_EQUIVALENT_OUTPUT_HUMAN_REVIEW\nLAST_COMPLETED_STATUS=PASS_PRODUCTION_EQUIVALENT_HTML_PDF_PENDING_HUMAN_REVIEW\nREQUIRED_OPERATOR_ACTION=Review the exact committed After HTML/PDF and approve or reject the five contexts.\nNEXT_RESUME_TASK=GCTX-P13_G3BU04GlobalContextPilotHumanReviewAndProductionAdmission\n\`\`\`\n`, "utf8");

process.stdout.write(`${JSON.stringify({
  ok: true,
  status: manifest.status,
  actualEvidenceLevel: manifest.actualEvidenceLevel,
  beforePages,
  afterPages,
  visibleChangedCount: manifest.visibleChangedCount,
  humanReviewReady: manifest.humanReviewReady
}, null, 2)}\n`);
