import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  GCTX_P12S_PUBLICATION,
  publishGctxP12SPagesReviewArtifacts
} from "../../tools/governance/publish-gctx-p12s-pages-review-artifacts.mjs";

const EXPECTED_PDF_SHA256 = "777ac95e2bd138895dda1822de58d0c9f52571513e63ff74d14687de6875e0f0";
const EXPECTED_CONTEXT_PHRASES = [
  "班級園遊會",
  "戶外學習",
  "運動練習",
  "社區清潔活動",
  "露營活動"
];

test("GCTX-P12S stages the exact P12R PDF and review evidence without production admission", () => {
  const outputDirectory = mkdtempSync(join(tmpdir(), "gctx-p12s-"));
  try {
    const result = publishGctxP12SPagesReviewArtifacts({ outputDirectory, clean: true });
    const publication = result.publicationManifest;
    const pdfEntry = publication.files.find((entry) => entry.name === GCTX_P12S_PUBLICATION.targetPdfName);

    assert.equal(publication.status, "pages_review_artifacts_staged");
    assert.equal(publication.publicPath, "/review/g3b-u04/");
    assert.equal(publication.reviewOnly, true);
    assert.equal(publication.sourceEvidenceLevel, "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED");
    assert.equal(publication.sourceHumanReviewReady, true);
    assert.equal(publication.sourceProductionAdmitted, false);
    assert.equal(publication.publicGeneratorChanged, false);
    assert.equal(publication.productionSelectable, false);
    assert.equal(publication.productionAdmitted, false);
    assert.equal(publication.questionCount, 5);
    assert.equal(publication.globalContextVariantCount, 5);
    assert.equal(publication.pdfPageCount, 2);
    assert.equal(pdfEntry?.sha256, EXPECTED_PDF_SHA256);
  } finally {
    rmSync(outputDirectory, { recursive: true, force: true });
  }
});

test("GCTX-P12S review page embeds the authoritative PDF and exposes all five review questions", () => {
  const outputDirectory = mkdtempSync(join(tmpdir(), "gctx-p12s-"));
  try {
    const result = publishGctxP12SPagesReviewArtifacts({ outputDirectory, clean: true });
    const html = readFileSync(result.targetPaths.index, "utf8");

    assert.match(html, /人工審查用 - 尚未正式接入公開出題/);
    assert.match(html, new RegExp(GCTX_P12S_PUBLICATION.targetPdfName.replaceAll(".", "\\.")));
    assert.match(html, /productionAdmitted<\/span><strong>false/);
    assert.match(html, /publicGeneratorChanged=false/);
    assert.match(html, /productionSelectable=false/);
    assert.match(html, new RegExp(EXPECTED_PDF_SHA256));
    for (const phrase of EXPECTED_CONTEXT_PHRASES) assert.match(html, new RegExp(phrase));
    assert.doesNotMatch(html, /三明治費用|果汁費用|筆記本費用|彩色筆費用|門票費用|帳篷租金/);
  } finally {
    rmSync(outputDirectory, { recursive: true, force: true });
  }
});

test("GCTX-P12S output manifest keeps copied artifact hashes equal to their P12R authority", () => {
  const outputDirectory = mkdtempSync(join(tmpdir(), "gctx-p12s-"));
  try {
    const result = publishGctxP12SPagesReviewArtifacts({ outputDirectory, clean: true });
    const publishedManifest = JSON.parse(readFileSync(result.targetPaths.publicationManifest, "utf8"));
    const sourceManifest = JSON.parse(readFileSync(result.targetPaths.manifest, "utf8"));

    assert.equal(publishedManifest.files[0].sha256, sourceManifest.pdfSha256);
    assert.equal(sourceManifest.humanReviewReady, true);
    assert.equal(sourceManifest.productionSelectable, false);
    assert.equal(sourceManifest.publicRouterChanged, false);
    assert.equal(publishedManifest.productionAdmitted, false);
  } finally {
    rmSync(outputDirectory, { recursive: true, force: true });
  }
});
