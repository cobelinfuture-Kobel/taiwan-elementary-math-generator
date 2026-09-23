export * from "./batch-a-browser-question-router-p04f21.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f21.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f22.js";
import {generateG5BU09P04F22QuestionSet,P04F22_ALL_SPEC_IDS} from "./time-system-runtime-p04f22.js";
import {G5B_U09_P04F22_SOURCE_ID} from "../registry/g5b-u09-time-quantity-times-integer-selector-projection-p04f22.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G5B_U09_P04F22_SOURCE_ID||!plan.patternSpecIds?.some(spec=>P04F22_ALL_SPEC_IDS.includes(spec)))return baseGenerate({...options,plan});return generateG5BU09P04F22QuestionSet({...options,plan});}
