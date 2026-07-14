import { createHash } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildBatchABrowserWorksheetDocument,
} from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2d-entry.js";
import {
  G4B_U04_LAYOUT_CAPPED_NOTICE,
} from "../../site/modules/curriculum/batch-b/g4b-u04-layout-resolution.js";
import {
  renderPreviewFrame,
} from "../../site/assets/browser/pipeline/render-preview-frame.js";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT_DIR = resolve(REPO_ROOT, "docs/curriculum/output/smoke/r2d-g4b-u04-layout");
const MANIFEST_PATH = resolve(OUT_DIR, "G4B_U04_R2D_LayoutSmoke.manifest.json");

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function count(text, token) {
  return text.split(token).length - 1;
}

function plan({
  knowledgePointId,
  patternGroupId,
  questionMode,
  layoutMode,
  columns,
  rowsPerPage,
  questionCount,
  seed,
}) {
  return {
    sourceId: "g4b_u04_4b04",
    worksheetMode: "batchAKnowledgePoint",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: [patternGroupId],
    questionMode,
    layoutMode,
    questionCount,
    ordering: "groupedByPattern",
    generationSeed: seed,
    includeAnswerKey: true,
    printLayout: {
      paperSize: "A4",
      columns,
      rowsPerPage,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
  };
}

const scenarios = [
  {
    id: "compact-auto-safe",
    title: "概數｜直接取概數｜自動安全版面",
    expectedProfileId: "g4b_u04_compact_concept_numeric_v1",
    expectedQuestionLayout: { paperSize: "A4", columns: 2, rowsPerPage: 6 },
    expectedAnswerLayout: { paperSize: "A4", columns: 2, rowsPerPage: 8 },
    expectedCapped: false,
    plan: plan({
      knowledgePointId: "kp_g4b_u04_round_half_up_place_value",
      patternGroupId: "pg_g4b_u04_round_half_up",
      questionMode: "numeric",
      layoutMode: "auto_safe",
      columns: 6,
      rowsPerPage: 20,
      questionCount: 12,
      seed: "r2d-smoke-compact-auto",
    }),
  },
  {
    id: "compact-custom-lower",
    title: "概數｜直接取概數｜自訂低密度",
    expectedProfileId: "g4b_u04_compact_concept_numeric_v1",
    expectedQuestionLayout: { paperSize: "A4", columns: 1, rowsPerPage: 4 },
    expectedAnswerLayout: { paperSize: "A4", columns: 2, rowsPerPage: 8 },
    expectedCapped: false,
    plan: plan({
      knowledgePointId: "kp_g4b_u04_round_half_up_place_value",
      patternGroupId: "pg_g4b_u04_round_half_up",
      questionMode: "numeric",
      layoutMode: "custom_with_caps",
      columns: 1,
      rowsPerPage: 4,
      questionCount: 12,
      seed: "r2d-smoke-compact-custom",
    }),
  },
  {
    id: "contextual-auto-safe",
    title: "概數｜付款應用｜自動安全版面",
    expectedProfileId: "g4b_u04_contextual_estimation_v1",
    expectedQuestionLayout: { paperSize: "A4", columns: 2, rowsPerPage: 4 },
    expectedAnswerLayout: { paperSize: "A4", columns: 1, rowsPerPage: 6 },
    expectedCapped: false,
    plan: plan({
      knowledgePointId: "kp_g4b_u04_payment_denomination_ceiling",
      patternGroupId: "pg_g4b_u04_payment_ceiling",
      questionMode: "application",
      layoutMode: "auto_safe",
      columns: 6,
      rowsPerPage: 20,
      questionCount: 12,
      seed: "r2d-smoke-context-auto",
    }),
  },
  {
    id: "contextual-custom-lower",
    title: "概數｜付款應用｜自訂低密度",
    expectedProfileId: "g4b_u04_contextual_estimation_v1",
    expectedQuestionLayout: { paperSize: "A4", columns: 1, rowsPerPage: 3 },
    expectedAnswerLayout: { paperSize: "A4", columns: 1, rowsPerPage: 6 },
    expectedCapped: false,
    plan: plan({
      knowledgePointId: "kp_g4b_u04_payment_denomination_ceiling",
      patternGroupId: "pg_g4b_u04_payment_ceiling",
      questionMode: "application",
      layoutMode: "custom_with_caps",
      columns: 1,
      rowsPerPage: 3,
      questionCount: 12,
      seed: "r2d-smoke-context-custom",
    }),
  },
  {
    id: "inverse-auto-safe",
    title: "概數｜逆推原數｜自動安全版面",
    expectedProfileId: "g4b_u04_inverse_long_answer_v1",
    expectedQuestionLayout: { paperSize: "A4", columns: 1, rowsPerPage: 4 },
    expectedAnswerLayout: { paperSize: "A4", columns: 1, rowsPerPage: 5 },
    expectedCapped: false,
    plan: plan({
      knowledgePointId: "kp_g4b_u04_inverse_rounding_possible_original",
      patternGroupId: "pg_g4b_u04_inverse_original_values",
      questionMode: "reasoning",
      layoutMode: "auto_safe",
      columns: 6,
      rowsPerPage: 20,
      questionCount: 8,
      seed: "r2d-smoke-inverse-auto",
    }),
  },
  {
    id: "inverse-custom-capped",
    title: "概數｜逆推原數｜自訂超限自動調整",
    expectedProfileId: "g4b_u04_inverse_long_answer_v1",
    expectedQuestionLayout: { paperSize: "A4", columns: 1, rowsPerPage: 4 },
    expectedAnswerLayout: { paperSize: "A4", columns: 1, rowsPerPage: 5 },
    expectedCapped: true,
    plan: plan({
      knowledgePointId: "kp_g4b_u04_inverse_rounding_possible_original",
      patternGroupId: "pg_g4b_u04_inverse_original_values",
      questionMode: "reasoning",
      layoutMode: "custom_with_caps",
      columns: 6,
      rowsPerPage: 20,
      questionCount: 8,
      seed: "r2d-smoke-inverse-capped",
    }),
  },
];

rmSync(OUT_DIR, { recursive: true, force: true });
mkdirSync(OUT_DIR, { recursive: true });

const manifestScenarios = [];
for (const scenario of scenarios) {
  const result = buildBatchABrowserWorksheetDocument({
    ...scenario.plan,
    title: scenario.title,
  });
  if (!result.ok || !result.worksheetDocument) {
    throw new Error(`${scenario.id}: generation failed: ${JSON.stringify(result.errors)}`);
  }
  const document = result.worksheetDocument;
  const layout = document.layoutResolution;
  if (layout.profileId !== scenario.expectedProfileId) {
    throw new Error(`${scenario.id}: profile mismatch ${layout.profileId}/${scenario.expectedProfileId}`);
  }
  if (JSON.stringify(layout.resolvedQuestionLayout) !== JSON.stringify(scenario.expectedQuestionLayout)) {
    throw new Error(`${scenario.id}: question layout mismatch ${JSON.stringify(layout.resolvedQuestionLayout)}`);
  }
  if (JSON.stringify(layout.resolvedAnswerLayout) !== JSON.stringify(scenario.expectedAnswerLayout)) {
    throw new Error(`${scenario.id}: answer layout mismatch ${JSON.stringify(layout.resolvedAnswerLayout)}`);
  }
  if (layout.capped !== scenario.expectedCapped) {
    throw new Error(`${scenario.id}: capped mismatch ${layout.capped}/${scenario.expectedCapped}`);
  }
  if (scenario.expectedCapped && layout.noticeText !== G4B_U04_LAYOUT_CAPPED_NOTICE) {
    throw new Error(`${scenario.id}: exact cap notice missing`);
  }
  if (!scenario.expectedCapped && layout.noticeText !== null) {
    throw new Error(`${scenario.id}: unexpected cap notice`);
  }
  if (document.generatedQuestions.length !== scenario.plan.questionCount
    || document.answerKeyItems.length !== scenario.plan.questionCount) {
    throw new Error(`${scenario.id}: question/answer count mismatch`);
  }
  if ((result.validation?.errors ?? []).length !== 0) {
    throw new Error(`${scenario.id}: blocking validation errors`);
  }

  const frame = { srcdoc: "", dataset: {} };
  renderPreviewFrame(frame, document, {
    title: scenario.title,
    stylesheetHref: "../../../../../site/assets/styles/print-styles.css",
    debugDataAttributes: false,
  });
  const html = `${frame.srcdoc}\n`;
  const questionCellCount = count(html, 'class="g4b-u04-cell g4b-u04-cell--question');
  const answerCellCount = count(html, 'class="g4b-u04-cell g4b-u04-cell--answer');
  if (questionCellCount !== scenario.plan.questionCount || answerCellCount !== scenario.plan.questionCount) {
    throw new Error(`${scenario.id}: HTML card count mismatch ${questionCellCount}/${answerCellCount}`);
  }
  if (!html.includes(layout.appliedLayoutText)) throw new Error(`${scenario.id}: applied layout readback missing`);
  if (!html.includes(`data-g4b-u04-layout-mode="${layout.layoutMode}"`)) throw new Error(`${scenario.id}: layout mode data missing`);
  if (!html.includes(`data-g4b-u04-layout-capped="${layout.capped}"`)) throw new Error(`${scenario.id}: capped data missing`);
  if (scenario.expectedCapped && !html.includes(G4B_U04_LAYOUT_CAPPED_NOTICE)) throw new Error(`${scenario.id}: cap notice missing from HTML`);

  const htmlPath = resolve(OUT_DIR, `${scenario.id}.html`);
  const pdfPath = resolve(OUT_DIR, `${scenario.id}.pdf`);
  writeFileSync(htmlPath, html, "utf8");
  manifestScenarios.push({
    id: scenario.id,
    title: scenario.title,
    sourceId: "g4b_u04_4b04",
    questionMode: scenario.plan.questionMode,
    layoutMode: layout.layoutMode,
    rendererProfileId: layout.profileId,
    requestedQuestionLayout: layout.requestedQuestionLayout,
    resolvedQuestionLayout: layout.resolvedQuestionLayout,
    resolvedAnswerLayout: layout.resolvedAnswerLayout,
    capped: layout.capped,
    cappedFields: layout.cappedFields,
    noticeText: layout.noticeText,
    appliedLayoutText: layout.appliedLayoutText,
    questionCount: scenario.plan.questionCount,
    answerKeyItemCount: document.answerKeyItems.length,
    questionPageCount: document.questionPages.length,
    answerKeyPageCount: document.answerKeyPages.length,
    expectedPdfPageCount: document.questionPages.length + document.answerKeyPages.length,
    htmlQuestionCellCount: questionCellCount,
    htmlAnswerCellCount: answerCellCount,
    htmlPath: relative(REPO_ROOT, htmlPath).replaceAll("\\", "/"),
    pdfPath: relative(REPO_ROOT, pdfPath).replaceAll("\\", "/"),
    htmlSha256: sha256(html),
    htmlBytes: Buffer.byteLength(html),
    domOverflowCount: null,
    actualPdfPageCount: null,
    nonblankPdfPageCount: null,
    pdfBoundingBoxOverflowCount: null,
    pdfSha256: null,
    pdfBytes: null,
  });
}

const manifest = {
  schemaName: "G4BU04R2DLayoutSmokeManifest",
  schemaVersion: 1,
  task: "G4B_U04_R2D_WorksheetLayoutReadbackAndPrintDensityQA",
  status: "html_generated_pdf_pending",
  sourceId: "g4b_u04_4b04",
  scenarioCount: manifestScenarios.length,
  rendererProfileCount: new Set(manifestScenarios.map((row) => row.rendererProfileId)).size,
  layoutModeCount: new Set(manifestScenarios.map((row) => row.layoutMode)).size,
  cappedScenarioCount: manifestScenarios.filter((row) => row.capped).length,
  exactCappedNotice: G4B_U04_LAYOUT_CAPPED_NOTICE,
  answerKeyProfileControlled: true,
  profileCapBypassAllowed: false,
  scenarios: manifestScenarios,
};

writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ outputDirectory: OUT_DIR, manifestPath: MANIFEST_PATH, ...manifest }, null, 2));
