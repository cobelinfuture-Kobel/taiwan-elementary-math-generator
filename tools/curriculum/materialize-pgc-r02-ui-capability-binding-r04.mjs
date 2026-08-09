import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f31.js";
import {
  listVisibleBatchAKnowledgePoints,
} from "../../site/modules/curriculum/registry/batch-a-selector-p03f31-extension.js";
import { CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";

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
    cases.push({ sourceId:source.sourceId, selectionMode:"sourceUnit", selectedKnowledgePointIds:[], caseId:`${source.sourceId}::sourceUnit` });
    for (const kp of kps) {
      cases.push({ sourceId:source.sourceId, selectionMode:"singleKnowledgePoint", selectedKnowledgePointIds:[kp.knowledgePointId], caseId:`${source.sourceId}::single::${kp.knowledgePointId}` });
    }
    if (kps.length >= 2) {
      cases.push({ sourceId:source.sourceId, selectionMode:"mixedKnowledgePointsSameUnit", selectedKnowledgePointIds:kps.map((kp)=>kp.knowledgePointId), caseId:`${source.sourceId}::mixedSameUnit` });
    }
  }
  return cases;
}

const optionValues = (binding) => binding.availableQuestionTypeOptions.map((row) => row.value);

function caseRows() {
  const rows = [];
  const gaps = [];
  const cases = baseCases();
  for (const input of cases) {
    for (const surfaceId of surfaces) {
      const base = resolvePublicUiCapabilityBinding({ ...input, surfaceId });
      if (base.blocked) {
        gaps.push({ code:"PUBLIC_UI_BINDING_BLOCKED", caseId:input.caseId, sourceId:input.sourceId, surfaceId, blockedReasons:[...base.blockedReasons] });
        continue;
      }
      for (const questionType of optionValues(base)) {
        const resolved = resolvePublicUiCapabilityBinding({ ...input, surfaceId, requestedQuestionType:questionType });
        const compatiblePatternSpecIds = [...new Set(resolved.compatiblePatternGroups.flatMap((group) => group.patternSpecIds))];
        const row = {
          bindingId:`${input.caseId}::${surfaceId}::${questionType}`,
          caseId:input.caseId,
          sourceId:input.sourceId,
          surfaceId,
          selectionMode:input.selectionMode,
          selectedKnowledgePointIds:[...resolved.selectedKnowledgePointIds],
          selectedKnowledgePointCount:resolved.selectedKnowledgePointCount,
          questionType,
          questionTypeLabel:resolved.availableQuestionTypeOptions.find((option)=>option.value===questionType)?.label ?? questionType,
          compatiblePatternGroupIds:[...resolved.compatiblePatternGroupIds],
          compatiblePatternSpecIds,
          questionFormLabels:resolved.compatiblePatternGroups.map((group)=>group.displayLabel),
          depthModes:resolved.depthOptions.map((option)=>option.value),
          contextModes:resolved.contextOptions.map((option)=>option.value),
          questionCountMin:resolved.questionCount.min,
          questionCountDefault:resolved.questionCount.default,
          questionCountMax:resolved.questionCount.max,
          capacityStatus:resolved.capacityStatus,
          blocked:resolved.blocked,
          blockedReasons:[...resolved.blockedReasons],
        };
        if (resolved.blocked) gaps.push({ code:"PUBLIC_UI_QUESTION_TYPE_BINDING_BLOCKED", bindingId:row.bindingId, blockedReasons:[...resolved.blockedReasons] });
        if (questionType !== "pbl" && row.compatiblePatternGroupIds.length === 0) gaps.push({ code:"PUBLIC_UI_QUESTION_TYPE_WITHOUT_FORM", bindingId:row.bindingId });
        if (row.questionCountMax !== PUBLIC_UI_SAFE_QUESTION_COUNT.max) gaps.push({ code:"PUBLIC_UI_UNVERIFIED_CAPACITY_EXPOSED", bindingId:row.bindingId, questionCountMax:row.questionCountMax });
        rows.push(row);
      }
    }
  }
  return { cases, rows, gaps };
}

function surfaceParity(cases) {
  const gaps = [];
  let parityCaseCount = 0;
  for (const input of cases) {
    const snapshots = surfaces.map((surfaceId) => {
      const binding = resolvePublicUiCapabilityBinding({ ...input, surfaceId });
      return { surfaceId, questionTypes:optionValues(binding), blocked:binding.blocked, countMax:binding.questionCount.max };
    });
    parityCaseCount += 1;
    const reference = JSON.stringify({ questionTypes:snapshots[0].questionTypes, blocked:snapshots[0].blocked, countMax:snapshots[0].countMax });
    for (const snapshot of snapshots.slice(1)) {
      const candidate = JSON.stringify({ questionTypes:snapshot.questionTypes, blocked:snapshot.blocked, countMax:snapshot.countMax });
      if (candidate !== reference) gaps.push({ code:"PUBLIC_SURFACE_OPTION_PARITY_MISMATCH", caseId:input.caseId, referenceSurface:snapshots[0].surfaceId, candidateSurface:snapshot.surfaceId, reference:JSON.parse(reference), candidate:JSON.parse(candidate) });
    }
  }
  return { parityCaseCount, gaps };
}

export function buildPgcR02UiCapabilityBindingContractR04() {
  const materialized = caseRows();
  const parity = surfaceParity(materialized.cases);
  const audit = auditPublicUiCapabilityBinding();
  const gaps = [...materialized.gaps, ...parity.gaps];
  if (!audit.ok) gaps.push(...audit.errors.map((error) => ({ code:"PUBLIC_UI_BINDING_AUDIT_ERROR", error })));
  const visibleKnowledgePointCount = listVisibleBatchAKnowledgePoints().length;
  const summary = {
    publicSourceCount:CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.length,
    visibleKnowledgePointCount,
    publicSurfaceCount:surfaces.length,
    baseCaseCount:materialized.cases.length,
    surfaceCaseCount:materialized.cases.length * surfaces.length,
    questionTypeBindingRowCount:materialized.rows.length,
    parityCaseCount:parity.parityCaseCount,
    auditCaseCount:audit.caseCount,
    blockedBindingCount:materialized.rows.filter((row)=>row.blocked).length,
    unverifiedCapacityExposureCount:materialized.rows.filter((row)=>row.questionCountMax !== PUBLIC_UI_SAFE_QUESTION_COUNT.max).length,
    gapCount:gaps.length,
  };
  return {
    schemaName:"PublicUiCapabilityBindingContractV1",
    schemaVersion:1,
    bindingRevision:"pgc-r02-r04-p03f31",
    programId:"PUBLIC_KP_GENERATION_CONFORMANCE_V1",
    taskId:"PGC-R02_KnowledgePointDrivenUICapabilityBinding",
    status:gaps.length===0?"PASS":"FAIL_CLOSED",
    sourceAuthority:"CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS",
    selectorAuthority:"batch-a-selector-p03f31-extension.js",
    capabilityAuthority:"data/curriculum/public-generation/public_generation_capability_matrix.json",
    publicUiResolver:"site/modules/curriculum/public/public-ui-capability-binding-p03f31.js",
    adapters:{ classic:"site/assets/browser/public-capability-ui.js", fallback404:"site/assets/browser/public-capability-ui.js", pixel:"site/pixel/pixel-public-capability-ui.js" },
    safeQuestionCount:clone(PUBLIC_UI_SAFE_QUESTION_COUNT),
    surfaces,
    summary,
    gaps,
    bindings:materialized.rows,
  };
}

function writeCsv(contract) {
  const columns = ["bindingId","caseId","sourceId","surfaceId","selectionMode","selectedKnowledgePointIds","selectedKnowledgePointCount","questionType","questionTypeLabel","compatiblePatternGroupIds","compatiblePatternSpecIds","questionFormLabels","depthModes","contextModes","questionCountMin","questionCountDefault","questionCountMax","capacityStatus","blocked","blockedReasons"];
  const lines = [columns.join(",")];
  for (const row of contract.bindings) lines.push(columns.map((column)=>csvEscape(row[column])).join(","));
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
    "## Accepted matrix",
    "",
    "```text",
    `PUBLIC_SOURCES                = ${summary.publicSourceCount}`,
    `VISIBLE_KNOWLEDGE_POINTS      = ${summary.visibleKnowledgePointCount}`,
    `PUBLIC_SURFACES               = ${summary.publicSurfaceCount}`,
    `BASE_UI_CASES                 = ${summary.baseCaseCount}`,
    `SURFACE_UI_CASES              = ${summary.surfaceCaseCount}`,
    `QUESTION_TYPE_BINDING_ROWS    = ${summary.questionTypeBindingRowCount}`,
    `SURFACE_PARITY_CASES          = ${summary.parityCaseCount}`,
    `BLOCKED_BINDINGS              = ${summary.blockedBindingCount}`,
    `UNVERIFIED_CAPACITY_EXPOSURES = ${summary.unverifiedCapacityExposureCount}`,
    `GAPS                          = ${summary.gapCount}`,
    "```",
    "",
    "## Slice031 boundary",
    "",
    "- `g5b_u04_5b04` exposes one source-backed `decimal × integer` numeric KnowledgePoint.",
    "- `integer × decimal`, `decimal × decimal`, application, estimation, depth and context remain outside Slice031.",
    "- Classic, fallback 404 and Pixel resolve the same numeric-only capability.",
    "- Public question count remains fail-closed at the shared verified-safe contract.",
    "",
    "## Distance update",
    "",
    "```text",
    "GOAL_DISTANCE_BEFORE = D1_SLICE031_CURRENT_R01_AUTHORITY_MATERIALIZED",
    `GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_SLICE031_CURRENT_R02_BINDING_CONFORMANT" : "D1_SLICE031_R02_BINDING_FAIL_CLOSED"}`,
    "DISTANCE_REDUCED     = Slice031 source/KP is represented by the same current public UI binding authority as prior W3 slices",
    "REMAINING_BLOCKERS   = [SLICE031_PRODUCT_ACCEPTANCE, PGC_R03_R09_CURRENT_ROUTE_RECONCILIATION]",
    "NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice031_ProductAcceptance",
    "```",
    "",
  ];
  if (contract.gaps.length > 0) lines.push("## Blocking gaps", "", ...contract.gaps.map((gap)=>`- \`${gap.code}\`: \`${JSON.stringify(gap)}\``), "");
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

export function materializePgcR02UiCapabilityBindingR04() {
  const contract = buildPgcR02UiCapabilityBindingContractR04();
  fs.mkdirSync(outputDir, { recursive:true });
  fs.mkdirSync(docsDir, { recursive:true });
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeCsv(contract);
  writeReadback(contract);
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const contract = materializePgcR02UiCapabilityBindingR04();
  console.log(`PGC_R02_R04_SUMMARY=${JSON.stringify(contract.summary)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
}
