import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  BATCH_A_SELECTOR_AVAILABILITY,
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
import {
  buildFifteenUnitPublicPblGeneratedItems,
  isFifteenUnitPublicPblSource,
} from "../../site/modules/curriculum/public/fifteen-unit-public-pbl-runtime.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const jsonPath = path.join(outputDir, "public_generation_capability_matrix.json");
const csvPath = path.join(outputDir, "public_generation_capability_matrix.csv");
const gapPath = path.join(docsDir, "PGC-R01_capability_gap_report.md");

const PROGRAM_ID = "PUBLIC_KP_GENERATION_CONFORMANCE_V1";
const TASK_ID = "PGC-R01_PublicKnowledgePointCapabilityMatrix";
const DEFAULT_QUESTION_COUNT = 20;
const DECLARED_UI_MAX = 200;

const surfaces = Object.freeze([
  Object.freeze({
    surfaceId: "CLASSIC",
    routeId: "surface.classic.index",
    status: "PUBLIC_ACTIVE",
    controlPolicy: "PROFILE_DRIVEN",
  }),
  Object.freeze({
    surfaceId: "FALLBACK_404",
    routeId: "surface.classic.404_fallback",
    status: "PUBLIC_DEPRECATED",
    controlPolicy: "G5A_U08_STATIC_ELSE_DEFAULT_NUMERIC",
  }),
  Object.freeze({
    surfaceId: "PIXEL",
    routeId: "surface.pixel.beta",
    status: "PUBLIC_ACTIVE",
    controlPolicy: "PROFILE_DRIVEN",
  }),
]);

const typeLabels = Object.freeze({
  mixed: "MIXED",
  numeric: "NUMERIC",
  application: "APPLICATION",
  reasoning: "REASONING",
  pbl: "PBL",
  concept: "CONCEPT",
  representation: "REPRESENTATION",
  operation_estimation: "OPERATION_ESTIMATION",
});

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const unique = (values) => [...new Set(values.filter((value) => value != null && value !== ""))];
const slug = (value) => String(value ?? "none").replace(/[^a-zA-Z0-9_+-]+/g, "_");
const digest = (value) => crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function publicGroupMode(group = {}) {
  const direct = String(group.publicQuestionMode ?? group.questionMode ?? group.mode ?? "").toLowerCase();
  if (direct && direct !== "mixed") return direct;
  const corpus = JSON.stringify(group).toLowerCase();
  if (corpus.includes("pbl")) return "pbl";
  if (corpus.includes("application") || corpus.includes("word_problem") || corpus.includes("應用題")) return "application";
  if (corpus.includes("reasoning") || corpus.includes("推理")) return "reasoning";
  if (corpus.includes("concept") || corpus.includes("概念")) return "concept";
  if (corpus.includes("estimation") || corpus.includes("估算")) return "operation_estimation";
  if (corpus.includes("representation") || corpus.includes("表徵")) return "representation";
  return direct || "numeric";
}

function groupMatchesUiMode(group, uiMode) {
  const mode = publicGroupMode(group);
  if (uiMode === "mixed") return mode !== "pbl";
  if (uiMode === mode) return true;
  const corpus = JSON.stringify(group).toLowerCase();
  if (uiMode === "numeric") return mode === "numeric" && !corpus.includes("application");
  if (uiMode === "application") return mode === "application";
  if (uiMode === "reasoning") return mode === "reasoning" || corpus.includes("reasoning") || corpus.includes("推理");
  if (uiMode === "concept") return mode === "concept" || corpus.includes("concept") || corpus.includes("概念");
  if (uiMode === "representation") return mode === "representation" || corpus.includes("representation") || corpus.includes("表徵");
  if (uiMode === "operation_estimation") return mode === "operation_estimation" || corpus.includes("estimation") || corpus.includes("估算");
  return false;
}

function controlValues(definition, fallback = "NOT_APPLICABLE") {
  if (!definition?.supported) return [fallback];
  return unique(definition.options?.map((row) => row.value) ?? [definition.defaultValue]);
}

function surfaceProfile(sourceId, surface) {
  const profile = getFullProductPublicControlProfile(sourceId);
  if (!profile) return null;
  if (surface.surfaceId !== "FALLBACK_404") return profile;
  if (sourceId === "g5a_u08_5a08") return profile;
  return {
    ...profile,
    questionTypeControl: {
      supported: true,
      partial: true,
      defaultValue: "numeric",
      options: [{ value: "numeric", label: "數字題" }],
    },
    reasoningDepthControl: { supported: false, partial: false, defaultValue: null, options: [] },
    contextControl: { supported: false, partial: false, defaultValue: null, options: [] },
    compatibilityPolicy: "fallback_404_default_numeric_without_shared_public_control_mount",
  };
}

function allGroupsForKnowledgePoint(knowledgePointId) {
  const rows = [
    ...getVisiblePatternGroupsForKnowledgePoint(knowledgePointId),
    ...listW01PublicApplicationGroupsForKnowledgePoint(knowledgePointId),
    ...listFifteenUnitPublicApplicationGroupsForKnowledgePoint(knowledgePointId),
    ...listW1FullProductPublicApplicationGroupsForKnowledgePoint(knowledgePointId),
  ];
  const byIdentity = new Map();
  for (const row of rows) {
    const identity = `${row.patternGroupId ?? "missing"}|${publicGroupMode(row)}|${(row.patternSpecIds ?? []).join("|")}`;
    if (!byIdentity.has(identity)) byIdentity.set(identity, clone(row));
  }
  return [...byIdentity.values()];
}

function pblCapabilitySeed(sourceId) {
  if (!isFifteenUnitPublicPblSource(sourceId)) return null;
  const generated = buildFifteenUnitPublicPblGeneratedItems({
    sourceId,
    questionCount: 1,
    generationSeed: "pgc-r01-capability-seed",
  });
  if (!generated.ok || generated.generatedItems.length !== 1) return null;
  return generated.generatedItems[0];
}

function evidenceLevel(kp, group) {
  const corpus = `${kp.productionUse ?? ""}|${kp.qaStatusLabel ?? ""}|${group.productionUse ?? ""}|${group.visibilityStatus ?? ""}`.toLowerCase();
  if (corpus.includes("allowed") || corpus.includes("d0") || corpus.includes("production")) return "PRODUCTION_ADMITTED_OR_PUBLIC_D0";
  if (corpus.includes("candidate")) return "PUBLIC_CANDIDATE_WITH_ACCEPTANCE_EVIDENCE";
  return "PUBLIC_VISIBLE_RUNTIME_EVIDENCE";
}

function selectionModes(sourceId, isPbl = false) {
  if (isPbl) return ["sourceUnit"];
  const availability = listBatchAKnowledgePointAvailabilityBySource(sourceId);
  return [
    "sourceUnit",
    ...(availability?.visibleCount > 0 ? ["singleKnowledgePoint"] : []),
    ...(availability?.visibleCount >= 2 ? ["mixedKnowledgePointsSameUnit"] : []),
  ];
}

function makeCapability({ source, kp, group, patternSpecId, uiMode, depthModes, contextModes, surface, isPbl = false }) {
  const effectiveMode = isPbl ? "pbl" : publicGroupMode(group);
  const patternGroupId = isPbl ? `pg_public_pbl_${source.sourceId}` : group.patternGroupId;
  const contextLineage = isPbl
    ? "GCTX_15_UNIT_PUBLIC_WORKSHEET_V1"
    : effectiveMode === "application"
      ? group.globalContextAdmission ?? "GLOBAL_PRIMARY_R07_AUTHORITATIVE_CONSUMER_CUTOVER"
      : "NOT_APPLICABLE";
  const capabilityKey = [
    source.sourceId,
    kp.knowledgePointId,
    patternGroupId,
    patternSpecId,
    uiMode,
    depthModes.join("|"),
    contextModes.join("|"),
    surface.surfaceId,
  ].join("::");
  return {
    capabilityId: `pgc_${slug(source.sourceId)}_${digest(capabilityKey)}`,
    sourceId: source.sourceId,
    unitCode: source.unitCode,
    unitTitle: source.title,
    grade: source.grade,
    semester: source.semester,
    sourceLifecycle: source.lifecycle ?? "protected_fifteen_or_batch_a",
    knowledgePointId: kp.knowledgePointId,
    knowledgePointName: kp.displayName ?? kp.canonicalNameZh ?? kp.knowledgePointId,
    knowledgePointPublicStatus: kp.selectorStatus ?? kp.visibilityStatus ?? "visible",
    questionType: typeLabels[uiMode] ?? uiMode.toUpperCase(),
    effectiveQuestionType: typeLabels[effectiveMode] ?? effectiveMode.toUpperCase(),
    questionForm: isPbl ? "complete_pbl_task_set" : group.representationTag ?? group.displayName ?? publicGroupMode(group),
    questionFormLabel: isPbl ? "完整 PBL 題組" : group.displayName ?? group.representationTag ?? publicGroupMode(group),
    patternGroupId,
    basePatternGroupId: isPbl ? null : group.basePatternGroupId ?? group.patternGroupId,
    patternSpecId,
    depthModes,
    contextModes,
    selectionModes: selectionModes(source.sourceId, isPbl),
    surfaceId: surface.surfaceId,
    surfaceRouteId: surface.routeId,
    surfaceStatus: surface.status,
    controlPolicy: surface.controlPolicy,
    generatorConsumer: isPbl
      ? "site/modules/curriculum/public/fifteen-unit-public-pbl-runtime.js"
      : "site/modules/curriculum/batch-a/batch-a-browser-generator-p03f13.js",
    validatorConsumer: isPbl
      ? "site/modules/curriculum/public/fifteen-unit-public-pbl-worksheet.js"
      : "site/modules/curriculum/batch-a/batch-a-browser-validator-p03f13.js",
    questionRouterConsumer: "site/modules/curriculum/batch-a/batch-a-browser-question-router.js",
    worksheetConsumer: "site/assets/browser/pipeline/build-worksheet-document.js",
    contextLineage,
    htmlRouteId: "renderer.preview_html",
    pdfRouteId: "renderer.iframe_print",
    answerKeySupported: true,
    defaultQuestionCount: DEFAULT_QUESTION_COUNT,
    declaredUiMaxQuestionCount: DECLARED_UI_MAX,
    verifiedMaxQuestionCount: null,
    capacityEvidence: "UNVERIFIED_UNTIL_PGC_R03",
    evidenceLevel: evidenceLevel(kp, group),
    compatibilityPolicy: getFullProductPublicControlProfile(source.sourceId)?.compatibilityPolicy ?? "public_runtime_admission",
    compatibilityStatus: "ACCOUNTED_PENDING_PGC_R02_INTERSECTION_NORMALIZATION",
  };
}

export function buildPublicGenerationCapabilityMatrix() {
  const sources = CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.map(clone);
  const sourceById = new Map(sources.map((source) => [source.sourceId, source]));
  const visibleKps = listVisibleBatchAKnowledgePoints().map(clone);
  const kpsBySource = new Map();
  for (const kp of visibleKps) {
    const rows = kpsBySource.get(kp.sourceId) ?? [];
    rows.push(kp);
    kpsBySource.set(kp.sourceId, rows);
  }

  const capabilities = [];
  const gaps = [];
  const uiOptionCoverage = [];

  for (const source of sources) {
    const kps = kpsBySource.get(source.sourceId) ?? [];
    if (kps.length === 0) {
      gaps.push({ code: "PUBLIC_SOURCE_WITHOUT_VISIBLE_KP", severity: "blocking_r01", sourceId: source.sourceId });
      continue;
    }

    for (const kp of kps) {
      const groups = allGroupsForKnowledgePoint(kp.knowledgePointId);
      if (groups.length === 0) {
        gaps.push({ code: "PUBLIC_KP_WITHOUT_PATTERN_GROUP", severity: "blocking_r01", sourceId: source.sourceId, knowledgePointId: kp.knowledgePointId });
      }
      for (const group of groups) {
        if (!Array.isArray(group.patternSpecIds) || group.patternSpecIds.length === 0) {
          gaps.push({ code: "PUBLIC_PATTERN_GROUP_WITHOUT_PATTERN_SPEC", severity: "blocking_r01", sourceId: source.sourceId, knowledgePointId: kp.knowledgePointId, patternGroupId: group.patternGroupId ?? null });
        }
      }
    }

    for (const surface of surfaces) {
      const profile = surfaceProfile(source.sourceId, surface);
      if (!profile) {
        gaps.push({ code: "PUBLIC_SOURCE_WITHOUT_CONTROL_PROFILE", severity: "blocking_r01", sourceId: source.sourceId, surfaceId: surface.surfaceId });
        continue;
      }
      const uiModes = controlValues(profile.questionTypeControl, "numeric");
      const depthModes = controlValues(profile.reasoningDepthControl);
      const contextModes = controlValues(profile.contextControl);

      if (surface.surfaceId === "FALLBACK_404" && source.sourceId !== "g5a_u08_5a08") {
        const canonicalModes = controlValues(getFullProductPublicControlProfile(source.sourceId)?.questionTypeControl, "numeric");
        if (canonicalModes.some((mode) => mode !== "numeric")) {
          gaps.push({
            code: "FALLBACK_404_PUBLIC_CONTROL_PARITY_GAP",
            severity: "r02_ui_binding",
            sourceId: source.sourceId,
            surfaceId: surface.surfaceId,
            hiddenCanonicalModes: canonicalModes.filter((mode) => mode !== "numeric"),
          });
        }
      }

      for (const uiMode of uiModes) {
        let rowCountBefore = capabilities.length;
        if (uiMode === "pbl") {
          const item = pblCapabilitySeed(source.sourceId);
          if (item) {
            const kp = visibleKps.find((row) => row.knowledgePointId === item.knowledgePointId)
              ?? { knowledgePointId: item.knowledgePointId, displayName: item.knowledgePointId, selectorStatus: "source_level_pbl_projection" };
            capabilities.push(makeCapability({
              source,
              kp,
              group: { displayName: "完整 PBL 題組", productionUse: "allowed" },
              patternSpecId: item.patternSpecId,
              uiMode,
              depthModes,
              contextModes,
              surface,
              isPbl: true,
            }));
          }
        } else {
          for (const kp of kps) {
            const groups = allGroupsForKnowledgePoint(kp.knowledgePointId).filter((group) => groupMatchesUiMode(group, uiMode));
            for (const group of groups) {
              for (const patternSpecId of unique(group.patternSpecIds ?? [])) {
                capabilities.push(makeCapability({
                  source,
                  kp,
                  group,
                  patternSpecId,
                  uiMode,
                  depthModes,
                  contextModes,
                  surface,
                }));
              }
            }
          }
        }
        const produced = capabilities.length - rowCountBefore;
        uiOptionCoverage.push({
          sourceId: source.sourceId,
          surfaceId: surface.surfaceId,
          questionTypeOption: uiMode,
          capabilityRowCount: produced,
          accounted: produced > 0,
        });
        if (produced === 0) {
          gaps.push({
            code: "PUBLIC_UI_OPTION_WITHOUT_CAPABILITY",
            severity: "blocking_r01",
            sourceId: source.sourceId,
            surfaceId: surface.surfaceId,
            questionTypeOption: uiMode,
          });
        }
      }
    }
  }

  const uniqueCapabilities = [...new Map(capabilities.map((row) => [row.capabilityId, row])).values()]
    .sort((a, b) => a.capabilityId.localeCompare(b.capabilityId));
  const blockingGaps = gaps.filter((gap) => gap.severity === "blocking_r01");
  const summary = {
    publicSourceCount: sources.length,
    publicVisibleKnowledgePointCount: visibleKps.length,
    publicSelectorVisibleCount: BATCH_A_SELECTOR_AVAILABILITY.visibleCount,
    capabilityRowCount: uniqueCapabilities.length,
    uniquePatternGroupCount: new Set(uniqueCapabilities.map((row) => row.patternGroupId)).size,
    uniquePatternSpecCount: new Set(uniqueCapabilities.map((row) => row.patternSpecId)).size,
    surfaceCount: surfaces.length,
    uiOptionCoverageCount: uiOptionCoverage.length,
    accountedUiOptionCount: uiOptionCoverage.filter((row) => row.accounted).length,
    gapCount: gaps.length,
    blockingGapCount: blockingGaps.length,
    r02UiBindingGapCount: gaps.filter((gap) => gap.severity === "r02_ui_binding").length,
    capacityUnverifiedCapabilityCount: uniqueCapabilities.filter((row) => row.capacityEvidence === "UNVERIFIED_UNTIL_PGC_R03").length,
  };

  return {
    schemaName: "PublicGenerationCapabilityMatrixV1",
    schemaVersion: 1,
    programId: PROGRAM_ID,
    taskId: TASK_ID,
    status: blockingGaps.length === 0 ? "PASS_WITH_DOWNSTREAM_GAPS" : "FAIL_CLOSED_BLOCKING_GAPS",
    generatedAt: "DETERMINISTIC",
    sourceAuthority: "CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS",
    selectorAuthority: "batch-a-selector-p03f22-extension.js",
    scopeRef: "data/curriculum/public-generation/public_generation_scope.json",
    defaultQuestionCount: DEFAULT_QUESTION_COUNT,
    declaredUiMaxQuestionCount: DECLARED_UI_MAX,
    surfaces,
    summary,
    uiOptionCoverage,
    gaps,
    capabilities: uniqueCapabilities,
  };
}

function writeCsv(matrix) {
  const columns = [
    "capabilityId", "sourceId", "unitCode", "unitTitle", "grade", "semester",
    "knowledgePointId", "knowledgePointName", "questionType", "effectiveQuestionType",
    "questionForm", "questionFormLabel", "patternGroupId", "basePatternGroupId", "patternSpecId",
    "depthModes", "contextModes", "selectionModes", "surfaceId", "surfaceRouteId", "surfaceStatus",
    "generatorConsumer", "validatorConsumer", "contextLineage", "htmlRouteId", "pdfRouteId",
    "defaultQuestionCount", "declaredUiMaxQuestionCount", "verifiedMaxQuestionCount",
    "capacityEvidence", "evidenceLevel", "compatibilityPolicy", "compatibilityStatus",
  ];
  const lines = [columns.join(",")];
  for (const row of matrix.capabilities) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function gapReport(matrix) {
  const byCode = new Map();
  for (const gap of matrix.gaps) byCode.set(gap.code, (byCode.get(gap.code) ?? 0) + 1);
  const gapSummary = [...byCode.entries()].sort(([a], [b]) => a.localeCompare(b));
  const blockerText = matrix.summary.blockingGapCount === 0
    ? "R01 已把所有目前可見 UI 題目類型選項對帳到至少一個 capability row。"
    : `仍有 ${matrix.summary.blockingGapCount} 個 R01 blocking gap；不得宣告完整 capability authority。`;
  const lines = [
    "# PGC-R01 Capability Gap Report",
    "",
    "```text",
    `PROGRAM_ID = ${PROGRAM_ID}`,
    `TASK_ID    = ${TASK_ID}`,
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
    blockerText,
    "",
    "## Gap classes",
    "",
    "| Gap code | Count | Owner milestone |",
    "|---|---:|---|",
    ...(gapSummary.length ? gapSummary.map(([code, count]) => `| \`${code}\` | ${count} | ${code.includes("FALLBACK_404") ? "PGC-R02" : code.includes("CAPACITY") ? "PGC-R03" : "PGC-R01"} |`) : ["| none | 0 | — |"]),
    "",
    "## Important findings",
    "",
    "1. Classic and Pixel are profile-driven public surfaces.",
    "2. The public 404 fallback does not mount the shared `public-control-ui.js`; outside G5A-U08 it exposes only the default numeric path. This is recorded as an R02 UI-binding parity gap rather than silently claiming parity.",
    "3. Every capability retains `declaredUiMaxQuestionCount = 200`, but verified capacity remains null until PGC-R03 performs cross-seed capacity proof.",
    "4. Hidden KnowledgePoints and Slice014 are absent from the matrix.",
    "5. PBL capabilities are represented by their admitted runtime PatternSpec witness and complete-task-set form.",
    "",
    "## Blocking gap detail",
    "",
    ...(matrix.gaps.filter((gap) => gap.severity === "blocking_r01").length
      ? matrix.gaps.filter((gap) => gap.severity === "blocking_r01").map((gap) => `- \`${gap.code}\`: \`${JSON.stringify(gap)}\``)
      : ["- none"]),
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_PUBLIC_SCOPE_FROZEN",
    `GOAL_DISTANCE_AFTER  = ${matrix.summary.blockingGapCount === 0 ? "D1_PUBLIC_CAPABILITY_MATRIX_MATERIALIZED" : "D1_CAPABILITY_MATRIX_FAIL_CLOSED"}`,
    "DISTANCE_REDUCED     = public KP / type / form / PatternGroup / PatternSpec / controls / surface lineage is machine-readable",
    "REMAINING_BLOCKERS   = [PGC-R02_DYNAMIC_UI_BINDING, PGC-R03_VERIFIED_CAPACITY, PGC-R04_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    "```",
    "",
  ];
  return `${lines.join("\n")}\n`;
}

export function materializePublicGenerationCapabilityMatrix() {
  const matrix = buildPublicGenerationCapabilityMatrix();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(jsonPath, `${JSON.stringify(matrix, null, 2)}\n`);
  writeCsv(matrix);
  fs.writeFileSync(gapPath, gapReport(matrix));
  return matrix;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const matrix = materializePublicGenerationCapabilityMatrix();
  console.log(`PGC_R01_SUMMARY=${JSON.stringify(matrix.summary)}`);
  if (matrix.summary.blockingGapCount > 0) process.exitCode = 2;
}
