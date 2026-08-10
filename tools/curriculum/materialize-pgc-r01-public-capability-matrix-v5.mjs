import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildPublicGenerationCapabilityMatrixV4 } from "./materialize-pgc-r01-public-capability-matrix-v4.mjs";
import { CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f31-extension.js";
import {
  getFullProductPublicControlProfile,
} from "../../site/modules/curriculum/registry/full-product-public-control-profiles-p03f31.js";
import {
  G5B_U04_P03F31_GROUP_ID,
  G5B_U04_P03F31_KP_ID,
  G5B_U04_P03F31_SOURCE_ID,
  G5B_U04_P03F31_SPEC_ID,
} from "../../site/modules/curriculum/registry/g5b-u04-rank8-decimal-times-integer-selector-projection-p03f31.js";

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

function buildSlice031CapabilityRows(matrix) {
  const source = CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.find((row) => row.sourceId === G5B_U04_P03F31_SOURCE_ID);
  const kp = listVisibleBatchAKnowledgePoints().find((row) => row.knowledgePointId === G5B_U04_P03F31_KP_ID);
  if (!source || !kp) return [];
  const profile = getFullProductPublicControlProfile(source.sourceId);
  return matrix.surfaces.map((surface) => {
    const key = [source.sourceId, G5B_U04_P03F31_KP_ID, G5B_U04_P03F31_GROUP_ID, G5B_U04_P03F31_SPEC_ID, "numeric", surface.surfaceId, "p03f31"].join("::");
    return {
      capabilityId: `pgc_${slug(source.sourceId)}_${digest(key)}`,
      sourceId: source.sourceId,
      unitCode: source.unitCode,
      unitTitle: source.title,
      grade: source.grade,
      semester: source.semester,
      sourceLifecycle: source.lifecycle ?? "public_full_product_w3_slice031_candidate",
      knowledgePointId: G5B_U04_P03F31_KP_ID,
      knowledgePointName: kp.displayName ?? kp.canonicalNameZh ?? "小數乘以整數",
      knowledgePointPublicStatus: kp.selectorStatus ?? kp.visibilityStatus ?? "visible",
      questionType: "NUMERIC",
      effectiveQuestionType: "NUMERIC",
      questionForm: "decimal_multiplication",
      questionFormLabel: "三位小數乘以整數",
      patternGroupId: G5B_U04_P03F31_GROUP_ID,
      basePatternGroupId: G5B_U04_P03F31_GROUP_ID,
      patternSpecId: G5B_U04_P03F31_SPEC_ID,
      depthModes: ["NOT_APPLICABLE"],
      contextModes: ["NOT_APPLICABLE"],
      selectionModes: ["sourceUnit", "singleKnowledgePoint"],
      surfaceId: surface.surfaceId,
      surfaceRouteId: surface.routeId,
      surfaceStatus: surface.status,
      controlPolicy: surface.controlPolicy,
      generatorConsumer: "site/modules/curriculum/batch-a/batch-a-browser-generator-p03f31.js",
      validatorConsumer: "site/modules/curriculum/batch-a/batch-a-browser-validator-p03f31.js",
      questionRouterConsumer: "site/modules/curriculum/batch-a/batch-a-browser-question-router-p03f31.js",
      worksheetConsumer: "site/modules/curriculum/batch-a/batch-a-browser-worksheet-p03f31-extension.js",
      contextLineage: "NOT_APPLICABLE",
      htmlRouteId: "renderer.preview_html",
      pdfRouteId: "renderer.iframe_print",
      answerKeySupported: true,
      defaultQuestionCount: 20,
      declaredUiMaxQuestionCount: 200,
      verifiedMaxQuestionCount: null,
      capacityEvidence: "UNVERIFIED_UNTIL_PGC_R03",
      evidenceLevel: "PUBLIC_CANDIDATE_WITH_ACCEPTANCE_EVIDENCE",
      compatibilityPolicy: profile?.compatibilityPolicy ?? "w3_slice031_decimal_times_integer_numeric_only_future_application_reserved",
      compatibilityStatus: "ACCOUNTED_PENDING_PGC_R02_INTERSECTION_NORMALIZATION",
      normalizationEvidence: "P03F31_DECIMAL_TIMES_INTEGER_DIRECT_NUMERIC_BINDING",
    };
  });
}

function visiblePairAccounting(matrix) {
  const visibleKnowledgePointIds = new Set(listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId));
  const expectedPairs = new Set();
  for (const knowledgePointId of visibleKnowledgePointIds) {
    for (const surface of matrix.surfaces) expectedPairs.add(`${knowledgePointId}|${surface.surfaceId}`);
  }
  const capabilityPairs = new Set(matrix.capabilities
    .filter((row) => visibleKnowledgePointIds.has(row.knowledgePointId))
    .map((row) => `${row.knowledgePointId}|${row.surfaceId}`));
  const explicitGapPairs = new Set(matrix.gaps
    .filter((gap) => gap.code === "FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY")
    .map((gap) => `${gap.knowledgePointId}|${gap.surfaceId}`));
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

export function buildPublicGenerationCapabilityMatrixV5() {
  const matrix = clone(buildPublicGenerationCapabilityMatrixV4());
  const sliceRows = buildSlice031CapabilityRows(matrix);
  matrix.capabilities = [...new Map([...matrix.capabilities, ...sliceRows].map((row) => [row.capabilityId, row])).values()]
    .sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));

  matrix.gaps = matrix.gaps.filter((gap) => !(
    gap.code === "PUBLIC_SOURCE_WITHOUT_VISIBLE_KP"
    && gap.sourceId === G5B_U04_P03F31_SOURCE_ID
  ));
  matrix.uiOptionCoverage = matrix.uiOptionCoverage.filter((row) => row.sourceId !== G5B_U04_P03F31_SOURCE_ID);
  for (const surface of matrix.surfaces) {
    matrix.uiOptionCoverage.push({
      sourceId: G5B_U04_P03F31_SOURCE_ID,
      surfaceId: surface.surfaceId,
      questionTypeOption: "numeric",
      capabilityRowCount: 1,
      accounted: true,
      normalizationEvidence: "P03F31_DECIMAL_TIMES_INTEGER_DIRECT_NUMERIC_BINDING",
    });
  }
  matrix.uiOptionCoverage.sort((a, b) => `${a.sourceId}|${a.surfaceId}|${a.questionTypeOption}`.localeCompare(`${b.sourceId}|${b.surfaceId}|${b.questionTypeOption}`));

  matrix.gaps = matrix.gaps.filter((gap) => ![
    "PUBLIC_KP_SURFACE_UNACCOUNTED",
    "PUBLIC_KP_SURFACE_ACCOUNTING_UNEXPECTED_PAIR",
  ].includes(gap.code));
  const accounting = visiblePairAccounting(matrix);
  for (const pair of accounting.unaccountedPairs) {
    const [knowledgePointId, surfaceId] = pair.split("|");
    matrix.gaps.push({ code:"PUBLIC_KP_SURFACE_UNACCOUNTED", severity:"blocking_r01", knowledgePointId, surfaceId });
  }
  for (const pair of accounting.unexpectedPairs) {
    matrix.gaps.push({ code:"PUBLIC_KP_SURFACE_ACCOUNTING_UNEXPECTED_PAIR", severity:"blocking_r01", pair });
  }

  const visibleKnowledgePoints = listVisibleBatchAKnowledgePoints();
  const blockingGaps = matrix.gaps.filter((gap) => gap.severity === "blocking_r01");
  matrix.summary = {
    ...matrix.summary,
    publicSourceCount: CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length,
    publicVisibleKnowledgePointCount: visibleKnowledgePoints.length,
    publicSelectorVisibleCount: visibleKnowledgePoints.length,
    capabilityRowCount: matrix.capabilities.length,
    uniquePatternGroupCount: new Set(matrix.capabilities.map((row) => row.patternGroupId)).size,
    uniquePatternSpecCount: new Set(matrix.capabilities.map((row) => row.patternSpecId)).size,
    uiOptionCoverageCount: matrix.uiOptionCoverage.length,
    accountedUiOptionCount: matrix.uiOptionCoverage.filter((row) => row.accounted).length,
    gapCount: matrix.gaps.length,
    blockingGapCount: blockingGaps.length,
    r02UiBindingGapCount: matrix.gaps.filter((gap) => gap.severity === "r02_ui_binding").length,
    capacityUnverifiedCapabilityCount: matrix.capabilities.filter((row) => row.capacityEvidence === "UNVERIFIED_UNTIL_PGC_R03").length,
    kpSurfacePairCount: new Set(matrix.capabilities.map((row) => `${row.knowledgePointId}|${row.surfaceId}`)).size,
    expectedKpSurfacePairCount: visibleKnowledgePoints.length * matrix.surfaces.length,
    visibleKpSurfaceExpectedPairCount: accounting.expectedPairCount,
    visibleKpSurfaceCapabilityPairCount: accounting.capabilityPairCount,
    visibleKpSurfaceExplicitGapPairCount: accounting.explicitGapPairCount,
    visibleKpSurfaceAccountedPairCount: accounting.accountedPairCount,
    visibleKpSurfaceUnaccountedPairCount: accounting.unaccountedPairs.length,
  };
  matrix.matrixVersion = "pgc-r01-public-capability-matrix-v5";
  matrix.selectorAuthority = "batch-a-selector-p03f31-extension.js";
  matrix.currentAuthorityPatch = {
    task: "P03F_W3DirectProductVerticalSlice031Implementation",
    sourceId: G5B_U04_P03F31_SOURCE_ID,
    knowledgePointId: G5B_U04_P03F31_KP_ID,
    addedCapabilityRowCount: sliceRows.length,
    arithmeticModel: "COEFFICIENT_PRODUCT_SCALE_SUM",
    applicationExpansionAllowed: false,
  };
  matrix.status = blockingGaps.length === 0 ? "PASS_WITH_DOWNSTREAM_GAPS" : "FAIL_CLOSED_BLOCKING_GAPS";
  return matrix;
}

function writeCsv(matrix) {
  const columns = [
    "capabilityId", "sourceId", "unitCode", "unitTitle", "grade", "semester",
    "knowledgePointId", "knowledgePointName", "questionType", "effectiveQuestionType",
    "questionForm", "questionFormLabel", "patternGroupId", "basePatternGroupId", "patternSpecId",
    "depthModes", "contextModes", "selectionModes", "surfaceId", "surfaceRouteId", "surfaceStatus",
    "generatorConsumer", "validatorConsumer", "contextLineage", "htmlRouteId", "pdfRouteId",
    "defaultQuestionCount", "declaredUiMaxQuestionCount", "verifiedMaxQuestionCount",
    "capacityEvidence", "evidenceLevel", "compatibilityPolicy", "compatibilityStatus", "normalizationEvidence",
  ];
  const lines = [columns.join(",")];
  for (const row of matrix.capabilities) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function writeReport(matrix) {
  const byCode = new Map();
  for (const gap of matrix.gaps) byCode.set(gap.code, (byCode.get(gap.code) ?? 0) + 1);
  const lines = [
    "# PGC-R01 Capability Gap Report",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R01_PublicKnowledgePointCapabilityMatrix",
    `STATUS     = ${matrix.status}`,
    "```",
    "",
    "## Matrix summary",
    "",
    "```text",
    `PUBLIC_SOURCES                    = ${matrix.summary.publicSourceCount}`,
    `VISIBLE_KNOWLEDGE_POINTS          = ${matrix.summary.publicVisibleKnowledgePointCount}`,
    `VISIBLE_KP_SURFACE_ACCOUNTED      = ${matrix.summary.visibleKpSurfaceAccountedPairCount} / ${matrix.summary.visibleKpSurfaceExpectedPairCount}`,
    `CAPABILITY_ROWS                   = ${matrix.summary.capabilityRowCount}`,
    `UNIQUE_PATTERN_GROUPS             = ${matrix.summary.uniquePatternGroupCount}`,
    `UNIQUE_PATTERN_SPECS              = ${matrix.summary.uniquePatternSpecCount}`,
    `UI_OPTIONS_ACCOUNTED              = ${matrix.summary.accountedUiOptionCount} / ${matrix.summary.uiOptionCoverageCount}`,
    `BLOCKING_R01_GAPS                 = ${matrix.summary.blockingGapCount}`,
    `R02_UI_BINDING_GAPS               = ${matrix.summary.r02UiBindingGapCount}`,
    `R03_CAPACITY_UNVERIFIED           = ${matrix.summary.capacityUnverifiedCapabilityCount}`,
    "```",
    "",
    "Slice031 adds one source-backed numeric decimal-times-integer KnowledgePoint on Classic, fallback 404 and Pixel without admitting integer-times-decimal, decimal-times-decimal, application, estimation, depth or context surfaces.",
    "",
    "## Gap classes",
    "",
    "| Gap code | Count | Owner milestone |",
    "|---|---:|---|",
    ...([...byCode.entries()].length ? [...byCode.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, count]) => `| \`${code}\` | ${count} | ${code.includes("FALLBACK_404") ? "PGC-R02" : "PGC-R01"} |`) : ["| none | 0 | — |"]),
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_SLICE031_SOURCE_BACKED_RUNTIME_CANDIDATE",
    "GOAL_DISTANCE_AFTER  = D1_SLICE031_CURRENT_R01_AUTHORITY_MATERIALIZED",
    "DISTANCE_REDUCED     = current public source/KP capability authority now accounts for the Slice031 decimal-times-integer surface",
    "REMAINING_BLOCKERS   = [PGC-R02_CURRENT_BINDING_RECONCILIATION, SLICE031_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R02 Slice031 current binding materialization",
    "```",
    "",
  ];
  fs.writeFileSync(gapPath, `${lines.join("\n")}\n`);
}

export function materializePublicGenerationCapabilityMatrixV5() {
  const matrix = buildPublicGenerationCapabilityMatrixV5();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`);
  writeCsv(matrix);
  writeReport(matrix);
  return matrix;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const matrix = materializePublicGenerationCapabilityMatrixV5();
  console.log(`PGC_R01_V5_SUMMARY=${JSON.stringify(matrix.summary)}`);
  if (matrix.summary.blockingGapCount > 0) process.exitCode = 2;
}
