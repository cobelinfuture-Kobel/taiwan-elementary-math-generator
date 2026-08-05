import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding.js";
import {
  listBatchAKnowledgePointAvailabilityBySource,
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f24-extension.js";
import {
  CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS,
} from "../../site/modules/curriculum/batch-a/source-units.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const contractPath = path.join(outputDir, "ui_capability_binding_contract.json");
const csvPath = path.join(outputDir, "ui_option_filter_matrix.csv");
const readbackPath = path.join(docsDir, "PGC-R02_ui_capability_binding_readback.md");

const surfaces = Object.values(PUBLIC_UI_SURFACES);
const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

function kpsBySource() {
  const grouped = new Map();
  for (const kp of listVisibleBatchAKnowledgePoints()) {
    const rows = grouped.get(kp.sourceId) ?? [];
    rows.push(kp);
    grouped.set(kp.sourceId, rows);
  }
  return grouped;
}

function baseCases() {
  const grouped = kpsBySource();
  const cases = [];
  for (const source of CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS) {
    const kps = grouped.get(source.sourceId) ?? [];
    cases.push({ sourceId: source.sourceId, selectionMode: "sourceUnit", selectedKnowledgePointIds: [], caseId: `${source.sourceId}::sourceUnit` });
    for (const kp of kps) cases.push({ sourceId: source.sourceId, selectionMode: "singleKnowledgePoint", selectedKnowledgePointIds: [kp.knowledgePointId], caseId: `${source.sourceId}::single::${kp.knowledgePointId}` });
    if (kps.length >= 2) cases.push({ sourceId: source.sourceId, selectionMode: "mixedKnowledgePointsSameUnit", selectedKnowledgePointIds: kps.map((kp) => kp.knowledgePointId), caseId: `${source.sourceId}::mixedSameUnit` });
  }
  return cases;
}

function optionValues(binding) { return binding.availableQuestionTypeOptions.map((row) => row.value); }

function caseRows() {
  const rows = [];
  const gaps = [];
  for (const input of baseCases()) {
    for (const surfaceId of surfaces) {
      const audit = auditPublicUiCapabilityBinding({ ...input, surfaceId });
      const binding = audit.binding;
      if (!audit.ok) gaps.push(...audit.errors);
      const questionTypes = optionValues(binding);
      for (const questionType of questionTypes) {
        const resolved = resolvePublicUiCapabilityBinding({ ...input, surfaceId, requestedQuestionType: questionType });
        const compatible = resolved.compatiblePatternGroups.filter((group) => group.effectiveQuestionType === questionType || questionType === "mixed");
        rows.push({
          bindingId: `${input.caseId}::${surfaceId}::${questionType}`,
          caseId: input.caseId,
          sourceId: input.sourceId,
          surfaceId,
          selectionMode: input.selectionMode,
          selectedKnowledgePointIds: clone(resolved.selectedKnowledgePointIds),
          selectedKnowledgePointCount: resolved.selectedKnowledgePointCount,
          questionType,
          questionTypeLabel: resolved.availableQuestionTypeOptions.find((row) => row.value === questionType)?.label ?? questionType,
          compatiblePatternGroupIds: compatible.map((group) => group.patternGroupId),
          compatiblePatternSpecIds: compatible.flatMap((group) => group.patternSpecIds ?? []),
          questionFormLabels: compatible.map((group) => group.displayLabel),
          depthModes: (resolved.depthOptions ?? []).map((row) => row.value),
          contextModes: (resolved.contextOptions ?? []).map((row) => row.value),
          questionCountMin: resolved.questionCount?.min ?? 1,
          questionCountDefault: resolved.questionCount?.default ?? PUBLIC_UI_SAFE_QUESTION_COUNT.default,
          questionCountMax: resolved.questionCount?.max ?? PUBLIC_UI_SAFE_QUESTION_COUNT.max,
          capacityStatus: resolved.capacityStatus,
          capacityRouteIds: clone(resolved.capacityRouteIds ?? []),
          capacityQualityStatuses: clone(resolved.capacityQualityStatuses ?? []),
          blocked: resolved.blocked,
          blockedReasons: clone(resolved.blockedReasons ?? []),
        });
      }
    }
  }
  return { rows, gaps };
}

export function buildPgcR02UiCapabilityBindingContract() {
  const { rows, gaps } = caseRows();
  const visibleKps = listVisibleBatchAKnowledgePoints();
  const summary = {
    publicSourceCount: CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length,
    visibleKnowledgePointCount: visibleKps.length,
    publicSurfaceCount: surfaces.length,
    questionTypeBindingRowCount: rows.length,
    gapCount: gaps.length,
  };
  return {
    schemaName: "PublicUiCapabilityBindingContractV1",
    schemaVersion: 1,
    programId: "PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId: "PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    status: gaps.length === 0 ? "PASS" : "FAIL_CLOSED",
    selectorAuthority: "site/modules/curriculum/registry/batch-a-selector-p03f24-extension.js",
    sourceAuthority: "site/modules/curriculum/batch-a/source-units.js",
    surfaces: clone(surfaces),
    summary,
    gaps,
    bindings: rows,
  };
}

function writeCsv(contract) {
  const columns = ["bindingId", "caseId", "sourceId", "surfaceId", "selectionMode", "selectedKnowledgePointIds", "selectedKnowledgePointCount", "questionType", "questionTypeLabel", "compatiblePatternGroupIds", "compatiblePatternSpecIds", "questionFormLabels", "depthModes", "contextModes", "questionCountMin", "questionCountDefault", "questionCountMax", "capacityStatus", "capacityRouteIds", "capacityQualityStatuses", "blocked", "blockedReasons"];
  const lines = [columns.join(",")];
  for (const row of contract.bindings) lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function writeReadback(contract) {
  const lines = ["# PGC-R02 KnowledgePoint-driven UI Capability Binding Readback", "", "```text", "PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1", "TASK_ID    = PGC-R02_KnowledgePointDrivenUICapabilityBinding", `STATUS     = ${contract.status}`, "```", "", "## Accepted matrix", "", "```text", `PUBLIC_SOURCES              = ${contract.summary.publicSourceCount}`, `VISIBLE_KNOWLEDGE_POINTS    = ${contract.summary.visibleKnowledgePointCount}`, `PUBLIC_SURFACES             = ${contract.summary.publicSurfaceCount}`, `QUESTION_TYPE_BINDING_ROWS  = ${contract.summary.questionTypeBindingRowCount}`, `GAPS                        = ${contract.summary.gapCount}`, "```", ""];
  if (contract.gaps.length) lines.push("## Blocking gaps", "", ...contract.gaps.map((gap) => `- \`${JSON.stringify(gap)}\``), "");
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
  console.log(`PGC_R02_SUMMARY=${JSON.stringify(contract.summary)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
}
