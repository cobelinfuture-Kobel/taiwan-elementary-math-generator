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
  G4B_U08_SOURCE_ID,
  G4B_U08_EQUIVALENT_FRACTION_KP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID,
  G4B_U08_EQUIVALENT_FRACTION_PATTERN_SPEC_IDS,
  auditG4BU08EquivalentFractionSelectorProjection,
} from "../../../site/modules/curriculum/registry/g4b-u08-equivalent-fraction-selector-projection.js";
import {
  auditP03F5PublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../../site/modules/curriculum/registry/batch-a-selector-p03f5-extension.js";
import { validateP03F5PatternDefinitions } from "../../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f5-extension.js";
import { buildBatchABrowserPlan } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f5.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f5.js";
import { listCurrentFullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";
import { auditFullProductPublicControlProfiles, getFullProductPublicControlProfile } from "../../../site/modules/curriculum/registry/full-product-public-control-profiles.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DATA_DIR = path.join(ROOT, "data/curriculum/full-product/p03f");
const PREDECESSOR_READBACK = "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE004_READBACK.md";
export const P03F_SLICE005_PRODUCT_ADMISSION_VERSION = "p03f-slice005-product-admission-v1";

const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8"));
const readRepoJson = (repoPath) => JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
const sha256File = (repoPath) => crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, repoPath))).digest("hex");
const freezeArray = (values) => Object.freeze([...(values ?? [])]);

function plan() {
  return Object.freeze({
    sourceId: G4B_U08_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: Object.freeze([G4B_U08_EQUIVALENT_FRACTION_KP_ID]),
    selectedPatternGroupIds: Object.freeze([G4B_U08_EQUIVALENT_FRACTION_PATTERN_GROUP_ID]),
    questionMode: "numeric",
    questionCount: 9,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p03f-slice005-equivalent-fraction-d0",
    title: "四年級｜擴分與約分產生等值分數",
    printLayout: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 5, showQuestionNumbers: true, showAnswerKeyPage: true }),
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
  const pathsExist = paths.every((repoPath) => fs.existsSync(path.join(ROOT, repoPath)));
  if (!pathsExist) return Object.freeze({ ok: false, pathsExist: false, hashesMatch: false, reportAccepted: false, report: null });
  const report = readRepoJson(manifest.acceptanceReportPath);
  const actual = { html: sha256File(manifest.htmlArtifactPath), pdf: sha256File(manifest.pdfArtifactPath) };
  const hashesMatch = actual.html === manifest.exactAcceptance.committedHtmlSha256
    && actual.pdf === manifest.exactAcceptance.committedPdfSha256
    && report.htmlSha256 === actual.html && report.pdfSha256 === actual.pdf;
  const reportAccepted = report.status === "PASS_VISUAL_AND_SEMANTIC_REVIEWED"
    && String(report.visualReview?.status ?? "").startsWith("PASS")
    && report.overflowFindingCount === 0 && report.duplicatePromptFindingCount === 0
    && report.semanticScopeFindingCount === 0 && report.physicalPdfPageCount === 2
    && report.questionCount === 9 && report.answerKeyItemCount === 9
    && report.patternSpecIds?.length === 3;
  return Object.freeze({ ok: pathsExist && hashesMatch && reportAccepted, pathsExist, hashesMatch, reportAccepted, report: Object.freeze(report), actual: Object.freeze(actual) });
}
function capabilityWitness(question, numberSystem, domainValidator, fractionArithmetic) {
  const originalValue = { numerator: question.numerator, denominator: question.denominator };
  const equivalentValue = { numerator: question.equivalentNumerator, denominator: question.equivalentDenominator };
  const valuePolicy = { allowedMagnitudeClasses: ["PROPER_FRACTION", "IMPROPER_FRACTION", "WHOLE_NUMBER"], allowZero: false, maxCanonicalDenominator: 60 };
  const originalNumber = numberSystem.execute({ action: "NORMALIZE", knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID, sourceNodeId: G4B_U08_SOURCE_ID, value: originalValue, assertedCapabilityId: "cap_fraction_number_system" });
  const equivalentNumber = numberSystem.execute({ action: "NORMALIZE", knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID, sourceNodeId: G4B_U08_SOURCE_ID, value: equivalentValue, assertedCapabilityId: "cap_fraction_number_system" });
  const originalDomain = domainValidator.execute({ action: "VALIDATE_VALUE", knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID, sourceNodeId: G4B_U08_SOURCE_ID, value: originalValue, valuePolicy, assertedCapabilityId: "cap_fraction_domain_validator" });
  const equivalentDomain = domainValidator.execute({ action: "VALIDATE_VALUE", knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID, sourceNodeId: G4B_U08_SOURCE_ID, value: equivalentValue, valuePolicy, assertedCapabilityId: "cap_fraction_domain_validator" });
  const leftValue = question.direction === "expansion" ? originalValue : equivalentValue;
  const targetValue = question.direction === "expansion" ? equivalentValue : originalValue;
  const arithmetic = fractionArithmetic.execute({
    action: "MULTIPLY",
    knowledgePointId: G4B_U08_EQUIVALENT_FRACTION_KP_ID,
    sourceNodeId: G4B_U08_SOURCE_ID,
    leftValue,
    rightValue: { numerator: question.factor, denominator: question.factor },
    resultPolicy: valuePolicy,
    assertedCapabilityId: "cap_fraction_arithmetic",
  });
  return Object.freeze({
    questionId: question.id,
    originalNumberSystemOk: originalNumber.ok,
    equivalentNumberSystemOk: equivalentNumber.ok,
    originalCanonicalValue: originalNumber.result?.canonicalValue ?? null,
    equivalentCanonicalValue: equivalentNumber.result?.canonicalValue ?? null,
    originalDomainValidatorOk: originalDomain.ok,
    equivalentDomainValidatorOk: equivalentDomain.ok,
    originalCanonicalIdentity: originalDomain.result?.canonicalIdentity ?? null,
    equivalentCanonicalIdentity: equivalentDomain.result?.canonicalIdentity ?? null,
    fractionArithmeticOk: arithmetic.ok,
    arithmeticCanonicalValue: arithmetic.result?.canonicalValue ?? null,
    targetValue: Object.freeze(targetValue),
  });
}

export function materializeP03FSlice005ProductAdmission() {
  const authority = readJson("slice005-equivalent-fraction-authority.json");
  const manifest = readJson("slice005-product-admission.manifest.json");
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[4];
  const predecessorText = fs.readFileSync(path.join(ROOT, PREDECESSOR_READBACK), "utf8");
  const predecessorPassed = predecessorText.includes("STATUS     = PASS_CI_SYNCED_AND_MERGED") && predecessorText.includes("EVIDENCE   = E6_D0_COMPLETE");
  const numberSystem = materializeP03B1FractionNumberSystemConsumer();
  const domainValidator = materializeP03B3FractionDomainValidator();
  const fractionArithmetic = materializeP03B5FractionArithmeticConsumer();
  const selectorProjectionAudit = auditG4BU08EquivalentFractionSelectorProjection();
  const selectorCompositionAudit = auditP03F5PublicSelectorComposition();
  const patternAudit = validateP03F5PatternDefinitions();
  const controlAudit = auditFullProductPublicControlProfiles({ includeW3Slice005: true });
  const requestedPlan = plan();
  const browserPlan = buildBatchABrowserPlan(requestedPlan);
  const planValidation = validateBatchABrowserPlan(browserPlan);
  const generation = generateBatchABrowserQuestions(requestedPlan);
  const questionValidation = validateBatchABrowserQuestions(generation.questions ?? []);
  const capabilityWitnesses = (generation.questions ?? []).map((question) => capabilityWitness(question, numberSystem, domainValidator, fractionArithmetic));
  const worksheet = buildWorksheetDocumentFromPlan(requestedPlan);
  const document = worksheet.worksheetDocument ?? null;
  const html = renderProductionHtml(document);
  const currentSources = listCurrentFullProductPublicSourceUnits();
  const publicSource = currentSources.find((row) => row.sourceId === G4B_U08_SOURCE_ID) ?? null;
  const selectorRow = getVisibleBatchAKnowledgePoint(G4B_U08_EQUIVALENT_FRACTION_KP_ID);
  const visibleGroups = getVisiblePatternGroupsForKnowledgePoint(G4B_U08_EQUIVALENT_FRACTION_KP_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G4B_U08_SOURCE_ID);
  const controlProfile = getFullProductPublicControlProfile(G4B_U08_SOURCE_ID);
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
    cumulativeW3ProductAdmissionCount: 5 + (d0Complete ? 1 : 0),
    remainingDirectSliceCount: 49 - (d0Complete ? 1 : 0),
    remainingDirectKnowledgePointCount: 77 - (d0Complete ? 1 : 0),
    laterWaveDependentCount: queue.metrics.laterWaveDependentExcludedCount,
  });
  return Object.freeze({
    schemaName: manifest.schemaName, schemaVersion: manifest.schemaVersion, programId: manifest.programId, taskId: manifest.taskId,
    status: manifest.status, version: P03F_SLICE005_PRODUCT_ADMISSION_VERSION, authority: Object.freeze(authority), manifest: Object.freeze(manifest),
    queueAuthority: queue, slice, predecessorPassed, numberSystem, domainValidator, fractionArithmetic, selectorProjectionAudit, selectorCompositionAudit, patternAudit, controlAudit,
    requestedPlan, browserPlan, planValidation, generation, questionValidation, capabilityWitnesses: freezeArray(capabilityWitnesses), worksheet,
    document, html, publicSource, selectorRow: selectorRow ? Object.freeze(selectorRow) : null, visibleGroups: freezeArray(visibleGroups),
    availability: availability ? Object.freeze(availability) : null, controlProfile: controlProfile ? Object.freeze(controlProfile) : null,
    artifactIntegrity: artifacts, metrics, productAdmissionState: d0Complete ? "PRODUCTION_ADMITTED_D0" : "PRODUCT_ACCEPTANCE_PENDING", d0Complete,
  });
}
