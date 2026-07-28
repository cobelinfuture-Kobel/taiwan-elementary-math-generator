import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "./p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeP03B1FractionNumberSystemConsumer } from "./p03b1-fraction-number-system-consumer.mjs";
import { materializeP03B3FractionDomainValidator } from "./p03b3-fraction-domain-validator.mjs";
import { materializeP03B5FractionArithmeticConsumer } from "./p03b5-fraction-arithmetic-consumer.mjs";
import { buildWorksheetDocumentFromPlan } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";
import {
  G5A_U04_SOURCE_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID,
  G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  auditG5AU04ExpandReduceSimplestSelectorProjection,
} from "../../../site/modules/curriculum/registry/g5a-u04-expand-reduce-simplest-selector-projection.js";
import {
  auditP03F13PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../../site/modules/curriculum/registry/batch-a-selector-p03f13-extension.js";
import { validateP03F13PatternDefinitions } from "../../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f13-extension.js";
import { buildBatchABrowserPlan } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f13.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f13.js";
import { listCurrentFullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";
import { auditFullProductPublicControlProfiles, getFullProductPublicControlProfile } from "../../../site/modules/curriculum/registry/full-product-public-control-profiles.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DATA_DIR = path.join(ROOT, "data/curriculum/full-product/p03f");
const PREDECESSOR_READBACK = "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE012_READBACK.md";
export const P03F_SLICE013_PRODUCT_ADMISSION_VERSION = "p03f-slice013-product-admission-v1";

const readJson = (name) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));
const readRepoJson = (repoPath) => JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
const sha256File = (repoPath) => crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, repoPath))).digest("hex");
const freezeArray = (values) => Object.freeze([...(values ?? [])]);

function requestedPlan() {
  return Object.freeze({
    sourceId: G5A_U04_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: Object.freeze([G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID]),
    selectedPatternGroupIds: Object.freeze([G5A_U04_EXPAND_REDUCE_SIMPLEST_GROUP_ID]),
    questionMode: "numeric",
    questionCount: 9,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p03f-slice013-simplest-fraction-d0",
    title: "五年級｜擴分、約分與最簡分數",
    printLayout: Object.freeze({
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 5,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    }),
  });
}

function renderProductionHtml(document) {
  if (!document) return "";
  const raw = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  const css = `<style>
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Arial, "Noto Sans TC", sans-serif; color: #111; background: #fff; }
.worksheet-section__header, .worksheet-page__meta { display: none; }
.worksheet-page { width: 210mm; height: 297mm; padding: 10mm; overflow: hidden; break-after: page; page-break-after: always; }
.worksheet-page:last-child { break-after: auto; page-break-after: auto; }
.worksheet-page__grid { display: grid; grid-template-columns: repeat(var(--worksheet-columns), minmax(0, 1fr)); gap: 4mm; align-content: start; }
.worksheet-cell { border: 1px solid #777; border-radius: 3mm; padding: 3mm; min-height: 48mm; break-inside: avoid; page-break-inside: avoid; }
.worksheet-cell__number { font-weight: 700; margin-bottom: 1.5mm; }
.worksheet-cell__prompt { font-size: 14pt; line-height: 1.45; overflow-wrap: anywhere; }
.worksheet-cell__answer { margin-top: 2mm; font-size: 13pt; line-height: 1.4; font-weight: 700; color: #7a0019; overflow-wrap: anywhere; }
</style>`;
  return raw.replace("</head>", `${css}</head>`);
}

function artifactIntegrity(manifest) {
  const paths = [manifest.acceptanceReportPath, manifest.htmlArtifactPath, manifest.pdfArtifactPath];
  if (!paths.every((repoPath) => fs.existsSync(path.join(ROOT, repoPath)))) {
    return Object.freeze({ ok: false, pathsExist: false, hashesMatch: false, reportAccepted: false, report: null });
  }
  const report = readRepoJson(manifest.acceptanceReportPath);
  const actual = {
    html: sha256File(manifest.htmlArtifactPath),
    pdf: sha256File(manifest.pdfArtifactPath),
  };
  const hashesMatch = actual.html === manifest.exactAcceptance.committedHtmlSha256
    && actual.pdf === manifest.exactAcceptance.committedPdfSha256
    && report.htmlSha256 === actual.html
    && report.pdfSha256 === actual.pdf;
  const reportAccepted = report.status === "PASS_VISUAL_AND_SEMANTIC_REVIEWED"
    && String(report.visualReview?.status ?? "").startsWith("PASS")
    && report.overflowFindingCount === 0
    && report.duplicatePromptFindingCount === 0
    && report.semanticScopeFindingCount === 0
    && report.physicalPdfPageCount === 2
    && report.questionCount === 9
    && report.answerKeyItemCount === 9
    && report.patternSpecIds?.length === 3;
  return Object.freeze({
    ok: hashesMatch && reportAccepted,
    pathsExist: true,
    hashesMatch,
    reportAccepted,
    report: Object.freeze(report),
    actual: Object.freeze(actual),
  });
}

function capabilityWitness(question, numberSystem, domainValidator, fractionArithmetic) {
  const originalValue = { numerator: question.numerator, denominator: question.denominator };
  const simplestValue = { numerator: question.simplestNumerator, denominator: question.simplestDenominator };
  const valuePolicy = {
    allowedMagnitudeClasses: ["PROPER_FRACTION", "IMPROPER_FRACTION", "WHOLE_NUMBER"],
    allowZero: false,
    maxCanonicalDenominator: 60,
  };
  const originalNumber = numberSystem.execute({
    action: "NORMALIZE",
    knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    sourceNodeId: G5A_U04_SOURCE_ID,
    value: originalValue,
    assertedCapabilityId: "cap_fraction_number_system",
  });
  const simplestNumber = numberSystem.execute({
    action: "NORMALIZE",
    knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    sourceNodeId: G5A_U04_SOURCE_ID,
    value: simplestValue,
    assertedCapabilityId: "cap_fraction_number_system",
  });
  const originalDomain = domainValidator.execute({
    action: "VALIDATE_VALUE",
    knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    sourceNodeId: G5A_U04_SOURCE_ID,
    value: originalValue,
    valuePolicy,
    assertedCapabilityId: "cap_fraction_domain_validator",
  });
  const simplestDomain = domainValidator.execute({
    action: "VALIDATE_VALUE",
    knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    sourceNodeId: G5A_U04_SOURCE_ID,
    value: simplestValue,
    valuePolicy,
    assertedCapabilityId: "cap_fraction_domain_validator",
  });
  const arithmetic = fractionArithmetic.execute({
    action: "MULTIPLY",
    knowledgePointId: G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID,
    sourceNodeId: G5A_U04_SOURCE_ID,
    leftValue: simplestValue,
    rightValue: { numerator: question.commonFactor, denominator: question.commonFactor },
    resultPolicy: valuePolicy,
    assertedCapabilityId: "cap_fraction_arithmetic",
  });
  return Object.freeze({
    questionId: question.id,
    originalNumberSystemOk: originalNumber.ok,
    simplestNumberSystemOk: simplestNumber.ok,
    originalCanonicalValue: originalNumber.result?.canonicalValue ?? null,
    simplestCanonicalValue: simplestNumber.result?.canonicalValue ?? null,
    originalDomainValidatorOk: originalDomain.ok,
    simplestDomainValidatorOk: simplestDomain.ok,
    originalCanonicalIdentity: originalDomain.result?.canonicalIdentity ?? null,
    simplestCanonicalIdentity: simplestDomain.result?.canonicalIdentity ?? null,
    fractionArithmeticOk: arithmetic.ok,
    arithmeticCanonicalValue: arithmetic.result?.canonicalValue ?? null,
  });
}

export function materializeP03FSlice013ProductAdmission() {
  const authority = readJson("slice013-simplest-fraction-authority.json");
  const manifest = readJson("slice013-product-admission.manifest.json");
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[12];
  const predecessorText = fs.readFileSync(path.join(ROOT, PREDECESSOR_READBACK), "utf8");
  const predecessorPassed = predecessorText.includes("STATUS     = PASS_CI_SYNCED_AND_MERGED")
    && predecessorText.includes("EVIDENCE   = E6_D0_COMPLETE");
  const numberSystem = materializeP03B1FractionNumberSystemConsumer();
  const domainValidator = materializeP03B3FractionDomainValidator();
  const fractionArithmetic = materializeP03B5FractionArithmeticConsumer();
  const selectorProjectionAudit = auditG5AU04ExpandReduceSimplestSelectorProjection();
  const selectorCompositionAudit = auditP03F13PublicSelectorComposition();
  const patternAudit = validateP03F13PatternDefinitions();
  const controlAudit = auditFullProductPublicControlProfiles({ includeW3Slice013: true });
  const plan = requestedPlan();
  const browserPlan = buildBatchABrowserPlan(plan);
  const planValidation = validateBatchABrowserPlan(browserPlan);
  const generation = generateBatchABrowserQuestions(plan);
  const questionValidation = validateBatchABrowserQuestions(generation.questions ?? []);
  const capabilityWitnesses = (generation.questions ?? []).map((question) => (
    capabilityWitness(question, numberSystem, domainValidator, fractionArithmetic)
  ));
  const worksheet = buildWorksheetDocumentFromPlan(plan);
  const document = worksheet.worksheetDocument ?? null;
  const html = renderProductionHtml(document);
  const currentSources = listCurrentFullProductPublicSourceUnits();
  const publicSource = currentSources.find((row) => row.sourceId === G5A_U04_SOURCE_ID) ?? null;
  const selectorRow = getVisibleBatchAKnowledgePoint(G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID);
  const visibleGroups = getVisiblePatternGroupsForKnowledgePoint(G5A_U04_EXPAND_REDUCE_SIMPLEST_KP_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G5A_U04_SOURCE_ID);
  const controlProfile = getFullProductPublicControlProfile(G5A_U04_SOURCE_ID);
  const artifacts = artifactIntegrity(manifest);
  const d0Complete = artifacts.ok;
  const metrics = Object.freeze({
    queuePosition: slice?.queuePosition ?? null,
    sourceNodeCount: 1,
    knowledgePointCount: selectorRow ? 1 : 0,
    tagBindingCount: authority.knowledgePoint.tagIds.length,
    formalMappingCount: authority.formalMapping ? 1 : 0,
    patternGroupCount: visibleGroups.length,
    patternSpecCount: new Set(visibleGroups.flatMap((row) => row.patternSpecIds ?? [])).size,
    numericPatternSpecCount: generation.allocation?.length ?? 0,
    applicationPatternSpecCount: 0,
    globalContextBindingCount: 0,
    requiredCapabilityCount: slice?.requiredW3CapabilityIds?.length ?? 0,
    publicSourceCountAfterAdmission: currentSources.length,
    publicVisibleKnowledgePointCountForSource: availability?.visibleCount ?? 0,
    questionWitnessCount: generation.questions?.length ?? 0,
    answerKeyWitnessCount: document?.answerKeyItems?.length ?? 0,
    htmlWitnessCount: Number(Boolean(html)),
    chromiumPdfWitnessCount: d0Complete ? 1 : 0,
    overflowFindingCount: artifacts.report?.overflowFindingCount ?? 0,
    duplicatePromptFindingCount: artifacts.report?.duplicatePromptFindingCount ?? 0,
    newProductAdmissionCount: d0Complete ? 1 : 0,
    cumulativeW3ProductAdmissionCount: 14 + (d0Complete ? 1 : 0),
    remainingDirectSliceCount: 41 - (d0Complete ? 1 : 0),
    remainingDirectKnowledgePointCount: 68 - (d0Complete ? 1 : 0),
    laterWaveDependentCount: queue.metrics.laterWaveDependentExcludedCount,
  });
  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03F_SLICE013_PRODUCT_ADMISSION_VERSION,
    authority: Object.freeze(authority),
    manifest: Object.freeze(manifest),
    queueAuthority: queue,
    slice,
    predecessorPassed,
    numberSystem,
    domainValidator,
    fractionArithmetic,
    selectorProjectionAudit,
    selectorCompositionAudit,
    patternAudit,
    controlAudit,
    requestedPlan: plan,
    browserPlan,
    planValidation,
    generation,
    questionValidation,
    capabilityWitnesses: freezeArray(capabilityWitnesses),
    worksheet,
    document,
    html,
    publicSource,
    selectorRow: selectorRow ? Object.freeze(selectorRow) : null,
    visibleGroups: freezeArray(visibleGroups),
    availability: availability ? Object.freeze(availability) : null,
    controlProfile: controlProfile ? Object.freeze(controlProfile) : null,
    artifactIntegrity: artifacts,
    metrics,
    productAdmissionState: d0Complete ? "PRODUCTION_ADMITTED_D0" : "RUNTIME_CONNECTED_PENDING_CHROMIUM_ACCEPTANCE",
    d0Complete,
    patternSpecIds: G5A_U04_EXPAND_REDUCE_SIMPLEST_PATTERN_SPEC_IDS,
  });
}
