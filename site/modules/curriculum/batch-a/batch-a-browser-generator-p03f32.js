export * from "./batch-a-browser-generator-p03f31.js";
import { buildBatchABrowserPlan as baseBuild } from "./batch-a-browser-generator-p03f31.js";
import { getBatchASourceUnit } from "./source-units.js";
import {
  G6B_U01_P03F32_GROUP_ID,
  G6B_U01_P03F32_KP_ID,
  G6B_U01_P03F32_SOURCE_ID,
  G6B_U01_P03F32_SPEC_IDS,
} from "../registry/g6b-u01-rank8-decimal-fraction-conversion-selector-projection-p03f32.js";

const unique = (values) => [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
export function requestsP03F32(options = {}) {
  if (options.sourceId !== G6B_U01_P03F32_SOURCE_ID) return false;
  return options.selectionMode === "sourceUnit"
    || unique(options.selectedKnowledgePointIds).includes(G6B_U01_P03F32_KP_ID)
    || unique(options.selectedPatternGroupIds).includes(G6B_U01_P03F32_GROUP_ID)
    || unique(options.patternSpecIds).some((id) => G6B_U01_P03F32_SPEC_IDS.includes(id))
    || (!options.selectedKnowledgePointIds && !options.selectedPatternGroupIds && !options.patternSpecIds);
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = baseBuild(options);
  if (!requestsP03F32(options)) return plan;
  const requestedSpecs = unique(options.patternSpecIds).filter((id) => G6B_U01_P03F32_SPEC_IDS.includes(id));
  return {
    ...plan,
    sourceId:G6B_U01_P03F32_SOURCE_ID,
    sourceUnit:{ ...(getBatchASourceUnit(G6B_U01_P03F32_SOURCE_ID) ?? { sourceId:G6B_U01_P03F32_SOURCE_ID, grade:6, semester:"lower", unitCode:"6B-U01", title:"小數與分數的計算", domain:"mixed_decimal_fraction" }) },
    patternSpecIds:requestedSpecs.length ? requestedSpecs : [...G6B_U01_P03F32_SPEC_IDS],
    allocation:null,
    questionMode:"numeric",
    requestedKnowledgePointIds:[G6B_U01_P03F32_KP_ID],
    requestedPatternGroupIds:[G6B_U01_P03F32_GROUP_ID],
    publicControls:{
      sourceId:G6B_U01_P03F32_SOURCE_ID,
      questionMode:"numeric",
      productWave:"R05-W3",
      productAdmissionTask:"P03F_W3DirectProductVerticalSlice032Implementation",
      publicDropdownCutoverTask:"P03F_W3DirectProductVerticalSlice032Implementation",
      globalContextAuthority:"FUTURE_APPLICATION_QUEUE_NOT_ADMITTED",
      mixedDomainCompareAuthority:"SLICE041_NOT_ADMITTED",
      mixedDomainArithmeticAuthority:"SLICE047_OR_LATER_NOT_ADMITTED",
    },
    publicPatternSpecInjectionUsed:false,
    genericFallbackAllowed:false,
  };
}
