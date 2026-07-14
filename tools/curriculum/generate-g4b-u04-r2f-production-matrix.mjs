import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS,
  G4B_U04_PROMOTED_PATTERN_GROUP_IDS,
  G4B_U04_PROMOTED_PATTERN_SPEC_IDS,
} from "../../site/modules/curriculum/registry/g4b-u04-promotion.js";
import {
  G4B_U04_PRODUCTION_LIFECYCLE,
} from "../../site/modules/curriculum/registry/g4b-u04-production-promotion.js";
import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import {
  renderWorksheetDocumentToHtml,
} from "../../site/modules/renderer/html-renderer-s73-extension.js";
import {
  normalizeG4BU04PromptSignature,
} from "../../site/modules/curriculum/batch-b/g4b-u04-prompt-deduplication.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../docs/curriculum/output/stress/g4b-u04-r2f");
const SOURCE_ID = "g4b_u04_4b04";
const ESTIMATION_KP = "kp_g4b_u04_round_then_add_subtract";
const ESTIMATION_GROUP = "pg_g4b_u04_estimate_add_subtract";

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function fullOptions({ contextMode, layoutMode, seed }) {
  return {
    sourceId: SOURCE_ID,
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: [...G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS],
    selectedPatternGroupIds: [...G4B_U04_PROMOTED_PATTERN_GROUP_IDS],
    questionMode: "mixed",
    contextMode,
    layoutMode,
    questionCount: 68,
    ordering: "groupedByPattern",
    generationSeed: seed,
    includeAnswerKey: true,
    printLayout: {
      paperSize: "A4",
      columns: layoutMode === "auto_safe" ? 6 : 2,
      rowsPerPage: layoutMode === "auto_safe" ? 20 : 4,
      showAnswerKeyPage: true,
    },
  };
}

function estimationOptions({ contextMode, layoutMode, seed }) {
  return {
    sourceId: SOURCE_ID,
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [ESTIMATION_KP],
    selectedPatternGroupIds: [ESTIMATION_GROUP],
    questionMode: "operation_estimation",
    contextMode,
    layoutMode,
    questionCount: 36,
    ordering: "groupedByPattern",
    generationSeed: seed,
    includeAnswerKey: true,
    printLayout: {
      paperSize: "A4",
      columns: layoutMode === "auto_safe" ? 6 : 1,
      rowsPerPage: layoutMode === "auto_safe" ? 20 : 3,
      showAnswerKeyPage: true,
    },
  };
}

const scenarios = [
  { id: "mixed-auto", options: fullOptions({ contextMode: "mixed", layoutMode: "auto_safe", seed: "r2f-mixed-auto" }) },
  { id: "mixed-custom", options: fullOptions({ contextMode: "mixed", layoutMode: "custom_with_caps", seed: "r2f-mixed-custom" }) },
  { id: "daily-life-auto", options: estimationOptions({ contextMode: "daily_life", layoutMode: "auto_safe", seed: "r2f-daily-auto" }) },
  { id: "daily-life-custom", options: estimationOptions({ contextMode: "daily_life", layoutMode: "custom_with_caps", seed: "r2f-daily-custom" }) },
  { id: "sdg-auto", options: estimationOptions({ contextMode: "sdg", layoutMode: "auto_safe", seed: "r2f-sdg-auto" }) },
  { id: "sdg-custom", options: estimationOptions({ contextMode: "sdg", layoutMode: "custom_with_caps", seed: "r2f-sdg-custom" }) },
];

rmSync(ROOT, { recursive: true, force: true });
mkdirSync(ROOT, { recursive: true });

const manifest = {
  schemaName: "G4BU04R2FProductionMatrixManifest",
  schemaVersion: 1,
  task: "G4B_U04_R2F_ProductionStressAndD0Recloseout",
  status: "html_generated_pdf_pending",
  sourceId: SOURCE_ID,
  productionUse: G4B_U04_PRODUCTION_LIFECYCLE.productionUse,
  distance: G4B_U04_PRODUCTION_LIFECYCLE.distance,
  effectiveAuthority: {
    knowledgePoints: G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length,
    patternGroups: G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length,
    patternSpecs: G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length,
  },
  scenarios: [],
};

for (const scenario of scenarios) {
  const result = buildBatchABrowserWorksheetDocument(scenario.options);
  if (!result.ok || !result.worksheetDocument) {
    throw new Error(`${scenario.id}: generation failed: ${JSON.stringify(result.errors)}`);
  }
  const document = result.worksheetDocument;
  const questions = document.generatedQuestions;
  const signatures = questions.map((question) => normalizeG4BU04PromptSignature(question.promptText));
  if (new Set(signatures).size !== signatures.length) {
    throw new Error(`${scenario.id}: duplicate prompt signature`);
  }
  if ((result.validation?.errors ?? []).length !== 0) {
    throw new Error(`${scenario.id}: blocking validation error`);
  }
  if (scenario.options.contextMode === "sdg" && document.contextAllocation.counts.sdg !== questions.length) {
    throw new Error(`${scenario.id}: expected every question to use SDG context`);
  }
  if (scenario.options.contextMode === "daily_life" && document.contextAllocation.counts.daily_life !== questions.length) {
    throw new Error(`${scenario.id}: expected every question to use daily-life context`);
  }
  if (scenario.id.startsWith("mixed")) {
    const reachedKps = new Set(questions.map((question) => question.knowledgePointId));
    const reachedGroups = new Set(questions.map((question) => question.resolvedPatternGroupId ?? question.patternGroupId));
    const reachedSpecs = new Set(questions.map((question) => question.patternSpecId));
    if (reachedKps.size !== G4B_U04_PROMOTED_KNOWLEDGE_POINT_IDS.length
      || reachedGroups.size !== G4B_U04_PROMOTED_PATTERN_GROUP_IDS.length
      || reachedSpecs.size !== G4B_U04_PROMOTED_PATTERN_SPEC_IDS.length) {
      throw new Error(`${scenario.id}: effective authority coverage mismatch`);
    }
  }

  let html = renderWorksheetDocumentToHtml(document, {
    title: `4B-U04 概數｜R2F ${scenario.id}`,
    stylesheetHref: "../../../../../site/assets/styles/print-styles.css",
    debugDataAttributes: false,
  });
  html = html
    .replace("<head>", `<head><meta name="robots" content="noindex,nofollow"><meta name="generator" content="G4B-U04 R2F production matrix ${scenario.id}">`)
    .replace(
      '<body class="worksheet-renderer worksheet-renderer--g4b-u04"',
      `<body class="worksheet-renderer worksheet-renderer--g4b-u04" data-r2f-scenario="${scenario.id}"`,
    );
  const htmlContents = `${html}\n`;
  if (/\b(?:kp|pg|ps|fm|fmc|tpl)_g4b_u04_[a-z0-9_]+\b/i.test(htmlContents)) {
    throw new Error(`${scenario.id}: internal identifier leak`);
  }
  if (/\{\{[^{}]+\}\}|undefined|null/.test(htmlContents)) {
    throw new Error(`${scenario.id}: unresolved placeholder leak`);
  }
  const htmlPath = resolve(ROOT, `${scenario.id}.html`);
  writeFileSync(htmlPath, htmlContents, "utf8");

  manifest.scenarios.push({
    id: scenario.id,
    contextMode: scenario.options.contextMode,
    layoutMode: scenario.options.layoutMode,
    questionCount: questions.length,
    answerKeyItemCount: document.answerKeyItems.length,
    questionPageCount: document.questionPages.length,
    answerKeyPageCount: document.answerKeyPages.length,
    expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
    actualPdfPageCount: null,
    contextAllocation: document.contextAllocation,
    layoutResolution: document.layoutResolution,
    reachedKnowledgePointCount: new Set(questions.map((question) => question.knowledgePointId)).size,
    reachedPatternGroupCount: new Set(questions.map((question) => question.resolvedPatternGroupId ?? question.patternGroupId)).size,
    reachedPatternSpecCount: new Set(questions.map((question) => question.patternSpecId)).size,
    validationErrorCount: result.validation?.errors?.length ?? 0,
    duplicatePromptCount: signatures.length - new Set(signatures).size,
    genericContextFallbackUsed: document.provenance.genericContextFallbackUsed,
    freeFormAIUsed: document.provenance.freeFormAIUsed,
    htmlFile: `${scenario.id}.html`,
    pdfFile: `${scenario.id}.pdf`,
    htmlSha256: sha256(htmlContents),
    pdfSha256: null,
    pdfBytes: null,
    domOverflowCount: null,
    renderedPageImageCount: null,
    nonblankRenderedPageCount: null,
    pdfBoundingBoxOverflowCount: null,
  });
}

writeFileSync(resolve(ROOT, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify(manifest, null, 2));
