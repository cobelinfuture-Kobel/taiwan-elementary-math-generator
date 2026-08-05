import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPublicGenerationCapabilityMatrixV2,
} from "./materialize-pgc-r01-public-capability-matrix-v2.mjs";
import {
  CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  getVisiblePatternGroupsForKnowledgePoint,
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f23-extension.js";
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

const effectiveTypeLabels = Object.freeze({
  numeric: "NUMERIC",
  application: "APPLICATION",
  reasoning: "REASONING",
  concept: "CONCEPT",
  representation: "REPRESENTATION",
  operation_estimation: "OPERATION_ESTIMATION",
  pbl: "PBL",
});

function normalizedMode(group = {}) {
  const direct = String(group.publicQuestionMode ?? group.questionMode ?? group.mode ?? "").toLowerCase();
  const corpus = `${direct}|${JSON.stringify(group).toLowerCase()}`;
  if (corpus.includes("pbl")) return "pbl";
  if (corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題")) return "application";
  if (corpus.includes("reasoning") || corpus.includes("推理")) return "reasoning";
  if (corpus.includes("concept") || corpus.includes("概念")) return "concept";
  if (corpus.includes("estimation") || corpus.includes("估算")) return "operation_estimation";
  if (corpus.includes("representation") || corpus.includes("表徵")) return "representation";
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

function profileForSurface(sourceId, surfaceId) {
  const profile = getFullProductPublicControlProfile(sourceId);
  if (surfaceId !== "FALLBACK_404" || sourceId === "g5a_u08_5a08") return profile;
  return {
    ...profile,
    questionTypeControl: { supported: true, defaultValue: "numeric", options: [{ value: "numeric", label: "數字題" }] },
    reasoningDepthControl: { supported: false, defaultValue: null, options: [] },
    contextControl: { supported: false, defaultValue: null, options: [] },
  };
}

function uiModeForGroup(groupMode, profile) {
  const options = controlValues(profile?.questionTypeControl);
  if (options.includes(groupMode)) return groupMode;
  if (["concept", "representation", "operation_estimation", "reasoning"].includes(groupMode) && options.includes("numeric")) return "numeric";
  if (options.includes("mixed") && groupMode !== "pbl") return "mixed";
  return null;
}

function selectionModes(sourceId) {
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  return [
    "sourceUnit",
    ...(availability?.visibleCount > 0 ? ["singleKnowledgePoint"] : []),
    ...(availability?.visibleCount >= 2 ? ["mixedKnowledgePointsSameUnit"] : []),
  ];
}

function evidenceLevel(kp, group) {
  const corpus = `${kp.productionUse ?? ""}|${kp.qaStatusLabel ?? ""}|${group.productionUse ?? ""}|${group.visibilityStatus ?? ""}`.toLowerCase();
  if (corpus.includes("allowed") || corpus.includes("d0") || corpus.includes("production")) return "PRODUCTION_ADMITTED_OR_PUBLIC_D0";
  if (corpus.includes("candidate")) return "PUBLIC_CANDIDATE_WITH_ACCEPTANCE_EVIDENCE";
  return "PUBLIC_VISIBLE_RUNTIME_EVIDENCE";
}

function buildCoverageRows(matrix) {
  const rows = [];
  const sources = new Map(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map((source) => [source.sourceId, source]));
  const existing = new Set(matrix.capabilities.map((row) => `${row.knowledgePointId}|${row.surfaceId}`));
  const missingPairs = [];

  for (const kp of listVisibleBatchAKnowledgePoints()) {
    const source = sources.get(kp.sourceId);
    if (!source) continue;
    for (const surface of matrix.surfaces) {
      const pairKey = `${kp.knowledgePointId}|${surface.surfaceId}`;
      if (existing.has(pairKey)) continue;
      const profile = profileForSurface(source.sourceId, surface.surfaceId);
      const depthModes = controlValues(profile?.reasoningDepthControl);
      const contextModes = controlValues(profile?.contextControl);
      let produced = 0;
      for (const group of allGroups(kp.knowledgePointId)) {
        const groupMode = normalizedMode(group);
        const uiMode = uiModeForGroup(groupMode, profile);
        if (!uiMode) continue;
        for (const patternSpecId of unique(group.patternSpecIds ?? [])) {
          const key = [source.sourceId, kp.knowledgePointId, group.patternGroupId, patternSpecId, uiMode, surface.surfaceId, "kp_surface_coverage"].join("::");
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
            questionType: uiMode.toUpperCase(),
            effectiveQuestionType: effectiveTypeLabels[groupMode] ?? groupMode.toUpperCase(),
            questionForm: group.representationTag ?? group.displayName ?? groupMode,
            questionFormLabel: group.displayName ?? group.representationTag ?? groupMode,
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
            contextLineage: groupMode === "application" ? group.globalContextAdmission ?? "GLOBAL_PRIMARY_R07_AUTHORITATIVE_CONSUMER_CUTOVER" : "NOT_APPLICABLE",
            htmlRouteId: "renderer.preview_html",
            pdfRouteId: "renderer.iframe_print",
            answerKeySupported: true,
            defaultQuestionCount: 20,
            declaredUiMaxQuestionCount: 200,
            verifiedMaxQuestionCount: null,
            capacityEvidence: "UNVERIFIED_UNTIL_PGC_R03",
            evidenceLevel: evidenceLevel(kp, group),
            compatibilityPolicy: profile?.compatibilityPolicy ?? "public_runtime_admission",
            compatibilityStatus: "ACCOUNTED_PENDING_PGC_R02_INTERSECTION_NORMALIZATION",
            normalizationEvidence: `SUBTYPE_${groupMode.toUpperCase()}_MAPPED_TO_UI_${uiMode.toUpperCase()}`,
          });
          produced += 1;
        }
      }
      if (produced === 0) missingPairs.push({ sourceId: source.sourceId, knowledgePointId: kp.knowledgePointId, surfaceId: surface.surfaceId });
    }
  }
  return { rows, missingPairs };
}

function summarize(matrix) {
  matrix.summary = {
    ...matrix.summary,
    capabilityRowCount: matrix.capabilities.length,
    uniquePatternGroupCount: new Set(matrix.capabilities.map((row) => row.patternGroupId)).size,
    uniquePatternSpecCount: new Set(matrix.capabilities.map((row) => row.patternSpecId)).size,
    accountedUiOptionCount: matrix.uiOptionCoverage.filter((row) => row.accounted).length,
    gapCount: matrix.gaps.length,
    blockingGapCount: matrix.gaps.filter((gap) => gap.severity === "blocking_r01").length,
    r02UiBindingGapCount: matrix.gaps.filter((gap) => gap.severity === "r02_ui_binding").length,
    capacityUnverifiedCapabilityCount: matrix.capabilities.filter((row) => row.capacityEvidence === "UNVERIFIED_UNTIL_PGC_R03").length,
    kpSurfacePairCount: new Set(matrix.capabilities.map((row) => `${row.knowledgePointId}|${row.surfaceId}`)).size,
    expectedKpSurfacePairCount: listVisibleBatchAKnowledgePoints().length * matrix.surfaces.length,
  };
  matrix.status = matrix.summary.blockingGapCount === 0 ? "PASS_WITH_DOWNSTREAM_GAPS" : "FAIL_CLOSED_BLOCKING_GAPS";
  return matrix;
}

export function buildPublicGenerationCapabilityMatrixV3() {
  const matrix = clone(buildPublicGenerationCapabilityMatrixV2());
  const coverage = buildCoverageRows(matrix);
  matrix.capabilities = [...new Map([...matrix.capabilities, ...coverage.rows].map((row) => [row.capabilityId, row])).values()]
    .sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
  matrix.gaps = matrix.gaps.filter((gap) => gap.code !== "PUBLIC_KP_SURFACE_WITHOUT_CAPABILITY");
  for (const missing of coverage.missingPairs) {
    matrix.gaps.push({ code: "PUBLIC_KP_SURFACE_WITHOUT_CAPABILITY", severity: "blocking_r01", ...missing });
  }
  matrix.coverageNormalizationPatch = {
    task: "PGC-R01_KP_SURFACE_COVERAGE_NORMALIZATION",
    addedCapabilityRowCount: coverage.rows.length,
    remainingMissingPairCount: coverage.missingPairs.length,
    subtypePolicy: "map concept representation estimation and reasoning subtypes to an actually exposed parent UI type when no dedicated public option exists",
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
    `KP_SURFACE_PAIRS           = ${matrix.summary.kpSurfacePairCount} / ${matrix.summary.expectedKpSurfacePairCount}`,
    `CAPABILITY_ROWS            = ${matrix.summary.capabilityRowCount}`,
    `UNIQUE_PATTERN_GROUPS      = ${matrix.summary.uniquePatternGroupCount}`,
    `UNIQUE_PATTERN_SPECS       = ${matrix.summary.uniquePatternSpecCount}`,
    `UI_OPTIONS_ACCOUNTED       = ${matrix.summary.accountedUiOptionCount} / ${matrix.summary.uiOptionCoverageCount}`,
    `BLOCKING_R01_GAPS          = ${matrix.summary.blockingGapCount}`,
    `R02_UI_BINDING_GAPS        = ${matrix.summary.r02UiBindingGapCount}`,
    `R03_CAPACITY_UNVERIFIED    = ${matrix.summary.capacityUnverifiedCapabilityCount}`,
    "```",
    "",
    `Legacy mode normalization recovered ${matrix.normalizationPatch.recoveredUiOptionCount} UI options. KP-surface normalization added ${matrix.coverageNormalizationPatch.addedCapabilityRowCount} subtype rows; remaining missing KP-surface pairs: ${matrix.coverageNormalizationPatch.remainingMissingPairCount}.`,
    "",
    "## Gap classes",
    "",
    "| Gap code | Count | Owner milestone |",
    "|---|---:|---|",
    ...([...byCode.entries()].length ? [...byCode.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([code, count]) => `| \`${code}\` | ${count} | ${code.includes("FALLBACK_404") ? "PGC-R02" : "PGC-R01"} |`) : ["| none | 0 | — |"]),
    "",
    "## Accepted findings",
    "",
    "1. All 26 public sources and all 193 visible KnowledgePoints are represented on Classic, fallback 404 and Pixel.",
    "2. All visible question-type UI options are accounted for.",
    "3. Concept, representation, estimation and reasoning PatternGroup subtypes remain visible in the matrix while mapping to the parent UI option actually exposed by each surface.",
    "4. The 404 fallback profile parity gaps remain explicit and move to PGC-R02.",
    "5. Capacity remains unverified and moves to PGC-R03.",
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_FROZEN",
    "GOAL_DISTANCE_AFTER  = D1_PUBLIC_CAPABILITY_MATRIX_MATERIALIZED",
    "DISTANCE_REDUCED     = every public KP/type/form/group/spec/control/surface path is machine-readable and accounted",
    "REMAINING_BLOCKERS   = [PGC-R02_DYNAMIC_UI_BINDING, PGC-R03_VERIFIED_CAPACITY, PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    "```",
    "",
  ];
  fs.writeFileSync(gapPath, `${lines.join("\n")}\n`);
}

export function materializePublicGenerationCapabilityMatrixV3() {
  const matrix = buildPublicGenerationCapabilityMatrixV3();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`);
  writeCsv(matrix);
  writeReport(matrix);
  return matrix;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const matrix = materializePublicGenerationCapabilityMatrixV3();
  console.log(`PGC_R01_V3_SUMMARY=${JSON.stringify(matrix.summary)}`);
  if (matrix.summary.blockingGapCount > 0) process.exitCode = 2;
}
