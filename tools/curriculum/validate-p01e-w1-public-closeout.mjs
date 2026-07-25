import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { listBatchASourceUnits } from "../../site/modules/curriculum/batch-a/source-units.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-r2e-entry.js";
import { buildWorksheetDocumentFromPlan } from "../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer.js";
import {
  auditP01EPublicSelectorComposition,
  getVisiblePatternGroupsForKnowledgePoint,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import {
  auditW1FullProductPublicApplicationGroups,
  listW1FullProductPublicApplicationGroupsForSource,
} from "../../site/modules/curriculum/registry/w1-full-product-public-application-groups.js";
import {
  W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS,
  auditFullProductPublicControlProfiles,
  getFullProductPublicControlProfile,
} from "../../site/modules/curriculum/registry/full-product-public-control-profiles.js";
import { getPixelRegistrySnapshot } from "../../site/pixel/pixel-registry-bridge.js";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const CONTRACT_PATH = path.join(
  ROOT,
  "data/curriculum/full-product/p01e/w1-public-ui-html-pdf-print-closeout.json",
);

const issue = (code, details = {}) => Object.freeze({ code, ...details });

function applicationPlan(sourceId) {
  const groups = listW1FullProductPublicApplicationGroupsForSource(sourceId);
  const selectedKnowledgePointIds = groups.map((row) => row.primaryKnowledgePointId);
  return {
    sourceId,
    selectionMode: selectedKnowledgePointIds.length > 1
      ? "mixedKnowledgePointsSameUnit"
      : "singleKnowledgePoint",
    selectedKnowledgePointIds,
    selectedPatternGroupIds: groups.map((row) => row.basePatternGroupId),
    questionMode: "application",
    questionCount: groups.length * 2,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p01e-validator-${sourceId}`,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
  };
}

function numericPlan(sourceId) {
  return {
    sourceId,
    selectionMode: "sourceUnit",
    selectedKnowledgePointIds: [],
    selectedPatternGroupIds: [],
    questionMode: "numeric",
    questionCount: 12,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p01e-validator-numeric-${sourceId}`,
    printLayout: {
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    },
  };
}

function documentCounts(document) {
  return {
    questions: document?.generatedQuestions?.length ?? document?.questions?.length ?? 0,
    answers: document?.answerKeyItems?.length ?? 0,
    questionPages: document?.questionPages?.length ?? 0,
    answerPages: document?.answerKeyPages?.length ?? 0,
  };
}

export function validateP01EW1PublicCloseout() {
  const errors = [];
  const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, "utf8"));
  const baseline = listBatchASourceUnits({ includePublicCandidates: false });
  const publicFleet = listBatchASourceUnits({ includePublicCandidates: true });
  const selector = auditP01EPublicSelectorComposition();
  const applications = auditW1FullProductPublicApplicationGroups();
  const controls = auditFullProductPublicControlProfiles();
  const pixel = getPixelRegistrySnapshot();

  errors.push(...selector.errors.map((code) => issue(code)));
  errors.push(...applications.errors.map((code) => issue(code)));
  errors.push(...controls.errors.map((code) => issue(code)));

  if (baseline.length !== 13) {
    errors.push(issue("P01E_PROTECTED_BASELINE_COUNT_INVALID", { actual: baseline.length }));
  }
  if (publicFleet.length !== 19) {
    errors.push(issue("P01E_PUBLIC_FLEET_COUNT_INVALID", { actual: publicFleet.length }));
  }
  if (pixel.sourceCount !== 19) {
    errors.push(issue("P01E_PIXEL_SOURCE_COUNT_INVALID", { actual: pixel.sourceCount }));
  }
  if (contract.w1KnowledgePointAdmission?.knowledgePointCount !== 21
    || contract.w1KnowledgePointAdmission?.numericPublicCount !== 21
    || contract.w1KnowledgePointAdmission?.applicationEligibleCount !== 13
    || contract.w1KnowledgePointAdmission?.applicationIneligibleCount !== 8
    || contract.w1KnowledgePointAdmission?.pblEligibleCount !== 0) {
    errors.push(issue("P01E_CONTRACT_KP_COUNTS_INVALID"));
  }

  const w1Rows = listVisibleBatchAKnowledgePoints()
    .filter((row) => W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS.includes(row.sourceId));
  if (w1Rows.length !== 21) {
    errors.push(issue("P01E_RUNTIME_W1_KP_COUNT_INVALID", { actual: w1Rows.length }));
  }
  const applicationRows = w1Rows.filter((row) => (
    getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId)
      .some((group) => group.mode === "application")
  ));
  if (applicationRows.length !== 13) {
    errors.push(issue("P01E_RUNTIME_APPLICATION_KP_COUNT_INVALID", {
      actual: applicationRows.length,
    }));
  }

  let numericQuestionCount = 0;
  let applicationQuestionCount = 0;
  let htmlCaseCount = 0;
  for (const sourceId of W1_FULL_PRODUCT_PUBLIC_SOURCE_IDS) {
    const publicSource = publicFleet.find((row) => row.sourceId === sourceId);
    if (!publicSource || publicSource.lifecycle !== "public_full_product_w1_release") {
      errors.push(issue("P01E_PUBLIC_SOURCE_MISSING", { sourceId }));
    }
    const profile = getFullProductPublicControlProfile(sourceId);
    const modes = profile?.questionTypeControl?.options?.map((row) => row.value) ?? [];
    if (JSON.stringify(modes) !== JSON.stringify(["numeric", "application"])) {
      errors.push(issue("P01E_PUBLIC_CONTROL_PROFILE_INVALID", { sourceId, modes }));
    }

    const numeric = buildWorksheetDocumentFromPlan(numericPlan(sourceId));
    if (!numeric?.ok || !numeric.worksheetDocument) {
      errors.push(issue("P01E_NUMERIC_WORKSHEET_INVALID", {
        sourceId,
        generationErrors: numeric?.errors ?? [],
      }));
    } else {
      const counts = documentCounts(numeric.worksheetDocument);
      numericQuestionCount += counts.questions;
      if (counts.questions !== 12 || counts.answers !== 12
        || counts.questionPages < 1 || counts.answerPages < 1) {
        errors.push(issue("P01E_NUMERIC_DOCUMENT_COUNTS_INVALID", { sourceId, counts }));
      }
      const html = renderWorksheetDocumentToHtml(numeric.worksheetDocument, {
        stylesheetHref: "",
      });
      if (!html.includes("worksheet-page--questions")
        || !html.includes("worksheet-page--answer-key")) {
        errors.push(issue("P01E_NUMERIC_HTML_INVALID", { sourceId }));
      } else {
        htmlCaseCount += 1;
      }
    }

    const plan = applicationPlan(sourceId);
    const base = buildBatchABrowserWorksheetDocument({
      ...plan,
      questionMode: "numeric",
    });
    const application = buildWorksheetDocumentFromPlan(plan);
    if (!base?.ok || !application?.ok || !application.worksheetDocument) {
      errors.push(issue("P01E_APPLICATION_WORKSHEET_INVALID", {
        sourceId,
        baseErrors: base?.errors ?? [],
        applicationErrors: application?.errors ?? [],
      }));
      continue;
    }
    const baseQuestions = base.worksheetDocument.generatedQuestions;
    const applicationQuestions = application.worksheetDocument.generatedQuestions;
    const counts = documentCounts(application.worksheetDocument);
    applicationQuestionCount += counts.questions;
    if (counts.questions !== plan.questionCount || counts.answers !== plan.questionCount
      || counts.questionPages < 1 || counts.answerPages < 1) {
      errors.push(issue("P01E_APPLICATION_DOCUMENT_COUNTS_INVALID", { sourceId, counts }));
    }
    for (let index = 0; index < applicationQuestions.length; index += 1) {
      const original = baseQuestions[index];
      const projected = applicationQuestions[index];
      if (!original || !projected
        || projected.patternSpecId !== original.patternSpecId
        || String(projected.answerText) !== String(original.answerText)
        || JSON.stringify(projected.finalAnswer ?? null) !== JSON.stringify(original.finalAnswer ?? null)
        || projected.applicationText !== true
        || projected.globalContextProduction?.runtimeResolvable !== true) {
        errors.push(issue("P01E_APPLICATION_PROJECTION_INVARIANT_FAILED", {
          sourceId,
          index,
        }));
      }
    }
    const html = renderWorksheetDocumentToHtml(application.worksheetDocument, {
      stylesheetHref: "",
    });
    if (!html.includes("worksheet-page--questions")
      || !html.includes("worksheet-page--answer-key")) {
      errors.push(issue("P01E_APPLICATION_HTML_INVALID", { sourceId }));
    } else {
      htmlCaseCount += 1;
    }
  }

  return Object.freeze({
    ok: errors.length === 0,
    errors: Object.freeze(errors),
    summary: Object.freeze({
      protectedBaselineSourceCount: baseline.length,
      publicSourceCount: publicFleet.length,
      pixelSourceCount: pixel.sourceCount,
      w1KnowledgePointCount: w1Rows.length,
      applicationEligibleKnowledgePointCount: applicationRows.length,
      applicationIneligibleKnowledgePointCount: w1Rows.length - applicationRows.length,
      numericQuestionCount,
      applicationQuestionCount,
      htmlCaseCount,
      pblAdmissionCount: 0,
    }),
  });
}

export function runP01EW1PublicCloseoutCli() {
  const report = validateP01EW1PublicCloseout();
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.ok) process.exitCode = 1;
  return report;
}

const isCli = process.argv[1]
  && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isCli) runP01EW1PublicCloseoutCli();
