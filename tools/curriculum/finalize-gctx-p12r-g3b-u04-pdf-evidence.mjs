import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../../docs/curriculum/output/gctx");
const PDF_PATH = resolve(OUT_DIR, "GCTX_P12R_G3BU04_AFTER.pdf");
const MANIFEST_PATH = resolve(OUT_DIR, "GCTX_P12R_G3BU04_RENDERED_ARTIFACTS.manifest.json");
const TEXT_PATH = resolve(OUT_DIR, "GCTX_P12R_G3BU04_AFTER.extracted.txt");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const pdf = readFileSync(PDF_PATH);
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const info = execFileSync("pdfinfo", [PDF_PATH], { encoding: "utf8" });
const pageMatch = /^Pages:\s+(\d+)$/m.exec(info);
const pageCount = pageMatch ? Number(pageMatch[1]) : null;
execFileSync("pdftotext", ["-layout", PDF_PATH, TEXT_PATH]);
const extractedText = readFileSync(TEXT_PATH, "utf8");

const requiredPhrases = [
  "班級園遊會",
  "戶外學習",
  "運動練習",
  "社區清潔活動",
  "露營活動"
];
const missingPhrases = requiredPhrases.filter((phrase) => !extractedText.includes(phrase));
const legacyPhrases = ["三明治費用", "果汁費用", "筆記本費用", "彩色筆費用", "門票費用", "帳篷租金"];
const leakedLegacyPhrases = legacyPhrases.filter((phrase) => extractedText.includes(phrase));
const extractedPromptCount = requiredPhrases.filter((phrase) => extractedText.includes(phrase)).length;
const extractedAnswerCount = (extractedText.match(/答案：/g) ?? []).length;

if (pageCount !== manifest.expectedPdfPageCount) {
  throw new Error(`GCTX-P12R PDF page count mismatch: expected ${manifest.expectedPdfPageCount}, got ${pageCount}`);
}
if (missingPhrases.length > 0) {
  throw new Error(`GCTX-P12R PDF missing global contexts: ${missingPhrases.join(", ")}`);
}
if (leakedLegacyPhrases.length > 0) {
  throw new Error(`GCTX-P12R PDF contains legacy prompts: ${leakedLegacyPhrases.join(", ")}`);
}
if (extractedAnswerCount < 5) {
  throw new Error(`GCTX-P12R PDF answer extraction incomplete: ${extractedAnswerCount}`);
}

const finalized = {
  ...manifest,
  status: "production_equivalent_html_pdf_visible_difference_pass",
  evidenceLevel: "E4_PRODUCTION_EQUIVALENT_OUTPUT_VERIFIED",
  actualPdfPageCount: pageCount,
  pdfSha256: sha256(pdf),
  pdfBytes: pdf.length,
  extractedPromptCount,
  extractedAnswerCount,
  missingRequiredPhraseCount: missingPhrases.length,
  leakedLegacyPhraseCount: leakedLegacyPhrases.length,
  humanReviewReady: true,
  humanReviewType: "production_equivalent_output_review"
};
writeFileSync(MANIFEST_PATH, `${JSON.stringify(finalized, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  pdfPath: PDF_PATH,
  manifestPath: MANIFEST_PATH,
  pageCount,
  pdfBytes: pdf.length,
  pdfSha256: finalized.pdfSha256,
  extractedPromptCount,
  extractedAnswerCount
}, null, 2));
