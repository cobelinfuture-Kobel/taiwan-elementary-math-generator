import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
  G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS,
  G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-promotion.js";
import {
  G3B_U08_PRODUCTION_PROMOTION_ACTIVATION,
  G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID
} from "../../site/modules/curriculum/registry/g3b-u08-semantic-production-promotion.js";
import {
  getVisiblePatternGroupsForKnowledgePoint
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  BATCH_A_RESOLVER_SELECTION_MODES
} from "../../site/modules/curriculum/batch-a/visible-pattern-group-resolver.js";
import {
  buildBatchABrowserWorksheetDocument
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-s58h-extension.js";
import {
  listG3BU08SemanticPatternDefinitions
} from "../../site/modules/curriculum/batch-a/source-pattern-g3b-u08-semantic-extension.js";
import {
  renderWorksheetDocumentToHtml
} from "../../site/modules/renderer/html-renderer-s58h-extension.js";

const SOURCE_ID = "g3b_u08_3b08";
const TASK = "S58J_G3B_U08_ProductionRegressionStressHTMLPDFPromotionCloseout";
const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/smoke");
const HTML_PATH = resolve(OUT_DIR, "S58J_G3B_U08_PublicSemanticWorksheet.html");
const PDF_PATH = resolve(OUT_DIR, "S58J_G3B_U08_PublicSemanticWorksheet.pdf");
const MANIFEST_PATH = resolve(OUT_DIR, "S58J_G3B_U08_PublicSemanticWorksheet.manifest.json");
const RENDER_DIR = resolve(OUT_DIR, ".s58j-g3b-u08-render");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function countOccurrences(text, token) {
  return text.split(token).length - 1;
}

function applicationGroupIdsForKnowledgePoints(knowledgePointIds) {
  return knowledgePointIds.flatMap((knowledgePointId) => (
    getVisiblePatternGroupsForKnowledgePoint(knowledgePointId)
      .filter((group) => group.representationTag === "application_word_problem")
      .map((group) => group.patternGroupId)
  ));
}

function parsePdfPages(pdfInfo) {
  const match = /^Pages:\s+(\d+)$/m.exec(pdfInfo);
  if (!match) throw new Error("Unable to parse PDF page count from pdfinfo output.");
  return Number(match[1]);
}

function generateHtmlAndInitialManifest() {
  const selectedPatternGroupIds = applicationGroupIdsForKnowledgePoints(
    G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS
  );
  const options = {
    sourceId: SOURCE_ID,
    selectionMode: BATCH_A_RESOLVER_SELECTION_MODES.MIXED_KNOWLEDGE_POINTS_SAME_UNIT,
    selectedKnowledgePointIds: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS,
    selectedPatternGroupIds,
    questionCount: 48,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "s58j-public-semantic-html-pdf-smoke",
    printLayout: { columns: 4, rowsPerPage: 10, showAnswerKeyPage: true }
  };

  const result = buildBatchABrowserWorksheetDocument(options);
  if (!result.ok || !result.worksheetDocument) {
    throw new Error(`S58J canonical public worksheet generation failed: ${JSON.stringify(result.errors)}`);
  }
  const worksheetDocument = result.worksheetDocument;
  const definitions = listG3BU08SemanticPatternDefinitions();
  const familyContextVariantCount = definitions.reduce(
    (sum, definition) => sum + definition.contextDomains.length,
    0
  );

  let html = renderWorksheetDocumentToHtml(worksheetDocument, {
    title: "3B-U08 乘法與除法｜公開語意題型驗證",
    stylesheetHref: "../../../../site/assets/styles/print-styles.css",
    debugDataAttributes: false
  });
  html = html
    .replace(
      "<head>",
      '<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="S58J G3B-U08 canonical public smoke">'
    )
    .replace(
      '<body class="worksheet-renderer worksheet-renderer--g3b-u08-semantic"',
      '<body class="worksheet-renderer worksheet-renderer--g3b-u08-semantic" data-s58j-public-smoke="true"'
    );
  const htmlFileContents = `${html}\n`;

  const forbiddenTokens = [
    "kp_g3b_u08_",
    "pg_g3b_u08_",
    "ps_g3b_u08_",
    "tpl_g3b_u08_",
    "ctx_g3b_u08_",
    "hiddenSemanticMode",
    "numericMode",
    "representationMode",
    "g3b_u08_hidden_semantic",
    "{{",
    "}}"
  ];
  const leakedTokens = forbiddenTokens.filter((token) => htmlFileContents.includes(token));
  if (leakedTokens.length > 0) {
    throw new Error(`S58J public HTML contains forbidden tokens: ${leakedTokens.join(", ")}`);
  }

  const generatedPatternSpecIds = [...new Set(
    worksheetDocument.generatedQuestions.map((question) => question.patternSpecId)
  )];
  if (generatedPatternSpecIds.length !== 24) {
    throw new Error(`Expected 24 semantic families in public smoke, got ${generatedPatternSpecIds.length}`);
  }
  if (generatedPatternSpecIds.some((patternSpecId) => !G3B_U08_PROMOTED_SEMANTIC_PATTERN_SPEC_IDS.includes(patternSpecId))) {
    throw new Error("Public smoke contains an unpromoted G3B-U08 semantic PatternSpec.");
  }

  const manifest = {
    schemaName: "G3BU08PublicSemanticWorksheetSmokeManifest",
    schemaVersion: 1,
    task: TASK,
    status: "html_generated_pdf_pending",
    basePromotionRegistryId: G3B_U08_SEMANTIC_PROMOTION_REGISTRY_ID,
    productionPromotionOverlayId: G3B_U08_PRODUCTION_PROMOTION_OVERLAY_ID,
    promotionActivationStatus: G3B_U08_PRODUCTION_PROMOTION_ACTIVATION.status,
    canonicalPublicPath: true,
    publicHiddenModeFlagUsed: false,
    publicNumericModeUsed: false,
    representationToggleUsed: false,
    routeKind: worksheetDocument.batchA.routeKind,
    questionCount: worksheetDocument.summary.questionCount,
    answerKeyItemCount: worksheetDocument.answerKeyItems.length,
    questionPageCount: worksheetDocument.questionPages.length,
    answerKeyPageCount: worksheetDocument.answerKeyPages.length,
    expectedPdfPageCount: worksheetDocument.questionPages.length + worksheetDocument.answerKeyPages.length,
    actualPdfPageCount: null,
    visibleKnowledgePointCount: G3B_U08_PROMOTED_KNOWLEDGE_POINT_IDS.length,
    visibleSemanticPatternGroupCount: selectedPatternGroupIds.length,
    templateFamilyCount: generatedPatternSpecIds.length,
    familyContextVariantCount,
    semanticValidationErrorCount: result.validation?.errors?.length ?? 0,
    internalIdLeakCount: leakedTokens.length,
    unresolvedPlaceholderCount: countOccurrences(htmlFileContents, "{{") + countOccurrences(htmlFileContents, "}}"),
    rendererProfileId: worksheetDocument.rendererProfile.profileId,
    questionLayout: {
      columns: worksheetDocument.printOptions.columns,
      rowsPerPage: worksheetDocument.printOptions.rowsPerPage
    },
    answerKeyLayout: {
      columns: worksheetDocument.printOptions.answerKeyColumns,
      rowsPerPage: worksheetDocument.printOptions.answerKeyRowsPerPage
    },
    longTextCardPolicy: worksheetDocument.rendererProfile.questionSheet.longTextCardPolicy,
    pageBreakMode: worksheetDocument.printOptions.pageBreakMode,
    generationSeed: options.generationSeed,
    htmlSha256: sha256(htmlFileContents),
    pdfSha256: null,
    pdfBytes: null,
    renderedPageImageCount: null,
    extractedEquationLabelCount: null,
    extractedAnswerLabelCount: null
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(HTML_PATH, htmlFileContents, "utf8");
  writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifest;
}

function finalizeManifest() {
  const manifest = JSON.parse(readFileSync(MANIFEST_PATH, "utf8"));
  const html = readFileSync(HTML_PATH, "utf8");
  const pdf = readFileSync(PDF_PATH);
  const pdfInfo = execFileSync("pdfinfo", [PDF_PATH], { encoding: "utf8" });
  const extractedText = execFileSync("pdftotext", ["-layout", PDF_PATH, "-"], { encoding: "utf8" });

  rmSync(RENDER_DIR, { recursive: true, force: true });
  mkdirSync(RENDER_DIR, { recursive: true });
  execFileSync("pdftoppm", ["-png", "-r", "110", PDF_PATH, resolve(RENDER_DIR, "page")], {
    stdio: "inherit"
  });
  const renderedPageImageCount = readdirSync(RENDER_DIR)
    .filter((fileName) => /^page-\d+\.png$/.test(fileName))
    .length;
  rmSync(RENDER_DIR, { recursive: true, force: true });

  const finalized = {
    ...manifest,
    status: "public_html_pdf_smoke_pass",
    actualPdfPageCount: parsePdfPages(pdfInfo),
    htmlSha256: sha256(Buffer.from(html, "utf8")),
    pdfSha256: sha256(pdf),
    pdfBytes: statSync(PDF_PATH).size,
    renderedPageImageCount,
    extractedEquationLabelCount: countOccurrences(extractedText, "算式："),
    extractedAnswerLabelCount: countOccurrences(extractedText, "答案：")
  };

  if (finalized.actualPdfPageCount !== finalized.expectedPdfPageCount) {
    throw new Error(`Expected ${finalized.expectedPdfPageCount} PDF pages, got ${finalized.actualPdfPageCount}.`);
  }
  if (finalized.renderedPageImageCount !== finalized.expectedPdfPageCount) {
    throw new Error(`Expected ${finalized.expectedPdfPageCount} rendered images, got ${finalized.renderedPageImageCount}.`);
  }
  if (finalized.extractedEquationLabelCount !== finalized.questionCount) {
    throw new Error(`Expected ${finalized.questionCount} equation labels, got ${finalized.extractedEquationLabelCount}.`);
  }
  if (finalized.extractedAnswerLabelCount !== finalized.answerKeyItemCount) {
    throw new Error(`Expected ${finalized.answerKeyItemCount} answer labels, got ${finalized.extractedAnswerLabelCount}.`);
  }

  writeFileSync(MANIFEST_PATH, `${JSON.stringify(finalized, null, 2)}\n`, "utf8");
  return finalized;
}

const generated = generateHtmlAndInitialManifest();
const finalized = process.argv.includes("--finalize") ? finalizeManifest() : generated;
console.log(JSON.stringify({
  htmlPath: HTML_PATH,
  pdfPath: PDF_PATH,
  manifestPath: MANIFEST_PATH,
  status: finalized.status,
  questionCount: finalized.questionCount,
  templateFamilyCount: finalized.templateFamilyCount,
  familyContextVariantCount: finalized.familyContextVariantCount,
  expectedPdfPageCount: finalized.expectedPdfPageCount,
  actualPdfPageCount: finalized.actualPdfPageCount
}, null, 2));
