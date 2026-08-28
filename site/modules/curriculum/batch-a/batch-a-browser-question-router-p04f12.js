export * from "./batch-a-browser-question-router-p04f11.js";
import {generateBatchABrowserQuestions as baseGenerate} from "./batch-a-browser-question-router-p04f11.js";
import {buildBatchABrowserPlan} from "./batch-a-browser-generator-p04f12.js";
import {generateG3AU04P04F12QuestionSet,P04F12_ALL_SPEC_IDS} from "./quantity-measurement-runtime-p04f12.js";
import {G3A_U04_P04F12_SOURCE_ID} from "../registry/g3a-u04-mixed-length-selector-projection-p04f12.js";
export function generateBatchABrowserQuestions(options={}){const plan=options.plan??buildBatchABrowserPlan(options);if(plan.sourceId!==G3A_U04_P04F12_SOURCE_ID||!plan.patternSpecIds?.some(spec=>P04F12_ALL_SPEC_IDS.includes(spec)))return baseGenerate({...options,plan});return generateG3AU04P04F12QuestionSet({...options,plan});}
