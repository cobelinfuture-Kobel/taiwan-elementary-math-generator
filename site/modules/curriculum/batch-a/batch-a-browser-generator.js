export * from "./batch-a-browser-generator-core.js";

import * as core from "./batch-a-browser-generator-core.js";
import {
  G5A_U08_PUBLIC_CONTROLS,
  G5A_U08_SOURCE_ID,
} from "../registry/g5a-u08-promotion.js";
import {
  G4B_U04_PUBLIC_CONTROLS,
  G4B_U04_SOURCE_ID,
} from "../registry/g4b-u04-promotion.js";
import {
  G4A_U08_PHASE2B_PUBLIC_CONTROLS,
  G4A_U08_SOURCE_ID,
} from "../registry/g4a-u08-phase2b-promotion.js";
import {
  G5B_U05_PATTERN_SPEC_IDS,
  G5B_U05_SOURCE_ID,
} from "../registry/g5b-u05-selector-projection.js";
import {
  G6A_U01_PATTERN_SPEC_IDS,
  G6A_U01_SOURCE_ID,
} from "../registry/g6a-u01-selector-projection.js";
import {
  G5A_U03_PATTERN_GROUPS,
  G5A_U03_SOURCE_ID,
  G5A_U03A1_SOURCE_ID,
} from "../registry/g5a-u03-factor-multiple-selector-projection.js";
import { G5B_U05_FULL_PRODUCT_SOURCE_UNIT } from "./full-product-source-units-p01d1.js";
import { G6A_U01_FULL_PRODUCT_SOURCE_UNIT } from "./full-product-source-units-p01d2.js";
import {
  G5A_U03_FULL_PRODUCT_SOURCE_UNIT,
  G5A_U03A1_FULL_PRODUCT_SOURCE_UNIT,
} from "./full-product-source-units-p01d3.js";

function normalize(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback;
}

export function normalizeG5AU08PublicControls(options = {}) {
  return Object.freeze({
    questionMode: normalize(options.questionMode, G5A_U08_PUBLIC_CONTROLS.questionModes, G5A_U08_PUBLIC_CONTROLS.defaults.questionMode),
    depthMode: normalize(options.depthMode, G5A_U08_PUBLIC_CONTROLS.depthModes, G5A_U08_PUBLIC_CONTROLS.defaults.depthMode),
    contextMode: normalize(options.contextMode, G5A_U08_PUBLIC_CONTROLS.contextModes, G5A_U08_PUBLIC_CONTROLS.defaults.contextMode),
  });
}

export function normalizeG4BU04PublicControls(options = {}) {
  return Object.freeze({
    questionMode: normalize(options.questionMode, G4B_U04_PUBLIC_CONTROLS.questionModes, G4B_U04_PUBLIC_CONTROLS.defaults.questionMode),
    contextMode: normalize(options.contextMode, G4B_U04_PUBLIC_CONTROLS.contextModes, G4B_U04_PUBLIC_CONTROLS.defaults.contextMode),
  });
}

export function normalizeG4AU08PublicControls(options = {}) {
  return Object.freeze({
    questionMode: normalize(options.questionMode, G4A_U08_PHASE2B_PUBLIC_CONTROLS.questionModes, G4A_U08_PHASE2B_PUBLIC_CONTROLS.defaults.questionMode),
  });
}

function fullProductPlan(plan, options, sourceUnit, patternSpecIds, taskId) {
  const sourceUnitMode = (options.selectionMode ?? "sourceUnit") === "sourceUnit";
  return {
    ...plan,
    sourceUnit: { ...sourceUnit },
    ...(sourceUnitMode ? { patternSpecIds: [...patternSpecIds], allocation: null } : {}),
    questionMode: "numeric",
    publicControls: {
      sourceId: sourceUnit.sourceId,
      questionMode: "numeric",
      productWave: "R05-W1",
      productAdmissionTask: taskId,
      publicDropdownCutoverTask: "P01E_W1PublicUIHTMLPDFPrintCloseout",
    },
    publicPatternSpecInjectionUsed: false,
    genericFallbackAllowed: false,
  };
}

function p01d3PatternSpecIds(sourceId) {
  return G5A_U03_PATTERN_GROUPS
    .filter((group) => group.sourceId === sourceId)
    .flatMap((group) => group.patternSpecIds);
}

export function buildBatchABrowserPlan(options = {}) {
  const plan = core.buildBatchABrowserPlan(options);
  if (options.sourceId === G5A_U03_SOURCE_ID) {
    return fullProductPlan(plan, options, G5A_U03_FULL_PRODUCT_SOURCE_UNIT, p01d3PatternSpecIds(G5A_U03_SOURCE_ID), "P01D3_G5AU03FactorMultipleVerticalSlice");
  }
  if (options.sourceId === G5A_U03A1_SOURCE_ID) {
    return fullProductPlan(plan, options, G5A_U03A1_FULL_PRODUCT_SOURCE_UNIT, p01d3PatternSpecIds(G5A_U03A1_SOURCE_ID), "P01D3_G5AU03FactorMultipleVerticalSlice");
  }
  if (options.sourceId === G6A_U01_SOURCE_ID) {
    return fullProductPlan(plan, options, G6A_U01_FULL_PRODUCT_SOURCE_UNIT, G6A_U01_PATTERN_SPEC_IDS, "P01D2_G6AU01NumberTheoryVerticalSlice");
  }
  if (options.sourceId === G5B_U05_SOURCE_ID) {
    return fullProductPlan(plan, options, G5B_U05_FULL_PRODUCT_SOURCE_UNIT, G5B_U05_PATTERN_SPEC_IDS, "P01D1_G5BU05LargeNumberVerticalSlice");
  }
  if (options.sourceId === G4A_U08_SOURCE_ID) {
    const controls = normalizeG4AU08PublicControls(options);
    return {
      ...plan,
      ...controls,
      publicControls: { ...controls },
      requestedKnowledgePointIds: Array.isArray(options.selectedKnowledgePointIds) ? [...options.selectedKnowledgePointIds] : [],
      requestedPatternGroupIds: Array.isArray(options.selectedPatternGroupIds) ? [...options.selectedPatternGroupIds] : [],
      publicPatternSpecInjectionUsed: false,
      genericFallbackAllowed: false,
    };
  }
  if (options.sourceId === G4B_U04_SOURCE_ID) {
    const controls = normalizeG4BU04PublicControls(options);
    return {
      ...plan,
      ...controls,
      publicControls: { ...controls },
      publicPatternSpecInjectionUsed: false,
      genericFallbackAllowed: false,
    };
  }
  if (options.sourceId !== G5A_U08_SOURCE_ID) return plan;
  const controls = normalizeG5AU08PublicControls(options);
  return {
    ...plan,
    ...controls,
    publicControls: { ...controls },
    publicNPlus2: false,
    publicFormalEquation: false,
  };
}

export function generateBatchABrowserQuestions(options = {}) {
  return core.generateBatchABrowserQuestions(options);
}
