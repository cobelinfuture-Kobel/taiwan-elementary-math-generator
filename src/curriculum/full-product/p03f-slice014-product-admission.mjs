import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "./p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeP03CW3CapabilityCloseoutProductUnblockReconciliation } from "./p03c-w3-capability-closeout-product-unblock.mjs";
import { validateP03FSlice013ProductAdmission } from "../../../tools/curriculum/validate-p03f-slice013-product-admission.mjs";
import { buildWorksheetDocumentFromPlan } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";
import {
  G5B_U05_DECIMAL_BASE10_SOURCE_ID,
  G5B_U05_DECIMAL_BASE10_KP_ID,
  G5B_U05_DECIMAL_BASE10_GROUP_ID,
  G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS,
  auditG5BU05DecimalBase10SelectorProjection,
} from "../../../site/modules/curriculum/registry/g5b-u05-decimal-base10-selector-projection.js";
import {
  auditP03F14PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../../site/modules/curriculum/registry/batch-a-selector-p03f14-extension.js";
import { validateP03F14PatternDefinitions } from "../../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f14-extension.js";
import { buildBatchABrowserPlan } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f14.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f14.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f14.js";
import { listCurrentFullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DATA_DIR = path.join(ROOT, "data/curriculum/full-product/p03f");
export const P03F_SLICE014_PRODUCT_ADMISSION_VERSION = "p03f-slice014-product-admission-v2";
const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8"));

function requestedPlan() {
  return Object.freeze({
    sourceId: G5B_U05_DECIMAL_BASE10_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: Object.freeze([G5B_U05_DECIMAL_BASE10_KP_ID]),
    selectedPatternGroupIds: Object.freeze([G5B_U05_DECIMAL_BASE10_GROUP_ID]),
    questionMode: "numeric",
    questionCount: 16,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p03f-slice014-decimal-base10-d0",
    title: "五年級｜整數與小數的十進位結構",
    printLayout: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true }),
  });
}

function hasAcceptedD0Evidence(manifest) {
  const exact = manifest.exactAcceptance ?? {};
  const decision = manifest.admissionDecision ?? {};
  return manifest.status === "PASS_CI_SYNCED_AND_MERGED"
    && manifest.admissionState === "E6_ARTIFACT_ACCEPTED_D0"
    && decision.status === "ADMITTED_D0"
    && decision.runtimeContractStatus === "PASS"
    && decision.chromiumProductArtifactStatus === "PASS"
    && decision.classicSelectorPublicStatus === "PASS"
    && decision.pixelSelectorPublicStatus === "PASS"
    && decision.worksheetPrintableStatus === "PASS"
    && decision.answerKeyStatus === "PASS"
    && decision.finalLiveCohortStatus === "PASS"
    && decision.validatorStatus === "PASS"
    && exact.finalExactHeadAccepted === true
    && exact.implementationNodeConclusion === "success"
    && exact.finalNodeWorkflowConclusion === "success"
    && exact.acceptanceVisualReview === "PASS"
    && exact.acceptanceSemanticReview === "PASS"
    && exact.acceptanceAnswerKeyReview === "PASS"
    && Number(exact.acceptancePdfPageCount) === 4
    && Number(exact.acceptanceScreenshotCount) === 4
    && Number(exact.acceptancePdfByteLength) >= 10000;
}

export function materializeP03FSlice014ProductAdmission() {
  const authority = readJson("slice014-decimal-base10-authority.json");
  const manifest = readJson("slice014-product-admission.manifest.json");
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[13];
  const predecessor = validateP03FSlice013ProductAdmission();
  const p03c = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
  const unblockRow = p03c.getRow(G5B_U05_DECIMAL_BASE10_KP_ID);
  const selectorProjectionAudit = auditG5BU05DecimalBase10SelectorProjection();
  const selectorCompositionAudit = auditP03F14PublicSelectorComposition();
  const patternAudit = validateP03F14PatternDefinitions();
  const requested = requestedPlan();
  const browserPlan = buildBatchABrowserPlan(requested);
  const planValidation = validateBatchABrowserPlan(browserPlan);
  const generation = generateBatchABrowserQuestions(requested);
  const questionValidation = validateBatchABrowserQuestions(generation.questions ?? []);
  const worksheet = buildWorksheetDocumentFromPlan(requested);
  const document = worksheet.worksheetDocument ?? null;
  const html = document ? renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }) : "";
  const sourceRows = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID);
  const selectorRow = getVisibleBatchAKnowledgePoint(G5B_U05_DECIMAL_BASE10_KP_ID);
  const visibleGroups = getVisiblePatternGroupsForKnowledgePoint(G5B_U05_DECIMAL_BASE10_KP_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5B_U05_DECIMAL_BASE10_SOURCE_ID);
  const currentSources = listCurrentFullProductPublicSourceUnits();
  const publicSource = currentSources.find((row) => row.sourceId === G5B_U05_DECIMAL_BASE10_SOURCE_ID) ?? null;
  const d0Complete = hasAcceptedD0Evidence(manifest);
  const metrics = Object.freeze({
    queuePosition: slice?.queuePosition ?? null,
    sourceNodeCount: 1,
    newPublicSourceCount: 0,
    knowledgePointCount: selectorRow ? 1 : 0,
    patternGroupCount: visibleGroups.length,
    patternSpecCount: new Set(visibleGroups.flatMap((row) => row.patternSpecIds ?? [])).size,
    numericPatternSpecCount: G5B_U05_DECIMAL_BASE10_PATTERN_SPEC_IDS.length,
    applicationPatternSpecCount: 0,
    globalContextBindingCount: 0,
    requiredCapabilityCount: slice?.requiredW3CapabilityIds?.length ?? 0,
    publicVisibleKnowledgePointCountForSource: availability?.visibleCount ?? 0,
    questionWitnessCount: generation.questions?.length ?? 0,
    answerKeyWitnessCount: document?.answerKeyItems?.length ?? 0,
    newProductAdmissionCount: d0Complete ? 1 : 0,
  });
  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03F_SLICE014_PRODUCT_ADMISSION_VERSION,
    authority: Object.freeze(authority),
    manifest: Object.freeze(manifest),
    queueAuthority: queue,
    slice,
    predecessorPassed: predecessor.ok && predecessor.d0Complete,
    predecessor,
    p03c,
    unblockRow,
    selectorProjectionAudit,
    selectorCompositionAudit,
    patternAudit,
    requestedPlan: requested,
    browserPlan,
    planValidation,
    generation,
    questionValidation,
    worksheet,
    document,
    html,
    sourceRows: Object.freeze(sourceRows),
    selectorRow: selectorRow ? Object.freeze(selectorRow) : null,
    visibleGroups: Object.freeze(visibleGroups),
    availability: availability ? Object.freeze(availability) : null,
    currentSources: Object.freeze(currentSources),
    publicSource: publicSource ? Object.freeze(publicSource) : null,
    metrics,
    productAdmissionState: d0Complete ? "PRODUCTION_ADMITTED_D0" : "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE",
    d0Complete,
  });
}
