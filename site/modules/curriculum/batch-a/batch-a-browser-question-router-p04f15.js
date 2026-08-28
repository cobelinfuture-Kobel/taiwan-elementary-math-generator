export * from "./batch-a-browser-question-router-p04f14.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f14.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f15.js";
import {generateG3BU06P04F15QuestionSet,P04F15_ALL_SPEC_IDS} from "./quantity-measurement-runtime-p04f15.js";
import {G3B_U06_P04F15_SOURCE_ID} from "../registry/g3b-u06-mass-mixed-arithmetic-selector-projection-p04f15.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G3B_U06_P04F15_SOURCE_ID||!plan.patternSpecIds?.some(spec=>P04F15_ALL_SPEC_IDS.includes(spec)))return baseGenerate({...options,plan});return generateG3BU06P04F15QuestionSet({...options,plan});}
