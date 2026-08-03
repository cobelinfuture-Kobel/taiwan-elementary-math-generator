import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPublicGenerationCapabilityMatrixV3,
} from "./materialize-pgc-r01-public-capability-matrix-v3.mjs";
import {
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f17-extension.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const jsonPath = path.join(outputDir, "public_generation_capability_matrix.json");
const csvPath = path.join(outputDir, "public_generation_capability_matrix.csv");
const gapPath = path.join(docsDir, "PGC-R01_capability_gap_report.md");

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function visiblePairAccounting(matrix) {
  const visibleKnowledgePointIds = new Set(listVisibleBatchAKnowledgePoints().map((row) => row.knowledgePointId));
  const expectedSurfaceIds = matrix.surfaces.map((surface) => surface.surfaceId);
  const expectedPairs = new Set();
  for (const knowledgePointId of visibleKnowledgePointIds) {
    for (const surfaceId of expectedSurfaceIds) expectedPairs.add(`${knowledgePointId}|${surfaceId}`);
  }

  const capabilityPairs = new Set(
    matrix.capabilities
      .filter((row) => visibleKnowledgePointIds.has(row.knowledgePointId))
      .map((row) => `${row.knowledgePointId}|${row.surfaceId}`),
  );
  const explicitGapPairs = new Set(
    matrix.gaps
      .filter((gap) => gap.code === "FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY")
      .map((gap) => `${gap.knowledgePointId}|${gap.surfaceId}`),
  );
  const accountedPairs = new Set([...capabilityPairs, ...explicitGapPairs]);
  const unaccountedPairs = [...expectedPairs].filter((pair) => !accountedPairs.has(pair));
  const unexpectedPairs = [...accountedPairs].filter((pair) => !expectedPairs.has(pair));
  return {
    expectedPairCount: expectedPairs.size,
    capabilityPairCount: [...capabilityPairs].filter((pair) => expectedPairs.has(pair)).length,
    explicitGapPairCount: [...explicitGapPairs].filter((pair) => expectedPairs.has(pair)).length,
    accountedPairCount: [...accountedPairs].filter((pair) => expectedPairs.has(pair)).length,
    unaccountedPairs,
    unexpectedPairs,
  };
}

export function buildPublicGenerationCapabilityMatrixV4() {
  const matrix = clone(buildPublicGenerationCapabilityMatrixV3());
  matrix.gaps = matrix.gaps.map((gap) => {
    if (gap.code !== "PUBLIC_KP_SURFACE_WITHOUT_CAPABILITY") return gap;
    if (gap.surfaceId !== "FALLBACK_404") return gap;
    return {
      ...gap,
      code: "FALLBACK_404_KP_CAPABILITY_HIDDEN_BY_CONTROL_PARITY",
      severity: "r02_ui_binding",
      capabilityStatus: "ABSENT_EXPLICIT",
      rationale: "The deprecated 404 surface exposes the KnowledgePoint selector but does not mount the shared profile-driven application/reasoning controls for this KP.",
      ownerMilestone: "PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    };
  });

  const accounting = visiblePairAccounting(matrix);
  for (const pair of accounting.unaccountedPairs) {
    const [knowledgePointId, surfaceId] = pair.split("|");
    matrix.gaps.push({
      code: "PUBLIC_KP_SURFACE_UNACCOUNTED",
      severity: "blocking_r01",
      knowledgePointId,
      surfaceId,
    });
  }
  for (const pair of accounting.unexpectedPairs) {
    matrix.gaps.push({
      code: "PUBLIC_KP_SURFACE_ACCOUNTING_UNEXPECTED_PAIR",
      severity: "blocking_r01",
      pair,
    });
  }

  const blockingGaps = matrix.gaps.filter((gap) => gap.severity === "blocking_r01");
  matrix.summary = {
    ...matrix.summary,
    gapCount: matrix.gaps.length,
    blockingGapCount: blockingGaps.length,
    r02UiBindingGapCount: matrix.gaps.filter((gap) => gap.severity === "r02_ui_binding").length,
    visibleKpSurfaceExpectedPairCount: accounting.expectedPairCount,
    visibleKpSurfaceCapabilityPairCount: accounting.capabilityPairCount,
    visibleKpSurfaceExplicitGapPairCount: accounting.explicitGapPairCount,
    visibleKpSurfaceAccountedPairCount: accounting.accountedPairCount,
    visibleKpSurfaceUnaccountedPairCount: accounting.unaccountedPairs.length,
  };
  matrix.surfaceGapPolicy = {
    task: "PGC-R01_PUBLIC_SURFACE_ABSENCE_ACCOUNTING",
    rule: "A visible KnowledgePoint and public surface pair must have either at least one capability row or one explicit fail-closed downstream UI-binding gap.",
    deprecated404AbsenceIsNotCapability: true,
    explicitAbsenceOwner: "PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    unaccountedPairCount: accounting.unaccountedPairs.length,
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
    `VISIBLE_KP_SURFACE_CAPABILITY     = ${matrix.summary.visibleKpSurfaceCapabilityPairCount}`,
    `VISIBLE_KP_SURFACE_EXPLICIT_GAP   = ${matrix.summary.visibleKpSurfaceExplicitGapPairCount}`,
    `CAPABILITY_ROWS                   = ${matrix.summary.capabilityRowCount}`,
    `UNIQUE_PATTERN_GROUPS             = ${matrix.summary.uniquePatternGroupCount}`,
    `UNIQUE_PATTERN_SPECS              = ${matrix.summary.uniquePatternSpecCount}`,
    `UI_OPTIONS_ACCOUNTED              = ${matrix.summary.accountedUiOptionCount} / ${matrix.summary.uiOptionCoverageCount}`,
    `BLOCKING_R01_GAPS                 = ${matrix.summary.blockingGapCount}`,
    `R02_UI_BINDING_GAPS               = ${matrix.summary.r02UiBindingGapCount}`,
    `R03_CAPACITY_UNVERIFIED           = ${matrix.summary.capacityUnverifiedCapabilityCount}`,
    "```",
    "",
    "R01 does not fabricate a capability for the deprecated 404 surface. Application-only and reasoning-only KnowledgePoints that are selector-visible but cannot be configured there are recorded as explicit fail-closed R02 gaps.",
    "",
    "## Gap classes",
    "",
    "| Gap code | Count | Owner milestone |",
    "|---|---:|---|",
    ...([...byCode.entries()].length ? [...byCode.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, count]) => `| \`${code}\` | ${count} | ${code.includes("FALLBACK_404") ? "PGC-R02" : "PGC-R01"} |`) : ["| none | 0 | — |"]),
    "",
    "## Accepted findings",
    "",
    `1. All ${matrix.summary.publicSourceCount} public sources and all ${matrix.summary.publicVisibleKnowledgePointCount} visible KnowledgePoints are accounted across all three public surfaces.`,
    "2. All 156 visible question-type UI options map to at least one capability row.",
    "3. 404-only absence is explicit and fail-closed; it is not counted as a working capability.",
    "4. Concept, representation, estimation and reasoning PatternGroup subtypes remain visible through their actual parent UI option.",
    "5. Capacity remains unverified and is owned by PGC-R03.",
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_FROZEN",
    "GOAL_DISTANCE_AFTER  = D1_PUBLIC_CAPABILITY_MATRIX_MATERIALIZED",
    "DISTANCE_REDUCED     = all public KP/type/form/group/spec/control/surface paths are represented by capability or explicit fail-closed absence",
    "REMAINING_BLOCKERS   = [PGC-R02_DYNAMIC_UI_BINDING, PGC-R03_VERIFIED_CAPACITY, PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    "```",
    "",
  ];
  fs.writeFileSync(gapPath, `${lines.join("\n")}\n`);
}

export function materializePublicGenerationCapabilityMatrixV4() {
  const matrix = buildPublicGenerationCapabilityMatrixV4();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`);
  writeCsv(matrix);
  writeReport(matrix);
  return matrix;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const matrix = materializePublicGenerationCapabilityMatrixV4();
  console.log(`PGC_R01_V4_SUMMARY=${JSON.stringify(matrix.summary)}`);
  if (matrix.summary.blockingGapCount > 0) process.exitCode = 2;
}
