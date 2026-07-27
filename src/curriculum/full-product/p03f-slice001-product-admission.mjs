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
  G3A_U08_PART_WHOLE_KP_ID,
  G3A_U08_PART_WHOLE_PATTERN_GROUP_ID,
  G3A_U08_SOURCE_ID,
  auditG3AU08PartWholeSelectorProjection,
} from "../../../site/modules/curriculum/registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  auditP03FPublicSelectorComposition,
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
} from "../../../site/modules/curriculum/registry/batch-a-selector-p03f-extension.js";
import { validateP03FPatternDefinition } from "../../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f-extension.js";
import { buildBatchABrowserPlan } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import {
  validateBatchABrowserPlan,
  validateBatchABrowserQuestions,
} from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f.js";
import { listP03F2FullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";
import {
  auditFullProductPublicControlProfiles,
  getFullProductPublicControlProfile,
} from "../../../site/modules/curriculum/registry/full-product-public-control-profiles.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03F_DIR = path.join(ROOT, "data/curriculum/full-product/p03f");

export const P03F_SLICE001_PRODUCT_ADMISSION_VERSION = "p03f-slice001-product-admission-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03F_DIR, fileName), "utf8"));
}
function readRepoJson(repoPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, repoPath), "utf8"));
}
function sha256File(repoPath) {
  return crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, repoPath))).digest("hex");
}
function freezeArray(values) {
  return Object.freeze([...(values ?? [])]);
}
function buildPlan() {
  return Object.freeze({
    sourceId: G3A_U08_SOURCE_ID,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: Object.freeze([G3A_U08_PART_WHOLE_KP_ID]),
    selectedPatternGroupIds: Object.freeze([G3A_U08_PART_WHOLE_PATTERN_GROUP_ID]),
    questionMode: "numeric",
    questionCount: 8,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "p03f-slice001-d0",
    title: "三年級｜等分整體與分數意義",
    printLayout: Object.freeze({
      paperSize: "A4",
      columns: 2,
      rowsPerPage: 4,
      showQuestionNumbers: true,
      showAnswerKeyPage: true,
    }),
  });
}
function materializeArtifactIntegrity(manifest) {
  const reportPath = manifest.acceptanceReportPath;
  const htmlPath = manifest.htmlArtifactPath;
  const pdfPath = manifest.pdfArtifactPath;
  const pathsExist = [reportPath, htmlPath, pdfPath].every((repoPath) => fs.existsSync(path.join(ROOT, repoPath)));
  if (!pathsExist) {
    return Object.freeze({ ok: false, pathsExist: false, report: null, htmlSha256: null, pdfSha256: null });
  }
  const report = readRepoJson(reportPath);
  const htmlSha256 = sha256File(htmlPath);
  const pdfSha256 = sha256File(pdfPath);
  const hashesMatch = htmlSha256 === manifest.exactAcceptance.committedHtmlSha256
    && pdfSha256 === manifest.exactAcceptance.committedPdfSha256
    && report.htmlSha256 === htmlSha256
    && report.pdfSha256 === pdfSha256;
  const reportAccepted = report.status === "PASS_VISUAL_AND_SEMANTIC_REVIEWED"
    && String(report.visualReview?.status ?? "").startsWith("PASS")
    && report.properFractionInvariantPassed === true
    && report.wholeAsFractionFindingCount === 0
    && report.overflowFindingCount === 0
    && report.questionCount === 8
    && report.answerKeyItemCount === 8;
  return Object.freeze({
    ok: pathsExist && hashesMatch && reportAccepted,
    pathsExist,
    hashesMatch,
    reportAccepted,
    report: Object.freeze(report),
    htmlSha256,
    pdfSha256,
  });
}

export function materializeP03FSlice001ProductAdmission() {
  const authority = readJson("slice001-part-whole-fraction-authority.json");
  const manifest = readJson("slice001-product-admission.manifest.json");
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const firstSlice = queue.nextExecutableSlice;
  const fractionNumberSystem = materializeP03B1FractionNumberSystemConsumer();
  const fractionDomainValidator = materializeP03B3FractionDomainValidator();
  const selectorProjectionAudit = auditG3AU08PartWholeSelectorProjection();
  const selectorCompositionAudit = auditP03FPublicSelectorComposition();
  const patternAudit = validateP03FPatternDefinition();
  const controlAudit = auditFullProductPublicControlProfiles({ includeW3Slice001: true });
  const requestedPlan = buildPlan();
  const browserPlan = buildBatchABrowserPlan(requestedPlan);
  const planValidation = validateBatchABrowserPlan(browserPlan);
  const generation = generateBatchABrowserQuestions(requestedPlan);
  const questionValidation = validateBatchABrowserQuestions(generation.questions ?? []);
  const capabilityWitnesses = (generation.questions ?? []).map((question) => {
    const value = { numerator: question.selectedParts, denominator: question.equalParts };
    const numberSystem = fractionNumberSystem.execute({
      action: "NORMALIZE",
      knowledgePointId: G3A_U08_PART_WHOLE_KP_ID,
      sourceNodeId: G3A_U08_SOURCE_ID,
      value,
      assertedCapabilityId: "cap_fraction_number_system",
    });
    const domain = fractionDomainValidator.execute({
      action: "VALIDATE_VALUE",
      knowledgePointId: G3A_U08_PART_WHOLE_KP_ID,
      sourceNodeId: G3A_U08_SOURCE_ID,
      value,
      valuePolicy: {
        allowedMagnitudeClasses: ["PROPER_FRACTION"],
        allowZero: false,
        maxCanonicalDenominator: 12,
      },
      assertedCapabilityId: "cap_fraction_domain_validator",
    });
    return Object.freeze({
      questionId: question.id,
      originalRepresentation: Object.freeze(value),
      numberSystemOk: numberSystem.ok,
      canonicalValue: numberSystem.result?.canonicalValue ?? null,
      domainValidatorOk: domain.ok,
      domainCanonicalIdentity: domain.result?.canonicalIdentity ?? null,
    });
  });
  const worksheet = buildWorksheetDocumentFromPlan(requestedPlan);
  const document = worksheet.worksheetDocument ?? null;
  const html = document ? renderWorksheetDocumentToHtml(document, { stylesheetHref: "" }) : "";
  const currentSources = listP03F2FullProductPublicSourceUnits();
  const publicSource = currentSources.find((row) => row.sourceId === G3A_U08_SOURCE_ID) ?? null;
  const selectorRow = getVisibleBatchAKnowledgePoint(G3A_U08_PART_WHOLE_KP_ID);
  const visibleGroups = getVisiblePatternGroupsForKnowledgePoint(G3A_U08_PART_WHOLE_KP_ID);
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3A_U08_SOURCE_ID);
  const controlProfile = getFullProductPublicControlProfile(G3A_U08_SOURCE_ID);
  const representationModes = [...new Set((generation.questions ?? []).map((question) => question.representationMode))].sort();
  const artifactIntegrity = materializeArtifactIntegrity(manifest);
  const d0Complete = artifactIntegrity.ok;
  const metrics = Object.freeze({
    queuePosition: firstSlice?.queuePosition ?? null,
    sourceNodeCount: 1,
    knowledgePointCount: selectorRow ? 1 : 0,
    tagBindingCount: authority.tagRegistryBinding.tagIds.length,
    formalMappingCount: authority.formalMapping ? 1 : 0,
    patternGroupCount: visibleGroups.length,
    patternSpecCount: visibleGroups.flatMap((group) => group.patternSpecIds ?? []).length,
    representationModeCount: representationModes.length,
    requiredCapabilityCount: authority.knowledgePoint.requiredCapabilityIds.length,
    publicSourceCountAfterAdmission: currentSources.length,
    publicVisibleKnowledgePointCountForSource: availability?.visibleCount ?? 0,
    questionWitnessCount: generation.questions?.length ?? 0,
    answerKeyWitnessCount: document?.answerKeyItems?.length ?? 0,
    htmlWitnessCount: html ? 1 : 0,
    chromiumPdfWitnessCount: artifactIntegrity.ok ? 1 : 0,
    overflowFindingCount: artifactIntegrity.report?.overflowFindingCount ?? null,
    newProductAdmissionCount: d0Complete ? 1 : 0,
    remainingDirectSliceCount: queue.metrics.queueSliceCount - (d0Complete ? 1 : 0),
    remainingDirectKnowledgePointCount: queue.metrics.directW3KnowledgePointCount - (d0Complete ? 1 : 0),
    laterWaveDependentCount: queue.metrics.laterWaveDependentExcludedCount,
  });

  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03F_SLICE001_PRODUCT_ADMISSION_VERSION,
    authority: Object.freeze(authority),
    manifest: Object.freeze(manifest),
    queueAuthority: queue,
    firstSlice,
    fractionNumberSystem,
    fractionDomainValidator,
    selectorProjectionAudit,
    selectorCompositionAudit,
    patternAudit,
    controlAudit,
    publicSource,
    selectorRow,
    visibleGroups: freezeArray(visibleGroups),
    availability: availability ? Object.freeze(availability) : null,
    controlProfile: controlProfile ? Object.freeze(controlProfile) : null,
    requestedPlan,
    browserPlan: Object.freeze(browserPlan),
    planValidation: Object.freeze(planValidation),
    generation: Object.freeze(generation),
    questionValidation: Object.freeze(questionValidation),
    capabilityWitnesses: freezeArray(capabilityWitnesses),
    worksheet: Object.freeze(worksheet),
    html,
    representationModes: freezeArray(representationModes),
    artifactIntegrity,
    metrics,
    productAdmissionState: d0Complete ? "PRODUCTION_ADMITTED_D0" : "PRODUCT_ACCEPTANCE_PENDING",
    d0Complete,
  });
}
