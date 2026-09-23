import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  evaluateGoldenCrossUnitPilot,
  evaluateGoldenCrossUnitProgram,
  GOLDEN_CONFORMANCE_STATUSES,
} from "../../site/modules/curriculum/golden/cross-unit-golden-conformance.js";
import { adaptGlobalPublicSourceUnitPlan } from "../../site/modules/curriculum/batch-a/global-public-source-unit-adapter.js";
import { resolveG5AU02BrowserPlan } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-resolver.js";
import { buildG5AU02BrowserDynamicWorksheet } from "../../site/modules/curriculum/batch-b/g5a-u02-browser-dynamic-runtime.bundle.js";
import { buildBatchABrowserWorksheetDocument } from "../../site/modules/curriculum/batch-a/batch-a-browser-worksheet-gctx-p13-entry.js";
import { validateBatchABrowserQuestions } from "../../site/modules/curriculum/batch-a/batch-a-browser-validator-s57f5-extension.js";
import { getVisiblePatternGroupsForKnowledgePoint } from "../../site/modules/curriculum/registry/batch-a-selector-extension.js";
import { renderWorksheetDocumentToHtml } from "../../site/modules/renderer/html-renderer-s73-extension.js";

const PILOT_REGISTRY_PATH = new URL(
  "../../data/curriculum/golden/G5AU08_GOLDEN_V1.cross-unit-pilots.json",
  import.meta.url,
);
const G5A_U02_CLOSEOUT_PATH = new URL(
  "../../data/curriculum/contracts/S96T_G5A_U02_ProductionRecloseout.json",
  import.meta.url,
);
const G3B_U04_D0_CLAIM_PATH = new URL(
  "../../data/project/milestones/GCTX-P14.claim.json",
  import.meta.url,
);
const BATCH_A_KP_REGISTRY_PATH = new URL(
  "../../data/curriculum/registry/batch_a_knowledge_points.json",
  import.meta.url,
);

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function pilotRegistry() {
  return readJson(PILOT_REGISTRY_PATH);
}

function pilotBySource(registry, sourceId) {
  const pilot = registry.pilots.find((row) => row.sourceId === sourceId);
  assert.ok(pilot, `missing pilot ${sourceId}`);
  return pilot;
}

function g3bU04ApplicationGroupId() {
  return getVisiblePatternGroupsForKnowledgePoint("kp_g3b_u04_add_then_divide")
    .find((group) => group.representationTag === "application_word_problem")
    ?.patternGroupId;
}

async function runLegacyNumericPilot(registry) {
  const closeout = await readJson(G5A_U02_CLOSEOUT_PATH);
  const adapted = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g5a_u02_5a02",
    selectionMode: "sourceUnit",
    questionCount: 12,
    includeAnswerKey: true,
    generationSeed: "gs05-g5a-u02-numeric-pilot",
  });
  assert.equal(adapted.applied, true);
  assert.equal(adapted.blocked, false);

  const resolution = resolveG5AU02BrowserPlan(adapted.plan);
  assert.equal(resolution.ok, true, JSON.stringify(resolution.errors ?? []));
  assert.ok(["singleKnowledgePoint", "multiKnowledgePoint"].includes(resolution.mode));

  const runtime = buildG5AU02BrowserDynamicWorksheet(resolution.plan);
  assert.equal(runtime.ok, true, JSON.stringify(runtime.errors ?? []));
  const document = runtime.worksheetDocument;
  const evidence = {
    runtimeExecuted: true,
    generatorOk: document.questionItems.length === 12,
    validatorOk: runtime.errors.length === 0,
    rendererOk: typeof document.dynamicHtml === "string" && document.dynamicHtml.includes("<!doctype html>"),
    answerKeyOk: document.answerKeyItems.length === 12,
    productionUseAllowed: document.lifecycle.productionUse === "allowed_dynamic_knowledge_point_release",
    authoritativeProductionEvidencePresent: closeout.status === "PASS_ACCEPTED_AND_CLOSED"
      && closeout.goalDistanceAfter === "D0_G5A_U02_PRODUCTION_DEPLOYED_AND_CLOSED",
    questionCount: document.questionItems.length,
    answerKeyCount: document.answerKeyItems.length,
  };
  return {
    result: evaluateGoldenCrossUnitPilot(pilotBySource(registry, "g5a_u02_5a02"), evidence),
    evidence,
  };
}

async function runLegacyApplicationPilot(registry) {
  const d0Claim = await readJson(G3B_U04_D0_CLAIM_PATH);
  const groupId = g3bU04ApplicationGroupId();
  assert.ok(groupId, "G3B-U04 application PatternGroup missing");
  const runtime = buildBatchABrowserWorksheetDocument({
    sourceId: "g3b_u04_3b04",
    selectionMode: "singleKnowledgePoint",
    selectedKnowledgePointIds: ["kp_g3b_u04_add_then_divide"],
    selectedPatternGroupIds: [groupId],
    questionCount: 25,
    ordering: "groupedByPattern",
    includeAnswerKey: true,
    generationSeed: "gs05-g3b-u04-application-pilot",
    printLayout: { columns: 2, rowsPerPage: 4, showAnswerKeyPage: true },
  });
  assert.equal(runtime.ok, true, JSON.stringify(runtime.errors ?? []));
  const document = runtime.worksheetDocument;
  const blocking = validateBatchABrowserQuestions(document.generatedQuestions, { plan: runtime.plan });
  const html = renderWorksheetDocumentToHtml(document, {
    title: "GS05 G3B-U04 Application Pilot",
    stylesheetHref: "",
    debugDataAttributes: false,
  });
  const approvedContexts = document.generatedQuestions.filter(
    (question) => question.globalContextProduction?.productionAdmitted === true,
  );
  const evidence = {
    runtimeExecuted: true,
    generatorOk: document.generatedQuestions.length === 25,
    validatorOk: blocking.ok === true,
    rendererOk: html.includes("worksheet-document") && html.includes("data-renderer-profile"),
    answerKeyOk: document.answerKeyItems.length === 25,
    productionUseAllowed: document.productionUse === "allowed",
    authoritativeProductionEvidencePresent: d0Claim.actualEvidenceLevel === "E6_D0_COMPLETE"
      && d0Claim.claims.productionAdmitted === true
      && d0Claim.claims.d0Complete === true,
    contextBindingValidated: approvedContexts.length === 5
      && approvedContexts.every((question) => question.globalContextProduction.productionUse === "allowed"),
    approvedContextCount: approvedContexts.length,
    questionCount: document.generatedQuestions.length,
    answerKeyCount: document.answerKeyItems.length,
  };
  return {
    result: evaluateGoldenCrossUnitPilot(pilotBySource(registry, "g3b_u04_3b04"), evidence),
    evidence,
  };
}

async function runGoldenNativeInProgressPilot(registry) {
  const kpRegistry = await readJson(BATCH_A_KP_REGISTRY_PATH);
  const rows = kpRegistry.rows.filter((row) => row.sourceId === "g3a_u01_3a01");
  const unsupportedRows = rows.filter((row) => row.htmlSelectableStatus !== "selectable");
  const defaultPlan = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g3a_u01_3a01",
    selectionMode: "sourceUnit",
  });
  const goldenAttempt = adaptGlobalPublicSourceUnitPlan({
    sourceId: "g3a_u01_3a01",
    selectionMode: "sourceUnit",
    goldenContractId: "G5AU08_GOLDEN_V1",
    goldenContractVersion: "1.0.0",
    goldenRuntimeMode: "shadow",
  });
  assert.equal(defaultPlan.applied, false);
  assert.equal(defaultPlan.blocked, false);
  assert.equal(goldenAttempt.applied, false);
  assert.equal(goldenAttempt.blocked, true);
  assert.ok(goldenAttempt.errors.includes("GS05_GOLDEN_UNIT_NOT_REGISTERED"));

  const evidence = {
    dataRegistryPresent: kpRegistry.registryStatus === "partial_materialization",
    dataNodeCount: rows.length,
    productionActivationBlocked: goldenAttempt.blocked === true,
    unsupportedRowsHaveHoldReason: unsupportedRows.length === rows.length
      && unsupportedRows.every((row) => typeof row.holdReason === "string" && row.holdReason.length > 0),
    productionUseAllowed: false,
  };
  return {
    result: evaluateGoldenCrossUnitPilot(pilotBySource(registry, "g3a_u01_3a01"), evidence),
    evidence,
  };
}

test("GS05 pilot registry locks exactly the three required lifecycle classes", async () => {
  const registry = await pilotRegistry();
  assert.equal(registry.goldenContractId, "G5AU08_GOLDEN_V1");
  assert.equal(registry.goldenContractVersion, "1.0.0");
  assert.equal(registry.pilots.length, 3);
  assert.deepEqual(new Set(registry.pilots.map((pilot) => pilot.pilotClass)), new Set([
    "legacy_numeric_completed",
    "legacy_application_completed",
    "golden_native_in_progress",
  ]));
  assert.equal(registry.pilots.every((pilot) => Object.values(pilot.perUnitRuntimeAdditions).every((value) => value === 0)), true);
});

test("GS05 legacy numeric pilot revalidates G5A-U02 without rebuilding runtime", async () => {
  const registry = await pilotRegistry();
  const { result } = await runLegacyNumericPilot(registry);
  assert.equal(result.ok, true, result.errors.map(({ code }) => code).join("\n"));
  assert.equal(result.conformanceStatus, GOLDEN_CONFORMANCE_STATUSES.GOLDEN_CONFORMANT);
});

test("GS05 legacy application pilot revalidates G3B-U04 contexts, validator and renderer", async () => {
  const registry = await pilotRegistry();
  const { result } = await runLegacyApplicationPilot(registry);
  assert.equal(result.ok, true, result.errors.map(({ code }) => code).join("\n"));
  assert.equal(result.conformanceStatus, GOLDEN_CONFORMANCE_STATUSES.GOLDEN_CONFORMANT);
});

test("GS05 unfinished G3A-U01 is data-onboarded and Golden production fails closed", async () => {
  const registry = await pilotRegistry();
  const { result } = await runGoldenNativeInProgressPilot(registry);
  assert.equal(result.ok, true, result.errors.map(({ code }) => code).join("\n"));
  assert.equal(result.conformanceStatus, GOLDEN_CONFORMANCE_STATUSES.IN_PROGRESS_GOLDEN_NATIVE);
});

test("GS05 aggregate proves all three lifecycle classes", async () => {
  const registry = await pilotRegistry();
  const numeric = await runLegacyNumericPilot(registry);
  const application = await runLegacyApplicationPilot(registry);
  const native = await runGoldenNativeInProgressPilot(registry);
  const aggregate = evaluateGoldenCrossUnitProgram(registry.pilots, {
    g5a_u02_5a02: numeric.evidence,
    g3b_u04_3b04: application.evidence,
    g3a_u01_3a01: native.evidence,
  });
  assert.equal(aggregate.ok, true, aggregate.errors.map(({ code }) => code).join("\n"));
  assert.equal(aggregate.pilotCount, 3);
  assert.equal(aggregate.conformantCompletedUnitCount, 2);
  assert.equal(aggregate.goldenNativeInProgressCount, 1);
});
