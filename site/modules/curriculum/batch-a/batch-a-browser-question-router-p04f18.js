export * from "./batch-a-browser-question-router-p04f17.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f17.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f18.js";
import {generateG5BU09P04F18NormalizationQuestions} from "./time-system-runtime-p04f18.js";
import {G5B_U09_P04F18_SOURCE_ID,G5B_U09_P04F18_SPEC_ID} from "../registry/g5b-u09-time-mixed-unit-normalization-selector-projection-p04f18.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G5B_U09_P04F18_SOURCE_ID||!plan.patternSpecIds?.includes(G5B_U09_P04F18_SPEC_ID))return baseGenerate({...options,plan});return generateG5BU09P04F18NormalizationQuestions({...options,plan});}
