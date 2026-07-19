import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUTPUT = path.join(ROOT, "docs/curriculum/output/gctx-p12r");
const MANIFEST = path.join(OUTPUT, "GCTX_P12R_G3BU04_ArtifactManifest.json");
const BEFORE_AFTER = path.join(OUTPUT, "GCTX_P12R_G3BU04_BeforeAfter.json");
const CLAIM = path.join(ROOT, "data/project/milestones/GCTX-P12R.claim.json");
const artifactsExist = fs.existsSync(MANIFEST);

const sha256 = (filePath) => crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));

test("GCTX-P12R artifact state matches its Claim Manifest evidence level", () => {
  const claim = readJson(CLAIM);
  if (!artifactsExist) {
    assert.equal(claim.actualEvidenceLevel, "E3_SHADOW_RUNTIME_INTEGRATED");
    assert.equal(claim.claims.runtimeIntegrated, true);
    assert.equal(claim.claims.productionEquivalentGeneratorUsed, true);
    assert.equal(claim.claims.productionRendererUsed, false);
    assert.equal(claim.claims.htmlOutputVerified, false);
    assert.equal(claim.claims.pdfOutputVerified, false);
    assert.equal(claim.claims.visibleOutputChanged, false);
    assert.equal(claim.claims.humanReviewReady, false);
    return;
  }
  assert.equal(claim.actualEvidenceLevel, "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED");
  assert.equal(claim.claims.productionRendererUsed, true);
  assert.equal(claim.claims.htmlOutputVerified, true);
  assert.equal(claim.claims.pdfOutputVerified, true);
  assert.equal(claim.claims.visibleOutputChanged, true);
  assert.equal(claim.claims.humanReviewReady, true);
});

test("GCTX-P12R committed artifact manifest is E4 complete", { skip: !artifactsExist }, () => {
  const manifest = readJson(MANIFEST);
  assert.equal(manifest.status, "production_equivalent_html_pdf_pass");
  assert.equal(manifest.actualEvidenceLevel, "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED");
  assert.equal(manifest.questionCount, 20);
  assert.equal(manifest.targetQuestionCount, 5);
  assert.equal(manifest.variantCount, 5);
  assert.equal(manifest.visibleChangedCount, 5);
  assert.equal(manifest.equationPreservedCount, 5);
  assert.equal(manifest.answerPreservedCount, 5);
  assert.equal(manifest.publicSelectorExposed, false);
  assert.equal(manifest.productionSelectable, false);
  assert.equal(manifest.humanReviewReady, true);
});

test("GCTX-P12R committed HTML and PDF hashes match the final manifest", { skip: !artifactsExist }, () => {
  const manifest = readJson(MANIFEST);
  for (const key of ["beforeHtml", "afterHtml", "beforePdf", "afterPdf", "beforeAfter"]) {
    const artifact = manifest.artifacts[key];
    const filePath = path.join(ROOT, artifact.path);
    assert.equal(fs.existsSync(filePath), true, key);
    assert.equal(fs.statSync(filePath).size, artifact.bytes, key);
    assert.equal(sha256(filePath), artifact.sha256, key);
  }
  for (const key of ["beforePdf", "afterPdf"]) {
    const filePath = path.join(ROOT, manifest.artifacts[key].path);
    assert.equal(fs.readFileSync(filePath).subarray(0, 5).toString("ascii"), "%PDF-");
    assert.equal(manifest.artifacts[key].pages, manifest.expectedPdfPageCount);
    assert.ok(manifest.artifacts[key].bytes >= 20000);
  }
});

test("GCTX-P12R before-after evidence proves visible change and mathematical parity", { skip: !artifactsExist }, () => {
  const evidence = readJson(BEFORE_AFTER);
  assert.equal(evidence.comparisonCount, 5);
  assert.equal(evidence.visibleChangedCount, 5);
  assert.equal(evidence.equationPreservedCount, 5);
  assert.equal(evidence.answerPreservedCount, 5);
  assert.equal(evidence.comparisons.every((row) => row.changed), true);
  assert.equal(new Set(evidence.comparisons.map((row) => row.semanticVariantId)).size, 5);
  assert.equal(new Set(evidence.comparisons.map((row) => row.globalContextDomainId)).size, 5);
});

test("GCTX-P12R formal after HTML contains all five contexts and no legacy target prompts", { skip: !artifactsExist }, () => {
  const manifest = readJson(MANIFEST);
  const beforeHtml = fs.readFileSync(path.join(ROOT, manifest.artifacts.beforeHtml.path), "utf8");
  const afterHtml = fs.readFileSync(path.join(ROOT, manifest.artifacts.afterHtml.path), "utf8");
  assert.notEqual(afterHtml, beforeHtml);
  for (const phrase of ["班級園遊會", "戶外學習", "運動練習", "社區清潔活動", "露營活動"]) {
    assert.match(afterHtml, new RegExp(phrase));
  }
  assert.doesNotMatch(afterHtml, /三明治費用共|筆記本費用共|人的門票費用共|帳篷租金共/);
  assert.match(afterHtml, /worksheet-renderer--g3b-u04-semantic/);
  assert.match(afterHtml, /data-renderer-profile="g3b_u04_semantic_long_text_v1"/);
});
