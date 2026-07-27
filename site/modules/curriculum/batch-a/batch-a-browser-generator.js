export * from "./batch-a-browser-generator-core.js";

import * as core from "./batch-a-browser-generator-core.js";
import { G5A_U08_PUBLIC_CONTROLS, G5A_U08_SOURCE_ID } from "../registry/g5a-u08-promotion.js";
import { G4B_U04_PUBLIC_CONTROLS, G4B_U04_SOURCE_ID } from "../registry/g4b-u04-promotion.js";
import { G4A_U08_PHASE2B_PUBLIC_CONTROLS, G4A_U08_SOURCE_ID } from "../registry/g4a-u08-phase2b-promotion.js";
import { G5B_U05_PATTERN_SPEC_IDS, G5B_U05_SOURCE_ID } from "../registry/g5b-u05-selector-projection.js";
import { G6A_U01_PATTERN_SPEC_IDS, G6A_U01_SOURCE_ID } from "../registry/g6a-u01-selector-projection.js";
import { G5A_U03_PATTERN_GROUPS, G5A_U03_SOURCE_ID, G5A_U03A1_SOURCE_ID } from "../registry/g5a-u03-factor-multiple-selector-projection.js";
import {
  G3A_U08_PART_WHOLE_KP_ID,
  G3A_U08_PART_WHOLE_PATTERN_GROUP_ID,
  G3A_U08_PART_WHOLE_PATTERN_SPEC_ID,
  G3A_U08_SOURCE_ID,
} from "../registry/g3a-u08-part-whole-fraction-selector-projection.js";
import {
  G3A_U08_SLICE002_PATTERN_GROUPS,
  G3A_U08_SLICE002_PATTERN_SPEC_IDS,
} from "../registry/g3a-u08-slice002-selector-projection.js";
import {
  G3B_U07_SOURCE_ID,
  G3B_U07_QUOTIENT_FRACTION_KP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID,
  G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID,
} from "../registry/g3b-u07-quotient-fraction-selector-projection.js";
import { G5B_U05_FULL_PRODUCT_SOURCE_UNIT } from "./full-product-source-units-p01d1.js";
import { G6A_U01_FULL_PRODUCT_SOURCE_UNIT } from "./full-product-source-units-p01d2.js";
import { G5A_U03_FULL_PRODUCT_SOURCE_UNIT, G5A_U03A1_FULL_PRODUCT_SOURCE_UNIT } from "./full-product-source-units-p01d3.js";
import { getBatchASourceUnit } from "./source-units.js";

function normalize(value, allowed, fallback) { return allowed.includes(value) ? value : fallback; }
export function normalizeG5AU08PublicControls(options = {}) { return Object.freeze({ questionMode: normalize(options.questionMode, G5A_U08_PUBLIC_CONTROLS.questionModes, G5A_U08_PUBLIC_CONTROLS.defaults.questionMode), depthMode: normalize(options.depthMode, G5A_U08_PUBLIC_CONTROLS.depthModes, G5A_U08_PUBLIC_CONTROLS.defaults.depthMode), contextMode: normalize(options.contextMode, G5A_U08_PUBLIC_CONTROLS.contextModes, G5A_U08_PUBLIC_CONTROLS.defaults.contextMode) }); }
export function normalizeG4BU04PublicControls(options = {}) { return Object.freeze({ questionMode: normalize(options.questionMode, G4B_U04_PUBLIC_CONTROLS.questionModes, G4B_U04_PUBLIC_CONTROLS.defaults.questionMode), contextMode: normalize(options.contextMode, G4B_U04_PUBLIC_CONTROLS.contextModes, G4B_U04_PUBLIC_CONTROLS.defaults.contextMode) }); }
export function normalizeG4AU08PublicControls(options = {}) { return Object.freeze({ questionMode: normalize(options.questionMode, G4A_U08_PHASE2B_PUBLIC_CONTROLS.questionModes, G4A_U08_PHASE2B_PUBLIC_CONTROLS.defaults.questionMode) }); }

function fullProductPlan(plan, options, sourceUnit, patternSpecIds, taskId) {
  const sourceUnitMode = (options.selectionMode ?? "sourceUnit") === "sourceUnit";
  return { ...plan, sourceUnit: { ...sourceUnit }, ...(sourceUnitMode ? { patternSpecIds: [...patternSpecIds], allocation: null } : {}), questionMode: "numeric", publicControls: { sourceId: sourceUnit.sourceId, questionMode: "numeric", productWave: "R05-W1", productAdmissionTask: taskId, publicDropdownCutoverTask: "P01E_W1PublicUIHTMLPDFPrintCloseout" }, publicPatternSpecInjectionUsed: false, genericFallbackAllowed: false };
}

const PART_WHOLE_GROUP = Object.freeze({ patternGroupId: G3A_U08_PART_WHOLE_PATTERN_GROUP_ID, primaryKnowledgePointId: G3A_U08_PART_WHOLE_KP_ID, publicQuestionMode: "numeric", patternSpecIds: Object.freeze([G3A_U08_PART_WHOLE_PATTERN_SPEC_ID]) });
const CURRENT_G3A_U08_GROUPS = Object.freeze([PART_WHOLE_GROUP, ...G3A_U08_SLICE002_PATTERN_GROUPS]);
function p03fPlan(plan, options) {
  const sourceUnit = getBatchASourceUnit(G3A_U08_SOURCE_ID);
  const questionMode = options.questionMode === "application" ? "application" : "numeric";
  const requestedKnowledgePointIds = Array.isArray(options.selectedKnowledgePointIds) ? [...new Set(options.selectedKnowledgePointIds.filter(Boolean))] : [];
  const requestedPatternGroupIds = Array.isArray(options.selectedPatternGroupIds) ? [...new Set(options.selectedPatternGroupIds.filter(Boolean))] : [];
  let groups;
  if (requestedPatternGroupIds.length > 0) groups = CURRENT_G3A_U08_GROUPS.filter((row) => requestedPatternGroupIds.includes(row.patternGroupId) && row.publicQuestionMode === questionMode);
  else if (requestedKnowledgePointIds.length > 0) groups = CURRENT_G3A_U08_GROUPS.filter((row) => requestedKnowledgePointIds.includes(row.primaryKnowledgePointId) && row.publicQuestionMode === questionMode);
  else groups = questionMode === "application"
    ? G3A_U08_SLICE002_PATTERN_GROUPS.filter((row) => row.publicQuestionMode === "application")
    : [PART_WHOLE_GROUP];
  const patternSpecIds = [...new Set(groups.flatMap((row) => row.patternSpecIds))];
  const usesSlice002 = patternSpecIds.some((id) => G3A_U08_SLICE002_PATTERN_SPEC_IDS.includes(id));
  return {
    ...plan,
    sourceUnit: { ...sourceUnit },
    patternSpecIds,
    allocation: null,
    questionMode,
    requestedKnowledgePointIds,
    requestedPatternGroupIds,
    publicControls: {
      sourceId: G3A_U08_SOURCE_ID,
      questionMode,
      productWave: "R05-W3",
      productAdmissionTask: usesSlice002 ? "P03F_W3DirectProductVerticalSlice002Implementation" : "P03F_W3DirectProductVerticalSlice001Implementation",
      publicDropdownCutoverTask: usesSlice002 ? "P03F_W3DirectProductVerticalSlice002Implementation" : "P03F_W3DirectProductVerticalSlice001Implementation",
      globalContextAuthority: questionMode === "application" ? "GLOBAL_CONTEXT_PRIMARY" : "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}
function p03f3Plan(plan, options) {
  const sourceUnit = getBatchASourceUnit(G3B_U07_SOURCE_ID);
  const requestedKnowledgePointIds = Array.isArray(options.selectedKnowledgePointIds) ? [...new Set(options.selectedKnowledgePointIds.filter(Boolean))] : [];
  const requestedPatternGroupIds = Array.isArray(options.selectedPatternGroupIds) ? [...new Set(options.selectedPatternGroupIds.filter(Boolean))] : [];
  return {
    ...plan,
    sourceUnit: { ...sourceUnit },
    patternSpecIds: [G3B_U07_QUOTIENT_FRACTION_PATTERN_SPEC_ID],
    allocation: null,
    questionMode: "numeric",
    requestedKnowledgePointIds: requestedKnowledgePointIds.length ? requestedKnowledgePointIds : [G3B_U07_QUOTIENT_FRACTION_KP_ID],
    requestedPatternGroupIds: requestedPatternGroupIds.length ? requestedPatternGroupIds : [G3B_U07_QUOTIENT_FRACTION_PATTERN_GROUP_ID],
    publicControls: {
      sourceId: G3B_U07_SOURCE_ID,
      questionMode: "numeric",
      productWave: "R05-W3",
      productAdmissionTask: "P03F_W3DirectProductVerticalSlice003Implementation",
      publicDropdownCutoverTask: "P03F_W3DirectProductVerticalSlice003Implementation",
      globalContextAuthority: "NOT_APPLICABLE",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}

function p01d3PatternSpecIds(sourceId) { return G5A_U03_PATTERN_GROUPS.filter((group) => group.sourceId === sourceId).flatMap((group) => group.patternSpecIds); }
export function buildBatchABrowserPlan(options = {}) {
  const plan = core.buildBatchABrowserPlan(options);
  if (options.sourceId === G3B_U07_SOURCE_ID) return p03f3Plan(plan, options);
  if (options.sourceId === G3A_U08_SOURCE_ID) return p03fPlan(plan, options);
  if (options.sourceId === G5A_U03_SOURCE_ID) return fullProductPlan(plan, options, G5A_U03_FULL_PRODUCT_SOURCE_UNIT, p01d3PatternSpecIds(G5A_U03_SOURCE_ID), "P01D3_G5AU03FactorMultipleVerticalSlice");
  if (options.sourceId === G5A_U03A1_SOURCE_ID) return fullProductPlan(plan, options, G5A_U03A1_FULL_PRODUCT_SOURCE_UNIT, p01d3PatternSpecIds(G5A_U03A1_SOURCE_ID), "P01D3_G5AU03FactorMultipleVerticalSlice");
  if (options.sourceId === G6A_U01_SOURCE_ID) return fullProductPlan(plan, options, G6A_U01_FULL_PRODUCT_SOURCE_UNIT, G6A_U01_PATTERN_SPEC_IDS, "P01D2_G6AU01NumberTheoryVerticalSlice");
  if (options.sourceId === G5B_U05_SOURCE_ID) return fullProductPlan(plan, options, G5B_U05_FULL_PRODUCT_SOURCE_UNIT, G5B_U05_PATTERN_SPEC_IDS, "P01D1_G5BU05LargeNumberVerticalSlice");
  if (options.sourceId === G4A_U08_SOURCE_ID) { const controls = normalizeG4AU08PublicControls(options); return { ...plan, ...controls, publicControls: { ...controls }, requestedKnowledgePointIds: Array.isArray(options.selectedKnowledgePointIds) ? [...options.selectedKnowledgePointIds] : [], requestedPatternGroupIds: Array.isArray(options.selectedPatternGroupIds) ? [...options.selectedPatternGroupIds] : [], publicPatternSpecInjectionUsed: false, genericFallbackAllowed: false }; }
  if (options.sourceId === G4B_U04_SOURCE_ID) { const controls = normalizeG4BU04PublicControls(options); return { ...plan, ...controls, publicControls: { ...controls }, publicPatternSpecInjectionUsed: false, genericFallbackAllowed: false }; }
  if (options.sourceId !== G5A_U08_SOURCE_ID) return plan;
  const controls = normalizeG5AU08PublicControls(options);
  return { ...plan, ...controls, publicControls: { ...controls }, publicNPlus2: false, publicFormalEquation: false };
}
export function generateBatchABrowserQuestions(options = {}) { return core.generateBatchABrowserQuestions(options); }
