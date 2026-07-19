import crypto from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildG3BU04GlobalContextPilotWorksheet
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-worksheet-fullfix.js";
import {
  G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID
} from "../../site/modules/curriculum/batch-a/g3b-u04-global-context-pilot-runtime.js";
import {
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s57f5-extension.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUTPUT_DIR = path.join(ROOT, "docs/curriculum/output/gctx-p12r");
const PATHS = {
  beforeHtml: path.join(OUTPUT_DIR, "GCTX_P12R_G3BU04_Before.html"),
  afterHtml: path.join(OUTPUT_DIR, "GCTX_P12R_G3BU04_After.html"),
  beforeAfter: path.join(OUTPUT_DIR, "GCTX_P12R_G3BU04_BeforeAfter.json"),
  manifest: path.join(OUTPUT_DIR, "GCTX_P12R_G3BU04_ArtifactManifest.json")
};

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const repoPath = (value) => path.relative(ROOT, value).replaceAll("\\", "/");

await mkdir(OUTPUT_DIR, { recursive: true });

const result = buildG3BU04GlobalContextPilotWorksheet({
  generationSeed: "gctx-p12r-formal-html-pdf-v1"
});
if (!result.ok || !result.baselineWorksheetDocument || !result.pilotWorksheetDocument) {
  throw new Error(`GCTX-P12R worksheet generation failed: ${JSON.stringify(result.errors)}`);
}

const baselineDocument = result.baselineWorksheetDocument;
const pilotDocument = result.pilotWorksheetDocument;
const renderOptions = { stylesheetHref: "", debugDataAttributes: false };
const beforeHtml = renderWorksheetDocumentToHtml(baselineDocument, {
  ...renderOptions,
  title: "GCTX-P12R｜修改前正式路徑"
});
const afterHtml = renderWorksheetDocumentToHtml(pilotDocument, {
  ...renderOptions,
  title: "GCTX-P12R｜修改後全域情境正式路徑"
});

const beforeTargets = baselineDocument.generatedQuestions
  .filter((question) => question.patternSpecId === G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID);
const afterTargets = pilotDocument.generatedQuestions
  .filter((question) => question.patternSpecId === G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID);
const comparisons = beforeTargets.map((before, index) => ({
  index: index + 1,
  questionId: before.id,
  beforePrompt: before.promptText,
  afterPrompt: afterTargets[index]?.promptText ?? null,
  changed: before.promptText !== afterTargets[index]?.promptText,
  equationModelBefore: before.equationModel,
  equationModelAfter: afterTargets[index]?.equationModel ?? null,
  answerBefore: before.answerText,
  answerAfter: afterTargets[index]?.answerText ?? null,
  authorityContextDomain: afterTargets[index]?.globalContextPilot?.authorityContextDomain ?? null,
  semanticVariantId: afterTargets[index]?.globalContextPilot?.semanticVariantId ?? null,
  globalContextDomainId: afterTargets[index]?.globalContextPilot?.globalContextDomainId ?? null
}));

const beforeAfter = {
  schemaName: "GCTXG3BU04ProductionEquivalentBeforeAfterEvidence",
  schemaVersion: 1,
  task: "GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix",
  productionEquivalentPath: {
    resolver: "visiblePatternGroupResolver",
    generator: "S57F4 canonical semantic generator",
    validator: "S57F5 canonical validator plus P12R pilot validator extension",
    renderer: "S57F5 production HTML renderer"
  },
  baselineWorksheetId: baselineDocument.worksheetId,
  pilotWorksheetId: pilotDocument.worksheetId,
  targetPatternSpecId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
  comparisonCount: comparisons.length,
  visibleChangedCount: comparisons.filter((row) => row.changed).length,
  equationPreservedCount: comparisons.filter((row) => row.equationModelBefore === row.equationModelAfter).length,
  answerPreservedCount: comparisons.filter((row) => row.answerBefore === row.answerAfter).length,
  comparisons
};

const manifest = {
  schemaName: "GCTXG3BU04RuntimeRendererPdfArtifactManifest",
  schemaVersion: 1,
  task: "GCTX-P12R_G3BU04GlobalContextPilotRuntimeRendererAndPDFFullFix",
  status: "html_generated_pdf_pending",
  sourceId: "g3b_u04_3b04",
  unitCode: "3B-U04",
  generationSeed: "gctx-p12r-formal-html-pdf-v1",
  targetPatternSpecId: G3B_U04_GLOBAL_CONTEXT_PILOT_PATTERN_SPEC_ID,
  productionEquivalentPath: beforeAfter.productionEquivalentPath,
  resolverFamilyCount: result.resolverFamilyCount,
  questionCount: pilotDocument.summary.questionCount,
  targetQuestionCount: pilotDocument.summary.globalContextPilotQuestionCount,
  variantCount: pilotDocument.summary.globalContextPilotVariantCount,
  questionPageCount: pilotDocument.questionPages.length,
  answerKeyPageCount: pilotDocument.answerKeyPages.length,
  expectedPdfPageCount: pilotDocument.questionPages.length + pilotDocument.answerKeyPages.length,
  visibleChangedCount: beforeAfter.visibleChangedCount,
  equationPreservedCount: beforeAfter.equationPreservedCount,
  answerPreservedCount: beforeAfter.answerPreservedCount,
  publicSelectorExposed: false,
  productionSelectable: false,
  humanReviewReady: false,
  artifacts: {
    beforeHtml: { path: repoPath(PATHS.beforeHtml), bytes: Buffer.byteLength(beforeHtml), sha256: sha256(beforeHtml) },
    afterHtml: { path: repoPath(PATHS.afterHtml), bytes: Buffer.byteLength(afterHtml), sha256: sha256(afterHtml) },
    beforePdf: { path: "docs/curriculum/output/gctx-p12r/GCTX_P12R_G3BU04_Before.pdf", bytes: null, sha256: null, pages: null },
    afterPdf: { path: "docs/curriculum/output/gctx-p12r/GCTX_P12R_G3BU04_After.pdf", bytes: null, sha256: null, pages: null },
    beforeAfter: { path: repoPath(PATHS.beforeAfter), bytes: null, sha256: null }
  }
};

const beforeAfterText = `${JSON.stringify(beforeAfter, null, 2)}\n`;
manifest.artifacts.beforeAfter.bytes = Buffer.byteLength(beforeAfterText);
manifest.artifacts.beforeAfter.sha256 = sha256(beforeAfterText);

await writeFile(PATHS.beforeHtml, beforeHtml, "utf8");
await writeFile(PATHS.afterHtml, afterHtml, "utf8");
await writeFile(PATHS.beforeAfter, beforeAfterText, "utf8");
await writeFile(PATHS.manifest, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

process.stdout.write(`${JSON.stringify({
  ok: true,
  outputDir: repoPath(OUTPUT_DIR),
  resolverFamilyCount: manifest.resolverFamilyCount,
  questionCount: manifest.questionCount,
  targetQuestionCount: manifest.targetQuestionCount,
  visibleChangedCount: manifest.visibleChangedCount,
  expectedPdfPageCount: manifest.expectedPdfPageCount
}, null, 2)}\n`);
