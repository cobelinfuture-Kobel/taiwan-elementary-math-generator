import { createHash } from "node:crypto";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT = resolve(HERE, "../..");
const DEFAULT_OUTPUT_DIRECTORY = resolve(REPOSITORY_ROOT, "site/review/g3b-u04");

export const GCTX_P12S_PUBLICATION = Object.freeze({
  taskId: "GCTX-P12S_G3BU04PagesHumanReviewArtifactPublication",
  status: "pages_review_publication_configured",
  publicPath: "/review/g3b-u04/",
  sourceClaimPath: "data/project/milestones/GCTX-P12R.claim.json",
  sourcePdfPath: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_AFTER.pdf",
  sourceDiffPath: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_VISIBLE_DIFF.json",
  sourceManifestPath: "docs/curriculum/output/gctx/GCTX_P12R_G3BU04_RENDERED_ARTIFACTS.manifest.json",
  targetPdfName: "GCTX_P12R_G3BU04_AFTER.pdf",
  targetDiffName: "GCTX_P12R_G3BU04_VISIBLE_DIFF.json",
  targetManifestName: "GCTX_P12R_G3BU04_RENDERED_ARTIFACTS.manifest.json",
  publicationManifestName: "review-publication-manifest.json",
  reviewOnly: true,
  productionSelectable: false,
  publicGeneratorChanged: false,
  productionAdmitted: false
});

function repositoryPath(relativePath) {
  return resolve(REPOSITORY_ROOT, relativePath);
}

function sha256Bytes(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function sha256File(path) {
  return sha256Bytes(readFileSync(path));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function parseArguments(argv) {
  const outputIndex = argv.indexOf("--output-dir");
  if (outputIndex >= 0 && argv[outputIndex + 1]) {
    return { outputDirectory: resolve(argv[outputIndex + 1]) };
  }
  return { outputDirectory: DEFAULT_OUTPUT_DIRECTORY };
}

function claimHashMap(claim) {
  return new Map((claim?.evidence?.artifactHashes ?? []).map((entry) => [entry.path, entry.sha256]));
}

function verifySourceEvidence() {
  const claim = JSON.parse(readFileSync(repositoryPath(GCTX_P12S_PUBLICATION.sourceClaimPath), "utf8"));
  const sourceManifest = JSON.parse(readFileSync(repositoryPath(GCTX_P12S_PUBLICATION.sourceManifestPath), "utf8"));
  const visibleDiff = JSON.parse(readFileSync(repositoryPath(GCTX_P12S_PUBLICATION.sourceDiffPath), "utf8"));
  const hashes = claimHashMap(claim);

  if (claim.actualEvidenceLevel !== "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED"
    || claim.claims?.humanReviewReady !== true
    || claim.claims?.productionAdmitted !== false) {
    throw new Error("GCTX-P12S requires an E4 P12R claim that is Human Review ready and not production admitted.");
  }
  if (sourceManifest.status !== "production_equivalent_html_pdf_visible_difference_pass"
    || sourceManifest.humanReviewReady !== true
    || sourceManifest.productionSelectable !== false
    || sourceManifest.publicRouterChanged !== false) {
    throw new Error("GCTX-P12S source artifact manifest is not eligible for Pages review publication.");
  }
  if (visibleDiff.changedPromptCount !== 5
    || visibleDiff.preservedMathematicalWitnessCount !== 5
    || visibleDiff.uniqueSemanticVariantCount !== 5
    || visibleDiff.legacyPromptCountInAfter !== 0) {
    throw new Error("GCTX-P12S before/after evidence does not satisfy the five-context visible-difference gate.");
  }

  for (const sourcePath of [
    GCTX_P12S_PUBLICATION.sourcePdfPath,
    GCTX_P12S_PUBLICATION.sourceDiffPath,
    GCTX_P12S_PUBLICATION.sourceManifestPath
  ]) {
    const expectedHash = hashes.get(sourcePath);
    const actualHash = sha256File(repositoryPath(sourcePath));
    if (!expectedHash || expectedHash !== actualHash) {
      throw new Error(`GCTX-P12S source hash mismatch for ${sourcePath}: expected ${expectedHash}, got ${actualHash}`);
    }
  }

  return { claim, sourceManifest, visibleDiff, hashes };
}

function renderQuestionCards(visibleDiff) {
  return visibleDiff.pairs.map((pair) => `
        <article class="question-card">
          <div class="question-number">${escapeHtml(pair.questionNumber)}</div>
          <div>
            <p class="question-text">${escapeHtml(pair.afterPromptText)}</p>
            <p class="answer-witness"><strong>算式：</strong>${escapeHtml(pair.equationModel)}　<strong>答案：</strong>${escapeHtml(pair.answerText)}</p>
          </div>
        </article>`).join("");
}

function renderIndexHtml({ sourceManifest, visibleDiff, pdfSha256 }) {
  const questionCards = renderQuestionCards(visibleDiff);
  return `<!doctype html>
<html lang="zh-Hant">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>G3B-U04 全域情境 PDF 人工審查</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f4f6f8; color: #17202a; line-height: 1.6; }
    main { width: min(1120px, calc(100% - 32px)); margin: 32px auto 64px; }
    .warning { border: 2px solid #a63d00; background: #fff4e8; border-radius: 12px; padding: 18px 20px; }
    .warning strong { display: block; font-size: 1.2rem; }
    .status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 12px; margin: 20px 0; }
    .status-card, .question-card, .pdf-panel { background: #fff; border: 1px solid #d7dde3; border-radius: 12px; }
    .status-card { padding: 14px 16px; }
    .status-card span { display: block; color: #566573; font-size: .85rem; }
    .status-card strong { overflow-wrap: anywhere; }
    .actions { display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0; }
    .button { display: inline-block; padding: 10px 16px; border-radius: 8px; background: #173f70; color: #fff; text-decoration: none; font-weight: 700; }
    .button.secondary { background: #495057; }
    .pdf-panel { padding: 12px; }
    iframe { width: 100%; height: 78vh; min-height: 680px; border: 0; border-radius: 8px; background: #e9ecef; }
    h2 { margin-top: 32px; }
    .question-list { display: grid; gap: 12px; }
    .question-card { display: grid; grid-template-columns: 44px 1fr; gap: 12px; padding: 14px 16px; }
    .question-number { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: #eaf2f8; font-weight: 800; }
    .question-text { margin: 0 0 6px; }
    .answer-witness { margin: 0; color: #34495e; }
    code { overflow-wrap: anywhere; }
    footer { margin-top: 28px; color: #566573; font-size: .9rem; }
  </style>
</head>
<body>
  <main>
    <section class="warning">
      <strong>人工審查用 - 尚未正式接入公開出題</strong>
      此頁只發布已通過 production-equivalent renderer 與 PDF gate 的審查證據。核准前，這五個情境不會進入公開 selector 或 generator。
    </section>

    <h1>G3B-U04 全域情境 AFTER PDF</h1>
    <div class="status-grid">
      <div class="status-card"><span>Evidence level</span><strong>E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED</strong></div>
      <div class="status-card"><span>題目／情境數</span><strong>${sourceManifest.questionCount}／${sourceManifest.globalContextVariantCount}</strong></div>
      <div class="status-card"><span>PDF 頁數</span><strong>${sourceManifest.actualPdfPageCount}</strong></div>
      <div class="status-card"><span>productionAdmitted</span><strong>false</strong></div>
    </div>

    <div class="actions">
      <a class="button" href="./${GCTX_P12S_PUBLICATION.targetPdfName}" target="_blank" rel="noopener">開啟 AFTER PDF</a>
      <a class="button secondary" href="./${GCTX_P12S_PUBLICATION.targetDiffName}" target="_blank" rel="noopener">查看 Before／After 差異</a>
      <a class="button secondary" href="./${GCTX_P12S_PUBLICATION.targetManifestName}" target="_blank" rel="noopener">查看 Artifact Manifest</a>
    </div>

    <section class="pdf-panel" aria-label="AFTER PDF 預覽">
      <iframe src="./${GCTX_P12S_PUBLICATION.targetPdfName}" title="G3B-U04 AFTER PDF"></iframe>
    </section>

    <h2>五題審查摘要</h2>
    <section class="question-list">${questionCards}
    </section>

    <h2>Exact artifact identity</h2>
    <p>PDF SHA-256：<code>${escapeHtml(pdfSha256)}</code></p>
    <p>此 SHA-256 必須與主線 <code>GCTX-P12R.claim.json</code> 完全一致。</p>

    <footer>
      Review only · publicGeneratorChanged=false · productionSelectable=false · productionAdmitted=false
    </footer>
  </main>
</body>
</html>
`;
}

export function publishGctxP12SPagesReviewArtifacts({ outputDirectory = DEFAULT_OUTPUT_DIRECTORY, clean = false } = {}) {
  const verified = verifySourceEvidence();
  if (clean) rmSync(outputDirectory, { recursive: true, force: true });
  mkdirSync(outputDirectory, { recursive: true });

  const targetPaths = {
    pdf: resolve(outputDirectory, GCTX_P12S_PUBLICATION.targetPdfName),
    diff: resolve(outputDirectory, GCTX_P12S_PUBLICATION.targetDiffName),
    manifest: resolve(outputDirectory, GCTX_P12S_PUBLICATION.targetManifestName),
    index: resolve(outputDirectory, "index.html"),
    publicationManifest: resolve(outputDirectory, GCTX_P12S_PUBLICATION.publicationManifestName)
  };

  copyFileSync(repositoryPath(GCTX_P12S_PUBLICATION.sourcePdfPath), targetPaths.pdf);
  copyFileSync(repositoryPath(GCTX_P12S_PUBLICATION.sourceDiffPath), targetPaths.diff);
  copyFileSync(repositoryPath(GCTX_P12S_PUBLICATION.sourceManifestPath), targetPaths.manifest);

  const pdfSha256 = sha256File(targetPaths.pdf);
  const diffSha256 = sha256File(targetPaths.diff);
  const artifactManifestSha256 = sha256File(targetPaths.manifest);
  const sourceHashes = verified.hashes;

  if (pdfSha256 !== sourceHashes.get(GCTX_P12S_PUBLICATION.sourcePdfPath)
    || diffSha256 !== sourceHashes.get(GCTX_P12S_PUBLICATION.sourceDiffPath)
    || artifactManifestSha256 !== sourceHashes.get(GCTX_P12S_PUBLICATION.sourceManifestPath)) {
    throw new Error("GCTX-P12S staged Pages artifacts differ from their hash-locked P12R sources.");
  }

  const indexHtml = renderIndexHtml({
    sourceManifest: verified.sourceManifest,
    visibleDiff: verified.visibleDiff,
    pdfSha256
  });
  writeFileSync(targetPaths.index, indexHtml, "utf8");

  const publicationManifest = {
    schemaName: "GCTXG3BU04PagesHumanReviewPublicationManifest",
    schemaVersion: 1,
    taskId: GCTX_P12S_PUBLICATION.taskId,
    status: "pages_review_artifacts_staged",
    publicPath: GCTX_P12S_PUBLICATION.publicPath,
    reviewOnly: true,
    sourceEvidenceLevel: verified.claim.actualEvidenceLevel,
    sourceHumanReviewReady: verified.claim.claims.humanReviewReady,
    sourceProductionAdmitted: verified.claim.claims.productionAdmitted,
    publicGeneratorChanged: false,
    productionSelectable: false,
    productionAdmitted: false,
    questionCount: verified.sourceManifest.questionCount,
    globalContextVariantCount: verified.sourceManifest.globalContextVariantCount,
    pdfPageCount: verified.sourceManifest.actualPdfPageCount,
    files: [
      { name: GCTX_P12S_PUBLICATION.targetPdfName, sha256: pdfSha256 },
      { name: GCTX_P12S_PUBLICATION.targetDiffName, sha256: diffSha256 },
      { name: GCTX_P12S_PUBLICATION.targetManifestName, sha256: artifactManifestSha256 },
      { name: "index.html", sha256: sha256Bytes(Buffer.from(indexHtml, "utf8")) }
    ]
  };
  writeFileSync(targetPaths.publicationManifest, `${JSON.stringify(publicationManifest, null, 2)}\n`, "utf8");

  return { outputDirectory, targetPaths, publicationManifest };
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) {
  const args = parseArguments(process.argv.slice(2));
  const result = publishGctxP12SPagesReviewArtifacts({ outputDirectory: args.outputDirectory, clean: false });
  console.log(JSON.stringify({
    taskId: GCTX_P12S_PUBLICATION.taskId,
    outputDirectory: result.outputDirectory,
    publicPath: result.publicationManifest.publicPath,
    pdfSha256: result.publicationManifest.files[0].sha256,
    questionCount: result.publicationManifest.questionCount,
    productionAdmitted: result.publicationManifest.productionAdmitted
  }, null, 2));
}
