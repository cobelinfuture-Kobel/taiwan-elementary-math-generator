import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { materializeP03CW3CapabilityCloseoutProductUnblockReconciliation } from "./p03c-w3-capability-closeout-product-unblock.mjs";
import { getBatchASourceUnit } from "../../../site/modules/curriculum/batch-a/source-units.js";
import {
  getVisibleBatchAKnowledgePoint,
  getVisiblePatternGroupsForKnowledgePoint,
} from "../../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { buildWorksheetDocumentFromPlan } from "../../../site/assets/browser/pipeline/build-worksheet-document.js";
import { renderWorksheetDocumentToHtml } from "../../../site/modules/renderer/html-renderer-s73-extension.js";

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(MODULE_DIR, "../../..");
const P03D_DIR = path.join(ROOT, "data/curriculum/full-product/p03d");

export const P03D_W3_PROTECTED_D0_COMPATIBILITY_REVALIDATION_VERSION =
  "p03d-w3-protected-d0-compatibility-revalidation-v1";

function readJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(P03D_DIR, fileName), "utf8"));
}

function freezeArray(values) {
  return Object.freeze([...values]);
}

function unique(values) {
  return [...new Set((values ?? []).filter(Boolean))];
}

function issueCodes(result) {
  return [...(result?.errors ?? []), ...(result?.validation?.errors ?? [])].map((issue) => (
    typeof issue === "string" ? issue : issue?.code ?? issue?.message ?? JSON.stringify(issue)
  ));
}

function questionsOf(document) {
  const candidates = [document?.generatedQuestions, document?.questions, document?.items];
  return candidates.find(Array.isArray) ?? [];
}

function answerKeyCount(document) {
  if (Array.isArray(document?.answerKeyItems)) return document.answerKeyItems.length;
  if (Array.isArray(document?.answerKeyPages)) {
    return document.answerKeyPages.reduce((sum, page) => (
      sum + (page?.cells ?? []).filter((cell) => cell?.cellType !== "filler").length
    ), 0);
  }
  if (typeof document?.dynamicHtml === "string" && /answer[-_ ]?key|答案/i.test(document.dynamicHtml)) return 1;
  return 0;
}

function questionModeFor(group) {
  const corpus = JSON.stringify({
    mode: group?.mode,
    publicQuestionMode: group?.publicQuestionMode,
    questionMode: group?.questionMode,
    representationTag: group?.representationTag,
    representationTags: group?.representationTags,
    displayName: group?.displayName,
  }).toLowerCase();
  if (corpus.includes("pbl")) return "pbl";
  if (corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題")) {
    return "application";
  }
  return "numeric";
}

function compatibilityPlan({ knowledgePointId, sourceId, group }) {
  const questionMode = questionModeFor(group);
  return Object.freeze({
    sourceId,
    questionCount: questionMode === "pbl" ? 1 : 2,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: `p03d-${knowledgePointId}-${group.patternGroupId}`,
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: [knowledgePointId],
    selectedPatternGroupIds: [group.patternGroupId],
    questionMode,
    depthMode: "mixed",
    contextMode: "mixed",
    printLayout: {
      paperSize: "A4",
      columns: questionMode === "numeric" ? 2 : 1,
      rowsPerPage: questionMode === "numeric" ? 2 : 1,
      showAnswerKeyPage: true,
      showQuestionNumbers: true,
    },
  });
}

function safeBuild(plan) {
  try {
    return buildWorksheetDocumentFromPlan(plan);
  } catch (error) {
    return Object.freeze({
      ok: false,
      errors: Object.freeze([{ code: "P03D_WORKSHEET_BUILD_THROW", message: String(error?.stack ?? error) }]),
      worksheetDocument: null,
      authoritativeConsumerCutover: null,
    });
  }
}

function renderHtml(document, title) {
  if (!document) return "";
  if (typeof document.dynamicHtml === "string" && document.dynamicHtml.includes("<html")) return document.dynamicHtml;
  try {
    return renderWorksheetDocumentToHtml(document, {
      title,
      stylesheetHref: "./assets/styles/print-styles.css",
      debugDataAttributes: true,
    });
  } catch {
    return "";
  }
}

function authorityEvidence(result, document, plan) {
  const cutover = result?.authoritativeConsumerCutover;
  const metadata = document?.metadata?.r07AuthoritativeConsumerCutover;
  const config = document?.configSnapshot?.globalAuthorityCutover;
  const adapter = cutover?.adapter ?? metadata ?? config ?? null;
  const dualReadParity = cutover?.dualReadParity ?? null;
  return Object.freeze({
    applied: cutover?.applied === true,
    blocked: cutover?.blocked === true,
    authorityMode: adapter?.authorityMode ?? null,
    legacyAuthorityRole: adapter?.legacyAuthorityRole ?? null,
    requestedKnowledgePointPreserved: dualReadParity?.requestedKnowledgePointIdsPreserved === true,
    requestedPatternGroupPreserved: dualReadParity?.requestedPatternGroupIdsPreserved === true,
    documentMetadataPresent: Boolean(metadata),
    documentConfigPresent: Boolean(config),
    publicControlsAuthorityMode: document?.publicControls?.authorityMode ?? null,
    selectedKnowledgePointIds: freezeArray(plan.selectedKnowledgePointIds),
    selectedPatternGroupIds: freezeArray(plan.selectedPatternGroupIds),
  });
}

function printLayoutEvidence(document) {
  const layout = document?.configSnapshot?.printLayout ?? document?.printOptions ?? null;
  return Object.freeze({
    present: Boolean(layout),
    paperSize: layout?.paperSize ?? null,
    columns: layout?.columns ?? null,
    rowsPerPage: layout?.rowsPerPage ?? null,
    showAnswerKeyPage: layout?.showAnswerKeyPage ?? layout?.showAnswerKey ?? null,
  });
}

function materializeWitness({ knowledgePointId, sourceId, group }) {
  const plan = compatibilityPlan({ knowledgePointId, sourceId, group });
  const result = safeBuild(plan);
  const document = result?.worksheetDocument ?? null;
  const questions = questionsOf(document);
  const issues = issueCodes(result);
  const answers = answerKeyCount(document);
  const html = renderHtml(document, `P03D ${knowledgePointId} ${group.patternGroupId}`);
  const authority = authorityEvidence(result, document, plan);
  const printLayout = printLayoutEvidence(document);
  const checks = Object.freeze({
    worksheetBuildPass: result?.ok === true && Boolean(document),
    validatorPass: result?.ok === true && issues.length === 0,
    generatedQuestionPass: questions.length > 0,
    answerKeyPass: answers > 0,
    htmlRenderPass: html.includes("<html") && html.includes("worksheet"),
    printLayoutPass: printLayout.present && printLayout.paperSize === "A4",
    globalAuthorityCutoverPass: authority.applied
      && !authority.blocked
      && authority.authorityMode === "GLOBAL_PRIMARY"
      && authority.legacyAuthorityRole === "COMPATIBILITY_ALIAS_READ_ONLY"
      && authority.documentMetadataPresent
      && authority.documentConfigPresent
      && authority.publicControlsAuthorityMode === "GLOBAL_PRIMARY",
    knowledgePointIdentityPass: authority.requestedKnowledgePointPreserved,
    patternGroupIdentityPass: authority.requestedPatternGroupPreserved,
  });
  const passed = Object.values(checks).every(Boolean);
  return Object.freeze({
    witnessId: `p03d_${knowledgePointId.replace(/^kp_/, "")}_${group.patternGroupId}`,
    knowledgePointId,
    sourceId,
    patternGroupId: group.patternGroupId,
    patternSpecIds: freezeArray(unique(group.patternSpecIds ?? []).sort()),
    questionMode: plan.questionMode,
    generatedQuestionCount: questions.length,
    answerKeyCount: answers,
    htmlByteLength: Buffer.byteLength(html),
    issues: freezeArray(issues),
    authority,
    printLayout,
    checks,
    compatibilityState: passed
      ? "PROTECTED_D0_PATTERN_COMPATIBILITY_REVALIDATED"
      : "PROTECTED_D0_PATTERN_COMPATIBILITY_BLOCKED",
    passed,
  });
}

export function materializeP03DW3ProtectedD0CompatibilityRevalidation() {
  const policy = readJson("protected-d0-compatibility-revalidation-policy.json");
  const manifest = readJson("protected-d0-compatibility-revalidation.manifest.json");
  const p03c = materializeP03CW3CapabilityCloseoutProductUnblockReconciliation();
  const protectedIds = [...policy.protectedKnowledgePointIds];

  const rows = protectedIds.map((knowledgePointId) => {
    const predecessor = p03c.getRow(knowledgePointId);
    const selectorRow = getVisibleBatchAKnowledgePoint(knowledgePointId);
    const sourceId = selectorRow?.sourceId ?? predecessor?.sourceNodeIds?.[0] ?? null;
    const sourceUnit = sourceId ? getBatchASourceUnit(sourceId) : null;
    const patternGroups = selectorRow ? getVisiblePatternGroupsForKnowledgePoint(knowledgePointId) : [];
    const witnesses = patternGroups.map((group) => materializeWitness({ knowledgePointId, sourceId, group }));
    const patternSpecIds = unique(patternGroups.flatMap((group) => group.patternSpecIds ?? [])).sort();
    const rowChecks = Object.freeze({
      predecessorRowPresent: Boolean(predecessor),
      historicallyProductionAdmitted: predecessor?.productProductionAdmitted === true,
      protectedExistingD0: predecessor?.protectedExistingD0 === true,
      capabilityUnblocked: predecessor?.capabilityUnblocked === true,
      predecessorPendingState: predecessor?.productAdmissionState === "PROTECTED_D0_COMPATIBILITY_REVALIDATION_PENDING",
      publicSourceSelectable: Boolean(sourceUnit),
      publicKnowledgePointVisible: Boolean(selectorRow),
      publicPatternGroupsPresent: patternGroups.length > 0,
      publicPatternSpecsPresent: patternSpecIds.length > 0,
      everyPatternWitnessPassed: witnesses.length > 0 && witnesses.every((witness) => witness.passed),
    });
    const compatibilityRevalidated = Object.values(rowChecks).every(Boolean);
    return Object.freeze({
      knowledgePointId,
      canonicalNameZh: predecessor?.canonicalNameZh ?? selectorRow?.displayName ?? knowledgePointId,
      sourceId,
      sourceNodeIds: freezeArray(predecessor?.sourceNodeIds ?? []),
      sourceUnit: sourceUnit ? Object.freeze({ ...sourceUnit }) : null,
      requiredW3CapabilityIds: freezeArray(predecessor?.requiredW3CapabilityIds ?? []),
      promotedW3CapabilityIds: freezeArray(predecessor?.promotedW3CapabilityIds ?? []),
      historicalProductAdmissionState: predecessor?.productAdmissionState ?? null,
      historicalProductProductionAdmitted: predecessor?.productProductionAdmitted === true,
      protectedExistingD0: predecessor?.protectedExistingD0 === true,
      capabilityUnblocked: predecessor?.capabilityUnblocked === true,
      publicPatternGroupIds: freezeArray(patternGroups.map((group) => group.patternGroupId)),
      publicPatternSpecIds: freezeArray(patternSpecIds),
      compatibilityWitnesses: freezeArray(witnesses),
      checks: rowChecks,
      compatibilityRevalidated,
      successorProductAdmissionState: compatibilityRevalidated
        ? "PROTECTED_D0_COMPATIBILITY_REVALIDATED_ADMISSION_PRESERVED"
        : "PROTECTED_D0_COMPATIBILITY_REVALIDATION_BLOCKED",
      productProductionAdmitted: predecessor?.productProductionAdmitted === true,
      newlyProductAdmittedByP03D: false,
    });
  });

  const allWitnesses = rows.flatMap((row) => row.compatibilityWitnesses);
  const unaffectedNewProductRows = p03c.downstreamUnblockRows.filter((row) => !row.protectedExistingD0);
  const metrics = Object.freeze({
    protectedKnowledgePointCount: rows.length,
    protectedSourceCount: new Set(rows.map((row) => row.sourceId).filter(Boolean)).size,
    historicallyProductionAdmittedCount: rows.filter((row) => row.historicalProductProductionAdmitted).length,
    capabilityUnblockedProtectedCount: rows.filter((row) => row.capabilityUnblocked).length,
    revalidatedProtectedCount: rows.filter((row) => row.compatibilityRevalidated).length,
    publicPatternGroupCount: new Set(rows.flatMap((row) => row.publicPatternGroupIds)).size,
    publicPatternSpecCount: new Set(rows.flatMap((row) => row.publicPatternSpecIds)).size,
    compatibilityWitnessCount: allWitnesses.length,
    generatedQuestionCount: allWitnesses.reduce((sum, witness) => sum + witness.generatedQuestionCount, 0),
    answerKeyWitnessCount: allWitnesses.filter((witness) => witness.checks.answerKeyPass).length,
    htmlWitnessCount: allWitnesses.filter((witness) => witness.checks.htmlRenderPass).length,
    printLayoutWitnessCount: allWitnesses.filter((witness) => witness.checks.printLayoutPass).length,
    globalAuthorityWitnessCount: allWitnesses.filter((witness) => witness.checks.globalAuthorityCutoverPass).length,
    compatibilityWitnessPassCount: allWitnesses.filter((witness) => witness.passed).length,
    compatibilityWitnessFailCount: allWitnesses.filter((witness) => !witness.passed).length,
    preservedProtectedProductAdmissionCount: rows.filter((row) => row.productProductionAdmitted).length,
    newProductAdmissionCount: p03c.downstreamUnblockRows.filter((row) => (
      !row.protectedExistingD0 && row.productProductionAdmitted
    )).length,
    unaffectedNewProductRowCount: unaffectedNewProductRows.length,
  });

  const rowByKnowledgePointId = new Map(rows.map((row) => [row.knowledgePointId, row]));
  return Object.freeze({
    schemaName: manifest.schemaName,
    schemaVersion: manifest.schemaVersion,
    programId: manifest.programId,
    taskId: manifest.taskId,
    status: manifest.status,
    version: P03D_W3_PROTECTED_D0_COMPATIBILITY_REVALIDATION_VERSION,
    policy: Object.freeze(policy),
    manifest: Object.freeze(manifest),
    predecessor: p03c,
    protectedKnowledgePointIds: freezeArray(protectedIds),
    rows: freezeArray(rows),
    compatibilityWitnesses: freezeArray(allWitnesses),
    unaffectedNewProductRows: freezeArray(unaffectedNewProductRows),
    metrics,
    getRow(knowledgePointId) {
      return rowByKnowledgePointId.get(knowledgePointId) ?? null;
    },
  });
}

export function listP03DProtectedD0CompatibilityRows() {
  return materializeP03DW3ProtectedD0CompatibilityRevalidation().rows;
}

export function getP03DProtectedD0CompatibilityRow(knowledgePointId) {
  return materializeP03DW3ProtectedD0CompatibilityRevalidation().getRow(knowledgePointId);
}
