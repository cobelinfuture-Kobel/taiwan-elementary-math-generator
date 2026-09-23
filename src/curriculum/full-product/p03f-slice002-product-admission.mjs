import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "./p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeP03B1FractionNumberSystemConsumer } from "./p03b1-fraction-number-system-consumer.mjs";
import { materializeP03B3FractionDomainValidator } from "./p03b3-fraction-domain-validator.mjs";
import { buildWorksheetDocumentFromPlan } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";
import { materializeSharedW02WorksheetProjection } from "../application/shared/worksheet-projection-runtime.mjs";
import { G3A_U08_SOURCE_ID } from "../../../site/modules/curriculum/registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_UNIT_FRACTION_KP_ID,
  G3A_U08_DISCRETE_FRACTION_KP_ID,
  G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID,
  G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID,
  G3A_U08_DISCRETE_NUMERIC_GROUP_ID,
  G3A_U08_DISCRETE_APPLICATION_GROUP_ID,
  auditG3AU08Slice002SelectorProjection,
} from "../../../site/modules/curriculum/registry/g3a-u08-slice002-selector-projection.js";
import {
  auditP03F2PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../../site/modules/curriculum/registry/batch-a-selector-p03f2-extension.js";
import { validateP03F2PatternDefinitions } from "../../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f2-extension.js";
import { buildBatchABrowserPlan } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f2.js";
import { listP03F2FullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";
import { auditFullProductPublicControlProfiles, getFullProductPublicControlProfile } from "../../../site/modules/curriculum/registry/full-product-public-control-profiles.js";
import { P03F2_APPLICATION_AUTHORITIES } from "../../../site/modules/curriculum/batch-a/slice002-fraction-runtime.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const DATA_DIR = path.join(ROOT, "data/curriculum/full-product/p03f");
const PREDECESSOR_READBACK = "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE001_READBACK.md";
export const P03F_SLICE002_PRODUCT_ADMISSION_VERSION = "p03f-slice002-product-admission-v1";

const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8"));
const readRepoJson = (repoPath) => JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
const sha256File = (repoPath) => crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, repoPath))).digest("hex");
const freezeArray = (values) => Object.freeze([...(values ?? [])]);

function plan(mode) {
  const application = mode === "application";
  return Object.freeze({
    sourceId: G3A_U08_SOURCE_ID,
    selectionMode: "mixedKnowledgePointsSameUnit",
    selectedKnowledgePointIds: Object.freeze([G3A_U08_DISCRETE_FRACTION_KP_ID, G3A_U08_UNIT_FRACTION_KP_ID]),
    selectedPatternGroupIds: Object.freeze(application
      ? [G3A_U08_UNIT_FRACTION_APPLICATION_GROUP_ID, G3A_U08_DISCRETE_APPLICATION_GROUP_ID]
      : [G3A_U08_UNIT_FRACTION_NUMERIC_GROUP_ID, G3A_U08_DISCRETE_NUMERIC_GROUP_ID]),
    questionMode: mode,
    questionCount: 6,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p03f-slice002-${mode}-d0`,
    title: application ? "三年級｜分數數量應用題" : "三年級｜分數數量數字題",
    printLayout: Object.freeze({ paperSize: "A4", columns: application ? 1 : 2, rowsPerPage: 3, showQuestionNumbers: true, showAnswerKeyPage: true }),
  });
}
function renderProductionHtml(document, mode) {
  if (!document) return "";
  const cellMinHeight = mode === "application" ? "68mm" : "70mm";
  const raw = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  const css = `<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Arial, "Noto Sans TC", sans-serif; color: #111; background: #fff; }
.worksheet-section__header, .worksheet-page__meta { display: none; }
.worksheet-page { width: 210mm; height: 297mm; padding: 12mm; overflow: hidden; break-after: page; page-break-after: always; }
.worksheet-page:last-child { break-after: auto; page-break-after: auto; }
.worksheet-page__grid { display: grid; grid-template-columns: repeat(var(--worksheet-columns), minmax(0, 1fr)); gap: 6mm; align-content: start; }
.worksheet-cell { border: 1px solid #777; border-radius: 3mm; padding: 4mm; min-height: ${cellMinHeight}; break-inside: avoid; page-break-inside: avoid; }
.worksheet-cell__number { font-weight: 700; margin-bottom: 2mm; }
.worksheet-cell__prompt { font-size: 14.5pt; line-height: 1.55; letter-spacing: .01em; overflow-wrap: anywhere; }
.worksheet-cell__answer { margin-top: 3mm; font-size: 13.5pt; line-height: 1.45; font-weight: 700; color: #7a0019; overflow-wrap: anywhere; }
</style>`;
  return raw.replace("</head>", `${css}</head>`);
}
function artifactIntegrity(manifest) {
  const paths = [manifest.acceptanceReportPath, manifest.numericHtmlArtifactPath, manifest.applicationHtmlArtifactPath, manifest.numericPdfArtifactPath, manifest.applicationPdfArtifactPath];
  const pathsExist = paths.every((repoPath) => fs.existsSync(path.join(ROOT, repoPath)));
  if (!pathsExist) return Object.freeze({ ok: false, pathsExist: false, hashesMatch: false, reportAccepted: false, report: null });
  const report = readRepoJson(manifest.acceptanceReportPath);
  const actual = {
    numericHtml: sha256File(manifest.numericHtmlArtifactPath), applicationHtml: sha256File(manifest.applicationHtmlArtifactPath),
    numericPdf: sha256File(manifest.numericPdfArtifactPath), applicationPdf: sha256File(manifest.applicationPdfArtifactPath),
  };
  const expected = manifest.exactAcceptance;
  const hashesMatch = actual.numericHtml === expected.committedNumericHtmlSha256
    && actual.applicationHtml === expected.committedApplicationHtmlSha256
    && actual.numericPdf === expected.committedNumericPdfSha256
    && actual.applicationPdf === expected.committedApplicationPdfSha256
    && report.numericHtmlSha256 === actual.numericHtml && report.applicationHtmlSha256 === actual.applicationHtml
    && report.numericPdfSha256 === actual.numericPdf && report.applicationPdfSha256 === actual.applicationPdf;
  const reportAccepted = report.status === "PASS_VISUAL_AND_SEMANTIC_REVIEWED"
    && String(report.visualReview?.status ?? "").startsWith("PASS")
    && report.overflowFindingCount === 0 && report.semanticScopeFindingCount === 0
    && report.duplicatePromptFindingCount === 0
    && report.numericPhysicalPdfPageCount === 2 && report.applicationPhysicalPdfPageCount === 4
    && report.numericQuestionCount === 6 && report.applicationQuestionCount === 6 && report.answerKeyItemCount === 12;
  return Object.freeze({ ok: pathsExist && hashesMatch && reportAccepted, pathsExist, hashesMatch, reportAccepted, report: Object.freeze(report), actual: Object.freeze(actual) });
}
function capabilityWitness(question, numberSystem, domainValidator) {
  const value = question.operationFamilyId === "fraction_accumulation"
    ? { numerator: question.unitFractionCount, denominator: question.denominator }
    : { numerator: question.itemCount, denominator: question.itemsPerWhole };
  const numberResult = numberSystem.execute({ action: "NORMALIZE", knowledgePointId: question.metadata.knowledgePointId, sourceNodeId: G3A_U08_SOURCE_ID, value, assertedCapabilityId: "cap_fraction_number_system" });
  const domainResult = domainValidator.execute({ action: "VALIDATE_VALUE", knowledgePointId: question.metadata.knowledgePointId, sourceNodeId: G3A_U08_SOURCE_ID, value, valuePolicy: { allowedMagnitudeClasses: ["PROPER_FRACTION", "IMPROPER_FRACTION", "WHOLE_NUMBER"], allowZero: false, maxCanonicalDenominator: 12 }, assertedCapabilityId: "cap_fraction_domain_validator" });
  return Object.freeze({ questionId: question.id, patternSpecId: question.patternSpecId, value: Object.freeze(value), numberSystemOk: numberResult.ok, canonicalValue: numberResult.result?.canonicalValue ?? null, domainValidatorOk: domainResult.ok, domainCanonicalIdentity: domainResult.result?.canonicalIdentity ?? null });
}

export function materializeP03FSlice002ProductAdmission() {
  const authority = readJson("slice002-fraction-quantity-authority.json");
  const manifest = readJson("slice002-product-admission.manifest.json");
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[1];
  const predecessorText = fs.readFileSync(path.join(ROOT, PREDECESSOR_READBACK), "utf8");
  const predecessorPassed = predecessorText.includes("STATUS     = PASS_CI_SYNCED_AND_MERGED") && predecessorText.includes("EVIDENCE   = E6_D0_COMPLETE");
  const numberSystem = materializeP03B1FractionNumberSystemConsumer();
  const domainValidator = materializeP03B3FractionDomainValidator();
  const selectorProjectionAudit = auditG3AU08Slice002SelectorProjection();
  const selectorCompositionAudit = auditP03F2PublicSelectorComposition();
  const patternAudit = validateP03F2PatternDefinitions();
  const controlAudit = auditFullProductPublicControlProfiles({ includeW3Slice002: true });
  const sharedProjection = materializeSharedW02WorksheetProjection();
  const targetApplicationIds = new Set(Object.keys(P03F2_APPLICATION_AUTHORITIES));
  const applicationRecords = sharedProjection.applicationQuestionRecords.filter((row) => targetApplicationIds.has(row.patternSpecId));
  const requestedPlans = Object.freeze({ numeric: plan("numeric"), application: plan("application") });
  const browserPlans = Object.freeze({ numeric: buildBatchABrowserPlan(requestedPlans.numeric), application: buildBatchABrowserPlan(requestedPlans.application) });
  const planValidations = Object.freeze({ numeric: validateBatchABrowserPlan(browserPlans.numeric), application: validateBatchABrowserPlan(browserPlans.application) });
  const generations = Object.freeze({ numeric: generateBatchABrowserQuestions(requestedPlans.numeric), application: generateBatchABrowserQuestions(requestedPlans.application) });
  const questionValidations = Object.freeze({ numeric: validateBatchABrowserQuestions(generations.numeric.questions ?? []), application: validateBatchABrowserQuestions(generations.application.questions ?? []) });
  const questions = [...(generations.numeric.questions ?? []), ...(generations.application.questions ?? [])];
  const capabilityWitnesses = questions.map((question) => capabilityWitness(question, numberSystem, domainValidator));
  const worksheets = Object.freeze({ numeric: buildWorksheetDocumentFromPlan(requestedPlans.numeric), application: buildWorksheetDocumentFromPlan(requestedPlans.application) });
  const documents = Object.freeze({ numeric: worksheets.numeric.worksheetDocument ?? null, application: worksheets.application.worksheetDocument ?? null });
  const html = Object.freeze({ numeric: renderProductionHtml(documents.numeric, "numeric"), application: renderProductionHtml(documents.application, "application") });
  const currentSources = listP03F2FullProductPublicSourceUnits();
  const publicSource = currentSources.find((row) => row.sourceId === G3A_U08_SOURCE_ID) ?? null;
  const selectorRows = [G3A_U08_DISCRETE_FRACTION_KP_ID, G3A_U08_UNIT_FRACTION_KP_ID].map((id) => getVisibleBatchAKnowledgePoint(id));
  const visibleGroups = selectorRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row?.knowledgePointId));
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3A_U08_SOURCE_ID);
  const controlProfile = getFullProductPublicControlProfile(G3A_U08_SOURCE_ID);
  const artifacts = artifactIntegrity(manifest);
  const d0Complete = artifacts.ok;
  const metrics = Object.freeze({
    queuePosition: slice?.queuePosition ?? null, sourceNodeCount: 1, knowledgePointCount: selectorRows.filter(Boolean).length,
    tagBindingCount: authority.knowledgePoints.reduce((sum, row) => sum + row.tagIds.length, 0), formalMappingCount: authority.formalMappings.length,
    patternGroupCount: visibleGroups.length, patternSpecCount: new Set(visibleGroups.flatMap((row) => row.patternSpecIds ?? [])).size,
    numericPatternSpecCount: generations.numeric.allocation?.length ?? 0, applicationPatternSpecCount: generations.application.allocation?.length ?? 0,
    globalContextBindingCount: applicationRecords.length, requiredCapabilityCount: slice?.requiredW3CapabilityIds?.length ?? 0,
    publicSourceCountAfterAdmission: currentSources.length, publicVisibleKnowledgePointCountForSource: availability?.visibleCount ?? 0,
    numericQuestionWitnessCount: generations.numeric.questions?.length ?? 0, applicationQuestionWitnessCount: generations.application.questions?.length ?? 0,
    questionWitnessCount: questions.length, answerKeyWitnessCount: (documents.numeric?.answerKeyItems?.length ?? 0) + (documents.application?.answerKeyItems?.length ?? 0),
    htmlWitnessCount: Number(Boolean(html.numeric)) + Number(Boolean(html.application)), chromiumPdfWitnessCount: d0Complete ? 2 : 0,
    overflowFindingCount: artifacts.report?.overflowFindingCount ?? 0, newProductAdmissionCount: d0Complete ? 2 : 0,
    cumulativeW3ProductAdmissionCount: 1 + (d0Complete ? 2 : 0), remainingDirectSliceCount: 52 - (d0Complete ? 1 : 0),
    remainingDirectKnowledgePointCount: 81 - (d0Complete ? 2 : 0), laterWaveDependentCount: queue.metrics.laterWaveDependentExcludedCount,
  });
  return Object.freeze({
    schemaName: manifest.schemaName, schemaVersion: manifest.schemaVersion, programId: manifest.programId, taskId: manifest.taskId, status: manifest.status,
    version: P03F_SLICE002_PRODUCT_ADMISSION_VERSION, authority: Object.freeze(authority), manifest: Object.freeze(manifest), queueAuthority: queue, slice,
    predecessorPassed, numberSystem, domainValidator, selectorProjectionAudit, selectorCompositionAudit, patternAudit, controlAudit,
    sharedProjection, applicationRecords: freezeArray(applicationRecords), requestedPlans, browserPlans, planValidations, generations, questionValidations,
    questions: freezeArray(questions), capabilityWitnesses: freezeArray(capabilityWitnesses), worksheets, documents, html,
    publicSource, selectorRows: freezeArray(selectorRows), visibleGroups: freezeArray(visibleGroups), availability: availability ? Object.freeze(availability) : null,
    controlProfile: controlProfile ? Object.freeze(controlProfile) : null, artifactIntegrity: artifacts, metrics,
    productAdmissionState: d0Complete ? "PRODUCTION_ADMITTED_D0" : "PRODUCT_ACCEPTANCE_PENDING", d0Complete,
  });
}
