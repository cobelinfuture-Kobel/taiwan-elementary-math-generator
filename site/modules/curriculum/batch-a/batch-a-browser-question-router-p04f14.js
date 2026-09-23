export * from "./batch-a-browser-question-router-p04f13.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f13.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f14.js";
import {generateG3BU03P04F14QuestionSet,P04F14_ALL_SPEC_IDS} from "./time-arithmetic-runtime-p04f14.js";
import {G3B_U03_P04F14_SOURCE_ID} from "../registry/g3b-u03-schedule-start-end-duration-selector-projection-p04f14.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G3B_U03_P04F14_SOURCE_ID||!plan.patternSpecIds?.some(spec=>P04F14_ALL_SPEC_IDS.includes(spec)))return baseGenerate({...options,plan});return generateG3BU03P04F14QuestionSet({...options,plan});}
