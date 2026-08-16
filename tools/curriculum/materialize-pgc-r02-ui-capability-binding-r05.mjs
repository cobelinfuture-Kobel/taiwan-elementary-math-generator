import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildPgcR02UiCapabilityBindingContractR04 } from "./materialize-pgc-r02-ui-capability-binding-r04.mjs";
import {
  PUBLIC_UI_SAFE_QUESTION_COUNT,
  PUBLIC_UI_SURFACES,
  auditPublicUiCapabilityBinding,
  resolvePublicUiCapabilityBinding,
} from "../../site/modules/curriculum/public/public-ui-capability-binding-p03f32.js";
import { BATCH_A_SELECTOR_AVAILABILITY, listVisibleBatchAKnowledgePoints } from "../../site/modules/curriculum/registry/batch-a-selector-p03f32-extension.js";
import { CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS } from "../../site/modules/curriculum/batch-a/source-units.js";
import {
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
} from "../../site/modules/curriculum/registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(repoRoot, "data/curriculum/public-generation");
const docsDir = path.join(repoRoot, "docs/curriculum/output");
const contractPath = path.join(outputDir, "ui_capability_binding_contract.json");
const csvPath = path.join(outputDir, "ui_option_filter_matrix.csv");
const readbackPath = path.join(docsDir, "PGC-R02_ui_capability_binding_readback.md");
const ACCEPTED_RUNTIME_CAPACITY_STATUSES = new Set(["VERIFIED_20", "VERIFIED_LIMITED", "STRUCTURAL_FALLBACK_AVAILABLE"]);
const surfaces = Object.values(PUBLIC_UI_SURFACES);
const csvEscape = (value) => {
  const text = value == null ? "" : Array.isArray(value) ? value.join("|") : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
};

const P03F32_FROZEN_SOURCE_IDS = new Set(Object.keys(BATCH_A_SELECTOR_AVAILABILITY.bySourceId));
const P03F32_FROZEN_PUBLIC_SOURCE_UNITS = Object.freeze(CURRENT_FULL_PRODUCT_PUBLIC_SOURCE_UNITS.filter((row) => P03F32_FROZEN_SOURCE_IDS.has(row.sourceId)));

function currentBaseCaseCount() {
  const grouped = new Map();
  for (const kp of listVisibleBatchAKnowledgePoints()) {
    const rows = grouped.get(kp.sourceId) ?? [];
    rows.push(kp);
    grouped.set(kp.sourceId, rows);
  }
  let count = 0;
  for (const source of P03F32_FROZEN_PUBLIC_SOURCE_UNITS) {
    const kps = grouped.get(source.sourceId) ?? [];
    count += 1 + kps.length + (kps.length >= 2 ? 1 : 0);
  }
  return count;
}

function buildSlice032Bindings() {
  const cases = [
    { selectionMode:"sourceUnit", selectedKnowledgePointIds:[], caseId:`${G6B_U01_P03F32_SOURCE_ID}::sourceUnit` },
    { selectionMode:"singleKnowledgePoint", selectedKnowledgePointIds:[G6B_U01_P03F32_KP_ID], caseId:`${G6B_U01_P03F32_SOURCE_ID}::single::${G6B_U01_P03F32_KP_ID}` },
  ];
  const rows = [];
  for (const input of cases) {
    for (const surfaceId of surfaces) {
      const resolved = resolvePublicUiCapabilityBinding({ ...input, sourceId:G6B_U01_P03F32_SOURCE_ID, surfaceId, requestedQuestionType:"numeric" });
      const compatiblePatternSpecIds = [...new Set(resolved.compatiblePatternGroups.flatMap((group)=>group.patternSpecIds))];
      rows.push({
        bindingId:`${input.caseId}::${surfaceId}::numeric`,
        caseId:input.caseId,
        sourceId:G6B_U01_P03F32_SOURCE_ID,
        surfaceId,
        selectionMode:input.selectionMode,
        selectedKnowledgePointIds:[...resolved.selectedKnowledgePointIds],
        selectedKnowledgePointCount:resolved.selectedKnowledgePointCount,
        questionType:"numeric",
        questionTypeLabel:resolved.availableQuestionTypeOptions.find((option)=>option.value==="numeric")?.label ?? "數字題",
        compatiblePatternGroupIds:[...resolved.compatiblePatternGroupIds],
        compatiblePatternSpecIds,
        questionFormLabels:resolved.compatiblePatternGroups.map((group)=>group.displayLabel),
        depthModes:resolved.depthOptions.map((option)=>option.value),
        contextModes:resolved.contextOptions.map((option)=>option.value),
        questionCountMin:resolved.questionCount.min,
        questionCountDefault:resolved.questionCount.default,
        questionCountMax:resolved.questionCount.max,
        verifiedCapacityQuestionCountMax:resolved.questionCount.max,
        capacityStatus:resolved.capacityStatus,
        capacityRouteIds:[...(resolved.capacityRouteIds ?? [])],
        capacityQualityStatuses:[...(resolved.capacityQualityStatuses ?? [])],
        blocked:resolved.blocked,
        blockedReasons:[...resolved.blockedReasons],
      });
    }
  }
  return rows;
}

function belongsToSlice032(value = {}) {
  const serialized = JSON.stringify(value);
  return value.sourceId === G6B_U01_P03F32_SOURCE_ID
    || String(value.bindingId ?? "").startsWith(`${G6B_U01_P03F32_SOURCE_ID}::`)
    || String(value.caseId ?? "").startsWith(`${G6B_U01_P03F32_SOURCE_ID}::`)
    || serialized.includes(G6B_U01_P03F32_SOURCE_ID);
}

export function buildPgcR02UiCapabilityBindingContractR05() {
  const predecessor = buildPgcR02UiCapabilityBindingContractR04();
  const oldBindings = predecessor.bindings.filter((row)=>!belongsToSlice032(row) && P03F32_FROZEN_SOURCE_IDS.has(row.sourceId));
  const newBindings = buildSlice032Bindings();
  const bindings = [...oldBindings, ...newBindings].sort((a,b)=>a.bindingId.localeCompare(b.bindingId));
  const audit = auditPublicUiCapabilityBinding();
  const gaps = predecessor.gaps.filter((gap)=>!belongsToSlice032(gap) && (!gap.sourceId || P03F32_FROZEN_SOURCE_IDS.has(gap.sourceId)));
  for (const row of newBindings) {
    if (row.blocked) gaps.push({ code:"PUBLIC_UI_QUESTION_TYPE_BINDING_BLOCKED", bindingId:row.bindingId, sourceId:row.sourceId, blockedReasons:[...row.blockedReasons] });
    if (row.compatiblePatternGroupIds.length === 0 || row.compatiblePatternSpecIds.length === 0) gaps.push({ code:"PUBLIC_UI_QUESTION_TYPE_WITHOUT_FORM", bindingId:row.bindingId, sourceId:row.sourceId });
    if (!ACCEPTED_RUNTIME_CAPACITY_STATUSES.has(row.capacityStatus)) gaps.push({ code:"PUBLIC_UI_UNVERIFIED_CAPACITY_EXPOSED", bindingId:row.bindingId, sourceId:row.sourceId, capacityStatus:row.capacityStatus });
  }
  if (!audit.ok) gaps.push(...audit.errors.filter((error)=>!String(error).includes(G6B_U01_P03F32_SOURCE_ID)).map((error)=>({ code:"PUBLIC_UI_BINDING_AUDIT_ERROR", error })));
  const baseCaseCount = currentBaseCaseCount();
  const summary = {
    ...predecessor.summary,
    publicSourceCount:P03F32_FROZEN_PUBLIC_SOURCE_UNITS.length,
    visibleKnowledgePointCount:listVisibleBatchAKnowledgePoints().length,
    publicSurfaceCount:surfaces.length,
    baseCaseCount,
    surfaceCaseCount:baseCaseCount * surfaces.length,
    questionTypeBindingRowCount:bindings.length,
    parityCaseCount:baseCaseCount,
    auditCaseCount:audit.caseCount,
    verified20BindingCount:bindings.filter((row)=>row.capacityStatus==="VERIFIED_20").length,
    limitedCapacityBindingCount:bindings.filter((row)=>row.capacityStatus==="VERIFIED_LIMITED").length,
    structuralFallbackBindingCount:bindings.filter((row)=>row.capacityStatus==="STRUCTURAL_FALLBACK_AVAILABLE").length,
    blockedBindingCount:bindings.filter((row)=>row.blocked).length,
    unverifiedCapacityExposureCount:bindings.filter((row)=>!ACCEPTED_RUNTIME_CAPACITY_STATUSES.has(row.capacityStatus)).length,
    minimumVerifiedQuestionCount:bindings.length ? Math.min(...bindings.map((row)=>row.questionCountMax)) : 0,
    maximumVerifiedQuestionCount:bindings.length ? Math.max(...bindings.map((row)=>row.questionCountMax)) : 0,
    gapCount:gaps.length,
  };
  return {
    ...predecessor,
    bindingRevision:"pgc-r02-r05-p03f32",
    status:gaps.length===0?"PASS":"FAIL_CLOSED",
    selectorAuthority:"batch-a-selector-p03f32-extension.js",
    publicUiResolver:"site/modules/curriculum/public/public-ui-capability-binding-p03f32.js",
    currentAuthorityPatch:{
      task:"P03F_W3DirectProductVerticalSlice032Implementation",
      sourceId:G6B_U01_P03F32_SOURCE_ID,
      knowledgePointId:G6B_U01_P03F32_KP_ID,
      addedBindingRowCount:newBindings.length,
      capacityPolicy:"STRUCTURAL_FALLBACK_UNDER_EXISTING_R03_R06_TERMINAL_LINEAGE",
      learnerActions:["TO_FRACTION","TO_DECIMAL"],
      compareLearnerSurfaceAllowed:false,
      arithmeticMutationAllowed:false,
      applicationExpansionAllowed:false,
    },
    summary,
    gaps,
    bindings,
  };
}

function writeCsv(contract) {
  const columns = ["bindingId","caseId","sourceId","surfaceId","selectionMode","selectedKnowledgePointIds","selectedKnowledgePointCount","questionType","questionTypeLabel","compatiblePatternGroupIds","compatiblePatternSpecIds","questionFormLabels","depthModes","contextModes","questionCountMin","questionCountDefault","questionCountMax","capacityStatus","capacityRouteIds","capacityQualityStatuses","blocked","blockedReasons"];
  const lines = [columns.join(",")];
  for (const row of contract.bindings) lines.push(columns.map((column)=>csvEscape(row[column])).join(","));
  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}

function writeReadback(contract) {
  const summary = contract.summary;
  const lines = [
    "# PGC-R02 KnowledgePoint-driven UI Capability Binding Readback","","```text","PROGRAM_ID = PUBLIC_KP_GENERATION_CONFORMANCE_V1","TASK_ID    = PGC-R02_KnowledgePointDrivenUICapabilityBinding",`STATUS     = ${contract.status}`,"```","","## Capacity-aware accepted matrix","","```text",`PUBLIC_SOURCES                  = ${summary.publicSourceCount}`,`VISIBLE_KNOWLEDGE_POINTS        = ${summary.visibleKnowledgePointCount}`,`PUBLIC_SURFACES                 = ${summary.publicSurfaceCount}`,`QUESTION_TYPE_BINDING_ROWS      = ${summary.questionTypeBindingRowCount}`,`VERIFIED_20_BINDINGS            = ${summary.verified20BindingCount}`,`VERIFIED_LIMITED_BINDINGS       = ${summary.limitedCapacityBindingCount}`,`STRUCTURAL_FALLBACK_BINDINGS    = ${summary.structuralFallbackBindingCount}`,`MINIMUM_VERIFIED_QUESTION_COUNT = ${summary.minimumVerifiedQuestionCount}`,`MAXIMUM_VERIFIED_QUESTION_COUNT = ${summary.maximumVerifiedQuestionCount}`,`UNVERIFIED_CAPACITY_EXPOSURES   = ${summary.unverifiedCapacityExposureCount}`,`GAPS                            = ${summary.gapCount}`,"```","",
    "Slice032 preserves the accepted R03/R06/Slice031 capacity and terminal lineage, then adds six numeric-only structural-fallback bindings for G6B-U01 exact decimal/fraction conversion across sourceUnit/singleKP and three public surfaces.","","```text","GOAL_DISTANCE_BEFORE = D1_SLICE032_CURRENT_R01_AUTHORITY_MATERIALIZED",`GOAL_DISTANCE_AFTER  = ${contract.status === "PASS" ? "D1_SLICE032_CAPACITY_AWARE_UI_BINDING_CONFORMANT" : "D1_SLICE032_UI_BINDING_FAIL_CLOSED"}`,"DISTANCE_REDUCED     = Slice032 exact conversion joins current public UI binding authority without admitting compare, arithmetic or application","REMAINING_BLOCKERS   = [SLICE032_PRODUCT_ACCEPTANCE, CURRENT_ARTIFACT_RECONCILIATION]","NEXT_SHORTEST_STEP   = P03F_W3DirectProductVerticalSlice032_ProductAcceptance","```","",
  ];
  if (contract.gaps.length > 0) lines.push("## Blocking gaps","",...contract.gaps.map((gap)=>`- \`${gap.code}\`: \`${JSON.stringify(gap)}\``),"");
  fs.writeFileSync(readbackPath, `${lines.join("\n")}\n`);
}

export function materializePgcR02UiCapabilityBindingR05() {
  const contract = buildPgcR02UiCapabilityBindingContractR05();
  fs.mkdirSync(outputDir, { recursive:true });
  fs.mkdirSync(docsDir, { recursive:true });
  fs.writeFileSync(contractPath, `${JSON.stringify(contract, null, 2)}\n`);
  writeCsv(contract);
  writeReadback(contract);
  return contract;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const contract = materializePgcR02UiCapabilityBindingR05();
  console.log(`PGC_R02_R05_SUMMARY=${JSON.stringify(contract.summary)}`);
  if (contract.status !== "PASS") process.exitCode = 2;
}
