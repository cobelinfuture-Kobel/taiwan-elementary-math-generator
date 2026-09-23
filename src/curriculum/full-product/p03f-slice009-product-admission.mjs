import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03EW3DirectProductVerticalSliceQueue } from "./p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeP03B1FractionNumberSystemConsumer } from "./p03b1-fraction-number-system-consumer.mjs";
import { materializeP03B3FractionDomainValidator } from "./p03b3-fraction-domain-validator.mjs";
import { buildWorksheetDocumentFromPlan } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";
import {
  G3B_U09_SOURCE_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID,
  G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID,
  auditG3BU09TenthsFractionDecimalSelectorProjection,
} from "../../../site/modules/curriculum/registry/g3b-u09-tenths-fraction-decimal-selector-projection.js";
import { auditP03F9PublicSelectorComposition, getVisibleBatchAKnowledgePoint, getVisiblePatternGroupsForKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource } from "../../../site/modules/curriculum/registry/batch-a-selector-p03f9-extension.js";
import { validateP03F9PatternDefinition } from "../../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f9-extension.js";
import { buildBatchABrowserPlan } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f9.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f9.js";
import { listCurrentFullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";
import { auditFullProductPublicControlProfiles, getFullProductPublicControlProfile } from "../../../site/modules/curriculum/registry/full-product-public-control-profiles.js";
import { getCurrentPixelRegistrySnapshot, listPixelKnowledgePointsForSource } from "../../../site/pixel/pixel-registry-bridge.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DATA_DIR = path.join(ROOT, "data/curriculum/full-product/p03f");
const PREDECESSOR_READBACK = "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE008_READBACK.md";
export const P03F_SLICE009_PRODUCT_ADMISSION_VERSION = "p03f-slice009-product-admission-v1";
const readJson = (fileName) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, fileName), "utf8"));
const readRepoJson = (repoPath) => JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
const sha256File = (repoPath) => crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, repoPath))).digest("hex");
const freezeArray = (values) => Object.freeze([...(values ?? [])]);

function requestedPlan() {
  return Object.freeze({ sourceId: G3B_U09_SOURCE_ID, selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: Object.freeze([G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID]), selectedPatternGroupIds: Object.freeze([G3B_U09_TENTHS_FRACTION_DECIMAL_PATTERN_GROUP_ID]), questionMode: "numeric", questionCount: 8, ordering: "groupedByPattern", includeAnswerKey: true, generationSeed: "p03f-slice009-tenths-fraction-decimal-d0", title: "三年級｜十分之幾與一位小數互換", printLayout: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 4, showQuestionNumbers: true, showAnswerKeyPage: true }) });
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
.worksheet-page { width: 210mm; height: 297mm; padding: 12mm; overflow: hidden; break-after: page; page-break-after: always; }
.worksheet-page:last-child { break-after: auto; page-break-after: auto; }
.worksheet-page__grid { display: grid; grid-template-columns: repeat(var(--worksheet-columns), minmax(0, 1fr)); gap: 6mm; align-content: start; }
.worksheet-cell { border: 1px solid #777; border-radius: 3mm; padding: 4mm; min-height: 58mm; break-inside: avoid; page-break-inside: avoid; }
.worksheet-cell__number { font-weight: 700; margin-bottom: 2mm; }
.worksheet-cell__prompt { font-size: 15pt; line-height: 1.55; overflow-wrap: anywhere; }
.worksheet-cell__answer { margin-top: 3mm; font-size: 14pt; line-height: 1.45; font-weight: 700; color: #7a0019; overflow-wrap: anywhere; }
</style>`;
  return raw.replace("</head>", `${css}</head>`);
}
function artifactIntegrity(manifest) {
  const paths = [manifest.acceptanceReportPath, manifest.htmlArtifactPath, manifest.pdfArtifactPath];
  const pathsExist = paths.every((repoPath) => fs.existsSync(path.join(ROOT, repoPath)));
  if (!pathsExist) return Object.freeze({ ok: false, pathsExist: false, hashesMatch: false, reportAccepted: false, report: null });
  const report = readRepoJson(manifest.acceptanceReportPath);
  const actual = { html: sha256File(manifest.htmlArtifactPath), pdf: sha256File(manifest.pdfArtifactPath) };
  const hashesMatch = actual.html === manifest.exactAcceptance.committedHtmlSha256 && actual.pdf === manifest.exactAcceptance.committedPdfSha256 && report.htmlSha256 === actual.html && report.pdfSha256 === actual.pdf;
  const reportAccepted = report.status === "PASS_VISUAL_AND_SEMANTIC_REVIEWED" && String(report.visualReview?.status ?? "").startsWith("PASS") && report.overflowFindingCount === 0 && report.duplicatePromptFindingCount === 0 && report.semanticScopeFindingCount === 0 && report.physicalPdfPageCount === 2 && report.questionCount === 8 && report.answerKeyItemCount === 8 && report.directionCounts?.fraction_to_decimal === 4 && report.directionCounts?.decimal_to_fraction === 4;
  return Object.freeze({ ok: pathsExist && hashesMatch && reportAccepted, pathsExist, hashesMatch, reportAccepted, report: Object.freeze(report), actual: Object.freeze(actual) });
}
function capabilityWitness(question, numberSystem, domainValidator) {
  const value = question.fractionValue;
  const kpId = question.metadata.knowledgePointId;
  const valuePolicy = { allowedMagnitudeClasses: ["PROPER_FRACTION"], allowZero: false, maxCanonicalNumerator: 9, maxCanonicalDenominator: 10 };
  const numberResult = numberSystem.execute({ action: "NORMALIZE", knowledgePointId: kpId, sourceNodeId: G3B_U09_SOURCE_ID, value, assertedCapabilityId: "cap_fraction_number_system" });
  const domainResult = domainValidator.execute({ action: "VALIDATE_VALUE", knowledgePointId: kpId, sourceNodeId: G3B_U09_SOURCE_ID, value, valuePolicy, assertedCapabilityId: "cap_fraction_domain_validator" });
  return Object.freeze({ questionId: question.id, knowledgePointId: kpId, patternSpecId: question.patternSpecId, sourceFraction: Object.freeze({ ...value }), sourceDenominatorPreserved: question.denominator === 10, decimalValue: question.decimalValue, conversionDirection: question.conversionDirection, numberSystemOk: numberResult.ok, canonicalValue: numberResult.result?.canonicalValue ?? null, domainValidatorOk: domainResult.ok, domainCanonicalValue: domainResult.result?.canonicalValue ?? null, domainCanonicalIdentity: domainResult.result?.canonicalIdentity ?? null });
}

export function materializeP03FSlice009ProductAdmission() {
  const authority = readJson("slice009-tenths-fraction-decimal-authority.json");
  const manifest = readJson("slice009-product-admission.manifest.json");
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[8];
  const predecessorText = fs.readFileSync(path.join(ROOT, PREDECESSOR_READBACK), "utf8");
  const predecessorPassed = predecessorText.includes("STATUS     = PASS_CI_SYNCED_AND_MERGED") && predecessorText.includes("EVIDENCE   = E6_D0_COMPLETE");
  const numberSystem = materializeP03B1FractionNumberSystemConsumer();
  const domainValidator = materializeP03B3FractionDomainValidator();
  const selectorProjectionAudit = auditG3BU09TenthsFractionDecimalSelectorProjection();
  const selectorCompositionAudit = auditP03F9PublicSelectorComposition();
  const patternAudit = validateP03F9PatternDefinition();
  const controlAudit = auditFullProductPublicControlProfiles({ includeW3Slice009: true });
  const plan = requestedPlan();
  const browserPlan = buildBatchABrowserPlan(plan);
  const planValidation = validateBatchABrowserPlan(browserPlan);
  const generation = generateBatchABrowserQuestions(plan);
  const questionValidation = validateBatchABrowserQuestions(generation.questions ?? []);
  const capabilityWitnesses = (generation.questions ?? []).map((question) => capabilityWitness(question, numberSystem, domainValidator));
  const worksheet = buildWorksheetDocumentFromPlan(plan);
  const document = worksheet.worksheetDocument ?? null;
  const html = renderProductionHtml(document);
  const currentSources = listCurrentFullProductPublicSourceUnits();
  const publicSource = currentSources.find((row) => row.sourceId === G3B_U09_SOURCE_ID) ?? null;
  const selectorRows = [G3B_U09_TENTHS_FRACTION_DECIMAL_KP_ID].map((id) => getVisibleBatchAKnowledgePoint(id)).filter(Boolean);
  const visibleGroups = selectorRows.flatMap((row) => getVisiblePatternGroupsForKnowledgePoint(row.knowledgePointId));
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3B_U09_SOURCE_ID);
  const controlProfile = getFullProductPublicControlProfile(G3B_U09_SOURCE_ID);
  const pixelSnapshot = getCurrentPixelRegistrySnapshot();
  const pixelRows = listPixelKnowledgePointsForSource(G3B_U09_SOURCE_ID);
  const artifacts = artifactIntegrity(manifest);
  const d0Complete = artifacts.ok;
  const admittedKnowledgePointCount = d0Complete ? 1 : 0;
  const directionCounts = generation.directionCounts ?? { fraction_to_decimal: 0, decimal_to_fraction: 0 };
  const metrics = Object.freeze({ queuePosition: slice?.queuePosition ?? null, sourceNodeCount: 1, knowledgePointCount: selectorRows.length, tagBindingCount: authority.knowledgePoints.reduce((sum, row) => sum + row.tagIds.length, 0), formalMappingCount: authority.formalMappings.length, patternGroupCount: visibleGroups.length, patternSpecCount: new Set(visibleGroups.flatMap((row) => row.patternSpecIds ?? [])).size, numericPatternSpecCount: generation.allocation?.length ?? 0, applicationPatternSpecCount: 0, globalContextBindingCount: 0, requiredCapabilityCount: slice?.requiredW3CapabilityIds?.length ?? 0, publicSourceCountAfterAdmission: manifest.expectedCounts.publicSourceCountAfterAdmission, currentPublicSourceCount: currentSources.length, publicVisibleKnowledgePointCountForSource: availability?.visibleCount ?? 0, questionWitnessCount: generation.questions?.length ?? 0, answerKeyWitnessCount: document?.answerKeyItems?.length ?? 0, fractionToDecimalWitnessCount: directionCounts.fraction_to_decimal ?? 0, decimalToFractionWitnessCount: directionCounts.decimal_to_fraction ?? 0, htmlWitnessCount: Number(Boolean(html)), chromiumPdfWitnessCount: d0Complete ? 1 : 0, overflowFindingCount: artifacts.report?.overflowFindingCount ?? 0, duplicatePromptFindingCount: artifacts.report?.duplicatePromptFindingCount ?? 0, newProductAdmissionCount: admittedKnowledgePointCount, cumulativeW3ProductAdmissionCount: 10 + admittedKnowledgePointCount, remainingDirectSliceCount: 45 - (d0Complete ? 1 : 0), remainingDirectKnowledgePointCount: 72 - admittedKnowledgePointCount, laterWaveDependentCount: queue.metrics.laterWaveDependentExcludedCount });
  return Object.freeze({ schemaName: manifest.schemaName, schemaVersion: manifest.schemaVersion, programId: manifest.programId, taskId: manifest.taskId, status: manifest.status, version: P03F_SLICE009_PRODUCT_ADMISSION_VERSION, authority: Object.freeze(authority), manifest: Object.freeze(manifest), queueAuthority: queue, slice, predecessorPassed, numberSystem, domainValidator, selectorProjectionAudit, selectorCompositionAudit, patternAudit, controlAudit, requestedPlan: plan, browserPlan, planValidation, generation, questionValidation, capabilityWitnesses: freezeArray(capabilityWitnesses), worksheet, document, html, publicSource, selectorRows: freezeArray(selectorRows), visibleGroups: freezeArray(visibleGroups), availability: availability ? Object.freeze(availability) : null, controlProfile: controlProfile ? Object.freeze(controlProfile) : null, pixelSnapshot, pixelRows: freezeArray(pixelRows), artifactIntegrity: artifacts, metrics, productAdmissionState: d0Complete ? "PRODUCTION_ADMITTED_D0" : "PRODUCT_ACCEPTANCE_PENDING", d0Complete });
}
