
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { materializeP03EW3DirectProductVerticalSliceQueue } from "./p03e-w3-direct-product-vertical-slice-queue.mjs";
import { materializeP03B1FractionNumberSystemConsumer } from "./p03b1-fraction-number-system-consumer.mjs";
import { materializeP03B3FractionDomainValidator } from "./p03b3-fraction-domain-validator.mjs";
import { buildWorksheetDocumentFromPlan } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer.js";
import { G3A_U08_SOURCE_ID } from "../../../site/modules/curriculum/registry/g3a-u08-part-whole-fraction-selector-projection.js";
import { G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID, G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID, G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID, auditG3AU08SameDenominatorSelectorProjection } from "../../../site/modules/curriculum/registry/g3a-u08-same-denominator-compare-selector-projection.js";
import { auditP03F6PublicSelectorComposition, getVisibleBatchAKnowledgePoint, getVisiblePatternGroupsForKnowledgePoint, listBatchAKnowledgePointAvailabilityBySource } from "../../../site/modules/curriculum/registry/batch-a-selector-p03f6-extension.js";
import { validateP03F6PatternDefinitions } from "../../../site/modules/curriculum/batch-a/source-pattern-full-product-p03f6-extension.js";
import { buildBatchABrowserPlan } from "../../../site/modules/curriculum/batch-a/batch-a-browser-generator-p03f6.js";
import { generateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-question-router.js";
import { validateBatchABrowserPlan, validateBatchABrowserQuestions } from "../../../site/modules/curriculum/batch-a/batch-a-browser-validator-p03f6.js";
import { listCurrentFullProductPublicSourceUnits } from "../../../site/modules/curriculum/batch-a/source-units.js";
import { auditFullProductPublicControlProfiles, getFullProductPublicControlProfile } from "../../../site/modules/curriculum/registry/full-product-public-control-profiles.js";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const DATA_DIR = path.join(ROOT, "data/curriculum/full-product/p03f");
const PREDECESSOR = "docs/curriculum/output/P03F_W3_DIRECT_PRODUCT_VERTICAL_SLICE005_READBACK.md";
const readJson = (name) => JSON.parse(fs.readFileSync(path.join(DATA_DIR, name), "utf8"));
const readRepoJson = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8"));
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(path.join(ROOT, p))).digest("hex");
const freeze = (v) => Object.freeze([...(v ?? [])]);
function plan(mode) { return Object.freeze({ sourceId: G3A_U08_SOURCE_ID, selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: Object.freeze([G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID]), selectedPatternGroupIds: Object.freeze([mode === "application" ? G3A_U08_SAME_DENOMINATOR_APPLICATION_GROUP_ID : G3A_U08_SAME_DENOMINATOR_NUMERIC_GROUP_ID]), questionMode: mode, questionCount: 6, ordering: "groupedByPattern", includeAnswerKey: true, generationSeed: `p03f-slice006-${mode}-d0`, title: `三年級｜同分母分數比較｜${mode === "application" ? "應用題" : "數字題"}`, printLayout: Object.freeze({ paperSize: "A4", columns: 2, rowsPerPage: 3, showQuestionNumbers: true, showAnswerKeyPage: true }) }); }
function html(document) {
  const raw = renderWorksheetDocumentToHtml(document, { stylesheetHref: "" });
  const css = `<style>@page{size:A4;margin:0}*{box-sizing:border-box}html,body{margin:0;padding:0}body{font-family:Arial,"Noto Sans TC",sans-serif;color:#111;background:#fff}.worksheet-section__header,.worksheet-page__meta{display:none}.worksheet-page{width:210mm;height:297mm;padding:10mm;overflow:hidden;break-after:page;page-break-after:always}.worksheet-page:last-child{break-after:auto;page-break-after:auto}.worksheet-page__grid{display:grid;grid-template-columns:repeat(var(--worksheet-columns),minmax(0,1fr));gap:4mm;align-content:start}.worksheet-cell{border:1px solid #777;border-radius:3mm;padding:3mm;min-height:72mm;break-inside:avoid}.worksheet-cell__number{font-weight:700;margin-bottom:1.5mm}.worksheet-cell__prompt{font-size:13pt;line-height:1.45;overflow-wrap:anywhere}.worksheet-cell__answer{margin-top:2mm;font-size:13pt;font-weight:700;color:#7a0019}</style>`;
  return raw.replace("</head>", `${css}</head>`);
}
function artifactIntegrity(manifest) {
  const ap = manifest.artifactPaths;
  const all = [ap.numericHtml, ap.numericPdf, ap.applicationHtml, ap.applicationPdf, ap.acceptanceReport];
  if (!all.every((p) => fs.existsSync(path.join(ROOT, p)))) return Object.freeze({ ok: false, report: null, hashesMatch: false });
  const report = readRepoJson(ap.acceptanceReport);
  const hashes = { numericHtml: sha(ap.numericHtml), numericPdf: sha(ap.numericPdf), applicationHtml: sha(ap.applicationHtml), applicationPdf: sha(ap.applicationPdf) };
  const expectedHtml = manifest.exactAcceptance.committedHtmlSha256 ?? {};
  const expectedPdf = manifest.exactAcceptance.committedPdfSha256 ?? {};
  const hashesMatch = hashes.numericHtml === expectedHtml.numeric && hashes.applicationHtml === expectedHtml.application && hashes.numericPdf === expectedPdf.numeric && hashes.applicationPdf === expectedPdf.application && JSON.stringify(report.artifactHashes) === JSON.stringify(hashes);
  const accepted = report.status === "PASS_VISUAL_AND_SEMANTIC_REVIEWED" && report.totalQuestionCount === 12 && report.totalAnswerKeyItemCount === 12 && report.totalPhysicalPdfPageCount === 4 && report.overflowFindingCount === 0 && report.duplicatePromptFindingCount === 0 && report.semanticScopeFindingCount === 0;
  return Object.freeze({ ok: hashesMatch && accepted, report: Object.freeze(report), hashesMatch, hashes: Object.freeze(hashes) });
}
function witness(q, numberSystem, domainValidator) {
  const policy = { allowedMagnitudeClasses: ["PROPER_FRACTION", "IMPROPER_FRACTION", "WHOLE_NUMBER"], allowZero: false, maxCanonicalDenominator: 60 };
  const left = { numerator: q.leftNumerator, denominator: q.leftDenominator };
  const right = { numerator: q.rightNumerator, denominator: q.rightDenominator };
  const ln = numberSystem.execute({ action: "NORMALIZE", knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID, sourceNodeId: G3A_U08_SOURCE_ID, value: left, assertedCapabilityId: "cap_fraction_number_system" });
  const rn = numberSystem.execute({ action: "NORMALIZE", knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID, sourceNodeId: G3A_U08_SOURCE_ID, value: right, assertedCapabilityId: "cap_fraction_number_system" });
  const ld = domainValidator.execute({ action: "VALIDATE_VALUE", knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID, sourceNodeId: G3A_U08_SOURCE_ID, value: left, valuePolicy: policy, assertedCapabilityId: "cap_fraction_domain_validator" });
  const rd = domainValidator.execute({ action: "VALIDATE_VALUE", knowledgePointId: G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID, sourceNodeId: G3A_U08_SOURCE_ID, value: right, valuePolicy: policy, assertedCapabilityId: "cap_fraction_domain_validator" });
  return Object.freeze({ questionId: q.id, leftNumberSystemOk: ln.ok, rightNumberSystemOk: rn.ok, leftDomainValidatorOk: ld.ok, rightDomainValidatorOk: rd.ok, leftCanonicalValue: ln.result?.canonicalValue ?? null, rightCanonicalValue: rn.result?.canonicalValue ?? null, relation: q.comparison, samePositiveDenominator: q.leftDenominator === q.rightDenominator && q.leftDenominator > 0 });
}
export function materializeP03FSlice006ProductAdmission() {
  const authority = readJson("slice006-same-denominator-compare-authority.json");
  const manifest = readJson("slice006-product-admission.manifest.json");
  const queue = materializeP03EW3DirectProductVerticalSliceQueue();
  const slice = queue.queueEntries[5];
  const predecessorText = fs.readFileSync(path.join(ROOT, PREDECESSOR), "utf8");
  const predecessorPassed = predecessorText.includes("STATUS     = PASS_CI_SYNCED_AND_MERGED") && predecessorText.includes("EVIDENCE   = E6_D0_COMPLETE");
  const numberSystem = materializeP03B1FractionNumberSystemConsumer();
  const domainValidator = materializeP03B3FractionDomainValidator();
  const selectorProjectionAudit = auditG3AU08SameDenominatorSelectorProjection();
  const selectorCompositionAudit = auditP03F6PublicSelectorComposition();
  const patternAudit = validateP03F6PatternDefinitions();
  const controlAudit = auditFullProductPublicControlProfiles({ includeW3Slice006: true });
  const modes = Object.fromEntries(["numeric", "application"].map((mode) => {
    const requestedPlan = plan(mode); const browserPlan = buildBatchABrowserPlan(requestedPlan); const planValidation = validateBatchABrowserPlan(browserPlan); const generation = generateBatchABrowserQuestions(requestedPlan); const questionValidation = validateBatchABrowserQuestions(generation.questions ?? []); const worksheet = buildWorksheetDocumentFromPlan(requestedPlan); const document = worksheet.worksheetDocument ?? null; return [mode, Object.freeze({ requestedPlan, browserPlan, planValidation, generation, questionValidation, capabilityWitnesses: freeze((generation.questions ?? []).map((q) => witness(q, numberSystem, domainValidator))), worksheet, document, html: document ? html(document) : "" })];
  }));
  const currentSources = listCurrentFullProductPublicSourceUnits();
  const availability = listBatchAKnowledgePointAvailabilityBySource(G3A_U08_SOURCE_ID);
  const selectorRow = getVisibleBatchAKnowledgePoint(G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID);
  const visibleGroups = getVisiblePatternGroupsForKnowledgePoint(G3A_U08_SAME_DENOMINATOR_COMPARE_KP_ID);
  const artifacts = artifactIntegrity(manifest); const d0Complete = artifacts.ok;
  const allQuestions = [...(modes.numeric.generation.questions ?? []), ...(modes.application.generation.questions ?? [])];
  const allAnswers = [...(modes.numeric.document?.answerKeyItems ?? []), ...(modes.application.document?.answerKeyItems ?? [])];
  const metrics = Object.freeze({ queuePosition: slice?.queuePosition ?? null, sourceNodeCount: 1, knowledgePointCount: selectorRow ? 1 : 0, tagBindingCount: authority.knowledgePoint.tagIds.length, formalMappingCount: authority.formalMapping ? 1 : 0, patternGroupCount: visibleGroups.length, patternSpecCount: new Set(visibleGroups.flatMap((g) => g.patternSpecIds)).size, numericPatternSpecCount: 1, applicationPatternSpecCount: 1, globalContextBindingCount: 1, requiredCapabilityCount: slice?.requiredW3CapabilityIds?.length ?? 0, publicSourceCountAfterAdmission: manifest.expectedCounts.publicSourceCountAfterAdmission, publicVisibleKnowledgePointCountForSource: availability?.visibleCount ?? 0, numericQuestionWitnessCount: modes.numeric.generation.questions?.length ?? 0, applicationQuestionWitnessCount: modes.application.generation.questions?.length ?? 0, questionWitnessCount: allQuestions.length, answerKeyWitnessCount: allAnswers.length, htmlWitnessCount: Number(Boolean(modes.numeric.html)) + Number(Boolean(modes.application.html)), chromiumPdfWitnessCount: d0Complete ? 2 : 0, overflowFindingCount: artifacts.report?.overflowFindingCount ?? 0, duplicatePromptFindingCount: artifacts.report?.duplicatePromptFindingCount ?? 0, newProductAdmissionCount: d0Complete ? 1 : 0, cumulativeW3ProductAdmissionCount: 6 + (d0Complete ? 1 : 0), remainingDirectSliceCount: 48 - (d0Complete ? 1 : 0), remainingDirectKnowledgePointCount: 76 - (d0Complete ? 1 : 0), laterWaveDependentCount: queue.metrics.laterWaveDependentExcludedCount });
  return Object.freeze({ schemaName: manifest.schemaName, schemaVersion: manifest.schemaVersion, programId: manifest.programId, taskId: manifest.taskId, status: manifest.status, authority: Object.freeze(authority), manifest: Object.freeze(manifest), queueAuthority: queue, slice, predecessorPassed, numberSystem, domainValidator, selectorProjectionAudit, selectorCompositionAudit, patternAudit, controlAudit, modes: Object.freeze(modes), publicSource: currentSources.find((r) => r.sourceId === G3A_U08_SOURCE_ID) ?? null, selectorRow: selectorRow ? Object.freeze(selectorRow) : null, visibleGroups: freeze(visibleGroups), availability: availability ? Object.freeze(availability) : null, controlProfile: getFullProductPublicControlProfile(G3A_U08_SOURCE_ID), artifactIntegrity: artifacts, metrics, productAdmissionState: d0Complete ? "PRODUCTION_ADMITTED_D0" : "PRODUCT_ACCEPTANCE_PENDING", d0Complete });
}
