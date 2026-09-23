export * from "./batch-a-browser-question-router-p04f12.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f12.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f13.js";
import {generateG3BU02P04F13QuestionSet,P04F13_ALL_SPEC_IDS} from "./quantity-measurement-runtime-p04f13.js";
import {G3B_U02_P04F13_SOURCE_ID} from "../registry/g3b-u02-mixed-capacity-selector-projection-p04f13.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G3B_U02_P04F13_SOURCE_ID||!plan.patternSpecIds?.some(spec=>P04F13_ALL_SPEC_IDS.includes(spec)))return baseGenerate({...options,plan});return generateG3BU02P04F13QuestionSet({...options,plan});}
