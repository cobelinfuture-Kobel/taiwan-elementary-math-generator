import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildPublicGenerationCapabilityMatrixV5 } from "./materialize-pgc-r01-public-capability-matrix-v5.mjs";
import { CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import { BATCH_A_SELECTOR_AVAILABILITY, listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f32-extension.js";
import { getFullProductPublicControlProfile } from "../../site/modules/curriculum/registry/full-product-public-control-profiles-p03f32.js";
import {
  G6B_U01_P03F32_DECIMAL_SPEC_ID,
  G6B_U01_P03F32_FRACTION_SPEC_ID,
  G6B_U01_P03F32_GROUP_ID,
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const jsonPath = path.join(outputDir, "public_generation_capability_matrix.json");
const csvPath = path.join(outputDir, "public_generation_capability_matrix.csv");
const gapPath = path.join(docsDir, "PGC-R01_capability_gap_report.md");

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
const slug = (value) => String(value ?? "none").replace(/[^a-zA-Z0-9_+-]+/g, "_");
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const slice032Specs = Object.freeze([
  Object.freeze({ patternSpecId:G6B_U01_P03F32_FRACTION_SPEC_ID, questionForm:"decimal_to_fraction", questionFormLabel:"有限小數化最簡分數" }),
  Object.freeze({ patternSpecId:G6B_U01_P03F32_DECIMAL_SPEC_ID, questionForm:"fraction_to_decimal", questionFormLabel:"可除盡分數化小數" }),
]);

const P03F32_FROZEN_SOURCE_IDS = new Set(Object.keys(BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
const P03F32_FROZEN_PUBLIC_SOURCE_UNITS = Object.freeze(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.filter((row) => P03F32_FROZEN_SOURCE_IDS.has(row.sourceId)));

function buildSlice032CapabilityRows(matrix) {
  const source = P03F32_FROZEN_PUBLIC_SOURCE_UNITS.find((row) => row.sourceId === G6B_U01_P03F32_SOURCE_ID);
  const kp = listVisibleBatchAKnowledgePoints().find((row) => row.knowledgePointId === G6B_U01_P03F32_KP_ID);
  if (!source || !kp) return [];
  const profile = getFullProductPublicControlProfile(source.sourceId);
  const rows = [];
  for (const surface of matrix.surfaces) {
    for (const spec of slice032Specs) {
      const key = [source.sourceId, G6B_U01_P03F32_KP_ID, G6B_U01_P03F32_GROUP_ID, spec.patternSpecId, "numeric", surface.surfaceId, "p03f32"].join("::");
      rows.push({
        capabilityId: `pgc_${slug(source.sourceId)}_${digest(key)}`,
        sourceId: source.sourceId,
        unitCode: source.unitCode,
        unitTitle: source.title,
        grade: source.grade,
        semester: source.semester,
        sourceLifecycle: source.lifecycle ?? "public_full_product_w3_slice032_candidate",
        knowledgePointId: G6B_U01_P03F32_KP_ID,
        knowledgePointName: kp.displayName ?? kp.canonicalNameZh ?? "小數分數互換",
        knowledgePointPublicStatus: kp.selectorStatus ?? kp.visibilityStatus ?? "visible",
        questionType: "NUMERIC",
        effectiveQuestionType: "NUMERIC",
        questionForm: spec.questionForm,
        questionFormLabel: spec.questionFormLabel,
        patternGroupId: G6B_U01_P03F32_GROUP_ID,
        basePatternGroupId: G6B_U01_P03F32_GROUP_ID,
        patternSpecId: spec.patternSpecId,
        depthModes: ["NOT_APPLICABLE"],
        contextModes: ["NOT_APPLICABLE"],
        selectionModes: ["sourceUnit", "singleKnowledgePoint"],
        surfaceId: surface.surfaceId,
        surfaceRouteId: surface.routeId,
        surfaceStatus: surface.status,
        controlPolicy: surface.controlPolicy,
        generatorConsumer: "site/modules/curriculum/batch-a/batch-a-browser-generator-p03f32.js",
        validatorConsumer: "site/modules/curriculum/batch-a/batch-a-browser-validator-p03f32.js",
        questionRouterConsumer: "site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f32.js",
        worksheetConsumer: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f32-extension.js",
        contextLineage: "NOT_APPLICABLE",
        htmlRouteId: "renderer.preview_html",
        pdfRouteId: "renderer.iframe_print",
        answerKeySupported: true,
        defaultQuestionCount: 20,
        declaredUiMaxQuestionCount: 200,
        verifiedMaxQuestionCount: null,
        capacityEvidence: "UNVERIFIED_UNTIL_PGC_R03",
        evidenceLevel: "PUBLIC_CANDIDATE_WITH_ACCEPTANCE_EVIDENCE",
        compatibilityPolicy: profile?.compatibilityPolicy ?? "w3_slice032_mixed_domain_conversion_numeric_only_compare_arithmetic_application_reserved",
        compatibilityStatus: "ACCOUNTED_PENDING_PGC_R02_INTERSECTION_NORMALIZATION",
        normalizationEvidence: "P03F32_EXACT_SHARED_MIXED_DOMAIN_NORMALIZATION",
      });
    }
  }
  return rows;
}

function visiblePairAccounting(matrix) {
  const visibleKnowledgePointIds = new Set(listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId));
  const expectedPairs = new Set();
  for (const knowledgePointId of visibleKnowledgePointIds) for (const surface of matrix.surfaces) expectedPairs.add(`${knowledgePointId}|${surface.surfaceId}`);
  const capabilityPairs = new Set(matrix.capabilities.filter((row) => visibleKnowledgePointIds.has(row.knowledgePointId)).map((row) => `${row.knowledgePointId}|${row.surfaceId}`));
  const explicitGapPairs = new Set(matrix.gaps.filter((gap) => gap.code === "FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY").map((gap) => `${gap.knowledgePointId}|${gap.surfaceId}`));
  const accountedPairs = new Set([...capabilityPairs, ...explicitGapPairs]);
  return {
    expectedPairCount: expectedPairs.size,
    capabilityPairCount: [...capabilityPairs].filter((pair) => expectedPairs.has(pair)).length,
    explicitGapPairCount: [...explicitGapPairs].filter((pair) => expectedPairs.has(pair)).length,
    accountedPairCount: [...accountedPairs].filter((pair) => expectedPairs.has(pair)).length,
    unaccountedPairs: [...expectedPairs].filter((pair) => !accountedPairs.has(pair)),
    unexpectedPairs: [...accountedPairs].filter((pair) => !expectedPairs.has(pair)),
  };
}

export function buildPublicGenerationCapabilityMatrixV6() {
  const matrix = clone(buildPublicGenerationCapabilityMatrixV5());
  matrix.capabilities = matrix.capabilities.filter((row) => P03F32_FROZEN_SOURCE_IDS.has(row.sourceId));
  matrix.gaps = matrix.gaps.filter((gap) => !gap.sourceId || P03F32_FROZEN_SOURCE_IDS.has(gap.sourceId));
  matrix.uiOptionCoverage = matrix.uiOptionCoverage.filter((row) => P03F32_FROZEN_SOURCE_IDS.has(row.sourceId));
  const sliceRows = buildSlice032CapabilityRows(matrix);
  matrix.capabilities = [...new Map([...matrix.capabilities, ...sliceRows].map((row) => [row.capabilityId, row])).values()].sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
  matrix.gaps = matrix.gaps.filter((gap) => !(gap.code === "PUBLIC_SOURCE_WITHOUT_VISIBLE_KP" && gap.sourceId === G6B_U01_P03F32_SOURCE_ID));
  matrix.uiOptionCoverage = matrix.uiOptionCoverage.filter((row) => row.sourceId !== G6B_U01_P03F32_SOURCE_ID);
  for (const surface of matrix.surfaces) matrix.uiOptionCoverage.push({
    sourceId:G6B_U01_P03F32_SOURCE_ID,
    surfaceId:surface.surfaceId,
    questionTypeOption:"numeric",
    capabilityRowCount:2,
    accounted:true,
    normalizationEvidence:"P03F32_EXACT_SHARED_MIXED_DOMAIN_NORMALIZATION",
  });
  matrix.uiOptionCoverage.sort((a,b)=>`${a.sourceId}|${a.surfaceId}|${a.questionTypeOption}`.localeCompare(`${b.sourceId}|${b.surfaceId}|${b.questionTypeOption}`));

  matrix.gaps = matrix.gaps.filter((gap) => !["PUBLIC_KP_SURFACE_UNACCOUNTED","PUBLIC_KP_SURFACE_ACCOUNTING_UNEXPECTED_PAIR"].includes(gap.code));
  const accounting = visiblePairAccounting(matrix);
  for (const pair of accounting.unaccountedPairs) { const [knowledgePointId,surfaceId] = pair.split("|"); matrix.gaps.push({ code:"PUBLIC_KP_SURFACE_UNACCOUNTED", severity:"blocking_r01", knowledgePointId, surfaceId }); }
  for (const pair of accounting.unexpectedPairs) matrix.gaps.push({ code:"PUBLIC_KP_SURFACE_ACCOUNTING_UNEXPECTED_PAIR", severity:"blocking_r01", pair });

  const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();
  const blockingGaps = matrix.gaps.filter((gap) => gap.severity === "blocking_r01");
  matrix.summary = {
    ...matrix.summary,
    publicSourceCount:P03F32_FROZEN_PUBLIC_SOURCE_UNITS.length,
    publicVisibleKnowledgePointCount:visibleKnowledgePoints.length,
    publicSelectorVisibleCount:visibleKnowledgePoints.length,
    capabilityRowCount:matrix.capabilities.length,
    uniquePatternGroupCount:new Set(matrix.capabilities.map((row)=>row.patternGroupId)).size,
    uniquePatternSpecCount:new Set(matrix.capabilities.map((row)=>row.patternSpecId)).size,
    uiOptionCoverageCount:matrix.uiOptionCoverage.length,
    accountedUiOptionCount:matrix.uiOptionCoverage.filter((row)=>row.accounted).length,
    gapCount:matrix.gaps.length,
    blockingGapCount:blockingGaps.length,
    r02UiBindingGapCount:matrix.gaps.filter((gap)=>gap.severity === "r02_ui_binding").length,
    capacityUnverifiedCapabilityCount:matrix.capabilities.filter((row)=>row.capacityEvidence === "UNVERIFIED_UNTIL_PGC_R03").length,
    kpSurfacePairCount:new Set(matrix.capabilities.map((row)=>`${row.knowledgePointId}|${row.surfaceId}`)).size,
    expectedKpSurfacePairCount:visibleKnowledgePoints.length * matrix.surfaces.length,
    visibleKpSurfaceExpectedPairCount:accounting.expectedPairCount,
    visibleKpSurfaceCapabilityPairCount:accounting.capabilityPairCount,
    visibleKpSurfaceExplicitGapPairCount:accounting.explicitGapPairCount,
    visibleKpSurfaceAccountedPairCount:accounting.accountedPairCount,
    visibleKpSurfaceUnaccountedPairCount:accounting.unaccountedPairs.length,
  };
  matrix.surfaceGapPolicy = {
    ...(matrix.surfaceGapPolicy ?? {}),
    expectedPairCount:accounting.expectedPairCount,
    capabilityPairCount:accounting.capabilityPairCount,
    explicitGapPairCount:accounting.explicitGapPairCount,
    accountedPairCount:accounting.accountedPairCount,
    unaccountedPairCount:accounting.unaccountedPairs.length,
    unexpectedPairCount:accounting.unexpectedPairs.length,
  };
  matrix.matrixVersion = "pgc-r01-public-capability-matrix-v6";
  matrix.selectorAuthority = "batch-a-selector-p03f32-extension.js";
  matrix.currentAuthorityPatch = {
    task:"P03F_W3DirectProductVerticalSlice032Implementation",
    sourceId:G6B_U01_P03F32_SOURCE_ID,
    knowledgePointId:G6B_U01_P03F32_KP_ID,
    patternSpecIds:slice032Specs.map((row)=>row.patternSpecId),
    addedCapabilityRowCount:sliceRows.length,
    normalizationModel:"EXACT_RATIONAL_IDENTITY_BASE10_TERMINATING_ONLY",
    learnerActions:["TO_FRACTION","TO_DECIMAL"],
    compareLearnerSurfaceAllowed:false,
    arithmeticMutationAllowed:false,
    applicationExpansionAllowed:false,
  };
  matrix.status = blockingGaps.length === 0 ? "PASS_WITH_DOWNSTREAM_GAPS" : "FAIL_CLOSED_BLOCKING_GAPS";
  return matrix;
}

function writeCsv(matrix) {
  const columns = ["capabilityId","sourceId","unitCode","unitTitle","grade","semester","knowledgePointId","knowledgePointName","questionType","effectiveQuestionType","questionForm","questionFormLabel","patternGroupId","basePatternGroupId","patternSpecId","depthModes","contextModes","selectionModes","surfaceId","surfaceRouteId","surfaceStatus","generatorConsumer","validatorConsumer","contextLineage","htmlRouteId","pdfRouteId","defaultQuestionCount","declaredUiMaxQuestionCount","verifiedMaxQuestionCount","capacityEvidence","evidenceLevel","compatibilityPolicy","compatibilityStatus","normalizationEvidence"];
  const lines = [columns.join(",")];
  for (const row of matrix.capabilities) lines.push(columns.map((column)=>csvEscape(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function writeReport(matrix) {
  const byCode = new Map();
  for (const gap of matrix.gaps) byCode.set(gap.code, (byCode.get(gap.code) ?? 0) + 1);
  const lines = [
    "# PGC-R01 Capability Gap Report","","```text","PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1","TASK_ID    = PGC-R01_PublicKnowledgePointCapabilityMatrix",`STATUS     = ${matrix.status}`,"```","","## Matrix summary","","```text",`PUBLIC_SOURCES                    = ${matrix.summary.publicSourceCount}`,`VISIBLE_KNOWLEDGE_POINTS          = ${matrix.summary.publicVisibleKnowledgePointCount}`,`VISIBLE_KP_SURFACE_ACCOUNTED      = ${matrix.summary.visibleKpSurfaceAccountedPairCount} / ${matrix.summary.visibleKpSurfaceExpectedPairCount}`,`CAPABILITY_ROWS                   = ${matrix.summary.capabilityRowCount}`,`UNIQUE_PATTERN_GROUPS             = ${matrix.summary.uniquePatternGroupCount}`,`UNIQUE_PATTERN_SPECS              = ${matrix.summary.uniquePatternSpecCount}`,`UI_OPTIONS_ACCOUNTED              = ${matrix.summary.accountedUiOptionCount} / ${matrix.summary.uiOptionCoverageCount}`,`BLOCKING_R01_GAPS                 = ${matrix.summary.blockingGapCount}`,`R02_UI_BINDING_GAPS               = ${matrix.summary.r02UiBindingGapCount}`,`R03_CAPACITY_UNVERIFIED           = ${matrix.summary.capacityUnverifiedCapabilityCount}`,"```","",
    "Slice032 adds exactly one G6B-U01 decimal/fraction conversion KnowledgePoint with two numeric PatternSpecs on Classic, fallback 404 and Pixel. Compare, mixed arithmetic, application, estimation and Global Context remain reserved.","","## Gap classes","","| Gap code | Count | Owner milestone |","|---|---:|---|",
    ...([...byCode.entries()].length ? [...byCode.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([code,count])=>`| \`${code}\` | ${count} | ${code.includes("FALLBACK_404") ? "PGC-R02" : "PGC-R01"} |`) : ["| none | 0 | — |"]),
    "","## Distance update","","```text","GOAL_DISTANCE_BEFORE = D1_SLICE032_RUNTIME_CONNECTED_CURRENT_AUTHORITY_PENDING","GOAL_DISTANCE_AFTER  = D1_SLICE032_CURRENT_R01_AUTHORITY_MATERIALIZED","DISTANCE_REDUCED     = current public capability authority now accounts for exact decimal/fraction conversion on 32 sources / 226 visible KPs","REMAINING_BLOCKERS   = [PGC-R02_CURRENT_BINDING_RECONCILIATION, SLICE032_PRODUCT_ACCEPTANCE]","NEXT_SHORTEST_STEP   = PGC-R02 Slice032 current binding materialization","```","",
  ];
  fs.writeFileSync(gapPath, `${lines.join("\n")}\n`);
}

export function materializePublicGenerationCapabilityMatrixV6() {
  const matrix = buildPublicGenerationCapabilityMatrixV6();
  fs.mkdirSync(outputDir, { recursive:true });
  fs.mkdirSync(docsDir, { recursive:true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`);
  writeCsv(matrix);
  writeReport(matrix);
  return matrix;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const matrix = materializePublicGenerationCapabilityMatrixV6();
  console.log(`PGC_R01_V6_SUMMARY=${JSON.stringify(matrix.summary)}`);
  if (matrix.summary.blockingGapCount > 0) process.exitCode = 2;
}
