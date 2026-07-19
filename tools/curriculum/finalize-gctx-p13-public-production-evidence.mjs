import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(HERE, "../../docs/curriculum/output/gctx");
const PDF_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.pdf");
const MANIFEST_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.manifest.json");
const TEXT_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.extracted.txt");
const EVIDENCE_PATH = resolve(OUT_DIR, "GCTX_P13_G3BU04_PUBLIC_PRODUCTION.json");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const pdf = readFileSync(PDF_PATH);
const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
const evidence = JSON.parse(readFileSync(EVIDENCE_PATH, "utf8"));
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
const legacyTargetPhrases = [
  "三明治費用共",
  "果汁費用共",
  "筆記本費用共",
  "彩色筆費用共",
  "門票費用共",
  "帳篷租金共"
];
const missingPhrases = requiredPhrases.filter((phrase) => !extractedText.includes(phrase));
const leakedLegacyPhrases = legacyTargetPhrases.filter((phrase) => extractedText.includes(phrase));
const extractedRequiredContextCount = requiredPhrases.filter((phrase) => extractedText.includes(phrase)).length;
const extractedAnswerCount = (extractedText.match(/答案：/g) ?? []).length;

if (pageCount !== manifest.expectedPdfPageCount) {
  throw new Error(`GCTX-P13 PDF page count mismatch: expected ${manifest.expectedPdfPageCount}, got ${pageCount}`);
}
if (missingPhrases.length > 0) {
  throw new Error(`GCTX-P13 PDF missing approved global contexts: ${missingPhrases.join(", ")}`);
}
if (leakedLegacyPhrases.length > 0) {
  throw new Error(`GCTX-P13 PDF contains legacy target prompts: ${leakedLegacyPhrases.join(", ")}`);
}
if (extractedAnswerCount < evidence.targetAnswerCount) {
  throw new Error(`GCTX-P13 PDF answer extraction incomplete: ${extractedAnswerCount}`);
}
if (evidence.productionAdmitted !== true
  || evidence.publicQuerySelectable !== true
  || evidence.targetQuestionCount !== 5
  || evidence.uniqueApprovedVariantCount !== 5
  || evidence.mathematicalWitnessCount !== 5) {
  throw new Error("GCTX-P13 production evidence is incomplete or not admitted.");
}

const finalized = {
  ...manifest,
  status: "public_production_html_pdf_admission_pass",
  evidenceLevel: "E5_PRODUCTION_ADMITTED",
  actualPdfPageCount: pageCount,
  pdfSha256: sha256(pdf),
  pdfBytes: pdf.length,
  extractedRequiredContextCount,
  extractedAnswerCount,
  missingRequiredPhraseCount: missingPhrases.length,
  leakedLegacyTargetPhraseCount: leakedLegacyPhrases.length,
  productionSelectable: true,
  publicQuerySelectable: true,
  productionAdmitted: true,
  publicProductionRegressionPassed: true,
  humanReviewDecisionBound: true
};
writeFileSync(MANIFEST_PATH, `${JSON.stringify(finalized, null, 2)}\n`, "utf8");

console.log(JSON.stringify({
  pdfPath: PDF_PATH,
  manifestPath: MANIFEST_PATH,
  pageCount,
  pdfBytes: pdf.length,
  pdfSha256: finalized.pdfSha256,
  extractedRequiredContextCount,
  extractedAnswerCount,
  leakedLegacyTargetPhraseCount: leakedLegacyPhrases.length
}, null, 2));
