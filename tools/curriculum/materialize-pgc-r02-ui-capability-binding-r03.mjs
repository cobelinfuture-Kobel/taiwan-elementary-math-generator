import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildPgcR02UiCapabilityBindingContract as buildLegacyContract,
} from "./materialize-pgc-r02-ui-capability-binding.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const contractPath = path.join(outputDir, "ui_capability_binding_contract.json");
const csvPath = path.join(outputDir, "ui_option_filter_matrix.csv");
const readbackPath = path.join(docsDir, "PGC-R02_ui_capability_binding_readback.md");

const ACCEPTED_RUNTIME_CAPACITY_STATUSES = new Set(["VERIFIED_20", "VERIFIED_LIMITED", "STRUCTURAL_FALLBACK_AVAILABLE"]);
const R06_BINDING_RECONCILIATION_FIELDS = Object.freeze([
  "questionCountMin",
  "questionCountDefault",
  "questionCountMax",
  "verifiedCapacityQuestionCountMax",
  "capacityStatus",
  "blocked",
  "blockedReasons",
  "capacityRouteIds",
  "capacityQualityStatuses",
  "lastCapacityReconciliation",
]);
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

function readExistingContract() {
  if (!fs.existsSync(contractPath)) return null;
  return JSON.parse(fs.readFileSync(contractPath, "utf8"));
}

function isR06LineageKey(key) {
  return key === "lastReconciliation"
    || key === "r06TerminalStatus"
    || /^lastR06A\d+/.test(key);
}

function preserveR06BindingReconciliation(bindings, existing) {
  if (!existing?.bindings?.length) return bindings;
  const priorByBindingId = new Map(existing.bindings.map((row) => [row.bindingId, row]));
  return bindings.map((row) => {
    const prior = priorByBindingId.get(row.bindingId);
    if (!prior?.lastCapacityReconciliation) return row;
    const preserved = { ...row };
    for (const field of R06_BINDING_RECONCILIATION_FIELDS) {
      if (prior[field] !== undefined) preserved[field] = clone(prior[field]);
    }
    return preserved;
  });
}

function preserveR06TopLevelLineage(contract, existing) {
  if (!existing) return contract;
  for (const [key, value] of Object.entries(existing)) {
    if (isR06LineageKey(key)) contract[key] = clone(value);
  }
  return contract;
}

export function buildPgcR02UiCapabilityBindingContract() {
  const existing = readExistingContract();
  const legacy = buildLegacyContract();
  const byBindingId = new Map(legacy.bindings.map((row) => [row.bindingId, row]));
  const gaps = legacy.gaps.filter((gap) => {
    if (gap.code !== "PUBLIC_UI_UNVERIFIED_CAPACITY_EXPOSED") return true;
    const row = byBindingId.get(gap.bindingId);
    return !row || !ACCEPTED_RUNTIME_CAPACITY_STATUSES.has(row.capacityStatus);
  });
  const freshBindings = legacy.bindings.map((row) => ({
    ...row,
    capacityRouteIds: [...(row.capacityRouteIds ?? [])],
    capacityQualityStatuses: [...(row.capacityQualityStatuses ?? [])],
  }));
  const bindings = preserveR06BindingReconciliation(freshBindings, existing);
  const summary = {
    ...(existing?.summary ?? {}),
    ...legacy.summary,
    questionTypeBindingRowCount: bindings.length,
    verified20BindingCount: bindings.filter((row) => row.capacityStatus === "VERIFIED_20").length,
    limitedCapacityBindingCount: bindings.filter((row) => row.capacityStatus === "VERIFIED_LIMITED").length,
    structuralFallbackBindingCount: bindings.filter((row) => row.capacityStatus === "STRUCTURAL_FALLBACK_AVAILABLE").length,
    unverifiedCapacityExposureCount: bindings.filter((row) => !ACCEPTED_RUNTIME_CAPACITY_STATUSES.has(row.capacityStatus)).length,
    minimumVerifiedQuestionCount: bindings.length > 0 ? Math.min(...bindings.map((row) => row.questionCountMax)) : 0,
    maximumVerifiedQuestionCount: bindings.length > 0 ? Math.max(...bindings.map((row) => row.questionCountMax)) : 0,
    gapCount: gaps.length,
  };
  const contract = {
    ...legacy,
    schemaName: "PublicUiCapabilityBindingContractV2",
    schemaVersion: 2,
    status: gaps.length === 0 ? "PASS" : "FAIL_CLOSED",
    capacityAuthority: "site/modules/curriculum/public/public-generator-capacity-registry.js",
    runtimeCapacityPolicy: "PGC_R03_VERIFIED_OR_POST_R03_STRUCTURAL_FALLBACK_UNDER_GLOBAL_240_CEILING",
    summary,
    gaps,
    bindings,
  };
  return preserveR06TopLevelLineage(contract, existing);
}

function writeCsv(contract) {
  const columns = [
    "bindingId", "caseId", "sourceId", "surfaceId", "selectionMode",
    "selectedKnowledgePointIds", "selectedKnowledgePointCount", "questionType", "questionTypeLabel",
    "compatiblePatternGroupIds", "compatiblePatternSpecIds", "questionFormLabels",
    "depthModes", "contextModes", "questionCountMin", "questionCountDefault", "questionCountMax",
    "capacityStatus", "capacityRouteIds", "capacityQualityStatuses", "blocked", "blockedReasons",
  ];
  const lines = [columns.join(",")];
  for (const row of contract.bindings) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function writeReadback(contract) {
  const summary = contract.summary;
  const lines = [
    "# PGC-R02 KnowledgePoint-driven UI Capability Binding Readback",
    "",
    "```text",
    "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    "TASK_ID    = PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    `STATUS     = ${contract.status}`,
    "```",
    "",
    "## Capacity-aware accepted matrix",
    "",
    "```text",
    `PUBLIC_SOURCES                  = ${summary.publicSourceCount}`,
    `VISIBLE_KNOWLEDGE_POINTS        = ${summary.visibleKnowledgePointCount}`,
    `PUBLIC_SURFACES                 = ${summary.publicSurfaceCount}`,
    `QUESTION_TYPE_BINDING_ROWS      = ${summary.questionTypeBindingRowCount}`,
    `VERIFIED_20_BINDINGS            = ${summary.verified20BindingCount}`,
    `VERIFIED_LIMITED_BINDINGS       = ${summary.limitedCapacityBindingCount}`,
    `STRUCTURAL_FALLBACK_BINDINGS    = ${summary.structuralFallbackBindingCount}`,
    `MINIMUM_VERIFIED_QUESTION_COUNT = ${summary.minimumVerifiedQuestionCount}`,
    `MAXIMUM_VERIFIED_QUESTION_COUNT = ${summary.maximumVerifiedQuestionCount}`,
    `UNVERIFIED_CAPACITY_EXPOSURES   = ${summary.unverifiedCapacityExposureCount}`,
    `GAPS                            = ${summary.gapCount}`,
    "```",
    "",
    "PGC-R03 removes illegal depth/context/scope intersections and applies the verified per-capability question-count ceiling. Later direct-product slices may use the already accepted structural fallback under the global 240 ceiling until the capacity registry is rematerialized; this does not mutate historical PGC-R03 route evidence.",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_KP_DRIVEN_UI_BINDING_CONFORMANT",
    `GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_CAPACITY_AWARE_UI_BINDING_CONFORMANT" : "D1_CAPACITY_AWARE_UI_BINDING_FAIL_CLOSED"}`,
    "DISTANCE_REDUCED     = public controls now expose only legal routes and clamp question count to the accepted global runtime ceiling",
    "REMAINING_BLOCKERS   = [PGC-R04_NUMERIC_QUALITY, PGC-R05_APPLICATION_QUALITY, PGC-R06_TO_R08_PRODUCT_ACCEPTANCE]",
    "NEXT_SHORTEST_STEP   = PGC-R04_NumericGenerationFullFix",
    "```",
    "",
  ];
  if (contract.gaps.length > 0) {
    lines.push("## Blocking gaps", "", ...contract.gaps.map((gap) => `- \`${gap.code}\`: \`${JSON.stringify(gap)}\``), "");
  }
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

export function materializePgcR02UiCapabilityBinding() {
  const contract = buildPgcR02UiCapabilityBindingContract();
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeCsv(contract);
  writeReadback(contract);
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const contract = materializePgcR02UiCapabilityBinding();
  console.log(`PGC_R02_R03_RECONCILED_SUMMARY=${JSON.stringify(contract.summary)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
}
