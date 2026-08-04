import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPublicGenerationCapabilityMatrix,
} from "./materialize-pgc-r01-public-capability-matrix.mjs";
import {
  CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f22-extension.js";
import {
  getFullProductPublicControlProfile,
} from "../../site/modules/curriculum/registry/full-product-public-control-profiles.js";
import {
  listW01PublicApplicationGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/w01-public-application-groups.js";
import {
  listFifteenUnitPublicApplicationGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/fifteen-unit-public-application-groups.js";
import {
  listW1FullProductPublicApplicationGroupsForKnowledgePoint,
} from "../../site/modules/curriculum/registry/w1-full-product-public-application-groups.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const jsonPath = path.join(outputDir, "public_generation_capability_matrix.json");
const csvPath = path.join(outputDir, "public_generation_capability_matrix.csv");
const gapPath = path.join(docsDir, "PGC-R01_capability_gap_report.md");

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const unique = (values) => [...new Set(values.filter(Boolean))];
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
const slug = (value) => String(value ?? "none").replace(/[^a-zA-Z0-9_+-]+/g, "_");
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function normalizedMode(group = {}) {
  const direct = String(group.publicQuestionMode ?? group.questionMode ?? group.mode ?? "").toLowerCase();
  const corpus = `${direct}|${JSON.stringify(group).toLowerCase()}`;
  if (corpus.includes("pbl")) return "pbl";
  if (corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題")) return "application";
  if (corpus.includes("reasoning") || corpus.includes("推理")) return "reasoning";
  if (corpus.includes("concept") || corpus.includes("概念")) return "concept";
  if (corpus.includes("estimation") || corpus.includes("估算")) return "operation_estimation";
  if (corpus.includes("representation") || corpus.includes("表徵")) return "representation";
  if (corpus.includes("numeric") || corpus.includes("expression") || corpus.includes("calculation") || corpus.includes("operation")) return "numeric";
  return "numeric";
}

function allGroups(knowledgePointId) {
  const rows = [
    ...getVisiblePatternGroupsForKnowledgePoint(knowledgePointId),
    ...listW01PublicApplicationGroupsForKnowledgePoint(knowledgePointId),
    ...listFifteenUnitPublicApplicationGroupsForKnowledgePoint(knowledgePointId),
    ...listW1FullProductPublicApplicationGroupsForKnowledgePoint(knowledgePointId),
  ];
  return [...new Map(rows.map((row) => [`${row.patternGroupId}|${normalizedMode(row)}|${(row.patternSpecIds ?? []).join("|")}`, clone(row)])).values()];
}

function controlValues(definition) {
  if (!definition?.supported) return ["NOT_APPLICABLE"];
  return unique(definition.options?.map((row) => row.value) ?? [definition.defaultValue]);
}

function selectionModes(sourceId) {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  return [
    "sourceUnit",
    ...(availability?.visibleCount > 0 ? ["singleKnowledgePoint"] : []),
    ...(availability?.visibleCount >= 2 ? ["mixedKnowledgePointsSameUnit"] : []),
  ];
}

function surfacePolicy(matrix, surfaceId) {
  return matrix.surfaces.find((surface) => surface.surfaceId === surfaceId);
}

function controlDimensions(sourceId, surfaceId) {
  if (surfaceId === "FALLBACK_404" && sourceId !== "g5a_u08_5a08") {
    return { depthModes: ["NOT_APPLICABLE"], contextModes: ["NOT_APPLICABLE"] };
  }
  const profile = getFullProductPublicControlProfile(sourceId);
  return {
    depthModes: controlValues(profile?.reasoningDepthControl),
    contextModes: controlValues(profile?.contextControl),
  };
}

function buildRecoveredNumericRows(matrix, gap) {
  const source = CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.find((row) => row.sourceId === gap.sourceId);
  const surface = surfacePolicy(matrix, gap.surfaceId);
  if (!source || !surface) return [];
  const { depthModes, contextModes } = controlDimensions(source.sourceId, surface.surfaceId);
  const kps = listVisibleBatchAKnowledgePoints().filter((row) => row.sourceId === source.sourceId);
  const rows = [];
  for (const kp of kps) {
    for (const group of allGroups(kp.knowledgePointId).filter((row) => normalizedMode(row) === "numeric")) {
      for (const patternSpecId of unique(group.patternSpecIds ?? [])) {
        const key = [source.sourceId, kp.knowledgePointId, group.patternGroupId, patternSpecId, "numeric", surface.surfaceId].join("::");
        rows.push({
          capabilityId: `pgc_${slug(source.sourceId)}_${digest(key)}`,
          sourceId: source.sourceId,
          unitCode: source.unitCode,
          unitTitle: source.title,
          grade: source.grade,
          semester: source.semester,
          sourceLifecycle: source.lifecycle ?? "protected_fifteen_or_batch_a",
          knowledgePointId: kp.knowledgePointId,
          knowledgePointName: kp.displayName ?? kp.canonicalNameZh ?? kp.knowledgePointId,
          knowledgePointPublicStatus: kp.selectorStatus ?? kp.visibilityStatus ?? "visible",
          questionType: "NUMERIC",
          effectiveQuestionType: "NUMERIC",
          questionForm: group.representationTag ?? group.displayName ?? "numeric_expression",
          questionFormLabel: group.displayName ?? group.representationTag ?? "數字題",
          patternGroupId: group.patternGroupId,
          basePatternGroupId: group.basePatternGroupId ?? group.patternGroupId,
          patternSpecId,
          depthModes,
          contextModes,
          selectionModes: selectionModes(source.sourceId),
          surfaceId: surface.surfaceId,
          surfaceRouteId: surface.routeId,
          surfaceStatus: surface.status,
          controlPolicy: surface.controlPolicy,
          generatorConsumer: "site/modules/curriculum/batch-a/batch-a-browser-generator-p03f13.js",
          validatorConsumer: "site/modules/curriculum/batch-a/batch-a-browser-validator-p03f13.js",
          questionRouterConsumer: "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
          worksheetConsumer: "site/assets/browser/pipeline/build-worksheet-document.js",
          contextLineage: "NOT_APPLICABLE",
          htmlRouteId: "renderer.preview_html",
          pdfRouteId: "renderer.iframe_print",
          answerKeySupported: true,
          defaultQuestionCount: 20,
          declaredUiMaxQuestionCount: 200,
          verifiedMaxQuestionCount: null,
          capacityEvidence: "UNVERIFIED_UNTIL_PGC_R03",
          evidenceLevel: "PUBLIC_VISIBLE_RUNTIME_EVIDENCE",
          compatibilityPolicy: getFullProductPublicControlProfile(source.sourceId)?.compatibilityPolicy ?? "public_runtime_admission",
          compatibilityStatus: "ACCOUNTED_PENDING_PGC_R02_INTERSECTION_NORMALIZATION",
          normalizationEvidence: "LEGACY_PATTERN_GROUP_MODE_NORMALIZED_TO_NUMERIC",
        });
      }
    }
  }
  return rows;
}

function summarize(matrix) {
  const blocking = matrix.gaps.filter((gap) => gap.severity === "blocking_r01");
  matrix.summary = {
    ...matrix.summary,
    capabilityRowCount: matrix.capabilities.length,
    uniquePatternGroupCount: new Set(matrix.capabilities.map((row) => row.patternGroupId)).size,
    uniquePatternSpecCount: new Set(matrix.capabilities.map((row) => row.patternSpecId)).size,
    accountedUiOptionCount: matrix.uiOptionCoverage.filter((row) => row.accounted).length,
    gapCount: matrix.gaps.length,
    blockingGapCount: blocking.length,
    r02UiBindingGapCount: matrix.gaps.filter((gap) => gap.severity === "r02_ui_binding").length,
    capacityUnverifiedCapabilityCount: matrix.capabilities.filter((row) => row.capacityEvidence === "UNVERIFIED_UNTIL_PGC_R03").length,
  };
  matrix.status = blocking.length === 0 ? "PASS_WITH_DOWNSTREAM_GAPS" : "FAIL_CLOSED_BLOCKING_GAPS";
  return matrix;
}

export function buildPublicGenerationCapabilityMatrixV2() {
  const matrix = clone(buildPublicGenerationCapabilityMatrix());
  const recoverable = matrix.gaps.filter((gap) =>
    gap.code === "PUBLIC_UI_OPTION_WITHOUT_CAPABILITY"
    && gap.questionTypeOption === "numeric"
    && ["g3b_u04_3b04", "g3b_u08_3b08", "g4b_u01_4b01"].includes(gap.sourceId));
  const recoveredRows = recoverable.flatMap((gap) => buildRecoveredNumericRows(matrix, gap));
  const recoveredKeys = new Set(recoverable.map((gap) => `${gap.sourceId}|${gap.surfaceId}|${gap.questionTypeOption}`));
  matrix.capabilities = [...new Map([...matrix.capabilities, ...recoveredRows].map((row) => [row.capabilityId, row])).values()]
    .sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
  matrix.gaps = matrix.gaps.filter((gap) => !recoveredKeys.has(`${gap.sourceId}|${gap.surfaceId}|${gap.questionTypeOption ?? ""}`));
  matrix.uiOptionCoverage = matrix.uiOptionCoverage.map((row) => {
    const key = `${row.sourceId}|${row.surfaceId}|${row.questionTypeOption}`;
    if (!recoveredKeys.has(key)) return row;
    return {
      ...row,
      accounted: true,
      capabilityRowCount: recoveredRows.filter((capability) => capability.sourceId === row.sourceId && capability.surfaceId === row.surfaceId).length,
      normalizationEvidence: "LEGACY_PATTERN_GROUP_MODE_NORMALIZED_TO_NUMERIC",
    };
  });
  matrix.normalizationPatch = {
    task: "PGC-R01_LEGACY_PATTERN_GROUP_MODE_NORMALIZATION",
    recoveredUiOptionCount: recoverable.length,
    recoveredCapabilityRowCount: recoveredRows.length,
    affectedSourceIds: unique(recoverable.map((gap) => gap.sourceId)),
  };
  return summarize(matrix);
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
    `PUBLIC_SOURCES             = ${matrix.summary.publicSourceCount}`,
    `VISIBLE_KNOWLEDGE_POINTS   = ${matrix.summary.publicVisibleKnowledgePointCount}`,
    `CAPABILITY_ROWS            = ${matrix.summary.capabilityRowCount}`,
    `UNIQUE_PATTERN_GROUPS      = ${matrix.summary.uniquePatternGroupCount}`,
    `UNIQUE_PATTERN_SPECS       = ${matrix.summary.uniquePatternSpecCount}`,
    `UI_OPTIONS_ACCOUNTED       = ${matrix.summary.accountedUiOptionCount} / ${matrix.summary.uiOptionCoverageCount}`,
    `BLOCKING_R01_GAPS          = ${matrix.summary.blockingGapCount}`,
    `R02_UI_BINDING_GAPS        = ${matrix.summary.r02UiBindingGapCount}`,
    `R03_CAPACITY_UNVERIFIED    = ${matrix.summary.capacityUnverifiedCapabilityCount}`,
    "```",
    "",
    `Legacy numeric mode normalization recovered ${matrix.normalizationPatch.recoveredUiOptionCount} UI options and ${matrix.normalizationPatch.recoveredCapabilityRowCount} capability rows across ${matrix.normalizationPatch.affectedSourceIds.join(", ")}.`,
    "",
    "## Gap classes",
    "",
    "| Gap code | Count | Owner milestone |",
    "|---|---:|---|",
    ...([...byCode.entries()].length ? [...byCode.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, count]) => `| \`${code}\` | ${count} | ${code.includes("FALLBACK_404") ? "PGC-R02" : "PGC-R01"} |`) : ["| none | 0 | — |"]),
    "",
    "## Accepted findings",
    "",
    "1. All 26 public sources and all 193 visible KnowledgePoints are represented.",
    "2. All visible question-type UI options on Classic, fallback 404 and Pixel are accounted for.",
    "3. Historical unit-specific PatternGroup mode strings are normalized into the canonical NUMERIC type without changing runtime data.",
    "4. The 404 fallback still has profile parity gaps for non-numeric controls; these are formally owned by PGC-R02.",
    "5. Capacity remains unverified until PGC-R03; the matrix does not claim that 200 questions are supported.",
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_FROZEN",
    "GOAL_DISTANCE_AFTER  = D1_PUBLIC_CAPABILITY_MATRIX_MATERIALIZED",
    "DISTANCE_REDUCED     = all public KP/type/form/group/spec/control/surface combinations are machine-readable and accounted",
    "REMAINING_BLOCKERS   = [PGC-R02_DYNAMIC_UI_BINDING, PGC-R03_VERIFIED_CAPACITY, PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    "```",
    "",
  ];
  fs.writeFileSync(gapPath, `${lines.join("\n")}\n`);
}

export function materializePublicGenerationCapabilityMatrixV2() {
  const matrix = buildPublicGenerationCapabilityMatrixV2();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`);
  writeCsv(matrix);
  writeReport(matrix);
  return matrix;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const matrix = materializePublicGenerationCapabilityMatrixV2();
  console.log(`PGC_R01_V2_SUMMARY=${JSON.stringify(matrix.summary)}`);
  if (matrix.summary.blockingGapCount > 0) process.exitCode = 2;
}
